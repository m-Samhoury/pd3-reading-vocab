#!/usr/bin/env python3
"""PD3 coach helper: past-exam index, text extraction, progress log, SM-2 vocab, mistake tracking.

All state lives in <project>/pd3-data/ as plain JSON so it can be read and diffed by hand.
<project> is $PD3_ROOT, else the folder that holds .claude/skills/pd3-coach.
The exam collection is $PD3_EXAMS, else the nearest ancestor of this skill that holds the
"YYYY maj juni" / "YYYY nov dec" folders (so the skill also works from a git worktree).

Usage (run with python3 -I):
  pd3.py init --exam-date 2026-12-01 [--oral-date 2026-12-10] [--target 7] [--name NAME]
                                       # --exam-date = written exam (reading + writing)
  pd3.py status
  pd3.py index                         # rebuild exam index from the folders
  pd3.py sittings [--format new|old]   # list sittings and which parts each has
  pd3.py pick SECTION                  # suggest an unused sitting (L1 L2A L2B L3 W1 W2 O1 O2)
  pd3.py get SITTING KIND              # extract text -> cache path (KIND: L1_txt L1_opg L2_txt L2_opg
                                       #   key omregning writing oral oral_key forcensur)
  pd3.py log SECTION SITTING SCORE MAX [--minutes N] [--note TEXT]
  pd3.py vocab add WORD MEANING [--group G] [--example E] [--note N] [--priority 1-3]
  pd3.py vocab import TSV              # columns: word meaning group example priority note
                                       #   (existing cards keep their review history; text fields update)
  pd3.py vocab due [--limit N] [--group G] [--priority P]
  pd3.py vocab grade ID QUALITY        # QUALITY 0-5 (SM-2)
  pd3.py vocab list [--group G] [--priority P]
  pd3.py vocab groups                  # cards and due counts per group
  pd3.py vocab enrich JSON [JSON ...]  # copy DDO definitions + citations onto matching cards
                                       #   (ddo_entries.json or t23_facts.json format)
  pd3.py sentences                     # find real exam sentences for every card -> exam-sentences.json
  pd3.py page                          # rebuild <project>/assisted-learning.html (also automatic when the deck
                                       #   changes); open it from disk, progress is kept in the browser
  pd3.py mistake add PATTERN --category C [--severity critical|moderate|minor] [--example E]
  pd3.py mistake fixed PATTERN         # learner got it right in a drill
  pd3.py mistake list

Vocab priority: 1 = connectors/conjunctions (drilled first), 2 = words from real exam questions and
L3 option grids, 3 = other useful words. `due` serves priority 1 before 2 before 3.
"""
import argparse, datetime as dt, json, os, re, sys, unicodedata

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.environ.get("PD3_ROOT") or os.path.dirname(os.path.dirname(os.path.dirname(SKILL_DIR)))
DATA = os.environ.get("PD3_DATA") or os.path.join(ROOT, "pd3-data")
CACHE = os.path.join(DATA, "cache")
TODAY = dt.date.today()
SITTING_RE = re.compile(r"^(\d{4}) (maj juni|nov dec)")


def find_exams():
    if os.environ.get("PD3_EXAMS"):
        return os.environ["PD3_EXAMS"]
    d = ROOT
    while True:
        try:
            if any(SITTING_RE.match(n) for n in os.listdir(d)):
                return d
        except OSError:
            pass
        parent = os.path.dirname(d)
        if parent == d:
            return ROOT
        d = parent


EXAMS = find_exams()

# Max points per reading part in the format used from Nov 2022 (L1 15, 2A 6, 2B 10, L3 8 = 39).
READING_MAX = {"L1": 15, "L2A": 6, "L2B": 10, "L3": 8}
# Conversion table from the May-June 2024 sitting. It changes every sitting, so this is an estimate.
GRADE_TABLE_2024S = [(38, 12), (33, 10), (27, 7), (22, 4), (20, 2), (10, 0), (0, -3)]
SECTIONS = ["L1", "L2A", "L2B", "L3", "W1", "W2", "O1", "O2"]


def nfc(s):
    return unicodedata.normalize("NFC", s)


def load(name, default):
    p = os.path.join(DATA, name)
    if not os.path.exists(p):
        return default
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def save(name, obj):
    os.makedirs(DATA, exist_ok=True)
    p = os.path.join(DATA, name)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    os.replace(tmp, p)
    if name in ("vocab.json", "profile.json", "exam-sentences.json"):
        build_page()


