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
  "info.close": ["Luk", "Close"], "th.dark": ["Skift til mørk tilstand", "Switch to dark mode"], "th.light": ["Skift til lys tilstand", "Switch to light mode"], "info.how": ["Sådan virker det", "How it works"],
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
    const theme = document.createElement("button");
    theme.type = "button"; theme.className = "iconbtn themebtn";
    theme.addEventListener("click", () => {
      const to = isDark() ? "light" : "dark";
      document.documentElement.dataset.theme = to;
      try { localStorage.setItem("pd3.theme", to); } catch (e) { /* ignore */ }
      themeButton();
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeButton);
    (nav.closest(".topbar-in") || nav).append(...infoDialog(), theme, b);
    themeButton();
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
  themeButton();
}

// light / dark: follows the system until the button is used; the choice is kept in localStorage "pd3.theme" (shared with Guidet læring)
const isDark = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
function themeButton() {
  const b = document.querySelector(".themebtn"); if (!b) return;
  const dark = isDark(), label = t(dark ? "th.light" : "th.dark");
  b.title = label; b.setAttribute("aria-label", label);
  b.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dark
    ? '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'
    : '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'}</svg>`;
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

/* Shared helpers – data access, DOM building, entry rendering and safe storage. */
const PD3 = (() => {
  const raw = window.PD3_RAW || JSON.parse(document.getElementById("pd3-data").textContent);
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
