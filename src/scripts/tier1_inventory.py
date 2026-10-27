"""Tier 1 – connector inventory (forbinderord).

Each entry: lemma, word class, word-order type, relation group(s), regex (case-insensitive,
run per sentence/unit) and whether the Sokolova guide names it (pages 15, 16, 22, 23).
Only entries that occur in the exams, or that the guide names, are kept in words.json.

order types
  sub   – subordinating conjunction: ledsætningsordstilling (subject – adverb – verb)
  coord – coordinating conjunction: no inversion, normal main-clause order follows
  adv   – connecting adverb: inversion (verb before subject) when it opens the sentence,
          otherwise placed after the finite verb
  mid   – connecting adverb that normally stands after the finite verb (not first)
  prep  – prepositional connector: + noun phrase / infinitive / at-clause; inversion if first
  corr  – correlative pair
  inf   – + infinitive
"""

B = r"(?<![\wæøå])"   # word boundary that understands æøå
E = r"(?![\wæøå])"


def w(s):
    return B + s.replace(" ", r"\s+") + E


START = r"(?:^|[.,;:–—]\s*|”\s*)"

INVENTORY = [
    # ── Årsag / Reason ──────────────────────────────────────────────
    ("fordi", "konjunktion (underordnende)", "sub", ["arsag"], w("fordi"), False),
    ("da", "konjunktion (underordnende)", "sub", ["arsag", "tid"], START + r"da" + E, False),
    ("eftersom", "konjunktion (underordnende)", "sub", ["arsag"], w("eftersom"), False),
    ("idet", "konjunktion (underordnende)", "sub", ["arsag", "tid"], w("idet"), False),
    ("siden", "konjunktion (underordnende)", "sub", ["arsag", "tid"], START + r"siden" + E, False),
    ("for", "konjunktion (sideordnende)", "coord", ["arsag"],
     r"(?:,\s*|^)for\s+(?:det|de|der|han|hun|vi|man|jeg|den|dette|så|mange|ellers|hvis|når|selvom)" + E, False),
    ("nemlig", "adverbium", "mid", ["arsag"], w("nemlig"), True),
    ("i og med (at)", "konjunktion (underordnende)", "sub", ["arsag"], w("i og med"), False),
    ("på grund af", "præpositionsforbindelse", "prep", ["arsag"], w("på grund af") + "|" + w("pga\\."), False),
    ("som følge af", "præpositionsforbindelse", "prep", ["arsag"], w("som følge af"), False),
    ("takket være", "præpositionsforbindelse", "prep", ["arsag"], w("takket være"), False),
    ("af den grund", "adverbiel forbindelse", "adv", ["konsekvens"], w("af den grund"), True),
    ("årsagen er", "fast udtryk", "adv", ["arsag"], w("årsagen (?:er|var)"), False),
    # ── Konsekvens / Consequence ────────────────────────────────────
    ("så", "konjunktion (sideordnende) / adverbium", "coord", ["konsekvens", "tid"],
     r"(?:,\s*|^)så" + E + r"(?!\s+(?:meget|mange|stor|store|godt|lidt|længe|langt|nemt|svært|vigtig\w*|tidligt|sent|ofte|hurtigt|relativt|ens|man\s+ikke\s+kan))", True),
    ("derfor", "adverbium", "adv", ["konsekvens"], w("derfor"), True),
    ("dermed", "adverbium", "adv", ["konsekvens"], w("dermed"), True),
    ("således", "adverbium", "adv", ["konsekvens", "sammenligning"], w("således"), True),
    ("følgelig", "adverbium", "adv", ["konsekvens"], w("følgelig"), True),
    ("derved", "adverbium", "adv", ["konsekvens"], w("derved"), False),
    ("hermed", "adverbium", "adv", ["konsekvens"], w("hermed"), False),
    ("hvorfor", "adverbium (relativt)", "sub", ["konsekvens"], r",\s*hvorfor" + E, False),
    ("hvilket", "pronomen (relativt)", "sub", ["konsekvens"], r",\s*hvilket" + E, False),
    ("altså", "adverbium", "adv", ["konsekvens", "forklaring"], w("altså"), False),
    ("det betyder (at)", "fast udtryk", "adv", ["konsekvens"], w("det betyder") + "|" + w("hvilket betyder"), False),
    # ── Modsætning / Contrast ───────────────────────────────────────
    ("men", "konjunktion (sideordnende)", "coord", ["modsaetning"], w("men"), True),
    ("imidlertid", "adverbium", "adv", ["modsaetning"], w("imidlertid"), True),
    ("dog", "adverbium", "mid", ["modsaetning", "indrommelse"], w("dog"), True),
    ("derimod", "adverbium", "adv", ["modsaetning"], w("derimod"), True),
    ("til gengæld", "adverbiel forbindelse", "adv", ["modsaetning"], w("til gengæld"), True),
    ("omvendt", "adverbium", "adv", ["modsaetning"], w("omvendt"), True),
    ("i modsætning til", "præpositionsforbindelse", "prep", ["modsaetning"], w("i modsætning til"), True),
    ("hvorimod", "konjunktion (underordnende)", "sub", ["modsaetning"], w("hvorimod"), True),
    ("mens", "konjunktion (underordnende)", "sub", ["modsaetning", "tid"], w("mens"), True),
    ("imens", "konjunktion / adverbium", "sub", ["tid", "modsaetning"], w("imens"), True),
    ("på den ene side", "adverbiel forbindelse", "adv", ["modsaetning"], w("på den ene side"), True),
    ("på den anden side", "adverbiel forbindelse", "adv", ["modsaetning"], w("på den anden side"), True),
    ("tværtimod", "adverbium", "adv", ["modsaetning"], w("tværtimod"), False),
    ("modsat", "adverbium / adjektiv", "adv", ["modsaetning"], w("modsat"), False),
    ("i stedet (for)", "adverbiel forbindelse", "prep", ["modsaetning", "udelukkelse"], w("i stedet"), False),
    ("snarere", "adverbium", "mid", ["modsaetning"], w("snarere"), False),
    # ── Indrømmelse / Concession ───────────────────────────────────
    ("selvom", "konjunktion (underordnende)", "sub", ["indrommelse"], w("selvom") + "|" + w("selv om"), True),
    ("alligevel", "adverbium", "adv", ["indrommelse"], w("alligevel"), True),
    ("ikke desto mindre", "adverbiel forbindelse", "adv", ["indrommelse"], w("ikke desto mindre"), True),
    ("trods", "præposition", "prep", ["indrommelse"], r"(?<!\bi\s)" + w("trods") + r"(?!\s+alt)", False),
    ("uanset", "præposition / konjunktion", "sub", ["indrommelse", "betingelse"], w("uanset"), False),
    ("om end", "konjunktion (underordnende)", "sub", ["indrommelse"], w("om end"), False),
    ("godt nok", "adverbiel forbindelse", "mid", ["indrommelse"], w("godt nok"), False),
    ("ganske vist", "adverbiel forbindelse", "mid", ["indrommelse"], w("ganske vist"), False),
    ("stadig(væk)", "adverbium", "mid", ["indrommelse", "tid"], w("stadigvæk") + "|" + w("stadig"), True),
    ("trods alt", "adverbiel forbindelse", "mid", ["indrommelse"], w("trods alt"), False),
    # ── Sammenligning / Comparison ─────────────────────────────────
    ("også", "adverbium", "mid", ["sammenligning", "tilfojelse"], w("også"), True),
    ("ligesom", "konjunktion / adverbium", "sub", ["sammenligning"], w("ligesom"), True),
    ("ligeledes", "adverbium", "adv", ["sammenligning"], w("ligeledes"), True),
    ("til sammenligning", "adverbiel forbindelse", "adv", ["sammenligning"], w("til sammenligning"), True),
    ("sammenlignet med", "præpositionsforbindelse", "prep", ["sammenligning"], w("sammenlignet med"), False),
    ("i forhold til", "præpositionsforbindelse", "prep", ["sammenligning"], w("i forhold til") + "|" + w("ift\\."), True),
    ("på samme måde", "adverbiel forbindelse", "adv", ["sammenligning"], w("på samme måde"), False),
    ("tilsvarende", "adverbium / adjektiv", "adv", ["sammenligning"], w("tilsvarende"), False),
    ("heller ikke", "adverbiel forbindelse", "mid", ["sammenligning"], w("heller ikke"), True),
    ("både … og", "konjunktion (korrelativ)", "corr", ["sammenligning", "tilfojelse"], w("både") + r"[^.?!]*?" + w("og"), True),
    ("hverken … eller", "konjunktion (korrelativ)", "corr", ["sammenligning", "udelukkelse"], w("hverken") + r"[^.?!]*?" + w("eller"), True),
    ("end", "konjunktion (underordnende)", "sub", ["sammenligning"], w("end"), False),
    ("som om", "konjunktion (underordnende)", "sub", ["sammenligning"], w("som om"), False),
    # ── Betingelse / Condition ─────────────────────────────────────
    ("hvis", "konjunktion (underordnende)", "sub", ["betingelse"], w("hvis"), False),
    ("medmindre", "konjunktion (underordnende)", "sub", ["betingelse", "udelukkelse"], w("medmindre"), False),
    ("såfremt", "konjunktion (underordnende)", "sub", ["betingelse"], w("såfremt"), False),
    ("forudsat (at)", "konjunktion (underordnende)", "sub", ["betingelse"], w("forudsat at"), False),
    ("når", "konjunktion (underordnende)", "sub", ["tid", "betingelse"], w("når"), False),
    ("i tilfælde af", "præpositionsforbindelse", "prep", ["betingelse"], w("i tilfælde af") + "|" + w("i så fald"), False),
    ("ellers", "adverbium", "adv", ["betingelse"], w("ellers"), False),
    ("om (konj.)", "konjunktion (underordnende)", "sub", ["forklaring"], r"(?:,\s*|^)om" + E + r"(?!\s+(?:året|dagen|ugen|morgenen|aftenen|natten|sommeren|vinteren))", True),
    ("hvorvidt", "konjunktion (underordnende)", "sub", ["forklaring"], w("hvorvidt"), True),
    # ── Formål / Purpose ───────────────────────────────────────────
    ("for at", "infinitivforbindelse", "inf", ["betingelse"], w("for at"), False),
    ("med henblik på", "præpositionsforbindelse", "prep", ["betingelse"], w("med henblik på"), False),
    ("med det formål (at)", "fast udtryk", "prep", ["betingelse"], w("med det formål"), False),
    # ── Tilføjelse / Addition & inclusion ──────────────────────────
    ("og", "konjunktion (sideordnende)", "coord", ["tilfojelse"], w("og"), False),
    ("desuden", "adverbium", "adv", ["tilfojelse"], w("desuden"), True),
    ("derudover", "adverbium", "adv", ["tilfojelse"], w("derudover") + "|" + w("der udover"), False),
    ("herudover", "adverbium", "adv", ["tilfojelse"], w("herudover"), True),
    ("endvidere", "adverbium", "adv", ["tilfojelse"], w("endvidere"), False),
    ("ydermere", "adverbium", "adv", ["tilfojelse"], w("ydermere"), False),
    ("samtidig", "adverbium", "adv", ["tid", "tilfojelse"], w("samtidig") + "|" + w("samtidigt"), True),
    ("i øvrigt", "adverbiel forbindelse", "mid", ["tilfojelse"], w("i øvrigt"), False),
    ("samt", "konjunktion (sideordnende)", "coord", ["tilfojelse"], w("samt"), False),
    ("ikke alene … men også", "konjunktion (korrelativ)", "corr", ["tilfojelse"],
     w("ikke alene") + "|" + w("ikke kun") + r"[^.?!]*?" + w("men også") + "|" + w("ikke bare") + r"[^.?!]*?" + w("men også"), False),
    ("blandt andet", "adverbiel forbindelse", "mid", ["tilfojelse"], w("blandt andet") + "|" + w("bl\\.a\\."), False),
    ("for eksempel", "adverbiel forbindelse", "mid", ["tilfojelse"], w("for eksempel") + "|" + w("fx") + "|" + w("f\\.eks\\."), False),
    ("eksempelvis", "adverbium", "mid", ["tilfojelse"], w("eksempelvis"), False),
    ("herunder", "adverbium", "adv", ["tilfojelse"], w("herunder"), False),
    ("især", "adverbium", "mid", ["tilfojelse"], w("især"), False),
    ("endda", "adverbium", "mid", ["tilfojelse"], w("endda") + "|" + w("endog"), False),
    ("oven i købet", "adverbiel forbindelse", "mid", ["tilfojelse"], w("oven i købet"), False),
    ("også selvom", "konjunktion (underordnende)", "sub", ["indrommelse"], w("også selvom"), False),
    # ── Udelukkelse / Exclusion ────────────────────────────────────
    ("undtagen", "præposition", "prep", ["udelukkelse"], w("undtagen"), False),
    ("bortset fra", "præpositionsforbindelse", "prep", ["udelukkelse"], w("bortset fra"), False),
    ("frem for", "præpositionsforbindelse", "prep", ["udelukkelse"], w("frem for") + "|" + w("fremfor"), False),
    ("uden (at)", "præposition / konjunktion", "prep", ["udelukkelse"], w("uden at"), False),
    ("enten … eller", "konjunktion (korrelativ)", "corr", ["udelukkelse"], w("enten") + r"[^.?!]*?" + w("eller"), False),
    ("eller", "konjunktion (sideordnende)", "coord", ["udelukkelse"], w("eller"), False),
    # ── Holdning / Attitude ────────────────────────────────────────
    ("heldigvis", "adverbium", "mid", ["holdning"], w("heldigvis"), False),
    ("desværre", "adverbium", "mid", ["holdning"], w("desværre"), False),
    ("faktisk", "adverbium", "mid", ["holdning"], w("faktisk"), False),
    ("selvfølgelig", "adverbium", "mid", ["holdning"], w("selvfølgelig"), False),
    ("naturligvis", "adverbium", "mid", ["holdning"], w("naturligvis"), False),
    ("måske", "adverbium", "mid", ["holdning"], w("måske"), False),
    ("sandsynligvis", "adverbium", "mid", ["holdning"], w("sandsynligvis"), False),
    ("formentlig", "adverbium", "mid", ["holdning"], w("formentlig"), False),
    ("tilsyneladende", "adverbium", "mid", ["holdning"], w("tilsyneladende"), False),
    ("åbenbart", "adverbium", "mid", ["holdning"], w("åbenbart"), False),
    ("egentlig", "adverbium", "mid", ["holdning"], w("egentlig") + "|" + w("egentligt"), False),
    ("i hvert fald", "adverbiel forbindelse", "mid", ["holdning"], w("i hvert fald"), False),
    ("ifølge", "præposition", "prep", ["holdning"], w("ifølge"), False),
    ("umiddelbart", "adverbium", "mid", ["holdning", "tid"], w("umiddelbart"), False),
    ("rent faktisk", "adverbiel forbindelse", "mid", ["holdning"], w("rent faktisk"), False),
    ("i virkeligheden", "adverbiel forbindelse", "mid", ["holdning"], w("i virkeligheden"), False),
    ("tilfældigvis", "adverbium", "mid", ["holdning"], w("tilfældigvis"), True),
    ("næppe", "adverbium", "mid", ["holdning"], w("næppe"), True),
    ("overraskende nok", "adverbiel forbindelse", "adv", ["holdning"], w("overraskende nok"), False),
    ("generelt", "adverbium", "mid", ["holdning"], w("generelt") + "|" + w("generelt set"), False),
    ("især", None, None, None, None, None),   # placeholder removed below (kept in tilføjelse)
    # ── Tid / Rækkefølge ───────────────────────────────────────────
    ("først", "adverbium", "adv", ["tid"], w("først") + r"(?!\s+og\s+fremmest)", False),
    ("for det første", "adverbiel forbindelse", "adv", ["tid"], w("for det første") + "|" + w("for det andet"), True),
    ("først og fremmest", "adverbiel forbindelse", "adv", ["tid", "holdning"], w("først og fremmest"), False),
    ("dernæst", "adverbium", "adv", ["tid"], w("dernæst"), False),
    ("derefter", "adverbium", "adv", ["tid"], w("derefter") + "|" + w("bagefter"), False),
    ("herefter", "adverbium", "adv", ["tid"], w("herefter"), True),
    ("til sidst", "adverbiel forbindelse", "adv", ["tid"], w("til sidst") + "|" + w("til slut"), False),
    ("endelig", "adverbium", "adv", ["tid", "tilfojelse"], w("endelig"), False),
    ("efterhånden", "adverbium", "mid", ["tid"], w("efterhånden"), False),
    ("efter at", "konjunktion (underordnende)", "sub", ["tid"], w("efter at"), False),
    ("før", "konjunktion / præposition", "sub", ["tid"], w("før"), False),
    ("inden", "konjunktion / præposition", "sub", ["tid"], w("inden") + r"(?!\s+for)", False),
    ("indtil", "konjunktion / præposition", "sub", ["tid"], w("indtil"), False),
    ("i mellemtiden", "adverbiel forbindelse", "adv", ["tid"], w("i mellemtiden"), False),
    ("hidtil", "adverbium", "mid", ["tid"], w("hidtil"), False),
    ("fremover", "adverbium", "mid", ["tid"], w("fremover") + "|" + w("fremadrettet"), False),
    ("så snart", "konjunktion (underordnende)", "sub", ["tid"], w("så snart"), False),
    ("i dag", "adverbiel forbindelse", "adv", ["tid"], None, False),
    # ── Forklaring / Explanation & reformulation (extra group) ──────
    ("med andre ord", "adverbiel forbindelse", "adv", ["forklaring"], w("med andre ord"), False),
    ("det vil sige", "adverbiel forbindelse", "mid", ["forklaring"], w("det vil sige") + "|" + w("dvs\\."), False),
    ("som nævnt", "adverbiel forbindelse", "adv", ["forklaring"], w("som nævnt"), True),
    ("kort sagt", "adverbiel forbindelse", "adv", ["forklaring"], w("kort sagt") + "|" + w("kort fortalt"), False),
    ("i form af", "præpositionsforbindelse", "prep", ["forklaring"], w("i form af"), False),
]

# drop placeholders / entries without a pattern
INVENTORY = [e for e in INVENTORY if e[1] and e[4]]
_seen = set()
INVENTORY = [e for e in INVENTORY if not (e[0] in _seen or _seen.add(e[0]))]

RELATIONS = [
    ("arsag", "Årsag", "Reason / cause"),
    ("konsekvens", "Konsekvens", "Consequence"),
    ("modsaetning", "Modsætning", "Contrast"),
    ("indrommelse", "Indrømmelse", "Concession"),
    ("sammenligning", "Sammenligning", "Comparison"),
    ("betingelse", "Betingelse & formål", "Condition & purpose"),
    ("tilfojelse", "Tilføjelse", "Addition / inclusion"),
    ("udelukkelse", "Udelukkelse", "Exclusion"),
    ("holdning", "Holdning", "Attitude / stance"),
    ("tid", "Tid / Rækkefølge", "Time / sequence"),
    ("forklaring", "Forklaring / Uddybning", "Explanation / reformulation"),
]
