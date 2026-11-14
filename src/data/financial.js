/* Financial services: Harbourline Financial Group (fictional mid-size bank). */
DATASETS.fs = (() => {
const ORG = { name: 'Harbourline Financial Group', short: 'Harbourline', fy: 'FY2027', asOf: '2026-11-14', industry: 'Financial services', label: 'Bank (Harbourline)' };

const PEOPLE = {
  cae: 'R. Okafor (CAE)', mgr: 'L. Varga (IA Manager)', snr: 'S. Haddad (Senior Auditor)',
  cro: 'M. Lindqvist (CRO)', cco: 'A. Mensah (CCO)', mlro: 'J. Petit (MLRO)', ciso: 'K. Tanaka (CISO)',
  coo: 'D. Brennan (COO)', cfo: 'P. Iyer (CFO)', chro: 'E. Novak (CHRO)', cto: 'T. Rahman (CTO)'
};

const TAXONOMY = {
  'Strategic Risks': ['Competitive Landscape', 'Corporate Strategy', 'Geopolitical', 'Product Innovation', 'ESG Disclosure', 'Customer Experience'],
  'Financial Risks': ['Liquidity', 'Capital Allocation', 'Credit', 'Market', 'Financial Reporting', 'Accounting Information'],
  'Operational Risks': ['Third Party', 'Business Continuity', 'Outsourcing', 'Payments Operations', 'Data Center Vendor', 'Process Execution'],
  'Compliance Risks': ['Regulatory Compliance', 'Regulatory Change', 'Financial Crime (AML/CFT)', 'Sanctions', 'Consumer Protection', 'Data Protection'],
  'Technology Risks': ['Cybersecurity', 'IT Operations', 'Data Integrity', 'Emerging Technology', 'Identity and Access'],
  'Human Capital Risks': ['Succession', 'Talent Shortage', 'Conduct and Culture', 'Training']
};
/* Source type labels mirror the agent that produced the evidence */
const RISKS = [
  { id: 'RISK-0101', title: 'Regulatory Change and Compliance Exposure', l1: 'Compliance Risks', l2: 'Regulatory Change',
    desc: 'New conduct, operational-resilience and reporting rules take effect in 2027. The regulatory change inventory is incomplete and obligations are not yet mapped to control owners, so the firm could miss effective dates.',
    owner: PEOPLE.cco, L: 4, I: 4, band: 'Unknown', status: 'Active', confirmed: true, identified: '2026-10-02', velocity: 'High',
    sources: [
      { type: 'External risk', agent: 'Regulations Agent', conf: 0.82, date: '2026-11-03', finding: 'Three consultation papers finalised with 2027 effective dates affecting conduct reporting and incident notification.', ref: 'https://regwatch.example/notices/2026-118' },
      { type: 'PY audit finding', agent: 'PY Audit Extractor', conf: 0.9, date: '2026-10-02', finding: 'FY2026 finding IA-26-07: regulatory change log not reconciled to the obligations register.', ref: 'FY2026 Internal Audit Findings Summary, p.6' }
    ] },
  { id: 'RISK-0102', title: 'Third-Party and Operational Resilience Exposure', l1: 'Operational Risks', l2: 'Third Party',
    desc: 'Critical services (core banking hosting, card processing, KYC utility) depend on single vendors. Exit plans are untested and two vendors breached SLAs this quarter.',
    owner: PEOPLE.coo, L: 4, I: 4, band: 'Unknown', status: 'Active', confirmed: true, identified: '2026-10-05', velocity: 'Medium',
    sources: [
      { type: 'PY audit finding', agent: 'PY Audit Extractor', conf: 1.0, date: '2026-11-05', finding: 'Operational resilience and vendor management exposure carried forward from FY2026 report (rated High).', ref: 'FY2026 Internal Audit Findings Summary, p.9' },
      { type: 'External risk', agent: 'Threats Agent', conf: 0.88, date: '2026-11-14', finding: 'Concentration on a single cloud region; regional outage at a major provider in October affected peer banks.', ref: 'https://cloudstatus.example/incidents/oct-2026' }
    ] },
  { id: 'RISK-0103', title: 'Transaction Monitoring Effectiveness', l1: 'Compliance Risks', l2: 'Financial Crime (AML/CFT)',
    desc: 'Payment volumes grew 28% year on year while the alert backlog rose to 742 open alerts. Delayed review and escalation of suspicious activity could breach suspicious-transaction reporting deadlines.',
    owner: PEOPLE.mlro, L: 4, I: 4, band: 'Limited', status: 'Active', confirmed: true, identified: '2026-09-21', velocity: 'High',
    sources: [
      { type: 'Interview transcript', agent: 'Transcript Extractor', conf: 0.91, date: '2026-11-04', finding: 'MLRO interview: backlog driven by hiring freeze and scenario thresholds not retuned since 2024.', ref: 'Risk assessment interview, MLRO, 2026-11-04' },
      { type: 'KRI', agent: 'KRI Monitor', conf: 1.0, date: '2026-11-13', finding: 'KRI-01 open TM alerts older than 30 days = 742 against threshold 500 (breach).', ref: 'KRI feed: tm_alert_backlog' }
    ] },
  { id: 'RISK-0104', title: 'AI Governance and Model Risk', l1: 'Compliance Risks', l2: 'Regulatory Compliance',
    desc: 'Business lines use machine-learning models for credit decisions and fraud scoring without a complete model inventory or independent validation, creating conduct, bias and regulatory exposure.',
    owner: PEOPLE.cro, L: 3, I: 4, band: 'Unknown', status: 'Active', confirmed: false, identified: '2026-11-12', velocity: 'High',
    sources: [
      { type: 'External risk', agent: 'Regulations Agent', conf: 0.76, date: '2026-11-12', finding: 'Supervisory statement sets expectations for model inventories, explainability and validation of AI used in credit decisions.', ref: 'https://regwatch.example/supervisory/ai-models-2026' }
    ] },
  { id: 'RISK-0105', title: 'Information Security and Fraud', l1: 'Technology Risks', l2: 'Cybersecurity',
    desc: 'Compromised endpoints with access to core banking and unauthenticated internal APIs raise the risk of account takeover and payment fraud.',
    owner: PEOPLE.ciso, L: 4, I: 4, band: 'Moderate', status: 'Active', confirmed: false, identified: '2026-11-10', velocity: 'High',
    sources: [
      { type: 'External risk', agent: 'Scandals Agent', conf: 0.7, date: '2026-11-10', finding: 'Two peer banks disclosed account-takeover fraud via compromised staff endpoints.', ref: 'https://finnews.example/2026/11/ato-wave' }
    ] },
  { id: 'RISK-0106', title: 'Cybersecurity and Data Exposure via Vendors', l1: 'Technology Risks', l2: 'Cybersecurity',
    desc: 'Unpatched vendor-hosted systems and weak third-party security assessments could lead to unauthorised data access and service disruption.',
    owner: PEOPLE.ciso, L: 4, I: 4, band: 'Moderate', status: 'Active', confirmed: true, identified: '2026-11-04', velocity: 'Medium',
    sources: [
      { type: 'External risk', agent: 'Threats Agent', conf: 0.8, date: '2026-11-04', finding: 'Critical vulnerability published for a banking CRM platform used by the firm (CVSS 9.1).', ref: 'https://vulndb.example/cve-2026-83197' },
      { type: 'KRI', agent: 'KRI Monitor', conf: 1.0, date: '2026-11-13', finding: 'KRI-02 critical patches overdue > 30 days = 3 (threshold 5).', ref: 'KRI feed: patch_overdue_critical' }
    ] },
  { id: 'RISK-0107', title: 'Liquidity and Funding Concentration', l1: 'Financial Risks', l2: 'Liquidity',
    desc: 'Wholesale funding concentration in three counterparties could strain the liquidity coverage ratio under stress.',
    owner: PEOPLE.cfo, L: 3, I: 3, band: 'Unknown', status: 'Active', confirmed: true, identified: '2026-08-14', velocity: 'Medium',
    sources: [{ type: 'External risk', agent: 'Market Signals Agent', conf: 0.66, date: '2026-10-30', finding: 'Wholesale funding spreads widened 40 bps for mid-tier lenders.', ref: 'https://markets.example/funding-spreads-q4' }] },
  { id: 'RISK-0108', title: 'Strategic Execution and Branch Network Contraction', l1: 'Strategic Risks', l2: 'Corporate Strategy',
    desc: 'Planned sale of 14 branches could disrupt customers and erode deposit franchise if migration to digital channels underperforms.',
    owner: PEOPLE.coo, L: 3, I: 3, band: 'Unknown', status: 'Active', confirmed: true, identified: '2026-07-01', velocity: 'Low',
    sources: [{ type: 'Interview transcript', agent: 'Transcript Extractor', conf: 0.72, date: '2026-10-20', finding: 'COO interview: digital migration targets missed in two pilot regions.', ref: 'Risk assessment interview, COO, 2026-10-20' }] },
  { id: 'RISK-0109', title: 'Data Availability and Entity Data Quality', l1: 'Operational Risks', l2: 'Data Center Vendor',
    desc: 'Backup restoration has not been tested end to end for the customer master data, and legal-entity identifiers are inconsistent across systems.',
    owner: PEOPLE.cto, L: 3, I: 3, band: 'Unknown', status: 'Active', confirmed: true, identified: '2026-09-02', velocity: 'Low',
    sources: [{ type: 'PY audit finding', agent: 'PY Audit Extractor', conf: 0.85, date: '2026-09-02', finding: 'FY2026 finding IA-26-12: backup restore test scope excluded customer master data.', ref: 'FY2026 Internal Audit Findings Summary, p.14' }] },
  { id: 'RISK-0110', title: 'Unauthorised Access', l1: 'Technology Risks', l2: 'Identity and Access',
    desc: 'Temporary administrator accounts remained active past their planned expiry after the platform migration.',
    owner: PEOPLE.ciso, L: 3, I: 4, band: 'Strong', status: 'Active', confirmed: true, identified: '2026-06-11', velocity: 'Medium',
    sources: [{ type: 'Interview transcript', agent: 'Transcript Extractor', conf: 0.8, date: '2026-06-11', finding: 'IT security interview: 11 temporary admin accounts found active 45 days post-migration; since remediated.', ref: 'Risk assessment interview, IT Security, 2026-06-11' }] },
  { id: 'RISK-0111', title: 'Consumer Protection and Fair Treatment', l1: 'Compliance Risks', l2: 'Consumer Protection',
    desc: 'Changes to consumer-duty and lending disclosure rules create exposure in product governance and complaints handling.',
    owner: PEOPLE.cco, L: 3, I: 4, band: 'Strong', status: 'Active', confirmed: true, identified: '2026-05-19', velocity: 'Medium',
    sources: [{ type: 'External risk', agent: 'Regulations Agent', conf: 0.7, date: '2026-05-19', finding: 'Updated consumer-duty guidance on fair value assessments for lending products.', ref: 'https://regwatch.example/consumer/fair-value-2026' }] },
  { id: 'RISK-0112', title: 'Key Person and Succession', l1: 'Human Capital Risks', l2: 'Succession',
    desc: 'Three executive roles in Treasury and Risk have no ready-now successor.',
    owner: PEOPLE.chro, L: 2, I: 4, band: 'Moderate', status: 'Active', confirmed: true, identified: '2026-04-08', velocity: 'Low',
    sources: [{ type: 'Interview transcript', agent: 'Transcript Extractor', conf: 0.75, date: '2026-04-08', finding: 'CHRO interview: succession bench not refreshed since 2024.', ref: 'Risk assessment interview, CHRO, 2026-04-08' }] }
];

const KRIS = [
  { id: 'KRI-01', name: 'Open TM alerts older than 30 days', value: 742, threshold: 500, dir: 'above', risk: 'RISK-0103', trend: [380, 410, 455, 520, 610, 742] },
  { id: 'KRI-02', name: 'Critical patches overdue > 30 days', value: 3, threshold: 5, dir: 'above', risk: 'RISK-0106', trend: [6, 5, 4, 4, 3, 3] },
  { id: 'KRI-03', name: 'Critical vendor SLA breaches (quarter)', value: 2, threshold: 3, dir: 'above', risk: 'RISK-0102', trend: [0, 1, 1, 1, 2, 2] }
];

/* Control library: what the Controls agent proposes for each risk */
const CONTROLS = [
  { id: 'C-01', risk: 'RISK-0101', name: 'Regulatory change log reviewed and mapped to obligation owners', type: 'Preventive', nature: 'Manual', freq: 'Monthly', owner: PEOPLE.cco },
  { id: 'C-02', risk: 'RISK-0101', name: 'Quarterly attestation of readiness for upcoming effective dates', type: 'Detective', nature: 'Manual', freq: 'Quarterly', owner: PEOPLE.cco },
  { id: 'C-03', risk: 'RISK-0102', name: 'Critical vendor due diligence and criticality reassessment', type: 'Preventive', nature: 'Manual', freq: 'Annual', owner: PEOPLE.coo },
  { id: 'C-04', risk: 'RISK-0102', name: 'Exit plans for critical vendors tested', type: 'Detective', nature: 'Manual', freq: 'Annual', owner: PEOPLE.coo },
  { id: 'C-05', risk: 'RISK-0102', name: 'Vendor SLA performance reviewed with escalation of breaches', type: 'Detective', nature: 'IT-dependent manual', freq: 'Monthly', owner: PEOPLE.coo },
  { id: 'C-06', risk: 'RISK-0103', name: 'Daily alert ageing review with escalation of alerts over 30 days', type: 'Detective', nature: 'IT-dependent manual', freq: 'Daily', owner: PEOPLE.mlro },
  { id: 'C-07', risk: 'RISK-0103', name: 'Scenario and threshold tuning approved by MLRO', type: 'Preventive', nature: 'Manual', freq: 'Quarterly', owner: PEOPLE.mlro },
  { id: 'C-08', risk: 'RISK-0104', name: 'AI model inventory with independent validation before deployment', type: 'Preventive', nature: 'Manual', freq: 'Event-driven', owner: PEOPLE.cro },
  { id: 'C-09', risk: 'RISK-0105', name: 'Endpoint detection alerts triaged within 4 hours', type: 'Detective', nature: 'Automated', freq: 'Recurring', owner: PEOPLE.ciso },
  { id: 'C-10', risk: 'RISK-0106', name: 'Patch compliance monitored against 30-day critical SLA', type: 'Detective', nature: 'IT-dependent manual', freq: 'Weekly', owner: PEOPLE.ciso },
  { id: 'C-11', risk: 'RISK-0106', name: 'Vendor security assessment before onboarding and annually', type: 'Preventive', nature: 'Manual', freq: 'Annual', owner: PEOPLE.ciso },
  { id: 'C-12', risk: 'RISK-0107', name: 'Monthly liquidity stress test reviewed by ALCO', type: 'Detective', nature: 'Manual', freq: 'Monthly', owner: PEOPLE.cfo },
  { id: 'C-13', risk: 'RISK-0109', name: 'Backup restoration test including customer master data', type: 'Detective', nature: 'Manual', freq: 'Quarterly', owner: PEOPLE.cto },
  { id: 'C-14', risk: 'RISK-0110', name: 'Privileged access recertification', type: 'Detective', nature: 'Manual', freq: 'Quarterly', owner: PEOPLE.ciso },
  { id: 'C-15', risk: 'RISK-0110', name: 'Leaver access removed within 1 business day', type: 'Preventive', nature: 'Automated', freq: 'Recurring', owner: PEOPLE.ciso },
  { id: 'C-16', risk: 'RISK-0111', name: 'Complaints root-cause analysis reviewed by Product Governance Committee', type: 'Detective', nature: 'Manual', freq: 'Monthly', owner: PEOPLE.cco },
  { id: 'C-17', risk: 'RISK-0108', name: 'Branch migration KPIs reported to ExCo', type: 'Detective', nature: 'Manual', freq: 'Monthly', owner: PEOPLE.coo },
  { id: 'C-18', risk: 'RISK-0112', name: 'Succession plan reviewed by Nomination Committee', type: 'Preventive', nature: 'Manual', freq: 'Annual', owner: PEOPLE.chro }
];

/* Pending risk-sensing run awaiting reviewer decisions */
const SEED_RUN = {
  id: 'RUN-2026-11-14', name: 'External research, daily run', started: '2026-11-14 06:00', status: 'Awaiting review',
  candidates: [
    { cid: 'CAN-301', title: 'Cloud region concentration for core banking', desc: 'Core banking runs in a single cloud region; a regional outage would stop payments for the full outage window.', l1: 'Operational Risks', l2: 'Third Party', agent: 'Threats Agent', conf: 0.88, severity: 'high', match: { risk: 'RISK-0102', score: 0.88 }, source: 'https://cloudstatus.example/incidents/oct-2026', decision: 'Merged', auto: true },
    { cid: 'CAN-302', title: 'Sanctions list update lag', desc: 'Screening lists refreshed every 48 hours against an expectation of same-day updates after designations.', l1: 'Compliance Risks', l2: 'Sanctions', agent: 'Regulations Agent', conf: 0.74, severity: 'high', match: { risk: 'RISK-0103', score: 0.72 }, source: 'https://regwatch.example/sanctions/update-timeliness', decision: null },
    { cid: 'CAN-303', title: 'Card-not-present fraud spike at peers', desc: 'Peers report a 35% rise in card-not-present fraud linked to bot-driven card testing.', l1: 'Technology Risks', l2: 'Cybersecurity', agent: 'Scandals Agent', conf: 0.69, severity: 'medium', match: { risk: 'RISK-0105', score: 0.41 }, source: 'https://finnews.example/2026/11/cnp-fraud', decision: null },
    { cid: 'CAN-304', title: 'Data retention fine at a peer lender', desc: 'Regulator fined a peer for keeping closed-account data beyond retention limits; the firm\'s retention schedule was last reviewed in 2023.', l1: 'Compliance Risks', l2: 'Data Protection', agent: 'Regulations Agent', conf: 0.71, severity: 'medium', match: { risk: 'RISK-0109', score: 0.58 }, source: 'https://regwatch.example/enforcement/retention-2026', decision: null },
    { cid: 'CAN-305', title: 'Alert backlog growth after volume increase', desc: 'Transcript states payment volumes up 28% with alert reviewers reduced from 14 to 11.', l1: 'Compliance Risks', l2: 'Financial Crime (AML/CFT)', agent: 'Transcript Extractor', conf: 0.91, severity: 'high', match: { risk: 'RISK-0103', score: 0.91 }, source: 'Risk assessment interview, MLRO, 2026-11-04', decision: 'Merged', auto: true }
  ]
};

/* Pool for new simulated runs */
const SIGNAL_POOL = [
  { title: 'Outsourced collections agent conduct complaints', desc: 'Complaints about a collections partner rose 60% quarter on quarter.', l1: 'Compliance Risks', l2: 'Consumer Protection', agent: 'Scandals Agent', severity: 'medium', near: 'RISK-0111' },
  { title: 'Ransomware campaign targeting core-banking vendors', desc: 'Threat intelligence reports an active campaign against two core-banking software vendors.', l1: 'Technology Risks', l2: 'Cybersecurity', agent: 'Threats Agent', severity: 'high', near: 'RISK-0106' },
  { title: 'Operational resilience self-assessment deadline', desc: 'Final rules require an annual self-assessment approved by the board by 31 March.', l1: 'Compliance Risks', l2: 'Regulatory Change', agent: 'Regulations Agent', severity: 'high', near: 'RISK-0101' },
  { title: 'Interest-rate driven deposit outflows', desc: 'Peer data shows 6% deposit migration to higher-yield digital banks.', l1: 'Financial Risks', l2: 'Liquidity', agent: 'Market Signals Agent', severity: 'medium', near: 'RISK-0107' },
  { title: 'Generative AI use without approval', desc: 'Staff survey: 31% of staff use public AI tools with customer data.', l1: 'Technology Risks', l2: 'Emerging Technology', agent: 'Transcript Extractor', severity: 'high', near: 'RISK-0104' },
  { title: 'Single sign-on provider outage', desc: 'Identity provider outage locked staff out for 3 hours at two peers.', l1: 'Technology Risks', l2: 'Identity and Access', agent: 'Threats Agent', severity: 'medium', near: 'RISK-0110' }
];

const SEED_AUDITS = [
  { id: 'AUD-2027-018', title: 'Financial Crime Compliance Audit', l1: 'Compliance Risks', risks: ['RISK-0103'], status: 'Fieldwork', lead: PEOPLE.snr, start: '2026-10-20', end: '2026-12-12', source: 'Manual',
    planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] } },
  { id: 'AUD-2027-021', title: 'Technology Risks Audit', l1: 'Technology Risks', risks: ['RISK-0106'], status: 'Not started', lead: PEOPLE.mgr, start: '2027-01-12', end: '2027-02-27', source: 'Manual', planning: { step: 1, approved: [] } },
  { id: 'AUD-2026-044', title: 'Consumer Duty Review', l1: 'Compliance Risks', risks: ['RISK-0111'], status: 'Reported', lead: PEOPLE.mgr, start: '2026-06-02', end: '2026-07-25', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] }, rating: 'Satisfactory' }
];

