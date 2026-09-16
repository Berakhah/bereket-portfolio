// Agent Perimeter — flagship. Built and running, public repo, clean-machine
// reproduction. Source: docs/portfolio/agent-perimeter.md

export const project = {
  slug: "agent-perimeter",
  name: "Agent Perimeter",
  tagline: "Security posture scanner for MCP servers and tool-using agents",
  statement:
    "You wired an agent into internal systems. Agent Perimeter shows what that agent can be made to do.",
  status: {
    code: "running",
    label: "RUNNING",
    detail:
      "Implemented and demonstrably working: public repository, Apache-2.0, with a clean-machine reproduction of the README quickstart in CI. 181 commits, 11 Aug → 15 Sep 2026.",
  },
  category: ["Security", "Backend Systems", "Evidence"],
  role: "Sole engineer — design, implementation, verification, publication",
  tech: ["Python 3.12", "FastAPI", "Pydantic v2", "SQLAlchemy 2 + Alembic", "Postgres 16", "Next.js 15.5", "React 19", "TypeScript strict", "Tailwind v4", "Docker Compose", "GitHub Actions", "SARIF 2.1.0", "Playwright"],
  flow: ["MCP server", "Discovery", "Capability graph", "34 checks · 8 groups", "Findings + reproductions", "SARIF / HTML report"],
  links: { github: "https://github.com/Berakhah/agent-perimeter" },
  licence: "Apache-2.0",

  card: {
    differentiator:
      "It flags suspicious text, then drives a live agent through the injection path and records demonstrated impact. And every published number is regenerable by someone who doesn’t trust it.",
    metrics: [
      {
        id: "ap-checks",
        value: "34",
        label: "registered checks in 8 groups",
        context: "Deterministic first; LLM-judge only as escalation.",
        evidence: {
          claim: "Agent Perimeter registers 34 checks in 8 groups; its own test suite asserts the count.",
          method: "DETERMINISTIC",
          source: { label: "checks/all_checks.py", href: "https://github.com/Berakhah/agent-perimeter" },
          basis: "Revision (12) · static (5) · descriptions (5) · secrets (3) · active (4, scope-gated) · injection (2) · drift (1) · policy (2). tests/checks/test_all_checks.py asserts len(ALL_CHECKS) == 34.",
          observedAt: "2026-09",
          caveats: [],
        },
      },
      {
        id: "ap-pr",
        value: "1.00 / 1.00",
        label: "precision / recall",
        context: "12 evaluated check classes, 22-case local corpus — CI-regenerated per commit.",
        evidence: {
          claim: "Precision and recall of 1.00 across all 12 evaluated check classes.",
          method: "DETERMINISTIC",
          source: { label: "docs/methodology.md", href: "https://github.com/Berakhah/agent-perimeter" },
          basis: "Evaluated on a 22-case local corpus (v1.0.0). The precision/recall table is rebuilt on every commit and CI fails if it drifts.",
          observedAt: "2026-09",
          caveats: ["Local fixture corpus — not an independent public benchmark."],
        },
      },
      {
        id: "ap-tests",
        value: "742",
        label: "test functions",
        context: "~12,500 LOC of test code in 87 files; coverage floor 75% enforced in CI.",
        evidence: {
          claim: "The test suite contains 742 test functions across 87 files.",
          method: "DETERMINISTIC",
          source: { label: "Repository — tests/ count", href: "https://github.com/Berakhah/agent-perimeter" },
          basis: "Counted from a clone of the public repository on 2026-09-16: 87 test files, 12,548 lines under tests/, 742 `def test_` functions. pyproject.toml sets --cov-fail-under=75.",
          observedAt: "2026-09",
          caveats: ["Counts test functions, not individual assertions."],
        },
      },
      {
        id: "ap-census",
        value: "31,953",
        label: "registry entries censused",
        context: "Official MCP Registry, full pagination, 0 failures — first census published 14 Sep 2026.",
        evidence: {
          claim: "The published census covered the full 31,953-entry registry population.",
          method: "DETERMINISTIC",
          source: { label: "Registry census report — 2026-09-14", href: "https://github.com/Berakhah/agent-perimeter" },
          basis: "Full pagination (320 pages, 0 failures), seeded uniform random sample of packaged entries, 23-minute collection window timestamped to the second.",
          observedAt: "2026-09-14",
          caveats: ["Zero counts reported with Wilson 95% intervals — never as “none”."],
        },
      },
      {
        id: "ap-clean",
        value: "82 s",
        label: "clean-machine quickstart",
        context: "Fresh Ubuntu VM, README run verbatim, green.",
        evidence: {
          claim: "The README quickstart completes green in 82 seconds on a clean machine.",
          method: "DETERMINISTIC",
          source: { label: "docs/evidence/clean-machine.md", href: "https://github.com/Berakhah/agent-perimeter" },
          basis: "clean-machine.yml clones the public repo onto a fresh ubuntu-latest VM and runs the quickstart verbatim with Docker 28.",
          observedAt: "2026-09",
          caveats: [],
        },
      },
    ],
    caveat:
      "The LLM-judge check is registered but runs in its disabled lane — no paid provider account is provisioned yet. Census Tier 3 (live discovery against third-party servers) is implemented and tested but deliberately unwired pending code review.",
  },

  caseStudy: {
    problem:
      "Teams are wiring LLM agents into internal systems through the Model Context Protocol (MCP). Every MCP server an agent connects to hands it a set of tools — and the descriptions of those tools are attacker-authored text that the agent reads as instructions. A poisoned description, a shadowed tool name, a leaked secret in a config file, or a server that silently drifts after approval can all make the agent do something nobody authorised.",
    whyFails: [
      "Static flaggers stop at suspicion: they mark a description as suspicious and stop — reachability is inferred, not proven. Nobody can tell an auditor what the agent would do.",
      "Census publishing is unreproducible: large “N% of MCP servers are vulnerable” numbers circulate, but the corpus and scripts never ship, so the number cannot be checked by anyone.",
      "Findings lack taxonomy and reproduction: a finding that doesn’t cite a CWE, a published taxonomy entry, and a reproduction command is an opinion, not a report.",
    ],
    architecture: {
      intro:
        "Two pipelines share one model layer and one database. The scan pipeline points at a single server: discover tools / resources / prompts, build the capability graph, run checks, emit SARIF/HTML with a reproduction for every finding. The census pipeline passively crawls the official MCP Registry, detects artifacts, draws a seeded random sample, and produces aggregate statistics only.",
      tree: `agent_perimeter/
  transport/   stdio (containerised launcher + seccomp.json), streamable_http,
               legacy HTTP+SSE, MCP protocol-revision negotiation
  discover/    enumerate tools / resources / prompts
  model/       ServerProfile, Tool, CapabilityEdge, ScopeFile, Finding
  checks/      revision (12) · static (5) · descriptions (5) · secrets (3)
               · active (4, scope-gated) · injection (2) · drift (1) · policy (2)
  graph/       capability graph + policy evaluation
  report/      sarif.py, html.py, census_report.py
  census/      registry fetch, artifact detection, seeded sampling, tier-3
  api/         FastAPI
web/           Next.js: scan → findings / graph / drift pages
tests/fixtures/servers/   vulnerable-server fleet (Python + Node)`,
    },
    threatModel: [
      "**Attacker-authored tool descriptions.** The agent treats tool descriptions as instructions; a poisoned description is a prompt-injection delivery channel into internal systems.",
      "**Untrusted binary execution.** Scanning a stdio MCP server *is* executing an untrusted binary — so stdio targets run inside a locked-down container by construction.",
      "**Secret leakage through the scanner itself.** Discovered secrets must never be validated live or stored raw, or the scanner becomes the leak.",
      "**Analysis-content exfiltration.** Content under analysis must never reach a tool-capable context, or the target can weaponise the judge.",
      "**Silent drift after approval.** A server approved once can change its tool descriptions afterwards; drift must be detectable and CI-enforceable.",
      "**Naming third parties.** Publishing findings about other people’s servers carries legal and ethical obligations that must be handled before publication, not after.",
    ],
    decisions: [
      {
        title: "Drive a live agent through the injection path",
        body:
          "The injection check instruments the target and drives a bundled minimal agent harness through it, so a finding says “an agent did follow this instruction to this effect” — demonstrated impact, not inferred reachability. Proves reachability and stops; nothing is weaponised.",
      },
      {
        title: "Explicit protocol-revision negotiation",
        body:
          "MCP’s 2026-07-28 revision moved to a stateless architecture and is not backward compatible. Checks declare which revisions they apply to; a per-revision check matrix governs what runs, and a deprecated HTTP+SSE transport is kept for legacy targets.",
      },
      {
        title: "Drift detection is the subscription",
        body:
          "description_hash and drift_event landed in the v1 schema. Every scan is diffed against the previous scan of the same target, rendered as a word-level LCS diff in the UI, with --fail-on-drift (exit 3) for CI.",
      },
      {
        title: "A determinism budget of at least 90%",
        body:
          "test_degraded_mode_still_produces_findings proves that at least 90% of finding classes survive with every model provider disabled. The LLM judge is the only model-gated check; the rules-based detectors stand alone.",
      },
      {
        title: "Fail-closed census pagination",
        body:
          "A registry page that returns a full page with no cursor is recorded as a suspected pagination bug, never as a completed population. The methodology doc documents the exact nextCursor trap that would otherwise silently truncate a 30k-entry census to ~2%.",
      },
      {
        title: "Honest re-scoping, recorded in writing",
        body:
          "A competitive inventory led to dropping “enterprise deployment posture” as a differentiator when the evidence didn’t support it, and narrowing “evidence-graded reporting” to reproducibility rather than volume — recorded in docs/methodology.md with dated rationale. 14 open design decisions are closed in docs/open-decisions.md.",
      },
    ],
    implementation: [
      "Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2 + Alembic (7 migrations), Postgres 16, Typer CLI. Next.js 15.5 / React 19 / TypeScript strict frontend with scan → findings / graph / drift pages.",
      "A vulnerable-server fixture fleet (one flaw each, plus clean controls) drives golden SARIF files and the precision/recall table CI rebuilds on every commit.",
      "Every finding cites a CWE plus at least one published taxonomy entry (OWASP LLM Top 10, OWASP MCP Top 10, CoSAI, NSA CSI, MITRE ATLAS) and ships with a reproduction command.",
      "Output: SARIF 2.1.0 (schema-validated, renders in GitHub code scanning), an HTML report, and a one-pager.",
      "~12,300 LOC of non-test Python across 231 files; ~3,900 LOC TypeScript with 47 Playwright/Vitest specs; mypy --strict, ruff, gitleaks pre-commit, hypothesis.",
    ],
    evidence: [
      "**Live-agent injection harness** — the differentiator no inventoried competitor (Snyk agent-scan, Cisco, Akto, Enkrypt, Trend Micro, four arXiv tools) ships.",
      "**First public census report (2026-09-14):** 31,953 registry entries, full pagination; 0 of 174 npm and 0 of 128 PyPI artifacts show published evidence of supporting the 2026-07-28 revision — reported with Wilson 95% intervals (0.0–2.2% and 0.0–2.9%) so a zero is never reported as “none”. 377 artifacts fetched, 23 fetch failures disclosed by cause.",
      "**A real detection bug found during verification, documented:** @modelcontextprotocol/sdk never shipped a 2.x (the SDK split into /server, /client, …), so the artifact detector could never have matched a v2 npm pin. Fixed and written up rather than buried.",
      "**Reproducibility:** analysis/census_analysis.py recomputes every published figure from records.csv alone. Two earlier same-day runs were discarded for detector bugs and recorded in the changelog.",
      "**Clean-machine proof:** 82-second green quickstart on a fresh ubuntu-latest VM (docs/evidence/clean-machine.md).",
    ],
    securityControls: [
      "**No active probe without a scope file** (target, authorising party, date, attestation). CLI and HTTP API refuse through the same authorisation function; the API returns 422 authorization_required, never a silent skip.",
      "**stdio servers run inside a locked-down container** — non-root, read-only rootfs, seccomp profile, no network unless the check needs it, tmpfs scratch, CPU/memory caps, hard timeout.",
      "**Discovered secrets are never validated live and never stored raw** — SHA-256 fingerprint, entropy, prefix, last 4 characters, file/line only.",
      "**Content under analysis never reaches a tool-capable context** — the LLM judge has no tools, no network, constrained-enum output only.",
      "**No third-party server is ever named in a public report** — aggregate statistics only, with a 90-day coordinated-disclosure embargo, right-of-reply, and versioned results with changelog.",
    ],
    tradeoffs: [
      "**Deterministic-first over model-first:** rules-based detectors make results reproducible and cheap, at the cost of missing patterns only a model might catch — mitigated by the (currently disabled) LLM-judge escalation lane.",
      "**Container-per-stdio-scan** costs startup time on every scan, buying the property that scanning is never raw untrusted execution on the host.",
      "**Strict scope-gating** means active checks do nothing without written authorisation — deliberately inconvenient for casual use, deliberately safe for real use.",
    ],
    limitations: [
      "The competitive table was compiled via web search after the build, not primary-source repo reads; the methodology page says so.",
      "Census Tier 3 (live discovery against third-party servers) is implemented and tested but unwired pending code review.",
      "Coverage floor is 75% — enforced, but not the 85%+ this codebase’s sibling projects hold themselves to.",
    ],
    currentStatus:
      "Built and running — 181 commits between 11 Aug and 15 Sep 2026, public repository, first public census report published 14 Sep 2026. The LLM-judge check remains registered-but-disabled (no paid provider account provisioned; decided 2026-09-14). Licence: Apache-2.0 — the patent grant matters for security tooling.",
    repoNote:
      "Public repository with a clean-machine reproduction. Clone it, run the README quickstart, and every published figure can be regenerated from the repo itself.",
  },
};
