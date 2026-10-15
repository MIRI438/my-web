(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGsap && !reduceMotion;

  document.getElementById("year").textContent = new Date().getFullYear();
  if (animate) root.classList.add("anim");

  setupForm();
  setupGL();
  if (!animate) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.__lenis = lenis;
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else window.scrollTo({ top: target === 0 ? 0 : target.offsetTop, behavior: "smooth" });
    });
  });

  /* ---------- loader -> hero intro ---------- */
  // first visit in a session: play the logo reveal video; otherwise (or if the
  // video cannot play quickly) fall back to the short counter
  const intro = gsap.timeline({ paused: true, onComplete: () => lenis && lenis.start() });
  intro
    .to(".loader", { yPercent: -100, duration: 1.1, ease: "power4.inOut" })
    .to(".hero__title .line > span", { y: 0, duration: 1.3, ease: "power4.out", stagger: 0.12 }, "-=0.45")
    .to(".hero .reveal-up", { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, "-=0.9")
    .set(".loader", { display: "none" });
  let introStarted = false;
  const startIntro = () => { if (!introStarted) { introStarted = true; intro.play(); } };

  const loaderEl = document.querySelector(".loader");
  const video = loaderEl.querySelector(".loader__video");
  let seen = false;
  try { seen = sessionStorage.getItem("mirai-intro") === "1"; } catch (e) { /* storage blocked */ }

  function counterIntro() {
    loaderEl.classList.remove("loader--video");
    const counter = { n: 0 };
    const loadN = document.getElementById("load-n");
    gsap.timeline({ onComplete: startIntro })
      .to(counter, { n: 100, duration: seen ? 0.7 : 1.4, ease: "power2.inOut", onUpdate: () => (loadN.textContent = Math.round(counter.n)) })
      .to(".loader__bar span", { scaleX: 1, duration: seen ? 0.7 : 1.4, ease: "power2.inOut" }, 0);
  }

  if (!seen && video && video.canPlayType) {
    loaderEl.classList.add("loader--video");
    // if the video is slow to start, show the logo still (the poster) and move on
    const fallback = setTimeout(() => { video.pause(); finish(); }, 2600);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem("mirai-intro", "1"); } catch (e) { /* storage blocked */ }
      gsap.to(".loader__brand", { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
      gsap.delayedCall(0.7, startIntro);
    };
    video.addEventListener("playing", () => { clearTimeout(fallback); loaderEl.classList.add("is-playing"); }, { once: true });
    video.addEventListener("ended", finish, { once: true });
    loaderEl.querySelector(".loader__skip").addEventListener("click", () => { clearTimeout(fallback); video.pause(); finish(); });
    const p = video.play();
    if (p && p.catch) p.catch(() => { clearTimeout(fallback); finish(); });
  } else {
    counterIntro();
  }

  /* ---------- nav: color per section + hide on scroll down ---------- */
  const nav = document.getElementById("nav");
  document.querySelectorAll("[data-nav]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 40px", end: "bottom 40px",
      onToggle: (self) => self.isActive && nav.classList.toggle("is-dark", sec.dataset.nav === "dark"),
    });
  });
  ScrollTrigger.create({
    start: 200, end: "max",
    onUpdate: (self) => nav.classList.toggle("is-hidden", self.direction === 1),
    onLeaveBack: () => nav.classList.remove("is-hidden"),
  });

  /* ---------- hero parallax out ---------- */
  gsap.to(".hero__inner", {
    yPercent: -18, opacity: 0.2, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- manifesto: words light up ---------- */
  const mani = document.getElementById("manifesto");
  mani.innerHTML = mani.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  gsap.to("#manifesto .w", {
    opacity: 1, ease: "none", stagger: 0.1,
    scrollTrigger: { trigger: mani, start: "top 78%", end: "bottom 50%", scrub: true },
  });

  const mm = gsap.matchMedia();

  /* ---------- services: horizontal scroll (desktop) ---------- */
  mm.add("(min-width: 900px)", () => {
    const track = document.querySelector(".hs__track");
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => dist(), ease: "none",
      scrollTrigger: { trigger: ".hs", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
    });
    gsap.utils.toArray(".panel").forEach((p) => {
      gsap.from(p, {
        rotate: -4, yPercent: 8, ease: "none",
        scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "center center", scrub: true },
      });
    });
  });
  mm.add("(max-width: 899px)", () => {
    gsap.utils.toArray(".panel").forEach((p) => {
      gsap.from(p, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: p, start: "top 88%" } });
    });
  });

  /* ---------- flow: the lead travels through the system ---------- */
  const line = document.querySelector(".flow__line");
  const steps = [...document.querySelectorAll("#flow-track li")];
  const flowT = document.getElementById("flow-t");
  const setFlow = (p) => {
    line.style.setProperty("--p", p.toFixed(4));
    steps.forEach((li) => li.classList.toggle("on", p >= Number(li.dataset.at) - 0.001));
    flowT.textContent = (p * 2.8).toFixed(1);
  };
  mm.add("(min-width: 900px)", () => {
    ScrollTrigger.create({
      trigger: ".flow", start: "top top", end: "+=1600", pin: true, scrub: true,
      onUpdate: (self) => setFlow(self.progress),
    });
  });
  mm.add("(max-width: 899px)", () => {
    ScrollTrigger.create({
      trigger: "#flow-track", start: "top 70%", end: "bottom 50%", scrub: true,
      onUpdate: (self) => setFlow(self.progress),
    });
  });

  /* ---------- process: stacking cards ---------- */
  const cards = gsap.utils.toArray(".card");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.9, ease: "none",
      scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true },
    });
  });
  gsap.utils.toArray(".process__head, .faq__head, .faq__list details").forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* ---------- big marquee follows scroll ---------- */
  gsap.fromTo(".bm__row--a", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: ".big-marquee", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".bm__row--b", { xPercent: -35 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".big-marquee", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- contact ---------- */
  gsap.to(".contact__title .line > span", {
    y: 0, duration: 1.3, ease: "power4.out", stagger: 0.12,
    scrollTrigger: { trigger: ".contact", start: "top 70%" },
  });
  gsap.from(".contact__grid > *", {
    y: 60, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.15,
    scrollTrigger: { trigger: ".contact__grid", start: "top 85%" },
  });

  /* ---------- cursor + magnetic orb ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const cursor = document.querySelector(".cursor");
    const label = cursor.querySelector(".cursor__label");
    const cx = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); });
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("pointerenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-big"); });
      el.addEventListener("pointerleave", () => cursor.classList.remove("is-big"));
    });

    const orb = document.querySelector(".orb");
    orb.addEventListener("pointermove", (e) => {
      const r = orb.getBoundingClientRect();
      gsap.to(orb, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.6, ease: "power3.out" });
    });
    orb.addEventListener("pointerleave", () => gsap.to(orb, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" }));
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* =========================================================
     Hero WebGL: a field of points that morphs from a sphere
     into a knot of connections as you scroll.
     ========================================================= */
  function setupGL() {
    const canvas = document.getElementById("gl");
    if (!window.THREE || !canvas) return;
    const THREE = window.THREE;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (err) {
      return;
    }
    const small = window.innerWidth < 900;
    const COUNT = small ? 4500 : 9000;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 7;

    const sphere = new Float32Array(COUNT * 3);
    const knot = new Float32Array(COUNT * 3);
    const rand = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      // fibonacci sphere
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const R = 1.9;
      sphere.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
      // (2,3) torus knot with a little tube thickness
      const t = Math.random() * Math.PI * 2;
      const kr = Math.cos(3 * t) + 2.2;
      const s = 0.78;
      const jitter = () => (Math.random() - 0.5) * 0.28;
      knot.set([kr * Math.cos(2 * t) * s + jitter(), kr * Math.sin(2 * t) * s + jitter(), -Math.sin(3 * t) * s * 1.4 + jitter()], i * 3);
      rand[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(sphere, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(knot, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const uniforms = { uMorph: { value: 0 }, uTime: { value: 0 }, uSize: { value: 26 * dpr } };
    const mat = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      vertexShader: `
        attribute vec3 aTarget; attribute float aRand;
        uniform float uMorph, uTime, uSize;
        varying float vA;
        void main() {
          float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.2 - aRand * 0.2, 0.0, 1.0));
          vec3 p = mix(position, aTarget, m);
          p += normalize(p + 0.0001) * sin(uTime * 1.4 + aRand * 6.2831) * 0.045;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uSize * (0.35 + aRand * 0.65) / -mv.z;
          gl_Position = projectionMatrix * mv;
          vA = 0.35 + aRand * 0.65;
        }`,
      fragmentShader: `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, (1.0 - d * 2.0) * vA);
        }`,
    });
    const points = new THREE.Points(geo, mat);
    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    const place = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w >= 900;
      group.position.set(wide ? -2.3 : 0, wide ? 0.55 : 1.2, 0);
      group.scale.setScalar(wide ? 1 : 0.8);
    };
    place();
    window.addEventListener("resize", place);

    const pointer = { x: 0, y: 0 };
    window.addEventListener("pointermove", (e) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    let scrollP = 0;
    const heroEl = document.querySelector(".hero");
    const readScroll = () => {
      const h = heroEl.offsetHeight || 1;
      scrollP = Math.min(Math.max(window.scrollY / h, 0), 1);
    };
    window.addEventListener("scroll", readScroll, { passive: true });

    if (reduceMotion || !hasGsap) {
      renderer.render(scene, camera);
      return;
    }

    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
    const clock = new THREE.Clock();
    let morph = 0;
    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      morph += (scrollP * 1.6 - morph) * 0.06;
      uniforms.uMorph.value = morph;
      group.rotation.y = t * 0.12 + pointer.x * 0.6 + scrollP * 2.2;
      group.rotation.x = Math.sin(t * 0.2) * 0.15 + pointer.y * 0.4 + scrollP * 0.6;
      renderer.render(scene, camera);
    };
    tick();
  }

  /* ---------- contact form ---------- */
  function setupForm() {
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
      if (!ok) { status.textContent = "צריך למלא שם וטלפון כדי שנוכל לחזור אליכם."; return; }
      // TODO: send to a real endpoint (Make/n8n webhook, Formspree, CRM)
      status.textContent = "קיבלנו. נחזור אליכם תוך יום עסקים.";
      form.reset();
    });
  }
})();
