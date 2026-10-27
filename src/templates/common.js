/* Shared helpers – data access, DOM building, entry rendering and safe storage. */
const PD3 = (() => {
  const raw = JSON.parse(document.getElementById("pd3-data").textContent);
  applyI18n();
  const words = raw.words;
  const groups = raw.groups;
  const byId = Object.fromEntries(words.map(w => [w.id, w]));
  const groupById = Object.fromEntries(groups.map(g => [g.id, g]));
  const PARTS = ["L1", "L2A", "L2B", "L3"];
  const EXAMS = raw.meta.exams;
  // group colours, one per group (cycled)
  const INKS = ["#ec6a3c", "#3b7bf6", "#7b5cf0", "#17a673", "#e0a100", "#e0457b", "#1aa3c4", "#8a6a4f",
                "#5b6cf0", "#62a01a", "#d65a2e", "#6b7280", "#b05fd8", "#2f9e8f", "#f08a24", "#4f7bb8"];
  groups.forEach((g, i) => { g.color = INKS[i % INKS.length]; });

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "style" && typeof v === "object") Object.assign(n.style, v);
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false)
      n.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return n;
  }
  const gstyle = id => groupById[id] ? `--g:${groupById[id].color}` : "";
  const groupName = id => groupById[id] ? (LANG === "en" ? `${groupById[id].name_en} · ${groupById[id].name_da}` : `${groupById[id].name_da} · ${groupById[id].name_en}`) : id;
  const displayLemma = w => w.display || w.lemma;
  const parts = w => PARTS.filter(p => (w.frequency.by_part || {})[p]);
  const freqText = w => w.frequency.total
    ? t(w.frequency.exams === 1 ? "freq.one" : "freq.many", w.frequency.exams, w.frequency.total) : t("freq.guide");

  /** "Tier 1 · L1 L3 · 4 exams · 52×" as quiet text */
  function metaLine(w, opts = {}) {
    const m = el("span", { class: "meta" }, el("span", { class: "badge t" + w.tier }, `Tier ${w.tier}`),
      ...parts(w).map(p => el("span", { class: "tag" }, p)),
      opts.freq !== false ? el("span", null, freqText(w)) : null);
    m.title = parts(w).map(p => `${p}: ${t("lg." + p)}`).join("\n");
    return m;
  }

  /** wrap the word (any of its forms) inside an example sentence in a highlight */
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function highlight(text, w) {
    const forms = (w.forms && w.forms.length ? w.forms : [w.lemma]).filter(Boolean).sort((a, b) => b.length - a.length);
    const re = new RegExp(`(^|[^\\wæøåÆØÅ])(${forms.map(f => esc(f).replace(/\s+/g, "\\s+")).join("|")})(?![\\wæøåÆØÅ])`, "i");
    const m = re.exec(text);
    if (!m) return [text];
    const i = m.index + m[1].length;
    return [text.slice(0, i), el("mark", { class: "hl" }, m[2]), text.slice(i + m[2].length)];
  }

  function senseItem(w, s, opts = {}) {
    const li = el("li", null,
      el("p", { class: "def" }, el("span", { class: "da", lang: "da" }, s.da_definition),
        el("span", { class: "reg" }, s.register === "neutral" ? "" : t("reg." + s.register)),
        el("span", { class: "en" }, s.en_definition)),
      el("p", { class: "eg" }, el("span", { class: "da", lang: "da" }, ...highlight(s.example_da, w)),
        el("span", { class: "en" }, s.example_en)));
    const extra = [];
    if (s.collocations.length) extra.push(el("span", null, el("b", null, t("sense.use")), s.collocations.join(" · ")));
    if (s.synonyms.length) extra.push(el("span", null, el("b", null, t("sense.syn")), s.synonyms.join(", ")));
    if (s.antonyms.length) extra.push(el("span", null, el("b", null, t("sense.ant")), s.antonyms.join(", ")));
    if (opts.showGroup && s.group !== w.primary_group) extra.push(el("span", null, el("b", null, t("sense.group")), groupName(s.group)));
    if (extra.length) li.append(el("p", { class: "extra" }, ...extra.flatMap((x, i) => i ? [el("br"), x] : [x])));
    if (!s.verified) li.append(el("p", { class: "flag" }, t("sense.unverified")));
    return li;
  }
  function wordOrderNote(w) {
    if (!w.word_order) return null;
    const o = w.word_order;
    return el("div", { class: "note" },
      el("b", null, t("wo.title")), el("span", { class: "da" }, o.note_da),
      el("span", { class: "en" }, o.note_en),
      o.example_da ? el("div", { class: "ex da", lang: "da" }, ...highlight(o.example_da, w)) : null,
      o.example_en ? el("div", { class: "en small" }, o.example_en) : null);
  }
  /** full dictionary-style entry (used on the study sheet and on the back of flashcards) */
  function entry(w, opts = {}) {
    const node = el(opts.tag || "article", { class: "entry", id: opts.id || null, "data-id": w.id },
      el("div", { class: "hw" },
        el("span", { class: "lemma", lang: "da" }, displayLemma(w)),
        el("span", { class: "cls" }, w.word_class),
        w.grammar ? el("span", { class: "gram", lang: "da" }, w.grammar) : null,
        metaLine(w)),
      w.source === "guide" ? el("p", { class: "flag guide", style: "margin:2px 0 0" }, t("entry.guide")) : null,
      el("ol", { class: "senses" + (w.senses.length === 1 ? " single" : "") },
        ...w.senses.map(s => senseItem(w, s, { showGroup: w.groups.length > 1 }))),
      wordOrderNote(w));
    if (opts.exam !== false && w.exam_sentences.length) {
      const d = el("details", { class: "fromexam" }, el("summary", null, t("entry.fromexam")),
        el("ul", null, ...w.exam_sentences.map(s => el("li", { lang: "da" },
          ...highlight(s.text, w), " ", el("span", { class: "meta" }, `${s.exam} · ${s.part} ${s.location}`)))));
      node.append(d);
    }
    return node;
  }

  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; } },
    del(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } },
  };
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const priority = (a, b) => a.tier - b.tier || b.frequency.weighted_question_score - a.frequency.weighted_question_score
    || b.frequency.exams - a.frequency.exams || b.frequency.total - a.frequency.total || a.lemma.localeCompare(b.lemma, "da");

  return { raw, words, groups, byId, groupById, PARTS, EXAMS, el, gstyle, groupName, displayLemma, parts, freqText,
           metaLine, highlight, senseItem, wordOrderNote, entry, store, shuffle, priority };
})();
