/* Crypto exchange: Halcyra Digital Exchange FZE (fictional VARA-licensed exchange, Dubai). */
DATASETS.crypto = (() => {
  const ORG = { name: 'Halcyra Digital Exchange FZE', short: 'Halcyra', fy: 'FY2027', asOf: '2026-11-14', industry: 'Crypto exchange', label: 'Crypto exchange (Halcyra)' };
  const P = {
    cae: 'R. Okafor (CAE)', mgr: 'L. Varga (IA Manager)', snr: 'S. Haddad (Senior Auditor)',
    cro: 'N. Farouk (CRO)', cco: 'H. Al Mansoori (Compliance Officer)', mlro: 'I. Petrova (MLRO)', ciso: 'D. Chen (CISO)',
    custody: 'O. Adeyemi (Head of Custody)', coo: 'F. Rossi (COO)', cfo: 'M. Siddiqui (CFO)', chro: 'A. Kapoor (Head of People)',
    cto: 'Y. Sato (CTO)', mkt: 'B. Laurent (Head of Market Surveillance)'
  };
  const TAXONOMY = {
    'Strategic Risks': ['Token Listing Strategy', 'Market Expansion', 'Competitive Landscape', 'Product Innovation', 'Reputation'],
    'Financial Risks': ['Liquidity', 'Treasury and Own Funds', 'Prudential Capital', 'Financial Reporting', 'Revenue Recognition'],
    'Operational Risks': ['Custody and Wallet Operations', 'Third Party', 'Business Continuity', 'Client Money', 'Process Execution'],
    'Compliance Risks': ['Regulatory Compliance (VARA)', 'Regulatory Change', 'AML/CFT', 'Sanctions and Travel Rule', 'Market Conduct', 'Data Protection'],
    'Technology Risks': ['Cybersecurity', 'Key Management', 'Smart Contract', 'IT Operations', 'Identity and Access'],
    'Human Capital Risks': ['Key Person', 'Fit and Proper', 'Training', 'Conduct and Culture']
  };
  const RISKS = [
    R('RISK-0101', 'Regulatory Change and VARA Rulebook Compliance', 'Compliance Risks', 'Regulatory Change', P.cco, 4, 4, 'Unknown', true, '2026-10-02', 'High',
      'Updated VARA rulebooks and marketing rules take effect in 2027. The obligations register is not mapped to control owners, so the exchange could miss effective dates or licence conditions.',
      [src('External risk', 'Regulations Agent', 0.84, '2026-11-03', 'Rulebook revisions published with 2027 effective dates covering exchange services, marketing and client disclosures.', 'https://regwatch.example/vara/rulebook-updates-2026'),
       src('PY audit finding', 'PY Audit Extractor', 0.9, '2026-10-02', 'FY2026 finding IA-26-05: regulatory obligations register not reconciled to rulebook versions.', 'FY2026 Internal Audit Findings Summary, p.5')]),
    R('RISK-0102', 'Liquidity Provider and Critical Vendor Concentration', 'Operational Risks', 'Third Party', P.coo, 4, 4, 'Unknown', true, '2026-10-05', 'Medium',
      'Two market makers provide 70% of order-book depth, and KYC, cloud hosting and blockchain node services each rely on a single vendor. Exit plans are untested.',
      [src('PY audit finding', 'PY Audit Extractor', 1.0, '2026-11-05', 'Vendor and market-maker concentration carried forward from FY2026 report (rated High).', 'FY2026 Internal Audit Findings Summary, p.8'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-03 top-two market maker share of depth = 70% (threshold 75%).', 'KRI feed: mm_depth_share')]),
    R('RISK-0103', 'Client Asset Segregation and Wallet Reconciliation', 'Operational Risks', 'Custody and Wallet Operations', P.custody, 4, 4, 'Limited', true, '2026-09-21', 'High',
      'On-chain wallet balances are reconciled daily to the client ledger, but breaks older than 24 hours rose to 14 after three new chain integrations. Unresolved breaks could hide shortfalls in client assets.',
      [src('Interview transcript', 'Transcript Extractor', 0.91, '2026-11-04', 'Head of Custody interview: new networks added without updating reconciliation rules; one engineer covers all chains.', 'Risk assessment interview, Head of Custody, 2026-11-04'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-01 unreconciled wallet breaks older than 24 hours = 14 against threshold 5 (breach).', 'KRI feed: wallet_recon_breaks')]),
    R('RISK-0104', 'Market Abuse Surveillance Coverage', 'Compliance Risks', 'Market Conduct', P.mkt, 3, 4, 'Unknown', false, '2026-11-12', 'High',
      'Wash-trading and spoofing scenarios do not yet cover 46 newly listed pairs or the margin product, leaving manipulation undetected.',
      [src('External risk', 'Regulations Agent', 0.76, '2026-11-12', 'Supervisory statement expects surveillance coverage of all listed instruments from day one of trading.', 'https://regwatch.example/vara/market-conduct-2026')]),
    R('RISK-0105', 'Hot Wallet Compromise and Key Management', 'Technology Risks', 'Key Management', P.ciso, 4, 4, 'Moderate', false, '2026-11-10', 'High',
      'Hot wallets hold about 4% of client assets. Compromise of signer infrastructure or approval workflows could lead to theft of client funds.',
      [src('External risk', 'Scandals Agent', 0.74, '2026-11-10', 'A peer exchange lost client funds after attackers compromised a hot-wallet signing server.', 'https://cryptonews.example/2026/11/peer-hot-wallet-loss')]),
    R('RISK-0106', 'Smart Contract and Token Integration Vulnerabilities', 'Technology Risks', 'Smart Contract', P.cto, 4, 4, 'Moderate', true, '2026-11-04', 'Medium',
      'Deposit contracts and bridge integrations for new tokens are deployed with open audit findings, which could allow loss or freezing of client deposits.',
      [src('External risk', 'Threats Agent', 0.82, '2026-11-04', 'Critical vulnerability disclosed in a token bridge library used by the exchange for two networks.', 'https://vulndb.example/advisories/bridge-2026-118'),
       src('KRI', 'KRI Monitor', 1.0, '2026-11-13', 'KRI-02 open critical smart-contract findings = 1 (threshold 2).', 'KRI feed: sc_findings_critical')]),
    R('RISK-0107', 'Treasury and Own Funds Volatility', 'Financial Risks', 'Treasury and Own Funds', P.cfo, 3, 3, 'Unknown', true, '2026-08-14', 'Medium',
      'Part of own funds is held in volatile assets, so a sharp market fall could reduce headroom over the prudential capital requirement.',
      [src('External risk', 'Market Signals Agent', 0.68, '2026-10-30', 'Major tokens fell 22% in a week; stablecoin spreads widened.', 'https://markets.example/crypto-volatility-q4')]),
    R('RISK-0108', 'Token Listing and Delisting Governance', 'Strategic Risks', 'Token Listing Strategy', P.coo, 3, 3, 'Unknown', true, '2026-07-01', 'Low',
      'Pressure to list new tokens quickly could weaken due diligence on token issuers and liquidity.',
      [src('Interview transcript', 'Transcript Extractor', 0.72, '2026-10-20', 'COO interview: listing pipeline doubled; committee met by email twice this quarter.', 'Risk assessment interview, COO, 2026-10-20')]),
    R('RISK-0109', 'Matching Engine Business Continuity', 'Operational Risks', 'Business Continuity', P.cto, 3, 3, 'Unknown', true, '2026-09-02', 'Low',
      'Failover of the matching engine to the secondary region has not been tested under full load.',
      [src('PY audit finding', 'PY Audit Extractor', 0.85, '2026-09-02', 'FY2026 finding IA-26-11: failover test run at 20% of peak volume only.', 'FY2026 Internal Audit Findings Summary, p.12')]),
    R('RISK-0110', 'Privileged Access to Wallet Infrastructure', 'Technology Risks', 'Identity and Access', P.ciso, 3, 4, 'Strong', true, '2026-06-11', 'Medium',
      'Temporary administrator keys created during the custody platform upgrade remained active after the upgrade.',
      [src('Interview transcript', 'Transcript Extractor', 0.8, '2026-06-11', 'Security interview: 6 temporary admin keys found active 30 days after upgrade; since revoked.', 'Risk assessment interview, IT Security, 2026-06-11')]),
    R('RISK-0111', 'Client Protection and Marketing Disclosures', 'Compliance Risks', 'Regulatory Compliance (VARA)', P.cco, 3, 4, 'Strong', true, '2026-05-19', 'Medium',
      'Promotions and social media campaigns must carry approved risk warnings; inconsistent approval could mislead clients.',
      [src('External risk', 'Regulations Agent', 0.72, '2026-05-19', 'Marketing rules require prominent risk disclosures on all virtual asset promotions.', 'https://regwatch.example/vara/marketing-rules')]),
    R('RISK-0112', 'Key Person and Fit-and-Proper Coverage', 'Human Capital Risks', 'Key Person', P.chro, 2, 4, 'Moderate', true, '2026-04-08', 'Low',
      'The MLRO and Head of Custody roles have no approved deputy, and fit-and-proper renewals are tracked manually.',
      [src('Interview transcript', 'Transcript Extractor', 0.75, '2026-04-08', 'Head of People interview: deputies not appointed for two controlled functions.', 'Risk assessment interview, Head of People, 2026-04-08')])
  ];
  const KRIS = [
    { id: 'KRI-01', name: 'Unreconciled wallet breaks older than 24 hours', value: 14, threshold: 5, risk: 'RISK-0103', trend: [2, 3, 4, 6, 9, 14] },
    { id: 'KRI-02', name: 'Open critical smart-contract findings', value: 1, threshold: 2, risk: 'RISK-0106', trend: [3, 2, 2, 1, 1, 1] },
    { id: 'KRI-03', name: 'Top-two market maker share of depth (%)', value: 70, threshold: 75, risk: 'RISK-0102', trend: [55, 58, 62, 64, 68, 70] }
  ];
  const CONTROLS = [
    C('C-01', 'RISK-0101', 'VARA obligations register reviewed and mapped to control owners', 'Preventive', 'Manual', 'Monthly', P.cco),
    C('C-02', 'RISK-0101', 'Quarterly regulatory readiness attestation to the board', 'Detective', 'Manual', 'Quarterly', P.cco),
    C('C-03', 'RISK-0102', 'Due diligence on market makers and critical vendors', 'Preventive', 'Manual', 'Annual', P.coo),
    C('C-04', 'RISK-0102', 'Exit plans for critical vendors and market makers tested', 'Detective', 'Manual', 'Annual', P.coo),
    C('C-05', 'RISK-0102', 'Market maker spread and depth obligations monitored', 'Detective', 'IT-dependent manual', 'Monthly', P.coo),
    C('C-06', 'RISK-0103', 'Daily reconciliation of on-chain wallet balances to the client ledger, with breaks escalated', 'Detective', 'IT-dependent manual', 'Daily', P.custody),
    C('C-07', 'RISK-0103', 'Reconciliation rules approved for each new chain or token', 'Preventive', 'Manual', 'Quarterly', P.custody),
    C('C-08', 'RISK-0104', 'Surveillance scenario coverage approved before a new pair or product goes live', 'Preventive', 'Manual', 'Event-driven', P.mkt),
    C('C-09', 'RISK-0105', 'Hot wallet withdrawals above limit need multi-party (MPC) approval', 'Preventive', 'Automated', 'Recurring', P.ciso),
    C('C-10', 'RISK-0106', 'Smart-contract audit findings tracked to closure before deployment', 'Detective', 'IT-dependent manual', 'Weekly', P.cto),
    C('C-11', 'RISK-0106', 'Independent security audit before token or chain integration', 'Preventive', 'Manual', 'Annual', P.cto),
    C('C-12', 'RISK-0107', 'Own funds and capital headroom monitored against the prudential requirement', 'Detective', 'Manual', 'Monthly', P.cfo),
    C('C-13', 'RISK-0109', 'Matching engine failover test at peak load', 'Detective', 'Manual', 'Quarterly', P.cto),
    C('C-14', 'RISK-0110', 'Privileged access recertification for wallet infrastructure', 'Detective', 'Manual', 'Quarterly', P.ciso),
    C('C-15', 'RISK-0110', 'Leaver access and keys revoked within 1 business day', 'Preventive', 'Automated', 'Recurring', P.ciso),
    C('C-16', 'RISK-0111', 'Marketing communications pre-approved by Compliance', 'Preventive', 'Manual', 'Monthly', P.cco),
    C('C-17', 'RISK-0108', 'Listing committee approves tokens against listing criteria', 'Preventive', 'Manual', 'Monthly', P.coo),
    C('C-18', 'RISK-0112', 'Deputies and fit-and-proper renewals reviewed by the board', 'Preventive', 'Manual', 'Annual', P.chro)
  ];
  const SEED_RUN = { id: 'RUN-2026-11-14', name: 'External research, daily run', started: '2026-11-14 06:00', status: 'Awaiting review', candidates: [
    CAND('CAN-301', 'Market maker withdrawal during volatility', 'A major market maker paused quoting on two peer exchanges during the October sell-off, cutting depth by half.', 'Operational Risks', 'Third Party', 'Market Signals Agent', 0.86, 'high', 'RISK-0102', 0.88, 'https://markets.example/mm-withdrawal-oct', true),
    CAND('CAN-302', 'Stuck deposits on newly integrated network', 'Deposits on a newly integrated layer-2 network were credited late, creating ledger and on-chain differences at peers.', 'Operational Risks', 'Custody and Wallet Operations', 'Threats Agent', 0.74, 'high', 'RISK-0103', 0.72, 'https://chainstatus.example/l2-delays'),
    CAND('CAN-303', 'Address-poisoning scams targeting users', 'Users copy look-alike addresses from their history and send funds to attackers; peers report rising complaints.', 'Technology Risks', 'Cybersecurity', 'Scandals Agent', 0.69, 'medium', 'RISK-0105', 0.41, 'https://cryptonews.example/address-poisoning'),
    CAND('CAN-304', 'Cloud region outage at a peer exchange', 'A peer halted trading for 5 hours when its primary cloud region failed and failover did not complete.', 'Operational Risks', 'Business Continuity', 'Threats Agent', 0.71, 'medium', 'RISK-0109', 0.58, 'https://cloudstatus.example/oct-outage'),
    CAND('CAN-305', 'Reconciliation breaks after chain integrations', 'Transcript: breaks rose after three new networks were added without updated reconciliation rules.', 'Operational Risks', 'Custody and Wallet Operations', 'Transcript Extractor', 0.91, 'high', 'RISK-0103', 0.91, 'Risk assessment interview, Head of Custody, 2026-11-04', true)
  ] };
  const SIGNAL_POOL = [
    SIG('Peer fined for misleading crypto promotions', 'A regulator fined an exchange for promotions without risk warnings.', 'Compliance Risks', 'Regulatory Compliance (VARA)', 'Scandals Agent', 'medium', 'RISK-0111'),
    SIG('Exploit in a widely used token bridge', 'Attackers drained a bridge contract used by several exchanges.', 'Technology Risks', 'Smart Contract', 'Threats Agent', 'high', 'RISK-0106'),
    SIG('Consultation on updated custody requirements', 'Draft rules propose stricter segregation and reconciliation evidence for custodians.', 'Compliance Risks', 'Regulatory Change', 'Regulations Agent', 'high', 'RISK-0101'),
    SIG('Stablecoin de-peg event', 'A large stablecoin traded 4% below par for six hours.', 'Financial Risks', 'Treasury and Own Funds', 'Market Signals Agent', 'medium', 'RISK-0107'),
    SIG('Wash-trading pattern in new pairs', 'Surveillance analyst describes circular trades between linked accounts in new listings.', 'Compliance Risks', 'Market Conduct', 'Transcript Extractor', 'high', 'RISK-0104'),
    SIG('Phishing campaign targeting exchange admins', 'Fake hardware-wallet update emails aimed at operations staff.', 'Technology Risks', 'Identity and Access', 'Threats Agent', 'medium', 'RISK-0110')
  ];
  const SEED_AUDITS = [
    { id: 'AUD-2027-018', title: 'Custody and Client Asset Audit', l1: 'Operational Risks', risks: ['RISK-0103'], status: 'Fieldwork', lead: P.snr, start: '2026-10-20', end: '2026-12-12', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] } },
    { id: 'AUD-2027-021', title: 'Smart Contract Security Review', l1: 'Technology Risks', risks: ['RISK-0106'], status: 'Not started', lead: P.mgr, start: '2027-01-12', end: '2027-02-27', source: 'Manual', planning: { step: 1, approved: [] } },
    { id: 'AUD-2026-044', title: 'Marketing and Client Disclosure Review', l1: 'Compliance Risks', risks: ['RISK-0111'], status: 'Reported', lead: P.mgr, start: '2026-06-02', end: '2026-07-25', source: 'Manual', planning: { step: 7, approved: [1, 2, 3, 4, 5, 6] }, rating: 'Satisfactory' }
  ];
  const SEED_SAMPLES = mkSamples('WREC', [212, 214, 214, 218, 221, 221, 226, 230, 233, 236, 241, 244, 246, 251, 255], [1, 1, 2, 3, 2, 4, 5, 4, 6, 7, 8, 9, 10, 12, 14],
    { 3: 'Break of 0.42 BTC open for 3 days; no escalation to the Head of Custody found.', 6: 'No reconciliation sign-off retained; engineer on leave with no delegate.', 11: 'Reconciliation signed, but 9 breaks older than 24 hours not escalated.' });
  const SEED_ISSUES = [
    ISSUE('ISS-0412', 'Promotions published without Compliance pre-approval', 'AUD-2026-044', 'RISK-0111', 'Medium', P.cco, '2026-10-31', 'In progress',
      'Four of 25 promotions sampled went live on social media before Compliance approval.', 'Marketing Policy s.3.1 requires Compliance approval and a risk warning before publication.',
      'The agency publishes directly to social channels without a workflow gate.', 'Clients may see promotions without required risk warnings, a breach of marketing rules.', 'Route all publications through the approval workflow; remove agency publishing rights.', '2026-07-25'),
    ISSUE('ISS-0413', 'Risk warning wording inconsistent across languages', 'AUD-2026-044', 'RISK-0111', 'Low', P.cco, '2026-12-31', 'Open',
      'Arabic and Russian versions of two campaigns used shortened risk warnings.', 'Marketing Policy s.3.4: approved warning text in every language.', 'No approved translations library.', 'Inconsistent client disclosures.', 'Create an approved translations library and check against it.', '2026-07-25'),
    ISSUE('ISS-0398', 'Temporary admin keys not revoked after custody upgrade', 'AUD-2026-031', 'RISK-0110', 'High', P.ciso, '2026-09-30', 'Closed - pending validation',
      '6 temporary administrator keys remained active 30 days after the custody platform upgrade.', 'Key Management Standard s.4.2: temporary privileged keys expire within 7 days.',
      'Keys were issued outside the PAM tool, so automatic expiry did not apply.', 'Unauthorised signing or configuration changes could go undetected.', 'Revoke keys; enforce issuance only through the PAM tool.', '2026-06-20')
  ];
  const RSTMT = {
    'RISK-0101': ['rulebook changes are not mapped to control owners', 'the exchange misses a 2027 effective date or licence condition', 'regulatory action, fines and licence restrictions'],
    'RISK-0102': ['depth and critical services depend on few providers', 'a market maker or vendor withdraws during stress', 'disorderly markets, client harm and outages'],
    'RISK-0103': ['reconciliation rules lag new chain integrations', 'wallet breaks stay open and hide a client-asset shortfall', 'loss of client assets, breach of segregation rules and supervisory action'],
    'RISK-0104': ['surveillance does not cover new pairs and products', 'manipulation goes undetected', 'client harm and market conduct breaches'],
    'RISK-0105': ['hot-wallet signer infrastructure can be compromised', 'attackers withdraw client funds', 'direct loss of client assets and reputational damage'],
    'RISK-0106': ['contracts deploy with open audit findings', 'a vulnerability is exploited', 'loss or freezing of client deposits'],
    'RISK-0107': ['own funds are held in volatile assets', 'a market fall cuts capital headroom', 'breach of the prudential requirement'],
    'RISK-0108': ['listing speed outruns due diligence', 'a weak or fraudulent token is listed', 'client losses and reputational damage'],
    'RISK-0109': ['failover is untested at peak load', 'the matching engine stays down after a regional outage', 'trading halt and client claims'],
    'RISK-0110': ['privileged keys are issued outside the PAM tool', 'temporary access persists', 'unauthorised signing or configuration changes'],
    'RISK-0111': ['promotions can bypass approval', 'clients see promotions without risk warnings', 'client harm and marketing rule breaches'],
    'RISK-0112': ['controlled functions have no deputies', 'a key person leaves', 'gaps in regulated oversight']
  };
  const L1_AUDIT = { 'Compliance Risks': ['Regulatory Compliance Audit', 'Covers VARA rulebook readiness, surveillance coverage and client disclosures.'], 'Operational Risks': ['Custody and Operations Audit', 'Covers client asset segregation, vendor concentration and continuity.'], 'Technology Risks': ['Wallet and Key Security Audit', 'Covers key management, smart contracts and privileged access.'], 'Financial Risks': ['Treasury and Capital Audit', 'Covers own funds and prudential headroom.'], 'Strategic Risks': ['Listing Governance Review', 'Covers token listing due diligence.'], 'Human Capital Risks': ['Controlled Functions Review', 'Covers deputies and fit-and-proper renewals.'] };
  const KEYTEST = {
    cols: ['Wallets', 'Breaks'],
    population: '128 days of daily reconciliations, 1 Jul to 6 Nov 2026',
    attrs: ['A. Reconciliation performed and signed', 'B. Breaks identified and quantified', 'C. Breaks older than 24 hours escalated to the Head of Custody'],
    passNote: s => `${s.ev}: ${s.m1} wallets reconciled and signed; ${s.m2} breaks logged and escalated within 24 hours.`,
    design: { owner: 'Custody engineer performs; no delegate named for absences.', gap06: 'Breaks are logged, but the procedure sets no time limit for resolving them after escalation.', gap07: 'Reconciliation rules for new chains are approved in chat messages; no retained sign-off.' },
    issue: { title: 'Wallet reconciliation breaks not consistently escalated',
      criteria: 'Custody Procedure s.6.2: breaks older than 24 hours are escalated to the Head of Custody the same day and resolved within 3 business days.',
      cause: 'One engineer covers all chains with no delegate, and reconciliation rules were not updated for three new networks (design gap from the test of design).',
      action: '1) Name a delegate for reconciliation sign-off (owner Head of Custody, 31 Dec 2026). 2) Update reconciliation rules for all new networks (31 Jan 2027). 3) Daily break ageing report to the CRO until breaks are below 5 (from 15 Dec 2026).',
      trend: (a, b) => `Open breaks rose from ${a.m2} to ${b.m2} over the period.` }
  };
  return { ORG, PEOPLE: P, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST };
})();
