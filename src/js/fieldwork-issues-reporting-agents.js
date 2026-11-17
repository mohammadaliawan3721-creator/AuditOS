/* =====================================================================
   Fieldwork, Issues, Reporting, Agent control centre, boot
   ===================================================================== */
const DESIGN_ATTRS = ['Owner defined and independent of the activity', 'Frequency defined and suited to the risk', 'Precision: criteria or threshold for action defined', 'Evidence of performance retained', 'Exceptions escalated and resolved'];
const ratingPill = r => `<span class="pill ${r === 'High' ? 'crit' : r === 'Medium' ? 'warn' : 'info'}">${r}</span>`;
const fwStatus = f => f.conclusion ? f.conclusion.result : f.toe && f.toe.done ? 'TOE done' : f.tod && f.tod.accepted ? 'TOD done' : 'Not started';
const fwPill = s => `<span class="pill ${s === 'Effective' ? 'good' : s === 'Ineffective' ? 'crit' : s === 'Effective with exceptions' ? 'warn' : s === 'Not started' ? 'outline' : 'info'}">${s}</span>`;

RENDER.fieldwork = () => {
  const auds = S.audits.filter(a => ['Fieldwork', 'Reporting', 'Reported'].includes(a.status) && S.fieldwork[a.id]);
  if (!auds.length) return `<div class="page-head"><h1>Fieldwork</h1></div><div class="card empty">No audit is in fieldwork. Finish planning and select <b>Start fieldwork</b>.</div>`;
  if (!auds.find(a => a.id === S.ui.fwAudit)) S.ui.fwAudit = auds[0].id;
  const a = auditById(S.ui.fwAudit), fw = S.fieldwork[a.id], cs = auditControls(a).filter(c => fw[c.id]);
  if (!fw[S.ui.fwControl]) S.ui.fwControl = cs[0].id;
  const c = CONTROLS.find(x => x.id === S.ui.fwControl), f = fw[c.id], tab = S.ui.fwTab;
  let work;
  if (tab === 'review') work = reviewPanel(a, c, f); else if (tab === 'toe') work = toePanel(a, c, f); else if (tab === 'concl') work = conclPanel(a, c, f); else work = todPanel(a, c, f);
  return `<div class="page-head"><div><h1>Fieldwork</h1><p class="sub">Test of design and operating effectiveness. The Dynamic Testing agent reads each sample and explains every result; you accept or override and sign the conclusion.</p></div>
    <select data-chg="fwAudit" style="width:auto" aria-label="Audit">${auds.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${x.id} · ${esc(x.title)}</option>`).join('')}</select></div>
  <div class="grid" style="grid-template-columns:260px minmax(0,1fr)">
    <div class="card flush" style="align-self:start"><div style="padding:12px 14px;border-bottom:1px solid var(--line)"><h4>Controls in scope</h4><span class="tiny faint">${cs.length} from the RCM</span></div>
      ${cs.map(x => `<div class="clickable" data-act="fwControl" data-id="${x.id}" style="padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer;${x.id === c.id ? 'background:var(--accent-soft)' : ''}"><div class="small"><span class="id">${x.id}</span> ${esc(x.name)}</div><div class="row mt" style="margin-top:4px">${fwPill(fwStatus(fw[x.id]))}${signPill(fw[x.id], a.id, x.id)}<span class="tiny faint">${x.freq}</span></div></div>`).join('')}</div>
    <div><div class="card"><div class="id">${c.id} · ${c.risk} ${esc(riskById(c.risk).title)}</div><h2 style="margin-top:2px">${esc(c.name)}</h2><div class="row mt"><span class="pill outline">${c.type}</span><span class="pill outline">${c.nature}</span><span class="pill outline">${c.freq}</span><span class="small faint">Owner ${esc(c.owner)}</span></div></div>
      <div class="mt">${tabs('fw', tab, [['tod', 'Test of design'], ['toe', 'Operating effectiveness'], ['concl', 'Conclusion'], ['review', 'Review and sign-off', openNotes(a.id, c.id).length || '']]).replace(/data-act="tab"/g, 'data-act="fwTab"')}</div>${work}</div>
  </div>`;
};
CHG.fwAudit = el => { S.ui.fwAudit = el.value; S.ui.fwControl = null; S.ui.fwTab = 'tod'; save(); render(); };
ACT.fwControl = el => { S.ui.fwControl = el.dataset.id; S.ui.fwTab = 'tod'; save(); render(); };
ACT.fwTab = el => { S.ui.fwTab = el.dataset.tab; save(); render(); };

function designAssess(c) {
  return DESIGN_ATTRS.map((at, i) => {
    let ok = true, why = ['Procedure names ' + c.owner + '; preparer and reviewer are different people.', `Runs ${c.freq.toLowerCase()}, which matches the risk velocity.`, 'Procedure states what triggers follow-up.', 'Sign-off evidence is retained in the system of record.', 'Exceptions route to a named escalation point.'][i];
    if (c.id === 'C-06' && i === 2) { ok = false; why = KEYTEST.design.gap06; }
    if (c.id === 'C-06' && i === 0) why = KEYTEST.design.owner;
    if (c.id === 'C-07' && i === 3) { ok = false; why = KEYTEST.design.gap07; }
    return { at, ok, why };
  });
}
function todPanel(a, c, f) {
  if (!f.tod) return `<div class="card mt"><p class="small muted">The agent compares the documented procedure and walkthrough evidence with five design attributes.</p><ul class="small">${DESIGN_ATTRS.map(x => `<li>${x}</li>`).join('')}</ul><button class="btn primary mt" data-act="runTod">${icon('spark')} Run AI design assessment</button></div>`;
  if (f.tod.running) return `<div class="card mt empty"><span class="spinner"></span><p class="mt">Reading procedure and walkthrough evidence…</p></div>`;
  const gaps = f.tod.results.filter(x => !x.ok).length;
  return `<div class="card mt"><div class="row between"><h3>${aiTag()} Design assessment</h3><span class="pill ${gaps ? 'warn' : 'good'}">${gaps ? 'Designed with a gap' : 'Designed effectively'}</span></div>
    <div class="table-wrap mt"><table><tbody>${f.tod.results.map(x => `<tr><td style="width:30px"><span class="att ${x.ok ? 'p' : 'x'}">${x.ok ? '✓' : '!'}</span></td><td><b class="small">${x.at}</b><div class="small muted">${esc(x.why)}</div></td></tr>`).join('')}</tbody></table></div>
    <div class="row mt" style="justify-content:flex-end">${f.tod.accepted ? `<span class="pill good">Accepted by ${esc(f.tod.by)}</span><button class="btn sm" data-act="fwTab" data-tab="toe">Go to operating effectiveness →</button>` : `<button class="btn" data-act="runTod">Re-run</button><button class="btn primary" data-act="acceptTod">Accept design assessment</button>`}</div></div>`;
}
ACT.runTod = async () => {
  const a = auditById(S.ui.fwAudit), c = CONTROLS.find(x => x.id === S.ui.fwControl), f = S.fieldwork[a.id][c.id];
  f.tod = { running: true }; render();
  try { const { output } = await AgentRuntime.run('dyntest', { control: c.id, test: 'design' }, { ms: 1100, log: `Design assessment for ${c.id}`, output: () => designAssess(c) }); f.tod = { results: output, accepted: false }; }
  catch (e) { f.tod = null; }
  save(); render();
};
ACT.acceptTod = () => { const a = auditById(S.ui.fwAudit), c = S.ui.fwControl, f = S.fieldwork[a.id][c]; f.tod.accepted = true; f.tod.by = ME; logDecision('Accepted test of design', `${a.id}/${c}`, f.tod.results.some(x => !x.ok) ? 'with design gap' : 'effective'); save(); render(); };

function testSample(c, s) {
  const A = s.reviewed ? 'p' : 'x', B = s.reviewed ? 'p' : 'q', C = s.esc ? 'p' : 'x';
  const note = s.note || (c.id === 'C-06' ? KEYTEST.passNote(s) : `${s.ev}: performed and evidenced by the owner.`);
  return { A, B, C, exc: A === 'x' || C === 'x', note, review: null };
}
function toePanel(a, c, f) {
  const n = f.samples.length, res = f.toe ? f.toe.results : [];
  const exc = res.filter(r => r.exc && r.review !== 'override').length;
  const attrs = c.id === 'C-06' ? KEYTEST.attrs : ['A. Performed on time by owner', 'B. Items needing action identified', 'C. Follow-up evidenced'];
  return `<div class="card mt"><div class="row between"><div><h3>Operating effectiveness</h3><p class="small faint">Population: ${c.id === 'C-06' ? KEYTEST.population : 'instances in the audit period'} · Sample: ${n} (${c.freq}, methodology table) · Selection: random, reproducible seed 2027</p></div>
    ${!f.toe ? `<button class="btn primary" data-act="runToe">${icon('play')} Run Dynamic Testing</button>` : f.toe.running ? '<span class="row small"><span class="spinner"></span> Testing samples…</span>' : `<button class="btn" data-act="runToe">Re-run</button>`}</div>
    ${f.tod && !f.tod.accepted ? '<div class="banner warn mt">Test of design is not accepted yet. You can test operating effectiveness, but conclude design first.</div>' : ''}
    <div class="legend mt">${attrs.map(x => `<span>${x}</span>`).join('')}<span><i style="background:var(--good-soft)"></i>pass</span><span><i style="background:var(--crit-soft)"></i>exception</span><span><i style="background:var(--surface-2)"></i>not determinable</span></div>
    <div class="table-wrap mt"><table><thead><tr><th>#</th><th>Sample</th>${c.id === 'C-06' ? KEYTEST.cols.map(x => `<th>${esc(x)}</th>`).join('') : ''}<th>Evidence</th><th>A</th><th>B</th><th>C</th><th>Agent explanation</th><th>Reviewer</th></tr></thead><tbody>
    ${f.samples.map((s, i) => { const r = res[i]; return `<tr class="sample-row ${r && r.exc && r.review !== 'override' ? 'stripe-crit' : ''}"><td class="mono">${i + 1}</td><td class="mono">${s.d}</td>${c.id === 'C-06' ? `<td class="num">${s.m1}</td><td class="num">${s.m2}</td>` : ''}<td class="small">${s.ev ? esc(s.ev) : '<span class="faint">none</span>'}</td>
      ${r ? ['A', 'B', 'C'].map(k => `<td><span class="att ${r[k]}">${r[k] === 'p' ? '✓' : r[k] === 'x' ? '✕' : '?'}</span></td>`).join('') + `<td class="small" style="min-width:220px">${esc(r.note)}${r.review === 'override' ? '<div class="tiny" style="color:var(--warn)">Overridden by auditor: treated as pass.</div>' : ''}</td><td>${r.exc ? `<div class="row" style="flex-wrap:nowrap"><button class="btn sm ${r.review === 'agree' ? 'on' : ''}" data-act="sampleReview" data-i="${i}" data-v="agree">Agree</button><button class="btn sm ${r.review === 'override' ? 'on' : ''}" data-act="sampleReview" data-i="${i}" data-v="override">Override</button></div>` : '<span class="tiny faint">auto-pass</span>'}</td>` : '<td colspan="5" class="faint small">Not tested</td>'}</tr>`; }).join('')}
    </tbody></table></div>
    ${f.toe && f.toe.done ? `<div class="banner ${exc ? 'warn' : 'acc'} mt">${exc} exception${exc === 1 ? '' : 's'} in ${n} samples.${res.some(r => r.exc && !r.review) ? ' Agree or override each exception before concluding.' : ''}<span class="spacer"></span><button class="btn sm" data-act="fwTab" data-tab="concl">Go to conclusion →</button></div>` : ''}</div>`;
}
ACT.runToe = async () => {
  const a = auditById(S.ui.fwAudit), c = CONTROLS.find(x => x.id === S.ui.fwControl), f = S.fieldwork[a.id][c.id];
  if (!S.agents.dyntest.enabled) { toast('Dynamic Testing Agent is off', 'warn'); return; }
  f.toe = { running: true, results: [], done: false }; render();
  for (const s of f.samples) { await sleep(160); f.toe.results.push(testSample(c, s)); if (currentRoute() === 'fieldwork') render(); }
  await AgentRuntime.run('dyntest', { control: c.id, samples: f.samples.length }, { ms: 50, log: `Tested ${f.samples.length} samples for ${c.id}: ${f.toe.results.filter(r => r.exc).length} exceptions`, output: () => true });
  f.toe.running = false; f.toe.done = true; save(); render();
};
ACT.sampleReview = el => { const f = S.fieldwork[S.ui.fwAudit][S.ui.fwControl]; const r = f.toe.results[+el.dataset.i]; r.review = el.dataset.v; logDecision(el.dataset.v === 'agree' ? 'Agreed sample exception' : 'Overrode sample exception', `${S.ui.fwAudit}/${S.ui.fwControl}#${+el.dataset.i + 1}`); save(); render(); };
function suggestConclusion(f) {
  const exc = f.toe ? f.toe.results.filter(r => r.exc && r.review !== 'override').length : 0, gap = f.tod && f.tod.results && f.tod.results.some(x => !x.ok);
  return exc >= 2 ? 'Ineffective' : exc === 1 || gap ? 'Effective with exceptions' : 'Effective';
}
function conclPanel(a, c, f) {
  if (!f.toe || !f.toe.done) return `<div class="card mt empty">Run operating effectiveness testing first.</div>`;
  const sug = suggestConclusion(f), exc = f.toe.results.filter(r => r.exc && r.review !== 'override').length, pending = f.toe.results.some(r => r.exc && !r.review);
  const iss = f.issueId ? S.issues.find(i => i.id === f.issueId) : null;
  return `<div class="card mt"><h3>Conclusion</h3>
    <div class="grid g3 mt">${kpi('Design', f.tod && f.tod.accepted ? (f.tod.results.some(x => !x.ok) ? 'Gap' : 'Effective') : 'Open', f.tod && f.tod.accepted ? 'accepted' : 'not accepted', f.tod && f.tod.results && f.tod.results.some(x => !x.ok) ? 'warn' : 'good')}${kpi('Exceptions', exc, `of ${f.samples.length} samples`, exc ? 'crit' : 'good')}${kpi('Agent suggests', `<span style="font-size:18px">${sug}</span>`, 'you decide', 'acc')}</div>
    ${pending ? '<div class="banner warn mt">Some exceptions have no reviewer decision yet.</div>' : ''}
    ${f.conclusion ? `<div class="banner acc mt">Signed off: <b>${f.conclusion.result}</b> by ${esc(f.conclusion.by)} at ${f.conclusion.at}${f.conclusion.note ? ' · ' + esc(f.conclusion.note) : ''}</div>` : `
    <div class="grid g2 mt"><div class="field"><label for="cc-res">Conclusion</label><select id="cc-res">${['Effective', 'Effective with exceptions', 'Ineffective'].map(x => `<option ${x === sug ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="field"><label for="cc-note">Reviewer note</label><input type="text" id="cc-note" placeholder="Basis for the conclusion"></div></div>
    <div class="row mt" style="justify-content:flex-end"><button class="btn primary" data-act="signConcl" ${pending ? 'disabled' : ''}>Sign off conclusion</button></div>`}
    ${f.conclusion && f.conclusion.result !== 'Effective' ? `<div class="row between mt2"><div><h4>Issue</h4><p class="small faint">${iss ? `${iss.id} · ${esc(iss.title)} · ${iss.status}` : 'Exceptions need an issue. The Issue Drafting Agent writes it in 5C format for your approval.'}</p></div>${iss ? `<button class="btn" data-act="openIssue" data-id="${iss.id}">Open ${iss.id}</button>` : `<button class="btn primary" data-act="draftIssueFw">${icon('spark')} Draft issue with AI</button>`}</div>` : ''}</div>`;
}
ACT.signConcl = () => {
  const a = auditById(S.ui.fwAudit), c = S.ui.fwControl, f = S.fieldwork[a.id][c];
  f.conclusion = { result: $('#cc-res').value, note: $('#cc-note').value.trim(), by: ME, at: nowStr() };
  logDecision('Signed fieldwork conclusion', `${a.id}/${c}`, f.conclusion.result); save(); render(); toast('Conclusion signed');
};
ACT.draftIssueFw = async () => {
  const a = auditById(S.ui.fwAudit), c = CONTROLS.find(x => x.id === S.ui.fwControl), f = S.fieldwork[a.id][c.id], r = riskById(c.risk);
  const ex = f.toe.results.map((x, i) => ({ ...x, s: f.samples[i] })).filter(x => x.exc && x.review !== 'override');
  try {
    const { output } = await AgentRuntime.run('issue', { control: c.id, exceptions: ex.length }, { ms: 1200, log: `Drafted issue for ${c.id}`, output: () => {
      const c06 = c.id === 'C-06', gap = f.tod && f.tod.results.find(x => !x.ok);
      return {
        title: c06 ? KEYTEST.issue.title : `${c.name}: control not operating consistently`,
        condition: `${ex.length} of ${f.samples.length} samples tested (${ex.map(x => x.s.d).join(', ')}) showed exceptions. ${ex.map(x => x.note).join(' ')}${c06 ? ' ' + KEYTEST.issue.trend(f.samples[0], f.samples[f.samples.length - 1]) : ''}`,
        criteria: c06 ? KEYTEST.issue.criteria : `RCM control ${c.id}: ${c.name} (${c.freq.toLowerCase()}).`,
        cause: c06 ? KEYTEST.issue.cause : (gap ? `Design gap: ${gap.why}` : '[To agree with management: capacity, delegation or tooling.]'),
        consequence: (RSTMT[r.id] ? `Exposure to ${RSTMT[r.id][2]}.` : 'Financial, regulatory or customer impact.') + ` The linked risk ${r.id} is ${appetite(r)} appetite (current score ${currentScore(r)}).`,
        action: c06 ? KEYTEST.issue.action : '[Agree action, owner and date with management.]',
        rating: ex.length >= 2 && appetite(r) === 'above' ? 'High' : 'Medium'
      };
    } });
    const id = nextId('ISS', S.issues);
    S.issues.unshift({ id, ...output, audit: a.id, risk: r.id, control: c.id, owner: c.owner, due: '2027-01-31', status: 'Draft', created: ORG.asOf, ai: true });
    f.issueId = id; logRun('Issue Drafting Agent', `Draft ${id} created from ${ex.length} exceptions`); save(); render();
    openIssueDrawer(id);
  } catch (e) { /* agent off */ }
};

/* ---------------- ISSUES ---------------- */
RENDER.issues = () => {
  const flt = S.ui.issueFilter;
  const list = S.issues.filter(i => flt === 'all' || (flt === 'draft' && i.status === 'Draft') || (flt === 'open' && !String(i.status).startsWith('Closed') && i.status !== 'Draft') || (flt === 'overdue' && isOverdue(i)) || (flt === 'closed' && String(i.status).startsWith('Closed')));
  const open = S.issues.filter(i => !String(i.status).startsWith('Closed') && i.status !== 'Draft');
  return `<div class="page-head"><div><h1>Issues management</h1><p class="sub">Issues in condition, criteria, cause, consequence and action format, tracked from draft to validated closure.</p></div></div>
  <div class="grid g4">${kpi('Open', open.length, 'agreed with management', 'acc')}${kpi('Overdue', S.issues.filter(isOverdue).length, `past due at ${ORG.asOf}`, S.issues.filter(isOverdue).length ? 'crit' : 'good')}${kpi('High rated', open.filter(i => i.rating === 'High').length, 'open', 'warn')}${kpi('Drafts', S.issues.filter(i => i.status === 'Draft').length, 'awaiting your approval', 'warn')}</div>
  <div class="row mt">${[['all', 'All'], ['draft', 'Drafts'], ['open', 'Open'], ['overdue', 'Overdue'], ['closed', 'Closed']].map(([k, l]) => `<button class="btn sm ${flt === k ? 'on' : ''}" data-act="issueFilter" data-f="${k}">${l}</button>`).join('')}</div>
  <div class="card flush mt"><div class="table-wrap"><table><thead><tr><th>Issue</th><th>Audit</th><th>Rating</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>
  ${list.length ? list.map(i => { const st = issueStatus(i); return `<tr class="clickable ${st === 'Overdue' ? 'stripe-crit' : ''}" data-act="openIssue" data-id="${i.id}"><td><div>${esc(i.title)} ${i.ai ? aiTag('AI draft') : ''}</div><div class="id">${i.id} · ${i.risk}</div></td><td class="mono small">${i.audit}</td><td>${ratingPill(i.rating)}</td><td class="small">${esc(i.owner)}</td><td class="mono small">${i.due}</td><td><span class="pill ${st === 'Overdue' ? 'crit' : st === 'Draft' ? 'info' : st.startsWith('Closed') ? 'good' : 'warn'}">${st}</span></td></tr>`; }).join('') : '<tr><td colspan="6" class="empty">No issues in this view.</td></tr>'}
  </tbody></table></div></div>`;
};
ACT.issueFilter = el => { S.ui.issueFilter = el.dataset.f; save(); render(); };
ACT.openIssue = el => { closeModal(); openIssueDrawer(el.dataset.id); };
function openIssueDrawer(id) {
  const i = S.issues.find(x => x.id === id); if (!i) return;
  const st = issueStatus(i), draft = i.status === 'Draft';
  const fld = (k, label) => `<div class="field"><label for="is-${k}">${label}</label><textarea id="is-${k}">${esc(i[k])}</textarea></div>`;
  const next = { 'Draft': [['approveIssue', 'Approve and send to management']], 'Open': [['issueProgress', 'Mark in progress']], 'In progress': [['issueClosePend', 'Management reports closed']], 'Closed - pending validation': [['issueValidate', 'Validate closure']] }[i.status] || [];
  openDrawer(`<div class="drawer-head"><div><div class="id">${i.id} · ${i.audit} · ${i.risk}</div><h2>${esc(i.title)}</h2><div class="row" style="margin-top:6px">${ratingPill(i.rating)}<span class="pill ${st === 'Overdue' ? 'crit' : 'outline'}">${st}</span>${i.ai ? aiTag('Drafted by Issue Drafting Agent') : ''}</div></div><button class="x" data-act="closeDrawer" aria-label="Close">×</button></div>
  <div class="drawer-body"><div class="stack">
    ${draft ? '<div class="banner info">Draft: edit freely. It reaches management and reports only after you approve it.</div>' : ''}
    <div class="field"><label for="is-title">Title</label><input type="text" id="is-title" value="${esc(i.title)}"></div>
    ${fld('condition', 'Condition: what we found')}${fld('criteria', 'Criteria: what should happen')}${fld('cause', 'Cause: why it happened')}${fld('consequence', 'Consequence: why it matters')}
    <div class="field"><label for="is-action">Corrective action (management action plan)</label><textarea id="is-action">${esc(i.action)}</textarea><button class="btn sm mt" style="align-self:flex-start" data-act="aiAction" data-id="${i.id}">${icon('spark', 12)} Suggest SMART action plan</button></div>
    <div class="grid g3"><div class="field"><label for="is-rating">Rating</label><select id="is-rating">${['High', 'Medium', 'Low'].map(x => `<option ${x === i.rating ? 'selected' : ''}>${x}</option>`).join('')}</select></div><div class="field"><label for="is-owner">Owner</label><select id="is-owner">${Object.values(PEOPLE).map(p => `<option ${p === i.owner ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div><div class="field"><label for="is-due">Due date</label><input type="text" id="is-due" value="${i.due}"></div></div>
    <p class="tiny faint">Rating scale: High = could cause a material loss, regulatory breach or above-appetite exposure; Medium = weakens a key control; Low = improvement opportunity.</p>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-act="saveIssue" data-id="${i.id}">Save changes</button>${next.map(([a, l]) => `<button class="btn primary" data-act="${a}" data-id="${i.id}">${l}</button>`).join('')}</div>
  </div></div>`);
}
function readIssueForm(i) { ['title', 'condition', 'criteria', 'cause', 'consequence', 'action', 'rating', 'owner', 'due'].forEach(k => { const el = $('#is-' + k); if (el) i[k] = el.value.trim(); }); }
ACT.saveIssue = el => { const i = S.issues.find(x => x.id === el.dataset.id); readIssueForm(i); logDecision('Edited issue', i.id); save(); render(); openIssueDrawer(i.id); toast('Issue saved'); };
function issueMove(el, to, what) { const i = S.issues.find(x => x.id === el.dataset.id); readIssueForm(i); i.status = to; logDecision(what, i.id, to); save(); render(); openIssueDrawer(i.id); toast(`${i.id}: ${to}`); }
ACT.approveIssue = el => issueMove(el, 'Open', 'Approved issue draft');
ACT.issueProgress = el => issueMove(el, 'In progress', 'Updated issue status');
ACT.issueClosePend = el => issueMove(el, 'Closed - pending validation', 'Management reported closure');
ACT.issueValidate = el => issueMove(el, 'Closed', 'Validated issue closure');
ACT.aiAction = async el => {
  const i = S.issues.find(x => x.id === el.dataset.id); readIssueForm(i);
  el.innerHTML = '<span class="spinner"></span>';
  try {
    const { output } = await AgentRuntime.run('issue', { issue: i.id, ask: 'action plan' }, { ms: 900, log: `Suggested action plan for ${i.id}`, output: () => `1) Fix the root cause: ${i.cause.replace(/\.$/, '').replace(/^\[.*\]$/, 'agree root cause with management')} (owner ${i.owner}, by ${i.due}). 2) Evidence: retain sign-off for each performance of the control in the system of record. 3) Monitoring: report status monthly to the risk committee until internal audit validates closure. Closure evidence: updated procedure, two consecutive periods of clean performance, and the monitoring report.` });
    $('#is-action').value = output; i.action = output; save(); toast('Action plan drafted. Review it before saving.');
  } catch (e) { /* off */ }
  el.innerHTML = `${icon('spark', 12)} Suggest SMART action plan`;
};
ACT.newIssueFromRisk = async el => {
  const r = riskById(el.dataset.id);
  try {
    const { output } = await AgentRuntime.run('issue', { risk: r.id }, { ms: 800, log: `Drafted remediation issue for ${r.id}`, output: () => ({ title: `Remediate: ${r.title}`, condition: r.desc, criteria: `Risk appetite: ${r.id} must be brought to a current score below ${S.settings.threshold}.`, cause: '[To agree with the risk owner.]', consequence: RSTMT[r.id] ? `Exposure to ${RSTMT[r.id][2]}.` : '[Describe impact.]', action: '[Agree action, owner and date.]', rating: appetite(r) === 'above' ? 'High' : 'Medium' }) });
    const id = nextId('ISS', S.issues);
    S.issues.unshift({ id, ...output, audit: auditsFor(r.id)[0] ? auditsFor(r.id)[0].id : 'Risk-driven', risk: r.id, owner: r.owner, due: '2027-03-31', status: 'Draft', created: ORG.asOf, ai: true });
    save(); closeDrawer(); location.hash = 'issues'; setTimeout(() => openIssueDrawer(id), 50);
  } catch (e) { /* off */ }
};

/* ---------------- REPORTING ---------------- */
function auditRating(a) {
  if (a.status === 'Reported' && a.rating) return a.rating;
  const iss = S.issues.filter(i => i.audit === a.id && i.status !== 'Draft');
  const h = iss.filter(i => i.rating === 'High').length, m = iss.filter(i => i.rating === 'Medium').length;
  return h >= 2 ? 'Unsatisfactory' : h === 1 ? 'Needs improvement' : m ? 'Satisfactory with improvements' : 'Satisfactory';
}
const ratingColor = r => r === 'Unsatisfactory' ? 'crit' : r === 'Needs improvement' ? 'warn' : r.startsWith('Satisfactory with') ? 'info' : 'good';
RENDER.reporting = () => {
  const tab = S.ui.reportTab;
  return `<div class="page-head"><div><h1>Audit reporting</h1><p class="sub">The Report Writer assembles reports from approved issues and signed conclusions only. Drafts are excluded and listed.</p></div></div>
  ${tabs('reporting', tab, [['audit', 'Audit report'], ['ac', 'Audit Committee summary']])}${tab === 'ac' ? acSummary() : auditReport()}`;
};
function auditReport() {
  const auds = S.audits.filter(a => ['Fieldwork', 'Reporting', 'Reported'].includes(a.status));
  if (!auds.find(a => a.id === S.ui.reportAudit)) S.ui.reportAudit = auds[0] && auds[0].id;
  const a = auditById(S.ui.reportAudit);
  if (!a) return '<div class="card empty">No audit has reached fieldwork yet.</div>';
  const gen = S.reports[a.id];
  const bar = `<div class="row between no-print"><select data-chg="reportAudit" style="width:auto" aria-label="Audit">${auds.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${x.id} · ${esc(x.title)}</option>`).join('')}</select>
    <div class="row">${gen ? `<button class="btn" data-act="copyReport">${icon('copy')} Copy report text</button>` : ''}<button class="btn ${gen ? '' : 'primary'}" data-act="genReport" data-id="${a.id}">${icon('spark')} ${gen ? 'Regenerate' : 'Generate report'}</button>${gen && a.status !== 'Reported' ? `<button class="btn primary" data-act="markReported" data-id="${a.id}">Issue final report</button>` : ''}</div></div>`;
  if (!gen) return bar + `<div class="card mt empty">Select <b>Generate report</b>. The Report Writer uses signed conclusions and approved issues for ${a.id}.</div>`;
  const fw = S.fieldwork[a.id] || {}, cs = auditControls(a).filter(c => fw[c.id]);
  const iss = S.issues.filter(i => i.audit === a.id && i.status !== 'Draft'), drafts = S.issues.filter(i => i.audit === a.id && i.status === 'Draft');
  const rating = auditRating(a), eff = cs.filter(c => fw[c.id].conclusion && fw[c.id].conclusion.result === 'Effective').length, inef = cs.filter(c => fw[c.id].conclusion && fw[c.id].conclusion.result !== 'Effective').length, open = cs.filter(c => !fw[c.id].conclusion).length;
  const cnt = k => iss.filter(i => i.rating === k).length;
  const summary = `We assessed ${cs.length || auditControls(a).length} key control${cs.length === 1 ? '' : 's'} over ${a.risks.map(id => riskById(id).title.toLowerCase()).join(' and ')}. ${eff} operated effectively${inef ? `; ${inef} did not operate as designed` : ''}${open ? `; ${open} not yet concluded` : ''}. ${iss.length ? `We raised ${iss.length} issue${iss.length > 1 ? 's' : ''} (${cnt('High')} high, ${cnt('Medium')} medium, ${cnt('Low')} low). The most significant: ${iss.sort((x, y) => ['High', 'Medium', 'Low'].indexOf(x.rating) - ['High', 'Medium', 'Low'].indexOf(y.rating))[0].title.toLowerCase()}.` : 'No issues were raised.'} ${iss.length ? `Management has agreed actions due between ${iss.map(i => i.due).sort()[0]} and ${iss.map(i => i.due).sort().pop()}.` : ''}`;
  return bar + `<article class="report-doc mt" id="reportDoc">
    <div class="tiny faint">${esc(ORG.name)} · Internal Audit · ${a.id} · ${a.status === 'Reported' ? 'Final' : 'Draft for management response'}</div>
    <h1 style="margin-top:6px">${esc(a.title)}</h1>
    <div class="row mt"><span class="small muted">Overall rating</span><span class="rating pill ${ratingColor(rating)}" style="font-size:13px">${rating}</span><span class="small faint">Period ${a.start} to ${a.end} · Lead ${esc(a.lead)}</span></div>
    <h2>Executive summary</h2><p>${esc(summary)}</p>
    <h2>Background and scope</h2><p>${a.risks.map(id => { const r = riskById(id); return `${r.id} ${esc(r.title)} is ${appetite(r)} appetite with a current score of ${currentScore(r)} (threshold ${S.settings.threshold}).`; }).join(' ')} The audit tested design and operating effectiveness of the key controls in the approved RCM.</p>
    <h2>Control results</h2><div class="table-wrap"><table><thead><tr><th>Control</th><th>Design</th><th>Operating effectiveness</th><th>Conclusion</th></tr></thead><tbody>${(cs.length ? cs : auditControls(a)).map(c => { const f = fw[c.id] || {}; const ex = f.toe && f.toe.results ? f.toe.results.filter(r => r.exc && r.review !== 'override').length : null; return `<tr><td class="small"><span class="id">${c.id}</span> ${esc(c.name)}</td><td class="small">${f.tod && f.tod.accepted ? (f.tod.results.some(x => !x.ok) ? 'Gap' : 'Effective') : 'Not concluded'}</td><td class="small">${ex == null ? 'Not tested' : `${ex} exception${ex === 1 ? '' : 's'} / ${f.samples.length}`}</td><td>${f.conclusion ? fwPill(f.conclusion.result) : '<span class="pill outline">Open</span>'}</td></tr>`; }).join('')}</tbody></table></div>
    <h2>Findings</h2>${iss.length ? iss.map(i => `<div class="lineage mt" style="padding:12px 14px"><div class="row between"><b>${i.id} · ${esc(i.title)}</b>${ratingPill(i.rating)}</div><p class="small"><b>Condition.</b> ${esc(i.condition)}</p><p class="small"><b>Criteria.</b> ${esc(i.criteria)}</p><p class="small"><b>Cause.</b> ${esc(i.cause)}</p><p class="small"><b>Consequence.</b> ${esc(i.consequence)}</p><p class="small"><b>Management action.</b> ${esc(i.action)} <span class="faint">Owner ${esc(i.owner)}, due ${i.due}.</span></p></div>`).join('') : '<p class="small">No findings.</p>'}
    ${drafts.length ? `<p class="small mt" style="color:var(--warn)">Excluded: ${drafts.length} draft issue${drafts.length > 1 ? 's' : ''} (${drafts.map(d => d.id).join(', ')}) not yet approved by internal audit.</p>` : ''}
    <div class="foot-note">Generated by the Report Writer agent on ${gen.at} from approved records. AI-generated text needs human review before issue. Distribution: Audit Committee chair, CEO, ${esc(PEOPLE.cro)}, process owners.</div></article>`;
}
CHG.reportAudit = el => { S.ui.reportAudit = el.value; save(); render(); };
ACT.genReport = async el => { try { await AgentRuntime.run('report', { audit: el.dataset.id }, { ms: 1200, log: `Report drafted for ${el.dataset.id}`, output: () => true }); S.reports[el.dataset.id] = { at: nowStr() }; if (auditById(el.dataset.id).status === 'Fieldwork') auditById(el.dataset.id).status = 'Reporting'; save(); render(); } catch (e) { /* off */ } };
ACT.copyReport = () => copyText($('#reportDoc').innerText);
ACT.markReported = el => { const a = auditById(el.dataset.id); const blk = issueGate(a); if (blk.length) { openModal('Report cannot be issued yet', `<p class="small">Quality review gate for ${a.id}:</p><ul class="small">${blk.map(b => `<li>${esc(b)}</li>`).join('')}</ul><p class="small faint">Workpapers need preparer and reviewer sign-off with no open review notes, and every evidence request must be accepted.</p>`); return; } a.rating = auditRating(a); a.status = 'Reported'; logDecision('Issued final audit report', a.id, a.rating); save(); render(); toast(`${a.id} final report issued: ${a.rating}`); };

function acSummary() {
  const above = activeRisks().filter(r => appetite(r) === 'above'), gaps = above.filter(r => !covered(r.id));
  const open = S.issues.filter(i => !String(i.status).startsWith('Closed') && i.status !== 'Draft'), od = S.issues.filter(isOverdue), kb = S.kris.filter(k => k.value > k.threshold);
  const byStatus = ['Not started', 'Planning', 'Fieldwork', 'Reporting', 'Reported'].map(s => [s, S.audits.filter(a => a.status === s).length]);
  const decisions = [
    ...gaps.map(r => `Approve adding ${r.id} ${r.title} to the ${ORG.fy} plan (above appetite, no coverage).`),
    ...od.filter(i => i.rating !== 'Low').map(i => `Ask ${i.owner} for a revised date on ${i.id} (due ${i.due}).`),
    ...kb.map(k => `Request a remediation plan from management for ${k.name} (${k.value} vs ${k.threshold}).`)
  ];
  return `<div class="row between no-print"><span class="small faint">Quarter to ${ORG.asOf}</span><button class="btn" data-act="copyAc">${icon('copy')} Copy summary</button></div>
  <article class="report-doc mt" id="acDoc"><div class="tiny faint">${esc(ORG.name)} · Head of Internal Audit report to the Audit Committee · ${ORG.fy}</div><h1 style="margin-top:6px">Internal audit update</h1>
  <h2>1. Decisions and escalations required</h2>${decisions.length ? `<ol>${decisions.map(d => `<li>${esc(d)}</li>`).join('')}</ol>` : '<p>None this quarter.</p>'}
  <h2>2. Plan delivery</h2><p>${byStatus.map(([s, n]) => `${n} ${s.toLowerCase()}`).join(' · ')}.</p>
  <div class="table-wrap"><table><thead><tr><th>Audit</th><th>Status</th><th>Assurance</th></tr></thead><tbody>${S.audits.map(a => `<tr><td class="small">${a.id} · ${esc(a.title)}</td><td>${auditStatusPill(a.status)}</td><td>${['Reporting', 'Reported'].includes(a.status) ? `<span class="pill ${ratingColor(auditRating(a))}">${auditRating(a)}</span>` : '<span class="faint small">pending</span>'}</td></tr>`).join('')}</tbody></table></div>
  <h2>3. Risk exposure</h2><p>${above.length} risks are above appetite (threshold ${S.settings.threshold}); ${gaps.length} ${gaps.length === 1 ? 'has' : 'have'} no audit coverage. ${kb.length} of ${S.kris.length} KRIs breach their thresholds.</p><ul>${above.map(r => `<li>${r.id} ${esc(r.title)}: score ${currentScore(r)}, ${covered(r.id) ? 'covered by ' + auditsFor(r.id).map(a => a.id).join(', ') : '<b>no coverage</b>'}.</li>`).join('')}</ul>
  <h2>4. Issues and actions</h2><p>${open.length} open issues: ${['High', 'Medium', 'Low'].map(k => `${open.filter(i => i.rating === k).length} ${k.toLowerCase()}`).join(', ')}. ${od.length} overdue.</p>${od.length ? `<ul>${od.map(i => `<li>${i.id} ${esc(i.title)} (${i.rating}), owner ${esc(i.owner)}, due ${i.due}.</li>`).join('')}</ul>` : ''}
  <h2>5. Use of AI in internal audit</h2><p>${AGENTS.length} agents operate in simulated mode. Every agent output was reviewed by an auditor before use; ${S.decisions.length} human decisions are recorded in the decision log.</p>
  <div class="foot-note">Prepared from AuditOS records on ${nowStr()}. Draft for CAE review.</div></article>`;
}
ACT.copyAc = () => copyText($('#acDoc').innerText);

/* ---------------- AGENT CONTROL CENTRE ---------------- */
RENDER.agents = () => {
  const tab = S.ui.agentTab;
  const head = `<div class="page-head"><div><div class="eyebrow">Orchestration</div><h1>Agent control centre</h1><p class="sub">Every agent in the lifecycle: what it reads, what it produces, which human gate stops it, and its prompt. Switch agents off, tune routing thresholds and inspect the run and decision logs.</p></div></div>
    ${tabs('agents', tab, [['agents', `Agents (${AGENTS.length})`], ['runs', 'Run log'], ['decisions', 'Decision log'], ['integration', 'Go-live architecture']])}`;
  if (tab === 'runs') return head + `<div class="agent-log" style="max-height:none">${S.runLog.map(l => `<div><span class="t">${l.at}</span> <span class="ag">${esc(l.agent)}</span> <span class="${l.lvl}">${esc(l.msg)}</span></div>`).join('')}</div>`;
  if (tab === 'decisions') return head + `<div class="card flush"><div class="table-wrap"><table><thead><tr><th>When</th><th>Who</th><th>Decision</th><th>Reference</th><th>Detail</th></tr></thead><tbody>${S.decisions.map(d => `<tr><td class="mono small">${d.at}</td><td class="small">${esc(d.who)}</td><td>${esc(d.what)}</td><td class="mono small">${esc(d.ref)}</td><td class="small muted">${esc(d.detail)}</td></tr>`).join('')}</tbody></table></div></div><p class="tiny faint mt">The decision log is the audit trail for human oversight of AI output: every acceptance, override, rejection and setting change.</p>`;
  if (tab === 'integration') return head + integration();
  const mods = [...new Set(AGENTS.map(a => a.module))];
  return head + `<div class="grid g2">
    <div class="card"><h3>Runtime</h3><div class="stack mt" style="gap:8px">
      <label class="lineage" style="flex-direction:row;gap:10px;border-color:var(--accent)"><input type="radio" name="rt" checked disabled><span><b class="small">Simulated</b><br><span class="tiny faint">Agents return deterministic demo output in the browser. Active.</span></span></label>
      <label class="lineage" style="flex-direction:row;gap:10px;opacity:.6"><input type="radio" name="rt" disabled><span><b class="small">Live (phase 2)</b><br><span class="tiny faint">Calls ${AgentRuntime.endpoint} on your backend, which calls the LLM. Needs the backend in "Go-live architecture".</span></span></label></div></div>
    <div class="card"><h3>Consolidation routing</h3><div class="field mt"><label for="am">Auto-merge at or above <b>${pct(S.settings.autoMerge)}</b> similarity</label><input type="range" id="am" min="0.6" max="0.99" step="0.01" value="${S.settings.autoMerge}" data-chg="autoMerge"></div>
      <div class="field mt"><label for="rf">Reviewer decision from <b>${pct(S.settings.reviewFloor)}</b>; below this the signal is proposed as a new risk</label><input type="range" id="rf" min="0.3" max="0.75" step="0.01" value="${S.settings.reviewFloor}" data-chg="reviewFloor"></div><p class="tiny faint mt">Set auto-merge to 99% to send every signal to a reviewer.</p></div></div>
  ${mods.map(m => `<h3 class="mt2" style="margin-bottom:10px">${m}</h3><div class="grid g3">${AGENTS.filter(a => a.module === m).map(a => { const st = S.agents[a.id]; return `<div class="agent-card ${st.enabled ? '' : 'off'}"><div class="row between" style="flex-wrap:nowrap"><div class="row" style="flex-wrap:nowrap;cursor:pointer" data-act="openAgent" data-id="${a.id}"><span class="ic">${icon(a.icon)}</span><div><b class="small">${a.name}</b><div class="tiny faint">${a.kind}</div></div></div><label class="switch" title="${st.enabled ? 'Switch off' : 'Switch on'}"><input type="checkbox" ${st.enabled ? 'checked' : ''} data-chg="agentToggle" data-id="${a.id}" aria-label="Enable ${a.name}"><span></span></label></div>
    <p class="small muted" data-act="openAgent" data-id="${a.id}" style="cursor:pointer">${esc(a.purpose)}</p><div class="row tiny faint"><span>${st.runs} runs</span><span>· last ${st.last}</span>${st.prompt !== a.prompt ? '<span class="pill warn">prompt edited</span>' : ''}</div></div>`; }).join('')}</div>`).join('')}`;
};
CHG.autoMerge = el => { const v = +el.value; S.settings.autoMerge = Math.max(v, S.settings.reviewFloor + 0.05); logDecision('Changed auto-merge threshold', 'Settings', pct(S.settings.autoMerge)); save(); render(); };
CHG.reviewFloor = el => { const v = +el.value; S.settings.reviewFloor = Math.min(v, S.settings.autoMerge - 0.05); logDecision('Changed review floor', 'Settings', pct(S.settings.reviewFloor)); save(); render(); };
CHG.agentToggle = el => { const st = S.agents[el.dataset.id], a = AGENTS.find(x => x.id === el.dataset.id); st.enabled = el.checked; logDecision(`${el.checked ? 'Enabled' : 'Disabled'} agent`, a.name); save(); render(); toast(`${a.name} ${el.checked ? 'on' : 'off'}`); };
ACT.openAgent = el => openAgentDrawer(el.dataset.id);
function openAgentDrawer(id) {
  const a = AGENTS.find(x => x.id === id), st = S.agents[id];
  openDrawer(`<div class="drawer-head"><div class="row" style="flex-wrap:nowrap"><span class="ic" style="width:36px;height:36px;border-radius:8px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center">${icon(a.icon, 18)}</span><div><h2>${a.name}</h2><div class="small faint">${a.module} · ${a.kind} · ${st.enabled ? 'On' : 'Off'}</div></div></div><button class="x" data-act="closeDrawer" aria-label="Close">×</button></div>
  <div class="drawer-body"><div class="stack">
    <p>${esc(a.purpose)}</p>
    <div class="kv"><div><div class="k">Reads</div><div class="v small">${a.inputs.map(esc).join('<br>')}</div></div><div><div class="k">Produces</div><div class="v small">${a.outputs.map(esc).join('<br>')}</div></div></div>
    <div class="banner acc">${icon('shield')} <span><b>Human gate.</b> ${esc(a.gate)}</span></div>
    <div class="field"><label for="ag-prompt">System prompt (versioned in live mode)</label><textarea id="ag-prompt" style="min-height:150px;font-family:var(--font-mono);font-size:12px">${esc(st.prompt)}</textarea></div>
    <div class="row" style="justify-content:flex-end"><button class="btn" data-act="resetPrompt" data-id="${id}">Reset to default</button><button class="btn" data-act="savePrompt" data-id="${id}">Save prompt</button><button class="btn primary" data-act="testAgent" data-id="${id}">${icon('play')} Test run</button></div>
    <div id="agTest"></div>
    <h4>Recent runs</h4><div class="agent-log">${S.runLog.filter(l => l.agent === a.name).slice(0, 12).map(l => `<div><span class="t">${l.at}</span> <span class="${l.lvl}">${esc(l.msg)}</span></div>`).join('') || '<span class="t">No runs this session.</span>'}</div>
  </div></div>`);
}
ACT.savePrompt = el => { S.agents[el.dataset.id].prompt = $('#ag-prompt').value; logDecision('Edited agent prompt', AGENTS.find(x => x.id === el.dataset.id).name); save(); toast('Prompt saved. Takes effect on the next run.'); render(); openAgentDrawer(el.dataset.id); };
ACT.resetPrompt = el => { const a = AGENTS.find(x => x.id === el.dataset.id); S.agents[a.id].prompt = a.prompt; save(); render(); openAgentDrawer(a.id); toast('Prompt reset'); };
ACT.testAgent = async el => {
  const a = AGENTS.find(x => x.id === el.dataset.id), out = $('#agTest');
  out.innerHTML = '<div class="row small faint"><span class="spinner"></span> Running…</div>';
  const sample = { agent: a.id, input: a.inputs[0], output: a.outputs.map(o => ({ field: o, value: '…demo value…' })), confidence: 0.81, evidence: [{ ref: 'demo-source', quote: 'Short quoted span from the source document.' }], needs_human_review: true };
  try { const { output, ms } = await AgentRuntime.run(a.id, { test: true }, { ms: 700, log: 'Test run', output: () => sample }); out.innerHTML = `<pre class="prompt">${esc(JSON.stringify(output, null, 2))}</pre><p class="tiny faint mt">Simulated in ${ms} ms. Live mode validates this shape against the agent's JSON schema before the UI accepts it.</p>`; }
  catch (e) { out.innerHTML = '<p class="small" style="color:var(--crit)">Agent is switched off.</p>'; }
};
function integration() {
  return `<div class="grid g2"><div class="card"><h3>What phase 2 adds</h3><p class="small muted mt">This page is the front end. Going live replaces the simulated branch of <span class="mono">AgentRuntime.run()</span> with a call to your backend. No screen changes.</p>
    <ol class="small mt" style="padding-left:18px;line-height:1.7">
      <li><b>Backend API</b>: <span class="mono">POST /api/agents/run</span>, authenticated with company SSO. It loads the agent's versioned prompt and JSON schema, calls the LLM, validates the output and writes it to the database with a trace ID.</li>
      <li><b>Database</b>: register, runs, candidates, audits, RCM, samples, issues, decision log. Replaces browser storage so all users see the same data.</li>
      <li><b>Scheduler</b>: runs sensing agents daily and the KRI monitor nightly.</li>
      <li><b>Connectors</b>: regulator feeds, news and vulnerability feeds, GRC or ticketing system, document store for evidence and prior reports.</li>
      <li><b>Document retrieval</b>: evidence files are chunked and indexed so the Dynamic Testing agent cites the page or cell it relied on.</li>
      <li><b>AI governance</b>: model inventory entry, prompt version control, PII redaction before LLM calls, output sampling QA, and the decision log as the oversight evidence.</li></ol></div>
  <div class="card"><h3>Request and response contract</h3><pre class="prompt mt">POST /api/agents/run
{
  "agent": "consolidate",
  "system": "&lt;versioned prompt&gt;",
  "input": { "candidate": {…}, "register": [ … ] }
}

200 OK
{
  "output": {
    "match_risk": "RISK-0103",
    "similarity": 0.72,
    "rationale": "Same cause and L2…",
    "l1": "Compliance Risks",
    "l2": "Sanctions"
  },
  "usage": { "input_tokens": 3120, "output_tokens": 214 },
  "traceId": "tr_8f2c…",
  "promptVersion": "consolidate@1.4"
}</pre>
  <h4 class="mt">Suggested stack</h4><ul class="small" style="padding-left:18px"><li>Front end: this app, ported to React or kept as is.</li><li>API: Python (FastAPI) or Node, with the Claude API using structured JSON output.</li><li>Data: PostgreSQL with pgvector for evidence retrieval.</li><li>Jobs: a cron or queue worker for scheduled runs.</li><li>Hosting: inside the firm's cloud tenancy so audit data stays in your environment.</li></ul></div></div>`;
}

