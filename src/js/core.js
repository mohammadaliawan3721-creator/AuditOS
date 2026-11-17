/* =====================================================================
   AuditOS core: state, scoring rules, agent runtime, shell, router.
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pct = x => Math.round(x * 100) + '%';
const storeKey = () => `auditos.v2.${IND}`;
let ME = 'L. Varga (IA Manager)';
const REACHABLE = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20, 25];

function nowStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${ORG.asOf} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function seedState() {
  const runCounts = { threats: 41, scandals: 41, regulations: 41, market: 41, pyextract: 6, transcript: 9, kri: 312, consolidate: 47, scoring: 23, planner: 3, riskstmt: 4, controls: 4, memo: 4, rcm: 4, testscript: 4, dyntest: 2, issue: 5, report: 2 };
  const agents = {};
  AGENTS.forEach(a => { agents[a.id] = { enabled: true, runs: runCounts[a.id] || 0, last: '2026-11-14 06:00', prompt: a.prompt }; });
  const fw = {};
  ['AUD-2027-018'].forEach(id => {
    fw[id] = {};
    const aud = SEED_AUDITS.find(a => a.id === id);
    CONTROLS.filter(c => aud.risks.includes(c.risk)).forEach(c => { fw[id][c.id] = blankFieldwork(c); });
  });
  return {
    v: 1,
    settings: { threshold: 12, nearBuffer: 2, autoMerge: 0.8, reviewFloor: 0.5, runtime: 'simulated' },
    risks: clone(RISKS).map(r => ({ ...r, history: [{ at: r.identified, who: 'System', what: `Created from ${r.sources[0].agent} signal` }] })),
    runs: [clone(SEED_RUN)],
    watchlist: [],
    audits: clone(SEED_AUDITS),
    issues: clone(SEED_ISSUES),
    kris: clone(KRIS),
    agents,
    fieldwork: fw,
    scales: { L: clone(LIKELIHOOD), I: clone(IMPACT), changes: [] },
    reports: {},
    runLog: [
      { at: '2026-11-14 06:00', agent: 'Consolidation Agent', msg: 'Run RUN-2026-11-14: 5 candidates, 2 auto-merged, 3 routed to reviewer', lvl: 'ok' },
      { at: '2026-11-14 05:58', agent: 'Regulations Agent', msg: '27 publications read, 2 candidates', lvl: 'ok' },
      { at: '2026-11-14 05:56', agent: 'Scandals Agent', msg: '214 articles read, 1 candidate, 6 false positives discarded', lvl: 'wr' },
      { at: '2026-11-14 05:55', agent: 'Threats Agent', msg: '96 advisories read, 1 candidate', lvl: 'ok' },
      { at: '2026-11-13 23:00', agent: 'KRI Monitor', msg: `${KRIS[0].id} breach: ${KRIS[0].value} vs threshold ${KRIS[0].threshold}`, lvl: 'wr' }
    ],
    decisions: [
      { at: '2026-11-13 16:40', who: 'S. Haddad (Senior Auditor)', what: 'Applied AI score proposal', ref: 'RISK-0103', detail: 'L4 x I4 = 16' },
      { at: '2026-11-12 10:05', who: ME, what: 'Approved planning step 6 (test scripts)', ref: 'AUD-2027-018', detail: '' },
      { at: '2026-11-10 09:12', who: ME, what: 'Set control band Limited', ref: 'RISK-0103', detail: 'Residual 14' }
    ],
    ui: { sensingTab: 'register', assessTab: 'scoring', planTab: 'audits', planAudit: null, fwAudit: 'AUD-2027-018', fwControl: 'C-06', fwTab: 'tod',
      reportTab: 'audit', reportAudit: 'AUD-2027-018', heatMode: 'inherent', heatSel: null, heatCat: '', appetiteView: 'current', search: '', catFilter: '',
      issueFilter: 'all', agentTab: 'agents', dashCat: '', proposal: {}, planConfig: { above: true, near: 2, fallback: 12, cap: '', alert: false }, groupings: null }
  };
}
function blankFieldwork(c) {
  const n = SAMPLE_SIZES[c.freq] || 5;
  let samples;
  if (c.id === 'C-06') samples = clone(SEED_SAMPLES);
  else samples = Array.from({ length: n }, (_, i) => ({ d: `Sample ${i + 1}`, reviewed: true, esc: true, ev: `${c.id}-evidence-${i + 1}.pdf` }));
  return { tod: null, toe: null, samples, conclusion: null, note: '', issueId: null };
}

let S;
function load() {
  try { const raw = localStorage.getItem(storeKey()); if (raw) { const p = JSON.parse(raw); if (p && p.v === 1) { S = migrate(p); return; } } } catch (e) { /* storage unavailable */ }
  S = migrate(seedState());
}
function save() { try { localStorage.setItem(storeKey(), JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }

/* ---------- Scoring rules ---------- */
const inherent = r => r.L * r.I;
function residual(r) { const b = CONTROL_BANDS.find(x => x.key === r.band); return b && b.reduction != null ? Math.round(inherent(r) * (1 - b.reduction)) : null; }
const currentScore = r => residual(r) ?? inherent(r);
function appetiteOf(score) {
  const t = S.settings.threshold;
  if (score == null) return 'unjudged';
  if (score >= t) return 'above';
  if (score >= t - S.settings.nearBuffer) return 'near';
  return 'within';
}
const appetite = (r, view) => appetiteOf(view === 'inherent' ? inherent(r) : currentScore(r));
const sevClass = a => a === 'above' ? 'crit' : a === 'near' ? 'warn' : 'good';
const appPill = a => `<span class="pill ${sevClass(a)}">${a === 'above' ? 'Above appetite' : a === 'near' ? 'Near' : 'Within'}</span>`;
const activeRisks = () => S.risks.filter(r => r.status === 'Active');
const riskById = id => S.risks.find(r => r.id === id);
const auditById = id => S.audits.find(a => a.id === id);
const auditsFor = rid => S.audits.filter(a => a.risks.includes(rid));
const covered = rid => auditsFor(rid).length > 0;
function isOverdue(i) { return !String(i.status).startsWith('Closed') && i.status !== 'Draft' && i.due < ORG.asOf; }
function issueStatus(i) { return isOverdue(i) ? 'Overdue' : i.status; }
function nextId(prefix, list, key = 'id', pad = 4) {
  const nums = list.map(x => parseInt(String(x[key]).split('-').pop(), 10)).filter(n => !isNaN(n));
  return `${prefix}-${String(Math.max(0, ...nums) + 1).padStart(pad, '0')}`;
}

/* ---------- Logs ---------- */
function logRun(agent, msg, lvl = 'ok') { S.runLog.unshift({ at: nowStr(), agent, msg, lvl }); S.runLog = S.runLog.slice(0, 200); }
function logDecision(what, ref, detail = '') { S.decisions.unshift({ at: nowStr(), who: ME, what, ref, detail }); }

/* =====================================================================
   AGENT RUNTIME
   simulated: returns deterministic demo output after a short delay.
   live (phase 2): POSTs {agent, system, input} to the backend, which
   calls the LLM, validates JSON against the agent's output schema and
   returns {output, usage, traceId}. The UI code does not change.
   ===================================================================== */
const AgentRuntime = {
  endpoint: '/api/agents/run',
  async run(agentId, input, sim) {
    const a = AGENTS.find(x => x.id === agentId);
    const st = S.agents[agentId];
    if (!st.enabled) { toast(`${a.name} is switched off. Turn it on in the Agent control centre.`, 'warn'); throw new Error('agent disabled'); }
    const t0 = performance.now();
    let output;
    if (S.settings.runtime === 'live') {
      const res = await fetch(this.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: a.id, system: st.prompt.replace('{org}', ORG.name), input }) });
      if (!res.ok) throw new Error(`Agent backend returned ${res.status}`);
      output = (await res.json()).output;
    } else {
      await sleep(sim.ms ?? 900);
      output = sim.output();
    }
    st.runs += 1; st.last = nowStr();
    logRun(a.name, sim.log || 'Run completed', 'ok');
    save();
    return { output, ms: Math.round(performance.now() - t0) };
  }
};

