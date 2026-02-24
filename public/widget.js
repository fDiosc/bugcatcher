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
            } catch (e) {
                // Handle quota errors by aggressively trimming old data
                if (e.name === 'QuotaExceededError') {
                    console.warn('BugCatcher: Storage full, trimming old history');
                    if (key === STORAGE_KEY && data.length > 500) {
                        const trimmed = [data[0], data[1], ...data.slice(-250)];
                        sessionStorage.setItem(key, JSON.stringify(trimmed));
                    }
                }
            }
        }, delay);
    };

    // 2. Interceptor Persistence Logic
    const consoleLogs = [];
    const networkLogs = [];
    const jsErrors = [];

    const enableDevInterceptors = () => {
        if (window.__bc_interceptors_active) return;
        window.__bc_interceptors_active = true;

        const originalConsole = { log: console.log, warn: console.warn, error: console.error };
        const pushLog = (level, args) => {
            try {
                const message = Array.from(args).map(a => {
                    if (a instanceof Error) return a.stack || a.message || String(a);
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                }).join(' ');
                consoleLogs.push({ level, message, timestamp: Date.now() });
                if (consoleLogs.length > 100) consoleLogs.shift();
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

        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const start = Date.now();
            try {
                const res = await originalFetch.apply(this, args);
                // Log failed or slow requests
                if (!res.ok || res.status >= 400 || (Date.now() - start > 2000)) {
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
            sending: 'Sending...', uploaded: 'Sent! 🎉', serverError: 'Retry later ({status})',
            genericError: 'Error occurred'
        },
        'pt-br': {
            btnDev: '🐞 Reportar Bug (Dev)', btnClient: 'Reportar Erro',
            clientTitle: 'Ops! Ocorreu um problema?', clientSubtitle: 'O que você tentava fazer?',
            cancel: 'Cancelar', submit: 'Enviar Feedback', submitDev: 'Enviar',
            sending: 'Enviando...', uploaded: 'Enviado! 🎉', serverError: 'Tente novamente ({status})',
            genericError: 'Erro inesperado'
        }
    };

    const createWidgetUI = () => {
        if (document.getElementById('bugcatcher-widget-btn')) return;
        loc = t[language] || t['en'];

        const styles = `
            #bugcatcher-widget-btn { position: fixed; bottom: 20px; right: 20px; background: #0070f3; color: white; border: none; border-radius: 50px; padding: 12px 24px; font-family: sans-serif; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999; }
            #bugcatcher-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999999; justify-content: center; align-items: center; }
            #bugcatcher-modal { background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: sans-serif; }
            #bugcatcher-modal textarea { width: 100%; height: 100px; margin: 12px 0; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; resize: none; font-family: inherit; }
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
                assetPaths: screenshots.map((s, i) => `vision_${i}.jpg`), // Placeholder or actual if we had upload logic here
                mode: devMode ? 'DEV' : 'CLIENT'
            };

            // Re-upload logic simplified for this rewrite version
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
                    sessionStorage.removeItem(STORAGE_KEY);
                    sessionStorage.removeItem(SCREENSHOT_KEY);
                    events = []; screenshots = [];
                    setTimeout(() => { overlay.style.display = 'none'; btn.style.visibility = 'visible'; submitBtn.disabled = false; submitBtn.innerText = devMode ? loc.submitDev : loc.submit; }, 2000);
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
            const frame = canvas.toDataURL('image/jpeg', 0.3); // Lower quality to save space
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

                // CRITICAL FIX: Preservation of snapshot chain
                // We keep the first 2 events (Metadata + Initial FullSnapshot)
                // And we use a manageable rotating buffer for the rest.
                if (events.length > 1500) {
                    // Try to keep the first 2 (Meta + Snapshot) and the last 1200
                    events = [events[0], events[1], ...events.slice(-1200)];
                }

                debounceStorage(STORAGE_KEY, events);
            },
            checkoutEveryNms: 60000, // New snapshot every 60s for reliability
            sampling: {
                mousemoveInterval: 1200, // 1.2s for smoother but still efficient video
                scroll: 1500,
                input: 'last'
            }
        });
        isRecording = true;
        console.log('BugCatcher: Recording active');
    };

    // 5. Initialization Lifecycle
    const initWidget = async () => {
        try {
            let baseUrl = 'https://www.bugcatcher.app';
            const scriptSrc = script.src;
            if (scriptSrc && scriptSrc.includes('localhost')) baseUrl = new URL(scriptSrc).origin;
            window.__bc_baseUrl = baseUrl;

            // Load storage
            try {
                const s = sessionStorage.getItem(STORAGE_KEY); if (s) { events = JSON.parse(s); if (events.length > 0) console.log('BugCatcher: Resumed playback history'); }
                const img = sessionStorage.getItem(SCREENSHOT_KEY); if (img) screenshots = JSON.parse(img);
            } catch (e) { }

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
        hScript.onload = () => { captureFrame(); setInterval(captureFrame, 60000); }; document.head.appendChild(hScript);
    };

    initWidget();
})();
