// BackOffice Kit — shared substrate. Framed as infrastructure underneath the
// other projects; only the bok-core slice is implemented.
// Source: docs/portfolio/backoffice-kit.md

export const project = {
  slug: "backoffice-kit",
  name: "BackOffice Kit",
  tagline: "The shared substrate: a core library, a design system, a repo template",
  statement:
    "Every number that reaches a user is a Claim — never a bare float. Value, source, method, confidence, timestamp, caveat, parent claims.",
  status: {
    code: "design-complete",
    label: "DESIGN COMPLETE",
    detail:
      "Interface contract v0.2 agreed (29 Aug 2026); a 0.0.1 minimal slice of bok-core (boundary.sensitivity, provenance.Source/Claim) is implemented with tests. Gateway, redaction, findings, bok-ui and the template are specified but not shipped.",
  },
  category: ["Systems Design", "Evidence", "Security"],
  role: "Sole engineer — library design, threat modelling, design system",
  tech: ["Python 3.12", "Pydantic v2", "SQLite", "structlog", "prometheus-client", "React 19", "TypeScript strict", "Tailwind v4 (OKLCH @theme)", "Recharts", "Storybook", "axe-core", "Playwright", "Copier", "GitHub Actions"],
  flow: ["Agent Perimeter", "Ground Truth", "Ledger Sense", "bok-core", "Claims, boundaries, findings"],
  links: {},
  repoState: "planned",
  licence: "Apache-2.0 (patent grant matters for security tooling)",
  substrate: true, // rendered as the infrastructure card, not a product card

  card: {
    differentiator:
      "Library design driven by threat modelling: the R1 audit showed three redaction ‘controls’ from the original spec were tests that could not fail — the fixes (keyed surrogates, detector re-run, unrepresentable-unverified state) are argued in writing.",
    metrics: [
      {
        id: "bk-contract",
        value: "v0.2",
        label: "authoritative interface contract",
        context: "Additive and versioned; §9 lists every change from v0.1.",
        evidence: {
          claim: "The interface contract is at v0.2 and is the authoritative symbol surface.",
          method: "DETERMINISTIC",
          source: { label: "docs/INTERFACE-CONTRACT.md" },
          basis: "Additive/versioned; §9 records every change from v0.1, including two security holes closed: a missing redacted_opt_in flag, and verified_at staleness never being enforced.",
          observedAt: "2026-08-29",
          caveats: [],
        },
      },
      {
        id: "bk-audit",
        value: "5",
        label: "controls corrected before implementation",
        context: "Revision R1 audit found five controls untestable-as-written or absent.",
        evidence: {
          claim: "The R1 audit corrected five controls before any implementation.",
          method: "HUMAN",
          source: { label: "Revision R1 audit record" },
          basis: "Both implementation plans were audited line-by-line; five controls were found untestable-as-written or absent and corrected before implementation. Three redaction ‘controls’ were tests that could not fail.",
          observedAt: "2026-08",
          caveats: [],
        },
      },
      {
        id: "bk-slice",
        value: "0.0.1",
        label: "minimal bok-core slice, implemented + tested",
        context: "boundary.sensitivity and provenance.Source/Claim; ruff / mypy --strict clean.",
        evidence: {
          claim: "A minimal slice of bok-core is implemented with tests.",
          method: "DETERMINISTIC",
          source: { label: "bok_core.boundary.sensitivity · bok_core.provenance" },
          basis: "Sensitivity labels with explicit rank ordering and fail-closed provider capability matrix; Source/Claim provenance types with validator-enforced confidence monotonicity and caveat inheritance. ruff and mypy --strict clean.",
          observedAt: "2026-09",
          caveats: ["The rest of the library (gateway, redaction, findings, UI, template) is specified but not shipped."],
        },
      },
      {
        id: "bk-consumers",
        value: "2",
        label: "consumers already coded against the contract",
        context: "Ledger Sense’s sensitivity gateway; Ground Truth’s _bok_shim.py.",
        evidence: {
          claim: "Two consumer projects already mirror the v0.1/v0.2 surface.",
          method: "DETERMINISTIC",
          source: { label: "Ledger Sense · Ground Truth repositories" },
          basis: "Ledger Sense’s sensitivity gateway and Ground Truth’s _bok_shim.py mirror the v0.1/v0.2 interface surface, so the contract is already load-bearing.",
          observedAt: "2026-09",
          caveats: [],
        },
      },
    ],
    caveat:
      "Only the minimal slice is implemented: gateway, redaction, findings, bok-ui and the copier template are specified but not shipped to PyPI/npm. Publishing vs vendoring, unified CLI, and Supabase vs compose-only remain recorded open decisions.",
  },

  caseStudy: {
    problem:
      "Four separate products — an MCP security scanner, a construction-billing document pipeline, a self-healing extraction system and an eval harness — all needed the same things: model inference on a $0 budget with no GPU, a hard line between client data and free-tier providers, a way to make every published number traceable to its origin, and a consistent, print-friendly UI a controller or security engineer would take seriously. Free tiers make this hard in specific ways: limits change monthly, models are deleted without notice (one provider’s free catalogue collapsed from ~12 models to 2 in a single day), most tiers train on inputs, some forbid commercial use, and availability varies by geography. Any code that hardcodes a model name or trusts a provider’s terms from memory is a production incident waiting to happen.",
    whyFails: [
      "Hardcoded model names break the moment a provider deletes a model — which free tiers do without notice.",
      "Trusting a provider’s terms from memory fails because terms change; a capability matrix must be verified and dated.",
      "Provenance-as-convention fails because a downstream product can always accidentally print an unsourced number — provenance has to live in types.",
      "Redaction that re-searches for the strings it just replaced is a tautology that cannot fail — so it never catches its own misses.",
    ],
    architecture: {
      intro:
        "Three deliverables, one thesis: every number that reaches a user is a Claim, never a bare float. bok-core (Python) carries the Claim type, the sensitivity boundary, the model gateway and shared findings; bok-ui (React) is an editorial-instrument design system where any figure rendered through <Claim> carries a provenance rail; template/ scaffolds a repo that passes CI on first push with zero edits.",
      claimCode: `class Claim(BaseModel, Generic[T]):
    value: T
    source: Source              # file+line, URL+retrieved_at,
                                # model call id, or human
    method: Method              # DETERMINISTIC | MODEL | HUMAN | DERIVED
    confidence: float | None    # None for DETERMINISTIC; calibrated for MODEL
    observed_at: datetime
    parents: list[Claim] = []   # for DERIVED
    caveat: str | None = None   # scope limitation, in the source's own terms`,
      tree: `bok-core (Python, PyPI)
  boundary/     Sensitivity (PUBLIC / SYNTHETIC / REDACTED /
                CLIENT_CONFIDENTIAL) with explicit rank ordering;
                Labelled[T] — the label attaches where a file is opened;
                provider capability matrix, fail-closed-on-unknown
  boundary/redact   rule-based detection → HMAC-keyed stable surrogates
                    → verification pass that re-runs every detector;
                    RedactionResult.labelled() raises if unverified
  gateway/      lane abstraction resolved from models.yaml (code never
                names a model); capability probe with TTL cache;
                fallback-chain router; quota governor that reserves
                before dispatch; content-addressed response cache;
                per-call ledger
  findings/     shared severity ladder, typed Finding, SARIF 2.1.0 emitter
  testing/degraded   blackout() patches the socket; each consumer declares
                     and tests its own degraded-mode floor
  obs/          structlog JSON with correlation ids, Prometheus metrics
bok-ui (React, npm)
  Claim · ProvenanceRail · SeverityBadge · FindingsTable · EvidencePane
  · ConfidenceMeter · QuotaStrip · RunTimeline · DiffView · EmptyState
  · ErrorState · Skeleton
template/ (copier)
  scaffolds a repo that passes CI on first push with zero edits`,
    },
    threatModel: [
      "**Client data reaching free-tier providers.** The capability matrix records trains_on_data / commercial_use / verified_at and fails closed on unknown; check() raises SensitivityViolation with a message quoting the provider’s terms, URL and retrieval date.",
      "**Brute-forceable surrogates.** An unkeyed sha256(id)[:8] is brute-forceable, so redaction uses HMAC-keyed stable surrogates.",
      "**Redaction that cannot fail is not redaction.** The verification pass re-runs every detector over the output; undetected classes are declared in NOT_COVERED.",
      "**Double-spend on quota.** Calendar-minute buckets permit double the ceiling across a boundary, and recording after dispatch lets two concurrent callers both pass — the design names both bugs and specifies the fix: reserve before dispatch, one BEGIN IMMEDIATE spanning check-and-increment.",
      "**Unsourced numbers reaching users.** A MODEL claim with no confidence cannot render as a fact; a parent’s caveat (“sample size 51”) propagates to every child; a DERIVED claim’s confidence never exceeds the minimum of its parents’.",
    ],
    decisions: [
      {
        title: "Provenance as a type, not a convention",
        body:
          "Confidence monotonicity, caveat inheritance and render-as-unverified rules live in validators, so a downstream product cannot accidentally print an unsourced number.",
      },
      {
        title: "Make “forgot to verify” unrepresentable",
        body:
          "RedactionResult.labelled() raises if unverified. The type system, not the reviewer, enforces the verification step.",
      },
      {
        title: "Code never names a model",
        body:
          "Lanes (extract-vision, judge, classify-cheap, local-fallback) resolve from models.yaml; a startup capability probe with TTL cache and a fallback-chain router mean a provider disappearing is a config change, not an incident.",
      },
      {
        title: "A design system with an opinion",
        body:
          "bok-ui is light-first because these deliverables get printed and emailed: OKLCH tokens via Tailwind v4 @theme, a warm-graphite 12-step neutral ramp, semantic severity/provenance states never encoded in colour alone, tabular numerals everywhere a number appears. It explicitly rejects three generated-design looks.",
      },
      {
        title: "Copier over a GitHub template repo",
        body:
          "Because copier update re-applies template changes to already-scaffolded repos — the template is a living dependency, not a starting snapshot.",
      },
      {
        title: "Each consumer declares its own degraded-mode floor",
        body:
          "testing/degraded provides blackout() and assert_blackout_complete(); the floor itself is the consumer’s unit, because only the consumer knows what ‘useful’ means without providers.",
      },
    ],
    implementation: [
      "Implemented slice: bok_core.boundary.sensitivity + bok_core.provenance (Source, Claim) with tests, ruff / mypy --strict clean, in a worktree off the main line.",
      "Interface contract docs/INTERFACE-CONTRACT.md v0.2 — authoritative symbol surface, additive and versioned, with every change from v0.1 recorded including two closed security holes.",
      "Approved design doc with a decisions ledger recording each place it amends the foundation brief.",
      "bok-ui: editorial-instrument design system — Newsreader headings, Geist UI, IBM Plex Mono with tabular numerals; provenance rail expands any figure into a 380px chain ledger; WCAG 2.2 AA via axe in CI, full keyboard operation, responsive to 375px, print stylesheet on every report view.",
      "Template: lint / typecheck / test / coverage / axe / licence-audit workflows, semantic-release with trusted publishing, pre-commit, compose stack with LiteLLM proxy + Prometheus, multi-stage non-root Dockerfile, mkdocs, required docs/methodology.md.",
    ],
    evidence: [
      "**The R1 audit is the interesting artefact:** three redaction ‘controls’ shown to be tests that could not fail; the fixes argued in writing and applied before implementation.",
      "**Two consumers already coded against the contract** — Ledger Sense’s sensitivity gateway and Ground Truth’s _bok_shim.py — so the surface is load-bearing, not theoretical.",
      "**The quota governor design names its own failure modes** (boundary double-spend; record-after-dispatch races) and specifies the fix in the design, before code.",
      "**§9 of the contract** records two security holes closed between v0.1 and v0.2 — the change log is a security document.",
    ],
    securityControls: [
      "**Sensitivity labels attach where a file is opened** (Labelled[T] wrapping bytes, paths, file handles) — not in a downstream function’s parameter list.",
      "**Fail-closed-on-unknown provider capabilities**; violations quote the provider’s terms, URL and retrieval date.",
      "**HMAC-keyed stable surrogates** in redaction, with a verification pass that re-runs every detector and a result type that raises if unverified.",
      "**Quota governor that reserves before dispatch** over rolling 60s/24h windows with full-jitter backoff, priority lanes and a hard daily ceiling.",
      "**Per-call ledger:** prompt hash, model actually used, provider, latency, tokens, quota, fingerprint, sensitivity, lane.",
    ],
    tradeoffs: [
      "**Design-first for a library** means the implemented surface is minimal today; the payoff is that consumers are already coded against a stable, audited contract.",
      "**A design system that refuses generated looks** costs speed and buys a distinctive, print-grade instrument aesthetic.",
      "**Claim-wrapping every number** costs verbosity at every call site and buys a system where unsourced numbers cannot render.",
    ],
    limitations: [
      "Gateway, redaction, findings, bok-ui and the copier template are specified but not yet shipped to PyPI/npm.",
      "Publishing vs vendoring, unified bok CLI vs four CLIs, and Supabase vs compose-only remain recorded open decisions.",
      "The 0.0.1 slice lives in a worktree pending merge.",
    ],
    currentStatus:
      "Design and interface contract complete (v0.2, agreed 29 Aug 2026); minimal bok-core slice implemented with tests. The full gateway, redaction, findings and UI packages land as the consumer projects need them. Licence: Apache-2.0.",
    repoNote:
      "Repository planned as public — not yet published, so no repository link is shown.",
  },
};
