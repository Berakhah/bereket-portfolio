/* Bereket Tilahun — portfolio interactions (dark-ops layer).
   Layer 0 (always, `.js`): header state, scroll progress, mobile nav,
     claim → evidence drawer, anchor links, footer year.
   Layer 1 (`.motion`: GSAP + ScrollTrigger loaded AND no reduced-motion):
     Lenis smooth scroll, boot sequence, reveals, readouts, scroll scenes,
     page transitions.  Without layer 1 the CSS shows everything statically. */
(() => {
  "use strict";

  const doc = document, win = window, root = doc.documentElement;
  root.classList.add("js");

  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = win.matchMedia("(pointer: fine)");
  const DESK = "(min-width: 64em)";

  const gsap = win.gsap, ST = win.ScrollTrigger;
  const motion = !!(gsap && ST) && !reduced.matches;
  if (motion) { gsap.registerPlugin(ST); root.classList.add("motion"); }

  /* ================================================================ layer 0 */

  /* header + progress */
  const head = $(".site-head"), bar = $(".progress-bar");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = win.scrollY;
      if (head) head.classList.toggle("scrolled", y > 8);
      if (bar) {
        const max = root.scrollHeight - win.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      ticking = false;
    });
  };
  win.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile nav */
  const menuBtn = $(".menu-btn"), mobileNav = $("#mobile-nav");
  if (menuBtn && mobileNav) {
    const setOpen = (open) => { menuBtn.setAttribute("aria-expanded", String(open)); mobileNav.hidden = !open; };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileNav.hidden) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* Lenis smooth scroll (layer 1) + anchor navigation (both layers) */
  let lenis = null;
  if (motion && typeof win.Lenis === "function") {
    lenis = new win.Lenis({ lerp: .11, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: -72 });
    else target.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
  };
  const onHome = location.pathname === "/" || /\/index\.html$/.test(location.pathname);
  doc.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (href.startsWith("/#") && !onHome) return;            // real navigation to home
    const hash = href.replace(/^\//, "");
    const target = hash === "#" ? null : $(hash);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", hash);
    scrollTo(target);
  });

  /* claim → evidence drawer */
  const drawerRoot = $(".drawer-root"), drawerBody = $("#drawer-body");
  let lastTrigger = null, evidence = {};
  try { evidence = JSON.parse($("#evidence-data").textContent || "{}"); } catch { evidence = {}; }
  const evRow = (k, v, i) => `<div class="ev-row" style="--i:${i}"><span class="ev-k">${k}</span><span class="ev-v">${v}</span></div>`;
  const openDrawer = (id, trigger) => {
    const ev = evidence[id];
    if (!ev || !drawerRoot) return;
    lastTrigger = trigger || null;
    const rows = [
      evRow("Method", `<span class="ev-method m-${ev.method}">${ev.method}</span>`, 0),
      evRow("Source", ev.source && ev.source.href
        ? `<a href="${ev.source.href}" target="_blank" rel="noopener">${ev.source.label}</a>`
        : (ev.source ? ev.source.label : "—"), 1),
      evRow("Basis", ev.basis || "—", 2),
      evRow("Observed", ev.observedAt || "—", 3),
    ];
    drawerBody.innerHTML = `
      <p class="ev-claim">${ev.claim}</p>
      <div class="ev-chain">${rows.join("")}</div>
      ${ev.caveats && ev.caveats.length
        ? `<div class="ev-caveats"><p class="ev-caveats-h">⚠ INHERITED CAVEATS</p><ul>${ev.caveats.map((c) => `<li>${c}</li>`).join("")}</ul></div>`
        : ""}`;
    drawerRoot.classList.add("open");
    drawerRoot.setAttribute("aria-hidden", "false");
    root.classList.add("drawer-open");
    if (lenis) lenis.stop();
    $(".drawer", drawerRoot).focus();
  };
  const closeDrawer = () => {
    if (!drawerRoot) return;
    drawerRoot.classList.remove("open");
    drawerRoot.setAttribute("aria-hidden", "true");
    root.classList.remove("drawer-open");
    if (lenis) lenis.start();
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  };
  doc.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-evidence]");
    if (trigger) { openDrawer(trigger.getAttribute("data-evidence"), trigger); return; }
    if (e.target.closest("[data-drawer-close]")) closeDrawer();
  });
  doc.addEventListener("keydown", (e) => {
    if (!drawerRoot || !drawerRoot.classList.contains("open")) return;
    if (e.key === "Escape") { closeDrawer(); return; }
    if (e.key === "Tab") {
      const focusables = $$("button, a[href], [tabindex]:not([tabindex='-1'])", $(".drawer", drawerRoot));
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* footer year */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ================================================================ layer 1 */

  const show = (el) => el.classList.add("in-view");

  /* boot sequence: types each line; ~1.2 s total */
  const boot = (pre, onDone) => {
    const lines = $$(".boot-line", pre);
    if (!motion || !lines.length) {
      lines.forEach((l) => l.classList.add("typed"));
      if (onDone) onDone();
      return null;
    }
    const tl = gsap.timeline({ onComplete: onDone });
    const per = 1.2 / lines.length;
    lines.forEach((line) => {
      const full = line.textContent, state = { n: 0 };
      tl.call(() => { line.textContent = ""; line.classList.add("typed", "typing"); });
      tl.to(state, { n: full.length, duration: per * .8, ease: "none", snap: "n",
        onUpdate: () => { line.textContent = full.slice(0, state.n); } });
      tl.call(() => { line.textContent = full; line.classList.remove("typing"); });
      tl.to({}, { duration: per * .2 });
    });
    return tl;
  };

  /* reveals — hero elements wait for the boot sequence */
  const heroEls = $$("[data-hero]");
  const revealables = $$(".rv, .line-mask, .wipe").filter((el) => !el.hasAttribute("data-hero"));
  if (motion) {
    ST.batch(revealables, { start: "top 90%", once: true, onEnter: (els) => els.forEach(show) });
    // scroll restoration / deep links: never leave something above the fold hidden
    win.addEventListener("load", () => {
      revealables.forEach((el) => { if (el.getBoundingClientRect().top < win.innerHeight) show(el); });
      ST.refresh();
    });
  } else {
    revealables.forEach(show);
  }
  const boots = $$("[data-boot]");
  if (boots.length) boots.forEach((pre) => boot(pre, () => heroEls.forEach(show)));
  else heroEls.forEach(show);

  /* readouts: digits count up, everything else decodes from glyph noise */
  const GLYPHS = "01<>/\\|_-=+*#%";
  const decode = (el) => {
    const final = el.textContent, state = { p: 0 };
    gsap.to(state, { p: 1, duration: .9, ease: "power2.out",
      onUpdate: () => {
        const n = Math.floor(final.length * state.p);
        el.textContent = final.slice(0, n) + final.slice(n).replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      },
      onComplete: () => { el.textContent = final; } });
  };
  const countUp = (el) => {
    const raw = el.getAttribute("data-count"), target = parseInt(raw.replace(/,/g, ""), 10), state = { n: 0 };
    if (!isFinite(target)) return;
    gsap.to(state, { n: target, duration: 1.1, ease: "power3.out", snap: "n",
      onUpdate: () => { el.textContent = state.n.toLocaleString("en-US"); },
      onComplete: () => { el.textContent = raw; } });
  };
  if (motion) {
    ST.batch("[data-count], [data-decode]", { start: "top 88%", once: true,
      onEnter: (els) => els.forEach((el) => (el.hasAttribute("data-count") ? countUp(el) : decode(el))) });
  }

  /* magnetic buttons (fine pointers only) */
  if (motion && fine.matches) {
    $$(".btn-ink, .pc-cta").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: ((e.clientX - r.left) / r.width - .5) * 6, y: ((e.clientY - r.top) / r.height - .5) * 5, duration: .25 });
      });
      btn.addEventListener("pointerleave", () => gsap.to(btn, { x: 0, y: 0, duration: .35 }));
    });
  }

  /* page transitions: CSS @view-transition where supported; curtain elsewhere */
  const curtain = $(".curtain");
  if (motion && curtain && !("startViewTransition" in doc)) {
    doc.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      gsap.fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: .38, ease: "power3.inOut", transformOrigin: "bottom",
        onComplete: () => { location.href = url.href; } });
    });
    win.addEventListener("pageshow", () => gsap.set(curtain, { scaleY: 0 }));
  }

  /* ================================================================= scenes */

  /* pipeline: pinned scrub on desktop; CSS-looped packet + reveals on mobile */
  const scene = $("#pipeline");
  if (scene && motion) {
    const packet = $(".packet", scene), stations = $$(".station", scene), readout = $("[data-readout]", scene);
    const n = stations.length;
    const light = (p) => {
      let current = -1;
      stations.forEach((s, i) => {
        const on = p >= i / (n - 1) - .02;
        s.classList.toggle("lit", on);
        if (on) current = i;
      });
      if (readout) readout.textContent = current < 0 ? "> awaiting input" : `> ${stations[current].getAttribute("data-desc")}`;
    };
    const mm = gsap.matchMedia();
    mm.add(DESK, () => {
      gsap.fromTo(packet, { "--x": 0 }, { "--x": 100, ease: "none",
        scrollTrigger: { trigger: scene, pin: true, start: "top top", end: () => "+=" + n * 55 + "%", scrub: .5,
          onUpdate: (self) => light(self.progress) } });
    });
    mm.add("(max-width: 63.99em)", () => {
      ST.batch(stations, { start: "top 80%", once: true, onEnter: (els) => els.forEach((s) => s.classList.add("lit")) });
      ST.create({ trigger: scene, start: "top bottom", end: "bottom top",
        onToggle: (self) => scene.classList.toggle("live", self.isActive) });
    });
  }

  /* work: sticky index follows the panel in view */
  if (motion) {
    $$("[data-panel]").forEach((card) => {
      const link = $(`[data-index-for="${card.id}"]`);
      if (!link) return;
      ST.create({ trigger: card, start: "top 50%", end: "bottom 50%",
        onToggle: (self) => link.classList.toggle("current", self.isActive) });
    });
  }

  /* flow steppers: line draws with scroll (or on load inside [data-draw]) */
  if (motion) {
    $$(".flow").forEach((flow) => {
      const line = $(".flow-line", flow);
      if (!line) return;
      if (flow.closest("[data-draw]")) {
        gsap.fromTo(line, { "--draw": 0 }, { "--draw": 1, duration: 1.1, ease: "power2.inOut", delay: .6 });
        return;
      }
      gsap.fromTo(line, { "--draw": 0 }, { "--draw": 1, ease: "none",
        scrollTrigger: { trigger: flow, start: "top 85%", end: "bottom 45%", scrub: .4 } });
    });
  }

  /* evidence: the Claim type "compiles" line by line, then rules stamp in */
  const claim = $(".claim-specimen");
  if (claim && motion) {
    const lines = $$(".cl", claim), rules = $$(".rule", claim);
    ST.create({ trigger: claim, start: "top 75%", once: true, onEnter: () => {
      const tl = gsap.timeline();
      lines.forEach((l) => tl.call(() => {
        lines.forEach((x) => x.classList.remove("typing"));
        l.classList.add("on", "typing");
      }, null, ">.11"));
      tl.call(() => lines.forEach((x) => x.classList.remove("typing")), null, ">.2");
      rules.forEach((r) => tl.call(() => r.classList.add("stamped"), null, ">.28"));
    } });
  }

  /* principles: pinned horizontal scrub on desktop */
  const track = $("[data-track]");
  if (track && motion) {
    const list = $(".principles", track);
    gsap.matchMedia().add(DESK, () => {
      const dist = () => Math.max(0, list.scrollWidth - track.clientWidth);
      gsap.to(list, { x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: track, pin: true, start: "center center", end: () => "+=" + dist(), scrub: .6, invalidateOnRefresh: true } });
    });
  }

  /* timeline: rail draws, nodes ignite */
  const rail = $(".modes-rail");
  if (rail && motion) {
    const wrap = rail.parentElement;
    gsap.fromTo(rail, { "--draw": 0 }, { "--draw": 1, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top 70%", end: "bottom 60%", scrub: .4 } });
    $$(".mode", wrap).forEach((m) => ST.create({ trigger: m, start: "top 65%", once: true, onEnter: () => m.classList.add("lit") }));
  }

  /* case-study TOC: current section + per-section progress hairline */
  const toc = $(".cs-toc");
  if (toc) {
    const pairs = $$("a[href^='#']", toc).map((a) => [a, $(a.getAttribute("href"))]).filter(([, s]) => s);
    if (motion) {
      pairs.forEach(([a, sec]) => ST.create({ trigger: sec, start: "top 40%", end: "bottom 40%",
        onUpdate: (self) => a.style.setProperty("--p", self.progress.toFixed(3)),
        onToggle: (self) => a.classList.toggle("current", self.isActive) }));
    } else if ("IntersectionObserver" in win) {
      const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        pairs.forEach(([a]) => a.classList.remove("current"));
        const hit = pairs.find(([, s]) => s === en.target);
        if (hit) { hit[0].classList.add("current"); hit[0].style.setProperty("--p", "1"); }
      }), { rootMargin: "-30% 0px -60% 0px" });
      pairs.forEach(([, s]) => spy.observe(s));
    }
  }

})();
