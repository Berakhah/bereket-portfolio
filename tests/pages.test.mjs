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
