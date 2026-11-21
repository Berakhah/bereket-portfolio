// Site-wide content: person, hero metrics (+ evidence chains), principles,
// timeline, stack, about, contact. Every metric must trace to a source doc.

export const site = {
  name: "Bereket Tilahun",
  title: "Security engineer for AI-built apps",
  jobTitle: "Senior Software Engineer",
  location: "Addis Ababa, Ethiopia",
  reviewed: "2026-11-21",
  // Kept out of the public repo: set PORTFOLIO_EMAIL, PORTFOLIO_PHONE,
  // PORTFOLIO_LINKEDIN and PORTFOLIO_RESUME_PDF (a path outside the repo) when
  // building with contactMode "direct".
  email: process.env.PORTFOLIO_EMAIL ?? "",
  phone: process.env.PORTFOLIO_PHONE ?? "",
  github: "https://github.com/Berakhah",
  githubHandle: "@Berakhah",
  linkedin: process.env.PORTFOLIO_LINKEDIN ?? "",
  availability:
    "Available for fixed-price security reviews, more than 30 hours a week from UTC+3, alongside 20 hours a week at DZ, which knows about and allows this work.",
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
  { label: "Services", href: "/#hire" },
  { label: "Experience", href: "/#experience" },
  { label: "Résumé", href: "/resume.html" },
];

// ---------------------------------------------------------------------------
// Homepage hero. The visual is a real finding from the ShopFast sample (SF-10):
// the planted policy and its fix, exactly as in supabase/migrations/.
// ---------------------------------------------------------------------------

export const hero = {
  metaTitle: "Bereket Tilahun — Security engineer for AI-built apps",
  metaDesc:
    "Security reviews for Supabase, Next.js and Stripe apps built with Lovable, Cursor, Bolt or Claude Code, from a senior backend engineer. Every finding comes with a reproduction and the fix.",
  eyebrow: "Security engineer for AI-built apps · Addis Ababa, UTC+3",
  headline: "I find where AI-built apps leak customer data, and hand you the fix.",
  headlineEm: "leak",
  lede:
    "I review Supabase, Next.js and Stripe apps built with Lovable, Cursor, Bolt or Claude Code before real users or payments touch them. Each finding comes with a way to reproduce it and the fix. I’m also a Senior Software Engineer at DZ Software Engineering, where I build and harden production Python backends.",
  hiringLink: "Hiring? Read my résumé",
  finding: {
    id: "SF-10",
    severity: "High",
    cvss: "7.7",
    title: "Customer B receives customer A’s order updates in real time.",
    body: "Row-level security was switched on, so the table looked safe. But the policy let every signed-in user read every row, and Supabase Realtime streams whatever that policy allows.",
    file: "supabase/migrations/20261107000000_new_flaws.sql",
    context: [
      'create policy "notifications readable by any signed-in user"',
      "  on public.notifications for select to authenticated",
    ],
    removed: "  using (true);",
    added: "  using (auth.uid() = user_id);",
    proof: "One of the twelve planted flaws in the ShopFast sample audit; <code>npm run poc</code> builds the app and replays it.",
  },
};

// Three proof points under the hero, one for each kind of reader. Each opens
// its evidence chain in the drawer.
export const proof = [
  { id: "m-census-31953", value: "31,953", text: "MCP Registry entries covered by a passive, reproducible census run with Agent Perimeter, my open-source scanner for MCP servers and agents." },
  { id: "sf-proven", value: "12 of 12", text: "planted flaws proven in a live run of the ShopFast sample audit; CI replays ten of them on every push." },
  { id: "m-dz-hardening", value: "47", text: "production API endpoints hardened at DZ, closing 9 High and Critical findings along the way." },
];

// ---------------------------------------------------------------------------
// Two ways to work together: a fixed-price audit, or a role.
// ---------------------------------------------------------------------------

