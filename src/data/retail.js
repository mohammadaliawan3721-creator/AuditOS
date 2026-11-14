/* Retail: Larkfield Retail Group (fictional omnichannel grocery and home retailer, 340 stores). */
DATASETS.retail = (() => {
  const ORG = { name: 'Larkfield Retail Group', short: 'Larkfield', fy: 'FY2027', asOf: '2026-11-14', industry: 'Retail', label: 'Retail (Larkfield)' };
  const P = {
    cae: 'R. Okafor (CAE)', mgr: 'L. Varga (IA Manager)', snr: 'S. Haddad (Senior Auditor)',
    cro: 'C. Morgan (Head of Risk)', coo: 'G. Patel (COO)', lp: 'H. Walsh (Head of Loss Prevention)', cfo: 'R. Ahmed (CFO)',
    ciso: 'S. Kowalski (CISO)', cco: 'D. Reid (Compliance Director)', buy: 'F. Okoro (Buying Director)', ecom: 'J. Lindgren (E-commerce Director)',
    chro: 'T. Byrne (People Director)', sc: 'W. Harris (Supply Chain Director)', cto: 'P. Novak (CIO)'
  };
  const TAXONOMY = {
    'Strategic Risks': ['Store Portfolio', 'Customer Experience', 'Competitive Pricing', 'E-commerce Growth', 'ESG and Packaging'],
    'Financial Risks': ['Inventory Valuation', 'Supplier Rebates', 'Cash Management', 'Financial Reporting', 'Margin'],
    'Operational Risks': ['Inventory Shrink', 'Store Cash Handling', 'Supply Chain and Logistics', 'Third Party', 'Business Continuity', 'Food Safety'],
    'Compliance Risks': ['Consumer Law and Pricing', 'Payment Card Data (PCI DSS)', 'Data Protection', 'Product Safety', 'Modern Slavery and Ethical Sourcing', 'Regulatory Change'],
    'Technology Risks': ['Cybersecurity', 'POS and Store Systems', 'E-commerce Platform', 'Identity and Access'],
    'Human Capital Risks': ['Store Staffing', 'Succession', 'Training', 'Conduct']
  };
  const RISKS = [
    R('RISK-0101', 'Pricing and Promotions Compliance', 'Compliance Risks', 'Consumer Law and Pricing', P.cco, 4, 4, 'Unknown', true, '2026-10-02', 'High',
      'Unit-pricing and promotional pricing rules tighten in 2027. Shelf-edge and online prices are not checked against the "was" price history, so promotions could mislead customers.',
      [src('External risk', 'Regulations Agent', 0.83, '2026-11-03', 'Updated unit-pricing and reference-price rules published with 2027 effective dates.', 'https://regwatch.example/consumer/pricing-2027'),
       src('PY audit finding', 'PY Audit Extractor', 0.9, '2026-10-02', 'FY2026 finding IA-26-06: promotion price checks not evidenced for online channel.', 'FY2026 Internal Audit Findings Summary, p.6')]),
    R('RISK-0102', 'Logistics and Third-Party Distribution Dependency', 'Operational Risks', 'Supply Chain and Logistics', P.sc, 4, 4, 'Unknown', true, '2026-10-05', 'Medium',
      'One logistics provider runs two of three distribution centres. Its contract has no tested exit plan, and dispatch delays rose before peak season.',
      [src('PY audit finding', 'PY Audit Extractor', 1.0, '2026-11-05', 'Logistics concentration carried forward from FY2026 report (rated High).', 'FY2026 Internal Audit Findings Summary, p.8'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-03 logistics provider dispatch failures this month = 3 (threshold 4).', 'KRI feed: 3pl_dispatch_failures')]),
    R('RISK-0103', 'Inventory Shrink and Store Cash Losses', 'Operational Risks', 'Store Cash Handling', P.lp, 4, 4, 'Limited', true, '2026-09-21', 'High',
      'Shrink reached 2.4% of sales against a 1.8% target. Daily store cash reconciliations are signed, but variances over €50 are often not investigated, so theft and process errors go unaddressed.',
      [src('Interview transcript', 'Transcript Extractor', 0.9, '2026-11-04', 'Head of Loss Prevention interview: area managers cover 14 stores each; variance follow-up depends on store managers.', 'Risk assessment interview, Head of Loss Prevention, 2026-11-04'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-01 shrink as % of sales (13 weeks) = 2.4 against threshold 1.8 (breach).', 'KRI feed: shrink_pct')]),
    R('RISK-0104', 'Ethical Sourcing and Modern Slavery Due Diligence', 'Compliance Risks', 'Modern Slavery and Ethical Sourcing', P.buy, 3, 4, 'Unknown', false, '2026-11-12', 'High',
      'New apparel and home suppliers are onboarded before ethical audits, exposing the group to forced-labour allegations and supply chain due diligence rules.',
      [src('External risk', 'Regulations Agent', 0.76, '2026-11-12', 'Supply chain due diligence obligations extend to tier-2 suppliers for large retailers.', 'https://regwatch.example/eu/supply-chain-due-diligence')]),
    R('RISK-0105', 'E-commerce Fraud and Account Takeover', 'Technology Risks', 'E-commerce Platform', P.ecom, 4, 4, 'Moderate', false, '2026-11-10', 'High',
      'Credential-stuffing attacks on the loyalty app allow points theft and fraudulent orders.',
      [src('External risk', 'Scandals Agent', 0.72, '2026-11-10', 'Two peer retailers disclosed loyalty account takeovers affecting thousands of customers.', 'https://retailnews.example/2026/11/loyalty-ato')]),
    R('RISK-0106', 'Payment Card Data Security (PCI DSS)', 'Technology Risks', 'Cybersecurity', P.ciso, 4, 4, 'Moderate', true, '2026-11-04', 'Medium',
      'Older POS terminals in 60 stores and open vulnerability scan failures put cardholder data and PCI DSS compliance at risk.',
      [src('External risk', 'Threats Agent', 0.8, '2026-11-04', 'Skimming malware targeting the POS model used in older stores.', 'https://vulndb.example/pos-malware-2026'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-02 open critical PCI scan failures = 2 (threshold 3).', 'KRI feed: pci_scan_failures')]),
    R('RISK-0107', 'Supplier Rebate Recognition', 'Financial Risks', 'Supplier Rebates', P.cfo, 3, 3, 'Unknown', true, '2026-08-14', 'Medium',
      'Volume rebates of about 6% of cost of sales are accrued on forecasts that are not reconciled to signed agreements, risking misstated margin.',
      [src('External risk', 'Market Signals Agent', 0.66, '2026-10-30', 'Auditors and regulators focus on supplier income recognition at grocers.', 'https://markets.example/retail-rebates-focus')]),
    R('RISK-0108', 'Store Portfolio Performance', 'Strategic Risks', 'Store Portfolio', P.coo, 3, 3, 'Unknown', true, '2026-07-01', 'Low',
      'Forty city-centre stores are loss-making, and lease decisions depend on footfall forecasts that have been optimistic.',
      [src('Interview transcript', 'Transcript Extractor', 0.72, '2026-10-20', 'COO interview: footfall 9% below plan in city-centre stores.', 'Risk assessment interview, COO, 2026-10-20')]),
    R('RISK-0109', 'Distribution Centre Business Continuity', 'Operational Risks', 'Business Continuity', P.sc, 3, 3, 'Unknown', true, '2026-09-02', 'Low',
      'Chilled distribution centre DC2 has no tested contingency if refrigeration or the warehouse system fails.',
      [src('PY audit finding', 'PY Audit Extractor', 0.84, '2026-09-02', 'FY2026 finding IA-26-12: DC2 contingency plan not tested.', 'FY2026 Internal Audit Findings Summary, p.13')]),
    R('RISK-0110', 'Privileged Access to POS and Merchandising Systems', 'Technology Risks', 'Identity and Access', P.cto, 3, 4, 'Strong', true, '2026-06-11', 'Medium',
      'Shared administrator accounts on POS back-office servers allowed price and refund changes without traceability.',
      [src('Interview transcript', 'Transcript Extractor', 0.8, '2026-06-11', 'IT interview: shared admin accounts found on 12 store servers; since removed.', 'Risk assessment interview, IT, 2026-06-11')]),
    R('RISK-0111', 'Food Safety and Product Recall', 'Compliance Risks', 'Product Safety', P.cco, 3, 4, 'Strong', true, '2026-05-19', 'Medium',
      'Own-brand products must be traceable within four hours for recalls; gaps could harm customers and lead to enforcement.',
      [src('External risk', 'Regulations Agent', 0.7, '2026-05-19', 'Food safety authority guidance on recall traceability tests for retailers.', 'https://regwatch.example/food/recall-traceability')]),
    R('RISK-0112', 'Store Manager Turnover and Succession', 'Human Capital Risks', 'Store Staffing', P.chro, 2, 4, 'Moderate', true, '2026-04-08', 'Low',
      'Store manager turnover is 28% a year and 40% of stores have no ready deputy.',
      [src('Interview transcript', 'Transcript Extractor', 0.75, '2026-04-08', 'People Director interview: deputy manager programme paused in 2025.', 'Risk assessment interview, People Director, 2026-04-08')])
  ];
  const KRIS = [
    { id: 'KRI-01', name: 'Shrink as % of sales (13 weeks)', value: 2.4, threshold: 1.8, risk: 'RISK-0103', trend: [1.6, 1.7, 1.9, 2.0, 2.2, 2.4] },
    { id: 'KRI-02', name: 'Open critical PCI scan failures', value: 2, threshold: 3, risk: 'RISK-0106', trend: [5, 4, 4, 3, 2, 2] },
    { id: 'KRI-03', name: 'Logistics dispatch failures (month)', value: 3, threshold: 4, risk: 'RISK-0102', trend: [0, 1, 1, 2, 2, 3] }
  ];
  const CONTROLS = [
    C('C-01', 'RISK-0101', 'Promotional prices validated against price history before go-live', 'Preventive', 'IT-dependent manual', 'Weekly', P.cco),
    C('C-02', 'RISK-0101', 'Quarterly consumer-law compliance attestation by trading directors', 'Detective', 'Manual', 'Quarterly', P.cco),
    C('C-03', 'RISK-0102', 'Logistics provider due diligence and contract review', 'Preventive', 'Manual', 'Annual', P.sc),
    C('C-04', 'RISK-0102', 'Distribution contingency plan tested', 'Detective', 'Manual', 'Annual', P.sc),
    C('C-05', 'RISK-0102', 'Logistics provider KPIs reviewed with escalation of failures', 'Detective', 'IT-dependent manual', 'Monthly', P.sc),
    C('C-06', 'RISK-0103', 'Daily store cash reconciliation reviewed, with variances over €50 escalated to Loss Prevention', 'Detective', 'IT-dependent manual', 'Daily', P.lp),
    C('C-07', 'RISK-0103', 'Shrink hotspot review and stock-count programme approved', 'Preventive', 'Manual', 'Quarterly', P.lp),
    C('C-08', 'RISK-0104', 'Ethical audit completed before a supplier is onboarded', 'Preventive', 'Manual', 'Event-driven', P.buy),
    C('C-09', 'RISK-0105', 'Fraud rules engine scores orders; flagged orders reviewed', 'Detective', 'Automated', 'Recurring', P.ecom),
    C('C-10', 'RISK-0106', 'PCI vulnerability scan failures tracked to remediation', 'Detective', 'IT-dependent manual', 'Weekly', P.ciso),
    C('C-11', 'RISK-0106', 'Annual PCI DSS assessment and service-provider AOC review', 'Detective', 'Manual', 'Annual', P.ciso),
    C('C-12', 'RISK-0107', 'Supplier rebate accruals reconciled to signed agreements', 'Detective', 'Manual', 'Monthly', P.cfo),
    C('C-13', 'RISK-0109', 'DC contingency and refrigeration failover test', 'Detective', 'Manual', 'Quarterly', P.sc),
    C('C-14', 'RISK-0110', 'Privileged access recertification for POS and merchandising systems', 'Detective', 'Manual', 'Quarterly', P.cto),
    C('C-15', 'RISK-0110', 'Leaver access removed within 1 business day', 'Preventive', 'Automated', 'Recurring', P.cto),
    C('C-16', 'RISK-0111', 'Food safety incidents and recall tests reviewed by the Product Safety Committee', 'Detective', 'Manual', 'Monthly', P.cco),
    C('C-17', 'RISK-0108', 'Store P&L and lease decisions reviewed by ExCo', 'Detective', 'Manual', 'Monthly', P.coo),
    C('C-18', 'RISK-0112', 'Store manager succession pipeline reviewed', 'Preventive', 'Manual', 'Annual', P.chro)
  ];
  const SEED_RUN = { id: 'RUN-2026-11-14', name: 'External research, daily run', started: '2026-11-14 06:00', status: 'Awaiting review', candidates: [
    CAND('CAN-301', 'Driver strike threat at logistics provider', 'Union ballot at the logistics provider could stop deliveries during peak season.', 'Operational Risks', 'Supply Chain and Logistics', 'Scandals Agent', 0.86, 'high', 'RISK-0102', 0.88, 'https://retailnews.example/logistics-strike-ballot', true),
    CAND('CAN-302', 'Organised retail crime in city-centre stores', 'Police and peers report organised theft gangs targeting high-value goods.', 'Operational Risks', 'Inventory Shrink', 'Scandals Agent', 0.74, 'high', 'RISK-0103', 0.72, 'https://retailnews.example/organised-retail-crime'),
    CAND('CAN-303', 'Credential-stuffing botnet targeting loyalty apps', 'Botnet traffic against retail loyalty logins rose sharply this month.', 'Technology Risks', 'E-commerce Platform', 'Threats Agent', 0.69, 'medium', 'RISK-0105', 0.41, 'https://threatintel.example/loyalty-botnet'),
    CAND('CAN-304', 'Refrigeration failure at DC2 last summer', 'Transcript: DC2 lost chilled stock worth €180k during a 6-hour refrigeration failure.', 'Operational Risks', 'Business Continuity', 'Transcript Extractor', 0.71, 'medium', 'RISK-0109', 0.58, 'Risk assessment interview, Supply Chain Director, 2026-10-28'),
    CAND('CAN-305', 'Cash variances not investigated in 12 stores', 'Transcript: variance follow-up left to store managers; 12 stores had repeated unexplained variances.', 'Operational Risks', 'Store Cash Handling', 'Transcript Extractor', 0.91, 'high', 'RISK-0103', 0.91, 'Risk assessment interview, Head of Loss Prevention, 2026-11-04', true)
  ] };
  const SIGNAL_POOL = [
    SIG('Peer grocer recall of contaminated salad', 'A peer recalled own-brand salad after a listeria finding.', 'Compliance Risks', 'Product Safety', 'Scandals Agent', 'high', 'RISK-0111'),
    SIG('Skimming malware on POS terminals', 'New malware family targets older POS terminals.', 'Technology Risks', 'Cybersecurity', 'Threats Agent', 'high', 'RISK-0106'),
    SIG('Unit pricing rules updated', 'Unit prices must use consistent measures across shelf and online.', 'Compliance Risks', 'Consumer Law and Pricing', 'Regulations Agent', 'high', 'RISK-0101'),
    SIG('Auditor scrutiny of supplier income', 'Audit firms flag rebate recognition as a key audit matter at peers.', 'Financial Risks', 'Supplier Rebates', 'Market Signals Agent', 'medium', 'RISK-0107'),
    SIG('Supplier onboarded without ethical audit', 'Buying team describes onboarding an apparel supplier before its audit.', 'Compliance Risks', 'Modern Slavery and Ethical Sourcing', 'Transcript Extractor', 'high', 'RISK-0104'),
    SIG('Phishing campaign targeting store managers', 'Fake head-office emails ask managers to reset till passwords.', 'Technology Risks', 'Identity and Access', 'Threats Agent', 'medium', 'RISK-0110')
  ];
  const SEED_AUDITS = [
    { id: 'AUD-2027-018', title: 'Store Cash and Loss Prevention Audit', l1: 'Operational Risks', risks: ['RISK-0103'], status: 'Fieldwork', lead: P.snr, start: '2026-10-20', end: '2026-12-12', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] } },
    { id: 'AUD-2027-021', title: 'PCI DSS Compliance Review', l1: 'Technology Risks', risks: ['RISK-0106'], status: 'Not started', lead: P.mgr, start: '2027-01-12', end: '2027-02-27', source: 'Manual', planning: { step: 1, approved: [] } },
    { id: 'AUD-2026-044', title: 'Food Safety and Recall Review', l1: 'Compliance Risks', risks: ['RISK-0111'], status: 'Reported', lead: P.mgr, start: '2026-06-02', end: '2026-07-25', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] }, rating: 'Satisfactory' }
  ];
  const SEED_SAMPLES = mkSamples('CASH', [338, 340, 339, 340, 338, 340, 337, 340, 339, 340, 338, 340, 339, 340, 340], [4, 5, 5, 7, 6, 8, 9, 9, 10, 11, 12, 12, 13, 15, 16],
    { 3: 'Variance of €640 at store 118 not escalated to Loss Prevention.', 6: 'No reconciliation review retained; area manager on leave with no delegate.', 11: 'Review signed, but 12 variances over €50 not escalated.' });
  const SEED_ISSUES = [
    ISSUE('ISS-0412', 'Recall traceability test not performed for two own-brand lines', 'AUD-2026-044', 'RISK-0111', 'Medium', P.cco, '2026-10-31', 'In progress',
      'The 2026 recall traceability test excluded own-brand ready meals and baby food.', 'Product Safety Policy s.4.1: test recall traceability for every own-brand category each year.',
      'Category owners changed and the test plan was not updated.', 'A recall in these categories could take longer than four hours, harming customers.', 'Run both tests; assign the test plan to the Product Safety Committee.', '2026-07-25'),
    ISSUE('ISS-0413', 'Food safety incident reports lack escalation thresholds', 'AUD-2026-044', 'RISK-0111', 'Low', P.cco, '2026-12-31', 'Open',
      'Monthly incident packs list complaints but define no thresholds that trigger escalation.', 'Product Safety Policy s.6: escalate emerging issues to the committee.', 'No definition of an emerging issue.', 'Systemic issues may surface late.', 'Define thresholds per product category.', '2026-07-25'),
    ISSUE('ISS-0398', 'Shared admin accounts on POS back-office servers', 'AUD-2026-031', 'RISK-0110', 'High', P.cto, '2026-09-30', 'Closed - pending validation',
      'Shared administrator accounts were active on 12 store back-office servers.', 'Access Standard s.3.1: named privileged accounts only.',
      'Store server build image included a shared account.', 'Untraceable price and refund changes could enable fraud.', 'Remove accounts; rebuild the image without shared IDs.', '2026-06-20')
  ];
  const RSTMT = {
    'RISK-0101': ['promotional prices are not checked against price history', 'customers see misleading reductions', 'consumer-law enforcement, fines and reputational damage'],
    'RISK-0102': ['one provider runs two distribution centres without a tested exit', 'the provider fails during peak', 'empty shelves and lost sales'],
    'RISK-0103': ['cash variances are not investigated and area managers are stretched', 'theft and process errors persist', 'higher shrink, cash losses and margin erosion'],
    'RISK-0104': ['suppliers are onboarded before ethical audits', 'forced labour exists in the supply chain', 'legal breaches and reputational damage'],
    'RISK-0105': ['loyalty logins are exposed to credential stuffing', 'accounts are taken over', 'fraud losses and customer harm'],
    'RISK-0106': ['older POS terminals and scan failures remain', 'card data is skimmed', 'card scheme fines and loss of acceptance'],
    'RISK-0107': ['rebate accruals rely on forecasts', 'supplier income is overstated', 'misstated margin and audit adjustments'],
    'RISK-0108': ['lease decisions use optimistic footfall', 'loss-making stores are kept open', 'continued losses'],
    'RISK-0109': ['DC2 has no tested contingency', 'refrigeration or systems fail', 'stock loss and empty chilled shelves'],
    'RISK-0110': ['shared admin accounts exist on store servers', 'price or refund changes cannot be traced', 'undetected fraud'],
    'RISK-0111': ['recall traceability is not tested for all lines', 'unsafe product stays on sale', 'customer harm and enforcement'],
    'RISK-0112': ['stores lack ready deputies', 'store managers leave', 'weaker store controls and service']
  };
  const L1_AUDIT = { 'Compliance Risks': ['Consumer and Product Compliance Audit', 'Covers pricing, ethical sourcing and product safety.'], 'Operational Risks': ['Stores and Supply Chain Audit', 'Covers logistics dependency, shrink and continuity.'], 'Technology Risks': ['Payments and Digital Security Audit', 'Covers PCI DSS, e-commerce fraud and access.'], 'Financial Risks': ['Supplier Income Audit', 'Covers rebate recognition.'], 'Strategic Risks': ['Store Portfolio Review', 'Covers store performance and leases.'], 'Human Capital Risks': ['Store Leadership Review', 'Covers turnover and succession.'] };
  const KEYTEST = {
    cols: ['Stores', 'Variances > €50'],
    population: '128 trading days, 1 Jul to 6 Nov 2026',
    attrs: ['A. Reconciliation reviewed and signed', 'B. Variances over €50 identified', 'C. Variances escalated to Loss Prevention'],
    passNote: s => `${s.ev}: ${s.m1} store reconciliations reviewed; ${s.m2} variances over €50 escalated to Loss Prevention.`,
    design: { owner: 'Area manager reviews; no delegate named for absences.', gap06: 'Escalation is required, but the procedure sets no deadline for Loss Prevention to investigate.', gap07: 'Stock-count programme changes are approved verbally; no record kept.' },
    issue: { title: 'Store cash variances not consistently escalated to Loss Prevention',
      criteria: 'Cash Handling Procedure s.4.5: variances over €50 are escalated to Loss Prevention the same day and investigated within 5 days.',
      cause: 'Area managers cover 14 stores each with no delegate, and the procedure sets no investigation deadline (design gap from the test of design).',
      action: '1) Name a delegate reviewer for every area (owner Head of Loss Prevention, 31 Dec 2026). 2) Automate variance alerts from the cash system to Loss Prevention (31 Jan 2027). 3) Weekly shrink and variance report to the COO until shrink is below 1.8% (from 15 Dec 2026).',
      trend: (a, b) => `Daily variances over €50 rose from ${a.m2} to ${b.m2} over the period.` }
  };
  return { ORG, PEOPLE: P, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST };
})();
