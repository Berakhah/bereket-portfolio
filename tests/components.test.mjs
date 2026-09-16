import { test } from "node:test";
import assert from "node:assert/strict";
import { flowStepper, claimRules } from "../src/render/components.mjs";

test("flowStepper carries a drawable SVG line with horizontal and vertical variants", () => {
  const html = flowStepper(["A", "B <x>"], "demo");
  assert.match(html, /<svg class="flow-line" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">/);
  assert.match(html, /<line class="fl-h" x1="0" y1="50" x2="100" y2="50" pathLength="1"\/>/);
  assert.match(html, /<line class="fl-v" x1="50" y1="0" x2="50" y2="100" pathLength="1"\/>/);
  assert.match(html, /B &lt;x&gt;/);
  assert.ok(html.indexOf("flow-line") < html.indexOf('<li class="flow-node"'));
});

test("claimRules stamps each rule and points at the type on the case study", () => {
  const html = claimRules();
  const stamps = html.match(/<span class="stamp mono" aria-hidden="true">ENFORCED<\/span>/g) || [];
  assert.equal(stamps.length, 3);
  assert.match(html, /<ul class="rules">/);
  assert.match(html, /href="\/work\/backoffice-kit.html#architecture"/);
  assert.doesNotMatch(html, /class="cl"/);
});
