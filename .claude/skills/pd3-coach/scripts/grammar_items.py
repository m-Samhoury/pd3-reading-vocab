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
# --- word order after a fronted subordinate clause: the clause, then the tiles in the exam's order, then the rest
F = [
 ("Hvis du siger nej tak til en praktikplads, fordi du ikke vil flytte, kan du ikke komme i skolepraktik.", ["kan", "du", "ikke"]),
 ("Når du er over 18 år, har du ret til at få undervisning på VUC.", ["har", "du"]),
 ("Mens du er på skolen, kan du vælge at bo på skolehjemmet.", ["kan", "du", "vælge"]),
 ("Hvis du ikke har et godt kendskab til at arbejde i landbruget, bør du vælge skolevejen.", ["bør", "du", "vælge"]),
 ("Når knallerten gik i stykker, måtte den repareres af en knallertmekaniker.", ["måtte", "den", "repareres"]),
 ("Selvom Danmark er et af de lande i verden med størst ligestilling, er der relativt få kvinder i toppen af dansk erhvervsliv.", ["er", "der"]),
 ("Hvis deres mere erfarne kolleger vælger at stoppe, får de måske en chance for at få mere spændende ansvarsområder.", ["får", "de", "måske"]),
 ("Hvis man tidligere har købt billet, har man sikkert allerede en konto.", ["har", "man", "sikkert allerede"]),
 ("Da Eva begyndte at studere, havde hun endnu ikke tænkt over, om hun skulle tage en del af sit studie i udlandet.", ["havde", "hun", "endnu ikke", "tænkt"]),
 ("Hvis en it-virksomhed mister en erfaren medarbejder, kan det være svært at finde en ny specialist med de rigtige kvalifikationer.", ["kan", "det", "være"]),
 ("Selvom hun måtte revidere sine forventninger undervejs, tænker hun ikke længere så meget på, at året med jobsøgning var frustrerende.", ["tænker", "hun", "ikke længere"]),
 ("Inden René fik sit job, var han til andre jobsamtaler uden succes.", ["var", "han"]),
 ("Da jeg var barn, gik jeg tit tur sammen med min bedstefar, der gik ved hjælp af sin elskede stok.", ["gik", "jeg", "tit"]),
 ("Når man har tilmeldt sig som deltager til årets hærvejsmarch, modtager man en kvittering for sin betaling.", ["modtager", "man"]),
 ("Selvom der især spilles rytmisk musik, har vi også en gang imellem klassiske koncerter.", ["har", "vi", "også"]),
 ("Hvis efterspørgslen falder, kan de nemlig forholdsvis nemt komme af med medarbejderne igen.", ["kan", "de", "nemlig"]),
 ("Da han blev kønsmoden, begyndte han at blive aggressiv.", ["begyndte", "han"]),
]
# --- choose the right form: (sentence, the exam's word, which occurrence, options, rule, arguments for the explanation)
A = [  # adjective endings
 ("Det var jo et stort spring for hele familien at flytte.", "stort", 1, ["stor", "stort", "store"], "et", ["et stort spring"]),
 ("For eksempel skal børnene begynde i en ny skole, og ægtefællen skal finde et nyt job.", "nyt", 1, ["ny", "nyt", "nye"], "et", ["et nyt job"]),
 ("Så kan der nemlig blive behov for ledere, kantine og reception både i den gamle og den nye afdeling.", "nye", 1, ["ny", "nyt", "nye"], "def", ["den nye afdeling"]),
 ("Men det er svært at finde en god og billig bolig.", "billig", 1, ["billig", "billigt", "billige"], "en", ["en god og billig bolig"]),
 ("På de store festivaler er budgettet til at betale de optrædende musikere på mange millioner kroner.", "store", 1, ["stor", "stort", "store"], "def", ["de store festivaler"]),
 ("Langt de fleste musikfestivaler er store, årlige begivenheder.", "store", 1, ["stor", "stort", "store"], "pl", ["store, årlige begivenheder"]),
 ("Hun donerer et fast beløb hver måned til Red Barnet.", "fast", 1, ["fast", "faste"], "ett", ["et fast beløb"]),
 ("Han synes, den personlige indsats er vigtig.", "vigtig", 1, ["vigtig", "vigtigt", "vigtige"], "pred_en", ["indsatsen er vigtig"]),
 ("Han synes, den personlige indsats er vigtig.", "personlige", 1, ["personlig", "personligt", "personlige"], "def", ["den personlige indsats"]),
 ("Hun var glad for at komme ind på studiet og fik hurtigt et godt studiejob i en boghandel.", "godt", 1, ["god", "godt", "gode"], "et", ["et godt studiejob"]),
 ("I nyere tid har de fleste organisationer også taget de sociale medier i brug.", "sociale", 1, ["social", "socialt", "sociale"], "def", ["de sociale medier"]),
 ("Det er vigtigt at søge om opholdstilladelse i god tid.", "god", 1, ["god", "godt", "gode"], "en", ["i god tid (en tid)"]),
 ("På et langt ophold vælger man et par hovedfag og nogle sidefag.", "langt", 1, ["lang", "langt", "lange"], "et", ["et langt ophold"]),
 ("Det betyder nemlig mere liv i kommunen og bedre forretningsmuligheder for de lokale virksomheder.", "lokale", 1, ["lokal", "lokalt", "lokale"], "def", ["de lokale virksomheder"]),
 ("Vi skulle forlade vores kendte dagligdag og ville komme langt væk fra vores venner.", "kendte", 1, ["kendt", "kendte"], "poss", ["vores kendte dagligdag"]),
 ("Han er kendt for sin løse, hvide dragt, sit hvide ansigt, sin røde mund og den aflange hat.", "hvide", 2, ["hvid", "hvidt", "hvide"], "poss", ["sit hvide ansigt"]),
 ("Det er også velkendt, at et toplederjob kræver et stort engagement og mange arbejdstimer.", "stort", 1, ["stor", "stort", "store"], "et", ["et stort engagement"]),
 ("Det var godt at bruge sin krop så meget hver dag!", "godt", 1, ["god", "godt", "gode"], "det", ["Det var godt at …"]),
 ("Det er dejligt at se ham udvikle sig i disse omgivelser.", "dejligt", 1, ["dejlig", "dejligt", "dejlige"], "det", ["Det er dejligt at …"]),
 ("De fleste er klar over, at et toplederjob er godt lønnet og forbundet med høj status.", "høj", 1, ["høj", "højt", "høje"], "en", ["høj status (en status)"]),
 ("Det er klart, at det er noget, der er brug for i virksomhederne.", "klart", 1, ["klar", "klart", "klare"], "det", ["Det er klart, at …"]),
 ("Man kan tjekke ind ved et særligt indtjekningssted ved området.", "særligt", 1, ["særlig", "særligt", "særlige"], "et", ["et særligt indtjekningssted"]),
 ("Vi er glade for at komme på arbejde, og vi har det sjovt sammen med børnene og alle vores dejlige kolleger.", "glade", 1, ["glad", "glade"], "pred_pl", ["vi er glade"]),
 ("Vi er glade for at komme på arbejde, og vi har det sjovt sammen med børnene og alle vores dejlige kolleger.", "dejlige", 1, ["dejlig", "dejligt", "dejlige"], "poss", ["vores dejlige kolleger"]),
 ("Der er derfor stor politisk og folkelig interesse for at nedbringe udledningen af CO2 i atmosfæren.", "stor", 1, ["stor", "stort", "store"], "en", ["stor interesse (en interesse)"]),
]
S = [  # sin/sit/sine or hans/hendes/deres
 ("Hun elsker sit arbejde og vil, hvis helbredet holder, gerne fortsætte, til hun er 70.", "sit", 1, ["sin", "sit", "sine", "hendes"], "own", ["hun", "et arbejde"]),
 ("Kolesteroltallet falder også, og han får stabiliseret sit blodsukker.", "sit", 1, ["sin", "sit", "sine", "hans"], "own", ["han", "et blodsukker"]),
 ("Gennem GoMore kan man leje en bil eller udleje sin egen bil.", "sin", 1, ["sin", "sit", "sine", "deres"], "own", ["man", "en bil"]),
 ("Man skal kunne markere sig og få sine synspunkter igennem.", "sine", 1, ["sin", "sit", "sine", "deres"], "own", ["man", "synspunkter (flertal)"]),
 ("Han går faktisk til dansk sammen med én af sine kolleger, og de taler nogle gange dansk sammen i frokostpausen.", "sine", 1, ["sin", "sine", "hans"], "own", ["han", "kolleger (flertal)"]),
 ("Marianne Andresen står i køkkenet sammen med sin yngste søn og snitter grøntsager.", "sin", 1, ["sin", "sit", "hendes"], "own", ["Marianne Andresen", "en søn"]),
 ("Lise bor i et hus i Odense sammen med sin mand.", "sin", 1, ["sin", "sit", "hendes"], "own", ["Lise", "en mand"]),
 ("Peter takkede derfor ja til et job i Miljøstyrelsen og flyttede med sin afdeling til Augustenborg.", "sin", 1, ["sin", "sit", "hans"], "own", ["Peter", "en afdeling"]),
 ("Når man har tilmeldt sig som deltager til årets hærvejsmarch, modtager man en kvittering for sin betaling.", "sin", 1, ["sin", "sit", "sine"], "own", ["man", "en betaling"]),
 ("Selvom hans arbejdssprog er engelsk, vil Andrei gerne lære dansk.", "hans", 1, ["sin", "sit", "hans"], "subj", ["hans arbejdssprog"]),
 ("Hans Christian Andersen blev født i Odense, og hans livlige fantasi inspirerer fortsat byen.", "hans", 1, ["sin", "hans"], "subj", ["hans livlige fantasi"]),
 ("Ida går nu i 3.g i gymnasiet, og hendes sygemelding skete på andet år, hvor mange gymnasieelever føler sig særligt stressede.", "hendes", 1, ["sin", "hendes"], "subj", ["hendes sygemelding"]),
 ("For fire år siden besluttede Marianne og hendes mand, Torben Bruun, at lægge deres livsstil helt om.", "hendes", 1, ["sin", "hendes"], "subj", ["Marianne og hendes mand"]),
 ("For fire år siden besluttede Marianne og hendes mand, Torben Bruun, at lægge deres livsstil helt om.", "deres", 1, ["sin", "sine", "deres"], "plural", ["Marianne og hendes mand"]),
 ("Mange nyuddannede går arbejdsløse længe, inden de får deres første rigtige fuldtidsarbejde.", "deres", 1, ["sit", "sine", "deres"], "plural", ["de"]),
 ("Især drengene hakkede og borede deres knallerter i håb om at kunne imponere hinanden – og pigerne.", "deres", 1, ["sine", "deres"], "plural", ["drengene"]),
 ("Under sin sygemelding fik hun en ny leder, der var mere tydelig omkring hendes arbejdsopgaver og ansvarsområder.", "sin", 1, ["sin", "hendes"], "own", ["hun", "en sygemelding"]),
 ("Under sin sygemelding fik hun en ny leder, der var mere tydelig omkring hendes arbejdsopgaver og ansvarsområder.", "hendes", 1, ["sine", "hendes"], "other", ["hun", "der (= lederen)"]),
 ("Efter samtaler med en studievejleder er der sket flere ændringer i hendes liv, så hun nu har mod på at fortsætte.", "hendes", 1, ["sit", "hendes"], "other", ["Anne", "flere ændringer"]),
 ("Det gør hun, selvom det har vist sig, at det betyder meget for hendes karrieremuligheder efter barselsorloven.", "hendes", 1, ["sine", "hendes"], "other", ["hun", "det"]),
 ("Tine er på barsel med deres seks måneder gamle datter Sofie, men om en uge er det Peters tur.", "deres", 1, ["sin", "hendes", "deres"], "both", ["Tine og Peter"]),
]
R = [  # fixed prepositions: sentence, preposition, occurrence, the expression
 ("Nye hundeejere opdager også, at det kan være et problem at holde ferie, fordi hunden har brug for pasning.", "for", 1, "have brug for noget"),
 ("Jeg har altid været lidt bange for hunde, og mange folk kan ikke holde dem i ro.", "for", 1, "være bange for noget"),
 ("Vi er vant til at komme i København Zoo, og forventningerne til Aalborg Zoo var ikke så høje.", "til", 1, "være vant til noget"),
 ("Jeg var lidt i tvivl om, hvilket studie jeg skulle vælge.", "om", 1, "være i tvivl om noget"),
 ("Personalet er rigtig gode til at hjælpe og tage hensyn til alle os nybagte mødre og fædre.", "til", 2, "tage hensyn til nogen"),
 ("Personalet er rigtig gode til at hjælpe og tage hensyn til alle os nybagte mødre og fædre.", "til", 1, "være god til noget"),
 ("Desuden er festivalen kendt for sin grønne profil.", "for", 1, "være kendt for noget"),
 ("Det betyder også, at de nu uden forstyrrende flytteplaner kan glæde sig til den kommende familieforøgelse.", "til", 1, "glæde sig til noget"),
 ("Mange ansatte er også bekymrede for, hvordan en flytning vil påvirke deres arbejdsplads.", "for", 1, "være bekymret for noget"),
 ("Økonomien i udflytningerne afhænger af, om de udflyttede statslige institutioner flytter helt væk fra hovedstaden.", "af", 1, "afhænge af noget"),
 ("Uddannelsen består af to moduler, der samlet varer et år.", "af", 1, "bestå af noget"),
 ("Med alle ændringerne har Anne Puggaard igen fået mod på at studere, og hun trives i dag på matematikstudiet.", "på", 1, "få mod på noget"),
 ("Jeg er nemlig så træt af at sidde i kø på motorvejen hver dag – og måske kunne jeg undvære bilen.", "af", 1, "være træt af noget"),
 ("Flere og flere familier vælger at tage mere hensyn til miljøet, end de har gjort før.", "til", 1, "tage hensyn til noget"),
 ("Der er derfor stor politisk og folkelig interesse for at nedbringe udledningen af CO2 i atmosfæren.", "for", 1, "interesse for noget"),
 ("Forældrene gik op i gamle møbler, og de genbrugte, reparerede og afsyrede.", "i", 1, "gå op i noget"),
 ("Han peger på, at der er sket en ændring i den måde, vi opfatter begrebet stress på.", "på", 1, "pege på noget"),
 ("Arbejdsløse på kontanthjælp kan søge om at komme på højskole som led i en handlingsplan eller aktiveringsplan.", "om", 1, "søge om noget"),
 ("Jeg har årskort til Aalborg Zoo og er rigtig glad for at komme der.", "for", 1, "være glad for noget"),
 ("Vi foretrækker ansøgere, der har lyst til at arbejde i alle sæsoner.", "til", 1, "have lyst til noget"),
 ("Man skal dog være opmærksom på, at afstandene er store: Der er 23 km veje i safariparken!", "på", 1, "være opmærksom på noget"),
 ("De fleste er klar over, at et toplederjob er godt lønnet og forbundet med høj status.", "over", 1, "være klar over noget"),
 ("Det danske arbejdsmarked er også kendetegnet ved en relativt høj grad af økonomisk sikkerhed for medarbejderne.", "ved", 1, "være kendetegnet ved noget"),
 ("Oplevelsescentret byder på en unik og supermoderne digital sanseoplevelse, der handler om vikingernes liv og levned.", "om", 1, "handle om noget"),
 ("Helene Baggers firma i Roskilde var i gang med at udvikle robotteknologi til sundhedsområdet.", "med", 1, "være i gang med noget"),
 ("Vi er også vant til, at der er et velfærdssamfund, der tager sig af folk.", "af", 1, "tage sig af nogen"),
]
PREPS = ["på", "i", "til", "for", "om", "af", "med", "over", "ved"]
W = [  # da/når and hvis/om: sentence, the exam's word, occurrence, rule
 ("Da han blev kønsmoden, begyndte han at blive aggressiv.", "Da", 1, "da_once"),
 ("Han slog sig ikke alvorligt, da han faldt, men han satte sig lettere chokeret på en stol.", "da", 1, "da_once"),
 ("Da jeg var barn, gik jeg tit tur sammen med min bedstefar, der gik ved hjælp af sin elskede stok.", "Da", 1, "da_once"),
 ("Når du er i praktik og får løn, skal du selv dække dine daglige transportudgifter til og fra arbejde.", "Når", 1, "naar_now"),
 ("Når vi indkalder til samtale, vil vi enten sende en mail eller ringe til dig.", "Når", 1, "naar_now"),
 ("Da Eva begyndte at studere, havde hun endnu ikke tænkt over, om hun skulle tage en del af sit studie i udlandet.", "Da", 1, "da_once"),
 ("Så det var derfor en overraskelse for os, da Ida fik stress.", "da", 1, "da_once"),
 ("Mange ældre er nemlig ikke så glade for at komme ud om aftenen, når det er mørkt.", "når", 1, "naar_now"),
 ("Da de blev større, gik jeg med igen, og børnene har også været med flere gange.", "Da", 1, "da_once"),
 ("Vi spørger os selv, om vi stadig kan bruge kunsten til noget.", "om", 1, "om"),
 ("Spørgsmålet er, om jeg skal tage bilen eller toget.", "om", 1, "om"),
 ("Dine venner er usikre på, om det er en god ide.", "om", 1, "om"),
 ("Det er en stor chance for mig, men det betyder også mere overarbejde, så jeg ved ikke, om jeg skal sige ja.", "om", 1, "om"),
 ("I Danmark kan man få dagpenge som nyuddannet, hvis man er arbejdsløs og er medlem af en A-kasse.", "hvis", 1, "hvis"),
 ("Det er nemlig ikke noget problem at sige sit job op, hvis man nemt kan finde et andet job.", "hvis", 1, "hvis"),
 ("Men COWI har brug for flere dygtige specialister, hvis det skal lykkes.", "hvis", 1, "hvis"),
 ("Vurderingerne er afgørende for, om ansøgerne går videre i Universes ansættelsesforløb.", "om", 1, "om"),
 ("Dog kan man få et kursusbevis, hvis man ønsker det.", "hvis", 1, "hvis"),
 ("Fx viser det sig, at der er markant flere kvinder end mænd, der giver penge, når der er indsamling.", "når", 1, "naar_now"),
]

