/* Capability graph — canvas behind the home hero.
   Nodes: the five systems + bok-core.  Edges: the substrate relationships
   from content (see src/render/ops.mjs).  Nodes drift around home positions,
   edges carry a travelling pulse, a fine pointer repels nodes.
   prefers-reduced-motion → one static frame.  Off-screen / hidden tab → paused. */
(() => {
  "use strict";
  const canvas = document.getElementById("graph");
  const dataEl = document.getElementById("graph-data");
  if (!canvas || !dataEl || !canvas.getContext) return;
  let data;
  try { data = JSON.parse(dataEl.textContent); } catch { return; }

  const ctx = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const CORE = "bok-core";
  const ACCENT = "#5cf28a", INK2 = "#a6abb4", CARD = "#181b21", HAIR = "rgba(255,255,255,.12)";

  let W = 0, H = 0, nodes = [], edges = [];
  let raf = 0, running = false, onScreen = true, last = 0;
  const pointer = { x: -1e4, y: -1e4 };

  // Ring of systems around bok-core, biased to the right on wide screens so
  // the headline (left column) stays clear.
  const layout = () => {
    const cx = W * (W > 900 ? .7 : .5), cy = H * .5, R = Math.min(W, H) * .3;
    const ring = data.nodes.filter((n) => n.id !== CORE);
    nodes = data.nodes.map((n) => {
      if (n.id === CORE) return { ...n, hx: cx, hy: cy, x: cx, y: cy, vx: 0, vy: 0, r: 7 };
      const i = ring.indexOf(n);
      const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
      const hx = cx + Math.cos(a) * R, hy = cy + Math.sin(a) * R;
      return { ...n, hx, hy, x: hx, y: hy, vx: 0, vy: 0, r: 4.5 };
    });
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    edges = data.edges
      .map((e, i) => ({ a: byId[e.from], b: byId[e.to], phase: i / Math.max(1, data.edges.length) }))
      .filter((e) => e.a && e.b);
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    for (const e of edges) {
      ctx.strokeStyle = HAIR;
      ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
      const p = (t * 0.00022 + e.phase) % 1;              // pulse travelling a → b
      const x = e.a.x + (e.b.x - e.a.x) * p, y = e.a.y + (e.b.y - e.a.y) * p;
      ctx.fillStyle = ACCENT; ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.font = "500 11px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.textBaseline = "middle";
    for (const n of nodes) {
      const core = n.id === CORE;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = core ? ACCENT : CARD; ctx.fill();
      ctx.strokeStyle = core ? ACCENT : INK2; ctx.stroke();
      ctx.fillStyle = core ? ACCENT : INK2;
      if (core) { ctx.textAlign = "center"; ctx.fillText(n.label, n.x, n.y + 18); continue; }
      const rightSide = n.hx >= W * (W > 900 ? .7 : .5);  // label away from the core
      ctx.textAlign = rightSide ? "left" : "right";
      ctx.fillText(n.label, n.x + (rightSide ? 12 : -12), n.y);
    }
  };

  const step = (dt, t) => {
    const k = Math.min(dt, 32) / 16;                       // frame-rate independent
    for (const n of nodes) {
      n.vx += (Math.sin(t * .0004 + n.hx) * .02 - (n.x - n.hx) * .002) * k;
      n.vy += (Math.cos(t * .0005 + n.hy) * .02 - (n.y - n.hy) * .002) * k;
      if (fine) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y, R = 150, d2 = dx * dx + dy * dy;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * .9;
          n.vx += (dx / d) * f * k; n.vy += (dy / d) * f * k;
        }
      }
      n.vx *= .92; n.vy *= .92;
      n.x += n.vx * k; n.y += n.vy * k;
    }
  };

  const loop = (now) => {
    if (!running) return;
    const dt = now - (last || now); last = now;
    step(dt, now); draw(now);
    raf = requestAnimationFrame(loop);
  };
  const start = () => {
    if (running || reduced || !onScreen || document.hidden) return;
    running = true; last = 0; raf = requestAnimationFrame(loop);
  };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout(); draw(0);
  };

  resize();
  addEventListener("resize", resize, { passive: true });
  if (fine) {
    const host = canvas.parentElement;
    host.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    }, { passive: true });
    host.addEventListener("pointerleave", () => { pointer.x = pointer.y = -1e4; });
  }
  if (reduced) return;                                     // static frame already drawn
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => {
      onScreen = en.some((x) => x.isIntersecting);
      onScreen ? start() : stop();
    }).observe(canvas);
  } else start();
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
})();
