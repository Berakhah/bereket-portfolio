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

const UPWORK = 'href="https://www.upwork.com/freelancers/~01645da719eb4829ed" rel="noopener" target="_blank"';

test("hero: serif headline with one signal emphasis, portrait, two CTAs and a résumé link", () => {
  assert.match(home, /<h1 class="hero-h rv" id="hero-h">I find where AI-built apps <em class="hero-em">leak<\/em> customer data, and hand you the fix\.<\/h1>/);
  assert.match(home, /<picture class="portrait hero-portrait">/);
  assert.match(home, /fetchpriority="high"/);
  assert.ok(home.includes(`<a class="btn btn-signal" ${UPWORK}>Book an audit on Upwork`));
  assert.match(home, /<a class="btn btn-ink" href="\/work\/shopfast-demo.html">See a sample audit/);
  assert.match(home, /<p class="hero-hiring rv"[^>]*><a class="panel-cta" href="\/resume.html">Hiring\? Read my résumé/);
});

test("example finding is the real SF-10 policy and its fix, with three evidence-linked proof points", () => {
  const f = home.match(/<figure class="finding rv"[\s\S]*?<\/figure>/)[0];
  assert.match(f, /SF-10/);
  assert.match(f, /High · CVSS 7\.7/);
  assert.match(f, /<span class="sr-only">Removed: <\/span>  using \(true\);/);
  assert.match(f, /<span class="sr-only">Added: <\/span>  using \(auth\.uid\(\) = user_id\);/);
  try {
    const sql = readFileSync(join(ROOT, "..", "shopfast-demo", "supabase", "migrations", "20261107000000_new_flaws.sql"), "utf8");
    assert.match(sql, /PLANTED SF-10: policy is `using \(true\)` instead of `using \(auth\.uid\(\) = user_id\)`/);
    assert.match(sql, /on public\.notifications for select to authenticated\n  using \(true\);/);
  } catch (e) {
    if (e.code !== "ENOENT") throw e; // the sibling repo is optional
  }
  const strip = home.match(/<ul class="proof"[\s\S]*?<\/ul>/)[0];
  for (const id of ["m-census-31953", "sf-proven", "m-dz-hardening"]) {
    assert.match(strip, new RegExp(`data-evidence="${id}"`));
    assert.match(home, new RegExp(`"${id}":\\{"claim"`));
  }
});

test("two paths: founders get checks, prices and Upwork; hiring teams get the résumé and GitHub", () => {
  const clients = home.match(/<div class="path path-clients rv">[\s\S]*?<\/div>\s*<\/div>/)[0];
  assert.equal((clients.match(/<li>/g) || []).length, 5);
  for (const price of ["$249", "$595", "$1,190"]) assert.ok(clients.includes(price), price);
  assert.ok(clients.includes(UPWORK));
  const employers = home.match(/<div class="path path-employers rv"[\s\S]*?<\/div>\s*<\/div>/)[0];
  assert.match(employers, /href="\/resume.html">Read my résumé/);
  assert.match(employers, /href="https:\/\/github.com\/Berakhah"/);
});

test("audit section: four steps and the fixed prices", () => {
  assert.match(home, /<section class="section" id="audit"/);
  for (const n of [1, 2, 3, 4]) assert.match(home, new RegExp(`principle-num mono" aria-hidden="true">Step ${n}<`));
  assert.match(home, /Starter \$249 \(3 days\) · Standard \$595 \(5 days\) · Advanced \$1,190 \(7 days\)/);
});

test("top nav carries the résumé for hiring teams; the footer keeps it", () => {
  assert.match(home.match(/<header class="site-head">[\s\S]*?<\/header>/)[0], /<a href="\/resume\.html">Résumé<\/a>/);
  assert.match(home.match(/<footer class="site-foot">[\s\S]*?<\/footer>/)[0], /href="\/resume\.html"/);
});

test("work: security panels, then engineering depth; six sticky panels with metrics, flow and case-study link", () => {
  const panels = home.match(/<article class="panel" id="panel-[a-z-]+"/g) || [];
  assert.equal(panels.length, 6);
  assert.match(home, /id="work-h">Security work\.</);
  assert.match(home, /id="depth-h">Engineering depth\.</);
  assert.ok(home.indexOf('id="panel-aztdp"') < home.indexOf('id="depth-h"'));
  assert.ok(home.indexOf('id="depth-h"') < home.indexOf('id="panel-ledger-sense"'));
  assert.match(home, /<span class="panel-num mono">Sample<\/span>/);
  assert.equal((home.match(/<div class="panel-metrics">/g) || []).length, 6);
  assert.equal((home.match(/<ol class="flow flow-v"/g) || []).length, 6);
  for (const slug of ["shopfast-demo", "agent-perimeter", "ground-truth", "ledger-sense", "selector-drift", "aztdp"]) {
    assert.match(home, new RegExp(`<a class="panel-cta" href="/work/${slug}.html">`));
  }
});

test("principles list, experience + stack band, about with portrait, contact block", () => {
  // Four audit steps plus four principles.
  assert.equal((home.match(/<li class="principle rv"/g) || []).length, 8);
  assert.match(home, /<section class="section" id="principles"/);
  assert.match(home, /<section class="section" id="experience"/);
  assert.equal((home.match(/<li class="mode rv"/g) || []).length, 5);
  assert.equal((home.match(/<div class="stack-run rv">/g) || []).length, 3);
  assert.match(home, /<picture class="portrait about-portrait">/);
  assert.match(home, /<h2 class="contact-h rv" id="contact-h">Let’s talk\.<\/h2>/);
  assert.match(home, /<div class="contact-links rv">/);
});
