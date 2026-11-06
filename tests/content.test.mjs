import { test } from "node:test";
import assert from "node:assert/strict";
import { hero, heroMetrics, timeline, projects } from "../src/content/index.mjs";

const words = (s) => s.trim().split(/\s+/).length;
const FILLER = /\b(cutting-edge|passionate|seamless|actually|just)\b/i;

test("every project has a one-sentence plain summary ≤ 160 chars, no filler", () => {
  for (const p of projects) {
    assert.equal(typeof p.plain, "string", `${p.slug} missing plain`);
    assert.doesNotMatch(p.plain, FILLER);
    // The sample audit needs a second sentence to say plainly it isn't client work.
    if (p.slug === "shopfast-demo") {
      assert.match(p.plain, /A demo, not client work/);
      continue;
    }
    assert.ok(p.plain.length <= 160, `${p.slug} plain is ${p.plain.length} chars`);
    assert.equal((p.plain.match(/[.!?](\s|$)/g) || []).length, 1, `${p.slug} plain must be one sentence`);
  }
});

test("status labels are sentence case; codes unchanged", () => {
  for (const p of projects) {
    assert.equal(p.status.code, "running");
    assert.equal(p.status.label, p.slug === "selector-drift" ? "In development" : "Running");
  }
});

test("hero lede ≤ 40 words; every hero metric has a plain caption", () => {
  assert.ok(words(hero.lede) <= 40, `lede is ${words(hero.lede)} words`);
  for (const m of heroMetrics) assert.ok(m.plain && m.plain.length <= 80, `${m.id} needs plain ≤ 80`);
});

test("timeline bodies ≤ 40 words", () => {
  for (const t of timeline) assert.ok(words(t.body) <= 40, `${t.mode}: ${words(t.body)} words`);
});
