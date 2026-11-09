// While contactMode is "upwork", a build without PORTFOLIO_EMAIL / PORTFOLIO_LINKEDIN
// carries no direct contact details, and the direct-contact PDF résumé must not ship.
// (The live deploy sets those env vars to show LinkedIn and email beside Upwork.)
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../src/content/person.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "site");
const pages = () => [
  "index.html", "resume.html", "404.html", "scope.html",
  ...readdirSync(join(OUT, "work")).map((f) => join("work", f)),
];

before(() => execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" }));

test("upwork mode: no email, phone, LinkedIn or PDF résumé on any page", { skip: site.contactMode !== "upwork" }, () => {
  const digits = site.phone.replace(/\D/g, "");
  const secrets = [site.email, site.phone, digits].filter(Boolean);
  for (const p of pages()) {
    const html = readFileSync(join(OUT, p), "utf8");
    assert.doesNotMatch(html, /mailto:|tel:|linkedin\.com|Bereket_Tilahun_Resume\.pdf/i, p);
    for (const v of secrets) assert.ok(!html.includes(v), `${p} contains a contact value`);
    assert.ok(html.includes(site.upwork), `${p} links the Upwork profile`);
  }
  assert.equal(existsSync(join(OUT, "assets", "Bereket_Tilahun_Resume.pdf")), false);
  assert.equal(existsSync(join(OUT, "assets", "bereket-tilahun-resume.pdf")), true, "Upwork-safe PDF ships");
});

test("source holds no email address, phone number, LinkedIn URL or direct-contact PDF", () => {
  const src = ["src/content/person.mjs", "src/content/resume-body.html", "src/content/scope-main.html", "docs/resume/resume.tex"]
    .map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n");
  assert.doesNotMatch(src, /linkedin\.com/i);
  assert.equal(existsSync(join(ROOT, "src", "assets", "Bereket_Tilahun_Resume.pdf")), false);
  assert.doesNotMatch(src, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/);
  assert.doesNotMatch(src, /\+\d{3}[\s\d]{6,}/);
});

test("scope form page is built and in the sitemap", () => {
  const html = readFileSync(join(OUT, "scope.html"), "utf8");
  assert.match(html, /<h1 class="cs-title rv" style="--d:60ms">Scope and authorisation form<\/h1>/);
  assert.match(readFileSync(join(OUT, "sitemap.xml"), "utf8"), /\/scope\.html<\/loc>/);
  assert.match(readFileSync(join(OUT, "index.html"), "utf8"), /href="\/scope\.html">scope and authorisation form<\/a>/);
});
