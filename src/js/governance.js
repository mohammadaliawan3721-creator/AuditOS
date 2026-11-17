/* =====================================================================
   Governance layer (v2.1): the enterprise audit-management features that
   commercial platforms treat as table stakes, built clean-room from
   public feature descriptions.
     1. Users, roles and segregation of duties (preparer / reviewer / approver)
     2. Workpaper review notes and two-level sign-off
     3. Evidence requests (PBC) to control owners, with reminders and ageing
     4. Time and budget: hours by phase, estimate at completion, utilisation
     5. Framework crosswalk: test once, map to many frameworks
   ===================================================================== */

/* ---------- 1. Users and segregation of duties ---------- */
const USERS = () => [
  { key: 'snr', name: PEOPLE.snr, role: 'Preparer' },
  { key: 'mgr', name: PEOPLE.mgr, role: 'Reviewer' },
  { key: 'cae', name: PEOPLE.cae, role: 'Approver' }
];
let currentUserKey = 'mgr';
function setUser(k) {
  const u = USERS().find(x => x.key === k) || USERS()[1];
  currentUserKey = u.key; ME = u.name;
  try { localStorage.setItem('auditos.user', u.key); } catch (e) { /* storage unavailable */ }
}
const myRole = () => (USERS().find(u => u.key === currentUserKey) || {}).role;
const canReview = () => ['Reviewer', 'Approver'].includes(myRole());
CHG.user = el => { setUser(el.value); closeDrawer(); closeModal(); renderShell(); render(); toast(`Signed in as ${ME} (${myRole()})`); };

/* ---------- Date helpers ---------- */
function addDays(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000); }
const today = () => ORG.asOf;

/* ---------- State migration: adds v2.1 keys to saved v1 state ---------- */
function migrate(s) {
  AGENTS.forEach(a => { if (!s.agents[a.id]) s.agents[a.id] = { enabled: true, runs: 0, last: '-', prompt: a.prompt }; });
  if (!s.requests) s.requests = seedRequests(s);
  if (!s.reviewNotes) s.reviewNotes = seedNotes();
  if (!s.time) s.time = seedTime(s);
  if (!s.mappings) s.mappings = {};
  s.ui.reqAudit = s.ui.reqAudit || 'AUD-2027-018';
  s.ui.reqFilter = s.ui.reqFilter || 'open';
  s.ui.fwFilter = s.ui.fwFilter || '';
  return s;
}

