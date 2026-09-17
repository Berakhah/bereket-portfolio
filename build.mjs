// Zero-dependency static site builder.  node build.mjs
// Renders index, résumé, 404 and /work/<slug> case studies from src/content.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  site, nav, heroMetrics, principles, timeline, stack, about, experience,
  projects, evidenceIndex,
} from "./src/content/index.mjs";
import {
  esc, md, prose, bullets, icon, flowStepper, metricsRow, bigMetric, portrait,
  evidenceScript, evidenceDrawer, repoChip, substrateDiagram, prov,
} from "./src/render/components.mjs";
import { head, scripts, header, footer } from "./src/render/layout.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "site");
const src = (...p) => readFileSync(join(ROOT, "src", ...p), "utf8");

// ---------------------------------------------------------------------------
// Assets.  CSS is inlined into every page (one fewer render-blocking request).
// JS is one content-hashed bundle so it can be cached immutably: vendor
// (pinned GSAP, ScrollTrigger, Lenis) + graph + main, each self-guarding.
// ---------------------------------------------------------------------------

const CSS = ["fonts", "tokens", "base", "home", "pages", "motion"].map((f) => src("css", `${f}.css`)).join("\n");

const BUNDLE_SRC = [
  src("vendor", "gsap.min.js"),
  src("vendor", "ScrollTrigger.min.js"),
  src("vendor", "lenis.min.js"),
  src("js", "main.js"),
].join("\n;\n");
const BUNDLE_HASH = createHash("sha256").update(BUNDLE_SRC).digest("hex").slice(0, 10);
const BUNDLE_PATH = `/assets/js/app.${BUNDLE_HASH}.js`;

const page = ({ title, desc, path, bodyClass = "", main, jsonLd = null, preloadPortrait = false }) => `${head({
  title, desc, path, siteUrl: site.siteUrl, jsonLd, css: CSS, preloadPortrait,
})}
<body class="${bodyClass}">
<div class="curtain" aria-hidden="true"></div>
${header(path, nav, site)}
<main id="main">
${main}
</main>
${footer(site)}
${evidenceDrawer()}
${evidenceScript(evidenceIndex)}
${scripts(BUNDLE_PATH)}
</body>
</html>`;

// ---------------------------------------------------------------------------
// Shared partials
// ---------------------------------------------------------------------------

const sectionHead = (id, title, intro = "") => `
<div class="section-head">
  <h2 class="section-title rv" id="${id}">${title}</h2>
  ${intro ? `<p class="section-intro rv" style="--d:80ms">${intro}</p>` : ""}
</div>`;

// ---------------------------------------------------------------------------
// Work panel — one project, one viewport, sticky-stacked.
// ---------------------------------------------------------------------------

