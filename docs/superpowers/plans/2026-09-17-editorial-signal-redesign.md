# Editorial Signal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark-ops terminal portfolio with a warm, typography-led editorial site — portrait-first hero, sticky-stacking project panels, recruiter-readable copy — across every page.

**Architecture:** The zero-dependency static builder stays: `build.mjs` renders `src/content/*` through `src/render/*` into `site/`. This plan rewrites the CSS (split into focused files concatenated by the build), the page renderers inside `build.mjs`, `layout.mjs`, `main.js`, and the content copy; it deletes the boot/graph/pipeline layer (`ops.mjs`, `graph.js`). Stitch is used once, up front, to lock the look; the approved screens are references, not shipped code.

**Tech Stack:** Node 20 (build + `node --test`), vendored GSAP 3.15 + ScrollTrigger + Lenis (already in `src/vendor`), Python 3 with Pillow and fontTools (asset prep only; outputs are committed), Stitch MCP, chrome-devtools MCP for verification.

**Spec:** `docs/superpowers/specs/2026-09-17-editorial-signal-redesign-design.md`

## Global Constraints

- Tokens (light / dark): paper `#f4f1ea` / `#121110`; paper-2 `#ebe6dc` / `#1a1816`; ink `#16130f` / `#efeae0`; muted `#6b655c` / `#9d968a`; hairline `rgba(22,19,15,.12)` / `rgba(239,234,224,.14)`; signal `#ff4d1c` / `#ff6a40`. Only `signal` carries colour. No gradients, glass, scanlines or dot grids.
- Faces: Newsreader (display; upright 500 + italic 400), Geist (body/UI, 300–700 variable, already subset), **IBM Plex Mono** (numerals, footnotes, code — the spec's "Geist Mono" is corrected to the face already in the repo).
- Motion contract (unchanged): every "hidden until revealed" rule is gated behind `.motion` on `<html>`; `.js` is added whenever `main.js` runs. `prefers-reduced-motion` → no transforms, no smooth scroll, no curtain.
- Copy: every project gets `plain` ≤ 160 chars, one sentence, no jargon. `site.positioning` ≤ 20 words. Timeline bodies ≤ 40 words. No "cutting-edge", "passionate", "seamless". Evidence chains (`evidence` objects) are never edited.
- Output paths are unchanged: `/`, `/resume.html`, `/404.html`, `/work/<slug>.html`. `siteUrl` stays `https://berakhah.github.io`.
- Build stays zero-dependency: Python scripts run manually (`npm run portrait`, `npm run fonts`) and their outputs in `site/assets/` are committed.
- Every task ends with `npm test` green and a commit. Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## File map

| Path | Responsibility |
|---|---|
| `docs/DESIGN.md` | Stitch design system source; tokens, type, components (rewritten) |
| `src/content/person.mjs` | site copy, hero metrics (+ `plain`), principles, timeline, stack, about, experience (copy rewritten) |
| `src/content/projects/*.mjs` | five projects; each gains `plain`, status label sentence-cased |
| `src/og/portrait.py` | Pillow: `assets/linkedin.jpg` → `site/assets/img/bereket-{1200,600,192}.{webp,jpg}` |
| `src/og/fonts.py` | fontTools: instance + subset Newsreader upright 500 → `site/assets/fonts/newsreader-normal-500.woff2` |
| `src/og/render-og.mjs` | OG card template (rewritten: paper, serif, portrait) |
| `src/css/fonts.css` | @font-face (adds Newsreader upright 500) |
| `src/css/tokens.css` | `:root` tokens, dark-mode overrides, type scale |
| `src/css/base.css` | reset, shell (header/footer/nav), primitives (buttons, chips, links, drawer) |
| `src/css/home.css` | hero, proof strip, work panels, principles, path/stack, about, contact |
| `src/css/pages.css` | case study, résumé (+ print), 404 |
| `src/css/motion.css` | `.motion` reveals, curtain, sticky-stack, reduced-motion |
| `src/render/layout.mjs` | head/header/footer (rewritten) |
| `src/render/components.mjs` | keeps `esc md prose bullets icon flowStepper metricEl metricsRow prov evidenceScript evidenceDrawer repoChip substrateDiagram`; adds `portrait`, `bigMetric`; drops `badge`, `claimRules` |
| `src/render/ops.mjs`, `src/js/graph.js` | **deleted** |
| `src/js/main.js` | layer 0 (nav, drawer, anchors) + layer 1 (Lenis, reveals, curtain, sticky-stack, TOC) |
| `build.mjs` | CSS/JS assembly, `indexPage`, `casePage`, `resumePage`, `notFoundPage` (rewritten) |
| `tests/*.test.mjs` | `content.test.mjs` (new), `home`, `pages`, `css`, `build`, `components` rewritten; `ops.test.mjs` deleted |
| `site/assets/img/favicon.svg` | paper/ink/signal mark |

---

### Task 1: Design system + Stitch reference screens

**Files:**
- Modify: `docs/DESIGN.md` (replace whole file)

**Interfaces:**
- Produces: `docs/DESIGN.md` frontmatter with `stitch_project` and `stitch_design_system` ids; three Stitch screens the builder consults for spacing/hierarchy. Nothing else depends on this task at build time.

- [ ] **Step 1: Write the new DESIGN.md**

```markdown
---
name: Editorial Signal
stitch_project: (fill after Step 2)
stitch_design_system: (fill after Step 2)
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
```

- [ ] **Step 2: Create the Stitch project and design system**

Use the Stitch MCP tools (`stitch-design:generate-design` skill for prompt shaping):
1. `mcp__stitch__create_project` with name `Editorial Signal — Bereket Tilahun`.
2. `mcp__stitch__create_design_system_from_design_md` with the DESIGN.md body from Step 1.
3. `mcp__stitch__generate_screen_from_text` three times, applying the design system, with these prompts:
   - Home (desktop 1440): "Editorial portfolio homepage on warm paper #f4f1ea. Header: name in serif, nav Work · How I work · About · Contact, orange pill 'Email'. Hero two columns: left eyebrow 'Backend security engineer · Addis Ababa · remote-ready', huge Newsreader headline 'Systems that stay *trustworthy* when everything else changes.' with 'trustworthy' in orange italic, one-sentence positioning, buttons 'Email me' (orange pill) and 'Résumé' (outlined). Right: tall arched portrait of a man, warm. Below: four large mono numerals 742 · 1.00/1.00 · 82 s · 31,953 with short captions. Then section 'Five systems, built to be distrusted.' and one full-height project panel: '01', 'Agent Perimeter' in serif 72px, a plain sentence, a technical sentence, two metrics, six small chips, link 'Read the case study →'; right half a vertical six-node flow diagram in ink with an orange last dot. No gradients, no cards with shadows, hairline rules only."
   - Home (mobile 390): same content, stacked, portrait first at 60% width, sticky 'Email' pill bottom-right.
   - Case study (desktop): "Case study page, same system. Hero: '01' mono, 'Agent Perimeter' serif 96px, tagline serif italic, plain sentence, status line 'Running — public repo, Apache-2.0, clean-machine CI since Aug 2026', meta row role · stack · GitHub · licence. Below: sticky left table of contents in mono with the current item orange, and a 44rem reading column with headings Problem, Why the obvious approach fails, Architecture (with a mono code tree on paper-2), Threat model, Decisions as run-in serif headings, Evidence metrics, Caveats, prev/next footer."
4. Record the returned ids in the DESIGN.md frontmatter.

- [ ] **Step 3: Review the screens against the spec**

Open each with `mcp__stitch__get_screen`. If the hero headline is smaller than ~72px at 1440, the panel has card chrome (shadows/fills), or any colour other than signal appears, run `mcp__stitch__edit_screens` with the correction. Stop when the home hero and one work panel match §1–2 of the spec. Save the screenshots to `docs/superpowers/specs/stitch/` (`home-desktop.png`, `home-mobile.png`, `case.png`).

- [ ] **Step 4: Commit**

```bash
git add docs/DESIGN.md docs/superpowers/specs/stitch
git commit -m "design: Editorial Signal design system and Stitch reference screens"
```

---

### Task 2: Content — `plain` copy, rewritten positioning, about, timeline, status labels

**Files:**
- Modify: `src/content/person.mjs` (`site.positioning`, `site.title`, `heroMetrics[*].plain`, `timeline[*].body`, `about`, `nav`)
- Modify: `src/content/projects/agent-perimeter.mjs`, `ground-truth.mjs`, `ledger-sense.mjs`, `backoffice-kit.mjs`, `selector-drift.mjs` (add `plain`, sentence-case `status.label`)
- Create: `tests/content.test.mjs`

**Interfaces:**
- Produces: `project.plain: string` on every project; `heroMetrics[i].plain: string`; `project.status.label` is `"Running"` (code stays `"running"`). Consumed by Tasks 7, 8, 10.

- [ ] **Step 1: Write the failing content test**

`tests/content.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { site, heroMetrics, timeline, projects } from "../src/content/index.mjs";

const words = (s) => s.trim().split(/\s+/).length;
const FILLER = /\b(cutting-edge|passionate|seamless|actually|just)\b/i;

test("every project has a one-sentence plain summary ≤ 160 chars, no filler", () => {
  for (const p of projects) {
    assert.equal(typeof p.plain, "string", `${p.slug} missing plain`);
    assert.ok(p.plain.length <= 160, `${p.slug} plain is ${p.plain.length} chars`);
    assert.doesNotMatch(p.plain, FILLER);
    assert.equal((p.plain.match(/[.!?](\s|$)/g) || []).length, 1, `${p.slug} plain must be one sentence`);
  }
});

test("status labels are sentence case; codes unchanged", () => {
  for (const p of projects) {
    assert.equal(p.status.code, "running");
    assert.equal(p.status.label, "Running");
  }
});

test("positioning ≤ 20 words; every hero metric has a plain caption", () => {
  assert.ok(words(site.positioning) <= 20, `positioning is ${words(site.positioning)} words`);
  for (const m of heroMetrics) assert.ok(m.plain && m.plain.length <= 80, `${m.id} needs plain ≤ 80`);
});

test("timeline bodies ≤ 40 words", () => {
  for (const t of timeline) assert.ok(words(t.body) <= 40, `${t.mode}: ${words(t.body)} words`);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/content.test.mjs`
Expected: FAIL — `agent-perimeter missing plain`.

- [ ] **Step 3: Add `plain` and sentence-case labels to the five projects**

In each project file, directly under `tagline:` add `plain:`; change `label: "RUNNING"` → `label: "Running"`.

`agent-perimeter.mjs`:
```js
  plain: "Scans the tools an AI agent can reach and proves — not guesses — which ones an attacker could hijack.",
```
`ground-truth.mjs`:
```js
  plain: "A test bench that says how accurate a document-reading model really is, with error bars anyone can recompute.",
```
`ledger-sense.mjs`:
```js
  plain: "Reads construction invoices, checks the arithmetic, and only lets a human approve anything that moves money.",
```
`backoffice-kit.mjs`:
```js
  plain: "The shared foundation under the other four: every number carries where it came from and how sure it is.",
```
`selector-drift.mjs`:
```js
  plain: "Keeps data extraction from legacy business systems working when their screens change — and refuses to guess.",
```

- [ ] **Step 4: Rewrite `person.mjs` copy**

Replace `site.title` and `site.positioning`:
```js
  title: "Backend Security Engineer",
  positioning:
    "I build backend and security systems that stay trustworthy when the inputs, models and environments around them change.",
```

Add `plain` to each of the six `heroMetrics` entries, directly after `label:`:
```js
// m-tests-742
    plain: "automated tests guard the flagship scanner",
// m-pr-100
    plain: "precision and recall on every check class, rebuilt each commit",
// m-quickstart-82
    plain: "from a clean machine to a working install",
// m-census-31953
    plain: "MCP servers surveyed in one reproducible census",
// m-degraded-90
    plain: "of findings still fire with every AI model switched off",
// m-latency-195
    plain: "p95 latency after caching, in production",
```

Replace the five `timeline[*].body` values:
```js
// Operate
    body: "Triaged 10–12 Tier-1 incidents a day across Python, Java and C++ services; wrote the runbooks and automated health checks that cut recurring failures by 15%.",
// Build
    body: "Shipped 15+ production backends on FastAPI, Django REST and Spring Boot at sub-200 ms for 100+ concurrent users — including a multilingual code search with authorisation-before-query and tenant-scoped AES-256.",
// Harden
    body: "Hardened 47 API endpoints and closed 9 High/Critical CVEs with no recurrence; led a Zero Trust migration — 11 long-lived secrets replaced with short-lived OIDC tokens, incident reconstruction under 20 minutes.",
// Measure
    body: "Built the LLM evaluation pipeline and CI gate now guarding 11 production services — 40% less manual review, zero correctness regressions — and a benchmark curation pipeline that cut MTTD by 30%.",
// Design Systems
    body: "Agent Perimeter, Ground Truth, Ledger Sense, BackOffice Kit and Selector Drift — five systems that treat security, evidence and failure behaviour as first-class design inputs.",
```

Replace `about`:
```js
export const about = {
  lede:
    "I build systems that know what they are allowed to do, know when they are uncertain, and fail safely.",
  body: [
    "I’m a backend engineer in Addis Ababa. Over four years I’ve operated production services, built them, hardened them and measured them — and I’ve come to believe that correctness, security and evidence are design inputs, not things you add after.",
    "The five systems here are where that belief has ended up. Each one is designed to be checked: scope files before probing, sealed splits before leaderboards, a review queue before any money moves, provenance before publication. The case studies say exactly where each one stands, including what isn’t finished.",
  ],
  education: "B.Sc. Computer Science — HiLCoE School of Computer Science & Technology, Addis Ababa",
};
```

Replace `nav`:
```js
export const nav = [
  { label: "Work", href: "/#work" },
  { label: "How I work", href: "/#principles" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];
```

- [ ] **Step 5: Run the content test**

Run: `node --test tests/content.test.mjs`
Expected: PASS (4 tests). The old suite will still fail on `RUNNING` in `ops.test.mjs`/`home.test.mjs`; that is expected until Tasks 5–8.

- [ ] **Step 6: Commit**

```bash
git add src/content tests/content.test.mjs
git commit -m "content: plain summaries, recruiter-readable positioning, trimmed timeline and about"
```

---

### Task 3: Assets — portrait, Newsreader upright, favicon

**Files:**
- Create: `src/og/portrait.py`, `src/og/fonts.py`
- Modify: `src/css/fonts.css`, `package.json` (scripts), `site/assets/img/favicon.svg`
- Create (generated, committed): `site/assets/img/bereket-1200.webp|jpg`, `bereket-600.webp|jpg`, `bereket-192.webp|jpg`, `site/assets/fonts/newsreader-normal-500.woff2`

**Interfaces:**
- Produces: image paths above (consumed by the `portrait()` component in Task 4 and the OG card in Task 10); font file + `@font-face { font-family: 'Newsreader'; font-weight: 500 }` (consumed by Task 6 CSS).

- [ ] **Step 1: Write the portrait script**

`src/og/portrait.py`:
```python
"""assets/linkedin.jpg -> site/assets/img/bereket-{1200,600,192}.{webp,jpg}
Crops to 3:4 around the face (upper third), strips EXIF, writes sRGB.
Run: python src/og/portrait.py"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "linkedin.jpg"
OUT = ROOT / "site" / "assets" / "img"
SIZES = [1200, 600, 192]

im = ImageOps.exif_transpose(Image.open(SRC)).convert("RGB")
w, h = im.size
# 3:4 crop, anchored so the head sits in the upper 40% of the frame.
target_h = int(w * 4 / 3)
if target_h > h:
    target_w = int(h * 3 / 4)
    left = (w - target_w) // 2
    box = (left, 0, left + target_w, h)
else:
    top = max(0, int(h * 0.05))
    box = (0, top, w, min(h, top + target_h))
im = im.crop(box)

OUT.mkdir(parents=True, exist_ok=True)
for s in SIZES:
    r = im.resize((s, int(s * 4 / 3)), Image.LANCZOS)
    r.save(OUT / f"bereket-{s}.webp", "WEBP", quality=82, method=6)
    r.save(OUT / f"bereket-{s}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    print("wrote", f"bereket-{s}", r.size)
```

- [ ] **Step 2: Run it and inspect**

Run: `python src/og/portrait.py`
Expected: six files; `bereket-1200.webp` under 200 KB. Open `site/assets/img/bereket-600.jpg` with the Read tool and confirm the face is centred horizontally and sits in the upper half; if not, adjust the `0.05` top offset and re-run.

- [ ] **Step 3: Write the font script**

`src/og/fonts.py`:
```python
"""Restore the Newsreader upright variable face from git history, instance it
to wght 500 (opsz axis kept) and subset to Latin. Writes
site/assets/fonts/newsreader-normal-500.woff2. Run: python src/og/fonts.py"""
import subprocess, tempfile
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "site" / "assets" / "fonts" / "newsreader-normal-500.woff2"
BLOB = "44f0c6a^:site/assets/fonts/newsreader-normal-400-700.woff2"

with tempfile.TemporaryDirectory() as td:
    src = Path(td) / "nr.woff2"
    src.write_bytes(subprocess.check_output(["git", "show", BLOB], cwd=ROOT))
    f = TTFont(src)
    f = instancer.instantiateVariableFont(f, {"wght": 500})
    opts = subset.Options(flavor="woff2", layout_features=["kern", "liga", "onum", "pnum", "tnum"])
    opts.unicodes = subset.parse_unicodes("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
    s = subset.Subsetter(opts)
    s.populate(unicodes=opts.unicodes)
    s.subset(f)
    f.flavor = "woff2"
    f.save(OUT)
print("wrote", OUT, OUT.stat().st_size, "bytes")
```

- [ ] **Step 4: Run it**

Run: `python src/og/fonts.py`
Expected: `wrote ... newsreader-normal-500.woff2 <size> bytes`, size under 60 KB. If `git show` fails, the blob path is wrong — run `git log --all --diff-filter=D --name-only -- 'site/assets/fonts/newsreader-normal*'` and use `<that commit>^:<path>`.

- [ ] **Step 5: Update fonts.css and package.json**

Append to `src/css/fonts.css`:
```css
@font-face {
  font-family: 'Newsreader';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/assets/fonts/newsreader-normal-500.woff2') format('woff2');
}
```
`package.json` scripts:
```json
  "scripts": {
    "build": "node build.mjs",
    "test": "node --test --test-concurrency=1 tests/",
    "og": "node src/og/render-og.mjs",
    "portrait": "python src/og/portrait.py",
    "fonts": "python src/og/fonts.py"
  }
```

- [ ] **Step 6: Replace the favicon**

`site/assets/img/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="12" fill="#f4f1ea"/>
<text x="32" y="45" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="38" font-weight="500" fill="#16130f">B</text>
<circle cx="50" cy="16" r="5" fill="#ff4d1c"/>
</svg>
```

- [ ] **Step 7: Commit**

```bash
git add src/og/portrait.py src/og/fonts.py src/css/fonts.css package.json site/assets/img site/assets/fonts/newsreader-normal-500.woff2
git commit -m "assets: portrait renditions, Newsreader upright 500, paper favicon"
```

---

### Task 4: Layout shell — head, header, footer

**Files:**
- Modify: `src/render/layout.mjs` (replace whole file)
- Modify: `src/render/components.mjs` (append `portrait`)
- Modify: `build.mjs` (`page` helper, bundle list, hero canvas removal)
- Delete: `src/js/graph.js`
- Modify: `tests/build.test.mjs` (replace whole file)

**Interfaces:**
- Consumes: `esc`, `icon` from `components.mjs` (unchanged).
- Produces: `head({title, desc, path, siteUrl, jsonLd, css, preloadPortrait})`, `header(path, nav, site)`, `footer(site)`, `scripts(bundlePath)`; `portrait(size = 1200, cls = "", eager = false)`. `build.mjs` (Tasks 7–8) calls exactly these signatures.

- [ ] **Step 1: Rewrite the build test**

`tests/build.test.mjs`:
```js
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, "site", p), "utf8");
let home, cs;

before(() => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" });
  home = read("index.html");
  cs = read("work/agent-perimeter.html");
});

test("head declares light-first colour scheme with paper theme colour", () => {
  assert.match(home, /<meta name="theme-color" content="#f4f1ea">/);
  assert.match(home, /<meta name="color-scheme" content="light dark">/);
  assert.doesNotMatch(home, /name="view-transition"/);
});

test("one deferred, content-hashed bundle; no graph script; no third-party origins", () => {
  const tags = home.match(/<script src="[^"]+"[^>]*>/g) || [];
  assert.equal(tags.length, 1);
  const m = tags[0].match(/^<script src="(\/assets\/js\/app\.[0-9a-f]{10}\.js)" defer>$/);
  assert.ok(m, tags[0]);
  assert.doesNotMatch(home, /https:\/\/cdn/);
  const bundle = readFileSync(join(ROOT, "site", m[1]), "utf8");
  const order = ["gsap", "ScrollTrigger", "globalThis.Lenis=", 'classList.add("js")'];
  let last = -1;
  for (const s of order) { const i = bundle.indexOf(s); assert.ok(i > last, `missing or out of order: ${s}`); last = i; }
  assert.doesNotMatch(bundle, /getElementById\("graph"\)/);
  assert.doesNotMatch(home, /id="graph-data"|data-boot/);
});

test("CSS is inlined; display, body and mono faces are preloaded; home preloads the portrait", () => {
  for (const html of [home, cs]) {
    assert.doesNotMatch(html, /<link rel="stylesheet"/);
    assert.match(html, /<style>@font-face \{/);
    for (const f of ["geist-normal-300-700", "newsreader-normal-500", "plex-mono-normal-500"]) {
      assert.match(html, new RegExp(`<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`));
    }
  }
  assert.match(home, /<link rel="preload" as="image" href="\/assets\/img\/bereket-1200.webp" type="image\/webp"/);
  assert.doesNotMatch(cs, /rel="preload" as="image"/);
});

test("every page has the curtain before the header and the Email pill in the header", () => {
  for (const html of [home, cs, read("resume.html"), read("404.html")]) {
    const c = html.indexOf('<div class="curtain" aria-hidden="true"></div>');
    const h = html.indexOf('<header class="site-head">');
    assert.ok(c > -1 && c < h);
    assert.match(html, /<a class="btn btn-signal btn-sm head-cta" href="mailto:berekettilahun77@gmail.com">Email<\/a>/);
  }
});

test("head markup is emitted once", () => {
  assert.equal((home.match(/<meta charset="utf-8">/g) || []).length, 1);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/build.test.mjs`
Expected: FAIL on theme-color.

- [ ] **Step 3: Append `portrait` to components.mjs**

```js
// ---------------------------------------------------------------------------
// Portrait — responsive <picture>; renditions produced by src/og/portrait.py.
// ---------------------------------------------------------------------------
export const portrait = (size = 1200, cls = "", eager = false) => {
  const srcset = (ext) => size >= 600
    ? `/assets/img/bereket-600.${ext} 600w, /assets/img/bereket-1200.${ext} 1200w`
    : `/assets/img/bereket-192.${ext} 192w`;
  const sizes = size >= 600 ? "(max-width: 56em) 60vw, 40vw" : "96px";
  const base = size >= 600 ? 1200 : 192;
  return `<picture class="portrait ${cls}">
  <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
  <img src="/assets/img/bereket-${base}.jpg" srcset="${srcset("jpg")}" sizes="${sizes}" width="${size}" height="${Math.round(size * 4 / 3)}" alt="Bereket Tilahun, arms folded, in a black floral shirt" ${eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'}>
</picture>`;
};
```

- [ ] **Step 4: Rewrite layout.mjs**

```js
// Page shell: head (SEO/OG/JSON-LD), scripts, header, footer. Consumed by build.mjs.
import { esc, icon, portrait } from "./components.mjs";

export const scripts = (bundlePath) => `<script src="${bundlePath}" defer></script>`;

// Above-the-fold faces on every page: body, display serif, mono numerals.
const PRELOAD_FONTS = [
  "/assets/fonts/geist-normal-300-700.woff2",
  "/assets/fonts/newsreader-normal-500.woff2",
  "/assets/fonts/plex-mono-normal-500.woff2",
];

export const head = ({ title, desc, path = "/", siteUrl = "", jsonLd = null, ogType = "website", css = "", preloadPortrait = false }) => {
  const canon = siteUrl ? `\n<link rel="canonical" href="${esc(siteUrl + path)}">` : "";
  const ogUrl = siteUrl ? `\n<meta property="og:url" content="${esc(siteUrl + path)}">` : "";
  const ogImg = siteUrl ? `\n<meta property="og:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">\n<meta name="twitter:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">` : "";
  const img = preloadPortrait
    ? `\n<link rel="preload" as="image" href="/assets/img/bereket-1200.webp" type="image/webp" imagesrcset="/assets/img/bereket-600.webp 600w, /assets/img/bereket-1200.webp 1200w" imagesizes="(max-width: 56em) 60vw, 40vw">`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="Bereket Tilahun">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:site_name" content="Bereket Tilahun — Backend Security Engineer">${ogUrl}${ogImg}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="theme-color" content="#f4f1ea">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${PRELOAD_FONTS.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}${img}
<style>${css}</style>${canon}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>`;
};

export const header = (path, nav, site) => `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="/" aria-label="Bereket Tilahun — home">${esc(site.name)}</a>
    <nav class="site-nav" aria-label="Primary">
      ${nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("\n      ")}
      <a href="/resume.html">Résumé</a>
    </nav>
    <a class="btn btn-signal btn-sm head-cta" href="mailto:${esc(site.email)}">Email</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">${icon("menu")}</button>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <nav aria-label="Primary, mobile">
      ${nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("\n      ")}
      <a href="/resume.html">Résumé</a>
      <a href="${esc(site.github)}" rel="noopener" target="_blank">GitHub</a>
      <a href="${esc(site.linkedin)}" rel="noopener" target="_blank">LinkedIn</a>
    </nav>
  </div>
</header>`;

export const footer = (site) => `
<footer class="site-foot">
  <div class="wrap foot-row">
    <div class="foot-sign">
      ${portrait(192, "foot-portrait")}
      <div>
        <p class="foot-name serif">${esc(site.name)}</p>
        <p class="foot-meta">${esc(site.title)} · ${esc(site.location)}</p>
      </div>
    </div>
    <nav class="foot-links" aria-label="Footer">
      <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      <a href="${esc(site.github)}" rel="noopener" target="_blank">GitHub</a>
      <a href="${esc(site.linkedin)}" rel="noopener" target="_blank">LinkedIn</a>
      <a href="/resume.html">Résumé</a>
    </nav>
  </div>
  <div class="wrap foot-base mono">
    <span>© <span id="year">2026</span> ${esc(site.name)}</span>
    <span>Reviewed ${esc(site.reviewed)} · No trackers · Every figure carries its source</span>
  </div>
</footer>`;
```

- [ ] **Step 5: Point build.mjs at the new signatures (minimal; old pages keep rendering until Tasks 7–8)**

Replace the `page` helper:
```js
const page = ({ title, desc, path, bodyClass = "", main, jsonLd = null, preloadPortrait = false }) => `${head({
  title, desc, path, siteUrl: site.siteUrl, jsonLd, css: CSS, preloadPortrait,
})}
<body class="${bodyClass}">
<div class="curtain" aria-hidden="true"></div>
${header(path, nav, site)}
<main id="main">
${main}
</main>
${footer(site)}
${evidenceDrawer()}
${evidenceScript(evidenceIndex)}
${scripts(BUNDLE_PATH)}
</body>
</html>`;
```
In `indexPage()`'s final `return page({...})` add `preloadPortrait: true,`. Remove `src("js", "graph.js"),` from `BUNDLE_SRC`. Delete the `<canvas class="hero-graph" ...>` line and the `${graphScript(graphData(projects))}` line from the old hero.
```bash
git rm src/js/graph.js
```

- [ ] **Step 6: Run the build test**

Run: `node --test tests/build.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add src/render/layout.mjs src/render/components.mjs build.mjs tests/build.test.mjs
git commit -m "layout: paper head, serif brand header with Email pill, signed footer; drop the canvas graph"
```

---

### Task 5: Components — drop badge/claimRules, add bigMetric; delete ops layer

**Files:**
- Modify: `src/render/components.mjs`
- Delete: `src/render/ops.mjs`, `tests/ops.test.mjs`
- Modify: `tests/components.test.mjs` (replace whole file)
- Modify: `build.mjs` imports and the stubbed callers; `src/og/render-og.mjs` import

**Interfaces:**
- Produces: `bigMetric(m)` → `<div class="big-metric">` with a `data-evidence` button; `flowStepper(nodes, label, variant = "h")` — `"v"` sets `class="flow flow-v"`. Removes `badge`, `claimRules`, `STATUS_KIND`, `CLAIM_RULES`.

- [ ] **Step 1: Rewrite the components test**

`tests/components.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import * as C from "../src/render/components.mjs";

test("flowStepper: horizontal by default, vertical variant, drawable line kept", () => {
  const h = C.flowStepper(["A", "B <x>"], "demo");
  assert.match(h, /<ol class="flow" role="list" aria-label="demo">/);
  assert.match(h, /<line class="fl-h"/);
  assert.match(h, /B &lt;x&gt;/);
  const v = C.flowStepper(["A", "B"], "demo", "v");
  assert.match(v, /<ol class="flow flow-v"/);
});

test("bigMetric renders a mono numeral trigger and the plain caption", () => {
  const html = C.bigMetric({ id: "m-1", value: "742", label: "test functions", plain: "automated tests guard the scanner" });
  assert.match(html, /<button class="big-value prov-trigger mono" type="button" data-evidence="m-1"/);
  assert.match(html, />742</);
  assert.match(html, /<span class="big-plain">automated tests guard the scanner<\/span>/);
});

test("portrait emits webp + jpg renditions with explicit dimensions", () => {
  const p = C.portrait(1200, "hero-portrait", true);
  assert.match(p, /<picture class="portrait hero-portrait">/);
  assert.match(p, /bereket-1200\.webp 1200w/);
  assert.match(p, /width="1200" height="1600"/);
  assert.match(p, /fetchpriority="high"/);
  assert.match(C.portrait(192, "foot-portrait"), /loading="lazy"/);
});

test("badge and claimRules are gone", () => {
  assert.equal(C.badge, undefined);
  assert.equal(C.claimRules, undefined);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/components.test.mjs`
Expected: FAIL — `flow flow-v` not matched; `bigMetric` not a function.

- [ ] **Step 3: Edit components.mjs**

Delete the `STATUS_KIND` const and `badge` export, and the `CLAIM_RULES` const and `claimRules` export. Replace `flowStepper` with:
```js
export const flowStepper = (nodes, label, variant = "h") => `
<ol class="flow${variant === "v" ? " flow-v" : ""}" role="list" aria-label="${esc(label)}">
  <svg class="flow-line" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><line class="fl-h" x1="0" y1="50" x2="100" y2="50" pathLength="1"/><line class="fl-v" x1="50" y1="0" x2="50" y2="100" pathLength="1"/></svg>
  ${nodes
    .map(
      (n, i) => `<li class="flow-node" style="--i:${i}">
      <span class="flow-dot" aria-hidden="true"></span>
      <span class="flow-text"><span class="flow-label">${esc(n)}</span></span>
    </li>`
    )
    .join("")}
</ol>`;
```
Add after `metricsRow`:
```js
// Big metric — the home proof strip: mono numeral, plain-English caption.
export const bigMetric = (m) => `
<div class="big-metric">
  <button class="big-value prov-trigger mono" type="button" data-evidence="${esc(m.id)}" aria-haspopup="dialog" aria-label="${esc(`${m.value} ${m.label} — show evidence`)}">${esc(m.value)}</button>
  <span class="big-plain">${esc(m.plain || m.label)}</span>
</div>`;
```

- [ ] **Step 4: Delete the ops layer and fix the callers**

```bash
git rm src/render/ops.mjs tests/ops.test.mjs
```
In `build.mjs`: delete the `import { bootLines, bootBlock, graphData, graphScript } from "./src/render/ops.mjs";` line; change the components import to:
```js
import {
  esc, md, prose, bullets, icon, flowStepper, metricsRow, bigMetric, portrait,
  evidenceScript, evidenceDrawer, repoChip, substrateDiagram,
} from "./src/render/components.mjs";
```
Stub the old callers so the build runs until Tasks 7–8 replace them: replace every `${badge(p.status)}` with `<span class="status-line">${esc(p.status.label)}</span>`; delete `${STATUS_LEGEND}` and the `STATUS_LEGEND` const; delete `${claimRules()}`; replace `${bootBlock(bootLines({ site, projects, heroMetrics }))}` with nothing; in `notFoundPage` delete the `${bootBlock([...])}` block.

In `src/og/render-og.mjs`: delete `import { bootLines } from "../render/ops.mjs";` and replace the `const lines = ...` and `const boot = ...` statements with `const boot = "";` (Task 10 rewrites this file).

- [ ] **Step 5: Run the components test and the build**

Run: `node --test tests/components.test.mjs && node build.mjs`
Expected: 4 tests pass; build prints `built: ...`.

- [ ] **Step 6: Commit**

```bash
git add -A src/render build.mjs tests/components.test.mjs src/og/render-og.mjs
git commit -m "components: bigMetric, vertical flow variant; drop badge, claim rules and the ops layer"
```

---

### Task 6: CSS — the Editorial Signal stylesheet

**Files:**
- Create: `src/css/tokens.css`, `src/css/base.css`, `src/css/home.css`, `src/css/pages.css`, `src/css/motion.css`
- Delete: `src/css/style.css`
- Modify: `build.mjs` `CSS` const; `tests/css.test.mjs` (replace whole file)

**Interfaces:**
- Produces the class names used by Tasks 7–9: `.wrap .eyebrow .serif .mono .section .section-title .section-head .section-intro .btn .btn-signal .btn-ink .btn-sm .chip .chip-muted .text-link .rv .curtain .site-head .site-nav .head-cta .menu-btn .mobile-nav .site-foot .foot-* .portrait .hero .hero-grid .hero-copy .hero-h .hero-em .hero-lede .hero-ctas .hero-portrait .proof .big-metric .big-value .big-plain .section-work .work-head .panels .panel .panel-grid .panel-copy .panel-num .panel-name .panel-plain .panel-tech .panel-metrics .metric .metric-value .metric-label .panel-chips .panel-cta .panel-flow .flow .flow-v .principles .principle .principle-num .principle-title .principle-body .principle-src .path-grid .subblock-h .modes .mode .mode-range .mode-kind .mode-heading .mode-text .stack-runs .stack-run .stack-h .stack-items .about-grid .about-portrait .about-lede .about-p .about-edu .contact .contact-h .contact-links .contact-avail .cs-hero .cs-num .cs-title .cs-tagline .cs-plain .cs-status .dot .cs-meta .cs-tech .cs-layout .cs-toc .toc-h .toc-back .cs-body .cs-sec .cs-h .cs-caveat .code-block .code-label .decisions .decision .metrics-row .metric-context .status-block .repo-block .repo-note .substrate* .pager .pager-link .pager-prev .pager-next .pager-dir .pager-name .resume-hero .resume-ctas .resume-body .resume-role .resume-role-head .resume-title .resume-range .resume-org .resume-points .nf .nf-h .drawer-* .ev-*`.

- [ ] **Step 1: Rewrite the CSS test**

`tests/css.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src/css");
const files = ["tokens", "base", "home", "pages", "motion"];
const css = files.map((f) => readFileSync(join(DIR, `${f}.css`), "utf8")).join("\n");

const flat = css
  .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "")
  .replace(/@media[^{]*\{/g, "")
  .replace(/@view-transition[^{]*\{[^}]*\}/g, "");
const blocks = [];
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(flat))) blocks.push({ sel: m[1].trim(), decl: m[2] });

const HIDING = /(^|;)\s*(opacity\s*:\s*0(?![.\d])|opacity\s*:\s*0?\.[0-6](?!\d)|visibility\s*:\s*hidden|clip-path\s*:\s*inset\([^)]*100%)|transform\s*:[^;]*scale[XY]?\(0\)/;
const ALLOW = /\.drawer-root(?!\.open)|\.drawer-backdrop|\.mobile-nav\[hidden\]|\.curtain|\.skip-link|\.portrait::after/;

test("every hiding rule is gated behind .motion", () => {
  const offenders = blocks
    .filter((b) => HIDING.test(b.decl))
    .filter((b) => !b.sel.split(",").every((s) => /\.motion\b/.test(s)))
    .filter((b) => !ALLOW.test(b.sel));
  assert.deepEqual(offenders.map((b) => b.sel), []);
});

test("uses the paper tokens in light and dark, and no dark-ops colours remain", () => {
  for (const t of ["#f4f1ea", "#ebe6dc", "#16130f", "#6b655c", "#ff4d1c", "#121110", "#1a1816", "#efeae0", "#9d968a", "#ff6a40"]) {
    assert.ok(css.includes(t), `missing token ${t}`);
  }
  for (const t of ["#0a0b0d", "#5cf28a", "#181b21", "#7cc4ff"]) assert.ok(!css.includes(t), `stale token ${t}`);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter/);
});

test("dark mode is a prefers-color-scheme override of :root tokens", () => {
  assert.match(css, /@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{/);
});

test("reduced motion disables animations, smooth scroll and the curtain", () => {
  const rm = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(rm, /animation:\s*none/);
  assert.match(rm, /scroll-behavior:\s*auto/);
  assert.match(rm, /\.curtain\s*\{\s*display:\s*none/);
});

test("résumé has print rules that strip the shell", () => {
  const pr = css.slice(css.indexOf("@media print"));
  assert.match(pr, /\.site-head[^{]*\{[^}]*display:\s*none/);
  assert.match(pr, /\.site-foot[^{]*\{[^}]*display:\s*none/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/css.test.mjs`
Expected: FAIL — `ENOENT ... tokens.css`.

- [ ] **Step 3: Write tokens.css**

```css
/* Editorial Signal — tokens. Light is the design; dark honours the OS. */
:root {
  --paper: #f4f1ea;
  --paper-2: #ebe6dc;
  --ink: #16130f;
  --muted: #6b655c;
  --hair: rgba(22, 19, 15, .12);
  --hair-2: rgba(22, 19, 15, .28);
  --signal: #ff4d1c;
  --signal-ink: #f4f1ea;      /* text on signal */

  --serif: "Newsreader", "Iowan Old Style", Georgia, serif;
  --sans: "Geist", "Segoe UI", system-ui, -apple-system, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "Cascadia Mono", "Courier New", monospace;

  --fs--1: .8125rem;
  --fs-0: 1.0625rem;
  --fs-1: 1.1875rem;
  --fs-2: 1.5rem;
  --fs-3: clamp(1.75rem, 1.4rem + 1.2vw, 2.25rem);
  --fs-title: clamp(2.2rem, 1.6rem + 2.4vw, 4rem);
  --fs-panel: clamp(2.6rem, 2rem + 3vw, 5rem);
  --fs-hero: clamp(3rem, 2rem + 6vw, 7.5rem);
  --fs-num: clamp(2.5rem, 2rem + 2vw, 3.5rem);

  --wrap: 80rem;
  --gutter: clamp(1rem, 5vw, 4rem);
  --sect: clamp(5rem, 12vw, 11rem);
  --head-h: 4.5rem;
  --radius: 999px;

  --ease: cubic-bezier(.2, .7, .2, 1);
  --t-fast: 160ms;
  --t-med: 320ms;
  --t-slow: 600ms;
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #121110;
    --paper-2: #1a1816;
    --ink: #efeae0;
    --muted: #9d968a;
    --hair: rgba(239, 234, 224, .14);
    --hair-2: rgba(239, 234, 224, .3);
    --signal: #ff6a40;
    --signal-ink: #121110;
  }
}
```

- [ ] **Step 4: Write base.css**

```css
/* ------------------------------------------------------------------ reset */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--paper); }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: var(--fs-0);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
img, svg, picture { display: block; max-width: 100%; }
h1, h2, h3, h4, p, dl, dd, figure, pre { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
code, pre { font-family: var(--mono); font-size: .92em; }
::selection { background: var(--ink); color: var(--paper); }
:focus-visible { outline: 2px solid var(--signal); outline-offset: 3px; }

/* ------------------------------------------------------------- primitives */
.wrap { width: min(100% - 2 * var(--gutter), var(--wrap)); margin-inline: auto; }
.serif { font-family: var(--serif); font-weight: 500; letter-spacing: -.02em; font-optical-sizing: auto; }
.mono { font-family: var(--mono); font-weight: 500; font-variant-numeric: tabular-nums; }
.eyebrow { font-size: var(--fs--1); font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.section { padding-block: var(--sect); }
.section + .section { border-top: 1px solid var(--hair); }
.section-title { font-family: var(--serif); font-weight: 500; font-size: var(--fs-title); line-height: 1; letter-spacing: -.02em; max-width: 18ch; }
.section-head { display: grid; gap: 1rem; margin-bottom: clamp(2.5rem, 6vw, 4.5rem); }
.section-intro { color: var(--muted); font-size: var(--fs-1); max-width: 52ch; }
.text-link { text-decoration: underline; text-underline-offset: .2em; text-decoration-color: var(--hair-2); transition: text-decoration-color var(--t-fast); }
.text-link:hover { text-decoration-color: var(--signal); }
p a:not(.btn) { text-decoration: underline; text-underline-offset: .2em; text-decoration-color: var(--hair-2); }
p a:not(.btn):hover { text-decoration-color: var(--signal); }
strong { font-weight: 600; }

.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  height: 3rem; padding-inline: 1.5rem; border-radius: var(--radius);
  font-weight: 500; border: 1px solid var(--ink); white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast), transform var(--t-fast);
}
.btn:hover { transform: translateY(-1px); }
.btn-signal { background: var(--signal); border-color: var(--signal); color: var(--signal-ink); }
.btn-signal:hover { background: var(--ink); border-color: var(--ink); color: var(--paper); }
.btn-ink { background: transparent; color: var(--ink); }
.btn-ink:hover { background: var(--ink); color: var(--paper); }
.btn-sm { height: 2.5rem; padding-inline: 1.1rem; font-size: var(--fs--1); }
.icon { width: 1.1em; height: 1.1em; }
.icon-xs { width: .85em; height: .85em; }

.chip { display: inline-flex; align-items: center; gap: .4rem; padding: .3rem .7rem; border: 1px solid var(--hair); border-radius: var(--radius); background: var(--paper-2); font-family: var(--mono); font-size: .75rem; font-weight: 500; color: var(--ink); }
.chip-link:hover { border-color: var(--ink); }
.chip-muted { color: var(--muted); }

.bullets { display: grid; gap: .8rem; padding-left: 1.2rem; list-style: disc; }
.bullets li::marker { color: var(--signal); }
.tnum { font-variant-numeric: tabular-nums; }

.prov-trigger { text-decoration: underline dotted var(--hair-2); text-underline-offset: .22em; cursor: help; transition: text-decoration-color var(--t-fast); }
.prov-trigger:hover { text-decoration-color: var(--signal); }
.prov-inline { font-family: var(--mono); font-weight: 500; }

/* ------------------------------------------------------------------ shell */
.skip-link { position: absolute; left: 1rem; top: -4rem; z-index: 100; padding: .6rem 1rem; background: var(--ink); color: var(--paper); border-radius: var(--radius); }
.skip-link:focus { top: 1rem; }
.site-head { position: sticky; top: 0; z-index: 40; background: color-mix(in srgb, var(--paper) 92%, transparent); border-bottom: 1px solid transparent; transition: border-color var(--t-med); }
.site-head.scrolled { border-bottom-color: var(--hair); }
.head-row { display: flex; align-items: center; gap: 2rem; height: var(--head-h); }
.brand { font-family: var(--serif); font-weight: 500; font-size: 1.35rem; letter-spacing: -.01em; margin-right: auto; }
.site-nav { display: flex; gap: 1.75rem; font-size: var(--fs--1); font-weight: 500; letter-spacing: .02em; }
.site-nav a { padding-block: .3rem; border-bottom: 1px solid transparent; transition: border-color var(--t-fast); }
.site-nav a:hover, .site-nav a.current { border-bottom-color: var(--signal); }
.menu-btn { display: none; width: 2.75rem; height: 2.75rem; border: 1px solid var(--hair); border-radius: var(--radius); place-items: center; }
.mobile-nav { border-top: 1px solid var(--hair); background: var(--paper); }
.mobile-nav nav { display: grid; padding: 1rem var(--gutter) 1.5rem; }
.mobile-nav a { padding: .8rem 0; font-family: var(--serif); font-size: 1.6rem; border-bottom: 1px solid var(--hair); }
@media (max-width: 56em) {
  .site-nav { display: none; }
  .menu-btn { display: grid; }
  .head-cta { position: fixed; right: 1rem; bottom: 1rem; z-index: 45; box-shadow: 0 0 0 4px var(--paper); }
}

.site-foot { border-top: 1px solid var(--ink); padding-block: 3.5rem 2rem; }
.foot-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; }
.foot-sign { display: flex; align-items: center; gap: 1.25rem; }
.foot-portrait { width: 4.5rem; aspect-ratio: 1; border-radius: 50%; }
.foot-name { font-size: 1.5rem; }
.foot-meta { color: var(--muted); font-size: var(--fs--1); }
.foot-links { display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: var(--fs--1); font-weight: 500; }
.foot-links a { border-bottom: 1px solid var(--hair-2); }
.foot-links a:hover { border-bottom-color: var(--signal); }
.foot-base { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--hair); font-size: .75rem; color: var(--muted); }

/* --------------------------------------------------------------- portrait */
.portrait { position: relative; overflow: hidden; border-radius: 999px 999px 24px 24px; background: var(--paper-2); }
.portrait img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 15%; }
.portrait::after { content: ""; position: absolute; inset: 0; background: var(--paper); mix-blend-mode: multiply; opacity: .08; pointer-events: none; }
.foot-portrait, .about-portrait { border-radius: 50%; }

/* --------------------------------------------------------- evidence sheet */
.drawer-root { position: fixed; inset: 0; z-index: 60; visibility: hidden; }
.drawer-root.open { visibility: visible; }
.drawer-backdrop { position: absolute; inset: 0; background: rgba(22, 19, 15, .35); opacity: 0; transition: opacity var(--t-med); }
.drawer-root.open .drawer-backdrop { opacity: 1; }
.drawer { position: absolute; top: 0; right: 0; height: 100%; width: min(28rem, 100%); background: var(--paper); border-left: 1px solid var(--ink); display: flex; flex-direction: column; transform: translateX(100%); transition: transform var(--t-slow) var(--ease); }
.drawer-root.open .drawer { transform: none; }
.drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--hair); }
.drawer-eyebrow { font-size: var(--fs--1); letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.drawer-close { width: 2.5rem; height: 2.5rem; border: 1px solid var(--hair); border-radius: 50%; display: grid; place-items: center; }
.drawer-close:hover { border-color: var(--ink); }
.drawer-body { padding: 1.5rem; overflow: auto; flex: 1; }
.ev-claim { font-family: var(--serif); font-size: 1.5rem; line-height: 1.2; letter-spacing: -.01em; margin-bottom: 1.5rem; }
.ev-chain { display: grid; gap: 1rem; }
.ev-row { display: grid; grid-template-columns: 6rem 1fr; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--hair); font-size: var(--fs--1); }
.ev-key { font-family: var(--mono); color: var(--muted); }
.ev-method { font-family: var(--mono); }
.ev-caveats { margin-top: 1.5rem; padding: 1rem; background: var(--paper-2); border-radius: 12px; font-size: var(--fs--1); }
.ev-caveats-h { font-family: var(--mono); font-size: .75rem; color: var(--muted); margin-bottom: .5rem; }
.ev-caveats ul { display: grid; gap: .4rem; padding-left: 1rem; list-style: disc; }
.drawer-foot { padding: 1rem 1.5rem; border-top: 1px solid var(--hair); font-size: .75rem; color: var(--muted); }
html.drawer-open { overflow: hidden; }
```

- [ ] **Step 5: Write home.css**

```css
/* -------------------------------------------------------------------- hero */
.hero { padding-block: clamp(2rem, 6vw, 5rem) var(--sect); }
.hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: clamp(2rem, 6vw, 6rem); align-items: center; }
.hero-copy { display: grid; gap: 1.75rem; }
.hero-h { font-family: var(--serif); font-weight: 500; font-size: var(--fs-hero); line-height: .95; letter-spacing: -.025em; text-wrap: balance; font-optical-sizing: auto; }
.hero-em { font-style: italic; font-weight: 400; color: var(--signal); }
.hero-lede { font-size: var(--fs-1); color: var(--muted); max-width: 44ch; }
.hero-ctas { display: flex; gap: .75rem; flex-wrap: wrap; }
.hero-portrait { width: 100%; max-width: 34rem; justify-self: end; aspect-ratio: 3 / 4; }
@media (max-width: 56em) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-portrait { order: -1; width: 60vw; max-width: 20rem; justify-self: start; }
}