def sessions():
    p = os.path.join(DATA, "sessions.jsonl")
    if not os.path.exists(p):
        return []
    with open(p, encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


# ---------- exam index ----------

def sitting_key(folder):
    m = SITTING_RE.match(folder)
    if not m:
        return None
    return m.group(1) + ("s" if m.group(2) == "maj juni" else "v")


def classify(rel):
    n = nfc(rel).lower()
    base = os.path.basename(n)
    if "forcensur" in base:
        return "forcensur"
    if "omregning" in base:
        return "omregning"
    if "1 reading" in n:
        if "censor" in base:
            return "key"
        flat = re.sub(r"[\s_-]+", "", base)
        if "laes12" in flat:
            return "L12_opg" if "opgave" in flat else "L12_txt"
        m = re.search(r"(?:laes|læs|læseforståelse|reading)([12])", flat)
        if not m:
            return "reading_misc"
        kind = "_opg" if ("opgave" in flat or "question" in flat) else "_txt" if ("tekst" in flat or "text" in flat) else "_misc"
        return "L" + m.group(1) + kind
    if "2 writing" in n:
        return "writing"
    if "3 speaking" in n:
        if "censor" in base:
            return "oral_key"
        if "omslag" in base or "portada" in base:
            return None
        return "oral"
    return None


def build_index():
    idx = {}
    for folder in sorted(os.listdir(EXAMS)):
        key = sitting_key(folder)
        full = os.path.join(EXAMS, folder)
        if not key or not os.path.isdir(full):
            continue
        files = {}
        for dp, _, fns in os.walk(full):
            for fn in fns:
                if not fn.lower().endswith((".pdf", ".docx")):
                    continue
                rel = os.path.relpath(os.path.join(dp, fn), EXAMS)
                kind = classify(rel)
                if kind:
                    files.setdefault(kind, []).append(rel)
        year, term = int(key[:4]), key[4]
        new = year > 2022 or (year == 2022 and term == "v")
        idx[key] = {
            "folder": folder,
            "format": "new" if new else "old",
            "note": SITTING_RE.sub("", folder).strip() or None,
            "files": {k: sorted(v) for k, v in sorted(files.items())},
        }
    save("exam-index.json", idx)
    return idx


def index():
    idx = load("exam-index.json", None)
    return idx if idx else build_index()


# Which sittings can feed each drill. Before Nov 2022, L2 had 2A (7 MC Qs over two texts) and
# 2B (8 gaps, 4 options) — the old 2B is the same task type as today's L3. Today's 2B
# (insert 5 of 7 text pieces) only exists from 2022v.
def usable(entry, section):
    f = entry["files"]
    if section == "L1":
        return "L1_opg" in f or "L12_opg" in f
    if section in ("L2A", "L3"):
        return "L2_opg" in f or "L12_opg" in f
    if section == "L2B":
        return entry["format"] == "new" and "L2_opg" in f
    if section in ("W1", "W2"):
        return "writing" in f
    if section in ("O1", "O2"):
        return "oral" in f or "oral_key" in f
    return False


# ---------- text extraction ----------

def extract(path):
    from pdfminer.high_level import extract_text
    from pdfminer.layout import LAParams
    t = extract_text(path, laparams=LAParams())
    t = t.replace("­", "")
    t = re.sub(r"(\w)-\n(\w)", r"\1\2", t)
    t = re.sub(r"[ \t]+\n", "\n", t)
    return re.sub(r"\n{3,}", "\n\n", nfc(t))


def cmd_get(a):
    idx = index()
    if a.sitting not in idx:
        sys.exit(f"Unknown sitting {a.sitting}. Run: pd3.py sittings")
    files = idx[a.sitting]["files"].get(a.kind)
    if not files:
        have = ", ".join(idx[a.sitting]["files"])
        sys.exit(f"{a.sitting} has no '{a.kind}'. It has: {have}")
    os.makedirs(CACHE, exist_ok=True)
    for i, rel in enumerate(files):
        src = os.path.join(EXAMS, rel)
        out = os.path.join(CACHE, f"{a.sitting}_{a.kind}{'_' + str(i + 1) if len(files) > 1 else ''}.txt")
        if rel.lower().endswith(".docx"):
            print(f"DOCX (read directly): {src}")
            continue
        if not os.path.exists(out):
            with open(out, "w", encoding="utf-8") as f:
                f.write(extract(src))
        size = len(open(out, encoding="utf-8").read().strip())
        if size < 300:
            print(f"SCANNED (no text layer, {size} chars): {src}\n  render pages: swift "
                  f"'{os.path.join(SKILL_DIR, 'scripts', 'render.swift')}' '{src}' '{CACHE}/{a.sitting}_{a.kind}_png'")
        else:
            print(out)


def cmd_sittings(a):
    idx = index()
    for k, e in idx.items():
        if a.format and e["format"] != a.format:
            continue
        parts = [s for s in SECTIONS if usable(e, s)]
        print(f"{k:6} {e['format']:3}  {' '.join(parts):28} {e['note'] or ''}")


def cmd_pick(a):
    sec = a.section.upper()
    if sec not in SECTIONS:
        sys.exit(f"Section must be one of {SECTIONS}")
    done = {s["sitting"] for s in sessions() if s["section"] == sec}
    # newest first: the closer to today's format, the better the practice
    cands = sorted((k for k, e in index().items() if usable(e, sec)),
                   key=lambda k: (k[:4], k[4] == "v"), reverse=True)
    fresh = [k for k in cands if k not in done]
    pick = (fresh or cands or [None])[0]
    print(json.dumps({"section": sec, "pick": pick, "unused": fresh, "already_done": sorted(done)}, ensure_ascii=False))


# ---------- progress ----------

def cmd_init(a):
    prof = load("profile.json", {})
    prof.update({k: v for k, v in {"name": a.name, "exam_date": a.exam_date, "oral_date": a.oral_date,
                                    "target_grade": a.target}.items() if v is not None})
    prof.setdefault("created", TODAY.isoformat())
    save("profile.json", prof)
    vocab = load("vocab.json", {"cards": {}})
    added = 0
    seed = os.path.join(SKILL_DIR, "references", "seed-vocab.tsv")
    if os.path.exists(seed):
        added = import_tsv(vocab, seed)[0]
    save("vocab.json", vocab)
    load("mistakes.json", None) or save("mistakes.json", {"patterns": {}})
    build_index()
    print(json.dumps({"profile": prof, "seeded_cards": added, "data_dir": DATA, "exams_dir": EXAMS}, ensure_ascii=False))


def cmd_log(a):
    sec = a.section.upper()
    if sec not in SECTIONS:
        sys.exit(f"Section must be one of {SECTIONS}")
    rec = {"date": TODAY.isoformat(), "section": sec, "sitting": a.sitting,
           "score": a.score, "max": a.max, "minutes": a.minutes, "note": a.note}
    os.makedirs(DATA, exist_ok=True)
    with open(os.path.join(DATA, "sessions.jsonl"), "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(json.dumps(rec, ensure_ascii=False))


def to_grade(points):
    for floor, g in GRADE_TABLE_2024S:
        if points >= floor:
            return g
    return -3


def cmd_status(a):
    prof = load("profile.json", {})
    out = {"profile": prof}
    if prof.get("exam_date"):
        out["days_to_written_exam"] = (dt.date.fromisoformat(prof["exam_date"]) - TODAY).days
    if prof.get("oral_date"):
        out["days_to_oral_exam"] = (dt.date.fromisoformat(prof["oral_date"]) - TODAY).days
    by = {}
    for s in sessions():
        by.setdefault(s["section"], []).append(s)
    secs = {}
    for sec, rows in by.items():
        last3 = rows[-3:]
        pct = sum(r["score"] / r["max"] for r in last3) / len(last3)
        secs[sec] = {"attempts": len(rows), "avg_last3_pct": round(pct * 100),
                     "last": f"{rows[-1]['score']}/{rows[-1]['max']} ({rows[-1]['sitting']}, {rows[-1]['date']})"}
    out["sections"] = secs
    if all(s in secs for s in READING_MAX):
        pts = round(sum(READING_MAX[s] * secs[s]["avg_last3_pct"] / 100 for s in READING_MAX))
        out["reading_estimate"] = {"points": f"{pts}/39", "grade_using_2024s_table": to_grade(pts)}
    cards = load("vocab.json", {"cards": {}})["cards"].values()
    today = TODAY.isoformat()
    out["vocab"] = {"cards": len(cards), "due_today": sum(1 for c in cards if c["due"] <= today),
                    "never_reviewed": sum(1 for c in cards if not c["history"]),
                    "mastered": sum(1 for c in cards if c["interval"] >= 21),
                    "due_by_priority": {p: sum(1 for c in cards if c["due"] <= today and c.get("priority", 3) == p)
                                        for p in (1, 2, 3)}}
    pats = load("mistakes.json", {"patterns": {}})["patterns"]
    top = sorted(pats.items(), key=lambda kv: (kv[1]["severity"] != "critical", -kv[1]["count"]))
    out["top_mistakes"] = [{"pattern": k, **v} for k, v in top if v["status"] != "fixed"][:6]
    out["never_practiced"] = [s for s in SECTIONS if s not in secs]
    print(json.dumps(out, ensure_ascii=False, indent=2))


# ---------- vocab (SM-2, same maths as Fluent's fluent-sm2-calculator) ----------

def card_id(word):
    return re.sub(r"[^a-z0-9æøå]+", "_", nfc(word).lower()).strip("_")


def add_card(vocab, word, meaning, group="", example="", priority=3, note=""):
    """Add a card, or update the text fields of an existing one. Returns True if it was new."""
    cid = card_id(word)
    fields = {"word": word, "meaning": meaning, "group": group or None, "example": example or None,
              "priority": int(priority or 3), "note": note or None}
    if cid in vocab["cards"]:
        vocab["cards"][cid].update({k: v for k, v in fields.items() if v is not None})
        return False
    vocab["cards"][cid] = {**fields, "ef": 2.5, "interval": 0, "reps": 0, "due": TODAY.isoformat(),
                           "lapses": 0, "history": []}
    return True


def import_tsv(vocab, path):
    added = updated = 0
    for line in open(path, encoding="utf-8"):
        if not line.strip() or line.startswith("#"):
            continue
        word, meaning, group, example, priority, note = (line.rstrip("\n").split("\t") + [""] * 5)[:6]
        if add_card(vocab, word.strip(), meaning.strip(), group.strip(), example.strip(), priority.strip() or 3, note.strip()):
            added += 1
        else:
            updated += 1
    return added, updated


def sm2(card, q):
    card.setdefault("introduced", TODAY.isoformat())
    if q >= 3:
        card["interval"] = 1 if card["reps"] == 0 else 6 if card["reps"] == 1 else round(card["interval"] * card["ef"])
        card["reps"] += 1
    else:
        card["interval"], card["reps"] = 1, 0
        card["lapses"] += 1
    card["ef"] = max(1.3, round(card["ef"] + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 2))
    card["due"] = (TODAY + dt.timedelta(days=card["interval"])).isoformat()
    card["history"] = (card["history"] + [[TODAY.isoformat(), q]])[-10:]


def matches(c, a):
    return (not getattr(a, "group", None) or (c["group"] or "") == a.group) and \
           (not getattr(a, "priority", None) or c.get("priority", 3) == a.priority)


def cmd_vocab(a):
    vocab = load("vocab.json", {"cards": {}})
    cards = vocab["cards"]
    if a.vcmd == "add":
        ok = add_card(vocab, a.word, a.meaning, a.group, a.example, a.priority, a.note)
        save("vocab.json", vocab)
        print(("added " if ok else "updated ") + card_id(a.word))
    elif a.vcmd == "import":
        added, updated = import_tsv(vocab, a.tsv)
        save("vocab.json", vocab)
        print(f"added {added}, updated {updated}, total {len(cards)}")
    elif a.vcmd == "due":
        due = [dict(id=k, **{x: c.get(x) for x in ("word", "meaning", "group", "example", "note", "priority", "reps", "lapses")})
               for k, c in cards.items() if c["due"] <= TODAY.isoformat() and matches(c, a)]
        # lapsed cards first within a priority, then cards seen fewest times
        due.sort(key=lambda c: (c["priority"] or 3, -c["lapses"], c["reps"]))
        print(json.dumps({"due_total": len(due), "items": due[: a.limit]}, ensure_ascii=False, indent=1))
    elif a.vcmd == "grade":
        if a.id not in cards:
            sys.exit(f"no card {a.id}")
        if not 0 <= a.quality <= 5:
            sys.exit("quality must be 0-5")
        sm2(cards[a.id], a.quality)
        save("vocab.json", vocab)
        c = cards[a.id]
        print(f"{a.id}: next {c['due']} (interval {c['interval']}d, ef {c['ef']})")
    elif a.vcmd == "list":
        rows = [(k, c) for k, c in cards.items() if matches(c, a)]
        for k, c in sorted(rows, key=lambda kv: (kv[1].get("priority", 3), kv[1]["group"] or "", kv[0])):
            print(f"P{c.get('priority', 3)} {c['group'] or '-':14} {c['word']:28} {c['meaning']:34} due {c['due']}")
    elif a.vcmd == "groups":
        groups = {}
        for c in cards.values():
            g = groups.setdefault((c.get("priority", 3), c["group"] or "-"), [0, 0])
            g[0] += 1
            g[1] += c["due"] <= TODAY.isoformat()
        for (p, g), (n, d) in sorted(groups.items()):
            print(f"P{p} {g:16} {n:3} cards, {d:3} due")
    elif a.vcmd == "enrich":
        n = enrich(vocab, a.files)
        save("vocab.json", vocab)
        print(f"enriched {n} of {len(cards)} cards ({sum(1 for c in cards.values() if c.get('dict'))} have a definition)")


def word_variants(word):
    """Look-up forms of a card word: 'at ansøge (om)' -> ansøge, 'trods / på trods af' -> trods, på trods af, …"""
    w = nfc(word).lower().strip()
    out = [w, re.sub(r"\s*\(.*?\)", "", w).strip()]
    out += [p.strip("() ") for p in re.findall(r"\((.*?)\)", w)]
    for part in re.split(r"\s*/\s*|\s*…\s*", out[1]):
        out.append(part.strip())
    for v in list(out):
        for art in ("at ", "en ", "et "):
            if v.startswith(art):
                out.append(v[len(art):])
    out += [re.sub(r"\s+(i|med|af|på|til|for|om)$", "", v) for v in list(out)]
    return [v for v in dict.fromkeys(out) if v]


def enrich(vocab, files):
    fold = lambda s: s.replace("æ", "ae").replace("ø", "oe").replace("å", "aa")
    idx = {}
    for path in files:
        for k, x in json.load(open(path, encoding="utf-8")).items():
            if x.get("found") is False or not x.get("senses"):
                continue
            # numbered senses are the main meanings; unnumbered ones are idioms
            senses = [s for s in x["senses"] if s.get("no")] or x["senses"]
            entry = {"source": "DDO", "pos": x.get("pos") or x.get("class") or "",
                     "senses": [(s.get("definition") or s.get("def") or "")[:220] for s in senses[:2]],
                     "cite": [c[:180] for s in senses for c in s.get("citations", [])][:2],
                     "url": x.get("url") or f"https://ordnet.dk/ddo/ordbog?query={x.get('query') or k}"}
            keys = {nfc(k.split("-", 1)[-1]).lower(), nfc(x.get("query") or "").lower(), nfc(x.get("head") or "").lower()}
            for key in keys - {""}:
                idx.setdefault(key, entry)
                idx.setdefault(fold(key), entry)
    n = 0
    for c in vocab["cards"].values():
        hit = next((idx.get(v) or idx.get(fold(v)) for v in word_variants(c["word"]) if idx.get(v) or idx.get(fold(v))), None)
        if hit:
            c["dict"] = hit
            n += 1
    return n


# ---------- real exam sentences ----------

READING_KINDS = ("L1_txt", "L2_txt", "L12_txt")


def reading_text(sitting, kind, rel, i):
    out = os.path.join(CACHE, f"{sitting}_{kind}{'_' + str(i + 1) if i else ''}.txt")
    if not os.path.exists(out):
        os.makedirs(CACHE, exist_ok=True)
        try:
            text = extract(os.path.join(EXAMS, rel))
        except Exception as e:  # damaged or odd PDFs: skip, don't stop the whole run
            print(f"skip {rel}: {e}", file=sys.stderr)
            text = ""
        with open(out, "w", encoding="utf-8") as f:
            f.write(text)
    return open(out, encoding="utf-8").read()


def split_sentences(text):
    paras = re.split(r"\n\s*\n", text)
    for p in paras:
        p = re.sub(r"\s+", " ", p).strip()
        for s in re.split(r"(?<=[.!?])\s+(?=[A-ZÆØÅ«»\"„])", p):
            words = s.split()
            if 6 <= len(words) <= 32 and s[-1] in ".!?" and not re.search(r"\d{3,}|_{2,}|\.{3}|…|\(\d+\)|www|@", s):
                yield s


def card_pattern(card):
    """Regex that finds a card word in running text; verbs and nouns get their common inflections."""
    w = nfc(card["word"]).lower()
    kind = "verb" if w.startswith("at ") else "noun" if w.startswith(("en ", "et ")) else \
        "adj" if card.get("group") == "adjektiv" else "fixed"
    ends = {"verb": r"(?:e|er|es|ede|edes|et|te|tes|t|de|des)?", "noun": r"(?:en|et|n|t|er|erne|e|ne|s)?",
            "adj": r"(?:e|t)?", "fixed": ""}[kind]
    alts = []
    for v in word_variants(card["word"]):
        if "…" in v or v.startswith(("at ", "en ", "et ")):
            continue
        toks = v.split()
        if len(toks) == 1 and kind == "fixed":
            # short connectors (da, for, så, når…) are too ambiguous mid-sentence: only after a comma or at the start
            alts.append((r"(?:(?<=,\s)|^)" if v in ("da", "for", "så", "om", "når") else "") + re.escape(v))
            continue
        if len(toks) == 1 and len(v) < 5:
            alts.append(re.escape(v) + "r?")  # short stems + full endings hit other words (vare -> var)
            continue
        head = re.escape(toks[0][:-1] if kind == "verb" and toks[0].endswith("e") else toks[0]) + ends
        alts.append(r"\s+".join([head] + [re.escape(t) for t in toks[1:]]))
    parts = [p.strip() for p in w.split("…")]
    if len(parts) == 2 and all(parts):
        alts.append(re.escape(parts[0]) + r"\b.{1,80}?\b" + re.escape(parts[1]))
    if not alts:
        return None
    return re.compile(r"(?<![\wæøå])(?:" + "|".join(sorted(set(alts), key=len, reverse=True)) + r")(?![\wæøå])", re.I)


def cmd_sentences(a):
    idx = index()
    pool = []
    for sitting, e in sorted(idx.items(), key=lambda kv: (kv[0][:4], kv[0][4] == "v"), reverse=True):
        for kind in READING_KINDS:
            for i, rel in enumerate(e["files"].get(kind, [])):
                if rel.lower().endswith(".pdf"):
                    label = f"{sitting} {kind.split('_')[0].replace('L12', 'L1+2')}"
                    pool += [(s, label) for s in split_sentences(reading_text(sitting, kind, rel, i))]
    print(f"{len(pool)} sentences from the reading texts", file=sys.stderr)
    cards = load("vocab.json", {"cards": {}})["cards"]
    out, found = {}, 0
    for cid, c in cards.items():
        pat = card_pattern(c)
        hits, seen = [], set()
        for s, src in pool if pat else []:
            m = pat.search(s)
            if m and s not in seen:
                seen.add(s)
                hits.append({"s": s, "src": src, "m": [m.start(), m.end()]})
            if len(hits) >= 4:
                break
        if hits:
            out[cid] = hits
            found += 1
    save("exam-sentences.json", {"built": TODAY.isoformat(), "sentences": out})
    print(f"{found} of {len(cards)} cards have real exam sentences -> {os.path.join(DATA, 'exam-sentences.json')}")


# ---------- Assisted Learning page ----------

PAGE = os.path.join(ROOT, "assisted-learning.html")


def build_page():
    """Write <project>/assisted-learning.html: the page template with the deck embedded, so it opens from disk."""
    tpl = os.path.join(SKILL_DIR, "app", "assisted-learning.html")
    if not os.path.exists(tpl):
        return None
    deck = {"cards": load("vocab.json", {"cards": {}})["cards"], "profile": load("profile.json", {}),
            "sentences": load("exam-sentences.json", {}).get("sentences", {}), "built": TODAY.isoformat()}
    js = "window.PD3_DECK = " + json.dumps(deck, ensure_ascii=False).replace("</", "<\\/") + ";"
    html = open(tpl, encoding="utf-8").read().replace("window.PD3_DECK = null; /*DECK*/", js)
    with open(PAGE + ".tmp", "w", encoding="utf-8") as f:
        f.write(html)
    os.replace(PAGE + ".tmp", PAGE)
    return PAGE


# ---------- mistakes ----------

def cmd_mistake(a):
    db = load("mistakes.json", {"patterns": {}})
    pats = db["patterns"]
    if a.mcmd == "add":
        p = pats.setdefault(a.pattern, {"category": a.category, "severity": a.severity, "count": 0,
                                        "first_seen": TODAY.isoformat(), "examples": [], "streak_correct": 0,
                                        "status": "active"})
        p["count"] += 1
        p["last_seen"] = TODAY.isoformat()
        p["streak_correct"] = 0
        p["status"] = "active"
        if a.severity == "critical":
            p["severity"] = "critical"
        if a.example:
            p["examples"] = (p["examples"] + [a.example])[-5:]
        print(f"{a.pattern}: seen {p['count']}x")
    elif a.mcmd == "fixed":
        if a.pattern not in pats:
            sys.exit(f"no pattern {a.pattern}")
        p = pats[a.pattern]
        p["streak_correct"] += 1
        if p["streak_correct"] >= 3:
            p["status"] = "fixed"
        print(f"{a.pattern}: correct streak {p['streak_correct']} ({p['status']})")
    elif a.mcmd == "list":
        for k, p in sorted(pats.items(), key=lambda kv: -kv[1]["count"]):
            print(f"{p['status']:6} {p['severity']:8} {p['count']:3}x {p['category']:12} {k}  e.g. {p['examples'][-1:] or ''}")
        return
    save("mistakes.json", db)


def main():
    ap = argparse.ArgumentParser(description="PD3 coach helper")
    sp = ap.add_subparsers(dest="cmd", required=True)
    p = sp.add_parser("init"); p.add_argument("--exam-date"); p.add_argument("--oral-date")
    p.add_argument("--target", type=int); p.add_argument("--name")
    sp.add_parser("status"); sp.add_parser("index")
    p = sp.add_parser("sittings"); p.add_argument("--format", choices=["new", "old"])
    p = sp.add_parser("pick"); p.add_argument("section")
    p = sp.add_parser("get"); p.add_argument("sitting"); p.add_argument("kind")
    p = sp.add_parser("log"); p.add_argument("section"); p.add_argument("sitting")
    p.add_argument("score", type=float); p.add_argument("max", type=float)
    p.add_argument("--minutes", type=int); p.add_argument("--note")
    p = sp.add_parser("vocab"); vs = p.add_subparsers(dest="vcmd", required=True)
    q = vs.add_parser("add"); q.add_argument("word"); q.add_argument("meaning"); q.add_argument("--group", default="")
    q.add_argument("--example", default=""); q.add_argument("--note", default=""); q.add_argument("--priority", type=int, default=3)
    q = vs.add_parser("import"); q.add_argument("tsv")
    q = vs.add_parser("due"); q.add_argument("--limit", type=int, default=20); q.add_argument("--group"); q.add_argument("--priority", type=int)
    q = vs.add_parser("grade"); q.add_argument("id"); q.add_argument("quality", type=int)
    q = vs.add_parser("list"); q.add_argument("--group"); q.add_argument("--priority", type=int)
    vs.add_parser("groups")
    q = vs.add_parser("enrich"); q.add_argument("files", nargs="+")
    sp.add_parser("sentences")
    sp.add_parser("page")
    p = sp.add_parser("mistake"); ms = p.add_subparsers(dest="mcmd", required=True)
    q = ms.add_parser("add"); q.add_argument("pattern"); q.add_argument("--category", required=True)
    q.add_argument("--severity", default="moderate", choices=["critical", "moderate", "minor"]); q.add_argument("--example")
    q = ms.add_parser("fixed"); q.add_argument("pattern")
    ms.add_parser("list")
    a = ap.parse_args()
    {"init": cmd_init, "status": cmd_status, "index": lambda a: print(f"{len(build_index())} sittings indexed"),
     "sittings": cmd_sittings, "pick": cmd_pick, "get": cmd_get, "log": cmd_log,
     "vocab": cmd_vocab, "mistake": cmd_mistake, "sentences": cmd_sentences,
     "page": lambda a: print(build_page() or "template missing")}[a.cmd](a)


if __name__ == "__main__":
    main()
