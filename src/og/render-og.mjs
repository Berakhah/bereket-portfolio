// Renders docs/og/og-card.html (1200×630) from content for screenshotting.
//   node src/og/render-og.mjs
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site, projects, heroMetrics } from "../content/index.mjs";
import { bootLines } from "../render/ops.mjs";
import { esc } from "../render/components.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const lines = bootLines({ site, projects, heroMetrics });
// The card is opened from docs/og/ as a file, so font URLs must be relative to it.
const fontCss = readFileSync(join(ROOT, "src", "css", "fonts.css"), "utf8").replaceAll("/assets/fonts/", "../../site/assets/fonts/");
// First, "loading systems" and "verified figures" lines; the value after the
// dot leader is highlighted.
const boot = [lines[0], lines[1], lines[3]]
  .map((l) => esc(l).replace(/(\.\.+ )(.*)$/, "$1<b>$2</b>"))
  .join("\n");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>og-card</title>
<style>${fontCss}
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: #0a0b0d; color: #e8eaed; font-family: Geist, system-ui, sans-serif; position: relative; overflow: hidden; }
  .grid { position: absolute; inset: 0; background: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1.2px) 0 0 / 24px 24px; -webkit-mask-image: radial-gradient(ellipse at 70% 50%, #000 20%, transparent 75%); mask-image: radial-gradient(ellipse at 70% 50%, #000 20%, transparent 75%); }
  .scan { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px); }
  .in { position: absolute; inset: 64px 80px; display: flex; flex-direction: column; justify-content: space-between; }
  .boot { font-family: "IBM Plex Mono", monospace; font-size: 20px; color: #a6abb4; line-height: 1.6; margin: 0; }
  .boot b { color: #5cf28a; font-weight: 500; }
  h1 { font-size: 62px; line-height: 1.06; margin: 0; font-weight: 500; letter-spacing: -.02em; max-width: 960px; }
  h1 em { font-family: Newsreader, serif; font-style: italic; color: #5cf28a; font-weight: 400; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; font-family: "IBM Plex Mono", monospace; font-size: 20px; color: #a6abb4; }
  .name { font-size: 26px; color: #e8eaed; margin-bottom: 4px; }
  .mark { width: 56px; height: 56px; border: 2px solid #5cf28a; border-radius: 6px; display: grid; place-items: center; color: #5cf28a; font-weight: 600; font-size: 24px; }
</style></head>
<body>
<div class="grid"></div><div class="scan"></div>
<div class="in">
  <pre class="boot">${boot}</pre>
  <h1>Systems that know what they are <em>allowed to do</em>, know when they are <em>uncertain</em>, preserve evidence, and <em>fail safely.</em></h1>
  <div class="foot">
    <div><div class="name">${esc(site.name)}</div><div>${esc(site.title.split(" & ")[0])} · ${esc(site.location.split(",")[0])}</div></div>
    <div class="mark">BT</div>
  </div>
</div>
</body></html>`;

mkdirSync(join(ROOT, "docs", "og"), { recursive: true });
writeFileSync(join(ROOT, "docs", "og", "og-card.html"), html);
console.log("wrote docs/og/og-card.html");
