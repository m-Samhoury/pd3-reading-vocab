"""English glosses for each word from English Wiktionary (CC BY-SA 4.0), cached outside the repo.

Output: WORK/wiktionary.json  {word id: {"title", "url", "pos", "glosses": [...]}} – only Danish-language entries.
"""
import html, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from paths import REPO, WORK          # noqa: E402
from ddo_entries import candidates    # noqa: E402

CACHE = os.path.join(WORK, "wikt_cache")
OUT = os.path.join(WORK, "wiktionary.json")
os.makedirs(CACHE, exist_ok=True)
# Wiktionary spells a few of these differently
ALT = {"selvom": ["selv om"], "også selvom": ["også selv om"], "frem for": ["fremfor"]}
POS = {"adverbium": "Adverb", "konjunktion": "Conjunction", "præposition": "Preposition", "substantiv": "Noun",
       "verbum": "Verb", "adjektiv": "Adjective", "pronomen": "Pronoun", "fast udtryk": None}


def fetch(title):
    fn = os.path.join(CACHE, title.replace("/", "_") + ".json")
    if os.path.exists(fn):
        return json.load(open(fn, encoding="utf-8"))
    url = "https://en.wiktionary.org/api/rest_v1/page/definition/" + urllib.parse.quote(title.replace(" ", "_"))
    req = urllib.request.Request(url, headers={"User-Agent": "pd3-study-tool/1.0 (personal study project)"})
    data = {}
    for attempt in range(4):
        try:
            data = json.load(urllib.request.urlopen(req, timeout=20))
            break
        except urllib.error.HTTPError as e:
            data = {"_error": e.code}
            if e.code != 429:
                break
            time.sleep(10 * (attempt + 1))
        except Exception as e:  # network
            data = {"_error": str(e)}
            break
    json.dump(data, open(fn, "w", encoding="utf-8"), ensure_ascii=False)
    time.sleep(1.2)
    return data


def clean(d):
    t = re.sub(r"<[^>]+>", "", d)
    t = html.unescape(re.sub(r"\s+", " ", t)).strip()
    return t


def glosses(entries, want):
    pick = [e for e in entries if want and e.get("partOfSpeech") == want] or entries
    out = []
    for e in pick:
        for d in e.get("definitions", []):
            g = clean(d.get("definition", ""))
            if not g or re.match(r"^([\w-]+ ){0,4}(form|forms|singular|plural|participle|tense|spelling|inflection) of\b", g, re.I):
                continue
            if g not in out:
                out.append(g)
    return out[:3], (pick[0].get("partOfSpeech") if pick else "")


def class_key(s):
    for k in POS:
        if k in s.lower():
            return k
    return "fast udtryk"


def main():
    words = json.load(open(os.path.join(REPO, "data", "words.json"), encoding="utf-8"))
    res = {}
    for w in words:
        for c in candidates(w["lemma"]) + ALT.get(w["lemma"], []):
            d = fetch(c)
            if d.get("da"):
                gl, pos = glosses(d["da"], POS.get(class_key(w["word_class"])))
                if gl:
                    res[w["id"]] = {"title": c, "url": "https://en.wiktionary.org/wiki/" + urllib.parse.quote(c.replace(" ", "_")) + "#Danish",
                                    "pos": pos, "glosses": gl}
                    break
    json.dump(res, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"Wiktionary: {len(res)}/{len(words)} words with an English gloss → {OUT}")
    print("  missing:", [w["lemma"] for w in words if w["id"] not in res])


if __name__ == "__main__":
    main()