const panel = (p, i) => {
  const n = String(i + 1).padStart(2, "0");
  const lead = p.card.metrics.slice(0, 2);
  const chips = p.tech.slice(0, 6);
  const more = p.tech.length - chips.length;
  return `
<article class="panel" id="panel-${p.slug}" aria-labelledby="pn-${p.slug}">
  <div class="wrap panel-grid">
    <div class="panel-copy">
      <span class="panel-num mono">${n}</span>
      <h3 class="panel-name" id="pn-${p.slug}"><a href="/work/${p.slug}.html">${esc(p.name)}</a></h3>
      <p class="panel-plain">${esc(p.plain)}</p>
      <p class="panel-tech">${md(p.card.differentiator)}</p>
      <div class="panel-metrics">
        ${lead.map((m) => `<div class="metric">
          <button class="metric-value prov-trigger" type="button" data-evidence="${esc(m.id)}" aria-haspopup="dialog" aria-label="${esc(`${m.value} ${m.label} — show evidence`)}">${esc(m.value)}</button>
          <span class="metric-label">${esc(m.label)}</span>
        </div>`).join("")}
      </div>
      <div class="panel-chips">
        ${chips.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}${more > 0 ? `<span class="chip chip-muted">+${more}</span>` : ""}
      </div>
      <a class="panel-cta" href="/work/${p.slug}.html">Read the case study ${icon("arrow", "icon-xs")}</a>
    </div>
    <div class="panel-flow">
      ${flowStepper(p.flow, `${p.name} — how it works`, "v")}
    </div>
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
    name: site.name,
    jobTitle: site.title,
    email: `mailto:${site.email}`,
    image: `${site.siteUrl}/assets/img/bereket-1200.jpg`,
    address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    sameAs: [site.github, site.linkedin],
    knowsAbout: ["Backend Security", "Zero Trust", "OIDC", "Threat Modeling", "LLM Evaluation", "FastAPI", "Django REST"],
  };

  const main = `
<section class="hero" aria-labelledby="hero-h">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow rv">${esc(site.title)} · ${esc(site.location.split(",")[0])} · remote-ready</p>
      <h1 class="hero-h rv" id="hero-h">Systems that stay <em class="hero-em">trustworthy</em> when everything else changes.</h1>
      <p class="hero-lede rv" style="--d:80ms">${esc(site.positioning)}</p>
      <div class="hero-ctas rv" style="--d:140ms">
        <a class="btn btn-signal" href="mailto:${esc(site.email)}">Email me ${icon("arrowUpRight", "icon-xs")}</a>
        <a class="btn btn-ink" href="/resume.html">Résumé ${icon("file", "icon-xs")}</a>
      </div>
    </div>
    ${portrait(1200, "hero-portrait", true)}
  </div>
  <div class="wrap">
    <div class="proof rv" style="--d:200ms" aria-label="Headline figures — activate any number for its evidence">
      ${heroMetrics.slice(0, 4).map(bigMetric).join("")}
    </div>
  </div>
</section>

<section class="section section-work" id="work" aria-labelledby="work-h">
  <div class="wrap work-head">
    ${sectionHead("work-h", "Five systems, built to be distrusted.", "Each one is designed to be checked, not believed. Every figure opens its source; every case study says what isn’t finished.")}
  </div>
  <div class="panels">
    ${projects.map(panel).join("")}
  </div>
</section>

<section class="section" id="principles" aria-labelledby="principles-h">
  <div class="wrap">
    ${sectionHead("principles-h", "How I work.", "Four rules, each with the system that forced it.")}
    <ol class="principles">
      ${principles.map((pr, i) => `<li class="principle rv" style="--d:${i * 60}ms">
        <span class="principle-num mono" aria-hidden="true">№ ${i + 1}</span>
        <div>
          <h3 class="principle-title">${esc(pr.title)}</h3>
          <p class="principle-body">${md(pr.body)}</p>
          <p class="principle-src">${esc(pr.source)}</p>
        </div>
      </li>`).join("")}
    </ol>
  </div>
</section>

<section class="section" id="path" aria-label="Path and stack">
  <div class="wrap path-grid">
    <div>
      <h2 class="subblock-h rv">Four years, five modes.</h2>
      <ol class="modes">
        ${timeline.map((t) => `<li class="mode rv">
          <span class="mode-range mono">${esc(t.range)}</span>
          <div>
            <p class="mode-kind">${esc(t.mode)}</p>
            <p class="mode-heading">${esc(t.heading)}</p>
            <p class="mode-text">${md(t.body)}</p>
          </div>
        </li>`).join("")}
      </ol>
    </div>
    <div>
      <h2 class="subblock-h rv">Stack.</h2>
      <div class="stack-runs">
        ${stack.map((s) => `<div class="stack-run rv">
          <p class="stack-h">${esc(s.group)}</p>
          <p class="stack-items">${s.items.map(esc).join(" · ")}</p>
        </div>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="section" id="about" aria-labelledby="about-h">
  <div class="wrap about-grid">
    ${portrait(192, "about-portrait")}
    <div>
      <h2 class="about-lede rv" id="about-h">${esc(about.lede)}</h2>
      ${prose(about.body, "about-p rv")}
      <p class="about-edu rv">${esc(about.education)}</p>
    </div>
  </div>
</section>

<section class="section contact" id="contact" aria-labelledby="contact-h">
  <div class="wrap">
    <h2 class="contact-h rv" id="contact-h">Let’s talk.</h2>
    <div class="contact-links rv">
      <a href="mailto:${esc(site.email)}"><span>${esc(site.email)}</span><span class="mono">EMAIL</span></a>
      <a href="${esc(site.github)}" rel="noopener" target="_blank"><span>github.com/Berakhah</span><span class="mono">GITHUB</span></a>
      <a href="${esc(site.linkedin)}" rel="noopener" target="_blank"><span>in/bereket-tilahun</span><span class="mono">LINKEDIN</span></a>
      <a href="/assets/Bereket_Tilahun_Resume.pdf" download><span>Résumé, one page</span><span class="mono">PDF</span></a>
      <a href="tel:${esc(site.phone.replace(/\s/g, ""))}"><span>${esc(site.phone)}</span><span class="mono">PHONE</span></a>
    </div>
    <p class="contact-avail rv">${esc(site.availability)}</p>
  </div>
</section>`;

  return page({
    title: "Bereket Tilahun — Backend Security Engineer",
    desc: site.positioning,
    path: "/",
    bodyClass: "page-home",
    main,
    jsonLd,
    preloadPortrait: true,
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
      ${toc.map(([id, label]) => `<li><a href="#${id}"><span class="toc-bar" aria-hidden="true"></span>${esc(label)}</a></li>`).join("")}
    </ol>
    <a class="btn btn-quiet btn-sm toc-back" href="/#work">${icon("arrow")} All work</a>
  </aside>

  <div class="cs-body">
    <section class="cs-sec rv rv-clip" id="problem" aria-labelledby="problem-h">
      <p class="eyebrow mono">§ 1 — PROBLEM</p>
      <h2 class="cs-h" id="problem-h">The problem</h2>
      ${prose(cs.problem)}
    </section>

    <section class="cs-sec rv rv-clip" id="why" aria-labelledby="why-h">
      <p class="eyebrow mono">§ 2 — PRIOR ART</p>
      <h2 class="cs-h" id="why-h">Why existing approaches fail</h2>
      ${bullets(cs.whyFails)}
    </section>

    <section class="cs-sec rv rv-clip" id="architecture" aria-labelledby="arch-h">
      <p class="eyebrow mono">§ 3 — ARCHITECTURE</p>
      <h2 class="cs-h" id="arch-h">System architecture</h2>
      ${prose(cs.architecture.intro)}
      ${cs.architecture.claimCode ? `<div class="code-block rv"><span class="code-label mono">the Claim type</span><pre><code>${esc(cs.architecture.claimCode)}</code></pre></div>` : ""}
      ${p.substrate ? substrateDiagram() : flowStepper(p.flow, `${p.name} architecture flow`)}
      <div class="code-block rv"><span class="code-label mono">repository layout</span><pre><code>${esc(cs.architecture.tree)}</code></pre></div>
    </section>

    <section class="cs-sec rv rv-clip" id="threat" aria-labelledby="threat-h">
      <p class="eyebrow mono">§ 4 — THREAT MODEL</p>
      <h2 class="cs-h" id="threat-h">Threat model</h2>
      ${bullets(cs.threatModel)}
    </section>

    <section class="cs-sec rv rv-clip" id="decisions" aria-labelledby="dec-h">
      <p class="eyebrow mono">§ 5 — DECISIONS</p>
      <h2 class="cs-h" id="dec-h">Key decisions</h2>
      <dl class="decisions">
        ${cs.decisions.map((d) => `<div class="decision rv"><dt>${esc(d.title)}</dt><dd>${md(d.body)}</dd></div>`).join("")}
      </dl>
    </section>

    <section class="cs-sec rv rv-clip" id="implementation" aria-labelledby="impl-h">
      <p class="eyebrow mono">§ 6 — IMPLEMENTATION</p>
      <h2 class="cs-h" id="impl-h">Implementation</h2>
      ${bullets(cs.implementation)}
    </section>

    <section class="cs-sec rv rv-clip" id="evidence" aria-labelledby="ev-h">
      <p class="eyebrow mono">§ 7 — EVIDENCE</p>
      <h2 class="cs-h" id="ev-h">Evidence</h2>
      ${metricsRow(p.card.metrics)}
      ${bullets(cs.evidence)}
    </section>

    <section class="cs-sec rv rv-clip" id="controls" aria-labelledby="ctl-h">
      <p class="eyebrow mono">§ 8 — CONTROLS</p>
      <h2 class="cs-h" id="ctl-h">Security controls</h2>
      ${bullets(cs.securityControls)}
    </section>

    <section class="cs-sec rv rv-clip" id="tradeoffs" aria-labelledby="tr-h">
      <p class="eyebrow mono">§ 9 — TRADE-OFFS</p>
      <h2 class="cs-h" id="tr-h">Trade-offs</h2>
      ${bullets(cs.tradeoffs)}
    </section>

    <section class="cs-sec rv rv-clip" id="limits" aria-labelledby="lim-h">
      <p class="eyebrow mono">§ 10 — LIMITATIONS</p>
      <h2 class="cs-h" id="lim-h">Limitations</h2>
      ${bullets(cs.limitations)}
    </section>

    <section class="cs-sec rv rv-clip" id="status" aria-labelledby="st-h">
      <p class="eyebrow mono">§ 11 — STATUS</p>
      <h2 class="cs-h" id="st-h">Current status</h2>
      <div class="status-block">
        <span class="status-line">${esc(p.status.label)}</span>
        <p class="pc-status-detail">${md(p.status.detail)}</p>
      </div>
      ${prose(cs.currentStatus)}
    </section>

    <section class="cs-sec rv rv-clip" id="repo" aria-labelledby="repo-h">
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
  <div class="hero-texture" aria-hidden="true"></div>
  <div class="wrap">
    <p class="eyebrow mono rv">CASE STUDY · ${esc(p.category.join(" · "))}</p>
    <h1 class="cs-title rv" style="--d:.1s">${esc(p.name)}</h1>
    <p class="cs-tagline rv" style="--d:.18s">${esc(p.tagline)}</p>
    <p class="cs-statement rv" style="--d:.26s">“${esc(p.statement)}”</p>
    <div class="cs-meta rv" style="--d:.34s">
      <span class="status-line">${esc(p.status.label)}</span>
      <span class="mono meta-sep" aria-hidden="true">/</span>
      <span class="mono">${esc(p.role)}</span>
    </div>
    <p class="pc-status-detail cs-status-detail rv" style="--d:.4s">${md(p.status.detail)}</p>
    <div class="pc-lower rv" style="--d:.43s">
      <div class="pc-diff">
        <h2 class="pc-lower-h mono">WHY IT’S DIFFERENT</h2>
        <p>${md(p.card.differentiator)}</p>
      </div>
      <div class="pc-caveat">
        <h2 class="pc-lower-h mono">${icon("alert", "icon-xs")} HONEST CAVEAT</h2>
        <p>${md(p.card.caveat)}</p>
      </div>
    </div>
    <div class="cs-hero-flow rv" data-draw style="--d:.46s">
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

const JS_DIR = join(OUT, "assets", "js");
mkdirSync(JS_DIR, { recursive: true });
mkdirSync(join(OUT, "work"), { recursive: true });
for (const f of readdirSync(JS_DIR)) if (/^app\.[0-9a-f]+\.js$/.test(f)) unlinkSync(join(JS_DIR, f));
writeFileSync(join(JS_DIR, `app.${BUNDLE_HASH}.js`), BUNDLE_SRC);

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

console.log("built:", [...urls, "/404.html"].join(", "), "·", BUNDLE_PATH);
