/* =====================================================================
   Risk assessment, Audit planning
   ===================================================================== */
RENDER.assessment = () => {
  const tab = S.ui.assessTab;
  const head = `<div class="page-head"><div><h1>Risk assessment</h1><p class="sub">Score risks against your scoring criteria, visualise them on the heat map and tune appetite.</p></div>
    <button class="btn primary" data-act="aiScoreAll">${icon('spark')} AI-score unassessed risks</button></div>
    ${tabs('assessment', tab, [['scoring', 'Scoring'], ['criteria', 'Scoring criteria'], ['heatmap', 'Heat map'], ['appetite', 'Risk appetite']])}`;
  if (tab === 'criteria') return head + assessCriteria();
  if (tab === 'heatmap') return head + assessHeat();
  if (tab === 'appetite') return head + assessAppetite();
  return head + assessScoring();
};

function assessScoring() {
  const rs = activeRisks().sort((a, b) => currentScore(b) - currentScore(a));
  const above = rs.filter(r => appetite(r) === 'above').length, near = rs.filter(r => appetite(r) === 'near').length;
  return `<div class="grid g4">${kpi('Scored', rs.length, 'inherent score set', 'good')}${kpi('Residual pending', rs.filter(r => r.band === 'Unknown').length, 'control band not rated', 'warn')}${kpi('Above appetite', above, `threshold ${S.settings.threshold}`, 'crit')}${kpi('Near appetite', near, `within ${S.settings.nearBuffer} of threshold`, 'warn')}</div>
  <div class="grid mt" style="grid-template-columns:minmax(0,1fr) 260px">
    <div class="card flush"><div class="card-head" style="padding:14px 16px 0"><h3>Register risks</h3><span class="small faint">${rs.length} total</span></div>
      ${rs.map(r => { const a = appetite(r), p = S.ui.proposal[r.id]; return `<div style="border-top:1px solid var(--line);padding:12px 16px">
        <div class="row between" style="flex-wrap:wrap;align-items:flex-start"><div style="min-width:220px;flex:1"><div><span class="id">${r.id}</span> <b>${esc(r.title)}</b> ${appPill(a)}</div><div class="small faint">${esc(r.l2)} · ${esc(r.l1)} · ${esc(r.owner)}</div></div>
        <div class="row" style="flex-wrap:nowrap;gap:14px"><div style="text-align:center"><div class="tiny faint">Inherent</div>${scoreCell(inherent(r), appetiteOf(inherent(r)))}</div><div style="text-align:center"><div class="tiny faint">Residual</div>${scoreCell(residual(r), a)}</div>
        <button class="btn sm" data-act="aiScore" data-id="${r.id}">${icon('spark', 12)} AI</button><button class="btn sm" data-act="scoreModal" data-id="${r.id}">Score</button><button class="btn sm" data-act="residualModal" data-id="${r.id}">Residual</button></div></div>
        ${p ? proposalPanel(r, p) : ''}</div>`; }).join('')}
    </div>
    <div class="stack"><div class="card"><h4>Inherent heat map</h4><div class="mt">${miniHeat()}</div><a class="small" href="#assessment" data-act="tab" data-route="assessment" data-tab="heatmap">Open →</a></div>
      <div class="card small muted"><h4 style="color:var(--ink)">How scoring works</h4><p class="mt">Inherent = likelihood × impact. Residual = inherent less the control band reduction (Limited 10%, Moderate 30%, Strong 50%), rounded. Unknown leaves residual N/A. Appetite reads the residual, or the inherent while residual is N/A, against the threshold (currently ${S.settings.threshold}).</p></div></div>
  </div>`;
}
function miniHeat() {
  let h = '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:3px">';
  for (let L = 5; L >= 1; L--) for (let I = 1; I <= 5; I++) { const n = activeRisks().filter(r => r.L === L && r.I === I).length; h += `<div class="cell" style="background:${heatColor(L * I)};aspect-ratio:1.4">${n ? `<span class="count" style="width:18px;height:18px;font-size:10px">${n}</span>` : ''}</div>`; }
  return h + '</div>';
}
function heatColor(s) { return s <= 3 ? 'var(--h1)' : s <= 6 ? 'var(--h2)' : s <= 10 ? 'var(--h3)' : s <= 16 ? 'var(--h4)' : 'var(--h5)'; }

