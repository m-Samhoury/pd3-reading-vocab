"""Tier 2/3 entries, group assembly and reports (called from build.py)."""
import collections, glob, json, os, re

import build as B
from tokens import WORD

LEX = B.LEX
QUESTION_SIDE = {("L1", "question"), ("L2A", "question"), ("L2A", "option"), ("L2B", "option"), ("L3", "gap")}
TIER2_RULE = "L3 option in ≥1 exam, OR question-side occurrence (L1/L2A question, L2A option, L2B sentence, L3 gap sentence) in ≥2 exams"
TIER3_RULE = "reading-text occurrence in ≥2 exams AND ≥3 occurrences in total"


def classify(occ):
    l3opt = any(p == "L3" and l == "option" for (e, p, l) in occ)
    qs_exams = {e for (e, p, l) in occ if (p, l) in QUESTION_SIDE}
    txt = {(e, p, l): n for (e, p, l), n in occ.items() if l == "text"}
    txt_exams = {e for (e, p, l) in txt}
    if l3opt or len(qs_exams) >= 2:
        return 2
    if len(txt_exams) >= 2 and sum(txt.values()) >= 3:
        return 3
    return None


def form_regex(forms):
    alts = sorted({f.strip() for f in forms if f.strip()}, key=len, reverse=True)
    alts = [re.escape(a).replace(r"\ ", r"\s+") for a in alts]
    return re.compile(r"(?<![\wæøå-])(?:" + "|".join(alts) + r")(?![\wæøå])", re.I)


