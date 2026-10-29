"""Build data/words.json + data/groups.json + reports from the lexicon files.

Tier 1: connector inventory (tier1_inventory.py) + work/lexicon/tier1_*.txt
Tier 2/3: work/lexicon/tier2_*.txt / tier3_*.txt (each entry lists its inflected forms)
"""
import collections, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tokens import load, located_units, WORD          # noqa: E402
from tier1_inventory import INVENTORY, RELATIONS       # noqa: E402
import ddo                                             # noqa: E402

from paths import REPO as ROOT, SRC, WORK  # noqa: E402
LEX = os.path.join(SRC, "lexicon")
EXAM_ORDER = ["2022v", "2023s", "2023v", "2024s"]
EXAM_LABEL = {"2022v": "Nov–Dec 2022", "2023s": "May–Jun 2023", "2023v": "Nov–Dec 2023", "2024s": "May–Jun 2024"}
# weight of one occurrence by location (Tier 2 ranking): L3 options/gaps count most
WEIGHT = {("L3", "option"): 4, ("L3", "gap"): 3, ("L2B", "option"): 2, ("L2A", "option"): 2,
          ("L2A", "question"): 2, ("L1", "question"): 1.5}
REGISTERS = {"neutral", "formal", "bookish", "spoken"}

# ── word-order notes for Tier 1 ─────────────────────────────────────
WO = {
    "sub": ("Underordnende konjunktion → ledsætningsordstilling: subjekt + ikke/adverbium + verbum. "
            "Står ledsætningen først, kommer der inversion i hovedsætningen bagefter.",
            "Subordinating conjunction → subordinate-clause order: subject + 'ikke'/adverb + verb. "
            "If the clause comes first, the following main clause is inverted (verb before subject)."),
    "coord": ("Sideordnende konjunktion → ingen inversion: almindelig hovedsætningsordstilling "
              "(subjekt + verbum + ikke) efter ordet.",
              "Coordinating conjunction → no inversion: normal main-clause order (subject + verb + 'ikke') follows."),
    "adv": ("Forbindende adverbium. Står det først i sætningen → inversion (verbum før subjekt). "
            "Inde i sætningen står det efter det finitte verbum.",
            "Connecting adverb. First in the sentence it triggers inversion (verb before subject); "
            "inside the sentence it goes after the finite verb."),
    "mid": ("Sætningsadverbial: står normalt efter det finitte verbum (efter subjektet ved inversion). "
            "Står det først, kommer der inversion.",
            "Sentence adverb: normally placed after the finite verb (after the subject when inverted). "
            "If it starts the sentence, the verb comes before the subject."),
    "prep": ("Præpositionsforbindelse: efterfølges af et substantiv, en infinitiv eller en at-sætning – "
             "ikke direkte af en hel sætning. Står den først, giver det inversion i hovedsætningen.",
             "Prepositional connector: followed by a noun phrase, an infinitive or an 'at'-clause – not directly by a "
             "full clause. Placed first, it makes the main clause inverted."),
    "corr": ("Parkonjunktion: bruges i par og forbinder led af samme slags. Ingen særlig ordstilling.",
             "Correlative pair: used as a pair to link parts of the same kind. No special word order."),
    "inf": ("Efterfølges af en infinitiv (for at + infinitiv). Står 'for at …' først, giver det inversion.",
            "Followed by an infinitive (for at + infinitive). Placed first, it makes the main clause inverted."),
}
WO_OVERRIDE = {
    "nemlig": ("Står altid efter det finitte verbum – kan ikke stå først i sætningen.",
               "Always placed after the finite verb – it can never start the sentence."),
    "så": ("Som konjunktion (= derfor): ingen inversion (…, så jeg blev hjemme). Som adverbium (= derefter / i "
           "hovedsætning efter hvis-sætning): inversion (Så gik vi hjem).",
           "As a conjunction (= so, therefore): no inversion. As an adverb (= then): inversion (Så gik vi hjem)."),
    "da": ("Som konjunktion (= fordi / dengang): ledsætningsordstilling. Som adverbium (= dengang, så): inversion.",
           "As a conjunction (= as/when): subordinate-clause order. As an adverb (= then): inversion."),
    "dog": ("Står normalt efter det finitte verbum (Det er dog ikke …). Kan stå først med inversion, men det er sjældent.",
            "Normally after the finite verb. It can start the sentence (with inversion), but that is rare."),
    "for": ("Sideordnende konjunktion (= fordi): ingen inversion, og den kan ikke stå først i sætningen.",
            "Coordinating conjunction (= because): no inversion, and it cannot start the sentence."),
    "hvilket": ("Relativt pronomen efter komma: ledsætningsordstilling (…, hvilket ikke er usædvanligt).",
                "Relative pronoun after a comma: subordinate-clause order."),
    "hvorfor": ("Efter komma (= og derfor): ledsætningsordstilling (…, hvorfor det ikke ses).",
                "After a comma (= which is why): subordinate-clause order."),
    "også": ("Står efter det finitte verbum (Det er også …). Kan stå først med inversion (Også politikerne er …).",
             "Goes after the finite verb. Can start the sentence with inversion."),
    "heller ikke": ("Står efter det finitte verbum (Der er heller ikke …). Står det først: inversion (Heller ikke han kom).",
                    "Goes after the finite verb. Placed first it causes inversion."),
}


