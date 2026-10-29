/* Interface strings in Danish and English. Content (definitions, examples) is bilingual in the data itself.
   t("key", a, b) replaces {0}, {1} … with the arguments. */
const I18N = {
  // shared
  "nav.overview": ["Overblik", "Overview"], "nav.study": ["Studieark", "Study sheet"],
  "nav.flash": ["Flashcards", "Flashcards"], "nav.test": ["Test", "Test"],
  "nav.assisted": ["Guidet læring", "Assisted learning"], "nav.find": ["Find ord", "Find a word"],
  "lang.button": ["English", "Dansk"], "lang.title": ["Skift sprog til engelsk", "Switch language to Danish"],
  "freq.one": ["{0} prøve · {1}×", "{0} exam · {1}×"], "freq.many": ["{0} prøver · {1}×", "{0} exams · {1}×"],
  "freq.guide": ["fra guiden", "from the guide"],
  "sense.use": ["Brug: ", "Usage: "], "sense.syn": ["Synonymer: ", "Synonyms: "], "sense.ant": ["Modsat: ", "Opposite: "],
  "sense.group": ["Gruppe: ", "Group: "], "sense.unverified": ["Ikke tjekket i Den Danske Ordbog", "Not verified against Den Danske Ordbog"],
  "wo.title": ["Ordstilling ", "Word order "],
  "entry.guide": ["Nævnt i Sokolova-guiden – findes ikke i disse prøver", "Named in the Sokolova guide – not found in these exams"],
  "entry.fromexam": ["Fra prøverne", "From the exams"],
  "reg.formal": ["formelt", "formal"], "reg.bookish": ["skriftsprog", "bookish"], "reg.spoken": ["talesprog", "spoken"],
  "footer": ["Kilde: Prøve i Dansk 3, Læseforståelse 1–3, nov. 2022 – maj 2024 (SIRI). Definitionerne er skrevet til dette værktøj og tjekket i Den Danske Ordbog (ordnet.dk). Engelske ord (EN) fra Wiktionary (CC BY-SA 4.0). Fremskridt gemmes kun i denne browser.",
             "Source: Prøve i Dansk 3, Læseforståelse 1–3, Nov 2022 – May 2024 (SIRI). Definitions written for this study tool and checked against Den Danske Ordbog (ordnet.dk). English words (EN) from Wiktionary (CC BY-SA 4.0). Progress is stored only in this browser."],
  "tier1.h": ["Forbinderord", "Connectors"], "tier1.p": ["Tier 1 · forbinderord ordnet efter logisk relation", "Tier 1 · connectors grouped by logical relation"],
  "tier2.h": ["Ord fra opgaverne", "Words from the questions"], "tier2.p": ["Tier 2 · ord fra spørgsmål, svarmuligheder og huller i L3", "Tier 2 · words from questions, answer options and L3 gaps"],
  "tier3.h": ["Ord fra teksterne", "Words from the texts"], "tier3.p": ["Tier 3 · hyppige ord i læseteksterne", "Tier 3 · frequent words in the reading texts"],
  "count.words": ["{0} ord", "{0} words"],
  // study sheet
  "study.title": ["Studieark", "Study sheet"],
  "study.intro": ["{0} ord fra {1} prøver (nov. 2022 – maj 2024): {2} forbinderord, {3} ord fra opgaverne og {4} ord fra teksterne.",
                  "{0} words from {1} exams (Nov 2022 – May 2024): {2} connectors, {3} question words and {4} text words."],
  "study.search": ["Søg ord, betydning eller eksempel…", "Search words, meanings or examples…"],
  "study.jump": ["Gå til gruppe…", "Jump to group…"], "study.all": ["Alle", "All"], "study.filters": ["Filtre", "Filters"],
  "f.group": ["Gruppe", "Group"], "f.class": ["Ordklasse", "Word class"], "f.exam": ["Prøve", "Exam"], "f.part": ["Del", "Part"],
  "f.ddo": ["Tjek i DDO", "DDO check"], "f.any": ["Alle", "Any"], "f.verified": ["Verificeret", "Verified"], "f.unverified": ["Ikke verificeret", "Not verified"],
  "f.hideEn": ["Skjul engelsk", "Hide English"], "f.hideDa": ["Skjul dansk", "Hide Danish"],
  "f.expand": ["Fold alle ud", "Expand all"], "f.collapse": ["Fold sammen", "Collapse all"], "f.print": ["Print", "Print"],
  "f.allGroups": ["Alle grupper", "All groups"], "f.allClasses": ["Alle ordklasser", "All word classes"],
  "f.allExams": ["Alle prøver", "All exams"], "f.allParts": ["Alle dele", "All parts"],
  "grp.hide": ["Skjul", "Hide"], "grp.show": ["Vis", "Show"], "grp.see": ["(se {0})", "(see {0})"],
  "study.empty": ["Ingen ord passer til søgningen.", "No words match your search."],
  // flashcards – learn
  "fl.title": ["Flashcards", "Flashcards"], "tab.learn": ["Lær", "Learn"], "tab.test": ["Test", "Test"],
  "fl.deck": ["Bunke", "Deck"], "fl.shuffle": ["Bland", "Shuffle"], "fl.reverse": ["Omvendt (definition → dansk)", "Reverse (definition → Danish)"],
  "deck.t1": ["Kun Tier 1 – forbinderord", "Tier 1 only – connectors"], "deck.t12": ["Tier 1 + 2", "Tier 1 + 2"],
  "deck.all": ["Alle ord", "All words"], "deck.due": ["Skal gentages i dag", "Due today"], "deck.groups": ["Tier {0} – grupper", "Tier {0} – groups"],
  "m.known": [" kan du", " known"], "m.learning": ["{0} i gang · {1} skal gentages", "{0} learning · {1} due"],
  "due.today": ["{0} skal gentages i dag", "{0} due today"], "card.count": ["Kort {0} / {1}", "Card {0} / {1}"],
  "front.which": ["Hvilket dansk ord? · tryk for at vende", "Which Danish word? · tap to flip"],
  "face.title": ["Forsiden viser", "Card front shows"], "face.word": ["Ordet", "The word"],
  "face.context": ["Ordet i en sætning", "Word in a sentence"], "face.meaning": ["Betydningen", "The meaning"],
  "front.ctx": ["Hvad betyder det markerede ord her? · tryk for at vende", "What does the marked word mean here? · tap to flip"],
  "ctx.src": ["Fra prøven {0} · {1}", "From the {0} exam · {1}"],
  "ctx.example": ["Eksempel – ordet står ikke i en prøvesætning", "Example – the word is not in an exam sentence"],
  "front.sense": ["betydning 1 af {0}", "sense 1 of {0}"], "front.tap": ["Tryk eller mellemrum for at vende", "Tap or press Space to flip"],
  "card.aria": ["Flashcard – tryk mellemrum for at vende", "Flashcard – press Space to flip"], "card.backAria": ["Kortets bagside: {0}", "Back of card: {0}"],
  "done.h": ["Færdig for nu", "All done for now"], "none.h": ["Intet at gentage lige nu", "Nothing to review right now"],
  "done.p": ["Du har gennemgået {0} kort.", "You reviewed {0} cards."], "none.p": ["Alle kort i bunken er planlagt til senere.", "All cards in this deck are scheduled for later."],
  "practise": ["Øv hele bunken alligevel", "Practise the whole deck anyway"],
  "g.no": ["Kan ikke", "Don't know"], "g.almost": ["Næsten", "Almost"], "g.yes": ["Kan den", "Know it"],
  "fl.keys": ["Mellemrum/Enter vender kortet · ← / → går til forrige/næste ord · 1 / 2 / 3 giver karakter · på mobil: tryk for at vende, swipe for forrige/næste.",
               "Space/Enter flips the card · ← / → go to the previous/next word · 1 / 2 / 3 grade it · on mobile: tap to flip, swipe for previous/next."],
  "fl.export": ["Eksportér fremskridt", "Export progress"], "fl.import": ["Importér", "Import"], "fl.reset": ["Nulstil", "Reset"],
  "nav.prev": ["Forrige", "Previous"], "nav.next": ["Næste", "Next"],
  "g.help": ["Karakteren styrer, hvornår ordet kommer igen: Kan ikke = om lidt, Næsten = snart igen, Kan den = om nogle dage.",
             "Your grade decides when the word comes back: Don't know = in a moment, Almost = again soon, Know it = in a few days."],
  "fl.storage": ["Din browser gemmer ikke data her, så fremskridt forsvinder, når siden lukkes. Brug Eksportér for at gemme dem.",
                 "Your browser does not store data here, so progress is lost when the page closes. Use Export to keep it."],
  "imp.notfile": ["Ikke en PD3-fil med fremskridt", "Not a PD3 progress file"],
  "imp.confirm": ["Vil du erstatte dine nuværende fremskridt med filen?", "Replace your current progress with the imported file?"],
  "imp.done": ["Fremskridt importeret for {0} kort.", "Imported progress for {0} cards."], "imp.fail": ["Import mislykkedes: {0}", "Import failed: {0}"],
  "reset.confirm": ["Nulstil alle flashcard-fremskridt? (Testhistorikken bevares.)", "Reset all flashcard progress? (Test history is kept.)"],
  // flashcards – test
  "t.scope": ["Ord i testen", "Words in the test"], "t.new": ["Ny test · 10 spørgsmål", "New test · 10 questions"],
  "t.info": ["Standard: 50 % Tier 1, 30 % Tier 2, 20 % Tier 3 – ord du ofte svarer forkert på, kommer oftere. Udfyld-hullet-spørgsmål bruger de rigtige sætninger og svarmuligheder fra Læseforståelse 3, når det er muligt.",
             "Default: 50 % Tier 1, 30 % Tier 2, 20 % Tier 3 – words you often get wrong come up more often. Gap-fill questions use the real sentences and answer options from Læseforståelse 3 where possible."],
  "t.results": ["Resultater", "Results"],
  "scope.mix": ["Blandet (50/30/20 pr. tier)", "Mixed (50/30/20 by tier)"], "scope.conn": ["Kun forbinderord", "Connectors only"],
  "q.def": ["Hvilket ord passer til definitionen?", "Which word matches the definition?"],
  "q.l3": ["Udfyld hullet – rigtig opgave fra Læseforståelse 3 ({0}, hul {1})", "Fill the gap – real Læseforståelse 3 item ({0}, gap {1})"],
  "q.gap": ["Udfyld hullet", "Fill the gap"], "q.rel": ["Hvilket forbinderord udtrykker denne logiske relation?", "Which connector expresses this logical relation?"],
  "q.en": ["Hvad betyder ordet på engelsk?", "What does the word mean in English?"],
  "q.sense": ["Hvilken betydning har «{0}» i sætningen?", "Which meaning does «{0}» have in this sentence?"],
  "type.1": ["Definition → ord", "Definition → word"], "type.2": ["Udfyld hullet", "Gap fill"], "type.3": ["Logisk relation", "Logical relation"],
  "type.4": ["Dansk → engelsk", "Danish → English"], "type.5": ["Hvilken betydning?", "Which meaning?"],
  "q.count": ["Spørgsmål {0} / {1}", "Question {0} / {1}"], "q.right": ["{0} rigtige", "{0} correct"],
  "q.next": ["Næste spørgsmål →", "Next question →"], "q.result": ["Se resultat", "See result"], "q.optsAria": ["Svarmuligheder", "Answer options"],
  "fb.ok": ["Rigtigt!", "Correct!"], "fb.bad": ["Ikke helt – det rigtige svar er: {0}", "Not quite – the correct answer is: {0}"],
  "ex.key": ["Officiel rettenøgle: {0} ({1}, L3 hul {2}).", "Official answer key: {0} ({1}, L3 gap {2})."],
  "ex.relation": ["Relation: ", "Relation: "], "ex.wo": ["Ordstilling: ", "Word order: "],
  "res.retry": ["Prøv fejlene igen ({0})", "Retry mistakes ({0})"], "res.new": ["Ny test", "New test"], "res.back": ["Tilbage", "Back"],
  "res.review": ["Gennemgå fejlene", "Review your mistakes"], "res.your": ["Dit svar: ", "Your answer: "], "res.correct": [" · rigtigt: ", " · correct: "],
  "hist.none": ["Ingen tests endnu.", "No tests yet."], "hist.acc": ["Træfsikkerhed: ", "Accuracy: "],
  "hist.date": ["Dato", "Date"], "hist.scope": ["Ord", "Words"], "hist.score": ["Point", "Score"], "hist.tier": ["Pr. tier", "Per tier"],
  "hist.clear": ["Slet historik", "Clear history"], "hist.confirm": ["Slet testhistorik og statistik pr. ord?", "Clear test history and per-word statistics?"],
  "t.notenough": ["Der er ikke nok ord til en test med disse indstillinger.", "Not enough words for a test with these settings."],
  // overview
  "idx.title": ["PD3 ordforråd · læseforståelse", "PD3 vocabulary · reading"],
  "idx.intro": ["{0} ord fra {1} prøver (nov. 2022 – maj 2024). Tier 1: {2} forbinderord · Tier 2: {3} ord fra opgaverne · Tier 3: {4} ord fra teksterne.",
                "{0} words from {1} exams (Nov 2022 – May 2024). Tier 1: {2} connectors · Tier 2: {3} question words · Tier 3: {4} text words."],
  "idx.study.p": ["Alle ord med betydninger, eksempler, faste forbindelser og ordstilling. Søg, filtrér og print.", "Every word with meanings, examples, collocations and word order. Search, filter and print."],
  "idx.flash.p": ["Gentagelse med mellemrum. Starter med forbinderordene i Tier 1.", "Spaced repetition. Starts with the Tier 1 connectors."],
  "idx.test.h": ["Test · 10 spørgsmål", "Test · 10 questions"],
  "idx.test.p": ["Opgavetyper som til prøven – også de rigtige huller fra Læseforståelse 3.", "Question types like the exam – including the real Læseforståelse 3 gaps."],
  "idx.progress": ["Dit fremskridt", "Your progress"], "idx.groups": ["Grupper", "Groups"], "idx.sources": ["Kilder", "Sources"],
  "idx.tests": ["Tests", "Tests"], "idx.last": [" · seneste {0}/{1}", " · last {0}/{1}"], "idx.none": [" · ingen endnu", " · none yet"],
  "brand": ["PD3 ordforråd", "PD3 vocabulary"],
  "d.class": ["Ordklasse", "Word class"], "d.gender": ["Køn", "Gender"],
  "d.construction": ["Konstruktion", "Construction"], "d.more": ["+ {0} flere", "+ {0} more"],
  "d.consddo": ["Mønstre fra Den Danske Ordbog.", "Patterns from Den Danske Ordbog."],
  "d.partof": ["(præteritum participium af «{0}», DDO)", "(past participle of «{0}», DDO)"],
  "d.inflfrom": ["(DDO: opslaget «{0}»)", "(DDO: entry «{0}»)"],
  "ai.title": ["Skrevet af AI (Claude) til dette værktøj – ikke fra Den Danske Ordbog eller prøverne. Tjek i ordbogen.",
                "Written by AI (Claude) for this tool – not from Den Danske Ordbog or the exams. Check in the dictionary."],
  "ai.exam": ["fra prøven {0}", "from the {0} exam"],
  "lg.ai": ["skrevet af AI (Claude) til dette værktøj ud fra ordbogen og prøverne. Alt uden mærket er fra Den Danske Ordbog, prøverne eller Wiktionary.",
            "written by AI (Claude) for this tool, based on the dictionary and the exams. Everything without the tag is from Den Danske Ordbog, the exams or Wiktionary."],
  "lg.nogen": ["en person · en ting (i konstruktioner)", "a person · a thing (in constructions)"],
  "lg.saetning": ["at-sætning · hv-sætning (hvorfor, hvordan …) · at + infinitiv", "that-clause · wh-clause (why, how …) · to-infinitive"],
  "d.inflection": ["Bøjning", "Inflection"], "d.invariable": ["bøjes ikke", "does not inflect"],
  "d.sense": ["Betydning", "Meaning"], "d.senses": ["Betydninger", "Meanings"], "d.example": ["Eksempel", "Example"],
  "d.ddo": ["Den Danske Ordbog – ordret", "Den Danske Ordbog – verbatim"], "d.links": ["Slå op", "Look up"],
  "d.cite": ["Kilde: Den Danske Ordbog, opslaget «{0}», © Det Danske Sprog- og Litteraturselskab. Gengivet ordret til privat brug.",
             "Source: Den Danske Ordbog, entry «{0}», © Det Danske Sprog- og Litteraturselskab. Reproduced verbatim for private use."],
  "d.gender.en": ["fælleskøn (en)", "common gender (en)"], "d.gender.et": ["intetkøn (et)", "neuter (et)"],
  "d.wikt": ["Engelske ord (EN) fra Wiktionary, CC BY-SA 4.0.", "English words (EN) from Wiktionary, CC BY-SA 4.0."],
  "info.open": ["Hjælp og forkortelser", "Help and abbreviations"], "info.title": ["Hjælp", "Help"],
  "info.close": ["Luk", "Close"], "info.how": ["Sådan virker det", "How it works"],
  "tab.learn.s": ["Flashcards: se ordet, vend kortet", "Flashcards: see the word, flip the card"],
  "tab.test.s": ["10 spørgsmål som til prøven", "10 exam-style questions"],
  "pick.title": ["Hvilke ord?", "Which words?"], "pick.count": ["{0} ord valgt", "{0} words selected"],
  "pick.all": ["Alle", "All"], "pick.t1": ["Forbinderord", "Connectors"], "pick.t2": ["Ord fra opgaverne", "Question words"],
  "pick.t3": ["Ord fra teksterne", "Text words"], "pick.groups": ["Vælg grupper", "Choose groups"],
  "pick.none": ["Vælg mindst én gruppe ovenfor.", "Pick at least one group above."], "pick.ngroups": ["{0} grupper", "{0} groups"],
  "sum": ["{0}/{1} kan du · {2} skal gentages", "{0}/{1} known · {2} due"],
  "fl.more": ["Indstillinger og backup", "Settings and backup"],
  "t.start": ["Start test · 10 spørgsmål", "Start test · 10 questions"],
  // legend of shorthands
  "lg.title": ["Forkortelser", "Abbreviations"],
  "lg.L1": ["Læseforståelse 1 · find oplysninger i korte tekster (15 spørgsmål)", "Reading 1 · find information in short texts (15 questions)"],
  "lg.L2A": ["Læseforståelse 2A · multiple choice om en længere tekst (3 spørgsmål)", "Reading 2A · multiple choice on a longer text (3 questions)"],
  "lg.L2B": ["Læseforståelse 2B · sæt 5 sætninger tilbage i teksten (7 muligheder)", "Reading 2B · put 5 sentences back into the text (7 options)"],
  "lg.L3": ["Læseforståelse 3 · vælg det rigtige ord i 8 huller (4 muligheder)", "Reading 3 · choose the right word for 8 gaps (4 options)"],
  "lg.T1": ["forbinderord (fordi, derfor, dog …)", "connectors (because, therefore, however …)"],
  "lg.T2": ["ord fra spørgsmål, svarmuligheder og L3-huller", "words from questions, answer options and L3 gaps"],
  "lg.T3": ["hyppige ord i læseteksterne", "frequent words in the reading texts"],
  "lg.freq": ["antal prøver ordet står i · antal gange i alt", "number of exams the word appears in · total occurrences"],
  "idx.h1a": ["Lær ordene fra", "Learn the words from"], "idx.h1b": ["PD3 læseforståelse", "PD3 reading"],
  "idx.chip.b": ["Nyt", "New"], "idx.chip": ["Tier 1 · forbinderord er klar", "Tier 1 · connectors are ready"],
  "idx.cta1": ["Start flashcards", "Start flashcards"], "idx.cta2": ["Tag en test", "Take a test"],
  "idx.open": ["Åbn", "Open"],
  "idx.al.p": ["Lær forbinderordene trin for trin: forklaring, ordstilling og eksempler fra prøverne – så test og gentagelse.",
               "Learn the connectors step by step: explanation, word order and exam examples – then test and review."],
  // find bar (find.js)
  "fd.ph": ["fx fordi, blandt andet, medføre …", "e.g. fordi, blandt andet, medføre …"], "fd.close": ["Luk søgningen", "Close the search"],
  "fd.count": ["{0} ord i Guidet læring · {1} på studiearket", "{0} words in Assisted learning · {1} on the study sheet"],
  "fd.site": ["Studiearket", "Study sheet"], "fd.al": ["Åbn i Guidet læring", "Open in Assisted learning"], "fd.more": ["Forklar mere", "Explain more"], "fd.with": ["Med:", "Used with:"],
  "fd.notal": ["ikke i Guidet læring", "not in Assisted learning"], "fd.notsite": ["ikke i studiearket", "not on the study sheet"],
  "fd.p1": ["Forbinderord", "Connectors"], "fd.p2": ["Ord fra prøven", "Exam words"], "fd.p3": ["Andre nyttige ord", "Other useful words"],
  "fd.none": ["“{0}” findes ikke i nogen af listerne.", "“{0}” isn't in either list."], "fd.near": ["Mente du:", "Did you mean:"],
  "fd.ddo": ["Slå “{0}” op på ordnet.dk ↗", "Look up “{0}” on ordnet.dk ↗"],
  "fd.viaen": ["fundet via den engelske betydning", "matched on the English meaning"], "fd.viaform": ["fundet via bøjningsformen “{0}”", "matched on the form “{0}”"],
  "idx.t1": ["Tier 1 · forbinderord", "Tier 1 · connectors"], "idx.t2": ["Tier 2 · ord fra opgaverne", "Tier 2 · question words"], "idx.t3": ["Tier 3 · ord fra teksterne", "Tier 3 · text words"],
};
let LANG = (() => { try { return localStorage.getItem("pd3.lang") === "en" ? "en" : "da"; } catch (e) { return "da"; } })();
function t(key, ...args) {
  const e = I18N[key];
  let s = e ? e[LANG === "en" ? 1 : 0] : key;
  args.forEach((a, i) => { s = s.split(`{${i}}`).join(String(a)); });
  return s;
}
/** translate static markup: data-i18n (text), data-i18n-ph (placeholder), data-i18n-aria (aria-label) */
function applyI18n(root = document) {
  applyTexts(root);
  const nav = document.querySelector(".nav");
  if (nav && !document.querySelector(".langbtn")) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "langbtn"; b.lang = LANG === "en" ? "da" : "en";
    b.textContent = t("lang.button"); b.title = t("lang.title");
    b.addEventListener("click", flipLang);
    (nav.closest(".topbar-in") || nav).append(...infoDialog(), b);
  }
}
function applyTexts(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(n => { n.textContent = t(n.dataset.i18n); });
  root.querySelectorAll("[data-i18n-ph]").forEach(n => { n.placeholder = t(n.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-aria]").forEach(n => { n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
  document.documentElement.lang = LANG;
}

/** The language button swaps every interface text on screen instead of reloading, so filters, a flashcard round,
    a test or an open search stay exactly where they are. Texts are found by their wording in the other language;
    Danish or English content (lang="da" / lang="en") is left alone. */
function langPairs() {
  const pairs = Object.values(I18N).map(v => [v[0], v[1]]);           // [da, en]
  if (typeof PD3 !== "undefined") {
    for (const g of PD3.groups) pairs.push([g.name_da, g.name_en], [`${g.name_da} · ${g.name_en}`, `${g.name_en} · ${g.name_da}`],
      [`${g.name_da} – ${g.name_en}`, `${g.name_en} – ${g.name_da}`]);
    for (const w of PD3.words) if (w.word_order) pairs.push([w.word_order.note_da, w.word_order.note_en]);
    for (const [en, da] of Object.values((PD3.raw.coach || {}).groups || {})) pairs.push([da, en]);
  }
  return pairs;
}
function flipLang() {
  const to = LANG === "en" ? "da" : "en", [fi, ti] = to === "en" ? [0, 1] : [1, 0];
  const exact = new Map(), pats = [];
  for (const p of langPairs()) {
    const a = p[fi], b = p[ti];
    if (!a || !b || a === b || /<[a-z]/i.test(a)) continue;
    if (/\{\d\}/.test(a)) {
      const idx = [], re = a.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\d)\}/g, (_, i) => { idx.push(i); return "(.+?)"; });
      pats.push([new RegExp("^" + re + "$"), b, idx]);
    } else {
      exact.set(a.trim(), b.trim());
      exact.set(a.trim().replace(/:$/, ""), b.trim().replace(/:$/, ""));   // labels used without their colon ("Brug")
    }
  }
  const one = k => {
    if (exact.has(k)) return exact.get(k);
    for (const [re, b, idx] of pats) {
      const m = re.exec(k), v = {};
      if (m) { idx.forEach((i, j) => { v[i] = m[j + 1]; }); return b.replace(/\{(\d)\}/g, (_, i) => v[i] ?? ""); }
    }
    return null;
  };
  // whole text first; then without a leading symbol, a trailing arrow/colon or a "(Tier 1)" note;
  // then compounds part by part ("Årsag · Reason", "a — b")
  const bare = k => {
    const r = one(k);
    if (r != null) return r;
    const m = /^([^\p{L}\p{N}“"(]*)(.*?)((?:\s*\([^()]*\))?[\s:→←›…]*)$/u.exec(k);
    if (m && (m[1] || m[3]) && m[2]) { const x = one(m[2]); if (x != null) return m[1] + x + m[3]; }
    return null;
  };
  const tr = s => {
    const k = s.trim();
    if (!k) return null;
    let out = bare(k);
    for (const sep of [" · ", " — ", " – "]) {
      if (out != null || !k.includes(sep)) continue;
      const parts = k.split(sep), got = parts.map(x => bare(x.trim()) ?? x);
      if (got.some((x, i) => x !== parts[i])) out = got.join(sep);
    }
    return out == null ? null : s.replace(k, out);
  };
  const content = n => { const l = n.closest("[lang]"); return l && l !== document.documentElement; };
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    const el = n.parentElement;
    if (!el || el.closest("script, style") || content(el)) continue;
    const r = tr(n.nodeValue); if (r != null) n.nodeValue = r;
  }
  document.body.querySelectorAll("[title], [aria-label], [placeholder]").forEach(el => {
    if (content(el)) return;
    for (const a of ["title", "aria-label", "placeholder"]) { const v = el.getAttribute(a); const r = v && tr(v); if (r != null) el.setAttribute(a, r); }
  });
  const title = tr(document.title); if (title != null) document.title = title;
  LANG = to;
  try { localStorage.setItem("pd3.lang", to); } catch (e) { /* ignore */ }
  applyTexts();
  const b = document.querySelector(".langbtn");
  b.lang = to === "en" ? "da" : "en"; b.textContent = t("lang.button"); b.title = t("lang.title");
}

