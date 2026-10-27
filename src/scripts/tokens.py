"""Tokenisation of segmented exams into located tokens + Danish Snowball stemmer.

Every token carries (exam, part, location, sentence) where
  part     ∈ L1 | L2A | L2B | L3
  location ∈ question | option | gap | text
"""
import json, os, re

from paths import WORK
SEG = os.path.join(WORK, "segments.json")

VOW = "aeiouyæåø"
S_END = set("abcdfghjklmnoprtvyzå")
STEP1 = sorted("hed ethed ered e erede ende erende ene erne ere en heden eren er heder erer heds es "
               "endes erendes enes ernes eres ens hedens erens ers ets erets et eret".split(), key=len, reverse=True)


def _r1(w):
    for i in range(1, len(w)):
        if w[i] not in VOW and w[i - 1] in VOW:
            return max(i + 1, 3)
    return len(w)


def stem(w):
    w = w.lower()
    r1 = _r1(w)
    for suf in STEP1:
        if w.endswith(suf) and len(w) - len(suf) >= r1:
            w = w[:-len(suf)]
            break
    else:
        if w.endswith("s") and len(w) - 1 >= r1 and len(w) > 1 and w[-2] in S_END:
            w = w[:-1]

    def step2(x):
        return x[:-1] if any(x.endswith(e) for e in ("gd", "dt", "gt", "kt")) and len(x) - 2 >= r1 else x
    w = step2(w)
    if w.endswith("igst"):
        w = w[:-2]
    for suf in ("elig", "løst", "lig", "els", "ig"):
        if w.endswith(suf) and len(w) - len(suf) >= r1:
            w = w[:-1] if suf == "løst" else w[:-len(suf)]
            if suf != "løst":
                w = step2(w)
            break
    if len(w) >= 2 and w[-1] == w[-2] and w[-1] not in VOW and len(w) - 1 >= r1:
        w = w[:-1]
    return w


WORD = re.compile(r"[A-Za-zÆØÅæøåéÉüÜöÖäÄ]+(?:-[A-Za-zÆØÅæøå]+)*")
SENT = re.compile(r"(?<=[.!?”])\s+(?=[A-ZÆØÅ”\"«(])")


def sentences(text):
    return [s.strip() for s in SENT.split(text) if s.strip()]


def located_units(seg):
    """Yield (exam, part, location, text_unit) for every unit, de-duplicated
    (the 2023s L1 booklet repeats some passages in an overlapping text layer)."""
    seen = set()
    for u in _units(seg):
        k = (u[0], u[1], u[2], re.sub(r"\s+", " ", u[3]).strip())
        if k in seen and k[2] != "option":     # the same option can serve two gaps
            continue
        seen.add(k)
        yield k


def _units(seg):
    for exam, x in seg.items():
        for q in x["L1"]["questions"]:
            yield exam, "L1", "question", q["text"]
        for s in sentences(x["L1"]["text"]):
            yield exam, "L1", "text", s
        for q in x["L2A"]["questions"]:
            yield exam, "L2A", "question", q["stem"]
            for o in q["options"].values():
                if o:
                    yield exam, "L2A", "option", o
        for s in sentences(x["L2A"]["text"]):
            yield exam, "L2A", "text", s
        for o in x["L2B"]["sentences"].values():
            yield exam, "L2B", "option", o
        for s in sentences(x["L2B"]["text"]):
            yield exam, "L2B", "text", s
        gap_sents = set()
        for it in x["L3"]["items"]:
            for o in it["options"].values():
                yield exam, "L3", "option", o
            if it.get("filled_sentence"):
                fs = it["filled_sentence"].replace("«", "").replace("»", "")
                gap_sents.add(fs)
                yield exam, "L3", "gap", fs
        for s in sentences(x["L3"]["text"]):
            if s not in gap_sents and not any(s in g or g in s for g in gap_sents):
                yield exam, "L3", "text", s


def load():
    with open(SEG, encoding="utf-8") as f:
        return json.load(f)
