# University data log

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
