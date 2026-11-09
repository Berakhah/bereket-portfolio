// Write-ups. Each body is an HTML fragment in ./writing/<slug>.html.
// `draft: true` keeps a post out of a normal build (no page, no sitemap entry, no nav link).
// Preview drafts with:  DRAFTS=1 SITE_OUT=/some/tmp/dir node build.mjs
// Publish one by setting `draft: false` and the date it went out.
import { site } from "./person.mjs";

const scanner = {
  label: "Try the scanner",
  text: "Scan an MCP server you own: one command, SARIF out, every finding with a command that reproduces it.",
  href: "https://github.com/Berakhah/agent-perimeter",
};

const audit = {
  label: "Book an audit",
  text: "The same review on your Lovable, Bolt, Cursor or Next.js + Supabase app: every finding with a proof and the code fix.",
  href: site.upwork,
};

export const posts = [
  {
    slug: "mcp-registry-census",
    title: "0 of 302: what a full census of the MCP Registry says about the 2026-07-28 revision",
    dek: "A seeded random sample of packaged servers, a Wilson interval around a zero, and the 18 packages that could change it.",
    date: "2026-11-09",
    draft: false,
    repo: "https://github.com/Berakhah/agent-perimeter",
    cta: scanner,
  },
  {
    slug: "shopfast-twelve-leaks",
    title: "Twelve ways an AI-built Supabase + Stripe store leaks customer data, each with a proof you can rerun",
    dek: "Four root causes behind twelve planted flaws, ten of them proven in CI on every push.",
    date: "2026-11-09",
    draft: false,
    repo: "https://github.com/Berakhah/shopfast-demo",
    cta: audit,
  },
  {
    slug: "scope-files-vs-random-sampling",
    title: "I deleted a census tier I’d already built: scope files versus random sampling",
    dek: "Why a random sample of strangers’ servers can’t have an authorising party, and what the census lost by keeping the rule.",
    date: "2026-11-09",
    draft: false,
    repo: "https://github.com/Berakhah/agent-perimeter",
    cta: scanner,
  },
];
