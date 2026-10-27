"""Phase 1.2 – segment each exam into parts (L1, L2A, L2B, L3) and into
questions / options / gaps / texts. Answer keys come from the censor booklet.

Output: work/segments.json
"""
import glob, json, os, re, unicodedata
import pdfplumber

from paths import EXAMS as ROOT, WORK
RAW = os.path.join(WORK, "raw")
EXAMS = {"2022v": "2022 nov dec", "2023s": "2023 maj juni",
         "2023v": "2023 nov dec", "2024s": "2024 maj juni"}
JUNK = re.compile(r"^(PRODUKTIONSNR.*|[A-Z]|\d{1,2}|CPR-nummer|(MAJ-JUNI|NOVEMBER-DECEMBER) 20\d\d.*|PD3|Sæt ét kryds)$")


def read(exam, b):
    with open(os.path.join(RAW, f"{exam}_{b}.txt"), encoding="utf-8") as f:
        return f.read()


def lines(t):
    # drop private-use glyphs (checkbox symbols) before stripping
    t = re.sub(r"[\ue000-\uf8ff]", "", t)
    return [l.strip() for l in t.split("\n") if l.strip()]


def strip_header(l):
    # page footers glue onto the next header, e.g. "MAJ-JUNI 2023Delprøve 2B – fortsat"
    return re.sub(r"^(MAJ-JUNI|NOVEMBER-DECEMBER) 20\d\d\s*", "", l)


def prose(page_lines):
    out = []
    for l in page_lines:
        l = strip_header(l)
        if not l or JUNK.match(l) or l.startswith("Delprøve"):
            continue
        out.append(l)
    return " ".join(out)


def keys(censor):
    """Return {'L2A': {1:'B',..}, 'L2B': {...}, 'L3': {...}}."""
    # objective keys appear in order: 3 answers (2A), 5 (2B), 8 (L3)
    found = re.findall(r"^\s*(\d)\.\s*([A-G])\s*$", censor, re.M)
    assert len(found) == 16, len(found)
    return {"L2A": {int(n): a for n, a in found[:3]},
            "L2B": {int(n): a for n, a in found[3:8]},
            "L3": {int(n): a for n, a in found[8:]}}


def l1_questions(opg):
    qs, cur, section = [], None, None
    for l in lines(opg):
        m = re.match(r"^(\d{1,2})\.\s*(.*)", l)
        if l.startswith("Søg informationer under"):
            section = l.replace("Søg informationer under", "").strip()
            cur = None
            continue
        if m and 1 <= int(m.group(1)) <= 15 and (not qs or int(m.group(1)) == qs[-1]["n"] + 1):
            cur = {"n": int(m.group(1)), "text": m.group(2), "section": section}
            qs.append(cur)
        elif cur and not JUNK.match(l) and not l.startswith(("Delprøve", "NOVEMBER", "MAJ")):
            if cur["text"].rstrip().endswith(("?", "’.", "'.")):
                cur = None
            else:
                cur["text"] += " " + l
    for q in qs:
        q["text"] = q["text"].strip().rstrip("'")
    return qs


def l2_opg(opg):
    L = lines(opg)
    # 2A questions with A/B/C options
    a_start = next(i for i, l in enumerate(L) if l.startswith("Delprøve – 2A") or l.startswith("Delprøve 2A –"))
    b_start = next(i for i, l in enumerate(L) if "Delprøve 2B" in l and i > a_start)
    qs, cur, opt = [], None, None
    for l in L[a_start:b_start]:
        m = re.match(r"^([1-3])\.\s*(.*)", l)
        o = re.match(r"^([ABC])\.\s*(.*)", l)
        if m:
            cur = {"n": int(m.group(1)), "stem": m.group(2), "options": {}}
            qs.append(cur); opt = None
        elif o and cur:
            opt = o.group(1); cur["options"][opt] = o.group(2)
        elif cur and not JUNK.match(l) and not l.startswith(("Delprøve", "NOVEMBER", "MAJ")):
            if opt:
                cur["options"][opt] += " " + l
            elif not cur["stem"].endswith("?"):
                cur["stem"] = (cur["stem"] + " " + l).strip()
    # 2B sentences A–G
    sents, cur = {}, None
    for l in L[b_start + 1:]:
        if l.startswith(("Bemærk", "Instruktion")):
            if len(sents) == 7:
                break
            cur = None
            continue
        o = re.match(r"^([A-G])\.\s*(.*)", l)
        if o:
            cur = o.group(1); sents[cur] = o.group(2)
            if cur == "A" and len(sents) == 1 and "Tekstdelene" in l:
                sents.clear(); cur = None
        elif cur and not JUNK.match(l) and not l.startswith(("Delprøve", "NOVEMBER", "MAJ", "•", "1 2 3")):
            sents[cur] += " " + l
    return qs, {k: re.sub(r"\s+", " ", v).strip() for k, v in sents.items()}


