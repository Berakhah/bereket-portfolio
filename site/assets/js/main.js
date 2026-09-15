/* Bereket Tilahun — portfolio interactions.
   Reveals, scroll progress, mobile nav, claim→evidence drawer, counters,
   magnetic buttons, TOC spy. Everything is interruptible and
   prefers-reduced-motion aware. */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  root.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = window.matchMedia("(pointer: fine)");

  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));

  /* ------------------------------------------------------------- header */
  const head = $(".site-head");
  const bar = $(".progress-bar");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (head) head.classList.toggle("scrolled", y > 8);
      if (bar) {
        const max = doc.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------- mobile nav */
  const menuBtn = $(".menu-btn");
  const mobileNav = $("#mobile-nav");
  if (menuBtn && mobileNav) {
    const setOpen = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
    };
    menuBtn.addEventListener("click", () =>
      setOpen(menuBtn.getAttribute("aria-expanded") !== "true")
    );
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !mobileNav.hidden) { setOpen(false); menuBtn.focus(); }
    });
  }

  /* ------------------------------------------------------------ reveals */
  const revealables = $$(".rv, .line-mask");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          // Also reveal anything already scrolled past (scroll restoration,
          // back-navigation, deep links) — it must never stay hidden.
          if (en.isIntersecting || en.boundingClientRect.top < 0) {
            en.target.classList.add("in-view");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealables.forEach((el) => io.observe(el));

    /* keep the pipeline pulse honest: run only while on screen */
    const pipe = $("#pipeline");
    if (pipe) {
      const pio = new IntersectionObserver(
        (en) =>
          en.forEach((x) =>
            $$(".rail-pulse, .rail-line", pipe).forEach((el) =>
              (el.style.animationPlayState = x.isIntersecting && !reduced.matches ? "running" : "paused")
            )
          ),
        { threshold: 0 }
      );
      pio.observe(pipe);
    }

    /* case-study TOC spy */
    const tocLinks = $$(".cs-toc a[href^='#']");
    if (tocLinks.length) {
      const map = new Map();
      tocLinks.forEach((a) => {
        const sec = $(a.getAttribute("href"));
        if (sec) map.set(sec, a);
      });
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            const link = map.get(en.target);
            if (!link) return;
            if (en.isIntersecting) {
              tocLinks.forEach((a) => a.classList.remove("current"));
              link.classList.add("current");
            }
          });
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      map.forEach((_, sec) => spy.observe(sec));
    }
  } else {
    revealables.forEach((el) => el.classList.add("in-view"));
  }

  /* ----------------------------------------------------------- counters */
  const countUp = (el) => {
    const raw = el.textContent.trim();
    if (!/^[\d,]+$/.test(raw) || reduced.matches) return;
    const target = parseInt(raw.replace(/,/g, ""), 10);
    if (!isFinite(target) || target < 10) return;
    const t0 = performance.now();
    const dur = 900;
    const fmt = (n) => n.toLocaleString("en-US");
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    };
    el.textContent = "0";
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (en) => en.forEach((x) => { if (x.isIntersecting) { countUp(x.target); cio.unobserve(x.target); } }),
      { threshold: 0.6 }
    );
    $$(".proof-value").forEach((el) => cio.observe(el));
  }

  /* ------------------------------------------------- claim → evidence drawer */
  const drawerRoot = $(".drawer-root");
  const drawerBody = $("#drawer-body");
  let lastTrigger = null;
  let evidence = {};

  try { evidence = JSON.parse($("#evidence-data").textContent || "{}"); } catch { evidence = {}; }

  const evRow = (k, v, i) =>
    `<div class="ev-row" style="--i:${i}"><span class="ev-k">${k}</span><span class="ev-v">${v}</span></div>`;

  const openDrawer = (id, trigger) => {
    const ev = evidence[id];
    if (!ev || !drawerRoot) return;
    lastTrigger = trigger || null;

    const rows = [];
    rows.push(
      evRow("Method", `<span class="ev-method m-${ev.method}">${ev.method}</span>`, 0)
    );
    rows.push(
      evRow(
        "Source",
        ev.source && ev.source.href
          ? `<a href="${ev.source.href}" target="_blank" rel="noopener">${ev.source.label}</a>`
          : (ev.source ? ev.source.label : "—"),
        1
      )
    );
    rows.push(evRow("Basis", ev.basis || "—", 2));
    rows.push(evRow("Observed", ev.observedAt || "—", 3));

    drawerBody.innerHTML = `
      <p class="ev-claim">${ev.claim}</p>
      <div class="ev-chain">${rows.join("")}</div>
      ${ev.caveats && ev.caveats.length
        ? `<div class="ev-caveats">
             <p class="ev-caveats-h">⚠ Inherited caveats</p>
             <ul>${ev.caveats.map((c) => `<li>${c}</li>`).join("")}</ul>
           </div>`
        : ""}`;

    drawerRoot.classList.add("open");
    drawerRoot.setAttribute("aria-hidden", "false");
    root.classList.add("drawer-open");
    $(".drawer", drawerRoot).focus();
  };

  const closeDrawer = () => {
    if (!drawerRoot) return;
    drawerRoot.classList.remove("open");
    drawerRoot.setAttribute("aria-hidden", "true");
    root.classList.remove("drawer-open");
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
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------------------------------------------- magnetic buttons */
  if (fine.matches && !reduced.matches) {
    $$(".btn-ink, .pc-cta").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 5;
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 4;
        btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ------------------------------------------------------------ footer */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
