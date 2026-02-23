/* eslint-disable */
import { useState, useEffect } from "react";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Instrument+Sans:wght@400;600&family=Fira+Code:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#06060a;--bg2:#0d0d12;--bg3:#131318;--b:#1c1c24;--b2:#28283a;
  --r:#FF2D2D;--t:#eaeaea;--m:#52526a;--m2:#32323f;
  --g:#22c55e;--a:#f59e0b;--bl:#60a5fa;--p:#a78bfa}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--t);font-family:'Instrument Sans',sans-serif;overflow-x:hidden}
::selection{background:rgba(255,45,45,.28);color:#fff}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.nav{position:fixed;top:0;left:0;right:0;z-index:200;padding:16px 40px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(6,6,10,.93);backdrop-filter:blur(18px);border-bottom:1px solid var(--b)}
.nlogo{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;display:flex;align-items:center;gap:9px;cursor:pointer}
.nlinks{display:flex;gap:28px}
.nlinks a{color:var(--m);text-decoration:none;font-size:13px;transition:color .2s}
.nlinks a:hover{color:var(--t)}
.nbtn{background:none;border:1px solid var(--b2);color:var(--m);padding:7px 16px;
  font-family:'Instrument Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .2s}
.nbtn:hover,.nbtn.on{border-color:rgba(255,45,45,.4);color:var(--r);background:rgba(255,45,45,.06)}
.ncta{background:var(--r);color:#fff;border:none;padding:9px 20px;
  font-family:'Instrument Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;
  clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);transition:all .2s}
.ncta:hover{background:#ff4d4d;box-shadow:0 0 18px rgba(255,45,45,.4)}
.sec{padding:90px 40px}
.si{max-width:1140px;margin:0 auto}
.stag{font-family:'Fira Code',monospace;font-size:11px;color:var(--r);letter-spacing:3px;
  text-transform:uppercase;margin-bottom:13px;display:flex;align-items:center;gap:10px}
.stag::after{content:'';width:32px;height:1px;background:#5a0f0f;flex-shrink:0}
.sh{font-family:'Bebas Neue',sans-serif;font-size:clamp(36px,4.5vw,58px);
  line-height:.98;letter-spacing:1px;margin-bottom:13px}
.ss{color:#777;font-size:15px;max-width:500px;line-height:1.7}
.term{background:var(--bg2);border:1px solid var(--b2);border-radius:6px;overflow:hidden;
  box-shadow:0 24px 64px rgba(0,0,0,.7);position:relative}
.term::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,45,45,.35),transparent)}
.tbar{background:#0a0a0e;padding:11px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid var(--b)}
.td{width:10px;height:10px;border-radius:50%}
.ttl{font-family:'Fira Code',monospace;font-size:11px;color:var(--m);margin-left:8px}
.tb{padding:18px 20px;font-family:'Fira Code',monospace;font-size:12px;line-height:2}
.tl{display:flex;gap:0}
.tcur{display:inline-block;width:7px;height:13px;background:var(--r);vertical-align:middle;animation:blink 1s infinite;margin-left:2px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--b);border:1px solid var(--b)}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--b);border:1px solid var(--b)}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--b);border:1px solid var(--b)}
.card{background:var(--bg2);padding:30px;transition:background .2s}
.card:hover{background:var(--bg3)}
.card2{background:var(--bg);padding:36px 28px;position:relative;overflow:hidden;transition:background .2s}
.card2:hover{background:var(--bg2)}
.card2::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--r),transparent);opacity:0;transition:opacity .3s}
.card2:hover::after{opacity:1}
.cbg{position:absolute;bottom:-6px;right:12px;font-family:'Bebas Neue',sans-serif;
  font-size:88px;color:var(--bg2);line-height:1;pointer-events:none}
.card2:hover .cbg{color:var(--b)}
.badge{display:inline-flex;align-items:center;gap:7px;border:1px solid;
  padding:4px 12px;font-size:10px;font-family:'Fira Code',monospace;letter-spacing:1.5px}
.badge-r{background:rgba(255,45,45,.07);border-color:rgba(255,45,45,.24);color:var(--r)}
.badge-p{background:rgba(167,139,250,.07);border-color:rgba(167,139,250,.24);color:var(--p)}
.bdot{width:5px;height:5px;border-radius:50%;background:currentColor;animation:pulse 2s infinite;flex-shrink:0}
.btn-r{background:var(--r);color:#fff;border:none;padding:12px 28px;font-family:'Instrument Sans',sans-serif;
  font-weight:600;font-size:14px;cursor:pointer;
  clip-path:polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%);transition:all .2s}
