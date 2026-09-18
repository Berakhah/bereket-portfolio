import { test } from "node:test";
import assert from "node:assert/strict";
import * as C from "../src/render/components.mjs";

test("flowStepper: horizontal by default, vertical variant, drawable line kept", () => {
  const h = C.flowStepper(["A", "B <x>"], "demo");
  assert.match(h, /<ol class="flow" role="list" aria-label="demo">/);
  assert.match(h, /<line class="fl-h"/);
  assert.match(h, /B &lt;x&gt;/);
  const v = C.flowStepper(["A", "B"], "demo", "v");
  assert.match(v, /<ol class="flow flow-v"/);
});

test("bigMetric renders a mono numeral trigger and the plain caption", () => {
  const html = C.bigMetric({ id: "m-1", value: "742", label: "test functions", plain: "automated tests guard the scanner" });
  assert.match(html, /<button class="big-value prov-trigger mono" type="button" data-evidence="m-1"/);
  assert.match(html, />742</);
  assert.match(html, /<span class="big-plain">automated tests guard the scanner<\/span>/);
});

test("portrait emits webp + jpg renditions with explicit dimensions", () => {
  const p = C.portrait(1200, "hero-portrait", true);
  assert.match(p, /<picture class="portrait hero-portrait">/);
  assert.match(p, /bereket-1200\.webp 1200w/);
  assert.match(p, /width="1200" height="1600"/);
  assert.match(p, /fetchpriority="high"/);
  assert.match(C.portrait(192, "foot-portrait"), /loading="lazy"/);
});

test("badge and claimRules are gone", () => {
  assert.equal(C.badge, undefined);
  assert.equal(C.claimRules, undefined);
});
