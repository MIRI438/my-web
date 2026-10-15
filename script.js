(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  const burger = nav.querySelector(".nav__burger");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- reveal on scroll (staggered per parent) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${siblings.indexOf(el) * 80}ms`);
  });
  document.querySelectorAll(".card__chart span").forEach((s, i) => s.style.setProperty("--i", i));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- counters ---------- */
  const fmt = new Intl.NumberFormat("he-IL");
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        if (reduceMotion) { el.textContent = fmt.format(target) + suffix; return; }
        const dur = 1800;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt.format(Math.round(target * eased)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- cursor glow + card spotlight ---------- */
  const glow = document.querySelector(".cursor-glow");
  window.addEventListener(
    "pointermove",
    (e) => {
      glow.style.setProperty("--mx", `${e.clientX}px`);
      glow.style.setProperty("--my", `${e.clientY}px`);
    },
    { passive: true }
  );
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - r.left}px`);
      card.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------- hero terminal: live automation log ---------- */
  const log = document.getElementById("panel-log");
  const lines = [
    ["io", "▸ trigger", "new lead from website form"],
    ["ai", "◆ ai.classify", "intent=buy · score=0.92"],
    ["io", "▸ crm.upsert", "contact #8821 → pipeline: hot"],
    ["io", "▸ whatsapp.send", "personal message delivered"],
    ["io", "▸ calendar.book", "meeting slot offered"],
    ["ok", "✓ done", "completed in 2.8s · 0 manual steps"],
  ];
  const stamp = (offset) => {
    const d = new Date(Date.now() + offset);
    return d.toTimeString().slice(0, 8);
  };
  const renderLine = ([cls, label, text], i) => {
    const li = document.createElement("li");
    li.innerHTML = `<time>${stamp(i * 400)}</time><span class="${cls}">${label}</span><span>${text}</span>`;
    return li;
  };
  const runLog = () => {
    log.innerHTML = "";
    if (reduceMotion) { lines.forEach((l, i) => log.appendChild(renderLine(l, i))); return; }
    lines.forEach((l, i) => setTimeout(() => log.appendChild(renderLine(l, i)), 500 + i * 650));
    setTimeout(runLog, 500 + lines.length * 650 + 3500);
  };
  runLog();

  /* ---------- hero canvas: flowing node network ---------- */
  const canvas = document.getElementById("flow-canvas");
  const ctx = canvas.getContext("2d");
  let w, h, dpr, nodes, pulses, raf;
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.6,
    }));
    pulses = [];
  };

  const LINK = 150;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) { n.x += dx / dist * 0.6; n.y += dy / dist * 0.6; }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(124, 92, 255, ${(1 - d / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (Math.random() < 0.0008 && pulses.length < 24) pulses.push({ a, b, t: 0 });
        }
      }
    }

    for (const n of nodes) {
      ctx.fillStyle = "rgba(200, 190, 255, 0.55)";
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    // data packets travelling along links
    pulses = pulses.filter((p) => p.t <= 1);
    for (const p of pulses) {
      p.t += 0.012;
      const x = p.a.x + (p.b.x - p.a.x) * p.t;
      const y = p.a.y + (p.b.y - p.a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
      g.addColorStop(0, "rgba(34, 211, 238, 0.95)");
      g.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  };

  resize();
  if (reduceMotion) {
    draw(); cancelAnimationFrame(raf);
  } else {
    draw();
    // pause when hero is off-screen to save battery
    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(draw);
    }).observe(canvas);
  }
  let resizeT;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(resize, 150);
  });
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  /* ---------- contact form ---------- */
  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form__status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "phone"].forEach((name) => {
      const input = form.elements[name];
      const valid = input.value.trim().length > 1;
      input.closest(".field").classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    status.classList.toggle("is-error", !ok);
    if (!ok) { status.textContent = "נא למלא שם וטלפון"; return; }

    // TODO: connect to a real endpoint (Make/n8n webhook, Formspree, CRM...)
    status.textContent = "תודה! קיבלנו את הפרטים ונחזור אליכם בהקדם ✨";
    form.reset();
  });
})();