/* Fieldwork population for C-06 (daily alert ageing review) */
const SEED_SAMPLES = [
  { d: '2026-07-03', m1: 412, m2: 18, reviewed: true, esc: true, ev: 'TM-ageing-0703.pdf' },
  { d: '2026-07-16', m1: 431, m2: 22, reviewed: true, esc: true, ev: 'TM-ageing-0716.pdf' },
  { d: '2026-07-29', m1: 450, m2: 25, reviewed: true, esc: true, ev: 'TM-ageing-0729.pdf' },
  { d: '2026-08-07', m1: 466, m2: 31, reviewed: true, esc: false, ev: 'TM-ageing-0807.pdf', note: 'Escalation email not found; 31 alerts over 30 days not escalated to MLRO.' },
  { d: '2026-08-19', m1: 489, m2: 34, reviewed: true, esc: true, ev: 'TM-ageing-0819.pdf' },
  { d: '2026-08-28', m1: 502, m2: 40, reviewed: true, esc: true, ev: 'TM-ageing-0828.pdf' },
  { d: '2026-09-04', m1: 515, m2: 44, reviewed: false, esc: false, ev: null, note: 'No review evidence retained for the date; reviewer on leave with no delegate.' },
  { d: '2026-09-15', m1: 538, m2: 47, reviewed: true, esc: true, ev: 'TM-ageing-0915.pdf' },
  { d: '2026-09-24', m1: 556, m2: 52, reviewed: true, esc: true, ev: 'TM-ageing-0924.pdf' },
  { d: '2026-10-02', m1: 590, m2: 58, reviewed: true, esc: true, ev: 'TM-ageing-1002.pdf' },
  { d: '2026-10-09', m1: 611, m2: 61, reviewed: true, esc: true, ev: 'TM-ageing-1009.pdf' },
  { d: '2026-10-17', m1: 644, m2: 66, reviewed: true, esc: false, ev: 'TM-ageing-1017.pdf', note: 'Review signed, but escalation of 66 aged alerts not evidenced.' },
  { d: '2026-10-23', m1: 672, m2: 70, reviewed: true, esc: true, ev: 'TM-ageing-1023.pdf' },
  { d: '2026-10-30', m1: 701, m2: 74, reviewed: true, esc: true, ev: 'TM-ageing-1030.pdf' },
  { d: '2026-11-06', m1: 728, m2: 79, reviewed: true, esc: true, ev: 'TM-ageing-1106.pdf' }
];

