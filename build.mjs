// Zero-dependency static site builder.  node build.mjs
// Renders index, résumé, 404 and /work/<slug> case studies from src/content.
import { mkdirSync, writeFileSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  site, nav, heroMetrics, principles, timeline, stack, about, experience,
  projects, evidenceIndex,
} from "./src/content/index.mjs";
import {
  esc, md, prose, bullets, icon, badge, flowStepper, metricsRow,
  evidenceScript, evidenceDrawer, repoChip, substrateDiagram, claimSpecimen, prov,
} from "./src/render/components.mjs";
import { head, scripts, header, footer } from "./src/render/layout.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "site");

const page = ({ title, desc, path, bodyClass = "", main, jsonLd = null, extraScripts = [] }) => `${head({
  title, desc, path, siteUrl: site.siteUrl, jsonLd,
})}
<body class="${bodyClass}">
<div class="curtain" aria-hidden="true"></div>
${header(path)}
<main id="main">
${main}
</main>
${footer(site)}
${evidenceDrawer()}
${evidenceScript(evidenceIndex)}
${scripts(extraScripts)}
</body>
</html>`;

// ---------------------------------------------------------------------------
// Shared partials
// ---------------------------------------------------------------------------

const sectionHead = (eyebrow, title, intro = "") => `
<div class="section-head rv">
  <p class="eyebrow mono">${eyebrow}</p>
  <h2 class="section-title">${title}</h2>
  ${intro ? `<p class="section-intro">${intro}</p>` : ""}
</div>`;

const STATUS_LEGEND = `
<div class="status-legend rv" aria-label="Status vocabulary">
  <p class="legend-title mono">STATUS VOCABULARY — USED AS STATED, EVERYWHERE</p>
  <dl class="legend-grid">
    <div><dt><span class="badge st-running"><span class="badge-glyph pulse" aria-hidden="true"></span>RUNNING</span></dt>
      <dd>Implemented and demonstrably working — public repo + reproducible verification.</dd></div>
    <div><dt><span class="badge st-active"><span class="badge-glyph pulse" aria-hidden="true"></span>ACTIVE DEVELOPMENT</span></dt>
      <dd>Real implementation exists; project incomplete.</dd></div>
    <div><dt><span class="badge st-design"><span class="badge-glyph static" aria-hidden="true"></span>DESIGN COMPLETE</span></dt>
      <dd>Architecture/spec exists; implementation not started or incomplete.</dd></div>
    <div><dt><span class="badge st-planned"><span class="badge-glyph static" aria-hidden="true"></span>PLANNED</span></dt>
      <dd>Concept/design stage only.</dd></div>
  </dl>
</div>`;

// ---------------------------------------------------------------------------
// Hero pipeline — the systems visualization (HTML stations on an animated rail)
// ---------------------------------------------------------------------------

const PIPELINE = [
  { n: "01", name: "Input", sub: "documents, requests, events", d: "Everything enters through one labelled, validated door." },
  { n: "02", name: "Processing", sub: "deterministic first, models as escalation", d: "Rules do the work; a model is escalated to, never defaulted to." },
  { n: "03", name: "Validation", sub: "typed rules · fixtures that must trip", d: "Every rule ships with a fixture that must trip it and a control that must not." },
  { n: "04", name: "Policy", sub: "what the system is allowed to do", d: "Scope files, sensitivity labels, fail-closed authorisation." },
  { n: "05", name: "Evidence", sub: "provenance · reproduction · confidence", d: "Every figure carries source, method and caveats — or doesn’t render." },
  { n: "06", name: "Output", sub: "facts that carry their own caveats", d: "Numbers leave with their chain attached. Never a bare float." },
];

const heroPipeline = () => `
<div class="pipeline rv" id="pipeline" role="group" aria-label="Systems pipeline: input, processing, validation, policy, evidence, output.">
  <div class="pipeline-rail" aria-hidden="true"><span class="rail-line"></span><span class="rail-pulse"></span></div>
  <ol class="pipeline-stations">
    ${PIPELINE.map(
      (s, i) => `<li class="station" style="--i:${i}" tabindex="0" aria-label="${esc(`Stage ${s.n}: ${s.name}. ${s.d}`)}">
        <span class="station-num mono">${s.n}</span>
        <span class="station-body">
          <span class="station-name">${s.name}</span>
          <span class="station-sub">${esc(s.sub)}</span>
        </span>
        <span class="station-tip" role="presentation">${esc(s.d)}</span>
      </li>`
    ).join("")}
  </ol>
</div>`;

