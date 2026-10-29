"""Validate data/words.json and data/groups.json. Exit code 1 if anything is wrong.

Checks: unique ids; exactly one tier (1–3); ≥1 sense with Danish + English definition and a Danish +
English example; ≥1 group, all known; a word-order note on every Tier 1 entry; no empty required fields;
15–30 groups, none with fewer than 4 words; group word lists point at existing words of the same tier;
a construction (DDO grammar pattern or con: line) and a Brug list on every word.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from paths import REPO, WORK  # noqa: E402

REQUIRED_WORD = ("id", "lemma", "word_class", "tier", "forms", "groups", "primary_group", "senses", "frequency", "source")
REQUIRED_SENSE = ("da_definition", "en_definition", "example_da", "example_en", "group", "register")


def main():
    words = json.load(open(os.path.join(REPO, "data", "words.json"), encoding="utf-8"))
    groups = json.load(open(os.path.join(REPO, "data", "groups.json"), encoding="utf-8"))
    errors = []
    err = lambda w, msg: errors.append(f"{w.get('id', w.get('lemma', '?'))}: {msg}")
    gids = {g["id"]: g for g in groups}
    ddo_path = os.path.join(WORK, "ddo_entries.json")
    ddo_e = json.load(open(ddo_path, encoding="utf-8")) if os.path.exists(ddo_path) else None
    seen = set()
    for w in words:
        if w.get("id") in seen:
            err(w, "duplicate id")
        seen.add(w.get("id"))
        for k in REQUIRED_WORD:
            if w.get(k) in (None, "", []):
                err(w, f"empty field '{k}'")
        if w.get("tier") not in (1, 2, 3):
            err(w, f"tier must be 1, 2 or 3 (got {w.get('tier')!r})")
        for g in w.get("groups", []):
            if g not in gids:
                err(w, f"unknown group {g}")
        if w.get("primary_group") not in w.get("groups", []):
            err(w, "primary_group not among groups")
        if w.get("tier") == 1:
            wo = w.get("word_order") or {}
            if not wo.get("note_da") or not wo.get("note_en"):
                err(w, "Tier 1 entry without a word-order note")
        if not w.get("senses"):
            err(w, "no senses")
        # every entry shows the same blocks: construction, Brug, (nouns) en/et
        if not w.get("construction") and not (ddo_e and ddo_e.get(w["id"], {}).get("grammar")):
            err(w, "no construction (no DDO grammar pattern and no con: line)")
        if not any(s.get("collocations") for s in w.get("senses", [])):
            err(w, "no Brug list (collocations) in any sense")
        for i, s in enumerate(w.get("senses", []), 1):
            for k in REQUIRED_SENSE:
                if not str(s.get(k, "")).strip() or s.get(k) == "-":
                    err(w, f"sense {i}: empty '{k}'")
            if s.get("group") not in gids:
                err(w, f"sense {i}: unknown group {s.get('group')}")
    by_id = {w["id"]: w for w in words}
    live = [g for g in groups if g["words"]]
    if not 15 <= len(live) <= 30:
        errors.append(f"groups: {len(live)} groups with words (expected 15–30)")
    for g in live:
        if len(g["words"]) < 4:
            errors.append(f"group {g['id']}: only {len(g['words'])} words (min 4)")
        for wid in g["words"]:
            if wid not in by_id:
                errors.append(f"group {g['id']}: unknown word {wid}")
            elif (by_id[wid]["tier"] == 1) != (g["tier"] == 1):
                errors.append(f"group {g['id']}: word {wid} is in another tier")
    tiers = {t: sum(1 for w in words if w["tier"] == t) for t in (1, 2, 3)}
    print(f"{len(words)} words (Tier 1: {tiers[1]}, Tier 2: {tiers[2]}, Tier 3: {tiers[3]}), "
          f"{sum(len(w['senses']) for w in words)} senses, {len(live)} groups")
    if errors:
        print(f"{len(errors)} problem(s):")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    print("OK – all checks passed")


if __name__ == "__main__":
    main()
