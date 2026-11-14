/* =====================================================================
   Home, Dashboard, Risk sensing
   ===================================================================== */
function pendingCandidates() { return S.runs.filter(r => r.status === 'Awaiting review').flatMap(r => r.candidates.filter(c => !c.decision)); }

/* ---------------- HOME ---------------- */
RENDER.home = () => {
  const above = activeRisks().filter(r => appetite(r) === 'above');
  const mods = [
    ['sensing', 'Risk sensing', 'Agents scan threats, news, regulation, prior audits, interviews and KRIs, then match each signal to the register.', `${pendingCandidates().length} signals awaiting your decision`],
    ['assessment', 'Risk assessment', 'Score inherent risk on your 5×5 criteria, rate controls for residual, and tune appetite on the heat map.', `${activeRisks().filter(r => r.band === 'Unknown').length} residual scores to assess`],
    ['planning', 'Audit planning', 'Turn above-appetite risks into audits, then generate memo, RCM and test scripts step by step.', `${above.filter(r => !covered(r.id)).length} above-appetite risks without coverage`],
    ['fieldwork', 'Fieldwork', 'Test of design and operating effectiveness, with the Dynamic Testing agent reading each sample.', `${S.audits.filter(a => a.status === 'Fieldwork').length} audit in fieldwork`],
    ['issues', 'Issues management', 'Draft issues in 5C format from exceptions and track actions to validated closure.', `${S.issues.filter(isOverdue).length} overdue actions`],
    ['reporting', 'Audit reporting', 'Assemble audit reports and the Audit Committee summary from approved results only.', `${S.audits.filter(a => a.status === 'Reported').length} audits reported this year`]
  ];
  const enabled = Object.values(S.agents).filter(a => a.enabled).length;
  const runs = Object.values(S.agents).reduce((s, a) => s + a.runs, 0);
  return `
  <section class="hero">
    <div>
      <div class="eyebrow" style="color:#7fd6cc">${esc(ORG.industry)} · ${ORG.fy} audit cycle · ${esc(ORG.name)}</div>
      <h1>One connected internal audit lifecycle, run by agents and signed off by auditors.</h1>
      <p>Each module hands its output to the next. Every agent result shows its evidence and confidence, and nothing changes the register, the plan or a conclusion until a reviewer approves it.</p>
      <div class="flow mt"><span class="n">Sense</span><span class="a">→</span><span class="n">Assess</span><span class="a">→</span><span class="n">Plan</span><span class="a">→</span><span class="n">Test</span><span class="a">→</span><span class="n">Issue</span><span class="a">→</span><span class="n">Report</span></div>
    </div>
    <div class="grid g2">
      <div><div class="small" style="color:#7d939b">Agents enabled</div><div style="font-size:28px;font-weight:600;color:#fff">${enabled} / ${AGENTS.length}</div></div>
      <div><div class="small" style="color:#7d939b">Agent runs logged</div><div style="font-size:28px;font-weight:600;color:#fff" class="num">${runs.toLocaleString()}</div></div>
      <div><div class="small" style="color:#7d939b">Decisions waiting for you</div><div style="font-size:28px;font-weight:600;color:#f0b04a">${pendingCandidates().length + S.issues.filter(i => i.status === 'Draft').length}</div></div>
      <div><div class="small" style="color:#7d939b">Above appetite</div><div style="font-size:28px;font-weight:600;color:#f0707a">${above.length}</div></div>
    </div>
  </section>
  <div class="row between mt2" style="margin-bottom:12px"><h2>AI-enabled lifecycle</h2><a class="btn" href="#agents">${icon('bot')} Agent control centre</a></div>
  <div class="grid g3">${mods.map(([id, t, d, s]) => `<div class="card mod" data-go="${id}"><h3>${t}</h3><p class="muted small">${d}</p><div class="stat">${s}</div><div class="go">Enter module →</div></div>`).join('')}</div>
  <div class="card mt2"><div class="grid g3">
    <div><h4>Human gate on every step</h4><p class="small muted">Partial matches, scores, plans, test results and issues are proposals until a named reviewer accepts them.</p></div>
    <div><h4>Lineage you can defend</h4><p class="small muted">Each risk keeps the agent, source, confidence and date that created or changed it. The decision log records who approved what.</p></div>
    <div><h4>Reversible automation</h4><p class="small muted">Auto-merges above the threshold you set can be confirmed or reversed. Agents can be switched off individually.</p></div>
  </div></div>`;
};