def l3_grid(exam):
    folder = os.path.join(ROOT, EXAMS[exam], "1 reading")
    f = next(x for x in glob.glob(os.path.join(folder, "*.pdf"))
             if "læseforståelse 2" in unicodedata.normalize("NFC", x).lower() and "opgave" in x.lower())
    with pdfplumber.open(f) as p:
        tb = p.pages[-1].extract_table()
    grid = {}
    for r in tb[1:]:
        n = int(r[0])
        grid[n] = {k: unicodedata.normalize("NFC", re.sub(r"\s+", " ", r[i])).strip()
                   for k, i in zip("ABCD", (1, 3, 5, 7))}
        if n == 0:
            grid[0]["_answer"] = next(k for k, i in zip("ABCD", (2, 4, 6, 8)) if (r[i] or "").strip() == "X")
    return grid


def split_l2_txt(txt):
    pages = txt.split("\f")
    def first(pred):
        return next(i for i, p in enumerate(pages) if pred(p))
    a = first(lambda p: re.search(r"Delprøve 2A –", p))
    b = first(lambda p: re.search(r"Delprøve 2B –", p))
    c = first(lambda p: "(0)" in p)
    return ([prose(lines(p)) for p in pages[a:b]],
            [prose(lines(p)) for p in pages[b:c]],
            [prose(lines(p)) for p in pages[c:]])


def fill_gaps(text, grid, key):
    """Replace '(n) …' with the correct option, and record a context sentence per gap."""
    items = []
    for n in sorted(grid):
        ans = grid[n]["_answer"] if n == 0 else key[n]
        word = grid[n][ans]
        m = re.search(r"\(\s*%d\s*\)\s*…?\s*\.{0,3}" % n, text)
        ctx = None
        if m:
            # sentence boundaries around the gap
            s = max(text.rfind(". ", 0, m.start()), text.rfind("? ", 0, m.start()), text.rfind("! ", 0, m.start()))
            e = min([x for x in (text.find(". ", m.end()), text.find("? ", m.end()), len(text) - 1) if x != -1])
            ctx = text[s + 2 if s != -1 else 0: e + 1].strip()
        items.append({"n": n, "options": {k: grid[n][k] for k in "ABCD"}, "answer": ans,
                      "answer_word": word, "gap_sentence": ctx})
    filled = text
    for it in items:
        filled = re.sub(r"\(\s*%d\s*\)\s*…?" % it["n"], it["answer_word"], filled, count=1)
    for it in items:
        if it["gap_sentence"]:
            it["filled_sentence"] = re.sub(r"\(\s*%d\s*\)\s*…?" % it["n"], "«" + it["answer_word"] + "»",
                                           it["gap_sentence"], count=1)
            it["gap_sentence"] = re.sub(r"\(\s*%d\s*\)\s*…?" % it["n"], "____", it["gap_sentence"], count=1)
            # other gaps in the same sentence: fill them with their answers
            for o in items:
                if o["n"] != it["n"]:
                    pat = r"\(\s*%d\s*\)\s*…?" % o["n"]
                    it["gap_sentence"] = re.sub(pat, o["answer_word"], it["gap_sentence"])
                    it["filled_sentence"] = re.sub(pat, o["answer_word"], it["filled_sentence"])
    return filled, items


def main():
    out = {}
    for exam in EXAMS:
        k = keys(read(exam, "censor"))
        l1q = l1_questions(read(exam, "L1_opg"))
        l1_pages = read(exam, "L1_txt").split("\f")[1:]          # skip cover
        a_q, b_sents = l2_opg(read(exam, "L2_opg"))
        for q in a_q:
            q["answer"] = k["L2A"].get(q["n"])
        a_t, b_t, c_t = split_l2_txt(read(exam, "L2_txt"))
        grid = l3_grid(exam)
        l3_text, l3_items = fill_gaps(" ".join(c_t), grid, k["L3"])
        b_text = " ".join(b_t)
        b_filled = b_text
        out[exam] = {
            "L1": {"questions": l1q, "text": " ".join(prose(lines(p)) for p in l1_pages)},
            "L2A": {"questions": a_q, "text": " ".join(a_t)},
            "L2B": {"sentences": b_sents, "key": k["L2B"], "text": b_filled},
            "L3": {"items": l3_items, "text": l3_text},
        }
        print(exam, "L1 q:", len(l1q), "| 2A q:", len(a_q), [len(q["options"]) for q in a_q],
              "| 2B sents:", len(b_sents), "key:", k["L2B"], "| L3 items:", len(l3_items),
              "ctx:", sum(1 for i in l3_items if i["gap_sentence"]), "key:", k["L3"])
    with open(os.path.join(WORK, "segments.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
