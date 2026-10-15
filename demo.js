/* Live demo: a customer contacts the business, and the visitor watches both
   sides at once: the business's lead system and the customer's phone.
   All data is invented. */
(() => {
  "use strict";

  const stageEl = document.getElementById("demo-stage");
  if (!stageEl) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = (ms) => (reduce ? Math.min(ms, 200) : ms);

  /* ---------- data ---------- */
  const SOURCES = {
    whatsapp: { name: "וואטסאפ", color: "#1fa855", text: "היי, כמה עולה השירות? אפשר פרטים?", topic: "מחירים" },
    email: { name: "מייל", color: "#d93025", text: "נושא: בקשה להצעת מחיר לחבילה החודשית", topic: "הצעת מחיר" },
    facebook: { name: "פייסבוק", color: "#1877f2", text: "השאיר/ה פרטים בטופס של מודעת הסתיו", topic: "מבצע הסתיו" },
    instagram: { name: "אינסטגרם", color: "#c13584", text: "ראיתי את הסטורי, יש מקום השבוע?", topic: "זמינות השבוע" },
    site: { name: "טופס באתר", color: "#2a3bff", text: "מילא/ה טופס צור קשר: מעוניין/ת בשיחת ייעוץ", topic: "שיחת ייעוץ" },
    phone: { name: "שיחה שלא נענתה", color: "#5b6170", text: "שיחה שלא נענתה, לפני רגע", topic: "חזרה טלפונית" },
  };
  const STAGES = [
    { id: "new", name: "חדש" },
    { id: "contacted", name: "קיבל תשובה" },
    { id: "meeting", name: "נקבעה פגישה" },
    { id: "proposal", name: "הצעת מחיר" },
    { id: "won", name: "לקוח" },
  ];
  const PEOPLE = ["דנה כהן", "יוסי לוי", "מיכל אברהם", "אורי פרץ", "נועה מזרחי", "איתי ביטון", "שירה גולן", "עומר דהן", "רוני שפירא", "תמר אזולאי", "אלון פרידמן", "הדס יוסף", "עידו כץ", "ליאת חדד"];
  const AGENTS = ["שני", "אבי", "רותם"];
  const AUTOMATIONS = [
    { id: "reply", title: "תשובה אוטומטית בוואטסאפ", when: "כשנכנס ליד חדש", on: true },
    { id: "score", title: "ציון AI לכל פנייה", when: "כשנכנס ליד חדש", on: true },
    { id: "alert", title: "התראה לנציג", when: "כשהציון מעל 80", on: true },
    { id: "remind", title: "תזכורת יום לפני", when: "כשנקבעת פגישה", on: true },
    { id: "invoice", title: "חשבונית ללקוח", when: "כשליד הופך ללקוח", on: true },
    { id: "followup", title: "הודעת מעקב", when: "אחרי 48 שעות בלי מענה", on: true },
  ];

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const phone = () => `05${rnd([0, 2, 3, 4, 8])}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  const hm = (t) => new Date(t).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const hms = (t) => new Date(t).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const ago = (t) => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "עכשיו";
    if (s < 3600) return `${Math.round(s / 60)} דק׳`;
    if (s < 86400) return `${Math.round(s / 3600)} שע׳`;
    return `${Math.round(s / 86400)} ימים`;
  };
  const autoOn = (id) => AUTOMATIONS.find((a) => a.id === id).on;
  const first = (n) => n.trim().split(" ")[0];

  let seq = 0;
  const leads = [];
  let selected = null;
  let running = false;

  function makeLead(src, opts = {}) {
    const used = new Set(leads.map((l) => l.name));
    const pool = PEOPLE.filter((n) => !used.has(n));
    const name = opts.name || rnd(pool.length ? pool : PEOPLE);
    return {
      id: ++seq, name, src,
      score: opts.score ?? Math.floor(58 + Math.random() * 40),
      phone: phone(),
      topic: SOURCES[src].topic,
      agent: rnd(AGENTS),
      stage: "new",
      created: opts.created ?? Date.now(),
      log: [],
      chat: [],
      isYou: !!opts.isYou,
    };
  }
  const replyText = (l) => `היי ${first(l.name)}, תודה שפנית! קיבלנו את הפנייה בנושא ${l.topic}. אפשר לבחור מועד לשיחה קצרה כאן:`;

  function customerOpening(l) {
    if (l.src === "whatsapp") l.chat.push({ who: "me", text: SOURCES.whatsapp.text, t: l.created });
    else l.chat.push({ who: "note", text: `פנייה דרך ${SOURCES[l.src].name}`, t: l.created });
  }

  // seed the system with leads from the last two days
  [["facebook", "won", 40], ["site", "proposal", 26], ["whatsapp", "meeting", 9], ["email", "contacted", 5], ["instagram", "contacted", 2.2], ["phone", "contacted", 0.6]].forEach(([src, st, h]) => {
    const l = makeLead(src, { created: Date.now() - h * 3600e3 });
    const t = l.created;
    customerOpening(l);
    l.log.push({ t, text: `פנייה חדשה מ${SOURCES[src].name}` });
    l.log.push({ t: t + 1300, text: `AI נתן ציון ${l.score}` });
    l.log.push({ t: t + 3200, text: "נשלחה תשובה בוואטסאפ" });
    l.chat.push({ who: "biz", text: replyText(l), link: true, t: t + 3200 });
    l.stage = st;
    if (["meeting", "proposal", "won"].includes(st)) {
      l.chat.push({ who: "me", text: "קבעתי לחמישי ב-10:00, תודה!", t: t + 1800e3 });
      l.log.push({ t: t + 1800e3, text: "הלקוח קבע פגישה בעצמו" });
      l.log.push({ t: t + 1800e3 + 2000, text: "תוזמנה תזכורת ליום לפני" });
    }
    if (["proposal", "won"].includes(st)) l.log.push({ t: t + 5 * 3600e3, text: `${l.agent} שלח/ה הצעת מחיר` });
    if (st === "won") {
      l.log.push({ t: t + 9 * 3600e3, text: "הופקה חשבונית ונשלחה ללקוח" });
      l.chat.push({ who: "biz", text: "תודה שבחרת בנו! החשבונית מצורפת.", file: "invoice-1043.pdf", t: t + 9 * 3600e3 });
    }
    leads.push(l);
  });
  selected = leads[leads.length - 1].id;

  /* ---------- elements ---------- */
  const inbox = document.getElementById("inbox");
  const table = document.getElementById("lead-table");
  const detail = document.getElementById("detail");
  const chatEl = document.getElementById("phone-chat");
  const phoneEl = document.querySelector(".phone");
  const narrText = document.getElementById("narr-text");
  const narrSteps = [...document.querySelectorAll(".narr__steps li")];
  const statsEl = document.getElementById("app-stats");
  const screen = document.getElementById("crm");

  /* ---------- incoming messages (the buttons) ---------- */
  inbox.innerHTML = Object.entries(SOURCES).map(([k, s]) => `
    <button type="button" class="msg" data-src="${k}" style="--c:${s.color}">
      <span class="msg__src"><i></i>${s.name}</span>
      <span class="msg__text">${s.text}</span>
    </button>`).join("");
  inbox.addEventListener("click", (e) => {
    const b = e.target.closest(".msg");
    if (b) { guide = true; fire(b.dataset.src); }
  });
  const tryForm = document.getElementById("try-form");
  tryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = tryForm.querySelector("input");
    const name = input.value.trim().slice(0, 24);
    if (!name) { input.focus(); return; }
    guide = true;
    fire("site", { name, isYou: true, score: 96 });
    input.value = "";
  });

  /* ---------- narration + focus ---------- */
  function narrate(step, text) {
    narrText.classList.remove("is-in"); void narrText.offsetWidth;
    narrText.textContent = text;
    narrText.classList.add("is-in");
    narrSteps.forEach((li, i) => li.classList.toggle("on", i < step));
  }
  let guide = false; // scroll to each step on narrow screens, only when the visitor started the run
  function focusOn(el) {
    stageEl.querySelectorAll(".is-focus").forEach((x) => x.classList.remove("is-focus"));
    if (!el) return;
    el.classList.add("is-focus");
    if (!guide || window.innerWidth >= 900 || stageEl.classList.contains("is-full")) return;
    const r = el.getBoundingClientRect();
    if (r.top > 70 && r.bottom < window.innerHeight - 20) return;
    const y = window.scrollY + r.top - Math.max(80, (window.innerHeight - r.height) / 2);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }

  /* ---------- the automation run ---------- */
  function fire(src, opts = {}) {
    if (running) return;
    running = true;
    inbox.classList.add("is-busy");
    if (view !== "leads") setView("leads");
    const l = makeLead(src, opts);
    l.created = Date.now();
    l.fresh = true;
    l.scored = false;
    leads.push(l);
    selected = l.id;
    customerOpening(l);
    l.log.push({ t: Date.now(), text: `פנייה חדשה מ${SOURCES[src].name}` });
    render();
    narrate(1, `${l.isYou ? "הפנייה שלכם" : "פנייה חדשה"} מ${SOURCES[src].name} נכנסה למערכת. אף אחד לא הקליד כלום.`);
    focusOn(table.querySelector(`[data-id="${l.id}"]`));

    const steps = [
      [1400, () => {
        if (autoOn("score")) l.log.push({ t: Date.now(), text: `AI קרא את הפנייה ונתן ציון ${l.score}` });
        l.scored = true;
        render();
        narrate(2, autoOn("score") ? `AI קרא את הפנייה ונתן ציון ${l.score} מתוך 100.${l.score >= 80 ? " ליד חם." : ""}` : "ציון AI כבוי, אז הפנייה לא דורגה.");
        focusOn(table.querySelector(`[data-id="${l.id}"] .c-score`));
      }],
      [2700, () => {
        if (!autoOn("reply")) return;
        l.typing = true; render();
        narrate(3, "המערכת כותבת ללקוח תשובה אישית בוואטסאפ…");
        focusOn(phoneEl);
      }],
      [3600, () => {
        l.typing = false;
        if (autoOn("reply")) {
          l.chat.push({ who: "biz", text: replyText(l), link: true, t: Date.now() });
          l.log.push({ t: Date.now(), text: "נשלחה תשובה בוואטסאפ" });
          l.stage = "contacted";
          narrate(3, `${first(l.name)} קיבל/ה תשובה תוך 4 שניות, עם קישור לקביעת פגישה.`);
        } else {
          narrate(3, "התשובה האוטומטית כבויה, אז הלקוח עדיין מחכה.");
        }
        render();
        focusOn(phoneEl);
      }],
      [5000, () => {
        const alert = l.score >= 80 && autoOn("alert");
        if (alert) l.log.push({ t: Date.now(), text: `נשלחה התראה ל${l.agent} עם כל הפרטים` });
        render();
        narrate(4, alert ? `${l.agent} מהצוות קיבל/ה התראה בטלפון: ליד חם, כדאי להתקשר היום.` : `הליד שויך ל${l.agent}. אין צורך בהתראה, הציון לא מספיק גבוה.`);
        focusOn(detail.querySelector(".d-log"));
      }],
      [6600, () => {
        guide = false;
        l.fresh = false;
        running = false;
        inbox.classList.remove("is-busy");
        render();
        narrate(5, "זהו. הכול קרה לבד. נסו פנייה אחרת, או שנו את שלב הליד במערכת ותראו מה הלקוח מקבל.");
        focusOn(null);
      }],
    ];
    steps.forEach(([ms, fn]) => setTimeout(fn, T(ms)));
  }

  /* ---------- stage changes trigger more automations ---------- */
  function setStage(l, st) {
    if (l.stage === st || running) return;
    l.stage = st;
    const name = STAGES.find((s) => s.id === st).name;
    l.log.push({ t: Date.now(), text: `הועבר ל"${name}"` });
    if (st === "meeting") {
      l.chat.push({ who: "me", text: "קבעתי לחמישי ב-10:00, תודה!", t: Date.now() });
      if (autoOn("remind")) {
        l.log.push({ t: Date.now() + 1, text: "תוזמנה תזכורת ליום לפני" });
        l.chat.push({ who: "biz", text: "מעולה, נתראה בחמישי ב-10:00. נשלח תזכורת יום לפני.", t: Date.now() + 1 });
      }
      narrate(5, autoOn("remind") ? "הפגישה נרשמה, והלקוח קיבל אישור. תזכורת תישלח לבד יום לפני." : "הפגישה נרשמה. התזכורת האוטומטית כבויה.");
    } else if (st === "won") {
      if (autoOn("invoice")) {
        l.log.push({ t: Date.now() + 1, text: "הופקה חשבונית ונשלחה ללקוח" });
        l.chat.push({ who: "biz", text: "תודה שבחרת בנו! החשבונית מצורפת.", file: "invoice-1044.pdf", t: Date.now() + 1 });
      }
      narrate(5, autoOn("invoice") ? "הליד הפך ללקוח. החשבונית הופקה ונשלחה אליו בוואטסאפ, בלי לפתוח את תוכנת הנהלת החשבונות." : "הליד הפך ללקוח. החשבונית האוטומטית כבויה.");
    } else {
      narrate(5, `הליד הועבר לשלב "${name}".`);
    }
    focusOn(phoneEl);
    setTimeout(() => focusOn(null), 1800);
    render();
  }

  /* ---------- views ---------- */
  let view = "leads";
  screen.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  function setView(v) {
    view = v;
    screen.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-active", b.dataset.view === v));
    document.getElementById("view-leads").hidden = v !== "leads";
    document.getElementById("view-auto").hidden = v !== "auto";
    render();
  }

  /* ---------- render ---------- */
  function stageBar(st) {
    const idx = STAGES.findIndex((s) => s.id === st);
    return `<span class="sbar" aria-hidden="true">${STAGES.map((_, i) => `<i class="${i <= idx ? "on" : ""}"></i>`).join("")}</span><span class="sname">${STAGES[idx].name}</span>`;
  }

  function renderTable() {
    const rows = [...leads].sort((a, b) => b.created - a.created);
    table.innerHTML = `
      <div class="tr th"><span>שם</span><span class="c-src">מקור</span><span class="c-topic">נושא</span><span>ציון</span><span>שלב</span><span class="c-time">מתי</span></div>
      ${rows.map((l) => `
      <button type="button" class="tr ${l.id === selected ? "is-sel" : ""} ${l.fresh ? "is-new" : ""}" data-id="${l.id}">
        <span class="c-name">${esc(l.name)}${l.isYou ? '<em class="you">אתם</em>' : ""}</span>
        <span class="c-src"><i style="background:${SOURCES[l.src].color}"></i>${SOURCES[l.src].name}</span>
        <span class="c-topic">${l.topic}</span>
        <span class="c-score">${l.scored === false ? '<span class="pending">…</span>' : `<b class="${l.score >= 80 ? "hot" : ""}">${l.score}</b><span class="meter"><span style="width:${l.score}%"></span></span>`}</span>
        <span class="c-stage">${stageBar(l.stage)}</span>
        <span class="c-time">${ago(l.created)}</span>
      </button>`).join("")}`;
  }

  function renderDetail() {
    const l = leads.find((x) => x.id === selected);
    if (!l) { detail.innerHTML = ""; return; }
    detail.innerHTML = `
      <div class="d-head">
        <h4>${esc(l.name)}</h4>
        <p><span dir="ltr">${l.phone}</span> · ${SOURCES[l.src].name} · ${l.topic}</p>
      </div>
      <div class="d-block">
        <span class="d-label">שלב</span>
        <div class="seg" role="group" aria-label="שינוי שלב">${STAGES.map((s) => `<button type="button" data-stage="${s.id}" class="${s.id === l.stage ? "is-on" : ""}" ${running ? "disabled" : ""}>${s.name}</button>`).join("")}</div>
        <span class="d-hint">נסו להעביר ל"נקבעה פגישה" או ל"לקוח" ותראו מה הלקוח מקבל בטלפון.</span>
      </div>
      <div class="d-block d-log">
        <span class="d-label">מה המערכת עשתה לבד</span>
        <ol>${[...l.log].sort((a, b) => a.t - b.t).map((e) => `<li><time>${hms(e.t)}</time><span>${esc(e.text)}</span></li>`).join("")}</ol>
      </div>
      <div class="d-meta"><span>אחראי/ת: <b>${l.agent}</b></span><span>ציון: <b>${l.scored === false ? "…" : l.score}</b></span></div>`;
    detail.querySelectorAll("[data-stage]").forEach((b) => b.addEventListener("click", () => setStage(l, b.dataset.stage)));
    const ol = detail.querySelector(".d-log ol");
    ol.scrollTop = ol.scrollHeight;
  }

  function renderPhone() {
    const l = leads.find((x) => x.id === selected);
    if (!l) return;
    document.getElementById("phone-status").textContent = l.typing ? "מקליד/ה…" : "מקוון/ת";
    chatEl.innerHTML = l.chat.map((m) => {
      if (m.who === "note") return `<p class="b-note">${esc(m.text)} · ${hm(m.t)}</p>`;
      return `<div class="b b-${m.who}">${esc(m.text)}${m.link ? '<span class="b-link" dir="ltr">cal.link/meet</span>' : ""}${m.file ? `<span class="b-file" dir="ltr">${esc(m.file)}</span>` : ""}<time>${hm(m.t)}</time></div>`;
    }).join("") + (l.typing ? '<div class="b b-biz b-typing"><i></i><i></i><i></i></div>' : "");
    chatEl.scrollTop = chatEl.scrollHeight;
    document.getElementById("phone-who").textContent = `הטלפון של ${l.name}`;
  }

  function renderStats() {
    const today = leads.filter((l) => Date.now() - l.created < 86400e3).length;
    const won = leads.filter((l) => l.stage === "won").length;
    statsEl.innerHTML = `<span><b>${today}</b> לידים היום</span><span><b>4 שנ׳</b> זמן תגובה</span><span><b>${won}</b> לקוחות חדשים</span>`;
  }

  function renderAuto() {
    const count = (fn) => leads.filter(fn).length;
    const runs = {
      reply: count((l) => l.log.some((e) => e.text.includes("תשובה בוואטסאפ"))),
      score: count((l) => l.log.some((e) => e.text.includes("ציון"))),
      alert: count((l) => l.log.some((e) => e.text.includes("התראה"))),
      remind: count((l) => l.log.some((e) => e.text.includes("תזכורת"))),
      invoice: count((l) => l.log.some((e) => e.text.includes("חשבונית"))),
      followup: 2,
    };
    const el = document.getElementById("view-auto");
    el.innerHTML = `<p class="a-intro">כל שורה היא תהליך שרץ לבד ברקע. כבו את "תשובה אוטומטית בוואטסאפ", חזרו ללידים ושלחו פנייה חדשה.</p>
      <div class="a-table">
        <div class="a-row a-th"><span>מתי</span><span>מה קורה</span><span>הפעלות</span><span>פעיל</span></div>
        ${AUTOMATIONS.map((a) => `
        <div class="a-row ${a.on ? "" : "is-off"}">
          <span class="a-when">${a.when}</span>
          <span class="a-what">${a.title}</span>
          <span class="a-runs">${runs[a.id]}</span>
          <label class="switch"><input type="checkbox" data-auto="${a.id}" ${a.on ? "checked" : ""} aria-label="${a.title}"><span></span></label>
        </div>`).join("")}
      </div>`;
    el.querySelectorAll("[data-auto]").forEach((cb) => cb.addEventListener("change", () => {
      AUTOMATIONS.find((a) => a.id === cb.dataset.auto).on = cb.checked;
      renderAuto();
    }));
  }

  function render() {
    renderStats();
    if (view === "leads") { renderTable(); renderDetail(); }
    else renderAuto();
    renderPhone();
  }

  table.addEventListener("click", (e) => {
    const r = e.target.closest(".tr[data-id]");
    if (!r || running) return;
    selected = Number(r.dataset.id);
    render();
  });

  /* ---------- full screen ---------- */
  const fullBtn = document.getElementById("crm-full");
  fullBtn.addEventListener("click", () => toggleFull());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && stageEl.classList.contains("is-full")) toggleFull(false); });
  function toggleFull(force) {
    const on = force ?? !stageEl.classList.contains("is-full");
    stageEl.classList.toggle("is-full", on);
    document.body.classList.toggle("crm-lock", on);
    fullBtn.textContent = on ? "יציאה ממסך מלא" : "מסך מלא";
    if (window.__lenis) on ? window.__lenis.stop() : window.__lenis.start();
  }

  render();
  narrate(0, "בחרו למעלה איך הלקוח פונה, ותראו מה קורה בשני הצדדים.");

  // run one example automatically the first time the demo is on screen
  let played = false;
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting || played) return;
    played = true; obs.disconnect();
    setTimeout(() => { guide = false; fire("whatsapp"); }, 900);
  }, { threshold: 0.35 }).observe(stageEl);
  setInterval(() => { if (!running && view === "leads") renderTable(); }, 30000);
})();