function proposeScore(r) {
  const kriB = S.kris.some(k => k.risk === r.id && k.value > k.threshold);
  const L = Math.max(1, Math.min(5, Math.round(2 + r.sources.length * 0.5 + (kriB ? 1 : 0) + (r.velocity === 'High' ? 0.5 : 0))));
  const I = r.I;
  const conf = r.sources.reduce((s, x) => s + x.conf, 0) / r.sources.length;
  const Ld = S.scales.L.find(x => x.v === L), Id = S.scales.I.find(x => x.v === I);
  const counter = r.band === 'Strong' ? ['Controls rated Strong; residual exposure is low even if likelihood is high.'] : kriB ? [] : ['No KRI breach is linked to this risk.'];
  return { L, I, conf: Math.round(conf * 100) / 100,
    why: `Likelihood ${L} (${Ld.name}): ${Ld.desc.toLowerCase()} Evidence: ${r.sources.length} source${r.sources.length > 1 ? 's' : ''}${kriB ? ', including a breaching KRI' : ''}, velocity ${r.velocity.toLowerCase()}. Impact ${I} (${Id.name}): ${Id.desc.toLowerCase()}`,
    evidence: r.sources.map(s => `${s.finding} (${s.agent})`), counter };
}
function proposalPanel(r, p) {
  const same = p.L * p.I === inherent(r);
  return `<div class="output mt" style="background:var(--warn-soft);border-color:transparent">
    <div class="row between"><b>${aiTag()} AI score proposal</b><span class="pill">${pct(p.conf)} confidence</span></div>
    <div class="grid g3 mt"><div><div class="tiny faint">Likelihood</div>${p.L} · ${S.scales.L.find(x => x.v === p.L).name}</div><div><div class="tiny faint">Inherent impact</div>${p.I} · ${S.scales.I.find(x => x.v === p.I).name}</div><div><div class="tiny faint">Proposed inherent score</div><span class="mono">L${p.L} × I${p.I} = ${p.L * p.I}</span><div class="tiny faint">${same ? 'Matches the current inherent score.' : `Current is ${inherent(r)}; applying changes it.`}</div></div></div>
    <p class="small mt">${esc(p.why)}</p>
    <p class="tiny faint mt">The residual comes from the control band you choose; the AI does not propose it.</p>
    <h4>Supporting evidence</h4><ul class="small">${p.evidence.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
    ${p.counter.length ? `<h4>Counter-signals</h4><ul class="small">${p.counter.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : '<p class="small faint">No counter-signals found.</p>'}
    <div class="row mt" style="justify-content:flex-end"><button class="btn sm" data-act="dismissProp" data-id="${r.id}">Dismiss</button><button class="btn sm primary" data-act="applyProp" data-id="${r.id}">Apply to risk</button></div></div>`;
}
ACT.aiScore = async el => {
  const r = riskById(el.dataset.id);
  el.innerHTML = '<span class="spinner"></span>'; el.disabled = true;
  try { const { output } = await AgentRuntime.run('scoring', { risk: r.id }, { ms: 900, log: `Proposed score for ${r.id}`, output: () => proposeScore(r) }); S.ui.proposal[r.id] = output; save(); } catch (e) { /* toast already shown */ }
  render();
};
ACT.aiScoreAll = async () => {
  const targets = activeRisks().filter(r => r.band === 'Unknown' || !r.confirmed);
  const c = consoleModal('Scoring agent: unassessed risks');
  for (const r of targets) { c.line('Scoring Agent', `scoring ${r.id}…`); try { const { output } = await AgentRuntime.run('scoring', { risk: r.id }, { ms: 450, log: `Proposed score for ${r.id}`, output: () => proposeScore(r) }); S.ui.proposal[r.id] = output; c.line('Scoring Agent', `${r.id}: L${output.L} × I${output.I} = ${output.L * output.I} (${pct(output.conf)})`, 'ok'); } catch (e) { c.line('Scoring Agent', 'agent is off', 'wr'); break; } }
  c.line('Orchestrator', `${targets.length} proposals ready. Review each one; nothing was applied.`, 'ok'); c.done(); S.ui.assessTab = 'scoring'; save(); render();
};
ACT.dismissProp = el => { delete S.ui.proposal[el.dataset.id]; logDecision('Dismissed AI score proposal', el.dataset.id); save(); render(); };
ACT.applyProp = el => {
  const r = riskById(el.dataset.id), p = S.ui.proposal[r.id];
  const before = inherent(r); r.L = p.L; r.I = p.I;
  r.history.unshift({ at: nowStr(), who: ME, what: `Applied AI score proposal: ${before} → ${inherent(r)}` });
  logDecision('Applied AI score proposal', r.id, `L${p.L} × I${p.I} = ${p.L * p.I}`);
  delete S.ui.proposal[r.id]; save(); render(); toast(`${r.id} scored ${inherent(r)}`);
};
function scoringForm(r, ctx) {
  return `<div class="stack"><div class="grid g2"><div class="field"><label for="sf-L">Likelihood</label><select id="sf-L" data-chg="sfPreview">${S.scales.L.map(x => `<option value="${x.v}" ${x.v === r.L ? 'selected' : ''}>${x.v} · ${x.name}</option>`).join('')}</select></div>
  <div class="field"><label for="sf-I">Impact</label><select id="sf-I" data-chg="sfPreview">${S.scales.I.map(x => `<option value="${x.v}" ${x.v === r.I ? 'selected' : ''}>${x.v} · ${x.name}</option>`).join('')}</select></div></div>
  <div class="field"><label for="sf-band">Control effectiveness band</label><select id="sf-band" data-chg="sfPreview">${CONTROL_BANDS.map(b => `<option ${b.key === r.band ? 'selected' : ''}>${b.key}</option>`).join('')}</select><span class="hint" id="sf-bandhint">${CONTROL_BANDS.find(b => b.key === r.band).desc}</span></div>
  <div class="field"><label for="sf-note">Rationale (kept in history)</label><input type="text" id="sf-note" placeholder="Why this score"></div>
  <div class="scorebox" id="sf-prev"></div>
  <div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="saveScore" data-id="${r.id}" data-ctx="${ctx}">Save score</button></div></div>`;
}
CHG.sfPreview = () => {
  const L = +$('#sf-L').value, I = +$('#sf-I').value, band = $('#sf-band').value, b = CONTROL_BANDS.find(x => x.key === band);
  const inh = L * I, res = b.reduction != null ? Math.round(inh * (1 - b.reduction)) : null, a = appetiteOf(res ?? inh);
  $('#sf-bandhint').textContent = b.desc;
  $('#sf-prev').innerHTML = `<div><div class="tiny faint">Inherent</div><div class="big">${inh}</div></div><div><div class="tiny faint">Residual</div><div class="big" style="color:var(--${sevClass(a)})">${res ?? 'N/A'}</div></div><div><div class="tiny faint">Appetite</div><div style="margin-top:8px">${appPill(a)}</div></div>`;
};
ACT.scoreModal = el => { const r = riskById(el.dataset.id); openModal(`Score ${r.id}`, `<p class="small muted" style="margin-bottom:10px">${esc(r.title)}</p>${scoringForm(r, 'modal')}`); CHG.sfPreview(); };
ACT.residualModal = ACT.scoreModal;
ACT.saveScore = el => {
  const r = riskById(el.dataset.id), L = +$('#sf-L').value, I = +$('#sf-I').value, band = $('#sf-band').value, note = $('#sf-note').value.trim();
  const before = `L${r.L}×I${r.I} ${r.band}`; r.L = L; r.I = I; r.band = band;
  r.history.unshift({ at: nowStr(), who: ME, what: `Scored L${L} × I${I}, band ${band}${note ? ': ' + note : ''}` });
  logDecision('Updated risk score', r.id, `${before} → L${L}×I${I} ${band}`);
  save(); if (el.dataset.ctx === 'modal') closeModal(); render(); if (el.dataset.ctx === 'drawer') renderRiskDrawer(); toast(`${r.id} saved: residual ${residual(r) ?? 'N/A'}`);
};
document.addEventListener('focusin', e => { if (e.target.id === 'sf-L' && $('#sf-prev') && !$('#sf-prev').innerHTML) CHG.sfPreview(); });

function assessCriteria() {
  return `<div class="grid" style="grid-template-columns:220px minmax(0,1fr)">
  <div class="card"><div class="lineage" style="border-color:var(--accent)"><b class="small">Default scale</b><span class="tiny faint">Every category without a scale of its own</span></div><h4 class="mt">Categories</h4><div class="stack mt" style="gap:8px">${Object.keys(TAXONOMY).map(k => `<div class="small">${k}<div class="tiny faint">Default scale · not configured</div></div>`).join('')}</div></div>
  <div class="card"><div class="card-head"><div><h3>Default scale</h3><p class="small faint">Likelihood and impact levels used by the scoring form, the Scoring Agent and the heat map.</p></div><button class="btn primary" data-act="editScales">Edit scales</button></div>
  <div class="grid g2"><div><h4 style="margin-bottom:8px">Likelihood scale</h4><div class="stack" style="gap:6px">${S.scales.L.map(x => `<div class="lineage" style="background:${heatColor(x.v * x.v)};border-color:transparent;color:var(--ink)"><b class="small">${x.v} · ${esc(x.name)}</b><span class="tiny">${esc(x.desc)}</span></div>`).join('')}</div></div>
  <div><h4 style="margin-bottom:8px">Impact scale</h4><div class="stack" style="gap:6px">${S.scales.I.map(x => `<div class="lineage" style="background:${heatColor(x.v * x.v)};border-color:transparent;color:var(--ink)"><b class="small">${x.v} · ${esc(x.name)}</b><span class="tiny">${esc(x.desc)}</span></div>`).join('')}</div></div></div>
  <h4 class="mt2">Changes to scoring scales</h4>${S.scales.changes.length ? S.scales.changes.map(c => `<div class="small mt">${c.at} · ${esc(c.who)} · ${esc(c.what)}</div>`).join('') : '<p class="small faint mt">No changes yet.</p>'}</div></div>`;
}
ACT.editScales = () => {
  const block = (k, arr) => arr.map(x => `<div class="field"><label for="sc-${k}${x.v}">${k === 'L' ? 'Likelihood' : 'Impact'} ${x.v} · ${esc(x.name)}</label><input type="text" id="sc-${k}${x.v}" value="${esc(x.desc)}"></div>`).join('');
  openModal('Edit scoring scales', `<p class="small muted">Only an organisation admin can change scales in production. Changes are logged.</p><div class="stack mt">${block('L', S.scales.L)}${block('I', S.scales.I)}</div>`, `<button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="saveScales">Save scales</button>`);
};
ACT.saveScales = () => {
  let n = 0;
  ['L', 'I'].forEach(k => S.scales[k].forEach(x => { const v = $(`#sc-${k}${x.v}`).value.trim(); if (v && v !== x.desc) { x.desc = v; n++; } }));
  if (n) { S.scales.changes.unshift({ at: nowStr(), who: ME, what: `${n} level description${n > 1 ? 's' : ''} edited` }); logDecision('Edited scoring scales', 'Scales', `${n} changes`); }
  save(); closeModal(); render(); toast(n ? 'Scales saved' : 'No changes');
};