export const paths = {
  title: "Two ways to work with me",
  clients: {
    heading: "For founders shipping an AI-built app",
    lede: "A fixed-price security review before real users or payments touch your app.",
    checks: [
      "Can one customer read another customer’s rows, files or Realtime messages?",
      "Are service-role or Stripe secret keys in the browser bundle or git history?",
      "Does the browser decide the price, or whether an order is paid?",
      "Are Stripe webhooks verified, and are SECURITY DEFINER functions safe?",
      "Can a prompt make your AI feature act on someone else’s account?",
    ],
    tiers: [
      { name: "Starter", price: "$249", days: "3 days" },
      { name: "Standard", price: "$595", days: "5 days" },
      { name: "Advanced", price: "$1,190", days: "7 days" },
    ],
    note: "Larger codebases are quoted per job. One recheck within 14 days is included.",
    cta: "Book an audit on Upwork",
  },
  employers: {
    heading: "For teams hiring an engineer",
    lede: "Open to full-time or contract backend and application-security roles, remote or in Addis Ababa.",
    points: [
      "Backend engineer since 2021: FastAPI, Django REST and Spring Boot, then four years in production at DZ.",
      "Built an LLM evaluation pipeline that runs as an automated quality gate on 11 production services at DZ.",
      "Writes security tooling other engineers can run: SARIF output, a GitHub Action, reproducible research.",
      "Senior Software Engineer since May 2026; B.Sc. in Computer Science, HiLCoE, July 2026.",
    ],
    cta: "Read my résumé",
    secondary: "Browse my GitHub",
  },
};

