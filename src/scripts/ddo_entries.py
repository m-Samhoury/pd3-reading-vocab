"""Extract per-word dictionary facts from the cached Den Danske Ordbog pages.

Output: WORK/ddo_entries.json (outside the repo – it holds DDO's own wording).
  facts   – word class, gender (en/et), inflection forms, DDO url   → used on the public site
  senses  – DDO's numbered definitions, short examples, citations  → used only in the private build
"""
import html, json, os, re, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ddo                  # noqa: E402
from paths import REPO, WORK  # noqa: E402

OUT = os.path.join(WORK, "ddo_entries.json")
GENDER = {"fælleskøn": "en", "intetkøn": "et"}


def _t(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def _articles(page):
    """Split a DDO page into its articles (homographs and fixed expressions each get one)."""
    parts = re.split(r'<div class="(artikel|fasteudtryk) modern-article"', page)[1:]
    out = []
    for kind, a in zip(parts[0::2], parts[1::2]):
        h1 = re.search(r'<h([12]) class="modern-match">(.*?)</h\1>', a, re.S)
        head = re.sub(r"\s*\d+$", "", _t(h1.group(2))) if h1 else ""
        pos = re.search(r'class="part-of-speech"[^>]*>(.*?)</span>([^<]*)', a, re.S)
        pos = (_t(pos.group(1)) + _t(pos.group(2))).strip(" ,") if pos else ""   # "substantiv, fælleskøn"
        boj = re.search(r'id="id-boj">(.*?)</div>', a, re.S)
        inflection, forms = "", []
        if boj:
            # the short "-r, -de, -t" label(s) and the full forms from the tooltip tables
            labels = [_t(x) for x in re.findall(r'<button class="kilde[^"]*"[^>]*>(.*?)</button>', boj.group(1), re.S)]
            scopes = [_t(x) for x in re.findall(r'<span class="diskret">(.*?)</span>', boj.group(1), re.S)]
            inflection = " ".join(labels) if not scopes else " · ".join(f"{s} {l}" for s, l in zip(scopes, labels))
            if not labels:
                inflection = _t(re.sub(r'<h3.*?</h3>', "", boj.group(1), flags=re.S))
            for tbl in re.findall(r'<table class="flex-table">(.*?)</table>', boj.group(1), re.S):
                fs = [_t(td).replace(" ", "") for td in re.findall(r"<td>(.*?)</td>", tbl, re.S)]
                if fs and fs not in forms:
                    forms.append(fs)
        senses = []
        for row in re.split(r'<div class="modern-senseno">', a)[1:]:
            no = _t(row[:row.find("</div>")]).rstrip(".")
            d = re.search(r'class="modern-definition"[^>]*>(.*?)</span>', row, re.S)
            if not d:
                continue
            ex = re.search(r'<h3 class="modern-label">Eksempler</h3>(.*?)</ul>', row, re.S)
            senses.append({
                "no": no,
                "definition": _t(d.group(1)),
                "examples": [_t(x) for x in re.findall(r"<li>(.*?)</li>", ex.group(1), re.S)][:4] if ex else [],
                "citations": [_t(x) for x in re.findall(r'<span class="modern-citat">(.*?)</span>', row, re.S)][:2],
            })
        if not senses:   # single-sense articles have no sense number
            for d in re.findall(r'class="modern-definition"[^>]*>(.*?)</span>', a, re.S)[:1]:
                senses.append({"no": "", "definition": _t(d), "examples": [], "citations": [
                    _t(x) for x in re.findall(r'<span class="modern-citat">(.*?)</span>', a, re.S)][:2]})
        out.append({"kind": "phrase" if kind == "fasteudtryk" else "word", "head": head, "pos": pos, "inflection": inflection, "forms": forms, "senses": senses})
    return out


def _class_key(s):
    s = s.lower()
    for k in ("konjunktion", "adverbium", "præposition", "substantiv", "verbum", "adjektiv", "pronomen", "udråbsord", "talord"):
        if k in s:
            return k
    return "fast udtryk" if "udtryk" in s else s.split()[0] if s else ""


def _norm(x):
    return re.sub(r"\s+", " ", x.replace("…", "...").replace(" ...", " ...")).strip().lower()


def candidates(lemma):
    """spellings to look for: 'i stedet (for)' → 'i stedet for', 'i stedet'; 'stadig(væk)' → 'stadigvæk', 'stadig'"""
    l = re.sub(r"\s*\((konj|adv|præp)\.\)", "", lemma)
    full = re.sub(r"\(([^)]*)\)", r"\1", l).replace("  ", " ")
    short = re.sub(r"\s*\([^)]*\)", "", l)
    out = []
    for c in (full, short, full.replace(" … ", " ... "), short.replace(" … ", " ... ")):
        c = _norm(c)
        if c and c not in out:
            out.append(c)
    return out


_PHRASES = None


def phrase_index():
    """every fixed expression on any cached page (e.g. 'som følge af' is explained on the page for 'følge')"""
    global _PHRASES
    if _PHRASES is None:
        _PHRASES = {}
        for f in sorted(os.listdir(ddo.CACHE)):
            for a in _articles(open(os.path.join(ddo.CACHE, f), encoding="utf-8").read()):
                if a["kind"] == "phrase" and a["senses"]:
                    _PHRASES.setdefault(_norm(a["head"]), a)
    return _PHRASES


def entry(w):
    q = w["ddo"]["query"]
    url = "https://ordnet.dk/ddo/ordbog?query=" + urllib.parse.quote(q)
    arts = [a for a in _articles(ddo._fetch(q)) if a["senses"]]
    arts += [phrase_index()[c] for c in candidates(w["lemma"]) if c in phrase_index()]
    want = _class_key(w["word_class"])
    cands = candidates(w["lemma"])
    exact = [a for a in arts if _norm(a["head"]) in cands]
    pick = [a for a in exact if _class_key(a["pos"]) == want] or exact
    match = "exact"
    if not pick:   # e.g. 'det betyder (at)' is explained under the verb 'betyde'
        base = _norm(re.sub(r"^(at|en|et) ", "", q))
        pick = [a for a in arts if _norm(a["head"]) == base and a["kind"] == "word"][:1]
        match = "related"
    if not pick:
        return {"found": False, "query": q, "url": url}
    a = pick[0]
    # grammar facts only when DDO describes the same word in the same word class
    same = match == "exact" and a["kind"] == "word" and _class_key(a["pos"]) == want
    return {"found": True, "match": match, "query": q, "head": a["head"], "url": url,
            "pos": a["pos"] if same else "", "gender": next((v for k, v in GENDER.items() if k in a["pos"]), None) if same else None,
            "inflection": a["inflection"] if same else "", "forms": a["forms"] if same else [],
            "same_class": same,
            "senses": [s for x in pick for s in x["senses"]] if match == "exact" else []}


def main():
    words = json.load(open(os.path.join(REPO, "data", "words.json"), encoding="utf-8"))
    res = {w["id"]: entry(w) for w in words}
    json.dump(res, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    found = sum(1 for v in res.values() if v["found"])
    print(f"DDO entries: {found}/{len(res)} matched → {OUT}")
    for k, v in res.items():
        if not v["found"]:
            print("  no article:", k)
        elif v["match"] != "exact":
            print("  related:", k, "→", v["head"])


if __name__ == "__main__":
    main()
