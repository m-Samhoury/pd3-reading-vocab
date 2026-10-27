"""Per-word facts for the curated Tier 2/3 selection: DDO class/gender/inflection/senses + exam contexts.

Output: WORK/t23_facts.json – the working sheet used to write src/lexicon/tier2_*.txt and tier3_*.txt.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B                                    # noqa: E402
import build_t23 as T                                # noqa: E402
import ddo                                           # noqa: E402
from ddo_entries import _articles, _class_key, GENDER  # noqa: E402
from tokens import located_units, load               # noqa: E402

SEL = os.path.join(B.SRC, "lexicon", "selection_t23.txt")
OUT = os.path.join(B.WORK, "t23_facts.json")


def selection():
    for line in open(SEL, encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            f = [x.strip() for x in line.split("|")] + ["", ""]
            yield f[0], f[1], int(f[2]), f[3] or f[0], f[4] or "exam"


def derived(forms, cls):
    """regular forms DDO's Bøjning line leaves out: passive -s, participles -ende/-ede, genitive -s"""
    out = []
    if cls == "verbum":
        inf = forms[0]
        out += [inf + "s", (inf if inf.endswith("e") else inf + "e") + "nde"]
        # participle in -t (afgjort → afgjorte); participles in -et already have their -ede form from DDO
        out += [f + "e" for f in forms[1:] if f.endswith("t") and not f.endswith("et")]
    elif cls == "substantiv":
        out += [f + "s" for f in forms if not f.endswith("s")]
    return out


def main():
    units = list(located_units(load()))
    res = {}
    for lemma, cls, tier, query, source in selection():
        arts = [a for a in _articles(ddo._fetch(query)) if a["senses"] and a["kind"] == "word"]
        same = [a for a in arts if a["head"] == lemma and _class_key(a["pos"]) == _class_key(cls)]
        related = None if same else next((a for a in arts if a["head"] == query), None)
        a = same[0] if same else None
        forms = [lemma]
        if a:
            for fs in a["forms"]:
                for f in fs:
                    if f and f not in forms:
                        forms.append(f)
        forms = forms + [f for f in derived(forms, cls) if f not in forms]
        occ, sents = B.scan(units, T.form_regex(forms))
        res[lemma] = {
            "class": cls, "planned_tier": tier, "rule_tier": T.classify(occ), "query": query, "source": source,
            "ddo_found": bool(a), "pos": a["pos"] if a else "",
            "gender": next((v for k, v in GENDER.items() if a and k in a["pos"]), None),
            "inflection": a["inflection"] if a else "", "forms": forms,
            "senses": [{"no": s["no"], "def": s["definition"]} for s in ((a or related or {}).get("senses") or [])][:8],
            "ddo_head": (a or related or {}).get("head", ""),
            "contexts": [s["text"] for s in B.pick_sentences(sents, 3)],
            "total": sum(occ.values()), "exams": len({e for (e, p, l) in occ}),
        }
    json.dump(res, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    miss = [k for k, v in res.items() if not v["ddo_found"]]
    off = [(k, v["rule_tier"]) for k, v in res.items() if v["rule_tier"] != v["planned_tier"] and v["source"] != "guide"]
    print(f"{len(res)} words · DDO matched {len(res) - len(miss)} · no DDO match: {miss}")
    print("tier differs from plan (word, tier by rule):", off)


if __name__ == "__main__":
    main()
