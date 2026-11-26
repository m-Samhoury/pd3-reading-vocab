"""Build the Mundtlig page (oral Delprøve 2, sittings 2018–2024).

Writes into the site repo:
  mundtlig.html                 the page (from src/templates/mundtlig.html)
  oral/data.<hash>.js           window.ORAL: questions, model answers, topics, frames, sittings
  oral/lexicon.<hash>.js        window.ORAL_LEX: word → count, for the offline spelling check
  oral/pics/<sitting>-<letter>.jpg   picture sheets, re-encoded to ≤ 1000 px wide
  oral/vocab/<id>.jpg           the small word pictures of the Emneord tab (copied, only the ones used)

Inputs (PD3 project, PD3_EXAMS or the default folder next to this repo):
  pd3-data/oral-questions.json   every examiner question (filtered to the 12 sittings below)
  pd3-data/oral-answers.json     Part A content: model answers, keywords, notes, topic and frame maps
  pd3-data/oral-translations.json  English for the questions, answers, tips, topics and frames (optional)
  pd3-data/cache/*.txt, pd3-data/exam-sentences.json   the exam texts, for the spelling check
  .claude/skills/pd3-coach/app/oral-pics/<sitting>-<letter>.jpg   the picture sheets
  pd3-data/oral-vocab.json       Emneord: topic word lists (optional; --vocab)
  pd3-data/oral-vocab-images.json  Emneord: picture per word id, with credit (optional; --vocab-images).
                                 Its "file" paths are relative to the folder of this JSON, then to the PD3 project.

Missing answers are fine: those questions show "Svar kommer snart". Use --answers to build from another file
(e.g. the fixture src/fixtures/oral-answers.sample.json while developing).

Run order (render.py writes the hashed common.css / common.js / pd3-data.js this page loads):
  python3 src/scripts/render.py && python3 src/scripts/build_oral.py
"""
import argparse, glob, hashlib, json, os, re, shutil, subprocess, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from paths import REPO as ROOT, SRC, EXAMS  # noqa: E402

SITTINGS = ["2018s", "2018v", "2019s", "2019v", "2020s", "2020v", "2021s", "2021v", "2022v", "2023s", "2023v", "2024s"]
LETTERS = ["A", "B", "C"]
SLOTS = ["1A", "1B", "2"]
SITTING_LABEL = {"s": ("Maj–juni", "May–June"), "v": ("November–december", "November–December")}
FAMILIES = ("arbejde", "uddannelse", "klima", "sundhed", "unge_born", "medier", "samfund")
PARTS = ("intro", "aarsag", "aarsag2", "fordi", "eksempel", "konklusion", "side1", "side2", "stilling", "konsekvens")
# the order of the steps in each frame (the structure map), as in Part A
FRAME_STEPS = {
    "aarsag": ["intro", "aarsag", "fordi", "eksempel", "aarsag2", "konklusion"],
    "fordele_ulemper": ["intro", "side1", "side2", "eksempel", "stilling"],
    "konsekvens": ["intro", "konsekvens", "fordi", "eksempel", "konklusion"],
    "holdning": ["stilling", "fordi", "eksempel", "konklusion"],
}
PIC_SRC = os.path.join(EXAMS, ".claude", "skills", "pd3-coach", "app", "oral-pics")
VOCAB_DEFAULT = os.path.join(EXAMS, "pd3-data", "oral-vocab.json")
VOCAB_IMG_DEFAULT = os.path.join(EXAMS, "pd3-data", "oral-vocab-images.json")


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def sitting_label(s):
    year, kind = s[:4], s[4]
    da, en = SITTING_LABEL[kind]
    return {"da": f"{da} {year}", "en": f"{en} {year}"}


def slot_of(qid):
    return qid.split("-")[-1]


def english_for(qid, q, tr):
    """The English for one question from the translations file, or None. A list that does not match the Danish
    length is left out (with a warning) rather than shown against the wrong line."""
    if not tr:
        return None
    e = {}
    danish = {"followups": q.get("followups") or [], "answer": (q.get("answer") or {}).get("answer") or [],
              "tips": (q.get("answer") or {}).get("tips") or []}
    for key in ("intro", "question", "followup_answer", "notes"):
        if tr.get(key):
            e[key] = tr[key]
    for key, da in danish.items():
        val = tr.get(key)
        if not val:
            continue
        if isinstance(val, list) and len(val) == len(da):
            e[key] = val
        else:
            print(f"warning: {qid}: English {key} has {len(val) if isinstance(val, list) else 'no list'} lines, Danish has {len(da)}; left out")
    return e or None