function assessHeat() {
  const mode = S.ui.heatMode, cat = S.ui.heatCat;
  const rs = activeRisks().filter(r => !cat || r.l1 === cat);
  const pos = r => { if (mode === 'inherent') return [r.L, r.I]; const res = residual(r); if (res == null) return [r.L, r.I]; const b = CONTROL_BANDS.find(x => x.key === r.band); return [Math.max(1, Math.round(r.L * (1 - b.reduction))), r.I]; };
  const t = S.settings.threshold;
  let g = `<div class="heat"><div></div>${S.scales.I.map(x => `<div class="hd">${x.name}</div>`).join('')}`;
  for (let L = 5; L >= 1; L--) {
    g += `<div class="rl">${S.scales.L[L - 1].name}</div>`;
    for (let I = 1; I <= 5; I++) {
      const here = rs.filter(r => { const p = pos(r); return p[0] === L && p[1] === I; });
      const sel = S.ui.heatSel === `${L}-${I}`;
      g += `<div class="cell ${L * I >= t ? 'above' : ''} ${here.length ? 'has' : ''} ${sel ? 'sel' : ''}" style="background:${heatColor(L * I)}" ${here.length ? `data-act="heatCell" data-k="${L}-${I}"` : ''} title="L${L} × I${I} = ${L * I}">${here.length ? `<span class="count">${here.length}</span>` : L * I}</div>`;
    }
  }
  g += `<div></div><div class="hd" style="grid-column:2/-1;text-align:center;padding-top:6px">Impact →</div></div>`;
  const sel = S.ui.heatSel ? rs.filter(r => { const p = pos(r); return `${p[0]}-${p[1]}` === S.ui.heatSel; }) : [];
  return `<div class="row between"><div class="row"><span class="small muted">Mode</span><button class="btn sm ${mode === 'inherent' ? 'on' : ''}" data-act="heatMode" data-m="inherent">Inherent</button><button class="btn sm ${mode === 'residual' ? 'on' : ''}" data-act="heatMode" data-m="residual">Residual</button></div>
    <select data-chg="heatCat" style="width:auto" aria-label="Category"><option value="">All categories</option>${Object.keys(TAXONOMY).map(k => `<option ${cat === k ? 'selected' : ''}>${k}</option>`).join('')}</select></div>
  <div class="grid g3 mt">${kpi('On grid', rs.length, 'risks plotted')}${kpi('Above appetite', rs.filter(r => (mode === 'inherent' ? inherent(r) : currentScore(r)) >= t).length, `dashed cells score ${t} or more`, 'crit')}${kpi('Unscored', 0, 'every risk has an inherent score')}</div>
  <div class="grid mt" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)"><div class="card"><div class="row" style="align-items:stretch;flex-wrap:nowrap"><div class="tiny faint" style="writing-mode:vertical-rl;transform:rotate(180deg);text-align:center">Likelihood →</div><div style="flex:1;overflow-x:auto">${g}</div></div>
    <p class="tiny faint mt">${mode === 'residual' ? 'Residual mode moves rated risks down the likelihood axis by the control band reduction; unrated risks stay at inherent.' : 'Inherent position before controls.'}</p></div>
  <div class="card"><h4>${sel.length ? `Cell L${S.ui.heatSel.split('-')[0]} × I${S.ui.heatSel.split('-')[1]}` : 'Pick a cell'}</h4>${sel.length ? `<div class="stack mt" style="gap:8px">${sel.map(r => `<div class="lineage clickable" data-act="openRisk" data-id="${r.id}" style="cursor:pointer"><span class="id">${r.id}</span><b class="small">${esc(r.title)}</b><span class="tiny faint">${esc(r.l1)} · current ${currentScore(r)}</span></div>`).join('')}</div>` : '<p class="small faint mt">Click a populated cell to see the risks it holds.</p>'}</div></div>`;
}
ACT.heatMode = el => { S.ui.heatMode = el.dataset.m; S.ui.heatSel = null; save(); render(); };
ACT.heatCell = el => { S.ui.heatSel = S.ui.heatSel === el.dataset.k ? null : el.dataset.k; save(); render(); };
CHG.heatCat = el => { S.ui.heatCat = el.value; S.ui.heatSel = null; save(); render(); };