/* ---------- Icons ---------- */
const ICONS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  dash: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  radar: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12l6-6',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  calendar: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
  check: 'M4 12l5 5L20 6',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  book: 'M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM4 16a4 4 0 0 1 4-4h10',
  bot: 'M5 9h14v10H5zM12 5v4M9 13h.01M15 13h.01M9 17h6M2 13h3M19 13h3',
  news: 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7M7 16h4',
  scale: 'M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM8 21h8',
  chart: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  pulse: 'M3 12h4l3-8 4 16 3-8h4',
  merge: 'M6 3v6a6 6 0 0 0 6 6h6M6 21v-6M15 12l3 3-3 3',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  table: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  menu: 'M4 6h16M4 12h16M4 18h16',
  play: 'M7 4l13 8-13 8z',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  plus: 'M12 5v14M5 12h14',
  sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  contrast: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 3v18'
};
function icon(name, size = 16) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.spark}"/></svg>`;
}
const aiTag = (t = 'AI') => `<span class="ai-tag">${icon('spark', 10)} ${t}</span>`;

/* ---------- Shell ---------- */
const ROUTES = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dash' },
  { sec: 'Audit lifecycle' },
  { id: 'sensing', label: 'Risk sensing', icon: 'radar', badge: () => pendingCandidates().length + activeRisks().filter(r => !r.confirmed).length },
  { id: 'assessment', label: 'Risk assessment', icon: 'grid', badge: () => activeRisks().filter(r => r.band === 'Unknown').length },
  { id: 'planning', label: 'Audit planning', icon: 'calendar' },
  { id: 'fieldwork', label: 'Fieldwork', icon: 'check' },
  { id: 'requests', label: 'Evidence requests', icon: 'upload', badge: () => (S.requests || []).filter(reqOverdue).length },
  { id: 'issues', label: 'Issues management', icon: 'flag', badge: () => S.issues.filter(i => i.status === 'Draft' || isOverdue(i)).length },
  { id: 'reporting', label: 'Audit reporting', icon: 'book' },
  { sec: 'Governance' },
  { id: 'resources', label: 'Time and budget', icon: 'calendar' },
  { id: 'frameworks', label: 'Framework crosswalk', icon: 'shield' },
  { sec: 'Orchestration' },
  { id: 'agents', label: 'Agent control centre', icon: 'bot' }
];
const RENDER = {};
function currentRoute() { const h = location.hash.replace('#', ''); return ROUTES.find(r => r.id === h) ? h : 'home'; }