def parse_lexicon(paths):
    entries, cur = {}, None
    for p in paths:
        for raw in open(p, encoding="utf-8"):
            line = raw.rstrip("\n")
            if not line.strip() or line.startswith("#"):
                continue
            if line.startswith("@ "):
                cur = {"lemma": line[2:].strip(), "senses": [], "meta": {}, "file": os.path.basename(p)}
                if cur["lemma"] in entries:
                    raise SystemExit(f"duplicate lemma {cur['lemma']}")
                entries[cur["lemma"]] = cur
            elif line.startswith("S: "):
                f = [x.strip() for x in line[3:].split(" | ")]
                if len(f) != 9:
                    raise SystemExit(f"{cur['lemma']}: sense has {len(f)} fields: {line[:80]}")
                lst = lambda s: [] if s == "-" else [x.strip() for x in s.split(";") if x.strip()]
                verified = not f[2].startswith("?")
                cur["senses"].append({
                    "group": f[0], "register": f[1], "da_definition": f[2].lstrip("? "),
                    "en_definition": f[3], "example_da": f[4], "example_en": f[5],
                    "collocations": lst(f[6]), "synonyms": lst(f[7]), "antonyms": lst(f[8]),
                    "verified_sense": verified})
            else:
                k, _, v = line.partition(":")
                cur["meta"][k.strip()] = v.strip()
    return entries


# ── DDO verification ────────────────────────────────────────────────
DDO_QUERY = {"både … og": "både", "hverken … eller": "hverken", "enten … eller": "enten",
             "ikke alene … men også": "alene", "stadig(væk)": "stadigvæk", "om (konj.)": "om",
             "i stedet (for)": "i stedet for", "uden (at)": "uden", "det betyder (at)": "betyde",
             "som følge af": "følge", "af den grund": "grund", "heller ikke": "heller", "blandt andet": "blandt",
             "på samme måde": "måde", "også selvom": "selvom", "overraskende nok": "nok",
             "som nævnt": "nævne", "efter at": "efter", "hvilket": "hvilken", "generelt": "generel", "umiddelbart": "umiddelbar"}
# expressions checked by searching the headword page (compositional ones such as "af den grund" and
# "overraskende nok" are verified through their headword: DDO grund / nok "[adjektiv] nok")
PHRASE_CHECK = {"som følge af", "heller ikke", "blandt andet", "på samme måde",
                "som nævnt", "ikke alene … men også", "på den anden side"}


def ddo_verify(lemma, query=None):
    q = query or DDO_QUERY.get(lemma, lemma)
    try:
        r = ddo.lookup(q)
    except Exception as e:                       # network problems → unverified
        return False, {"query": q, "error": str(e)}
    heads = [re.sub(r"\s*\d+$", "", a["head"]) for a in r.get("articles", [])]
    base = re.sub(r"^(at|en|et) ", "", q)
    title = (r.get("title") or "").lower()
    # a fixed expression has its own page (title = expression, senses, no headword block)
    phrase_page = bool(r.get("senses")) and not heads and base.lower() in title
    ok = base in heads or phrase_page
    if lemma in PHRASE_CHECK:
        needle = lemma.replace("ikke alene … men også", "ikke alene").replace("som nævnt", "som nævnt")
        ok = needle.lower() in ddo.page_text(q).lower()
        if not ok and lemma == "som nævnt":
            ok = "som nævnt" in ddo.page_text("som sagt").lower() or base in heads
    pos = next((a["pos"] for a in r.get("articles", []) if re.sub(r"\s*\d+$", "", a["head"]) == base), "")
    return bool(ok), {"query": q, "headword_found": base in heads, "pos": pos}


# ── occurrences ─────────────────────────────────────────────────────
def scan(units, rx):
    occ, sents = collections.Counter(), []
    for e, p, l, t in units:
        n = len(rx.findall(t))
        if n:
            occ[(e, p, l)] += n
            sents.append((e, p, l, t))
    return occ, sents


def pick_sentences(sents, k=3):
    pr = {"gap": 0, "option": 3, "question": 1, "text": 2}
    good = [s for s in sents if 30 <= len(s[3]) <= 230 and s[3][0].isupper() and s[3].rstrip()[-1:] in ".?!”\""]
    pool = good or [s for s in sents if len(s[3]) > 15]
    pool.sort(key=lambda s: (pr[s[2]], abs(len(s[3]) - 110)))
    out, seen_exam = [], set()
    for s in pool:                                    # spread across exams
        if s[0] in seen_exam and len(seen_exam) < 2:
            continue
        out.append({"exam": s[0], "part": s[1], "location": s[2], "text": re.sub(r"\s+", " ", s[3]).strip()})
        seen_exam.add(s[0])
        if len(out) == k:
            break
    return out


