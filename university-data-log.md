# University data log

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
