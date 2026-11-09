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
  assert.match(home, /<h1 class="hero-h rv" id="hero-h">Can one customer see <em class="hero-em">another’s<\/em> data\?<\/h1>/);
  assert.match(home, /<picture class="portrait hero-portrait">/);
  assert.match(home, /fetchpriority="high"/);
  assert.match(home, /<a class="btn btn-signal" href="https:\/\/www.upwork.com\/freelancers\/~01645da719eb4829ed" rel="noopener" target="_blank">Hire me on Upwork/);
  assert.match(home, /<a class="btn btn-ink" href="\/work\/shopfast-demo.html">See a sample audit/);
  assert.doesNotMatch(home, /data-boot|hero-graph|hero-texture|class="scene"|data-hero/);
});

test("audit section: four steps and starting price; no hero proof strip", () => {
  assert.doesNotMatch(home, /<div class="big-metric">/);
  assert.match(home, /<section class="section" id="audit"/);
  assert.match(home, /<a href="\/#audit">How an audit works<\/a>/);
  for (const n of [1, 2, 3, 4]) assert.match(home, new RegExp(`principle-num mono" aria-hidden="true">Step ${n}<`));
  assert.match(home, /Fixed price, from \$249/);
});

test("top nav drops the résumé; the footer keeps it", () => {
  assert.doesNotMatch(home.match(/<header class="site-head">[\s\S]*?<\/header>/)[0], /resume\.html/);
  assert.match(home.match(/<footer class="site-foot">[\s\S]*?<\/footer>/)[0], /href="\/resume\.html"/);
});

test("work: six sticky panels with plain + technical copy, two metrics, vertical flow, case-study link", () => {
  const panels = home.match(/<article class="panel" id="panel-[a-z-]+"/g) || [];
  assert.equal(panels.length, 6);
  assert.match(home, /<span class="panel-num mono">Sample<\/span>/);
  assert.match(home, /<span class="panel-num mono">01<\/span>/);
  assert.match(home, /id="tools-h">Tools I’ve built\.</);
  assert.match(home, /<p class="panel-plain">A demo store with twelve flaw types common in AI-built Supabase apps/);
  assert.equal((home.match(/<p class="panel-tech">/g) || []).length, 6);
  assert.equal((home.match(/<div class="panel-metrics">/g) || []).length, 6);
  assert.equal((home.match(/<ol class="flow flow-v"/g) || []).length, 6);
  for (const slug of ["shopfast-demo", "agent-perimeter", "ground-truth", "ledger-sense", "selector-drift", "aztdp"]) {
    assert.match(home, new RegExp(`<a class="panel-cta" href="/work/${slug}.html">`));
  }
  assert.doesNotMatch(home, /status-legend|class="badge|RUNNING|project-card/);
});

test("principles list, path + stack band, about with portrait, contact block", () => {
  // Four audit steps plus four principles.
  assert.equal((home.match(/<li class="principle rv"/g) || []).length, 8);
  assert.match(home, /<section class="section" id="principles"/);
  assert.equal((home.match(/<li class="mode rv"/g) || []).length, 6);
  assert.equal((home.match(/<div class="stack-run rv">/g) || []).length, 3);
  assert.match(home, /<picture class="portrait about-portrait">/);
  assert.match(home, /<h2 class="contact-h rv" id="contact-h">Let’s talk\.<\/h2>/);
  assert.match(home, /<div class="contact-links rv">/);
  assert.doesNotMatch(home, /contact-card|class="scan"|claim-notes|id="pipeline"|class="scene"/);
});