/* ------------------------------------------------------------- proof strip */
.proof { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-top: var(--sect); padding-top: 2.5rem; border-top: 1px solid var(--ink); }
.big-metric { display: grid; gap: .5rem; align-content: start; }
.big-value { font-size: var(--fs-num); line-height: 1; letter-spacing: -.02em; text-align: left; justify-self: start; }
.big-plain { font-size: var(--fs--1); color: var(--muted); max-width: 22ch; }
@media (max-width: 56em) { .proof { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } }

/* -------------------------------------------------------------------- work */
.section-work { padding-bottom: 0; }
.work-head { padding-bottom: clamp(2rem, 5vw, 4rem); }
.panels { position: relative; }
.panel {
  position: sticky; top: 0;
  min-height: 100vh; min-height: 100svh;
  display: grid; align-content: center;
  background: var(--paper);
  border-top: 1px solid var(--ink);
  padding-block: clamp(3rem, 8vh, 6rem);
  transform-origin: 50% 0;
  will-change: transform, opacity;
}
.panel-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: clamp(2rem, 6vw, 6rem); align-items: center; }
.panel-copy { display: grid; gap: 1.5rem; }
.panel-num { font-size: var(--fs--1); color: var(--muted); letter-spacing: .12em; }
.panel-name { font-family: var(--serif); font-weight: 500; font-size: var(--fs-panel); line-height: .98; letter-spacing: -.025em; }
.panel-name a { transition: color var(--t-fast); }
.panel-name a:hover { color: var(--signal); }
.panel-plain { font-size: var(--fs-2); line-height: 1.3; letter-spacing: -.01em; max-width: 30ch; }
.panel-tech { color: var(--muted); max-width: 52ch; }
.panel-metrics { display: flex; gap: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--hair); }
.panel-metrics .metric { display: grid; gap: .25rem; }
.panel-metrics .metric-value { font-family: var(--mono); font-weight: 500; font-size: var(--fs-3); line-height: 1; text-align: left; justify-self: start; }
.panel-metrics .metric-label { font-size: var(--fs--1); color: var(--muted); }
.panel-chips { display: flex; gap: .5rem; flex-wrap: wrap; }
.panel-cta { font-weight: 500; border-bottom: 1px solid var(--ink); justify-self: start; padding-bottom: .15rem; display: inline-flex; gap: .4rem; align-items: center; }
.panel-cta:hover { border-bottom-color: var(--signal); color: var(--signal); }
.panel-flow { justify-self: end; width: 100%; max-width: 26rem; }
@media (max-width: 56em) {
  .panel-grid { grid-template-columns: 1fr; }
  .panel-flow { max-width: none; justify-self: stretch; }
  .panel-metrics { gap: 1.5rem; }
}