def words(s): return re.findall(r"[\wæøåÆØÅ]+", s)
def nth(s, w, n):
    """character position of the n-th whole-word occurrence of w"""
    ms = [m.start() for m in re.finditer(r"(?<![\wæøåÆØÅ])" + re.escape(w) + r"(?![\wæøåÆØÅ])", s)]
    assert len(ms) >= n, (s, w, n)
    return ms[n - 1]

every = [x[0] for x in T] + [x[0] for x in V] + [x[0] for x in P] + [x[0] for x in F] + [x[0] for x in A] + [x[0] for x in S] + [x[0] for x in R] + [x[0] for x in W]
bad = [x for x in every if x not in src_of]
assert not bad, bad

out = {"verbs": [], "v2": [], "clause": [], "adj": [], "pron": [], "prep": [], "small": []}
# verbs: the exam sentence with its past forms as gaps (the first word of "havde haft"), the infinitive as the clue
for past, pres, verbs, swaps in T:
    gaps, pos = [], 0
    for prs, pst, inf in verbs:
        w = pst.split()[0]
        m = re.compile(r"(?<![\wæøåÆØÅ])" + re.escape(w) + r"(?![\wæøåÆØÅ])").search(past, pos)
        assert m, (past, w)
        gaps.append({"at": m.start(), "w": w, "inf": "have" if " " in pst else inf, "kind": pst, "pres": prs})
        pos = m.end()
    out["verbs"].append({"src": src_of[past], "s": past, "gaps": gaps})
