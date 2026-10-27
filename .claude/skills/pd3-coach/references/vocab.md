# Vocabulary drills (spaced repetition, connectors first)

Deck: `pd3-data/vocab.json`, managed only with `pd3.py vocab …`. Priority 1 = connectors/conjunctions,
2 = exam words (L1 verbs, L2 question words, L3 option grids, preposition phrases), 3 = other.
`vocab due` always serves priority 1 first, lapsed cards first within a priority.

## Session shape (~15–20 min, one card at a time)
1. `pd3.py vocab due --limit 15` (add `--priority 1` or `--group kontrast` if the learner asks for a focus).
2. New cards (never reviewed): introduce in **batches of 5 from the same relation group** — show word, meaning, the note
   (SUB/ADV/KOO/PRÆP) and the example; then test them straight away. Don't introduce more than ~15 new cards a day.
3. Rotate the exercise type per card (never the same type twice in a row):
   - **Meaning**: "Hvad betyder *imidlertid*?" → English.
   - **Production**: "Danish for *nevertheless*?"
   - **Relation**: "Which group: *følgelig*?" (konsekvens / årsag / kontrast / indrømmelse / tilføjelse / betingelse / formål …)
   - **Word order** (priority 1, the most valuable): "Join with *selvom*: *Det regner.* + *Vi går en tur.*" → *Selvom det regner, går vi en tur.*
     or "Start with *Derfor*: *Vi bliver hjemme.*" → *Derfor bliver vi hjemme.* Check SUB (ikke before verb, main clause inverts if the sub-clause is first),
     ADV (inversion), PRÆP (+ noun, not a clause: *på grund af regnen* vs *fordi det regner*).
   - **Cloze**: the card's example with the connector blanked — or better, a sentence from a real exam text (`pd3.py get <sitting> L2_txt`, grep the word).
   - **L3-style odd pair**: 4 connectors, two from the same group → "which two cancel each other?"
4. Feedback per card, Fluent-style and short: ✅/❌ · correct form · one-line why (the note) · ask for a retype after a word-order error.
5. Grade immediately: `pd3.py vocab grade ID Q` with
   5 = instant + correct word order · 4 = correct after hesitation · 3 = correct meaning, small slip (e.g. word order) ·
   2 = wrong but recognised when shown · 1 = vaguely familiar · 0 = blank.
6. Every 5 cards: a one-line pulse (x/5 right). At the end: accuracy, cards still shaky (Q ≤ 2), next due date of the batch, and
   one sentence that uses 3 of today's connectors for the learner to write (graded as a mini writing task).

Confusable pairs to drill side by side when either one lapses: *da/når* · *for/fordi* · *eller/ellers* · *derfor/derimod* ·
*imidlertid/straks* · *mens (tid)/mens (kontrast)* · *selvom/alligevel* (same meaning, different word order) · *på grund af/fordi*.

Adding words found in practice: `pd3.py vocab add "at fastholde" "to retain" --group l3_ord --priority 2 --example "…" --note "…"`
(opt-in — ask the learner which words to keep). Bulk: `pd3.py vocab import file.tsv` (columns: word, meaning, group, example, priority, note).

## Assisted Learning page (self-study between coach sessions)
`<project>/assisted-learning.html` opens straight from disk (double-click; no server). It is built from the template
`app/assisted-learning.html` with the deck, profile and exam sentences embedded: `pd3.py page`, and automatically whenever
`pd3.py` saves `vocab.json`, `profile.json` or `exam-sentences.json`. The built file also works as-is on a static host.
**Review progress is kept in the browser** (localStorage, per device; it survives closing the page), not in `vocab.json`:
cards graded on the page don't show up in `vocab due` or `status`. Cards never reviewed on the page start from the deck's schedule.
It follows this file: batches of 5 new words from one group (taught first: word-order rule, example, real exam sentences,
DDO entry, confusable partner), max 15 new a day, rotating exercise types (meaning, production, relation, cloze, word-order
tiles with a retype after an error, L3 pair), the confusable pairs above drilled when one lapses, group chips above the session buttons (pick one or more groups; none = all, remembered per browser), and a progress map per group.
**Explain more** (button on the teach card, after every answer, and on any word in the group map) opens a panel with all
DDO senses and citations, every stored exam sentence, a translate button on each sentence and citation (English shown inline: Google translate endpoint, MyMemory as fallback, cached in the browser), the word-order rule, confusables, and the
other words in the group (same-meaning ones first); it ends by pointing to the coach in chat for a custom explanation.
Grades (same SM-2 as `pd3.py`): 5 instant · 4 correct · 3 typo / second try · 2 recognised when shown · 1 wrong · 0 "I don't know".

Data it uses: `card.dict` (from `pd3.py vocab enrich ddo_entries.json t23_facts.json`: up to 4 DDO senses + 6 citations)
and `pd3-data/exam-sentences.json` (from `pd3.py sentences`: up to 8 real sentences per card from the reading texts).
After adding cards, re-run both so new words get definitions and exam sentences.
The free "write one sentence with 3 connectors" task stays in chat (it needs grading by you).
