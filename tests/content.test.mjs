import { test } from "node:test";
import assert from "node:assert/strict";
import { site, heroMetrics, timeline, projects } from "../src/content/index.mjs";

const words = (s) => s.trim().split(/\s+/).length;
const FILLER = /\b(cutting-edge|passionate|seamless|actually|just)\b/i;

test("every project has a one-sentence plain summary ≤ 160 chars, no filler", () => {
  for (const p of projects) {
    assert.equal(typeof p.plain, "string", `${p.slug} missing plain`);
    assert.ok(p.plain.length <= 160, `${p.slug} plain is ${p.plain.length} chars`);
    assert.doesNotMatch(p.plain, FILLER);
    assert.equal((p.plain.match(/[.!?](\s|$)/g) || []).length, 1, `${p.slug} plain must be one sentence`);
  }
});

test("status labels are sentence case; codes unchanged", () => {
  for (const p of projects) {
    assert.equal(p.status.code, "running");
    assert.equal(p.status.label, "Running");
  }
});

test("positioning ≤ 20 words; every hero metric has a plain caption", () => {
  assert.ok(words(site.positioning) <= 20, `positioning is ${words(site.positioning)} words`);
  for (const m of heroMetrics) assert.ok(m.plain && m.plain.length <= 80, `${m.id} needs plain ≤ 80`);
});

test("timeline bodies ≤ 40 words", () => {
  for (const t of timeline) assert.ok(words(t.body) <= 40, `${t.mode}: ${words(t.body)} words`);
});