/* flow stepper — vertical (home panels) and horizontal (case study) */
.flow { position: relative; display: grid; gap: 1.25rem; }
.flow-v { padding-left: 1.75rem; }
.flow-line { position: absolute; stroke: var(--ink); stroke-width: 1; }
.flow-v .flow-line { left: .35rem; top: .5rem; width: 2px; height: calc(100% - 1rem); }
.flow-v .fl-h { display: none; }
.flow:not(.flow-v) { grid-auto-flow: column; grid-auto-columns: 1fr; padding-top: 1.5rem; }
.flow:not(.flow-v) .flow-line { top: .35rem; left: 0; height: 2px; width: 100%; }
.flow:not(.flow-v) .fl-v { display: none; }
.flow-node { position: relative; display: flex; gap: .9rem; align-items: baseline; }
.flow-dot { flex: none; width: .75rem; height: .75rem; border-radius: 50%; background: var(--ink); }
.flow-v .flow-dot { position: absolute; left: -1.75rem; top: .35rem; }
.flow:not(.flow-v) .flow-dot { position: absolute; top: -1.5rem; left: 0; }
.flow-node:last-child .flow-dot { background: var(--signal); }
.flow-label { font-family: var(--serif); font-size: var(--fs-2); line-height: 1.1; letter-spacing: -.01em; }
.flow:not(.flow-v) .flow-label { font-size: var(--fs-0); font-family: var(--sans); }
@media (max-width: 56em) {
  .flow:not(.flow-v) { grid-auto-flow: row; padding-top: 0; padding-left: 1.75rem; }
  .flow:not(.flow-v) .flow-line { top: .5rem; left: .35rem; width: 2px; height: calc(100% - 1rem); }
  .flow:not(.flow-v) .fl-h { display: none; }
  .flow:not(.flow-v) .fl-v { display: block; }
  .flow:not(.flow-v) .flow-dot { top: .35rem; left: -1.75rem; }
}

