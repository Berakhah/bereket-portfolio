// Zero-dependency static site builder.  node build.mjs
// Renders index, résumé, 404 and /work/<slug> case studies from src/content.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  site, nav, hero, audit, principles, timeline, stack, about,
  projects, sampleProject, toolProjects, evidenceIndex,
} from "./src/content/index.mjs";
import { directContact } from "./src/content/person.mjs";
import { posts } from "./src/content/writing.mjs";
import {
  esc, md, prose, bullets, icon, flowStepper, metricsRow, portrait,
  evidenceScript, evidenceDrawer, repoChip, prov,
} from "./src/render/components.mjs";
import { head, scripts, header, footer } from "./src/render/layout.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
// SITE_OUT renders somewhere other than site/, e.g. a draft preview that must never be committed.
const OUT = process.env.SITE_OUT || join(ROOT, "site");

// Drafts render only with DRAFTS=1, and never get a sitemap entry.
const visiblePosts = posts.filter((p) => !p.draft || process.env.DRAFTS === "1");
const publishedPosts = posts.filter((p) => !p.draft);
const NAV = visiblePosts.length ? [...nav, { label: "Writing", href: "/writing/" }] : nav;
const src = (...p) => readFileSync(join(ROOT, "src", ...p), "utf8");

// ---------------------------------------------------------------------------
// Assets.  CSS is inlined into every page (one fewer render-blocking request).
// JS is one content-hashed bundle so it can be cached immutably: vendor
// (pinned GSAP, ScrollTrigger, Lenis) + graph + main, each self-guarding.
// ---------------------------------------------------------------------------

const CSS = ["fonts", "tokens", "base", "home", "pages", "motion"].map((f) => src("css", `${f}.css`)).join("\n");

// Print rules for the résumé only, appended to that page's stylesheet.
const RESUME_PRINT_CSS = src("css", "resume-print.css");

const BUNDLE_SRC = [
  src("vendor", "gsap.min.js"),
  src("vendor", "ScrollTrigger.min.js"),
  src("vendor", "lenis.min.js"),
  src("js", "main.js"),
].join("\n;\n");
const BUNDLE_HASH = createHash("sha256").update(BUNDLE_SRC).digest("hex").slice(0, 10);
const BUNDLE_PATH = `/assets/js/app.${BUNDLE_HASH}.js`;

const page = ({ title, desc, path, bodyClass = "", main, jsonLd = null, preloadPortrait = false, css = CSS, siteName, noindex = false }) => `${head({
  title, desc, path, siteUrl: site.siteUrl, jsonLd, css, preloadPortrait, siteName, noindex,
})}
<body class="${bodyClass}">
<div class="curtain" aria-hidden="true"></div>
${header(path, NAV, site)}
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

const panel = (p, n) => {
  // card.lead picks the homepage metrics when they aren't the first two.
  const lead = p.card.lead
    ? p.card.lead.map((id) => p.card.metrics.find((m) => m.id === id))
    : p.card.metrics.slice(0, 2);
  const chips = p.tech.slice(0, 6);
  const more = p.tech.length - chips.length;
  return `
