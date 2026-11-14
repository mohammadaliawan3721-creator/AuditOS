/* =====================================================================
   AuditOS datasets. Each industry is one file in src/data/ that
   registers DATASETS.<key>. Every company, person, figure, source and
   URL in the datasets is fictional demo data.
   ===================================================================== */
const DATASETS = {};
const INDUSTRIES = [['crypto', 'Crypto exchange'], ['mfg', 'Manufacturing'], ['retail', 'Retail'], ['fs', 'Financial services']];
let ORG, PEOPLE, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST;
let IND = 'crypto';
function applyDataset(k) {
  IND = DATASETS[k] ? k : 'crypto';
  ({ ORG, PEOPLE, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST } = DATASETS[IND]);
}

/* Builders used by the industry files to keep them short */
const src = (type, agent, conf, date, finding, ref) => ({ type, agent, conf, date, finding, ref });
const R = (id, title, l1, l2, owner, L, I, band, confirmed, identified, velocity, desc, sources) => ({ id, title, l1, l2, desc, owner, L, I, band, status: 'Active', confirmed, identified, velocity, sources });
const C = (id, risk, name, type, nature, freq, owner) => ({ id, risk, name, type, nature, freq, owner });
const CAND = (cid, title, desc, l1, l2, agent, conf, severity, risk, score, source, auto) => ({ cid, title, desc, l1, l2, agent, conf, severity, match: { risk, score }, source, decision: auto ? 'Merged' : null, auto: !!auto });
const SIG = (title, desc, l1, l2, agent, severity, near) => ({ title, desc, l1, l2, agent, severity, near });
const ISSUE = (id, title, audit, risk, rating, owner, due, status, condition, criteria, cause, consequence, action, created) => ({ id, title, audit, risk, rating, owner, due, status, condition, criteria, cause, consequence, action, created });
const SAMPLE_DATES = ['2026-07-03', '2026-07-16', '2026-07-29', '2026-08-07', '2026-08-19', '2026-08-28', '2026-09-04', '2026-09-15', '2026-09-24', '2026-10-02', '2026-10-09', '2026-10-17', '2026-10-23', '2026-10-30', '2026-11-06'];
/* Exceptions sit at samples 4, 7 and 12 in every dataset: 4 and 12 miss the escalation, 7 has no review evidence */
function mkSamples(prefix, m1, m2, notes) {
  return SAMPLE_DATES.map((d, i) => {
    const noReview = i === 6;
    return { d, m1: m1[i], m2: m2[i], reviewed: !noReview, esc: !(i === 3 || i === 6 || i === 11), ev: noReview ? null : `${prefix}-${d.slice(5).replace('-', '')}.pdf`, note: notes[i] };
  });
}

/* Shared reference data, agent registry and dataset switching. */
const L1_COLORS = {
  'Strategic Risks': 'var(--cat1)', 'Financial Risks': 'var(--cat2)', 'Operational Risks': 'var(--cat3)',
  'Compliance Risks': 'var(--cat4)', 'Technology Risks': 'var(--cat5)', 'Human Capital Risks': 'var(--cat6)'
};

