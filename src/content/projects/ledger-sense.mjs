// Ledger Sense — trustworthy automation / business-domain case study.
// RUNNING. Re-verified against the repo and its 2026-10-15 system audit on 2026-11-04.

export const project = {
  slug: "ledger-sense",
  name: "Ledger Sense",
  tagline: "Document intelligence with confidence routing, for construction progress billing",
  plain: "Reads construction invoices, checks the arithmetic, and only lets a human approve anything that moves money.",
  statement: "The validation layer is the product.",
  status: {
    code: "running",
    label: "Running",
    detail:
      "Running — 265 commits, 29 Aug → 5 Nov 2026: extraction, validation rules, sensitivity gateway, inbox API, review-queue UI and the bank-change hard stop. A 15 Oct self-audit found it not yet ready for client writeback; its fixes are under way.",
  },
  category: ["Trustworthy Automation", "Backend Systems", "Security"],
  role: "Sole engineer — domain modelling, implementation, security posture",
  tech: ["Python 3.12", "FastAPI", "Pydantic v2", "SQLAlchemy 2 + Alembic", "PostgreSQL", "pdfplumber", "pypdfium2", "RapidOCR", "cryptography", "Argon2", "Next.js 15.5", "React 19", "Tailwind v4", "pdf.js", "Docker Compose", "hypothesis"],
  flow: ["Document", "Classify", "Parse", "Extract", "Validate", "Route"],
  links: { github: "https://github.com/Berakhah/ledger-sense" },
  licence: "Apache-2.0",

  card: {
    plain: "Reads construction invoices, checks the arithmetic, and only lets a human approve anything that moves money. An engineering prototype; my own audit of it is in the case study.",
    differentiator:
      "Deterministic-first architecture: Decimal money handling (no floats in the money path), sensitivity boundaries enforced structurally, writeback that never approves or pays, and a hard stop on bank-detail changes that only an attested human confirmation can clear.",
    metrics: [
      {
        id: "ls-rules",
        value: "11",
        label: "validation rules (8 arithmetic + 3 integrity)",
        context: "Each ships with a fixture that must trip it and a clean control that must not.",
        evidence: {
          claim: "The rule registry holds 8 arithmetic rules (A1–A8) and 3 integrity rules (I1–I3).",
          method: "DETERMINISTIC",
          source: { label: "rules/ — engine, arithmetic, integrity" },
          basis: "Arithmetic: exact footing, per-line sums at the contract’s rounding, payment chain with previous payments subtracted once. Integrity: duplicates across history, fuzzy vendor resolution with first-match human confirmation, bank-detail change = hard stop.",
          observedAt: "2026-09",
          caveats: [],
        },
      },
      {
        id: "ls-tests",
        value: "921",
        label: "test functions",
        context: "~14,600 LOC of test code in 91 files; hypothesis property tests over every arithmetic rule.",
        evidence: {
          claim: "Ledger Sense’s test suite contains 921 registered test functions.",
          method: "DETERMINISTIC",
          source: { label: "Repository — tests/ count", href: "https://github.com/Berakhah/ledger-sense" },
          basis: "Counted from a clone of the public repository on 2026-11-04: 91 test files, 14,647 lines under tests/, 921 `def test_` functions. Property-based coverage routes hypothesis invariants over every arithmetic rule through the real run_rules() entry point.",
          observedAt: "2026-11",
          caveats: [],
        },
      },
      {
        id: "ls-nofloat",
        value: "3 layers",
        label: "money-path float enforcement",
        context: "Ruff lint rule + dedicated CI job + property tests.",
        evidence: {
          claim: "Floats cannot enter the money path — enforced three independent ways.",
          method: "DETERMINISTIC",
          source: { label: "CI ‘no-float’ job" },
          basis: "A ruff lint rule, a dedicated CI job, and hypothesis property tests over every arithmetic rule. Money is Decimal with contract-supplied rounding.",
          observedAt: "2026-09",
          caveats: [],
        },
      },
      {
        id: "ls-gates",
        value: "9",
        label: "independent CI gates",
        context: "Licence audit, backend, degraded-mode, no-float, aia-guard, secrets, frontend, e2e, supply-chain.",
        evidence: {
          claim: "Nine independent CI jobs gate every push and pull request.",
          method: "DETERMINISTIC",
          source: { label: ".github/workflows/ci.yml", href: "https://github.com/Berakhah/ledger-sense" },
          basis: "Licence audit (rejects AGPL by SPDX and by native shared-object), backend coverage floors per module, degraded-mode, no-float, aia-guard, gitleaks, frontend, Playwright e2e (including a 375px no-overflow check), supply-chain (pip-audit + CycloneDX SBOM). Read from ci.yml on 2026-11-04.",
          observedAt: "2026-11",
          caveats: ["A tenth job, a nightly QuickBooks sandbox smoke test, runs on schedule only and is allowed to fail, so it is not counted as a gate."],
        },
      },
      {
        id: "ls-baseline",
        value: "n ≥ 8",
        label: "baseline study sample floor",
        context: "95% Student’s t interval — the study refuses to emit an interval below the minimum.",
        evidence: {
          claim: "The baseline study refuses to emit a cost-per-document interval from fewer than 8 samples.",
          method: "DETERMINISTIC",
          source: { label: "baseline/ — BaselineStudy · docs/methodology.md" },
          basis: "Times real document handling and computes cost-per-document with a defensible Student’s t 95% interval. The t-value comes from a table to 200 df, not the asymptotic 1.96, because at real sample sizes the asymptotic value understates the margin.",
          observedAt: "2026-09",
          caveats: ["No design-partner baseline has been run yet — the synthetic corpus is the demo."],
        },
      },
    ],
    caveat:
      "A self-audit on 15 Oct 2026 concluded it is not yet ready for client accounting writeback; LS-01–LS-10 and LS-13 have fixes, while LS-11, LS-12, LS-14, LS-15 and LS-34 remain open. Until a field type is calibrated, everything for that field routes to review — the UI’s ConfidenceMeter renders grey and labelled “uncalibrated” rather than showing a number it cannot defend.",
  },

  caseStudy: {
    problem:
      "Construction progress billing runs on pay applications — a summary sheet (contract sum, retainage, previous payments, current payment due) that must reconcile exactly to a continuation sheet of line items (scheduled value, work completed, stored materials, % complete, balance to finish). Controllers and AP staff check these by hand: does the continuation sheet foot to the summary? Is retainage stepping down at 50% completion as the contract says? Are stored materials being double-counted once installed? Did this vendor’s bank details just change? Every error a human misses is money out the door; every document a human checks costs touch time nobody has measured.",
    whyFails: [
      "The obvious fix — throw a vision model at the PDF — is off the table for anyone serious: a subcontractor invoice with bank details cannot go to a free-tier model that trains on inputs.",
      "The AIA’s G702/G703 forms are copyrighted and actively enforced, so you can’t ship a corpus of them either — and most tooling pretends otherwise.",
      "Generic document AI optimises extraction, not validation — but the money is lost in validation: footing errors, retainage mistakes, double-counted stored materials, changed bank details.",
      "Confidence scores that aren’t calibrated are decoration: routing on an uncalibrated score is guessing while displaying a number.",
    ],
    architecture: {
      intro:
        "A deterministic-first extraction and validation pipeline where the validation layer is the product. Documents enter through one labelled door, are classified, layout-parsed (text layer with coordinates first, OCR only for the scanned tail), field-extracted by anchor + geometry + table reconstruction, validated by typed domain rules, and routed by confidence thresholds — with everything routed to review until calibration exists.",
      tree: `ledger_sense/
  baseline/    BaselineStudy (t-interval, sample floor) + print report
  corpus/      synthetic pay-application generator, injected error classes,
               original layouts
  domain/      Money (Decimal + rounding policy), PayApplication,
               retainage terms, change orders, stored-materials backing,
               vendor identity
  extract/     textlayer, tables, anchors, ocr, profiles
               (reviewer-correction cache), assemble
  ingest/      classify, fingerprint, intake (labels at the door), limits
  rules/       engine + arithmetic (A1–A8) + integrity (I1–I3)
  store/       thread-safe connection factory, envelope-encrypted blobs,
               tenant scoping
  auth/        sessions, 404-not-403 ownership check on every route
  api/         inbox (keyset-paged), baseline, demo-only fixtures seed
  web/         Next.js app: baseline, review/[docId]`,
    },
    threatModel: [
      "**Data-processor liability from document one.** Client documents are confidential and bank-detail-bearing — the system becomes a data processor on the first upload, so encryption, retention and purge exist before the first document does.",
      "**Free-tier model training on inputs.** The model lane refuses anything above REDACTED sensitivity; the boundary is structural, not disciplinary.",
      "**Unauthorised cross-tenant reads.** Every route performs a 404-not-403 ownership check; tenant scoping lives in the store layer.",
      "**Resource-exhaustion via crafted PDFs.** Parsing runs in a killable, resource-capped child process with a request-body cap before spooling.",
      "**Fabricated zeros passing as verified.** unverifiable_money_fields() ensures a fabricated zero can’t masquerade as a confirmed figure.",
      "**Trademark exposure.** No AIA form artifact anywhere in the repo — the synthetic corpus uses an original layout with equivalent column semantics, enforced by the aia-guard CI job with a non-affiliation notice carried.",
    ],
    decisions: [
      {
        title: "Deterministic-first, not vision-first",
        body:
          "The obvious architecture — send the PDF to a vision model — was rejected on data-boundary grounds and the reasoning is recorded. Pay applications are software-generated, so a text layer with coordinates usually exists: pdfplumber + pypdfium2 text layer first (pypdfium2 chosen over AGPL PyMuPDF), table reconstruction, label-anchor + geometry field location, RapidOCR only for the scanned tail. Degraded mode is a CI job: with all providers disabled, the pipeline still extracts and validates digital PDFs end to end.",
      },
      {
        title: "The sensitivity boundary is structural",
        body:
          "Every document is labelled at the door (PUBLIC / SYNTHETIC / REDACTED / CLIENT_CONFIDENTIAL); the label is persisted with named CHECK constraints and the model lane refuses anything above REDACTED. AST-based structural tests prove there is exactly one door documents enter through, exactly one writer that persists them, and no provider client outside the gateway seam.",
      },
      {
        title: "No floats in the money path",
        body:
          "Money is Decimal with contract-supplied rounding, enforced by a ruff lint rule, a dedicated CI job, and hypothesis property tests over every arithmetic rule.",
      },
      {
        title: "Honest confidence, until calibrated",
        body:
          "Every field carries a match_quality score built from four explicit booleans — documented as evidence bits, not a probability, until calibration exists. Routing on an uncalibrated confidence score is guessing while displaying a number, so everything routes to review until Ground Truth supplies a reliability curve.",
      },
      {
        title: "Writeback never approves or pays; hard stops where money moves",
        body:
          "QuickBooks Online has no draft state for Bills, so the earlier “draft-only” wording was wrong and was corrected (LS-08): a write creates an unpaid Bill stamped AWAITING REVIEW, which posts to Accounts Payable at once, and Ledger Sense never creates a BillPayment. A human approves by paying inside QuickBooks; the CSV/IIF export is the path with no ledger effect. A test now fails the build if the README promises a draft state. Vendor merges are never automatic, and no legal documents are ever generated: extract, validate, flag deviation, stop.",
      },
      {
        title: "A bank-detail change stops everything until a human attests",
        body:
          "Remit-block bank details are extracted by label anchor and compared with the vendor’s confirmed history. A first-seen or changed account raises the I3 hard stop from the document itself. Accept, edit and reject are inert on it; the only way through is the bank-change panel, which shows the diff and requires an attested confirmation. Undo keeps the evidence, and whole account numbers are compared, never truncated ones.",
      },
      {
        title: "Audit the system, then fix it in the open",
        body:
          "A 15 Oct 2026 audit (docs/system-audit-2026-10-15.md) reproduced a critical cross-tenant defect: a reversal trusted a caller-supplied deletion key and could delete another tenant’s export. It also found high-severity gaps in idempotency scoping, export concurrency, payable amounts, review authorisation and confidence routing. Each fix commit is tagged with its finding ID (LS-01…LS-13), and the open findings are listed rather than buried.",
      },
      {
        title: "Demo and client deployments physically differ",
        body:
          "The ‘client’ compose profile runs a different API service (app vs app-demo) so the demo-only fixture-seed route physically does not exist in a client deployment — different services, not an environment flag.",
      },
    ],
    implementation: [
      "Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 + Alembic (10 migrations), PostgreSQL (SQLite WAL for dev). Next.js 15.5 / React 19 frontend with self-hosted pdf.js worker — no CDN, so the demo runs offline and emits no document-read telemetry. The app boots in a dark instrument theme; print stays light.",
      "~14,600 LOC of test code with 921 test functions across 91 files.",
      "Security posture ahead of the first document: envelope-encrypted blob store, accounting OAuth tokens encrypted under their own key, Argon2 sessions, per-tenant retention with audited purge plus an operator erasure command for client requests, closed-period refusal, a boot probe that rejects placeholder payment HMAC keys, resource-capped PDF parsing in a killable child process.",
      "Every extracted field is now routed (LS-09): cleared fields pass, uncleared ones queue for review, and an audit holdback samples cleared fields to produce audit-basis labels.",
      "Domain modelling as typed rules: retainage stepping at 50% / substantial completion, stored materials that must leave the stored column when installed, approved change orders reconciling to the adjusted contract sum.",
      "The t-interval uses a table to 200 df, not 1.96; loaded-rate uncertainty propagates — supply a low/high hourly rate and the interval widens, supply one figure and the report says verbatim that the interval holds it fixed.",
      "Baseline study is the billable first week: times real document handling, computes cost-per-document with a 95% Student’s t interval (minimum 8 samples enforced), and renders a print-ready report carrying its own method statement.",
    ],
    evidence: [
      "**Property-based validation:** hypothesis invariants run over every arithmetic rule, routed through the real run_rules() entry point — not a parallel test-only code path.",
      "**Every rule ships with a fixture that must trip it and a clean control that must not.**",
      "**Boundary enforcement you can read:** tests walk the AST to prove single insert site, single writer, no HTTP client outside the gateway seam (tests/boundary/).",
      "**A published self-audit with a reproduced critical finding:** a cross-tenant reversal bug, written up with its reproduction and fixed by commit LS-01; the remaining findings are tracked by ID.",
      "**9 independent CI gates** including supply-chain (pip-audit + CycloneDX SBOM) and licence audit that rejects AGPL by SPDX identifier and by native shared-object inspection.",
      "**Straight-through rate published including the misses** — never claiming full automation.",
    ],
    securityControls: [
      "**Sensitivity gateway:** labels at the door with named CHECK constraints; the model lane refuses anything above REDACTED; enforced by AST tests, one door, one writer.",
      "**Envelope-encrypted blob store** with per-tenant keys; per-tenant retention with audited purge; closed-period refusal.",
      "**Argon2 sessions; 404-not-403 ownership checks on every route.**",
      "**Resource-capped, killable child-process PDF parsing** with request-body cap before spool.",
      "**Writeback never approves or pays (unpaid Bills only, never a BillPayment); I3 hard stop on bank-detail changes cleared only by attested confirmation; no auto-merged vendors; no generated legal documents.**",
      "**Tenant-scoped writeback:** idempotency keys and audit lookups are scoped to the tenant, and reversals use the audited key, never the caller’s (LS-01, LS-02).",
    ],
    tradeoffs: [
      "**Deterministic-first** trades the ceiling of vision models for verifiable extraction on software-generated documents — the population this system serves.",
      "**Everything routes to review until calibration** trades short-term automation rates for never guessing with money.",
      "**Compose-profile separation (app vs app-demo)** costs one more service definition and buys a demo route that cannot exist in production.",
    ],
    limitations: [
      "Calibration curves (isotonic/Platt per field type) are consumed from the Ground Truth project; an uncalibrated field type routes to review.",
      "Accounting-system writeback creates unpaid QuickBooks Bills that post to Accounts Payable immediately (QBO has no draft Bill), so the client signs off on that effect; the CSV/IIF export is the no-ledger-effect fallback.",
      "Open audit findings: extraction still runs outside the parser’s resource boundary (LS-11), valid text-rich PDFs can be rejected by the parser queue (LS-12), reconciliation reads demo-only state (LS-14), baseline studies are not yet durable or resumable (LS-15), and QBO reversal lacks durable recovery (LS-34).",
      "The synthetic corpus is the demo; real-document baselines are run per client under the baseline study protocol.",
    ],
    currentStatus:
      "Running — 265 commits between 29 Aug and 5 Nov 2026: extraction, validation rules, sensitivity gateway, inbox API, review-queue UI, field routing and the I3 bank-change hard stop. Not yet ready for client writeback, per its own 15 Oct 2026 audit; five findings remain open. Licence: Apache-2.0.",
    repoNote:
      "Public repository: github.com/Berakhah/ledger-sense.",
  },
};
