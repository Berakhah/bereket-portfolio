import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "site/assets/css/style.css"), "utf8");

// Flatten @media wrappers and drop @keyframes bodies, then split into
// `selector { declarations }` blocks.
const flat = css
  .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "")
  .replace(/@media[^{]*\{/g, "")
  .replace(/@view-transition[^{]*\{[^}]*\}/g, "");
const blocks = [];
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(flat))) blocks.push({ sel: m[1].trim(), decl: m[2] });

const HIDING = /(^|;)\s*(opacity\s*:\s*0(?![.\d])|visibility\s*:\s*hidden|clip-path\s*:\s*inset\([^)]*100%)/;
const ALLOW = /\.drawer-root(?!\.open)|\.drawer-backdrop|\.mobile-nav\[hidden\]|\.curtain|\.station-tip|\.scan|\.toc-bar|\.packet/;

test("every hiding rule is gated behind .motion (no-JS and reduced-motion stay visible)", () => {
  const offenders = blocks
    .filter((b) => HIDING.test(b.decl))
    .filter((b) => !b.sel.split(",").every((s) => /\.motion\b/.test(s)))
    .filter((b) => !ALLOW.test(b.sel));
  assert.deepEqual(offenders.map((b) => b.sel), []);
});

test("uses the approved dark tokens and drops the paper palette", () => {
  for (const t of ["#0a0b0d", "#111317", "#181b21", "#e8eaed", "#a6abb4", "#5cf28a", "#2f8a4f", "#f2c14e", "#ff6b57", "#7cc4ff"]) {
    assert.ok(css.includes(t), `missing token ${t}`);
  }
  assert.ok(!css.includes("#f6f4ee") && !css.includes("#a34e22"));
});

test("reduced motion disables animations, smooth scroll and the view transition", () => {
  const rm = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(rm, /animation:\s*none/);
  assert.match(rm, /scroll-behavior:\s*auto/);
  assert.match(rm, /@view-transition\s*\{\s*navigation:\s*none/);
});
