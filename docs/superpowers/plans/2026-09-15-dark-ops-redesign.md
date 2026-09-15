# Dark-Ops Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin and re-choreograph the existing static portfolio into the approved dark "security-ops" design with GSAP/Lenis motion, regenerate its share images, and deploy it to Vercel with a real `siteUrl`.

**Architecture:** The site stays a zero-dependency static generator (`node build.mjs` → `site/`). Content in `src/content/**` is untouched; the redesign lives in the renderer (`build.mjs`, `src/render/*`), a new build-time data module (`src/render/ops.mjs`) that derives boot lines and the capability graph from content, and the browser layer (`site/assets/css/style.css`, `site/assets/js/main.js`, `site/assets/js/graph.js`). Motion is layered: everything hidden-before-reveal lives under a `.motion` root class that `main.js` sets only when GSAP loaded **and** `prefers-reduced-motion` is not set — so no-JS, no-CDN and reduced-motion users all get a fully visible static page.

**Tech Stack:** Node 20 (`node:test` for tests, no npm deps), GSAP 3.15.0 + ScrollTrigger (cdnjs), Lenis 1.3.26 (jsDelivr — see Global Constraints), Canvas 2D, MPA View Transitions, Vercel static hosting via the Vercel MCP connector, Stitch MCP for design concepts, chrome-devtools MCP for screenshots/Lighthouse.

**Spec:** `docs/superpowers/specs/2026-09-15-dark-ops-redesign-design.md`

## Global Constraints

- **No invented facts.** All copy, metrics, statuses, links and evidence chains come from `src/content/**` unchanged. The only content edit in this plan is `site.siteUrl` in `src/content/person.mjs` (Task 15).
- Repo links the content marks `pending` / `planned` stay that way (`repoChip` is not changed).
- No Writing/Notes section.
- Status vocabulary keeps glyph + label — never colour-only. WCAG 2.2 AA contrast on dark. All existing ARIA / keyboard behaviour (skip link, mobile nav, evidence drawer focus trap, station `tabindex`) is preserved.
- `prefers-reduced-motion: reduce` → instant reveals, static canvas, no pinning, no smooth scroll.
- No build step added: no bundler, no npm dependencies. A `package.json` with scripts only (Task 0) is allowed.
- Vendor libraries pinned and `defer`red: `gsap@3.15.0` and `ScrollTrigger@3.15.0` from cdnjs. **Deviation from spec:** Lenis is not published on cdnjs (checked `api.cdnjs.com` 2026-09-15, zero results), so it is pinned from jsDelivr: `https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js` (200 OK, 18,722 bytes).
- Tokens (verbatim from spec): base `#0a0b0d`, raised `#111317`, card `#181b21`, hairline `rgba(255,255,255,.08)`–`.12`, ink `#e8eaed`, ink-2 `#a6abb4`, ink-3 `#6f7580`, accent `#5cf28a`, accent-dim `#2f8a4f`, accent-wash `rgba(92,242,138,.08)`, warn `#f2c14e`, crit `#ff6b57`, info `#7cc4ff`. `--ink-3` is ~4.1:1 on base: use it only for `aria-hidden` decoration or text ≥ 1.5 rem; body-secondary text uses `--ink-2`.
- Type: IBM Plex Mono (nav, labels, readouts, eyebrows), Geist (body), Newsreader italic (hero key phrases only). Fonts stay self-hosted (`site/assets/fonts/` untouched).
- Textures (scanline + dot grid) on the home hero and case-study heroes only.
- Where Stitch's `docs/DESIGN.md` (Task 1) disagrees with the spec token table, the spec wins; DESIGN.md informs composition and spacing only.
- Verification bar: `node build.mjs` green; `node --test tests/` green; every page readable with JS disabled; Lighthouse on home a11y ≥ 95, perf ≥ 85; deployed URL's canonical/OG/sitemap point at itself.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` (new) | `type: module`, `build` / `test` scripts. No dependencies. |
| `src/render/ops.mjs` (new) | Build-time data derived from content: boot lines, status counts, capability-graph nodes/edges, and their HTML/JSON renderers. |
| `src/render/layout.mjs` (edit) | `head()` (dark meta, single source of head markup), `scripts()` (pinned vendor tags); `header()`, `footer()` unchanged. |
| `src/render/components.mjs` (edit) | `flowStepper` gains a drawable SVG line; `claimSpecimen` gains per-line spans and stamped rules. |
| `build.mjs` (edit) | Page shell uses `layout.head`; home/case/résumé/404 markup gains motion hooks. |
| `src/og/render-og.mjs` (new) | Writes `docs/og/og-card.html` from content for screenshotting. |
| `site/assets/css/style.css` (rewrite) | Dark-ops design system in three appended chunks: foundation, home scenes, secondary pages. |
| `site/assets/js/graph.js` (new) | Canvas capability graph. |
| `site/assets/js/main.js` (rewrite) | Layer 0 interactions + layer 1 motion. |
| `site/assets/img/favicon.svg`, `og-card.png` (regenerate) | Dark share assets. |
| `vercel.json` (new) | Static deploy config. |
| `docs/DESIGN.md` (new) | Stitch-extracted design doc + spec overrides. |
| `tests/*.test.mjs` (new) | `node:test` suites for ops, build output and CSS safety invariants. |

---

### Task 0: Repository baseline

The folder is not a git repo; later tasks commit after every green step. Ask the user once if they did not already approve `git init`; the spec's workflow assumes history.

**Files:**
- Create: `.gitignore`, `package.json`

- [ ] **Step 1: Initialise git and ignore rules**

```bash
cd "C:/Users/berek/.zcode/workspace/default/bereket-portfolio"
git init -b main
cat > .gitignore <<'EOF'
node_modules/
.DS_Store
Thumbs.db
.vercel/
EOF
```

- [ ] **Step 2: Add scripts-only package.json**

```json
{
  "name": "bereket-portfolio",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node build.mjs",
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 3: Verify the current generator still runs**

Run: `node build.mjs`
Expected: `built: /, /resume.html, /work/agent-perimeter.html, /work/ground-truth.html, /work/ledger-sense.html, /work/backoffice-kit.html, /work/selector-drift.html, /404.html`

- [ ] **Step 4: Commit the baseline**

```bash
git add -A
git commit -m "chore: baseline light portfolio before dark-ops redesign

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 1: Stitch concepts → `docs/DESIGN.md`

Requires the Stitch MCP tools (`mcp__stitch__*`). They load at session start; Stitch is registered at user scope. If `ToolSearch "+stitch"` returns nothing, restart the session before this task.

**Files:**
- Create: `docs/DESIGN.md`

- [ ] **Step 1: Confirm Stitch tools are loaded**

Use ToolSearch with query `+stitch`. Expected: at least one `mcp__stitch__…` tool. If none, stop and ask the user to restart the session.

- [ ] **Step 2: Generate three screens with the `stitch-design:generate-design` skill**

Invoke `Skill: stitch-design:generate-design`. Use this prompt verbatim (every figure in it is copied from `src/content/**`):

```
Dark "security-ops / terminal" portfolio for Bereket Tilahun, Backend Security Engineer, Addis Ababa.
Palette (fixed): base #0a0b0d, raised #111317, card #181b21, hairline rgba(255,255,255,.08–.12),
ink #e8eaed, ink-2 #a6abb4, accent phosphor #5cf28a (dim #2f8a4f), warn #f2c14e, crit #ff6b57, info #7cc4ff.
Type: IBM Plex Mono for nav/labels/readouts/eyebrows, Geist for body, Newsreader italic only for hero key phrases.
Textures: faint scanlines + dot grid on heroes only. Motifs: terminal readouts starting with ">", bracketed
indices [01], blinking cursor, instrument-style numerals. Status badges always glyph + label, never colour alone.

Screen 1 — Home (desktop 1440 + mobile 390):
- Boot hero: monospace boot lines
  "> bereket.sh --boot" / "> loading systems ......... 5 found" /
  "> status ................. 1 running · 1 audit pending · 1 active development · 2 design complete" /
  "> verified figures ........ 6 loaded, provenance attached" / "> document reviewed ....... 2026-09-15" / "> ready_"
  then headline "Systems that know what they are allowed to do, know when they are uncertain, preserve evidence,
  and fail safely." with "allowed to do", "uncertain", "fail safely." in accent italic serif. Behind it a faint
  node graph: nodes Agent Perimeter, Ground Truth, Ledger Sense, BackOffice Kit, Selector Drift, bok-core.
- Verified-figures strip, 6 readouts: 731 test functions · 1.00 / 1.00 precision · recall · 82 s clean-machine
  quickstart · 31,953 MCP Registry entries censused · ≥ 90% degraded-mode floor · 340 → 195 ms p95 latency, auth path.
- Pipeline scene, 6 stations on a rail with a travelling packet: 01 Input, 02 Processing, 03 Validation,
  04 Policy, 05 Evidence, 06 Output.
- Work: 5 dossier panels with a sticky [01]–[05] index: Agent Perimeter (RUNNING) "Security posture scanner for
  MCP servers and tool-using agents"; Ground Truth (HARNESS COMPLETE · LIVE MODEL AUDIT PENDING) "Eval &
  regression harness for document-field extraction accuracy"; Ledger Sense (ACTIVE DEVELOPMENT) "Document
  intelligence with confidence routing, for construction progress billing"; BackOffice Kit (DESIGN COMPLETE)
  "The shared substrate: a core library, a design system, a repo template"; Selector Drift (DESIGN COMPLETE ·
  IMPLEMENTATION NOT STARTED) "Self-healing extraction for business systems with no API".
- Evidence: a code block of a Python `Claim` type with three "ENFORCED" stamps beside it.
- Principles: 7 cards on a horizontal track, each citing its source system. Timeline: vertical rail, 5 modes
  (Operate, Build, Harden, Measure, Design Systems). Stack groups, About, Contact cards, footer with
  "Document reviewed 2026-09-15".

Screen 2 — Case study "Agent Perimeter": dark hero with category eyebrow, title, tagline, status badge,
a 6-node architecture flow (MCP server → Discovery → Capability graph → 34 checks · 7 families → Findings +
reproductions → SARIF / HTML report), tech chips; sticky contents list with 12 sections and a per-section
progress hairline; prev/next pager.

Screen 3 — Résumé: same system, lighter; heading, PDF button, three roles with mono date ranges, skills groups.
```

- [ ] **Step 3: Extract the design doc**

Invoke `Skill: stitch-design:extract-design-md` on the generated project. Save the result as `docs/DESIGN.md`.

- [ ] **Step 4: Append the spec-override note**

Append to the end of `docs/DESIGN.md`:

```markdown

## Spec overrides

The token table in `docs/superpowers/specs/2026-09-15-dark-ops-redesign-design.md`
is authoritative. Where this document differs on colour, type or texture, the
spec wins; this document governs composition, spacing and hierarchy only.
```

- [ ] **Step 5: Verify**

Run: `grep -c "5cf28a" docs/DESIGN.md`
Expected: a number ≥ 1 (the accent survived extraction). If 0, edit the colour section of `docs/DESIGN.md` to list the spec tokens.

- [ ] **Step 6: Commit**

```bash
git add docs/DESIGN.md
git commit -m "docs: add Stitch-derived DESIGN.md for dark-ops redesign

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Build-time ops data (`src/render/ops.mjs`)

**Files:**
- Create: `src/render/ops.mjs`
- Test: `tests/ops.test.mjs`

**Interfaces:**
- Consumes: `site`, `projects`, `heroMetrics` from `src/content/index.mjs`; `esc` from `src/render/components.mjs`.
- Produces:
  - `statusCounts(projects) → string[]` e.g. `["1 running", "1 audit pending", …]` (order of first appearance).
  - `bootLines({ site, projects, heroMetrics }) → string[]` (6 lines).
  - `bootBlock(lines: string[]) → string` HTML `<pre class="boot mono" data-boot>` with `.boot-line` spans and a `.boot-caret`.
  - `graphData(projects) → { nodes: {id,label,status}[], edges: {from,to}[] }`.
  - `graphScript(data) → string` `<script type="application/json" id="graph-data">`.

- [ ] **Step 1: Write the failing tests**

`tests/ops.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { statusCounts, bootLines, bootBlock, graphData, graphScript } from "../src/render/ops.mjs";
import { site, projects, heroMetrics } from "../src/content/index.mjs";

test("statusCounts groups by status code in order of first appearance", () => {
  assert.deepEqual(statusCounts(projects), [
    "1 running",
    "1 audit pending",
    "1 active development",
    "2 design complete",
  ]);
});

test("bootLines derive every figure from content", () => {
  const lines = bootLines({ site, projects, heroMetrics });
  assert.equal(lines.length, 6);
  assert.equal(lines[0], "> bereket.sh --boot");
  // dots() pads "label " to 26 columns, so the leaders are 10 / 19 / 9 / 8 dots
  assert.equal(lines[1], "> loading systems .......... 5 found");
  assert.equal(lines[2], "> status ................... 1 running · 1 audit pending · 1 active development · 2 design complete");
  assert.equal(lines[3], "> verified figures ......... 6 loaded, provenance attached");
  assert.equal(lines[4], `> document reviewed ........ ${site.reviewed}`);
  assert.equal(lines[5], "> ready");
});

test("bootBlock renders one escaped span per line plus a caret", () => {
  const html = bootBlock(["> a <b>", "> c"]);
  assert.match(html, /<pre class="boot mono" data-boot>/);
  assert.match(html, /<span class="boot-line" style="--i:0">&gt; a &lt;b&gt;<\/span>/);
  assert.match(html, /<span class="boot-line" style="--i:1">&gt; c<\/span>/);
  assert.match(html, /<span class="boot-caret" aria-hidden="true"><\/span>/);
});

test("graphData: six nodes, edges only from systems that stand on bok-core", () => {
  const g = graphData(projects);
  assert.equal(g.nodes.length, 6);
  assert.ok(g.nodes.some((n) => n.id === "bok-core" && n.status === "core"));
  assert.deepEqual(
    g.edges.map((e) => e.from).sort(),
    ["agent-perimeter", "backoffice-kit", "ground-truth", "ledger-sense"]
  );
  assert.ok(g.edges.every((e) => e.to === "bok-core"));
});

