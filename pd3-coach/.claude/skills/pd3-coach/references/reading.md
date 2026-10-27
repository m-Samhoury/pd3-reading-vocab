# Reading drills (Læseforståelse 1, 2A, 2B, 3)

Always prefer a **real past paper** over an invented text. Invent only for micro-drills (one connector, one distractor type)
or when the learner asks. Answer keys are in each sitting's `key` file (Censor- og eksaminatorhæfte, skriftlig).

## Getting the material

```bash
python3 -I "$SKILL/scripts/pd3.py" pick L1          # → newest sitting not yet done for this section
python3 -I "$SKILL/scripts/pd3.py" get 2024s L1_txt # text booklet  → cache path
python3 -I "$SKILL/scripts/pd3.py" get 2024s L1_opg # question booklet
python3 -I "$SKILL/scripts/pd3.py" get 2024s key    # answer key — read it yourself, never show before the learner answers
```
L2A, L2B and L3 all live in `L2_txt` + `L2_opg` (L3 is on the back of the L2 question sheet). For old sittings
(before 2022v), "Delprøve 2A" = 7 MC questions, "Delprøve 2B" = today's L3. Some old files are `L12_opg`/`L12_txt`
(both parts in one PDF). If `get` says SCANNED, render the pages with the printed swift command and read the PNGs with Read.

The learner normally has the PDF open themselves (`open <pdf>` opens it in Preview). Tell them the exact file and page;
you do not need to paste the whole text into chat. Paste a text only if they ask or for a short drill.

## Timed run (exam simulation)
1. Announce the clock: L1 = 25 min; L2A+2B+3 = 65 min. Note start time (`date +%H:%M`) and start a background
   `sleep <seconds>; echo TIME UP` so you can call time. Ask them to post answers when done.
2. Have them post answers as a numbered list in one message (exam style — no feedback mid-run).
3. Grade against the key with the key's own conventions:
   - **L1**: 1 or 0 points. Words in `( )` are optional; `/` means and/or. Short answer is right if it contains the key's core and **nothing wrong added**
     ("der må ikke være medtaget noget, som ikke hører med til svaret"). Spelling must be recognisable — flag misspellings as 🟢 even when you give the point; give 0 if the misspelling changes the word.
   - **2A** 2/0, **2B** 2/0, **L3** 1/0 — objective, follow the key exactly.
4. Report: points per part, total /39 if full reading, estimated grade (2024s table, say it's an estimate), time used.
5. Debrief **each wrong answer** (see below), then log: `pd3.py log L1 2024s 12 15 --minutes 23`. Log 2A, 2B, L3 separately.
6. Add every unknown word they hit to the deck (`vocab add … --priority 2`, with the group and the sentence from the text as example). Ask first which words they want — opt-in, like Fluent.

If the learner abandons a run midway, don't log a score; note it in the plan so the paper is still available.

## Debrief rules per part

**L1 (scan & find)** — for each miss, find *where* in the text the answer was and *which signal* would have found it fast:
the section heading, a synonym of the question word (*omfatte → inkluderer*, *vare → tager … tid*), a number, a name.
Typical L1 traps: answering with a whole sentence that adds a wrong detail; the question asks *hvornår* (a time) but they give a place;
*ellers / eller* confusion; *ikke/næppe/næsten ikke* negations; modal verbs (*skal* = must vs. *kan* = may); "Nej" questions where the right answer is just *Nej*.
Battle-plan habits to check: did they scan 3 min first? did they skip a hard question? one-word answers?

**2A (multiple choice)** — the learner's plan: read the text first, then the questions; stick to the text; spot the confusing element.
For each option, label it: ✅ supported (quote the line) · ❌ *lexical trap* (shares words with the text but changes meaning, e.g. *prioriterer ikke*, *lade være*)
· ❌ *overgeneralises* · ❌ *over-specifies* · ❌ *true in the world but not stated*. Make the learner name the trap before you do.

**2B (insert text pieces)** — 5 gaps, 7 pieces (A–G), 2 don't fit. Teach the cohesion check for each gap:
1. Look at the sentence **before** and **after** the gap.
2. Read the piece's first word: connector (*Derfor, Til gengæld, Desuden, Men*) → which relation does it need? (see `connectors.md`)
3. Pronouns/determiners (*det, de, denne, sådan en, disse*) must point back to something that exists right before the gap.
4. Topic continuity: does the piece's subject match the paragraph?
Debrief the two distractors too — why do they *not* fit?

**L3 (gap fill, 4 options)** — battle-plan rules: words in the same logical/synonym group cancel each other out;
check the preposition that follows the gap (*indflydelse på*, *effekten af*, *et formål med*); check word class and grammar fit (noun vs verb, en/et, plural).
After the debrief, add all 32 option words from the grid to the deck — Sokolova: "treat the answer-option table as vocabulary for future L3s".

## Short drills (10 min, between full runs)
- **Connector sort**: give 6 connectors, learner sorts them into konsekvens / modsætning / tilføjelse / årsag / sammenligning.
- **Distractor spotting**: take one past 2A question, show only the wrong options, learner explains the trap.
- **Preposition recall**: *indflydelse ___*, *et krav ___*, *tilfreds ___* (from the deck, group `praep`).
- **Synonym cancel**: give 4 L3 options, learner names the two that cancel each other.
- **Scan sprint** (L1): give a question + 1 page path, 60 seconds to locate the line.
