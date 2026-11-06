// Selector Drift — trustworthy-automation case study. RUNNING; re-verified against
// the repo 2026-11-04. The ninety-day heal log is a commitment, not a published figure.
// Source: docs/portfolio/selector-drift.md

export const project = {
  slug: "selector-drift",
  name: "Selector Drift",
  tagline: "Self-healing extraction for business systems with no API",
  plain: "Keeps data extraction from legacy business systems working when their screens change — and refuses to guess.",
  statement: "A wrong heal is worse than a broken selector.",
  status: {
    code: "running",
    label: "In development",
    detail:
      "Five-rung resolution cascade, seven-check validation gate, assembled pipeline, heal-log evidence store and mutation test bench with a hardened scorer — 156 commits, 29 Aug → 5 Nov 2026. The web UI and HTTP API are not built yet, a fresh clone doesn’t install yet, and the tests don’t run in CI on main.",
  },
  category: ["Systems Design", "Trustworthy Automation"],
  role: "Sole engineer — threat modelling, architecture, test strategy",
  tech: ["Python 3.12", "Playwright", "Pydantic v2", "PostgreSQL", "Alembic", "Prefect 3", "Parquet", "DuckDB", "Docker Compose"],
  flow: ["Cached selector", "Accessibility tree", "Semantic anchors", "Structural heuristics", "Visual grounding (last resort)"],
  links: { github: "https://github.com/Berakhah/selector-drift" },
  licence: "Apache-2.0",

  card: {
    plain: "Keeps data extraction from legacy business systems working when their screens change, and refuses to guess. In development.",
    differentiator:
      "The heal log is the product: a wrong heal silently returns plausible, incorrect numbers into an accounting system for weeks — so the validation gate, not the heal, is the centre of the design.",
    metrics: [
      {
        id: "sd-cascade",
        value: "5",
        label: "resolution rungs, cheapest & most reliable first",
        context: "Cached selector → accessibility tree → semantic anchors → structural heuristics → visual grounding.",
        evidence: {
          claim: "The resolution cascade has five ordered rungs.",
          method: "HUMAN",
          source: { label: "Design brief — resolution cascade; author statement 2026-09-16" },
          basis: "Rungs 1–4 must carry the overwhelming majority of resolutions; the proportion reaching rung 5 (visual grounding, redacted screenshot, client opt-in only) is instrumented and published.",
          observedAt: "2026-09",
          caveats: ["Reported by the author; the public repository is the verification path."],
        },
      },
      {
        id: "sd-gate",
        value: "7",
        label: "validation gate checks before any write",
        context: "Format → domain → cross-field → distributional → row-key continuity → independent rung agreement → first-heal confirmation. A run that fails is quarantined.",
        evidence: {
          claim: "The validation gate runs seven check classes before any write.",
          method: "DETERMINISTIC",
          source: { label: "selector_drift/validate/assertions/", href: "https://github.com/Berakhah/selector-drift/tree/main/selector_drift/validate/assertions" },
          basis: "Counted from the public repository on 2026-11-05: FormatAssertion, DomainAssertion, CrossFieldAssertion, DistributionalAssertion, RowKeyContinuity, IndependentRungAgreement and FirstHealConfirmation. A run the gate does not accept goes to quarantine for a person to review.",
          observedAt: "2026-11",
          caveats: ["Run one has no history, so the history-based checks cannot decide and every heal is quarantined by design."],
        },
      },
      {
        id: "sd-bench",
        value: "1",
        label: "mutation test bench, open source",
        context: "A deliberately mutating portal + adversarial mutations designed to induce wrong heals.",
        evidence: {
          claim: "A realistic mutating portal with a mutation engine ships as an open-source artifact.",
          method: "HUMAN",
          source: { label: "Design brief — test bench; author statement 2026-09-16" },
          basis: "Login, search, results table, detail page, export; parameterised mutations (class renames, DOM restructuring, column reordering, table-to-div conversion) plus adversarial mutations — a decoy adjacent column with plausible values. Measured on the fixed bench on one pinned day, with history (2026-10-16): 8 of 8 benign classes accepted; 3 of 7 adversarial classes rejected, and the other 4 wrote only from the correct nodes, so wrong-node writes were 0 of 7 against the answer key. On run one, with no history, a value swap on the correct nodes can only be caught by the person confirming the run.",
          observedAt: "2026-09",
          caveats: ["Reported by the author; the public repository is the verification path."],
        },
      },
      {
        id: "sd-rungs",
        value: "60 runs",
        label: "bench campaign, rung shares published",
        context: "rung1 16.9% · rung2 69.7% · rung3 0% · rung4 13.1% · rung5 0% — measured on a bench later found defective; not yet re-run.",
        evidence: {
          claim: "A 60-run bench campaign measured which rung resolved each field, and how often the gate rejected a heal.",
          method: "DETERMINISTIC",
          source: { label: "docs/methodology.md — The rung distribution (B11)", href: "https://github.com/Berakhah/selector-drift" },
          basis: "scripts/bench_rung_campaign.py 60 (2026-10-15): the assembled product ran once per simulated day for 60 days against the bench portal on its production mutation schedule, 6 fields per run. Outcomes: 7 completed on rung 1, 33 healed and written, 5 held then promoted, 15 held then discarded. Of the 15 discards, 6 were adversarial days correctly rejected. The other 9 were benign days rejected by RowKeyContinuity, which the 2026-10-16 erratum attributes to a bench defect, not the gate.",
          observedAt: "2026-10-15",
          caveats: ["Erratum 2026-10-16: a bench defect changed about 40% of live claims each day, so page-level continuity fell far below the ~98% the bench spec intends. The bench is fixed, but this campaign has not been re-run, so these figures describe the old bench.", "Five adversarial days the gate accepted are not scored in this table; the answer-key scorer is what judges them.", "Bench, not production: the bench mutates every day, so rung 1’s share is low by design.", "Simulated calendar days against the project’s own portal — not the ninety-day live heal log."],
        },
      },
    ],
    caveat:
      "The ninety-day live heal log (3 portals, 41 UI changes, zero manual fixes, 99.2% run success) is the headline proof point the design commits to; it is not published here as a figure, because calendar time cannot be compressed and a result that has not been measured must not render as one.",
  },

  caseStudy: {
    problem:
      "A large share of business-critical data lives in vendor portals with no API. The alternatives are all bad: direct database access breaches the vendor licence; file/EDI transfer is hours or days stale; RPA breaks on every UI update and needs dedicated machines; hand-written browser automation means someone maintains CSS selectors forever, and every portal redesign becomes a backlog ticket.",
    whyFails: [
      "Naïve ‘self-healing selectors’ have a failure mode worse than breaking: a broken selector throws and someone fixes it, but a selector healed to the wrong element silently returns plausible, incorrect numbers into a client’s accounting system for weeks.",
      "The adjacent-column lock-on is the most common and most dangerous case: every individual value looks valid, and nothing downstream ever notices.",
      "Scraping framed as scraping invites evasion economics — the moment you compete with anti-bot measures, you have left clean engineering behind.",
    ],
    architecture: {
      intro:
        "Targets are described in language instead of DOM paths — “the claim number cell in the results table”. When the UI changes, the resolver re-resolves through a five-rung cascade (cheapest and most reliable first), and every heal must pass a mandatory validation gate before any write. The heal log — selector X broke at 04:12, healed to Y, confidence 0.94, validated by assertions A/B/C, with redacted before/after screenshots and a word-level DOM diff — is the product.",
      tree: `selector_drift/
  scope/         scope.yaml schema, authorisation gate   ← built first
  spec/          semantic task spec: navigation, targets,
                 schema, assertions, schedule
  browser/       Playwright driver, containerised, session + MFA handling
  resolve/       cascade (five rungs) · selector cache with provenance
  validate/      post-heal gate · quarantine, promote / discard
  credentials/   envelope-encrypted credential ladder
  extract/       typed extraction into Pydantic schemas
  quality/       schema drift, null rates, row counts, distribution shift
  land/          Parquet writer, DuckDB catalog, idempotent upsert
  orchestrate/   resolve → gate → land → log pipeline (Prefect 3),
                 rung statistics
  heallog/       evidence store: scrub, redact, verify; word-level DOM
                 diff; replay; daily evidence retention
  api/           (not built yet)
testbench/       deliberately mutating portal + mutation engine
                 + bench scorer with an answer key
                 ← shipped open-source artifact
web/             (planned) Targets · Task spec editor · Run timeline
                 · Heal log · Data quality · Quarantine`,
    },
    threatModel: [
      "**The headline feature is the worst failure mode.** Self-healing can heal wrongly; the design identifies this first and builds the product around the validation gate rather than the heal.",
      "**Unauthorised targeting.** No target runs without a scope record (scope.yaml: identity, authorisation basis, authorising party, date, rate limit); unknown or expired → refuse. The scope gate is built before the crawler.",
      "**Anti-bot circumvention temptation.** Never circumvent authentication or defeat anti-bot measures — a target that requires evasion is out of scope, stated in the proposal. Default posture is the client’s own authenticated access to a portal they already pay for.",
      "**Credential compromise.** No credential in plaintext, ever: envelope encryption with per-client keys; preference order client-supplied session injection → client-controlled credential broker → delegated access → stored credentials as last resort with written acknowledgement. Storing a TOTP seed defeats the second factor and is raised in the first call.",
      "**Surveillance by-product.** Every screenshot and DOM snapshot is redacted before storage and never leaves the client’s boundary — a portal screenshot is CLIENT_CONFIDENTIAL.",
      "**Unrecoverable writes.** No write-back into a client portal in v1 — a wrong write into a system of record is unrecoverable in a way a wrong read is not.",
    ],
    decisions: [
      {
        title: "A wrong heal is worse than a broken selector",
        body:
          "The resolution cascade exists to heal; the validation gate exists to stop bad heals. Type assertions (a claim number matching ^[A-Z]{2}\\d{8}$ is a stronger signal than any model confidence) outrank model confidence; distributional checks (PSI/KS with warm-up and persistence) catch the adjacent-column lock-on that per-value checks cannot.",
      },
      {
        title: "First-heal human confirmation",
        body:
          "The first heal to a new selector completes into quarantine; a human promotes it; subsequent heals to the same selector run automatically. Quarantine, not failure: held runs keep their data, evidence and diff, with one-click promote or discard.",
      },
      {
        title: "Accessibility tree as rung 2",
        body:
          "Role + accessible name + relationship — the most semantically stable layer of a page, and the one most automation ignores.",
      },
      {
        title: "Visual grounding is opt-in and last resort",
        body:
          "Rung 5 uses a redacted screenshot, client opt-in only; otherwise it is disabled and escalated to a human. The proportion of resolutions reaching rung 5 is instrumented and published.",
      },
      {
        title: "The test bench is the piece nobody else builds",
        body:
          "You cannot demonstrate self-healing without pages that change, and you cannot ethically hammer third-party sites for ninety days to get them. The bench ships a realistic portal with a mutation engine, plus adversarial mutations designed to induce wrong heals — a decoy adjacent column with plausible values. On the fixed bench the gate rejected 3 of 7 adversarial classes; the other 4 wrote only from the correct nodes, so wrong-node writes were 0 of 7 against the answer key. That second number matters more.",
      },
      {
        title: "A twelve-entry blindspot register, written in advance",
        body:
          "Idempotency, late data, DuckDB concurrency with parallel writers (per-run Parquet partitions; never a shared DuckDB file), Playwright-in-container memory limits, distribution-shift false alarms — the register reads like a post-mortem written before the code.",
      },
    ],
    implementation: [
      "Built to a full brief, hard constraints, architecture, test strategy and a ten-item definition of done.",
      "The pipeline is assembled end to end: resolve, gate, land, log. A judged run settles with redaction first, then evidence bundles, then accept or hold; a failed promotion compensates its lake file and cache rows under the quarantine row lock; a human decision and the audit trail can never disagree.",
      "Stack: containerised Playwright (pinned browser version, one context per run, hard memory limits, aggressive reaping); Prefect 3 for orchestration and the daily evidence-retention deployment; Postgres for run history, heal events and the selector cache.",
      "Heal-log evidence store: scrubbed and redacted DOM and screenshots with post-shot pixel verification, egress-guarded atomic writes, size-capped link-free bundle reads, and replays that expire with the target’s evidence policy.",
      "Bench scorer: a separate, hardened Compose service judges every bench heal against an answer key, using a database role granted exactly what it needs and a read-only evidence mount, and refuses to start if either is wrong.",
      "Landing zone: per-run Parquet partitions with DuckDB as the query layer, compaction, idempotent upsert on natural key; data-quality contract on row counts, null rates, distribution shift (PSI/KS), referential checks and schema-drift detection.",
      "1,434 test functions in 123 files (counted 2026-11-04), including a benign-heal acceptance suite and a degraded-mode floor with every model provider disabled.",
      "Planned, not built: the FastAPI layer and the Next.js frontend (Monaco YAML task-spec editor plus a form view for non-engineers).",
    ],
    evidence: [
      "**A published correction to its own benchmark:** a 60-run bench campaign reported 9 benign-day rejections as false rejections. A follow-up traced them to a bench defect, fixed the bench, added a page-level guard and published an erratum beside the original text. The campaign has not been re-run on the fixed bench (docs/methodology.md, B11).",
      "**Threat modelling before code:** the design identifies that the headline feature is also the worst failure mode and builds the product around the validation gate rather than the heal.",
      "**Legal and credential posture designed in, not bolted on:** scope records, no evasion, session injection over stored credentials, the TOTP-seed problem named explicitly.",
      "**The sales artifact is a ninety-day live heal log** against ethically clean targets, started on day one of the build because calendar time cannot be compressed — with the quarantine count in the headline, because it is proof the safety mechanism works, not an admission.",
    ],
    securityControls: [
      "**Scope gate before the crawler exists:** no target runs without a scope record; unknown or expired scope → refuse.",
      "**Never circumvent authentication or anti-bot measures** — out of scope by proposal.",
      "**Credential ladder:** client-supplied session injection preferred; stored credentials last resort with written acknowledgement; TOTP-seed storage raised as a second-factor defeat in the first call.",
      "**Redaction before storage:** every screenshot and DOM snapshot redacted, never leaving the client boundary.",
      "**No write-back in v1.**",
    ],
    tradeoffs: [
      "**No write-back in v1** halves the product surface and eliminates the unrecoverable-failure class entirely.",
      "**Quarantine-first healing** adds a human step to every new selector — deliberately — because the trust earned by refusing outweighs the friction.",
      "**Self-hosted test bench instead of live-site testing** costs build time and buys ethical cleanliness plus reproducible adversarial cases.",
    ],
    limitations: [
      "No web UI or HTTP API yet; the product runs as a pipeline and CLI.",
      "No multi-day measure of how often the gate rejects benign heals: the 60-run campaign predates a bench fix and has not been re-run. The 9 benign-day rejections it recorded were traced to the bench defect, not the gate. On the fixed bench, one pinned day accepted 8 of 8 benign classes.",
      "With no history, on run one, a value swap on the correct nodes can only be caught by the person confirming the run.",
      "Rung 3 resolved nothing on the bench, because rung 2 looks for the same label text and runs first.",
      "The ninety-day heal log and its proof-point figures are commitments, not published results.",
      "Visual grounding depends on client opt-in; without it, rung 5 escalates to humans.",
    ],
    currentStatus:
      "In development — resolution cascade, validation gate, assembled pipeline, heal-log evidence store and mutation test bench with scorer; 156 commits between 29 Aug and 5 Nov 2026. Web UI and API not built yet. Licence: Apache-2.0.",
    repoNote:
      "Public repository: github.com/Berakhah/selector-drift.",
  },
};