/* ---------------- DASHBOARD ---------------- */
RENDER.dashboard = () => {
  const cat = S.ui.dashCat;
  const risks = activeRisks().filter(r => !cat || r.l1 === cat);
  const above = risks.filter(r => appetite(r) === 'above');
  const near = risks.filter(r => appetite(r) === 'near');
  const noCov = above.filter(r => !covered(r.id));
  const openIss = S.issues.filter(i => !String(i.status).startsWith('Closed') && i.status !== 'Draft');
  const overdue = S.issues.filter(isOverdue);
  const kriBreach = S.kris.filter(k => k.value > k.threshold);
  const unconfirmed = activeRisks().filter(r => !r.confirmed);
  const unknownBand = activeRisks().filter(r => r.band === 'Unknown');
  const drafts = S.issues.filter(i => i.status === 'Draft');
  const queue = [
    [pendingCandidates().length, 'Sensing signals need a decision', 'sensing', 'runs', 'warn'],
    [unconfirmed.length, 'New risks to confirm', 'sensing', 'register', 'warn'],
    [unknownBand.length, 'Residual scores to assess', 'assessment', 'scoring', 'warn'],
    [noCov.length, 'Above-appetite risks without an audit', 'planning', 'aiplan', 'crit'],
    [drafts.length, 'Draft issues awaiting approval', 'issues', '', 'info'],
    [overdue.length, 'Overdue management actions', 'issues', '', 'crit']
  ].filter(q => q[0] > 0);
  const top = [...risks].sort((a, b) => currentScore(b) - currentScore(a)).slice(0, 10);
  const byCat = Object.keys(TAXONOMY).map(k => [k, activeRisks().filter(r => r.l1 === k).length]);
  const maxCat = Math.max(...byCat.map(x => x[1]), 1);
  const total = risks.length || 1;
  return `
  <div class="page-head"><div><div class="eyebrow">${ORG.fy} · As of ${ORG.asOf}</div><h1>Executive dashboard</h1><p class="sub">Risks against appetite, KRI signals, issues and the audit plan for this workspace.</p></div>
    <div class="row"><select data-chg="dashCat" aria-label="Category filter" style="width:auto"><option value="">All categories</option>${Object.keys(TAXONOMY).map(k => `<option ${cat === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div></div>
  <div class="grid g4">
    ${kpi('Risk universe', risks.length, `${risks.filter(r => r.confirmed).length} confirmed, ${risks.filter(r => !r.confirmed).length} awaiting confirmation`, 'acc', 'sensing', 'register')}
    ${kpi('Above appetite', above.length, `${noCov.length} without audit coverage`, 'crit', 'assessment', 'appetite')}
    ${kpi('Open issues', openIss.length, `${overdue.length} overdue · ${openIss.filter(i => i.rating === 'High').length} high`, overdue.length ? 'warn' : 'good', 'issues')}
    ${kpi('Breaching KRIs', kriBreach.length, `of ${S.kris.length} indicators monitored`, kriBreach.length ? 'crit' : 'good', 'sensing', 'sources')}
  </div>
  <div class="grid g-dash mt">
    <div class="card"><div class="card-head"><h3>Action queue <span class="pill">${queue.length}</span></h3></div>
      <div class="stack" style="gap:8px">${queue.length ? queue.map(q => `<div class="queue-item ${q[4]}" data-go="${q[2]}" ${q[3] ? `data-tab="${q[3]}"` : ''}><span class="n">${q[0]}</span><span class="small">${q[1]}</span></div>`).join('') : '<div class="empty">Nothing waiting. Agents will add items here.</div>'}</div></div>
    <div class="card flush"><div class="card-head" style="padding:16px 16px 0"><h3>Top risks</h3><a class="small" href="#sensing">Full register →</a></div>
      <div class="table-wrap"><table><thead><tr><th>Score</th><th>Risk</th><th>Category</th><th>Appetite</th><th>Audit</th></tr></thead><tbody>
      ${top.map(r => { const a = appetite(r); return `<tr class="clickable" data-act="openRisk" data-id="${r.id}"><td>${scoreCell(currentScore(r), a)}</td><td><div>${esc(r.title)}</div><div class="id">${r.id}${r.confirmed ? '' : ' · awaiting confirmation'}</div></td><td class="small muted">${esc(r.l1.replace(' Risks', ''))}</td><td>${appPill(a)}</td><td>${covered(r.id) ? `<span class="pill good">${auditsFor(r.id).length}</span>` : `<span class="pill ${a === 'above' ? 'crit' : 'outline'}">gap</span>`}</td></tr>`; }).join('')}
      </tbody></table></div></div>
    <div class="card"><h3>Portfolio health</h3>
      <div class="mt small row between"><span>Risk appetite</span><span class="faint">${above.length} above · ${near.length} near · ${risks.length - above.length - near.length} within</span></div>
      <div class="bar mt" style="margin-top:6px"><span style="width:${above.length / total * 100}%;background:var(--crit)"></span><span style="width:${near.length / total * 100}%;background:var(--warn)"></span><span style="flex:1;background:var(--good)"></span></div>
      <div class="stack mt" style="gap:6px">
        <div class="row between small" style="flex-wrap:nowrap"><span>Coverage gaps: above appetite without audit</span><b class="${noCov.length ? 'score crit' : ''}">${noCov.length}</b></div>
        <div class="row between small" style="flex-wrap:nowrap"><span>KRIs breaching threshold</span><b>${kriBreach.length} / ${S.kris.length}</b></div>
        <div class="row between small"><span>Audits in plan</span><b>${S.audits.length}</b></div>
      </div>
      <h4 class="mt2" style="margin-bottom:8px">Risks by category</h4>
      <div class="stack" style="gap:6px">${byCat.map(([k, n]) => `<div class="row small" style="flex-wrap:nowrap"><span style="width:96px;flex:none">${k.replace(' Risks', '')}</span><div class="bar" style="flex:1"><span style="width:${n / maxCat * 100}%;background:${L1_COLORS[k]}"></span></div><b class="num" style="width:16px;text-align:right">${n}</b></div>`).join('')}</div>
    </div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h3>Key risk indicators</h3><div class="stack mt" style="gap:12px">${S.kris.map(k => { const b = k.value > k.threshold; return `<div class="row between" style="flex-wrap:nowrap"><div><div class="small">${esc(k.name)}</div><div class="id">${k.id} → ${k.risk} · threshold ${k.threshold}</div></div><div class="row" style="flex-wrap:nowrap">${spark(k.trend, 100, 30, b ? 'var(--crit)' : 'var(--accent)')}<b class="score ${b ? 'crit' : ''}" style="min-width:36px;text-align:right">${k.value}</b></div></div>`; }).join('')}</div></div>
    <div class="card"><h3>Audit plan status</h3><div class="table-wrap mt"><table><tbody>${S.audits.map(a => `<tr class="clickable" data-act="openPlanning" data-id="${a.id}"><td><div>${esc(a.title)}</div><div class="id">${a.id} · ${a.risks.length} risks · ${esc(a.source)}</div></td><td>${auditStatusPill(a.status)}</td></tr>`).join('')}</tbody></table></div></div>
  </div>`;
};
CHG.dashCat = el => { S.ui.dashCat = el.value; save(); render(); };
function auditStatusPill(s) { const m = { 'Not started': 'outline', 'Planning': 'info', 'Fieldwork': 'acc', 'Reporting': 'warn', 'Reported': 'good' }; return `<span class="pill ${m[s] || ''}">${s}</span>`; }

/* ---------------- RISK SENSING ---------------- */
RENDER.sensing = () => {
  const tab = S.ui.sensingTab;
  const pend = pendingCandidates().length;
  const head = `<div class="page-head"><div><h1>Risk sensing</h1><p class="sub">Continuous risk register fed by sensing agents. Signals are matched to existing risks before anything reaches the register.</p></div>
    <div class="row"><button class="btn" data-act="addRisk">${icon('plus')} Add risk</button><button class="btn primary" data-act="runSensing">${icon('play')} Run sensing agents</button></div></div>
    ${tabs('sensing', tab, [['register', 'Risk register'], ['runs', 'Review runs', pend], ['sources', 'Sources and KRIs'], ['taxonomy', 'Risk taxonomy']])}`;
  if (tab === 'runs') return head + sensingRuns();
  if (tab === 'sources') return head + sensingSources();
  if (tab === 'taxonomy') return head + sensingTaxonomy();
  return head + sensingRegister();
};

function sensingRegister() {
  const q = S.ui.search.toLowerCase(), cat = S.ui.catFilter;
  const risks = activeRisks().filter(r => (!cat || r.l1 === cat) && (!q || (r.id + r.title + r.desc + r.owner).toLowerCase().includes(q)));
  const autos = S.runs.flatMap(run => run.candidates.filter(c => c.auto && !c.confirmed && c.decision === 'Merged').map(c => ({ ...c, run: run.id })));
  const unconf = activeRisks().filter(r => !r.confirmed);
  const stale = activeRisks().filter(r => r.sources.every(s => s.date < '2026-06-01'));
  const awaiting = S.runs.filter(r => r.status === 'Awaiting review');
  let body = `<div class="grid g4">
    ${kpi('Active', activeRisks().length, 'risks on the register', 'acc')}
    ${kpi('Above appetite', activeRisks().filter(r => appetite(r) === 'above').length, `threshold ${S.settings.threshold}`, 'crit', 'assessment', 'appetite')}
    ${kpi('Stale', stale.length, 'no new evidence since June', stale.length ? 'warn' : '')}
    ${kpi('Pending review', unconf.length + autos.length + pendingCandidates().length, 'confirmations and signal decisions', 'warn')}
  </div>`;
  if (awaiting.length) body += `<div class="banner warn mt">${icon('radar')} ${awaiting.length} run awaiting review with ${pendingCandidates().length} undecided signals<span class="spacer"></span><button class="btn sm" data-act="tab" data-route="sensing" data-tab="runs">Open runs to review →</button></div>`;
  if (autos.length || unconf.length) {
    body += `<div class="card mt" style="border-color:var(--info)"><div class="card-head"><h3 style="color:var(--info)">Recently auto-approved</h3><span class="small faint">${autos.length + unconf.length} pending confirmation</span></div><div class="stack" style="gap:8px">
    ${autos.map(c => { const r = riskById(c.match.risk); return `<div class="row between" style="border:1px solid var(--line);border-radius:6px;padding:10px 12px;flex-wrap:nowrap"><div><div class="small"><span class="id">${c.match.risk}</span> ${esc(r ? r.title : '')}</div><div class="tiny faint">Merged "${esc(c.title)}" (${pct(c.match.score)} match) by auto-merge rule · ${esc(c.agent)} · ${c.run}</div></div><div class="row" style="flex-wrap:nowrap"><button class="btn sm on" data-act="confirmAuto" data-cid="${c.cid}">Confirm</button><button class="btn sm" data-act="reverseAuto" data-cid="${c.cid}">Reverse</button></div></div>`; }).join('')}
    ${unconf.map(r => `<div class="row between" style="border:1px solid var(--line);border-radius:6px;padding:10px 12px;flex-wrap:nowrap"><div><div class="small"><span class="id">${r.id}</span> ${esc(r.title)}</div><div class="tiny faint">Created from "${esc(r.sources[0].agent)}" signal · ${r.identified}</div></div><div class="row" style="flex-wrap:nowrap"><button class="btn sm on" data-act="confirmRisk" data-id="${r.id}">Confirm</button><button class="btn sm" data-act="retireRisk" data-id="${r.id}">Undo</button></div></div>`).join('')}
    </div></div>`;
  }
  body += `<div class="card flush mt"><div class="row" style="padding:12px;gap:8px">
    <input type="search" placeholder="Search risks by title, ID, owner, description" value="${esc(S.ui.search)}" data-inp="search" id="riskSearch" style="flex:2;min-width:180px">
    <select data-chg="catFilter" style="flex:1;min-width:150px" aria-label="Category"><option value="">All categories</option>${Object.keys(TAXONOMY).map(k => `<option ${cat === k ? 'selected' : ''}>${k}</option>`).join('')}</select>
    <span class="small faint">${risks.length} of ${activeRisks().length}</span><button class="btn sm" data-act="exportRegister">${icon('copy')} Copy as CSV</button></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>Risk</th><th>Category / Sub</th><th>Data sources</th><th>Inherent</th><th>Residual</th></tr></thead><tbody>`;
  Object.keys(TAXONOMY).forEach(l1 => {
    const grp = risks.filter(r => r.l1 === l1);
    if (!grp.length) return;
    const res = grp.map(residual).filter(x => x != null);
    const ab = grp.filter(r => appetite(r) === 'above').length;
    body += `<tr class="group"><td colspan="6"><span class="dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${L1_COLORS[l1]};margin-right:6px"></span>${l1} · ${grp.length} risks${res.length ? ` · avg residual ${Math.round(res.reduce((a, b) => a + b, 0) / res.length)}` : ''}${ab ? ` · <span style="color:var(--crit)">${ab} above appetite</span>` : ''}</td></tr>`;
    grp.forEach(r => {
      const a = appetite(r), types = [...new Set(r.sources.map(s => s.type))];
      body += `<tr class="clickable ${a === 'above' ? 'stripe-crit' : a === 'near' ? 'stripe-warn' : ''}" data-act="openRisk" data-id="${r.id}">
        <td class="mono small">${r.id}</td>
        <td style="min-width:260px"><div>${esc(r.title)} ${r.confirmed ? '' : '<span class="pill info">Awaiting confirmation</span>'}</div><div class="small faint" style="max-width:52ch">${esc(r.desc.slice(0, 120))}…</div></td>
        <td class="small">${esc(r.l1.replace(' Risks', ''))}<div class="faint">${esc(r.l2)}</div></td>
        <td><div class="row" style="gap:4px">${types.map(t => `<span class="pill outline">${esc(t)}${r.sources.filter(s => s.type === t).length > 1 ? ` (${r.sources.filter(s => s.type === t).length})` : ''}</span>`).join('')}</div></td>
        <td>${scoreCell(inherent(r), appetiteOf(inherent(r)))}<div class="tiny faint">${a === 'above' ? 'Above' : ''}</div></td>
        <td>${scoreCell(residual(r), a)}</td></tr>`;
    });
  });
  body += `</tbody></table></div></div>`;
  return body;
}
INP.search = el => { S.ui.search = el.value; const pos = el.selectionStart; render(); const n = $('#riskSearch'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } };
CHG.catFilter = el => { S.ui.catFilter = el.value; save(); render(); };
ACT.exportRegister = () => {
  const rows = [['ID', 'Title', 'L1', 'L2', 'Owner', 'Likelihood', 'Impact', 'Inherent', 'Control band', 'Residual', 'Appetite', 'Sources']];
  activeRisks().forEach(r => rows.push([r.id, r.title, r.l1, r.l2, r.owner, r.L, r.I, inherent(r), r.band, residual(r) ?? 'N/A', appetite(r), r.sources.length]));
  copyText(rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n'));
};
ACT.confirmAuto = el => { S.runs.forEach(run => run.candidates.forEach(c => { if (c.cid === el.dataset.cid) { c.confirmed = true; logDecision('Confirmed auto-merge', c.match.risk, c.title); } })); save(); render(); toast('Auto-merge confirmed. The source stays on the register risk.'); };
ACT.reverseAuto = el => {
  S.runs.forEach(run => run.candidates.forEach(c => {
    if (c.cid !== el.dataset.cid) return;
    const r = riskById(c.match.risk);
    if (r) { r.sources = r.sources.filter(s => s.cand !== c.cid && s.ref !== c.source); r.history.unshift({ at: nowStr(), who: ME, what: `Reversed auto-merge of "${c.title}"` }); }
    c.decision = 'Rejected'; c.auto = false; c.confirmed = true;
    logDecision('Reversed auto-merge', c.match.risk, c.title);
  }));
  save(); render(); toast('Auto-merge reversed and logged');
};
ACT.confirmRisk = el => { const r = riskById(el.dataset.id); r.confirmed = true; r.history.unshift({ at: nowStr(), who: ME, what: 'Confirmed on register' }); logDecision('Confirmed new risk', r.id); save(); render(); toast(`${r.id} confirmed`); };
ACT.retireRisk = el => { const r = riskById(el.dataset.id); r.status = 'Retired'; r.history.unshift({ at: nowStr(), who: ME, what: 'Removed from register (undo of auto-create)' }); logDecision('Undid auto-created risk', r.id); save(); render(); toast(`${r.id} removed from the active register`); };

/* ---- Risk drawer ---- */
let drawerRisk = null, drawerTab = 'overview';
ACT.openRisk = el => { drawerRisk = el.dataset.id; drawerTab = 'overview'; renderRiskDrawer(); };
ACT.riskTab = el => { drawerTab = el.dataset.tab; renderRiskDrawer(); };
function renderRiskDrawer() {
  const r = riskById(drawerRisk); if (!r) return;
  const a = appetite(r);
  const t = [['overview', 'Overview'], ['sources', `Sources (${r.sources.length})`], ['scoring', 'Scoring'], ['history', 'History'], ['assistant', 'Assistant']];
  let body = '';
  if (drawerTab === 'overview') {
    const iss = S.issues.filter(i => i.risk === r.id), kris = S.kris.filter(k => k.risk === r.id);
    body = `<h4 class="faint tiny" style="text-transform:uppercase;letter-spacing:.05em">Description</h4><p style="margin:4px 0 14px">${esc(r.desc)}</p>
    <div class="kv"><div><div class="k">Category</div><div class="v">${esc(r.l1)}</div></div><div><div class="k">Subcategory</div><div class="v">${esc(r.l2)}</div></div>
    <div><div class="k">Date identified</div><div class="v">${r.identified}</div></div><div><div class="k">Velocity</div><div class="v">${r.velocity}</div></div>
    <div><div class="k">Owner</div><div class="v">${esc(r.owner)}</div></div><div><div class="k">Control band</div><div class="v">${r.band}</div></div></div>
    <div class="scorebox mt"><div><div class="tiny faint">Inherent</div><div class="big">${inherent(r)}</div><div class="tiny faint">L${r.L} × I${r.I}</div></div>
    <div><div class="tiny faint">Residual</div><div class="big" style="color:var(--${sevClass(a)})">${residual(r) ?? 'N/A'}</div><div class="tiny faint">${r.band}${CONTROL_BANDS.find(b => b.key === r.band).reduction ? ` (−${CONTROL_BANDS.find(b => b.key === r.band).reduction * 100}%)` : ''}</div></div>
    <div><div class="tiny faint">Appetite</div><div style="margin-top:8px">${appPill(a)}</div><div class="tiny faint" style="margin-top:6px">threshold ${S.settings.threshold}</div></div></div>
    <h4 class="mt2">Linked audit projects</h4>${auditsFor(r.id).length ? auditsFor(r.id).map(au => `<div class="row between lineage mt" style="flex-direction:row"><span>${esc(au.title)} <span class="id">${au.id}</span></span>${auditStatusPill(au.status)}</div>`).join('') : `<p class="small faint mt">No audit covers this risk.${a === 'above' ? ' <b style="color:var(--crit)">Coverage gap.</b>' : ''}</p>`}
    ${kris.length ? `<h4 class="mt2">KRIs</h4>${kris.map(k => `<div class="row between small mt"><span>${esc(k.name)}</span><b class="${k.value > k.threshold ? 'score crit' : ''}">${k.value} / ${k.threshold}</b></div>`).join('')}` : ''}
    <div class="row between mt2"><h4>Issues</h4><button class="btn sm" data-act="newIssueFromRisk" data-id="${r.id}">Create remediation issue</button></div>
    ${iss.length ? iss.map(i => `<div class="small mt"><span class="id">${i.id}</span> ${esc(i.title)} ${ratingPill(i.rating)}</div>`).join('') : '<p class="small faint mt">No issues raised for this risk yet.</p>'}`;
  } else if (drawerTab === 'sources') {
    body = r.sources.map(s => `<div class="lineage mt"><div class="row"><span class="pill outline">${esc(s.type)}</span><span class="pill">${pct(s.conf)} conf</span><span class="spacer" style="flex:1"></span><span class="tiny faint">${s.date}</span></div>
      <div><b>Agent:</b> ${esc(s.agent)}</div><div><b>Finding:</b> ${esc(s.finding)}</div><div><b>Source reference:</b> ${/^https?:/.test(s.ref) ? `<a href="${esc(s.ref)}" target="_blank" rel="noopener">${esc(s.ref)}</a> <span class="tiny faint">(demo URL)</span>` : esc(s.ref)}</div></div>`).join('');
  } else if (drawerTab === 'scoring') {
    body = scoringForm(r, 'drawer');
  } else if (drawerTab === 'history') {
    body = `<div class="stack" style="gap:8px">${r.history.map(h => `<div class="lineage"><div class="row between"><b class="small">${esc(h.what)}</b><span class="tiny faint">${h.at}</span></div><div class="tiny faint">${esc(h.who)}</div></div>`).join('')}</div>`;
  } else {
    body = `<p class="small muted">Ask why the risk was flagged, what it rests on and how it compares with the register.</p>
    <div class="row mt"><button class="btn sm" data-act="askRisk" data-q="why">Why was this flagged?</button><button class="btn sm" data-act="askRisk" data-q="evidence">What evidence supports it?</button><button class="btn sm" data-act="askRisk" data-q="compare">How does it compare with the register?</button></div>
    <div id="askOut" class="mt"></div>`;
  }
  openDrawer(`<div class="drawer-head"><div><div class="id">${r.id}</div><h2>${esc(r.title)}</h2><div class="row mt" style="margin-top:6px"><span class="pill good">${r.status}</span>${r.confirmed ? '' : '<span class="pill info">Awaiting confirmation</span>'}<span class="small faint">${esc(r.owner)}</span></div></div><button class="x" data-act="closeDrawer" aria-label="Close">×</button></div>
  <div style="padding:0 18px">${tabs('', drawerTab, t).replace(/data-act="tab"/g, 'data-act="riskTab"')}</div><div class="drawer-body" style="padding-top:0">${body}</div>`);
}
ACT.askRisk = async el => {
  const r = riskById(drawerRisk), q = el.dataset.q, out = $('#askOut');
  out.innerHTML = `<div class="row small faint"><span class="spinner"></span> Assistant is reading the risk record…</div>`;
  const others = activeRisks().filter(x => x.id !== r.id && x.l1 === r.l1);
  const { output } = await AgentRuntime.run('consolidate', { risk: r.id, question: q }, { ms: 700, log: `Assistant answered "${q}" for ${r.id}`, output: () => {
    if (q === 'why') return `${r.id} was flagged by ${r.sources[0].agent} on ${r.sources[0].date}. ${r.sources[0].finding} Its current score is ${currentScore(r)}, which is ${appetite(r)} the appetite threshold of ${S.settings.threshold}.`;
    if (q === 'evidence') return `It rests on ${r.sources.length} source${r.sources.length > 1 ? 's' : ''}: ` + r.sources.map(s => `${s.type} from ${s.agent} (${pct(s.conf)} confidence, ${s.date})`).join('; ') + `. No source is older than ${r.sources.map(s => s.date).sort()[0]}.`;
    return others.length ? `Within ${r.l1}, ${r.id} scores ${currentScore(r)} against ${others.map(o => `${o.id} at ${currentScore(o)}`).join(', ')}. ` + (others.some(o => o.l2 === r.l2) ? `It shares the subcategory ${r.l2} with ${others.filter(o => o.l2 === r.l2).map(o => o.id).join(', ')}; check for overlap before the next run.` : `No other risk shares its subcategory, so there is no duplicate.`) : `It is the only active risk in ${r.l1}.`;
  } });
  out.innerHTML = `<div class="output small">${aiTag('Assistant')} <p style="margin-top:6px">${esc(output)}</p><p class="tiny faint mt">Generated from the register record only. Verify before relying on it.</p></div>`;
};

/* ---- Add risk ---- */
ACT.addRisk = () => {
  const l1s = Object.keys(TAXONOMY);
  openModal('Add risk', `<div class="stack">
    <div class="field"><label for="nr-title">Title</label><input type="text" id="nr-title" placeholder="e.g. Payments fraud via APP scams"></div>
    <div class="field"><label for="nr-desc">Description (cause, event, consequence)</label><textarea id="nr-desc"></textarea></div>
    <div class="grid g2"><div class="field"><label for="nr-l1">Category (L1)</label><select id="nr-l1" data-chg="nrL1">${l1s.map(k => `<option>${k}</option>`).join('')}</select></div>
    <div class="field"><label for="nr-l2">Subcategory (L2)</label><select id="nr-l2">${TAXONOMY[l1s[0]].map(k => `<option>${k}</option>`).join('')}</select></div>
    <div class="field"><label for="nr-L">Likelihood</label><select id="nr-L">${S.scales.L.map(x => `<option value="${x.v}" ${x.v === 3 ? 'selected' : ''}>${x.v} · ${x.name}</option>`).join('')}</select></div>
    <div class="field"><label for="nr-I">Impact</label><select id="nr-I">${S.scales.I.map(x => `<option value="${x.v}" ${x.v === 3 ? 'selected' : ''}>${x.v} · ${x.name}</option>`).join('')}</select></div></div>
    <div class="field"><label for="nr-owner">Owner</label><select id="nr-owner">${Object.values(PEOPLE).map(p => `<option>${esc(p)}</option>`).join('')}</select></div></div>`,
    `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="saveNewRisk">Add to register</button>`);
};
CHG.nrL1 = el => { $('#nr-l2').innerHTML = TAXONOMY[el.value].map(k => `<option>${k}</option>`).join(''); };
ACT.saveNewRisk = () => {
  const title = $('#nr-title').value.trim();
  if (!title) { $('#nr-title').focus(); toast('Add a title first', 'warn'); return; }
  const id = nextId('RISK', S.risks);
  S.risks.push({ id, title, desc: $('#nr-desc').value.trim() || title, l1: $('#nr-l1').value, l2: $('#nr-l2').value, owner: $('#nr-owner').value, L: +$('#nr-L').value, I: +$('#nr-I').value, band: 'Unknown', status: 'Active', confirmed: true, identified: ORG.asOf, velocity: 'Medium',
    sources: [{ type: 'Manual entry', agent: ME, conf: 1, date: ORG.asOf, finding: 'Added manually by internal audit.', ref: 'Manual entry' }], history: [{ at: nowStr(), who: ME, what: 'Added manually' }] });
  logDecision('Added risk manually', id, title); save(); closeModal(); render(); toast(`${id} added to the register`);
};

/* ---- Sensing run (multi-agent) ---- */
ACT.runSensing = async () => {
  const sensors = ['threats', 'scandals', 'regulations', 'market'].filter(id => S.agents[id].enabled);
  if (!S.agents.consolidate.enabled) { toast('Consolidation Agent is off. Turn it on in the Agent control centre.', 'warn'); return; }
  if (!sensors.length) { toast('All sensing agents are switched off', 'warn'); return; }
  const c = consoleModal('Sensing run in progress');
  const pool = [...SIGNAL_POOL].sort(() => Math.random() - 0.5);
  const found = [];
  for (const id of sensors) {
    const a = AGENTS.find(x => x.id === id);
    c.line(a.name, 'reading sources…');
    const picks = pool.filter(p => p.agent === a.name).slice(0, 1);
    const { output } = await AgentRuntime.run(id, { since: 'last run' }, { ms: 650, log: `${picks.length} candidate(s)`, output: () => picks });
    output.forEach(p => found.push(p));
    c.line(a.name, `${Math.floor(Math.random() * 150) + 30} items read · ${output.length} candidate${output.length === 1 ? '' : 's'}`, output.length ? 'ok' : '');
  }
  if (!found.length) found.push(pool[0]);
  c.line('Consolidation Agent', `matching ${found.length} candidates to ${activeRisks().length} register risks…`);
  const { output: cands } = await AgentRuntime.run('consolidate', { candidates: found.length }, { ms: 900, log: `${found.length} candidates routed`, output: () => found.map((p, i) => {
    const score = [0.86, 0.68, 0.44, 0.61, 0.9, 0.38][(i + Math.floor(Math.random() * 6)) % 6];
    return { cid: `CAN-${400 + S.runs.length * 10 + i}`, title: p.title, desc: p.desc, l1: p.l1, l2: p.l2, agent: p.agent, conf: +(0.62 + Math.random() * 0.3).toFixed(2), severity: p.severity,
      match: { risk: p.near, score }, source: `https://signals.example/${p.agent.split(' ')[0].toLowerCase()}/${Date.now() % 100000}`, decision: null };
  }) });
  const am = S.settings.autoMerge;
  cands.forEach(cd => { if (cd.match.score >= am) { cd.decision = 'Merged'; cd.auto = true; applyMerge(cd, true); c.line('Consolidation Agent', `auto-merged "${cd.title}" into ${cd.match.risk} (${pct(cd.match.score)})`, 'ok'); } else if (cd.match.score >= S.settings.reviewFloor) c.line('Consolidation Agent', `partial match ${pct(cd.match.score)} → reviewer decision: "${cd.title}"`, 'wr'); else c.line('Consolidation Agent', `no strong match → proposed as new risk: "${cd.title}"`, 'wr'); });
  S.runs.unshift({ id: `RUN-${ORG.asOf}-${String(S.runs.length + 1).padStart(2, '0')}`, name: 'External research, on-demand run', started: nowStr(), status: cands.some(x => !x.decision) ? 'Awaiting review' : 'Completed', candidates: cands });
  S.ui.sensingTab = 'runs'; save();
  c.line('Orchestrator', 'run complete. Open the review to decide.', 'ok'); c.done('Review signals');
  render();
};
function applyMerge(c, auto) {
  const r = riskById(c.match.risk); if (!r) return;
  r.sources.push({ type: c.agent.includes('Extractor') ? 'Document' : 'External risk', agent: c.agent, conf: c.conf, date: ORG.asOf, finding: c.desc, ref: c.source, cand: c.cid });
  r.history.unshift({ at: nowStr(), who: auto ? 'Consolidation Agent (auto-merge)' : ME, what: `Merged signal "${c.title}" (${pct(c.match.score)} match)` });
}

