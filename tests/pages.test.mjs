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