# V2: the fronted adverbial stays first; the learner orders the verb, the subject and the adverbs after it
for ex, plain, adv, verb, subj, mid in V:
    tiles = [verb, subj] + mid
    head = adv + " " + " ".join(tiles)
    if not ex.startswith(head):
        assert ex.lower().startswith(head.lower()), (ex, head)
    out["v2"].append({"src": src_of[ex], "s": ex, "pre": adv, "tiles": tiles, "post": ex[len(head):].strip(), "first": adv, "verb": verb, "subj": subj, "mid": mid})
for ex, tiles in F:
    i = ex.index(", " + " ".join(tiles)) + 1
    pre, post = ex[:i], ex[i + 1 + len(" ".join(tiles)):].strip()
    out["v2"].append({"src": src_of[ex], "s": ex, "pre": pre, "tiles": tiles, "post": post, "first": pre.rstrip(","), "clause": True, "verb": tiles[0], "subj": tiles[1], "mid": tiles[2:] if tiles[2:] and tiles[2] not in ("vælge", "repareres", "tænkt", "være") else []})
# subordinate vs main clause: the subject, the adverb and the finite verb as tiles, the rest of the sentence as it is
SUBJ1 = {"jeg", "du", "han", "hun", "den", "det", "vi", "i", "de", "man", "der", "nogle", "folk", "børn", "jonas", "gert", "sven"}
for s, w, n, clause, verb in P:
    ws = s.split(" ")
    low = [re.sub(r"[^\wæøå]", "", x.lower()) for x in ws]
    k = 0
    for wi, x in enumerate(low):
        if x == w.lower():
            k += 1
            if k == n: break
    if clause != "main":
        last = clause.split()[-1]
        ci = max(i for i in range(wi) if low[i] == last)
        vi = next(i for i in range(wi + 1, len(ws)) if low[i] == verb.lower())
        a, b = ci + 1, vi
    else:
        vi = max(i for i in range(wi) if low[i] == verb.lower())
        a = vi if wi - vi > 1 else vi - 1 if vi > 0 else vi      # inverted: verb subject adverb; straight: subject verb adverb
        b = wi
    tiles = ws[a:b + 1]
    tail = ""
    if re.search(r"[,.!?]$", tiles[-1]):
        tail, tiles[-1] = tiles[-1][-1], tiles[-1][:-1]
    out["clause"].append({"src": src_of[s], "s": s, "pre": " ".join(ws[:a]), "tiles": tiles, "post": (tail + " " + " ".join(ws[b + 1:])).strip() if tail != "." else tail + (" " + " ".join(ws[b + 1:]) if ws[b + 1:] else ""),
                          "w": w, "n": n, "clause": clause, "verb": verb})
def choice(s, w, n, opts, rule, args):
    at = nth(s, w, n)
    assert w in opts, (s, w)
    return {"src": src_of[s], "s": s, "at": at, "w": w, "opts": opts, "rule": rule, "args": args}
out["adj"] = [choice(*x) for x in A]
out["pron"] = [choice(*x) for x in S]
for s, w, n, ph in R:
    near = {"for": ["til", "på", "om"], "til": ["for", "på", "i"], "om": ["på", "for", "over"], "af": ["for", "på", "med"], "på": ["til", "i", "for"],
            "i": ["på", "til", "med"], "over": ["om", "på", "for"], "ved": ["af", "med", "på"], "med": ["på", "af", "i"]}[w]
    out["prep"].append(choice(s, w, n, [w] + near, "prep", [ph]))
for s, w, n, rule in W:
    opts = ["da", "når"] if rule.startswith(("da", "naar")) else ["hvis", "om"]
    x = choice(s, w, n, [o.capitalize() if w[0].isupper() else o for o in opts], rule, [])
    out["small"].append(x)
json.dump(out, open(os.path.join(pd3.DATA, "grammar.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in out.items()})