def build_questions(questions, answers, tr=None):
    out, missing = [], []
    for q in questions:
        if q["sitting"] not in SITTINGS:
            continue
        letter = q["id"].split("-")[1]
        ans = answers.get(q["id"])
        if not ans:
            missing.append(q["id"])
        item = {
            "id": q["id"], "sitting": q["sitting"], "letter": letter, "topic": q["topic"], "slot": slot_of(q["id"]),
            "kind": q["kind"], "intro": q.get("intro"), "question": q["question"],
            "followups": q.get("followups") or [], "answer": ans or None,
        }
        en = english_for(q["id"], {**item, "answer": ans}, (tr or {}).get("questions", {}).get(q["id"]))
        if en:
            item["en"] = en
        out.append(item)
    order = {k: i for i, k in enumerate(SLOTS)}
    out.sort(key=lambda x: (SITTINGS.index(x["sitting"]), LETTERS.index(x["letter"]), order[x["slot"]]))
    return out, missing


def build_topics(questions, answers):
    names = {}
    for q in questions:
        names.setdefault(f'{q["sitting"]}-{q["letter"]}', q["topic"])
    given = answers.get("topics", {})
    topics = {}
    for s in SITTINGS:
        for L in LETTERS:
            key = f"{s}-{L}"
            g = given.get(key, {})
            sit = g.get("situations", {})
            topics[key] = {
                "title": names.get(key, key),
                "situations": {"A": sit.get("A", ""), "B": sit.get("B", "")},
                "family": g.get("family", "") if g.get("family", "") in FAMILIES else "",
            }
    return topics


def tokens(text):
    return re.findall(r"[a-zæøåA-ZÆØÅ]+", text or "")


def build_lexicon(questions, answers):
    """Every word of the exam texts (cache + exam sentences) once, and the oral texts weighted up so that
    the learner's own answers and the model answers count as known words."""
    counts = collections.Counter()
    for path in glob.glob(os.path.join(EXAMS, "pd3-data", "cache", "*.txt")):
        with open(path, encoding="utf-8", errors="ignore") as f:
            counts.update(w.lower() for w in tokens(f.read()))
    sents = load(os.path.join(EXAMS, "pd3-data", "exam-sentences.json")).get("sentences", {})
    for lst in sents.values():
        for e in lst:
            counts.update(w.lower() for w in tokens(e.get("s", "")))
    oral = []
    for q in questions:
        oral.append(q["question"]); oral += q["followups"]
        if q.get("intro"): oral.append(q["intro"])
        a = q["answer"]
        if a:
            oral += [s["text"] for s in a["answer"]]
            oral += [k["da"] + " " + k.get("use", "") for k in a.get("keywords", [])]
            oral += a.get("tips", [])
            if a.get("followup"): oral.append(a["followup"]["q"] + " " + a["followup"]["answer"])
            if a.get("notes"): oral.append(a["notes"])
            # notes_raw is left out on purpose: it holds the learner's typos, which must stay unknown words
    for text in oral:
        for w in tokens(text):
            counts[w.lower()] += 4
    return {w: n for w, n in counts.items() if len(w) > 1}


