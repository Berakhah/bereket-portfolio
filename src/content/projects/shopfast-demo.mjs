// ShopFast — sample pre-launch security audit of an AI-built Supabase + Stripe store.
// Source: github.com/Berakhah/shopfast-demo (README, supabase/migrations/, poc/). Counts re-taken
// from a clone on 2026-11-06. Severity counts come from the published sample report.

const REPO = "https://github.com/Berakhah/shopfast-demo";

export const project = {
  slug: "shopfast-demo",
  name: "ShopFast sample audit",
  tagline: "A pre-launch security audit of an AI-built Next.js + Supabase + Stripe store, with every finding proven",
  plain: "A demo store with the eight flaws AI coding tools ship most often, audited the way I audit client apps, each finding proven and fixed.",
  statement: "A finding you can't reproduce is an opinion.",
  status: {
    code: "running",
    label: "Running",
    detail:
      "Public demo and sample report, published Nov 2026. Demo app, not client work: the flaws were planted on purpose and the code is marked do-not-deploy.",
  },
  category: ["Security", "Audit", "Supabase"],
  role: "Sole reviewer — threat model, review, proofs, report",
  tech: ["Next.js 14", "Supabase", "PostgreSQL RLS", "Stripe", "OpenAI API", "Node.js", "CVSS 3.1", "Bash"],
  flow: ["Read code + migrations", "Sign in as each role", "Try to cross the boundary", "Prove it with a script", "Severity, proof, fix"],
  links: { github: REPO },
  licence: "No licence — demo, do not reuse",

  card: {
    differentiator:
      "Every finding comes with a proof a client can run themselves: `npm run poc` builds the app and replays the attacks against localhost, with Stripe and OpenAI swapped for local stand-ins so no real account is touched.",
    metrics: [
      {
        id: "sf-proven",
        value: "8 / 8",
        label: "planted flaws proven in a live run",
        context: "3 Critical, 2 High, 3 Medium, each with a CVSS 3.1 score, proof and code fix.",
        evidence: {
          claim: "All eight planted flaws were proven in a live run of the demo app.",
          method: "HUMAN",
          source: { label: "shopfast-demo — README and sample report", href: REPO },
          basis: "Stated in the published sample report; the planted flaws and their locations are listed in the repository README.",
          observedAt: "2026-11",
          caveats: ["Demo application with flaws planted on purpose, not client work."],
        },
      },
      {
        id: "sf-runner",
        value: "6",
        label: "flaws re-proven by one command",
        context: "SF-01, 02, 04, 05, 06 and 07 run in `npm run poc`; SF-08 has its own load script and SF-03 lives in the first commit.",
        evidence: {
          claim: "The one-command proof runner covers six of the eight findings.",
          method: "DETERMINISTIC",
          source: { label: "poc/run-all.mjs", href: REPO },
          basis: "Counted the finding sections in poc/run-all.mjs from a clone on 2026-11-06: SF-01, SF-02, SF-04, SF-05, SF-06 and SF-07. SF-08 is proven by poc/sf08.sh (200 parallel unauthenticated chat requests).",
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
      "Proofs: `npm run poc` builds the app, starts it on localhost and runs the six HTTP-level proofs, writing redacted results to poc/out/results.txt; secrets and tokens are redacted in the output.",
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