<article class="panel" id="panel-${p.slug}" aria-labelledby="pn-${p.slug}">
  <div class="wrap panel-grid">
    <div class="panel-copy">
      <span class="panel-num mono">${n}</span>
      <h3 class="panel-name" id="pn-${p.slug}"><a href="/work/${p.slug}.html">${esc(p.name)}</a></h3>
      <p class="panel-plain">${esc(p.card.plain ?? p.plain)}</p>
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
    jobTitle: site.jobTitle,
    ...(directContact() ? { email: `mailto:${site.email}` } : {}),
    image: `${site.siteUrl}/assets/img/bereket-1200.jpg`,
    address: { "@type": "PostalAddress", addressLocality: "Addis Ababa", addressCountry: "ET" },
    sameAs: directContact() ? [site.github, site.linkedin] : [site.github, site.upwork],
    knowsAbout: ["Backend Security", "Zero Trust", "OIDC", "Threat Modeling", "LLM Evaluation", "FastAPI", "Django REST"],
  };

  const main = `
<section class="hero" aria-labelledby="hero-h">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow rv">${esc(hero.eyebrow)}</p>
      <h1 class="hero-h rv" id="hero-h">Can one customer see <em class="hero-em">another’s</em> data?</h1>
      <p class="hero-lede rv" style="--d:80ms">${esc(hero.lede)}</p>
      <div class="hero-ctas rv" style="--d:140ms">
        ${directContact()
          ? `<a class="btn btn-signal" href="mailto:${esc(site.email)}">Email me ${icon("arrowUpRight", "icon-xs")}</a>`
          : `<a class="btn btn-signal" href="${esc(site.upwork)}" rel="noopener" target="_blank">Hire me on Upwork ${icon("arrowUpRight", "icon-xs")}</a>`}
        <a class="btn btn-ink" href="/work/${sampleProject.slug}.html">See a sample audit ${icon("arrow", "icon-xs")}</a>
      </div>
    </div>
    ${portrait(1200, "hero-portrait", true)}
  </div>
</section>

<section class="section" id="audit" aria-labelledby="audit-h">
  <div class="wrap">
    ${sectionHead("audit-h", audit.title, audit.intro)}
    <ol class="principles">
      ${audit.steps.map((s, i) => `<li class="principle rv" style="--d:${i * 60}ms">
        <span class="principle-num mono" aria-hidden="true">Step ${i + 1}</span>
        <div>
          <h3 class="principle-title">${esc(s.title)}</h3>
          <p class="principle-body">${md(s.body)}</p>
        </div>
      </li>`).join("")}
    </ol>
    <p class="section-intro rv" style="margin-top:2rem">${esc(audit.pricing)} <a class="panel-cta" href="${esc(site.upwork)}" rel="noopener" target="_blank">Start on Upwork ${icon("arrow", "icon-xs")}</a></p>
  </div>
</section>

<section class="section section-work" id="work" aria-labelledby="work-h">
  <div class="wrap work-head">
    ${sectionHead("work-h", "One sample audit, five systems.", "First, the report a client gets. Then five personal projects from 2026, each open source. Project figures link to their source, and every case study says what isn’t finished.")}
  </div>
  <div class="panels">
    ${panel(sampleProject, "Sample")}
<div class="wrap work-head">${sectionHead("tools-h", "Tools I’ve built.", "Personal projects, not client work. Each says plainly where it stands.")}
</div>${toolProjects.map((p, i) => panel(p, String(i + 1).padStart(2, "0"))).join("")}
  </div>
</section>

<section class="section" id="principles" aria-labelledby="principles-h">
  <div class="wrap">
    ${sectionHead("principles-h", "How I work.", "Four rules, each with the system that forced it.")}
    <ol class="principles">
      ${principles.map((pr, i) => `<li class="principle rv" style="--d:${i * 60}ms">
        <span class="principle-num mono" aria-hidden="true">No. ${i + 1}</span>
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
      <h2 class="subblock-h rv">Path.</h2>
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
      <div class="stack-runs">${stack.map((s) => `<div class="stack-run rv">
            <p class="stack-h">${esc(s.group)}</p>
            <p class="stack-items">${s.items.map(esc).join(" · ")}</p>
          </div>`).join("")}</div>
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
      ${directContact() ? `<a href="mailto:${esc(site.email)}"><span>${esc(site.email)}</span><span class="mono">EMAIL</span></a>` : `<a href="${esc(site.upwork)}" rel="noopener" target="_blank"><span>Bereket T. on Upwork</span><span class="mono">UPWORK</span></a>`}
      <a href="${esc(site.github)}" rel="noopener" target="_blank"><span>github.com/Berakhah</span><span class="mono">GITHUB</span></a>
      ${directContact()
        ? `<a href="${esc(site.linkedin)}" rel="noopener" target="_blank"><span>LinkedIn profile</span><span class="mono">LINKEDIN</span></a>`
        : [
          site.linkedin && `<a href="${esc(site.linkedin)}" rel="noopener" target="_blank"><span>${esc(bareUrl(site.linkedin))}</span><span class="mono">LINKEDIN</span></a>`,
          site.email && `<a href="mailto:${esc(site.email)}"><span>${esc(site.email)}</span><span class="mono">EMAIL</span></a>`,
        ].filter(Boolean).map((a) => `${a}
      `).join("")}
      ${directContact() ? `<a href="/assets/Bereket_Tilahun_Resume.pdf" download><span>Résumé, one page</span><span class="mono">PDF</span></a>` : `<a href="/resume.html"><span>Résumé, web page</span><span class="mono">RÉSUMÉ</span></a>`}
      ${directContact() ? `<a href="tel:${esc(site.phone.replace(/\s/g, ""))}"><span>${esc(site.phone)}</span><span class="mono">PHONE</span></a>` : ""}
    </div>
    <p class="contact-avail rv">${esc(site.availability)}</p>
  </div>
