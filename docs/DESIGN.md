---
name: Editorial Signal
stitch_project: projects/17780523195966071887
stitch_design_system: assets/040b76ff3acf4974831588c394f82a42
colors:
  paper: "#f4f1ea"
  paper-2: "#ebe6dc"
  ink: "#16130f"
  muted: "#6b655c"
  hairline: "rgba(22,19,15,.12)"
  signal: "#ff4d1c"
dark:
  paper: "#121110"
  paper-2: "#1a1816"
  ink: "#efeae0"
  muted: "#9d968a"
  hairline: "rgba(239,234,224,.14)"
  signal: "#ff6a40"
---

# Design System: Editorial Signal — Bereket Tilahun

## 1. Atmosphere
Warm paper, black ink, one signal-orange accent. The site reads like a
well-set magazine feature about an engineer: a big serif headline, a real
portrait, generous margins, and figures set in mono as footnotes. Nothing
glows, nothing scans, nothing boots. Confidence comes from type size and
whitespace, not from chrome.

## 2. Colour roles
- paper — page; paper-2 — bands and image mats; ink — text and rules;
  muted — captions and meta; hairline — every border.
- signal — ONLY: link hover underline, the primary CTA fill, the live
  status dot, the emphasised italic word in the hero, the current TOC item.
  Never as a background wash, never on more than one element per viewport
  region.

## 3. Type
- Display: Newsreader 500, tracking -0.02em, leading 0.95, optical sizing on.
  Hero `clamp(3rem, 2rem + 6vw, 7.5rem)`; section titles `clamp(2.2rem,
  1.6rem + 2.4vw, 4rem)`; panel names `clamp(2.6rem, 2rem + 3vw, 5rem)`.
  Emphasis word in Newsreader italic 400, signal.
- Body/UI: Geist 400/500, 17px / 1.55. Eyebrows: Geist 500, 13px,
  uppercase, tracking .12em, muted.
- Mono: IBM Plex Mono 500 for metric numerals (56px, tabular), footnote
  markers, code and the architecture tree. Never for headings.

## 4. Layout
- Max width 80rem, gutter `clamp(1rem, 5vw, 4rem)`. Section rhythm
  `clamp(5rem, 12vw, 11rem)`.
- Hero: 2 columns 1.1fr / .9fr, portrait right, stacked on < 900px with the
  portrait first at 60vw wide.
- Work: five `min-height: 100vh` sticky panels; text left (number, name,
  plain sentence, technical sentence, two metrics, chips, link), flow
  stepper right, vertical, large.
- Case study: sticky left TOC (14rem) + 44rem reading column.

## 5. Components
- Portrait: `<picture>` webp/jpg, `aspect-ratio: 3/4`, `border-radius:
  999px 999px 24px 24px`, `object-position: 50% 15%`, paper-coloured
  multiply overlay at 8%.
- Buttons: pill, 48px tall. Primary = signal fill, paper text. Secondary =
  1px ink border.
- Chips: 1px hairline, mono 12px, paper-2 fill.
- Metric: mono numeral 56px + Geist caption; underline dotted in signal on
  hover; opens the evidence sheet.
- Evidence sheet: right-hand panel, paper, 1px ink left border, 28rem.
- Flow stepper: vertical list, 12px ink dots, 1px ink line, signal dot on
  the last node.

## 6. Motion
Reveal: opacity 0→1, y 24→0, 600ms `cubic-bezier(.2,.7,.2,1)`, 60ms
stagger. Page curtain in paper, 420ms. Sticky-stack: previous panel scales
to .96 and fades to .6 while the next arrives. Hero portrait parallax ≤ 24px.
Reduced motion: none of the above.
