// Page shell: head (SEO/OG/JSON-LD), scripts, header, footer. Consumed by build.mjs.
import { esc, icon, portrait } from "./components.mjs";

export const scripts = (bundlePath) => `<script src="${bundlePath}" defer></script>`;

// Above-the-fold faces on every page: body, display serif, mono numerals.
const PRELOAD_FONTS = [
  "/assets/fonts/geist-normal-300-700.woff2",
  "/assets/fonts/newsreader-normal-500.woff2",
  "/assets/fonts/plex-mono-normal-500.woff2",
];

export const head = ({ title, desc, path = "/", siteUrl = "", jsonLd = null, ogType = "website", css = "", preloadPortrait = false }) => {
  const canon = siteUrl ? `\n<link rel="canonical" href="${esc(siteUrl + path)}">` : "";
  const ogUrl = siteUrl ? `\n<meta property="og:url" content="${esc(siteUrl + path)}">` : "";
  const ogImg = siteUrl ? `\n<meta property="og:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">\n<meta name="twitter:image" content="${esc(siteUrl + "/assets/img/og-card.png")}">` : "";
  const img = preloadPortrait
    ? `\n<link rel="preload" as="image" href="/assets/img/bereket-1200.webp" type="image/webp" imagesrcset="/assets/img/bereket-600.webp 600w, /assets/img/bereket-1200.webp 1200w" imagesizes="(max-width: 56em) 60vw, 40vw">`
    : "";
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
<meta name="theme-color" content="#f4f1ea">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${PRELOAD_FONTS.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join("\n")}${img}
<style>${css}</style>${canon}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>`;
};

export const header = (path, nav, site) => `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="/" aria-label="Bereket Tilahun — home">${esc(site.name)}</a>
    <nav class="site-nav" aria-label="Primary">
      ${nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("\n      ")}
      <a href="/resume.html">Résumé</a>
    </nav>
    <a class="btn btn-signal btn-sm head-cta" href="mailto:${esc(site.email)}">Email</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">${icon("menu")}</button>
  </div>
  <div class="mobile-nav" id="mobile-nav" hidden>
    <nav aria-label="Primary, mobile">
      ${nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join("\n      ")}
      <a href="/resume.html">Résumé</a>
      <a href="${esc(site.github)}" rel="noopener" target="_blank">GitHub</a>
      <a href="${esc(site.linkedin)}" rel="noopener" target="_blank">LinkedIn</a>
    </nav>
  </div>
</header>`;

export const footer = (site) => `
<footer class="site-foot">
  <div class="wrap foot-row">
    <div class="foot-sign">
      ${portrait(192, "foot-portrait")}
      <div>
        <p class="foot-name serif">${esc(site.name)}</p>
        <p class="foot-meta">${esc(site.title)} · ${esc(site.location)}</p>
      </div>
    </div>
    <nav class="foot-links" aria-label="Footer">
      <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      <a href="${esc(site.github)}" rel="noopener" target="_blank">GitHub</a>
      <a href="${esc(site.linkedin)}" rel="noopener" target="_blank">LinkedIn</a>
      <a href="/resume.html">Résumé</a>
    </nav>
  </div>
  <div class="wrap foot-base mono">
    <span>© <span id="year">2026</span> ${esc(site.name)}</span>
    <span>Reviewed ${esc(site.reviewed)} · No trackers · Every figure carries its source</span>
  </div>
</footer>`;
