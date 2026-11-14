/* Manufacturing: Brennmoor Industrial Components B.V. (fictional automotive and industrial parts maker, Netherlands). */
DATASETS.mfg = (() => {
  const ORG = { name: 'Brennmoor Industrial Components B.V.', short: 'Brennmoor', fy: 'FY2027', asOf: '2026-11-14', industry: 'Manufacturing', label: 'Manufacturing (Brennmoor)' };
  const P = {
    cae: 'R. Okafor (CAE)', mgr: 'L. Varga (IA Manager)', snr: 'S. Haddad (Senior Auditor)',
    cro: 'J. de Vries (Head of Risk)', coo: 'P. Janssen (COO)', qm: 'S. Bakker (Quality Director)', proc: 'M. Visser (Procurement Director)',
    cfo: 'E. Smit (CFO)', ciso: 'R. Mulder (CISO)', ehs: 'K. Dekker (EHS Manager)', plant: 'T. Meijer (Plant Manager)',
    chro: 'L. Bos (HR Director)', cco: 'A. Hendriks (Legal and Compliance)', cto: 'N. Willems (CIO)'
  };
  const TAXONOMY = {
    'Strategic Risks': ['Customer Concentration', 'Market Demand', 'Product Innovation', 'Geopolitical', 'ESG and Decarbonisation'],
    'Financial Risks': ['Inventory Valuation', 'Working Capital', 'Commodity Prices', 'Financial Reporting', 'FX'],
    'Operational Risks': ['Supply Chain Single Source', 'Product Quality', 'Production Capacity', 'Maintenance', 'Business Continuity', 'Third Party'],
    'Compliance Risks': ['Environmental (CBAM/CSRD)', 'Product Safety', 'Trade and Export Controls', 'Health and Safety', 'Regulatory Change', 'Anti-Bribery'],
    'Technology Risks': ['OT Cybersecurity', 'IT Operations', 'ERP Data Integrity', 'Identity and Access'],
    'Human Capital Risks': ['Skilled Labour Shortage', 'Succession', 'Safety Culture', 'Training']
  };
  const RISKS = [
    R('RISK-0101', 'Emissions Reporting and CBAM Compliance', 'Compliance Risks', 'Environmental (CBAM/CSRD)', P.cco, 4, 4, 'Unknown', true, '2026-10-02', 'High',
      'Embedded-emissions data for imported steel and aluminium is collected by email from suppliers and not verified, so carbon border declarations and sustainability disclosures could be wrong.',
      [src('External risk', 'Regulations Agent', 0.82, '2026-11-03', 'Guidance on verification of embedded emissions for annual declarations published.', 'https://regwatch.example/eu/cbam-verification-2026'),
       src('PY audit finding', 'PY Audit Extractor', 0.88, '2026-10-02', 'FY2026 finding IA-26-04: supplier emissions data not reconciled to purchase volumes.', 'FY2026 Internal Audit Findings Summary, p.4')]),
    R('RISK-0102', 'Single-Source Supplier Dependency', 'Operational Risks', 'Supply Chain Single Source', P.proc, 4, 4, 'Unknown', true, '2026-10-05', 'Medium',
      'Three critical castings and one microcontroller come from single suppliers in Asia. Late deliveries rose this year and no second source is qualified.',
      [src('PY audit finding', 'PY Audit Extractor', 1.0, '2026-11-05', 'Supplier concentration carried forward from FY2026 report (rated High).', 'FY2026 Internal Audit Findings Summary, p.7'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-03 critical supplier late deliveries this month = 6 (threshold 8).', 'KRI feed: supplier_late_deliveries')]),
    R('RISK-0103', 'Product Quality and Warranty Exposure', 'Operational Risks', 'Product Quality', P.qm, 4, 4, 'Limited', true, '2026-09-21', 'High',
      'Customer defect rate reached 410 parts per million against a 250 target. Nonconforming batches are not always quarantined before shipment, raising recall and warranty exposure with automotive customers.',
      [src('Interview transcript', 'Transcript Extractor', 0.9, '2026-11-04', 'Quality Director interview: inspectors cover two lines each since July; quarantine area at capacity.', 'Risk assessment interview, Quality Director, 2026-11-04'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-01 customer PPM = 410 against threshold 250 (breach).', 'KRI feed: customer_ppm')]),
    R('RISK-0104', 'Export Control and Sanctions Screening', 'Compliance Risks', 'Trade and Export Controls', P.cco, 3, 4, 'Unknown', false, '2026-11-12', 'High',
      'Some sensor assemblies may be dual-use items. Sales to new distributors are not screened for end use before shipment.',
      [src('External risk', 'Regulations Agent', 0.75, '2026-11-12', 'Updated dual-use list adds sensor categories relevant to the product range.', 'https://regwatch.example/eu/dual-use-update')]),
    R('RISK-0105', 'Ransomware on Production Networks', 'Technology Risks', 'OT Cybersecurity', P.ciso, 4, 4, 'Moderate', false, '2026-11-10', 'High',
      'Flat networks between office IT and production lines mean ransomware could stop all three plants.',
      [src('External risk', 'Scandals Agent', 0.73, '2026-11-10', 'A peer components maker halted four plants for nine days after a ransomware attack.', 'https://industrynews.example/2026/11/plant-ransomware')]),
    R('RISK-0106', 'Unpatched OT Systems and Vendor Remote Access', 'Technology Risks', 'OT Cybersecurity', P.ciso, 4, 4, 'Moderate', true, '2026-11-04', 'Medium',
      'PLCs and HMIs run outdated firmware, and machine vendors keep standing remote-access accounts.',
      [src('External risk', 'Threats Agent', 0.81, '2026-11-04', 'Critical PLC vulnerability advisory affecting the firmware used on Line 3.', 'https://vulndb.example/ics-advisory-2026-77'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-02 critical OT vulnerabilities unpatched over 60 days = 4 (threshold 5).', 'KRI feed: ot_vulns_critical')]),
    R('RISK-0107', 'Commodity Price and Working Capital Pressure', 'Financial Risks', 'Commodity Prices', P.cfo, 3, 3, 'Unknown', true, '2026-08-14', 'Medium',
      'Aluminium and copper price rises are only partly passed to customers, squeezing margin and cash.',
      [src('External risk', 'Market Signals Agent', 0.67, '2026-10-30', 'Aluminium up 18% in a quarter.', 'https://markets.example/metals-q4')]),
    R('RISK-0108', 'Customer Concentration in Automotive', 'Strategic Risks', 'Customer Concentration', P.coo, 3, 3, 'Unknown', true, '2026-07-01', 'Low',
      'Three car makers account for 62% of revenue; a platform cancellation would cut volume sharply.',
      [src('Interview transcript', 'Transcript Extractor', 0.72, '2026-10-20', 'COO interview: one customer delayed an EV platform by 18 months.', 'Risk assessment interview, COO, 2026-10-20')]),
    R('RISK-0109', 'Unplanned Downtime from Deferred Maintenance', 'Operational Risks', 'Maintenance', P.plant, 3, 3, 'Unknown', true, '2026-09-02', 'Low',
      'Preventive maintenance compliance fell to 78% as overtime was cut, increasing breakdown risk on press lines.',
      [src('PY audit finding', 'PY Audit Extractor', 0.84, '2026-09-02', 'FY2026 finding IA-26-10: maintenance backlog not reported to management.', 'FY2026 Internal Audit Findings Summary, p.11')]),
    R('RISK-0110', 'ERP Access and Segregation of Duties', 'Technology Risks', 'Identity and Access', P.cto, 3, 4, 'Strong', true, '2026-06-11', 'Medium',
      'Generic administrator accounts in the ERP production client allowed changes without traceability.',
      [src('Interview transcript', 'Transcript Extractor', 0.8, '2026-06-11', 'IT interview: 4 generic admin accounts used during go-live; since removed.', 'Risk assessment interview, IT, 2026-06-11')]),
    R('RISK-0111', 'Health and Safety Compliance', 'Compliance Risks', 'Health and Safety', P.ehs, 3, 4, 'Strong', true, '2026-05-19', 'Medium',
      'Machine guarding and risk assessments must be current for every production cell; gaps could cause injuries and enforcement.',
      [src('External risk', 'Regulations Agent', 0.7, '2026-05-19', 'Labour inspectorate focus on machine safety in metalworking in 2026.', 'https://regwatch.example/nl/inspection-focus-2026')]),
    R('RISK-0112', 'Skilled Labour and Succession', 'Human Capital Risks', 'Skilled Labour Shortage', P.chro, 2, 4, 'Moderate', true, '2026-04-08', 'Low',
      'Toolmakers and maintenance engineers are hard to hire, and 30% are within five years of retirement.',
      [src('Interview transcript', 'Transcript Extractor', 0.75, '2026-04-08', 'HR Director interview: 11 critical roles with no trained successor.', 'Risk assessment interview, HR Director, 2026-04-08')])
  ];
  const KRIS = [
    { id: 'KRI-01', name: 'Customer defect rate (PPM)', value: 410, threshold: 250, risk: 'RISK-0103', trend: [210, 230, 260, 300, 350, 410] },
    { id: 'KRI-02', name: 'Critical OT vulnerabilities unpatched > 60 days', value: 4, threshold: 5, risk: 'RISK-0106', trend: [7, 6, 6, 5, 4, 4] },
    { id: 'KRI-03', name: 'Critical supplier late deliveries (month)', value: 6, threshold: 8, risk: 'RISK-0102', trend: [2, 3, 3, 4, 5, 6] }
  ];
  const CONTROLS = [
    C('C-01', 'RISK-0101', 'Supplier embedded-emissions data reviewed and reconciled to purchase volumes', 'Detective', 'Manual', 'Monthly', P.cco),
    C('C-02', 'RISK-0101', 'Sustainability disclosure readiness reviewed by the Audit Committee', 'Detective', 'Manual', 'Quarterly', P.cco),
    C('C-03', 'RISK-0102', 'Critical supplier risk assessment and dual-sourcing plan', 'Preventive', 'Manual', 'Annual', P.proc),
    C('C-04', 'RISK-0102', 'Supply disruption scenario tested', 'Detective', 'Manual', 'Annual', P.coo),
    C('C-05', 'RISK-0102', 'Supplier delivery and quality scorecard reviewed', 'Detective', 'IT-dependent manual', 'Monthly', P.proc),
    C('C-06', 'RISK-0103', 'Daily quality release: batch inspection signed and nonconformances quarantined and escalated', 'Detective', 'IT-dependent manual', 'Daily', P.qm),
    C('C-07', 'RISK-0103', 'Control plans and inspection criteria (PFMEA) reviewed and approved', 'Preventive', 'Manual', 'Quarterly', P.qm),
    C('C-08', 'RISK-0104', 'Export classification and end-use screening before shipment to a new customer', 'Preventive', 'Manual', 'Event-driven', P.cco),
    C('C-09', 'RISK-0105', 'OT network anomaly alerts triaged within 4 hours', 'Detective', 'Automated', 'Recurring', P.ciso),
    C('C-10', 'RISK-0106', 'OT patch status tracked against a risk-based SLA', 'Detective', 'IT-dependent manual', 'Weekly', P.ciso),
    C('C-11', 'RISK-0106', 'Vendor remote-access accounts reviewed and time-limited', 'Preventive', 'Manual', 'Annual', P.ciso),
    C('C-12', 'RISK-0107', 'Commodity hedging and cash forecast reviewed by the CFO', 'Detective', 'Manual', 'Monthly', P.cfo),
    C('C-13', 'RISK-0109', 'Preventive maintenance compliance reviewed', 'Detective', 'Manual', 'Quarterly', P.plant),
    C('C-14', 'RISK-0110', 'ERP privileged access and SoD conflict review', 'Detective', 'Manual', 'Quarterly', P.cto),
    C('C-15', 'RISK-0110', 'Leaver access removed within 1 business day', 'Preventive', 'Automated', 'Recurring', P.cto),
    C('C-16', 'RISK-0111', 'Safety incidents and near misses reviewed by the EHS committee', 'Detective', 'Manual', 'Monthly', P.ehs),
    C('C-17', 'RISK-0108', 'Customer concentration and platform pipeline reported to the board', 'Detective', 'Manual', 'Monthly', P.coo),
    C('C-18', 'RISK-0112', 'Succession plan for critical technical roles reviewed', 'Preventive', 'Manual', 'Annual', P.chro)
  ];
  const SEED_RUN = { id: 'RUN-2026-11-14', name: 'External research, daily run', started: '2026-11-14 06:00', status: 'Awaiting review', candidates: [
    CAND('CAN-301', 'Port congestion delaying Asian castings', 'Container dwell times at two Asian ports doubled; castings lead times up three weeks.', 'Operational Risks', 'Supply Chain Single Source', 'Market Signals Agent', 0.86, 'high', 'RISK-0102', 0.88, 'https://logistics.example/port-congestion-nov', true),
    CAND('CAN-302', 'Peer recall of brackets from the same alloy supplier', 'A peer recalled brake brackets made from alloy supplied by one of Brennmoor\'s vendors.', 'Operational Risks', 'Product Quality', 'Scandals Agent', 0.74, 'high', 'RISK-0103', 0.72, 'https://industrynews.example/bracket-recall'),
    CAND('CAN-303', 'Robot firmware shipped with default credentials', 'A robot cell vendor shipped controllers with a default admin password.', 'Technology Risks', 'OT Cybersecurity', 'Threats Agent', 0.69, 'medium', 'RISK-0105', 0.41, 'https://vulndb.example/robot-default-creds'),
    CAND('CAN-304', 'Compressor failures at Plant 2', 'Transcript: two compressor failures stopped Plant 2 for 11 hours in total.', 'Operational Risks', 'Maintenance', 'Transcript Extractor', 0.71, 'medium', 'RISK-0109', 0.58, 'Risk assessment interview, Plant Manager, 2026-10-28'),
    CAND('CAN-305', 'Quarantine area overflow at Plant 1', 'Transcript: quarantine racks full, so held batches are stored next to released stock.', 'Operational Risks', 'Product Quality', 'Transcript Extractor', 0.91, 'high', 'RISK-0103', 0.91, 'Risk assessment interview, Quality Director, 2026-11-04', true)
  ] };
  const SIGNAL_POOL = [
    SIG('Peer fined after forklift fatality', 'Inspectorate fined a metalworking firm after a fatal forklift accident.', 'Compliance Risks', 'Health and Safety', 'Scandals Agent', 'high', 'RISK-0111'),
    SIG('Critical PLC vulnerability advisory', 'Remote code execution in a common PLC family.', 'Technology Risks', 'OT Cybersecurity', 'Threats Agent', 'high', 'RISK-0106'),
    SIG('Verification rules for emissions declarations', 'Accredited verification required for next annual declaration.', 'Compliance Risks', 'Environmental (CBAM/CSRD)', 'Regulations Agent', 'high', 'RISK-0101'),
    SIG('Aluminium price spike', 'Aluminium up 18% in one quarter.', 'Financial Risks', 'Commodity Prices', 'Market Signals Agent', 'medium', 'RISK-0107'),
    SIG('Quotes to a new distributor in a high-risk region', 'Sales describes quotes to a distributor with unclear end users.', 'Compliance Risks', 'Trade and Export Controls', 'Transcript Extractor', 'high', 'RISK-0104'),
    SIG('ERP authentication bypass patch', 'Vendor releases urgent patch for an authentication flaw.', 'Technology Risks', 'Identity and Access', 'Threats Agent', 'medium', 'RISK-0110')
  ];
  const SEED_AUDITS = [
    { id: 'AUD-2027-018', title: 'Product Quality Audit', l1: 'Operational Risks', risks: ['RISK-0103'], status: 'Fieldwork', lead: P.snr, start: '2026-10-20', end: '2026-12-12', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] } },
    { id: 'AUD-2027-021', title: 'OT Cybersecurity Review', l1: 'Technology Risks', risks: ['RISK-0106'], status: 'Not started', lead: P.mgr, start: '2027-01-12', end: '2027-02-27', source: 'Manual', planning: { step: 1, approved: [] } },
    { id: 'AUD-2026-044', title: 'Health and Safety Compliance Review', l1: 'Compliance Risks', risks: ['RISK-0111'], status: 'Reported', lead: P.mgr, start: '2026-06-02', end: '2026-07-25', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] }, rating: 'Satisfactory' }
  ];
  const SEED_SAMPLES = mkSamples('QREL', [38, 41, 40, 44, 42, 39, 43, 45, 41, 44, 46, 43, 45, 44, 46], [1, 2, 1, 3, 2, 2, 4, 3, 3, 4, 5, 5, 6, 6, 7],
    { 3: 'Nonconformance NC-2208 logged, but the batch was not quarantined and shipped to the customer.', 6: 'No QA release signature retained; inspector absent and no delegate.', 11: 'Release signed, but 5 nonconformances not escalated to the Quality Director.' });
  const SEED_ISSUES = [
    ISSUE('ISS-0412', 'Safety risk assessments overdue for two production cells', 'AUD-2026-044', 'RISK-0111', 'Medium', P.ehs, '2026-10-31', 'In progress',
      'Risk assessments for press cells 4 and 7 were last updated in 2024, before new tooling was installed.', 'EHS Standard s.2.3: reassess a cell within 30 days of any equipment change.',
      'Engineering change process does not notify EHS.', 'Uncontrolled hazards could cause injury and enforcement action.', 'Update both assessments; add an EHS step to the engineering change workflow.', '2026-07-25'),
    ISSUE('ISS-0413', 'Near-miss reports lack trend thresholds', 'AUD-2026-044', 'RISK-0111', 'Low', P.ehs, '2026-12-31', 'Open',
      'Near misses are reported monthly with no thresholds that trigger escalation.', 'EHS Standard s.5: escalate emerging hazard trends to the EHS committee.', 'No definition of an emerging trend.', 'Repeated hazards may reach the committee late.', 'Define escalation thresholds per hazard type.', '2026-07-25'),
    ISSUE('ISS-0398', 'Generic admin accounts in ERP production client', 'AUD-2026-031', 'RISK-0110', 'High', P.cto, '2026-09-30', 'Closed - pending validation',
      '4 generic administrator accounts were active in the ERP production client after go-live.', 'Access Standard s.3.1: named accounts only; no shared privileged IDs.',
      'Go-live accounts were not removed in the hypercare checklist.', 'Untraceable changes to prices, BOMs or postings.', 'Remove accounts; add removal to the go-live exit checklist.', '2026-06-20')
  ];
  const RSTMT = {
    'RISK-0101': ['supplier emissions data is unverified', 'declarations or disclosures are misstated', 'penalties, restatement and loss of customer trust'],
    'RISK-0102': ['critical parts have no qualified second source', 'a supplier fails to deliver', 'line stoppages and customer penalties'],
    'RISK-0103': ['inspection capacity fell and quarantine is full', 'nonconforming batches reach customers', 'recalls, warranty costs and loss of preferred-supplier status'],
    'RISK-0104': ['new customers are not screened for end use', 'dual-use items reach a prohibited end user', 'export control breaches and fines'],
    'RISK-0105': ['IT and production networks are not segmented', 'ransomware spreads to the plants', 'production stops across sites'],
    'RISK-0106': ['OT firmware is unpatched and vendors keep standing access', 'a known vulnerability is exploited', 'line downtime and safety incidents'],
    'RISK-0107': ['commodity rises are not passed through', 'margins and cash fall', 'covenant pressure and funding needs'],
    'RISK-0108': ['three customers dominate revenue', 'a platform is cancelled or delayed', 'sharp volume loss'],
    'RISK-0109': ['preventive maintenance is deferred', 'critical equipment fails', 'unplanned downtime and missed deliveries'],
    'RISK-0110': ['generic admin accounts exist in ERP', 'changes cannot be traced to a person', 'undetected errors or fraud in master data'],
    'RISK-0111': ['risk assessments lag equipment changes', 'a worker is exposed to an uncontrolled hazard', 'injury and enforcement action'],
    'RISK-0112': ['critical roles lack successors', 'experienced staff retire', 'loss of know-how and slower repairs']
  };
  const L1_AUDIT = { 'Compliance Risks': ['Regulatory and Trade Compliance Audit', 'Covers emissions reporting, export controls and safety compliance.'], 'Operational Risks': ['Supply Chain and Quality Audit', 'Covers single-source suppliers, quality release and maintenance.'], 'Technology Risks': ['OT and ERP Security Audit', 'Covers production network security, patching and ERP access.'], 'Financial Risks': ['Commodity and Working Capital Audit', 'Covers hedging and cash forecasting.'], 'Strategic Risks': ['Customer Portfolio Review', 'Covers customer concentration.'], 'Human Capital Risks': ['Workforce Capability Review', 'Covers skills and succession.'] };
  const KEYTEST = {
    cols: ['Batches', 'Nonconformances'],
    population: '96 production days, 1 Jul to 6 Nov 2026',
    attrs: ['A. Batch inspection signed by QA', 'B. Nonconformances logged in the QMS', 'C. Nonconformances quarantined and escalated to the Quality Director'],
    passNote: s => `${s.ev}: ${s.m1} batches released with QA signature; ${s.m2} nonconformances quarantined and escalated.`,
    design: { owner: 'Shift QA inspector performs; no delegate named for absences.', gap06: 'Escalation is required, but the procedure sets no limit on how long a batch can stay on hold before disposition.', gap07: 'PFMEA updates are approved in meetings; no signed record kept.' },
    issue: { title: 'Nonconforming batches not consistently quarantined and escalated',
      criteria: 'Quality Manual s.8.7: nonconforming product is quarantined, logged and escalated to the Quality Director before any shipment decision.',
      cause: 'Inspectors cover two lines each since July with no delegate, and the quarantine area is full (design gap from the test of design).',
      action: '1) Add one inspector per shift or limit coverage to one line (owner Quality Director, 31 Dec 2026). 2) Expand quarantine space with system holds on shipment (31 Jan 2027). 3) Weekly PPM and hold report to the COO until PPM is below 250 (from 15 Dec 2026).',
      trend: (a, b) => `Daily nonconformances rose from ${a.m2} to ${b.m2} over the period.` }
  };
  return { ORG, PEOPLE: P, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST };
})();
