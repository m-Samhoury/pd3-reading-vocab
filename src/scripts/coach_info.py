"""Dictionary facts for Guidet læring's deck, so its cards show the same blocks as the study sheet.

Reads the coach deck ($PD3_EXAMS/pd3-data/vocab.json + tips.json) and writes $PD3_EXAMS/pd3-data/wordinfo.json:
  {card id: {pos, gender, inflection, forms, grammar, construction, brug, brug_src, word}}
A card that is also on the study sheet takes that word's facts, construction note and Brug list (data/words.json +
DDO). Other cards take word class, en/et, bøjning and grammar patterns from their Den Danske Ordbog article, the
construction from the card's "Med:" line when DDO has no pattern, and Brug from DDO's short example phrases
(src/lexicon/coach_extra.txt fills word class and Brug where DDO has neither).
"""
import json, os, re, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ddo, ddo_entries as E  # noqa: E402
from paths import REPO, EXAMS, WORK  # noqa: E402

DATA = os.path.join(EXAMS, "pd3-data")


def _n(x):
    return re.sub(r"\s*\((konj|adv|præp)\.\)", "", x.lower()).replace("…", "...").strip()


def study_index():
    words = json.load(open(os.path.join(REPO, "data", "words.json"), encoding="utf-8"))
    ddo_e = json.load(open(os.path.join(WORK, "ddo_entries.json"), encoding="utf-8"))
    idx = {}
    for w in words:
        for k in (w["lemma"], w["display"], re.sub(r"\(([^)]*)\)", r"\1", w["lemma"]), re.sub(r"\s*\([^)]*\)", "", w["lemma"])):
            idx.setdefault(_n(k), (w, ddo_e.get(w["id"], {})))
    return idx


def from_study(w, d):
    forms = d.get("forms") or []
    if d.get("infl_from"):
        forms = forms if d.get("participle") else [list(dict.fromkeys(([d["infl_from"]] if not i else []) + x)) for i, x in enumerate(forms)]
    elif forms:
        forms = [[w["lemma"]] + fs for fs in forms]
    brug = list(dict.fromkeys(c for s in w["senses"] for c in s["collocations"]))[:6]
    return {"word": w["lemma"], "pos": w["word_class"], "gender": d.get("gender"), "inflection": d.get("inflection", ""),
            "forms": forms, "grammar": d.get("grammar", []), "construction": w.get("construction", []),
            "brug": brug, "brug_src": "study"}


def from_ddo(card, prep):
    d = card.get("dict") or {}
    q = urllib.parse.unquote(d["url"].split("query=", 1)[1]) if d.get("url") else re.sub(r"^(at|en|et) ", "", card["word"])
    arts = [a for a in E._articles(ddo._fetch(q)) if a["kind"] == "word"]
    want = E._class_key(d.get("pos", ""))
    a = next((x for x in arts if E._norm(x["head"]) == E._norm(q) and E._class_key(x["pos"]) == want), None) \
        or next((x for x in arts if E._norm(x["head"]) == E._norm(q)), None)
    info = {"word": card["word"], "pos": d.get("pos", ""), "gender": None, "inflection": "", "forms": [], "grammar": [],
            "construction": [prep] if prep else [], "brug": [], "brug_src": "DDO"}
    if not a:   # fixed expressions have their own article on another headword's page (med henblik på → henblik)
        a = E.phrase_index().get(E._norm(re.sub(r"^(at) ", "", card["word"])))
    if a:
        info.update({"pos": a["pos"] or info["pos"] or ("fast udtryk" if a["kind"] == "phrase" else ""), "gender": next((v for k, v in E.GENDER.items() if k in a["pos"]), None),
                     "inflection": a["inflection"], "forms": [[a["head"]] + fs for fs in a["forms"][:1]] + a["forms"][1:],
                     "grammar": a["grammar"]})
        phrase = re.sub(r"^(at|en|et) ", "", E._norm(card["word"]))
        first, head = phrase.split(" ")[0], E._norm(a["head"])
        if " " in phrase and head != phrase and not first.startswith(head[:-1] if len(head) > 4 else head):
            # a fixed expression explained under its headword (i overensstemmelse med → overensstemmelse):
            # the headword's gender and bøjning don't belong to the expression, nor do its other patterns
            info.update({"pos": "fast udtryk", "gender": None, "inflection": "", "forms": [],
                         "grammar": [g for g in a["grammar"] if phrase in E._norm(g.replace("_", " "))], "under": a["head"]})
        # DDO's short example phrases ("forklare nærmere") – the citations are full sentences and stay out
        ph = [x for s in a["senses"] for x in s["examples"] if len(x) <= 45 and (not info.get("under") or phrase.split(" … ")[0] in E._norm(x))]
        info["brug"] = list(dict.fromkeys(ph))[:5]
    return info


def main():
    cards = json.load(open(os.path.join(DATA, "vocab.json"), encoding="utf-8"))["cards"]
    tips = json.load(open(os.path.join(DATA, "tips.json"), encoding="utf-8"))
    idx = study_index()
    out, matched = {}, 0
    for cid, c in cards.items():
        k = _n(c["word"])
        keys = [k, re.sub(r"^(at|en|et) ", "", k)] + [x.strip() for x in re.split(r"/|\(", k)] + [re.sub(r"\s*\([^)]*\)", "", k)]
        hit = next((idx[x] for x in keys if x in idx), None)
        prep = tips.get(cid, {}).get("prep")
        if hit:
            matched += 1
            out[cid] = from_study(*hit)
        else:
            out[cid] = from_ddo(c, prep)
        if not out[cid]["construction"] and prep and not out[cid]["grammar"]:
            out[cid]["construction"] = [prep]
    # hand-written word class / Brug for cards DDO gives neither (src/lexicon/coach_extra.txt)
    for line in open(os.path.join(REPO, "src", "lexicon", "coach_extra.txt"), encoding="utf-8"):
        if line.startswith("#") or not line.strip():
            continue
        cid, pos, brug = [x.strip() for x in line.split("|")]
        if cid in out:
            if pos:
                out[cid].update({"pos": pos, "gender": None, "inflection": "", "forms": []})
            if not out[cid]["brug"]:
                out[cid].update({"brug": [x.strip() for x in brug.split(";")], "brug_src": "note"})
    json.dump(out, open(os.path.join(DATA, "wordinfo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    gaps = {f: [cid for cid, v in out.items() if not (v[f] or (f == "construction" and v["grammar"]))]
            for f in ("pos", "construction", "brug")}
    print(f"wordinfo: {len(out)} cards ({matched} from the study sheet) → {os.path.join(DATA, 'wordinfo.json')}")
    for f, ids in gaps.items():
        if ids:
            print(f"  no {f}: {', '.join(ids)}")


if __name__ == "__main__":
    main()