</section>`;

  return page({
    title: hero.metaTitle,
    desc: hero.metaDesc,
    siteName: hero.metaTitle,
    path: "/",
    bodyClass: "page-home",
    main,
    jsonLd,
    preloadPortrait: true,
  });
};

// Demo video figure: poster first, metadata-only preload, native controls
const demoFigure = (d, cls = "") => `<figure class="demo-video${cls ? ` ${cls}` : ""}" id="demo">
  <video controls playsinline preload="metadata" poster="${esc(d.poster)}" width="1920" height="1080">
    <source src="${esc(d.src)}" type="video/mp4">
    <a href="${esc(d.src)}">Download the walkthrough (MP4)</a>
  </video>
  <figcaption>${esc(d.caption)}</figcaption>
</figure>`;

// ---------------------------------------------------------------------------
// Case study pages — fixed structure (§9)
// ---------------------------------------------------------------------------

const caseSections = (p) => {
  const cs = p.caseStudy;
  const toc = [
    ["problem", "Problem"],
    ["why", "Why the obvious approach fails"],
    ["architecture", "Architecture"],
    ["threat", "Threat model"],
    ["decisions", "Decisions"],
    ["implementation", "Implementation"],
    ["evidence", "Evidence"],
    ["controls", "Security controls"],
    ["tradeoffs", "Trade-offs"],
    ["caveats", "Caveats & status"],
    ["repo", "Repository"],
  ];
  const sec = (id, title, body) => `
    <section class="cs-sec rv" id="${id}" aria-labelledby="${id}-h">
      <h2 class="cs-h" id="${id}-h">${title}</h2>
      ${body}
    </section>`;
  return `
<div class="cs-layout wrap">
  <aside class="cs-toc" aria-label="Case study sections">
    <p class="toc-h">Contents</p>
    ${toc.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join("\n    ")}
    <a class="btn btn-ink btn-sm toc-back" href="/#work">${icon("arrow")} All work</a>
  </aside>
  <div class="cs-body">
    ${sec("problem", "The problem", prose(cs.problem))}
    ${sec("why", "Why the obvious approach fails", bullets(cs.whyFails))}
    ${sec("architecture", "Architecture", `
      ${prose(cs.architecture.intro)}
      ${flowStepper(p.flow, `${p.name} — how it works`)}
      ${cs.architecture.claimCode ? `<div class="code-block"><span class="code-label">the Claim type</span><pre><code>${esc(cs.architecture.claimCode)}</code></pre></div>` : ""}
      <div class="code-block"><span class="code-label">repository layout</span><pre><code>${esc(cs.architecture.tree)}</code></pre></div>`)}
    ${sec("threat", "Threat model", bullets(cs.threatModel))}
    ${sec("decisions", "Decisions", `<dl class="decisions">${cs.decisions.map((d) => `<div class="decision"><dt>${esc(d.title)}</dt><dd>${md(d.body)}</dd></div>`).join("")}</dl>`)}
    ${sec("implementation", "Implementation", bullets(cs.implementation))}
    ${sec("evidence", "Evidence", `${metricsRow(p.card.metrics)}${bullets(cs.evidence)}`)}
    ${sec("controls", "Security controls", bullets(cs.securityControls))}
    ${sec("tradeoffs", "Trade-offs", bullets(cs.tradeoffs))}
    ${sec("caveats", "Caveats &amp; status", `
      <p class="cs-caveat">${md(p.card.caveat)}</p>
      ${bullets(cs.limitations)}
      <div class="status-block"><p><strong>${esc(p.status.label)}</strong> — ${md(p.status.detail)}</p>${prose(cs.currentStatus)}</div>`)}
    ${sec("repo", "Repository", `
      <div class="repo-block">${repoChip(p)}<span class="chip chip-muted">${esc(p.licence)}</span></div>
      <p class="repo-note">${md(cs.repoNote)}</p>`)}
  </div>