/* -------------------------------------------------------------- principles */
.principles { display: grid; }
.principle { display: grid; grid-template-columns: 5rem 1fr; gap: 1.5rem; padding-block: 2rem; border-top: 1px solid var(--hair); }
.principle:last-child { border-bottom: 1px solid var(--hair); }
.principle-num { font-size: var(--fs--1); color: var(--muted); padding-top: .6rem; }
.principle-title { font-family: var(--serif); font-weight: 500; font-size: var(--fs-3); line-height: 1.1; letter-spacing: -.02em; margin-bottom: .75rem; }
.principle-body { max-width: 62ch; }
.principle-src { margin-top: .75rem; font-size: .75rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
@media (max-width: 40em) { .principle { grid-template-columns: 1fr; gap: .5rem; } }

/* ------------------------------------------------------------- path + stack */
.path-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2rem, 6vw, 6rem); }
.subblock-h { font-family: var(--serif); font-weight: 500; font-size: var(--fs-3); letter-spacing: -.02em; margin-bottom: 1.5rem; }
.modes { display: grid; }
.mode { display: grid; grid-template-columns: 7rem 1fr; gap: 1rem; padding-block: 1rem; border-top: 1px solid var(--hair); }
.mode-range { font-size: .75rem; color: var(--muted); padding-top: .25rem; }
.mode-kind { font-family: var(--serif); font-size: var(--fs-1); }
.mode-heading { font-size: var(--fs--1); color: var(--muted); margin-block: .15rem .5rem; }
.mode-text { font-size: var(--fs--1); }
.stack-runs { display: grid; gap: 1.25rem; }
.stack-run { padding-top: 1rem; border-top: 1px solid var(--hair); }
.stack-h { font-size: .75rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-bottom: .4rem; }
.stack-items { font-size: var(--fs--1); line-height: 1.7; }
@media (max-width: 56em) { .path-grid { grid-template-columns: 1fr; } }