// ---------------------------------------------------------------------------
// Project card
// ---------------------------------------------------------------------------

const projectCard = (p, i) => {
  const idx = String(i + 1).padStart(2, "0");
  const isSubstrate = !!p.substrate;
  return `
<article class="project-card rv ${isSubstrate ? "card-substrate" : ""}" id="card-${p.slug}" aria-labelledby="pc-${p.slug}">
  <div class="pc-head">
    <span class="pc-index mono" aria-hidden="true">${idx}</span>
    <div class="pc-titlebox">
      <p class="pc-tagline mono">${esc(p.tagline)}</p>
      <h3 class="pc-name" id="pc-${p.slug}">${esc(p.name)}</h3>
    </div>
    ${badge(p.status)}
  </div>
  <p class="pc-status-detail">${md(p.status.detail)}</p>
  <p class="pc-statement">${esc(p.statement)}</p>

  ${isSubstrate ? substrateDiagram() : flowStepper(p.flow, `${p.name} architecture flow`)}

  ${metricsRow(p.card.metrics)}

  <div class="pc-lower">
    <div class="pc-diff">
      <h4 class="pc-lower-h mono">WHY IT’S DIFFERENT</h4>
      <p>${md(p.card.differentiator)}</p>
    </div>
    <div class="pc-caveat">
      <h4 class="pc-lower-h mono">${icon("alert", "icon-xs")} HONEST CAVEAT</h4>
      <p>${md(p.card.caveat)}</p>
    </div>
  </div>

  <div class="pc-foot">
    <div class="pc-chips">
      ${repoChip(p)}
      <span class="chip chip-muted mono">${esc(p.licence)}</span>
    </div>
    <a class="btn btn-ink pc-cta" href="/work/${p.slug}.html">
      Read the case study ${icon("arrow")}
    </a>
  </div>
</article>`;
};

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