const SEED_ISSUES = [
  { id: 'ISS-0412', title: 'Consumer duty fair-value assessments not documented for two products', audit: 'AUD-2026-044', risk: 'RISK-0111', rating: 'Medium', owner: PEOPLE.cco, due: '2026-10-31', status: 'In progress',
    condition: 'Fair-value assessments for the Flex Loan and Premium Saver products were not documented for the 2026 review cycle.',
    criteria: 'Product Governance Policy s.4.2 requires an annual documented fair-value assessment per product.',
    cause: 'Product owners changed in Q1 2026 and the assessment calendar was not reassigned.',
    consequence: 'Products may deliver poor value to customers without detection, creating conduct and regulatory exposure.',
    action: 'Complete and approve both assessments; add the calendar to the Product Governance Committee tracker.', created: '2026-07-25' },
  { id: 'ISS-0413', title: 'Complaints root-cause analysis lacks trend thresholds', audit: 'AUD-2026-044', risk: 'RISK-0111', rating: 'Low', owner: PEOPLE.cco, due: '2026-12-31', status: 'Open',
    condition: 'Monthly root-cause packs describe complaint themes but define no thresholds that trigger escalation.',
    criteria: 'Complaints Handling Standard s.6 requires escalation of emerging themes to the Product Governance Committee.',
    cause: 'The standard does not define what counts as an emerging theme.',
    consequence: 'Systemic issues may reach the committee late.',
    action: 'Define quantitative escalation thresholds and include them in the monthly pack.', created: '2026-07-25' },
  { id: 'ISS-0398', title: 'Temporary admin accounts not removed after migration', audit: 'AUD-2026-031', risk: 'RISK-0110', rating: 'High', owner: PEOPLE.ciso, due: '2026-09-30', status: 'Closed - pending validation',
    condition: '11 temporary administrator accounts remained active 45 days after the platform migration.',
    criteria: 'Access Management Standard s.3.4: temporary privileged access expires automatically within 14 days.',
    cause: 'Accounts were created outside the PAM tool, so automatic expiry did not apply.',
    consequence: 'Unauthorised changes to production systems could go undetected.',
    action: 'Remove accounts; enforce creation of privileged accounts only through the PAM tool.', created: '2026-06-20' }
];