def pics(out_dir, sittings_used):
    os.makedirs(os.path.join(out_dir, "pics"), exist_ok=True)
    for s in sittings_used:
        for L in LETTERS:
            name = f"{s}-{L}.jpg"
            src = os.path.join(PIC_SRC, name)
            if not os.path.exists(src):
                raise SystemExit(f"missing picture sheet: {src}")
            dst = os.path.join(out_dir, "pics", name)
            subprocess.run(["sips", "-Z", "1000", "-s", "formatOptions", "80", src, "--out", dst],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def build_vocab(vocab_path, imgs_path, questions):
    """Emneord: the topic word lists, each word with its picture (img) when the images file has an entry whose
    file exists. Returns (topics for the page, {word id: source jpg}, warnings). A missing vocab file gives an
    empty list, so the page still builds (the tab then says it is coming)."""
    warn = []
    if not vocab_path or not os.path.exists(vocab_path):
        warn.append(f"no vocab at {vocab_path}: the Emneord tab is empty")
        return [], {}, warn
    vocab = load(vocab_path)
    imgs = load(imgs_path) if imgs_path and os.path.exists(imgs_path) else {}
    if not imgs:
        warn.append(f"no vocab images at {imgs_path}: the word list has no pictures")
    img_base = os.path.dirname(os.path.abspath(imgs_path)) if imgs else ""
    known_qids = {q["id"] for q in questions}
    files, topics = {}, []
    for t in vocab.get("topics", []):
        words = []
        for w in t.get("words", []):
            word = dict(w)
            im = imgs.get(w["id"])
            if im:
                src = next((p for p in (os.path.join(img_base, im.get("file", "")), os.path.join(EXAMS, im.get("file", "")))
                            if im.get("file") and os.path.isfile(p)), None)
                if src:
                    files[w["id"]] = src
                    word["img"] = {"f": f"oral/vocab/{w['id']}.jpg", "w": im.get("w"), "h": im.get("h"),
                                   "credit": im.get("credit", ""), "source": im.get("source", ""),
                                   "license": im.get("license", ""), "alt": im.get("alt_da", ""), "alt_en": im.get("alt_en", "")}
                else:
                    warn.append(f"picture file missing for {w['id']}: {im.get('file')}")
            if w.get("qid") and w["qid"] not in known_qids:
                warn.append(f"{w['id']}: qid {w['qid']} is not in the 12 sittings")
            words.append(word)
        topics.append({**{k: t[k] for k in ("key", "title", "title_en", "family", "qids") if k in t},
                       "sources": topic_sources(t.get("qids"), t.get("key"), warn), "words": words})
    return topics, files, warn


def topic_sources(qids, key, warn):
    """The exams a topic comes from: [{"sitting": "2018s", "letter": "A"}, ...], deduped, newest sitting first.
    The sitting and letter are the first two parts of each qid (e.g. 2018s-A-1A)."""
    seen = set()
    for qid in qids or []:
        parts = qid.split("-")
        if len(parts) < 2 or parts[0] not in SITTINGS or parts[1] not in LETTERS:
            warn.append(f"{key}: qid {qid} has no known sitting and letter; not listed as a source")
            continue
        seen.add((parts[0], parts[1]))
    ordered = sorted(seen, key=lambda sl: (-SITTINGS.index(sl[0]), LETTERS.index(sl[1])))
    return [{"sitting": s, "letter": l} for s, l in ordered]


def copy_vocab_pics(out_dir, files):
    """Copy only the referenced word pictures to oral/vocab/ and drop stale ones (they are already small)."""
    dst_dir = os.path.join(out_dir, "vocab")
    os.makedirs(dst_dir, exist_ok=True)
    for old in glob.glob(os.path.join(dst_dir, "*.jpg")):
        if os.path.basename(old)[:-4] not in files:
            os.remove(old)
    for wid, src in files.items():
        shutil.copyfile(src, os.path.join(dst_dir, f"{wid}.jpg"))


def h10(text):
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:10]


def write_hashed(out_dir, stem, text):
    for old in glob.glob(os.path.join(out_dir, f"{stem}.*.js")):
        os.remove(old)
    name = f"{stem}.{h10(text)}.js"
    with open(os.path.join(out_dir, name), "w", encoding="utf-8") as f:
        f.write(text)
    return name


