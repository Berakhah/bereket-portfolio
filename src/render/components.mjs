// HTML component renderers shared by every page. Zero dependencies.

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Inline markdown: **bold** and `code`. Escapes first.
export const md = (s = "") =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");

export const prose = (text, cls = "") => {
  const paras = Array.isArray(text) ? text : [text];
  return paras.map((p) => `<p class="${cls}">${md(p)}</p>`).join("\n");
};

export const bullets = (items, cls = "bullets") =>
  `<ul class="${cls}">${items.map((i) => `<li>${md(i)}</li>`).join("")}</ul>`;

// ---------------------------------------------------------------------------
// Icons (inline SVG, 24px grid, stroke inherits currentColor)
// ---------------------------------------------------------------------------

const I = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17L17 7M9 7h8v8"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v1.5A6 6 0 0 1 16 8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18.2v.3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 13v6H5V6h6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.3"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  scale: '<path d="M12 3v18M8 21h8M12 6l-6 2 6-2 6 2M5 8l-2.5 6a3 3 0 0 0 5 0L5 8zM19 8l-2.5 6a3 3 0 0 0 5 0L19 8z"/>',
  route: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.5 6H15a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h7.5" transform="translate(0 -4)"/>',
  branch: '<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 7.5v9M18 11.5a9 9 0 0 1-9 7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
};

export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${I[name] || I.info}</svg>`;

// ---------------------------------------------------------------------------
// Flow stepper — the architecture-flow diagram component (recomposed on mobile).
// ---------------------------------------------------------------------------

export const flowStepper = (nodes, label, variant = "h") => `
<ol class="flow${variant === "v" ? " flow-v" : ""}" role="list" aria-label="${esc(label)}">
  <svg class="flow-line" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><line class="fl-h" x1="0" y1="50" x2="100" y2="50" pathLength="1"/><line class="fl-v" x1="50" y1="0" x2="50" y2="100" pathLength="1"/></svg>
  ${nodes
    .map(
      (n, i) => `<li class="flow-node" style="--i:${i}">
      <span class="flow-dot" aria-hidden="true"></span>
      <span class="flow-text"><span class="flow-label">${esc(n)}</span></span>
    </li>`
    )
    .join("")}
</ol>`;

// ---------------------------------------------------------------------------
// Metrics — value is a provenance trigger (Claim → Evidence).
// ---------------------------------------------------------------------------

export const metricEl = (m, size = "sm") => `
<div class="metric metric-${size}">
  <button class="metric-value prov-trigger" type="button"
    data-evidence="${esc(m.id)}"
    aria-haspopup="dialog"
    aria-label="${esc(`${m.value} ${m.label} — show evidence`)}">
    <span class="tnum">${esc(m.value)}</span>
  </button>
  <span class="metric-label">${esc(m.label)}</span>
  <span class="metric-context">${md(m.context)}</span>
</div>`;

export const metricsRow = (metrics) =>
  `<div class="metrics-row">${metrics.map((m) => metricEl(m)).join("")}</div>`;

// Big metric — the home proof strip: mono numeral, plain-English caption.
export const bigMetric = (m) => `
<div class="big-metric">
  <button class="big-value prov-trigger mono" type="button" data-evidence="${esc(m.id)}" aria-haspopup="dialog" aria-label="${esc(`${m.value} ${m.label} — show evidence`)}">${esc(m.value)}</button>
  <span class="big-plain">${esc(m.plain || m.label)}</span>
