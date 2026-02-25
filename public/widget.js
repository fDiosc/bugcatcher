/* eslint-disable */
(function () {
    const script = document.currentScript || document.querySelector('script[data-project][src*="widget.js"]');
    const projectKey = script ? script.getAttribute('data-project') : null;

    if (!projectKey) {
        console.error('BugCatcher: Missing data-project attribute');
        return;
    }

    let devMode = false;
    let language = 'en';
    let isRecording = false;
    let lastScreenshotTime = 0;
    let events = [];
    let screenshots = [];
    let loc = {};

    const STORAGE_KEY = 'bugcatcher_recording_buffer';
    const SCREENSHOT_KEY = 'bugcatcher_screenshots';

    const debounceStorage = (key, data, delay = 5000) => {
        const timerKey = `_bc_timer_${key}`;
        if (window[timerKey]) clearTimeout(window[timerKey]);
        window[timerKey] = setTimeout(() => {
            try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) { }
        }, delay);
    };

    const consoleLogs = [];
    const networkLogs = [];
    const jsErrors = [];

    const enableDevInterceptors = () => {
        if (window.__bc_interceptors_active) return;
        window.__bc_interceptors_active = true;
        console.log('BugCatcher: Dev Mode Active (Telemetry Interceptors Enabled)');

        const originalConsole = { log: console.log, warn: console.warn, error: console.error };
        const pushLog = (level, args) => {
            try {
                const message = Array.from(args).map(a => {
                    try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch (e) { return '[Circular Object]'; }
                }).join(' ');
                consoleLogs.push({ level, message, timestamp: Date.now() });
                if (consoleLogs.length > 200) consoleLogs.shift();
            } catch (e) { }
        };

        console.log = function () { originalConsole.log.apply(console, arguments); pushLog('log', arguments); };
        console.warn = function () { originalConsole.warn.apply(console, arguments); pushLog('warn', arguments); };
        console.error = function () { originalConsole.error.apply(console, arguments); pushLog('error', arguments); };

        window.addEventListener('error', (e) => {
            jsErrors.push({ type: 'error', message: e.message, filename: e.filename, lineno: e.lineno, timestamp: Date.now(), stack: e.error ? e.error.stack : null });
            if (jsErrors.length > 50) jsErrors.shift();
        });

        window.addEventListener('unhandledrejection', (e) => {
            jsErrors.push({ type: 'promise_reject', message: String(e.reason), timestamp: Date.now() });
        });
    };

    const t = {
        'en': {
            btnDev: '🐞 Report Bug (Dev)', btnClient: 'Report Bug',
            title: 'Report a Bug', subtitle: 'What happened?',
            devTitle: '[Dev] Bug Report', devSubtitle: 'Session data and telemetry will be attached.',
            placeholder: 'Ex: I clicked Save and it crashed...',
            cancel: 'Cancel', submit: 'Submit', sending: 'Sending...', sent: 'Sent! 🎉',
            severity: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
        },
        'pt-br': {
            btnDev: '🐞 Reportar Bug (Dev)', btnClient: 'Reportar Erro',
            title: 'Reportar um Problema', subtitle: 'O que aconteceu?',
            devTitle: '[Dev] Relato de Bug', devSubtitle: 'A telemetria da sessão será enviada.',
            placeholder: 'Ex: Cliquei em salvar e a tela travou...',
            cancel: 'Cancelar', submit: 'Enviar', sending: 'Enviando...', sent: 'Enviado! 🎉',
            severity: { low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico' }
        }
    };

    const createWidgetUI = () => {
        if (document.getElementById('bugcatcher-widget-btn')) return;
        loc = t[language] || t['en'];

        const styles = `
            #bugcatcher-widget-btn { 
                position: fixed !important; bottom: 20px !important; right: 20px !important; 
                background: #0070f3 !important; color: #ffffff !important; border: none !important; 
                border-radius: 50px !important; padding: 12px 24px !important; font-family: sans-serif !important; 
                font-weight: bold !important; cursor: pointer !important; z-index: 2147483646 !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; display: block !important;
            }
            #bugcatcher-modal-overlay { 
                display: none; position: fixed !important; top: 0 !important; left: 0 !important; 
                width: 100% !important; height: 100% !important; background: rgba(0,0,0,0.7) !important; 
                z-index: 2147483647 !important; justify-content: center !important; align-items: center !important;
            }
            #bugcatcher-modal { 
                background: #ffffff !important; color: #111111 !important; padding: 24px !important; 
                border-radius: 12px !important; width: 90% !important; max-width: 420px !important; 
                box-shadow: 0 10px 30px rgba(0,0,0,0.4) !important; font-family: -apple-system, system-ui, sans-serif !important;
                text-align: left !important;
            }
            #bugcatcher-modal h2 { margin: 0 0 8px 0 !important; color: #111 !important; font-size: 22px !important; font-weight: 800 !important; line-height: 1.2 !important; }
            #bugcatcher-modal p { margin: 0 0 16px 0 !important; color: #555 !important; font-size: 14px !important; line-height: 1.4 !important; }
            #bugcatcher-modal textarea { 
                width: 100% !important; height: 110px !important; margin: 12px 0 !important; padding: 12px !important; 
                border: 1px solid #bbb !important; border-radius: 8px !important; box-sizing: border-box !important; 
                resize: none !important; color: #111 !important; background: #fff !important; font-size: 15px !important;
            }
            #bugcatcher-modal select {
                width: 100% !important; padding: 12px !important; margin-bottom: 20px !important; 
                border-radius: 8px !important; border: 1px solid #bbb !important; background: #fff !important; color: #111 !important; font-size: 14px !important;
            }
            #bugcatcher-modal-actions { display: flex !important; justify-content: flex-end !important; gap: 10px !important; }
            #bugcatcher-modal-actions button { 
                padding: 12px 24px !important; border-radius: 8px !important; border: none !important; 
                cursor: pointer !important; font-weight: bold !important; font-size: 14px !important;
            }
            .bc-btn-submit { background: #0070f3 !important; color: #fff !important; }
            .bc-btn-cancel { background: #f0f0f0 !important; color: #444 !important; }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const btn = document.createElement('button');
        btn.id = 'bugcatcher-widget-btn';
        btn.innerText = devMode ? loc.btnDev : loc.btnClient;
        document.body.appendChild(btn);

        const severityHtml = devMode ? `
            <select id="bugcatcher-severity">
                <option value="LOW">${loc.severity.low}</option>
                <option value="MEDIUM" selected>${loc.severity.medium}</option>
                <option value="HIGH">${loc.severity.high}</option>
                <option value="CRITICAL">${loc.severity.critical}</option>
            </select>
        ` : '';

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = `
            <div id="bugcatcher-modal-overlay">
                <div id="bugcatcher-modal">
                    <h2>${devMode ? loc.devTitle : loc.title}</h2>
                    <p>${devMode ? loc.devSubtitle : loc.subtitle}</p>
                    <textarea id="bugcatcher-description" placeholder="${loc.placeholder}"></textarea>
                    ${severityHtml}
                    <div id="bugcatcher-modal-actions">
                        <button class="bc-btn-cancel" id="bugcatcher-cancel">${loc.cancel}</button>
                        <button class="bc-btn-submit" id="bugcatcher-submit">${loc.submit}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);

        const overlay = document.getElementById('bugcatcher-modal-overlay');
        const descArea = document.getElementById('bugcatcher-description');

        btn.onclick = () => {
            overlay.style.setProperty('display', 'flex', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
            descArea.focus();
        };

        document.getElementById('bugcatcher-cancel').onclick = () => {
            overlay.style.setProperty('display', 'none', '');
            btn.style.setProperty('visibility', 'visible', 'important');
        };

        document.getElementById('bugcatcher-submit').onclick = async () => {
            const submitBtn = document.getElementById('bugcatcher-submit');
            submitBtn.disabled = true;
            submitBtn.innerText = loc.sending;

            const payload = {
                projectKey,
                description: descArea.value,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                recordingEvents: events,
                mode: devMode ? 'DEV' : 'CLIENT'
            };

            let finalAssetPaths = [];
            if (screenshots.length > 0) {
                try {
                    const uploadRes = await fetch(`${window.__bc_baseUrl}/api/upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ images: screenshots })
                    });
                    if (uploadRes.ok) {
                        const data = await uploadRes.json();
                        finalAssetPaths = data.paths || [];
                    }
                } catch (e) { }
            }
            payload.assetPaths = finalAssetPaths;

            if (devMode) {
                const sev = document.getElementById('bugcatcher-severity');
                if (sev) payload.severity = sev.value;
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
                    submitBtn.innerText = loc.sent;
                    sessionStorage.removeItem(STORAGE_KEY);
                    events = [events[0], events[1]]; // Reset to base state
                    setTimeout(() => {
                        overlay.style.setProperty('display', 'none', '');
                        btn.style.setProperty('visibility', 'visible', 'important');
                        submitBtn.disabled = false;
                        submitBtn.innerText = loc.submit;
                        descArea.value = '';
                    }, 2000);
                } else {
                    alert('Error: ' + res.status);
                    submitBtn.disabled = false; submitBtn.innerText = loc.submit;
                }
            } catch (e) { submitBtn.disabled = false; submitBtn.innerText = loc.submit; }
        };
    };

    const tryStartRecording = () => {
        if (isRecording || typeof rrweb === 'undefined') return;
        rrweb.record({
            emit(event) {
                events.push(event);
                // STRICT TRUNCATION: Limit to ~150 events (approx 2 mins action)
                // We keep events[0] (Meta) and events[1] (FullSnapshot) to ensure playback starts
                if (events.length > 150) {
                    events = [events[0], events[1], ...events.slice(-148)];
                }
                debounceStorage(STORAGE_KEY, events);
            },
            checkoutEveryNms: 60000,
            sampling: { mousemoveInterval: 1200, scroll: 1500, input: 'last' }
        });
        isRecording = true;
    };

    const initWidget = async () => {
        try {
            let baseUrl = 'https://www.bugcatcher.app';
            const scriptSrc = script.src;
            if (scriptSrc && scriptSrc.includes('localhost')) baseUrl = new URL(scriptSrc).origin;
            window.__bc_baseUrl = baseUrl;

            try {
                const s = sessionStorage.getItem(STORAGE_KEY);
                if (s) { events = JSON.parse(s); }
            } catch (e) { }

            const res = await fetch(`${baseUrl}/api/project?key=${projectKey}`);
            if (res.ok) {
                const config = await res.json();
                devMode = config.mode === 'DEV';
                language = config.language || 'en';
                console.log(`BugCatcher: Config synced (${devMode ? 'DEV' : 'CLIENT'} mode)`);
            }
        } catch (e) { console.warn('BugCatcher: Sync offline'); }

        if (devMode) enableDevInterceptors();
        createWidgetUI();

        const rScript = document.createElement('script'); rScript.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb-all.min.js';
        rScript.onload = tryStartRecording; document.head.appendChild(rScript);

        const hScript = document.createElement('script'); hScript.src = 'https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/dist/html2canvas-pro.min.js';
        hScript.onload = () => {
            setTimeout(() => {
                if (typeof html2canvas !== 'undefined') {
                    html2canvas(document.body, { scale: 0.5, logging: false, useCORS: true }).then(c => {
                        screenshots = [c.toDataURL('image/jpeg', 0.25)];
                    });
                }
            }, 5000);
        };
        document.head.appendChild(hScript);
    };

    initWidget();
})();
