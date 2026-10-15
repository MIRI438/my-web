/* Live demo: a customer reaches out, the system works through four steps
   on its own, and the customer card fills itself. Mostly visual, little text.
   All data is invented. */
(() => {
  "use strict";

  const stageEl = document.getElementById("demo-stage");
  if (!stageEl) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = (ms) => (reduce ? Math.min(ms, 150) : ms);

  const ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" class="fill"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2s-1 .3-3.3-.7a11.4 11.4 0 01-4.4-3.9 5 5 0 01-1-2.7 2.9 2.9 0 01.9-2.2.9.9 0 01.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6a8.6 8.6 0 001.6 2 7.8 7.8 0 002.3 1.4c.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3a2.4 2.4 0 01-.1 1.2z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><path d="M3 5.5h18v13H3z"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" class="fill"><path d="M13.5 22v-8h2.8l.5-3.4h-3.3V8.5c0-1 .3-1.6 1.7-1.6H17V3.9a22 22 0 00-2.6-.1c-2.6 0-4.3 1.6-4.3 4.4v2.4H7.3V14h2.8v8z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="0.6"/></svg>',
    site: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>',
    phone: '<svg viewBox="0 0 24 24" class="fill"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1z"/></svg>',
  };
  const SOURCES = {
    whatsapp: { name: "וואטסאפ", color: "#1fa855", msg: "היי, כמה עולה השירות?", topic: "מחירים" },
    email: { name: "מייל", color: "#d93025", msg: "אשמח להצעת מחיר", topic: "הצעת מחיר" },
    facebook: { name: "פייסבוק", color: "#1877f2", msg: "השאיר/ה פרטים במודעה", topic: "מודעת פייסבוק" },
    instagram: { name: "אינסטגרם", color: "#c13584", msg: "יש מקום השבוע?", topic: "זמינות" },
    site: { name: "אתר", color: "#2a3bff", msg: "מילא/ה טופס באתר", topic: "שיחת ייעוץ" },
    phone: { name: "שיחה", color: "#5b6170", msg: "שיחה שלא נענתה", topic: "חזרה טלפונית" },
  };
  const STAGES = [["new", "חדש"], ["contacted", "ענינו"], ["meeting", "פגישה"], ["proposal", "הצעה"], ["won", "לקוח"]];
  const PEOPLE = ["דנה כהן", "יוסי לוי", "מיכל אברהם", "אורי פרץ", "נועה מזרחי", "איתי ביטון", "שירה גולן", "עומר דהן", "רוני שפירא", "תמר אזולאי"];
  const AGENTS = ["שני", "אבי", "רותם"];
  const AV = ["#2a3bff", "#0f766e", "#b45309", "#7c3aed", "#be185d", "#0369a1"];

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hm = (t) => new Date(t).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const first = (n) => n.trim().split(" ")[0];
  const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  const phoneNo = () => `05${rnd([0, 2, 3, 4, 8])}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;

  const inbox = document.getElementById("inbox");
  const card = document.getElementById("lead-card");
  const chatEl = document.getElementById("phone-chat");
  const lane = [...document.querySelectorAll("#lane li")];
  const result = document.getElementById("lane-result");
  const srcScreen = document.getElementById("phone-src");
  const phoneCap = stageEl.querySelector(".fx-col--phone .fx-cap");
  let lead = null;
  let running = false;
  let lastName = "";
  let guide = false;

  /* ---------- source buttons: big icons ---------- */
  inbox.innerHTML = Object.entries(SOURCES).map(([k, s]) => `
    <button type="button" class="src" data-src="${k}" style="--c:${s.color}" aria-label="לקוח פונה ב${s.name}">
      <span class="src__ic">${ICONS[k]}</span><span class="src__name">${s.name}</span>
    </button>`).join("");
  inbox.addEventListener("click", (e) => {
    const b = e.target.closest(".src");
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

  // on phones, bring the active station into view
  function show(el) {
    if (!guide || window.innerWidth >= 900 || !el) return;
    const r = el.getBoundingClientRect();
    if (r.top > 60 && r.bottom < window.innerHeight - 20) return;
    const y = window.scrollY + r.top - Math.max(70, (window.innerHeight - r.height) / 2);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 0.8 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }

  /* ---------- run ---------- */
  function fire(src, opts = {}) {
    if (running) return;
    running = true;
    stageEl.classList.remove("is-done");
    inbox.querySelectorAll(".src").forEach((b) => b.classList.toggle("is-on", b.dataset.src === src));
    inbox.classList.add("is-busy");
    let name = opts.name;
    if (!name) { do { name = rnd(PEOPLE); } while (name === lastName); }
    lastName = name;
    lead = {
      name, src, isYou: !!opts.isYou,
      score: opts.score ?? Math.floor(62 + Math.random() * 36),
      phone: phoneNo(), agent: rnd(AGENTS), color: rnd(AV),
      stage: 0, done: {}, just: new Set(), chat: [], typing: false,
    };
    // every channel first plays its own little scene on the customer's phone
    const D = src === "whatsapp" ? 1300 : 3100;
    lead.screen = src === "whatsapp" ? "chat" : "source";
    if (src === "whatsapp") {
      lead.meTyping = true;
      setTimeout(() => { lead.meTyping = false; lead.chat.push({ who: "me", text: SOURCES[src].msg, t: Date.now() }); renderPhone(); }, T(900));
    } else {
      lead.chat.push({ who: "note", text: src === "phone" ? "שיחה שלא נענתה" : `פנייה דרך ${SOURCES[src].name}`, t: Date.now() });
    }
    phoneCap.textContent = `הלקוח פונה ב${SOURCES[src].name}`;
    lane.forEach((li) => li.className = "");
    result.classList.remove("on");
    stageEl.classList.add("is-running");
    stageEl.dataset.step = "0";
    render();
    show(stageEl.querySelector(".fx-col--phone"));

    const step = (k, ms, fn) => setTimeout(() => {
      lane.forEach((li) => li.classList.toggle("now", li.dataset.k === k));
      setTimeout(() => {
        fn();
        lead.done[k] = true; lead.just.add(k);
        const li = lane.find((x) => x.dataset.k === k);
        li.classList.remove("now"); li.classList.add("ok");
        render();
      }, T(650));
    }, T(ms));

    step("card", D, () => show(card));
    step("score", D + 1400, () => {});
    step("reply", D + 2800, () => {
      lead.chat.push({ who: "biz", text: `היי ${first(lead.name)}, תודה שפנית! אפשר לקבוע שיחה קצרה כאן:`, link: true, t: Date.now() });
      lead.stage = 1; lead.just.add("stage");
      show(stageEl.querySelector(".phone"));
    });
    setTimeout(() => { lead.screen = "chat"; lead.typing = true; renderPhone(); show(stageEl.querySelector(".phone")); }, T(D + 2800));
    setTimeout(() => { lead.typing = false; }, T(D + 3440));
    step("assign", D + 4200, () => show(card));
    setTimeout(() => {
      running = false;
      inbox.classList.remove("is-busy");
      stageEl.classList.remove("is-running");
      stageEl.classList.add("is-done");
      result.classList.add("on");
      guide = false;
      phoneCap.textContent = "הלקוח";
      render();
    }, T(D + 5400));
  }

  /* ---------- stage clicks: more automations ---------- */
  function setStage(i) {
    if (!lead || running || lead.stage === i) return;
    lead.stage = i; lead.just.add("stage");
    stageEl.classList.remove("is-done");
    if (STAGES[i][0] === "meeting") lead.chat.push({ who: "biz", text: "הפגישה נקבעה לחמישי ב-10:00. נשלח תזכורת יום לפני.", t: Date.now() });
    if (STAGES[i][0] === "proposal") lead.chat.push({ who: "biz", text: "הצעת המחיר מחכה לך כאן:", file: "proposal.pdf", t: Date.now() });
    if (STAGES[i][0] === "won") lead.chat.push({ who: "biz", text: "תודה שבחרת בנו! החשבונית מצורפת.", file: "invoice.pdf", t: Date.now() });
    render();
    const ph = stageEl.querySelector(".phone");
    ph.classList.remove("ping"); void ph.offsetWidth; ph.classList.add("ping");
  }

  /* ---------- render ---------- */
  function gauge(score, on) {
    const len = 125.6;
    return `<svg viewBox="0 0 100 56" class="gauge" aria-hidden="true">
      <path d="M10 50 A40 40 0 0 1 90 50" class="gauge__bg"/>
      <path d="M10 50 A40 40 0 0 1 90 50" class="gauge__fg ${score >= 80 ? "hot" : ""}" style="stroke-dasharray:${on ? (score / 100) * len : 0} ${len};opacity:${on ? 1 : 0}"/>
    </svg>`;
  }

  function renderCard() {
    if (!lead) {
      card.innerHTML = `<div class="lc-empty"><span class="lc-empty__ic">${'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.2c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14.5 10h4M14.5 13.2h3"/></svg>'}</span>כאן ייפתח כרטיס הלקוח</div>`;
      return;
    }
    const l = lead, s = SOURCES[l.src], d = l.done, j = l.just;
    const sk = (cls = "") => `<i class="sk ${cls}"></i>`;
    card.innerHTML = `
      <div class="lc-top">
        <span class="av ${d.card ? "" : "is-empty"} ${j.has("card") ? "just" : ""}" style="--av:${l.color}">${d.card ? esc(initials(l.name)) : ""}</span>
        <div class="lc-id">
          <h4 class="${j.has("card") ? "just" : ""}">${d.card ? esc(l.name) + (l.isYou ? ' <em class="you">אתם</em>' : "") : sk("sk--lg")}</h4>
          <p dir="ltr" class="${j.has("card") ? "just" : ""}">${d.card ? l.phone : sk()}</p>
        </div>
        <div class="lc-score ${j.has("score") ? "just" : ""}">
          ${gauge(l.score, d.score)}
          <b>${d.score ? l.score : ""}</b>
          <span>${d.score ? (l.score >= 80 ? "חם" : "רגיל") : "ציון"}</span>
        </div>
      </div>
      <div class="lc-msg ${j.has("card") ? "just" : ""}">
        <span class="lc-src" style="--c:${s.color}">${ICONS[l.src]}</span>
        ${d.card ? `<p>${esc(s.msg)}</p>` : sk("sk--wide")}
      </div>
      <ol class="lc-steps" aria-label="שלב">
        ${STAGES.map(([, n], i) => `<li><button type="button" data-i="${i}" class="${i < l.stage ? "past" : ""} ${i === l.stage ? "now" : ""} ${i === l.stage && j.has("stage") ? "just" : ""}" ${running ? "disabled" : ""}><i></i>${n}</button></li>`).join("")}
      </ol>
      <div class="lc-hint" aria-hidden="true">לחצו על "לקוח" ותראו מה הלקוח מקבל<span class="hand"></span></div>
      <div class="lc-agent ${j.has("assign") ? "just" : ""}">
        ${d.assign ? `<span class="av av--sm">${l.agent[0]}</span><span>אצל <b>${l.agent}</b>${l.score >= 80 ? " · קיבל/ה התראה" : ""}</span>` : `<span class="av av--sm is-empty"></span>${sk("sk--sm")}`}
      </div>
`;
    card.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => setStage(Number(b.dataset.i))));
    l.just.clear();
  }

  /* the channel's own screen on the customer's phone */
  function sourceScene(l) {
    const n = esc(l.name), ph = l.phone, f = esc(first(l.name));
    const typed = (txt, delay, dur = 0.9, ltr = false) => `<span class="field"><span class="typed${ltr ? " ltr" : ""}" style="--d:${delay}s;--t:${dur}s"${ltr ? ' dir="ltr"' : ""}>${txt}</span></span>`;
    switch (l.src) {
      case "facebook": return `
        <div class="ps ps-fb">
          <div class="ps-bar fb"><b>facebook</b></div>
          <div class="fb-post"><span class="fb-pg"><i></i><span><b>העסק שלכם</b><small>ממומן</small></span></span><div class="fb-img"><b>20% הנחה</b><span>מבצע סתיו</span></div></div>
          <div class="fb-form">
            <p>השאירו פרטים ונחזור אליכם</p>
            <label>שם מלא${typed(n, 0.5)}</label>
            <label>טלפון${typed(ph, 1.4, 0.8, true)}</label>
            <span class="tap fb-btn" style="--d:2.3s">שליחה</span>
            <span class="sent" style="--d:2.6s">✓ הפרטים נשלחו</span>
          </div>
        </div>`;
      case "email": return `
        <div class="ps ps-mail">
          <div class="ps-bar mail"><b>הודעה חדשה</b><span class="tap mail-send" style="--d:2.3s">שליחה</span></div>
          <div class="mail-row"><small>אל</small><span dir="ltr">hello@your-business.co.il</span></div>
          <div class="mail-row"><small>נושא</small>${typed("בקשה להצעת מחיר", 0.3, 0.6)}</div>
          <div class="mail-body">${typed(`שלום, אשמח לקבל הצעת מחיר לחבילה החודשית. תודה, ${f}`, 1, 1.2)}</div>
          <span class="sent sent--toast" style="--d:2.6s">✓ ההודעה נשלחה</span>
        </div>`;
      case "instagram": return `
        <div class="ps ps-ig">
          <div class="ps-bar ig"><i></i><b>your.business</b></div>
          <div class="ig-story"><span>סטורי</span><b>יש מקום השבוע!</b></div>
          <div class="ig-chat">
            <div class="ig-typing" style="--d:0.4s"><i></i><i></i><i></i></div>
            <div class="ig-msg" style="--d:1.6s">ראיתי את הסטורי, יש מקום השבוע?</div>
            <small class="ig-seen" style="--d:2.4s">נשלח</small>
          </div>
        </div>`;
      case "site": return `
        <div class="ps ps-web">
          <div class="ps-bar web"><span dir="ltr">your-business.co.il</span></div>
          <div class="web-hero"><b>העסק שלכם</b><span>נשמח לעזור</span></div>
          <div class="web-form">
            <label>שם${typed(n, 0.4)}</label>
            <label>טלפון${typed(ph, 1.2, 0.8, true)}</label>
            <label>במה נוכל לעזור?${typed("שיחת ייעוץ", 1.9, 0.5)}</label>
            <span class="tap web-btn" style="--d:2.4s">שליחה</span>
            <span class="sent" style="--d:2.7s">✓ תודה! נחזור אליכם</span>
          </div>
        </div>`;
      case "phone": return `
        <div class="ps ps-call">
          <small>מתקשר/ת…</small>
          <b>העסק שלכם</b>
          <span class="call-ring"><i></i><i></i><i></i></span>
          <span class="call-miss" style="--d:2.1s">אין מענה · השיחה לא נענתה</span>
          <span class="call-btn" aria-hidden="true"></span>
        </div>`;
    }
    return "";
  }

  let srcKey = "";
  function renderPhone() {
    const st = document.getElementById("phone-status");
    const key = lead && lead.screen === "source" ? `src-${lead.name}-${lead.src}` : "";
    if (key !== srcKey) {
      if (key) {
        srcScreen.innerHTML = sourceScene(lead);
        srcScreen.hidden = false;
        srcScreen.classList.remove("out");
      } else if (srcKey) {
        srcScreen.classList.add("out");
        setTimeout(() => { if (!srcKey) srcScreen.hidden = true; }, 450);
      }
      srcKey = key;
    }
    if (!lead) {
      st.textContent = "מקוון";
      chatEl.innerHTML = '<p class="b-note">כאן תופיע התשובה שהלקוח מקבל</p>';
      return;
    }
    st.textContent = lead.typing ? "מקליד…" : "מקוון";
    chatEl.innerHTML = lead.chat.map((m) => {
      if (m.who === "note") return `<p class="b-note">${esc(m.text)}</p>`;
      return `<div class="b b-${m.who}">${esc(m.text)}${m.link ? '<span class="b-link" dir="ltr">cal.link/meet</span>' : ""}${m.file ? `<span class="b-file" dir="ltr">${esc(m.file)}</span>` : ""}<time>${hm(m.t)}</time></div>`;
    }).join("") + (lead.typing ? '<div class="b b-biz b-typing"><i></i><i></i><i></i></div>' : "") + (lead.meTyping ? '<div class="b b-me b-typing"><i></i><i></i><i></i></div>' : "");
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function render() { renderCard(); renderPhone(); }
  render();

  // play one example the first time the demo scrolls into view
  let played = false;
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting || played) return;
    played = true; obs.disconnect();
    setTimeout(() => fire("whatsapp"), 800);
  }, { threshold: 0.15 }).observe(stageEl);
})();
