# PD3 reading vocabulary

Study tool for the reading part (Læseforståelse 1–3) of Prøve i Dansk 3, built from the
exam sittings Nov 2022 – May 2024. Three standalone pages, no install needed, work offline:

- `index.html` – overview, progress and word groups
- `study-sheet.html` – every word with meanings, examples, collocations and word order; search, filter, print
- `flashcards.html` – spaced-repetition flashcards (`#learn`) and a 10-question exam-style test (`#test`)

Progress is stored in the browser (localStorage). Use Export/Import on the flashcards page to move it.

## Status

Tier 1 (111 connectors, verified against Den Danske Ordbog) is done. Tier 2 (question words) and
Tier 3 (reading-text words) are not built yet.

## Layout

| Path | What |
|---|---|
| `*.html` | Generated site (served by GitHub Pages) |
| `data/` | `words.json`, `groups.json` – the generated vocabulary |
| `src/lexicon/` | Hand-written entries (senses, examples, word order) |
| `src/templates/` | Page templates, CSS, JS, UI strings (`i18n.js`) |
| `src/scripts/` | Extraction, segmentation, build and render pipeline |
| `reports/` | Scope, frequency report, unverified entries |

## Rebuild

The exam PDFs and intermediate exam text are not in this repo. Point `PD3_EXAMS` at the folder
with the PD3 PDFs (defaults to `../PD3 samples collection (2004-2024)`):

```bash
python3 src/scripts/01_extract.py   # PDFs → raw text (needs pdfminer.six)
python3 src/scripts/02_segment.py   # raw text → exam parts (needs pdfplumber)
python3 src/scripts/build.py        # lexicon + exams → data/*.json, reports/
python3 src/scripts/render.py       # data + templates → *.html
```

After editing only templates or UI strings, `render.py` alone is enough.

Dictionary data (cached outside the repo, under `$PD3_EXAMS/work/`):

```bash
python3 src/scripts/ddo_entries.py   # word class, en/et, bøjning (+ DDO senses for the private build)
python3 src/scripts/wiktionary.py    # English headword glosses from Wiktionary (CC BY-SA 4.0)
python3 src/scripts/render.py --private   # private/ – same pages plus DDO's definitions verbatim
```

`private/` is git-ignored: Den Danske Ordbog's wording is copyrighted, so it is only
used in the local copy and never published. The public pages link to DDO, ordbogen.com
and Wiktionary for every word.