const LIKELIHOOD = [
  { v: 1, name: 'Rare', desc: 'Occurs only in exceptional circumstances; no recent history in comparable firms.' },
  { v: 2, name: 'Unlikely', desc: 'Could occur but not expected; isolated past occurrence.' },
  { v: 3, name: 'Possible', desc: 'Could occur; some evidence of occurrence in similar contexts.' },
  { v: 4, name: 'Likely', desc: 'Will probably occur; recent pattern or worsening trend.' },
  { v: 5, name: 'Almost certain', desc: 'Expected to occur; current conditions make occurrence near-inevitable.' }
];
const IMPACT = [
  { v: 1, name: 'Insignificant', desc: 'Negligible financial, operational or regulatory consequence (< 0.1% of net income).' },
  { v: 2, name: 'Minor', desc: 'Localised impact, absorbed within existing processes (0.1% to 0.5% of net income).' },
  { v: 3, name: 'Moderate', desc: 'Noticeable impact needing management attention (0.5% to 2% of net income).' },
  { v: 4, name: 'Major', desc: 'Material impact; likely regulatory or external attention (2% to 5% of net income).' },
  { v: 5, name: 'Catastrophic', desc: 'Severe or irreversible; enterprise-wide or licence-threatening (> 5% of net income).' }
];
const CONTROL_BANDS = [
  { key: 'Unknown', reduction: null, desc: 'Controls not yet rated. Residual is N/A and appetite reads the inherent score.' },
  { key: 'Limited', reduction: 0.10, desc: 'Key controls missing or not operating. 10% reduction.' },
  { key: 'Moderate', reduction: 0.30, desc: 'Controls designed adequately, improvement needed. 30% reduction.' },
  { key: 'Strong', reduction: 0.50, desc: 'Controls designed and operating effectively, tested. 50% reduction.' }
];

/* Sample sizes by control frequency (configurable methodology table) */
const SAMPLE_SIZES = { 'Annual': 1, 'Quarterly': 2, 'Monthly': 2, 'Weekly': 5, 'Daily': 15, 'Recurring': 25, 'Event-driven': 10 };

/* =====================================================================
   AGENT REGISTRY. Each agent has a role, a system prompt, typed inputs and
   outputs, and a human gate. In simulated mode the runtime returns
   deterministic demo output; in live mode it posts the same payload to
   the backend endpoint (see AgentRuntime in app.js).
   ===================================================================== */