</div>`;

// ---------------------------------------------------------------------------
// Provenance underline wrapper for inline figures
// ---------------------------------------------------------------------------

export const prov = (id, text) =>
  `<button class="prov-trigger prov-inline" type="button" data-evidence="${esc(id)}" aria-haspopup="dialog"><span class="tnum">${esc(text)}</span></button>`;

// ---------------------------------------------------------------------------
// Evidence drawer data (embedded JSON) + drawer shell
// ---------------------------------------------------------------------------

export const evidenceScript = (evidenceIndex) =>
  `<script type="application/json" id="evidence-data">${JSON.stringify(evidenceIndex).replace(/</g, "\\u003c")}</script>`;

export const evidenceDrawer = () => `
<div class="drawer-root" aria-hidden="true">
  <div class="drawer-backdrop" data-drawer-close></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabindex="-1">
    <div class="drawer-head">
      <span class="drawer-eyebrow"><span class="mono">CLAIM → EVIDENCE</span></span>
      <button class="drawer-close" type="button" data-drawer-close aria-label="Close evidence panel">${icon("close")}</button>
    </div>
    <div class="drawer-body" id="drawer-body"><!-- rendered by main.js --></div>
    <div class="drawer-foot mono">
      <span>Every figure on this site carries a chain like this one.</span>
    </div>
  </aside>
</div>`;

// ---------------------------------------------------------------------------
// Repo chip — only rendered as a link when the source confirms it is real.
// ---------------------------------------------------------------------------

export const repoChip = (p) => {
  if (p.links && p.links.github) {
    return `<a class="chip chip-link" href="${esc(p.links.github)}" rel="noopener" target="_blank">
      ${icon("github")}<span class="mono">github.com/Berakhah/${esc(p.slug)}</span>${icon("external", "icon-xs")}
    </a>`;
  }
  const state = p.repoState === "pending"
    ? "repository · URL pending verification"
    : "repository · planned public";
  return `<span class="chip chip-muted" title="No live link shown: the source material does not confirm a public URL.">
    ${icon("branch")}<span class="mono">${esc(state)}</span>
  </span>`;
};

// ---------------------------------------------------------------------------
// Substrate diagram (BackOffice Kit) — three systems on one core
// ---------------------------------------------------------------------------

export const substrateDiagram = () => `
<div class="substrate" role="img" aria-label="Diagram: Agent Perimeter, Ground Truth and Ledger Sense all stand on the bok-core substrate — sensitivity boundary, provenance claims, findings, and the model gateway.">
  <div class="substrate-top">
    <div class="substrate-app"><span class="mono">AGENT PERIMETER</span><em>findings cite scope, CWE &amp; reproduction</em></div>
    <div class="substrate-app"><span class="mono">GROUND TRUTH</span><em>every figure is a bootstrap interval</em></div>
    <div class="substrate-app"><span class="mono">LEDGER SENSE</span><em>validation before routing</em></div>
  </div>
  <div class="substrate-links" aria-hidden="true">
    <span></span><span></span><span></span>
  </div>
  <div class="substrate-core">
    <div class="substrate-core-head"><span class="mono">bok-core</span><span class="substrate-core-sub">the shared substrate</span></div>
    <div class="substrate-cells">
      <div class="substrate-cell"><span class="mono">provenance</span><em>value · source · method · confidence · parents</em></div>
      <div class="substrate-cell"><span class="mono">boundary</span><em>sensitivity labels, fail-closed capability matrix</em></div>
      <div class="substrate-cell"><span class="mono">gateway</span><em>lanes, fallback chains, quota governor</em></div>
      <div class="substrate-cell"><span class="mono">findings</span><em>severity ladder · SARIF 2.1.0</em></div>
    </div>
  </div>
</div>`;

// ---------------------------------------------------------------------------
// Portrait — responsive <picture>; renditions produced by src/og/portrait.py.
// ---------------------------------------------------------------------------
export const portrait = (size = 1200, cls = "", eager = false) => {
  const srcset = (ext) => size >= 600
    ? `/assets/img/bereket-600.${ext} 600w, /assets/img/bereket-1200.${ext} 1200w`
    : `/assets/img/bereket-192.${ext} 192w`;
  const sizes = size >= 600 ? "(max-width: 56em) 60vw, 40vw" : "96px";
  const base = size >= 600 ? 1200 : 192;
  return `<picture class="portrait ${cls}">
  <source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}">
  <img src="/assets/img/bereket-${base}.jpg" srcset="${srcset("jpg")}" sizes="${sizes}" width="${size}" height="${Math.round(size * 4 / 3)}" alt="Bereket Tilahun, arms folded, in a black floral shirt" ${eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'}>
</picture>`;
};