const RSTMT = {
  'RISK-0101': ['the regulatory change inventory is incomplete and obligations are not mapped to owners', 'the firm misses a 2027 effective date', 'regulatory censure, remediation cost and reputational damage'],
  'RISK-0102': ['critical services depend on single vendors with untested exit plans', 'a vendor outage or failure disrupts payments or customer service beyond impact tolerance', 'customer harm, breach of operational-resilience rules and financial loss'],
  'RISK-0103': ['alert volumes outgrow reviewer capacity and scenarios are not retuned', 'suspicious activity is reviewed or escalated late', 'late or missed suspicious-transaction reports and supervisory action'],
  'RISK-0104': ['models are deployed without inventory or independent validation', 'a biased or unexplainable model drives credit or fraud decisions', 'unfair customer outcomes, regulatory breach and model losses'],
  'RISK-0105': ['staff endpoints and internal APIs are not adequately protected', 'attackers take over accounts or initiate fraudulent payments', 'fraud losses, customer reimbursement and regulatory scrutiny'],
  'RISK-0106': ['vendor-hosted systems are not patched within SLA', 'a known vulnerability is exploited at a vendor', 'unauthorised access to customer data and service disruption'],
  'RISK-0107': ['wholesale funding is concentrated in three counterparties', 'a counterparty withdraws funding under stress', 'liquidity coverage falls below the regulatory minimum'],
  'RISK-0108': ['branch sales proceed faster than digital migration', 'customers leave during the transition', 'deposit outflows and missed strategic targets'],
  'RISK-0109': ['restoration tests exclude customer master data', 'data cannot be recovered within tolerance after an incident', 'prolonged outage and data-quality errors in reporting'],
  'RISK-0110': ['privileged accounts are created outside the PAM tool', 'temporary access persists beyond need', 'unauthorised production changes going undetected'],
  'RISK-0111': ['fair-value assessments and complaint analysis are not systematic', 'products deliver poor value without detection', 'customer harm and conduct sanctions'],
  'RISK-0112': ['succession plans are not refreshed', 'a key executive leaves without a ready successor', 'decision delays in Treasury and Risk']
};
const L1_AUDIT = { 'Compliance Risks': ['Regulatory Compliance Audit', 'Covers regulatory change readiness, compliance oversight and emerging rule exposure.'], 'Operational Risks': ['Operational Resilience Audit', 'Covers third-party dependency, exit planning and operational resilience against impact tolerances.'], 'Technology Risks': ['Cybersecurity Audit', 'Covers endpoint, access and vendor security controls against fraud and data exposure.'], 'Financial Risks': ['Treasury and Liquidity Audit', 'Covers funding concentration and liquidity stress testing.'], 'Strategic Risks': ['Strategic Execution Review', 'Covers delivery of strategic programmes against plan.'], 'Human Capital Risks': ['People Risk Audit', 'Covers succession, capacity and conduct.'] };

