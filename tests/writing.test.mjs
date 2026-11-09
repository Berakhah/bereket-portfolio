// A post with `draft: true` must never reach site/: no page, no sitemap entry, no nav link from
// it alone. A published post gets all three. A DRAFTS=1 build renders drafts too, into a separate
// output directory for review, never into site/.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, mkdtempSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { posts } from "../src/content/writing.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let PREVIEW;
const site = (p) => readFileSync(join(ROOT, "site", p), "utf8");
const preview = (p) => readFileSync(join(PREVIEW, p), "utf8");

before(() => {
  execFileSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "pipe" });
  PREVIEW = mkdtempSync(join(tmpdir(), "writing-preview-"));
  cpSync(join(ROOT, "site"), PREVIEW, { recursive: true });
  execFileSync(process.execPath, ["build.mjs"], {
    cwd: ROOT, stdio: "pipe", env: { ...process.env, DRAFTS: "1", SITE_OUT: PREVIEW },
  });
});

test("three posts, in the order they were planned; a published post carries its date", () => {
  assert.deepEqual(posts.map((p) => p.slug), [
    "mcp-registry-census", "shopfast-twelve-leaks", "scope-files-vs-random-sampling",
  ]);
  for (const p of posts) if (!p.draft) assert.match(p.date ?? "", /^\d{4}-\d{2}-\d{2}$/, p.slug);
});

test("a normal build publishes published posts and never a draft", () => {
  const map = site("sitemap.xml");
  for (const p of posts) {
    const path = join(ROOT, "site", "writing", `${p.slug}.html`);
    if (p.draft) {
      assert.equal(existsSync(path), false, p.slug);
      assert.doesNotMatch(map, new RegExp(`/writing/${p.slug}\\.html`), p.slug);
    } else {
      const html = site(`writing/${p.slug}.html`);
      assert.doesNotMatch(html, /noindex|class="post-draft"/, p.slug);
      assert.match(map, new RegExp(`/writing/${p.slug}\\.html`), p.slug);
    }
  }
  const anyPublished = posts.some((p) => !p.draft);
  assert.equal(/href="\/writing\/"/.test(site("index.html")), anyPublished);
});

test("a DRAFTS=1 preview renders every post; drafts there carry a banner and noindex", () => {
  for (const p of posts) {
    const html = preview(`writing/${p.slug}.html`);
    assert.match(html, new RegExp(`<h1 class="post-title[^"]*"[^>]*>${p.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`), p.slug);
    if (p.draft) {
      assert.match(html, /<meta name="robots" content="noindex">/, p.slug);
      assert.match(html, /class="post-draft"/, p.slug);
    }
  }
  assert.match(preview("writing/index.html"), /href="\/writing\/mcp-registry-census\.html"/);
});

test("each post has a hook, a method, a result, its limits, a way to reproduce, and one CTA", () => {
  for (const p of posts) {
    const html = preview(`writing/${p.slug}.html`);
    assert.match(html, /<p class="post-lede">/, p.slug);
    assert.match(html, /<section class="post-sec" id="not-shown">/, p.slug);
    assert.match(html, /<section class="post-sec" id="reproduce">/, p.slug);
    assert.equal((html.match(/class="post-cta"/g) || []).length, 1, p.slug);
    assert.match(html, new RegExp(`class="post-cta"[\\s\\S]*?href="${p.cta.href.replace(/[.?]/g, "\\$&")}"`), p.slug);
  }
});

test("every post says how it was made", () => {
  for (const p of posts) assert.match(preview(`writing/${p.slug}.html`), /<p class="post-note">[^<]*Claude Code/, p.slug);
});
