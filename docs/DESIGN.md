---
name: Dark Ops / Terminal
stitch_project: projects/2256596019714484539
stitch_design_system: assets/12690545366794584173
colors:
  base: "#0a0b0d"
  raised: "#111317"
  card: "#181b21"
  hairline: "rgba(255,255,255,.08)"
  ink: "#e8eaed"
  ink-2: "#a6abb4"
  accent: "#5cf28a"
  accent-dim: "#2f8a4f"
  warn: "#f2c14e"
  crit: "#ff6b57"
  info: "#7cc4ff"
---

# Design System: Dark Ops Portfolio — Bereket Tilahun
**Project ID:** projects/2256596019714484539 (Stitch)

Screens generated: Home (desktop), Case study — "Agent Perimeter", Résumé (document).

## 1. Visual Theme & Atmosphere

This is a security-ops / terminal aesthetic: a near-black command console rendered
as a portfolio. The mood is quiet, technical, and evidentiary — dark surfaces,
phosphor-green accenting, monospace readouts, and terminal boot sequences set the
tone before a single word of marketing copy appears. It reads as a system status
page more than a personal site: every claim is backed by a number, a status badge,
or a code artifact, and nothing is decorative for its own sake.

Whitespace is generous between major sections (hero, verified-figures strip,
pipeline, work dossiers, evidence, principles, timeline, stack, about, contact)
but tight and information-dense within components — readout tiles, status badges,
and dossier panels pack numerals and labels close together, instrument-panel
style. The palette is cool and low-saturation across the base/raised/card
surfaces, with a single warm-cool accent (phosphor green) doing almost all of the
emphasis work, plus three reserved semantic colors (warn/crit/info) that appear
only on status and severity indicators, never as generic decoration. Texture
(faint scanlines, a dot grid) is confined to hero sections only, reinforcing that
it is atmosphere, not chrome.

## 2. Color Palette & Roles

### Primary Foundation
- **Void Black** — `#0a0b0d` — page background ("base"). The deepest surface, used for the outer canvas and boot hero.
- **Raised Panel** — `#111317` — first elevation ("raised"), used for section bands and the pipeline rail.
- **Card Charcoal** — `#181b21` — second elevation ("card"), used for dossier panels, tiles, and chips. Confirmed present in generated Tailwind config as `surface-container`.
- **Hairline** — `rgba(255,255,255,.08–.12)` — all borders/dividers; never a solid neutral gray.

### Accent & Interactive
- **Phosphor Green (accent)** — `#5cf28a` — primary interactive/emphasis color: italic key phrases in the hero headline, active nav, primary buttons, the "ready_" boot cursor. Appears 16× in the generated Home markup, confirming it is the dominant accent.
- **Phosphor Dim** — `#2f8a4f` — secondary/hover state of the accent, used for de-emphasized accent surfaces (e.g. secondary-container tokens).

### Typography & Text Hierarchy
- **Ink** — `#e8eaed` — primary text on dark surfaces.
- **Ink-2** — `#a6abb4` — secondary/muted text (captions, metadata, timestamps, "ink-2" readout labels).

### Functional States (status badges — always glyph + label, never color alone)
- **Warn** — `#f2c14e` — caution status (e.g. "AUDIT PENDING").
- **Crit** — `#ff6b57` — critical/blocking status.
- **Info** — `#7cc4ff` — informational status (e.g. "DESIGN COMPLETE").

## 3. Typography Rules

### Hierarchy & Weights
- **Label / nav / readout / eyebrow font**: monospace — IBM Plex Mono (confirmed loaded via Google Fonts `family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400` in the generated Home screen). Used for the boot sequence, bracketed indices `[01]`–`[05]`, status badges, instrument-style numerals, and the sticky contents list on the case study.
- **Body font**: Geist — clean, low-contrast grotesque for paragraph copy, dossier descriptions, and case-study body text.
- **Headline / key-phrase font**: Newsreader, italic — reserved exclusively for the accented hero phrases ("allowed to do", "uncertain", "fail safely.") and the résumé name treatment. Confirmed via Google Fonts `family=Newsreader:ital,opsz,wght@...`.
- A `Material Symbols Outlined` icon font is also loaded, used for status-badge glyphs and iconography (contact cards, pager arrows).

### Spacing Principles
- Base spacing follows a compact rhythm inside components (readout tiles, chips, badges) with a larger section rhythm at the page level (hero → strip → pipeline → work → evidence → principles → timeline → stack → about → contact → footer).
- Letter-spacing is widened on eyebrow/label text (uppercase mono labels) for an instrument-panel feel; body copy uses normal tracking for readability.
- Line-height is generous in body/case-study prose, tighter in the boot-sequence and readout blocks to preserve the terminal look.

## 4. Component Stylings

