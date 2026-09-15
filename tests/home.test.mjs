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