const KEYTEST = {
  cols: ['Open alerts', '>30 days'],
  population: '89 business days, 1 Jul to 6 Nov 2026',
  attrs: ['A. Review performed and signed', 'B. Aged alerts (>30 days) identified', 'C. Escalation to MLRO evidenced'],
  passNote: s => `${s.ev}: ageing report reviewed and signed; ${s.m2} aged alerts escalated to MLRO by email the same day.`,
  design: { owner: 'TM team lead performs; no delegate named for absences.', gap06: 'The 30-day ageing threshold is defined, but the procedure sets no deadline for the MLRO to decide on escalated alerts.', gap07: 'Tuning approvals sit in email; the TM system keeps no sign-off record.' },
  issue: { title: 'Aged transaction-monitoring alerts not consistently escalated to the MLRO',
    criteria: 'Financial Crime Procedure s.5.3: alerts older than 30 days are escalated to the MLRO the same business day, with evidence retained.',
    cause: 'No delegate is assigned when the reviewer is absent, and the procedure sets no deadline for MLRO decisions on escalated alerts (design gap from the test of design). Reviewer headcount fell from 14 to 11.',
    action: '1) Name a delegate for every reviewer absence (owner MLRO, 31 Dec 2026). 2) Add a 5-business-day MLRO decision deadline to the procedure (31 Jan 2027). 3) Weekly aged-alert report to the Financial Crime Committee until the backlog is below 500 (from 15 Dec 2026).',
    trend: (a, b) => `Aged alerts rose from ${a.m2} to ${b.m2} over the period.` }
};
return { ORG, PEOPLE, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST };
})();