const indexPage = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Bereket Tilahun",
    jobTitle: "Backend Security Engineer & Software Engineer",
    email: `mailto:${site.email}`,
    address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    sameAs: [site.github, site.linkedin],
    knowsAbout: ["Backend Security", "Zero Trust", "OIDC", "Threat Modeling", "LLM Evaluation", "FastAPI", "Django REST", "Distributed Systems"],
  };

  const main = `
<!-- ============================ 1 · IDENTITY ============================ -->
<section class="hero" aria-labelledby="hero-h">
  <div class="hero-grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow mono rv" style="--d:.05s">${esc(site.name)} · ${esc(site.title)} · ${esc(site.location)}</p>
    <h1 class="hero-h" id="hero-h">
      <span class="line-mask rv" style="--d:.12s">Systems that know what they are</span>
      <span class="line-mask rv" style="--d:.22s"><em>allowed to do</em>, know when they are</span>
      <span class="line-mask rv" style="--d:.32s"><em>uncertain</em>, preserve evidence, and</span>
      <span class="line-mask rv" style="--d:.42s"><em>fail safely.</em></span>
    </h1>
    <div class="hero-lede-row rv" style="--d:.55s">
      <p class="hero-lede">${esc(site.positioning)}</p>
      <div class="hero-ctas">
        <a class="btn btn-ink" href="#work">View the work ${icon("arrowDown")}</a>
        <a class="btn btn-quiet" href="/assets/Bereket_Tilahun_Resume.pdf" download>Download résumé ${icon("download")}</a>
      </div>
    </div>

    <!-- ======================== 2 · PROOF STRIP ======================== -->
    <div class="proof rv" style="--d:.7s" aria-label="Selected verified metrics — activate any figure for its evidence">
      <p class="proof-head mono">${icon("info", "icon-xs")} VERIFIED FIGURES — ACTIVATE ANY NUMBER FOR ITS CHAIN</p>
      <div class="proof-grid">
        ${heroMetrics
          .map(
            (m) => `<button class="proof-item prov-trigger" type="button" data-evidence="${esc(m.id)}" aria-haspopup="dialog">
              <span class="proof-value tnum">${esc(m.value)}</span>
              <span class="proof-label">${esc(m.label)}</span>
              <span class="proof-context">${md(m.context)}</span>
            </button>`
          )
          .join("")}
      </div>
    </div>

    ${heroPipeline()}
  </div>
</section>

<!-- ============================ 3 · WORK ============================ -->
<section class="section section-work" id="work" aria-labelledby="work-h">
  <div class="wrap">
    ${sectionHead("§ 01 — FEATURED WORK", `<span id="work-h">Five systems, one conviction</span>`,
      "Security, backend correctness, trustworthy automation and evidence — presented in the order they build on each other. Each card states its status, its strongest proof, and what is not finished.")}
    ${STATUS_LEGEND}
    <div class="project-stack">
      ${projects.map((p, i) => projectCard(p, i)).join("")}
    </div>
  </div>
</section>

<!-- =========================== 4 · EVIDENCE =========================== -->
<section class="section section-evidence" id="evidence" aria-labelledby="evidence-h">
  <div class="wrap">
    ${sectionHead("§ 02 — EVIDENCE", `<span id="evidence-h">A number that can’t show its work is decoration</span>`,
      "BackOffice Kit’s <code>Claim</code> type makes provenance structural: value, source, method, confidence, timestamp, inherited caveats, parent claims. The whole portfolio is built the same way.")}
    ${claimSpecimen()}
  </div>
</section>

<!-- ========================== 5 · ENGINEERING ========================== -->
<section class="section section-engineering" id="engineering" aria-labelledby="eng-h">
  <div class="wrap">
    ${sectionHead("§ 03 — HOW I THINK", `<span id="eng-h">Principles, with the systems that forced them</span>`,
      "Not aphorisms — each one is a decision this portfolio can point to.")}
    <ol class="principles">
      ${principles
        .map(
          (pr, i) => `<li class="principle rv" style="--i:${i}">
            <span class="principle-num mono" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 class="principle-title">${esc(pr.title)}</h3>
              <p class="principle-body">${md(pr.body)}</p>
              <p class="principle-src mono">${icon("branch", "icon-xs")} ${esc(pr.source)}</p>
            </div>
          </li>`
        )
        .join("")}
    </ol>

    <div class="subblock" aria-labelledby="timeline-h">
      <h3 class="subblock-h" id="timeline-h"><span class="mono eyebrow">§ 03.1</span> Four years, five modes</h3>
      <p class="subblock-intro">A career stated as engineering modes rather than job dates — each mode absorbed into the next.</p>
      <ol class="modes">
        ${timeline
          .map(
            (t) => `<li class="mode rv kind-${t.kind}">
              <div class="mode-rail" aria-hidden="true"><span class="mode-dot"></span></div>
              <div class="mode-body">
                <div class="mode-meta"><span class="mode-kind mono">${esc(t.mode)}</span><span class="mode-range mono">${esc(t.range)}</span></div>
                <h4 class="mode-heading">${esc(t.heading)}</h4>
                <p class="mode-text">${md(t.body)}</p>
                ${t.href ? `<a class="text-link" href="${t.href}">See the systems ${icon("arrow", "icon-xs")}</a>` : ""}
              </div>
            </li>`
          )
          .join("")}
      </ol>
    </div>

    <div class="subblock" aria-labelledby="stack-h">
      <h3 class="subblock-h" id="stack-h"><span class="mono eyebrow">§ 03.2</span> Stack</h3>
      <p class="subblock-intro">Grouped by what it does — no logo wall, no percentage bars.</p>
      <div class="stack-grid">
        ${stack
          .map(
            (s) => `<div class="stack-group rv">
              <h4 class="stack-h mono">${esc(s.group)}</h4>
              <ul class="stack-items">${s.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
            </div>`
          )
          .join("")}
      </div>
    </div>
  </div>
</section>

<!-- ============================ 6 · ABOUT ============================ -->
<section class="section section-about" id="about" aria-labelledby="about-h">
  <div class="wrap about-grid">
    <div class="about-copy">
      ${sectionHead("§ 04 — ABOUT", `<span id="about-h">${esc(about.lede)}</span>`)}
      ${prose(about.body, "about-p")}
      <p class="about-edu mono">${icon("book", "icon-xs")} ${esc(about.education)}</p>
    </div>
    <aside class="about-facts rv" aria-label="Quick facts">
      <h3 class="foot-h mono">FACTS</h3>
      <dl class="facts">
        <div><dt class="mono">BASE</dt><dd>${esc(site.location)}</dd></div>
        <div><dt class="mono">ROLE</dt><dd>Senior Software Engineer — DZ Software Engineering PLC</dd></div>
        <div><dt class="mono">FOCUS</dt><dd>Zero Trust · OIDC · evaluation infrastructure · trustworthy automation</dd></div>
        <div><dt class="mono">STATUS</dt><dd>${esc(site.availability)}</dd></div>
      </dl>
    </aside>
  </div>
</section>

<!-- =========================== 7 · CONTACT =========================== -->
<section class="section section-contact" id="contact" aria-labelledby="contact-h">
  <div class="wrap">
    ${sectionHead("§ 05 — CONTACT", `<span id="contact-h">The fastest path is email.</span>`,
      "No forms, no friction. One message with context gets a considered reply.")}
    <div class="contact-grid rv">
      <a class="contact-card" href="mailto:${esc(site.email)}">
        ${icon("mail")}<span class="cc-label mono">EMAIL</span><span class="cc-value">${esc(site.email)}</span>
      </a>
      <a class="contact-card" href="${esc(site.github)}" rel="noopener" target="_blank">
        ${icon("github")}<span class="cc-label mono">GITHUB</span><span class="cc-value">@Berakhah ${icon("external", "icon-xs")}</span>
      </a>
      <a class="contact-card" href="${esc(site.linkedin)}" rel="noopener" target="_blank">
        ${icon("linkedin")}<span class="cc-label mono">LINKEDIN</span><span class="cc-value">in/bereket-tilahun ${icon("external", "icon-xs")}</span>
      </a>
      <a class="contact-card" href="/assets/Bereket_Tilahun_Resume.pdf" download>
        ${icon("download")}<span class="cc-label mono">RÉSUMÉ</span><span class="cc-value">PDF — one page</span>
      </a>
    </div>
    <p class="contact-avail rv">${esc(site.availability)} phone: <a class="text-link" href="tel:${esc(site.phone.replace(/\s/g, ""))}" class="tnum">${esc(site.phone)}</a></p>
  </div>
</section>`;

  return page({
    title: "Bereket Tilahun — Backend Security Engineer",
    desc: site.positioning,
    path: "/",
    bodyClass: "page-home",
    main,
    jsonLd,
    extraScripts: ["/assets/js/graph.js"],
  });
};

