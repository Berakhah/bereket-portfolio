// Site-wide content: person, hero metrics (+ evidence chains), principles,
// timeline, stack, about, contact. Every metric must trace to a source doc.

export const site = {
  name: "Bereket Tilahun",
  title: "Backend Security Engineer",
  location: "Addis Ababa, Ethiopia",
  reviewed: "2026-11-06",
  // Kept out of the public repo: set PORTFOLIO_EMAIL / PORTFOLIO_PHONE when
  // building with contactMode "direct".
  email: process.env.PORTFOLIO_EMAIL ?? "",
  phone: process.env.PORTFOLIO_PHONE ?? "",
  github: "https://github.com/Berakhah",
  githubHandle: "@Berakhah",
  linkedin: "https://www.linkedin.com/in/bereket-tilahun-488003232/",
  availability:
    "Available for fixed-price security reviews on Upwork, more than 30 hours a week from UTC+3. I reply there within 12 hours on weekdays.",
  availabilityRoles:
    "Also open to full-time or contract backend and application-security roles, remote or Addis Ababa.",
  // Set before deploy; used for canonical URLs, sitemap and OpenGraph.
  siteUrl: "https://berakhah.github.io",
  // "upwork": the site is linked from an Upwork profile, where sharing contact
  // details before a contract breaks Upwork's terms. Email, phone, LinkedIn and
  // the direct-contact PDF résumé (which carries them) are left out of every
  // page, and the calls to action point to the Upwork profile instead. The
  // Upwork-safe PDF (src/assets/bereket-tilahun-resume.pdf) ships instead.
  // "direct": publish the direct contact details as before.
  contactMode: "upwork",
  upwork: "https://www.upwork.com/freelancers/~01645da719eb4829ed",
};

// Direct contact is published only when asked for AND an email is supplied,
// so a build without the env vars can never emit an empty mailto: link.
export const directContact = (s = site) => s.contactMode !== "upwork" && Boolean(s.email);