</div>`;
};

const casePage = (p, i) => {
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const n = i === 0 ? "Sample" : String(i).padStart(2, "0");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${p.name} — ${p.tagline}`,
    author: { "@type": "Person", name: site.name },
    about: p.category.join(", "),
  };
  const main = `
<section class="cs-hero">
  <div class="wrap">
    <span class="cs-num mono rv">${n}</span>
    <h1 class="cs-title rv" style="--d:60ms">${esc(p.name)}</h1>
    <p class="cs-tagline rv" style="--d:120ms">${esc(p.tagline)}</p>
    <p class="cs-plain rv" style="--d:180ms">${esc(p.plain)}</p>
    <p class="cs-status rv" style="--d:240ms"><span class="dot" aria-hidden="true"></span><span><strong>${esc(p.status.label)}</strong> — ${md(p.status.detail)}</span></p>
    <div class="cs-meta rv" style="--d:300ms">
      <span><strong>Role</strong> ${md(p.role)}</span>
      <span><strong>Licence</strong> ${esc(p.licence)}</span>
      ${p.links && p.links.github ? `<a class="text-link" href="${esc(p.links.github)}" rel="noopener" target="_blank">GitHub ${icon("external", "icon-xs")}</a>` : ""}
    </div>
    <div class="cs-tech rv" style="--d:360ms">${p.tech.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
    ${p.demo ? demoFigure(p.demo, "cs-demo rv") : ""}
  </div>
</section>
${caseSections(p)}
<nav class="pager wrap" aria-label="More case studies">
  <a class="pager-link pager-prev" href="/work/${prev.slug}.html"><span class="pager-dir mono">← PREVIOUS</span><span class="pager-name">${esc(prev.name)}</span></a>
  <a class="pager-link pager-next" href="/work/${next.slug}.html"><span class="pager-dir mono">NEXT →</span><span class="pager-name">${esc(next.name)}</span></a>
</nav>`;
  return page({
    title: `${p.name} — Case study — ${site.name}`,
    desc: p.plain,
    path: `/work/${p.slug}.html`,
    bodyClass: "page-case",
    main,
    jsonLd,
  });
};

// ---------------------------------------------------------------------------
// Résumé page — web-readable + download action
// ---------------------------------------------------------------------------

const UPWORK_RESUME_PDF = "bereket-tilahun-resume.pdf";