def read_groups():
    path = os.path.join(LEX, "groups_t23.txt")
    out = []
    if not os.path.exists(path):
        return out
    for line in open(path, encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            gid, da, en, tier = [x.strip() for x in line.split("|")]
            out.append({"id": gid, "name_da": da, "name_en": en, "tier": int(tier)})
    return out


def build(units, taken):
    lex = B.parse_lexicon(sorted(glob.glob(os.path.join(LEX, "tier2_*.txt")) + glob.glob(os.path.join(LEX, "tier3_*.txt"))))
    words, dropped = [], []
    for lemma, L in lex.items():
        m = L["meta"]
        forms = m.get("forms", lemma).split(",")
        occ, sents = B.scan(units, form_regex(forms))
        source = m.get("source", "exam")
        tier = classify(occ)
        if tier is None and source == "guide":
            tier = 2
        if tier is None:
            dropped.append((lemma, sum(occ.values())))
            continue
        ok, info = B.ddo_verify(lemma, m.get("ddo"))
        senses = L["senses"]
        for i, s in enumerate(senses, 1):
            s["n"] = i
            s["verified"] = ok and s.pop("verified_sense")
        groups = []
        for g in [s["group"] for s in senses]:
            if g not in groups:
                groups.append(g)
        words.append({
            "id": f"t{tier}-" + B.slug(lemma), "lemma": lemma, "display": m.get("display", lemma),
            "word_class": m["class"], "grammar": m.get("grammar", ""), "tier": tier,
            "forms": [f.strip() for f in forms],
            "source": ("exam+guide" if source == "guide" and occ else source if not occ else "exam"),
            "groups": groups, "primary_group": groups[0],
            "frequency": B.freq_block(occ), "occurrences": B.occ_list(occ),
            "exam_sentences": B.pick_sentences(sents), "senses": senses,
            "verified": ok, "ddo": info, "l3_option": any(p == "L3" and l == "option" for (e, p, l) in occ)})
    if dropped:
        print("Tier 2/3 entries below threshold (dropped):", dropped)
    return words


def groups(words, relations):
    out = []
    order = 0
    for gid, da, en in relations:
        order += 1
        out.append({"id": gid, "name_da": da, "name_en": en, "tier": 1, "order": order})
    for g in read_groups():
        order += 1
        g["order"] = order
        out.append(g)
    by_id = {g["id"]: g for g in out}
    for g in out:
        members = [w for w in words if g["id"] in w["groups"] and (g["tier"] == 1) == (w["tier"] == 1)]
        members.sort(key=lambda w: (w["tier"], -w["frequency"]["weighted_question_score"], -w["frequency"]["exams"],
                                    -w["frequency"]["total"], w["lemma"]))
        g["words"] = [w["id"] for w in members]
    for w in words:
        for gid in w["groups"]:
            if gid not in by_id:
                raise SystemExit(f"{w['lemma']}: unknown group {gid}")
    # groups are ordered by tier, then by the strength of their best member
    t1 = [g for g in out if g["tier"] == 1]
    rest = [g for g in out if g["tier"] != 1]
    score = {w["id"]: w["frequency"]["weighted_question_score"] + w["frequency"]["total"] / 10 for w in words}
    rest.sort(key=lambda g: (g["tier"], -sum(score[i] for i in g["words"][:5])))
    out = t1 + rest
    for i, g in enumerate(out, 1):
        g["order"] = i
    return out


def reports(words, groups, units):
    work = os.path.join(B.ROOT, "reports")
    tiers = collections.defaultdict(list)
    for w in words:
        tiers[w["tier"]].append(w)
    rank = lambda w: (-w["frequency"]["weighted_question_score"], -w["frequency"]["exams"], -w["frequency"]["total"])
    rank1 = lambda w: (-w["frequency"]["exams"], -w["frequency"]["total"])
    L = ["# Frequency report", "",
         "In-scope exams: " + ", ".join(f"{e} ({B.EXAM_LABEL[e]})" for e in B.EXAM_ORDER), "",
         "## Thresholds", "",
         "- **Tier 1** – every connector found in the in-scope exams, plus connectors named in the Sokolova guide (`source: guide`).",
         f"- **Tier 2** – {TIER2_RULE}. Ranked by a weighted score: L3 option ×4, L3 gap sentence ×3, L2A/L2B option ×2, L2A question ×2, L1 question ×1.5.",
         f"- **Tier 3** – {TIER3_RULE}. Ranked by number of exams, then total occurrences.",
         "- Excluded: A1–A2 basic vocabulary, proper nouns, numbers; a word belongs only to the highest tier it qualifies for.", "",
         "## Counts", "",
         f"- Total words: **{len(words)}**"]
    for t in sorted(tiers):
        L.append(f"- Tier {t}: **{len(tiers[t])}**" + (f" ({sum(1 for w in tiers[t] if w['source']=='guide')} guide-only)" if t == 1 else ""))
    L += ["", "### Words per exam (word occurs at least once)", "", "| Exam | Tier 1 | Tier 2 | Tier 3 |", "|---|---|---|---|"]
    for e in B.EXAM_ORDER:
        L.append(f"| {e} | " + " | ".join(str(sum(1 for w in tiers[t] if e in w["frequency"]["exam_list"])) for t in (1, 2, 3)) + " |")
    L += ["", "### Words per exam part (word occurs at least once)", "", "| Part | Tier 1 | Tier 2 | Tier 3 |", "|---|---|---|---|"]
    for p in ("L1", "L2A", "L2B", "L3"):
        L.append(f"| {p} | " + " | ".join(str(sum(1 for w in tiers[t] if w["frequency"]["by_part"].get(p))) for t in (1, 2, 3)) + " |")
    L += ["", "### Words per group", "", "| # | Group | Tier | Words |", "|---|---|---|---|"]
    for g in groups:
        L.append(f"| {g['order']} | {g['name_da']} / {g['name_en']} | {g['tier']} | {len(g['words'])} |")
    for t in sorted(tiers):
        L += ["", f"## Top 50 – Tier {t}", "", "| # | Lemma | Class | Exams | Total | Weighted | L1 | L2A | L2B | L3 |", "|---|---|---|---|---|---|---|---|---|---|"]
        for i, w in enumerate(sorted(tiers[t], key=rank1 if t != 2 else rank)[:50], 1):
            f = w["frequency"]
            L.append(f"| {i} | {w['lemma']} | {w['word_class']} | {f['exams']} | {f['total']} | {f['weighted_question_score']:g} | "
                     + " | ".join(str(f["by_part"].get(p, 0)) for p in ("L1", "L2A", "L2B", "L3")) + " |")
    open(os.path.join(work, "frequency_report.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")

    U = ["# Unverified entries", "",
         "An entry is *verified* when its headword (or, for a fixed expression, the expression itself) was found in "
         "Den Danske Ordbog (ordnet.dk/ddo) and every sense was written against DDO's sense list. "
         "Entries listed here could not be matched and should be double-checked.", ""]
    bad = [w for w in words if not w["verified"] or any(not s["verified"] for s in w["senses"])]
    if not bad:
        U.append("_None – all entries matched DDO._")
    for w in bad:
        why = "headword not found in DDO" if not w["verified"] else "sense(s) not matched: " + ", ".join(
            str(s["n"]) for s in w["senses"] if not s["verified"])
        U.append(f"- **{w['lemma']}** (tier {w['tier']}, {w['word_class']}) – {why}; DDO query `{w['ddo'].get('query')}`")
    open(os.path.join(work, "unverified.md"), "w", encoding="utf-8").write("\n".join(U) + "\n")
