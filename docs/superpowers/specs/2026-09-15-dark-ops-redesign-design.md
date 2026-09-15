# Portfolio redesign — "dark terminal / security-ops" — design spec

Date: 2026-09-15
Status: approved in chat, pending written review

## Goal

Redesign the visual and motion layer of bereket-portfolio into a dark
security-ops aesthetic with heavy, choreographed animation, complete the
site end to end, and deploy it to Vercel with a real `siteUrl`.

## Non-negotiables

- **No invented facts.** All copy, metrics, statuses, links and evidence
  chains come from `src/content/**` unchanged. Only `site.siteUrl` is set.
- Repo links that the content marks `pending` / `planned` stay that way.
- No Writing/Notes section (no real posts exist).
- Status vocabulary keeps glyph + label; never colour-only. WCAG 2.2 AA
  contrast on dark. All existing ARIA / keyboard behaviour is preserved.
- `prefers-reduced-motion: reduce` → instant reveals, static canvas, no
  pinning, no smooth scroll.
- No build step added. Libraries come from cdnjs, pinned, `defer`.

## Workflow

1. Stitch-first: after a session restart (Stitch MCP loads at startup),
   use `stitch-design:generate-design` to produce screen concepts for
   Home, Case Study and Résumé in this direction, fed with real content;
   extract a `DESIGN.md` via `stitch-design:extract-design-md`.
2. Implement that design in the existing generator (`build.mjs`,
   `src/render/*`) and assets (`site/assets/*`).
3. Regenerate `og-card.png` and `favicon.svg`.
4. Deploy `site/` to Vercel via the connector; set `site.siteUrl`;
   rebuild; redeploy.

## Visual system

| Token | Value |
|---|---|
| base / raised / card | `#0a0b0d` / `#111317` / `#181b21` |
| hairline | `rgba(255,255,255,.08)` – `.12` |
| ink / ink-2 / ink-3 | `#e8eaed` / `#a6abb4` / `#6f7580` |
| accent (phosphor) | `#5cf28a` (text on base ≥ 7:1) ; dim `#2f8a4f` ; wash `rgba(92,242,138,.08)` |
| warn (caveats) | `#f2c14e` |
| crit | `#ff6b57` |
| info | `#7cc4ff` |

Type: IBM Plex Mono (primary: nav, labels, readouts, eyebrows), Geist
(body), Newsreader italic (hero key phrases only). Fonts stay self-hosted.

Textures: scanline + dot-grid on the home hero and case-study heroes only.
Motifs: terminal readouts (`> …`), bracketed indices `[01]`, blinking
cursor, instrument-style numbers.

## Home layout & motion

1. **Boot hero.** 1.2 s boot sequence of monospace lines typed in,
   generated at build time from real content (metric count, project
   statuses, reviewed date). Canvas capability graph behind: nodes are the
   5 systems + `bok-core`; edges are the substrate relationships already
   in content (Agent Perimeter, Ground Truth, Ledger Sense → bok-core).
   Nodes drift, edges pulse, pointer repels (pointer:fine only).
   Headline lines clip-reveal; italic serif phrases in accent.
2. **Verified figures strip.** 6 hero metrics as readouts: count-up on
   view, animated provenance underline, click opens the evidence drawer.
   Drawer slides in terminal-style; rows type in sequentially.
3. **Pipeline scene.** ScrollTrigger-pinned; scroll scrubs a packet along
   6 stations; each lights with its description. Mobile: unpinned rail.
4. **Work.** 5 dossier panels; horizontal wipe on enter; badge pulse;
   flow stepper line draws (SVG dashoffset scrub); substrate diagram
   animates edges. Sticky `[01]`–`[05]` index on desktop.
5. **Evidence.** `Claim` code block "compiles" line by line with caret;
   three enforced rules stamp in.
6. **Principles.** Pinned horizontal scrub track on desktop; vertical on
   mobile. Each cites its source system.
7. **Timeline.** Vertical rail line draws on scroll; nodes ignite.
8. **Stack / About / Contact / Footer.** Stagger reveals; contact cards
   hover scan sweep; footer shows `site.reviewed`.

## Case study pages

Dark hero; flow drawn in on load; tech chips stagger. Sticky TOC with a
per-section progress indicator. Section clip-mask reveals. Metric readouts
reuse the home component. Prev/next pager hover slide.

## Résumé / 404

Same system, lighter motion. 404 renders a "route refused" readout.

## Cross-cutting

- Lenis smooth scroll; internal navigation uses View Transitions where
  supported with a curtain fallback.
- GSAP 3.x core + ScrollTrigger, Lenis — cdnjs, exact versions, `defer`.
- Canvas graph and all timelines pause when off-screen.

## Files

- Rewrite: `site/assets/css/style.css`, `site/assets/js/main.js`
- New: `site/assets/js/graph.js`, `vercel.json`, `docs/DESIGN.md`
- Edit: `build.mjs`, `src/render/layout.mjs`, `src/render/components.mjs`
  (markup hooks for new sections), `src/content/person.mjs` (`siteUrl` only)
- Regenerate: `site/assets/img/og-card.png`, `site/assets/img/favicon.svg`

## Verification

- `node build.mjs` green; every page renders with JS disabled (content
  visible, no hidden-forever reveals).
- Reduced-motion check in Chrome DevTools emulation.
- Lighthouse (chrome-devtools MCP): a11y ≥ 95, perf ≥ 85 on home.
- Deployed URL loads; canonical/OG/sitemap point at it.