// The résumé body is generated from docs/resume/resume.tex (the PDF's source)
// by docs/resume/make_resume_html.py, so the page and the PDF say the same thing.
const RESUME_BODY = src("content", "resume-body.html");
const bareUrl = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const resumePage = () => {
  const printContact = site.email || site.linkedin
    ? [site.email, site.linkedin && bareUrl(site.linkedin), "github.com/Berakhah", "berakhah.github.io"].filter(Boolean).join(" · ")
    : "berakhah.github.io · github.com/Berakhah · upwork.com/freelancers/~01645da719eb4829ed";
  const main = `
<section class="resume-hero">
  <div class="wrap">
    <p class="eyebrow rv">Résumé</p>
    <h1 class="cs-title rv" style="--d:60ms">${esc(site.name)}</h1>
    <p class="cs-tagline rv" style="--d:120ms">${esc(site.title)} · ${esc(site.location)}</p>
    <div class="resume-ctas rv" style="--d:180ms">
      ${directContact()
        ? `<a class="btn btn-signal" href="/assets/Bereket_Tilahun_Resume.pdf" download>Download PDF ${icon("download", "icon-xs")}</a>
      <a class="btn btn-ink" href="mailto:${esc(site.email)}">${esc(site.email)}</a>`
        : `<a class="btn btn-signal" href="${esc(site.upwork)}" rel="noopener" target="_blank">Hire me on Upwork ${icon("arrowUpRight", "icon-xs")}</a>
      <a class="btn btn-ink" href="/assets/${UPWORK_RESUME_PDF}" download>Download PDF ${icon("download", "icon-xs")}</a>`}
    </div>
    <p class="cs-plain rv" style="--d:220ms">${esc(site.availabilityRoles)}</p>
    <p class="print-only mono" style="display:none;font-size:.8rem">${esc(printContact)}</p>
  </div>
</section>
<div class="wrap resume-body">
<!-- generated from resume.tex by make_resume_html.py; do not edit by hand -->
${RESUME_BODY}</div>`;
  return page({
    title: `Résumé — ${site.name}`,
    desc: `Résumé of ${site.name}, Senior Software Engineer at DZ Software Engineering, Addis Ababa: backend and application security. PDF available.`,
    path: "/resume.html",
    bodyClass: "page-resume",
    main,
    css: CSS + "\n" + RESUME_PRINT_CSS,
  });
};

// ---------------------------------------------------------------------------
// Scope and authorisation form
// ---------------------------------------------------------------------------

const scopePage = () =>
  page({
    title: `Scope form · ${site.name}`,
    desc: "The form a client and I sign before I test anything: what is in scope, where I test, and how I handle access and data.",
    path: "/scope.html",
    bodyClass: "page-404",
    main: `
${src("content", "scope-main.html").trimEnd()}`,
  });

// ---------------------------------------------------------------------------
// Writing: one page per post, plus an index. Bodies are HTML fragments.
// ---------------------------------------------------------------------------

