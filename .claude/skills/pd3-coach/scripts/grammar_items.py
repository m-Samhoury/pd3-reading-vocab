"""Grammatik items for Guidet læring → pd3-data/grammar.json

  python3 -I .claude/skills/pd3-coach/scripts/grammar_items.py     (then `pd3.py page`)

Every sentence below is copied from a reading text or writing task of the exams and is checked word for word
against the extracted PDFs. The present-tense versions (tense) and the versions without the fronted adverbial (v2)
were written by AI (Claude) for the drills and are tagged AI on the page; the answer is always the exam's sentence.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pd3  # noqa: E402


def exam_sentences():
    """every sentence of the reading texts and writing tasks, with its sitting and part (2013s L2, 2018s W …)"""
    idx, pool = pd3.index(), []
    for sitting, e in sorted(idx.items()):
        for kind in pd3.READING_KINDS + ("writing",):
            for i, rel in enumerate(e["files"].get(kind, [])):
                if rel.lower().endswith(".pdf"):
                    label = f"{sitting} {'W' if kind == 'writing' else kind.split('_')[0].replace('L12', 'L1+2')}"
                    pool += [{"s": s, "src": label} for s in pd3.split_sentences(pd3.reading_text(sitting, kind, rel, i))]
    return pool


pool = exam_sentences()
src_of = {}
for p in pool: src_of.setdefault(p["s"], p["src"])
T = [  # exam (past), my present version, verbs [present, past, infinitive], other swaps [present-word, past-word]
 ("Egentlig gik han med drømme om at blive cykelmekaniker.", "Egentlig går han med drømme om at blive cykelmekaniker.", [["går","gik","gå"]], []),
 ("Selv ville han gerne være cykelmekaniker, da han forlod folkeskolen.", "Selv vil han gerne være cykelmekaniker, når han forlader folkeskolen.", [["vil","ville","ville"],["forlader","forlod","forlade"]], [["når","da"]]),
 ("Jeg kunne ikke sætte ord på, hvad det var.", "Jeg kan ikke sætte ord på, hvad det er.", [["kan","kunne","kunne"],["er","var","være"]], []),
 ("Da jeg læste bogen, tænkte jeg, at det var lige sådan, jeg havde haft det.", "Når jeg læser bogen, tænker jeg, at det er lige sådan, jeg har haft det.", [["læser","læste","læse"],["tænker","tænkte","tænke"],["er","var","være"],["har haft","havde haft","have"]], [["Når","Da"]]),
 ("Det gik så godt, at han fik mod på at prøve nye udfordringer.", "Det går så godt, at han får mod på at prøve nye udfordringer.", [["går","gik","gå"],["får","fik","få"]], []),
 ("Han slog sig ikke alvorligt, da han faldt, men han satte sig lettere chokeret på en stol.", "Han slår sig ikke alvorligt, når han falder, men han sætter sig lettere chokeret på en stol.", [["slår","slog","slå"],["falder","faldt","falde"],["sætter","satte","sætte"]], [["når","da"]]),
 ("Nu begyndte det at gå op for ham, at der var noget alvorligt galt.", "Nu begynder det at gå op for ham, at der er noget alvorligt galt.", [["begynder","begyndte","begynde"],["er","var","være"]], []),
 ("Tankerne kørte rundt i hovedet på ham, og hjertet slog hurtigt.", "Tankerne kører rundt i hovedet på ham, og hjertet slår hurtigt.", [["kører","kørte","køre"],["slår","slog","slå"]], []),
 ("Dyrepasserne tog sig i stedet af ham, og han voksede op uden kontakt til andre næsehorn.", "Dyrepasserne tager sig i stedet af ham, og han vokser op uden kontakt til andre næsehorn.", [["tager","tog","tage"],["vokser","voksede","vokse"]], []),
 ("Da han blev kønsmoden, begyndte han at blive aggressiv.", "Når han bliver kønsmoden, begynder han at blive aggressiv.", [["bliver","blev","blive"],["begynder","begyndte","begynde"]], [["Når","Da"]]),
 ("Brutalis faldt forbavsende godt til i Afrika og fik tilkæmpet sig et godt territorium.", "Brutalis falder forbavsende godt til i Afrika og får tilkæmpet sig et godt territorium.", [["falder","faldt","falde"],["får","fik","få"]], []),
 ("Samfundet udviklede sig, og det gjorde højskolerne også.", "Samfundet udvikler sig, og det gør højskolerne også.", [["udvikler","udviklede","udvikle"],["gør","gjorde","gøre"]], []),
 ("Jeg var lidt i tvivl om, hvilket studie jeg skulle vælge.", "Jeg er lidt i tvivl om, hvilket studie jeg skal vælge.", [["er","var","være"],["skal","skulle","skulle"]], []),
 ("Det var ret hårdt, og på et tidspunkt fik jeg simpelthen brug for en pause.", "Det er ret hårdt, og på et tidspunkt får jeg simpelthen brug for en pause.", [["er","var","være"],["får","fik","få"]], []),
 ("Først tænkte de på at flytte til Aalborg i stedet for til Hjørring.", "Først tænker de på at flytte til Aalborg i stedet for til Hjørring.", [["tænker","tænkte","tænke"]], []),
 ("Vi dansede, sang og grinede i regnen og blev helt forelskede.", "Vi danser, synger og griner i regnen og bliver helt forelskede.", [["danser","dansede","danse"],["synger","sang","synge"],["griner","grinede","grine"],["bliver","blev","blive"]], []),
 ("Helene Bagger tog en hurtig beslutning og tilbød ham et job i Roskilde.", "Helene Bagger tager en hurtig beslutning og tilbyder ham et job i Roskilde.", [["tager","tog","tage"],["tilbyder","tilbød","tilbyde"]], []),
 ("Men han havde endnu ikke besluttet sig, fordi han var glad for sit arbejde i Rumænien.", "Men han har endnu ikke besluttet sig, fordi han er glad for sit arbejde i Rumænien.", [["har besluttet","havde besluttet","beslutte"],["er","var","være"]], []),
 ("Han krævede disciplin af eleverne, og han lagde vægt på udenadslære.", "Han kræver disciplin af eleverne, og han lægger vægt på udenadslære.", [["kræver","krævede","kræve"],["lægger","lagde","lægge"]], []),
 ("De havde aldeles ikke lyst til det, men de lærte det, ellers fik de bank.", "De har aldeles ikke lyst til det, men de lærer det, ellers får de bank.", [["har","havde","have"],["lærer","lærte","lære"],["får","fik","få"]], []),
 ("Vi valgte at køre en tur med hestevogn i den ældste del af byen.", "Vi vælger at køre en tur med hestevogn i den ældste del af byen.", [["vælger","valgte","vælge"]], []),
 ("Forældrene gik op i gamle møbler, og de genbrugte, reparerede og afsyrede.", "Forældrene går op i gamle møbler, og de genbruger, reparerer og afsyrer.", [["går","gik","gå"],["genbruger","genbrugte","genbruge"],["reparerer","reparerede","reparere"],["afsyrer","afsyrede","afsyre"]], []),
 ("Bønder fra omegnen kom med vadmel og uldgarn, som farveren behandlede.", "Bønder fra omegnen kommer med vadmel og uldgarn, som farveren behandler.", [["kommer","kom","komme"],["behandler","behandlede","behandle"]], []),
 ("Han havde i stedet fået stress, og de næste måneder kunne han næsten ingenting.", "Han har i stedet fået stress, og de næste måneder kan han næsten ingenting.", [["har fået","havde fået","få"],["kan","kunne","kunne"]], []),
 ("Vi besøgte også skolen, og jeg tænkte, at Fejø var et helt vidunderligt sted.", "Vi besøger også skolen, og jeg tænker, at Fejø er et helt vidunderligt sted.", [["besøger","besøgte","besøge"],["tænker","tænkte","tænke"],["er","var","være"]], []),
 ("De forstod ikke altid, hvor jeg ville hen med mine ideer.", "De forstår ikke altid, hvor jeg vil hen med mine ideer.", [["forstår","forstod","forstå"],["vil","ville","ville"]], []),
]
V = [  # exam (V2 after a fronted adverbial), my version without it, adverbial, finite verb, subject, adverbs that stay after the subject
 ("Måske kan du også selv blive tutor.", "Du kan også selv blive tutor.", "Måske", "kan", "du", ["også", "selv"]),
 ("Desuden vil du også få tilknyttet en kontaktlærer.", "Du vil også få tilknyttet en kontaktlærer.", "Desuden", "vil", "du", ["også"]),
 ("I dag har han allerede lagt planer for fremtiden.", "Han har allerede lagt planer for fremtiden.", "I dag", "har", "han", ["allerede"]),
 ("I dag skal den slet ikke åbnes og bliver kun rørt ved en enkelt gang.", "Den skal slet ikke åbnes og bliver kun rørt ved en enkelt gang.", "I dag", "skal", "den", ["slet ikke"]),
 ("Derfor gør vi altid vores bedste for at vise respekt for den tiltro, som vores frivillige viser vores organisation.", "Vi gør altid vores bedste for at vise respekt for den tiltro, som vores frivillige viser vores organisation.", "Derfor", "gør", "vi", ["altid"]),
 ("For eksempel bliver eleverne sjældent sendt uden for døren.", "Eleverne bliver sjældent sendt uden for døren.", "For eksempel", "bliver", "eleverne", ["sjældent"]),
 ("I dag er Gert ikke længere projektleder.", "Gert er ikke længere projektleder.", "I dag", "er", "Gert", ["ikke længere"]),
 ("Her vil vi også få en mulighed for at høre mere om dig og dine kompetencer.", "Vi vil også få en mulighed for at høre mere om dig og dine kompetencer.", "Her", "vil", "vi", ["også"]),
 ("Derudover skal de også have mod til at ansætte nogen, der er anderledes end dem selv.", "De skal også have mod til at ansætte nogen, der er anderledes end dem selv.", "Derudover", "skal", "de", ["også"]),
 ("Dog kan man også vælge at tjekke ind ved det officielle indtjekningssted, der hedder Laden.", "Man kan også vælge at tjekke ind ved det officielle indtjekningssted, der hedder Laden.", "Dog", "kan", "man", ["også"]),
 ("Dog støtter han ikke med penge, men med tid.", "Han støtter ikke med penge, men med tid.", "Dog", "støtter", "han", ["ikke"]),
 ("Desuden kommer nogle unge aldrig i gang med en ny uddannelse igen, og det kan begrænse deres muligheder på jobmarkedet.", "Nogle unge kommer aldrig i gang med en ny uddannelse igen, og det kan begrænse deres muligheder på jobmarkedet.", "Desuden", "kommer", "nogle unge", ["aldrig"]),
 ("Derudover smiler de altid og hilser pænt.", "De smiler altid og hilser pænt.", "Derudover", "smiler", "de", ["altid"]),
 ("Samtidig har den ikke påvirket lønningerne negativt.", "Den har ikke påvirket lønningerne negativt.", "Samtidig", "har", "den", ["ikke"]),
 ("Derudover skal det også fremgå, at man har modificeret fotoet fra originalen.", "Det skal også fremgå, at man har modificeret fotoet fra originalen.", "Derudover", "skal", "det", ["også"]),
 ("Her adskiller han sig nok fra flertallet.", "Han adskiller sig nok fra flertallet.", "Her", "adskiller", "han", ["sig", "nok"]),
 ("Til gengæld er det måske ikke så vigtigt, om sommerferien går til Berlin eller Bangkok.", "Det er måske ikke så vigtigt, om sommerferien går til Berlin eller Bangkok.", "Til gengæld", "er", "det", ["måske ikke"]),
 ("Typisk lærer man ikke noget om at søge job, når man går på en uddannelse.", "Man lærer ikke noget om at søge job, når man går på en uddannelse.", "Typisk", "lærer", "man", ["ikke"]),
 ("Måske er du slet ikke i tvivl om, hvad jeg mener.", "Du er slet ikke i tvivl om, hvad jeg mener.", "Måske", "er", "du", ["slet ikke"]),
 ("Måske handler de nedslående tal også om selvværdet hos de nyuddannede med et handicap.", "De nedslående tal handler også om selvværdet hos de nyuddannede med et handicap.", "Måske", "handler", "de nedslående tal", ["også"]),
 ("Her kan de dog stadig ses fra land, og det kan få berørte borgere til at protestere.", "De kan dog stadig ses fra land, og det kan få berørte borgere til at protestere.", "Her", "kan", "de", ["dog", "stadig"]),
 ("Desuden er det ikke alle, der har brug for den samme sikkerhedsstandard.", "Det er ikke alle, der har brug for den samme sikkerhedsstandard.", "Desuden", "er", "det", ["ikke"]),
 ("Endelig er det også vigtigt altid at holde sine enheder opdaterede, gerne automatisk.", "Det er også vigtigt altid at holde sine enheder opdaterede, gerne automatisk.", "Endelig", "er", "det", ["også"]),
 ("Derfor er det også forholdsvist sjældent, man ser journalister skifte til et helt andet arbejdsområde.", "Det er også forholdsvist sjældent, man ser journalister skifte til et helt andet arbejdsområde.", "Derfor", "er", "det", ["også"]),
 ("I dag er det ikke kun manden, der har som opgave at forsørge familien, sådan som det var tidligere.", "Det er ikke kun manden, der har som opgave at forsørge familien, sådan som det var tidligere.", "I dag", "er", "det", ["ikke kun"]),
 ("Derfor er det nok de færreste iværksættere, der kan nøjes med at arbejde 37 timer om ugen.", "Det er nok de færreste iværksættere, der kan nøjes med at arbejde 37 timer om ugen.", "Derfor", "er", "det", ["nok"]),
 ("Siden sin studentereksamen har Jonas været et år i Spanien, og resten af tiden har han haft forskellige job.", "Jonas har været et år i Spanien, og resten af tiden har han haft forskellige job.", "Siden sin studentereksamen", "har", "Jonas", []),
 ("I denne periode har fædre ret til 2 ugers orlov.", "Fædre har ret til 2 ugers orlov.", "I denne periode", "har", "fædre", []),
 ("Så går vi til gudstjeneste, og vi afslutter altid turen med varm kakao til hele banden.", "Vi går til gudstjeneste, og vi afslutter altid turen med varm kakao til hele banden.", "Så", "går", "vi", []),
]
P = [  # exam sentence, removed word, which occurrence, clause: sub (word that starts the clause) or main, finite verb after which/before which it stands
 ("Princippet i det danske uddannelsessystem er nemlig, at man ikke skal gennemgå det samme to gange.", "ikke", 1, "at", "skal"),
 ("Hvis du siger nej tak til en praktikplads, fordi du ikke vil flytte, kan du ikke komme i skolepraktik.", "ikke", 1, "fordi", "vil"),
 ("Hvis du siger nej tak til en praktikplads, fordi du ikke vil flytte, kan du ikke komme i skolepraktik.", "ikke", 2, "main", "kan"),
 ("Vi er helt klar over, at det ikke er nok, at du får en uddannelse og udvikles.", "ikke", 1, "at", "er"),
 ("Hvis man kommer fra et hjem, hvor man ikke har tradition for uddannelse, så er man meget usikker over for den verden.", "ikke", 1, "hvor", "har"),
 ("Du skal til optagelsesprøve, hvis du ikke har aflagt de prøver, der kræves for at blive optaget.", "ikke", 1, "hvis", "har"),
 ("Det er en garanti for, at man kan færdiggøre sin uddannelse, selv om man ikke kan skaffe en praktikplads.", "ikke", 1, "selv om", "kan"),
 ("Alle laver deres lektier, også selvom de ikke vil have en boglig uddannelse.", "ikke", 1, "selvom", "vil"),
 ("Der er hele tiden meget, der skal laves, og det er vigtigt, at man ikke kommer bagud.", "ikke", 1, "at", "kommer"),
 ("Det er afgørende, at du også har lyst til at fortælle om håndværket til museets mange gæster.", "også", 1, "at", "har"),
 ("De var bevidste om, at de ikke ville bo i en møbeludstilling og holdt af, at tingene havde en historie.", "ikke", 1, "at", "ville"),
 ("Det har vi, selvom vi stadig opfatter vores ferie som en periode, hvor vi slapper af uden at tænke på arbejde.", "stadig", 1, "selvom", "opfatter"),
 ("Vi ønsker et interessant arbejde, hvor vi også kan udvikle os personligt.", "også", 1, "hvor", "kan"),
 ("Husk, at I ikke må spise eller drikke i dyrenes områder.", "ikke", 1, "at", "må"),
 ("Et vigtigt argument er, at man ikke skal se på ansøgeres køn, men udelukkende på deres kvalifikationer.", "ikke", 1, "at", "skal"),
 ("Der er lavet en del undersøgelser af, hvorfor nogle ikke færdiggør deres uddannelse.", "ikke", 1, "hvorfor", "færdiggør"),
 ("I undersøgelsen pegede de unge på flere afgørende årsager til, at de ikke ønskede at rejse ud.", "ikke", 1, "at", "ønskede"),
 ("Vi spørger os selv, om vi stadig kan bruge kunsten til noget.", "stadig", 1, "om", "kan"),
 ("I efteråret gik jeg til guitarundervisning for begyndere i Kolding, hvor jeg også arbejder.", "også", 1, "hvor", "arbejder"),
 ("Den video sikrer, at vi altid kan få genopfrisket det, vi lærte på kurset.", "altid", 1, "at", "kan"),
 ("En anden grund til, at folk ikke gør noget, er, at det ikke er klart, hvem der egentlig har ansvaret for klimaforandringerne.", "ikke", 1, "at", "gør"),
 ("Festivalen flyttede derfor til en naturskøn strandeng, hvor den også ligger i dag.", "også", 1, "hvor", "ligger"),
 ("Det er blevet sagt, at man som ny leder hurtigt må lære at svømme, hvis man ikke vil synke til bunds.", "ikke", 1, "hvis", "vil"),
 ("Det kan alt sammen være svært at overskue, hvis man ikke er særlig it-interesseret.", "ikke", 1, "hvis", "er"),
 ("Sven har kun misset et enkelt år, hvor han ikke kunne vandre.", "ikke", 1, "hvor", "kunne"),
 ("Fælles for dem alle er, at de gerne vil gøre arbejdsugen mere fleksibel for de ansatte.", "gerne", 1, "at", "vil"),
 ("I andre betyder det, at man også arbejder færre timer om ugen.", "også", 1, "at", "arbejder"),
 # main clauses: the adverb comes after the finite verb (after the subject when the clause is inverted)
 ("Du kan ikke bare selv vælge uddannelsen.", "ikke", 1, "main", "kan"),
 ("Du er altid velkommen til at kontakte skolen, hvis du har spørgsmål.", "altid", 1, "main", "er"),
 ("Vi hjælper gerne med at etablere kontakt til virksomheder.", "gerne", 1, "main", "hjælper"),
 ("Jeg kunne ikke sætte ord på, hvad det var.", "ikke", 1, "main", "kunne"),
 ("De forstod ikke altid, hvor jeg ville hen med mine ideer.", "ikke", 1, "main", "forstod"),
 ("Jeg møder stadig nogle af mine gamle fodboldkammerater fra dengang, jeg selv spillede.", "stadig", 1, "main", "møder"),
 ("Vi besøgte også skolen, og jeg tænkte, at Fejø var et helt vidunderligt sted.", "også", 1, "main", "besøgte"),
 ("De laver ikke andet, og de er gode til det, de gør.", "ikke", 1, "main", "laver"),
 ("Man behøver ikke at gå på kompromis med noget.", "ikke", 1, "main", "behøver"),
 ("Dog støtter han ikke med penge, men med tid.", "ikke", 1, "main", "støtter"),
 ("I dag er Gert ikke længere projektleder.", "ikke", 1, "main", "er"),
 ("Jeg ved ikke, om jeg skal blande mig i det, for han er jo voksen.", "ikke", 1, "main", "ved"),
 ("Din ven er ikke sikker på, om det er en god idé.", "ikke", 1, "main", "er"),
 ("Jeg har jo aldrig prøvet at bo uden for Danmark.", "aldrig", 1, "main", "har"),
 ("Men jeg må også lige høre, hvordan det går med dit kursus.", "også", 1, "main", "må"),
 ("Tror du ikke, hun er for ung?", "ikke", 1, "main", "Tror"),
 ("Jeg kan ikke rigtig finde ud af, hvad der sker med Marc.", "ikke", 1, "main", "kan"),
 ("Hun overvejer derfor at leje et værelse ud for at få råd til at blive boende.", "derfor", 1, "main", "overvejer"),
]
bad = [s for s in [x[0] for x in T] + [x[0] for x in V] + [x[0] for x in P] if s not in src_of]
assert not bad, bad
def words(s): return re.findall(r"[\wæøåÆØÅ]+", s)
for past, pres, verbs, swaps in T:   # the present version must differ from the exam only in the listed words
    a, b = words(pres), words(past)
    d = [(x, y) for x, y in zip(a, b) if x != y]
    want = {(p, q) for v in verbs for p, q in zip(v[0].split(), v[1].split()) if p != q} | {tuple(s) for s in swaps}
    assert len(a) == len(b) and set(d) <= want, (past, d, want)
for ex, plain, adv, verb, subj, mid in V:
    assert sorted(words(ex.lower())) == sorted(words((adv + " " + plain).lower())), ex
    assert ex.startswith(adv + " " + verb + " " + subj) or ex.startswith(adv + " " + verb + " " + subj[0].upper()), ex
for s, w, n, c, v in P:
    assert len(re.findall(r"(?<![\wæøå])" + w + r"(?![\wæøå])", s)) >= n, s
out = {"tense": [{"src": src_of[a], "past": a, "present": b, "verbs": v, "swap": sw} for a, b, v, sw in T],
       "v2": [{"src": src_of[a], "s": a, "plain": b, "adv": ad, "verb": vb, "subj": sj, "mid": m} for a, b, ad, vb, sj, m in V],
       "place": [{"src": src_of[s], "s": s, "w": w, "n": n, "clause": c, "verb": v} for s, w, n, c, v in P]}
json.dump(out, open(os.path.join(pd3.DATA, "grammar.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})
