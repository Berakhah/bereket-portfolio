// Selector Drift — trustworthy-automation case study. RUNNING per the author
// (2026-09-16). The ninety-day heal log is a commitment, not a published figure.
// Source: docs/portfolio/selector-drift.md

export const project = {
  slug: "selector-drift",
  name: "Selector Drift",
  tagline: "Self-healing extraction for business systems with no API",
  plain: "Keeps data extraction from legacy business systems working when their screens change — and refuses to guess.",
  statement: "A wrong heal is worse than a broken selector.",
  status: {
    code: "running",
    label: "Running",
    detail:
      "Five-rung resolution cascade, six-check validation gate, heal log and mutation test bench, built to the written brief and definition of done. Status per the author, 2026-09-16; public repository to follow.",
  },
  category: ["Systems Design", "Trustworthy Automation"],
  role: "Sole engineer — threat modelling, architecture, test strategy",
  tech: ["Python 3.12", "Playwright", "FastAPI", "Pydantic v2", "PostgreSQL", "Prefect 3 / Temporal (open decision)", "Parquet", "DuckDB", "Next.js 15", "bok-ui"],
  flow: ["Cached selector", "Accessibility tree", "Semantic anchors", "Structural heuristics", "Visual grounding (last resort)"],
  links: { github: "https://github.com/Berakhah/selector-drift" },
  licence: "Apache-2.0",

  card: {
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
        value: "6",
        label: "validation gate checks before any write",
        context: "Type assertions → domain assertions → cross-field consistency → distributional checks → human confirmation → quarantine.",
        evidence: {
          claim: "Every heal passes six validation checks before any write.",
          method: "HUMAN",
          source: { label: "Design brief — post-heal validation gate; author statement 2026-09-16" },
          basis: "Type/format assertions from the task spec, domain assertions (range, enum, date plausibility, currency sanity), cross-field consistency, distributional check against history (PSI/KS with warm-up and persistence), first-heal human confirmation, quarantine rather than failure.",
          observedAt: "2026-09",
          caveats: ["Reported by the author; the public repository is the verification path."],
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
          basis: "Login, search, results table, detail page, export; parameterised mutations (class renames, DOM restructuring, column reordering, table-to-div conversion) plus adversarial mutations — a decoy adjacent column with plausible values. Every mutation class gets a test asserting the cascade heals; every adversarial mutation gets a test asserting the gate refuses.",
          observedAt: "2026-09",
          caveats: ["Reported by the author; the public repository is the verification path."],
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
  resolve/       cascade.py (five rungs) · cache.py (with provenance)
                 · validate.py (post-heal gate) · quarantine.py
  extract/       typed extraction into Pydantic schemas
  quality/       schema drift, null rates, row counts, distribution shift
  land/          Parquet writer, DuckDB catalog, idempotent upsert
  orchestrate/   flows, scheduling, retries, quota accounting
  heallog/       heal events, evidence storage, redaction, diffing
  api/           FastAPI
testbench/       deliberately mutating portal + mutation engine
                 ← shipped open-source artifact
web/             Targets · Task spec editor · Run timeline · Heal log
                 · Data quality · Quarantine`,
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
          "You cannot demonstrate self-healing without pages that change, and you cannot ethically hammer third-party sites for ninety days to get them. The bench ships a realistic portal with a mutation engine, plus adversarial mutations designed to induce wrong heals — a decoy adjacent column with plausible values. Every mutation class gets a test asserting the cascade heals; every adversarial mutation gets a test asserting the gate refuses. The second set matters more.",
      },
      {
        title: "A twelve-entry blindspot register, written in advance",
        body:
          "Idempotency, late data, DuckDB concurrency with parallel writers (per-run Parquet partitions; never a shared DuckDB file), Playwright-in-container memory limits, distribution-shift false alarms — the register reads like a post-mortem written before the code.",
      },
    ],
    implementation: [
      "Design complete: full brief, hard constraints, architecture, resolution cascade, validation gate, test strategy and a ten-item definition of done with a week-20 target.",
      "Stack: containerised Playwright (pinned browser version, one context per run, hard memory limits, aggressive reaping); Prefect 3 or Temporal for orchestration (open decision); FastAPI + Postgres for run history, heal events and the selector cache.",
      "Landing zone: per-run Parquet partitions with DuckDB as the query layer, compaction, idempotent upsert on natural key; data-quality contract on row counts, null rates, distribution shift (PSI/KS), referential checks and schema-drift detection — alerting before bad data reaches the client.",
      "Frontend: Next.js 15 on the shared bok-ui design system; Monaco YAML editor with schema validation plus a form view for non-engineers.",
      "Repo: github.com/Berakhah/selector-drift.",
    ],
    evidence: [
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
      "Orchestration choice (Prefect 3 vs Temporal) is an open decision.",
      "The ninety-day heal log and its proof-point figures are commitments, not published results.",
      "Visual grounding depends on client opt-in; without it, rung 5 escalates to humans.",
    ],
    currentStatus:
      "Running — resolution cascade, validation gate, heal log and mutation test bench, built to the written brief and definition of done. Status per the author, 2026-09-16; public repository to follow. Licence: Apache-2.0.",
    repoNote:
      "Public repository: github.com/Berakhah/selector-drift.",
  },
};
