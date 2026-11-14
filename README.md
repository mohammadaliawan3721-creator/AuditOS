# AuditOS: AI-first internal audit orchestration (prototype)

AuditOS is a browser-based prototype of an AI-first internal audit platform. It runs the full internal audit lifecycle in one connected app: risk sensing, risk assessment, audit planning, fieldwork, issues management and reporting. AI agents propose, and auditors approve.

It ships with four industry workspaces. Each one has its own fictional company, risk taxonomy, risks, controls, KRIs, audits and issues.

> **Disclaimer.** This is an independent prototype for learning and demonstration. It is not affiliated with, endorsed by or derived from the code of any audit firm or vendor. All companies, people, figures, sources and URLs in the data are fictional.

---

## Contents

1. [Features](#features)
2. [Industries included](#industries-included)
3. [Quick start](#quick-start)
4. [Project structure](#project-structure)
5. [How the logic works](#how-the-logic-works)
6. [The agents](#the-agents)
7. [Publish on GitHub and GitHub Pages](#publish-on-github-and-github-pages)
8. [Customise](#customise)
9. [Phase 2: connect real AI agents](#phase-2-connect-real-ai-agents)
10. [Limitations](#limitations)

---

## Features

| Module | What you can do |
|---|---|
| **Home** | See the lifecycle at a glance: agents enabled, runs logged, decisions waiting, and risks above appetite. |
| **Executive dashboard** | KPIs, action queue, top risks against appetite, coverage gaps, KRI sparklines and audit plan status. |
| **Risk sensing** | Risk register with full source lineage. Run sensing agents (Threats, Scandals, Regulations, Market Signals). Review signals and decide Merge, Create, Monitor or Reject. Confirm or reverse auto-merges. Upload documents for extraction. Export the register as CSV. Browse the taxonomy. |
| **Risk assessment** | 5×5 likelihood × impact scoring, control effectiveness bands, AI score proposals with evidence and counter-signals, editable scoring criteria, an inherent or residual heat map, and an appetite threshold with a near buffer. |
| **Audit planning** | AI plan generator: select uncovered above-appetite and near risks, group them by L1 domain and generate audits. A 6-step planning assistant (ingest → risk statements → controls → planning memo → RCM → test scripts) with an approval gate at every step. |
| **Fieldwork** | Test of design across 5 design attributes. Dynamic testing of operating effectiveness, one sample at a time with explanations. Agree or override each exception, sign the conclusion, and draft an issue with AI. |
| **Issues management** | Issues in 5C format (condition, criteria, cause, consequence, corrective action). The workflow runs Draft → Open → In progress → Closed, pending validation → Closed, with overdue tracking and an AI SMART action plan. |
| **Audit reporting** | Audit report with overall rating, executive summary, control results and findings, built from approved issues only. Includes an Audit Committee summary with decisions and escalations required. |
| **Agent control centre** | Turn each agent on or off, edit its system prompt, run a test, tune the consolidation routing thresholds, and read the run log and the decision log (the human-oversight audit trail). |

## Industries included

Switch industry from the selector in the top bar. Each industry keeps its own saved state in the browser.

| Key | Industry | Fictional company | Fieldwork key control (C-06) |
|---|---|---|---|
| `crypto` | Crypto exchange | Halcyra Digital Exchange FZE (VARA-licensed, Dubai) | Daily on-chain wallet to client-ledger reconciliation |
| `mfg` | Manufacturing | Brennmoor Industrial Components B.V. (Netherlands) | Daily quality release and nonconformance quarantine |
| `retail` | Retail | Larkfield Retail Group (340 stores) | Daily store cash reconciliation and variance escalation |
| `fs` | Financial services | Harbourline Financial Group (mid-size bank) | Daily transaction-monitoring alert ageing review |

Every workspace has the same structure: 12 risks, 18 controls, 3 KRIs, 3 seeded audits, 3 issues, a pending sensing run with 5 signals, and 15 fieldwork samples with 3 planted exceptions.

## Quick start

**Option 1, no install:** download `docs/index.html` and open it in any modern browser.

**Option 2, local server:**

```bash
python3 build.py              # rebuild docs/index.html from src/
python3 -m http.server 8000   # then open http://localhost:8000/docs/
```

**Option 3:** publish with GitHub Pages (see below) and share the link.

Requirements: Python 3.8 or later to build. There are no npm packages and no frameworks.

## Project structure

```
auditos/
├── build.py                         # concatenates src/ into docs/index.html
├── docs/
│   └── index.html                   # built app (served by GitHub Pages)
├── src/
│   ├── styles.css                   # design tokens (light and dark), layout, components
│   ├── data/
│   │   ├── shared.js                # scales, control bands, sample sizes, AGENT registry, dataset switcher
│   │   ├── financial.js             # DATASETS.fs
│   │   ├── crypto.js                # DATASETS.crypto
│   │   ├── manufacturing.js         # DATASETS.mfg
│   │   └── retail.js                # DATASETS.retail
│   └── js/
│       ├── core.js                  # state, scoring rules, AgentRuntime, shell, router, events
│       ├── home-dashboard-sensing.js
│       ├── assessment-planning.js
│       └── fieldwork-issues-reporting-agents.js   # also boots the app
├── LICENSE
└── README.md
```

Edit the files in `src/`, then run `python3 build.py`. Do not edit `docs/index.html` by hand, because the next build overwrites it.

## How the logic works

**Scoring**
- Inherent score = likelihood (1 to 5) × impact (1 to 5).
- Residual score = inherent × (1 − control band reduction), rounded. The bands are Limited (10%), Moderate (30%) and Strong (50%). Unknown leaves the residual as N/A.
- Current score = residual if rated, otherwise inherent.
- Appetite: current score ≥ threshold (default 12) is **above**; within the near buffer (default 2) below the threshold is **near**; anything lower is **within**.
- On a 5×5 grid the only possible scores are 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20 and 25. The threshold snaps up to the next one of these.

**Signal routing (Consolidation Agent)**
- Similarity ≥ auto-merge threshold (default 80%): merged automatically and listed for confirmation or reversal.
- Between the review floor (default 50%) and the auto-merge threshold: a reviewer decides Merge, Monitor or Reject.
- Below the review floor: proposed as a new risk (Create, Monitor or Reject).

**Planning selection**
- Selected risks = above-appetite risks (and near risks, if the buffer is above 0) that no audit already covers, up to an optional cap.
- Selected risks are grouped by L1 category, with one audit per group.

**Sample sizes (methodology table)**
- Annual 1, quarterly 2, monthly 2, weekly 5, daily 15, recurring 25, event-driven 10.
- Automated controls use a test of one with reliance on IT general controls (ITGCs).

**Fieldwork conclusion suggestion**
- 0 exceptions with no design gap: Effective.
- 1 exception, or a design gap: Effective with exceptions.
- 2 or more exceptions: Ineffective.
- The auditor always signs the final conclusion.

**Audit rating**
- 2 or more high issues: Unsatisfactory.
- 1 high issue: Needs improvement.
- Any medium issue: Satisfactory with improvements.
- Otherwise: Satisfactory.

**Human gates.** Every AI output is a proposal until a named reviewer accepts it. Each acceptance, override, rejection or settings change is written to the decision log.

## The agents

There are 18 agents in `src/data/shared.js` (the `AGENTS` array). Each has a purpose, inputs, outputs, a human gate and a system prompt.

| Module | Agents |
|---|---|
| Risk sensing | Threats, Scandals, Regulations, Market Signals, PY Audit Extractor, Transcript Extractor, KRI Monitor, Consolidation |
| Risk assessment | Scoring |
| Audit planning | Plan Generator, Risk Statement Writer, Controls, Planning Memo Writer, RCM Builder, Test Script Writer |
| Fieldwork | Dynamic Testing |
| Issues and reporting | Issue Drafting, Report Writer |

In this prototype every agent runs in **simulated mode**: it returns realistic output built from the dataset after a short delay. All calls go through one function, `AgentRuntime.run()` in `src/js/core.js`, so switching to live AI later changes that function and nothing else.

## Publish on GitHub and GitHub Pages

### A. Using the GitHub website (no command line)

1. Sign in at github.com and click **New repository**. Name it `auditos`, choose Public or Private, and click **Create repository**.
2. Click **uploading an existing file**. Drag in everything from this folder (`build.py`, `README.md`, `LICENSE`, `.gitignore`, `src/` and `docs/`). Commit.
3. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/docs`. Save.
4. After a minute or two, your app is live at `https://<your-username>.github.io/auditos/`.

> GitHub Pages on a private repository needs a paid GitHub plan. On a free account, make the repository public or skip Pages.

### B. Using git on your computer

```bash
cd auditos
git init
git add .
git commit -m "AuditOS prototype: AI-first internal audit orchestration"
git branch -M main
git remote add origin https://github.com/<your-username>/auditos.git
git push -u origin main
```

Then enable Pages as in step A3.

### Updating later

```bash
# edit files in src/
python3 build.py
git add .
git commit -m "Describe the change"
git push
```

Pages redeploys automatically.

## Customise

### Add a new industry

1. Copy `src/data/retail.js` to `src/data/<your-industry>.js`.
2. Change the key on the first line, for example `DATASETS.energy = (() => { ... })();`.
3. Edit the content. Keep these rules so the app logic works unchanged:
   - Return every key: `ORG, PEOPLE, TAXONOMY, RISKS, KRIS, CONTROLS, SEED_RUN, SIGNAL_POOL, SEED_AUDITS, SEED_SAMPLES, SEED_ISSUES, RSTMT, L1_AUDIT, KEYTEST`.
   - Keep the six L1 names in `TAXONOMY` (Strategic, Financial, Operational, Compliance, Technology, Human Capital Risks). You can change any L2.
   - Keep the IDs `RISK-0101` to `RISK-0112` and `C-01` to `C-18`. `C-06` must be a daily control on `RISK-0103`, tested in audit `AUD-2027-018`.
   - `PEOPLE` must include `cae`, `mgr`, `snr` and `cro`.
   - `KEYTEST` defines the fieldwork columns, attributes, pass note, design gaps and issue text for C-06.
4. Register it in `src/data/shared.js`: `INDUSTRIES.push(['energy', 'Energy'])`, or add it to the array.
5. Add the file to `JS_FILES` in `build.py`, after `retail.js`, then run `python3 build.py`.

### Change defaults

- Appetite threshold, near buffer and routing thresholds: `seedState()` in `src/js/core.js`, or change them live in the app (Risk assessment → Risk appetite, Agent control centre).
- Scales and control bands: `LIKELIHOOD`, `IMPACT` and `CONTROL_BANDS` in `src/data/shared.js`.
- Sample sizes: `SAMPLE_SIZES` in `src/data/shared.js`.
- Colours and fonts: the `:root` tokens at the top of `src/styles.css`.

### Reset

Use **Reset demo data** at the bottom of the left menu. State is saved per industry in the browser's localStorage under `auditos.v2.<industry>`.

## Phase 2: connect real AI agents

The prototype is built so live AI can be added without changing any screen.

```
Browser (this app)
   │  POST /api/agents/run  { agent, system, input }
   ▼
API backend (FastAPI or Node) ── SSO auth, rate limits, PII redaction
   │  loads versioned prompt and JSON schema for the agent
   ▼
LLM (for example the Claude API with structured JSON output)
   │  output validated against the schema, then stored with a traceId
   ▼
PostgreSQL (+ pgvector for evidence retrieval)
   ▲
Scheduler (daily sensing, nightly KRIs) and connectors
(regulator feeds, news and vulnerability feeds, GRC or ticketing, document store)
```

**Response contract** expected by `AgentRuntime.run()`:

```json
{
  "output": { "match_risk": "RISK-0103", "similarity": 0.72, "rationale": "Same cause and L2", "l1": "Compliance Risks", "l2": "Sanctions" },
  "usage": { "input_tokens": 3120, "output_tokens": 214 },
  "traceId": "tr_8f2c",
  "promptVersion": "consolidate@1.4"
}
```

**Steps**
1. Build the endpoint and move data from localStorage into the database.
2. In `src/js/core.js`, set `S.settings.runtime = 'live'` and make sure each agent's live output has the same shape as its simulated output.
3. Add authentication. Never put an API key in the front end. The key lives only on the backend.
4. Add AI governance: a model inventory entry, prompt version control, PII redaction, output sampling QA, and the decision log as evidence of human oversight.

Before going live, check the API terms, data-residency needs and the internal approvals your organisation requires for AI use on audit data.

## Limitations

- All data is fictional, and agent outputs are simulated from templates and the dataset.
- State is stored in each user's browser only. There is no multi-user sharing until phase 2.
- No authentication, roles or segregation of duties between preparer and reviewer yet.
- The regulatory references in the datasets are illustrative and are not legal advice. Verify current rules before using any of this content in real work.

## License

MIT. See `LICENSE`. Replace `<your name>` with your name.
