# PD3 reading vocabulary

Study tool for the reading part (Læseforståelse 1–3) of Prøve i Dansk 3, built from the four
exam sittings Nov 2022 – May 2024. Three standalone pages, no install needed, work offline:

- `index.html` – overview, progress and word groups
- `study-sheet.html` – every word with meanings, examples, collocations and word order; search, filter, print
- `flashcards.html` – spaced-repetition flashcards (`#learn`) and a 10-question exam-style test (`#test`)

Progress is stored in the browser (localStorage). Use Export/Import on the flashcards page to move it.

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

- **Word class, en/et, bøjning, forms** – Den Danske Ordbog (ordnet.dk), read from the cached pages.
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
```

`private/` is git-ignored: Den Danske Ordbog's wording is copyrighted, so it is only
used in the local copy and never published. The public pages link to DDO, ordbogen.com
and Wiktionary for every word.
