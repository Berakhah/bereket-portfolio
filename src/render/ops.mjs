// Build-time data for the dark-ops layer: the boot sequence and the
// capability graph.  Every value is derived from src/content — nothing typed.
import { esc } from "./components.mjs";

const CORE = "bok-core";

// Status codes → the short readout vocabulary (labels in content are long).
const SHORT = {
  running: "running",
  "active-development": "active development",
  "audit-pending": "audit pending",
  "design-complete": "design complete",
  planned: "planned",
};

const dots = (label, width = 26) => (label + " ").padEnd(width, ".");

export const statusCounts = (projects) => {
  const counts = new Map();
  for (const p of projects) {
    const k = SHORT[p.status.code] || p.status.code;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts].map(([label, n]) => `${n} ${label}`);
};

export const bootLines = ({ site, projects, heroMetrics }) => [
  `> ${site.name.split(" ")[0].toLowerCase()}.sh --boot`,
  `> ${dots("loading systems")} ${projects.length} found`,
  `> ${dots("status")} ${statusCounts(projects).join(" · ")}`,
  `> ${dots("verified figures")} ${heroMetrics.length} loaded, provenance attached`,
  `> ${dots("document reviewed")} ${site.reviewed}`,
  `> ready`,
];

export const bootBlock = (lines) => `
<pre class="boot mono" data-boot>${lines
  .map((l, i) => `<span class="boot-line" style="--i:${i}">${esc(l)}</span>`)
  .join("\n")}<span class="boot-caret" aria-hidden="true"></span></pre>`;

// Nodes: the five systems + bok-core.  Edges: any system the substrate
// project lists in its flow, plus the project whose own flow contains the
// core (BackOffice Kit) — i.e. exactly the substrate relationships in content.
export const graphData = (projects) => {
  const nodes = projects.map((p) => ({ id: p.slug, label: p.name, status: p.status.code }));
  nodes.push({ id: CORE, label: CORE, status: "core" });
  const substrate = projects.find((p) => p.substrate);
  const edges = [];
  for (const p of projects) {
    const onSubstrate = !!substrate && substrate.flow.includes(p.name);
    const ownsCore = p.flow.includes(CORE);
    if (onSubstrate || ownsCore) edges.push({ from: p.slug, to: CORE });
  }
  return { nodes, edges };
};

export const graphScript = (data) =>
  `<script type="application/json" id="graph-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
