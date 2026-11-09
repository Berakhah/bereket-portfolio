// Site-wide content: person, hero metrics (+ evidence chains), principles,
// timeline, stack, about, contact. Every metric must trace to a source doc.

export const site = {
  name: "Bereket Tilahun",
  title: "Security engineer for AI-built apps",
  jobTitle: "Senior Software Engineer",
  location: "Addis Ababa, Ethiopia",
  reviewed: "2026-11-07",
  // Kept out of the public repo: set PORTFOLIO_EMAIL, PORTFOLIO_PHONE,
  // PORTFOLIO_LINKEDIN and PORTFOLIO_RESUME_PDF (a path outside the repo) when
  // building with contactMode "direct".
  email: process.env.PORTFOLIO_EMAIL ?? "",
  phone: process.env.PORTFOLIO_PHONE ?? "",
  github: "https://github.com/Berakhah",
  githubHandle: "@Berakhah",
  linkedin: process.env.PORTFOLIO_LINKEDIN ?? "",
  availability:
    "Available for fixed-price security reviews on Upwork, more than 30 hours a week from UTC+3, alongside 20 hours a week at DZ. My employer knows about and allows this work.",
  // Résumé lede.
  availabilityRoles:
    "Open to full-time or contract backend and application-security roles, remote or Addis Ababa. I also take fixed-price security reviews of Supabase, Next.js and Stripe apps.",
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
  metaTitle: "Bereket Tilahun — Security engineer for AI-built apps",
  metaDesc:
    "Security reviews for apps built with Lovable, Cursor, Bolt or Claude Code on Supabase, Next.js and Stripe. Each finding comes with a way to reproduce it, and the fix.",
  eyebrow: "Security engineer for AI-built apps · Addis Ababa, UTC+3",
  lede:
    "If you built your app with Lovable, Cursor, Bolt or Claude Code on Supabase, Next.js and Stripe, I check it before real users or payments touch it. Each finding comes with the fix and a way to reproduce it: a script you can re-run, or exact steps and screenshots where a script can’t work. I also review and harden Python (FastAPI, Django) and Node.js APIs.",
};

export const audit = {
  title: "How an audit works.",
  intro: "Fixed price, from $249. Report in 3–7 days, counted from when I have access and the scope is signed. Booked through Upwork.",
  pricing: "Starter $249 (3 days) · Standard $595 (5 days) · Advanced $1,190 (7 days). Larger codebases quoted per job.",
  steps: [
    {
      title: "Tell me your stack and what worries you",
      body: "Message me on Upwork. I usually reply within 24 hours on weekdays (Mon–Fri, Ethiopian public holidays excepted) with the first three things I’d check.",
    },
    {
      title: "Written scope, on staging or a copy",
      body: "We sign a short [scope and authorisation form](/scope.html) before I test anything. I test on staging or a copy. If you only have production, we first agree in writing on read-only checks and a time window. NDA on request. I remove my access within 7 days of delivery and keep the report for 12 months, then delete it.",
    },
    {
      title: "I sign in as each role and try to cross the line",
      body: "Row-level security; keys in the browser bundle or git history; prices or “paid” status decided in the browser; unsigned Stripe webhooks. I also test storage buckets, Realtime, SECURITY DEFINER functions and prompt injection in AI tools; the sample has a planted, proven example of each. Findings that can be reproduced get a script you can re-run; the rest, such as secrets in git history or settings, get exact steps and screenshots.",
    },
    {
      title: "Report, fix, recheck",
      body: "Every finding ranked Critical to Low, with plain-English impact, the reproduction and the fix, usually a code or policy diff. The report lists what I didn’t test. One recheck within 14 days of delivery is included. If you want me to apply the fixes, that’s $40 an hour, with no warranty beyond the recheck.",
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
      claim: "After Redis caching was added, p95 latency fell from 340 ms to 195 ms.",
      method: "HUMAN",
      source: { label: "Résumé — DZ Software Engineering PLC, Software Engineer, Jul 2023 – Apr 2026" },
      basis: "Self-reported from DZ production dashboards. DZ has authorised citing this figure.",
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
    heading: "Freelance Backend Engineer (part-time) · Small organizations, remote",
    body:
      "Part-time backend work for small organizations on FastAPI, Django REST and Spring Boot.",
    kind: "build",
  },
  {
    mode: "Operate",
    range: "2022 – 2023",
    heading: "Full Stack Developer · DZ Software Engineering PLC",
    body:
      "Triaged production incidents across Python, Java and C++ services, then wrote runbooks and automated health checks for the ones that kept coming back.",
    kind: "operate",
  },
  {
    mode: "Harden",
    range: "2023 – 2026",
    heading: "Software Engineer · DZ Software Engineering PLC",
    body:
      "As main backend developer on a 15-service platform, I hardened 47 API endpoints and closed 9 High/Critical findings from internal reviews and dependency scans. I also replaced 11 long-lived secrets with short-lived, scope-limited tokens.",
    kind: "harden",
  },
  {
    mode: "Measure",
    range: "2023 – 2026",
    heading: "Software Engineer · DZ Software Engineering PLC",
    body:
      "Built the LLM evaluation pipeline that runs as a quality gate on 11 production services; manual review effort fell 40%. A second pipeline, for benchmark curation, cut mean time to detect model-quality regressions by 30%.",
    kind: "measure",
  },
  {
    mode: "Senior",
    range: "2026 – present",
    heading: "Senior Software Engineer · DZ Software Engineering PLC",
    body: "Promoted in May 2026; part-time, 20 hours a week, since August 2026.",
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
    group: "Security",
    items: ["OWASP Top 10", "Supabase / PostgreSQL row-level security", "Stripe webhooks", "Keycloak / OIDC", "Bandit", "pip-audit", "Trivy", "gitleaks"],
  },
  {
    group: "Backend",
    items: ["Python", "FastAPI", "Django REST", "Spring Boot", "PostgreSQL", "Redis", "SQLAlchemy + Alembic", "TypeScript", "Next.js"],
  },
  {
    group: "Infrastructure",
    items: ["Docker & Compose", "GitHub Actions", "AWS (EC2, S3, IAM, VPC)", "Linux", "Prometheus"],
  },
];

export const about = {
  lede:
    "I build systems that know what they are allowed to do, know when they are uncertain, and fail safely.",
  body: [
    "I’m a Senior Software Engineer in Addis Ababa. I’ve operated production services, built them, hardened them and measured them, and I’ve come to believe that correctness, security and evidence are design inputs, not things you add after.",
    "The sample audit and five systems here are where that belief has ended up. Each one is designed to be checked: scope files before probing, sealed splits before leaderboards, a review queue before any money moves, provenance before publication. The case studies say exactly where each one stands, including what isn’t finished.",
    "For the systems here, I wrote the specifications with Claude Code, set the evaluation criteria, made the design decisions, and reviewed and tested the changes. Claude Code generated a substantial part of the code under my direction; its commits sit under [@Berakhah-sys](https://github.com/Berakhah-sys), my second GitHub account. On your code I use AI tools only with your written OK, after I scan the repo for secrets, and never with customer data.",
  ],
  education: "B.Sc. Computer Science, HiLCoE School of Computer Science & Technology, Addis Ababa, Jan 2021 – Jul 2026 (part-time study alongside work)",
};