/* ------------------------------------------------------------------- about */
.about-grid { display: grid; grid-template-columns: 6rem 1fr; gap: 2rem; align-items: start; }
.about-portrait { width: 6rem; aspect-ratio: 1; }
.about-lede { font-family: var(--serif); font-weight: 500; font-size: var(--fs-3); line-height: 1.15; letter-spacing: -.02em; max-width: 26ch; margin-bottom: 1.5rem; }
.about-p { max-width: 62ch; margin-bottom: 1rem; }
.about-edu { font-size: var(--fs--1); color: var(--muted); margin-top: 1.5rem; }
@media (max-width: 40em) { .about-grid { grid-template-columns: 1fr; } }

/* ----------------------------------------------------------------- contact */
.contact-h { font-family: var(--serif); font-weight: 500; font-size: var(--fs-hero); line-height: .95; letter-spacing: -.03em; margin-bottom: 2.5rem; }
.contact-links { display: grid; border-top: 1px solid var(--ink); max-width: 44rem; }
.contact-links a { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: 1.1rem 0; border-bottom: 1px solid var(--hair); font-size: var(--fs-1); }
.contact-links a:hover { color: var(--signal); }
.contact-links .mono { font-size: .75rem; color: var(--muted); }
.contact-avail { margin-top: 2rem; color: var(--muted); max-width: 52ch; }
```

- [ ] **Step 6: Write pages.css**

```css
/* -------------------------------------------------------------- case study */
.cs-hero { padding-block: clamp(2rem, 6vw, 5rem) clamp(3rem, 6vw, 5rem); border-bottom: 1px solid var(--ink); }
.cs-hero .wrap { display: grid; gap: 1.5rem; }
.cs-num { font-size: var(--fs--1); color: var(--muted); letter-spacing: .12em; }
.cs-title { font-family: var(--serif); font-weight: 500; font-size: var(--fs-hero); line-height: .95; letter-spacing: -.03em; max-width: 14ch; }
.cs-tagline { font-family: var(--serif); font-style: italic; font-weight: 400; font-size: var(--fs-3); line-height: 1.15; color: var(--muted); max-width: 30ch; }
.cs-plain { font-size: var(--fs-2); line-height: 1.3; max-width: 34ch; }
.cs-status { display: flex; gap: .6rem; align-items: baseline; font-size: var(--fs--1); max-width: 62ch; }
.cs-status .dot { flex: none; width: .55rem; height: .55rem; border-radius: 50%; background: var(--signal); transform: translateY(-.05rem); }
.cs-meta { display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: var(--fs--1); color: var(--muted); padding-top: 1.25rem; border-top: 1px solid var(--hair); }
.cs-meta strong { color: var(--ink); font-weight: 500; }
.cs-tech { display: flex; gap: .5rem; flex-wrap: wrap; }

.cs-layout { display: grid; grid-template-columns: 14rem 1fr; gap: clamp(2rem, 6vw, 6rem); padding-block: var(--sect); }
.cs-toc { position: sticky; top: calc(var(--head-h) + 1rem); align-self: start; display: grid; gap: .3rem; font-family: var(--mono); font-size: .75rem; }
.toc-h { color: var(--muted); letter-spacing: .12em; text-transform: uppercase; margin-bottom: .75rem; }
.cs-toc a { display: block; padding: .3rem 0 .3rem .75rem; color: var(--muted); border-left: 1px solid var(--hair); transition: color var(--t-fast), border-color var(--t-fast); }
.cs-toc a:hover { color: var(--ink); }
.cs-toc a.current { color: var(--signal); border-left-color: var(--signal); }
.toc-back { margin-top: 1.5rem; }
.cs-body { max-width: 44rem; display: grid; gap: clamp(3rem, 7vw, 5.5rem); }
.cs-sec { display: grid; gap: 1.25rem; }
.cs-h { font-family: var(--serif); font-weight: 500; font-size: var(--fs-title); line-height: 1; letter-spacing: -.02em; }
.cs-sec p { max-width: 62ch; }
.cs-caveat { font-size: var(--fs-1); }
.code-block { background: var(--paper-2); border-radius: 12px; padding: 1.25rem 1.5rem; overflow: auto; }
.code-label { display: block; font-size: .7rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-bottom: .75rem; }
.code-block pre { font-size: .8rem; line-height: 1.55; }
.decisions { display: grid; gap: 1.5rem; }
.decision { padding-top: 1.25rem; border-top: 1px solid var(--hair); }
.decision dt { font-family: var(--serif); font-weight: 500; font-size: var(--fs-2); letter-spacing: -.01em; margin-bottom: .5rem; }
.metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1.5rem; padding: 1.5rem 0; border-block: 1px solid var(--hair); }
.metric { display: grid; gap: .3rem; }
.metric-value { font-family: var(--mono); font-weight: 500; font-size: var(--fs-3); line-height: 1; text-align: left; justify-self: start; }
.metric-label { font-size: var(--fs--1); }
.metric-context { font-size: .8rem; color: var(--muted); }
.status-block { display: grid; gap: .5rem; padding: 1.25rem 1.5rem; background: var(--paper-2); border-radius: 12px; }
.repo-block { display: flex; gap: .75rem; flex-wrap: wrap; }
.repo-note { color: var(--muted); }

.substrate { display: grid; gap: 1rem; }
.substrate-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: .75rem; }
.substrate-app, .substrate-core { border: 1px solid var(--ink); border-radius: 12px; padding: 1rem; }
.substrate-app em, .substrate-cell em { display: block; font-style: normal; font-size: .8rem; color: var(--muted); margin-top: .25rem; }
.substrate-links { display: grid; grid-template-columns: repeat(3, 1fr); height: 1.5rem; }
.substrate-links span { width: 1px; background: var(--ink); justify-self: center; }
.substrate-core-head { display: flex; gap: .75rem; align-items: baseline; margin-bottom: .75rem; }
.substrate-core-sub { font-size: .8rem; color: var(--muted); }
.substrate-cells { display: grid; grid-template-columns: repeat(2, 1fr); gap: .5rem; }
.substrate-cell { background: var(--paper-2); border-radius: 8px; padding: .75rem; }

.pager { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--ink); }
.pager-link { display: grid; gap: .5rem; padding: 2.5rem 0; }
.pager-next { text-align: right; border-left: 1px solid var(--hair); padding-left: 2rem; }
.pager-dir { font-size: .75rem; color: var(--muted); letter-spacing: .12em; }
.pager-name { font-family: var(--serif); font-weight: 500; font-size: var(--fs-3); letter-spacing: -.02em; }
.pager-link:hover .pager-name { color: var(--signal); }
@media (max-width: 56em) {
  .cs-layout { grid-template-columns: 1fr; }
  .cs-toc { position: static; }
  .substrate-top { grid-template-columns: 1fr; }
  .substrate-links { display: none; }
}

