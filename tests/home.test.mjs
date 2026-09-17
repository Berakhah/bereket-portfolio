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
