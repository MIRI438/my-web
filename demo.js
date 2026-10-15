/* Live demo: leads arrive from different channels, pass through the
   automation and land in a working sample CRM. All data is invented. */
(() => {
  "use strict";

  const stage = document.getElementById("demo-stage");
  if (!stage) return;

  /* ---------- data ---------- */
  const ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2s-1 .3-3.3-.7a11.4 11.4 0 01-4.4-3.9 5 5 0 01-1-2.7 2.9 2.9 0 01.9-2.2.9.9 0 01.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6a8.6 8.6 0 001.6 2 7.8 7.8 0 002.3 1.4c.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3a2.4 2.4 0 01-.1 1.2z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M3 5.5h18v13H3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3.5 6.5L12 13l8.5-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    facebook: '<svg viewBox="0 0 24 24"><path d="M13.5 22v-8h2.8l.5-3.4h-3.3V8.5c0-1 .3-1.6 1.7-1.6H17V3.9a22 22 0 00-2.6-.1c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.3V14h2.8v8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.3"/></svg>',
    site: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1z"/></svg>',
  };
  const SOURCES = {
    whatsapp: { name: "וואטסאפ", color: "#25d366", channel: "הודעה נכנסת בוואטסאפ" },
    email: { name: "מייל", color: "#ea4335", channel: "מייל: בקשה להצעת מחיר" },
    facebook: { name: "פייסבוק", color: "#1877f2", channel: "טופס לידים · קמפיין סתיו" },
    instagram: { name: "אינסטגרם", color: "#d6246e", channel: "הודעה ישירה באינסטגרם" },
    site: { name: "טופס באתר", color: "#2a3bff", channel: "טופס צור קשר באתר" },
    phone: { name: "שיחה שלא נענתה", color: "#64748b", channel: "שיחה שלא נענתה · נשלח SMS חוזר" },
  };
  const STAGES = [
    { id: "new", name: "חדש" },
    { id: "contacted", name: "נשלחה הודעה" },
    { id: "meeting", name: "פגישה נקבעה" },
    { id: "proposal", name: "הצעת מחיר" },
    { id: "won", name: "נסגר" },
  ];
  const PEOPLE = [
    ["דנה כהן", "dana.cohen"], ["יוסי לוי", "yossi.levi"], ["מיכל אברהם", "michal.a"], ["אורי פרץ", "ori.peretz"],
    ["נועה מזרחי", "noa.m"], ["איתי ביטון", "itay.biton"], ["שירה גולן", "shira.golan"], ["עומר דהן", "omer.dahan"],
    ["רוני שפירא", "roni.sh"], ["תמר אזולאי", "tamar.az"], ["אלון פרידמן", "alon.f"], ["הדס יוסף", "hadas.yosef"],
    ["עידו כץ", "ido.katz"], ["ליאת חדד", "liat.hadad"], ["גיל אוחיון", "gil.o"], ["מאיה רוזן", "maya.rosen"],
  ];
  const INTERESTS = ["תיאום פגישת ייעוץ", "הצעת מחיר", "חבילת פרימיום", "זמינות בחודש הקרוב", "שיתוף פעולה עסקי", "פרטים על השירות"];
  const AGENTS = ["שני", "אבי", "רותם"];
  const AUTOMATIONS = [
    { id: "reply", title: "ליד חדש ← הודעת וואטסאפ אישית", desc: "כל ליד מקבל תשובה תוך שניות, עם קישור לקביעת פגישה.", on: true },
    { id: "score", title: "ליד חדש ← סיווג וניקוד AI", desc: "בודק את תוכן הפנייה ומסמן לידים חמים.", on: true },
    { id: "alert", title: "ליד חם ← התראה לנציג", desc: "הנציג מקבל הודעה בטלפון עם כל הפרטים.", on: true },
    { id: "remind", title: "פגישה נקבעה ← תזכורת יום לפני", desc: "וואטסאפ ללקוח עם השעה והכתובת.", on: true },
    { id: "invoice", title: "עסקה נסגרה ← חשבונית ירוקה", desc: "חשבונית נשלחת ללקוח ונרשמת בהנהלת החשבונות.", on: true },
    { id: "followup", title: "אין מענה 48 שעות ← הודעת מעקב", desc: "תזכורת עדינה למי שלא ענה.", on: true },
  ];

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const phone = () => `05${rnd([0, 2, 3, 4, 8])}-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const hhmmss = (d) => d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const ago = (d) => {
    const s = Math.max(0, (Date.now() - d) / 1000);
    if (s < 45) return "עכשיו";
    if (s < 3600) return `לפני ${Math.round(s / 60)} דק׳`;
    if (s < 86400) return `לפני ${Math.round(s / 3600)} שע׳`;
    return `לפני ${Math.round(s / 86400)} ימים`;
  };
  const autoOn = (id) => AUTOMATIONS.find((a) => a.id === id).on;
  const waText = (l) => `היי ${l.name.split(" ")[0]}, תודה שפנית! ראיתי שמעניין אותך ${l.interest}. אפשר לקבוע שיחה קצרה כאן: cal.link/meet`;

  let seq = 0;
  const leads = [];

  function makeLead(src, opts = {}) {
    const used = new Set(leads.slice(-12).map((l) => l.name));
    const pool = PEOPLE.filter(([n]) => !used.has(n));
    const [name, slug] = opts.name ? [opts.name, "you"] : rnd(pool.length ? pool : PEOPLE);
    const score = opts.score ?? Math.floor(55 + Math.random() * 44);
    return {
      id: ++seq, name, src, score,
      phone: phone(),
      email: `${slug}@gmail.com`,
      interest: rnd(INTERESTS),
      agent: rnd(AGENTS),
      stage: "new",
      created: opts.created ?? new Date(),
      events: [],
      isYou: !!opts.isYou,
      fresh: false,
    };
  }

  // run the automation on a lead; `instant` skips the delays (used for seed data)
  function automate(lead, instant, onStep) {
    const t0 = lead.created.getTime();
    const hot = lead.score >= 80;
    const steps = [
      [0, () => lead.events.push({ t: t0, text: `התקבל ליד מ${SOURCES[lead.src].name}: ${SOURCES[lead.src].channel}` })],
      [600, () => autoOn("score") && lead.events.push({ t: t0 + 600, text: `AI סיווג: ${hot ? "ליד חם" : "ליד רגיל"} (ציון ${lead.score})` })],
      [1200, () => lead.events.push({ t: t0 + 1200, text: `נוצר כרטיס ב־CRM ושויך ל${lead.agent}` })],
      [2100, () => {
        if (!autoOn("reply")) return;
        lead.events.push({ t: t0 + 2100, text: "נשלחה הודעת וואטסאפ אישית", msg: waText(lead) });
        if (lead.stage === "new") lead.stage = "contacted";
      }],
      [2800, () => hot && autoOn("alert") && lead.events.push({ t: t0 + 2800, text: `התראה נשלחה ל${lead.agent}: ליד חם, כדאי להתקשר היום` })],
    ];
    steps.forEach(([ms, fn], i) => {
      if (instant) { fn(); return; }
      setTimeout(() => { fn(); onStep && onStep(i); renderAll(); }, ms);
    });
  }

  // seed data spread over the last two days
  (function seed() {
    const plan = [["facebook", "won", 46], ["site", "proposal", 30], ["whatsapp", "meeting", 26], ["email", "proposal", 20], ["instagram", "meeting", 9], ["facebook", "contacted", 5], ["phone", "contacted", 3], ["whatsapp", "contacted", 1.5], ["site", "meeting", 0.8], ["email", "contacted", 0.4]];
    plan.forEach(([src, st, hoursAgo]) => {
      const l = makeLead(src, { created: new Date(Date.now() - hoursAgo * 3600e3) });
      automate(l, true);
      l.stage = st;
      const base = l.created.getTime() + 3600e3 * Math.min(hoursAgo / 3, 6);
      if (["meeting", "proposal", "won"].includes(st)) { l.events.push({ t: base, text: "הליד קבע פגישה דרך הקישור" }); l.events.push({ t: base + 1000, text: "נשלחה תזכורת אוטומטית יום לפני הפגישה" }); }
      if (["proposal", "won"].includes(st)) l.events.push({ t: base + 7200e3, text: `${l.agent} שלח/ה הצעת מחיר` });
      if (st === "won") l.events.push({ t: base + 3 * 3600e3, text: "העסקה נסגרה. חשבונית נשלחה אוטומטית" });
      leads.push(l);
    });
  })();

  /* ---------- demo stage (on the page) ---------- */
  const miniList = document.getElementById("mini-list");
  const coreSteps = [...stage.querySelectorAll(".core__steps li")];
  const coreMsg = stage.querySelector(".core__msg");
  const orb = stage.querySelector(".core__orb");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stage.querySelectorAll(".src__btn").forEach((btn) => {
    const s = SOURCES[btn.dataset.src];
    btn.style.setProperty("--c", s.color);
    btn.querySelector(".src__icon").innerHTML = ICONS[btn.dataset.src];
    btn.addEventListener("click", () => fire(btn.dataset.src, btn));
  });

  const tryForm = document.getElementById("try-form");
  tryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = tryForm.querySelector("input");
    const name = input.value.trim().slice(0, 24);
    if (!name) { input.focus(); return; }
    fire("site", tryForm.querySelector("button"), { name, isYou: true, score: 97 });
    input.value = "";
  });

  function center(el) {
    const a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
    return [a.left - b.left + a.width / 2, a.top - b.top + a.height / 2];
  }

  function fly(from, to, color, ms) {
    if (reduce) return Promise.resolve();
    const p = document.createElement("span");
    p.className = "packet";
    p.style.setProperty("--c", color);
    stage.appendChild(p);
    const [x1, y1] = center(from), [x2, y2] = center(to);
    const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 40;
    const anim = p.animate([
      { transform: `translate(${x1}px, ${y1}px) scale(0.4)`, opacity: 0 },
      { transform: `translate(${mx}px, ${my}px) scale(1.15)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${x2}px, ${y2}px) scale(0.6)`, opacity: 0.9 },
    ], { duration: ms, easing: "cubic-bezier(.5,0,.3,1)" });
    return anim.finished.then(() => p.remove());
  }

  async function fire(src, fromEl, opts = {}) {
    const lead = makeLead(src, opts);
    const color = SOURCES[src].color;
    fromEl.classList.add("is-pulse");
    setTimeout(() => fromEl.classList.remove("is-pulse"), 500);
    await fly(fromEl, orb, color, 700);
    orb.classList.remove("is-hit"); void orb.offsetWidth; orb.classList.add("is-hit");
    coreSteps.forEach((li) => li.classList.remove("on"));
    coreMsg.hidden = true;
    lead.created = new Date();
    lead.fresh = true;
    leads.push(lead);
    automate(lead, false, (i) => {
      const map = [0, 1, 2, 3];
      if (map[i] !== undefined && coreSteps[map[i]]) coreSteps[map[i]].classList.add("on");
      if (i === 2) fly(orb, miniList, color, 650);
      if (i === 3 && autoOn("reply")) {
        coreMsg.querySelector(".core__msg-to").textContent = `נשלח ל${lead.name} בוואטסאפ`;
        coreMsg.querySelector("p").textContent = waText(lead);
        coreMsg.hidden = false;
      }
      if (i === 3 && crmOpen) toast(`ליד חדש מ${SOURCES[src].name}: ${lead.name}`);
    });
    setTimeout(() => { lead.fresh = false; }, 6000);
  }

  // fire two sample leads the first time the demo scrolls into view
  let autoplayed = false;
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting || autoplayed) return;
    autoplayed = true; obs.disconnect();
    const btns = stage.querySelectorAll(".src__btn");
    setTimeout(() => fire("whatsapp", btns[0]), 700);
    setTimeout(() => fire("facebook", btns[2]), 4200);
  }, { threshold: 0.45 }).observe(stage);

  function renderMini() {
    const last = [...leads].sort((a, b) => b.created - a.created).slice(0, 5);
    miniList.innerHTML = last.map((l) => `
      <li class="${l.fresh ? "is-new" : ""}">
        <span class="ico" style="--c:${SOURCES[l.src].color}">${ICONS[l.src]}</span>
        <span class="mini__who"><b>${esc(l.name)}${l.isYou ? ' <em class="you">זה אתם</em>' : ""}</b><small>${esc(l.interest)}</small></span>
        <span class="mini__meta"><span class="pill pill--${l.stage}">${STAGES.find((s) => s.id === l.stage).name}</span><small>${ago(l.created)}</small></span>
      </li>`).join("");
  }

  /* ---------- CRM app ---------- */
  const crm = document.getElementById("crm");
  const board = document.getElementById("board");
  const drawer = document.getElementById("drawer");
  const search = document.getElementById("crm-search");
  const toastEl = document.getElementById("crm-toast");
  let crmOpen = false;
  let view = "board";
  let openId = null;
  let simTimer = null;
  let lastFocus = null;

  document.getElementById("crm-open").addEventListener("click", openCRM);
  document.getElementById("crm-close").addEventListener("click", closeCRM);
  document.getElementById("crm-sim").addEventListener("click", () => simulate(true));
  search.addEventListener("input", renderBoard);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !crmOpen) return;
    if (!drawer.hidden) closeDrawer(); else closeCRM();
  });
  crm.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  function openCRM() {
    lastFocus = document.activeElement;
    crm.hidden = false;
    crmOpen = true;
    document.body.classList.add("crm-lock");
    window.__lenis && window.__lenis.stop();
    renderAll();
    requestAnimationFrame(() => crm.classList.add("is-open"));
    document.getElementById("crm-close").focus();
    // on narrow screens start the board at the first column that has leads
    const firstFull = [...board.querySelectorAll(".col")].find((c) => c.querySelector(".lcard"));
    if (firstFull && window.innerWidth < 900) board.parentElement.scrollLeft = firstFull.offsetLeft - board.parentElement.offsetWidth + firstFull.offsetWidth + 14;
    simTimer = setInterval(() => simulate(false), 11000);
  }
  function closeCRM() {
    crm.classList.remove("is-open");
    crmOpen = false;
    clearInterval(simTimer);
    closeDrawer();
    document.body.classList.remove("crm-lock");
    window.__lenis && window.__lenis.start();
    setTimeout(() => { if (!crmOpen) crm.hidden = true; }, 350);
    lastFocus && lastFocus.focus();
  }
  function simulate(fromButton) {
    const src = rnd(Object.keys(SOURCES));
    const l = makeLead(src);
    l.fresh = true;
    leads.push(l);
    automate(l, false);
    toast(`${fromButton ? "נוסף" : "נכנס"} ליד חדש מ${SOURCES[src].name}: ${l.name}`);
    renderAll();
    setTimeout(() => { l.fresh = false; renderAll(); }, 6000);
  }
  function setView(v) {
    view = v;
    crm.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-active", b.dataset.view === v));
    ["board", "auto", "reports"].forEach((id) => (document.getElementById("view-" + id).hidden = id !== v));
    document.getElementById("crm-title").textContent = { board: "לוח לידים", auto: "אוטומציות", reports: "דוחות" }[v];
    search.hidden = v !== "board";
    renderAll();
  }

  let toastT;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    toastEl.classList.remove("is-in"); void toastEl.offsetWidth; toastEl.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(() => (toastEl.hidden = true), 3200);
  }

  function renderKPIs() {
    const today = leads.filter((l) => Date.now() - l.created < 86400e3).length;
    const meetings = leads.filter((l) => ["meeting", "proposal", "won"].includes(l.stage)).length;
    const won = leads.filter((l) => l.stage === "won").length;
    document.getElementById("crm-kpis").innerHTML = [
      ["לידים ב־24 שעות", today],
      ["זמן תגובה ממוצע", "2.8 שנ׳"],
      ["פגישות שנקבעו", meetings],
      ["עסקאות שנסגרו", won],
    ].map(([k, v]) => `<div class="kpi"><small>${k}</small><b>${v}</b></div>`).join("");
  }

  function card(l) {
    return `<button class="lcard ${l.fresh ? "is-new" : ""} ${l.isYou ? "is-you" : ""}" draggable="true" data-id="${l.id}">
      <span class="lcard__top"><span class="ico" style="--c:${SOURCES[l.src].color}">${ICONS[l.src]}</span><b>${esc(l.name)}</b><span class="score ${l.score >= 80 ? "hot" : ""}">${l.score}</span></span>
      <span class="lcard__int">${esc(l.interest)}</span>
      <span class="lcard__foot"><span>${l.agent}</span><span>${ago(l.created)}</span></span>
    </button>`;
  }

  function renderBoard() {
    const q = search.value.trim();
    const list = leads.filter((l) => !q || [l.name, l.phone, l.interest, SOURCES[l.src].name].some((f) => f.includes(q)));
    board.innerHTML = STAGES.map((s) => {
      const items = list.filter((l) => l.stage === s.id).sort((a, b) => b.created - a.created);
      return `<section class="col" data-stage="${s.id}">
        <header><span class="pill pill--${s.id}">${s.name}</span><span class="count">${items.length}</span></header>
        <div class="col__body">${items.map(card).join("") || '<p class="col__empty">גררו לכאן ליד</p>'}</div>
      </section>`;
    }).join("");
  }

  // drag and drop between stages
  board.addEventListener("dragstart", (e) => {
    const c = e.target.closest(".lcard"); if (!c) return;
    e.dataTransfer.setData("text/plain", c.dataset.id);
    c.classList.add("is-drag");
  });
  board.addEventListener("dragend", (e) => e.target.closest(".lcard")?.classList.remove("is-drag"));
  board.addEventListener("dragover", (e) => {
    const col = e.target.closest(".col"); if (!col) return;
    e.preventDefault();
    board.querySelectorAll(".col").forEach((c) => c.classList.toggle("is-over", c === col));
  });
  board.addEventListener("dragleave", (e) => { if (!board.contains(e.relatedTarget)) board.querySelectorAll(".col").forEach((c) => c.classList.remove("is-over")); });
  board.addEventListener("drop", (e) => {
    const col = e.target.closest(".col"); if (!col) return;
    e.preventDefault();
    moveLead(Number(e.dataTransfer.getData("text/plain")), col.dataset.stage);
  });
  board.addEventListener("click", (e) => {
    const c = e.target.closest(".lcard");
    if (c) openDrawer(Number(c.dataset.id));
  });

  function moveLead(id, stageId) {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stageId) { renderBoard(); return; }
    l.stage = stageId;
    const now = Date.now();
    l.events.push({ t: now, text: `הועבר לשלב "${STAGES.find((s) => s.id === stageId).name}"` });
    if (stageId === "meeting" && autoOn("remind")) { l.events.push({ t: now + 300, text: "תוזמנה תזכורת וואטסאפ אוטומטית יום לפני הפגישה" }); toast("האוטומציה תזמנה תזכורת לפגישה"); }
    if (stageId === "won" && autoOn("invoice")) { l.events.push({ t: now + 300, text: "חשבונית הופקה בחשבונית ירוקה ונשלחה ללקוח" }); toast("האוטומציה הפיקה ושלחה חשבונית"); }
    renderAll();
  }

  function openDrawer(id) {
    openId = id;
    drawer.hidden = false;
    renderDrawer();
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    drawer.querySelector(".drawer__close").focus();
  }
  function closeDrawer() {
    openId = null;
    drawer.classList.remove("is-open");
    setTimeout(() => { if (openId === null) drawer.hidden = true; }, 300);
  }

  function renderDrawer() {
    const l = leads.find((x) => x.id === openId);
    if (!l) return;
    const s = SOURCES[l.src];
    const hot = l.score >= 80;
    const msg = [...l.events].reverse().find((e) => e.msg);
    drawer.innerHTML = `
      <header class="drawer__head">
        <span class="avatar" style="--c:${s.color}">${esc(l.name.trim().charAt(0))}</span>
        <div><h4>${esc(l.name)}${l.isYou ? ' <em class="you">זה אתם</em>' : ""}</h4><small>${esc(l.interest)}</small></div>
        <button class="drawer__close" aria-label="סגירת כרטיס הליד">×</button>
      </header>
      <div class="drawer__body">
        <div class="drawer__actions">
          <button data-act="call">התקשרות</button><button data-act="wa">וואטסאפ</button><button data-act="mail">מייל</button>
        </div>
        <dl class="facts">
          <div><dt>טלפון</dt><dd dir="ltr">${l.phone}</dd></div>
          <div><dt>מייל</dt><dd dir="ltr">${esc(l.email)}</dd></div>
          <div><dt>מקור</dt><dd><span class="ico ico--sm" style="--c:${s.color}">${ICONS[l.src]}</span>${s.channel}</dd></div>
          <div><dt>נציג</dt><dd>${l.agent}</dd></div>
          <div><dt>שלב</dt><dd><select id="stage-select" aria-label="שלב">${STAGES.map((st) => `<option value="${st.id}" ${st.id === l.stage ? "selected" : ""}>${st.name}</option>`).join("")}</select></dd></div>
        </dl>
        <div class="ai">
          <span class="ai__label">סיכום AI</span>
          <p>פנייה דרך ${s.name}, בנושא ${esc(l.interest)}. ציון ${l.score} מתוך 100. ${hot ? "סבירות גבוהה לסגירה, כדאי לחזור עוד היום." : "כדאי לשלוח תזכורת אם לא תהיה תשובה תוך יומיים."}</p>
        </div>
        ${msg ? `<div class="wa"><span class="wa__label">ההודעה שהאוטומציה שלחה</span><p class="wa__bubble">${esc(msg.msg)}<small>${hhmmss(new Date(msg.t))} ✓✓</small></p></div>` : ""}
        <div class="timeline">
          <span class="ai__label">מה קרה עם הליד</span>
          <ol>${[...l.events].sort((a, b) => a.t - b.t).map((e) => `<li><time>${hhmmss(new Date(e.t))}</time><span>${esc(e.text)}</span></li>`).join("")}</ol>
        </div>
      </div>`;
    drawer.querySelector(".drawer__close").addEventListener("click", closeDrawer);
    drawer.querySelector("#stage-select").addEventListener("change", (e) => moveLead(l.id, e.target.value));
    drawer.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => toast("זו הדגמה, אז הכפתור לא באמת מתקשר או שולח")));
  }

  function renderAuto() {
    const counts = {
      reply: leads.filter((l) => l.events.some((e) => e.msg)).length,
      score: leads.filter((l) => l.events.some((e) => e.text.startsWith("AI"))).length,
      alert: leads.filter((l) => l.events.some((e) => e.text.startsWith("התראה"))).length,
      remind: leads.filter((l) => l.events.some((e) => e.text.includes("תזכורת"))).length,
      invoice: leads.filter((l) => l.events.some((e) => e.text.includes("חשבונית"))).length,
      followup: 3,
    };
    const el = document.getElementById("view-auto");
    el.innerHTML = `<p class="view__intro">כל שורה היא תהליך שרץ לבד ברקע. נסו לכבות את "הודעת וואטסאפ אישית" ולהוסיף ליד חדש.</p>
      <div class="autos">${AUTOMATIONS.map((a) => `
        <div class="auto ${a.on ? "" : "is-off"}">
          <div class="auto__text"><b>${a.title}</b><small>${a.desc}</small></div>
          <span class="auto__runs"><b>${counts[a.id]}</b><small>הפעלות</small></span>
          <label class="switch"><input type="checkbox" data-auto="${a.id}" ${a.on ? "checked" : ""} aria-label="${a.title}"><span></span></label>
        </div>`).join("")}</div>`;
    el.querySelectorAll("[data-auto]").forEach((cb) => cb.addEventListener("change", () => {
      AUTOMATIONS.find((a) => a.id === cb.dataset.auto).on = cb.checked;
      toast(cb.checked ? "האוטומציה הופעלה" : "האוטומציה כובתה");
      renderAuto();
    }));
  }

  function renderReports() {
    const bySrc = Object.keys(SOURCES).map((k) => [k, leads.filter((l) => l.src === k).length]);
    const max = Math.max(1, ...bySrc.map(([, n]) => n));
    const total = leads.length;
    const won = leads.filter((l) => l.stage === "won").length;
    document.getElementById("view-reports").innerHTML = `
      <div class="reports">
        <div class="rcard rcard--wide">
          <h5>לידים לפי מקור</h5>
          <div class="hbars">${bySrc.map(([k, n]) => `
            <div class="hbar"><span class="hbar__name"><span class="ico ico--sm" style="--c:${SOURCES[k].color}">${ICONS[k]}</span>${SOURCES[k].name}</span>
            <span class="hbar__track"><span style="width:${(n / max) * 100}%;background:${SOURCES[k].color}"></span></span><b>${n}</b></div>`).join("")}</div>
        </div>
        <div class="rcard"><h5>זמן תגובה ללידים</h5><p class="big">2.8 <small>שניות</small></p><p class="was">לפני האוטומציה: 4 שעות בממוצע</p></div>
        <div class="rcard"><h5>יחס סגירה</h5><p class="big">${Math.round((won / total) * 100)}<small>%</small></p><p class="was">${won} עסקאות מתוך ${total} לידים</p></div>
      </div>`;
  }

  function renderAll() {
    renderMini();
    if (!crmOpen) return;
    renderKPIs();
    if (view === "board") renderBoard();
    if (view === "auto") renderAuto();
    if (view === "reports") renderReports();
    if (openId !== null) renderDrawer();
  }

  renderMini();
  setInterval(renderMini, 30000);
})();