function assessAppetite() {
  const v = S.ui.appetiteView, t = S.settings.threshold;
  const grp = k => activeRisks().filter(r => appetite(r, v) === k).sort((a, b) => (v === 'inherent' ? inherent(b) - inherent(a) : currentScore(b) - currentScore(a)));
  const list = (k, title, cls) => { const g = grp(k); return `<div class="card flush mt"><div class="card-head" style="padding:14px 16px 0"><h3 style="color:var(--${cls})">${title}</h3><span class="pill">${g.length}</span></div>${g.length ? `<table><tbody>${g.map(r => `<tr class="clickable" data-act="openRisk" data-id="${r.id}"><td class="mono small">${r.id}</td><td>${esc(r.title)}</td><td class="small faint">${esc(r.l1.replace(' Risks', ''))}</td><td class="small ${v === 'inherent' ? '' : 'faint'}">Inherent <b>${inherent(r)}</b></td><td class="small ${v === 'current' && residual(r) != null ? '' : 'faint'}">Residual <b>${residual(r) ?? 'N/A'}</b></td></tr>`).join('')}</tbody></table>` : `<p class="small faint" style="padding:0 16px 14px">None.</p>`}</div>`; };
  return `<div class="card"><h3>Composite-score threshold</h3><p class="small muted">A score at or above this value is above appetite. It drives the register pill, the dashed heat-map cells, the planning generator and the dashboard.</p>
    <div class="row mt" style="flex-wrap:nowrap"><span class="mono small">1</span><input type="range" min="1" max="25" value="${t}" data-chg="threshold" aria-label="Appetite threshold" id="thr"><span class="mono small">25</span><span class="small">Threshold</span><input type="number" min="1" max="25" value="${t}" data-chg="threshold" style="width:64px" aria-label="Threshold value"></div>
    <div class="row mt"><label class="small" for="nb">Near buffer</label><input type="number" id="nb" min="0" max="5" value="${S.settings.nearBuffer}" data-chg="nearBuffer" style="width:64px"><span class="tiny faint">Risks within this many points below the threshold are "near".</span></div>
    <p class="tiny faint mt">On a 5×5 scale scores can only be ${REACHABLE.join(', ')}. The threshold snaps up to the next reachable score. Only an organisation admin can change it in production; changes are logged.</p></div>
  <div class="row mt"><span class="small muted">View</span><button class="btn sm ${v === 'current' ? 'on' : ''}" data-act="appView" data-v="current">Current</button><button class="btn sm ${v === 'inherent' ? 'on' : ''}" data-act="appView" data-v="inherent">Inherent exposure</button><span class="small faint">${v === 'current' ? 'Judged on residual once controls are rated, otherwise inherent.' : 'Judged on the inherent score alone: exposure before controls. A well-controlled risk can be above appetite here and within it on the register.'}</span></div>
  <div class="grid g4 mt">${kpi('Above', grp('above').length, '', 'crit')}${kpi('Near', grp('near').length, '', 'warn')}${kpi('Within', grp('within').length, '', 'good')}${kpi('Not judged', 0, '')}</div>
  ${list('above', 'Above appetite', 'crit')}${list('near', `Near appetite (within ${S.settings.nearBuffer} of threshold)`, 'warn')}${list('within', 'Within appetite', 'good')}`;
}
CHG.threshold = el => { let v = Math.max(1, Math.min(25, +el.value || 1)); v = REACHABLE.find(x => x >= v) || 25; if (v !== S.settings.threshold) { logDecision('Changed appetite threshold', 'Settings', `${S.settings.threshold} → ${v}`); S.settings.threshold = v; } save(); render(); };
CHG.nearBuffer = el => { const v = Math.max(0, Math.min(5, +el.value || 0)); logDecision('Changed near buffer', 'Settings', `${S.settings.nearBuffer} → ${v}`); S.settings.nearBuffer = v; save(); render(); };
ACT.appView = el => { S.ui.appetiteView = el.dataset.v; save(); render(); };

