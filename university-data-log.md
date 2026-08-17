# University data log

## 2026-08-10 (4° giro) — ADD Priorità 2 + VERIFY

Catalogo da **81 a 84**. Belgio 1→2, Spagna 3→4, Francia 3→4.

### Nota metodologica: la Priorità 2 va rivista
Il piano prevedeva 4 atenei belgi (Ghent, UCLouvain, ULB, Antwerp) per correggere il paese più scoperto. La ricerca lo ha smentito: **in Belgio i bachelor non si tengono in inglese**. Per decreto fiammingo i corsi triennali di Gent sono tutti in olandese (l'unico in inglese, Social Sciences, si iscrive alla VUB); UCLouvain e ULB sono francofoni, con l'inglese quasi solo a livello magistrale. Stesso problema già incontrato con Oslo. Poiché la skill indica come ambito i "programmi in inglese per studenti internazionali", ho **ridotto il Belgio a 1 aggiunta** (la più forte) e spostato le altre due su Spagna e Francia, dove l'offerta in inglese esiste davvero.

### Aggiunte
- **ghent** (Ghent University, 🇧🇪 Gent) — bachelor: Business Economics (in **olandese**). Tuition SEE €1,181/anno (€305,40 fissi + €14,60 a credito su 60 crediti); living €800–€850/mese. Ranking **Top 200 QS (#162, 2026)**, prima università del Belgio. La descrizione dichiara esplicitamente il vincolo linguistico. Curriculum solo tematico: il dettaglio dei corsi è pubblicato unicamente nella guida in olandese. Fonti: ugent.be/student/en/administration/tuition, ugent.be/en/programmes, studiekiezer.ugent.be.
- **pompeu-fabra** (Universitat Pompeu Fabra, 🇪🇸 Barcellona) — bachelor: **Global Studies, 240 ECTS, in inglese** nei primi due anni. Tuition €1,202/anno (UE, €17,69 a credito, tariffa pubblica catalana); living €900–€1,200/mese. Ranking **Top 300 QS (#265, 2026)**. Dieci corsi del 1° anno verificati sulla pagina della Facoltà di Humanities. Rara combinazione di bachelor in inglese a prezzo pubblico. Fonti: upf.edu/en/web/graus/grau-en-estudis-globals, upf.edu/en/web/humanitats.
- **ecole-polytechnique** (École Polytechnique, 🇫🇷 Palaiseau) — bachelor: **Bachelor of Science, interamente in inglese**, con doppia specializzazione (Matematica + Fisica / Informatica / Economia). Tuition €15,900/anno (UE/SEE) — molto sopra la media pubblica francese, ma con borse diffuse; living €800–€1,000/mese (stima ufficiale: €800/mese in campus, ~€12.000/anno). Ranking **Top 50 QS (#41, 2026)** come Institut Polytechnique de Paris. Fonti: programmes.polytechnique.edu/en/bachelor (tuition fees, living costs, structure).

### Verifiche
- **barcelona**: tuition **confermata**. La tariffa pubblica catalana è €17,69 a credito (≈ €1.061/anno su 60 crediti), coerente con il minimo `€1,050` già presente; la variazione per coefficiente di grado giustifica il tetto. Nessuna modifica. Fonte: studyincatalonia.gencat.cat.
- **vienna**: tuition UE **confermata** — €25,20 di ÖH-Beitrag a semestre (semestre estivo 2026), nessuna tassa entro la durata standard + 2 semestri. Il valore `~€25/semestre` nel file è corretto. Fonte: studieren.univie.ac.at/en/tuition-fee.
- **ku-leuven**: **confermata indirettamente**. La tariffa SEE di Gent (€305,40 + €14,60/credito = €1.181,40) coincide con il valore `€1,181/anno` già presente per KU Leuven: è la tariffa fiamminga comune. Nessuna modifica.
- **polimi**: **non verificabile in questo giro**. Le fonti ufficiali raggiunte riportano solo soglie di rateizzazione e tassa regionale, non il tetto del contributo onnicomprensivo. Campo lasciato invariato — vedi sotto.
- **sapienza**: **discrepanza rilevata, campo non modificato**. Il file riporta `€300–€1,500/anno`, ma uniroma1.it indica una No Tax Area fino a €24.000 di ISEE con esonero totale dal contributo, restando dovuti solo tassa regionale €140 + bollo €16 = **€156**. Il minimo reale sarebbe quindi ~€156, non €300. Manca però conferma sul tetto massimo, quindi non ho toccato il campo — stesso criterio prudenziale usato per Bologna prima di trovare la tabella ufficiale.

### Da controllare a mano
- **sapienza**: recuperare la tabella ufficiale del contributo onnicomprensivo 2026/2027 e correggere la forbice (minimo atteso ~€156, come per Bologna).
- **polimi**: idem, serve la tabella degli importi massimi per fascia ISEE.
- **luxembourg**: manca ancora il `ranking`.
- **Belgio/Francia/Spagna**: la Priorità 2 originale (14 atenei) va ricalibrata escludendo gli atenei belgi senza offerta triennale in inglese (UCLouvain, ULB, Antwerp) e privilegiando Spagna e Francia.

## 2026-08-10 (3° giro) — ADD Priorità 1 completata: Regno Unito

Chiusa la Priorità 1. **UK da 8 a 12; catalogo da 77 a 81.** Tutte e quattro seguono la convenzione UK adottata nel giro precedente: tariffa **International in prima posizione**, Home come secondo segmento.

### Aggiunte
- **manchester** (University of Manchester, 🇬🇧) — bachelor: Computer Science (BSc). International £19,500–£36,500 in base al corso; living £900–£1,100/mese, tra i più bassi del gruppo UK. Ranking **Top 50 QS (#40, 2027)**. Fonti: manchester.ac.uk/study/international/finance-and-scholarships/fees, manchester.ac.uk (comunicato QS 2027).
- **bristol** (University of Bristol, 🇬🇧) — bachelor: Economics (BSc). International **£25,500–£49,700** — cifra presa dalla tabella ufficiale per gli immatricolati 2026/27, dopo che le ricerche generiche restituivano solo stime in dollari australiani da aggregatori. Living £1,100–£1,500/mese (terza città più cara d'Inghilterra per studenti). Ranking **Top 100 QS (#57, 2027)**. Fonte: bristol.ac.uk/students/support/finances/tuition-fees/ug/overseas/26-27/2026-starters.
- **durham** (Durham University, 🇬🇧) — bachelor: Economics (BA). International £28,500–£31,000; living £1,046/mese. Ranking **Top 100 QS (#85, 2027)**, +9 posizioni. Sistema dei college come Oxbridge. Fonti: durham.ac.uk/study/undergraduate/fees-and-funding/tuition-fees, durham.ac.uk (comunicato QS 2027).
- **glasgow** (University of Glasgow, 🇬🇧) — bachelor: Economics (MA Hons, **4 anni**, struttura scozzese). International £22,700–£62,700 in base al corso; living £900–£1,100/mese. Ranking **Top 100 QS (#80, 2027)**. Economics 1A e 1B verificati sul catalogo corsi. Come per Edinburgh, il secondo segmento resta descrittivo: **nessuna cifra verificata** per la fee scozzese/RUK, quindi non inventata. Fonti: gla.ac.uk/undergraduate/fees/intlfees, gla.ac.uk/coursecatalogue.

### Note sui curricula
Per questi quattro atenei le liste dei moduli del primo anno **non sono pubblicate integralmente** sulle pagine aperte (Manchester rimanda al portale interno; Bristol pubblica la struttura per tema; Durham non nomina i moduli obbligatori). Ho inserito solo ciò che è verificabile — per Glasgow i nomi reali (Economics 1A/1B), altrove voci tematiche — **senza inventare nomi di moduli**. Da arricchire in un giro VERIFY futuro se servisse maggiore dettaglio.

### Stato Priorità 1
Completata: 9 atenei su 9 della lista (Cambridge, Imperial, Edinburgh, King's, Warwick, Manchester, Bristol, Durham, Glasgow). Il Regno Unito passa dal **4%** al **15%** del catalogo. Prossimo passo previsto: Priorità 2 (Belgio, Francia, Spagna).

## 2026-08-10 (2° giro) — ADD Priorità 1: Regno Unito

Giro mirato sul buco più grave del catalogo: il Regno Unito era fermo a 3 atenei (Oxford, UCL, LSE) pur essendo una delle destinazioni più cercate. **UK da 3 a 8; catalogo da 72 a 77.**

### Aggiunte
- **cambridge** (University of Cambridge, 🇬🇧) — bachelor: Economics (Economics Tripos). Tuition Home £9,790; international £25,734–£70,554 (+ college fee a parte). Living £1,568/mese (stima ufficiale Cambridge SU). Ranking **Top 10 QS (#6, 2027)**. I 5 paper di Part I verificati sulla pagina della Faculty of Economics. Fonti: undergraduate.study.cam.ac.uk (tuition fees 2026-27), econ.cam.ac.uk/apply/undergraduate/course-structure.
- **imperial** (Imperial College London, 🇬🇧) — bachelor: Computing (BEng). Tuition Home £9,790 (confermata ufficialmente per il 2026-27); international £35,100–£42,000. Living £1,300–£1,800/mese. Ranking **Top 5 QS (#2, 2027)** — 1ª nel Regno Unito e in Europa per il terzo anno di fila. Primo anno: 60 ECTS, di cui il blocco Computing Practical 1 (20 ECTS) con le sue 4 componenti verificate; **gli 8 moduli teorici non sono nominati sulla pagina ufficiale**, quindi inseriti come voce aggregata invece di inventarne i nomi. Fonti: imperial.ac.uk/students/fees-and-funding, imperial.ac.uk/computing/current-students/computing-first-year.
- **edinburgh** (University of Edinburgh, 🇬🇧) — bachelor: Computer Science (BSc Hons, **4 anni**, struttura scozzese). Tuition international £26,500–£37,500. Living £1,579/mese. Ranking **Top 50 QS (#35, 2027)**. Primo anno verificato (Informatics 1 + Mathematics 1 + outside courses). Fonti: study.ed.ac.uk, dcs.ed.ac.uk/teaching/FirstYearCourses.
- **kings-college-london** (King's College London, 🇬🇧) — bachelor: Law (LLB). Tuition Home £9,790; international £24,000–£35,000. Living £1,300–£1,800/mese. Ranking **Top 50 QS (#37, 2027)**, 6ª nel Regno Unito. I 5 moduli obbligatori del 1° anno verificati con i crediti sulla pagina ufficiale del corso. Fonti: kcl.ac.uk/study/undergraduate/courses/law-llb/teaching-modules.
- **warwick** (University of Warwick, 🇬🇧 Coventry) — bachelor: Economics (BSc). Tuition Home £9,790; international £26,840–£36,130 in base al corso. Living £1,100–£1,600/mese (campus fuori città, nettamente più economico di Londra). Ranking **Top 100 QS (#68, 2027)**, +6 posizioni. Fonti: warwick.ac.uk/study/undergraduate/courses/bsc-economics, QS 2027.

### Verifiche
- **oxford** e **ucl**: corretta una **imprecisione sostanziale** nel campo tuition. Entrambi riportavano `£9,790/anno (UK/EU con status Home)`, ma **dalla Brexit gli studenti UE non hanno più lo status Home**: pagano la tariffa international. L'etichetta è stata corretta e, con l'intervento successivo (vedi sotto), la tariffa international è passata in prima posizione. È un dato che riguarda direttamente il pubblico di Unimate, che rischiava di sottostimare di 3–6 volte il costo reale.
- **oxford**: ranking aggiornato da `#4, 2026` a **`#4, 2027`** (posizione invariata, edizione aggiornata). Fonte: QS 2027.
- **ucl**: ranking aggiornato da `#8, 2026` a **`#8, 2027`** (idem). Fonte: QS 2027.
- **VERIFY: riordinate stringhe tuition UK (8 atenei)** — international ora in prima posizione per coerenza col filtro prezzo. Motivazione: post-Brexit gli studenti UE pagano tariffa international, non Home. Atenei: `oxford`, `ucl`, `lse`, `cambridge`, `imperial`, `edinburgh`, `kings-college-london`, `warwick`. **Nessuna fee è stata eliminata**: la tariffa Home resta come secondo segmento, etichettata "solo con status UK". `utils/universityCosts.ts` legge il primo segmento (separatore ` / `), quindi ora deriva la cifra international. Effetto verificato sul filtro prezzo: prima 7 atenei su 8 cadevano nella fascia **€3k–€10k** (per via dei £9.790 Home), ora tutti e 8 sono correttamente in **€10k+**. Modificato solo il campo `tuition`, nessun altro campo toccato. **Flag chiuso.**

### Da controllare a mano
- **luxembourg**: manca ancora il `ranking`.

## 2026-08-10 — ADD + VERIFY (giro routine)

Catalogo da **69 a 72** atenei; due paesi nuovi (Lussemburgo, Ungheria) aggiunti anche all'array `countries`.

### Aggiunte
- **tue** (Eindhoven University of Technology, 🇳🇱 Eindhoven) — bachelor: Computer Science and Engineering. **Tutto il catalogo bachelor è in inglese**, nessun olandese richiesto. Tuition €2,694/anno (statutory NL); living €830–€1,000/mese (stima ufficiale TU/e: €10.000–€12.000/anno); ranking Top 200 QS (#152, 2027). Nel cuore della Brainport region (ASML, Philips, NXP). Fonti: tue.nl/en/education, educationguide.tue.nl, topuniversities.com.
- **luxembourg** (University of Luxembourg, 🇱🇺 Esch-sur-Alzette) — **NUOVO PAESE**. Bachelor: Computer Science, interamente in inglese, 180 ECTS, semestre di mobilità obbligatorio, B2 inglese richiesto. Tuition €400/sem per i primi 2 semestri, poi €200/sem; living €700–€1,500/mese. Corsi del semestre 1 verificati (6 × 5 ECTS). **Ranking omesso**: non ho trovato una posizione QS verificabile in questo giro. Fonti: uni.lu/fstm-en/study-programs/bachelor-in-computer-science, mastersportal (costi di vita).
- **semmelweis** (Semmelweis University, 🇭🇺 Budapest) — **NUOVO PAESE**. Bachelor: General Medicine (MD), 6 anni, in inglese. Rotta molto battuta dagli studenti italiani che non superano il test di medicina. Tuition €22.000/anno (o €12.000 a semestre in due rate) + €75 di application fee — **confermata sulla pagina ufficiale di ammissione**, non su aggregatori (che riportavano cifre incoerenti, es. USD 10.450/sem). Living €500–€800/mese, tra i più bassi UE. Ranking QS per materia: Medicine #251–300 (2025). Fonti: semmelweis.hu/admission, study-in-hungary.com.

### Verifiche
- **ie-university**: tuition **aggiornata** da `€29,000–€34,000/anno` a **`€26,500–€29,000/anno (aumenta del 2,9% ogni anno)`**. Cifre ufficiali ie.edu: €14.500/semestre per il BBA (€29.000/anno), €13.250/semestre per gli altri bachelor (€26.500/anno), con incremento annuo fisso del 2,9% legato al CPI. Il valore precedente era sovrastimato. Fonte: ie.edu/university/admission/payment-methods.
- **lse**: tuition international **aggiornata** da `£39,900/anno` a **`£28,000–£35,700/anno (in base al corso)`** — LSE applica fasce per programma (es. BSc Accounting and Finance £35.700, BSc Actuarial Science £30.700). Home fee £9,790 confermata invariata. Ranking **aggiornato** da `Top 60 QS (#56, 2026)` a **`Top 100 QS (#62, 2027)`**. Fonti: info.lse.ac.uk (Table of Fees 2026-27), topuniversities.com.
- **bologna**: ranking **aggiornato** da `Top 150 QS (#138, 2026)` a **`Top 150 QS (#123, 2027)`** (3ª in Italia). Fonte: QS World University Rankings 2027.
- **bologna** — tuition **aggiornata** da `€900–€3,100/anno (basato sul reddito ISEE)` a **`€157–€2,040/anno (fino a €2,805 per pochi corsi a importo maggiorato; basato su ISEE, No Tax Area sotto €27.000)`**. Entrambi i valori precedenti erano imprecisi: sia il `€900–€3.100` presente nel file, sia il `€1.000–€4.080` segnalato dall'aggregatore. Il tetto di €4.080 **esiste solo per corsi a ciclo unico** (es. Odontoiatria) o per alcuni master, **mai per una laurea triennale standard**. Il documento ufficiale conferma **€2.040 come tetto standard per i corsi di primo ciclo**, con eccezioni fino a €2.805 per pochi programmi (es. Genomics), e la No Tax Area che azzera il contributo sotto €27.000 di ISEE (resta la sola imposta di bollo/tassa regionale, ~€157). Fonte: tabella ufficiale *"Importo massimo di contributo onnicomprensivo A.A. 2025/2026"* — https://www.unibo.it/en/attachments/tasse/Tabellaimportimassimi2526.pdf. **Flag chiuso.**
- **copenhagen**: tuition confermata **invariata** (gratuita per studenti UE/SEE in tutte le università pubbliche danesi). Ranking **aggiornato** da `Top 100 QS` a **`Top 100 QS (#90, 2027)`**. Fonti: ku.dk, topuniversities.com.
- **sciences-po**: tuition confermata **invariata** — €0–€14.900/anno per studenti SEE anche per l'a.a. 2026-2027, calcolata sul reddito familiare (€0 sotto ~€42.000, massimo da €285.000 in su). La nazionalità non incide. Fonte: sciencespo.fr/students/en/fees-funding/tuition-fees.

### Da controllare a mano
- **luxembourg**: manca il `ranking`. Se serve, va cercata la posizione QS/THE su fonte primaria.

## 2026-08-08 — ADD (Germania + Svizzera, da incrocio EduRank top 100)

Giro ADD mirato: incrociata la top 100 università europee di EduRank (edurank.org/geo/eu/, agg. marzo 2026) con `universities.ts`. Delle 100, ne mancavano 64. Aggiunte in questo giro le **18 tedesche** e le **5 svizzere** mancanti (23 atenei, da 46 a 69 totali). Nessun VERIFY questo giro.

### Aggiunte — Germania (18)
Tutte inserite nel blocco `// GERMANY`. Tasse semestrali verificate una per una su fonte ufficiale (le università pubbliche tedesche non hanno tuition: si paga solo il Semesterbeitrag, che include quasi ovunque il Deutschland-Semesterticket).

- **heidelberg** (Heidelberg University) — €189,80/sem + **€1.500/sem per non-UE/SEE** (regola Baden-Württemberg). QS #80. Bachelor: Molecular Biotechnology (tedesco). Fonti: uni-heidelberg.de/beitraege-gebuehren, uni-heidelberg.de tuition-fees-for-international-students.
- **hamburg** (University of Hamburg) — €384/sem (estivo), ~€400 invernale. QS #218. Bachelor: BWL (tedesco). Fonti: uni-hamburg.de/campuscenter semesterbeitrag, bwl.uni-hamburg.de.
- **tuebingen** (University of Tübingen) — €194,80–197,80/sem + €1.500/sem non-UE/SEE. QS #215. Bachelor: Medizininformatik (tedesco). Fonti: uni-tuebingen.de/semesterbeitraege, uni-tuebingen.de verzeichnis-der-studiengaenge.
- **fu-berlin** (Freie Universität Berlin) — €376,80/sem (WS 26/27), €358,80 estivo. QS #88. Bachelor: Psychologie B.Sc. (tedesco). Fonti: fu-berlin.de/studium/gebuehren, ewi-psy.fu-berlin.de.
- **bonn** (University of Bonn) — €248,07/sem (WS 26/27). QS #209. Bachelor: VWL/Economics (tedesco) — **lista moduli 1° anno verificata**. Fonti: uni-bonn.de/costs, econ.uni-bonn.de/study-structure.
- **goettingen** (University of Göttingen) — ~€157/sem ⚠️ vedi "da controllare". QS #261. Bachelor: VWL B.Sc. (riformato dal WS 26/27). Fonti: uni-goettingen.de/semesterbeiträge, uni-goettingen.de/594370.
- **freiburg** (University of Freiburg) — €190/sem + €1.500/sem non-UE/SEE. QS #201. Bachelor: **Liberal Arts and Sciences — 4 anni, 240 ECTS, interamente in INGLESE** (University College Freiburg): rarissimo nel pubblico tedesco, ottimo candidato da mettere in evidenza sul sito. Fonti: uni-freiburg.de/semesterbeitrag-studiengebuehren, uni-freiburg.de/ucf/las/curriculum.
- **cologne** (University of Cologne) — €304,25/sem. QS #269. Bachelor: BWL (tedesco). Fonti: studsek.uni-koeln.de/semesterbeitrag, wiso.uni-koeln.de programme-structure.
- **rwth-aachen** (RWTH Aachen) — ~€320/sem. QS #105. Bachelor: Informatik B.Sc. — **lista moduli completa con CP e semestre, la meglio documentata del giro**. Fonti: asta.rwth-aachen.de, sc.informatik.rwth-aachen.de/aufbau-und-ablauf.
- **fau-erlangen** (FAU Erlangen-Nürnberg) — €82/sem (contributo Studierendenwerk dal WS 26/27), ticket a parte. QS #230. Bachelor: Molekulare Medizin (moduli GOP con ECTS verificati). Fonti: werkswelt.de/studentenwerkbeitrag, med.fau.de/molmed-b.
- **tu-dresden** (TU Dresden) — €361/sem (WS 26/27). Ranking omesso (posizione QS 2026 non verificata). Bachelor: Informatik B.Sc. — **tabella moduli con LP e semestre verificata**. NB: Maschinenbau a Dresda è **Diplom da 10 semestri / 300 ECTS**, non un bachelor → scartato apposta. Fonti: stura.tu-dresden.de/semesterbeitrag, tu-dresden.de bachelor-informatik.
- **kit-karlsruhe** (KIT) — ~€164/sem (10,50 + 70 admin + 77,70 Studierendenwerk + 5,99 AStA) + €1.500/sem non-UE/SEE. QS #98. Bachelor: Informatik B.Sc. (aree modulari con CP). Fonti: asta-kit.de/beitragsordnung, sle.kit.edu/bachelor-informatics.
- **muenster** (University of Münster) — €369,50/sem (WS 26/27). Ranking omesso. Bachelor: BWL — **lista moduli completa con ECTS**. Fonti: uni-muenster.de/studium/kosten, wiwi.uni-muenster.de bachelor/bwl/studium.
- **leipzig** (Leipzig University) — €332,30/sem (WS 26/27). Ranking omesso. Bachelor: Psychologie B.Sc. (moduli 1° semestre con LP verificati). Fonti: uni-leipzig.de/rueckmeldung-und-semesterbeitrag, lw.uni-leipzig.de.
- **mainz** (JGU Mainz) — €343,80/sem (dal WS 25/26). Ranking omesso. Bachelor: Publizistik B.A. Fonti: campus-mainz.net semesterbeitrag, studium.uni-mainz.de.
- **tu-berlin** (TU Berlin) — €379,06/sem (WS 26/27), scomposizione verificata. Ranking omesso. Bachelor: Informatik B.Sc. Fonti: tu.berlin/studierendensekretariat/semester-fees, tu.berlin computer-science-b-sc.
- **wuerzburg** (University of Würzburg) — €110,10/sem (WS 26/27), tra i più economici. Ranking omesso. Bachelor: **Games Engineering** — uno dei pochissimi bachelor dedicati ai videogiochi nel pubblico tedesco, buon gancio per il target 4UNI. Fonti: uni-wuerzburg.de Merkblatt Rückmeldung WS26/27, uni-wuerzburg.de/studium/angebot/faecher/games-engineering.
- **bochum** (Ruhr University Bochum) — €340/sem. Ranking omesso. Bachelor: **IT-Sicherheit/Informationstechnik** (Horst-Görtz-Institut, leader europeo in cybersecurity; accesso zulassungsfrei). Fonti: international.ruhr-uni-bochum.de/costs, studienangebot.ruhr-uni-bochum.de.

### Aggiunte — Svizzera (5)
Inserite nel blocco `// SWITZERLAND` (dopo ETH ed EPFL). In Svizzera le tasse sono reali e in diversi casi differenziate per residenza al momento del diploma — verificate una per una.

- **uzh** (University of Zurich) — CHF 779/sem residenti (720 tuition + 59 quote obbligatorie), **CHF 1.279/sem internazionali** (supplemento CHF 500 al bachelor). QS #100. Bachelor: BWL, Rechtswissenschaft. Fonti: uzh.ch/studies/application/fees, swissuniversities.ch.
- **geneva** (University of Geneva) — **CHF 500/sem, stessa cifra per tutti** (65 fisse + 435 tuition): tra le più basse in Svizzera. QS #155. Bachelor: BARI (relations internationales, corsi 1° anno verificati) + BASCRI (90 ECTS computational + 90 IR). Fonti: unige.ch/immatriculations/informations/taxes, unige.ch/gsi plan-d'études.
- **bern** (University of Bern) — CHF 850/sem residenti, **~CHF 2.550/sem internazionali dall'autunno 2026** (supplemento CHF 1.700; regime transitorio a CHF 200 per chi era già iscritto prima). Cambio importante, segnalato anche nella description. QS #184. Bachelor: Medicine, VWL. Fonti: unibe.ch fees, swissuniversities.ch.
- **basel** (University of Basel) — **CHF 850/sem uguale per svizzeri e stranieri**; il Canton Basilea-Campagna ha respinto (dic. 2025) l'aumento per studenti internazionali. Miglior rapporto qualità/prezzo svizzero del gruppo. QS #158. Bachelor: Business and Economics. Fonti: unibas.ch Tuition-Fees, wwz.unibas.ch, bzbasel.ch (dic. 2025).
- **unil** (University of Lausanne) — CHF 580/sem per tutti. QS #212. Bachelor: **BSc Management e BSc Economics di HEC Lausanne, entrambi bilingui francese/inglese** — ogni corso del 1° e 2° anno è tenuto in entrambe le lingue e si può scegliere lezione per lezione, esami inclusi. Forte argomento di vendita per studenti italiani. Fonti: unil.ch/immat FAQ, unil.ch/hec bachelor, unil.ch/news (bilinguismo HEC).

### Da controllare a mano
- **goettingen — tuition**: le fonti danno €127/sem dal WS 24/25 con aumenti programmati (€157 dal SS 2026, poi fino a €197 nel 2030), ma non è chiaro se questa cifra sia il **totale** o solo la quota Studentenwerk senza Semesterticket (sarebbe anomalo: gli altri atenei tedeschi con ticket stanno sui €250–380). Ho scritto "~€157/semestre" in via prudenziale. La pagina ufficiale "Höhe der Semesterbeiträge" non era raggiungibile in fetch. **Da riverificare.**
- **fau-erlangen — tasse non-UE dal 2027**: la stampa locale (nn.de) riporta che la Baviera introdurrà tasse per studenti extra-UE alla FAU dal 2027, "fino a €6.000/semestre". **Non confermato da fonte ufficiale** → non inserito come dato, solo accennato in modo cauto nella description. Da verificare su fau.de quando escono le cifre definitive. Se confermato, riguarda anche **lmu-munich** e **tu-munich** già presenti nel file, che oggi riportano solo le tasse admin.
- **livingCost tedeschi**: sono stime per fascia di città (Monaco/Amburgo €1.100–1.500; Berlino/Colonia/Francoforte €950–1.250; città medio-piccole e Est più basse), estrapolate da fonti aggregate sul costo della vita studentesco in Germania, non da pagine ufficiali dei singoli atenei. Ragionevoli ma non verificate ateneo per ateneo.
- **Ranking mancanti**: posizione QS 2026 non verificata (quindi campo `ranking` omesso, come da regola) per **tu-dresden, muenster, leipzig, mainz, tu-berlin, wuerzburg, bochum**. Da completare in un prossimo giro.
- **Numero di bachelor**: la maggior parte dei nuovi atenei ha **1 solo bachelor** (UZH, Ginevra, Berna e UNIL ne hanno 2). Scelta deliberata: ho inserito solo i programmi di cui sono riuscito a documentare il curriculum su fonte ufficiale, invece di riempire con corsi non verificati. Da espandere nei prossimi giri.
### Seed e bugfix
- **Seed Supabase ESEGUITO** (con ok esplicito di Nicolò): `npx tsx --env-file=.env.local seed.ts`, zero errori. DB ora a **69 università, 132 bachelor, 1922 corsi**.
- ⚠️ **Bug trovato e corretto in `utils/universities.ts`**: `getUniversities()` leggeva le tabelle con `select("*")` senza paginazione. PostgREST tronca a 1000 righe, e con l'aggiunta di questo giro i corsi sono passati da ~1.100 a 1.922 → le università in fondo all'elenco (tutte le nuove) risultavano **senza curriculum** sul sito, in silenzio. Aggiunto un helper `selectAll()` che pagina con `.range()` a blocchi da 1000. Verificato: RWTH Aachen ora mostra i 20 moduli, Maastricht i suoi 22. Era un bug **latente già prima** di questo giro (chiunque fosse oltre la riga 1000 perdeva i corsi), solo che ora sarebbe stato molto più visibile. Type-check pulito, nessun errore in console.

### Restano da aggiungere (dalla top 100 EduRank)
41 atenei ancora mancanti dopo questo giro: **UK 20** (Cambridge, Edimburgo, Imperial, Manchester, KCL, Glasgow, Bristol, Leeds, Birmingham, Southampton, Nottingham, Sheffield, Warwick, Newcastle, Liverpool, Queen Mary, York, Cardiff, Exeter, Durham), **Italia 5** (Statale Milano, Torino, Pisa, Federico II, Firenze), **Nordici 5** (Oslo, Karolinska, Göteborg, Bergen, NTNU), **NL 3** (Radboud, VU Amsterdam, Wageningen), **BE 3** (Gent, Liegi, UCLouvain), **ES 2** (Autonoma Barcellona, Valencia), **altre 3** (Atene, Varsavia, Mosca — quest'ultima probabilmente da escludere). Pierre & Marie Curie (#61) e Lyon 1 (#100) sono di fatto già coperte da `sorbonne` e `lyon`.

## 2026-08-07 — ADD + VERIFY (giro routine)

### Aggiunte
- **padua** (University of Padua, 🇮🇹 Padova) — 2 bachelor in inglese: Psychological Science, Information Engineering. Tuition €0–€2,900/anno (ISEE-based); living cost €700–€1,000/mese; ranking Top 250 QS (#233, 2026). Corsi 1° anno verificati (apply.unipd.it: Psychological Science, Information Engineering). Fonti: apply.unipd.it/courses, topuniversities.com.
- **aalto** (Aalto University, 🇫🇮 Espoo) — 2 bachelor in inglese: International Business, Science and Technology. Gratis per EU/EEA, €12,000/anno non-EU; living cost €800–€1,200/mese; ranking Top 150 QS (#126, 2027, #1 in Finlandia). Corsi 1° anno IB verificati (curriculum ufficiale 2024–2026); Science & Technology su base math/programming/physics. NB: da autunno 2026 l'IB si sposta dal campus di Mikkeli a Otaniemi (Espoo). Fonti: aalto.fi, topuniversities.com.
- **tartu** (University of Tartu, 🇪🇪 Tartu) — **NUOVO PAESE: Estonia** (aggiunta anche all'array `countries`). 2 bachelor in inglese: Business Administration, Science and Technology. Tuition €3,800/anno (i bachelor in inglese sono a pagamento anche per EU/EEA, nessun waiver); living cost €500–€800/mese (tra i più bassi UE); ranking Top 400 QS (#362, 2026). Nomi corsi 1° anno ricostruiti dai topic ufficiali del curriculum (ECTS per-corso solo nel Study Information System, non nella pagina pubblica). Fonti: ut.ee/en/curriculum, topuniversities.com.

### Verifiche
- **bocconi**: tuition confermata, invariata — €0–€17,000/anno (max €17,000 anche per a.a. 2026-27). Fonte: unibocconi.it / bit.unibocconi.it.
- **ku-leuven**: tuition confermata, invariata — €1,181/anno (EEA, 60 crediti, 2025-2026). Fonte: kuleuven.be/english/education/student/fees.
- **oxford**: Home fee aggiornata da **£9,535 → £9,790/anno** (2026 entry, tetto nazionale UK 2026/27). Range international invariato. Fonte: ox.ac.uk/admissions/undergraduate/fees-and-funding/course-fees.
- **ucl**: Home fee aggiornata da **£9,535 → £9,790/anno** (stesso tetto nazionale UK 2026/27). Range international invariato. Fonte: gov.uk / ox.ac.uk (tetto nazionale).
- **VERIFY - ETH Zurich tuition group 1** — confermato **CHF 730/sem invariato**; la segnalazione di un possibile aumento a CHF 804 NON è confermata dalla fonte ufficiale (Group 1 = CHF 730/sem, Group 2 = CHF 2.190/sem, entrambi invariati). Campo `tuition` del record eth-zurich già corretto, nessuna modifica a universities.ts. Fonte: ethz.ch/students/en/studies/financial/tuition-fees.html (agg. 19.11.2025). **Flag chiuso.**

## 2026-08-07

### Verifiche
- **VERIFY - Utrecht tuition update** — **utrecht** (Utrecht University): campo `tuition` aggiornato per l'a.a. 2026-2027. Vecchio valore: `"€2,314/anno (EU) / €12,068–€28,416/anno (non-EU)"` → nuovo valore: `"€2,694/anno (EU) / €12,068–€28,416/anno (non-EU)"`. La parte EU/EEA passa da €2.314 a €2.694 (statutory fee nazionale 2026-2027); la parte non-EU (institutional fee) resta invariata come range €12.068–€28.416 perché varia per singolo programma. Chiude la voce "da controllare a mano" del giro precedente. Fonte: students.uu.nl/en/practical-matters/financial-matters/tuition-fees.

## 2026-07-19

### Aggiunte
- **tilburg** (Tilburg University, 🇳🇱 Tilburg) — 3 bachelor in inglese: Economics, International Business Administration, Econometrics and Operations Research. Tuition statutory EU €2,694/anno; living cost €900–€1,200/mese; ranking Top 350 QS (#347, 2026), forte in Economics & Econometrics (#76 QS by Subject 2026). Corsi 1° anno verificati (Economics/EOR via bachelorsportal + topuniversities, IBA via pagine programma). Fonti: tilburguniversity.edu/education/bachelors-programs, topuniversities.com/universities/tilburg-university.
- **twente** (University of Twente, 🇳🇱 Enschede) — 2 bachelor in inglese: Technical Computer Science, International Business Administration. Modello TOM (moduli da 15 EC). Tuition statutory EU €2,694/anno; living cost €800–€1,100/mese (Enschede economica); ranking Top 250 QS (#223, 2027). Corsi 1° anno TCS ben documentati (utwente.nl/en/education/bachelor/programmes/technical-computer-science). Fonti: utwente.nl, topuniversities.com/universities/university-twente.
- **ucd** (University College Dublin, 🇮🇪 Dublin) — 2 bachelor: Commerce (BComm), Economics (BSc). Tutto in inglese. Tuition: student contribution ~€2,750/anno (€2,500 + levy €254, EU con Free Fees) / €26,000–€34,000/anno (non-EU); living cost €1,200–€1,600/mese (Dublino cara); ranking Top 100 QS (#100, 2027 — nuovo ingresso in top 100). Corsi 1° anno verificati (ucd.ie/economics, ucd.ie/quinn). Fonti: ucd.ie/students/fees, ucd.ie/newsandopinion (QS 2027).

### Verifiche
- **Tasse NL (nazionale)**: il collegegeld statutario 2026-2027 sale da €2,601 a **€2,694/anno** per studenti UE/SEE (confermato rijksoverheid.nl + DUO). Aggiornato il campo `tuition` di tutte le università olandesi che riportavano "€2,601/anno": **maastricht, amsterdam, erasmus, groningen, tu-delft, leiden** (6 atenei). Le due nuove aggiunte (tilburg, twente) usano già €2,694.
- **utrecht**: NON modificata. Riportava già un valore diverso ("€2,314/anno (EU) / €12,068–€28,416/anno (non-EU)") che non corrisponde allo statutory: potrebbe essere una tariffa speciale/agevolata o un dato datato — vedi sotto.

### Da controllare a mano
- **utrecht**: la tuition EU (€2,314/anno) è inferiore allo statutory nazionale (€2,694). Verificare sulla pagina ufficiale students.uu.nl se è una riduzione primo anno / tariffa specifica o un dato da aggiornare.
- **Seed Supabase NON eseguito**: lo script `seed.ts` è stato bloccato in questa sessione (scrittura su DB remoto condiviso, deploy ancora da chiarire). Le modifiche sono solo in `app/data/universities.ts`. Per pubblicarle su Supabase lanciare manualmente: `npx tsx seed.ts` (con `.env.local` caricato). L'upsert è idempotente.
- **Nota NL 2027-2028**: alcune fonti (dub.uu.nl) indicano un ulteriore aumento del collegegeld a ~€2,771 per il 2027-2028 — da rivedere il prossimo anno accademico.
