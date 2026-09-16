// Site-wide content: person, hero metrics (+ evidence chains), principles,
// timeline, stack, about, contact. Every metric must trace to a source doc.

export const site = {
  name: "Bereket Tilahun",
  title: "Backend Security Engineer & Software Engineer",
  positioning:
    "I build secure backend systems, evaluation infrastructure, and automation that remains trustworthy when the inputs, models, interfaces, or environments change.",
  location: "Addis Ababa, Ethiopia",
  reviewed: "2026-09-15",
  email: "berekettilahun77@gmail.com",
  phone: "+251 939 581 519",
  github: "https://github.com/Berakhah",
  githubHandle: "@Berakhah",
  linkedin: "https://www.linkedin.com/in/bereket-tilahun-488003232/",
  availability:
    "Open to backend and security engineering roles — Addis Ababa or remote.",
  // Set before deploy; used for canonical URLs, sitemap and OpenGraph.
  siteUrl: "https://bereket-portfolio.vercel.app",
};

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "Engineering", href: "/#engineering" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

// ---------------------------------------------------------------------------
// Hero micro-proof strip: the strongest verified metrics, each with context.
// Every entry carries a full provenance chain rendered by the evidence drawer.
// ---------------------------------------------------------------------------

export const heroMetrics = [
  {
    id: "m-tests-742",
    value: "742",
    label: "test functions",
    context: "Agent Perimeter’s suite — 87 test files, ~12,500 LOC of tests.",
    evidence: {
      claim: "Agent Perimeter’s test suite contains 742 registered test functions.",
      method: "DETERMINISTIC",
      source: { label: "Repository — tests/ directory count", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "Counted from a clone of the public repository on 2026-09-16: 87 test files, 12,548 lines under tests/, 742 `def test_` functions.",
      observedAt: "2026-09",
      caveats: ["Counts test functions, not individual assertions."],
    },
  },
  {
    id: "m-pr-100",
    value: "1.00 / 1.00",
    label: "precision · recall",
    context: "Across all 12 evaluated check classes — regenerated every commit; CI fails if it drifts.",
    evidence: {
      claim: "Agent Perimeter scores 1.00 precision and 1.00 recall on all 12 evaluated check classes.",
      method: "DETERMINISTIC",
      source: { label: "docs/methodology.md — precision/recall table", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "Evaluated against a 22-case local corpus (v1.0.0). The table is rebuilt by CI on every commit and the build fails if the result goes stale.",
      observedAt: "2026-09",
      caveats: ["Local fixture corpus maintained by the project — not an independent public benchmark."],
    },
  },
  {
    id: "m-quickstart-82",
    value: "82 s",
    label: "clean-machine quickstart",
    context: "Public repo cloned onto a fresh Ubuntu VM; README quickstart run verbatim — green.",
    evidence: {
      claim: "A clean machine can clone and run Agent Perimeter’s quickstart end-to-end in 82 seconds.",
      method: "DETERMINISTIC",
      source: { label: "docs/evidence/clean-machine.md", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "A GitHub Actions workflow (clean-machine.yml) clones the public repo onto a fresh ubuntu-latest VM and executes the README quickstart verbatim with Docker 28. Recorded run: green in 82 s.",
      observedAt: "2026-09",
      caveats: ["Measured on GitHub’s hosted runners; local disk speed will vary."],
    },
  },
  {
    id: "m-census-31953",
    value: "31,953",
    label: "MCP Registry entries censused",
    context: "Full pagination — 320 pages, 0 failures, 23-minute collection window.",
    evidence: {
      claim: "The published census covered the full 31,953-entry population of the official MCP Registry.",
      method: "DETERMINISTIC",
      source: { label: "Registry census report, 2026-09-14", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "Passive crawl of the official MCP Registry with full pagination (320 pages, 0 failures), timestamped to the second. analysis/census_analysis.py recomputes every published figure from records.csv alone.",
      observedAt: "2026-09-14",
      caveats: [
        "Zero counts are reported with Wilson 95% intervals (0.0–2.2%, 0.0–2.9%) — a zero is never reported as “none”.",
        "Two earlier same-day runs were discarded for detector bugs and recorded in the changelog.",
      ],
    },
  },
  {
    id: "m-degraded-90",
    value: "≥ 90%",
    label: "degraded-mode floor",
    context: "Finding classes that survive with every model provider disabled.",
    evidence: {
      claim: "At least 90% of Agent Perimeter’s finding classes still fire with all model providers disabled.",
      method: "DETERMINISTIC",
      source: { label: "test_degraded_mode_still_produces_findings", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "The test disables every model provider and asserts the share of finding classes that still produce findings. The LLM judge is the only model-gated check.",
      observedAt: "2026-09",
      caveats: ["Floor is on finding classes, not on individual findings."],
    },
  },
  {
    id: "m-latency-195",
    value: "340 → 195 ms",
    label: "p95 latency, auth path",
    context: "Production services at DZ — Redis caching at 84% hit rate, 420 req/min peak.",
    evidence: {
      claim: "Redis caching dropped p95 latency on the auth verification path from ~340 ms to ~195 ms under peak load.",
      method: "HUMAN",
      source: { label: "Résumé — DZ Software Engineering PLC, Mar 2023 – Present" },
      basis: "Self-reported from production telemetry: 15 containerized backend services, Redis-backed caching with 84% hit rate on hot paths, peak ~420 req/min.",
      observedAt: "2023 – present",
      caveats: ["Self-reported figure from production dashboards; the measurement window is not published."],
    },
  },
];

// ---------------------------------------------------------------------------
// "How I Think" — principles, each citing the actual system it comes from.
// ---------------------------------------------------------------------------

export const principles = [
  {
    title: "Make unsafe states impossible",
    body:
      "The best error handling is a state that cannot exist. BackOffice Kit’s redaction result type raises on read if verification never ran — “forgot to check the flag” is unrepresentable, because the type itself refuses.",
    source: "BackOffice Kit — boundary/redact",
  },
  {
    title: "Fail closed",
    body:
      "Agent Perimeter refuses active probing without a scope file — CLI and HTTP API go through the same authorisation function, and the API returns 422 authorization_required, never a silent skip. Its census records an un-cursored page as a suspected pagination bug, never as a completed population.",
    source: "Agent Perimeter — scope gate & census",
  },
  {
    title: "A metric without provenance is decoration",
    body:
      "BackOffice Kit’s Claim model makes value, source, method, confidence, timestamp and inherited caveats part of the type. A DERIVED claim’s confidence can never exceed the minimum of its parents’.",
    source: "BackOffice Kit — provenance.Claim",
  },
  {
    title: "Don’t hide caveats",
    body:
      "Ground Truth’s methodology opens by stating that its population is synthetic and external validity is unmeasured by design. Agent Perimeter reports census zeros with Wilson intervals so a zero never reads as “none”.",
    source: "Ground Truth & Agent Perimeter — methodology",
  },
];

// ---------------------------------------------------------------------------
// Timeline — progression of engineering modes, not a list of job dates.
// Anchored to résumé facts only.
// ---------------------------------------------------------------------------

export const timeline = [
  {
    mode: "Operate",
    range: "2022 – 2023",
    heading: "Junior Software Engineer · DZ Software Engineering PLC",
    body:
      "Triaged 10–12 Tier 1 incidents daily across Python, Java and C++ services. Authored runbooks, automated recurring health checks, and cut recurring failures by 15% across enterprise environments. Established observability baselines later adopted across 3 production environments.",
    kind: "operate",
  },
  {
    mode: "Build",
    range: "2021 – 2023",
    heading: "Software Engineer · Independent, remote",
    body:
      "Shipped 15+ production backend systems spanning AI evaluation, collaboration and security on FastAPI, Django REST and Spring Boot — serving 100+ concurrent users at sub-200 ms API targets. Included a multilingual code search backend with authorization-before-query checks and AES-256 tenant-scoped encryption.",
    kind: "build",
  },
  {
    mode: "Harden",
    range: "2023 – present",
    heading: "Senior Software Engineer · DZ Software Engineering PLC",
    body:
      "Hardened 47 API endpoints with schema-enforced validation, parameterized queries, rate limiting and Bandit/pip-audit pre-merge gates — closing 9 High/Critical CVEs with no recurrence. Led a Zero Trust migration: 11 long-lived secrets replaced with short-lived, scope-limited OIDC tokens; Trivy image scans as a hard deploy gate; append-only audit pipeline dropping incident reconstruction to under 20 minutes.",
    kind: "harden",
  },
  {
    mode: "Measure",
    range: "2023 – present",
    heading: "Evaluation & benchmark infrastructure · production",
    body:
      "Architected an LLM evaluation pipeline and CI gate benchmarking correctness, reliability and runtime across five languages — rolled out as an automated quality gate on 11 production services, cutting manual review by 40% with zero correctness regressions. Built a benchmark curation pipeline over PostgreSQL telemetry and Redis event streams: MTTD down 30%, 1,200+ labeled records for fine-tuning.",
    kind: "measure",
  },
  {
    mode: "Design Systems",
    range: "2025 – present",
    heading: "The five systems in this portfolio",
    body:
      "Agent Perimeter, Ground Truth, Ledger Sense, BackOffice Kit and Selector Drift — independent systems that treat security, evidence and failure behaviour as first-class design inputs. Each case study documents its threat model, key decisions and honest current status.",
    kind: "design",
    href: "/#work",
  },
];

// ---------------------------------------------------------------------------
// Stack — grouped, no logo walls, no percentage bars.
// ---------------------------------------------------------------------------

export const stack = [
  {
    group: "Backend",
    items: ["Python 3.12", "FastAPI", "Django REST", "Spring Boot", "Pydantic v2", "SQLAlchemy 2 + Alembic", "PostgreSQL", "async workers", "event-driven pipelines", "Typer CLI"],
  },
  {
    group: "Security",
    items: ["Zero Trust", "OIDC / Keycloak", "JWT & token lifecycle", "RBAC / ABAC", "OWASP Top 10", "threat modeling", "SARIF 2.1.0", "envelope encryption", "Argon2", "seccomp profiles", "HMAC", "Bandit / pip-audit", "Trivy", "gitleaks"],
  },
  {
    group: "Data",
    items: ["Redis", "DuckDB", "SQLite", "Parquet", "NumPy / SciPy / scikit-learn", "BM25 / TF-IDF", "pdfplumber", "pypdfium2", "RapidOCR"],
  },
  {
    group: "Infrastructure",
    items: ["Docker & Compose", "GitHub Actions", "AWS (EC2, S3, IAM, VPC)", "Linux", "structlog", "Prometheus", "multi-stage builds", "CI/CD gates"],
  },
  {
    group: "AI & Evaluation",
    items: ["LLM evaluation pipelines", "cluster-BCa bootstrap intervals", "Cohen’s κ · Krippendorff’s α", "Benjamini–Hochberg", "O’Brien–Fleming sequential testing", "isotonic / Platt calibration", "LLM-as-judge bias controls", "hypothesis property testing"],
  },
];

export const about = {
  lede:
    "I build systems that know what they are allowed to do, know when they are uncertain, preserve evidence, and fail safely.",
  body: [
    "I’m a backend engineer in Addis Ababa. Over four years I’ve operated production services, built them, hardened them, and measured them — the timeline on this page is that progression, stated as modes rather than dates.",
    "The five systems in this portfolio are the current stage of that progression. They share one conviction: correctness, security, evidence and failure behaviour are first-class design inputs, not post-build concerns. A benchmark that can’t show how its number was produced is marketing; an automation that can’t say when it is uncertain is a liability; a scanner that can’t reproduce its findings is a rumour.",
    "So these systems are built to be distrusted — scope files before probing, hash-committed splits before leaderboards, quarantine before writes, provenance before publication. The statuses on the work page say exactly where each one stands, including what is not finished.",
  ],
  education: "B.Sc. Computer Science — HiLCoE School of Computer Science & Technology, Addis Ababa",
};

export const experience = {
  roles: [
    {
      title: "Senior Software Engineer",
      org: "DZ Software Engineering PLC",
      range: "Mar 2023 – Present",
      loc: "Addis Ababa, Ethiopia",
      points: [
        "Built and operated 15 containerized backend services on FastAPI and Django REST, shipping through CI/CD; layered Redis caching (84% hit rate) to drop p95 latency from 340ms to 195ms at 420 req/min peak.",
        "Architected an LLM evaluation pipeline and CI gate benchmarking correctness, reliability and runtime across Python, JavaScript, Java, C++ and Rust submissions — rolled out as an automated quality gate on 11 production services, cutting manual review by 40% with zero correctness regressions since launch.",
        "Designed an automated benchmark curation pipeline over PostgreSQL telemetry and Redis event streams, reducing MTTD by 30% and producing 1,200+ labeled records for fine-tuning.",
        "Hardened 47 API endpoints with schema-enforced validation, parameterized queries, rate limiting and Bandit/pip-audit pre-merge gates — closing 9 High/Critical CVEs with no recurrence in the cycles that followed.",
        "Led a Zero Trust migration: replaced 11 long-lived secrets with short-lived, scope-limited OIDC tokens, made Trivy image scans a hard deploy gate, and stood up an append-only audit pipeline — dropping incident reconstruction to under 20 minutes with zero auth-related production incidents to date.",
        "Deployed evaluation services on AWS (EC2, S3, IAM role-scoped access, VPC-isolated mesh) behind load-balanced ingress, achieving environment parity across 11 staging/production pairs and reducing rollback time by 35%.",
      ],
    },
    {
      title: "Software Engineer",
      org: "Remote (Independent)",
      range: "Mar 2021 – Feb 2023",
      loc: "Addis Ababa, Ethiopia",
      points: [
        "Shipped 15+ production backend systems spanning AI evaluation, collaboration and security on FastAPI, Django REST and Spring Boot, with React/Node.js frontends — serving 100+ concurrent users at sub-200ms API targets.",
        "Engineered a multilingual code search backend with BM25 and TF-IDF retrieval; enforced authorization-before-query checks to neutralize timing-oracle attacks and applied AES-256 tenant-scoped encryption at rest.",
        "Built a distributed real-time evaluation platform using PostgreSQL row-level optimistic locking, async Python orchestration and a WebSocket notification layer — hitting a 79% cache hit rate and pulling p95 latency from 210ms down to 48ms under 85 concurrent connections.",
        "Designed an agent-assisted evaluation pipeline using async Python workers and LLM-generated test scaffolds across 12 services, lifting throughput by 18%.",
        "Folded correctness scoring, latency profiling and reliability checks into a unified CI/CD-gated pipeline, eliminating manual handoffs between frontend, API and backend stages.",
      ],
    },
    {
      title: "Junior Software Engineer",
      org: "DZ Software Engineering PLC",
      range: "Apr 2022 – Feb 2023",
      loc: "Addis Ababa, Ethiopia",
      points: [
        "Triaged 10–12 Tier 1 incidents daily across Python, Java and C++ services; authored runbooks and automated recurring health checks, cutting recurring failures by 15% across enterprise environments.",
        "Diagnosed and resolved OS, network and distributed-service failures end-to-end, establishing observability baselines that were later adopted across 3 production environments.",
      ],
    },
  ],
};