const AGENTS = [
  { id: 'threats', name: 'Threats Agent', module: 'Risk sensing', kind: 'Sensing', icon: 'radar',
    purpose: 'Scans threat intelligence, vulnerability databases and outage feeds for exposures relevant to the firm\'s technology estate and vendors.',
    inputs: ['Vendor inventory', 'Technology asset list', 'Threat and vulnerability feeds'], outputs: ['Candidate risk', 'Evidence with URL', 'Confidence 0 to 1'],
    gate: 'Candidates go to the consolidation agent; nothing reaches the register without a reviewer or an auto-merge rule.',
    prompt: 'You are a threat-intelligence analyst for the internal audit function of {org}. From the feed items provided, identify exposures that affect the listed assets or vendors. For each, return JSON {title, description, l1, l2, severity, evidence:[{url, quote<=25 words}], confidence}. Ignore items that do not name an asset, vendor or technology the firm uses. Never invent a source.' },
  { id: 'scandals', name: 'Scandals Agent', module: 'Risk sensing', kind: 'Sensing', icon: 'news',
    purpose: 'Monitors news, enforcement actions and peer incidents for events that suggest the same risk could arise at the firm.',
    inputs: ['News and enforcement feeds', 'Peer group list'], outputs: ['Candidate risk', 'Peer event evidence'],
    gate: 'Flags false positives such as demo material or unrelated companies with the same name.',
    prompt: 'You review news about peer companies in the same industry. Return only events where the failure mode plausibly exists at {org}. Explain the transfer logic in one sentence. Mark entity-match uncertainty explicitly.' },
  { id: 'regulations', name: 'Regulations Agent', module: 'Risk sensing', kind: 'Sensing', icon: 'scale',
    purpose: 'Reads regulator publications, consultations and final rules, and extracts obligations with effective dates.',
    inputs: ['Regulator publication feeds', 'Obligations register'], outputs: ['Candidate risk', 'Obligation, effective date, source'],
    gate: 'Distinguishes final rules from consultations and guidance; labels each.',
    prompt: 'You are a regulatory change analyst. For each publication, state: instrument type (law, rule, guidance, consultation), effective date, obligations created, and which taxonomy L2 it affects. Do not treat a consultation as binding.' },
  { id: 'market', name: 'Market Signals Agent', module: 'Risk sensing', kind: 'Sensing', icon: 'chart',
    purpose: 'Tracks market and funding indicators that may move financial risks.', inputs: ['Market data feeds'], outputs: ['Candidate risk', 'Indicator movement'],
    gate: 'Reports movements only beyond configured tolerance.', prompt: 'Summarise indicator movements beyond tolerance and the financial risk they affect. Quantify each move.' },
  { id: 'pyextract', name: 'PY Audit Extractor', module: 'Risk sensing', kind: 'Extraction', icon: 'doc',
    purpose: 'Extracts prior-year audit findings, ratings and open actions from past reports.', inputs: ['Prior-year audit reports (PDF/DOCX)'], outputs: ['Finding, rating, page reference'],
    gate: 'Every extracted finding carries a page reference to the source report.', prompt: 'Extract each finding with ID, title, rating, root cause and page number. Quote no more than 25 words. Return JSON.' },
  { id: 'transcript', name: 'Transcript Extractor', module: 'Risk sensing', kind: 'Extraction', icon: 'mic',
    purpose: 'Turns risk-assessment interview transcripts into structured risk statements.', inputs: ['Interview transcripts'], outputs: ['Risk statement', 'Speaker and timestamp'],
    gate: 'Separates fact stated by the interviewee from the agent\'s inference.', prompt: 'From the transcript, extract risks the interviewee describes. For each, cite speaker and timestamp, and mark whether the risk is stated or inferred.' },
  { id: 'kri', name: 'KRI Monitor', module: 'Risk sensing', kind: 'Monitoring', icon: 'pulse',
    purpose: 'Reads key risk indicator feeds and raises a signal when a threshold is breached.', inputs: ['KRI feeds'], outputs: ['Breach signal linked to a register risk'],
    gate: 'Deterministic rule; no generative output.', prompt: 'Rule-based: value compared with threshold per KRI definition.' },
  { id: 'consolidate', name: 'Consolidation Agent', module: 'Risk sensing', kind: 'Orchestrator', icon: 'merge',
    purpose: 'Deduplicates candidates, matches them to the register and routes them: auto-merge, reviewer decision or new risk.', inputs: ['Candidate risks', 'Risk register', 'Taxonomy'], outputs: ['Match score', 'Routing decision', 'Taxonomy mapping'],
    gate: 'Auto-merge only at or above the auto-merge threshold; partial matches always need a reviewer; auto-merges can be reversed.',
    prompt: 'Compare the candidate with each register risk on cause, event and consequence. Return the best match and a 0 to 1 similarity with a one-line rationale. Map the candidate to taxonomy L1/L2.' },
  { id: 'scoring', name: 'Scoring Agent', module: 'Risk assessment', kind: 'Assessment', icon: 'grid',
    purpose: 'Proposes likelihood and impact against the firm\'s scoring criteria, citing evidence.', inputs: ['Risk with sources', 'Scoring scales'], outputs: ['Likelihood, impact, rationale, confidence'],
    gate: 'Proposes inherent scores only. Residual comes from the control band the reviewer selects.',
    prompt: 'Score likelihood and impact on the firm\'s 1 to 5 scales. Quote the scale level descriptions you relied on. List counter-signals. Never propose a residual score.' },
  { id: 'planner', name: 'Plan Generator', module: 'Audit planning', kind: 'Planning', icon: 'calendar',
    purpose: 'Selects above-appetite (and optionally near) risks, groups them by L1 domain and names proposed audits.', inputs: ['Risk register', 'Appetite settings'], outputs: ['Proposed audits with attached risks'],
    gate: 'Audits are created only when the reviewer clicks Generate.', prompt: 'Group the selected risks by L1. Name each audit by its dominant theme in five words or fewer and write a one-sentence scope.' },
  { id: 'riskstmt', name: 'Risk Statement Writer', module: 'Audit planning', kind: 'Planning', icon: 'pen',
    purpose: 'Writes cause, event, consequence risk statements for the audit scope.', inputs: ['Audit risks', 'Uploaded documents'], outputs: ['Risk statements'],
    gate: 'Reviewer approves each step before the next runs.', prompt: 'Write each risk as: "Because of <cause>, <event> may occur, leading to <consequence>." Use only facts in the inputs.' },
  { id: 'controls', name: 'Controls Agent', module: 'Audit planning', kind: 'Planning', icon: 'shield',
    purpose: 'Maps expected key controls to each risk from the control library and documents.', inputs: ['Risk statements', 'Control library', 'Policies'], outputs: ['Key controls with type, nature, frequency, owner'],
    gate: 'Flags risks with no mapped control as design gaps.', prompt: 'For each risk, list key controls with objective, type, nature, frequency and owner. Flag any risk without a control.' },
  { id: 'memo', name: 'Planning Memo Writer', module: 'Audit planning', kind: 'Planning', icon: 'doc',
    purpose: 'Drafts the audit planning memorandum: objective, scope, risks, approach, team and timetable.', inputs: ['Risks', 'Controls', 'Audit details'], outputs: ['Planning memo'],
    gate: 'Placeholder fields are left visible for the reviewer.', prompt: 'Draft the planning memo in the firm\'s template. Leave unknown fields as [placeholders]; never invent names or dates.' },
  { id: 'rcm', name: 'RCM Builder', module: 'Audit planning', kind: 'Planning', icon: 'table',
    purpose: 'Builds the risk and control matrix with assertions and test approach.', inputs: ['Risks', 'Controls'], outputs: ['RCM rows'],
    gate: 'One row per risk-control pair.', prompt: 'Build the RCM: risk, control, type, nature, frequency, owner, test approach (TOD, TOE), sample size per methodology table.' },
  { id: 'testscript', name: 'Test Script Writer', module: 'Audit planning', kind: 'Planning', icon: 'list',
    purpose: 'Writes test of design and test of operating effectiveness steps for each control.', inputs: ['RCM'], outputs: ['TOD and TOE steps, attributes, evidence request list'],
    gate: 'Each attribute must be observable in evidence.', prompt: 'For each control, write TOD steps and TOE attributes that can be checked against evidence. Include the document request list.' },
  { id: 'dyntest', name: 'Dynamic Testing Agent', module: 'Fieldwork', kind: 'Testing', icon: 'check',
    purpose: 'Reads sample evidence, checks each test attribute and explains every pass or exception with a reference.', inputs: ['Samples', 'Evidence files', 'Test attributes'], outputs: ['Attribute results per sample', 'Exception rationale'],
    gate: 'Proposes results. The auditor accepts or overrides each sample and signs the conclusion.', prompt: 'For each sample, check each attribute against the evidence. Return pass, exception or not determinable, with the evidence reference and a one-line reason.' },
  { id: 'issue', name: 'Issue Drafting Agent', module: 'Issues management', kind: 'Reporting', icon: 'flag',
    purpose: 'Drafts issues in condition, criteria, cause, consequence and action format from test exceptions.', inputs: ['Test exceptions', 'Policy criteria'], outputs: ['Draft issue', 'Proposed rating'],
    gate: 'Draft only. Rating and wording are approved by the auditor and agreed with management.', prompt: 'Draft the issue in 5C format from the exceptions. Quantify the condition. Propose a rating with justification against the rating scale.' },
  { id: 'report', name: 'Report Writer', module: 'Audit reporting', kind: 'Reporting', icon: 'book',
    purpose: 'Assembles the audit report and the Audit Committee summary from approved issues and test results.', inputs: ['Approved issues', 'Test conclusions'], outputs: ['Report draft', 'AC summary'],
    gate: 'Uses only approved issues; unapproved drafts are excluded.', prompt: 'Write the executive summary: overall rating, what happened, why it matters, management actions and dates. 150 words maximum.' }
];