.btn-r:hover{background:#ff5555;box-shadow:0 8px 28px rgba(255,45,45,.35);transform:translateY(-1px)}
.btn-o{background:transparent;border:1px solid var(--b2);color:var(--m);padding:12px 24px;
  font-family:'Instrument Sans',sans-serif;font-size:14px;cursor:pointer;transition:all .2s}
.btn-o:hover{border-color:#444;color:var(--t)}
.tag{display:inline-block;font-family:'Fira Code',monospace;font-size:10px;padding:3px 9px;border:1px solid}
.tag-g{color:var(--g);border-color:rgba(34,197,94,.25);background:rgba(34,197,94,.06)}
.tag-a{color:var(--a);border-color:rgba(245,158,11,.25);background:rgba(245,158,11,.06)}
.tag-b{color:var(--bl);border-color:rgba(96,165,250,.25);background:rgba(96,165,250,.06)}
.tag-p{color:var(--p);border-color:rgba(167,139,250,.25);background:rgba(167,139,250,.06)}
.tag-r{color:var(--r);border-color:rgba(255,45,45,.25);background:rgba(255,45,45,.06)}
.irow{display:flex;gap:8px;flex-wrap:wrap;margin-top:3px}
.chip{padding:4px 11px;font-family:'Fira Code',monospace;font-size:11px;border:1px solid;letter-spacing:.5px}
.chip-g{color:var(--g);border-color:rgba(34,197,94,.25);background:rgba(34,197,94,.05)}
.chip-b{color:var(--bl);border-color:rgba(96,165,250,.25);background:rgba(96,165,250,.05)}
.chip-a{color:var(--a);border-color:rgba(245,158,11,.25);background:rgba(245,158,11,.05)}
.istep{display:flex;gap:16px;padding:20px 24px;background:var(--bg2);border:1px solid var(--b);cursor:pointer;transition:all .2s;position:relative}
.istep.on{background:var(--bg3);border-color:rgba(255,45,45,.3)}
.istep.on::before{content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--r)}
.istep:hover{background:var(--bg3)}
.isn{font-family:'Bebas Neue',sans-serif;font-size:28px;line-height:1;color:var(--m2);flex-shrink:0;transition:color .2s}
.istep.on .isn{color:var(--r)}
.mcard{border:1px solid var(--b);padding:40px 34px}
.mcard.dev{border-top:3px solid var(--r)}
.mcard.cli{border-top:3px solid var(--p)}
.mlist{list-style:none;display:flex;flex-direction:column;gap:9px}
.mlist li{font-size:13px;color:#aaa;display:flex;align-items:flex-start;gap:8px;line-height:1.5}
.marr{flex-shrink:0;font-family:'Fira Code',monospace}
.pcard{background:var(--bg);padding:36px 32px;position:relative;transition:background .2s}
.pcard:hover{background:var(--bg2)}
.pcard.on{background:var(--bg2);border:1px solid rgba(255,45,45,.3);margin:-1px;z-index:1}
.pcard.on::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--r)}
.pamt{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:1px;line-height:1}
.plabel{font-family:'Fira Code',monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;
  margin-bottom:16px;display:inline-block;padding:3px 9px;border:1px solid var(--b2);color:var(--m)}
