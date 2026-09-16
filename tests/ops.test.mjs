import { test } from "node:test";
import assert from "node:assert/strict";
import { statusCounts, bootLines, bootBlock, graphData, graphScript } from "../src/render/ops.mjs";
import { site, projects, heroMetrics } from "../src/content/index.mjs";

test("statusCounts groups by status code in order of first appearance", () => {
  assert.deepEqual(statusCounts(projects), ["5 running"]);
  assert.deepEqual(
    statusCounts([{ status: { code: "running" } }, { status: { code: "planned" } }, { status: { code: "running" } }]),
    ["2 running", "1 planned"],
  );
});

test("bootLines derive every figure from content", () => {
  const lines = bootLines({ site, projects, heroMetrics });
  assert.equal(lines.length, 6);
  assert.equal(lines[0], "> bereket.sh --boot");
  // dots() pads "label " to 26 columns, so the leaders are 10 / 19 / 9 / 8 dots
  assert.equal(lines[1], "> loading systems .......... 5 found");
  assert.equal(lines[2], "> status ................... 5 running");
  assert.equal(lines[3], "> verified figures ......... 6 loaded, provenance attached");
  assert.equal(lines[4], `> document reviewed ........ ${site.reviewed}`);
  assert.equal(lines[5], "> ready");
});

test("bootBlock renders one escaped span per line plus a caret", () => {
  const html = bootBlock(["> a <b>", "> c"]);
  assert.match(html, /<pre class="boot mono" data-boot>/);
  assert.match(html, /<span class="boot-line" style="--i:0">&gt; a &lt;b&gt;<\/span>/);
  assert.match(html, /<span class="boot-line" style="--i:1">&gt; c<\/span>/);
  assert.match(html, /<span class="boot-caret" aria-hidden="true"><\/span>/);
});

test("graphData: six nodes, edges only from systems that stand on bok-core", () => {
  const g = graphData(projects);
  assert.equal(g.nodes.length, 6);
  assert.ok(g.nodes.some((n) => n.id === "bok-core" && n.status === "core"));
  assert.deepEqual(
    g.edges.map((e) => e.from).sort(),
    ["agent-perimeter", "backoffice-kit", "ground-truth", "ledger-sense"]
  );
  assert.ok(g.edges.every((e) => e.to === "bok-core"));
});

test("graphScript embeds JSON with < escaped", () => {
  const s = graphScript({ nodes: [{ id: "x", label: "<b>" }], edges: [] });
  assert.match(s, /^<script type="application\/json" id="graph-data">/);
  assert.ok(!s.includes("<b>"));
  assert.ok(s.includes("\\u003cb>"));
});
