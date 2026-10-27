"""Render the standalone HTML deliverables into /output (CSS, JS and data inlined)."""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B          # noqa: E402
import build_t23           # noqa: E402

ROOT = B.ROOT
TPL = os.path.join(B.SRC, "templates")
OUT = ROOT


def l3_items(words):
    """Real L3 items with the answer mapped to a word id (used for gap-fill questions)."""
    seg = json.load(open(os.path.join(B.WORK, "segments.json"), encoding="utf-8"))
    items = []
    for exam in B.EXAM_ORDER:
        for it in seg[exam]["L3"]["items"]:
            if it["n"] == 0 or not it.get("gap_sentence") or it["gap_sentence"].count("____") != 1:
                continue
            ans = it["answer_word"].lower()
            best, best_len = None, 0
            for w in words:
                for f in w.get("forms") or [w["lemma"]]:
                    f = f.lower()
                    if f and re.search(r"(?<![\wæøå])" + re.escape(f) + r"(?![\wæøå])", ans) and len(f) > best_len:
                        best, best_len = w["id"], len(f)
            sent = re.sub(r"\s+", " ", it["gap_sentence"]).strip()
            items.append({"exam": exam, "n": it["n"], "gap_sentence": sent, "options": it["options"],
                          "answer": it["answer"], "answer_word": it["answer_word"], "word_id": best})
    return items


def main():
    words = json.load(open(os.path.join(ROOT, "data", "words.json"), encoding="utf-8"))
    groups = json.load(open(os.path.join(ROOT, "data", "groups.json"), encoding="utf-8"))
    slim = []
    for w in words:                                    # drop build-only fields to keep files small
        x = {k: v for k, v in w.items() if k not in ("occurrences", "ddo")}
        x["frequency"] = {k: v for k, v in w["frequency"].items()}
        slim.append(x)
    meta = {
        "exams": B.EXAM_ORDER,
        "exam_labels": [f"{e} = {B.EXAM_LABEL[e]}" for e in B.EXAM_ORDER],
        "thresholds": f"Tier 2: {build_t23.TIER2_RULE}. Tier 3: {build_t23.TIER3_RULE}.",
        "l3_items": l3_items(words),
        "footer": "Source: Prøve i Dansk 3, Læseforståelse 1–3, Nov 2022 – May 2024 (SIRI). Definitions written for this "
                  "study tool and checked against Den Danske Ordbog (ordnet.dk). Progress is stored only in this browser.",
    }
    data = json.dumps({"words": slim, "groups": [g for g in groups if g["words"]], "meta": meta}, ensure_ascii=False)
    data = data.replace("</", "<\\/")
    css = open(os.path.join(TPL, "common.css"), encoding="utf-8").read()
    js = open(os.path.join(TPL, "i18n.js"), encoding="utf-8").read() + "\n" + open(os.path.join(TPL, "common.js"), encoding="utf-8").read()
    os.makedirs(OUT, exist_ok=True)
    for src, dst in (("study.html", "study-sheet.html"), ("flash.html", "flashcards.html"), ("index.html", "index.html")):
        html = open(os.path.join(TPL, src), encoding="utf-8").read()
        html = html.replace("{{CSS}}", css).replace("{{COMMON_JS}}", js).replace("{{DATA}}", data)
        open(os.path.join(OUT, dst), "w", encoding="utf-8").write(html)
        print(f"{dst}: {len(html.encode('utf-8')) / 1024:.0f} KB")
    mapped = sum(1 for i in meta["l3_items"] if i["word_id"])
    print(f"L3 items: {len(meta['l3_items'])}, mapped to words: {mapped}")


if __name__ == "__main__":
    main()
