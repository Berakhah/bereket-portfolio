# Editorial Signal — portfolio redesign

Date: 2026-09-17 · Replaces: `2026-09-15-dark-ops-redesign-design.md`

## Goal

Replace the "Dark Ops / Terminal" identity with a warm, typography-led editorial
site that puts the person first and the evidence second — the pattern shared by
2026 award-winning portfolios (By-Kin, Glacial Arch, Uncommon) and by the
recruiter guidance that converts: work first, one CTA, mobile-scannable in ten
seconds. Every page, plus the copy, is in scope. The content model, evidence
chains and static build system stay.

## 1. Visual system

**Tokens (light is the design; dark honours `prefers-color-scheme`).**

| token      | light                | dark                 | role |
|------------|----------------------|----------------------|------|
| paper      | `#f4f1ea`            | `#121110`            | page background |
| paper-2    | `#ebe6dc`            | `#1a1816`            | bands, image mats |
| ink        | `#16130f`            | `#efeae0`            | text, rules |
| muted      | `#6b655c`            | `#9d968a`            | captions, meta |
| hairline   | `rgba(22,19,15,.12)` | `rgba(239,234,224,.14)` | borders |
| signal     | `#ff4d1c`            | `#ff6a40`            | links on hover, primary CTA, live dot, underline of emphasised words |

Only `signal` carries colour. No gradients, no glass, no scanlines, no grids.

**Type.** Newsreader (already subset in `src/vendor` / `site/assets/fonts`) is
the display face: hero 72–120px via `clamp`, leading 0.95, `font-optical-sizing`
on, italics for the emphasised phrase. Geist for body and UI at 17px/1.55.
Geist Mono only for metric numerals, footnote markers (`¹`), and the case-study
architecture tree. Keep the existing font pipeline; add the display weight
(Newsreader 500/italic) to the subset if missing.

**Portrait.** `assets/linkedin.jpg` → `site/assets/img/bereket.{avif,webp,jpg}`
at 1200w and 600w (build step with `sharp`, or a one-off script committed under
`src/og/`). Cropped as a tall arch (`border-radius: 999px 999px 24px 24px`),
`aspect-ratio: 3/4`, warm grade via a `mix-blend-mode: multiply` paper-coloured
overlay at 8%. Used full-size in the hero, 96px round in the footer sign-off,
and in the OG card.

**Motion.** `.motion` class gates everything (existing convention, keep the
test). Reveals: `opacity 0→1, translateY 24→0`, 600ms, `cubic-bezier(.2,.7,.2,1)`,
staggered 60ms. Page-transition curtain in `paper`. Work panels sticky-stack
(`position: sticky; top: 0`) with the previous panel scaling to .96 and fading
to 60% as the next arrives. Hero portrait parallax ≤ 24px. `prefers-reduced-
motion` → no transforms, no smooth scroll, no curtain.

## 2. Homepage

Sections in order. Nav: `Work · How I work · About · Contact`, plus a persistent
"Email" pill on the right that becomes the only fixed element on mobile.

1. **Hero.** Two columns (stack on <900px, portrait first). Left: eyebrow
   `Backend security engineer · Addis Ababa · remote-ready`; headline
   *"Systems that stay **trustworthy** when everything else changes."*;
   one-sentence positioning; CTAs `Email me` (signal, filled) and `Résumé`
   (outlined, links to `/resume`). Right: arched portrait.
