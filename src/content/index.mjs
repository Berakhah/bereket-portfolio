// Aggregates the full content model in one import point for the renderer.
import {
  site, nav, hero, proof, paths, audit, heroMetrics, principles, timeline, stack, about, contact,
} from "./person.mjs";
import { project as shopfast } from "./projects/shopfast-demo.mjs";
import { project as agentPerimeter } from "./projects/agent-perimeter.mjs";
import { project as groundTruth } from "./projects/ground-truth.mjs";
import { project as ledgerSense } from "./projects/ledger-sense.mjs";
import { project as selectorDrift } from "./projects/selector-drift.mjs";
import { project as aztdp } from "./projects/aztdp.mjs";

// Narrative order: security work first (the sample audit leads because audits
// are the offer), then the systems that show engineering depth.
const projects = [shopfast, agentPerimeter, aztdp, ledgerSense, groundTruth, selectorDrift];

// Homepage grouping and one-word status for each project. Status words are
// short on purpose; each case study's "Caveats & status" section has the detail.
const homeMeta = {
  "shopfast-demo": { group: "security", status: "Finished", kind: "Sample audit" },
  "agent-perimeter": { group: "security", status: "Released", kind: "Open-source scanner" },
  aztdp: { group: "security", status: "Prototype", kind: "Zero-trust reference platform" },
  "ledger-sense": { group: "depth", status: "Prototype", kind: "Document AI" },
  "ground-truth": { group: "depth", status: "Released, results pending", kind: "LLM evaluation" },
  "selector-drift": { group: "depth", status: "In development", kind: "Data extraction" },
};
for (const p of projects) p.home = homeMeta[p.slug];

const securityProjects = projects.filter((p) => p.home.group === "security");
const depthProjects = projects.filter((p) => p.home.group === "depth");

// Kept for the case-study pages: the sample, then the tools numbered from 01.
const [sampleProject, ...toolProjects] = projects;

// All evidence chains, keyed by metric id — embedded per page as JSON for the
// Claim → Evidence drawer.
const evidenceIndex = {};
for (const m of heroMetrics) evidenceIndex[m.id] = m.evidence;
for (const p of projects) {
  for (const m of p.card.metrics) {
    if (!evidenceIndex[m.id]) evidenceIndex[m.id] = m.evidence;
  }
}

export {
  site, nav, hero, proof, paths, audit, heroMetrics, principles, timeline, stack, about, contact,
  projects, sampleProject, toolProjects, securityProjects, depthProjects, evidenceIndex,
  shopfast, agentPerimeter, groundTruth, ledgerSense, selectorDrift, aztdp,
};