// ---------------------------------------------------------------------------
// Case study pages — fixed structure (§9)
// ---------------------------------------------------------------------------

const caseSections = (p) => {
  const cs = p.caseStudy;
  const toc = [
    ["problem", "Problem"],
    ["why", "Why existing approaches fail"],
    ["architecture", "System architecture"],
    ["threat", "Threat model"],
    ["decisions", "Key decisions"],
    ["implementation", "Implementation"],
    ["evidence", "Evidence"],
    ["controls", "Security controls"],
    ["tradeoffs", "Trade-offs"],
    ["limits", "Limitations"],
    ["status", "Current status"],
    ["repo", "Repository & demo"],
  ];
  return `
<div class="cs-layout wrap">
  <aside class="cs-toc" aria-label="Case study sections">
    <p class="mono toc-h">CONTENTS</p>
    <ol>
      ${toc.map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join("")}
    </ol>
    <a class="btn btn-quiet btn-sm toc-back" href="/#work">${icon("arrow")} All work</a>
  </aside>

  <div class="cs-body">
    <section class="cs-sec rv" id="problem" aria-labelledby="problem-h">
      <p class="eyebrow mono">§ 1 — PROBLEM</p>
      <h2 class="cs-h" id="problem-h">The problem</h2>
      ${prose(cs.problem)}
    </section>

    <section class="cs-sec rv" id="why" aria-labelledby="why-h">
      <p class="eyebrow mono">§ 2 — PRIOR ART</p>
      <h2 class="cs-h" id="why-h">Why existing approaches fail</h2>
      ${bullets(cs.whyFails)}
    </section>

    <section class="cs-sec rv" id="architecture" aria-labelledby="arch-h">
      <p class="eyebrow mono">§ 3 — ARCHITECTURE</p>
      <h2 class="cs-h" id="arch-h">System architecture</h2>
      ${prose(cs.architecture.intro)}
      ${cs.architecture.claimCode ? `<div class="code-block rv"><span class="code-label mono">the Claim type</span><pre><code>${esc(cs.architecture.claimCode)}</code></pre></div>` : ""}
      ${flowStepper(p.flow, `${p.name} architecture flow`)}
      <div class="code-block rv"><span class="code-label mono">repository layout</span><pre><code>${esc(cs.architecture.tree)}</code></pre></div>
    </section>

    <section class="cs-sec rv" id="threat" aria-labelledby="threat-h">
      <p class="eyebrow mono">§ 4 — THREAT MODEL</p>
      <h2 class="cs-h" id="threat-h">Threat model</h2>
      ${bullets(cs.threatModel)}
    </section>

    <section class="cs-sec rv" id="decisions" aria-labelledby="dec-h">
      <p class="eyebrow mono">§ 5 — DECISIONS</p>
      <h2 class="cs-h" id="dec-h">Key decisions</h2>
      <dl class="decisions">
        ${cs.decisions.map((d) => `<div class="decision rv"><dt>${esc(d.title)}</dt><dd>${md(d.body)}</dd></div>`).join("")}
      </dl>
    </section>

    <section class="cs-sec rv" id="implementation" aria-labelledby="impl-h">
      <p class="eyebrow mono">§ 6 — IMPLEMENTATION</p>
      <h2 class="cs-h" id="impl-h">Implementation</h2>
      ${bullets(cs.implementation)}
    </section>

    <section class="cs-sec rv" id="evidence" aria-labelledby="ev-h">
      <p class="eyebrow mono">§ 7 — EVIDENCE</p>
      <h2 class="cs-h" id="ev-h">Evidence</h2>
      ${metricsRow(p.card.metrics)}
      ${bullets(cs.evidence)}
    </section>

    <section class="cs-sec rv" id="controls" aria-labelledby="ctl-h">
      <p class="eyebrow mono">§ 8 — CONTROLS</p>
      <h2 class="cs-h" id="ctl-h">Security controls</h2>
      ${bullets(cs.securityControls)}
    </section>

    <section class="cs-sec rv" id="tradeoffs" aria-labelledby="tr-h">
      <p class="eyebrow mono">§ 9 — TRADE-OFFS</p>
      <h2 class="cs-h" id="tr-h">Trade-offs</h2>
      ${bullets(cs.tradeoffs)}
    </section>

    <section class="cs-sec rv" id="limits" aria-labelledby="lim-h">
      <p class="eyebrow mono">§ 10 — LIMITATIONS</p>
      <h2 class="cs-h" id="lim-h">Limitations</h2>
      ${bullets(cs.limitations)}
    </section>

    <section class="cs-sec rv" id="status" aria-labelledby="st-h">
      <p class="eyebrow mono">§ 11 — STATUS</p>
      <h2 class="cs-h" id="st-h">Current status</h2>
      <div class="status-block">
        ${badge(p.status)}
        <p class="pc-status-detail">${md(p.status.detail)}</p>
      </div>
      ${prose(cs.currentStatus)}
    </section>

    <section class="cs-sec rv" id="repo" aria-labelledby="repo-h">
      <p class="eyebrow mono">§ 12 — REPOSITORY</p>
      <h2 class="cs-h" id="repo-h">Repository &amp; demo</h2>
      <div class="repo-block">
        ${repoChip(p)}
        <span class="chip chip-muted mono">${esc(p.licence)}</span>
      </div>
      <p class="repo-note">${md(cs.repoNote)}</p>
    </section>
  </div>
</div>`;
};