function sensingRuns() {
  if (!S.runs.length) return '<div class="empty">No runs yet.</div>';
  const run = S.runs.find(r => r.status === 'Awaiting review') || S.runs[0];
  const cnt = k => run.candidates.filter(c => c.decision === k).length;
  const am = S.settings.autoMerge, rf = S.settings.reviewFloor;
  const partial = run.candidates.filter(c => !c.auto && c.match.score >= rf);
  const fresh = run.candidates.filter(c => !c.auto && c.match.score < rf);
  const done = run.candidates.filter(c => c.auto);
  const undecided = run.candidates.filter(c => !c.decision).length;
  const others = S.runs.filter(r => r !== run);
  return `<div class="card"><div class="row between"><div><h3>${esc(run.name)}</h3><div class="id">${run.id} · started ${run.started} · ${run.candidates.length} signals</div></div>${run.status === 'Completed' ? '<span class="pill good">Completed</span>' : '<span class="pill warn">Awaiting review</span>'}</div>
    <div class="row mt"><span class="small muted">Run summary</span><span class="pill good">${cnt('Created')} Created</span><span class="pill acc">${cnt('Merged')} Merged</span><span class="pill warn">${cnt('Monitor')} Monitored</span><span class="pill crit">${cnt('Rejected')} Rejected</span><span class="pill">${undecided} Undecided</span></div>
    <p class="tiny faint mt">Routing rule: match ≥ ${pct(am)} auto-merges, ${pct(rf)} to ${Math.round(am * 100) - 1}% needs your decision, below ${pct(rf)} is proposed as a new risk. Change thresholds in the Agent control centre.</p></div>
  <div class="banner info mt">${icon('bot')} <span>Not sure about a signal? Select <b>Ask the assistant</b> on its card to see why it was flagged and how it compares with the register.</span></div>
  ${partial.length ? `<h3 class="mt2">Possible matches: needs your decision <span class="pill">${partial.length}</span></h3><p class="small faint" style="margin-bottom:10px">Partial match to an existing risk. Merge adds the evidence to that risk; Monitor parks it on the watchlist; Reject discards it with a note.</p><div class="stack">${partial.map(c => candCard(c, run, 'match')).join('')}</div>` : ''}
  ${fresh.length ? `<h3 class="mt2">Proposed new risks <span class="pill">${fresh.length}</span></h3><p class="small faint" style="margin-bottom:10px">No strong match on the register. Create adds a new risk awaiting scoring.</p><div class="stack">${fresh.map(c => candCard(c, run, 'new')).join('')}</div>` : ''}
  ${done.length ? `<h3 class="mt2">Already decided <span class="pill">${done.length}</span></h3><p class="small faint" style="margin-bottom:10px">Auto-merged by the consolidation rule. Listed so you can see everything this run found; reverse from the register if needed.</p><div class="stack">${done.map(c => candCard(c, run, 'done')).join('')}</div>` : ''}
  ${run.status === 'Awaiting review' ? `<div class="card mt row between" style="position:sticky;bottom:0;box-shadow:var(--shadow)"><span class="small">${run.candidates.length - undecided} of ${run.candidates.length} decided</span><div class="row"><button class="btn" data-act="tab" data-route="sensing" data-tab="register">Save progress</button><button class="btn primary" data-act="completeRun" data-run="${run.id}" ${undecided ? 'disabled title="Decide every signal first"' : ''}>Complete review</button></div></div>` : ''}
  ${others.length ? `<h3 class="mt2">Earlier runs</h3><div class="card flush mt"><table><tbody>${others.map(r => `<tr><td class="mono small">${r.id}</td><td>${esc(r.name)}</td><td class="small faint">${r.candidates.length} signals</td><td><span class="pill ${r.status === 'Completed' ? 'good' : 'warn'}">${r.status}</span></td></tr>`).join('')}</tbody></table></div>` : ''}`;
}
function candCard(c, run, kind) {
  const r = riskById(c.match.risk);
  const locked = run.status === 'Completed' || kind === 'done';
  const btn = (k, label) => `<button class="btn sm ${c.decision === k ? 'on' : ''}" data-act="decide" data-run="${run.id}" data-cid="${c.cid}" data-d="${k}" ${locked ? 'disabled' : ''}>${label}</button>`;
  return `<div class="cand ${c.decision ? 'decided' : ''}"><div>
    <div class="row"><b>${esc(c.title)}</b><span class="pill outline">${esc(c.agent)}</span>${c.auto ? '<span class="pill info">Auto-merged</span>' : `<span class="pill warn">${kind === 'new' ? 'New risk proposal' : 'Review match'} · ${pct(c.match.score)}</span>`}<span class="pill">${pct(c.conf)} confidence</span><span class="pill ${c.severity === 'high' ? 'crit' : 'warn'}">${c.severity}</span></div>
    <p class="small muted" style="margin-top:6px">${esc(c.desc)}</p>
    <div class="ev"><span>${esc(c.title)}</span><span class="faint">${/^https?:/.test(c.source) ? esc(c.source.replace(/^https?:\/\//, '')) : esc(c.source)}</span></div>
    <div class="row mt small"><span class="faint">Category</span>${catDot(c.l1)}<span class="pill outline">${esc(c.l2)}</span>${aiTag('AI mapping')}</div>
    ${r ? `<div class="row mt small"><span class="faint">${kind === 'new' ? 'Nearest' : 'Matches'}:</span> <span class="id">${r.id}</span> ${esc(r.title)} <span class="matchbar"><span style="width:${c.match.score * 100}%"></span></span> ${pct(c.match.score)}</div>` : ''}
    ${!locked ? `<div class="field mt"><label for="note-${c.cid}">Approval notes (optional)</label><input type="text" id="note-${c.cid}" value="${esc(c.note || '')}" data-inp="candNote" data-run="${run.id}" data-cid="${c.cid}" placeholder="Reason for your decision"></div>` : ''}
  </div><div class="actions">
    <button class="btn sm" data-act="askCand" data-run="${run.id}" data-cid="${c.cid}">${icon('bot', 12)} Ask the assistant</button>
    ${kind === 'new' ? btn('Created', 'Create') : btn('Merged', 'Merge')}${btn('Monitor', 'Monitor')}${btn('Rejected', 'Reject')}
    ${c.decision ? `<span class="tiny faint">${c.auto ? 'Locked: review complete' : 'Decision: ' + c.decision}</span>` : ''}
  </div></div>`;
}
INP.candNote = el => { const run = S.runs.find(r => r.id === el.dataset.run); const c = run.candidates.find(x => x.cid === el.dataset.cid); c.note = el.value; save(); };
ACT.decide = el => { const run = S.runs.find(r => r.id === el.dataset.run); const c = run.candidates.find(x => x.cid === el.dataset.cid); c.decision = c.decision === el.dataset.d ? null : el.dataset.d; save(); render(); };
ACT.askCand = async el => {
  const run = S.runs.find(r => r.id === el.dataset.run); const c = run.candidates.find(x => x.cid === el.dataset.cid); const r = riskById(c.match.risk);
  openModal(`Assistant · ${esc(c.title)}`, `<div class="row small faint"><span class="spinner"></span> Comparing with the register…</div>`);
  const { output } = await AgentRuntime.run('consolidate', { cid: c.cid }, { ms: 700, log: `Explained routing of ${c.cid}`, output: () => [
    `Why it was flagged: ${c.agent} found "${c.desc}" with ${pct(c.conf)} confidence.`,
    r ? `Closest register risk: ${r.id} ${r.title} (${pct(c.match.score)} similarity). Overlap is on ${c.l2 === r.l2 ? 'the same subcategory (' + r.l2 + ')' : 'the consequence, but the subcategory differs (' + c.l2 + ' vs ' + r.l2 + ')'}.` : 'No close register risk.',
    c.match.score >= S.settings.reviewFloor ? `Suggested decision: ${c.l2 === (r && r.l2) ? 'Merge, since cause and subcategory match.' : 'Monitor or create separately, since the cause differs and merging would hide a distinct exposure.'}` : 'Suggested decision: Create as a new risk if the firm has the same exposure; otherwise Reject with a note.',
    'This is a suggestion. Your decision is recorded in the decision log.'] });
  openModal(`Assistant · ${esc(c.title)}`, `${aiTag('Assistant')}<ul class="small" style="padding-left:18px;margin-top:8px">${output.map(o => `<li style="margin-bottom:6px">${esc(o)}</li>`).join('')}</ul>`, `<button class="btn" data-act="closeModal">Close</button>`);
};
ACT.completeRun = el => {
  const run = S.runs.find(r => r.id === el.dataset.run);
  run.candidates.forEach(c => {
    if (c.auto || c.applied) return;
    if (c.decision === 'Merged') applyMerge(c, false);
    if (c.decision === 'Created') {
      const id = nextId('RISK', S.risks);
      const hi = c.severity === 'high';
      S.risks.push({ id, title: c.title, desc: c.desc, l1: c.l1, l2: c.l2, owner: PEOPLE.cro, L: 3, I: hi ? 4 : 3, band: 'Unknown', status: 'Active', confirmed: true, identified: ORG.asOf, velocity: hi ? 'High' : 'Medium',
        sources: [{ type: 'External risk', agent: c.agent, conf: c.conf, date: ORG.asOf, finding: c.desc, ref: c.source, cand: c.cid }], history: [{ at: nowStr(), who: ME, what: `Created from signal ${c.cid}${c.note ? ': ' + c.note : ''}` }] });
      c.createdId = id;
    }
    if (c.decision === 'Monitor') S.watchlist.push({ ...c, at: nowStr() });
    c.applied = true;
    logDecision(`Sensing decision: ${c.decision}`, c.createdId || c.match.risk, `${c.title}${c.note ? ' · ' + c.note : ''}`);
  });
  run.status = 'Completed'; save(); render(); toast('Review complete. Register updated and decisions logged.');
};