/* ------------------------------------------------------------------ résumé */
.resume-hero { padding-block: clamp(2rem, 6vw, 5rem) 2rem; }
.resume-hero .wrap { display: grid; gap: 1.25rem; }
.resume-ctas { display: flex; gap: .75rem; flex-wrap: wrap; }
.resume-body { max-width: 48rem; display: grid; gap: 3rem; padding-block: 2rem var(--sect); }
.resume-role { padding-top: 1.5rem; border-top: 1px solid var(--ink); display: grid; gap: .75rem; }
.resume-role-head { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; flex-wrap: wrap; }
.resume-title { font-family: var(--serif); font-weight: 500; font-size: var(--fs-3); letter-spacing: -.02em; }
.resume-range { font-size: .75rem; color: var(--muted); }
.resume-org { font-size: var(--fs--1); color: var(--muted); }
.resume-points { font-size: var(--fs--1); }
@media print {
  .site-head, .site-foot, .curtain, .drawer-root, .resume-ctas, .menu-btn { display: none !important; }
  html, body { background: #fff; color: #000; }
  .resume-body { max-width: none; gap: 1.5rem; }
  .resume-role { break-inside: avoid; }
  a { color: inherit; }
}

/* --------------------------------------------------------------------- 404 */
.nf { min-height: 60vh; display: grid; align-content: center; gap: 1rem; }
.nf-h { font-family: var(--serif); font-weight: 500; font-size: var(--fs-hero); letter-spacing: -.03em; line-height: .95; }
```

- [ ] **Step 7: Write motion.css**

```css
/* Every hidden-until-revealed state lives under .motion (set by main.js
   only when GSAP loaded and reduced motion is off). Without it the site is
   fully visible and static. */
.curtain { position: fixed; inset: 0; z-index: 90; background: var(--paper); pointer-events: none; transform: scaleY(0); transform-origin: 50% 0; }
.motion .curtain.in { transform: scaleY(1); transform-origin: 50% 100%; transition: transform 420ms var(--ease); }
.motion .curtain.out { transform: scaleY(0); transform-origin: 50% 0; transition: transform 420ms var(--ease); }

.motion .rv { opacity: 0; transform: translateY(24px); transition: opacity var(--t-slow) var(--ease), transform var(--t-slow) var(--ease); transition-delay: var(--d, 0ms); }
.motion .rv.in-view { opacity: 1; transform: none; }

.motion .flow-line line { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.2s var(--ease); }
.motion .in-view .flow-line line, .motion .flow.drawn .flow-line line { stroke-dashoffset: 0; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  html { scroll-behavior: auto; }
  .curtain { display: none; }
}
```

- [ ] **Step 8: Wire the build and delete style.css**

In `build.mjs`:
```js
const CSS = ["fonts", "tokens", "base", "home", "pages", "motion"].map((f) => src("css", `${f}.css`)).join("\n");
```
```bash
git rm src/css/style.css
```

- [ ] **Step 9: Run the CSS test and the build**

Run: `node --test tests/css.test.mjs && node build.mjs`
Expected: 5 tests pass; build succeeds.

- [ ] **Step 10: Commit**

```bash
git add src/css build.mjs tests/css.test.mjs
git commit -m "css: Editorial Signal stylesheet — paper tokens, serif display, sticky panels, print résumé"
```

---

### Task 7: Homepage renderer

**Files:**
- Modify: `build.mjs` — replace `sectionHead`; delete `PIPELINE`, `pipelineScene`, `projectCard`; replace `indexPage`
- Modify: `tests/home.test.mjs` (replace whole file)

**Interfaces:**
- Consumes: `bigMetric`, `portrait`, `flowStepper(nodes, label, "v")`, `md`, `esc`, `icon`, `prose` from components; `heroMetrics[*].plain`, `project.plain` from content.
- Produces: `site/index.html` with the structure the test asserts.

- [ ] **Step 1: Rewrite the home test**

`tests/home.test.mjs`:
```js
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let home;
before(() => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" });
  home = readFileSync(join(ROOT, "site", "index.html"), "utf8");
});

test("hero: serif headline with one signal emphasis, portrait, two CTAs", () => {
  assert.match(home, /<h1 class="hero-h rv" id="hero-h">Systems that stay <em class="hero-em">trustworthy<\/em> when everything else changes\.<\/h1>/);
  assert.match(home, /<picture class="portrait hero-portrait">/);
  assert.match(home, /fetchpriority="high"/);
  assert.match(home, /<a class="btn btn-signal" href="mailto:berekettilahun77@gmail.com">Email me/);
  assert.match(home, /<a class="btn btn-ink" href="\/resume.html">Résumé/);
  assert.doesNotMatch(home, /data-boot|hero-graph|hero-texture|class="scene"|data-hero/);
});

test("proof strip: four big metrics with plain captions", () => {
  assert.equal((home.match(/<div class="big-metric">/g) || []).length, 4);
  assert.match(home, /data-evidence="m-tests-742"[^>]*>742<\/button>\s*<span class="big-plain">automated tests guard the flagship scanner<\/span>/);
});

