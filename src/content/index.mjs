// Aggregates the full content model in one import point for the renderer.
import { site, nav, heroMetrics, principles, timeline, stack, about, experience } from "./person.mjs";
import { project as agentPerimeter } from "./projects/agent-perimeter.mjs";
import { project as groundTruth } from "./projects/ground-truth.mjs";
import { project as ledgerSense } from "./projects/ledger-sense.mjs";
import { project as backofficeKit } from "./projects/backoffice-kit.mjs";
import { project as selectorDrift } from "./projects/selector-drift.mjs";

// Narrative order (fixed by the brief), not alphabetical.
const projects = [agentPerimeter, groundTruth, ledgerSense, backofficeKit, selectorDrift];

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
  site, nav, heroMetrics, principles, timeline, stack, about, experience,
  projects, evidenceIndex,
  agentPerimeter, groundTruth, ledgerSense, backofficeKit, selectorDrift,
};
