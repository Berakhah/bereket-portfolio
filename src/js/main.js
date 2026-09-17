/* Bereket Tilahun — portfolio interactions (Editorial Signal).
   Layer 0 (always, `.js`): header state, mobile nav, nav current-section,
     claim → evidence sheet, anchor links, footer year.
   Layer 1 (`.motion`: GSAP + ScrollTrigger loaded AND no reduced-motion):
     Lenis smooth scroll, reveals, page curtain, portrait parallax,
     sticky-stack panels, case-study TOC progress. */
(() => {
  "use strict";
  const doc = document, win = window, root = doc.documentElement;
  root.classList.add("js");
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const gsap = win.gsap, ST = win.ScrollTrigger;
  const motion = !!(gsap && ST) && !reduced.matches;
  if (motion) { gsap.registerPlugin(ST); root.classList.add("motion"); }

  /* ================================================================ layer 0 */
  const head = $(".site-head");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { if (head) head.classList.toggle("scrolled", win.scrollY > 8); ticking = false; });
  };
  win.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const menuBtn = $(".menu-btn"), mobileNav = $("#mobile-nav");
  if (menuBtn && mobileNav) {
    const setOpen = (open) => { menuBtn.setAttribute("aria-expanded", String(open)); mobileNav.hidden = !open; };
    menuBtn.addEventListener("click", () => setOpen(menuBtn.getAttribute("aria-expanded") !== "true"));
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    doc.addEventListener("keydown", (e) => { if (e.key === "Escape" && !mobileNav.hidden) { setOpen(false); menuBtn.focus(); } });
  }

  let lenis = null;
  if (motion && typeof win.Lenis === "function") {
    lenis = new win.Lenis({ lerp: .1, smoothWheel: true });
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
    if (!a || a.classList.contains("skip-link")) return;
    const href = a.getAttribute("href");
    if (href.startsWith("/#") && !onHome) return;
    const hash = href.replace(/^\//, "");
    const target = hash === "#" ? null : doc.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", hash);
    scrollTo(target);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  /* nav: mark the current home section */
  const navLinks = $$('.site-nav a[href^="/#"]');
  if (onHome && navLinks.length && "IntersectionObserver" in win) {
    const map = new Map(navLinks.map((a) => [a.getAttribute("href").slice(2), a]));
    const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.remove("current"));
      const a = map.get(en.target.id); if (a) a.classList.add("current");
    }), { rootMargin: "-40% 0px -55% 0px" });
    map.forEach((_, id) => { const s = doc.getElementById(id); if (s) spy.observe(s); });
  }

  /* claim → evidence sheet */
  const drawerRoot = $(".drawer-root"), drawerBody = $("#drawer-body");
  let lastTrigger = null, evidence = {};
  try { evidence = JSON.parse($("#evidence-data").textContent); } catch { evidence = {}; }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const evRow = (k, v) => `<div class="ev-row"><span class="ev-key">${k}</span><span>${v}</span></div>`;
  const openDrawer = (id, trigger) => {
    const ev = evidence[id];
    if (!ev || !drawerRoot) return;
    lastTrigger = trigger || null;
    drawerBody.innerHTML = `
      <p class="ev-claim">${esc(ev.claim)}</p>
      <div class="ev-chain">
        ${evRow("Method", `<span class="ev-method">${esc(ev.method)}</span>`)}
        ${evRow("Source", ev.source && ev.source.href ? `<a href="${esc(ev.source.href)}" target="_blank" rel="noopener">${esc(ev.source.label)}</a>` : (ev.source ? esc(ev.source.label) : "—"))}
        ${evRow("Basis", ev.basis ? esc(ev.basis) : "—")}
        ${evRow("Observed", ev.observedAt ? esc(ev.observedAt) : "—")}
      </div>
      ${ev.caveats && ev.caveats.length ? `<div class="ev-caveats"><p class="ev-caveats-h">CAVEATS</p><ul>${ev.caveats.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}`;
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
      const f = $$("button, a[href], [tabindex]:not([tabindex='-1'])", $(".drawer", drawerRoot));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ================================================================ layer 1 */
  const show = (el) => el.classList.add("in-view");
  const revealables = $$(".rv");
  if (motion) {
    ST.batch(revealables, { start: "top 92%", once: true, onEnter: (els) => els.forEach(show) });
    win.addEventListener("load", () => {
      revealables.forEach((el) => { if (el.getBoundingClientRect().top < win.innerHeight) show(el); });
      ST.refresh();
    });
  } else {
    revealables.forEach(show);
  }

  /* page curtain: wipe in on arrival, wipe out on internal navigation */
  const curtain = $(".curtain");
  if (motion && curtain) {
    curtain.classList.add("in");
    requestAnimationFrame(() => requestAnimationFrame(() => { curtain.classList.remove("in"); curtain.classList.add("out"); }));
    doc.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      curtain.classList.remove("out"); curtain.classList.add("in");
      setTimeout(() => { location.href = url.href; }, 400);
    });
    win.addEventListener("pageshow", (e) => { if (e.persisted) { curtain.classList.remove("in"); curtain.classList.add("out"); } });
  }

  /* hero portrait parallax ≤ 24px */
  const heroImg = $(".hero-portrait img");
  if (motion && heroImg) {
    gsap.to(heroImg, { y: 24, ease: "none", scrollTrigger: { trigger: heroImg, start: "top top", end: "bottom top", scrub: .3 } });
  }

  /* sticky-stack: each panel recedes as the next covers it */
  const panels = Array.from(doc.querySelectorAll(".panel"));
  if (motion && panels.length > 1) {
    panels.forEach((p, i) => {
      const next = panels[i + 1];
      if (!next) return;
      gsap.to(p, { scale: .96, opacity: .6, ease: "none",
        scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true } });
    });
    $$(".panel .flow").forEach((f) => ST.create({ trigger: f, start: "top 80%", once: true, onEnter: () => f.classList.add("drawn") }));
  }

  /* case-study TOC current section */
  const toc = $(".cs-toc");
  if (toc) {
    const pairs = $$("a[href^='#']", toc).map((a) => [a, $(a.getAttribute("href"))]).filter(([, s]) => s);
    if (motion) {
      pairs.forEach(([a, sec]) => ST.create({ trigger: sec, start: "top 40%", end: "bottom 40%",
        onToggle: (self) => a.classList.toggle("current", self.isActive) }));
    } else if ("IntersectionObserver" in win) {
      const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        pairs.forEach(([a]) => a.classList.remove("current"));
        const hit = pairs.find(([, s]) => s === en.target);
        if (hit) hit[0].classList.add("current");
      }), { rootMargin: "-30% 0px -60% 0px" });
      pairs.forEach(([, s]) => spy.observe(s));
    }
  }
})();