/* ---------------- AUDIT PLANNING ---------------- */
function stmt(r) { const s = RSTMT[r.id]; return s ? `Because ${s[0]}, ${s[1]} may occur, leading to ${s[2]}.` : `Because ${r.desc.charAt(0).toLowerCase() + r.desc.slice(1).replace(/\.$/, '')}, the risk "${r.title.toLowerCase()}" may crystallise, leading to financial, regulatory or customer impact.`; }
const STEPS = [[1, 'Ingest documentation', null], [2, 'Generate risk statements', 'riskstmt'], [3, 'Generate controls', 'controls'], [4, 'Generate audit planning memo', 'memo'], [5, 'Generate risk and controls matrix (RCM)', 'rcm'], [6, 'Generate control test scripts', 'testscript']];
const auditControls = a => CONTROLS.filter(c => a.risks.includes(c.risk));

RENDER.planning = () => {
  const tab = S.ui.planTab;
  if (tab === 'assistant' && S.ui.planAudit && auditById(S.ui.planAudit)) return planningAssistant(auditById(S.ui.planAudit));
  const head = `<div class="page-head"><div><h1>Audit planning</h1><p class="sub">Manage audits, generate a coverage plan from the register, and build planning documents step by step.</p></div></div>
    ${tabs('planning', tab === 'assistant' ? 'audits' : tab, [['audits', 'Manage audits'], ['aiplan', 'AI plan']])}`;
  return head + (tab === 'aiplan' ? aiPlan() : manageAudits());
};
function manageAudits() {
  return `<div class="card flush"><div class="table-wrap"><table><thead><tr><th>Audit</th><th>Risks</th><th>Status</th><th>Lead</th><th>Dates</th><th>Planning</th><th></th></tr></thead><tbody>
  ${S.audits.map(a => `<tr><td><div><b>${esc(a.title)}</b></div><div class="id">${a.id} · ${esc(a.source)}</div></td><td class="small">${a.risks.map(id => `<div><span class="id">${id}</span> ${riskById(id) ? appPill(appetite(riskById(id))) : ''}</div>`).join('')}</td><td>${auditStatusPill(a.status)}</td><td class="small">${esc(a.lead)}</td><td class="small mono">${a.start}<br>${a.end}</td>
  <td class="small"><div class="bar" style="width:90px"><span style="width:${a.planning.approved.length / 6 * 100}%;background:var(--accent)"></span></div>${a.planning.approved.length} of 6 steps</td><td><button class="btn sm" data-act="openPlanning" data-id="${a.id}">Planning assistant →</button></td></tr>`).join('')}
  </tbody></table></div></div>`;
}
ACT.openPlanning = el => { S.ui.planAudit = el.dataset.id; S.ui.planTab = 'assistant'; S.ui.planView = null; save(); if (location.hash !== '#planning') location.hash = 'planning'; else render(); };