test("work: five sticky panels with plain + technical copy, two metrics, vertical flow, case-study link", () => {
  const panels = home.match(/<article class="panel" id="panel-[a-z-]+"/g) || [];
  assert.equal(panels.length, 5);
  assert.match(home, /<span class="panel-num mono">01<\/span>/);
  assert.match(home, /<p class="panel-plain">Scans the tools an AI agent can reach/);
  assert.equal((home.match(/<p class="panel-tech">/g) || []).length, 5);
  assert.equal((home.match(/<div class="panel-metrics">/g) || []).length, 5);
  assert.equal((home.match(/<ol class="flow flow-v"/g) || []).length, 5);
  for (const slug of ["agent-perimeter", "ground-truth", "ledger-sense", "backoffice-kit", "selector-drift"]) {
    assert.match(home, new RegExp(`<a class="panel-cta" href="/work/${slug}.html">`));
  }
  assert.doesNotMatch(home, /status-legend|class="badge|RUNNING|project-card/);
});

test("principles list, path + stack band, about with portrait, contact block", () => {
  assert.equal((home.match(/<li class="principle rv"/g) || []).length, 4);
  assert.match(home, /<section class="section" id="principles"/);
  assert.equal((home.match(/<li class="mode rv"/g) || []).length, 5);
  assert.equal((home.match(/<div class="stack-run rv">/g) || []).length, 5);
  assert.match(home, /<picture class="portrait about-portrait">/);
  assert.match(home, /<h2 class="contact-h rv" id="contact-h">Let’s talk\.<\/h2>/);
  assert.match(home, /<div class="contact-links rv">/);
  assert.doesNotMatch(home, /contact-card|class="scan"|claim-notes|pipeline/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/home.test.mjs`
Expected: FAIL on the hero headline.

- [ ] **Step 3: Replace the shared partial and delete the old scene code**

Replace `sectionHead`:
```js
const sectionHead = (id, title, intro = "") => `
<div class="section-head">
  <h2 class="section-title rv" id="${id}">${title}</h2>
  ${intro ? `<p class="section-intro rv" style="--d:80ms">${intro}</p>` : ""}
</div>`;
```
Delete `PIPELINE`, `pipelineScene`, `projectCard` (and `STATUS_LEGEND` if any trace remains).

- [ ] **Step 4: Write the panel partial and the new `indexPage`**

```js
// Work panel — one project, one viewport, sticky-stacked.
const panel = (p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const lead = p.card.metrics.slice(0, 2);
  const chips = p.tech.slice(0, 6);
  const more = p.tech.length - chips.length;
  return `
<article class="panel" id="panel-${p.slug}" aria-labelledby="pn-${p.slug}">
  <div class="wrap panel-grid">
    <div class="panel-copy">
      <span class="panel-num mono">${n}</span>
      <h3 class="panel-name" id="pn-${p.slug}"><a href="/work/${p.slug}.html">${esc(p.name)}</a></h3>
      <p class="panel-plain">${esc(p.plain)}</p>
      <p class="panel-tech">${md(p.card.differentiator)}</p>
      <div class="panel-metrics">
        ${lead.map((m) => `<div class="metric">
          <button class="metric-value prov-trigger" type="button" data-evidence="${esc(m.id)}" aria-haspopup="dialog" aria-label="${esc(`${m.value} ${m.label} — show evidence`)}">${esc(m.value)}</button>
          <span class="metric-label">${esc(m.label)}</span>
        </div>`).join("")}
      </div>
      <div class="panel-chips">
        ${chips.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}${more > 0 ? `<span class="chip chip-muted">+${more}</span>` : ""}
      </div>
      <a class="panel-cta" href="/work/${p.slug}.html">Read the case study ${icon("arrow", "icon-xs")}</a>
    </div>
    <div class="panel-flow">
      ${flowStepper(p.flow, `${p.name} — how it works`, "v")}
    </div>
  </div>
</article>`;
};

const indexPage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.title,
    email: `mailto:${site.email}`,
    image: `${site.siteUrl}/assets/img/bereket-1200.jpg`,
    address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    sameAs: [site.github, site.linkedin],
    knowsAbout: ["Backend Security", "Zero Trust", "OIDC", "Threat Modeling", "LLM Evaluation", "FastAPI", "Django REST"],
  };

  const main = `
<section class="hero" aria-labelledby="hero-h">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow rv">${esc(site.title)} · ${esc(site.location.split(",")[0])} · remote-ready</p>
      <h1 class="hero-h rv" id="hero-h">Systems that stay <em class="hero-em">trustworthy</em> when everything else changes.</h1>
      <p class="hero-lede rv" style="--d:80ms">${esc(site.positioning)}</p>
      <div class="hero-ctas rv" style="--d:140ms">
        <a class="btn btn-signal" href="mailto:${esc(site.email)}">Email me ${icon("arrowUpRight", "icon-xs")}</a>
        <a class="btn btn-ink" href="/resume.html">Résumé ${icon("file", "icon-xs")}</a>
      </div>
    </div>
    ${portrait(1200, "hero-portrait", true)}
  </div>
  <div class="wrap">
    <div class="proof rv" style="--d:200ms" aria-label="Headline figures — activate any number for its evidence">
      ${heroMetrics.slice(0, 4).map(bigMetric).join("")}
    </div>
  </div>
</section>

<section class="section section-work" id="work" aria-labelledby="work-h">
  <div class="wrap work-head">
    ${sectionHead("work-h", "Five systems, built to be distrusted.", "Each one is designed to be checked, not believed. Every figure opens its source; every case study says what isn’t finished.")}
  </div>
  <div class="panels">
    ${projects.map(panel).join("")}
  </div>
</section>

<section class="section" id="principles" aria-labelledby="principles-h">
  <div class="wrap">
    ${sectionHead("principles-h", "How I work.", "Four rules, each with the system that forced it.")}
    <ol class="principles">
      ${principles.map((pr, i) => `<li class="principle rv" style="--d:${i * 60}ms">
        <span class="principle-num mono" aria-hidden="true">№ ${i + 1}</span>
        <div>
          <h3 class="principle-title">${esc(pr.title)}</h3>
          <p class="principle-body">${md(pr.body)}</p>
          <p class="principle-src">${esc(pr.source)}</p>
        </div>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section" id="path" aria-label="Path and stack">
  <div class="wrap path-grid">
    <div>
      <h2 class="subblock-h rv">Four years, five modes.</h2>
      <ol class="modes">
        ${timeline.map((t) => `<li class="mode rv">
          <span class="mode-range mono">${esc(t.range)}</span>
          <div>
            <p class="mode-kind">${esc(t.mode)}</p>
            <p class="mode-heading">${esc(t.heading)}</p>
            <p class="mode-text">${md(t.body)}</p>
          </div>
        </li>`).join("")}
      </ol>
    </div>
    <div>
      <h2 class="subblock-h rv">Stack.</h2>
      <div class="stack-runs">
        ${stack.map((s) => `<div class="stack-run rv">
          <p class="stack-h">${esc(s.group)}</p>
          <p class="stack-items">${s.items.map(esc).join(" · ")}</p>
        </div>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="section" id="about" aria-labelledby="about-h">
  <div class="wrap about-grid">
    ${portrait(192, "about-portrait")}
    <div>
      <h2 class="about-lede rv" id="about-h">${esc(about.lede)}</h2>
      ${prose(about.body, "about-p rv")}
      <p class="about-edu rv">${esc(about.education)}</p>
    </div>
  </div>
</section>

<section class="section contact" id="contact" aria-labelledby="contact-h">
  <div class="wrap">
    <h2 class="contact-h rv" id="contact-h">Let’s talk.</h2>
    <div class="contact-links rv">
      <a href="mailto:${esc(site.email)}"><span>${esc(site.email)}</span><span class="mono">EMAIL</span></a>
      <a href="${esc(site.github)}" rel="noopener" target="_blank"><span>github.com/Berakhah</span><span class="mono">GITHUB</span></a>
      <a href="${esc(site.linkedin)}" rel="noopener" target="_blank"><span>in/bereket-tilahun</span><span class="mono">LINKEDIN</span></a>
      <a href="/assets/Bereket_Tilahun_Resume.pdf" download><span>Résumé, one page</span><span class="mono">PDF</span></a>
      <a href="tel:${esc(site.phone.replace(/\s/g, ""))}"><span>${esc(site.phone)}</span><span class="mono">PHONE</span></a>
    </div>
    <p class="contact-avail rv">${esc(site.availability)}</p>
  </div>
</section>`;

  return page({
    title: "Bereket Tilahun — Backend Security Engineer",
    desc: site.positioning,
    path: "/",
    bodyClass: "page-home",
    main,
    jsonLd,
    preloadPortrait: true,
  });
};
```

- [ ] **Step 5: Run the home test**

Run: `node --test tests/home.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add build.mjs tests/home.test.mjs
git commit -m "home: editorial hero with portrait, four-figure proof strip, five sticky project panels"
```

---

### Task 8: Case study, résumé and 404 renderers

**Files:**
- Modify: `build.mjs` — replace `caseSections`, `casePage`, `resumePage`, `notFoundPage`
- Modify: `tests/pages.test.mjs` (replace whole file)

**Interfaces:**
- Consumes: `project.plain`, `status.label` ("Running"), `flowStepper(nodes, label)` horizontal, `metricsRow`, `substrateDiagram`, `repoChip`, `bullets`, `prose`, `md`, `esc`, `icon`.
- Produces: `site/work/<slug>.html`, `site/resume.html`, `site/404.html`.

- [ ] **Step 1: Rewrite the pages test**

`tests/pages.test.mjs`:
```js
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, "site", p), "utf8");
let cs, bok, nf, resume;
before(() => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" });
  cs = read("work/ledger-sense.html");
  bok = read("work/backoffice-kit.html");
  nf = read("404.html");
  resume = read("resume.html");
});

test("case study hero: number, serif title, italic tagline, plain sentence, prose status, meta row", () => {
  assert.match(cs, /<span class="cs-num mono rv">03<\/span>/);
  assert.match(cs, /<h1 class="cs-title rv" style="--d:60ms">Ledger Sense<\/h1>/);
  assert.match(cs, /<p class="cs-tagline rv"/);
  assert.match(cs, /<p class="cs-plain rv"[^>]*>Reads construction invoices/);
  assert.match(cs, /<p class="cs-status rv"[^>]*><span class="dot" aria-hidden="true"><\/span><span><strong>Running<\/strong> — /);
  assert.match(cs, /<div class="cs-meta rv"/);
  assert.doesNotMatch(cs, /class="badge|hero-texture|WHY IT’S DIFFERENT|HONEST CAVEAT/);
});

test("case study body: 11 sections in order, caveat section carries card.caveat, TOC matches", () => {
  const ids = [...cs.matchAll(/<section class="cs-sec rv" id="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ["problem", "why", "architecture", "threat", "decisions", "implementation", "evidence", "controls", "tradeoffs", "caveats", "repo"]);
  for (const id of ids) assert.match(cs, new RegExp(`<a href="#${id}">`));
  assert.match(cs, /<section class="cs-sec rv" id="caveats"[\s\S]*?<p class="cs-caveat">/);
  assert.match(cs, /<ol class="flow" role="list"/);
  assert.match(bok, /<div class="substrate"/);
  assert.match(cs, /<nav class="pager wrap"/);
});

test("404 is a single serif line with a link home", () => {
  assert.match(nf, /<h1 class="nf-h rv">Nothing here\.<\/h1>/);
  assert.match(nf, /href="\/">Back to the start<\/a>/);
  assert.doesNotMatch(nf, /data-boot|refused/);
});

test("résumé: roles, skills, education, download CTA, no scenes", () => {
  assert.match(resume, /<a class="btn btn-signal" href="\/assets\/Bereket_Tilahun_Resume.pdf" download>Download PDF/);
  assert.ok((resume.match(/<section class="resume-role rv"/g) || []).length >= 4);
  assert.doesNotMatch(resume, /data-boot|class="scene"|class="panel"/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/pages.test.mjs`
Expected: FAIL on `cs-num`.

- [ ] **Step 3: Replace `caseSections` and `casePage`**

```js
const caseSections = (p) => {
  const cs = p.caseStudy;
  const toc = [
    ["problem", "Problem"],
    ["why", "Why the obvious approach fails"],
    ["architecture", "Architecture"],
    ["threat", "Threat model"],
    ["decisions", "Decisions"],
    ["implementation", "Implementation"],
    ["evidence", "Evidence"],
    ["controls", "Security controls"],
    ["tradeoffs", "Trade-offs"],
    ["caveats", "Caveats & status"],
    ["repo", "Repository"],
  ];
  const sec = (id, title, body) => `
    <section class="cs-sec rv" id="${id}" aria-labelledby="${id}-h">
      <h2 class="cs-h" id="${id}-h">${title}</h2>
      ${body}
    </section>`;
  return `
<div class="cs-layout wrap">
  <aside class="cs-toc" aria-label="Case study sections">
    <p class="toc-h">Contents</p>
    ${toc.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("\n    ")}
    <a class="btn btn-ink btn-sm toc-back" href="/#work">${icon("arrow")} All work</a>
  </aside>
  <div class="cs-body">
    ${sec("problem", "The problem", prose(cs.problem))}
    ${sec("why", "Why the obvious approach fails", bullets(cs.whyFails))}
    ${sec("architecture", "Architecture", `
      ${prose(cs.architecture.intro)}
      ${p.substrate ? substrateDiagram() : flowStepper(p.flow, `${p.name} — how it works`)}
      ${cs.architecture.claimCode ? `<div class="code-block"><span class="code-label">the Claim type</span><pre><code>${esc(cs.architecture.claimCode)}</code></pre></div>` : ""}
      <div class="code-block"><span class="code-label">repository layout</span><pre><code>${esc(cs.architecture.tree)}</code></pre></div>`)}
    ${sec("threat", "Threat model", bullets(cs.threatModel))}
    ${sec("decisions", "Decisions", `<dl class="decisions">${cs.decisions.map((d) => `<div class="decision"><dt>${esc(d.title)}</dt><dd>${md(d.body)}</dd></div>`).join("")}</dl>`)}
    ${sec("implementation", "Implementation", bullets(cs.implementation))}
    ${sec("evidence", "Evidence", `${metricsRow(p.card.metrics)}${bullets(cs.evidence)}`)}
    ${sec("controls", "Security controls", bullets(cs.securityControls))}
    ${sec("tradeoffs", "Trade-offs", bullets(cs.tradeoffs))}
    ${sec("caveats", "Caveats &amp; status", `
      <p class="cs-caveat">${md(p.card.caveat)}</p>
      ${bullets(cs.limitations)}
      <div class="status-block"><p><strong>${esc(p.status.label)}</strong> — ${md(p.status.detail)}</p>${prose(cs.currentStatus)}</div>`)}
    ${sec("repo", "Repository", `
      <div class="repo-block">${repoChip(p)}<span class="chip chip-muted">${esc(p.licence)}</span></div>
      <p class="repo-note">${md(cs.repoNote)}</p>`)}
  </div>
</div>`;
};

const casePage = (p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const n = String(i + 1).padStart(2, "0");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${p.name} — ${p.tagline}`,
    author: { "@type": "Person", name: site.name },
    about: p.category.join(", "),
  };
  const main = `
<section class="cs-hero">
  <div class="wrap">
    <span class="cs-num mono rv">${n}</span>
    <h1 class="cs-title rv" style="--d:60ms">${esc(p.name)}</h1>
    <p class="cs-tagline rv" style="--d:120ms">${esc(p.tagline)}</p>
    <p class="cs-plain rv" style="--d:180ms">${esc(p.plain)}</p>
    <p class="cs-status rv" style="--d:240ms"><span class="dot" aria-hidden="true"></span><span><strong>${esc(p.status.label)}</strong> — ${md(p.status.detail)}</span></p>
    <div class="cs-meta rv" style="--d:300ms">
      <span><strong>Role</strong> ${esc(p.role)}</span>
      <span><strong>Licence</strong> ${esc(p.licence)}</span>
      ${p.links && p.links.github ? `<a class="text-link" href="${esc(p.links.github)}" rel="noopener" target="_blank">GitHub ${icon("external", "icon-xs")}</a>` : ""}
    </div>
    <div class="cs-tech rv" style="--d:360ms">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
  </div>
</section>
${caseSections(p)}
<nav class="pager wrap" aria-label="More case studies">
  <a class="pager-link pager-prev" href="/work/${prev.slug}.html"><span class="pager-dir mono">← PREVIOUS</span><span class="pager-name">${esc(prev.name)}</span></a>
  <a class="pager-link pager-next" href="/work/${next.slug}.html"><span class="pager-dir mono">NEXT →</span><span class="pager-name">${esc(next.name)}</span></a>
</nav>`;
  return page({
    title: `${p.name} — Case study — ${site.name}`,
    desc: p.plain,
    path: `/work/${p.slug}.html`,
    bodyClass: "page-case",
    main,
    jsonLd,
  });
};
```

- [ ] **Step 4: Replace `resumePage` and `notFoundPage`**

```js
const resumePage = () => {
  const main = `
<section class="resume-hero">
  <div class="wrap">
    <p class="eyebrow rv">Résumé</p>
    <h1 class="cs-title rv" style="--d:60ms">${esc(site.name)}</h1>
    <p class="cs-tagline rv" style="--d:120ms">${esc(site.title)} · ${esc(site.location)}</p>
    <div class="resume-ctas rv" style="--d:180ms">
      <a class="btn btn-signal" href="/assets/Bereket_Tilahun_Resume.pdf" download>Download PDF ${icon("download", "icon-xs")}</a>
      <a class="btn btn-ink" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
    </div>
  </div>
</section>
<div class="wrap resume-body">
  ${experience.roles.map((r, i) => `<section class="resume-role rv" aria-labelledby="rr${i}">
    <div class="resume-role-head"><h2 class="resume-title" id="rr${i}">${esc(r.title)}</h2><span class="resume-range mono">${esc(r.range)}</span></div>
    <p class="resume-org">${esc(r.org)} · ${esc(r.loc)}</p>
    ${bullets(r.points, "bullets resume-points")}
  </section>`).join("")}
  <section class="resume-role rv"><h2 class="resume-title">Skills</h2>
    <div class="stack-runs">${stack.map((s) => `<div class="stack-run"><p class="stack-h">${esc(s.group)}</p><p class="stack-items">${s.items.map(esc).join(" · ")}</p></div>`).join("")}</div>
  </section>
  <section class="resume-role rv"><h2 class="resume-title">Education</h2><p class="resume-org">${esc(about.education)}</p></section>
</div>`;
  return page({
    title: `Résumé — ${site.name}`,
    desc: `Résumé of ${site.name}, ${site.title}. Download the PDF.`,
    path: "/resume.html",
    bodyClass: "page-resume",
    main,
  });
};

const notFoundPage = () =>
  page({
    title: `Not found — ${site.name}`,
    desc: "This page does not exist.",
    path: "/404.html",
    bodyClass: "page-404",
    main: `
<section class="section nf"><div class="wrap">
  <h1 class="nf-h rv">Nothing here.</h1>
  <p class="rv" style="--d:80ms">The page you asked for doesn’t exist. <a class="text-link" href="/">Back to the start</a>.</p>
</div></section>`,
  });
```

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all tests pass (`content`, `build`, `components`, `css`, `home`, `pages`).

- [ ] **Step 6: Commit**

```bash
git add build.mjs tests/pages.test.mjs
git commit -m "pages: editorial case-study template, print-first résumé, one-line 404"
```

---

### Task 9: main.js — reveals, curtain, sticky-stack, TOC

**Files:**
- Modify: `src/js/main.js` (replace whole file)
- Modify: `tests/build.test.mjs` — add one assertion (Step 1)

**Interfaces:**
- Consumes markup from Tasks 4, 7, 8: `.rv`, `.curtain`, `.panel`, `.panel .flow`, `.hero-portrait img`, `.cs-toc a`, `.drawer-root`, `#drawer-body`, `#evidence-data`, `.menu-btn`, `#mobile-nav`, `.site-head`, `.site-nav a`, `#year`.
- Produces: `html.js`, `html.motion`, `.in-view`, `.current`, `.drawn`, `.curtain.in/.out`, `.scrolled`.

- [ ] **Step 1: Add a bundle assertion to the build test**

In `tests/build.test.mjs`, inside the bundle test after the `order` loop add:
```js
  for (const s of ['querySelectorAll(".panel")', "prefers-reduced-motion", 'classList.add("motion")']) assert.ok(bundle.includes(s), `bundle missing ${s}`);
  for (const s of ["data-boot", "GLYPHS", "station"]) assert.ok(!bundle.includes(s), `bundle still has ${s}`);
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/build.test.mjs`
Expected: FAIL — `bundle missing querySelectorAll(".panel")`.

- [ ] **Step 3: Rewrite main.js**

```js
/* Bereket Tilahun — portfolio interactions (Editorial Signal).
   Layer 0 (always, `.js`): header state, mobile nav, nav current-section,
     claim → evidence sheet, anchor links, footer year.
   Layer 1 (`.motion`: GSAP + ScrollTrigger loaded AND no reduced-motion):
     Lenis smooth scroll, reveals, page curtain, portrait parallax,
     sticky-stack panels, case-study TOC progress. */
(() => {
  "use strict";
  const doc = document, win = window, root = doc.documentElement;
  root.classList.add("js");
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const gsap = win.gsap, ST = win.ScrollTrigger;
  const motion = !!(gsap && ST) && !reduced.matches;
  if (motion) { gsap.registerPlugin(ST); root.classList.add("motion"); }

  /* ================================================================ layer 0 */
  const head = $(".site-head");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { if (head) head.classList.toggle("scrolled", win.scrollY > 8); ticking = false; });
  };
  win.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $(".menu-btn"), mobileNav = $("#mobile-nav");
  if (menuBtn && mobileNav) {
    const setOpen = (open) => { menuBtn.setAttribute("aria-expanded", String(open)); mobileNav.hidden = !open; };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    doc.addEventListener("keydown", (e) => { if (e.key === "Escape" && !mobileNav.hidden) { setOpen(false); menuBtn.focus(); } });
  }

  let lenis = null;
  if (motion && typeof win.Lenis === "function") {
    lenis = new win.Lenis({ lerp: .1, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
  };
  const onHome = location.pathname === "/" || /\/index\.html$/.test(location.pathname);
  doc.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!a || a.classList.contains("skip-link")) return;
    const href = a.getAttribute("href");
    if (href.startsWith("/#") && !onHome) return;
    const hash = href.replace(/^\//, "");
    const target = hash === "#" ? null : doc.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", hash);
    scrollTo(target);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* nav: mark the current home section */
  const navLinks = $$('.site-nav a[href^="/#"]');
  if (onHome && navLinks.length && "IntersectionObserver" in win) {
    const map = new Map(navLinks.map((a) => [a.getAttribute("href").slice(2), a]));
    const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.remove("current"));
      const a = map.get(en.target.id); if (a) a.classList.add("current");
    }), { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, id) => { const s = doc.getElementById(id); if (s) spy.observe(s); });
  }

  /* claim → evidence sheet */
  const drawerRoot = $(".drawer-root"), drawerBody = $("#drawer-body");
  let lastTrigger = null, evidence = {};
  try { evidence = JSON.parse($("#evidence-data").textContent); } catch { evidence = {}; }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const evRow = (k, v) => `<div class="ev-row"><span class="ev-key">${k}</span><span>${v}</span></div>`;
  const openDrawer = (id, trigger) => {
    const ev = evidence[id];
    if (!ev || !drawerRoot) return;
    lastTrigger = trigger || null;
    drawerBody.innerHTML = `
      <p class="ev-claim">${esc(ev.claim)}</p>
      <div class="ev-chain">
        ${evRow("Method", `<span class="ev-method">${esc(ev.method)}</span>`)}
        ${evRow("Source", ev.source && ev.source.href ? `<a href="${esc(ev.source.href)}" target="_blank" rel="noopener">${esc(ev.source.label)}</a>` : (ev.source ? esc(ev.source.label) : "—"))}
        ${evRow("Basis", ev.basis ? esc(ev.basis) : "—")}
        ${evRow("Observed", ev.observedAt ? esc(ev.observedAt) : "—")}
      </div>
      ${ev.caveats && ev.caveats.length ? `<div class="ev-caveats"><p class="ev-caveats-h">CAVEATS</p><ul>${ev.caveats.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}`;
    drawerRoot.classList.add("open");
    drawerRoot.setAttribute("aria-hidden", "false");
    root.classList.add("drawer-open");
    if (lenis) lenis.stop();
    $(".drawer", drawerRoot).focus();
  };
  const closeDrawer = () => {
    if (!drawerRoot) return;
    drawerRoot.classList.remove("open");
    drawerRoot.setAttribute("aria-hidden", "true");
    root.classList.remove("drawer-open");
    if (lenis) lenis.start();
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  };
  doc.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-evidence]");
    if (trigger) { openDrawer(trigger.getAttribute("data-evidence"), trigger); return; }
    if (e.target.closest("[data-drawer-close]")) closeDrawer();
  });
  doc.addEventListener("keydown", (e) => {
    if (!drawerRoot || !drawerRoot.classList.contains("open")) return;
    if (e.key === "Escape") { closeDrawer(); return; }
    if (e.key === "Tab") {
      const f = $$("button, a[href], [tabindex]:not([tabindex='-1'])", $(".drawer", drawerRoot));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ================================================================ layer 1 */
  const show = (el) => el.classList.add("in-view");
  const revealables = $$(".rv");
  if (motion) {
    ST.batch(revealables, { start: "top 92%", once: true, onEnter: (els) => els.forEach(show) });
    win.addEventListener("load", () => {
      revealables.forEach((el) => { if (el.getBoundingClientRect().top < win.innerHeight) show(el); });
      ST.refresh();
    });
  } else {
    revealables.forEach(show);
  }

  /* page curtain: wipe in on arrival, wipe out on internal navigation */
  const curtain = $(".curtain");
  if (motion && curtain) {
    curtain.classList.add("in");
    requestAnimationFrame(() => requestAnimationFrame(() => { curtain.classList.remove("in"); curtain.classList.add("out"); }));
    doc.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      curtain.classList.remove("out"); curtain.classList.add("in");
      setTimeout(() => { location.href = url.href; }, 400);
    });
    win.addEventListener("pageshow", (e) => { if (e.persisted) { curtain.classList.remove("in"); curtain.classList.add("out"); } });
  }

  /* hero portrait parallax ≤ 24px */
  const heroImg = $(".hero-portrait img");
  if (motion && heroImg) {
    gsap.to(heroImg, { y: 24, ease: "none", scrollTrigger: { trigger: heroImg, start: "top top", end: "bottom top", scrub: .3 } });
  }

  /* sticky-stack: each panel recedes as the next covers it */
  const panels = $$(".panel");
  if (motion && panels.length > 1) {
    panels.forEach((p, i) => {
      const next = panels[i + 1];
      if (!next) return;
      gsap.to(p, { scale: .96, opacity: .6, ease: "none",
        scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true } });
    });
    $$(".panel .flow").forEach((f) => ST.create({ trigger: f, start: "top 80%", once: true, onEnter: () => f.classList.add("drawn") }));
  }

  /* case-study TOC current section */
  const toc = $(".cs-toc");
  if (toc) {
    const pairs = $$("a[href^='#']", toc).map((a) => [a, $(a.getAttribute("href"))]).filter(([, s]) => s);
    if (motion) {
      pairs.forEach(([a, sec]) => ST.create({ trigger: sec, start: "top 40%", end: "bottom 40%",
        onToggle: (self) => a.classList.toggle("current", self.isActive) }));
    } else if ("IntersectionObserver" in win) {
      const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        pairs.forEach(([a]) => a.classList.remove("current"));
        const hit = pairs.find(([, s]) => s === en.target);
        if (hit) hit[0].classList.add("current");
      }), { rootMargin: "-30% 0px -60% 0px" });
      pairs.forEach(([, s]) => spy.observe(s));
    }
  }
})();
```

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/js/main.js tests/build.test.mjs
git commit -m "js: reveals, paper curtain, portrait parallax, sticky-stack panels; drop boot/readout/pipeline scenes"
```

