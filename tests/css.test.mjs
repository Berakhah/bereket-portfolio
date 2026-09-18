import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src/css");
const files = ["tokens", "base", "home", "pages", "motion"];
const css = files.map((f) => readFileSync(join(DIR, `${f}.css`), "utf8")).join("\n");

const flat = css
  .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "")
  .replace(/@media[^{]*\{/g, "")
  .replace(/@view-transition[^{]*\{[^}]*\}/g, "");
const blocks = [];
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(flat))) blocks.push({ sel: m[1].trim(), decl: m[2] });

const HIDING = /(^|;)\s*(opacity\s*:\s*0(?![.\d])|opacity\s*:\s*0?\.[0-6](?!\d)|visibility\s*:\s*hidden|clip-path\s*:\s*inset\([^)]*100%)|transform\s*:[^;]*scale[XY]?\(0\)/;
const ALLOW = /\.drawer-root(?!\.open)|\.drawer-backdrop|\.mobile-nav\[hidden\]|\.curtain|\.skip-link|\.portrait::after/;

test("every hiding rule is gated behind .motion", () => {
  const offenders = blocks
    .filter((b) => HIDING.test(b.decl))
    .filter((b) => !b.sel.split(",").every((s) => /\.motion\b/.test(s)))
    .filter((b) => !ALLOW.test(b.sel));
  assert.deepEqual(offenders.map((b) => b.sel), []);
});

test("uses the paper tokens in light and dark, and no dark-ops colours remain", () => {
  for (const t of ["#f4f1ea", "#ebe6dc", "#16130f", "#6b655c", "#ff4d1c", "#121110", "#1a1816", "#efeae0", "#9d968a", "#ff6a40"]) {
    assert.ok(css.includes(t), `missing token ${t}`);
  }
  for (const t of ["#0a0b0d", "#5cf28a", "#181b21", "#7cc4ff"]) assert.ok(!css.includes(t), `stale token ${t}`);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter/);
});

test("dark mode is a prefers-color-scheme override of :root tokens", () => {
  assert.match(css, /@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{/);
});

test("reduced motion disables animations, smooth scroll and the curtain", () => {
  const rm = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(rm, /animation:\s*none/);
  assert.match(rm, /scroll-behavior:\s*auto/);
  assert.match(rm, /\.curtain\s*\{\s*display:\s*none/);
});

test("résumé has print rules that strip the shell", () => {
  const pr = css.slice(css.indexOf("@media print"));
  assert.match(pr, /\.site-head[^{]*\{[^}]*display:\s*none/);
  assert.match(pr, /\.site-foot[^{]*\{[^}]*display:\s*none/);
});
