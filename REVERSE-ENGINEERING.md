# Reverse-engineering analysis: AuditBoard vs AuditOS

This analysis takes AuditBoard (renamed **Optro** in March 2026) apart into the capabilities it sells. It then maps each capability to AuditOS and records what was built to close the most important gaps.

**Method.** This is a clean-room, black-box analysis. It uses only public product descriptions, review listings and standard internal-audit practice (IIA Global Internal Audit Standards, COSO 2013). It does not use AuditBoard's code, screens, assets or documentation, and AuditOS copies none of them. The README disclaimer still applies.

## 1. Capability decomposition

AuditBoard is a connected GRC platform. Each product sits on one shared data model of risks, controls, audits, issues and people:

| Layer | AuditBoard capability (public description) | What it does for an audit team |
|---|---|---|
| Audit management | Audit planning, workpapers, fieldwork, issue tracking, reporting dashboards | Runs each audit from plan to report |
| Review workflow | Preparer and reviewer sign-offs, review notes, role-based permissions | Gives quality assurance and segregation of duties over workpapers |
| Evidence | Evidence (PBC) requests to control owners, document management | Collects evidence from the business without email chains |
| Resourcing | Time tracking, budgets, resource scheduling | Keeps audits on budget and shows team capacity |
| Compliance | Framework mapping across SOX, SOC 2, ISO, NIST ("test once, comply many") | Reuses one control test as evidence for many frameworks |
| Risk | Enterprise risk register, assessments, heat maps | Supports risk-based planning |
| Continuous monitoring | Continuous control testing and monitoring | Tests controls between audits |
| AI | Drafting and summarising documentation, automating fieldwork, autonomous control testing | Speeds up writing and testing |
| Integrations | Connectors to Jira, ServiceNow, Snowflake and 200+ other tools | Pulls data in and pushes actions out |

## 2. Gap analysis (before this change)

| Capability | AuditOS before | Gap |
|---|---|---|
| Risk sensing, assessment, planning | **Ahead.** AI sensing agents, source lineage, appetite tuning and a 6-step planning assistant | None. This is AuditOS's edge. |
| Fieldwork testing | **Strong.** TOD, sample-level TOE, AI explanations, signed conclusion | No workpaper review layer |
| Review notes and sign-off | Missing. One hard-coded user and no reviewer | **Critical.** Without it, IIA quality-assurance requirements and segregation of duties are not met. |
| Evidence (PBC) requests | Missing. Samples assumed evidence was already on file | **High.** This is the biggest day-to-day time sink for real audit teams. |
| Time and budget | Missing | **High.** CAEs report budget against actual to the Audit Committee. |
| Framework mapping | Missing | **Medium.** It is the main value of CrossComply-style products. |
| Issues, reporting, decision log | Present | Reports could be issued before workpapers were reviewed |
| Integrations, continuous monitoring, real users | Missing (the README lists these as Phase 2) | Needs a backend |

## 3. What was built (v2.1)

All new code is in `src/js/governance.js`. Saved browser state from v1 upgrades automatically through `migrate()`, so no demo data is lost.

1. **Users, roles and segregation of duties.** A user switcher in the top bar offers Senior Auditor (Preparer), IA Manager (Reviewer) and CAE (Approver). Every decision-log entry records the user who acted.
2. **Workpaper review notes and two-level sign-off.** Fieldwork has a new *Review and sign-off* tab.
   - The preparer signs only after the conclusion is signed.
   - The reviewer cannot be the preparer. This is enforced, not just warned.
   - Only reviewers and approvers raise notes. A note goes Open → Addressed (preparer response) → Cleared. Only a reviewer who did not write the response can clear it.
   - Reviewer sign-off is blocked while any note is not cleared. A new note withdraws an existing reviewer sign-off.
3. **Report quality gate.** *Issue final report* is blocked until every in-scope workpaper is concluded, prepared and reviewed, no review notes are open, and every evidence request is accepted.
4. **Evidence requests (PBC).** A new module and a new *Request List Agent* (19 agents now).
   - The agent drafts two requests per control from the test scripts: (1) the procedure and walkthrough evidence, and (2) the population with report parameters, so completeness can be checked, plus the samples.
   - Requests move Draft → Sent → Submitted → Accepted, or back to Returned. Each request keeps a comment thread, a reminder count and its days late.
   - The page shows open, overdue and awaiting-review counts and average turnaround, and exports to CSV.
5. **Time and budget.** Budgets by phase can be edited inline, and auditors log time.
   - Estimate at completion (EAC) projects fieldwork hours from weighted workpaper progress.
   - Audits forecast to run more than 10% over budget are flagged.
   - Team utilisation is shown against 32 chargeable hours a week.
6. **Framework crosswalk.** Each control is mapped by rule to COSO 2013 principles, NIST CSF 2.0 functions and SOX ICFR key-control candidacy.
   - The latest signed conclusion flows to every mapped framework.
   - Reviewers confirm each mapping, and the confirmation is logged.

## 4. Roadmap: remaining gaps, in priority order

1. **Backend and real identity.** Move to the Phase 2 API with SSO. The role switcher then becomes real role-based access control.
2. **Control-owner portal.** Let owners upload evidence for PBC requests themselves, through a scoped link, instead of *Record upload*.
3. **Continuous control monitoring.** Run scheduled full-population tests through the Dynamic Testing agent, using the KRI Monitor pattern.
4. **Issue remediation workflow for owners.** Add action-plan milestones, owner updates, and validation testing linked to fieldwork.
5. **Integrations.** Push issues to Jira or ServiceNow, and import populations from a data warehouse.
6. **Control self-assessment surveys.** Collect first-line attestations that feed the risk assessment.
7. **Configurable framework library.** Let users load framework content (ISO 27001, SOC 2, sector regulators) as data instead of fixed rules.

## Sources

- [AuditBoard rebrand to Optro and platform description (Optro FAQ)](https://optro.ai/faqs)
- [AuditBoard review: features, pricing, frameworks (ComplyJet)](https://www.complyjet.com/blog/auditboard-reviews)
- [AuditBoard on Capterra / Software Advice](https://www.softwareadvice.com/audit/soxhub-profile/)
- [AuditBoard AI capabilities (Corporate Compliance Insights)](https://www.corporatecomplianceinsights.com/auditboard-launches-advanced-ai-capabilities/)
- [AuditBoard on Toolradar: integrations and review summary](https://toolradar.com/tools/auditboard)