/** ⓘ button in the top bar that opens a help dialog: page-specific help (#infoExtra) + the abbreviations key */
function infoDialog() {
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "iconbtn"; btn.title = t("info.open"); btn.setAttribute("aria-label", t("info.open"));
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg>';
  const dlg = document.createElement("dialog");
  dlg.className = "info"; dlg.setAttribute("aria-labelledby", "infoTitle");
  const head = document.createElement("div"); head.className = "ih";
  const h = document.createElement("h2"); h.id = "infoTitle"; h.textContent = t("info.title");
  const x = document.createElement("button"); x.type = "button"; x.className = "btn quiet"; x.textContent = t("info.close");
  x.addEventListener("click", () => dlg.close());
  head.append(h, x);
  const extra = document.createElement("div"); extra.id = "infoExtra";
  const lh = document.createElement("h3"); lh.textContent = t("lg.title");
  const dl = document.createElement("dl"); dl.className = "keylist";
  const rows = [["L1", "lg.L1"], ["L2A", "lg.L2A"], ["L2B", "lg.L2B"], ["L3", "lg.L3"],
                ["Tier 1", "lg.T1"], ["Tier 2", "lg.T2"], ["Tier 3", "lg.T3"], [LANG === "en" ? "4 exams · 52×" : "4 prøver · 52×", "lg.freq"],
                ["AI", "lg.ai"], ["nogen · noget", "lg.nogen"], ["at + sætning · hv + sætning · at + infinitiv", "lg.saetning"]];
  for (const [k, v] of rows) {
    const dt = document.createElement("dt"); dt.textContent = k;
    const dd = document.createElement("dd"); dd.textContent = t(v);
    dl.append(dt, dd);
  }
  const inner = document.createElement("div"); inner.className = "ib";   // full-size inner box, so only backdrop clicks hit the dialog itself
  inner.append(head, extra, lh, dl);
  dlg.append(inner);
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });   // click on the backdrop
  btn.addEventListener("click", () => dlg.showModal());
  document.body.append(dlg);
  return [btn];
}
