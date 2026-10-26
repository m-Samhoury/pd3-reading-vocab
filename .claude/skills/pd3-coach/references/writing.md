# Writing coaching (Skriftlig fremstilling)

Use real prompts: `pd3.py pick W1` / `pick W2`, then `pd3.py get <sitting> writing`. Every sitting has Delprøve 1 (mail) plus
Delprøve 2A (chart) and 2B (topic + opinions). Delprøve 2 must be **min. 200 words**; the third bullet ≈ 50%.
Dictionaries are allowed in this part of the real exam — so the learner may use one during practice too, but note when they did.

## Workflow
1. Show the prompt (situation + bullets, exactly as in the paper). For 2A describe the chart data in text (values/order) since you can read it from the PDF text.
2. Set the time if they want exam conditions: whole writing exam is 2½ h; a fair split is ~40 min mail, ~90 min Delprøve 2, ~15 min revision.
3. Remind them of **their** plan (battle-plan.md): Q3 first (125–150 words), then Q1 (30–50), then Q2 (70–100); Q2 uses the 4-step template; finish with the revision checklist.
4. Wait for the whole text. No corrections while they're writing.
5. Give feedback (format below). Save the session file. Log the score. Record mistake patterns.
6. Offer a rewrite of the weakest paragraph (Fluent's rule: if score < 7/10 → rewrite locks in the correction). After the rewrite, re-grade just that paragraph.

## Grading
Grade on the 7-trins-skala the way censors do — holistically, B2 as the bar for 7 and above:

| Grade | What it looks like |
|---|---|
| 12 | All bullets answered fully, 3rd bullet clearly the core (~50%), nuanced argumentation with counter-argument + own conclusion, **varied complex syntax** (subordinate clauses, inversion, passive, nominalisation), precise vocabulary, few and minor errors |
| 10 | As 12 with some more errors or slightly less nuance/complexity |
| 7 | All bullets answered, coherent argumentation, some complex sentences, errors present but rarely disturb understanding |
| 4 | Answers bullets but thinly; 3rd bullet short or mostly listing; simple syntax; frequent errors (word order, inflection) that sometimes disturb |
| 02 | Barely sufficient: parts missing or very short, mostly simple sentences, many errors, but the task is still recognisably solved |
| 00 / −3 | Delprøve 2 missing, far off-topic, or largely incomprehensible |

Also give a 0–10 per dimension (Fluent style), so progress is trackable: **Opgaveløsning** (all bullets, proportions, word count),
**Sammenhæng** (structure, connectors, paragraphing), **Kompleksitet**, **Korrekthed** (grammar/spelling), **Ordforråd/register**.
Log Delprøve 2 as `pd3.py log W2 2024s <grade> 12` (grade over 12) and mail as `log W1 …` — the status view then shows a % trend.

Count words yourself (`wc -w` on a temp file) and report the count per bullet versus the plan's budget.

## Feedback format (adapted from Fluent's writing feedback)

```markdown
## Feedback — Delprøve 2B (2024s: Lønforskelle)

**Words:** 268 (bullet 1: 46 · bullet 2: 84 · bullet 3: 138 = 51%) ✅
**Estimated grade:** 7 — Opgaveløsning 8 · Sammenhæng 7 · Kompleksitet 6 · Korrekthed 6 · Ordforråd 7

### ✅ What works
- …

### ❌ To fix
🔴 Critical
- `inversion`: "I dag mange mennesker arbejder…" → **"I dag arbejder mange mennesker…"** — V2: the verb must be second after a fronted element.
🟡 Moderate
- `praepositioner`: "indflydelse af" → **"indflydelse på"**
🟢 Minor
- `stavning`: "beslutnig" → **"beslutning"**

### 🔼 Make it a 10 (complexity upgrades)
- Turn "Det er dyrt. Mange kan ikke betale." → **"Da det er dyrt, er der mange, der ikke har råd til det."**
- …

### 📝 Corrected version
(full text, learner's ideas kept — don't rewrite their argument, fix the language and add at most 2 upgrades marked with **bold**)
```

Severity: 🔴 = word order (V2/inversion, *ikke*-placement in subordinate clauses), wrong/missing bullet, register clash, meaning-changing errors;
🟡 = prepositions, en/et and adjective agreement, verb form, wrong connector; 🟢 = spelling, punctuation, small typos.

## Mistake categories (use these names with `pd3.py mistake add`)
`inversion` (V2 after fronted element) · `ledsaetning_ordstilling` (*at/fordi/hvis … ikke* before verb) · `ikke_placering` · `praepositioner`
· `koen_en_et` · `adjektiv_boejning` · `verbum_tid` · `modalverbum` (+ infinitive without *at*) · `sammensatte_ord` (two nouns → compound)
· `tror_synes_mener` · `ved_kender` · `da_naar` · `komma` (before *men*, relative *der/som*) · `connector_misuse` · `stavning`
· `opgave_proportion` (3rd bullet < 45%) · `manglende_punkt` (bullet not answered) · `register`.
Use the same slug each time so counts accumulate. Severity per the list above.

## Danish error checks to run on every text (the learner's revision list + common B2 slips)
- V2: after *I dag / Derfor / Desuden / Hvis …, / Selvom …,* the finite verb comes next.
- Subordinate clause: *ikke/aldrig/altid* **before** the finite verb (*fordi han ikke har tid*).
- *tror* (believe, uncertain) vs *synes* (personal opinion/experience) vs *mener* (reasoned position — best for argumentation).
- *ved* (know a fact) vs *kender* (know a person/place/thing).
- *da* (past single event / since) vs *når* (whenever / future).
- *der* as subject in relative clauses (*mange, der arbejder*), *som* otherwise allowed.
- Compound nouns written together: *arbejdsmarked*, *sundhedsvæsen*, *lønforskel*.
- Adjective agreement: *et stort problem*, *store problemer*, *det store problem*.
- Comma before *men*; comma before subordinate clauses is OK (startkomma) — don't over-correct.

## Delprøve 1 — mail checklist
Friendly register (*Hej …*, *Kærlig hilsen / De bedste hilsner*), thank for the mail, answer **each underlined part** in its own paragraph with a reason,
do the extra instruction (e.g. *Skal vi ikke ringe sammen og snakke videre?*), closing line. Typical length ~150–200 words. Use the plan's frames
(*Det kommer an på, om …*, *Det betyder dog ikke nødvendigvis, at …*). Delprøve 1 counts less — don't let it eat the Delprøve 2 time.

## Delprøve 2A — chart task
1. *Hovedtræk*: 2–4 sentences: largest, smallest, notable difference; use *mens, hvorimod, til gengæld* and numbers (*Diagrammet viser, at …; Den største andel findes inden for …, hvor ca. 13 % …*). No interpretation yet.
2. *Årsager*: 2 reasons, each explained (*En af årsagerne kan være, at … Det skyldes formentlig, at …*).
3. *Vurdering* (~50%): use the same structure as 2B Q3 (synspunkt → argument → eksempel → modargument → nuanceret vurdering → klar konklusion).

## Golden nuggets
Pull 2–3 per text from `connectors.md` → phrase bank. Don't stack them — one per paragraph reads naturally.
