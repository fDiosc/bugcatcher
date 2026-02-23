/* eslint-disable */
(function () {
    // In React/SPA environments (like when loaded via @bugcatcher/react), document.currentScript can be null
    // because the script is executed asynchronously after insertion. 
    // We explicitly find the script tag that has our required dataset.
    const script = document.currentScript || document.querySelector('script[data-project][src*="widget.js"]');
    const projectKey = script ? script.getAttribute('data-project') : null;
    const clarityId = script ? script.getAttribute('data-clarity') : null;

    if (!projectKey) {
        console.error('BugCatcher: Missing data-project attribute');
        return;
    }

    // Wrap initialization in an async function to fetch remote config
    const initWidget = async () => {
        let devMode = false;
        let language = 'en';

        try {
            // Ensure baseUrl is absolute and reliable. 
            // We strip any trailing slashes and normalize 'www' to prevent preflight redirects.
            let baseUrl = 'https://bugcatcher.app';
            const scriptSrc = script.src;
            if (scriptSrc && scriptSrc.startsWith('http')) {
                const urlObj = new URL(scriptSrc);
                baseUrl = urlObj.origin;
                // If we are on bugcatcher.app but everything is redirected to www, we should prefer www
                if (baseUrl === 'https://bugcatcher.app' && !scriptSrc.includes('localhost')) {
                    // One-time check: if we hit a CORS error, we might need the www version.
                    // For now, let's just use the Script's actual origin.
                }
            }
            // Ensure no trailing slash
            baseUrl = baseUrl.replace(/\/+$/, '');
            window.__bc_baseUrl = baseUrl;

            console.log('BugCatcher: Fetching remote configuration for project...', projectKey);
            const res = await fetch(`${baseUrl}/api/project?key=${projectKey}`);

            if (res.ok) {
                const config = await res.json();
                devMode = config.mode === 'DEV';
                language = config.language || 'en';
                console.log(`BugCatcher: Synced. Mode is ${config.mode}, Language is ${language}`);
            } else {
                console.warn('BugCatcher: Failed to fetch remote config, defaulting to CLIENT mode');
            }
        } catch (e) {
            console.warn('BugCatcher: Network error fetching remote config, defaulting to CLIENT mode', e);
        }

        // Telemetry Buffers
        const consoleLogs = [];
        const networkLogs = [];
        const jsErrors = [];

        if (devMode) {
            console.log('BugCatcher: Dev Mode Enabled - Intercepting Telemetry');

            // 1. Console Interceptor
            const originalConsole = {
                log: console.log,
                warn: console.warn,
                error: console.error
            };

            const pushLog = (level, args) => {
                try {
                    const message = Array.from(args).map(a => {
                        if (a instanceof Error) return a.stack || a.message || String(a);
                        return typeof a === 'object' ? JSON.stringify(a) : String(a);
                    }).join(' ');
                    consoleLogs.push({ level, message, timestamp: Date.now() });
                    if (consoleLogs.length > 60) consoleLogs.shift();
                } catch (e) { }
            };

            console.log = function () { originalConsole.log.apply(console, arguments); pushLog('log', arguments); };
            console.warn = function () { originalConsole.warn.apply(console, arguments); pushLog('warn', arguments); };
            console.error = function () { originalConsole.error.apply(console, arguments); pushLog('error', arguments); };

            // 2. JS Error Tracker && Resource Error Tracker
            window.addEventListener('error', (event) => {
                // Check if it is a resource (img, script, link) loading error (404 etc)
                const target = event.target || event.srcElement;
                const isElement = target instanceof HTMLElement;
                if (isElement && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
                    networkLogs.push({
                        type: 'resource',
                        method: 'GET',
                        url: target.src || target.href || 'unknown_resource',
                        status: 'FAILED (404/Net)',
                        duration: 0,
                        timestamp: Date.now()
                    });
                    if (networkLogs.length > 30) networkLogs.shift();
                    return; // Stop processing, it's not a JS exception
                }

                // Otherwise, it's a JS execution error
                jsErrors.push({
                    type: 'error',
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error ? event.error.stack : null,
                    timestamp: Date.now()
                });
                if (jsErrors.length > 30) jsErrors.shift();
            }, true); // TRUE is required for "capture phase" to catch resource errors which don't bubble!

            window.addEventListener('unhandledrejection', (event) => {
                jsErrors.push({
                    type: 'unhandledrejection',
                    reason: event.reason ? (event.reason.stack || String(event.reason)) : null,
                    timestamp: Date.now()
                });
                if (jsErrors.length > 30) jsErrors.shift();
            });

            // 3. Network Interceptor (Fetch)
            const originalFetch = window.fetch;
            window.fetch = async function (...args) {
                const startTime = Date.now();
                const requestInfo = args[0];
                let url = '';
                let method = 'GET';

                if (typeof requestInfo === 'string') { url = requestInfo; }
                else if (requestInfo instanceof Request) { url = requestInfo.url; method = requestInfo.method; }

                if (args[1] && args[1].method) { method = args[1].method; }

                try {
                    const response = await originalFetch.apply(this, args);
                    // Log anything except 200-299 to ensure we catch 404s
                    if (!response.ok || response.status >= 400 || (Date.now() - startTime) > 1000) {
                        networkLogs.push({
                            type: 'fetch',
                            method,
                            url,
                            status: response.status,
                            duration: Date.now() - startTime,
                            timestamp: startTime
                        });
                        if (networkLogs.length > 30) networkLogs.shift();
                    }
                    return response;
                } catch (error) {
                    networkLogs.push({
                        type: 'fetch',
                        method,
                        url,
                        error: error.message,
                        duration: Date.now() - startTime,
                        timestamp: startTime
                    });
                    if (networkLogs.length > 30) networkLogs.shift();
                    throw error;
                }
            };

            // 3. Network Interceptor (XHR)
            const originalXhrOpen = XMLHttpRequest.prototype.open;
            const originalXhrSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this._method = method;
                this._url = url;
                this._startTime = Date.now();
                return originalXhrOpen.call(this, method, url, ...rest);
            };
            XMLHttpRequest.prototype.send = function (...rest) {
                this.addEventListener('load', function () {
                    if (this.status >= 400 || !this.status || (Date.now() - this._startTime) > 1000) {
                        networkLogs.push({
                            type: 'xhr',
                            method: this._method,
                            url: this._url,
                            status: this.status || 'FAILED',
                            duration: Date.now() - this._startTime,
                            timestamp: this._startTime
                        });
                        if (networkLogs.length > 50) networkLogs.shift();
                    }
                });
                this.addEventListener('error', function () {
                    networkLogs.push({
                        type: 'xhr',
                        method: this._method,
                        url: this._url,
                        error: 'XHR Network Error',
                        status: 'FAILED',
                        duration: Date.now() - this._startTime,
                        timestamp: this._startTime
                    });
                    if (networkLogs.length > 50) networkLogs.shift();
                });
                return originalXhrSend.call(this, ...rest);
            };

            // 4. Initial Document Status Check
            // Hack to capture HTTP status of the main document (JS can't read it natively)
            try {
                originalFetch(window.location.href, { method: 'HEAD' })
                    .then(res => {
                        if (!res.ok || res.status >= 400) {
                            // Push to front of log since it was the first thing that happened
                            networkLogs.unshift({
                                type: 'document',
                                method: 'GET',
                                url: window.location.href,
                                status: res.status,
                                duration: 0,
                                timestamp: Date.now()
                            });
                            if (networkLogs.length > 50) networkLogs.pop();
                        }
                    })
                    .catch(e => { /* Ignore */ });
            } catch (e) { }
        }

        // Load rrweb and html2canvas
        console.log('BugCatcher: Loading assets...');
        const rrwebScript = document.createElement('script');
        rrwebScript.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb-all.min.js';
        document.head.appendChild(rrwebScript);

        const h2cScript = document.createElement('script');
        h2cScript.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js';
        document.head.appendChild(h2cScript);

        // Persistence Logic: Load from sessionStorage
        const STORAGE_KEY = 'bugcatcher_recording_buffer';
        const SCREENSHOT_KEY = 'bugcatcher_screenshots';
        let events = [];
        let screenshots = []; // Rolling buffer of the last 10 frames
        try {
            const storedEvents = sessionStorage.getItem(STORAGE_KEY);
            if (storedEvents) {
                events = JSON.parse(storedEvents);
                const now = Date.now();
                events = events.filter(e => now - e.timestamp < 60000);
            }

            const storedScreenshots = sessionStorage.getItem(SCREENSHOT_KEY);
            if (storedScreenshots) {
                screenshots = JSON.parse(storedScreenshots);
                console.log('BugCatcher: Resumed with', screenshots.length, 'frames');
            }
        } catch (e) { console.warn('BugCatcher: Storage load failed', e); }

        let isRecording = false;
        let captureInterval = null;
        let lastScreenshot = null;
        let lastScreenshotTime = 0; // Cooldown tracker

        const captureFrame = async (clickX = null, clickY = null) => {
            const now = Date.now();
            // 10s cooldown for captures unless it's the very first one
            if (clickX !== null && now - lastScreenshotTime < 10000) {
                return;
            }
            if (clickX === null && now - lastScreenshotTime < 30000) {
                return; // Background capture even slower
            }
            if (typeof html2canvas === 'undefined') {
                // If library not loaded yet, try again soon
                if (clickX === null) setTimeout(captureFrame, 1000);
                return;
            }

            try {
                const canvas = await html2canvas(document.body, {
                    scale: 1, // 1:1 resolution as requested
                    logging: false,
                    useCORS: true,
                    onclone: (clonedDoc) => {
                        // Inject the cursor marker ONLY in the cloned DOM for the screenshot
                        if (clickX !== null && clickY !== null) {
                            const clickMarker = clonedDoc.createElement('div');
                            clickMarker.style.position = 'absolute';
                            clickMarker.style.left = clickX + 'px';
                            clickMarker.style.top = clickY + 'px';
                            clickMarker.style.width = '40px';
                            clickMarker.style.height = '40px';
                            clickMarker.style.border = '4px solid red';
                            clickMarker.style.borderRadius = '50%';
                            clickMarker.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                            clickMarker.style.zIndex = '9999999';
                            clickMarker.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                            clickMarker.style.transform = 'translate(-50%, -50%)';
                            clickMarker.style.pointerEvents = 'none';
                            if (clonedDoc.body) clonedDoc.body.appendChild(clickMarker);
                        }
                    }
                });

                const frame = canvas.toDataURL('image/jpeg', 0.4);
                screenshots.push(frame);
                lastScreenshotTime = Date.now(); // Update cooldown

                const maxFrames = devMode ? 10 : 5;
                if (screenshots.length > maxFrames) screenshots.shift();

                try {
                    sessionStorage.setItem(SCREENSHOT_KEY, JSON.stringify(screenshots));
                } catch (e) {
                    // If quota exceeded, trim more aggressively and retry
                    console.warn('BugCatcher: Storage full, trimming...');
                    if (screenshots.length > 1) {
                        screenshots.shift();
                        try { sessionStorage.setItem(SCREENSHOT_KEY, JSON.stringify(screenshots)); } catch (e2) { }
                    }
                }
            } catch (e) {
                console.warn('BugCatcher: Capture failed', e);
            }
        };

        const tryStartRecording = () => {
            if (isRecording) return;

            if (typeof rrweb !== 'undefined' && rrweb.record) {
                try {
                    rrweb.record({
                        emit(event) {
                            events.push(event);
                            const now = Date.now();
                            events = events.filter(e => now - e.timestamp < 60000);
                            if (events.length > 1000) {
                                const snapshot = events.slice(0, 2);
                                const tail = events.slice(-998);
                                events = snapshot.concat(tail);
                            }
                            try {
                                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events));
                            } catch (e) {
                                if (events.length > 500) events = events.slice(-500);
                            }
                        },
                        checkoutEveryNms: 30000,
                        sampling: {
                            mousemove: true,
                            mousemoveInterval: 500, // 2fps for mouse - saves tons of bandwidth
                            mouseInteraction: true,
                            scroll: 150,
                            input: 'last'
                        }
                    });
                    isRecording = true;
                    console.log('BugCatcher: Recorder active');
                } catch (err) {
                    console.error('BugCatcher: rrweb error', err);
                }
            }
        };

        let visionInitialized = false;
        const tryStartVision = () => {
            if (visionInitialized) return;

            if (typeof html2canvas !== 'undefined') {
                visionInitialized = true;
                captureFrame(); // Initial frame

                // Capture on clicks to map exactly where the user clicked
                window.addEventListener('click', (e) => {
                    // Ignore clicks on BugCatcher UI
                    if (e.target.closest('#bugcatcher-modal-overlay') || e.target.closest('#bugcatcher-widget-btn')) return;

                    if (window.__bc_capturing) return;
                    window.__bc_capturing = true;

                    captureFrame(e.pageX, e.pageY).finally(() => {
                        setTimeout(() => window.__bc_capturing = false, 100); // 100ms cooldown for rapid double clicks
                    });
                }, true);

                // Much slower fallback interval for background
                captureInterval = setInterval(() => {
                    if (!window.__bc_capturing) captureFrame();
                }, 60000); // 60s background capture

                console.log('BugCatcher: Event-driven Vision active');
            }
        };

        rrwebScript.onload = tryStartRecording;
        h2cScript.onload = tryStartVision;

        // Aggressive polling for 15 seconds to catch slow network
        const initInterval = setInterval(() => {
            tryStartRecording();
            tryStartVision();
            if (isRecording && visionInitialized) clearInterval(initInterval);
        }, 500);
        setTimeout(() => clearInterval(initInterval), 15000);


        // Auto-inject Clarity if ID provided (Optional/Legacy support)
        if (clarityId && !window.clarity) {
            (function (c, l, a, r, i, t, y) {
                c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
                t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
                y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
            })(window, document, "clarity", "script", clarityId);
        }

        // Styles
        const styles = `
        #bugcatcher-widget-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #0070f3;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-family: sans-serif;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 999999;
            transition: transform 0.2s;
        }
        #bugcatcher-widget-btn:hover {
            transform: scale(1.05);
        }
        #bugcatcher-modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999999;
            justify-content: center;
            align-items: center;
        }
        #bugcatcher-modal {
            background: white;
            padding: 24px;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        #bugcatcher-modal h2 { margin-top: 0; font-family: sans-serif; margin-bottom: 8px; font-size: 20px;}
        #bugcatcher-modal p { margin-bottom: 12px; color: #666; font-size: 14px; }
        #bugcatcher-modal textarea {
            width: 100%;
            height: 100px;
            margin: 12px 0;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            font-family: inherit;
            resize: none;
        }
        #bugcatcher-modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        #bugcatcher-modal-actions button {
            padding: 10px 20px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
        }
        .bc-btn-submit { background: #0070f3; color: white; }
        .bc-btn-cancel { background: #eee; color: #333; }
    `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        // --- LOCALIZATION DICTIONARY ---
        const t = {
            'en': {
                btnDev: '🐞 Report Bug (Dev)',
                btnClient: 'Report Bug',
                clientTitle: 'Oops! Did something go wrong?',
                clientSubtitle: 'What were you trying to do when this happened?',
                clientPlaceholder: "Ex: I clicked the 'Buy' button and the screen went blank...",
                devTitle: '[Dev] Bug Report',
                devSubtitle: 'Context and telemetry will be automatically attached.',
                devPlaceholder: 'Description of the bug...',
                cancel: 'Cancel',
                submit: 'Submit Feedback',
                submitDev: 'Submit',
                sending: 'Sending...',
                uploading: 'Uploading Assets...',
                uploadingReport: 'Sending Report...',
                sent: 'Sent! 🎉',
                serverError: 'Failed to report bug (Server error: {status}). Please try again.',
                timeoutError: 'Request timed out. Please check your connection.',
                genericError: 'An error occurred. Check browser console.',
                severity: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
            },
            'pt-br': {
                btnDev: '🐞 Reportar Bug (Dev)',
                btnClient: 'Reportar Erro',
                clientTitle: 'Ops! Ocorreu um problema?',
                clientSubtitle: 'O que você tentava fazer quando isso aconteceu?',
                clientPlaceholder: "Ex: Eu cliquei no botão 'Comprar' e a tela ficou em branco...",
                devTitle: '[Dev] Relato de Bug',
                devSubtitle: 'Contexto e telemetria serão anexados automaticamente.',
                devPlaceholder: 'Descrição do bug...',
                cancel: 'Cancelar',
                submit: 'Enviar Feedback',
                submitDev: 'Enviar',
                sending: 'Enviando...',
                uploading: 'Enviando Imagens...',
                uploadingReport: 'Enviando Relatório...',
                sent: 'Enviado! 🎉',
                serverError: 'Falha ao reportar bug (Erro: {status}). Tente novamente.',
                timeoutError: 'Tempo de requisição esgotado. Verifique sua conexão.',
                genericError: 'Ocorreu um erro inesperado. Verifique o console.',
                severity: { low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico' }
            },
            'pt-pt': {
                btnDev: '🐞 Reportar Bug (Dev)',
                btnClient: 'Reportar Erro',
                clientTitle: 'Ups! Ocorreu um problema?',
                clientSubtitle: 'O que tentava fazer quando isto aconteceu?',
                clientPlaceholder: "Ex: Eu cliquei no botão 'Comprar' e o ecrã ficou em branco...",
                devTitle: '[Dev] Relato de Bug',
                devSubtitle: 'Contexto e telemetria serão anexados automaticamente.',
                devPlaceholder: 'Descrição do erro...',
                cancel: 'Cancelar',
                submit: 'Enviar Feedback',
                submitDev: 'Enviar',
                sending: 'A enviar...',
                uploading: 'A enviar Imagens...',
                uploadingReport: 'A enviar Relatório...',
                sent: 'Enviado! 🎉',
                serverError: 'Falha ao reportar erro (Servidor: {status}). Tente novamente.',
                timeoutError: 'Tempo de expiração atingido. Verifique a sua ligação.',
                genericError: 'Ocorreu um erro. Verifique a consola.',
                severity: { low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico' }
            },
            'es': {
                btnDev: '🐞 Reportar Error (Dev)',
                btnClient: 'Reportar Error',
                clientTitle: '¡Ups! ¿Ocurrió un problema?',
                clientSubtitle: '¿Qué intentabas hacer cuando esto ocurrió?',
                clientPlaceholder: "Ej: Hice clic en el botón 'Comprar' y la pantalla se quedó en blanco...",
                devTitle: '[Dev] Reporte de Bug',
                devSubtitle: 'El contexto y la telemetría se adjuntarán automáticamente.',
                devPlaceholder: 'Descripción del error...',
                cancel: 'Cancelar',
                submit: 'Enviar Comentarios',
                submitDev: 'Enviar',
                sending: 'Enviando...',
                uploading: 'Subiendo Imágenes...',
                uploadingReport: 'Enviando Reporte...',
                sent: '¡Enviado! 🎉',
                serverError: 'Error al reportar el problema (Servidor: {status}). Inténtalo de nuevo.',
                timeoutError: 'Tiempo de espera agotado. Revisa tu conexión.',
                genericError: 'Ocurrió un error inesperado. Revisa la consola.',
                severity: { low: 'Bajo', medium: 'Medio', high: 'Alto', critical: 'Crítico' }
            },
            'fr': {
                btnDev: '🐞 Signaler un Bug (Dev)',
                btnClient: 'Signaler un Problème',
                clientTitle: 'Oups ! Un problème est survenu ?',
                clientSubtitle: 'Que cherchiez-vous à faire quand cela s\'est produit ?',
                clientPlaceholder: "Ex: J'ai cliqué sur le bouton 'Acheter' et l'écran est devenu blanc...",
                devTitle: '[Dev] Rapport de Bug',
                devSubtitle: 'Le contexte et la télémétrie seront ajoutés automatiquement.',
                devPlaceholder: 'Description du bug...',
                cancel: 'Annuler',
                submit: 'Envoyer',
                submitDev: 'Envoyer',
                sending: 'Envoi en cours...',
                uploading: 'Envoi des images...',
                uploadingReport: 'Envoi du rapport...',
                sent: 'Envoyé ! 🎉',
                serverError: 'Échec de l\'envoi (Erreur : {status}). Veuillez réessayer.',
                timeoutError: 'Délai d\'attente dépassé. Vérifiez votre connexion.',
                genericError: 'Une erreur s\'est produite. Vérifiez la console.',
                severity: { low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique' }
            },
            'de': {
                btnDev: '🐞 Fehler Melden (Dev)',
                btnClient: 'Fehler Melden',
                clientTitle: 'Hoppla! Ist ein Problem aufgetreten?',
                clientSubtitle: 'Was haben Sie versucht zu tun, als das passierte?',
                clientPlaceholder: "Bsp: Ich habe auf 'Kaufen' geklickt und der Bildschirm wurde weiß...",
                devTitle: '[Dev] Fehlerbericht',
                devSubtitle: 'Kontext und Telemetrie werden automatisch angehängt.',
                devPlaceholder: 'Beschreibung des Fehlers...',
                cancel: 'Abbrechen',
                submit: 'Feedback Senden',
                submitDev: 'Senden',
                sending: 'Senden...',
                uploading: 'Bilder Hochladen...',
                uploadingReport: 'Bericht Senden...',
                sent: 'Gesendet! 🎉',
                serverError: 'Fehler beim Senden (Serverfehler: {status}). Bitte erneut versuchen.',
                timeoutError: 'Zeitüberschreitung der Anforderung. Überprüfen Sie Ihre Verbindung.',
                genericError: 'Ein Fehler ist aufgetreten. Überprüfen Sie die Konsole.',
                severity: { low: 'Niedrig', medium: 'Mittel', high: 'Hoch', critical: 'Kritisch' }
            }
        };

        const loc = t[language] || t['en'];

        // Create Button if not in silent dev mode without button
        const btn = document.createElement('button');
        btn.id = 'bugcatcher-widget-btn';
        btn.innerText = devMode ? loc.btnDev : loc.btnClient;
        btn.style.display = 'block';
        document.body.appendChild(btn);

        // Keyboard shortcut for Dev Mode
        if (devMode) {
            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
                    e.preventDefault();
                    openModal();
                }
            });
        }

        // Modal HTML varying by mode
        const clientForm = `
        <div id="bugcatcher-modal">
            <h2>${loc.clientTitle}</h2>
            <p>${loc.clientSubtitle}</p>
            <textarea id="bugcatcher-description" placeholder="${loc.clientPlaceholder}"></textarea>
            <div id="bugcatcher-modal-actions">
                <button class="bc-btn-cancel" id="bugcatcher-cancel">${loc.cancel}</button>
                <button class="bc-btn-submit" id="bugcatcher-submit">${loc.submit}</button>
            </div>
        </div>
    `;

        const devForm = `
        <div id="bugcatcher-modal">
            <h2>${loc.devTitle}</h2>
            <p>${loc.devSubtitle}</p>
            <textarea id="bugcatcher-description" placeholder="${loc.devPlaceholder}"></textarea>
            <select id="bugcatcher-severity" style="width:100%; padding:10px; margin-bottom:12px; border-radius:6px; border:1px solid #ddd;">
                <option value="LOW">${loc.severity.low}</option>
                <option value="MEDIUM" selected>${loc.severity.medium}</option>
                <option value="HIGH">${loc.severity.high}</option>
                <option value="CRITICAL">${loc.severity.critical}</option>
            </select>
            <div id="bugcatcher-modal-actions">
                <button class="bc-btn-cancel" id="bugcatcher-cancel">${loc.cancel}</button>
                <button class="bc-btn-submit" id="bugcatcher-submit">${loc.submitDev}</button>
            </div>
        </div>
    `;

        // Create Modal
        const overlay = document.createElement('div');
        overlay.id = 'bugcatcher-modal-overlay';
        overlay.innerHTML = devMode ? devForm : clientForm;
        document.body.appendChild(overlay);

        const openModal = async () => {
            // Hide the widget button while modal is open
            btn.style.visibility = 'hidden';

            // Show the modal
            overlay.style.display = 'flex';
        };

        btn.onclick = openModal;
        document.getElementById('bugcatcher-cancel').onclick = () => {
            overlay.style.display = 'none';
            btn.style.visibility = 'visible';
        };

        document.getElementById('bugcatcher-submit').onclick = async () => {
            console.log('BugCatcher: Starting submission...');
            const description = document.getElementById('bugcatcher-description').value;
            const submitBtn = document.getElementById('bugcatcher-submit');
            submitBtn.disabled = true;
            submitBtn.innerText = loc.sending;

            let claritySessionId = null;
            let clarityUserId = null;
            try {
                // Priority 1: Check Cookies (Sync and reliable)
                console.log('BugCatcher: Checking Clarity cookies...');
                const clsk = document.cookie.match(/_clsk=([^;]+)/);
                if (clsk) {
                    claritySessionId = clsk[1].split('|')[0];
                    console.log('BugCatcher: Cookie found Clarity ID:', claritySessionId);
                }

                const clck = document.cookie.match(/_clck=([^;]+)/);
                if (clck) {
                    clarityUserId = clck[1].split('|')[0];
                    console.log('BugCatcher: Cookie found Clarity User ID:', clarityUserId);
                }

                // Priority 2: Use API if cookie not found
                if (!claritySessionId && typeof window.clarity === 'function') {
                    console.log('BugCatcher: Requesting Clarity IDs via API...');
                    // Using a safer check before calling
                    window.clarity("getSessionId", (id) => {
                        if (id) {
                            console.log('BugCatcher: API Received Clarity ID:', id);
                            claritySessionId = id;
                        }
                    });
                    // Wait briefly
                    await new Promise(r => setTimeout(r, 300));
                }
            } catch (e) {
                console.warn('BugCatcher: Clarity capture error:', e.message);
            }

            let uploadedAssetPaths = [];
            if (screenshots.length > 0) {
                submitBtn.innerText = loc.uploading;
                try {
                    const uploadRes = await fetch(`${window.__bc_baseUrl}/api/upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ images: screenshots })
                    });
                    if (uploadRes.ok) {
                        const uploadData = await uploadRes.json();
                        uploadedAssetPaths = uploadData.paths || [];
                        console.log('BugCatcher: Uploaded', uploadedAssetPaths.length, 'images locally');
                    } else {
                        console.warn('BugCatcher: Upload failed', uploadRes.status);
                    }
                } catch (err) {
                    console.warn('BugCatcher: Upload error', err);
                }
            }

            submitBtn.innerText = loc.uploadingReport;

            const payload = {
                projectKey: projectKey,
                description: description,
                url: window.location.href,
                userAgent: navigator.userAgent,
                claritySessionId: claritySessionId,
                clarityUserId: clarityUserId,
                timestamp: new Date().toISOString(),
                clientTimestamp: Date.now(),
                recordingEvents: events, // Send the captured rrweb events
                assetPaths: uploadedAssetPaths, // Send local paths instead of base64
                mode: devMode ? 'DEV' : 'CLIENT'
            };

            if (devMode) {
                const severityEl = document.getElementById('bugcatcher-severity');
                if (severityEl) {
                    payload.severity = severityEl.value;
                }
                payload.consoleErrors = consoleLogs;
                payload.networkLog = networkLogs;
                payload.jsErrors = jsErrors;

                // Try to capture App State if the user provided a getter
                if (typeof window.BugCatcherStateGetter === 'function') {
                    try {
                        payload.appState = window.BugCatcherStateGetter();
                    } catch (e) {
                        console.warn('BugCatcher: Error calling state getter', e);
                        payload.appState = { error: 'Failed to Stringify State' };
                    }
                }
            }
            console.log('BugCatcher: Sending payload with', events.length, 'events and', screenshots.length, 'frames');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for large payloads

            try {
                console.log('BugCatcher: Fetching /api/report...');
                const response = await fetch(`${window.__bc_baseUrl}/api/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    console.log('BugCatcher: Report success');
                    const data = await response.json();
                    // Clear storage on success so next report starts fresh
                    sessionStorage.removeItem(STORAGE_KEY);
                    sessionStorage.removeItem(SCREENSHOT_KEY);
                    events = []; // Clear events buffer
                    screenshots = []; // Clear screenshots buffer

                    if (typeof clarity === 'function' && data.id) {
                        clarity("event", "BugReported", { reportId: data.id });
                    }

                    submitBtn.innerText = loc.sent;
                    submitBtn.style.backgroundColor = '#10b981';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        btn.style.visibility = 'visible';
                        submitBtn.disabled = false;
                        submitBtn.innerText = devMode ? loc.submitDev : loc.submit;
                        submitBtn.style.backgroundColor = '';
                        document.getElementById('bugcatcher-description').value = '';
                    }, 2000);
                } else {
                    console.error('BugCatcher: Server error', response.status);
                    alert(loc.serverError.replace('{status}', response.status));
                }
            } catch (error) {
                console.error('BugCatcher Error:', error);
                if (error.name === 'AbortError') {
                    alert(loc.timeoutError);
                } else {
                    alert(loc.genericError);
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = devMode ? loc.submitDev : loc.submit;
                console.log('BugCatcher: Submission finished.');
            }
        };
    };

    initWidget();
})();


