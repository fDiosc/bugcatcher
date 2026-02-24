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

    // Global State
    let devMode = false;
    let language = 'en';
    let isRecording = false;
    let visionInitialized = false;
    let lastScreenshotTime = 0;
    let events = [];
    let screenshots = [];
    let loc = {}; // Localization object

    const STORAGE_KEY = 'bugcatcher_recording_buffer';
    const SCREENSHOT_KEY = 'bugcatcher_screenshots';

    // 1. Debounced Storage Logic to prevent "Stuttering"
    const debounceStorage = (key, data, delay = 5000) => {
        const timerKey = `_bc_timer_${key}`;
        if (window[timerKey]) clearTimeout(window[timerKey]);
        window[timerKey] = setTimeout(() => {
            try {
                sessionStorage.setItem(key, JSON.stringify(data));
            } catch (e) { /* ignore quota errors */ }
        }, delay);
    };

    // 2. Interceptor Persistence Logic
    const consoleLogs = [];
    const networkLogs = [];
    const jsErrors = [];

    const enableDevInterceptors = () => {
        if (window.__bc_interceptors_active) return;
        window.__bc_interceptors_active = true;
        console.log('BugCatcher: Dev Mode Enabled - Intercepting Telemetry');

        const originalConsole = { log: console.log, warn: console.warn, error: console.error };
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

        window.addEventListener('error', (event) => {
            const target = event.target || event.srcElement;
            if (target instanceof HTMLElement && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                networkLogs.push({ type: 'resource', method: 'GET', url: target.src || target.href, status: 'FAILED', timestamp: Date.now() });
                return;
            }
            jsErrors.push({ type: 'error', message: event.message, filename: event.filename, lineno: event.lineno, error: event.error ? event.error.stack : null, timestamp: Date.now() });
        }, true);

        // Fetch/XHR Interceptors...
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const start = Date.now();
            try {
                const res = await originalFetch.apply(this, args);
                if (!res.ok || res.status >= 400) {
                    networkLogs.push({ type: 'fetch', url: args[0].url || args[0], status: res.status, duration: Date.now() - start, timestamp: start });
                }
                return res;
            } catch (e) {
                networkLogs.push({ type: 'fetch', url: args[0].url || args[0], error: e.message, status: 'FAILED', timestamp: start });
                throw e;
            }
        };
    };

    // 3. UI and Localization
    const t = {
        'en': {
            btnDev: '🐞 Report Bug (Dev)', btnClient: 'Report Bug',
            clientTitle: 'Oops! Did something go wrong?', clientSubtitle: 'What were you trying to do?',
            cancel: 'Cancel', submit: 'Submit Feedback', submitDev: 'Submit',
            sending: 'Sending...', uploaded: 'Sent! 🎉',
            serverError: 'Failed (Status: {status})', timeoutError: 'Timed out',
            genericError: 'An error occurred'
        },
        'pt-br': {
            btnDev: '🐞 Reportar Bug (Dev)', btnClient: 'Reportar Erro',
            clientTitle: 'Ops! Ocorreu um problema?', clientSubtitle: 'O que você tentava fazer?',
            cancel: 'Cancelar', submit: 'Enviar Feedback', submitDev: 'Enviar',
            sending: 'Enviando...', uploaded: 'Enviado! 🎉',
            serverError: 'Falha (Erro: {status})', timeoutError: 'Tempo esgotado',
            genericError: 'Ocorreu um erro'
        }
    };

    const createWidgetUI = () => {
        if (document.getElementById('bugcatcher-widget-btn')) return;
        loc = t[language] || t['en'];

        const styles = `
            #bugcatcher-widget-btn { position: fixed; bottom: 20px; right: 20px; background: #0070f3; color: white; border: none; border-radius: 50px; padding: 12px 24px; font-family: sans-serif; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; }
            #bugcatcher-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999999; justify-content: center; align-items: center; }
            #bugcatcher-modal { background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: sans-serif; }
            #bugcatcher-modal textarea { width: 100%; height: 100px; margin: 12px 0; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; resize: none; }
            #bugcatcher-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
            #bugcatcher-modal-actions button { padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; }
            .bc-btn-submit { background: #0070f3; color: white; }
            .bc-btn-cancel { background: #eee; color: #333; }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const btn = document.createElement('button');
        btn.id = 'bugcatcher-widget-btn';
        btn.innerText = devMode ? loc.btnDev : loc.btnClient;
        document.body.appendChild(btn);

        const modalHtml = `
            <div id="bugcatcher-modal-overlay">
                <div id="bugcatcher-modal">
                    <h2>${loc.clientTitle}</h2>
                    <p>${loc.clientSubtitle}</p>
                    <textarea id="bugcatcher-description"></textarea>
                    <div id="bugcatcher-modal-actions">
                        <button class="bc-btn-cancel" id="bugcatcher-cancel">${loc.cancel}</button>
                        <button class="bc-btn-submit" id="bugcatcher-submit">${devMode ? loc.submitDev : loc.submit}</button>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        const overlay = document.getElementById('bugcatcher-modal-overlay');
        btn.onclick = () => { overlay.style.display = 'flex'; btn.style.visibility = 'hidden'; };
        document.getElementById('bugcatcher-cancel').onclick = () => { overlay.style.display = 'none'; btn.style.visibility = 'visible'; };

        document.getElementById('bugcatcher-submit').onclick = async () => {
            const submitBtn = document.getElementById('bugcatcher-submit');
            submitBtn.disabled = true;
            submitBtn.innerText = loc.sending;

            const payload = {
                projectKey,
                description: document.getElementById('bugcatcher-description').value,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                recordingEvents: events,
                mode: devMode ? 'DEV' : 'CLIENT'
            };

            if (devMode) {
                payload.consoleErrors = consoleLogs;
                payload.networkLog = networkLogs;
                payload.jsErrors = jsErrors;
            }

            try {
                const res = await fetch(`${window.__bc_baseUrl}/api/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    submitBtn.innerText = loc.uploaded;
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        btn.style.visibility = 'visible';
                        submitBtn.disabled = false;
                        submitBtn.innerText = devMode ? loc.submitDev : loc.submit;
                    }, 2000);
                } else {
                    alert(loc.serverError.replace('{status}', res.status));
                    submitBtn.disabled = false;
                }
            } catch (e) {
                alert(loc.genericError);
                submitBtn.disabled = false;
            }
        };
    };

    // 4. Vision and Recording logic
    const captureFrame = async () => {
        const now = Date.now();
        if (now - lastScreenshotTime < 30000) return;
        if (typeof html2canvas === 'undefined') return;

        try {
            const canvas = await html2canvas(document.body, { scale: 1, logging: false, useCORS: true });
            const frame = canvas.toDataURL('image/jpeg', 0.4);
            screenshots.push(frame);
            if (screenshots.length > 5) screenshots.shift();
            lastScreenshotTime = Date.now();
            debounceStorage(SCREENSHOT_KEY, screenshots);
        } catch (e) { }
    };

    const tryStartRecording = () => {
        if (isRecording || typeof rrweb === 'undefined') return;
        rrweb.record({
            emit(event) {
                events.push(event);
                if (events.length > 1000) events.shift();
                debounceStorage(STORAGE_KEY, events);
            },
            sampling: { mousemoveInterval: 3000, scroll: 2000 }
        });
        isRecording = true;
    };

    // 5. Initialization Lifecycle
    const initWidget = async () => {
        try {
            let baseUrl = 'https://www.bugcatcher.app';
            const scriptSrc = script.src;
            if (scriptSrc && scriptSrc.includes('localhost')) baseUrl = new URL(scriptSrc).origin;
            window.__bc_baseUrl = baseUrl;

            const res = await fetch(`${baseUrl}/api/project?key=${projectKey}`);
            if (res.ok) {
                const config = await res.json();
                devMode = config.mode === 'DEV';
                language = config.language || 'en';
            }
        } catch (e) { console.warn('BugCatcher: Sync offline'); }

        if (devMode) enableDevInterceptors();
        createWidgetUI();

        // Load assets
        const rScript = document.createElement('script'); rScript.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb-all.min.js';
        rScript.onload = tryStartRecording; document.head.appendChild(rScript);

        const hScript = document.createElement('script'); hScript.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js';
        hScript.onload = captureFrame; document.head.appendChild(hScript);
    };

    initWidget();
})();