---

### Task 10: OG card

**Files:**
- Modify: `src/og/render-og.mjs` (replace whole file)
- Regenerate: `docs/og/og-card.html`, `site/assets/img/og-card.png`

**Interfaces:**
- Consumes: `site` from content; `site/assets/img/bereket-600.jpg`; `src/css/fonts.css`.
- Produces: 1200×630 `og-card.png` referenced by `layout.head`.

- [ ] **Step 1: Rewrite the template**

```js
// Renders docs/og/og-card.html (1200×630) for screenshotting.  node src/og/render-og.mjs
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../content/index.mjs";
import { esc } from "../render/components.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fontCss = readFileSync(join(ROOT, "src", "css", "fonts.css"), "utf8").replaceAll("/assets/fonts/", "../../site/assets/fonts/");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>og-card</title>
<style>${fontCss}
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: #f4f1ea; color: #16130f; font-family: Geist, system-ui, sans-serif; position: relative; overflow: hidden; }
  .in { position: absolute; inset: 72px 80px; display: grid; grid-template-columns: 1fr 340px; gap: 64px; align-items: center; }
  .eyebrow { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6b655c; margin: 0 0 24px; }
  h1 { font-family: Newsreader, serif; font-weight: 500; font-size: 84px; line-height: .95; letter-spacing: -.025em; margin: 0; }
  h1 em { font-style: italic; font-weight: 400; color: #ff4d1c; }
  .name { margin-top: 36px; font-size: 26px; }
  .name span { color: #6b655c; }
  .pic { width: 340px; height: 453px; object-fit: cover; object-position: 50% 15%; border-radius: 999px 999px 24px 24px; }
</style></head>
<body>
<div class="in">
  <div>
    <p class="eyebrow">${esc(site.title)} · ${esc(site.location.split(",")[0])}</p>
    <h1>Systems that stay <em>trustworthy</em> when everything else changes.</h1>
    <p class="name">${esc(site.name)} <span>· berakhah.github.io</span></p>
  </div>
  <img class="pic" src="../../site/assets/img/bereket-600.jpg" alt="">
</div>
</body></html>`;

mkdirSync(join(ROOT, "docs", "og"), { recursive: true });
writeFileSync(join(ROOT, "docs", "og", "og-card.html"), html);
console.log("wrote docs/og/og-card.html");
```

- [ ] **Step 2: Render and screenshot**

Run: `npm run og`. Then with chrome-devtools MCP: `navigate_page` to `file:///D:/Project/Portifolio%20Projects/bereket-portfolio/docs/og/og-card.html`, `resize_page` 1200×630, `take_screenshot` (png, full page off) and save it as `site/assets/img/og-card.png`. Read the PNG back and confirm: paper background, serif headline with orange "trustworthy", portrait at right.

- [ ] **Step 3: Commit**

```bash
git add src/og/render-og.mjs docs/og/og-card.html site/assets/img/og-card.png
git commit -m "og: paper card with serif headline and portrait"
```

---

### Task 11: Browser verification, rebuilt output, ship

**Files:**
- Modify: `site/**` (rebuilt output), `docs/superpowers/specs/2026-09-15-dark-ops-redesign-design.md` (superseded note)

- [ ] **Step 1: Rebuild and run the full suite**

Run: `node build.mjs && npm test`
Expected: `built: /, /resume.html, /work/... ` and every test green.

- [ ] **Step 2: Serve and screenshot every page at desktop and mobile**

Run in the background: `python -m http.server 4173 -d site`.
With chrome-devtools MCP, for each of `/`, `/work/agent-perimeter.html`, `/work/backoffice-kit.html`, `/resume.html`, `/404.html`:
- `resize_page` 1440×900 → `take_screenshot`; on `/` also scroll to the third panel (`evaluate_script`: `document.getElementById('panel-ledger-sense').scrollIntoView()`) and screenshot mid-stack.
- `resize_page` 390×844 → `take_screenshot`.
- `emulate` `prefers-color-scheme: dark` on `/` → screenshot.
- `emulate` `prefers-reduced-motion: reduce` on `/` → `evaluate_script`: `document.querySelectorAll('.rv:not(.in-view)').length` must be `0` after load.
Read every screenshot. Fix anything that contradicts the spec (headline < ~72px at 1440, any colour other than signal, horizontal overflow at 390, portrait cropped through the face) in the Task 6 CSS, rebuild, re-screenshot.

- [ ] **Step 3: Performance and console**

`performance_start_trace` with reload on `/` at 1440 → `performance_stop_trace`. Expected: LCP element is the portrait or the headline, LCP < 1.5 s, CLS < 0.05. `list_console_messages` → no errors on any page. `lighthouse_audit` on `/`: accessibility ≥ 95 — fix any contrast/label finding it reports.

- [ ] **Step 4: Mark the old spec superseded and commit the built site**

Prepend to `docs/superpowers/specs/2026-09-15-dark-ops-redesign-design.md`:
```markdown
> Superseded by `2026-09-17-editorial-signal-redesign-design.md` (2026-09-17).
```
```bash
git add -A site docs/superpowers/specs/2026-09-15-dark-ops-redesign-design.md
git commit -m "feat: Editorial Signal redesign — rebuilt site output"
```

- [ ] **Step 5: Push source and deploy to GitHub Pages**

```bash
git push origin main
```
Then publish `site/` to `Berakhah/Berakhah.github.io` the way commit `520b8d1` did: clone that repo into the scratchpad, replace its contents with `site/*` plus an empty `.nojekyll`, commit `Editorial Signal redesign`, push `main`. Verify `curl -sI https://berakhah.github.io/ | head -1` returns `200` and `curl -s https://berakhah.github.io/ | grep -c 'hero-em'` returns `1`.

- [ ] **Step 6: Report**

Tell the user: live URL, the screenshot locations, LCP/CLS numbers, the Lighthouse accessibility score, and the copy that changed (Task 2) so they can review it.