function sensingSources() {
  const groups = [['External research', ['threats', 'scandals', 'regulations', 'market'], 'Daily at 06:00'], ['Documents and interviews', ['pyextract', 'transcript'], 'On upload'], ['Indicators', ['kri'], 'Nightly at 23:00']];
  return `<div class="grid g3">${groups.map(([g, ids, sch]) => `<div class="card"><div class="card-head"><h3>${g}</h3><span class="pill outline">${sch}</span></div><div class="stack" style="gap:10px">${ids.map(id => { const a = AGENTS.find(x => x.id === id), st = S.agents[id]; return `<div class="row between" style="flex-wrap:nowrap"><div><div class="small"><b>${a.name}</b></div><div class="tiny faint">${st.runs} runs · last ${st.last}</div></div><span class="pill ${st.enabled ? 'good' : 'outline'}">${st.enabled ? 'On' : 'Off'}</span></div>`; }).join('')}</div>
    ${g === 'Documents and interviews' ? `<div class="field mt"><label for="docUpload">Upload prior-year reports or interview transcripts</label><input type="file" id="docUpload" multiple data-chg="docUpload" accept=".pdf,.docx,.txt,.md"><span class="hint">Files stay in this browser. In simulated mode the extractor proposes one signal per file.</span></div>` : ''}</div>`).join('')}</div>
  <div class="card mt"><h3>Key risk indicators</h3><div class="table-wrap mt"><table><thead><tr><th>KRI</th><th>Linked risk</th><th>Trend</th><th>Value</th><th>Threshold</th><th>Status</th></tr></thead><tbody>${S.kris.map(k => `<tr><td><div>${esc(k.name)}</div><div class="id">${k.id}</div></td><td class="mono small">${k.risk}</td><td>${spark(k.trend, 90, 26, k.value > k.threshold ? 'var(--crit)' : 'var(--accent)')}</td><td class="score">${k.value}</td><td class="num">${k.threshold}</td><td>${k.value > k.threshold ? '<span class="pill crit">Breaching</span>' : '<span class="pill good">Within</span>'}</td></tr>`).join('')}</tbody></table></div></div>
  ${S.watchlist.length ? `<div class="card mt"><h3>Watchlist (monitored signals)</h3><div class="stack mt" style="gap:6px">${S.watchlist.map(w => `<div class="small"><b>${esc(w.title)}</b> <span class="faint">· ${esc(w.agent)} · ${w.at}</span></div>`).join('')}</div></div>` : ''}`;
}
CHG.docUpload = async el => {
  const files = Array.from(el.files || []); if (!files.length) return;
  const c = consoleModal('Extracting documents');
  const cands = [];
  for (const f of files) {
    const isT = /transcript|interview/i.test(f.name);
    const agentId = isT ? 'transcript' : 'pyextract';
    const a = AGENTS.find(x => x.id === agentId);
    c.line(a.name, `reading ${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)…`);
    const { output } = await AgentRuntime.run(agentId, { file: f.name }, { ms: 800, log: `Extracted 1 signal from ${f.name}`, output: () => ({ cid: `CAN-U${Date.now() % 100000}`, title: `Finding extracted from ${f.name}`, desc: `Demo extraction: ${a.name} found a control weakness statement in ${f.name}. In live mode this holds the extracted text with a page reference.`, l1: 'Operational Risks', l2: TAXONOMY['Operational Risks'][0], agent: a.name, conf: 0.7, severity: 'medium', match: { risk: 'RISK-0102', score: 0.55 }, source: `${f.name}, p.1`, decision: null }) });
    cands.push(output); c.line(a.name, '1 signal proposed', 'ok');
  }
  S.runs.unshift({ id: `RUN-${ORG.asOf}-D${S.runs.length}`, name: 'Document upload', started: nowStr(), status: 'Awaiting review', candidates: cands });
  S.ui.sensingTab = 'runs'; save(); c.done('Review signals'); render();
};
function sensingTaxonomy() {
  return `<div class="card"><h3>Risk taxonomy</h3><p class="small muted" style="margin-top:4px">Upload your organisation's risk universe (L1 / L2). Agents use it to categorise every signal in sensing and assessment.</p><p class="small faint mt">${esc(ORG.name)} · ${Object.keys(TAXONOMY).length} L1 · ${Object.values(TAXONOMY).flat().length} L2 · imported</p></div>
  <div class="grid g3 mt">${Object.entries(TAXONOMY).map(([k, l2]) => `<div class="card"><div class="card-head"><h3><span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${L1_COLORS[k]};margin-right:6px"></span>${k}</h3><span class="pill">${activeRisks().filter(r => r.l1 === k).length} risks</span></div><div class="row" style="gap:6px">${l2.map(x => { const n = activeRisks().filter(r => r.l2 === x).length; return `<span class="pill ${n ? 'acc' : 'outline'}">${esc(x)}${n ? ' · ' + n : ''}</span>`; }).join('')}</div></div>`).join('')}</div>`;
}
