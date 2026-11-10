// ShopFast — sample pre-launch security audit of an AI-built Supabase + Stripe store.
// Source: github.com/Berakhah/shopfast-demo (README, supabase/migrations/, poc/). Counts re-taken
// from a clone on 2026-11-06. Severity counts come from the published sample report.

const REPO = "https://github.com/Berakhah/shopfast-demo";

export const project = {
  slug: "shopfast-demo",
  name: "ShopFast sample audit",
  tagline: "A pre-launch security audit of an AI-built Next.js + Supabase + Stripe store, with every finding proven",
  plain: "A demo store with twelve flaw types common in AI-built Supabase apps, audited the way I'd audit a client's app. A demo, not client work: each finding is proven and comes with its fix.",
  statement: "A finding you can't reproduce is an opinion.",
  status: {
    code: "running",
    label: "Running",
    detail:
      "Public demo and sample report, published Nov 2026. Demo app, not client work: the flaws were planted on purpose and the code is marked do-not-deploy.",
  },
  category: ["Security", "Audit", "Supabase"],
  role: "Threat model, review and report by me; proof scripts written with Claude Code under my direction",
  tech: ["Next.js 14", "Supabase", "PostgreSQL RLS", "Stripe", "OpenAI API", "Node.js", "CVSS 3.1", "Bash"],
  flow: ["Read code + migrations", "Sign in as each role", "Try to cross the boundary", "Prove it with a script", "Severity, proof, fix"],
  links: { github: REPO },
  demo: {
    src: "/assets/video/shopfast-demo.mp4",
    poster: "/assets/video/shopfast-demo-poster.jpg",
    caption: "Walkthrough, 1:42: all twelve findings replayed in the attack console, then the run telemetry, the findings ledger and the fix roadmap. Captions on screen, no voiceover.",
  },
  licence: "No licence — demo, do not reuse",

  card: {
    differentiator:
      "Ten of the twelve come with a proof you can run yourself: `npm run poc` builds the app and replays the attacks against localhost, with Stripe and OpenAI swapped for local stand-ins so no real account is touched.",
    metrics: [
      {
        id: "sf-proven",
        value: "12 / 12",
        label: "planted flaws proven in a live run",
        context: "3 Critical, 6 High, 3 Medium across all twelve, each with a CVSS 3.1 score, proof and code fix.",
        evidence: {
          claim: "All twelve planted flaws were proven in a live run of the demo app.",
          method: "HUMAN",
          source: { label: "shopfast-demo — README and sample report", href: REPO },
          basis: "SF-01 to SF-08 were proven in the live run behind the published sample report. SF-09 to SF-12 were added on 7 Nov 2026 and proven in GitHub Actions run 42414269396. The revised written report (Nov 9, 2026) covers all twelve; it is in the repository at docs/ShopFast-Sample-Security-Audit.pdf.",
          observedAt: "2026-11",
          caveats: ["Demo application with flaws planted on purpose, not client work."],
        },
      },
      {
        id: "sf-runner",
        value: "10",
        label: "flaws re-proven by one command",
        context: "SF-01, 02, 04, 05, 06, 07 and the four added on 7 Nov (SF-09 storage, SF-10 Realtime, SF-11 SECURITY DEFINER, SF-12 prompt injection) run in `npm run poc` and in CI; SF-08 has its own load script. SF-03 is a secret in git history, which no script can replay, so the report gives exact steps to find it. The written report covers all twelve, each with its proof and fix.",
        evidence: {
          claim: "The one-command proof runner covers ten of the twelve findings.",
          method: "DETERMINISTIC",
          source: { label: "poc/run-all.mjs", href: REPO },
          basis: "Counted the finding sections in poc/run-all.mjs on 2026-11-07: SF-01, 02, 04, 05, 06, 07, 09, 10, 11 and 12. GitHub Actions run 42414269396 reproduced all ten. SF-08 is proven by poc/sf08.sh (200 parallel unauthenticated chat requests).",
          observedAt: "2026-11-06",
          caveats: ["Needs a throwaway Supabase project and Node 20+ to run."],
        },
      },
    ],
    caveat:
      "A demo, not client work: the flaws were planted deliberately to show the report format. It shows how I test and report, not what a real client app contained.",
  },

  caseStudy: {
    problem:
      "Apps built with Lovable, Bolt, Cursor or Claude Code reach real users fast, and they tend to repeat the same security mistakes: a privileged key in the browser, tables with no access rules, and payment flows that trust the client. Founders usually find out from a customer, not a test.",
    whyFails: [
      "Reading RLS policies is not testing them: a test that runs as the table owner bypasses RLS and passes for the wrong reason.",
      "Scanners flag patterns but can't tell whether one customer can actually reach another customer's order.",
      "Reports without a reproduction get argued about; reports with one get fixed.",
    ],
    architecture: {
      intro:
        "ShopFast is a small Next.js 14 store on Supabase (Postgres, auth) and Stripe, with an AI chat endpoint. Each planted flaw is marked in the code with a PLANTED SF-0n comment, and the poc/ folder holds the scripts that prove them.",
      tree: `app/api/
  orders/[id]/      SF-04 no ownership check
  checkout/         SF-06 price taken from the browser
  stripe/webhook/   SF-05 signature never checked
  chat/             SF-08 no auth, no limits
lib/supabase.ts     SF-01 service-role key shipped to the browser
lib/supabase/server.ts, middleware.ts
                    SF-07 CORS reflects any origin, cookies cross-site
supabase/migrations/ SF-02 RLS never enabled
poc/                run-all.mjs (one-command runner), sf01.sh,
                    sf08.sh, local Stripe + OpenAI stand-ins`,
    },
    threatModel: [
      "**Cross-tenant reads and writes.** Can one signed-in customer read or change another customer's profile or order? (SF-02, SF-04)",
      "**Privileged key exposure.** Is the service-role key, which bypasses every RLS policy, reachable from the browser bundle? (SF-01)",
      "**Secrets in history.** Was a secret ever committed, even if a later commit removed it? (SF-03)",
      "**Payment integrity.** Can a customer set their own price or fake a payment confirmation? (SF-05, SF-06)",
      "**Cross-site data theft.** Can another website read a logged-in customer's data through permissive CORS and cross-site cookies? (SF-07)",
      "**Cost abuse.** Can anyone run up the AI bill through an unauthenticated chat endpoint? (SF-08)",
    ],
    decisions: [
      {
        title: "Test as each role, not as the owner",
        body:
          "Every authorization check is run as anon and as two separate customers, both in a Postgres session with that user's JWT claims and through the real Supabase client, so RLS is tested the way the app actually reaches it.",
      },
      {
        title: "Proofs stop at impact",
        body:
          "Each proof shows the boundary being crossed and stops there. Stripe and OpenAI calls go to local stand-ins, so running the proofs touches no payment or AI account.",
      },
      {
        title: "Severity a founder can act on",
        body:
          "Every finding carries a CVSS 3.1 score and a plain fix-today, this-week or before-launch priority, because a score alone doesn't tell a non-specialist what to do first.",
      },
      {
        title: "Label the demo as a demo",
        body:
          "The report, the repository and the Upwork listing all say it is a demo with planted flaws, not client work, so nobody mistakes the sample for a track record.",
      },
    ],
    implementation: [
      "App: Next.js 14 App Router, @supabase/ssr and supabase-js, Stripe and OpenAI SDKs; one SQL migration defines the schema.",
      "Proofs: `npm run poc` builds the app, starts it on localhost and runs ten proofs (SF-01, 02, 04–07 and 09–12), writing redacted results to poc/out/results.txt; secrets and tokens are redacted in the output.",
      "Report: plain-English summary, CVSS 3.1 score, proof and code fix per finding, and a fix-today / this-week / before-launch roadmap.",
      `Repo: ${REPO.replace("https://", "")}.`,
    ],
    evidence: [
      "**Anyone can re-run the proofs:** the repository holds the code, the migration and the scripts, with run instructions in the README.",
      "**Flaws are marked where they live:** every planted flaw has a PLANTED SF-0n comment at its location in the code.",
      "**Output is redacted by default:** the proof runner masks JWTs, session cookies and Stripe keys before writing results.",
    ],
    securityControls: [
      "**The fixes in the report:** RLS enabled with owner-scoped policies, the service-role key kept server-side, ownership checks on every order route, prices read from the database, Stripe webhook signatures verified, an exact-origin CORS allowlist with SameSite cookies, and auth plus rate and token limits on the chat endpoint.",
    ],
    tradeoffs: [
      "**Planted flaws, not found ones:** a demo can show method and report quality, but not how a review performs on an unfamiliar codebase.",
      "**Local stand-ins for Stripe and OpenAI** make the proofs safe to run anywhere, at the cost of not exercising the real providers.",
    ],
    limitations: [
      "Demo app with deliberately planted flaws; not client work and not a measure of real-world findings.",
      "The proofs need a throwaway Supabase project, which is exposed while it runs because the demo has RLS off by design.",
      "No licence: the code is published to back the sample report, not for reuse.",
    ],
    currentStatus:
      "Published November 2026 as the sample report behind my pre-launch security audits. Repository public; demo Supabase project kept paused.",
    repoNote: `Public repository: ${REPO.replace("https://", "")}. Intentionally vulnerable — do not deploy.`,
  },
};