### Buttons
- Primary buttons use the phosphor accent (`#5cf28a`) as fill or border with dark text/ink for contrast, sharp-to-slightly-rounded corners (roundness token: ROUND_FOUR — small 4px radius, not pill-shaped), consistent with a terminal/instrument feel rather than a soft consumer UI.

### Cards & Dossier Panels
- Work dossiers, readout tiles, and principle cards sit on the "card" surface (`#181b21`) with a hairline border (`rgba(255,255,255,.08–.12)`), small corner radius, and generous internal padding around a tight label+value pairing.
- No heavy shadows; elevation is communicated by surface color step (base → raised → card), not by drop-shadow.

### Navigation
- Sticky bracketed index `[01]`–`[05]` acts as in-page navigation for the Work section on Home; on the case study, a sticky contents sidebar lists 12 sections with a per-section progress hairline that fills as the reader scrolls.
- Nav/label typography is monospace, often uppercase, with wide letter-spacing.

### Inputs & Forms
- Not heavily featured in the generated screens (portfolio, not app); where present (contact), inputs would follow the same hairline-border, card-surface, small-radius treatment as other components.

### Domain-Specific Components
- **Boot hero**: monospace terminal lines prefixed with `>`, ending in a blinking cursor (`_`), layered over a faint node-graph background and a scanline + dot-grid texture — unique to the Home hero.
- **Status badge**: a fixed pairing of a glyph (icon) and a text label (e.g. "RUNNING", "DESIGN COMPLETE") — deliberately never color-only, so the badges remain legible without relying on color perception.
- **Pipeline rail**: 6 stations (`01 Input` … `06 Output`) on a horizontal rail with a traveling packet, used once on Home.
- **Architecture flow**: a 6-node horizontal flow diagram on the case study (MCP server → Discovery → Capability graph → checks → Findings → Report).
- **Evidence code block**: a syntax-highlighted Python `Claim` type with "ENFORCED" stamp badges beside it.

## 5. Layout Principles

### Grid & Structure
- Desktop canvas generated at 1440–2560px working width; content is centered with consistent side margins.
- Case study uses a two-column layout: sticky contents sidebar + main scrolling article column.
- Résumé uses a single-column, print-oriented document layout with a dedicated `@media print` treatment (confirmed in the generated screen) and A4-appropriate margins.

### Whitespace Strategy
- Large vertical rhythm between major Home sections; tight, grid-aligned spacing within readout strips and chip groups.

### Alignment & Visual Balance
- Hero content is left-aligned over a centered/background node graph; dossier and case-study content is left-aligned with the sticky index/sidebar acting as a visual anchor column.

### Responsive Behavior & Touch
- Home was specified for both desktop (1440) and mobile (390) breakpoints, stacking the boot hero, readout strip, pipeline, and dossiers into a single column on mobile while preserving the sticky index as an inline element.

## 6. Design System Notes for Stitch Generation

### Language to Use
"Dark security-ops terminal," "phosphor green accent on near-black," "instrument-panel readouts," "monospace boot sequence," "hairline borders, no heavy shadows," "status badge = glyph + label, never color alone."

### Color References
- Void Black `#0a0b0d` (base) · Raised Panel `#111317` · Card Charcoal `#181b21` · Hairline `rgba(255,255,255,.08–.12)` · Ink `#e8eaed` · Ink-2 `#a6abb4` · Phosphor Green `#5cf28a` · Phosphor Dim `#2f8a4f` · Warn `#f2c14e` · Crit `#ff6b57` · Info `#7cc4ff`.

### Component Prompts
- "A dark dossier panel on a card-charcoal surface with a hairline border, a bracketed index `[01]`, a glyph+label status badge, and a one-line mono-caption description."
- "A boot-sequence hero: monospace terminal lines starting with `>`, ending in a blinking cursor, headline with italic serif accent phrases in phosphor green, faint scanline and dot-grid texture, faint background node graph."
- "A sticky case-study contents sidebar: 12 numbered section links in monospace, each with a thin progress hairline that fills as that section is read."

### Incremental Iteration
- Known deviation: the generated **Résumé** screen drifted to a generic light palette (slate/blue/green, e.g. `#0f172a`, `#16a34a`) instead of the dark-ops system's lighter variant. Treat this as a Stitch generation artifact, not a spec change — see "Spec overrides" below.
- If iterating further in Stitch, reapply the `assets/12690545366794584173` design system to any regenerated/edited screen so palette drift (as seen on the résumé) doesn't recur.
- IBM Plex Mono rendered correctly in the Home and Case Study screens' Google Fonts includes; if a future regeneration substitutes a different monospace font, re-assert "IBM Plex Mono" explicitly in the edit prompt.

## Spec overrides

The token table in `docs/superpowers/specs/2026-09-15-dark-ops-redesign-design.md`
is authoritative. Where this document differs on colour, type or texture, the
spec wins; this document governs composition, spacing and hierarchy only.