.pcard.on .plabel{color:var(--r);border-color:rgba(255,45,45,.3);background:rgba(255,45,45,.06)}
.plist{list-style:none;margin-top:16px;display:flex;flex-direction:column;gap:10px}
.plist li{font-size:13px;color:#aaa;display:flex;align-items:flex-start;gap:8px;line-height:1.4}
.py{color:var(--g);flex-shrink:0;font-family:'Fira Code',monospace}
.pn{color:var(--m2);flex-shrink:0;font-family:'Fira Code',monospace}
.pbtn{width:100%;margin-top:26px;padding:12px;font-family:'Instrument Sans',sans-serif;
  font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;
  background:transparent;border:1px solid var(--b2);color:var(--m)}
.pbtn:hover{border-color:#444;color:var(--t)}
.pcard.on .pbtn{background:var(--r);border-color:var(--r);color:#fff;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)}
.pcard.on .pbtn:hover{background:#ff5555;box-shadow:0 5px 20px rgba(255,45,45,.3)}
.ppop{position:absolute;top:13px;right:13px;background:var(--r);color:#fff;font-size:10px;
  font-family:'Fira Code',monospace;padding:3px 9px;letter-spacing:1px;
  clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)}
.mcpbox{background:var(--bg2);border:1px solid rgba(167,139,250,.25);padding:20px;
  font-family:'Fira Code',monospace;font-size:12px;line-height:1.9;position:relative}
.mcpbox::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(167,139,250,.45),transparent)}
.cns{background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.2);padding:36px;position:relative;margin-top:56px}
.cns::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--p),transparent)}
.cnsgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px}
.cnscard{background:var(--bg2);border:1px solid var(--b2);padding:18px}
.cnsn{font-family:'Bebas Neue',sans-serif;font-size:30px;color:rgba(167,139,250,.25);line-height:1;margin-bottom:9px}
.ritem{background:var(--bg2);padding:26px;transition:background .2s}
.ritem:hover{background:var(--bg3)}
.ritem.cur{background:rgba(167,139,250,.04);border:1px solid rgba(167,139,250,.18)}
.ritem.cur:hover{background:rgba(167,139,250,.08)}
.qwrap{background:var(--bg2);border-top:1px solid var(--b);border-bottom:1px solid var(--b);text-align:center;padding:72px 40px}
.qt{font-family:'Bebas Neue',sans-serif;font-size:clamp(24px,3.5vw,48px);letter-spacing:1px;line-height:1.05}
@media(max-width:860px){
  .nav{padding:14px 18px}
  .nlinks{display:none}
  .sec{padding:60px 18px}
  .hero-in,.g2,.iflex,.mgrid{grid-template-columns:1fr!important}
  .g3,.cnsgrid{grid-template-columns:1fr 1fr}
  .g4{grid-template-columns:1fr 1fr}
  .pcard.on{margin:0}
  .pricing-4{grid-template-columns:1fr 1fr!important}
}
`;

const HLINES = [
  { p: 1, c: '#eaeaea', t: 'npx bugcatcher@latest init' },
  { c: '', t: '' },
  { c: '#1a1a30', t: '   ██████╗ ██╗   ██╗ ██████╗ ██████╗' },
  { c: '#1a1a30', t: '   ██╔══██╗██║   ██║██╔════╝██╔════╝' },
  { c: '#232340', t: '   BugCatcher v2.0 — Vibe Coder Edition' },
  { c: '', t: '' },
  { c: '#666', t: '? Paste your Project API Key: ', sfx: 'bc_live_x9k2...m7p', sc: '#a78bfa' },
  { c: '', t: '' },
  { c: '#22c55e', t: '✓  Project validated  →  AgroMonitor (prod)' },
  { c: '#22c55e', t: '✓  Widget injected    →  public/bugcatcher.js' },
  { c: '#22c55e', t: '✓  Layout patched     →  app/layout.tsx' },
  { c: '#22c55e', t: '✓  .env updated       →  BUGCATCHER_KEY' },
  { c: '', t: '' },
  { c: '#f59e0b', t: '⚡ Restart dev server to activate.' },
  { c: '', t: '' },
  { c: '#60a5fa', t: '  DEV MODE    → Ctrl+Shift+B' },
  { c: '#60a5fa', t: '  CLIENT MODE → floating button' },
  { c: '', t: '' },
  { c: '#a78bfa', t: '🐞 Ready. Go break things.' },
];

function HeroTerm() {
  const [n, sn] = useState(0);
  useEffect(() => {
    if (n >= HLINES.length) return;
    const t = setTimeout(() => sn(v => v + 1), n < 6 ? 130 : n < 13 ? 70 : 55);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <div style={{ animation: 'up .6s .15s ease both', animationFillMode: 'both' }}>
      <div className="term">
        <div className="tbar">
          <div className="td" style={{ background: '#ff5f57' }} /><div className="td" style={{ background: '#ffbd2e' }} /><div className="td" style={{ background: '#28c840' }} />
          <span className="ttl">terminal — bugcatcher init</span>
        </div>
        <div className="tb" style={{ minHeight: 300 }}>
          {HLINES.slice(0, n).map((l, i) => (
            <div key={i} className="tl">
              {l.p && <span style={{ color: 'var(--r)' }}>$&nbsp;</span>}
              <span style={{ color: l.c }}>{l.t}{l.sfx && <span style={{ color: l.sc }}>{l.sfx}</span>}</span>
            </div>
          ))}
          {n < HLINES.length && <div className="tl"><span style={{ color: 'var(--r)' }}>$&nbsp;</span><span className="tcur" /></div>}
        </div>
      </div>
      <div style={{ marginTop: 10, padding: '11px 16px', background: 'var(--bg2)', border: '1px solid var(--b)', display: 'flex', gap: 9, alignItems: 'center' }}>
        <span style={{ color: 'var(--g)', fontFamily: 'Fira Code, monospace', fontSize: 12 }}>✓</span>
        <span style={{ fontSize: 12, color: 'var(--m)', fontFamily: 'Fira Code, monospace' }}>Auto-detect: <span style={{ color: '#444' }}>Next.js · Vite · Remix · CRA · HTML</span></span>
      </div>
    </div>
  );
}

const ISTEPS = [
  {
    t: 'Install via npx or npm', d: 'One command. Zero manual config.', lines: [
      { p: 1, c: '#eaeaea', t: 'npx bugcatcher@latest init' },
      { c: '#232340', t: '   BugCatcher v2.0 — Vibe Coder Edition' },
      { c: '', t: '' },
      { c: '#666', t: '? Paste your Project API Key: _' },
    ]
  },
  {
    t: 'Paste your API Key', d: 'Generated in seconds. CLI validates everything automatically.', lines: [
      { p: 1, c: '#eaeaea', t: 'npx bugcatcher@latest init' },
      { c: '#666', t: '? API Key: bc_live_x9k2...m7p ✓' },
      { c: '', t: '' },
      { c: '#22c55e', t: '✓  Connecting...' },
      { c: '#22c55e', t: '✓  Project: AgroMonitor (prod)' },
      { c: '#22c55e', t: '✓  Permissions validated' },
    ]
  },
  {
    t: 'Widget auto-injected', d: 'CLI detects your framework and patches the right entry point.', lines: [
      { c: '#22c55e', t: '✓  Framework: Next.js (App Router)' },
      { c: '#22c55e', t: '✓  Injected  → public/bugcatcher.js' },
      { c: '#22c55e', t: '✓  Patched   → app/layout.tsx' },
      { c: '#22c55e', t: '✓  .env      → BUGCATCHER_KEY saved' },
      { c: '', t: '' },
      { c: '#f59e0b', t: '⚡ Restart your dev server.' },
    ]
  },
  {
    t: "You're live. Ctrl+Shift+B.", d: 'Your first bug is one shortcut away.', lines: [
      { c: '#22c55e', t: '✓  Widget active on bugcatcher.app' },
      { c: '', t: '' },
      { c: '#60a5fa', t: '  DEV MODE    → Ctrl+Shift+B' },
      { c: '#60a5fa', t: '  CLIENT MODE → bottom-right button' },
      { c: '', t: '' },
      { c: '#a78bfa', t: '🐞 BugCatcher is watching.' },
    ]
  },
];

function InstTerm({ step }) {
  const s = ISTEPS[step];
  return (
    <div>
      <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--m)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>// STEP {step + 1} OF 4</div>
      <div className="term">
        <div className="tbar">
          <div className="td" style={{ background: '#ff5f57' }} /><div className="td" style={{ background: '#ffbd2e' }} /><div className="td" style={{ background: '#28c840' }} />
          <span className="ttl">bugcatcher init</span>
        </div>
        <div className="tb" style={{ minHeight: 170 }}>
          {s.lines.map((l, i) => (
            <div key={i} className="tl">
              {l.p && <span style={{ color: 'var(--r)' }}>$&nbsp;</span>}
              <span style={{ color: l.c }}>{l.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PLANS = [
  {
    id: 'free', label: 'FREE', price: '$0', per: '/ forever', pop: 0,
    desc: 'Tight limits by design. Upgrade when it starts working.',
    f: [[1, '1 project'], [1, '10 reports / month'], [1, 'AI triage (GPT-4o-mini)'], [1, 'Visual Timeline (3 frames)'], [1, 'rrweb DOM Replay'], [1, 'Client Mode only'], [0, 'Dev Mode'], [0, 'Webhooks'], [1, '7-day history']],
    btn: 'Start free', ent: 0
  },
  {
    id: 'builder', label: 'BUILDER', price: '$19', per: '/ month', pop: 1,
    desc: 'For vibe coders with products in active validation.',
    f: [[1, '5 projects'], [1, '500 reports / month'], [1, 'AI triage (GPT-4o full)'], [1, 'Visual Timeline (10 frames)'], [1, 'rrweb DOM Replay'], [1, 'Client Mode + Dev Mode'], [1, 'Console + Network + JS Errors'], [1, 'Slack webhook'], [1, '90-day history']],
    btn: 'Get Builder', ent: 0
  },
  {
    id: 'studio', label: 'STUDIO', price: '$49', per: '/ month', pop: 0,
    desc: 'For builders running multiple SaaS products in parallel.',
    f: [[1, '15 projects'], [1, '2,000 reports / month'], [1, 'AI triage (GPT-4o + expanded context)'], [1, 'Everything in Builder'], [1, 'App State Snapshot'], [1, 'Performance Metrics (LCP/CLS/FID)'], [1, 'Slack + Linear + Jira webhooks'], [1, 'Bug recurrence detection'], [1, '1-year history']],
    btn: 'Get Studio', ent: 0
  },
  {
    id: 'enterprise', label: 'ENTERPRISE', price: 'Custom', per: '', pop: 0,
    desc: 'For teams and agencies that need custom volume, SLA, and dedicated support.',
    f: [[1, 'Custom projects + reports'], [1, 'Everything in Studio'], [1, 'SSO / SAML'], [1, 'Dedicated onboarding'], [1, 'SLA guarantee'], [1, 'Custom data retention'], [1, 'Priority support (Slack channel)'], [1, 'Custom integrations'], [1, 'Invoice billing']],
    btn: 'Contact us', ent: 1
  },
];

const ROADMAP = [
  {
    q: 'Q1 2026', lbl: 'NOW', tcls: 'tag-g', items: [
      { icon: '🐞', t: 'Widget v2 — Dev + Client Mode', d: 'Full telemetry in Dev Mode, minimal UX in Client Mode.', cls: 'tag-g', tg: 'done' },
      { icon: '🖥️', t: 'CLI install tool', d: 'npx bugcatcher init with framework auto-detection.', cls: 'tag-g', tg: 'done' },
      { icon: '🧠', t: 'AI Triage (GPT-4o)', d: 'rootCause, suggestedFix, severity from screenshots + logs.', cls: 'tag-g', tg: 'done' },
      { icon: '📦', t: 'PostgreSQL + Neon migration', d: 'Replace db.json with production-grade DB via Prisma.', cls: 'tag-a', tg: 'in progress' },
      { icon: '☁️', t: 'R2/S3 asset upload', d: 'Pre-signed URL upload — eliminates payload timeouts.', cls: 'tag-a', tg: 'in progress' },
      { icon: '🔁', t: 'Inngest retry queue', d: 'Resilient AI triage jobs with exponential backoff.', cls: 'tag-b', tg: 'planned' },
    ]
  },
  {
    q: 'Q2 2026', lbl: 'NEXT', tcls: 'tag-a', items: [
      { icon: '🔔', t: 'Slack webhook', d: 'Auto-post after AI triage with rootCause and severity.', cls: 'tag-b', tg: 'planned' },
      { icon: '🎯', t: 'Linear integration', d: 'Create a pre-filled ticket from any bug report with 1 click.', cls: 'tag-b', tg: 'planned' },
      { icon: '📋', t: 'Trello integration', d: 'Push bug reports as Trello cards with custom board routing.', cls: 'tag-b', tg: 'planned' },
      { icon: '🔗', t: 'Jira integration', d: 'Create Jira issues with epics, labels and custom fields.', cls: 'tag-b', tg: 'planned' },
      { icon: '🔄', t: 'Bug recurrence detection', d: 'Surface recurring patterns using embedding similarity.', cls: 'tag-b', tg: 'planned' },
      { icon: '📊', t: 'Dashboard v2', d: 'Heat score per project + 3-block bug detail view.', cls: 'tag-b', tg: 'planned' },
    ]
  },
  {
    q: 'Q3 2026', lbl: 'LATER', tcls: 'tag-b', items: [
      { icon: '🤖', t: 'Cursor MCP Integration', d: 'BugCatcher MCP server — Cursor reads bug context and fixes directly in editor.', cls: 'tag-p', tg: 'research', cur: 1 },
      { icon: '💻', t: 'Windsurf / Codeium MCP', d: 'Same MCP approach extended to Windsurf IDE.', cls: 'tag-p', tg: 'research', cur: 1 },
      { icon: '📱', t: 'Mobile SDK (React Native)', d: 'Shake-to-report with native screenshot and crash logs.', cls: 'tag-p', tg: 'research' },
      { icon: '🧩', t: 'VS Code Extension', d: 'See open bugs in a sidebar without leaving the editor.', cls: 'tag-p', tg: 'research' },
    ]
  },
  {
    q: 'Q4 2026+', lbl: 'VISION', tcls: 'tag-p', items: [
      { icon: '⚡', t: 'Autonomous fix pipeline', d: 'Bug detected → AI triages → MCP delivers to Cursor → Cursor opens file and applies fix → PR created.', cls: 'tag-p', tg: 'vision', cur: 1 },
      { icon: '🌊', t: 'GitHub Copilot MCP', d: 'Same autonomous fix pipeline extended to Copilot Workspace.', cls: 'tag-p', tg: 'vision' },
      { icon: '📡', t: 'Proactive monitoring', d: 'AI scans reports in real time and pings Slack only for HIGH/CRITICAL.', cls: 'tag-p', tg: 'vision' },
    ]
  },
];

function CursorNS() {
  return (
    <div className="cns">
      <div className="badge badge-p" style={{ marginBottom: 14 }}><span className="bdot" />NEXT STEPS — CURSOR MCP</div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(24px,3vw,40px)', letterSpacing: 1, color: 'var(--p)', marginBottom: 10 }}>THE ZERO-COPY-PASTE BUG FIX PIPELINE</div>
      <p style={{ fontSize: 14, color: '#888', maxWidth: 580, lineHeight: 1.65, marginBottom: 20 }}>
        Cursor supports MCP natively. BugCatcher publishes an MCP server as an npm package. One line in <span style={{ color: '#555', fontFamily: 'Fira Code, monospace' }}>~/.cursor/mcp.json</span> and Cursor can read the full triage — root cause, affected file, suggested fix, console logs — directly in the editor.
      </p>
      <div className="irow" style={{ marginBottom: 28 }}>
        <span className="chip chip-g">✓ Technically viable</span>
        <span className="chip chip-g">✓ Cursor MCP is stable</span>
        <span className="chip chip-b">~ Build time: 1-2 weeks</span>
        <span className="chip chip-b">~ Publishable as npm package</span>
        <span className="chip chip-a">! Requires STUDIO plan</span>
      </div>
      <div className="cnsgrid">
        {[
          { n: '01', t: 'Publish bugcatcher-mcp', d: 'npm package exposing tools: get_open_bugs(), get_bug_detail(id), get_suggested_fix(id)', code: 'npm install -g bugcatcher-mcp' },
          { n: '02', t: 'Add to Cursor config', d: 'One JSON entry in ~/.cursor/mcp.json — done. Cursor discovers the server on restart.', code: '{"bugcatcher":{"command":"bugcatcher-mcp","env":{"BC_KEY":"bc_live_..."}}}' },
          { n: '03', t: 'Cursor reads full context', d: 'rootCause, suggestedFix, affectedComponent, console errors — all available as tool context.', code: '// rootCause: "race condition"\n// file: "pages/dashboard.tsx"\n// fix: "add dep to useEffect"' },
          { n: '04', t: 'Cursor fixes. You review.', d: 'Tell Cursor: "fix the latest HIGH bug". It opens the file, applies the fix, you review the diff.', code: '> fix bug bc_bug_a3f9\n✓ Opening dashboard.tsx\n✓ Applying suggested fix' },
        ].map(s => (
          <div key={s.n} className="cnscard">
            <div className="cnsn">{s.n}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 5 }}>{s.t}</div>
            <p style={{ fontSize: 12, color: 'var(--m)', lineHeight: 1.5, marginBottom: 9 }}>{s.d}</p>
            <div style={{ background: '#040407', border: '1px solid var(--b)', padding: '9px 11px', fontFamily: 'Fira Code, monospace', fontSize: 10.5, color: '#555', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{s.code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [page, setPage] = useState('home');
  /* eslint-disable */
  require('dotenv').config();

  return (
    <>
      <style>{S}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nlogo" onClick={() => setPage('home')}>
          <span style={{ color: 'var(--r)' }}>🐞</span>
          <span>BUG<span style={{ color: 'var(--t)' }}>CATCHER</span></span>
        </div>
        <div className="nlinks">
          {page === 'home' && <><a href="#install">Install</a><a href="#how">How it works</a><a href="#pricing">Pricing</a></>}
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <button className={`nbtn${page === 'roadmap' ? ' on' : ''}`} onClick={() => setPage(p => p === 'roadmap' ? 'home' : 'roadmap')}>Roadmap</button>
          <button className="ncta" onClick={() => setPage('home')}>Start free</button>
        </div>
      </nav>

      {page === 'home' ? <>

        {/* HERO */}
        <section className="sec" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 130, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 55% at 60% 40%,rgba(255,45,45,.04) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,45,45,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,45,.02) 1px,transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)', pointerEvents: 'none' }} />
          <div className="si" style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="hero-in">
              <div>
                <div className="badge badge-r" style={{ marginBottom: 24, animation: 'up .6s ease both', animationFillMode: 'both' }}><span className="bdot" />OPEN BETA — bugcatcher.app</div>
                <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(56px,6vw,90px)', lineHeight: .91, letterSpacing: 2, marginBottom: 20, animation: 'up .6s .1s ease both', animationFillMode: 'both' }}>
                  YOUR <span style={{ color: 'var(--r)' }}>QA</span><br />WITHOUT<br />A QA TEAM.
                </h1>
                <p style={{ fontSize: 16, color: '#888', maxWidth: 440, lineHeight: 1.75, marginBottom: 34, animation: 'up .6s .2s ease both', animationFillMode: 'both' }}>
                  Install in <strong style={{ color: 'var(--t)' }}>60 seconds</strong>. Capture your own bugs and your clients' with full technical context — no QA team, no complex setup.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'up .6s .3s ease both', animationFillMode: 'both' }}>
                  <button className="btn-r">Create free project</button>
                  <button className="btn-o">Live demo →</button>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, animation: 'up .6s .4s ease both', animationFillMode: 'both' }}>
                  {['✓ Free tier — no card', '✓ npx bugcatcher init', '✓ 60 seconds'].map(x => (
                    <span key={x} style={{ fontSize: 12, color: 'var(--m)', fontFamily: 'Fira Code, monospace' }}>
                      <span style={{ color: 'var(--g)' }}>{x[0]}</span>{x.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
              <HeroTerm />
            </div>
          </div>
        </section>

        {/* PAIN */}
        <section className="sec" id="pain" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--b)' }}>
          <div className="si">
            <div className="stag">The problem</div>
            <h2 className="sh">NO QA.<br />NO CONTEXT.<br />NO TIME.</h2>
            <p className="ss">The daily grind of building solo and validating with real users.</p>
            <div className="g2" style={{ marginTop: 48 }}>
              {[
                { n: '01', t: 'Client reports with zero context', d: "\"It broke.\" No URL, no browser, no steps. You spend 2 hours trying to reproduce it.", tag: 'no reproduction possible' },
                { n: '02', t: "You don't have a QA team", d: "Bugs reach production because you build, vibe, and ship. Coverage is chance.", tag: 'zero test coverage' },
                { n: '03', t: 'The stack trace was there. Nobody saw it.', d: "The error was in the console all along. The user doesn't know DevTools. And you weren't there.", tag: 'lost diagnosis' },
                { n: '04', t: 'Multiple products, zero context', d: "You run 3 SaaS in parallel. When a bug comes in, you can't remember which version or feature.", tag: 'zero traceability' },
              ].map(p => (
                <div key={p.n} className="card">
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: 'var(--b2)', lineHeight: 1, marginBottom: 11 }}>{p.n}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 7 }}>{p.t}</div>
                  <p style={{ fontSize: 13, color: 'var(--m)', lineHeight: 1.6 }}>{p.d}</p>
                  <span className="tag tag-r" style={{ marginTop: 10 }}>{p.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTALL */}
        <section className="sec" id="install">
          <div className="si">
            <div className="stag">Installation</div>
            <h2 className="sh">60 SECONDS.<br />LITERALLY.</h2>
            <p className="ss">One command. One API Key. The CLI detects your framework and injects everything automatically.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 52, alignItems: 'start' }} className="iflex">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ISTEPS.map((s, i) => (
                  <div key={i} className={`istep${step === i ? ' on' : ''}`} onClick={() => setStep(i)}>
                    <div className="isn">0{i + 1}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 2 }}>{s.t}</div><div style={{ fontSize: 12, color: 'var(--m)', lineHeight: 1.4 }}>{s.d}</div></div>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: '16px 22px', background: 'var(--bg3)', border: '1px solid var(--b)', borderLeft: '2px solid var(--p)' }}>
                  <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--p)', marginBottom: 5 }}>// or via npm (monorepos)</div>
                  <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 13, color: '#888' }}>npm install <span style={{ color: 'var(--t)' }}>bugcatcher</span> --save-dev</div>
                </div>
              </div>
              <div style={{ position: 'sticky', top: 90 }}>
                <InstTerm step={step} />
                <div style={{ marginTop: 12, padding: '13px 16px', background: 'var(--bg2)', border: '1px solid var(--b)', display: 'flex', gap: 10 }}>
                  <span style={{ color: 'var(--a)', fontSize: 15, flexShrink: 0 }}>⚡</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 3 }}>Native support: Next.js, Vite, Remix, CRA</div>
                    <div style={{ fontSize: 12, color: 'var(--m)', lineHeight: 1.5 }}>CLI patches layout.tsx, index.html or root entry automatically.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="sec" id="how" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--b)' }}>
          <div className="si">
            <div className="stag">How it works</div>
            <h2 className="sh">CLICKED. BROKE.<br />AI DIAGNOSED.</h2>
            <p className="ss">From the user click to root cause diagnosis and a suggested fix.</p>
            <div className="g3" style={{ marginTop: 48 }}>
              {[
                {
                  icon: '📸', n: '01', t: 'Bug reported', d: 'Ctrl+Shift+B (dev) or floating button (client). Widget silently captures the last 45s of activity.',
                  code: ['#555 // auto-captured:', '#60a5fa screenshots[]  ← last 5 clicks', '#60a5fa rrweb_events[] ← DOM replay 45s', '#FF2D2D console_errors ← dev mode', '#FF2D2D network_log[]  ← dev mode']
                },
                {
                  icon: '🧠', n: '02', t: 'AI analyzes everything', d: 'GPT-4o Vision processes images, logs and events in parallel. Reconstructs user journey and identifies root cause.',
                  code: ['#555 // structured AI output:', '#22c55e root_cause:    "race condition"', '#22c55e suggested_fix: "useEffect deps"', '#f59e0b severity:      "HIGH"', '#60a5fa dev_estimate:  "15 min"']
                },
                {
                  icon: '⚡', n: '03', t: 'You fix in minutes', d: 'Dashboard shows AI diagnosis, visual timeline, and rrweb replay. 1 click to create a Linear/Jira ticket.',
                  code: ['#555 // quick actions:', '#22c55e → Open in Linear / Jira', '#22c55e → Copy steps to reproduce', '#60a5fa → Watch rrweb replay', '#f59e0b → Open Clarity session']
                },
              ].map(s => (
                <div key={s.n} className="card2">
                  <div className="cbg">{s.n}</div>
                  <div style={{ fontSize: 22, marginBottom: 16 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t)', marginBottom: 8 }}>{s.t}</div>
                  <p style={{ fontSize: 13, color: 'var(--m)', lineHeight: 1.6 }}>{s.d}</p>
                  <div style={{ marginTop: 14, background: '#040407', border: '1px solid var(--b)', padding: '11px 13px', fontFamily: 'Fira Code, monospace', fontSize: 11, lineHeight: 1.75 }}>
                    {s.code.map((line, i) => { const [c, ...w] = line.split(' '); return <div key={i} style={{ color: c }}>{w.join(' ')}</div> })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MODES */}
        <section className="sec" style={{ background: 'var(--bg)', borderTop: '1px solid var(--b)' }}>
          <div className="si">
            <div className="stag">Two modes</div>
            <h2 className="sh">FOR YOU.<br />FOR YOUR CLIENT.</h2>
            <p className="ss">Same widget. Two completely different behaviors depending on who is clicking.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 48 }} className="mgrid">
              <div className="mcard dev">
                <div className="badge badge-r" style={{ marginBottom: 20 }}>DEV_MODE = TRUE</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: 1, marginBottom: 9 }}>For you during the build</div>
                <p style={{ color: '#777', fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>Ctrl+Shift+B at any moment. Deep technical capture — everything you need to debug a bug you never saw happen.</p>
                <ul className="mlist mf-dev">
                  {['Console errors + full stack trace', 'Network log (XHR/fetch) with status and payload', 'Unhandled JS exceptions (window.onerror)', 'Performance: LCP, CLS, FID at bug moment', 'App state snapshot via BugCatcherStateGetter', 'Manual severity selector (LOW → CRITICAL)', 'Keyboard shortcut Ctrl+Shift+B'].map(f => (
                    <li key={f}><span className="marr" style={{ color: 'var(--r)' }}>→</span>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="mcard cli">
                <div className="badge badge-p" style={{ marginBottom: 20 }}>DEV_MODE = FALSE</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: 1, marginBottom: 9 }}>For your beta user</div>
                <p style={{ color: '#777', fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>One discrete button. One question. Zero jargon. The user sends a message — you receive a full technical report.</p>
                <ul className="mlist">
                  {['Single natural-language question modal', 'Auto screenshot at report click moment', 'Visual timeline of last 5 clicks', 'rrweb replay of last 45 seconds', 'URL, browser, OS, viewport auto-captured', 'Microsoft Clarity session with deeplink', 'Zero technical fields visible to the user'].map(f => (
                    <li key={f}><span className="marr" style={{ color: 'var(--p)' }}>→</span>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CURSOR TEASER */}
        <section className="sec" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--b)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%,rgba(167,139,250,.04) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div className="si" style={{ position: 'relative' }}>
            <div className="stag">Coming Q3 2026</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }} className="hero-in">
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(32px,3.8vw,52px)', lineHeight: .98, letterSpacing: 1, marginBottom: 13 }}>
                  BUG FOUND.<br /><span style={{ color: 'var(--p)' }}>CURSOR</span> FIXES IT.<br />YOU REVIEW THE DIFF.
                </h2>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, marginBottom: 20, maxWidth: 420 }}>
                  BugCatcher ships an MCP server for Cursor. Your editor reads bug context — root cause, affected file, suggested fix, console logs — directly. No tab switching, no copy-paste.
                </p>
                <div className="irow" style={{ marginBottom: 22 }}>
                  <span className="chip chip-g">✓ Technically viable</span>
                  <span className="chip chip-b">~ Q3 2026 target</span>
                </div>
                <button className="btn-o" onClick={() => setPage('roadmap')}>See full roadmap →</button>
              </div>
              <div>
                <div className="mcpbox">
                  <div style={{ color: '#333', marginBottom: 7 }}>// ~/.cursor/mcp.json</div>
                  <div style={{ color: 'var(--p)' }}>{'{'}</div>
                  <div style={{ color: '#888', paddingLeft: 18 }}>"mcpServers": {'{'}</div>
                  <div style={{ color: '#60a5fa', paddingLeft: 36 }}>"bugcatcher": {'{'}</div>
                  <div style={{ color: '#888', paddingLeft: 54 }}>"command": <span style={{ color: '#22c55e' }}>"bugcatcher-mcp"</span></div>
                  <div style={{ color: '#60a5fa', paddingLeft: 36 }}>{'}'}</div>
                  <div style={{ color: '#888', paddingLeft: 18 }}>{'}'}</div>
                  <div style={{ color: 'var(--p)' }}>{'}'}</div>
                  <div style={{ borderTop: '1px solid var(--b)', marginTop: 13, paddingTop: 13 }}>
                    <div style={{ color: '#444', marginBottom: 5 }}>// Cursor now has access to:</div>
                    {['get_open_bugs()', 'get_bug_detail(id)', 'get_suggested_fix(id)'].map(t => (
                      <div key={t} style={{ color: '#22c55e' }}>{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TELEMETRY */}
        <section className="sec" id="telemetry" style={{ background: 'var(--bg)', borderTop: '1px solid var(--b)' }}>
          <div className="si">
            <div className="stag">Telemetry</div>
            <h2 className="sh">THE AI DOESN'T<br />GUESS ANYMORE.</h2>
            <p className="ss">You gave it eyes. Everything GPT-4o needs for a precise diagnosis is already in the payload.</p>
            <div className="g4" style={{ marginTop: 48 }}>
              {[
                { icon: '📸', t: 'Visual Timeline', d: 'Stop-motion of last 5 clicks with red crosshair. html2canvas-pro with CSS Level 4.', b: 'both' },
                { icon: '🎬', t: 'rrweb DOM Replay', d: 'Full DOM replay. Watch exactly what the user saw, frame by frame.', b: 'both' },
                { icon: '🌐', t: 'Network Interceptor', d: 'XHR/fetch with URL, method, status, response time. 4xx/5xx highlighted.', b: 'dev' },
                { icon: '⚠️', t: 'Console Capture', d: '60s circular buffer of console.error/warn/log with relative timestamps.', b: 'dev' },
                { icon: '💥', t: 'JS Error Tracker', d: 'window.onerror + unhandledrejection with full stack trace.', b: 'dev' },
                { icon: '⚡', t: 'Performance Metrics', d: 'LCP, FID, CLS, TTFB at the exact moment of report.', b: 'dev' },
                { icon: '🗂️', t: 'App State Snapshot', d: 'Configure window.BugCatcherStateGetter to ship Redux/Zustand state.', b: 'dev' },
                { icon: '📺', t: 'Clarity Session', d: 'Microsoft Clarity session ID with direct deeplink to video replay.', b: 'both' },
              ].map(x => (
                <div key={x.t} style={{ background: 'var(--bg)', padding: '24px 20px', transition: 'background .2s' }} className="card">
                  <div style={{ fontSize: 17, marginBottom: 12 }}>{x.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 5 }}>{x.t}</div>
                  <p style={{ fontSize: 12, color: 'var(--m)', lineHeight: 1.5 }}>{x.d}</p>
                  <span className="tag" style={x.b === 'dev' ? { color: 'var(--r)', borderColor: 'rgba(255,45,45,.25)', background: 'rgba(255,45,45,.06)', marginTop: 9 } : { color: '#555', borderColor: 'var(--b2)', background: 'var(--bg2)', marginTop: 9 }}>{x.b === 'dev' ? 'DEV ONLY' : 'DEV + CLIENT'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUOTE */}
        <div className="qwrap">
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 96, color: 'rgba(255,45,45,.12)', lineHeight: .8 }}>"</div>
          <div className="qt" style={{ marginTop: -8 }}>The AI doesn't need to <span style={{ color: 'var(--r)' }}>guess</span> anymore.<br />We gave it <span style={{ color: 'var(--r)' }}>eyes</span>.</div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--m)', fontFamily: 'Fira Code, monospace' }}>// bugcatcher.app — vibe coder edition</div>
        </div>

        {/* PRICING */}
        <section className="sec" id="pricing">
          <div className="si">
            <div className="stag">Pricing</div>
            <h2 className="sh">SIMPLE.<br />HONEST.<br />NO SURPRISES.</h2>
            <p className="ss">Permanent free tier. No card to start. Pay only when your product is generating value.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, background: 'var(--b)', border: '1px solid var(--b)', marginTop: 48 }}>
              {PLANS.map(pl => (
                <div key={pl.id} className={`pcard${pl.pop ? ' on' : ''}`} style={pl.ent ? { background: 'var(--bg2)', borderTop: '3px solid var(--p)' } : {}}>
                  {pl.pop && <span className="ppop">MOST POPULAR</span>}
                  <div className="plabel" style={pl.ent ? { color: 'var(--p)', borderColor: 'rgba(167,139,250,.3)', background: 'rgba(167,139,250,.06)' } : {}}>{pl.label}</div>
                  <div>
                    <span className="pamt" style={pl.ent ? { fontSize: 32, lineHeight: 1.3 } : {}}>{pl.price}</span>
                    {pl.per && <span style={{ fontSize: 14, color: 'var(--m)' }}> {pl.per}</span>}
                  </div>
                  <p style={{ marginTop: 12, fontSize: 13, color: 'var(--m)', lineHeight: 1.5, paddingBottom: 16, borderBottom: '1px solid var(--b)' }}>{pl.desc}</p>
                  <ul className="plist">
                    {pl.f.map(([ok, txt], i) => (
                      <li key={i}><span className={ok ? 'py' : 'pn'}>{ok ? '✓' : '✗'}</span><span style={ok ? {} : { color: 'var(--m2)' }}>{txt}</span></li>
                    ))}
                  </ul>
                  <button className="pbtn" style={pl.ent ? { borderColor: 'rgba(167,139,250,.4)', color: 'var(--p)' } : {}}>{pl.btn}</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--bg2)', border: '1px solid var(--b)', display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Fira Code, monospace', fontSize: 10, color: 'var(--m)', letterSpacing: 2 }}>VS MARKET</span>
              {[{ n: 'Sentry Team', p: '$26/mo', note: 'complex for solo use' }, { n: 'LogRocket', p: '$99/mo', note: 'enterprise-first' }, { n: 'Jam.dev', p: '$25/mo', note: 'team-focused' }, { n: 'BugCatcher Builder', p: '$19/mo', note: '← built for you', hl: 1 }].map(c => (
                <div key={c.n}>
                  <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 11, color: 'var(--m)', marginBottom: 2 }}>{c.n}</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 21, color: c.hl ? 'var(--r)' : '#2a2a2a', letterSpacing: 1 }}>{c.p}</div>
                  <div style={{ fontSize: 11, color: c.hl ? 'var(--m)' : 'var(--m2)' }}>{c.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </> : <>

        {/* ROADMAP PAGE */}
        <div style={{ paddingTop: 72, background: 'var(--bg)' }}>
          <div className="sec" style={{ paddingBottom: 48, borderBottom: '1px solid var(--b)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 40% at 15% 60%,rgba(255,45,45,.03) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div className="si" style={{ position: 'relative' }}>
              <div className="stag">Roadmap</div>
              <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(40px,5vw,68px)', lineHeight: .96, letterSpacing: 1, marginBottom: 13 }}>WHERE<br />WE'RE GOING.</h1>
              <p style={{ color: '#777', fontSize: 15, maxWidth: 560, lineHeight: 1.7, marginBottom: 28 }}>
                Built in public. Every item below is something we actually want for ourselves — starting with a Cursor MCP integration that eliminates copy-paste debugging forever.
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ c: 'var(--g)', l: 'Done' }, { c: 'var(--a)', l: 'In Progress' }, { c: 'var(--bl)', l: 'Planned' }, { c: 'var(--p)', l: 'Research' }].map(s => (
                  <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Fira Code, monospace', fontSize: 12, color: 'var(--m)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.c }} />
                    {s.l}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="si" style={{ padding: '0 40px 80px' }}>
            {ROADMAP.map((quarter, qi) => (
              <div key={quarter.q} style={{ marginTop: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 38, letterSpacing: 2 }}>{quarter.q}</div>
                  <span className={`tag ${quarter.tcls}`} style={{ letterSpacing: 1 }}>{quarter.lbl}</span>
                </div>
                <div className={quarter.items.length > 3 ? 'g3' : quarter.items.length > 1 ? 'g3' : 'g3'} style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(quarter.items.length, 3)},1fr)`, gap: 1, background: 'var(--b)', border: '1px solid var(--b)' }}>
                  {quarter.items.map(item => (
                    <div key={item.t} className={`ritem${item.cur ? ' cur' : ''}`}>
                      <div style={{ fontSize: 20, marginBottom: 10 }}>{item.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)', marginBottom: 5 }}>{item.t}</div>
                      <p style={{ fontSize: 12, color: 'var(--m)', lineHeight: 1.55 }}>{item.d}</p>
                      <span className={`tag ${item.cls}`} style={{ marginTop: 10 }}>{item.tg}</span>
                    </div>
                  ))}
                </div>
                {quarter.q === 'Q3 2026' && <CursorNS />}
              </div>
            ))}

            <div style={{ marginTop: 56, padding: 40, background: 'var(--bg2)', border: '1px solid var(--b)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%,rgba(255,45,45,.03) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(22px,3.5vw,44px)', letterSpacing: 1, lineHeight: 1.05, position: 'relative' }}>
                THE END STATE: YOU SAY <span style={{ color: 'var(--r)' }}>FIX THE LATEST BUG.</span><br />
                <span style={{ color: 'var(--p)' }}>CURSOR OPENS THE FILE AND DOES IT.</span>
              </div>
              <p style={{ marginTop: 14, fontSize: 14, color: 'var(--m)', maxWidth: 540, margin: '14px auto 0', lineHeight: 1.7 }}>
                BugCatcher captures → AI triages → MCP delivers to Cursor → Cursor opens the exact file and applies the fix → you review a clean diff.
              </p>
              <div style={{ display: 'flex', gap: 11, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                <button className="btn-r" onClick={() => setPage('home')}>Start building now</button>
                <button className="btn-o">Join the waitlist</button>
              </div>
            </div>
          </div>
        </div>

      </>}

      {/* FOOTER */}
      <footer style={{ padding: '52px 40px 36px', background: 'var(--bg2)', borderTop: '1px solid var(--b)' }}>
        <div className="si" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 3, marginBottom: 10 }}>🐞 BUG<span style={{ color: 'var(--r)' }}>CATCHER</span></div>
            <p style={{ fontSize: 13, color: 'var(--m)', maxWidth: 240, lineHeight: 1.6 }}>The QA for solo builders. Capture bugs without a team.</p>
          </div>
          {[
            { h: 'Product', ls: ['How it works', 'Telemetry', 'Integrations', 'Changelog'] },
            { h: 'Developers', ls: ['Docs', 'CLI Reference', 'API Reference', 'GitHub'] },
            { h: 'Company', ls: ['About', 'Blog', 'Privacy', 'Terms'] },
          ].map(col => (
            <div key={col.h}>
              <div style={{ fontSize: 11, fontFamily: 'Fira Code, monospace', color: 'var(--m)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 13 }}>{col.h}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {col.ls.map(l => <li key={l}><a href="#" style={{ fontSize: 13, color: '#505065', textDecoration: 'none' }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="si" style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--m)', fontFamily: 'Fira Code, monospace' }}>© 2026 BugCatcher — built by <span style={{ color: 'var(--r)' }}>vibe coders</span> for vibe coders</div>
          <div style={{ fontFamily: 'Fira Code, monospace', fontSize: 12, color: '#222' }}>bugcatcher.app</div>
        </div>
      </footer>
    </>
  );
}
