// Aggregates the full content model in one import point for the renderer.
import { site, nav, hero, audit, heroMetrics, principles, timeline, stack, about, experience } from "./person.mjs";
import { project as shopfast } from "./projects/shopfast-demo.mjs";
import { project as agentPerimeter } from "./projects/agent-perimeter.mjs";
import { project as groundTruth } from "./projects/ground-truth.mjs";
import { project as ledgerSense } from "./projects/ledger-sense.mjs";
import { project as selectorDrift } from "./projects/selector-drift.mjs";
import { project as aztdp } from "./projects/aztdp.mjs";

// Narrative order, not alphabetical: the sample audit leads because audits are the offer.
const projects = [shopfast, agentPerimeter, ledgerSense, aztdp, groundTruth, selectorDrift];

// The homepage and case studies share this order and numbering: the sample,
// then the tools numbered from 01.
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
  site, nav, hero, audit, heroMetrics, principles, timeline, stack, about, experience,
  projects, sampleProject, toolProjects, evidenceIndex,
  shopfast, agentPerimeter, groundTruth, ledgerSense, selectorDrift, aztdp,
};
