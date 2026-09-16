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

test("one deferred, content-hashed bundle; no third-party script origins", () => {
  const tags = home.match(/<script src="[^"]+"[^>]*>/g) || [];
  assert.equal(tags.length, 1);
  const m = tags[0].match(/^<script src="(\/assets\/js\/app\.[0-9a-f]{10}\.js)" defer>$/);
  assert.ok(m, tags[0]);
  assert.doesNotMatch(home, /https:\/\/cdn/);
  const bundle = readFileSync(join(ROOT, "site", m[1]), "utf8");
  // vendor first (in dependency order), then graph, then main
  const order = ["gsap", "ScrollTrigger", "globalThis.Lenis=", 'getElementById("graph")', 'classList.add("js")'];
  let last = -1;
  for (const s of order) { const i = bundle.indexOf(s); assert.ok(i > last, `missing or out of order: ${s}`); last = i; }
  // the graph script is only wired to data on the home page
  assert.match(home, /id="graph-data"/);
  assert.doesNotMatch(cs, /id="graph-data"/);
});

test("CSS is inlined and the above-the-fold faces are preloaded", () => {
  for (const html of [home, cs]) {
    assert.doesNotMatch(html, /<link rel="stylesheet"/);
    assert.match(html, /<style>@font-face \{/);
    for (const f of ["geist-normal-300-700", "newsreader-italic-400", "plex-mono-normal-500"]) {
      assert.match(html, new RegExp(`<link rel="preload" href="/assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`));
    }
  }
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
