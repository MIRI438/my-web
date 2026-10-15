(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- hero: tick off the manual tasks ---------- */
  const items = [...document.querySelectorAll(".todo__list li")];
  const runBtn = document.getElementById("run");
  const savedEl = document.getElementById("saved-h");
  const hours = (min) => (Math.round((min / 60) * 10) / 10).toLocaleString("he-IL");
  let timers = [];
  let done = false;

  const setSaved = () => {
    const min = items.filter((li) => li.classList.contains("is-done"))
      .reduce((sum, li) => sum + Number(li.dataset.min), 0);
    savedEl.textContent = hours(min);
  };

  runBtn.addEventListener("click", () => {
    timers.forEach(clearTimeout);
    timers = [];
    if (done) {
      items.forEach((li) => li.classList.remove("is-done"));
      setSaved();
      runBtn.textContent = "להפעיל אוטומציה";
      done = false;
      return;
    }
    done = true;
    runBtn.disabled = true;
    const gap = reduceMotion ? 0 : 420;
    items.forEach((li, i) => {
      timers.push(setTimeout(() => {
        li.classList.add("is-done");
        setSaved();
        if (i === items.length - 1) {
          runBtn.disabled = false;
          runBtn.textContent = "להתחיל מחדש";
        }
      }, i * gap));
    });
  });

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
    if (!ok) { status.textContent = "צריך למלא שם וטלפון כדי שנוכל לחזור אליכם."; return; }

    // TODO: send to a real endpoint (Make/n8n webhook, Formspree, CRM)
    status.textContent = "קיבלנו. נחזור אליכם תוך יום עסקים.";
    form.reset();
  });
})();
