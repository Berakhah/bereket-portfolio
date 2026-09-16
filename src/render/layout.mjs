// Page shell: head (SEO/OG/JSON-LD), vendor scripts, header, footer.
// Consumed by build.mjs.
import { esc, icon } from "./components.mjs";

// One deferred, content-hashed bundle (vendor + site JS) — see build.mjs.
export const scripts = (bundlePath) => `<script src="${bundlePath}" defer></script>`;

// Faces needed above the fold on every page: body/headline, hero italic, eyebrows.
const PRELOAD_FONTS = [
  "/assets/fonts/geist-normal-300-700.woff2",
  "/assets/fonts/newsreader-italic-400.woff2",
  "/assets/fonts/plex-mono-normal-500.woff2",
];

export const head = ({ title, desc, path = "/", siteUrl = "", jsonLd = null, ogType = "website", css = "" }) => {
  const canon = siteUrl ? `\n<link rel="canonical" href="${esc(siteUrl + path)}">` : "";
  const ogUrl = siteUrl ? `\n<meta property="og:url" content="${esc(siteUrl + path)}">` : "";
  const ogImg = siteUrl ? `\n<meta property="og:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">\n<meta name="twitter:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="Bereket Tilahun">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:site_name" content="Bereket Tilahun — Backend Security Engineer">${ogUrl}${ogImg}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="theme-color" content="#0a0b0d">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${PRELOAD_FONTS.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}
<style>${css}</style>${canon}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>`;
};

export const header = (path = "/") => {
  const here = (href) => {
    if (path === "/") return href.startsWith("/#") ? `href="${href}"` : `href="/${href}"`;
    return `href="/${href.replace(/^\//, "")}"`;
  };
  return `
<a class="skip-link" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"><span class="progress-bar"></span></div>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="/" aria-label="Bereket Tilahun — home">
      <span class="brand-mark mono" aria-hidden="true">BT</span>
      <span class="brand-name">Bereket Tilahun</span>
      <span class="brand-role mono">Backend Security Engineer</span>
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="/#work">Work</a>
      <a href="/#engineering">Engineering</a>
      <a href="/#about">About</a>
      <a href="/#contact">Contact</a>
    </nav>
    <div class="head-utils">
      <a class="util-icon" href="https://github.com/Berakhah" rel="noopener" target="_blank" aria-label="GitHub profile">${icon("github")}</a>
      <a class="util-icon" href="https://www.linkedin.com/in/bereket-tilahun-488003232/" rel="noopener" target="_blank" aria-label="LinkedIn profile">${icon("linkedin")}</a>
      <a class="btn btn-quiet btn-sm" href="/resume.html">${icon("file")}<span>Résumé</span></a>
    </div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">${icon("menu")}</button>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <nav aria-label="Primary, mobile">
      <a href="/#work">Work</a>
      <a href="/#engineering">Engineering</a>
      <a href="/#about">About</a>
      <a href="/#contact">Contact</a>
      <a href="/resume.html">Résumé</a>
      <a href="https://github.com/Berakhah" rel="noopener" target="_blank">GitHub</a>
      <a href="https://www.linkedin.com/in/bereket-tilahun-488003232/" rel="noopener" target="_blank">LinkedIn</a>
    </nav>
  </div>
</header>`;
};

export const footer = (site) => `
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-col foot-brand">
      <span class="brand-mark mono" aria-hidden="true">BT</span>
      <p>Bereket Tilahun — Backend Security Engineer &amp; Software Engineer, Addis Ababa.</p>
      <p class="foot-availability">${esc(site.availability)}</p>
    </div>
    <div class="foot-col">
      <h2 class="foot-h mono">SITE</h2>
      <a href="/#work">Work</a>
      <a href="/#engineering">Engineering</a>
      <a href="/#about">About</a>
      <a href="/resume.html">Résumé</a>
    </div>
    <div class="foot-col">
      <h2 class="foot-h mono">ELSEWHERE</h2>
      <a href="https://github.com/Berakhah" rel="noopener" target="_blank">GitHub — @Berakhah</a>
      <a href="https://www.linkedin.com/in/bereket-tilahun-488003232/" rel="noopener" target="_blank">LinkedIn</a>
      <a href="mailto:berekettilahun77@gmail.com">berekettilahun77@gmail.com</a>
    </div>
    <div class="foot-col foot-colophon">
      <h2 class="foot-h mono">COLOPHON</h2>
      <p>Set in Newsreader, Geist and IBM Plex Mono. Static site — no trackers, no analytics. Every figure carries provenance; statuses are stated, not implied.</p>
    </div>
  </div>
  <div class="wrap foot-base mono">
    <span>© <span id="year">2026</span> Bereket Tilahun</span>
    <span>Document reviewed ${esc(site.reviewed)} · Apache-2.0 projects unless noted</span>
  </div>
</footer>`;