/* ---------- 2. Review notes and sign-off ---------- */
function seedNotes() {
  return [{ id: 'RN-001', audit: 'AUD-2027-018', control: 'C-06', by: PEOPLE.mgr, at: `${addDays(ORG.asOf, -1)} 17:20`, status: 'Open',
    text: 'Sample 7: confirm whether a documented delegate existed during the engineer\'s leave before you treat this as an operating exception rather than a design gap.', response: null }];
}
const notesFor = (aid, cid) => S.reviewNotes.filter(n => n.audit === aid && (!cid || n.control === cid));
const openNotes = (aid, cid) => notesFor(aid, cid).filter(n => n.status !== 'Cleared');
function signPill(f, aid, cid) {
  const n = openNotes(aid, cid).length;
  const so = f.signoffs || {};
  return (so.rev ? '<span class="pill good" title="Preparer and reviewer signed">Reviewed</span>' : so.prep ? '<span class="pill info" title="Awaiting reviewer sign-off">Prepared</span>' : '') +
    (n ? `<span class="pill warn" title="Open review notes">${n} note${n > 1 ? 's' : ''}</span>` : '');
}
function reviewPanel(a, c, f) {
  const so = f.signoffs || {}, notes = notesFor(a.id, c.id), open = openNotes(a.id, c.id);
  const sodBlock = so.prep && so.prep.by === ME;
  const revBlockers = [!f.conclusion && 'Conclusion is not signed', !so.prep && 'Preparer has not signed', open.length && `${open.length} review note${open.length > 1 ? 's are' : ' is'} not cleared`, !canReview() && `Your role (${myRole()}) cannot sign as reviewer`, sodBlock && 'You signed as preparer, so you cannot also review (segregation of duties)'].filter(Boolean);
  const step = (label, s, btn) => `<div class="card" style="flex:1 1 220px"><div class="small faint">${label}</div>${s ? `<div class="mt"><span class="pill good">Signed</span></div><div class="small mt">${esc(s.by)}<br><span class="faint">${s.at}</span></div>` : `<div class="mt"><span class="pill outline">Not signed</span></div>`}${btn || ''}</div>`;
  return `<div class="card mt"><div class="row between"><div><h3>Review and sign-off</h3><p class="small faint">Two-level sign-off with segregation of duties. Signed in as <b>${esc(ME)}</b> · ${myRole()}. Switch user in the top bar to act as preparer or reviewer.</p></div></div>
    <div class="row mt" style="align-items:stretch">
      ${step('1. Preparer sign-off', so.prep, !so.prep ? `<button class="btn sm primary mt" data-act="signPrep" ${f.conclusion ? '' : 'disabled title="Sign the conclusion first"'}>Sign as preparer</button>` : (!so.rev && so.prep.by === ME ? '<button class="btn sm mt" data-act="unsignPrep">Withdraw sign-off</button>' : ''))}
      ${step('2. Reviewer sign-off', so.rev, !so.rev ? `<button class="btn sm primary mt" data-act="signRev" ${revBlockers.length ? 'disabled' : ''}>Sign as reviewer</button>${revBlockers.length ? `<ul class="tiny faint" style="padding-left:16px;margin:6px 0 0">${revBlockers.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}` : '')}
    </div>
    <h4 class="mt2">Review notes <span class="small faint">${open.length} open of ${notes.length}</span></h4>
    ${notes.length ? notes.map(n => `<div class="lineage mt" style="padding:12px 14px"><div class="row between"><span class="id">${n.id} · raised by ${esc(n.by)} · ${n.at}</span><span class="pill ${n.status === 'Open' ? 'crit' : n.status === 'Addressed' ? 'warn' : 'good'}">${n.status}</span></div>
      <p class="small" style="margin:4px 0">${esc(n.text)}</p>
      ${n.response ? `<div class="small" style="border-left:3px solid var(--line);padding-left:8px"><b>Response</b> (${esc(n.respBy)}, ${n.respAt}): ${esc(n.response)}</div>` : ''}
      ${n.status === 'Cleared' ? `<div class="tiny faint">Cleared by ${esc(n.clearedBy)} at ${n.clearedAt}</div>` : ''}
      <div class="row mt">${n.status !== 'Cleared' ? `<input type="text" id="rn-resp-${n.id}" placeholder="Preparer response" style="flex:1 1 240px"><button class="btn sm" data-act="addressNote" data-id="${n.id}">Address</button>` : ''}
        ${n.status === 'Addressed' ? `<button class="btn sm primary" data-act="clearNote" data-id="${n.id}" ${canReview() && n.respBy !== ME ? '' : 'disabled title="Only a reviewer who did not write the response can clear"'}>Clear</button><button class="btn sm" data-act="reopenNote" data-id="${n.id}" ${canReview() ? '' : 'disabled'}>Reopen</button>` : ''}</div></div>`).join('') : '<p class="small faint">No review notes on this workpaper.</p>'}
    <div class="field mt2"><label for="rn-new">Raise a review note</label><textarea id="rn-new" placeholder="${canReview() ? 'What must the preparer fix or explain?' : 'Only reviewers and approvers raise notes'}" ${canReview() ? '' : 'disabled'}></textarea></div>
    <div class="row mt" style="justify-content:flex-end"><button class="btn" data-act="raiseNote" ${canReview() ? '' : 'disabled'}>Raise note</button></div></div>`;
}
const fwCur = () => ({ a: auditById(S.ui.fwAudit), cid: S.ui.fwControl, f: S.fieldwork[S.ui.fwAudit][S.ui.fwControl] });
ACT.signPrep = () => { const { a, cid, f } = fwCur(); f.signoffs = { prep: { by: ME, at: nowStr() } }; logDecision('Signed workpaper as preparer', `${a.id}/${cid}`); save(); render(); toast('Signed as preparer'); };
ACT.unsignPrep = () => { const { a, cid, f } = fwCur(); f.signoffs = {}; logDecision('Withdrew preparer sign-off', `${a.id}/${cid}`); save(); render(); };
ACT.signRev = () => {
  const { a, cid, f } = fwCur();
  if (!f.signoffs || !f.signoffs.prep || f.signoffs.prep.by === ME || !canReview() || openNotes(a.id, cid).length) { toast('Reviewer sign-off is blocked', 'warn'); return; }
  f.signoffs.rev = { by: ME, at: nowStr() }; logDecision('Signed workpaper as reviewer', `${a.id}/${cid}`, `preparer ${f.signoffs.prep.by}`); save(); render(); toast('Workpaper reviewed');
};
ACT.raiseNote = () => {
  const { a, cid, f } = fwCur(), t = $('#rn-new').value.trim();
  if (!t) { toast('Write the note first', 'warn'); return; }
  const id = nextId('RN', S.reviewNotes, 'id', 3);
  S.reviewNotes.push({ id, audit: a.id, control: cid, by: ME, at: nowStr(), status: 'Open', text: t, response: null });
  if (f.signoffs && f.signoffs.rev) { delete f.signoffs.rev; toast('Reviewer sign-off withdrawn because a new note was raised', 'warn'); }
  logDecision('Raised review note', `${a.id}/${cid}`, id); save(); render();
};
ACT.addressNote = el => {
  const n = S.reviewNotes.find(x => x.id === el.dataset.id), v = ($(`#rn-resp-${n.id}`) || {}).value;
  if (!v || !v.trim()) { toast('Write a response first', 'warn'); return; }
  Object.assign(n, { status: 'Addressed', response: v.trim(), respBy: ME, respAt: nowStr() }); logDecision('Addressed review note', `${n.audit}/${n.control}`, n.id); save(); render();
};
ACT.clearNote = el => { const n = S.reviewNotes.find(x => x.id === el.dataset.id); Object.assign(n, { status: 'Cleared', clearedBy: ME, clearedAt: nowStr() }); logDecision('Cleared review note', `${n.audit}/${n.control}`, n.id); save(); render(); };
ACT.reopenNote = el => { const n = S.reviewNotes.find(x => x.id === el.dataset.id); n.status = 'Open'; logDecision('Reopened review note', `${n.audit}/${n.control}`, n.id); save(); render(); };