export const nav = [
  { label: "Work", href: "/#work" },
  { label: "How an audit works", href: "/#audit" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

// ---------------------------------------------------------------------------
// Homepage hero and the audit offer.
// ---------------------------------------------------------------------------

export const hero = {
  metaTitle: "Bereket Tilahun — Security reviews for AI-built apps",
  metaDesc:
    "Security reviews for apps built with Lovable, Cursor, Bolt or Claude Code on Supabase, Next.js and Stripe. Every finding proven with a test you can re-run, with the fix.",
  eyebrow: "Security reviews for AI-built apps · Addis Ababa, UTC+3",
  lede:
    "If you built your app with Lovable, Cursor, Bolt or Claude Code on Supabase, Next.js and Stripe, I check it before real users or payments touch it. Every finding comes with a test you can re-run and the fix.",
};

export const audit = {
  title: "How an audit works.",
  intro: "Fixed price, from $249. Report in 3–7 days, booked through Upwork.",
  pricing: "Starter $249 (3 days) · Standard $595 (5 days) · Advanced $1,190 (7 days). Larger codebases quoted per job.",
  steps: [
    {
      title: "Tell me your stack and what worries you",
      body: "Message me on Upwork. I reply there within 12 hours on weekdays with the first three things I’d check.",
    },
    {
      title: "Written scope, on staging or a copy",
      body: "We agree in writing what I test before I test anything. I work on staging or a copy of your app, never on production. NDA on request.",
    },
    {
      title: "I sign in as each role and try to cross the line",
      body: "Row-level security, storage and Realtime; keys in the browser bundle or git history; prices or “paid” status decided in the browser; unsigned Stripe webhooks; prompt injection in AI features. Each finding gets a script that proves it.",
    },
    {
      title: "Report, fix, recheck",
      body: "Every finding ranked Critical to Low, with plain-English impact, the reproduction and the fix, usually a code or policy diff. The report lists what I didn’t test. After you patch, I recheck.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Hero micro-proof strip: the strongest verified metrics, each with context.
// Every entry carries a full provenance chain rendered by the evidence drawer.
// ---------------------------------------------------------------------------

export const heroMetrics = [
  {
    id: "m-tests-ap",
    value: "940",
    label: "test functions",
    plain: "automated tests guard the flagship scanner",
    context: "Agent Perimeter’s suite.",
    evidence: {
      claim: "Agent Perimeter’s test suite contains 940 registered test functions.",
      method: "DETERMINISTIC",
      source: { label: "Repository — tests/ directory count", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "Counted from a clone of the public repository on 2026-11-06: 940 `def test_` functions.",
      observedAt: "2026-11",
      caveats: ["Counts test functions, not individual assertions."],
    },
  },
  {
    id: "m-pr-100",
    value: "1.00 / 1.00",
    label: "precision · recall",
    plain: "precision and recall on all 13 evaluated check classes, rebuilt each commit",
    context: "13 of 34 registered checks are evaluated, on the project’s own corpus — regenerated every commit; CI fails if it drifts.",
    evidence: {
      claim: "Agent Perimeter scores 1.00 precision and 1.00 recall on the 13 of its 34 checks that have labelled cases.",
      method: "DETERMINISTIC",
      source: { label: "docs/methodology.md — precision/recall table", href: "https://github.com/Berakhah/agent-perimeter" },
      basis: "Evaluated against a 26-case corpus I built (v1.0.0). The table is rebuilt by CI on every commit and the build fails if the result goes stale.",
      observedAt: "2026-11",
      caveats: ["Local fixture corpus maintained by the project — not an independent public benchmark.", "Each class has 1–2 true positives in this corpus; the score shows known cases stay caught, not real-world accuracy."],
    },
  },
  {
    id: "m-quickstart-82",
    value: "82 s",
    label: "clean-machine quickstart",
    plain: "from a clean machine to a working install",
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
    plain: "MCP servers surveyed in one reproducible census",
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
    plain: "of findings still fire with every AI model switched off",
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
    plain: "p95 latency after caching, in production",
    context: "Production services at DZ — Redis caching at 84% hit rate, 420 req/min peak.",
    evidence: {
      claim: "Redis caching dropped p95 latency on the auth verification path from ~340 ms to ~195 ms under peak load.",
      method: "HUMAN",
      source: { label: "Résumé — DZ Software Engineering PLC, Software Engineer, Jul 2023 – Apr 2026" },
      basis: "Self-reported from production telemetry: 15 containerized backend services, Redis-backed caching with 84% hit rate on hot paths, peak ~420 req/min.",
      observedAt: "2023 – 2026",
      caveats: ["Self-reported figure from production dashboards; the measurement window is not published."],
    },
  },
];

// ---------------------------------------------------------------------------
// "How I Think" — principles, each citing the actual system it comes from.
// ---------------------------------------------------------------------------

export const principles = [
  {
    title: "No floats in the money path",
    body:
      "Ledger Sense treats money as Decimal with contract-supplied rounding, enforced by a ruff lint rule, a dedicated CI job, and hypothesis property tests over every arithmetic rule — the wrong type is rejected before it can reach a total.",
    source: "Ledger Sense — money path",
  },
  {
    title: "Fail closed",
    body:
      "Agent Perimeter refuses active probing without a scope file — CLI and HTTP API go through the same authorisation function, and the API returns 422 authorization_required, never a silent skip. Its census records an un-cursored page as a suspected pagination bug, never as a completed population.",
    source: "Agent Perimeter — scope gate & census",
  },
  {
    title: "A wrong heal is worse than a broken selector",
    body:
      "Selector Drift’s resolution cascade exists to heal; its validation gate exists to stop bad heals. Type assertions outrank model confidence, and distributional checks catch the adjacent-column lock-on that per-value checks cannot.",
    source: "Selector Drift — validation gate",
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
    mode: "Build",
    range: "2021 – 2023",
    heading: "Freelance Backend Engineer (part-time) · Individual organizations, remote",
    body:
      "Part-time backend work for individual organizations on FastAPI, Django REST and Spring Boot.",
    kind: "build",
  },
  {
    mode: "Operate",
    range: "2022 – 2023",
    heading: "Full Stack Developer · DZ Software Engineering PLC",
    body:
      "Triaged 10–12 Tier-1 incidents a day across Python, Java and C++ services; wrote the runbooks and automated health checks that cut recurring failures by 15%.",
    kind: "operate",
  },
  {
    mode: "Harden",
    range: "2023 – 2026",
    heading: "Software Engineer · DZ Software Engineering PLC",
    body:
      "Hardened 47 API endpoints and closed 9 High/Critical findings from internal reviews and dependency scans, with no recurrence. Replaced 11 long-lived secrets with short-lived OIDC tokens; incident reconstruction now takes under 20 minutes.",
    kind: "harden",
  },
  {
    mode: "Measure",
    range: "2023 – 2026",
    heading: "Software Engineer · DZ Software Engineering PLC",
    body:
      "Built the LLM evaluation pipeline and CI gate now guarding 11 production services, with 40% less manual review and zero correctness regressions, and a benchmark curation pipeline that cut MTTD by 30%.",
    kind: "measure",
  },
  {
    mode: "Lead",
    range: "2026 – present",
    heading: "Senior Software Engineer · DZ Software Engineering PLC",
    body: "Promoted to Senior in May 2026; part-time since August 2026.",
    kind: "lead",
  },
  {
    mode: "Design systems",
    range: "2026",
    heading: "The sample audit and five systems on this site",
    body:
      "ShopFast sample audit, Agent Perimeter, Ledger Sense, AZTDP, Ground Truth and Selector Drift: personal open-source work that treats security, evidence and failure behaviour as design inputs.",
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
    "I build systems that know what they are allowed to do, know when they are uncertain, and fail safely.",
  body: [
    "I’m a Senior Software Engineer in Addis Ababa. I’ve operated production services, built them, hardened them and measured them, and I’ve come to believe that correctness, security and evidence are design inputs, not things you add after.",
    "The sample audit and five systems here are where that belief has ended up. Each one is designed to be checked: scope files before probing, sealed splits before leaderboards, a review queue before any money moves, provenance before publication. The case studies say exactly where each one stands, including what isn’t finished.",
    "I use AI coding tools in my own work, and my GitHub shows it. I treat their output like a junior’s pull request: I read it, test it and own it. On your code, I only use them if you approve in writing, and secrets or customer data never go into them.",
  ],
  education: "B.Sc. Computer Science — HiLCoE School of Computer Science & Technology, Addis Ababa, 2026",
  // Résumé-only: the about section keeps the shorter line above.
  educationResume: "B.Sc. Computer Science — HiLCoE School of Computer Science & Technology, Addis Ababa · Jul 2026",
  educationNote: "Completed while working as a software engineer at DZ Software Engineering (2022–2026).",
};

export const experience = {
  roles: [
    {
      title: "Senior Software Engineer",
      org: "DZ Software Engineering PLC",
      range: "May 2026 – Present",
      loc: "Addis Ababa, Ethiopia",
      note: "Promoted to Senior in May 2026; part-time since August 2026.",
      points: [],
    },
    {
      title: "Software Engineer",
      org: "DZ Software Engineering PLC",
      range: "Jul 2023 – Apr 2026",
      loc: "Addis Ababa, Ethiopia",
      note: "Completed my BSc in Computer Science at HiLCoE alongside this role.",
      points: [
        "Built and operated 15 containerized backend services on FastAPI and Django REST, shipping through CI/CD; layered Redis caching (84% hit rate) to drop p95 latency from 340ms to 195ms at 420 req/min peak.",
        "Architected an LLM evaluation pipeline and CI gate benchmarking correctness, reliability and runtime across Python, JavaScript, Java, C++ and Rust submissions — rolled out as an automated quality gate on 11 production services, cutting manual review by 40% with zero correctness regressions since launch.",
        "Designed an automated benchmark curation pipeline over PostgreSQL telemetry and Redis event streams, reducing MTTD by 30% and producing 1,200+ labeled records for fine-tuning.",
        "Hardened 47 API endpoints with schema-enforced validation, parameterized queries, rate limiting and Bandit/pip-audit pre-merge gates, closing 9 High/Critical findings from internal reviews and dependency scans with no recurrence.",
        "Replaced 11 long-lived secrets with short-lived, scope-limited OIDC tokens, made Trivy image scans a hard deploy gate, and stood up an append-only audit pipeline; incident reconstruction now takes under 20 minutes.",
        "Deployed evaluation services on AWS (EC2, S3, IAM role-scoped access, VPC-isolated mesh) behind load-balanced ingress, achieving environment parity across 11 staging/production pairs and reducing rollback time by 35%.",
      ],
    },
    {
      title: "Full Stack Developer",
      org: "DZ Software Engineering PLC",
      range: "Mar 2022 – Jun 2023",
      loc: "Addis Ababa, Ethiopia",
      points: [
        "Triaged 10–12 Tier 1 incidents daily across Python, Java and C++ services; authored runbooks and automated recurring health checks, cutting recurring failures by 15% across enterprise environments.",
        "Diagnosed and resolved OS, network and distributed-service failures end-to-end, establishing observability baselines that were later adopted across 3 production environments.",
      ],
    },
    {
      title: "Freelance Backend Engineer (part-time)",
      org: "Independent, for individual organizations",
      range: "Mar 2021 – Jun 2023",
      loc: "Remote",
      note: "Part-time backend work before and alongside DZ, until mid-2023.",
      points: [
        "Built backends on FastAPI, Django REST and Spring Boot, with React/Node.js frontends.",
        "Engineered a multilingual code search backend with BM25 and TF-IDF retrieval; enforced authorization-before-query checks to neutralize timing-oracle attacks and applied AES-256 tenant-scoped encryption at rest.",
        "Folded correctness scoring, latency profiling and reliability checks into a unified CI/CD-gated pipeline, eliminating manual handoffs between frontend, API and backend stages.",
      ],
    },
  ],
  projects: [
    {
      name: "ShopFast sample audit",
      href: "/work/shopfast-demo.html",
      text: "(2026, demo, not client work): a demo store with 8 planted flaws (3 Critical, 2 High, 3 Medium), all 8 proven in a live run and 6 re-proven by one command, each with its fix.",
    },
    {
      name: "Agent Perimeter",
      href: "/work/agent-perimeter.html",
      text: "(2026, open source, Apache-2.0): security scanner for MCP servers and AI agents; 34 checks in 8 groups, 940 test functions, and a census of 31,953 MCP Registry entries.",
    },
  ],
};