function planSelection() {
  const c = S.ui.planConfig, fb = +c.fallback || S.settings.threshold, nb = +c.near || 0;
  const rs = activeRisks();
  const above = rs.filter(r => currentScore(r) >= fb);
  const near = nb > 0 ? rs.filter(r => currentScore(r) < fb && currentScore(r) >= fb - nb) : [];
  let pool = [...(c.above ? above : []), ...near];
  const excluded = pool.filter(r => covered(r.id));
  pool = pool.filter(r => !covered(r.id)).sort((a, b) => currentScore(b) - currentScore(a));
  if (c.cap) pool = pool.slice(0, +c.cap);
  return { above, near, excluded, selected: pool };
}
function aiPlan() {
  const c = S.ui.planConfig, sel = planSelection(), g = S.ui.groupings;
  return `<div class="card"><h3>AI plan generator</h3><p class="small muted" style="margin-top:4px">Builds a coverage plan from the register. The Plan Generator picks risks above (and optionally near) appetite, skips risks an audit already covers, groups the rest by L1 domain and proposes one audit per group.</p></div>
  <div class="card mt"><div class="row"><span class="pill acc">1</span><h3>Configuration</h3><span class="small faint">Defaults until you change one.</span></div>
    <div class="grid g2 mt">
      <label class="lineage" style="flex-direction:row;gap:10px;align-items:flex-start"><input type="checkbox" ${c.above ? 'checked' : ''} data-chg="pc" data-k="above" id="pc-above"><span><b class="small">Include above-appetite risks</b><br><span class="tiny faint">Always recommended. These risks need coverage.</span></span></label>
      <div class="field lineage"><label for="pc-near">Near-threshold buffer</label><span class="hint">Also include risks within N points below the threshold (0 to skip).</span><input type="number" id="pc-near" min="0" max="5" value="${c.near}" data-chg="pc" data-k="near" style="width:90px"></div>
      <div class="field lineage"><label for="pc-fb">Appetite threshold (fallback)</label><span class="hint">Used when a risk has no category policy. Default matches the appetite page (${S.settings.threshold}).</span><input type="number" id="pc-fb" min="1" max="25" value="${c.fallback}" data-chg="pc" data-k="fallback" style="width:90px"></div>
      <div class="field lineage"><label for="pc-cap">Max risks (cap)</label><span class="hint">Hard ceiling on risks in the plan. Blank for no cap.</span><input type="number" id="pc-cap" min="1" value="${c.cap}" placeholder="No cap" data-chg="pc" data-k="cap" style="width:90px"></div>
    </div>
    <label class="lineage mt" style="flex-direction:row;gap:10px"><input type="checkbox" ${c.alert ? 'checked' : ''} data-chg="pc" data-k="alert" id="pc-alert"><span class="small">Alert me when this plan selects risks no audit covers</span></label></div>
  <div class="card mt"><div class="row between"><div class="row"><span class="pill acc">2</span><h3>Risk selection</h3></div><button class="btn primary" data-act="proposeGroups" ${sel.selected.length ? '' : 'disabled'}>${icon('spark')} Propose project groupings</button></div>
    <div class="grid mt" style="grid-template-columns:repeat(4,minmax(0,1fr))">${kpi('Selected', sel.selected.length, 'go into the plan', 'acc')}${kpi('Above appetite', sel.above.length, `score ≥ ${c.fallback}`, 'crit')}${kpi('Near threshold', sel.near.length, `within ${c.near}`, 'warn')}${kpi('Excluded', sel.excluded.length, 'already covered by an audit')}</div>
    ${sel.excluded.length ? `<p class="tiny faint mt">Excluded: ${sel.excluded.map(r => `${r.id} (in ${auditsFor(r.id).map(a => a.id).join(', ')})`).join('; ')}</p>` : ''}</div>
  ${g ? `<div class="card mt"><div class="row between"><div class="row"><span class="pill acc">3</span><h3>Proposed audits (${g.length})</h3><span class="small faint">${g.reduce((s, x) => s + x.risks.length, 0)} risks across ${g.length} groups</span>${aiTag('AI named')}</div><button class="btn primary" data-act="generateAudits" ${g.length ? '' : 'disabled'}>Generate ${g.length} audit${g.length === 1 ? '' : 's'}</button></div>
    <div class="stack mt">${g.map((x, gi) => `<div class="lineage" style="background:var(--surface-2);border-color:transparent;padding:12px"><div class="row between"><b>${esc(x.title)}</b><span class="small"><span class="faint">${x.risks.length} risk${x.risks.length > 1 ? 's' : ''}</span> · <b>${x.risks.filter(id => appetite(riskById(id)) === 'above').length} above</b></span></div><p class="tiny faint">${esc(x.scope)}</p>
      ${x.risks.map(id => { const r = riskById(id); return `<div class="row between" style="background:var(--surface);border-radius:4px;padding:7px 10px;flex-wrap:nowrap"><span class="small"><span class="id">${id}</span> ${esc(r.title)} ${appPill(appetite(r))} <span class="faint tiny">current ${currentScore(r)}</span></span><button class="btn sm ghost" data-act="dropRisk" data-g="${gi}" data-id="${id}">Drop</button></div>`; }).join('')}</div>`).join('')}</div></div>` : ''}`;
}
CHG.pc = el => { const k = el.dataset.k; S.ui.planConfig[k] = el.type === 'checkbox' ? el.checked : el.value; S.ui.groupings = null; save(); render(); };
ACT.proposeGroups = async () => {
  const sel = planSelection().selected;
  try {
    const { output } = await AgentRuntime.run('planner', { risks: sel.map(r => r.id) }, { ms: 900, log: `Grouped ${sel.length} risks`, output: () => {
      const by = {}; sel.forEach(r => (by[r.l1] = by[r.l1] || []).push(r.id));
      return Object.entries(by).map(([l1, ids]) => ({ l1, title: L1_AUDIT[l1][0], scope: L1_AUDIT[l1][1], risks: ids }));
    } });
    S.ui.groupings = output; save(); render();
  } catch (e) { /* agent off */ }
};
ACT.dropRisk = el => { const g = S.ui.groupings[+el.dataset.g]; g.risks = g.risks.filter(x => x !== el.dataset.id); if (!g.risks.length) S.ui.groupings.splice(+el.dataset.g, 1); save(); render(); };
ACT.generateAudits = () => {
  const made = S.ui.groupings.map((g, i) => {
    const id = nextId('AUD-2027', S.audits, 'id', 3);
    const a = { id, title: g.title, l1: g.l1, risks: g.risks, status: 'Planning', lead: '[to assign]', start: '2027-0' + (2 + i) + '-01', end: '2027-0' + (3 + i) + '-15', source: 'AI plan', planning: { step: 1, approved: [], generated: [] } };
    S.audits.push(a); logDecision('Generated audit from AI plan', id, `${g.title}: ${g.risks.join(', ')}`); return a;
  });
  S.ui.groupings = null; S.ui.planTab = 'audits'; save(); render(); toast(`${made.length} audits created and linked to their risks`);
};