def existing(name_pat):
    hits = sorted(glob.glob(os.path.join(ROOT, "assets", name_pat)))
    if not hits:
        raise SystemExit(f"assets/{name_pat} missing: run src/scripts/render.py first")
    return os.path.basename(hits[-1])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--answers", help="answers JSON (default: pd3-data/oral-answers.json in the PD3 project)")
    ap.add_argument("--no-pics", action="store_true", help="skip re-encoding the picture sheets")
    ap.add_argument("--translations", help="English translations (default: pd3-data/oral-translations.json in the "
                    "PD3 project; optional: without it the page simply shows no English)")
    ap.add_argument("--vocab", default=VOCAB_DEFAULT, help="Emneord word lists (default: pd3-data/oral-vocab.json in the "
                    "PD3 project; if missing, the tab is empty). Fixture: src/fixtures/oral-vocab.sample.json")
    ap.add_argument("--vocab-images", default=VOCAB_IMG_DEFAULT, help="Emneord pictures and credits (default: "
                    "pd3-data/oral-vocab-images.json; its file paths are relative to that folder). Fixture: "
                    "src/fixtures/oral-vocab-images.sample.json")
    a = ap.parse_args()
    ans_path = a.answers or os.path.join(EXAMS, "pd3-data", "oral-answers.json")
    answers = load(ans_path) if os.path.exists(ans_path) else {}
    if not answers:
        print(f"no answers at {ans_path}: building without model answers")
    tr_path = a.translations or os.path.join(EXAMS, "pd3-data", "oral-translations.json")
    tr = load(tr_path) if os.path.exists(tr_path) else {}
    print(f"English: {tr_path} ({len(tr.get('questions', {}))} questions)" if tr else f"no translations at {tr_path}: building without English")
    questions_raw = load(os.path.join(EXAMS, "pd3-data", "oral-questions.json"))
    questions, missing = build_questions(questions_raw, answers, tr)
    known = {q["id"] for q in questions}
    extra = [k for k in answers if re.match(r"^\d{4}[sv]-[A-C]-(1A|1B|2)$", k) and k not in known]
    if extra:
        print("answers for ids that are not in the 12 sittings (ignored):", extra)
    topics = build_topics(questions, answers)
    for key, t_ in topics.items():
        given = (tr.get("topics") or {}).get(key) or {}
        if given.get("title"):
            t_["title_en"] = given["title"]
        sit_en = {k: v for k, v in (given.get("situations") or {}).items() if v}
        if sit_en:
            t_["situations_en"] = sit_en
    frames = {}
    for f, fr in (answers.get("frames") or {}).items():
        frames[f] = dict(fr)
        for field in ("title", "skeleton", "tips"):
            val = (tr.get("frames") or {}).get(f, {}).get(field)
            if val is None:
                continue
            if field == "tips":
                if isinstance(val, list) and len(val) == len(fr.get("tips") or []):
                    frames[f]["tips_en"] = val
            else:
                frames[f][field + "_en"] = val
    # lightly check the answer blocks that do exist, so a bad hand-edit is caught at build time
    for q in questions:
        a_ = q["answer"]
        if not a_:
            continue
        if a_["frame"] not in FRAME_STEPS:
            raise SystemExit(f"{q['id']}: unknown frame {a_['frame']}")
        for seg in a_["answer"]:
            if seg["part"] not in PARTS:
                raise SystemExit(f"{q['id']}: unknown part {seg['part']}")
    out_dir = os.path.join(ROOT, "oral")
    os.makedirs(out_dir, exist_ok=True)
    sittings = [{"id": s, "label": sitting_label(s)} for s in SITTINGS]
    vocab_topics, vocab_files, vwarn = build_vocab(a.vocab, a.vocab_images, questions)
    for w in vwarn:
        print("warning: vocab:", w)
    data = {"sittings": sittings, "questions": questions, "topics": topics, "frames": frames,
            "frameSteps": FRAME_STEPS, "letters": LETTERS, "slots": SLOTS, "vocab": {"topics": vocab_topics}}
    data_js = "window.ORAL = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + ";\n"
    data_name = write_hashed(out_dir, "data", data_js)
    lex = build_lexicon(questions, answers)
    lex_js = "window.ORAL_LEX = " + json.dumps(lex, ensure_ascii=False, separators=(",", ":")) + ";\n"
    lex_name = write_hashed(out_dir, "lexicon", lex_js)
    if not a.no_pics:
        pics(out_dir, SITTINGS)
        copy_vocab_pics(out_dir, vocab_files)
    # the page: the shared CSS/JS and pd3-data written by render.py, plus this build's data and lexicon
    tpl = open(os.path.join(SRC, "templates", "mundtlig.html"), encoding="utf-8").read()
    html = (tpl.replace("{{CSS_HREF}}", "assets/" + existing("common.*.css"))
               .replace("{{DATA_SRC}}", "assets/" + existing("pd3-data.*.js"))
               .replace("{{JS_SRC}}", "assets/" + existing("common.*.js"))
               .replace("{{ORAL_SRC}}", "oral/" + data_name)
               .replace("{{LEX_SRC}}", "oral/" + lex_name))
    with open(os.path.join(ROOT, "mundtlig.html"), "w", encoding="utf-8") as f:
        f.write(html)
    with_ans = sum(1 for q in questions if q["answer"])
    print(f"questions: {len(questions)} · with model answer: {with_ans} · missing: {len(missing)}")
    print(f"topics: {len(topics)} · lexicon words: {len(lex)} · {data_name} ({len(data_js) // 1024} KB) · {lex_name} ({len(lex_js) // 1024} KB)")
    nw = sum(len(t_["words"]) for t_ in vocab_topics)
    print(f"emneord: {len(vocab_topics)} topics · {nw} words · {len(vocab_files)} pictures" + (" (pictures not copied: --no-pics)" if a.no_pics else ""))


if __name__ == "__main__":
    main()