2. **Proof strip.** Four `heroMetrics` as 56px mono numerals, each with a
   plain-English caption rewritten for a non-engineer (e.g. "742 automated
   tests guard the flagship scanner"). Click → existing evidence drawer,
   restyled as a paper sheet sliding from the right.
3. **Work.** Heading *"Five systems, built to be distrusted."* Then five
   sticky-stacking panels, `min-height: 100vh`. Each panel: `01`, project name
   (display serif), `plain` sentence (new field, recruiter-readable),
   `differentiator` (existing, engineer-readable), two `card.metrics`, tech
   chips (max 6, `+n`), link *Read the case study →*. Right column: the
   project's `flow` rendered as a large vertical stepper in ink with signal
   nodes — the same `flowStepper` component, scaled up.
4. **How I work.** The four `principles` as a numbered list: `№ 1` in mono,
   title in serif 32px, body, source in muted small caps. No cards.
5. **Path + stack.** Two columns: the five `timeline` modes as a slim rail
   (mode · range · one line), and `stack` groups as comma-separated runs,
   not chips.
6. **About.** 96px portrait, `about.lede` in serif 28px, body paragraphs,
   education line.
7. **Contact.** Display serif *"Let's talk."* at 96px, then email (mailto),
   GitHub, LinkedIn, résumé, location, availability. Footer: name, "reviewed
   2026-09-15", small portrait.

Removed: boot block, canvas graph (`graph.js`), pipeline scene, status-badge
chrome, "verified figures" language, dot grid, scanlines.

## 3. Other pages

**Case study (`/work/<slug>/`).** Hero: `01` + name + tagline in display serif,
`plain` sentence, status line rewritten as prose ("Running — public repo,
Apache-2.0, clean-machine CI since Aug 2026"), meta row (role · stack · GitHub
· licence). Then a sticky left TOC (mono, current section in signal) and a
720px reading column: Problem · Why the obvious approach fails · Architecture
(intro + tree in mono on `paper-2`) · Threat model · Decisions (each `title`
as a serif run-in heading) · Evidence (metrics with drawers) · Caveats / what
is not finished · Next/previous project footer. Flow diagram from the home
panel repeats at the top of Architecture.

**Résumé (`/resume`).** Same shell; a print-first document: name, contact
line, roles from `experience`, education, stack. Download button for the PDF.
`@media print` strips nav, motion, colour.

**404.** Paper page, serif *"Nothing here."*, one line, link home. No terminal
readout.

**OG card.** `docs/og/og-card.html` re-templated: paper, serif name and
positioning, portrait at right. Rendered by the existing `npm run og`.

## 4. Copy

Audience: a hiring manager who is an engineer, with a recruiter-scannable top
layer. Rules:

- Every project gets a new `plain` field: one sentence, no jargon, states the
  problem and the outcome ("Scans the tools an AI agent can reach and proves
  which ones an attacker could hijack."). Existing `differentiator` stays as
  the second, technical sentence.
- `site.positioning` rewritten to ≤ 20 words. `about.body` cut to two
  paragraphs, first person, no "these systems are built to be distrusted"
  repetition with the Work heading.
- Metric captions on the home proof strip get a `plain` variant; the evidence
  chain text is untouched (it is the provenance).
- Status labels move from `RUNNING` to sentence-case prose in `status.detail`;
  `status.code` stays for tests and ops.
- Timeline bodies trimmed to ≤ 40 words each; full detail lives on `/resume`.
- No filler ("cutting-edge", "passionate", "seamless"). Numbers keep their
  provenance links.

All copy changes land in `src/content/*` and are listed in the plan for the
author's review before build.

## 5. Build approach

1. **Stitch first.** New Stitch project "Editorial Signal"; design system from a
   new `docs/DESIGN.md` (tokens above). Generate three screens: Home (desktop +
   mobile), Case study, Résumé. Iterate until the home hero and work panel
   match this spec; export the approved HTML as reference only.
2. **Hand-build in the existing pipeline.** `build.mjs` keeps its
   `page/indexPage/casePage/resumePage/notFoundPage` structure; sections are
   rewritten. `src/css/style.css` replaced wholesale with the new system.
   `src/js/main.js` reduced to: reveals, sticky-stack progress, evidence
   drawer, curtain, nav state. `graph.js` and `ops.mjs` boot/graph helpers
   deleted with their tests.
3. **Assets.** Add `src/og/portrait.mjs` (sharp) producing the portrait sizes
   into `site/assets/img/`; run from `build.mjs`.
4. **Tests.** Rewrite `home.test.mjs`, `pages.test.mjs`, `css.test.mjs`,
   `build.test.mjs` to assert the new structure (five sticky panels with
   `plain` copy, arched portrait `<picture>`, no boot/graph/pipeline markup,
   light tokens present, motion gating preserved, print rules on résumé).
   Add a content test: every project has `plain` ≤ 160 chars.
5. **Verify in Chrome** (chrome-devtools MCP): desktop + 390px mobile
   screenshots of every page, LCP < 1.5 s on the home page with the portrait
   preloaded, no CLS from fonts (existing `font-display: optional` stays).
6. **Ship.** Commit to `main`, rebuild, push `site/` to `Berakhah.github.io`.

## Out of scope

New projects, blog, analytics, contact form, dark-mode toggle UI.