/* Quality gate used before a final report is issued */
function issueGate(a) {
  const fw = S.fieldwork[a.id]; if (!fw) return [];
  const out = [];
  auditControls(a).filter(c => fw[c.id]).forEach(c => {
    const f = fw[c.id], so = f.signoffs || {};
    if (!f.conclusion) out.push(`${c.id}: conclusion not signed`);
    else if (!so.prep) out.push(`${c.id}: no preparer sign-off`);
    else if (!so.rev) out.push(`${c.id}: no reviewer sign-off`);
    const n = openNotes(a.id, c.id).length; if (n) out.push(`${c.id}: ${n} review note${n > 1 ? 's' : ''} not cleared`);
  });
  const reqs = S.requests.filter(r => r.audit === a.id && r.status !== 'Accepted');
  if (reqs.length) out.push(`${reqs.length} evidence request${reqs.length > 1 ? 's' : ''} not accepted (${reqs.map(r => r.id).join(', ')})`);
  return out;
}

/* ---------- 3. Evidence requests (PBC) ---------- */
const REQ_STATUSES = ['Draft', 'Sent', 'Submitted', 'Returned', 'Accepted'];
const reqOverdue = r => ['Sent', 'Returned'].includes(r.status) && r.due < today();
const reqStatus = r => reqOverdue(r) ? 'Overdue' : r.status;
const reqPill = s => `<span class="pill ${{ Draft: 'outline', Sent: 'info', Submitted: 'warn', Returned: 'crit', Accepted: 'good', Overdue: 'crit' }[s]}">${s === 'Submitted' ? 'Awaiting review' : s}</span>`;
function reqTemplates(c) {
  const n = c.nature === 'Automated' ? 1 : SAMPLE_SIZES[c.freq] || 5;
  return [
    { title: `${c.id} procedure and walkthrough evidence`, desc: `Current procedure for "${c.name}", the RACI or delegation for ${c.owner}, and the evidence produced for one walkthrough instance.` },
    { title: `${c.id} population and ${n} sample${n > 1 ? 's' : ''}`, desc: `System-generated population of every ${c.freq.toLowerCase()} instance in the audit period with the report parameters, then the sign-off evidence for the ${n} selected sample${n > 1 ? 's' : ''}.` }
  ];
}
function seedRequests(s) {
  const a = (s.audits || SEED_AUDITS).find(x => x.id === 'AUD-2027-018');
  if (!a) return [];
  const out = []; let k = 1;
  const plan = [['Accepted', -24, -14], ['Accepted', -24, -12], ['Submitted', -10, -1], ['Sent', -10, -3], ['Returned', -10, 2], ['Sent', -3, 5]];
  auditControls(a).forEach((c, ci) => reqTemplates(c).forEach((t, ti) => {
    const [status, req, due] = plan[(ci * 2 + ti) % plan.length];
    const id = `PBC-${String(k++).padStart(3, '0')}`, requested = addDays(ORG.asOf, req);
    const thread = [{ at: `${requested} 09:00`, who: PEOPLE.snr, msg: 'Request sent to owner.' }];
    const files = [];
    if (['Submitted', 'Accepted', 'Returned'].includes(status)) { files.push(`${c.id}-${ti ? 'population' : 'procedure'}.${ti ? 'xlsx' : 'pdf'}`); thread.push({ at: `${addDays(requested, 4)} 15:10`, who: c.owner, msg: 'Uploaded.' }); }
    if (status === 'Returned') thread.push({ at: `${addDays(requested, 5)} 10:30`, who: PEOPLE.snr, msg: 'Returned: population has no report parameters, so completeness cannot be confirmed. Please re-run with the parameters visible.' });
    if (status === 'Accepted') thread.push({ at: `${addDays(requested, 6)} 11:00`, who: PEOPLE.snr, msg: 'Accepted.' });
    out.push({ id, audit: a.id, control: c.id, title: t.title, desc: t.desc, owner: c.owner, requested, due: addDays(ORG.asOf, due), status, files, thread, reminders: status === 'Sent' && due < 0 ? 1 : 0 });
  }));
  return out;
}
RENDER.requests = () => {
  const auds = S.audits.filter(a => a.status !== 'Reported');
  if (!auds.find(a => a.id === S.ui.reqAudit)) S.ui.reqAudit = auds[0] ? auds[0].id : null;
  const a = auditById(S.ui.reqAudit);
  if (!a) return '<div class="page-head"><h1>Evidence requests</h1></div><div class="card empty">No open audit.</div>';
  const all = S.requests.filter(r => r.audit === a.id), f = S.ui.reqFilter;
  const list = all.filter(r => f === 'all' || (f === 'open' ? r.status !== 'Accepted' : f === 'review' ? r.status === 'Submitted' : f === 'overdue' ? reqOverdue(r) : true));
  const acc = all.filter(r => r.status === 'Accepted');
  const turn = acc.map(r => { const up = r.thread.find(t => t.who === r.owner); return up ? daysBetween(r.requested, up.at.slice(0, 10)) : null; }).filter(x => x != null);
  const drafts = all.filter(r => r.status === 'Draft').length;
  const missing = auditControls(a).filter(c => !all.some(r => r.control === c.id));
  return `<div class="page-head"><div><h1>Evidence requests</h1><p class="sub">Provided-by-client (PBC) requests to control owners. The Request List agent drafts them from the test scripts; you send, chase, and accept or return each upload. Reports cannot be issued while a request is open.</p></div>
    <select data-chg="reqAudit" style="width:auto" aria-label="Audit">${auds.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${x.id} · ${esc(x.title)}</option>`).join('')}</select></div>
  <div class="grid g4">${kpi('Open requests', all.length - acc.length, `of ${all.length} for ${a.id}`, all.length - acc.length ? 'warn' : 'good')}${kpi('Overdue', all.filter(reqOverdue).length, 'past due, not submitted', all.some(reqOverdue) ? 'crit' : 'good')}${kpi('Awaiting your review', all.filter(r => r.status === 'Submitted').length, 'owner has uploaded', 'acc')}${kpi('Avg turnaround', turn.length ? (turn.reduce((x, y) => x + y, 0) / turn.length).toFixed(1) + 'd' : 'n/a', 'request to upload, accepted only')}</div>
  <div class="card mt"><div class="row between"><div class="row">${[['open', 'Open'], ['review', 'Awaiting review'], ['overdue', 'Overdue'], ['all', 'All']].map(([k, l]) => `<button class="btn sm ${f === k ? 'on' : ''}" data-act="reqFilter" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="row">${missing.length ? `<button class="btn" data-act="genRequests">${icon('spark')} Draft requests for ${missing.length} control${missing.length > 1 ? 's' : ''}</button>` : ''}${drafts ? `<button class="btn primary" data-act="sendDrafts">Send ${drafts} draft${drafts > 1 ? 's' : ''}</button>` : ''}<button class="btn" data-act="remindOverdue" ${all.some(reqOverdue) ? '' : 'disabled'}>Remind overdue owners</button><button class="btn" data-act="copyRequests">${icon('copy')} Copy as CSV</button></div></div>
    <div class="table-wrap mt"><table><thead><tr><th>ID</th><th>Request</th><th>Owner</th><th>Due</th><th>Status</th><th>Files</th><th></th></tr></thead><tbody>
    ${list.length ? list.map(r => { const st = reqStatus(r), late = reqOverdue(r) ? daysBetween(r.due, today()) : 0; return `<tr class="${st === 'Overdue' ? 'stripe-crit' : ''}"><td class="mono small">${r.id}</td><td><a href="#requests" data-act="openRequest" data-id="${r.id}">${esc(r.title)}</a><div class="tiny faint">${r.control}</div></td><td class="small">${esc(r.owner)}</td><td class="mono small">${r.due}${late ? `<div class="tiny" style="color:var(--crit)">${late}d late${r.reminders ? ` · ${r.reminders} reminder${r.reminders > 1 ? 's' : ''}` : ''}</div>` : ''}</td><td>${reqPill(st)}</td><td class="small">${r.files.length || '<span class="faint">0</span>'}</td><td>${reqActions(r)}</td></tr>`; }).join('') : '<tr><td colspan="7" class="empty">Nothing in this view.</td></tr>'}
    </tbody></table></div></div>`;
};
function reqActions(r) {
  const b = (act, label, cls = '') => `<button class="btn sm ${cls}" data-act="${act}" data-id="${r.id}">${label}</button>`;
  if (r.status === 'Draft') return b('sendRequest', 'Send', 'primary');
  if (r.status === 'Sent' || r.status === 'Returned') return `<div class="row" style="flex-wrap:nowrap">${b('simUpload', 'Record upload')}${reqOverdue(r) ? b('remindRequest', 'Remind') : ''}</div>`;
  if (r.status === 'Submitted') return `<div class="row" style="flex-wrap:nowrap">${b('acceptRequest', 'Accept', 'primary')}${b('openRequest', 'Return…')}</div>`;
  return '<span class="tiny faint">done</span>';
}
const reqById = id => S.requests.find(r => r.id === id);
CHG.reqAudit = el => { S.ui.reqAudit = el.value; save(); render(); };
ACT.reqFilter = el => { S.ui.reqFilter = el.dataset.v; save(); render(); };
ACT.genRequests = async () => {
  const a = auditById(S.ui.reqAudit), missing = auditControls(a).filter(c => !S.requests.some(r => r.audit === a.id && r.control === c.id));
  try {
    const { output } = await AgentRuntime.run('pbc', { audit: a.id, controls: missing.map(c => c.id) }, { ms: 900, log: `Drafted ${missing.length * 2} requests for ${a.id}`, output: () => missing.flatMap(c => reqTemplates(c).map(t => ({ ...t, control: c.id, owner: c.owner }))) });
    output.forEach(t => S.requests.push({ id: nextId('PBC', S.requests, 'id', 3), audit: a.id, ...t, requested: today(), due: addDays(today(), 10), status: 'Draft', files: [], thread: [], reminders: 0, ai: true }));
    logDecision('Generated draft evidence requests', a.id, `${output.length} drafts`); save(); render(); toast(`${output.length} draft requests ready to send`);
  } catch (e) { /* agent disabled */ }
};
function sendReq(r) { r.status = 'Sent'; r.requested = today(); r.thread.push({ at: nowStr(), who: ME, msg: 'Request sent to owner.' }); }
ACT.sendRequest = el => { const r = reqById(el.dataset.id); sendReq(r); logDecision('Sent evidence request', r.id, r.owner); save(); render(); toast(`${r.id} sent to ${r.owner}`); };
ACT.sendDrafts = () => { const ds = S.requests.filter(r => r.audit === S.ui.reqAudit && r.status === 'Draft'); ds.forEach(sendReq); logDecision('Sent evidence requests', S.ui.reqAudit, `${ds.length} requests`); save(); render(); toast(`${ds.length} requests sent`); };
function remind(r) { r.reminders = (r.reminders || 0) + 1; r.thread.push({ at: nowStr(), who: ME, msg: `Reminder ${r.reminders}: this request is ${daysBetween(r.due, today())} days past due.` }); }
ACT.remindRequest = el => { const r = reqById(el.dataset.id); remind(r); logRun('Request List Agent', `Reminder sent for ${r.id} to ${r.owner}`, 'wr'); save(); render(); toast(`Reminder sent to ${r.owner}`); };
ACT.remindOverdue = () => { const od = S.requests.filter(r => r.audit === S.ui.reqAudit && reqOverdue(r)); od.forEach(remind); logRun('Request List Agent', `${od.length} reminders sent for ${S.ui.reqAudit}`, 'wr'); save(); render(); toast(`${od.length} reminder${od.length === 1 ? '' : 's'} sent`); };
ACT.simUpload = el => { const r = reqById(el.dataset.id); r.files.push(`${r.control}-upload-${r.files.length + 1}.pdf`); r.status = 'Submitted'; r.thread.push({ at: nowStr(), who: r.owner, msg: 'Uploaded (recorded by internal audit on the owner\'s behalf).' }); save(); render(); toast(`${r.id}: upload recorded`); };
ACT.acceptRequest = el => { const r = reqById(el.dataset.id); r.status = 'Accepted'; r.thread.push({ at: nowStr(), who: ME, msg: 'Accepted.' }); logDecision('Accepted evidence', r.id, r.files.join(', ')); save(); closeDrawer(); render(); toast(`${r.id} accepted`); };
ACT.returnRequest = el => {
  const r = reqById(el.dataset.id), why = ($('#req-why') || {}).value;
  if (!why || !why.trim()) { toast('Say why the evidence is returned', 'warn'); return; }
  r.status = 'Returned'; r.due = addDays(today(), 5); r.thread.push({ at: nowStr(), who: ME, msg: `Returned: ${why.trim()}` }); logDecision('Returned evidence', r.id, why.trim()); save(); closeDrawer(); render(); toast(`${r.id} returned to ${r.owner}`);
};
ACT.reqComment = el => { const r = reqById(el.dataset.id), v = $('#req-why').value.trim(); if (!v) return; r.thread.push({ at: nowStr(), who: ME, msg: v }); save(); ACT.openRequest(el); };
ACT.openRequest = el => {
  const r = reqById(el.dataset.id);
  openDrawer(`<div class="drawer-head"><div><div class="id">${r.id} · ${r.audit} · ${r.control}</div><h2>${esc(r.title)}</h2><div class="row" style="margin-top:6px">${reqPill(reqStatus(r))}${r.ai ? aiTag('Drafted by Request List Agent') : ''}<span class="small faint">Owner ${esc(r.owner)} · due ${r.due}</span></div></div><button class="x" data-act="closeDrawer" aria-label="Close">×</button></div>
  <div class="drawer-body"><p class="small">${esc(r.desc)}</p>
    <h4 class="mt">Files</h4>${r.files.length ? `<ul class="small">${r.files.map(x => `<li class="mono">${esc(x)}</li>`).join('')}</ul>` : '<p class="small faint">Nothing uploaded yet.</p>'}
    <h4 class="mt">Thread</h4>${r.thread.map(t => `<div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="faint mono">${t.at}</span> <b>${esc(t.who)}</b><div>${esc(t.msg)}</div></div>`).join('') || '<p class="small faint">No activity.</p>'}
    <div class="field mt"><label for="req-why">${r.status === 'Submitted' ? 'Comment, or reason for returning' : 'Comment'}</label><textarea id="req-why"></textarea></div>
    <div class="row mt" style="justify-content:flex-end"><button class="btn" data-act="reqComment" data-id="${r.id}">Add comment</button>${r.status === 'Submitted' ? `<button class="btn danger" data-act="returnRequest" data-id="${r.id}">Return to owner</button><button class="btn primary" data-act="acceptRequest" data-id="${r.id}">Accept</button>` : ''}</div></div>`);
};
ACT.copyRequests = () => {
  const rows = [['ID', 'Audit', 'Control', 'Request', 'Owner', 'Requested', 'Due', 'Status', 'Reminders', 'Files']].concat(S.requests.filter(r => r.audit === S.ui.reqAudit).map(r => [r.id, r.audit, r.control, r.title, r.owner, r.requested, r.due, reqStatus(r), r.reminders || 0, r.files.join('; ')]));
  copyText(rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n'));
};

/* ---------- 4. Time and budget ---------- */
const PHASES = ['Planning', 'Fieldwork', 'Reporting'];
const WEEKLY_CAPACITY = 32; /* chargeable hours per auditor per week */
function seedTime(s) {
  const budgets = {}, entries = []; let k = 1;
  const add = (audit, who, phase, daysAgo, hours, note) => entries.push({ id: `T-${String(k++).padStart(4, '0')}`, audit, who, phase, date: addDays(ORG.asOf, -daysAgo), hours, note });
  (s.audits || SEED_AUDITS).forEach(a => { budgets[a.id] = { Planning: 60, Fieldwork: 180, Reporting: 40 }; });
  [[30, PEOPLE.snr, 22], [28, PEOPLE.mgr, 14], [26, PEOPLE.snr, 18], [24, PEOPLE.mgr, 10]].forEach(([d, w, h]) => add('AUD-2027-018', w, 'Planning', d, h, 'Scoping, memo and RCM'));
  for (let w = 0; w < 4; w++) { add('AUD-2027-018', PEOPLE.snr, 'Fieldwork', 3 + w * 7, 26 - w * 2, 'Walkthroughs and sample testing'); add('AUD-2027-018', PEOPLE.mgr, 'Fieldwork', 4 + w * 7, 6, 'Review of workpapers'); }
  if (budgets['AUD-2026-044']) { budgets['AUD-2026-044'] = { Planning: 40, Fieldwork: 120, Reporting: 30 }; [['Planning', 38], ['Fieldwork', 131], ['Reporting', 27]].forEach(([p, h], i) => add('AUD-2026-044', PEOPLE.mgr, p, 150 - i * 30, h, 'Completed audit')); }
  add('AUD-2027-021', PEOPLE.mgr, 'Planning', 2, 4, 'Pre-planning call with CISO');
  return { budgets, entries };
}
function auditHours(aid) { const by = {}; PHASES.forEach(p => { by[p] = 0; }); S.time.entries.filter(e => e.audit === aid).forEach(e => { by[e.phase] += e.hours; }); return by; }
function fieldworkProgress(a) {
  const fw = S.fieldwork[a.id]; if (a.status === 'Reported') return 1; if (!fw) return 0;
  const cs = auditControls(a).filter(c => fw[c.id]); if (!cs.length) return 0;
  const pts = cs.reduce((s, c) => { const f = fw[c.id]; return s + (f.signoffs && f.signoffs.rev ? 1 : f.conclusion ? 0.8 : f.toe && f.toe.done ? 0.6 : f.tod && f.tod.accepted ? 0.3 : 0); }, 0);
  return pts / cs.length;
}
function eac(a) {
  const act = auditHours(a.id), bud = S.time.budgets[a.id] || { Planning: 0, Fieldwork: 0, Reporting: 0 };
  if (a.status === 'Reported') return PHASES.reduce((s, p) => s + act[p], 0);
  const planDone = (a.planning && a.planning.step >= 7) || ['Fieldwork', 'Reporting'].includes(a.status);
  const prog = fieldworkProgress(a);
  const plan = planDone ? act.Planning : Math.max(act.Planning, bud.Planning);
  const fwk = prog > 0.05 ? Math.max(act.Fieldwork / prog, act.Fieldwork) : Math.max(act.Fieldwork, bud.Fieldwork);
  return Math.round(plan + fwk + Math.max(act.Reporting, bud.Reporting));
}
RENDER.resources = () => {
  const rows = S.audits.map(a => { const act = auditHours(a.id), bud = S.time.budgets[a.id] || { Planning: 0, Fieldwork: 0, Reporting: 0 }, B = PHASES.reduce((s, p) => s + (+bud[p] || 0), 0), A = PHASES.reduce((s, p) => s + act[p], 0), E = eac(a); return { a, act, bud, B, A, E, v: B ? (E - B) / B : 0 }; });
  const totB = rows.reduce((s, r) => s + r.B, 0), totA = rows.reduce((s, r) => s + r.A, 0), over = rows.filter(r => r.v > 0.1 && r.a.status !== 'Reported');
  const since = addDays(today(), -28);
  const people = USERS().map(u => { const h = S.time.entries.filter(e => e.who === u.name && e.date > since).reduce((s, e) => s + e.hours, 0); return { u, h, util: h / (WEEKLY_CAPACITY * 4) }; });
  const bar = (v, max, cls) => `<div style="height:8px;background:var(--surface-2);border-radius:99px;overflow:hidden;min-width:90px"><div style="height:100%;width:${Math.min(100, max ? v / max * 100 : 0)}%;background:var(--${cls})"></div></div>`;
  const recent = S.time.entries.slice().sort((x, y) => y.date.localeCompare(x.date)).slice(0, 8);
  return `<div class="page-head"><div><h1>Time and budget</h1><p class="sub">Budgeted hours by phase, actuals from timesheets, and an estimate at completion (EAC) that projects fieldwork hours from workpaper progress. Audits forecast to run more than 10% over budget are flagged.</p></div></div>
  <div class="grid g4">${kpi('Budgeted hours', totB, `${S.audits.length} audits in the plan`)}${kpi('Hours logged', totA, `${totB ? Math.round(totA / totB * 100) : 0}% of plan budget`, 'acc')}${kpi('Forecast over budget', over.length, '> 10% at completion', over.length ? 'crit' : 'good')}${kpi('Team utilisation', Math.round(people.reduce((s, p) => s + p.util, 0) / people.length * 100) + '%', `last 4 weeks vs ${WEEKLY_CAPACITY}h/week`)}</div>
  <div class="card mt"><h3>Budget vs actual by audit</h3><div class="table-wrap mt"><table><thead><tr><th>Audit</th><th>Status</th>${PHASES.map(p => `<th>${p}<div class="tiny faint">actual / budget</div></th>`).join('')}<th>Total</th><th>Progress</th><th>EAC</th><th>Variance</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td class="small"><span class="id">${r.a.id}</span><br>${esc(r.a.title)}</td><td><span class="pill outline">${r.a.status}</span></td>
    ${PHASES.map(p => `<td class="small"><span class="mono" style="${r.act[p] > r.bud[p] ? 'color:var(--crit)' : ''}">${r.act[p]}</span> / <input type="number" min="0" step="4" value="${r.bud[p]}" data-chg="budget" data-id="${r.a.id}" data-phase="${p}" style="width:64px;padding:3px 5px" aria-label="${p} budget for ${r.a.id}">${bar(r.act[p], r.bud[p], r.act[p] > r.bud[p] ? 'crit' : 'accent')}</td>`).join('')}
    <td class="mono small">${r.A} / ${r.B}</td><td class="small">${Math.round(fieldworkProgress(r.a) * 100)}%</td><td class="mono small">${r.E}</td><td>${r.B ? `<span class="pill ${r.v > 0.1 ? 'crit' : r.v > 0 ? 'warn' : 'good'}">${r.v > 0 ? '+' : ''}${Math.round(r.v * 100)}%</span>` : '<span class="faint">n/a</span>'}</td></tr>`).join('')}
  </tbody></table></div><p class="tiny faint mt">EAC = planning actual (or budget if planning is open) + fieldwork actual ÷ workpaper progress + reporting budget. Progress weights: TOD accepted 30%, TOE done 60%, concluded 80%, reviewed 100%.</p></div>
  <div class="grid g2 mt"><div class="card"><h3>Log time</h3><p class="small faint">Logged as ${esc(ME)}.</p>
    <div class="grid g2 mt"><div class="field"><label for="t-aud">Audit</label><select id="t-aud">${S.audits.filter(a => a.status !== 'Reported').map(a => `<option value="${a.id}">${a.id} · ${esc(a.title)}</option>`).join('')}</select></div><div class="field"><label for="t-ph">Phase</label><select id="t-ph">${PHASES.map(p => `<option>${p}</option>`).join('')}</select></div>
    <div class="field"><label for="t-h">Hours</label><input type="number" id="t-h" min="0.5" max="24" step="0.5" value="4"></div><div class="field"><label for="t-d">Date</label><input type="text" id="t-d" value="${today()}"></div></div>
    <div class="field mt"><label for="t-n">Note</label><input type="text" id="t-n" placeholder="What you worked on"></div><div class="row mt" style="justify-content:flex-end"><button class="btn primary" data-act="logTime">Log time</button></div></div>
    <div class="card"><h3>Team utilisation</h3><p class="small faint">Chargeable hours in the last 4 weeks against ${WEEKLY_CAPACITY * 4}h capacity.</p>
    ${people.map(p => `<div class="mt"><div class="row between small"><span>${esc(p.u.name)} · ${p.u.role}</span><span class="mono">${p.h}h · ${Math.round(p.util * 100)}%</span></div>${bar(p.h, WEEKLY_CAPACITY * 4, p.util > 1 ? 'crit' : p.util > 0.85 ? 'warn' : 'accent')}</div>`).join('')}
    <h4 class="mt2">Recent entries</h4><div class="table-wrap"><table><tbody>${recent.map(e => `<tr><td class="mono tiny">${e.date}</td><td class="small">${esc(e.who)}</td><td class="mono tiny">${e.audit}</td><td class="small">${e.phase}</td><td class="mono small">${e.hours}h</td></tr>`).join('')}</tbody></table></div></div></div>`;
};
CHG.budget = el => { const v = Math.max(0, +el.value || 0); S.time.budgets[el.dataset.id] = S.time.budgets[el.dataset.id] || { Planning: 0, Fieldwork: 0, Reporting: 0 }; S.time.budgets[el.dataset.id][el.dataset.phase] = v; logDecision('Changed audit budget', el.dataset.id, `${el.dataset.phase} ${v}h`); save(); render(); };
ACT.logTime = () => {
  const h = +$('#t-h').value, d = $('#t-d').value.trim();
  if (!(h > 0 && h <= 24)) { toast('Hours must be between 0.5 and 24', 'warn'); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { toast('Date must be YYYY-MM-DD', 'warn'); return; }
  S.time.entries.push({ id: nextId('T', S.time.entries), audit: $('#t-aud').value, who: ME, phase: $('#t-ph').value, date: d, hours: h, note: $('#t-n').value.trim() });
  save(); render(); toast(`${h}h logged`);
};

/* ---------- 5. Framework crosswalk ---------- */
const COSO = { 4: 'P4 Commitment to competence', 7: 'P7 Identifies and analyzes risk', 10: 'P10 Selects and develops control activities', 11: 'P11 General controls over technology', 12: 'P12 Deploys through policies and procedures', 13: 'P13 Uses relevant information', 16: 'P16 Ongoing and separate evaluations' };
const L1_COSO = { 'Strategic Risks': 7, 'Financial Risks': 13, 'Operational Risks': 12, 'Compliance Risks': 12, 'Technology Risks': 11, 'Human Capital Risks': 4 };
function frameworksFor(c) {
  const r = riskById(c.risk) || {}, out = [{ fw: 'COSO 2013', ref: COSO[10] }, { fw: 'COSO 2013', ref: COSO[L1_COSO[r.l1]] || COSO[12] }];
  if (c.type === 'Detective') out.push({ fw: 'COSO 2013', ref: COSO[16] });
  if (r.l1 === 'Technology Risks' || c.nature !== 'Manual') out.push({ fw: 'NIST CSF 2.0', ref: c.type === 'Preventive' ? 'PR Protect' : 'DE Detect' });
  if (r.l1 === 'Financial Risks') out.push({ fw: 'SOX ICFR', ref: 'Key control candidate' });
  return out.filter((x, i, arr) => arr.findIndex(y => y.fw === x.fw && y.ref === x.ref) === i);
}
function latestConclusion(cid) {
  let best = null;
  Object.entries(S.fieldwork).forEach(([aid, fw]) => { const f = fw[cid]; if (f && f.conclusion && (!best || f.conclusion.at > best.at)) best = { ...f.conclusion, audit: aid, reviewed: !!(f.signoffs && f.signoffs.rev) }; });
  return best;
}
RENDER.frameworks = () => {
  const fwNames = ['COSO 2013', 'NIST CSF 2.0', 'SOX ICFR'], filt = S.ui.fwFilter;
  const rows = CONTROLS.map(c => ({ c, maps: frameworksFor(c), con: latestConclusion(c.id), m: S.mappings[c.id] })).filter(r => !filt || r.maps.some(x => x.fw === filt));
  const stats = fwNames.map(n => { const cs = CONTROLS.filter(c => frameworksFor(c).some(x => x.fw === n)); const t = cs.filter(c => latestConclusion(c.id)); const e = t.filter(c => latestConclusion(c.id).result === 'Effective'); return { n, total: cs.length, tested: t.length, eff: e.length }; });
  const conPill = con => !con ? '<span class="pill outline">Not tested</span>' : fwPill(con.result) + (con.reviewed ? '' : ' <span class="tiny faint">not reviewed</span>');
  return `<div class="page-head"><div><h1>Framework crosswalk</h1><p class="sub">Test once, report against many frameworks. Each control's latest signed conclusion flows to every framework it maps to. Mappings are rule-based suggestions; confirm each one before you rely on it.</p></div>
    <select data-chg="fwFilter" style="width:auto" aria-label="Framework"><option value="">All frameworks</option>${fwNames.map(n => `<option ${filt === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
  <div class="grid g3">${stats.map(s => kpi(s.n, `${s.tested}/${s.total}`, `controls tested · ${s.eff} effective`, s.tested < s.total ? 'warn' : 'good')).join('')}</div>
  <div class="card mt"><div class="table-wrap"><table><thead><tr><th>Control</th><th>Risk</th><th>Mapped requirements</th><th>Latest conclusion</th><th>Mapping</th></tr></thead><tbody>
  ${rows.map(({ c, maps, con, m }) => `<tr><td class="small"><span class="id">${c.id}</span><br>${esc(c.name)}<div class="tiny faint">${c.type} · ${c.nature} · ${c.freq}</div></td><td class="small"><span class="id">${c.risk}</span><br>${catDot(riskById(c.risk).l1)}</td>
    <td class="small">${maps.map(x => `<div><b>${x.fw}</b> ${esc(x.ref)}</div>`).join('')}</td><td class="small">${conPill(con)}${con ? `<div class="tiny faint">${con.audit} · ${con.at}</div>` : ''}</td>
    <td>${m ? `<span class="pill good">Confirmed</span><div class="tiny faint">${esc(m.by)}</div>` : `<button class="btn sm" data-act="confirmMap" data-id="${c.id}" ${canReview() ? '' : 'disabled title="Reviewer or approver role needed"'}>Confirm</button>`}</td></tr>`).join('')}
  </tbody></table></div><p class="tiny faint mt">Rules: every control maps to COSO P10; L1 category adds a second COSO principle; detective controls add P16; technology or IT-dependent controls map to the NIST CSF 2.0 Protect or Detect function; Financial risk controls are flagged as SOX ICFR key-control candidates.</p></div>`;
};
CHG.fwFilter = el => { S.ui.fwFilter = el.value; save(); render(); };
ACT.confirmMap = el => { S.mappings[el.dataset.id] = { by: ME, at: nowStr() }; logDecision('Confirmed framework mapping', el.dataset.id, frameworksFor(CONTROLS.find(c => c.id === el.dataset.id)).map(x => x.fw + ' ' + x.ref.split(' ')[0]).join(', ')); save(); render(); };