/* ---- Planning assistant ---- */
function planningAssistant(a) {
  const p = a.planning; p.generated = p.generated || [];
  const cur = Math.min(p.step, 7), view = S.ui.planView || cur;
  const phase = cur === 1 ? 1 : cur <= 6 ? 2 : 3;
  const ph = (n, t, d) => `<div class="phase ${phase > n ? 'done' : phase === n ? 'cur' : ''}"><span class="n">${phase > n ? '✓' : n}</span><div><b class="small">${t}</b><div class="tiny faint">${d}</div></div></div>`;
  let panel;
  if (view === 7) panel = planResults(a);
  else {
    const [n, title, agentId] = STEPS[view - 1];
    const appr = p.approved.includes(n), gen = p.generated.includes(n) || appr, busy = p.busy === n;
    const status = busy ? 'Generating…' : appr ? 'Approved' : gen ? 'Ready for review' : 'Not run';
    let content;
    if (busy) content = `<div class="empty"><span class="spinner"></span><p class="mt">${n === 1 ? 'Indexing documents' : AGENTS.find(x => x.id === agentId).name + ' is working'}…</p></div>`;
    else if (n === 1) content = ingestPanel(a, gen);
    else if (!gen) content = `<div class="empty">This step has not run yet.</div>`;
    else content = `<div class="output">${PLAN_GEN[n](a)}</div>`;
    panel = `<div class="card"><div class="row between"><div><h3>Step ${n}: ${title}</h3><div class="small faint">${status}${agentId ? ` · ${AGENTS.find(x => x.id === agentId).name}` : ''}</div></div>
      <div class="row">${gen && !busy && !appr && view === cur ? `<button class="btn" data-act="planRun" data-id="${a.id}" data-n="${n}">Re-run</button><button class="btn primary" data-act="planApprove" data-id="${a.id}" data-n="${n}">Approve and continue</button>` : ''}${!gen && !busy && view === cur ? `<button class="btn primary" data-act="planRun" data-id="${a.id}" data-n="${n}">${icon('play')} ${n === 1 ? 'Run ingestion' : 'Generate'}</button>` : ''}${appr ? '<span class="pill good">Approved</span>' : ''}</div></div>
      <div class="mt">${content}</div></div>`;
  }
  return `<a class="small" href="#planning" data-act="tab" data-route="planning" data-tab="audits">← Back to audits</a>
  <div class="page-head" style="margin-top:8px"><div><h1>Audit planning assistant</h1><p class="sub">${esc(a.title)} <span class="id">${a.id}</span> · ${a.risks.length} risks · lead ${esc(a.lead)}. Generates the planning memo, RCM and test scripts; each step waits for your approval.</p></div>${auditStatusPill(a.status)}</div>
  <div class="phases">${ph(1, 'Ingest', 'Seed data and upload documents')}${ph(2, 'Execute', 'Risks, controls, memo, RCM, test scripts')}${ph(3, 'Results', 'Review and export the plan')}</div>
  <div class="steps">${STEPS.map(([n, t]) => `<button class="step ${p.approved.includes(n) ? 'done' : ''} ${view === n ? 'cur' : ''}" data-act="planView" data-n="${n}" ${n > cur ? 'disabled' : ''}><span class="s">${n} · ${p.approved.includes(n) ? 'Done' : n === cur ? 'Review' : 'Pending'}</span><div>${t}</div></button>`).join('')}</div>
  ${cur === 7 && view !== 7 ? `<div class="row" style="margin-bottom:10px"><button class="btn sm" data-act="planView" data-n="7">View results →</button></div>` : ''}${panel}`;
}
function ingestPanel(a, gen) {
  a.docs = a.docs || ['Policy: ' + (a.l1 || 'Risk') + ' standard v3.pdf', 'Process narrative and flowchart.docx', 'FY2026 Internal Audit Findings Summary.pdf'];
  return `<p class="small muted">Seed data from the register is attached automatically: ${a.risks.length} risks with their sources and scores. Add policies, procedures and prior reports.</p>
  <div class="stack mt" style="gap:6px">${a.docs.map(d => `<div class="lineage" style="flex-direction:row;justify-content:space-between"><span class="small">${icon('doc', 14)} ${esc(d)}</span><span class="pill ${gen ? 'good' : 'outline'}">${gen ? 'Indexed' : 'Queued'}</span></div>`).join('')}</div>
  <div class="field mt"><label for="planUpload">Add documents</label><input type="file" id="planUpload" multiple data-chg="planUpload" data-id="${a.id}"></div>
  ${gen ? `<div class="output mt small">${aiTag()} Indexed ${a.docs.length} documents and ${a.risks.length} register risks. ${auditControls(a).length} library controls map to this scope.</div>` : ''}`;
}
CHG.planUpload = el => { const a = auditById(el.dataset.id); Array.from(el.files || []).forEach(f => a.docs.push(f.name)); a.planning.generated = a.planning.generated.filter(n => n !== 1); save(); render(); toast('Documents added. Run ingestion again.'); };
ACT.planView = el => { S.ui.planView = +el.dataset.n; save(); render(); };
ACT.planRun = async el => {
  const a = auditById(el.dataset.id), n = +el.dataset.n, agentId = STEPS[n - 1][2];
  a.planning.busy = n; render();
  try {
    if (agentId) await AgentRuntime.run(agentId, { audit: a.id, step: n }, { ms: 1300, log: `${STEPS[n - 1][1]} for ${a.id}`, output: () => true });
    else { await sleep(900); logRun('Ingestion', `Indexed ${a.docs.length} documents for ${a.id}`); }
    if (!a.planning.generated.includes(n)) a.planning.generated.push(n);
  } catch (e) { /* agent off */ }
  a.planning.busy = null; save(); render();
};
ACT.planApprove = async el => {
  const a = auditById(el.dataset.id), n = +el.dataset.n;
  if (!a.planning.approved.includes(n)) a.planning.approved.push(n);
  a.planning.step = n + 1; S.ui.planView = n + 1;
  if (a.status === 'Not started') a.status = 'Planning';
  logDecision(`Approved planning step ${n} (${STEPS[n - 1][1].replace('Generate ', '')})`, a.id); save();
  toast(`Approved step ${n}`);
  if (n < 6) ACT.planRun({ dataset: { id: a.id, n: n + 1 } }); else render();
};
const PLAN_GEN = {
  2: a => `<h4 style="margin-top:0">Risk statements (cause, event, consequence)</h4><ol>${a.risks.map(id => { const r = riskById(id); return `<li><b>${id} ${esc(r.title)}</b><br>${esc(stmt(r))} <span class="tiny faint">Current score ${currentScore(r)} · ${appetite(r)} appetite</span></li>`; }).join('')}</ol>`,
  3: a => { const cs = auditControls(a); const gaps = a.risks.filter(id => !cs.some(c => c.risk === id)); return `<h4 style="margin-top:0">Key controls</h4><div class="table-wrap"><table><thead><tr><th>ID</th><th>Control</th><th>Risk</th><th>Type</th><th>Nature</th><th>Frequency</th><th>Owner</th></tr></thead><tbody>${cs.map(c => `<tr><td class="mono small">${c.id}</td><td>${esc(c.name)}</td><td class="mono small">${c.risk}</td><td class="small">${c.type}</td><td class="small">${c.nature}</td><td class="small">${c.freq}</td><td class="small">${esc(c.owner)}</td></tr>`).join('')}</tbody></table></div>${gaps.length ? `<p class="mt"><span class="pill crit">Design gap</span> No key control mapped for ${gaps.join(', ')}. Confirm with management before fieldwork.</p>` : '<p class="small faint mt">Every in-scope risk has at least one key control.</p>'}`; },
  4: a => { const rs = a.risks.map(riskById); return `<p><b>INTERNAL AUDIT PLANNING MEMORANDUM</b></p><p><b>Audit:</b> ${esc(a.title)} (${a.id}) · <b>Entity:</b> ${esc(ORG.name)} · <b>Period:</b> 1 Jan 2026 to ${a.start}</p>
    <h4>1. Objective</h4><p>Assess whether the design and operating effectiveness of controls over ${rs.map(r => r.title.toLowerCase()).join('; ')} keep these risks within the board's appetite (threshold ${S.settings.threshold}).</p>
    <h4>2. Scope</h4><ul>${rs.map(r => `<li>${esc(r.title)} (${r.id}): ${esc(r.l2)}; owner ${esc(r.owner)}.</li>`).join('')}</ul><p><b>Out of scope:</b> [to confirm with management].</p>
    <h4>3. Key risks</h4><ol>${rs.map(r => `<li>${esc(stmt(r))}</li>`).join('')}</ol>
    <h4>4. Approach</h4><ul><li>Walkthrough and test of design for ${auditControls(a).length} key controls.</li><li>Test of operating effectiveness using the sample sizes in the methodology table.</li><li>Full-population analytics where data allows (e.g. alert ageing, access logs).</li></ul>
    <h4>5. Documents reviewed</h4><ul>${(a.docs || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    <h4>6. Team and timetable</h4><p>Lead: ${esc(a.lead)} · Team: [names] · Planning: to ${a.start} · Fieldwork: ${a.start} to ${a.end} · Draft report: [date] · Final report: [date]</p>
    <p class="small faint mt">Prepared by: [auditor] · Reviewed by: [IA manager] · Placeholders are left visible on purpose; the agent does not invent names or dates.</p>`; },
  5: a => `<h4 style="margin-top:0">Risk and control matrix</h4><div class="table-wrap"><table><thead><tr><th>Risk</th><th>Control</th><th>Type / nature</th><th>Frequency</th><th>Test approach</th><th>Sample</th></tr></thead><tbody>${auditControls(a).map(c => `<tr><td class="small"><span class="id">${c.risk}</span><br>${esc(riskById(c.risk).title)}</td><td class="small"><span class="id">${c.id}</span><br>${esc(c.name)}</td><td class="small">${c.type}<br>${c.nature}</td><td class="small">${c.freq}</td><td class="small">TOD: walkthrough<br>TOE: ${c.nature === 'Automated' ? 'test of one plus ITGC reliance' : 'attribute testing'}</td><td class="score">${c.nature === 'Automated' ? 1 : SAMPLE_SIZES[c.freq]}</td></tr>`).join('')}</tbody></table></div><p class="tiny faint mt">Sample sizes follow the methodology table (annual 1, quarterly 2, monthly 2, weekly 5, daily 15, recurring 25). Automated controls use a test of one with ITGC reliance.</p>`,
  6: a => auditControls(a).map(c => `<h4>${c.id} · ${esc(c.name)}</h4><p class="small"><b>Test of design:</b></p><ol class="small"><li>Obtain the procedure and confirm it defines owner, frequency and escalation criteria.</li><li>Walk through one instance with ${esc(c.owner)} and inspect the evidence produced.</li><li>Confirm the control would prevent or detect the risk in ${c.risk} at the right precision.</li></ol>
    <p class="small"><b>Operating effectiveness, attributes per sample:</b></p><ul class="small">${(c.id === 'C-06' ? KEYTEST.attrs : ['A. Control performed on the due date by the named owner or delegate.', 'B. Exceptions or items needing action identified.', 'C. Follow-up or escalation evidenced and resolved.']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="small"><b>Request list:</b> population listing for the period; evidence for ${SAMPLE_SIZES[c.freq]} selected instance(s); procedure document; ${c.nature !== 'Manual' ? 'system report logic and ITGC status; ' : ''}reviewer delegation list.</p>`).join('')
};
function planResults(a) {
  const cs = auditControls(a);
  return `<div class="card"><div class="row between"><div><h3>Results: planning pack ready</h3><p class="small faint">All six steps approved. Export or move the audit into fieldwork.</p></div><span class="pill good">Approved</span></div>
  <div class="grid g4 mt">${kpi('Risks in scope', a.risks.length, 'with risk statements')}${kpi('Key controls', cs.length, 'in the RCM')}${kpi('Test scripts', cs.length, 'TOD and TOE')}${kpi('Samples', cs.reduce((s, c) => s + (c.nature === 'Automated' ? 1 : SAMPLE_SIZES[c.freq]), 0), 'to select')}</div>
  <div class="row mt"><button class="btn" data-act="copyMemo" data-id="${a.id}">${icon('copy')} Copy planning memo</button><button class="btn" data-act="copyRcm" data-id="${a.id}">${icon('copy')} Copy RCM as CSV</button>
  ${a.status === 'Planning' || a.status === 'Not started' ? `<button class="btn primary" data-act="startFieldwork" data-id="${a.id}">Start fieldwork →</button>` : `<button class="btn primary" data-go="fieldwork">Open fieldwork →</button>`}</div></div>`;
}
ACT.copyMemo = el => { const d = document.createElement('div'); d.innerHTML = PLAN_GEN[4](auditById(el.dataset.id)); copyText(d.innerText); };
ACT.copyRcm = el => { const a = auditById(el.dataset.id); const rows = [['Risk ID', 'Risk', 'Control ID', 'Control', 'Type', 'Nature', 'Frequency', 'Owner', 'Sample']].concat(auditControls(a).map(c => [c.risk, riskById(c.risk).title, c.id, c.name, c.type, c.nature, c.freq, c.owner, c.nature === 'Automated' ? 1 : SAMPLE_SIZES[c.freq]])); copyText(rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n')); };
ACT.startFieldwork = el => {
  const a = auditById(el.dataset.id); a.status = 'Fieldwork';
  S.fieldwork[a.id] = S.fieldwork[a.id] || {}; auditControls(a).forEach(c => { if (!S.fieldwork[a.id][c.id]) S.fieldwork[a.id][c.id] = blankFieldwork(c); });
  S.ui.fwAudit = a.id; S.ui.fwControl = auditControls(a)[0] ? auditControls(a)[0].id : null; S.ui.fwTab = 'tod';
  logDecision('Moved audit to fieldwork', a.id); save(); location.hash = 'fieldwork'; toast(`${a.id} is in fieldwork`);
};
