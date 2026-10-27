"""Tier 2/3 candidate list: every word in the in-scope exams, clustered by stem, with the tier it qualifies for.

Output: reports/candidates_t23.md (ranked list for curation) and WORK/candidates_t23.json.
The lexicon files (src/lexicon/tier2_*.txt, tier3_*.txt) are written by hand from this list.
"""
import collections, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B                       # noqa: E402
import build_t23 as T                   # noqa: E402
from tokens import WORD, stem, located_units, load  # noqa: E402


def main():
    units = list(located_units(load()))
    clusters = collections.defaultdict(lambda: {"forms": collections.Counter(), "occ": collections.Counter(), "caps": 0, "n": 0})
    for e, p, l, text in units:
        for m in WORD.finditer(text):
            tok = m.group(0)
            c = clusters[stem(tok)]
            c["forms"][tok.lower()] += 1
            c["occ"][(e, p, l)] += 1
            c["n"] += 1
            # capitalised away from the start of the unit → probably a name
            if tok[0].isupper() and m.start() > 0 and text[m.start() - 2:m.start()].strip() not in (".", "!", "?", ":", "”", '"'):
                c["caps"] += 1
    t1 = json.load(open(os.path.join(B.ROOT, "data", "words.json"), encoding="utf-8"))
    t1_forms = {f.lower() for w in t1 for f in w["forms"]}
    rows = []
    for st, c in clusters.items():
        tier = T.classify(c["occ"])
        if tier is None:
            continue
        forms = [f for f, _ in c["forms"].most_common()]
        if all(f in t1_forms for f in forms):
            continue
        if len(st) < 3 or any(ch.isdigit() for ch in st):
            continue
        fb = B.freq_block(c["occ"])
        rows.append({"stem": st, "tier": tier, "forms": forms, "total": c["n"], "name_ratio": round(c["caps"] / c["n"], 2),
                     "exams": fb["exams"], "score": fb["weighted_question_score"],
                     "l3_option": any(p == "L3" and l == "option" for (e, p, l) in c["occ"]),
                     "parts": sorted(fb["by_part"])})
    rows.sort(key=lambda r: (r["tier"], -r["l3_option"], -r["score"], -r["exams"], -r["total"]))
    json.dump(rows, open(os.path.join(B.WORK, "candidates_t23.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    L = ["# Tier 2/3 candidates (before curation)", "", f"{sum(r['tier'] == 2 for r in rows)} Tier 2 · {sum(r['tier'] == 3 for r in rows)} Tier 3", "",
         "| tier | forms | exams | total | score | L3 opt | parts | name? |", "|---|---|---|---|---|---|---|---|"]
    for r in rows:
        L.append(f"| {r['tier']} | {', '.join(r['forms'][:5])} | {r['exams']} | {r['total']} | {r['score']:g} | "
                 f"{'✓' if r['l3_option'] else ''} | {' '.join(r['parts'])} | {r['name_ratio']:g} |")
    open(os.path.join(B.ROOT, "reports", "candidates_t23.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
    print(L[2])


if __name__ == "__main__":
    main()
