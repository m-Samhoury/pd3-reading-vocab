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

  /** label + value row used inside an entry */
  const row = (label, ...val) => el("div", { class: "row" }, el("dt", null, label), el("dd", null, ...val));
  /** small tag on text written by AI for this tool (not copied from Den Danske Ordbog or the exams) */
  const ai = () => el("span", { class: "ai", title: t("ai.title") }, "AI");
  /** "Eksempel" label: the exam it is copied from, else an AI tag */
  const exLabel = (key, exam) => el("span", { class: "lbl" }, t(key), exam ? el("span", { class: "src" }, " · " + t("ai.exam", exam)) : ai());

  function senseItem(w, s, opts = {}) {
    const rel = [];
    if (s.collocations.length) rel.push(row([t("sense.use").replace(/: $/, ""), ai()], el("span", { lang: "da" }, s.collocations.join(" · "))));
    if (s.synonyms.length) rel.push(row([t("sense.syn").replace(/: $/, ""), ai()], el("span", { lang: "da" }, s.synonyms.join(", "))));
    if (s.antonyms.length) rel.push(row([t("sense.ant").replace(/: $/, ""), ai()], el("span", { lang: "da" }, s.antonyms.join(", "))));
    if (opts.showGroup && s.group !== w.primary_group) rel.push(row(t("sense.group").replace(/: $/, ""), groupName(s.group)));
    return el("li", { class: "sense" },
      el("p", { class: "def" }, el("span", { class: "da", lang: "da" }, s.da_definition),
        s.register === "neutral" ? null : el("span", { class: "reg" }, t("reg." + s.register)),
        el("span", { class: "en" }, s.en_definition, ai())),
      el("div", { class: "eg" }, exLabel("d.example", s.ex_exam),
        el("p", { class: "da", lang: "da" }, ...highlight(s.example_da, w)),
        el("p", { class: "en" }, s.example_en, s.ex_exam ? ai() : null)),
      rel.length ? el("dl", { class: "rel" }, ...rel) : null,
      s.verified ? null : el("p", { class: "flag" }, t("sense.unverified")));
  }
  function wordOrderNote(w) {
    if (!w.word_order) return null;
    const o = w.word_order;
    return el("div", { class: "note" },
      el("span", { class: "lbl" }, t("wo.title").trim(), ai()),
      el("p", { class: "da", lang: "da" }, o.note_da),
      el("p", { class: "en" }, o.note_en),
      o.example_da ? el("p", { class: "ex da", lang: "da" }, ...highlight(o.example_da, w)) : null,
      o.example_en ? el("p", { class: "en small" }, o.example_en) : null);
  }
  // word classes that never inflect (connectors, adverbs, prepositions, fixed expressions)
  const NOINFL = /^(adverbi|konjunktion|præposition|adverbiel|fast udtryk|infinitivforbindelse)/;
  /** bøjning row: DDO's endings plus the full forms */
  function inflection(d, w) {
    const from = d.infl_from ? el("span", { class: "soft small" }, " " + t(d.participle ? "d.partof" : "d.inflfrom", d.infl_from)) : null;
    if (d.forms && d.forms.length) return row(t("d.inflection"), el("span", { class: "forms", lang: "da" },
      ...d.forms.flatMap((fs, i) => [i ? el("span", { class: "fsep" }, "|") : null, ...fs.map(f => el("span", { class: "form" }, f))])),
      d.inflection ? el("span", { class: "soft small", lang: "da" }, " " + d.inflection) : null, from);
    if (d.inflection) return row(t("d.inflection"), el("span", { lang: "da" }, d.inflection), from);
    if (d.invariable || NOINFL.test(w.word_class)) return row(t("d.inflection"), el("span", { class: "soft" }, t("d.invariable")));
    return null;
  }
  /** DDO's valency notation, readable: NOGEN/NOGET/+SÆTNING as small caps, over_for → over for */
  function pattern(p) {
    return el("span", { class: "pat", lang: "da" }, ...p.replace(/_/g, " ").replace(/\s*\/\s*/g, " / ").replace(/\+/g, " + ")
      .split(/\b([A-ZÆØÅ]{3,})\b/).map((x, i) => i % 2 ? el("span", { class: "cap" }, x.toLowerCase()) : x));
  }
  /** what the word is used with: DDO's grammar patterns, else the note written from the exam sentences */
  function construction(w) {
    const g = (w.dict && w.dict.grammar) || [], items = g.length ? g.map(pattern) : (w.construction || []).map(x => el("span", { class: "pat", lang: "da" }, x));
    if (!items.length) return null;
    const li = x => el("li", null, x);
    return row(t("d.construction"), el("ul", { class: "cons" }, ...items.slice(0, 4).map(li)),
      items.length > 4 ? el("details", { class: "cons-more" }, el("summary", null, t("d.more", items.length - 4)), el("ul", { class: "cons" }, ...items.slice(4).map(li))) : null,
      g.length ? el("span", { class: "soft small" }, t("d.consddo")) : ai());
  }
  /** DDO's own numbered senses – only present in the private build */
  function ddoBlock(w) {
    const d = w.dict || {};
    if (!d.ddo_senses) return null;
    return el("section", { class: "ddo" },
      el("span", { class: "lbl" }, t("d.ddo")),
      el("ol", { class: "ddo-senses" }, ...d.ddo_senses.map(s => el("li", null,
        el("p", { class: "ddo-def", lang: "da" }, s.no ? el("b", null, s.no + ". ") : null, s.definition),
        s.examples.length ? el("p", { class: "ddo-ex small", lang: "da" }, s.examples.join(" · ")) : null,
        ...s.citations.map(c => el("blockquote", { lang: "da" }, c))))),
      el("p", { class: "cite" }, t("d.cite", d.ddo_head), " ", el("a", { href: d.ddo_url, target: "_blank", rel: "noopener" }, "ordnet.dk")));
  }
  /** full dictionary-style entry (used on the study sheet and on the back of flashcards) */
  function entry(w, opts = {}) {
    const d = w.dict || {};
    const facts = [row(t("d.class"), el("span", null, w.word_class)),
      d.gender ? row(t("d.gender"), el("span", { lang: "da" }, el("b", null, d.gender), " · " + t("d.gender." + d.gender))) : null,
      inflection(d, w), construction(w)].filter(Boolean);
    const link = (href, label) => el("a", { class: "btn quiet small", href, target: "_blank", rel: "noopener" }, label, " ↗");
    const node = el(opts.tag || "article", { class: "entry", id: opts.id || null, "data-id": w.id },
      el("header", { class: "hw" },
        el("div", { class: "hw-top" },
          d.gender ? el("span", { class: "gender", title: t("d.gender." + d.gender) }, d.gender) : null,
          el("span", { class: "lemma", lang: "da" }, displayLemma(w)),
          metaLine(w)),
        w.grammar ? el("div", { class: "hw-sub" }, el("span", { class: "gram", lang: "da" }, w.grammar)) : null,
        d.en ? el("p", { class: "en-head" }, el("span", { class: "lbl" }, "EN"), d.en.join(" · ")) : null,
        w.source === "guide" ? el("p", { class: "flag guide" }, t("entry.guide")) : null),
      facts.length ? el("dl", { class: "facts" }, ...facts) : null,
      el("div", { class: "blk" }, el("span", { class: "lbl" }, t(w.senses.length > 1 ? "d.senses" : "d.sense")),
        el("ol", { class: "senses" + (w.senses.length === 1 ? " single" : "") },
          ...w.senses.map(s => senseItem(w, s, { showGroup: w.groups.length > 1 })))),
      wordOrderNote(w),
      ddoBlock(w),
      el("div", { class: "links" }, el("span", { class: "lbl" }, t("d.links")),
        link(d.ddo_url, "Den Danske Ordbog"), link(d.ordbogen_url, "ordbogen.com"),
        d.en_url ? link(d.en_url, "Wiktionary") : null));
    if (opts.exam !== false && w.exam_sentences.length) {
      node.append(el("details", { class: "fromexam" }, el("summary", null, t("entry.fromexam")),
        el("ul", null, ...w.exam_sentences.map(s => el("li", { lang: "da" },
          ...highlight(s.text, w), " ", el("span", { class: "meta" }, `${s.exam} · ${s.part} ${s.location}`))))));
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
           metaLine, highlight, ai, senseItem, wordOrderNote, entry, store, shuffle, priority };
})();