export const audit = {
  title: "How an audit works",
  intro: "Booked through Upwork. The report arrives 3 to 7 days after I have access and the scope is signed.",
  steps: [
    {
      title: "You tell me your stack and what worries you",
      body: "Message me on Upwork. On weekdays I usually reply within 24 hours with the first three things I’d check.",
    },
    {
      title: "We agree a written scope",
      body: "You sign a short [scope and authorisation form](/scope.html) before I test anything, and I work on staging or a copy. If production is all you have, we agree read-only checks and a time window first. NDA on request.",
    },
    {
      title: "I sign in as each role and try to cross the line",
      body: "Row-level security, storage buckets, Realtime, keys, payments, webhooks and AI tools. Anything I can reproduce gets a script you can re-run; the rest gets exact steps and screenshots.",
    },
    {
      title: "You get the report, the fixes and a recheck",
      body: "Each finding is ranked Critical to Low, with plain-English impact, the reproduction and a code or policy diff. The report lists what I didn’t test. I remove my access within 7 days of delivery. One recheck within 14 days is included; if you want me to apply the fixes, that’s $40 an hour, with no warranty beyond the recheck.",
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


// Evidence for the DZ proof point (self-reported, résumé-sourced).
heroMetrics.push({
  id: "m-dz-hardening",
  value: "47",
  label: "API endpoints hardened",
  plain: "production API endpoints hardened at DZ",
  context: "Main backend developer on a 15-service platform at DZ Software Engineering.",
  evidence: {
    claim: "As main backend developer on a 15-service platform, Bereket hardened 47 API endpoints and closed 9 High/Critical findings from internal reviews and dependency scans.",
    method: "HUMAN",
    source: { label: "Résumé — DZ Software Engineering PLC, Software Engineer, Jul 2023 – Apr 2026" },
    basis: "Self-reported from DZ’s internal tracking. The code is DZ’s and is not public.",
    observedAt: "2023 – 2026",
    caveats: ["Employer figures come from internal dashboards I can’t publish; ask me about them."],
  },
});

// ---------------------------------------------------------------------------
// How I work — four rules, each traced to a system that enforces it.
// ---------------------------------------------------------------------------

export const principles = [
  {
    title: "Fail closed",
    body:
      "When a system isn’t sure, it stops. Agent Perimeter refuses to actively probe anything without a scope file, and Ledger Sense blocks any bank-detail change until a person confirms it.",
    source: "Agent Perimeter, Ledger Sense",
  },
  {
    title: "Prove it or don’t claim it",
    body:
      "Every project figure on this site opens its source, method and caveats. Agent Perimeter’s census can be recomputed from its published CSV by someone who doesn’t trust me.",
    source: "Agent Perimeter census",
  },
  {
    title: "Say what isn’t finished",
    body:
      "Each case study ends with its limits. Ground Truth’s leaderboard is clearly marked as a placeholder until a real model run; AZTDP publishes the latency target it misses.",
    source: "Ground Truth, AZTDP",
  },
  {
    title: "AI-assisted, human-owned",
    body:
      "I write the specifications, set the tests and review every change; Claude Code drafts much of the code, committing as [@Berakhah-sys](https://github.com/Berakhah-sys). On your code I use AI tools only with your written OK, after I scan the repo for secrets, and never with customer data.",
    source: "All repositories",
  },
];

// ---------------------------------------------------------------------------
// Experience — one entry per employer, with the progression inside it.
// Anchored to résumé facts only.
// ---------------------------------------------------------------------------

export const timeline = [
  {
    mode: "Freelance",
    range: "Mar 2021 – Jun 2023",
    heading: "Freelance Backend Engineer (part-time) · Small organizations, remote",
    body: "Built backends with FastAPI, Django REST and Spring Boot.",
  },
  {
    mode: "Operate",
    range: "Mar 2022 – Jun 2023",
    heading: "Full Stack Developer · DZ Software Engineering PLC",
    body: "Triaged production incidents across Python, Java and C++ services, wrote runbooks for the ones that kept coming back, and automated recurring health checks.",
  },
  {
    mode: "Harden & measure",
    range: "Jul 2023 – Apr 2026",
    heading: "Software Engineer · DZ Software Engineering PLC",
    body: "Main backend developer on a 15-service platform: hardened 47 API endpoints, closed 9 High/Critical findings and replaced 11 long-lived secrets with short-lived tokens. Built an LLM evaluation pipeline that gates 11 production services, cutting manual review by 40%.",
  },
  {
    mode: "Senior",
    range: "May 2026 – present",
    heading: "Senior Software Engineer · DZ Software Engineering PLC",
    body: "Promoted in May 2026; part-time, 20 hours a week, since August 2026.",
  },
  {
    mode: "Independent",
    range: "2026",
    heading: "Security reviews and open-source tools",
    body: "The ShopFast sample audit and the five open-source systems on this site: personal work that treats security, evidence and failure behaviour as design inputs.",
    href: "/#work",
  },
];

// ---------------------------------------------------------------------------
// Stack — grouped, no logo walls, no percentage bars.
// ---------------------------------------------------------------------------

export const stack = [
  {
    group: "Application security",
    items: ["Supabase and PostgreSQL row-level security", "OWASP Top 10", "Stripe webhooks and checkout", "Keycloak and OIDC", "MCP and agent security", "Bandit, pip-audit, Trivy, gitleaks"],
  },
  {
    group: "Backend",
    items: ["Python", "FastAPI", "Django REST", "Spring Boot", "PostgreSQL", "Redis", "SQLAlchemy and Alembic", "TypeScript", "Next.js"],
  },
  {
    group: "Infrastructure",
    items: ["Docker and Compose", "GitHub Actions", "AWS (EC2, S3, IAM, VPC)", "Linux", "Prometheus"],
  },
];

export const about = {
  lede: "I build systems that know what they’re allowed to do, and stop when they aren’t sure.",
  body: [
    "I’m a Senior Software Engineer in Addis Ababa. Over five years I’ve built, run, hardened and measured production services, and I’ve learned that security and correctness are cheapest when they’re designed in from the start.",
    "That’s why I now spend my independent time on the apps AI tools are producing fastest: Supabase, Next.js and Stripe stacks where one missing policy line exposes every customer. I audit them, and I build the open-source tools I use to do it.",
  ],
  education: "B.Sc. Computer Science, HiLCoE School of Computer Science and Technology, Addis Ababa, 2021 to 2026 (part-time, alongside work)",
};

export const contact = {
  heading: "Have an app about to take payments, or a role to fill?",
  body: "Audits are booked through Upwork. For a role, start with the résumé, then message me on Upwork; I usually reply within 24 hours on weekdays.",
};
