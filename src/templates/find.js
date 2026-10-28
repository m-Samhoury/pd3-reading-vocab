/* "Find ord" in the top bar: a search bar that slides open under it on every page, so the page you're on stays put.
   Searches the study sheet's words and Guidet læring's deck (PD3.raw.coach, embedded by render.py); the same
   matching as the finder inside assisted-learning.html (forms, stems, abbreviations, English, close spellings). */
(() => {
  const nav = document.querySelector('.nav a[href$="#find"]');
  if (!nav || document.getElementById("findbar")) return;
  const { el } = PD3;
  const coach = PD3.raw.coach || { cards: [], groups: {} };
  const GROUPS = coach.groups;

  const norm = s => String(s).normalize("NFC").toLowerCase().replace(/[.,!?;:"«»()…]/g, " ").replace(/\s+/g, " ").trim();
  const fold = s => norm(s).replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa").replace(/aa/g, "a");
  function variants(word) {
    const base = norm(word.replace(/\(.*?\)/g, ""));
    const out = [norm(word), base, ...[...word.matchAll(/\((.*?)\)/g)].map(m => norm(m[1]))];
    base.split(/\s*\/\s*/).forEach(p => out.push(p.trim()));
    out.slice().forEach(v => { for (const a of ["at ", "en ", "et "]) if (v.startsWith(a)) out.push(v.slice(a.length)); });
    return [...new Set(out.filter(Boolean))];
  }
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const ABBR = { "bl a": "blandt andet", "fx": "for eksempel", "f eks": "for eksempel", "dvs": "det vil sige", "mht": "med hensyn til",
    "pga": "på grund af", "ift": "i forhold til", "osv": "og så videre", "evt": "eventuelt", "ca": "cirka", "iflg": "ifølge", "vha": "ved hjælp af" };
  function stems(f) {
    const out = new Set([f]);
    for (const end of ["ede", "ende", "erne", "ene", "er", "en", "et", "ne", "de", "te", "r", "e", "s"])
      if (f.endsWith(end) && f.length - end.length >= 3) { const b = f.slice(0, -end.length); out.add(b); out.add(b + "e"); }
    return out;
  }

  // one entry per Danish word, merging Guidet læring's deck and the study sheet
  const INDEX = (() => {
    const idx = new Map();
    const get = key => { if (!idx.has(key)) idx.set(key, { key, word: null, meaning: "", card: null, site: null, forms: new Set(), en: "" }); return idx.get(key); };
    for (const [id, word, meaning, group, wtype, prep] of coach.cards) {
      const e = get(fold(word)); e.word = word; e.card = { id, word, group, wtype, prep }; e.meaning = meaning; e.en += " " + meaning;
      variants(word).forEach(v => e.forms.add(v));
    }
    for (const w of PD3.words) {
      const k = fold(w.display || w.lemma);
      const hit = [...idx.values()].find(e => e.card && [...e.forms].some(f => fold(f) === k));
      const e = hit || get(k);
      e.site = w; e.word = e.word || w.display || w.lemma;
      e.en += " " + w.senses.map(s => s.en_definition || "").join(" ");
      if (!e.meaning) e.meaning = (w.senses[0]?.en_definition || "").replace(/\s+[–-]\s+.*$/, "");
      [w.display, w.lemma, ...(w.forms || [])].filter(Boolean).forEach(v => e.forms.add(norm(v)));
    }
    return [...idx.values()];
  })();
  function search(q) {
    q = ABBR[norm(q).replace(/\.$/, "")] || q;
    const f = fold(q);
    if (!f) return [];
    const fs = stems(f), out = [];
    for (const e of INDEX) {
      let best = null;
      for (const v of e.forms) {
        const fv = fold(v);
        const sc = fv === f ? 0 : fv.startsWith(f) ? 1 : fs.has(fv) ? 1.5 : (f.length >= 3 && fv.includes(f)) ? 2 : null;
        if (sc !== null && (!best || sc < best.sc)) best = { sc, form: v };
      }
      if (!best && f.length >= 3 && new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(fold(e.en))) best = { sc: 3, en: true };
      if (best) out.push({ e, ...best });
    }
    return out.sort((a, b) => a.sc - b.sc || a.e.word.length - b.e.word.length).slice(0, 12);
  }
  const near = q => {
    const f = fold(q);
    return INDEX.map(e => ({ e, d: Math.min(...[...e.forms].map(v => lev(fold(v), f))) }))
      .filter(x => x.d <= Math.max(2, Math.floor(f.length / 3))).sort((a, b) => a.d - b.d).slice(0, 6).map(x => x.e);
  };

  // the study sheet's full entry, in a dialog over the page
  let dlg;
  function explain(w) {
    if (!dlg) {
      dlg = el("dialog", { class: "info fentry", "aria-label": t("nav.find") });
      dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
      document.body.append(dlg);
    }
    dlg.replaceChildren(el("div", { class: "ib" },
      el("div", { class: "ih" }, el("span"), el("button", { type: "button", class: "btn quiet", onclick: () => dlg.close() }, t("info.close"))),
      PD3.entry(w)));
    dlg.showModal();
  }
  const prio = g => (GROUPS[g] || [])[2] || 3;
  const gname = g => GROUPS[g] ? GROUPS[g][LANG === "en" ? 0 : 1] : g;
  function hitCard(x) {
    const e = x.e, c = e.card, w = e.site;
    const via = x.en ? t("fd.viaen") : (x.form && fold(x.form) !== fold(e.word) && x.sc === 0) ? t("fd.viaform", x.form) : "";
    const sg = w ? (w.groups || [w.primary_group]).map(id => PD3.groupById[id]).filter(Boolean) : [];
    const gl = g => el("span", { class: "gname" }, LANG === "en" ? g.name_en : g.name_da, " ", el("small", null, "· " + (LANG === "en" ? g.name_da : g.name_en)));
    return el("div", { class: "sheet hit" },
      el("div", { class: "fhead" }, el("span", { class: "big", lang: "da" }, e.word),
        c && c.wtype ? el("span", { class: "tag" }, c.wtype) : w ? el("span", { class: "tag" }, w.word_class || "") : null),
      e.meaning ? el("div", { class: "meaning" }, e.meaning) : null,
      c && c.prep ? el("div", { class: "prepline" }, t("fd.with") + " ", el("b", { lang: "da" }, c.prep)) : null,
      via ? el("div", { class: "via" }, via) : null,
      el("div", { class: "cats" },
        el("div", { class: "cat" }, el("span", { class: "src" }, t("nav.assisted")),
          ...(c ? [el("span", { class: "badge t" + prio(c.group) }, t("fd.p" + prio(c.group))),
            el("span", { class: "gname" }, gname(c.group), " ", el("small", null, "· " + (GROUPS[c.group] ? GROUPS[c.group][LANG === "en" ? 1 : 0] : "")))]
            : [el("span", { class: "soft" }, t("fd.notal"))])),
        el("div", { class: "cat" }, el("span", { class: "src" }, t("fd.site")),
          ...(sg.length ? sg.flatMap((g, i) => [i ? el("span", { class: "soft" }, "+") : null, gl(g)]) : [el("span", { class: "soft" }, t("fd.notsite"))]))),
      (w || c) ? el("div", { class: "frow" },
        w ? el("button", { type: "button", class: "btn", onclick: () => explain(w) }, "📖 " + t("fd.more")) : null,
        c ? el("a", { class: "btn quiet", href: "assisted-learning.html#find=" + encodeURIComponent(e.word) }, t("fd.al") + " →") : null) : null);
  }

  // the bar itself, right under the top bar
  const X = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const LOUPE = '<svg class="ficon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const bar = el("div", { class: "findbar", id: "findbar", inert: true });
  bar.innerHTML = `<div class="findbar-in"><div class="wrap fwrap"><div class="finder">${LOUPE}
    <input id="fq" type="search" lang="da" autocomplete="off" spellcheck="false" enterkeyhint="search">
    <button type="button" class="fx" id="fqClose">${X}</button></div>
    <div class="fsub"><div class="letters">${["æ", "ø", "å"].map(l => `<button type="button" data-l="${l}">${l}</button>`).join("")}</div><p class="soft small" id="fmeta"></p></div>
    <div class="hits" id="hits" aria-live="polite"></div></div></div>`;
  document.querySelector(".topbar").after(bar);
  const input = bar.querySelector("#fq"), hits = bar.querySelector("#hits"), x = bar.querySelector("#fqClose");
  input.placeholder = t("fd.ph"); input.setAttribute("aria-label", t("nav.find"));
  x.title = t("fd.close"); x.setAttribute("aria-label", t("fd.close"));
  bar.querySelector("#fmeta").textContent = t("fd.count", coach.cards.length, PD3.words.length);
  nav.setAttribute("role", "button"); nav.setAttribute("aria-controls", "findbar"); nav.setAttribute("aria-expanded", "false");

  function draw() {
    const q = input.value.trim();
    if (!q) { hits.replaceChildren(); return; }
    const found = search(q);
    if (found.length) { hits.replaceChildren(...found.map(hitCard)); return; }
    const n = near(q);
    hits.replaceChildren(
      el("div", { class: "sheet hit" }, el("b", null, t("fd.none", q)),
        n.length > 1 ? el("div", { class: "frow" }, el("span", { class: "soft" }, t("fd.near")),
          ...n.map(e => el("button", { type: "button", class: "fchip", lang: "da", onclick: () => { input.value = e.word; draw(); input.focus(); } }, e.word))) : null,
        el("p", { class: "small", style: { marginTop: "12px" } },
          el("a", { href: "https://ordnet.dk/ddo/ordbog?query=" + encodeURIComponent(q), target: "_blank", rel: "noopener" }, t("fd.ddo", q)))),
      ...(n.length ? [el("span", { class: "lbl" }, t("fd.near")), hitCard({ e: n[0] })] : []));
  }
  let timer;
  function open() {
    clearTimeout(timer);
    bar.inert = false; bar.classList.add("open"); nav.setAttribute("aria-expanded", "true");
    input.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    draw();
  }
  function close() {
    if (!bar.classList.contains("open")) return;
    bar.classList.remove("open"); nav.setAttribute("aria-expanded", "false");
    nav.focus({ preventScroll: true });
    timer = setTimeout(() => { bar.inert = true; input.value = ""; hits.replaceChildren(); }, 420);   // after the closing animation
  }
  nav.addEventListener("click", e => { e.preventDefault(); bar.classList.contains("open") ? close() : open(); });
  x.addEventListener("click", close);
  input.addEventListener("input", draw);
  // Esc closes; keys typed here never reach the page's own shortcuts (flashcards use Space, 1–4 …)
  bar.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); close(); } });
  bar.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => {
    const p = input.selectionStart ?? input.value.length;
    input.value = input.value.slice(0, p) + b.dataset.l + input.value.slice(input.selectionEnd ?? p);
    input.focus(); input.setSelectionRange(p + 1, p + 1); draw();
  }));
})();
