// Renders docs/og/og-card.html (1200×630) for screenshotting.  node src/og/render-og.mjs
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../content/index.mjs";
import { esc } from "../render/components.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const fontCss = readFileSync(join(ROOT, "src", "css", "fonts.css"), "utf8").replaceAll("/assets/fonts/", "../../site/assets/fonts/");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>og-card</title>
<style>${fontCss}
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: #f4f1ea; color: #16130f; font-family: Geist, system-ui, sans-serif; position: relative; overflow: hidden; }
  .in { position: absolute; inset: 72px 80px; display: grid; grid-template-columns: 1fr 340px; gap: 64px; align-items: center; }
  .eyebrow { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6b655c; margin: 0 0 24px; }
  h1 { font-family: Newsreader, serif; font-weight: 500; font-size: 84px; line-height: .95; letter-spacing: -.025em; margin: 0; }
  h1 em { font-style: italic; font-weight: 400; color: #ff4d1c; }
  .name { margin-top: 36px; font-size: 26px; }
  .name span { color: #6b655c; }
  .pic { width: 340px; height: 453px; object-fit: cover; object-position: 50% 15%; border-radius: 999px 999px 24px 24px; }
</style></head>
<body>
<div class="in">
  <div>
    <p class="eyebrow">${esc(site.title)} · ${esc(site.location.split(",")[0])}</p>
    <h1>Systems that stay <em>trustworthy</em> when everything else changes.</h1>
    <p class="name">${esc(site.name)} <span>· berakhah.github.io</span></p>
  </div>
  <img class="pic" src="../../site/assets/img/bereket-600.jpg" alt="">
</div>
</body></html>`;

mkdirSync(join(ROOT, "docs", "og"), { recursive: true });
writeFileSync(join(ROOT, "docs", "og", "og-card.html"), html);
console.log("wrote docs/og/og-card.html");