const postDate = (p) => (p.date ? new Date(`${p.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "Draft, not published");
const draftBanner = (p) => (p.draft
  ? `<p class="post-draft" role="note"><strong>Draft.</strong> Not published. This preview exists so it can be reviewed before it goes out.</p>`
  : "");

const postPage = (p) => {
  const body = src("content", "writing", `${p.slug}.html`);
  const main = `
<article class="post">
  <header class="post-hero">
    <div class="wrap post-wrap">
      ${draftBanner(p)}
      <p class="eyebrow mono">${esc(postDate(p))}</p>
      <h1 class="post-title">${esc(p.title)}</h1>
      <p class="post-dek">${esc(p.dek)}</p>
    </div>
  </header>
  <div class="wrap post-wrap post-body">
${body.trimEnd()}
    <aside class="post-cta" aria-label="${esc(p.cta.label)}">
      <p>${esc(p.cta.text)}</p>
      <a class="btn btn-signal" href="${esc(p.cta.href)}" rel="noopener" target="_blank">${esc(p.cta.label)} ${icon("arrowUpRight", "icon-xs")}</a>
    </aside>
    <p class="post-back"><a class="text-link" href="/writing/">All writing</a> · <a class="text-link" href="${esc(p.repo)}" rel="noopener" target="_blank">Repository</a></p>
  </div>
</article>`;
  return page({
    title: `${p.title} · ${site.name}`,
    desc: p.dek,
    path: `/writing/${p.slug}.html`,
    bodyClass: "page-post",
    main,
    noindex: p.draft,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: p.title,
      description: p.dek,
      author: { "@type": "Person", name: site.name },
      ...(p.date ? { datePublished: p.date } : {}),
    },
  });
};

const writingIndex = (list) =>
  page({
    title: `Writing · ${site.name}`,
    desc: "Write-ups of my own work. Each one gives the method, the result with its caveats, what it does not show, and how to reproduce it.",
    path: "/writing/",
    bodyClass: "page-post",
    noindex: list.every((p) => p.draft),
    main: `
<section class="post-hero"><div class="wrap post-wrap">
  <h1 class="post-title">Writing</h1>
  <p class="post-dek">Each post gives the method, the result with its caveats, what it does not show, and how to reproduce it.</p>
</div></section>
<div class="wrap post-wrap post-list">
  ${list.map((p) => `<article class="post-item">
    <p class="eyebrow mono">${esc(postDate(p))}</p>
    <h2><a href="/writing/${p.slug}.html">${esc(p.title)}</a></h2>
    <p>${esc(p.dek)}</p>
  </article>`).join("\n  ")}
</div>`,
  });

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

const notFoundPage = () =>
  page({
    title: `Not found — ${site.name}`,
    desc: "This page does not exist.",
    path: "/404.html",
    bodyClass: "page-404",
    main: `
<section class="section nf"><div class="wrap">
  <h1 class="nf-h rv">Nothing here.</h1>
  <p class="rv" style="--d:80ms">The page you asked for doesn’t exist. <a class="text-link" href="/">Back to the start</a>.</p>
</div></section>`,
  });

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

const JS_DIR = join(OUT, "assets", "js");
mkdirSync(JS_DIR, { recursive: true });
mkdirSync(join(OUT, "work"), { recursive: true });
for (const f of readdirSync(JS_DIR)) if (/^app\.[0-9a-f]+\.js$/.test(f)) unlinkSync(join(JS_DIR, f));

// This PDF résumé carries email, phone and LinkedIn, so it ships only when the
// site publishes direct contact details (see site.contactMode).
const RESUME_PDF = join(OUT, "assets", "Bereket_Tilahun_Resume.pdf");
if (directContact()) {
  if (!process.env.PORTFOLIO_RESUME_PDF) throw new Error("Direct contact mode needs PORTFOLIO_RESUME_PDF");
  copyFileSync(process.env.PORTFOLIO_RESUME_PDF, RESUME_PDF);
}
else rmSync(RESUME_PDF, { force: true });
// The Upwork-safe PDF carries no direct contact details, so it ships in Upwork mode.
const UPWORK_PDF_OUT = join(OUT, "assets", UPWORK_RESUME_PDF);
if (directContact()) rmSync(UPWORK_PDF_OUT, { force: true });
// PORTFOLIO_UPWORK_RESUME_PDF overrides it with a PDF kept outside the repo
// (the published one lists LinkedIn, which never goes into source).
else copyFileSync(process.env.PORTFOLIO_UPWORK_RESUME_PDF || join(ROOT, "src", "assets", UPWORK_RESUME_PDF), UPWORK_PDF_OUT);
writeFileSync(join(JS_DIR, `app.${BUNDLE_HASH}.js`), BUNDLE_SRC);

writeFileSync(join(OUT, "index.html"), indexPage());
writeFileSync(join(OUT, "resume.html"), resumePage());
writeFileSync(join(OUT, "404.html"), notFoundPage());
writeFileSync(join(OUT, "scope.html"), scopePage());
for (const [i, p] of projects.entries()) {
  writeFileSync(join(OUT, "work", `${p.slug}.html`), casePage(p, i));
}
rmSync(join(OUT, "writing"), { recursive: true, force: true });
if (visiblePosts.length) {
  mkdirSync(join(OUT, "writing"), { recursive: true });
  writeFileSync(join(OUT, "writing", "index.html"), writingIndex(visiblePosts));
  for (const p of visiblePosts) writeFileSync(join(OUT, "writing", `${p.slug}.html`), postPage(p));
}

// robots + sitemap
writeFileSync(
  join(OUT, "robots.txt"),
  `User-agent: *\nAllow: /\n${site.siteUrl ? `Sitemap: ${site.siteUrl}/sitemap.xml\n` : ""}`
);
const urls = [
  "/", "/resume.html", ...projects.map((p) => `/work/${p.slug}.html`), "/scope.html",
  ...(publishedPosts.length ? ["/writing/", ...publishedPosts.map((p) => `/writing/${p.slug}.html`)] : []),
];
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
