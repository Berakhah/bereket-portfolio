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
  for (const s of ['querySelectorAll(".panel")', "prefers-reduced-motion", 'classList.add("motion")']) assert.ok(bundle.includes(s), `bundle missing ${s}`);
  for (const s of ["data-boot", "GLYPHS", "station"]) assert.ok(!bundle.includes(s), `bundle still has ${s}`);
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
