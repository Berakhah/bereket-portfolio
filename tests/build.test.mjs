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