const casePage = (p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${p.name} — ${p.tagline}`,
    author: { "@type": "Person", name: "Bereket Tilahun" },
    about: p.category.join(", "),
  };
  const main = `
<section class="cs-hero">
  <div class="hero-grid-bg" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow mono rv">CASE STUDY · ${esc(p.category.join(" · "))}</p>
    <h1 class="cs-title rv" style="--d:.1s">${esc(p.name)}</h1>
    <p class="cs-tagline rv" style="--d:.18s">${esc(p.tagline)}</p>
    <p class="cs-statement rv" style="--d:.26s">“${esc(p.statement)}”</p>
    <div class="cs-meta rv" style="--d:.34s">
      ${badge(p.status)}
      <span class="mono meta-sep" aria-hidden="true">/</span>
      <span class="mono">${esc(p.role)}</span>
    </div>
    <p class="pc-status-detail cs-status-detail rv" style="--d:.4s">${md(p.status.detail)}</p>
    <div class="cs-hero-flow rv" style="--d:.46s">
      ${flowStepper(p.flow, `${p.name} architecture flow`)}
    </div>
    <div class="cs-hero-tech rv" style="--d:.52s">
      ${p.tech.map((t) => `<span class="tech-chip mono">${esc(t)}</span>`).join("")}
    </div>
  </div>
</section>
${caseSections(p)}
<nav class="pager wrap" aria-label="More case studies">
  <a class="pager-link pager-prev" href="/work/${prev.slug}.html">
    <span class="mono pager-dir">← PREVIOUS</span><span class="pager-name">${esc(prev.name)}</span>
  </a>
  <a class="pager-link pager-next" href="/work/${next.slug}.html">
    <span class="mono pager-dir">NEXT →</span><span class="pager-name">${esc(next.name)}</span>
  </a>
</nav>`;

  return page({
    title: `${p.name} — Case Study — Bereket Tilahun`,
    desc: `${p.tagline}. ${p.statement}`,
    path: `/work/${p.slug}.html`,
    bodyClass: "page-case",
    main,
    jsonLd,
  });
};

// ---------------------------------------------------------------------------
// Résumé page — web-readable + download action
// ---------------------------------------------------------------------------

const resumePage = () => {
  const main = `
<section class="section resume-hero">
  <div class="wrap">
    <p class="eyebrow mono rv">CURRICULUM VITÆ — WEB EDITION</p>
    <h1 class="cs-title rv" style="--d:.08s">Bereket Tilahun</h1>
    <p class="cs-tagline rv" style="--d:.14s">${esc(site.title)} — ${esc(site.location)}</p>
    <div class="rv" style="--d:.2s">
      <a class="btn btn-ink" href="/assets/Bereket_Tilahun_Resume.pdf" download>Download PDF ${icon("download")}</a>
      <a class="btn btn-quiet" href="mailto:${esc(site.email)}">${icon("mail")} ${esc(site.email)}</a>
    </div>
  </div>
</section>

<section class="section"><div class="wrap resume-body">
  ${experience.roles
    .map(
      (r, i) => `<section class="rv resume-role" aria-labelledby="rr${i}">
    <div class="resume-role-head">
      <h2 class="resume-title" id="rr${i}">${esc(r.title)}</h2>
      <p class="resume-range mono">${esc(r.range)}</p>
    </div>
    <p class="resume-org mono">${esc(r.org)} · ${esc(r.loc)}</p>
    ${bullets(r.points, "bullets resume-points")}
  </section>`
    )
    .join("")}

  <section class="rv resume-role">
    <h2 class="resume-title">Skills</h2>
    <div class="stack-grid resume-stack">
      ${stack.map((s) => `<div class="stack-group"><h3 class="stack-h mono">${esc(s.group)}</h3>
        <ul class="stack-items">${s.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul></div>`).join("")}
    </div>
  </section>

  <section class="rv resume-role">
    <h2 class="resume-title">Education</h2>
    <p class="resume-org mono">${esc(about.education)}</p>
  </section>
</div></section>`;

  return page({
    title: "Résumé — Bereket Tilahun",
    desc: `Web résumé of ${site.name} — ${site.title}. Download the PDF.`,
    path: "/resume.html",
    bodyClass: "page-resume",
    main,
  });
};

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

const notFoundPage = () =>
  page({
    title: "Not found — Bereket Tilahun",
    desc: "This route does not exist.",
    path: "/404.html",
    bodyClass: "page-404",
    main: `
<section class="section nf">
  <div class="wrap">
    <p class="eyebrow mono rv">404 — NO ROUTE</p>
    <h1 class="cs-title rv" style="--d:.08s">This page refuses to load.</h1>
    <p class="rv" style="--d:.16s">Fail-closed, in the spirit of the rest of the site. <a class="text-link" href="/">Back to the homepage</a>.</p>
  </div>
</section>`,
  });

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

writeFileSync(join(OUT, "index.html"), indexPage());
writeFileSync(join(OUT, "resume.html"), resumePage());
writeFileSync(join(OUT, "404.html"), notFoundPage());
for (const [i, p] of projects.entries()) {
  writeFileSync(join(OUT, "work", `${p.slug}.html`), casePage(p, i));
}

// robots + sitemap
writeFileSync(
  join(OUT, "robots.txt"),
  `User-agent: *\nAllow: /\n${site.siteUrl ? `Sitemap: ${site.siteUrl}/sitemap.xml\n` : ""}`
);
const urls = ["/", "/resume.html", ...projects.map((p) => `/work/${p.slug}.html`)];
writeFileSync(
  join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url><loc>${esc((site.siteUrl || "") + u)}</loc><lastmod>${site.reviewed}</lastmod></url>`
    )
    .join("\n")}\n</urlset>\n`
);

console.log("built:", [...urls, "/404.html"].join(", "));