test("graphScript embeds JSON with < escaped", () => {
  const s = graphScript({ nodes: [{ id: "x", label: "<b>" }], edges: [] });
  assert.match(s, /^<script type="application\/json" id="graph-data">/);
  assert.ok(!s.includes("<b>"));
  assert.ok(s.includes("\\u003cb>"));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/ops.test.mjs`
Expected: FAIL — `Cannot find module '…/src/render/ops.mjs'`

- [ ] **Step 3: Implement `src/render/ops.mjs`**

```js
// Build-time data for the dark-ops layer: the boot sequence and the
// capability graph.  Every value is derived from src/content — nothing typed.
import { esc } from "./components.mjs";

const CORE = "bok-core";

// Status codes → the short readout vocabulary (labels in content are long).
const SHORT = {
  running: "running",
  "active-development": "active development",
  "audit-pending": "audit pending",
  "design-complete": "design complete",
  planned: "planned",
};

const dots = (label, width = 26) => (label + " ").padEnd(width, ".");

export const statusCounts = (projects) => {
  const counts = new Map();
  for (const p of projects) {
    const k = SHORT[p.status.code] || p.status.code;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts].map(([label, n]) => `${n} ${label}`);
};

export const bootLines = ({ site, projects, heroMetrics }) => [
  `> ${site.name.split(" ")[0].toLowerCase()}.sh --boot`,
  `> ${dots("loading systems")} ${projects.length} found`,
  `> ${dots("status")} ${statusCounts(projects).join(" · ")}`,
  `> ${dots("verified figures")} ${heroMetrics.length} loaded, provenance attached`,
  `> ${dots("document reviewed")} ${site.reviewed}`,
  `> ready`,
];

export const bootBlock = (lines) => `
<pre class="boot mono" data-boot>${lines
  .map((l, i) => `<span class="boot-line" style="--i:${i}">${esc(l)}</span>`)
  .join("\n")}<span class="boot-caret" aria-hidden="true"></span></pre>`;

// Nodes: the five systems + bok-core.  Edges: any system the substrate
// project lists in its flow, plus the project whose own flow contains the
// core (BackOffice Kit) — i.e. exactly the substrate relationships in content.
export const graphData = (projects) => {
  const nodes = projects.map((p) => ({ id: p.slug, label: p.name, status: p.status.code }));
  nodes.push({ id: CORE, label: CORE, status: "core" });
  const substrate = projects.find((p) => p.substrate);
  const edges = [];
  for (const p of projects) {
    const onSubstrate = !!substrate && substrate.flow.includes(p.name);
    const ownsCore = p.flow.includes(CORE);
    if (onSubstrate || ownsCore) edges.push({ from: p.slug, to: CORE });
  }
  return { nodes, edges };
};

export const graphScript = (data) =>
  `<script type="application/json" id="graph-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test tests/ops.test.mjs`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/render/ops.mjs tests/ops.test.mjs
git commit -m "feat: derive boot sequence and capability graph from content

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Page shell — dark head, vendor scripts, curtain, `vercel.json`

**Files:**
- Modify: `src/render/layout.mjs:1-38` (the `head` export)
- Modify: `build.mjs:15` (layout import) and `build.mjs:20-56` (the `page` function)
- Create: `vercel.json`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Produces: `head({ title, desc, path, siteUrl, jsonLd, ogType })` (dark meta, no `view-transition` meta); `scripts(extra: string[] = []) → string`; `VENDOR: string[]`.
- `page()` in `build.mjs` gains `extraScripts = []`; body starts with `<div class="curtain" aria-hidden="true"></div>`.

- [ ] **Step 1: Write the failing test**

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

test("head declares the dark theme and drops the legacy view-transition meta", () => {
  assert.match(home, /<meta name="theme-color" content="#0a0b0d">/);
  assert.match(home, /<meta name="color-scheme" content="dark">/);
  assert.doesNotMatch(home, /name="view-transition"/);
});

test("vendor scripts are pinned, deferred, and precede main.js", () => {
  const order = [
    'src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js" defer',
    'src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js" defer',
    'src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" defer',
    'src="/assets/js/main.js" defer',
  ];
  let last = -1;
  for (const s of order) {
    const i = home.indexOf(s);
    assert.ok(i > last, `missing or out of order: ${s}`);
    last = i;
  }
});

test("graph.js loads on the home page only", () => {
  assert.match(home, /src="\/assets\/js\/graph\.js" defer/);
  assert.doesNotMatch(cs, /graph\.js/);
});

test("every page has the transition curtain before the header", () => {
  for (const html of [home, cs, read("resume.html"), read("404.html")]) {
    const c = html.indexOf('<div class="curtain" aria-hidden="true"></div>');
    const h = html.indexOf('<header class="site-head">');
    assert.ok(c > -1 && c < h);
  }
});

test("head markup is emitted once (layout.head is the single source)", () => {
  assert.equal((home.match(/<meta charset="utf-8">/g) || []).length, 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/build.test.mjs`
Expected: FAIL on theme-color (`#f6f4ee` still present) and vendor scripts missing.

- [ ] **Step 3: Rewrite `head` in `src/render/layout.mjs` and add `scripts`**

Replace lines 1–38 of `src/render/layout.mjs` (the file comment, the import and the whole `head` export) with:

```js
// Page shell: head (SEO/OG/JSON-LD), vendor scripts, header, footer.
// Consumed by build.mjs.
import { esc, icon } from "./components.mjs";

// Pinned, deferred, no build step.  Lenis is not on cdnjs → jsDelivr.
export const VENDOR = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js",
  "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js",
];

export const scripts = (extra = []) =>
  [...VENDOR, ...extra, "/assets/js/main.js"]
    .map((src) => `<script src="${src}" defer></script>`)
    .join("\n");

export const head = ({ title, desc, path = "/", siteUrl = "", jsonLd = null, ogType = "website" }) => {
  const canon = siteUrl ? `\n<link rel="canonical" href="${esc(siteUrl + path)}">` : "";
  const ogUrl = siteUrl ? `\n<meta property="og:url" content="${esc(siteUrl + path)}">` : "";
  const ogImg = siteUrl ? `\n<meta property="og:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">\n<meta name="twitter:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">` : "";
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
<meta name="theme-color" content="#0a0b0d">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/plex-mono-normal-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/css/style.css">${canon}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>`;
};
```

- [ ] **Step 4: Make `build.mjs` use it**

Change the layout import (line 15) to:

```js
import { head, scripts, header, footer } from "./src/render/layout.mjs";
```

Replace the whole `page` function (lines 20–56) with:

```js
const page = ({ title, desc, path, bodyClass = "", main, jsonLd = null, extraScripts = [] }) => `${head({
  title, desc, path, siteUrl: site.siteUrl, jsonLd,
})}
<body class="${bodyClass}">
<div class="curtain" aria-hidden="true"></div>
${header(path)}
<main id="main">
${main}
</main>
${footer(site)}
${evidenceDrawer()}
${evidenceScript(evidenceIndex)}
${scripts(extraScripts)}
</body>
</html>`;
```

In `indexPage()` add `extraScripts: ["/assets/js/graph.js"],` to the `return page({ … })` call, after `jsonLd,`.

- [ ] **Step 5: Add `vercel.json` at the repo root**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "node build.mjs",
  "outputDirectory": "site",
  "cleanUrls": false,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/`
Expected: all pass (ops 5 + build 5). `graph.js` does not exist yet — the test only checks the tag; the file arrives in Task 10.

- [ ] **Step 7: Commit**

```bash
git add src/render/layout.mjs build.mjs vercel.json tests/build.test.mjs
git commit -m "feat: dark page shell with pinned vendor scripts and Vercel config

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Shared components — drawable flow stepper, compiling Claim specimen

**Files:**
- Modify: `src/render/components.mjs:78-90` (`flowStepper`), `:180-204` (`claimSpecimen`)
- Test: `tests/components.test.mjs`

**Interfaces:**
- `flowStepper(nodes, label)` output now contains `<svg class="flow-line" …>` with two `<line>`s (`.fl-h`, `.fl-v`, `pathLength="1"`), before the `<li>`s.
- `claimSpecimen()` output: each code line wrapped in `<span class="cl" style="--i:N">`, rules as `<ul class="rules">` of `<li class="rule">` each with `<span class="stamp mono" aria-hidden="true">ENFORCED</span>`.

- [ ] **Step 1: Write the failing tests**

`tests/components.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { flowStepper, claimSpecimen } from "../src/render/components.mjs";

test("flowStepper carries a drawable SVG line with horizontal and vertical variants", () => {
  const html = flowStepper(["A", "B <x>"], "demo");
  assert.match(html, /<svg class="flow-line" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">/);
  assert.match(html, /<line class="fl-h" x1="0" y1="50" x2="100" y2="50" pathLength="1"\/>/);
  assert.match(html, /<line class="fl-v" x1="50" y1="0" x2="50" y2="100" pathLength="1"\/>/);
  assert.match(html, /B &lt;x&gt;/);
  assert.ok(html.indexOf("flow-line") < html.indexOf('<li class="flow-node"'));
});

test("claimSpecimen wraps each code line and stamps each rule", () => {
  const html = claimSpecimen();
  const lines = html.match(/<span class="cl" style="--i:\d+">/g) || [];
  assert.equal(lines.length, 9);
  assert.match(html, /<span class="cl" style="--i:0">class Claim\(BaseModel, Generic\[T\]\):\n<\/span>/);
  const stamps = html.match(/<span class="stamp mono" aria-hidden="true">ENFORCED<\/span>/g) || [];
  assert.equal(stamps.length, 3);
  assert.match(html, /<ul class="rules">/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/components.test.mjs`
Expected: FAIL — no `flow-line`, no `.cl` spans.

- [ ] **Step 3: Replace `flowStepper`**

```js
export const flowStepper = (nodes, label) => `
<ol class="flow" role="list" aria-label="${esc(label)}">
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

- [ ] **Step 4: Replace `claimSpecimen`**

```js
const CLAIM_SRC = `class Claim(BaseModel, Generic[T]):
    value: T
    source: Source              # file+line, URL+retrieved_at,
                                # model call id, or human
    method: Method              # DETERMINISTIC | MODEL | HUMAN | DERIVED
    confidence: float | None    # None for DETERMINISTIC; calibrated for MODEL
    observed_at: datetime
    parents: list[Claim] = []   # for DERIVED
    caveat: str | None = None   # scope limitation, in the source's own terms`;

const CLAIM_RULES = [
  "A `DERIVED` claim’s confidence never exceeds the minimum of its parents’.",
  "A `MODEL` claim with no confidence cannot render as a fact.",
  "A parent’s caveat — “sample size 51” — propagates to every child.",
];

export const claimSpecimen = () => `
<div class="claim-specimen">
  <div class="claim-code">
    <span class="mono claim-code-label">provenance.Claim — the type</span>
<pre><code>${CLAIM_SRC.split("\n")
  .map((l, i) => `<span class="cl" style="--i:${i}">${esc(l)}\n</span>`)
  .join("")}</code></pre>
  </div>
  <div class="claim-notes">
    <p>Rules enforced by tests, not comments:</p>
    <ul class="rules">${CLAIM_RULES.map(
      (r, i) => `<li class="rule" style="--i:${i}"><span class="stamp mono" aria-hidden="true">ENFORCED</span><span>${md(r)}</span></li>`
    ).join("")}</ul>
    <p class="claim-try">This page is built the same way: <strong>activate any underlined number</strong> to open its chain.</p>
  </div>
</div>`;
```

- [ ] **Step 5: Run tests**

Run: `node --test tests/`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/render/components.mjs tests/components.test.mjs
git commit -m "feat: drawable flow line and compiling Claim specimen markup

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Home page markup hooks

**Files:**
- Modify: `build.mjs` — imports; `heroPipeline` → `pipelineScene`; `projectCard`; `indexPage` (hero, work, engineering, contact sections)
- Test: `tests/home.test.mjs`

**Interfaces (hooks consumed by `main.js`/`graph.js`/CSS):**
- `#graph` canvas + `#graph-data` JSON inside `.hero`.
- `[data-boot]` pre from `bootBlock`.
- Hero reveal elements carry `data-hero` (revealed after boot).
- `.proof-value[data-count="731"]` for pure-digit values, `.proof-value[data-decode]` otherwise.
- `#pipeline.scene` → `.scene-pin`, `.rail .packet`, `.stations .station[data-desc]`, `[data-readout]`.
- `.work-layout` → `.work-index a[data-index-for="card-<slug>"]`, `.project-card.wipe[data-panel]`.
- `.principles-track[data-track] > .principles`.
- `.modes-wrap > .modes-rail + .modes`.
- `.contact-card > .scan`.

- [ ] **Step 1: Write the failing test**

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

test("hero: canvas graph, graph data, boot block, hero-gated reveals", () => {
  assert.match(home, /<canvas class="hero-graph" id="graph" aria-hidden="true"><\/canvas>/);
  assert.match(home, /id="graph-data"/);
  assert.match(home, /<pre class="boot mono" data-boot>/);
  assert.match(home, /&gt; loading systems \.+ 5 found/);
  assert.ok((home.match(/data-hero/g) || []).length >= 5);
});

test("proof readouts: digits count up, everything else decodes", () => {
  assert.match(home, /<span class="proof-value tnum" data-count="731">731<\/span>/);
  assert.match(home, /<span class="proof-value tnum" data-count="31,953">31,953<\/span>/);
  assert.match(home, /<span class="proof-value tnum" data-decode>82 s<\/span>/);
});

test("pipeline scene has a pin wrapper, rail packet, six stations and a readout", () => {
  assert.match(home, /<section class="scene" id="pipeline"/);
  assert.match(home, /<div class="scene-pin">/);
  assert.match(home, /<span class="packet"><\/span>/);
  assert.equal((home.match(/<li class="station"/g) || []).length, 6);
  assert.match(home, /<p class="station-readout mono" aria-hidden="true" data-readout>/);
});

test("work: sticky index links every panel; panels wipe in", () => {
  assert.match(home, /<ol class="work-index mono" aria-label="Featured work index">/);
  for (const slug of ["agent-perimeter", "ground-truth", "ledger-sense", "backoffice-kit", "selector-drift"]) {
    assert.match(home, new RegExp(`data-index-for="card-${slug}"`));
    assert.match(home, new RegExp(`<article class="project-card wipe[^"]*" id="card-${slug}" data-panel`));
  }
  assert.match(home, /<span class="pc-index mono" aria-hidden="true">\[01\]<\/span>/);
});

test("principles track, timeline rail, contact scan", () => {
  assert.match(home, /<div class="principles-track" data-track>\s*<ol class="principles">/);
  assert.match(home, /<div class="modes-wrap">\s*<span class="modes-rail" aria-hidden="true"><\/span>\s*<ol class="modes">/);
  assert.equal((home.match(/<span class="scan" aria-hidden="true"><\/span>/g) || []).length, 4);
});

test("no light-theme leftovers and no invented sections", () => {
  assert.doesNotMatch(home, /hero-grid-bg/);
  assert.doesNotMatch(home, /Writing|Notes<\/h2>/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/home.test.mjs`
Expected: FAIL on every test.

- [ ] **Step 3: Update imports in `build.mjs`**

After the components import add:

```js
import { bootLines, bootBlock, graphData, graphScript } from "./src/render/ops.mjs";
```

- [ ] **Step 4: Replace `heroPipeline` with `pipelineScene`**

Delete the `heroPipeline` const (keep the `PIPELINE` array) and add:

```js
// Pipeline scene — pinned on desktop; scroll scrubs a packet along the rail.
const pipelineScene = () => `
<section class="scene" id="pipeline" aria-label="Systems pipeline: input, processing, validation, policy, evidence, output.">
  <div class="scene-pin">
    <div class="wrap">
      <p class="eyebrow mono">§ 00 — THE PIPELINE EVERY SYSTEM SHARES</p>
      <div class="rail" aria-hidden="true"><span class="rail-line"></span><span class="packet"></span></div>
      <ol class="stations">
        ${PIPELINE.map(
          (s, i) => `<li class="station" style="--i:${i}" tabindex="0" aria-label="${esc(`Stage ${s.n}: ${s.name}. ${s.d}`)}" data-desc="${esc(s.d)}">
          <span class="station-num mono">[${s.n}]</span>
          <span class="station-body">
            <span class="station-name">${s.name}</span>
            <span class="station-sub mono">${esc(s.sub)}</span>
          </span>
          <span class="station-tip" role="presentation">${esc(s.d)}</span>
        </li>`
        ).join("")}
      </ol>
      <p class="station-readout mono" aria-hidden="true" data-readout>&gt; awaiting input</p>
    </div>
  </div>
</section>`;
```

- [ ] **Step 5: Update `projectCard`**

Change the opening `<article …>` line and the index span to:

```js
<article class="project-card wipe ${isSubstrate ? "card-substrate" : ""}" id="card-${p.slug}" data-panel aria-labelledby="pc-${p.slug}">
  <div class="pc-head">
    <span class="pc-index mono" aria-hidden="true">[${idx}]</span>
```

(everything else in `projectCard` stays as is — `rv` is removed from the article because the wipe replaces it).

- [ ] **Step 6: Rewrite the hero section inside `indexPage`**

Replace everything from `<!-- ==== 1 · IDENTITY ==== -->` through the closing `</section>` of the hero (which currently ends after `${heroPipeline()}`) with:

```js
<!-- ============================ 1 · IDENTITY ============================ -->
<section class="hero" aria-labelledby="hero-h">
  <canvas class="hero-graph" id="graph" aria-hidden="true"></canvas>
  <div class="hero-texture" aria-hidden="true"></div>
  ${graphScript(graphData(projects))}
  <div class="wrap hero-inner">
    ${bootBlock(bootLines({ site, projects, heroMetrics }))}
    <p class="eyebrow mono rv" data-hero style="--d:.05s">${esc(site.name)} · ${esc(site.title)} · ${esc(site.location)}</p>
    <h1 class="hero-h" id="hero-h">
      <span class="line-mask" data-hero style="--d:.12s">Systems that know what they are</span>
      <span class="line-mask" data-hero style="--d:.22s"><em>allowed to do</em>, know when they are</span>
      <span class="line-mask" data-hero style="--d:.32s"><em>uncertain</em>, preserve evidence, and</span>
      <span class="line-mask" data-hero style="--d:.42s"><em>fail safely.</em></span>
    </h1>
    <div class="hero-lede-row rv" data-hero style="--d:.55s">
      <p class="hero-lede">${esc(site.positioning)}</p>
      <div class="hero-ctas">
        <a class="btn btn-ink" href="#work">View the work ${icon("arrowDown")}</a>
        <a class="btn btn-quiet" href="/assets/Bereket_Tilahun_Resume.pdf" download>Download résumé ${icon("download")}</a>
      </div>
    </div>

    <!-- ======================== 2 · PROOF STRIP ======================== -->
    <div class="proof rv" data-hero style="--d:.7s" aria-label="Selected verified metrics — activate any figure for its evidence">
      <p class="proof-head mono">${icon("info", "icon-xs")} VERIFIED FIGURES — ACTIVATE ANY NUMBER FOR ITS CHAIN</p>
      <div class="proof-grid">
        ${heroMetrics
          .map(
            (m) => `<button class="proof-item prov-trigger" type="button" data-evidence="${esc(m.id)}" aria-haspopup="dialog">
              <span class="proof-value tnum" ${/^[\d,]+$/.test(m.value) ? `data-count="${esc(m.value)}"` : "data-decode"}>${esc(m.value)}</span>
              <span class="proof-label">${esc(m.label)}</span>
              <span class="proof-context">${md(m.context)}</span>
            </button>`
          )
          .join("")}
      </div>
    </div>
  </div>
</section>

${pipelineScene()}
```

- [ ] **Step 7: Wrap the work stack with the sticky index**

In the WORK section replace

```js
    <div class="project-stack">
      ${projects.map((p, i) => projectCard(p, i)).join("")}
    </div>
```

with

```js
    <div class="work-layout">
      <ol class="work-index mono" aria-label="Featured work index">
        ${projects.map((p, i) => `<li><a href="#card-${p.slug}" data-index-for="card-${p.slug}">[${String(i + 1).padStart(2, "0")}] ${esc(p.name)}</a></li>`).join("")}
      </ol>
      <div class="project-stack">
        ${projects.map((p, i) => projectCard(p, i)).join("")}
      </div>
    </div>
```

- [ ] **Step 8: Principles track and timeline rail**

In the ENGINEERING section replace `<ol class="principles">` … `</ol>` with:

```js
    <div class="principles-track" data-track>
    <ol class="principles">
      ${principles
        .map(
          (pr, i) => `<li class="principle rv" style="--i:${i}">
            <span class="principle-num mono" aria-hidden="true">[${String(i + 1).padStart(2, "0")}]</span>
            <div>
              <h3 class="principle-title">${esc(pr.title)}</h3>
              <p class="principle-body">${md(pr.body)}</p>
              <p class="principle-src mono">${icon("branch", "icon-xs")} ${esc(pr.source)}</p>
            </div>
          </li>`
        )
        .join("")}
    </ol>
    </div>
```

and replace `<ol class="modes">` … `</ol>` with:

```js
      <div class="modes-wrap">
      <span class="modes-rail" aria-hidden="true"></span>
      <ol class="modes">
        ${timeline
          .map(
            (t) => `<li class="mode rv kind-${t.kind}">
              <div class="mode-rail" aria-hidden="true"><span class="mode-dot"></span></div>
              <div class="mode-body">
                <div class="mode-meta"><span class="mode-kind mono">${esc(t.mode)}</span><span class="mode-range mono">${esc(t.range)}</span></div>
                <h4 class="mode-heading">${esc(t.heading)}</h4>
                <p class="mode-text">${md(t.body)}</p>
                ${t.href ? `<a class="text-link" href="${t.href}">See the systems ${icon("arrow", "icon-xs")}</a>` : ""}
              </div>
            </li>`
          )
          .join("")}
      </ol>
      </div>
```

- [ ] **Step 9: Contact scan spans**

In the CONTACT section, add `<span class="scan" aria-hidden="true"></span>` as the first child of each of the four `<a class="contact-card" …>` elements, e.g.:

```js
      <a class="contact-card" href="mailto:${esc(site.email)}">
        <span class="scan" aria-hidden="true"></span>
        ${icon("mail")}<span class="cc-label mono">EMAIL</span><span class="cc-value">${esc(site.email)}</span>
      </a>
```

- [ ] **Step 10: Run tests**

Run: `node --test tests/`
Expected: all pass (ops 5, build 5, components 2, home 6).

- [ ] **Step 11: Commit**

```bash
git add build.mjs tests/home.test.mjs
git commit -m "feat: home markup hooks for boot hero, pipeline scene, work index, tracks

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Case-study, résumé and 404 markup hooks

**Files:**
- Modify: `build.mjs` — `caseSections` (TOC + sections), `casePage` (hero), `notFoundPage`
- Test: `tests/pages.test.mjs`

**Interfaces:**
- `.cs-toc a > .toc-bar` (progress hairline, `--p` set by JS).
- `.cs-sec.rv.rv-clip` sections.
- `.cs-hero-flow[data-draw]` — flow line draws on load.
- 404: `[data-boot]` readout via `bootBlock`.

- [ ] **Step 1: Write the failing test**

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
let cs, nf, resume;
before(() => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" });
  cs = read("work/ledger-sense.html");
  nf = read("404.html");
  resume = read("resume.html");
});

test("case study: TOC bars, clip sections, hero flow draws on load", () => {
  assert.equal((cs.match(/<span class="toc-bar" aria-hidden="true"><\/span>/g) || []).length, 12);
  assert.equal((cs.match(/<section class="cs-sec rv rv-clip"/g) || []).length, 12);
  assert.match(cs, /<div class="cs-hero-flow rv" data-draw/);
  assert.match(cs, /<div class="hero-texture" aria-hidden="true"><\/div>/);
  assert.doesNotMatch(cs, /hero-grid-bg/);
});

test("404 renders a route-refused readout from bootBlock", () => {
  assert.match(nf, /<pre class="boot mono" data-boot>/);
  assert.match(nf, /&gt; route lookup \.+ refused/);
  assert.match(nf, /&gt; policy \.+ fail closed/);
  assert.match(nf, /&gt; exit 404/);
  assert.match(nf, /href="\/">Back to the homepage<\/a>/);
});

test("résumé keeps light motion: reveals only, no scenes", () => {
  assert.doesNotMatch(resume, /data-track|data-boot|class="scene"/);
  assert.ok((resume.match(/class="rv/g) || []).length >= 4);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/pages.test.mjs`
Expected: FAIL on all three.

- [ ] **Step 3: Case-study TOC and sections**

In `caseSections`, change the TOC list item template to:

```js
      ${toc.map(([id, label]) => `<li><a href="#${id}"><span class="toc-bar" aria-hidden="true"></span>${esc(label)}</a></li>`).join("")}
```

and change every `<section class="cs-sec rv"` (12 occurrences) to `<section class="cs-sec rv rv-clip"`:

```bash
sed -i 's/<section class="cs-sec rv"/<section class="cs-sec rv rv-clip"/g' build.mjs
```

- [ ] **Step 4: Case hero**

In `casePage`, replace `<div class="hero-grid-bg" aria-hidden="true"></div>` with `<div class="hero-texture" aria-hidden="true"></div>` and change

```js
    <div class="cs-hero-flow rv" style="--d:.46s">
```
to
```js
    <div class="cs-hero-flow rv" data-draw style="--d:.46s">
```

- [ ] **Step 5: 404 readout**

Replace `notFoundPage` with:

```js
const notFoundPage = () =>
  page({
    title: "Not found — Bereket Tilahun",
    desc: "This route does not exist.",
    path: "/404.html",
    bodyClass: "page-404",
    main: `
<section class="section nf">
  <div class="wrap">
    ${bootBlock([
      "> route lookup ........... refused",
      "> policy ................. fail closed",
      "> exit 404",
    ])}
    <p class="eyebrow mono rv">404 — NO ROUTE</p>
    <h1 class="cs-title rv" style="--d:.08s">This page refuses to load.</h1>
    <p class="rv" style="--d:.16s">Fail-closed, in the spirit of the rest of the site. <a class="text-link" href="/">Back to the homepage</a>.</p>
  </div>
</section>`,
  });
```

- [ ] **Step 6: Run tests**

Run: `node --test tests/`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add build.mjs tests/pages.test.mjs
git commit -m "feat: case-study TOC progress, clip reveals, 404 readout hooks

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: CSS foundation (tokens, reset, type, shell, primitives, motion safety)

This task **overwrites** `site/assets/css/style.css`. Tasks 8 and 9 append to it. A CSS-invariant test guards the no-JS/reduced-motion promise: any rule that hides content (`opacity: 0`, `visibility: hidden`, `clip-path: inset(… 100% …)`) must sit under a `.motion` selector, except a short allow-list of things that are legitimately hidden until interaction (drawer, mobile nav, curtain, station tips, scan sweep, stamps' pre-state, TOC bars, packet).

**Files:**
- Rewrite: `site/assets/css/style.css`
- Test: `tests/css.test.mjs`

- [ ] **Step 1: Write the failing invariant test**

`tests/css.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "site/assets/css/style.css"), "utf8");

// Flatten @media wrappers and drop @keyframes bodies, then split into
// `selector { declarations }` blocks.
const flat = css
  .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "")
  .replace(/@media[^{]*\{/g, "")
  .replace(/@view-transition[^{]*\{[^}]*\}/g, "");
const blocks = [];
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(flat))) blocks.push({ sel: m[1].trim(), decl: m[2] });

const HIDING = /(^|;)\s*(opacity\s*:\s*0(?![.\d])|visibility\s*:\s*hidden|clip-path\s*:\s*inset\([^)]*100%)/;
const ALLOW = /\.drawer-root(?!\.open)|\.drawer-backdrop|\.mobile-nav\[hidden\]|\.curtain|\.station-tip|\.scan|\.toc-bar|\.packet/;

test("every hiding rule is gated behind .motion (no-JS and reduced-motion stay visible)", () => {
  const offenders = blocks
    .filter((b) => HIDING.test(b.decl))
    .filter((b) => !b.sel.split(",").every((s) => /\.motion\b/.test(s)))
    .filter((b) => !ALLOW.test(b.sel));
  assert.deepEqual(offenders.map((b) => b.sel), []);
});

test("uses the approved dark tokens and drops the paper palette", () => {
  for (const t of ["#0a0b0d", "#111317", "#181b21", "#e8eaed", "#a6abb4", "#5cf28a", "#2f8a4f", "#f2c14e", "#ff6b57", "#7cc4ff"]) {
    assert.ok(css.includes(t), `missing token ${t}`);
  }
  assert.ok(!css.includes("#f6f4ee") && !css.includes("#a34e22"));
});

test("reduced motion disables animations, smooth scroll and the view transition", () => {
  const rm = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(rm, /animation:\s*none/);
  assert.match(rm, /scroll-behavior:\s*auto/);
  assert.match(rm, /@view-transition\s*\{\s*navigation:\s*none/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/css.test.mjs`
Expected: FAIL — paper tokens present, `.js .rv` hiding rules not under `.motion`.

- [ ] **Step 3: Write the foundation chunk (overwrite the file)**

```css
/* ============================================================================
   Bereket Tilahun — portfolio design system · DARK OPS
   terminal readouts × security operations × instrument panel. WCAG 2.2 AA.

   Motion contract: every "hidden until revealed" state lives under `.motion`.
   main.js adds `.motion` to <html> only when GSAP loaded AND the user has not
   asked for reduced motion.  Without it the page is fully visible and static.
   `.js` is added whenever main.js runs (drawer, nav, etc.).
   ========================================================================== */

/* ---------------------------------------------------------------- tokens */
:root {
  --base: #0a0b0d;
  --raised: #111317;
  --card: #181b21;
  --hair: rgba(255, 255, 255, .08);
  --hair-2: rgba(255, 255, 255, .12);

  --ink: #e8eaed;
  --ink-2: #a6abb4;
  --ink-3: #6f7580;            /* decoration / ≥1.5rem text only */

  --accent: #5cf28a;           /* phosphor — ≥ 7:1 on base */
  --accent-dim: #2f8a4f;
  --accent-wash: rgba(92, 242, 138, .08);
  --warn: #f2c14e;  --warn-wash: rgba(242, 193, 78, .1);
  --crit: #ff6b57;  --crit-wash: rgba(255, 107, 87, .1);
  --info: #7cc4ff;  --info-wash: rgba(124, 196, 255, .1);

  --serif: "Newsreader", "Iowan Old Style", Georgia, serif;
  --sans: "Geist", "Segoe UI", system-ui, -apple-system, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "Cascadia Mono", "Courier New", monospace;

  --fs--1: .75rem;
  --fs-0: .9375rem;
  --fs-1: 1.0625rem;
  --fs-2: 1.25rem;
  --fs-3: clamp(1.4rem, 1.1rem + .9vw, 1.75rem);
  --fs-4: clamp(1.7rem, 1.3rem + 1.4vw, 2.35rem);
  --fs-hero: clamp(2.2rem, 1rem + 4.2vw, 4.4rem);

  --wrap: 78rem;
  --gutter: clamp(1rem, 4vw, 2.5rem);
  --sect: clamp(4.5rem, 9vw, 8.5rem);
  --head-h: 4rem;
  --radius: 4px;

  --ease: cubic-bezier(.22, .61, .21, 1);
  --ease-io: cubic-bezier(.65, 0, .35, 1);
  --t-fast: 160ms;
  --t-med: 280ms;
  --t-slow: 640ms;
}

/* ------------------------------------------------------------------ reset */
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; background: var(--base); }
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }
body {
  margin: 0;
  background: var(--base);
  color: var(--ink);
  font-family: var(--sans);
  font-size: var(--fs-0);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
img, svg, canvas { display: block; max-width: 100%; }
h1, h2, h3, h4, p, dl, dd, figure, pre { margin: 0; }
ul, ol { margin: 0; padding: 0; list-style: none; }
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
code, pre { font-family: var(--mono); }
::selection { background: var(--accent); color: var(--base); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }

/* --------------------------------------------------------- MPA transitions */
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: 220ms var(--ease-io) both vt-out; }
::view-transition-new(root) { animation: 320ms var(--ease) both vt-in; }
@keyframes vt-out { to { opacity: 0; transform: translateY(-6px); } }
@keyframes vt-in { from { opacity: 0; transform: translateY(10px); } }
.curtain {
  position: fixed; inset: 0; z-index: 90; pointer-events: none;
  background: var(--raised);
  transform: scaleY(0); transform-origin: bottom;
  border-top: 1px solid var(--accent);
}

/* -------------------------------------------------------------- utilities */
.wrap { width: min(100% - 2 * var(--gutter), var(--wrap)); margin-inline: auto; }
.mono { font-family: var(--mono); font-weight: 500; letter-spacing: .02em; }
.tnum { font-variant-numeric: tabular-nums; }
.icon { width: 1.1em; height: 1.1em; display: inline-block; vertical-align: -.2em; flex: none; }
.icon-xs { width: .9em; height: .9em; }
.eyebrow {
  font-family: var(--mono); font-weight: 500; font-size: var(--fs--1);
  letter-spacing: .12em; text-transform: uppercase; color: var(--accent);
  display: inline-flex; align-items: center; gap: .6em; position: relative;
}
.eyebrow::after {
  content: ""; width: 3rem; height: 1px; background: var(--accent-dim);
  transform: scaleX(0); transform-origin: left; transition: transform var(--t-slow) var(--ease) .2s;
}
.in-view.eyebrow::after, .in-view .eyebrow::after { transform: scaleX(1); }
html:not(.motion) .eyebrow::after { transform: scaleX(1); }
.text-link { color: var(--accent); border-bottom: 1px dashed var(--accent-dim); transition: border-color var(--t-fast); }
.text-link:hover { border-bottom-style: solid; }
.skip-link {
  position: absolute; left: 1rem; top: -4rem; z-index: 100;
  background: var(--accent); color: var(--base); font-family: var(--mono);
  padding: .6rem .9rem; border-radius: var(--radius); transition: top var(--t-fast);
}
.skip-link:focus { top: 1rem; }
.section { padding-block: var(--sect); position: relative; }
.section + .section { border-top: 1px solid var(--hair); }
.section-head { max-width: 46rem; margin-bottom: clamp(2rem, 5vw, 3.5rem); }
.section-title { font-size: var(--fs-4); font-weight: 500; letter-spacing: -.02em; line-height: 1.15; margin-top: .9rem; }
.section-intro { color: var(--ink-2); font-size: var(--fs-1); margin-top: 1rem; }
.section-intro code, .pc-status-detail code, p code, li code {
  font-size: .9em; color: var(--ink); background: var(--card); border: 1px solid var(--hair);
  padding: .05em .35em; border-radius: 3px;
}

/* --------------------------------------------------------------- reveals */
.line-mask { display: block; }
.motion .rv {
  opacity: 0; transform: translateY(14px);
  transition: opacity .6s var(--ease), transform .6s var(--ease);
  transition-delay: calc(var(--d, 0s) + var(--i, 0) * 60ms);
}
.motion .rv.in-view { opacity: 1; transform: none; }
.motion .line-mask {
  clip-path: inset(0 0 100% 0); transform: translateY(.35em);
  transition: clip-path .7s var(--ease), transform .7s var(--ease);
  transition-delay: var(--d, 0s);
}
.motion .line-mask.in-view { clip-path: inset(-10% 0 -10% 0); transform: none; }
.motion .rv-clip { transform: none; clip-path: inset(0 0 100% 0); transition: clip-path .8s var(--ease-io), opacity .4s; }
.motion .rv-clip.in-view { clip-path: inset(0); }

/* ---------------------------------------------------------------- buttons */
.btn {
  display: inline-flex; align-items: center; gap: .5rem;
  font-family: var(--mono); font-weight: 500; font-size: var(--fs--1);
  letter-spacing: .08em; text-transform: uppercase;
  padding: .8rem 1.15rem; border-radius: var(--radius); border: 1px solid transparent;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
  will-change: transform;
}
.btn-ink { background: var(--accent); color: var(--base); }
.btn-ink:hover { background: #7ff5a2; }
.btn-quiet { border-color: var(--hair-2); color: var(--ink); }
.btn-quiet:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-wash); }
.btn-sm { padding: .5rem .8rem; }

/* ----------------------------------------------------------------- badges */
.badge {
  display: inline-flex; align-items: center; gap: .5rem;
  font-family: var(--mono); font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
  padding: .35rem .6rem; border: 1px solid var(--hair-2); border-radius: var(--radius); white-space: nowrap;
}
.badge-glyph { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; flex: none; }
.badge-glyph.pulse { animation: glyph-pulse 1.8s ease-in-out infinite; }
.badge-glyph.static { border-radius: 1px; }
@keyframes glyph-pulse { 0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; } 50% { box-shadow: 0 0 0 4px transparent; opacity: .55; } }
.st-running { color: var(--accent); border-color: var(--accent-dim); background: var(--accent-wash); }
.st-active { color: var(--info); border-color: rgba(124, 196, 255, .4); background: var(--info-wash); }
.st-pending { color: var(--warn); border-color: rgba(242, 193, 78, .4); background: var(--warn-wash); }
.st-design { color: var(--ink-2); }
.st-planned { color: var(--ink-2); border-style: dashed; }

/* ------------------------------------------------------------------ chips */
.chip {
  display: inline-flex; align-items: center; gap: .45rem;
  font-size: var(--fs--1); padding: .4rem .65rem; border: 1px solid var(--hair-2); border-radius: var(--radius);
  color: var(--ink-2);
}
.chip-link { color: var(--ink); transition: border-color var(--t-fast), color var(--t-fast); }
.chip-link:hover { border-color: var(--accent); color: var(--accent); }
.chip-muted { border-style: dashed; }
.tech-chip { display: inline-block; font-size: var(--fs--1); padding: .3rem .55rem; border: 1px solid var(--hair); border-radius: var(--radius); color: var(--ink-2); margin: 0 .4rem .4rem 0; }

/* ----------------------------------------------------------------- header */
.progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 60; pointer-events: none; }
.progress-bar { display: block; height: 100%; background: var(--accent); transform: scaleX(0); transform-origin: left; }
.site-head {
  position: sticky; top: 0; z-index: 50;
  background: rgba(10, 11, 13, .82); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid transparent; transition: border-color var(--t-med), background var(--t-med);
}
.site-head.scrolled { border-bottom-color: var(--hair); background: rgba(10, 11, 13, .92); }
.head-row { display: flex; align-items: center; gap: 1.5rem; min-height: var(--head-h); }
.brand { display: flex; align-items: center; gap: .75rem; margin-right: auto; }
.brand-mark {
  width: 2.1rem; height: 2.1rem; display: grid; place-items: center;
  border: 1px solid var(--accent); color: var(--accent); border-radius: var(--radius); font-weight: 600;
}
.brand-name { font-weight: 500; }
.brand-role { font-size: var(--fs--1); color: var(--ink-2); }
.site-nav { display: flex; gap: 1.6rem; }
.site-nav a, .mobile-nav a {
  font-family: var(--mono); font-weight: 500; font-size: var(--fs--1); letter-spacing: .08em; text-transform: uppercase;
  color: var(--ink-2); transition: color var(--t-fast);
}
.site-nav a::before { content: "/ "; color: var(--ink-3); }
.site-nav a:hover, .mobile-nav a:hover { color: var(--accent); }
.head-utils { display: flex; align-items: center; gap: .6rem; }
.util-icon { display: grid; place-items: center; width: 2.1rem; height: 2.1rem; border-radius: var(--radius); color: var(--ink-2); transition: color var(--t-fast), background var(--t-fast); }
.util-icon:hover { color: var(--accent); background: var(--accent-wash); }
.menu-btn { display: none; width: 2.4rem; height: 2.4rem; place-items: center; color: var(--ink); }
.mobile-nav { border-top: 1px solid var(--hair); background: var(--raised); }
.mobile-nav nav { display: grid; padding: .5rem var(--gutter) 1rem; }
.mobile-nav a { padding: .75rem 0; border-bottom: 1px solid var(--hair); }

/* ----------------------------------------------------------------- footer */
.site-foot { border-top: 1px solid var(--hair); background: var(--raised); padding-block: 3.5rem 2rem; color: var(--ink-2); font-size: var(--fs--1); }
.foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.4fr; gap: 2rem; }
.foot-col { display: grid; align-content: start; gap: .5rem; }
.foot-col a { color: var(--ink-2); transition: color var(--t-fast); }
.foot-col a:hover { color: var(--accent); }
.foot-h { font-size: .7rem; letter-spacing: .12em; color: var(--accent); margin-bottom: .4rem; }
.foot-brand p { max-width: 28ch; }
.foot-availability { color: var(--ink); }
.foot-base { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 3rem; padding-top: 1.2rem; border-top: 1px solid var(--hair); font-size: .7rem; letter-spacing: .05em; }

/* ------------------------------------------------------------ hero texture */
.hero-texture {
  position: absolute; inset: 0; pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgba(255, 255, 255, .028) 0 1px, transparent 1px 3px),
    radial-gradient(rgba(255, 255, 255, .07) 1px, transparent 1.2px) 0 0 / 24px 24px;
  -webkit-mask-image: radial-gradient(ellipse at 65% 40%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse at 65% 40%, #000 20%, transparent 75%);
}
```

- [ ] **Step 4: Run the CSS test**

Run: `node --test tests/css.test.mjs`
Expected: token test passes; hiding-rule test passes; the reduced-motion test FAILS (that block arrives in Task 9). That single failure is expected until Task 9.

- [ ] **Step 5: Commit**

```bash
git add site/assets/css/style.css tests/css.test.mjs
git commit -m "feat(css): dark-ops foundation — tokens, shell, primitives, motion contract

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: CSS — home scenes

Append to `site/assets/css/style.css`.

**Files:**
- Modify (append): `site/assets/css/style.css`

- [ ] **Step 1: Append the home chunk**

```css
/* ======================================================================== HOME */

/* ------------------------------------------------------------------- hero */
.hero { position: relative; overflow: hidden; padding: calc(var(--sect) * .8) 0 var(--sect); min-height: 88vh; display: flex; align-items: center; }
.hero-graph { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .6; pointer-events: none; }
.hero-inner { position: relative; z-index: 1; display: grid; gap: 1.6rem; }
.hero-h { font-size: var(--fs-hero); font-weight: 500; line-height: 1.04; letter-spacing: -.025em; max-width: 15ch; }
.hero-h em { font-family: var(--serif); font-style: italic; font-weight: 400; color: var(--accent); letter-spacing: 0; }
.hero-lede-row { display: grid; grid-template-columns: minmax(0, 40rem) auto; gap: 2rem; align-items: end; }
.hero-lede { color: var(--ink-2); font-size: var(--fs-1); }
.hero-ctas { display: flex; gap: .75rem; flex-wrap: wrap; }

/* boot sequence */
.boot {
  font-size: var(--fs--1); line-height: 1.7; color: var(--ink-2); white-space: pre-wrap;
  display: inline-block; padding: .9rem 1.1rem; border: 1px solid var(--hair); border-radius: var(--radius);
  background: rgba(17, 19, 23, .7); max-width: 100%;
}
.boot-line { display: block; }
.boot-line.typing::after { content: "▍"; color: var(--accent); }
.boot-caret { display: inline-block; width: .6em; height: 1em; background: var(--accent); vertical-align: -.15em; animation: caret 1s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }
.motion .boot-line { visibility: hidden; }
.motion .boot-line.typed { visibility: visible; }

/* verified figures */
.proof { margin-top: 1.5rem; border: 1px solid var(--hair); border-radius: var(--radius); background: rgba(17, 19, 23, .75); }
.proof-head { font-size: .7rem; letter-spacing: .12em; color: var(--accent); padding: .7rem 1rem; border-bottom: 1px solid var(--hair); display: flex; gap: .5rem; align-items: center; }
.proof-grid { display: grid; grid-template-columns: repeat(6, 1fr); }
.proof-item {
  text-align: left; display: grid; gap: .3rem; align-content: start; padding: 1rem;
  border-right: 1px solid var(--hair); transition: background var(--t-fast);
}
.proof-item:last-child { border-right: 0; }
.proof-item:hover { background: var(--accent-wash); }
.proof-value {
  font-family: var(--mono); font-weight: 500; font-size: clamp(1.4rem, 1rem + 1.2vw, 1.9rem); color: var(--accent);
  letter-spacing: -.02em; line-height: 1.1; position: relative; width: max-content; max-width: 100%;
}
.proof-value::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -3px; height: 1px;
  background: repeating-linear-gradient(90deg, var(--accent-dim) 0 4px, transparent 4px 7px);
  transform: scaleX(0); transform-origin: left; transition: transform .8s var(--ease) .3s;
}
.in-view .proof-value::after, html:not(.motion) .proof-value::after { transform: scaleX(1); }
.proof-label { font-size: var(--fs--1); color: var(--ink); text-transform: uppercase; letter-spacing: .06em; font-family: var(--mono); }
.proof-context { font-size: .8rem; color: var(--ink-2); line-height: 1.45; }

/* ---------------------------------------------------------- pipeline scene */
.scene { border-top: 1px solid var(--hair); background: var(--raised); }
.scene-pin { min-height: 100vh; display: flex; align-items: center; padding-block: 3rem; }
.scene .eyebrow { margin-bottom: 2.5rem; }
.rail { position: relative; height: 1px; margin: 0 1.5rem 2.2rem; background: var(--hair-2); }
.rail-line { position: absolute; inset: 0; background: linear-gradient(90deg, var(--accent-dim), transparent); opacity: .5; }
.packet {
  position: absolute; top: 50%; left: calc(var(--x, 0) * 1%); width: 10px; height: 10px; margin: -5px 0 0 -5px;
  border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px 2px rgba(92, 242, 138, .55);
}
.stations { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; }
.station {
  display: grid; gap: .5rem; padding: 1rem; border: 1px solid var(--hair); border-radius: var(--radius);
  background: var(--card); opacity: .5; transition: opacity var(--t-med), border-color var(--t-med), transform var(--t-med);
  position: relative;
}
.station:focus-visible, .station:hover { opacity: 1; }
.station.lit { opacity: 1; border-color: var(--accent-dim); transform: translateY(-4px); }
.station-num { font-size: var(--fs--1); color: var(--accent); }
.station-name { display: block; font-weight: 500; }
.station-sub { display: block; font-size: .72rem; color: var(--ink-2); line-height: 1.4; }
.station-tip { font-size: .8rem; color: var(--ink-2); display: none; }
.station.lit .station-tip, .station:focus-visible .station-tip, .station:hover .station-tip { display: block; }
.station-readout { font-size: var(--fs--1); color: var(--ink-2); min-height: 1.6em; }
.station-readout::after { content: "▍"; color: var(--accent); animation: caret 1s steps(1) infinite; }

/* ------------------------------------------------------------------- work */
.status-legend { margin-bottom: 2.5rem; padding: 1.2rem; border: 1px solid var(--hair); border-radius: var(--radius); background: var(--raised); }
.legend-title { font-size: .7rem; letter-spacing: .12em; color: var(--accent); margin-bottom: 1rem; }
.legend-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
.legend-grid dt { margin-bottom: .4rem; }
.legend-grid dd { font-size: var(--fs--1); color: var(--ink-2); }
.work-layout { display: grid; grid-template-columns: 12rem minmax(0, 1fr); gap: 2.5rem; align-items: start; }
.work-index { position: sticky; top: calc(var(--head-h) + 1.5rem); display: grid; gap: .5rem; font-size: var(--fs--1); }
.work-index a { color: var(--ink-2); display: block; padding: .3rem 0 .3rem .75rem; border-left: 1px solid var(--hair); transition: color var(--t-fast), border-color var(--t-fast); }
.work-index a.current { color: var(--accent); border-left-color: var(--accent); }
.project-stack { display: grid; gap: 2rem; }
.project-card {
  background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius); padding: clamp(1.2rem, 3vw, 2rem);
  display: grid; gap: 1.4rem;
}
.motion .wipe { clip-path: inset(0 100% 0 0); transition: clip-path .9s var(--ease-io); }
.motion .wipe.in-view { clip-path: inset(0); }
.project-card.in-view .badge { animation: badge-pop .5s var(--ease) .6s both; }
@keyframes badge-pop { 0% { transform: scale(.85); opacity: 0; } 60% { transform: scale(1.06); } 100% { transform: none; opacity: 1; } }
.pc-head { display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap; }
.pc-index { color: var(--accent); font-size: var(--fs-2); }
.pc-titlebox { flex: 1; min-width: 14rem; }
.pc-tagline { font-size: .72rem; color: var(--ink-2); letter-spacing: .08em; text-transform: uppercase; }
.pc-name { font-size: var(--fs-3); font-weight: 500; letter-spacing: -.02em; margin-top: .2rem; }
.pc-status-detail { color: var(--ink-2); font-size: var(--fs--1); }
.pc-statement { font-size: var(--fs-1); max-width: 62ch; }
.pc-lower { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.pc-lower-h { font-size: .7rem; letter-spacing: .12em; color: var(--accent); margin-bottom: .4rem; display: flex; gap: .4rem; align-items: center; }
.pc-caveat .pc-lower-h { color: var(--warn); }
.pc-lower p { color: var(--ink-2); font-size: var(--fs--1); }
.pc-foot { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; border-top: 1px solid var(--hair); padding-top: 1.2rem; }
.pc-chips { display: flex; gap: .5rem; flex-wrap: wrap; }

/* flow stepper (horizontal ≥64em, vertical below) */
.flow { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: .75rem; padding-top: 1.1rem; }
.flow-line { position: absolute; left: 0; right: 0; top: 0; height: 2px; width: 100%; overflow: visible; }
.flow-line line { stroke: var(--accent); stroke-width: 2; vector-effect: non-scaling-stroke; stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--draw, 1)); }
.flow-line .fl-v { display: none; }
.flow-node { display: grid; gap: .4rem; font-size: var(--fs--1); }
.flow-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--base); border: 1.5px solid var(--accent); margin-top: -1.2rem; }
.flow-label { color: var(--ink-2); font-family: var(--mono); font-size: .72rem; line-height: 1.4; }

/* substrate diagram */
.substrate { display: grid; gap: .6rem; }
.substrate-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; }
.substrate-app, .substrate-cell { border: 1px solid var(--hair); border-radius: var(--radius); padding: .7rem .8rem; background: var(--raised); font-size: var(--fs--1); display: grid; gap: .2rem; }
.substrate-app .mono { color: var(--accent); font-size: .7rem; letter-spacing: .1em; }
.substrate-app em, .substrate-cell em { font-style: normal; color: var(--ink-2); font-size: .78rem; }
.substrate-links { display: grid; grid-template-columns: repeat(3, 1fr); height: 1.4rem; }
.substrate-links span { justify-self: center; width: 1px; height: 100%; background: var(--accent); transform-origin: top; transition: transform .7s var(--ease) .5s; }
.motion .substrate-links span { transform: scaleY(0); }
.motion .in-view .substrate-links span { transform: scaleY(1); }
.substrate-core { border: 1px solid var(--accent-dim); border-radius: var(--radius); padding: .8rem; background: var(--accent-wash); display: grid; gap: .6rem; }
.substrate-core-head { display: flex; gap: .8rem; align-items: baseline; }
.substrate-core-head .mono { color: var(--accent); }
.substrate-core-sub { font-size: var(--fs--1); color: var(--ink-2); }
.substrate-cells { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; }
.substrate-cell .mono { color: var(--ink); font-size: .72rem; }

/* metrics */
.metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: 1rem; border-block: 1px solid var(--hair); padding-block: 1rem; }
.metric { display: grid; gap: .2rem; }
.metric-value { font-family: var(--mono); font-size: var(--fs-2); color: var(--accent); text-align: left; width: max-content; border-bottom: 1px dashed var(--accent-dim); transition: border-color var(--t-fast); }
.metric-value:hover { border-bottom-style: solid; }
.metric-label { font-size: .72rem; text-transform: uppercase; letter-spacing: .06em; font-family: var(--mono); }
.metric-context { font-size: .78rem; color: var(--ink-2); line-height: 1.45; }
.prov-inline { color: var(--accent); border-bottom: 1px dashed var(--accent-dim); }

/* --------------------------------------------------------------- evidence */
.claim-specimen { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start; }
.claim-code { background: var(--raised); border: 1px solid var(--hair); border-radius: var(--radius); overflow: auto; }
.claim-code-label { display: block; padding: .6rem .9rem; border-bottom: 1px solid var(--hair); font-size: .7rem; letter-spacing: .1em; color: var(--accent); }
.claim-code pre { padding: 1rem; font-size: .8rem; line-height: 1.6; color: var(--ink); }
.cl { display: inline; }
.motion .cl { opacity: 0; }
.motion .cl.on { opacity: 1; }
.cl.typing::after { content: "▍"; color: var(--accent); }
.claim-notes { display: grid; gap: 1rem; }
.rules { display: grid; gap: .8rem; }
.rule { display: grid; grid-template-columns: auto 1fr; gap: .8rem; align-items: start; color: var(--ink-2); font-size: var(--fs-0); }
.stamp {
  font-size: .62rem; letter-spacing: .14em; color: var(--accent); border: 1.5px solid var(--accent); border-radius: 2px;
  padding: .15rem .35rem; transform: rotate(-6deg); margin-top: .15rem;
}
.motion .stamp { opacity: 0; transform: rotate(-6deg) scale(1.7); transition: transform .28s cubic-bezier(.2, 1.4, .4, 1), opacity .18s; }
.motion .rule.stamped .stamp { opacity: 1; transform: rotate(-6deg) scale(1); }
.claim-try { color: var(--ink-2); font-size: var(--fs--1); }

/* ------------------------------------------------------------- principles */
.principles-track { overflow: hidden; margin-inline: calc(-1 * var(--gutter)); padding-inline: var(--gutter); }
.principles { display: flex; gap: 1.25rem; width: max-content; padding-block: .5rem; }
.principle {
  width: clamp(18rem, 26vw, 24rem); flex: none; display: grid; grid-template-columns: auto 1fr; gap: 1rem;
  background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius); padding: 1.4rem;
}
.principle-num { color: var(--accent); font-size: var(--fs-2); }
.principle-title { font-size: var(--fs-2); font-weight: 500; letter-spacing: -.01em; }
.principle-body { color: var(--ink-2); font-size: var(--fs--1); margin-top: .5rem; }
.principle-src { color: var(--accent); font-size: .7rem; letter-spacing: .06em; margin-top: .8rem; display: flex; gap: .4rem; align-items: center; }
.subblock { margin-top: var(--sect); }
.subblock-h { font-size: var(--fs-3); font-weight: 500; display: flex; gap: .8rem; align-items: baseline; }
.subblock-intro { color: var(--ink-2); margin: .6rem 0 2rem; }

/* --------------------------------------------------------------- timeline */
.modes-wrap { position: relative; padding-left: 2.2rem; }
.modes-rail { position: absolute; left: .55rem; top: .4rem; bottom: .4rem; width: 1px; background: var(--accent); transform: scaleY(var(--draw, 1)); transform-origin: top; }
.modes { display: grid; gap: 2rem; }
.mode { position: relative; }
.mode-rail { position: absolute; left: -2.2rem; top: .5rem; width: 1.1rem; display: flex; justify-content: center; }
.mode-dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid var(--accent); background: var(--base); transition: background var(--t-med), box-shadow var(--t-med); }
.mode.lit .mode-dot, html:not(.motion) .mode-dot { background: var(--accent); box-shadow: 0 0 10px rgba(92, 242, 138, .6); }
.mode-meta { display: flex; gap: 1rem; font-size: .72rem; letter-spacing: .1em; text-transform: uppercase; }
.mode-kind { color: var(--accent); }
.mode-range { color: var(--ink-2); }
.mode-heading { font-size: var(--fs-2); font-weight: 500; margin: .3rem 0 .4rem; }
.mode-text { color: var(--ink-2); max-width: 70ch; }

/* --------------------------------------------------------- stack / about */
.stack-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
.stack-group { background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius); padding: 1.1rem; }
.stack-h { font-size: .7rem; letter-spacing: .12em; color: var(--accent); margin-bottom: .6rem; }
.stack-items { display: flex; flex-wrap: wrap; gap: .35rem; }
.stack-items li { font-size: .78rem; color: var(--ink-2); border: 1px solid var(--hair); border-radius: 3px; padding: .15rem .45rem; }
.about-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(16rem, 1fr); gap: 3rem; }
.about-p { color: var(--ink-2); margin-top: 1rem; max-width: 62ch; }
.about-edu { margin-top: 1.5rem; font-size: var(--fs--1); color: var(--ink-2); display: flex; gap: .5rem; align-items: center; }
.about-facts { background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius); padding: 1.4rem; align-self: start; }
.facts { display: grid; gap: .9rem; margin-top: 1rem; }
.facts dt { font-size: .68rem; letter-spacing: .12em; color: var(--accent); }
.facts dd { color: var(--ink); font-size: var(--fs--1); margin-top: .15rem; }

/* ---------------------------------------------------------------- contact */
.contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 1rem; }
.contact-card {
  position: relative; overflow: hidden; display: grid; gap: .5rem; padding: 1.3rem;
  background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius);
  transition: border-color var(--t-fast);
}
.contact-card:hover { border-color: var(--accent-dim); }
.contact-card .icon { color: var(--accent); width: 1.4rem; height: 1.4rem; }
.cc-label { font-size: .68rem; letter-spacing: .12em; color: var(--ink-2); }
.cc-value { font-size: var(--fs-0); display: flex; gap: .3rem; align-items: center; }
.scan {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(100deg, transparent 30%, rgba(92, 242, 138, .14) 50%, transparent 70%);
  transform: translateX(-100%);
}
.contact-card:hover .scan { transform: translateX(100%); transition: transform .7s var(--ease-io); }
.contact-avail { margin-top: 1.5rem; color: var(--ink-2); font-size: var(--fs--1); }
```

- [ ] **Step 2: Rebuild and re-run the CSS test**

Run: `node build.mjs && node --test tests/css.test.mjs`
Expected: build ok; hiding-rule and token tests pass (reduced-motion test still pending Task 9).

- [ ] **Step 3: Commit**

```bash
git add site/assets/css/style.css
git commit -m "feat(css): home scenes — boot hero, readouts, pipeline, dossiers, tracks

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: CSS — drawer, case study, résumé, 404, responsive, reduced motion

Append to `site/assets/css/style.css`.

**Files:**
- Modify (append): `site/assets/css/style.css`

- [ ] **Step 1: Append the secondary-pages chunk**

```css
/* =================================================================== DRAWER */
.drawer-root { position: fixed; inset: 0; z-index: 80; visibility: hidden; }
.drawer-root.open { visibility: visible; }
.drawer-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, .6); opacity: 0; transition: opacity var(--t-med); }
.drawer-root.open .drawer-backdrop { opacity: 1; }
.drawer {
  position: absolute; top: 0; right: 0; bottom: 0; width: min(30rem, 100%);
  background: var(--raised); border-left: 1px solid var(--hair-2); display: grid; grid-template-rows: auto 1fr auto;
  transition: transform .45s var(--ease-io);
}
.motion .drawer { transform: translateX(100%); }
.motion .drawer-root.open .drawer { transform: none; }
.drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid var(--hair); }
.drawer-eyebrow { font-size: .7rem; letter-spacing: .12em; color: var(--accent); }
.drawer-close { width: 2.2rem; height: 2.2rem; display: grid; place-items: center; border: 1px solid var(--hair-2); border-radius: var(--radius); }
.drawer-close:hover { border-color: var(--accent); color: var(--accent); }
.drawer-body { padding: 1.4rem 1.2rem; overflow: auto; display: grid; gap: 1.2rem; align-content: start; }
.drawer-foot { padding: 1rem 1.2rem; border-top: 1px solid var(--hair); font-size: .7rem; color: var(--ink-2); }
.ev-claim { font-size: var(--fs-1); }
.ev-chain { display: grid; gap: .6rem; font-family: var(--mono); font-size: var(--fs--1); }
.ev-row { display: grid; grid-template-columns: 6rem 1fr; gap: 1rem; padding: .5rem 0; border-bottom: 1px solid var(--hair); }
.motion .drawer-root.open .ev-row { animation: row-type .35s steps(14) both; animation-delay: calc(120ms + var(--i, 0) * 110ms); }
@keyframes row-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
.ev-k { color: var(--accent); text-transform: uppercase; letter-spacing: .1em; font-size: .68rem; }
.ev-v a { color: var(--accent); border-bottom: 1px dashed var(--accent-dim); }
.ev-method { padding: .1rem .4rem; border: 1px solid var(--hair-2); border-radius: 3px; }
.ev-method.m-DETERMINISTIC { color: var(--accent); border-color: var(--accent-dim); }
.ev-method.m-MODEL { color: var(--info); }
.ev-method.m-HUMAN { color: var(--warn); }
.ev-caveats { background: var(--warn-wash); border: 1px solid rgba(242, 193, 78, .35); border-radius: var(--radius); padding: .9rem 1rem; font-size: var(--fs--1); }
.ev-caveats-h { color: var(--warn); font-family: var(--mono); font-size: .7rem; letter-spacing: .1em; margin-bottom: .4rem; }
.ev-caveats li { color: var(--ink-2); padding-left: 1rem; position: relative; }
.ev-caveats li::before { content: ">"; position: absolute; left: 0; color: var(--warn); font-family: var(--mono); }
html.drawer-open { overflow: hidden; }

/* =============================================================== CASE STUDY */
.cs-hero { position: relative; overflow: hidden; padding: calc(var(--sect) * .7) 0 var(--sect); border-bottom: 1px solid var(--hair); }
.cs-hero .wrap { position: relative; z-index: 1; display: grid; gap: 1rem; }
.cs-title { font-size: var(--fs-hero); font-weight: 500; letter-spacing: -.025em; line-height: 1.05; }
.cs-tagline { color: var(--ink-2); font-size: var(--fs-2); max-width: 40ch; }
.cs-statement { font-family: var(--serif); font-style: italic; font-size: var(--fs-2); color: var(--accent); max-width: 48ch; }
.cs-meta { display: flex; gap: .8rem; align-items: center; flex-wrap: wrap; font-size: var(--fs--1); color: var(--ink-2); }
.meta-sep { color: var(--ink-3); }
.cs-hero-flow { max-width: 60rem; margin-top: 1rem; }
.cs-hero-tech { margin-top: .5rem; }
.cs-layout { display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 3rem; padding-block: var(--sect); align-items: start; }
.cs-toc { position: sticky; top: calc(var(--head-h) + 1.5rem); display: grid; gap: 1rem; }
.toc-h { font-size: .68rem; letter-spacing: .12em; color: var(--accent); }
.cs-toc ol { display: grid; gap: .1rem; counter-reset: toc; }
.cs-toc a {
  display: block; position: relative; padding: .35rem 0 .35rem .8rem; font-size: var(--fs--1); color: var(--ink-2);
  border-left: 1px solid var(--hair); transition: color var(--t-fast);
}
.cs-toc a::before { counter-increment: toc; content: "[" counter(toc, decimal-leading-zero) "] "; font-family: var(--mono); font-size: .7rem; color: var(--ink-3); }
.cs-toc a.current { color: var(--ink); }
.toc-bar { position: absolute; left: -1px; top: 0; bottom: 0; width: 1px; background: var(--accent); transform: scaleY(var(--p, 0)); transform-origin: top; }
.toc-back { justify-self: start; }
.cs-body { display: grid; gap: calc(var(--sect) * .7); }
.cs-sec { display: grid; gap: 1rem; scroll-margin-top: calc(var(--head-h) + 1rem); }
.cs-h { font-size: var(--fs-3); font-weight: 500; letter-spacing: -.02em; }
.cs-sec p, .bullets li { color: var(--ink-2); max-width: 70ch; }
.bullets { display: grid; gap: .6rem; }
.bullets li { padding-left: 1.2rem; position: relative; }
.bullets li::before { content: ">"; position: absolute; left: 0; color: var(--accent); font-family: var(--mono); }
.code-block { background: var(--raised); border: 1px solid var(--hair); border-radius: var(--radius); overflow: auto; }
.code-label { display: block; padding: .5rem .9rem; border-bottom: 1px solid var(--hair); font-size: .68rem; letter-spacing: .1em; color: var(--accent); }
.code-block pre { padding: 1rem; font-size: .78rem; line-height: 1.6; }
.decisions { display: grid; gap: 1rem; }
.decision { background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius); padding: 1.1rem 1.2rem; }
.decision dt { font-weight: 500; margin-bottom: .3rem; }
.decision dd { color: var(--ink-2); font-size: var(--fs--1); }
.status-block { display: grid; gap: .6rem; justify-items: start; padding: 1rem; border: 1px solid var(--hair); border-radius: var(--radius); background: var(--card); }
.repo-block { display: flex; gap: .6rem; flex-wrap: wrap; }
.repo-note { color: var(--ink-2); }
.pager { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding-block: 0 var(--sect); }
.pager-link { display: grid; gap: .4rem; padding: 1.3rem; background: var(--card); border: 1px solid var(--hair); border-radius: var(--radius); transition: border-color var(--t-fast); }
.pager-link:hover { border-color: var(--accent-dim); }
.pager-dir { font-size: .7rem; letter-spacing: .12em; color: var(--accent); }
.pager-name { font-size: var(--fs-2); font-weight: 500; transition: transform var(--t-med) var(--ease); }
.pager-next { text-align: right; }
.pager-prev:hover .pager-name { transform: translateX(-6px); }
.pager-next:hover .pager-name { transform: translateX(6px); }

/* =================================================================== RÉSUMÉ */
.resume-hero { border-bottom: 1px solid var(--hair); }
.resume-hero .wrap { display: grid; gap: 1rem; }
.resume-hero .btn { margin: .5rem .5rem 0 0; }
.resume-body { display: grid; gap: 3rem; max-width: 60rem; }
.resume-role { display: grid; gap: .6rem; }
.resume-role-head { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; flex-wrap: wrap; }
.resume-title { font-size: var(--fs-3); font-weight: 500; letter-spacing: -.02em; }
.resume-range, .resume-org { font-size: var(--fs--1); color: var(--ink-2); }
.resume-points li { color: var(--ink-2); }

/* ====================================================================== 404 */
.nf { min-height: 70vh; display: flex; align-items: center; }
.nf .wrap { display: grid; gap: 1rem; }
.nf p { color: var(--ink-2); }

/* =============================================================== RESPONSIVE */
@media (max-width: 63.99em) {
  .site-nav, .head-utils { display: none; }
  .menu-btn { display: grid; }
  .brand-role { display: none; }
  .foot-grid { grid-template-columns: 1fr 1fr; }
  .hero { min-height: auto; }
  .hero-lede-row { grid-template-columns: 1fr; }
  .proof-grid { grid-template-columns: repeat(2, 1fr); }
  .proof-item { border-bottom: 1px solid var(--hair); }
  .proof-item:nth-child(even) { border-right: 0; }
  .scene-pin { min-height: auto; }
  .scene .wrap { position: relative; }
  .rail { position: absolute; left: .55rem; top: 0; bottom: 0; width: 1px; height: auto; margin: 0; }
  .rail-line { background: linear-gradient(180deg, var(--accent-dim), transparent); }
  .packet { left: 50%; top: 0; margin: -5px 0 0 -5px; animation: packet-run 6s linear infinite paused; }
  .scene.live .packet { animation-play-state: running; }
  .stations { grid-template-columns: 1fr; padding-left: 2rem; }
  .work-layout { grid-template-columns: 1fr; }
  .work-index { display: none; }
  .pc-lower { grid-template-columns: 1fr; }
  .flow { grid-auto-flow: row; padding: 0 0 0 1.4rem; gap: .9rem; }
  .flow-line { top: 0; bottom: 0; left: 4px; right: auto; width: 2px; height: 100%; }
  .flow-line .fl-h { display: none; }
  .flow-line .fl-v { display: block; }
  .flow-node { position: relative; }
  .flow-dot { position: absolute; left: -1.4rem; top: .25rem; margin: 0; }
  .substrate-top, .substrate-cells { grid-template-columns: 1fr; }
  .substrate-links { display: none; }
  .claim-specimen { grid-template-columns: 1fr; }
  .principles-track { overflow: visible; margin: 0; padding: 0; }
  .principles { flex-direction: column; width: auto; }
  .principle { width: auto; }
  .about-grid { grid-template-columns: 1fr; }
  .cs-layout { grid-template-columns: 1fr; gap: 2rem; }
  .cs-toc { position: static; }
  .cs-toc ol { display: flex; gap: .3rem; overflow-x: auto; padding-bottom: .4rem; }
  .cs-toc a { white-space: nowrap; border-left: 0; border-bottom: 1px solid var(--hair); padding: .4rem .6rem; }
  .toc-bar { left: 0; right: 0; top: auto; bottom: -1px; width: auto; height: 1px; transform: scaleX(var(--p, 0)); transform-origin: left; }
  .pager { grid-template-columns: 1fr; }
  .pager-next { text-align: left; }
}
@keyframes packet-run { from { top: 0; } to { top: 100%; } }
@media (max-width: 40em) {
  .foot-grid { grid-template-columns: 1fr; }
  .proof-grid { grid-template-columns: 1fr; }
  .proof-item { border-right: 0; }
  .hero-h { max-width: none; }
}

/* =========================================================== REDUCED MOTION */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  @view-transition { navigation: none; }
  *, *::before, *::after { animation: none !important; transition-duration: 1ms !important; }
  .hero-texture { background: radial-gradient(rgba(255, 255, 255, .07) 1px, transparent 1.2px) 0 0 / 24px 24px; }
}
```

- [ ] **Step 2: Run the CSS tests**

Run: `node --test tests/css.test.mjs`
Expected: `# pass 3`.

- [ ] **Step 3: Quick visual check (static, no JS yet)**

Run in the background: `python -m http.server 4173 -d site`. Then, with the chrome-devtools MCP (`ToolSearch select:mcp__plugin_ecc_chrome-devtools__new_page,mcp__plugin_ecc_chrome-devtools__take_screenshot,mcp__plugin_ecc_chrome-devtools__resize_page,mcp__plugin_ecc_chrome-devtools__evaluate_script,mcp__plugin_ecc_chrome-devtools__list_console_messages,mcp__plugin_ecc_chrome-devtools__lighthouse_audit,mcp__plugin_ecc_chrome-devtools__emulate`), open `http://localhost:4173/` and `take_screenshot`. Expected: dark page, all content visible (no `.motion` yet, so nothing is hidden), Plex Mono nav, phosphor accents. Fix any obviously broken layout before committing.

- [ ] **Step 4: Commit**

```bash
git add site/assets/css/style.css
git commit -m "feat(css): drawer, case study, résumé, 404, responsive and reduced-motion rules

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Canvas capability graph (`site/assets/js/graph.js`)

**Files:**
- Create: `site/assets/js/graph.js`

**Interfaces:**
- Consumes `#graph` (canvas inside `.hero`) and `#graph-data` JSON `{ nodes:[{id,label,status}], edges:[{from,to}] }`.
- Standalone IIFE; no globals produced.

- [ ] **Step 1: Write `graph.js`**

```js
/* Capability graph — canvas behind the home hero.
   Nodes: the five systems + bok-core.  Edges: the substrate relationships
   from content (see src/render/ops.mjs).  Nodes drift around home positions,
   edges carry a travelling pulse, a fine pointer repels nodes.
   prefers-reduced-motion → one static frame.  Off-screen / hidden tab → paused. */
(() => {
  "use strict";
  const canvas = document.getElementById("graph");
  const dataEl = document.getElementById("graph-data");
  if (!canvas || !dataEl || !canvas.getContext) return;
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch { return; }

  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const CORE = "bok-core";
  const ACCENT = "#5cf28a", INK2 = "#a6abb4", CARD = "#181b21", HAIR = "rgba(255,255,255,.14)";

  let W = 0, H = 0, nodes = [], edges = [];
  let raf = 0, running = false, onScreen = true, last = 0;
  const pointer = { x: -1e4, y: -1e4 };

  // Ring of systems around bok-core, biased to the right on wide screens so
  // the headline (left column) stays clear.
  const layout = () => {
    const cx = W * (W > 900 ? .7 : .5), cy = H * .5, R = Math.min(W, H) * .3;
    const ring = data.nodes.filter((n) => n.id !== CORE);
    nodes = data.nodes.map((n) => {
      if (n.id === CORE) return { ...n, hx: cx, hy: cy, x: cx, y: cy, vx: 0, vy: 0, r: 7 };
      const i = ring.indexOf(n);
      const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
      const hx = cx + Math.cos(a) * R, hy = cy + Math.sin(a) * R;
      return { ...n, hx, hy, x: hx, y: hy, vx: 0, vy: 0, r: 4.5 };
    });
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    edges = data.edges
      .map((e, i) => ({ a: byId[e.from], b: byId[e.to], phase: i / Math.max(1, data.edges.length) }))
      .filter((e) => e.a && e.b);
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (const e of edges) {
      ctx.strokeStyle = HAIR;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      const p = (t * 0.00022 + e.phase) % 1;              // pulse travelling a → b
      const x = e.a.x + (e.b.x - e.a.x) * p, y = e.a.y + (e.b.y - e.a.y) * p;
      ctx.fillStyle = ACCENT; ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "middle";
    for (const n of nodes) {
      const core = n.id === CORE;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = core ? ACCENT : CARD; ctx.fill();
      ctx.strokeStyle = core ? ACCENT : INK2; ctx.stroke();
      ctx.fillStyle = core ? ACCENT : INK2;
      if (core) { ctx.textAlign = "center"; ctx.fillText(n.label, n.x, n.y + 18); continue; }
      const rightSide = n.hx >= W * (W > 900 ? .7 : .5);  // label away from the core
      ctx.textAlign = rightSide ? "left" : "right";
      ctx.fillText(n.label, n.x + (rightSide ? 12 : -12), n.y);
    }
  };

  const step = (dt, t) => {
    const k = Math.min(dt, 32) / 16;                       // frame-rate independent
    for (const n of nodes) {
      n.vx += (Math.sin(t * .0004 + n.hx) * .02 - (n.x - n.hx) * .002) * k;
      n.vy += (Math.cos(t * .0005 + n.hy) * .02 - (n.y - n.hy) * .002) * k;
      if (fine) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y, R = 150, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * .9;
          n.vx += (dx / d) * f * k; n.vy += (dy / d) * f * k;
        }
      }
      n.vx *= .92; n.vy *= .92;
      n.x += n.vx * k; n.y += n.vy * k;
    }
  };

  const loop = (now) => {
    if (!running) return;
    const dt = now - (last || now); last = now;
    step(dt, now); draw(now);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduced || !onScreen || document.hidden) return;
    running = true; last = 0; raf = requestAnimationFrame(loop);
  };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout(); draw(0);
  };

  resize();
  addEventListener("resize", resize, { passive: true });
  if (fine) {
    const host = canvas.parentElement;
    host.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    }, { passive: true });
    host.addEventListener("pointerleave", () => { pointer.x = pointer.y = -1e4; });
  }
  if (reduced) return;                                     // static frame already drawn
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => {
      onScreen = en.some((x) => x.isIntersecting);
      onScreen ? start() : stop();
    }).observe(canvas);
  } else start();
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
})();
```

- [ ] **Step 2: Syntax-check and smoke in the browser**

Run: `node --check site/assets/js/graph.js && node build.mjs`
Expected: no output from `--check`; build ok.

With the local server from Task 9 step 3 running, open `http://localhost:4173/` via chrome-devtools and `take_screenshot`. Expected: six labelled nodes with hairline edges and moving green pulses behind the hero. `list_console_messages` shows no errors from `graph.js`.

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/graph.js
git commit -m "feat: canvas capability graph behind the hero

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: `main.js` — layer 0 + motion core (Lenis, reveals, boot, readouts, drawer, transitions)

This task **rewrites** `site/assets/js/main.js`. Task 12 inserts the scroll scenes at the marked slot.

**Files:**
- Rewrite: `site/assets/js/main.js`

**Interfaces:**
- Root classes: `.js` always; `.motion` only when GSAP+ScrollTrigger loaded and no reduced-motion.
- Internal helpers used by Task 12 (defined here): `$`, `$$`, `motion`, `gsap`, `ST`, `DESK`, `show(el)`, `win`.
- Slot marker comment `/* === SCENES (Task 12) === */` where Task 12 inserts code.

- [ ] **Step 1: Write `main.js`**

```js
/* Bereket Tilahun — portfolio interactions (dark-ops layer).
   Layer 0 (always, `.js`): header state, scroll progress, mobile nav,
     claim → evidence drawer, anchor links, footer year.
   Layer 1 (`.motion`: GSAP + ScrollTrigger loaded AND no reduced-motion):
     Lenis smooth scroll, boot sequence, reveals, readouts, scroll scenes,
     page transitions.  Without layer 1 the CSS shows everything statically. */
(() => {
  "use strict";

  const doc = document, win = window, root = doc.documentElement;
  root.classList.add("js");

  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = win.matchMedia("(pointer: fine)");
  const DESK = "(min-width: 64em)";

  const gsap = win.gsap, ST = win.ScrollTrigger;
  const motion = !!(gsap && ST) && !reduced.matches;
  if (motion) { gsap.registerPlugin(ST); root.classList.add("motion"); }

  /* ================================================================ layer 0 */

  /* header + progress */
  const head = $(".site-head"), bar = $(".progress-bar");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = win.scrollY;
      if (head) head.classList.toggle("scrolled", y > 8);
      if (bar) {
        const max = root.scrollHeight - win.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      ticking = false;
    });
  };
  win.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile nav */
  const menuBtn = $(".menu-btn"), mobileNav = $("#mobile-nav");
  if (menuBtn && mobileNav) {
    const setOpen = (open) => { menuBtn.setAttribute("aria-expanded", String(open)); mobileNav.hidden = !open; };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileNav.hidden) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* Lenis smooth scroll (layer 1) + anchor navigation (both layers) */
  let lenis = null;
  if (motion && typeof win.Lenis === "function") {
    lenis = new win.Lenis({ lerp: .11, smoothWheel: true });
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
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.startsWith("/#") && !onHome) return;            // real navigation to home
    const hash = href.replace(/^\//, "");
    const target = hash === "#" ? null : $(hash);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", hash);
    scrollTo(target);
  });

  /* claim → evidence drawer */
  const drawerRoot = $(".drawer-root"), drawerBody = $("#drawer-body");
  let lastTrigger = null, evidence = {};
  try { evidence = JSON.parse($("#evidence-data").textContent || "{}"); } catch { evidence = {}; }
  const evRow = (k, v, i) => `<div class="ev-row" style="--i:${i}"><span class="ev-k">${k}</span><span class="ev-v">${v}</span></div>`;
  const openDrawer = (id, trigger) => {
    const ev = evidence[id];
    if (!ev || !drawerRoot) return;
    lastTrigger = trigger || null;
    const rows = [
      evRow("Method", `<span class="ev-method m-${ev.method}">${ev.method}</span>`, 0),
      evRow("Source", ev.source && ev.source.href
        ? `<a href="${ev.source.href}" target="_blank" rel="noopener">${ev.source.label}</a>`
        : (ev.source ? ev.source.label : "—"), 1),
      evRow("Basis", ev.basis || "—", 2),
      evRow("Observed", ev.observedAt || "—", 3),
    ];
    drawerBody.innerHTML = `
      <p class="ev-claim">${ev.claim}</p>
      <div class="ev-chain">${rows.join("")}</div>
      ${ev.caveats && ev.caveats.length
        ? `<div class="ev-caveats"><p class="ev-caveats-h">⚠ INHERITED CAVEATS</p><ul>${ev.caveats.map((c) => `<li>${c}</li>`).join("")}</ul></div>`
        : ""}`;
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
      const focusables = $$("button, a[href], [tabindex]:not([tabindex='-1'])", $(".drawer", drawerRoot));
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* footer year */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ================================================================ layer 1 */

  const show = (el) => el.classList.add("in-view");

  /* boot sequence: types each line; ~1.2 s total */
  const boot = (pre, onDone) => {
    const lines = $$(".boot-line", pre);
    if (!motion || !lines.length) {
      lines.forEach((l) => l.classList.add("typed"));
      if (onDone) onDone();
      return null;
    }
    const tl = gsap.timeline({ onComplete: onDone });
    const per = 1.2 / lines.length;
    lines.forEach((line) => {
      const full = line.textContent, state = { n: 0 };
      tl.call(() => { line.textContent = ""; line.classList.add("typed", "typing"); });
      tl.to(state, { n: full.length, duration: per * .8, ease: "none", snap: "n",
        onUpdate: () => { line.textContent = full.slice(0, state.n); } });
      tl.call(() => { line.textContent = full; line.classList.remove("typing"); });
      tl.to({}, { duration: per * .2 });
    });
    return tl;
  };

  /* reveals — hero elements wait for the boot sequence */
  const heroEls = $$("[data-hero]");
  const revealables = $$(".rv, .line-mask, .wipe").filter((el) => !el.hasAttribute("data-hero"));
  if (motion) {
    ST.batch(revealables, { start: "top 90%", once: true, onEnter: (els) => els.forEach(show) });
    // scroll restoration / deep links: never leave something above the fold hidden
    win.addEventListener("load", () => {
      revealables.forEach((el) => { if (el.getBoundingClientRect().top < win.innerHeight) show(el); });
      ST.refresh();
    });
  } else {
    revealables.forEach(show);
  }
  const boots = $$("[data-boot]");
  if (boots.length) boots.forEach((pre) => boot(pre, () => heroEls.forEach(show)));
  else heroEls.forEach(show);

  /* readouts: digits count up, everything else decodes from glyph noise */
  const GLYPHS = "01<>/\\|_-=+*#%";
  const decode = (el) => {
    const final = el.textContent, state = { p: 0 };
    gsap.to(state, { p: 1, duration: .9, ease: "power2.out",
      onUpdate: () => {
        const n = Math.floor(final.length * state.p);
        el.textContent = final.slice(0, n) + final.slice(n).replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      },
      onComplete: () => { el.textContent = final; } });
  };
  const countUp = (el) => {
    const raw = el.getAttribute("data-count"), target = parseInt(raw.replace(/,/g, ""), 10), state = { n: 0 };
    if (!isFinite(target)) return;
    gsap.to(state, { n: target, duration: 1.1, ease: "power3.out", snap: "n",
      onUpdate: () => { el.textContent = state.n.toLocaleString("en-US"); },
      onComplete: () => { el.textContent = raw; } });
  };
  if (motion) {
    ST.batch("[data-count], [data-decode]", { start: "top 88%", once: true,
      onEnter: (els) => els.forEach((el) => (el.hasAttribute("data-count") ? countUp(el) : decode(el))) });
  }

  /* magnetic buttons (fine pointers only) */
  if (motion && fine.matches) {
    $$(".btn-ink, .pc-cta").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: ((e.clientX - r.left) / r.width - .5) * 6, y: ((e.clientY - r.top) / r.height - .5) * 5, duration: .25 });
      });
      btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: .35 }));
    });
  }

  /* page transitions: CSS @view-transition where supported; curtain elsewhere */
  const curtain = $(".curtain");
  if (motion && curtain && !("startViewTransition" in doc)) {
    doc.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      gsap.fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: .38, ease: "power3.inOut", transformOrigin: "bottom",
        onComplete: () => { location.href = url.href; } });
    });
    win.addEventListener("pageshow", () => gsap.set(curtain, { scaleY: 0 }));
  }

  /* === SCENES (Task 12) === */

})();
```

- [ ] **Step 2: Syntax-check, rebuild, smoke**

Run: `node --check site/assets/js/main.js && node build.mjs`
Expected: clean.

Browser (chrome-devtools, `http://localhost:4173/`): `evaluate_script` → `document.documentElement.className` contains `js motion`; hero boot lines type in then the headline reveals; readouts count/decode when scrolled into view; clicking a figure opens the drawer with rows typing in; Escape closes and returns focus. `list_console_messages`: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/main.js
git commit -m "feat: motion core — Lenis, boot sequence, reveals, readouts, transitions

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: `main.js` — scroll scenes (pipeline, work index, stepper, claim, principles, timeline, TOC)

**Files:**
- Modify: `site/assets/js/main.js` — replace the `/* === SCENES (Task 12) === */` line.

- [ ] **Step 1: Insert the scenes block**

Replace the marker line with:

```js
  /* ================================================================= scenes */

  /* pipeline: pinned scrub on desktop; CSS-looped packet + reveals on mobile */
  const scene = $("#pipeline");
  if (scene && motion) {
    const packet = $(".packet", scene), stations = $$(".station", scene), readout = $("[data-readout]", scene);
    const n = stations.length;
    const light = (p) => {
      let current = -1;
      stations.forEach((s, i) => {
        const on = p >= i / (n - 1) - .02;
        s.classList.toggle("lit", on);
        if (on) current = i;
      });
      if (readout) readout.textContent = current < 0 ? "> awaiting input" : `> ${stations[current].getAttribute("data-desc")}`;
    };
    const mm = gsap.matchMedia();
    mm.add(DESK, () => {
      gsap.fromTo(packet, { "--x": 0 }, { "--x": 100, ease: "none",
        scrollTrigger: { trigger: scene, pin: true, start: "top top", end: () => "+=" + n * 55 + "%", scrub: .5,
          onUpdate: (self) => light(self.progress) } });
    });
    mm.add("(max-width: 63.99em)", () => {
      ST.batch(stations, { start: "top 80%", once: true, onEnter: (els) => els.forEach((s) => s.classList.add("lit")) });
      ST.create({ trigger: scene, start: "top bottom", end: "bottom top",
        onToggle: (self) => scene.classList.toggle("live", self.isActive) });
    });
  }

  /* work: sticky index follows the panel in view */
  if (motion) {
    $$("[data-panel]").forEach((card) => {
      const link = $(`[data-index-for="${card.id}"]`);
      if (!link) return;
      ST.create({ trigger: card, start: "top 50%", end: "bottom 50%",
        onToggle: (self) => link.classList.toggle("current", self.isActive) });
    });
  }

  /* flow steppers: line draws with scroll (or on load inside [data-draw]) */
  if (motion) {
    $$(".flow").forEach((flow) => {
      const line = $(".flow-line", flow);
      if (!line) return;
      if (flow.closest("[data-draw]")) {
        gsap.fromTo(line, { "--draw": 0 }, { "--draw": 1, duration: 1.1, ease: "power2.inOut", delay: .6 });
        return;
      }
      gsap.fromTo(line, { "--draw": 0 }, { "--draw": 1, ease: "none",
        scrollTrigger: { trigger: flow, start: "top 85%", end: "bottom 45%", scrub: .4 } });
    });
  }

  /* evidence: the Claim type "compiles" line by line, then rules stamp in */
  const claim = $(".claim-specimen");
  if (claim && motion) {
    const lines = $$(".cl", claim), rules = $$(".rule", claim);
    ST.create({ trigger: claim, start: "top 75%", once: true, onEnter: () => {
      const tl = gsap.timeline();
      lines.forEach((l) => tl.call(() => {
        lines.forEach((x) => x.classList.remove("typing"));
        l.classList.add("on", "typing");
      }, null, ">.11"));
      tl.call(() => lines.forEach((x) => x.classList.remove("typing")), null, ">.2");
      rules.forEach((r) => tl.call(() => r.classList.add("stamped"), null, ">.28"));
    } });
  }

  /* principles: pinned horizontal scrub on desktop */
  const track = $("[data-track]");
  if (track && motion) {
    const list = $(".principles", track);
    gsap.matchMedia().add(DESK, () => {
      const dist = () => Math.max(0, list.scrollWidth - track.clientWidth);
      gsap.to(list, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: track, pin: true, start: "center center", end: () => "+=" + dist(), scrub: .6, invalidateOnRefresh: true } });
    });
  }

  /* timeline: rail draws, nodes ignite */
  const rail = $(".modes-rail");
  if (rail && motion) {
    const wrap = rail.parentElement;
    gsap.fromTo(rail, { "--draw": 0 }, { "--draw": 1, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top 70%", end: "bottom 60%", scrub: .4 } });
    $$(".mode", wrap).forEach((m) => ST.create({ trigger: m, start: "top 65%", once: true, onEnter: () => m.classList.add("lit") }));
  }

  /* case-study TOC: current section + per-section progress hairline */
  const toc = $(".cs-toc");
  if (toc) {
    const pairs = $$("a[href^='#']", toc).map((a) => [a, $(a.getAttribute("href"))]).filter(([, s]) => s);
    if (motion) {
      pairs.forEach(([a, sec]) => ST.create({ trigger: sec, start: "top 40%", end: "bottom 40%",
        onUpdate: (self) => a.style.setProperty("--p", self.progress.toFixed(3)),
        onToggle: (self) => a.classList.toggle("current", self.isActive) }));
    } else if ("IntersectionObserver" in win) {
      const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        pairs.forEach(([a]) => a.classList.remove("current"));
        const hit = pairs.find(([, s]) => s === en.target);
        if (hit) { hit[0].classList.add("current"); hit[0].style.setProperty("--p", "1"); }
      }), { rootMargin: "-30% 0px -60% 0px" });
      pairs.forEach(([, s]) => spy.observe(s));
    }
  }
```

- [ ] **Step 2: Syntax-check, rebuild, exercise every scene**

Run: `node --check site/assets/js/main.js && node build.mjs`

Browser checks on `http://localhost:4173/` at 1440×900 (chrome-devtools `resize_page`, then `evaluate_script` with `window.scrollTo(0, y)` steps, `take_screenshot` after each):
1. Scroll into the pipeline: section pins, packet travels, stations light in order, readout text changes.
2. Work: index `[01]`→`[05]` highlights follow the panels; panels wipe in from the left; stepper lines draw.
3. Evidence: code lines appear one by one with a caret; three `ENFORCED` stamps land.
4. Principles: section pins and the track scrubs horizontally to the 7th card, then releases.
5. Timeline: rail draws; dots ignite.
6. `http://localhost:4173/work/agent-perimeter.html`: hero flow draws on load, TOC bars fill per section.
7. Resize to 390×844: no pinning (`document.querySelectorAll(".pin-spacer").length === 0`); stations stacked with the packet loop; principles vertical.
`list_console_messages`: no errors.

- [ ] **Step 3: Commit**

```bash
git add site/assets/js/main.js
git commit -m "feat: scroll scenes — pinned pipeline, work index, claim compile, principles track, timeline, TOC

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Share assets — favicon and OG card

**Files:**
- Rewrite: `site/assets/img/favicon.svg`
- Create: `src/og/render-og.mjs`, `docs/og/og-card.html` (generated)
- Regenerate: `site/assets/img/og-card.png` (1200×630)

- [ ] **Step 1: Write the favicon**

`site/assets/img/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="8" fill="#0a0b0d"/>
<rect x="5" y="5" width="54" height="54" rx="5" fill="none" stroke="#5cf28a" stroke-width="2" stroke-dasharray="4 3"/>
<text x="32" y="42" text-anchor="middle" font-family="'IBM Plex Mono', ui-monospace, Menlo, monospace" font-size="24" font-weight="600" fill="#e8eaed">BT</text>
<rect x="44" y="12" width="8" height="8" fill="#5cf28a"/>
</svg>
```

- [ ] **Step 2: Write the OG renderer (content-derived, no typed figures)**

`src/og/render-og.mjs`:

```js
// Renders docs/og/og-card.html (1200×630) from content for screenshotting.
//   node src/og/render-og.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site, projects, heroMetrics } from "../content/index.mjs";
import { bootLines } from "../render/ops.mjs";
import { esc } from "../render/components.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const lines = bootLines({ site, projects, heroMetrics });
// First, "loading systems" and "verified figures" lines; the value after the
// dot leader is highlighted.
const boot = [lines[0], lines[1], lines[3]]
  .map((l) => esc(l).replace(/(\.\.+ )(.*)$/, "$1<b>$2</b>"))
  .join("\n");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>og-card</title>
<link rel="stylesheet" href="../../site/assets/fonts/fonts.css">
<style>
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: #0a0b0d; color: #e8eaed; font-family: Geist, system-ui, sans-serif; position: relative; overflow: hidden; }
  .grid { position: absolute; inset: 0; background: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1.2px) 0 0 / 24px 24px; -webkit-mask-image: radial-gradient(ellipse at 70% 50%, #000 20%, transparent 75%); mask-image: radial-gradient(ellipse at 70% 50%, #000 20%, transparent 75%); }
  .scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px); }
  .in { position: absolute; inset: 64px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .boot { font-family: "IBM Plex Mono", monospace; font-size: 20px; color: #a6abb4; line-height: 1.6; margin: 0; }
  .boot b { color: #5cf28a; font-weight: 500; }
  h1 { font-size: 62px; line-height: 1.06; margin: 0; font-weight: 500; letter-spacing: -.02em; max-width: 960px; }
  h1 em { font-family: Newsreader, serif; font-style: italic; color: #5cf28a; font-weight: 400; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; font-family: "IBM Plex Mono", monospace; font-size: 20px; color: #a6abb4; }
  .name { font-size: 26px; color: #e8eaed; margin-bottom: 4px; }
  .mark { width: 56px; height: 56px; border: 2px solid #5cf28a; border-radius: 6px; display: grid; place-items: center; color: #5cf28a; font-weight: 600; font-size: 24px; }
</style></head>
<body>
<div class="grid"></div><div class="scan"></div>
<div class="in">
  <pre class="boot">${boot}</pre>
  <h1>Systems that know what they are <em>allowed to do</em>, know when they are <em>uncertain</em>, preserve evidence, and <em>fail safely.</em></h1>
  <div class="foot">
    <div><div class="name">${esc(site.name)}</div><div>${esc(site.title.split(" & ")[0])} · ${esc(site.location.split(",")[0])}</div></div>
    <div class="mark">BT</div>
  </div>
</div>
</body></html>`;

mkdirSync(join(ROOT, "docs", "og"), { recursive: true });
writeFileSync(join(ROOT, "docs", "og", "og-card.html"), html);
console.log("wrote docs/og/og-card.html");
```

- [ ] **Step 3: Render and screenshot**

Run: `node src/og/render-og.mjs`
Expected: `wrote docs/og/og-card.html`.

Screenshot with chrome-devtools MCP: `new_page` → `file:///C:/Users/berek/.zcode/workspace/default/bereket-portfolio/docs/og/og-card.html`, `resize_page` width 1200 height 630, `take_screenshot` (png, viewport only) saving to `site/assets/img/og-card.png`. Fallback if the tool cannot write a file:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot="C:\Users\berek\.zcode\workspace\default\bereket-portfolio\site\assets\img\og-card.png" "file:///C:/Users/berek/.zcode/workspace/default/bereket-portfolio/docs/og/og-card.html"
```

- [ ] **Step 4: Verify dimensions and look**

Run: `node -e "const b=require('fs').readFileSync('site/assets/img/og-card.png');console.log(b.readUInt32BE(16),'x',b.readUInt32BE(20))"`
Expected: `1200 x 630`. Open the PNG with the Read tool and confirm the dark card renders with the three boot lines and the headline.

- [ ] **Step 5: Commit**

```bash
git add site/assets/img/favicon.svg site/assets/img/og-card.png src/og/render-og.mjs docs/og/og-card.html
git commit -m "feat: dark favicon and content-derived OG card

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Verification gate (no-JS, reduced motion, Lighthouse, keyboard)

**Files:** none changed unless a check fails.

- [ ] **Step 1: Full test suite and build**

Run: `node --test tests/ && node build.mjs`
Expected: `# fail 0` (24 tests: ops 5, build 5, components 2, home 6, pages 3, css 3); build lists 8 pages.

- [ ] **Step 2: No-JS render**

With the local server running, open each of `/`, `/work/agent-perimeter.html`, `/resume.html`, `/404.html` and run via `evaluate_script`:

```js
(() => {
  document.documentElement.classList.remove("motion");
  const sel = ".rv, .line-mask, .wipe, .boot-line, .cl, .stamp, .rv-clip";
  return [...document.querySelectorAll(sel)].filter((el) => {
    const cs = getComputedStyle(el);
    return cs.opacity === "0" || cs.visibility === "hidden" || /100%/.test(cs.clipPath);
  }).length;
})()
```

Expected: `0` on every page. (`tests/css.test.mjs` proves the same statically; this confirms it in a real render.)

- [ ] **Step 3: Reduced motion**

chrome-devtools `emulate` with reduced motion (`prefersReducedMotion: "reduce"` or the tool's equivalent parameter), reload `/`. Expected via `evaluate_script`:
- `document.documentElement.classList.contains("motion") === false`
- `document.querySelectorAll(".pin-spacer").length === 0`
- `getComputedStyle(document.querySelector(".badge-glyph.pulse")).animationName === "none"`
- boot lines fully visible immediately; canvas is a single static frame (take two screenshots 1 s apart — identical).

- [ ] **Step 4: Lighthouse on home**

chrome-devtools `lighthouse_audit` on `http://localhost:4173/` (desktop, categories accessibility + performance).
Expected: accessibility ≥ 95, performance ≥ 85. If a11y flags contrast, the offending colour is almost certainly `--ink-3` on text — switch that rule to `--ink-2`. If performance flags the canvas, lower the DPR cap in `graph.js` (`Math.min(window.devicePixelRatio || 1, 2)`) to `1.5`.

- [ ] **Step 5: Keyboard pass**

Tab through `/`: skip link appears; nav links; proof buttons open the drawer (Enter), Escape closes and focus returns to the trigger; stations are focusable and show their tip; `.pc-cta` links reachable; pinned sections do not trap focus.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: verification pass adjustments

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

(Skip if nothing changed.)

---

### Task 15: Deploy to Vercel, set `siteUrl`, redeploy

**Files:**
- Modify: `src/content/person.mjs:17` (`siteUrl` only)

- [ ] **Step 1: First deploy (no siteUrl yet)**

Load the connector tools: ToolSearch `select:mcp__claude_ai_Vercel__list_teams,mcp__claude_ai_Vercel__deploy_to_vercel,mcp__claude_ai_Vercel__get_deployment`. Call `list_teams`, pick the user's personal team, then `deploy_to_vercel` for the repo root (`vercel.json` supplies `buildCommand: node build.mjs` and `outputDirectory: site`) with project name `bereket-portfolio`, production target. **Confirm with the user before calling** (outward-facing action).

Fallback if the connector cannot upload a local directory: `npx vercel@latest --prod --yes` from the repo root (requires `npx vercel login` first — ask the user).

- [ ] **Step 2: Record the production URL**

From the deploy result take the production alias (e.g. `https://bereket-portfolio.vercel.app`). Ask the user whether a custom domain should be used instead; use whatever they confirm, without a trailing slash.

- [ ] **Step 3: Set `siteUrl`**

In `src/content/person.mjs` change

```js
  siteUrl: "",
```
to
```js
  siteUrl: "https://<confirmed-host>",
```

- [ ] **Step 4: Rebuild, test, verify canonical/OG/sitemap locally**

Run: `node build.mjs && node --test tests/ && grep -c "https://<confirmed-host>" site/sitemap.xml site/robots.txt site/index.html`
Expected: tests green; `sitemap.xml:7`, `robots.txt:1`, `index.html:≥4` (canonical, og:url, og:image, twitter:image).

- [ ] **Step 5: Commit and redeploy**

```bash
git add src/content/person.mjs site/
git commit -m "chore: set siteUrl to the production host

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

Redeploy exactly as in Step 1.

- [ ] **Step 6: Verify the live site**

```bash
H="https://<confirmed-host>"
curl -s "$H/" | grep -o '<link rel="canonical" href="[^"]*">'
curl -s "$H/" | grep -o '<meta property="og:image" content="[^"]*">'
curl -s "$H/sitemap.xml" | grep -c "<loc>$H"
curl -sI "$H/assets/img/og-card.png" | grep -i -E "HTTP/|content-type"
curl -sI "$H/no-such-route" | head -1
```

Expected: canonical and og:image point at `$H`; `7` sitemap entries; og-card returns `200` `image/png`; unknown route returns `404` (Vercel serves `site/404.html`).

Run Lighthouse once more against the live URL (Task 14 step 4 thresholds).

- [ ] **Step 7: Report**

Tell the user: production URL, Lighthouse scores, and the one spec deviation (Lenis from jsDelivr).

---

## Self-review

**Spec coverage**

| Spec item | Task |
|---|---|
| Stitch-first workflow, DESIGN.md | 1 |
| Boot hero (build-time lines from content), canvas graph (nodes/edges from content, drift, pulse, pointer repel, pause off-screen), clip-reveal headline, italic accent phrases | 2, 5, 8, 10, 11 |
| Verified figures: count-up, provenance underline, drawer slides in, rows type in | 5, 8, 9, 11 |
| Pipeline scene: pinned scrub, stations light with description, mobile unpinned rail | 5, 8, 9, 12 |
| Work: wipe, badge pulse, stepper dashoffset scrub, substrate edges animate, sticky index | 4, 5, 8, 12 |
| Evidence: Claim compiles with caret, rules stamp | 4, 8, 12 |
| Principles: pinned horizontal (desktop) / vertical (mobile), cite source | 5, 8, 9, 12 |
| Timeline rail draws, nodes ignite | 5, 8, 12 |
| Stack/About/Contact stagger, contact scan, footer `site.reviewed` (already rendered by `footer()`) | 5, 8 |
| Case study: dark hero + texture, flow draws on load, chips stagger, sticky TOC with progress, clip reveals, metric readouts (shared component), pager hover slide | 6, 9, 12 |
| Résumé lighter motion; 404 "route refused" readout | 6, 9 |
| Lenis; View Transitions + curtain fallback; GSAP/ScrollTrigger pinned, `defer` | 3, 7, 11 |
| Canvas + timelines pause off-screen | 10 (IO + visibility), 12 (scroll-bound tweens; mobile packet loop toggled by `.live`) |
| Reduced motion: instant reveals, static canvas, no pinning, no smooth scroll | 7, 9, 10, 11 |
| No-JS renders everything | 7 (`.motion` contract + CSS invariant test), 14 |
| Files: rewrite style.css/main.js; new graph.js/vercel.json/DESIGN.md; edit build.mjs/layout.mjs/components.mjs/person.mjs(siteUrl); regenerate og-card/favicon | 3–13, 15 |
| Verification: build green, no-JS, reduced-motion, Lighthouse, deployed canonical/OG/sitemap | 14, 15 |

**Placeholder scan:** none — every code step contains the code. Task 1's Stitch output is inherently external, but the prompt, extraction step and override text are given in full. `<confirmed-host>` in Task 15 is a value only the deploy can produce.

**Type/name consistency:** `bootLines/bootBlock/graphData/graphScript` (Task 2) are the names imported in Tasks 5 and 13. `data-hero`, `data-boot`, `data-count`, `data-decode`, `data-panel`, `data-index-for`, `data-track`, `data-draw`, `data-readout`, `data-desc` are produced in Tasks 5–6 and consumed with the same spelling in Tasks 8, 9, 11, 12. CSS custom properties `--x`, `--draw`, `--p`, `--i`, `--d` match between CSS (Tasks 8–9) and JS (Tasks 11–12). Classes `.wipe`, `.lit`, `.live`, `.typed`, `.typing`, `.on`, `.stamped`, `.current`, `.in-view`, `.motion` match across CSS and JS. `scripts()` / `head()` exports (Task 3) match the `build.mjs` import. The CSS invariant test's allow-list (`.drawer-root`, `.drawer-backdrop`, `.curtain`, `.station-tip`, `.scan`, `.toc-bar`, `.packet`) matches the selectors that legitimately hide without `.motion` in Tasks 7–9; `.stamp`'s hidden state is `.motion .stamp`, so it needs no allowance.