def freq_block(occ):
    by_part, by_loc, exams = collections.Counter(), collections.Counter(), set()
    weighted = 0.0
    for (e, p, l), n in occ.items():
        by_part[p] += n
        by_loc[l] += n
        exams.add(e)
        weighted += n * WEIGHT.get((p, l), 0)
    return {"exams": len(exams), "total": sum(occ.values()), "by_part": dict(by_part),
            "by_location": dict(by_loc), "weighted_question_score": weighted,
            "exam_list": [e for e in EXAM_ORDER if e in exams]}


def occ_list(occ):
    return [{"exam": e, "part": p, "location": l, "count": n}
            for (e, p, l), n in sorted(occ.items(), key=lambda x: (EXAM_ORDER.index(x[0][0]), x[0][1], x[0][2]))]


def slug(s):
    s = s.lower().replace("æ", "ae").replace("ø", "oe").replace("å", "aa")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def t1_forms(lemma):
    """Surface forms used to find a connector inside a sentence (gap-fill questions)."""
    if "…" in lemma:
        return [lemma.split("…")[0].strip()]
    base = re.sub(r"\s*\(.*?\)", "", lemma).strip()
    full = re.sub(r"[()]", "", lemma).replace("konj.", "").strip()
    forms = [full, base] if full != base else [base]
    if lemma == "stadig(væk)":
        forms = ["stadigvæk", "stadig"]
    if lemma == "for eksempel":
        forms = ["for eksempel", "fx"]
    return [f for f in forms if f]


def build_tier1(units, lex):
    words = []
    inv = {e[0]: e for e in INVENTORY}
    for lemma, (lem, cls, order, rels, pat, guide) in inv.items():
        rx = re.compile(pat, re.I | re.M)
        occ, sents = scan(units, rx)
        if not occ and not guide:
            continue
        if lemma not in lex:
            raise SystemExit(f"Tier 1 lemma without lexicon entry: {lemma}")
        L = lex[lemma]
        senses = L["senses"]
        ok, info = ddo_verify(lemma)
        groups = []
        for g in [s["group"] for s in senses] + rels:
            if g not in groups:
                groups.append(g)
        wo_da, wo_en = WO_OVERRIDE.get(lemma, WO[order])
        wox = L["meta"].get("wox", "")
        ex_da, _, ex_en = wox.partition("||")
        for i, s in enumerate(senses, 1):
            s["n"] = i
            s["verified"] = ok and s.pop("verified_sense")
        words.append({
            "id": "t1-" + slug(lemma), "lemma": lemma, "word_class": cls, "tier": 1,
            "display": lemma.replace(" (konj.)", ""), "forms": t1_forms(lemma),
            "source": ("exam+guide" if guide else "exam") if occ else "guide",
            "groups": groups, "primary_group": rels[0], "relations": rels,
            "word_order": {"type": order, "note_da": wo_da, "note_en": wo_en,
                           "example_da": ex_da.strip(), "example_en": ex_en.strip()},
            "frequency": freq_block(occ), "occurrences": occ_list(occ),
            "exam_sentences": pick_sentences(sents), "senses": senses,
            "verified": ok, "ddo": info, "guide": guide})
    return words


def main():
    seg = load()
    units = list(located_units(seg))
    lex1 = parse_lexicon(sorted(glob.glob(os.path.join(LEX, "tier1_*.txt"))))
    words = build_tier1(units, lex1)
    unused = set(lex1) - {w["lemma"] for w in words}
    if unused:
        print("lexicon entries not used (no exam hit, not guide):", sorted(unused))
    import build_t23
    words += build_t23.build(units, {w["lemma"] for w in words})
    # construction note ("con:" lines) for words where DDO lists no grammar pattern
    lex = {1: lex1, 2: parse_lexicon(sorted(glob.glob(os.path.join(LEX, "tier[23]_*.txt"))))}
    for w in words:
        con = lex[min(w["tier"], 2)].get(w["lemma"], {}).get("meta", {}).get("con")
        w["construction"] = [x.strip() for x in con.split("; ")] if con else []
    out = os.path.join(ROOT, "data")
    os.makedirs(out, exist_ok=True)
    groups = build_t23.groups(words, RELATIONS)
    with open(os.path.join(out, "words.json"), "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=1)
    with open(os.path.join(out, "groups.json"), "w", encoding="utf-8") as f:
        json.dump(groups, f, ensure_ascii=False, indent=1)
    build_t23.reports(words, groups, units)
    c = collections.Counter(w["tier"] for w in words)
    print("words:", len(words), dict(sorted(c.items())), "groups:", len(groups))


if __name__ == "__main__":
    main()