function renderShell() {
  document.body.innerHTML = `
  <button class="skip" data-act="skipToMain">Skip to main content</button>
  <div class="app">
    <header class="topbar">
      <button class="btn ghost menu-btn" data-act="toggleRail" aria-label="Open menu">${icon('menu', 18)}</button>
      <div class="brand"><span class="brand-mark"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 18L10 6l4 8 2-4 4 8"/></svg></span>AuditOS<small>Internal audit orchestration</small></div>
      <div class="spacer"></div>
      <span class="mode-pill" title="Agents return demo output. Switch to live in the Agent control centre once the backend exists.">Simulated agents</span>
      <button class="btn ghost sm" data-act="toggleTheme" id="themeBtn" aria-label="Colour theme: ${themePref()}" title="Colour theme: ${themePref()}">${themeIcon()}</button>
      <span class="org-pill" id="orgName">${esc(ORG.name)} · ${ORG.fy}</span>
      <select class="ind-select" data-chg="industry" aria-label="Industry">${INDUSTRIES.map(([k, l]) => `<option value="${k}" ${k === IND ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <select class="ind-select" data-chg="user" aria-label="Signed in as" title="Switch user to test preparer and reviewer segregation of duties">${USERS().map(u => `<option value="${u.key}" ${u.name === ME ? 'selected' : ''}>${esc(u.name)} · ${u.role}</option>`).join('')}</select>
      <span class="avatar" title="${esc(ME)}">${esc(ME.split(' ').slice(0, 2).map(w => w[0]).join(''))}</span>
    </header>
    <nav class="rail" id="rail" aria-label="Modules"></nav>
    <main class="main" id="main" tabindex="-1"></main>
  </div>
  <div class="scrim" id="scrim" data-act="closeAll"></div>
  <aside class="drawer" id="drawer" aria-hidden="true"></aside>
  <div class="modal" id="modal" role="dialog" aria-modal="true"></div>
  <div class="toast" id="toast" role="status"></div>`;
}
function renderRail() {
  const cur = currentRoute();
  $('#rail').innerHTML = ROUTES.map(r => {
    if (r.sec) return `<div class="section">${r.sec}</div>`;
    const b = r.badge ? r.badge() : 0;
    return `<a class="nav ${cur === r.id ? 'active' : ''}" href="#${r.id}" ${cur === r.id ? 'aria-current="page"' : ''}>${icon(r.icon)}<span>${r.label}</span>${b ? `<span class="badge" aria-label="${b} pending">${b}</span>` : ''}</a>`;
  }).join('') + `<div class="foot">Agents propose. Auditors decide.<br>Demo data: ${esc(ORG.name)} is fictional.<br><button class="btn sm ghost" style="padding:4px 0" data-act="resetDemo">Reset demo data</button></div>`;
}
function render() {
  const route = currentRoute();
  renderRail();
  $('#main').innerHTML = RENDER[route]();
  $('#rail').classList.remove('open');
  if (typeof AFTER[route] === 'function') AFTER[route]();
  enhanceA11y($('#main'));
}
/* Clickable non-button elements (cards, rows) become keyboard operable */
function enhanceA11y(root) {
  if (!root) return;
  root.querySelectorAll('[data-act], [data-go]').forEach(el => {
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA|LABEL)$/.test(el.tagName) || el.hasAttribute('tabindex')) return;
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
  });
}
document.addEventListener('keydown', e => {
  const t = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && t.getAttribute && t.getAttribute('role') === 'button' && !/^(BUTTON|A)$/.test(t.tagName)) { e.preventDefault(); t.click(); }
});
/* Theme: system, light or dark */
function themePref() { try { return localStorage.getItem('auditos.theme') || 'system'; } catch (e) { return 'system'; } }
function themeIcon(p = themePref()) { return icon(p === 'dark' ? 'moon' : p === 'light' ? 'sun' : 'contrast', 16); }
const AFTER = {};

/* ---------- Overlays ---------- */
let lastFocus = null;
const overlayOpen = () => $('#drawer').classList.contains('open') || $('#modal').classList.contains('open');
function rememberFocus() { if (!overlayOpen()) lastFocus = document.activeElement; }
function restoreFocus() { if (!overlayOpen() && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); }
function openDrawer(html) { rememberFocus(); const d = $('#drawer'); d.innerHTML = html; d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); $('#scrim').classList.add('open'); enhanceA11y(d); const x = d.querySelector('.x'); if (x) x.focus({ preventScroll: true }); }
function closeDrawer() { const was = $('#drawer').classList.contains('open'); $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); if (!$('#modal').classList.contains('open')) $('#scrim').classList.remove('open'); if (was) restoreFocus(); }
function openModal(title, body, foot = '') {
  rememberFocus();
  const m = $('#modal');
  m.innerHTML = `<div class="modal-head"><h3>${title}</h3><button class="x" data-act="closeModal" aria-label="Close">×</button></div><div class="modal-body">${body}</div>${foot ? `<div class="modal-foot">${foot}</div>` : ''}`;
  m.classList.add('open'); $('#scrim').classList.add('open'); enhanceA11y(m);
  const f = m.querySelector('.modal-foot .btn.primary:not([disabled]), .modal-body input, .modal-body textarea, .x'); if (f) f.focus({ preventScroll: true });
}
function closeModal() { const was = $('#modal').classList.contains('open'); $('#modal').classList.remove('open'); if (!$('#drawer').classList.contains('open')) $('#scrim').classList.remove('open'); if (was) restoreFocus(); }
let toastTimer;
function toast(msg, kind = 'ok') {
  const t = $('#toast');
  t.innerHTML = `<span class="${kind === 'ok' ? 'ok' : ''}">${kind === 'ok' ? '✓' : '!'}</span> ${esc(msg)}`;
  t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
  catch (e) { openModal('Copy manually', `<p class="muted small">Your browser blocked clipboard access. Select the text below and copy it.</p><textarea style="min-height:260px;margin-top:8px" readonly>${esc(text)}</textarea>`); }
}

/* Live console modal used by multi-agent runs */
function consoleModal(title) {
  openModal(title, `<div class="agent-log" id="clog"></div><p class="small faint mt">Simulated run. In live mode the same steps call the agent backend.</p>`, `<button class="btn" data-act="closeModal" id="cdone" disabled>Working…</button>`);
  return {
    line(agent, msg, lvl = '') { const el = $('#clog'); if (!el) return; el.insertAdjacentHTML('beforeend', `<div><span class="t">${nowStr().slice(11)}</span> <span class="ag">${esc(agent)}</span> <span class="${lvl}">${esc(msg)}</span></div>`); el.scrollTop = el.scrollHeight; },
    done(label = 'Close') { const b = $('#cdone'); if (b) { b.disabled = false; b.textContent = label; b.classList.add('primary'); } }
  };
}

/* ---------- Event delegation ---------- */
const ACT = {
  toggleRail: () => $('#rail').classList.toggle('open'),
  skipToMain: () => $('#main').focus(),
  toggleTheme: () => {
    const next = { system: 'light', light: 'dark', dark: 'system' }[themePref()];
    try { localStorage.setItem('auditos.theme', next); } catch (e) { /* storage unavailable */ }
    if (next === 'system') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = next;
    const b = $('#themeBtn'); b.innerHTML = themeIcon(next); b.title = `Colour theme: ${next}`; b.setAttribute('aria-label', b.title);
    toast(next === 'system' ? 'Theme follows your system setting' : `Theme: ${next}`);
  },
  closeAll: () => { closeDrawer(); closeModal(); },
  closeModal: () => closeModal(),
  closeDrawer: () => closeDrawer(),
  go: el => { location.hash = el.dataset.to; if (el.dataset.tab) setTab(el.dataset.to, el.dataset.tab); },
  resetDemo: () => openModal('Reset demo data?', '<p>This clears every decision, score and issue you changed in this browser and reloads the seed data.</p>', '<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="confirmReset">Reset</button>'),
  confirmReset: () => { S = migrate(seedState()); save(); closeModal(); render(); toast('Demo data reset'); }
};
function setTab(route, tab) {
  const key = { sensing: 'sensingTab', assessment: 'assessTab', planning: 'planTab', reporting: 'reportTab', agents: 'agentTab' }[route];
  if (key) S.ui[key] = tab;
  save();
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    const go = e.target.closest('[data-go]');
    if (go) { location.hash = go.dataset.go; if (go.dataset.tab) { setTab(go.dataset.go, go.dataset.tab); render(); } }
    return;
  }
  const fn = ACT[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-chg]'); if (el && CHG[el.dataset.chg]) CHG[el.dataset.chg](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-inp]'); if (el && INP[el.dataset.inp]) INP[el.dataset.inp](el, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeModal(); } });
const CHG = {}; const INP = {};

/* ---------- Small view helpers ---------- */
function tabs(route, active, list) {
  return `<div class="tabs" role="tablist">${list.map(([id, label, badge]) => `<button class="tab ${active === id ? 'active' : ''}" role="tab" data-act="tab" data-route="${route}" data-tab="${id}">${label}${badge ? ` <span class="pill crit" style="margin-left:4px">${badge}</span>` : ''}</button>`).join('')}</div>`;
}
ACT.tab = el => { setTab(el.dataset.route, el.dataset.tab); render(); };
function kpi(label, val, sub, cls = '', go = '', tab = '') {
  return `<div class="card kpi ${cls}" ${go ? `data-go="${go}"` : ''} ${tab ? `data-tab="${tab}"` : ''}><div class="label">${label}</div><div class="val">${val}</div><div class="small faint">${sub}</div></div>`;
}
function scoreCell(score, a) { return score == null ? '<span class="faint mono">N/A</span>' : `<span class="score ${sevClass(a)}">${score}</span>`; }
function spark(vals, w = 120, h = 32, color = 'var(--accent)') {
  const max = Math.max(...vals), min = Math.min(...vals), rng = max - min || 1;
  const pts = vals.map((v, i) => [i * (w - 6) / (vals.length - 1) + 3, h - 4 - (v - min) / rng * (h - 8)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${d} L${last[0]} ${h} L3 ${h} Z" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="${color}"/></svg>`;
}
function catDot(l1) { return `<span class="pill outline"><span class="dot" style="color:${L1_COLORS[l1]}"></span>${esc(l1.replace(' Risks', ''))}</span>`; }

/* ---------- Industry switch ---------- */
CHG.industry = el => {
  save();
  applyDataset(el.value);
  try { localStorage.setItem('auditos.industry', IND); } catch (e) { /* storage unavailable */ }
  load(); closeDrawer(); closeModal();
  setUser(currentUserKey);
  renderShell();
  render(); toast(`Switched to ${ORG.industry}: ${ORG.name}`);
};
