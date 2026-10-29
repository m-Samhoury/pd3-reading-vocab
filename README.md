# PD3 reading vocabulary

Study tool for the reading part (Læseforståelse 1–3) of Prøve i Dansk 3, built from the four
exam sittings Nov 2022 – May 2024. Standalone pages, no install needed, work offline:

- `index.html` – overview, progress and word groups
- `study-sheet.html` – every word with meanings, examples, collocations and word order; search, filter, print
- `flashcards.html` – spaced-repetition flashcards (`#learn`; the card front shows the word, the word in a real exam sentence, or its meaning) and a 10-question exam-style test (`#test`)
- `assisted-learning.html` – guided teach → test → review for the PD3 coach deck ([open](https://m-samhoury.github.io/pd3-reading-vocab/assisted-learning.html)), plus *Find ord*, a word → group lookup ([open](https://m-samhoury.github.io/pd3-reading-vocab/assisted-learning.html#find))

Progress is stored in the browser (localStorage). Use Export/Import on the flashcards page to move it.

## Assisted Learning

**Open it: https://m-samhoury.github.io/pd3-reading-vocab/assisted-learning.html**

It is also in the top bar of every page (*Guidet læring*) and has a card on the overview.

A guided page in the same design (and the same Dansk/English switch) for the PD3 coach's 174-card deck (connectors first). New words come in batches of five from
one relation group and are taught before they're tested: word-order rule (SUB/ADV/KOO/PRÆP), example,
real sentences from the 2004–2024 reading texts, the Den Danske Ordbog entry and the confusable partner.
Then six rotating exercises (meaning, typing, relation, gap-fill, word-order tiles, L3 pair), a
confusables drill (*da/når*, *for/fordi* …), SM-2 spaced repetition and a group map.
Progress is saved in the browser on each device (localStorage) and survives closing the page.

**Find ord** (top bar, https://m-samhoury.github.io/pd3-reading-vocab/assisted-learning.html#find) looks up a word
and shows its group in Guidet læring and on the study sheet (`data/words.json`). It accepts bent forms
(*medfører*), abbreviations (*bl.a.*, *pga*), English meanings, and suggests the closest word for a typo.

`assisted-learning.html` is a single self-contained file built by the pd3-coach skill in the
PD3 samples collection project (`python3 -I .claude/skills/pd3-coach/scripts/pd3.py page`); to update it,
copy the rebuilt file over this one. It also opens straight from disk, no server needed.

## Contents

| Tier | What | Words | Groups |
|---|---|---|---|
| 1 | Connectors (every connector in the exams + the Sokolova guide), grouped by logical relation, each with a word-order note | 111 | 11 |
| 2 | Words from questions, answer options and L3 gaps | 124 | 8 |
| 3 | Frequent words in the reading texts | 124 | 7 |

359 words, 569 senses, 26 groups. `python3 src/scripts/validate.py` checks the data.

### How words were chosen

- **Tier 2**: L3 answer option in ≥1 exam, *or* a question-side occurrence (L1/L2A question, L2A option,
  L2B sentence, L3 gap sentence) in ≥2 exams.
- **Tier 3**: occurs in the reading texts of ≥2 exams and ≥3 times in total.
- Candidates are every exam word clustered by stem (`src/scripts/candidates.py` →
  `reports/candidates_t23.md`: 302 Tier 2 + 537 Tier 3 before curation). Kept by hand:
  B1–B2 vocabulary. Dropped: A1–A2 basics (har, dag, mange, læse …), names, words already in Tier 1,
  topic-only words (vikingetid, flagermus …) and web fragments. The kept list is
  `src/lexicon/selection_t23.txt`; each word is then recounted with all its DDO forms and dropped
  if it no longer meets the rule.
- A word belongs only to the highest tier it qualifies for. Bookish words named in the Sokolova guide
  (afgøre, afgørende, vilkår, fremhæve, undlade, plus guide connectors in Tier 1) are tagged `source: guide`.

### Where the information comes from

Every entry, on all pages including Guidet læring, shows the same blocks: word class, en/et (nouns), bøjning,
construction, meanings, examples and a *Brug* list.

Text written by AI (Claude) for this tool carries a small dashed **AI** tag on every page: definitions, English
meanings, *Brug*, synonyms, word-order notes, construction notes that are not DDO patterns, Guidet læring's notes
and tips, and examples that are not copied word for word from an exam or DDO (`render.py` checks each example
against the exam text). Untagged text is from Den Danske Ordbog, the exams or Wiktionary; Guidet læring's English
under DDO's definitions is marked as Google Translate.

- **Word class, en/et, bøjning, forms** – Den Danske Ordbog (ordnet.dk), read from the cached pages.
  Participles and comparatives take their bøjning from their DDO headword (*kvalificeret* ← *kvalificere*).
- **Construction** – DDO's grammar patterns (*NOGEN forklarer NOGET/at+SÆTNING over_for NOGEN*) where DDO has
  them (164 words); otherwise a `con:` line in the lexicon, written from the exam sentences and the
  Guidet læring "Med:" lines.
- **Definitions** – written for this tool following DDO's senses (most frequent senses; DDO itself
  lists more). Every headword was matched to DDO (`reports/unverified.md`).
- **Examples** – the first sense uses a sentence taken or adapted from the exams where the word occurs;
  further senses (which the exams rarely use) and the 21 Tier 2 words that occur only as single-word
  L3 options have illustrative sentences.
- **English headword** – English Wiktionary (CC BY-SA 4.0); words without a Danish Wiktionary entry
  show no English headword rather than a made-up one.

### Deviations from the original brief

- *Formål* was merged into the Tier 1 group *Betingelse & formål*; an extra group *Forklaring / Uddybning* was added.
- `index.html` is a third page (overview) next to the study sheet and flashcards.
- Gap-fill questions for connectors without a real L3 item use distractors from other logical relations.
- Senses cover the meanings relevant at B2 level, not every specialist sense DDO lists.

## Layout

| Path | What |
|---|---|
| `*.html` | Generated site (served by GitHub Pages) |
| `data/` | `words.json`, `groups.json` – the generated vocabulary |
| `src/lexicon/` | Hand-written entries (senses, examples, word order), Tier 2/3 selection and groups |
| `src/templates/` | Page templates, CSS, JS, UI strings (`i18n.js`) |
| `src/scripts/` | Extraction, segmentation, build, render and validation |
| `reports/` | Scope, candidate list, frequency report, unverified entries |

## Rebuild

The exam PDFs and intermediate exam text are not in this repo. Point `PD3_EXAMS` at the folder
with the PD3 PDFs (defaults to `../PD3 samples collection (2004-2024)`):

```bash
python3 src/scripts/01_extract.py   # PDFs → raw text (needs pdfminer.six)
python3 src/scripts/02_segment.py   # raw text → exam parts (needs pdfplumber)
python3 src/scripts/build.py        # lexicon + exams → data/*.json, reports/
python3 src/scripts/validate.py     # check the data
python3 src/scripts/render.py       # data + templates → *.html
```

After editing only templates or UI strings, `render.py` alone is enough.

Tier 2/3 working files and dictionary data (cached outside the repo, under `$PD3_EXAMS/work/`):

```bash
python3 src/scripts/candidates.py    # all candidates → reports/candidates_t23.md
python3 src/scripts/t23_facts.py     # DDO facts + exam contexts for the selection
python3 src/scripts/t23_lexicon.py   # fill class/forms/ddo lines in the Tier 2/3 lexicon files
python3 src/scripts/ddo_entries.py   # word class, en/et, bøjning (+ DDO senses for the private build)
python3 src/scripts/wiktionary.py    # English headword glosses from Wiktionary (CC BY-SA 4.0)
python3 src/scripts/render.py --private   # private/ – same pages plus DDO's definitions verbatim
python3 src/scripts/coach_info.py    # word class, en/et, bøjning, construction, Brug for Guidet læring's deck
                                     #   → $PD3_EXAMS/pd3-data/wordinfo.json (then `pd3.py page` there)
```

`private/` is git-ignored: Den Danske Ordbog's wording is copyrighted, so the study sheet and
flashcards only use it in the local copy; their public pages link to DDO, ordbogen.com and
Wiktionary for every word. Exception: `assisted-learning.html` is published with DDO definitions
and citations included.
