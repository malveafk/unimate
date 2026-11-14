# News log — sezione News di Unimate/4UNI

Registro delle esecuzioni della skill `news-curator` su `app/data/news.ts`.
Voce più recente in cima.

## 2026-11-12

Giro periodico **ADD + REFRESH** (trigger "aggiorna news"). Il file aveva 12 articoli; ora 15.
Nota di metodo: la regola di default della skill ("REFRESH i 5 con la `date` più vecchia") è ormai disallineata con il campo `updated` introdotto ad agosto — `date` è la pubblicazione (tutti apr-mag 2025), quindi la vera staleness è `updated ?? date`. Ho selezionato i 4 articoli **mai revisionati** (senza `updated`: id 1, 4, 6, 7) + id 11 (il più time-sensitive). **Da sistemare**: aggiornare la riga di default della skill a `updated ?? date`.

### Aggiunte
- **id 13** — "Netherlands: statutory tuition rises to €2,771 for 2027-2028" (Netherlands, Tuition). Tassa statale UE/SEE €2.694 → €2.771 (+2,8%). Fonti: eur.nl/…/collegegeldtarieven-2027-2028, maastrichtuniversity.nl, duo.nl.
- **id 14** — "Netherlands: top universities cap English-taught bachelor places for 2027-2028" (Netherlands, Admissions). Numerus fixus nuovo/rivisto sulle track in inglese di Political Science, Business Administration, Psychology all'UvA per il 2027-2028; taglio ~20% dell'inflow internazionale, dentro accordi nazionali col ministero. Fonte: uva.nl (annuncio lug 2026, confermato via fetch).
- **id 15** — "Germany: BAföG reform heading to Parliament — higher student aid from April 2027" (Germany, Grants). 30ª legge BAföG adottata dal governo: dal 1 apr 2027 Wohnkostenpauschale €380→€440, supplemento assicurazioni €137→€160; Grundbedarf a step successivi. Max attuale €992. In attesa di Bundestag/Bundesrat (fine 2026). Inquadrato come **bozza pendente**, niente Höchstsatz 2027 non confermato. Fonti: zdfheute.de, finanztip.de, studierenplus.de.

### Aggiornate (updated = 12 November 2026, `date` di pubblicazione invariata)
- **id 11** (Sweden) → le date **autunno 2027** ora sono pubblicate (ad agosto ancora no): apre 16/10/2026, I round 15/01/2027 (risultati bachelor 08/04/2027), II round 15/04/2027. Inserite al posto del rimando generico "in autumn 2026". Fonte: universityadmissions.se/.../autumn-semester-dates (confermata via fetch).
- **id 1** (Maastricht) → chiuso finalmente il ciclo che ad agosto avevo lasciato invariato: **settembre 2027** aperto su Studielink dal 01/10/2026; scadenza UE ~01/05/2027, selettivi (Medicine, Psychology) 15/01/2027. Titolo e summary aggiornati. Fonte: maastrichtuniversity.nl (alcune pagine programma con refusi di data → tenuto il quadro generale, non le date per-programma incerte).
- **id 7** (Sciences Po) → **corretti i numeri traballanti** del vecchio testo ("ISEE €25k / €14.000/anno"). Modello reale: tasse su base reddito per famiglie residenti UE/SEE da **€0 a ~€14.900/anno**, **36% paga zero**; pathway internazionale 2027 chiude **01/03/2027**. Fonte: sciencespo.fr/…/tuition-fees (conflitto €12.363 vs €14.900 tra pagine ufficiali → usato il tetto €14.900).
- **id 4** (France APL) → ad agosto l'avevo lasciato (€280 ancora nel range). Ora aggiornato al fatto nuovo: **forfait congelati nel 2026** (= 2025); importo tipico ~€100-250/mese, tetti affitto ~€272-333 (persona sola); UE idonei. Tolto il framing "increases to €280". Fonti: moneyvox.fr, aide-sociale.fr. (La voce su taglio APL per extra-UE da luglio 2026 veniva da aggregatori → non inserita.)
- **id 6** (Portugal) → da pezzo "trend" vago (claim non verificati: ranking Uniplaces, borse Porto) a fatto concreto: bachelor pubblici UE **~€697/anno** (tetto nazionale), ma **pochissimi bachelor in inglese** (l'offerta in inglese è al master). Fonte: ulisboa.pt/en/info/tuition-fees.

### Da controllare a mano
- **4° ADD non fatto di proposito**: pubblicati **3 ADD invece di 4**. Parcoursup/Campus France 2027 non ha ancora un calendario ufficiale; Erasmus+ e Spagna non reggevano su fonte primaria o erano fuori tema. Meglio 3 solidi che un 4° debole. Se vuoi il 4°, dimmi il paese e lo cerco.
- **Sbilanciamento NL**: 2 dei 3 ADD sono olandesi (tassa + cap). È lì che stava la notizia verificata di novembre; il blocco in cima resta comunque vario (SE, NL, DE, FR).

### Nuovi tag o paesi introdotti
- Nessuno. Tutti i `country`/`tag` già presenti; nessuna estensione degli union types necessaria.

### Note tecniche
- `npx tsc --noEmit` → exit 0.
- id esistenti invariati; nuovi id 13, 14, 15 (= max+1 progressivo). 15 id univoci.
- Ordine array: 11 · 14 · 15 · 7 · 13 · 1 · 4 · 6 · 10 · 2 · 8 · 9 · 5 · 3 · 12.
- Nessun `seed.ts`. Non committato, non pushato. Lavoro housing non committato e `autostash` non toccati.

## 2026-08-12

Giro **solo REFRESH** (nessun ADD), su richiesta. Confermati 12 articoli (id 1–12), nessun articolo mancante.
Regola applicata ai CICLICI: puntare all'intake **autunno 2027** scritto al futuro; se la data 2027 non è pubblicata sul sito ufficiale, **non dedurla** dall'anno precedente → lasciare invariato e loggare.
Secondo passaggio con tre correzioni richieste (fonti ufficiali su id 5; id 3 e id 12 riscritti evergreen invece che segnalati per rimozione).

### Aggiornate
- **id 11** (Sweden, no tuition per EU) → portato in **posizione 0** su richiesta esplicita (massimo valore permanente). Riscritto: confermato "zero tasse per EU/EEA dal 2011" + niente application fee; costi di vita mantenuti; **rimossa la scadenza scaduta "15 January 2026"**. Le date autunno 2027 NON sono ancora pubblicate su universityadmissions.se (in pagina solo autunno 2026: apertura 16/10/2025, I round 15/01/2026, II round 16/03→15/04/2026) → non dedotte, il testo rimanda al processo. Nota: qui ho adattato la regola "lascia invariato" alla richiesta di metterlo in pos. 0, ma **senza** scrivere una data 2027 fittizia. Fonte: universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/.
- **id 10** (University of Copenhagen, ammissioni) → CICLICO aggiornato al ciclo **autunno 2027** (pubblicato), al futuro. UE: domanda entro **15/03/2027**, documenti entro **05/07/2027**; extra-UE portale apre **15/11/2026**, scadenza **15/01/2027**. Risalito in cima. Fonte: ku.dk/studies/bachelor/quota-1-and-quota-2.
- **id 2** (Germany, BAföG) → SUPERATO. Importo max **€934 → €992/mese** (2025/26); aumento successivo **rinviato all'estate 2027**, quindi €992 vale anche per il 2026/27. Corretto anche il **requisito**: l'idoneità UE non è "from day one" ma richiede **lavoro ≥12h/settimana** durante gli studi, oppure **5 anni di residenza legale**. Fonti: finanztip.de/bafoeg, bafoeg-rechner.de, studierendenwerk-oldenburg.de.
- **id 8** (Spain/Catalogna, tasse) → SUPERATO/aggiornato. Congelamento tasse **esteso al 2026-2027** con **Decret 96/2026** (16/06/2026); prezzo credito laurea **€17,69**; nuova esenzione per **famiglie monoparentali** (€12,5 mln) dal 2026-2027. Fonti: govern.cat (Decret 96/2026), ub.edu/acad/matricula/preus.html.
- **id 9** (Denmark, SU) → SUPERATO. Importo SU **DKK 6.321 → 7.426/mese** (2026, udeboende, videregående, ante-imposte; ~€1.000). Corretto il **requisito**: idoneità UE tramite **worker status (~10-12h/settimana)**, non "dopo 6 mesi di residenza". Menzionato il prestito opzionale fino a DKK 3.799/mese. Fonti: su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende (primaria), exploringdenmark.com.
- **id 5** (University of Amsterdam, alloggi) → **RISCRITTO su fonte ufficiale (uva.nl)** dopo la tua correzione. La verifica su duwo.nl (2 pagine) e su uva.nl ha smentito sia gli "8 mesi/oltre un anno" (venivano da aggregatori: nlcompass, study-abroad — vietati dalla skill) **sia** la data "15 maggio 2026" (non presente su nessuna fonte ufficiale). Rimosse entrambe. Correzione concettuale: UvA non usa una "lista d'attesa" ma una **lotteria randomizzata** (partner DUWO, De Key, Student Experience), posto **mai garantito**; deadline consigliata **1° aprile**; per settembre 2026 già chiuso (round chiuso l'8 giugno), lotteria per lo spring semester 2027 a **ottobre/novembre 2026**. Fonte: student.uva.nl/en/information/step-4-uva-student-housing-limited-availability.
- **id 3** (TU Munich) → **RISCRITTO evergreen** (era "nuovi bachelor in inglese dal 2025"). Tolta la cornice "novità 2025"; ora elenca i bachelor **oggi disponibili in inglese**, verificati su tum.de: Aerospace (B.Sc.) e Information Engineering (TUM Campus Heilbronn) full-English, Management & Technology con track in inglese. Tag Updates, data 12/08/2026. Spostato **sotto i sei rinfrescati** (pos. 7). Fonte: tum.de/en/studies/application/bachelors-degree-programs.
- **id 12** (KTH Stockholm) → **RISCRITTO evergreen** (era "nuovo bachelor CS in inglese dal 2025"). La verifica su kth.se **corregge un errore del vecchio testo**: KTH ha **un solo** bachelor in inglese, il BSc **Information and Communication Technology** (180 ECTS) — non un "pilota di Computer Science". Tutti gli altri bachelor sono in svedese; l'offerta ampia in inglese parte dal master. Tag Updates, data 12/08/2026. Spostato **sotto i sei rinfrescati** (pos. 8). Fonte: kth.se/en/studies/bachelor/bachelor-s-degree-studies-at-kth.

### Lasciate invariate (verificate, ma nessun dato da cambiare o fonte 2027 non pubblicata)
- **id 1** (Maastricht, ammissioni) — CICLICO. Il sito ufficiale espone ancora l'anno accademico **2026/2027**; le scadenze **2027/2028 non risultano pubblicate**. Per la regola anti-deduzione → **invariato**, da rifare quando escono le date. Fonte: maastrichtuniversity.nl/admission-requirements (titolo pagina: "Admission Requirements Academic Year 2026/2027").
- **id 7** (Sciences Po Paris, borse) — CICLICO. Le ammissioni **2027 aprono a metà settembre 2026** (dopo oggi): procedura e scadenze non ancora pubblicate → **invariato**. Fonte: sciencespo.fr/admissions/en/undergraduate/… (deadlines "updated mid-September").
- **id 4** (France, CAF/APL) — inizialmente classificato SUPERATO, ma la verifica **non conferma un cambio**: il massimo APL studente oggi è ~€170-300/mese (importo variabile per zona/affitto, rivisto ogni ottobre), quindi **€280 resta nel range plausibile**. Nessuna fonte lo smentisce con un valore diverso → **non toccato**, nessun numero inventato. Fonti: aide-sociale.fr/montant-apl, twenty-campus.com.

### Ordine finale dell'array
Rinfrescati in cima: **11 (pos 0)** · 10 · 2 · 8 · 9 · 5. Poi i due evergreen riscritti: 3 · 12. A seguire gli invariati: 1 · 4 · 6 · 7.

### Nuovi tag o paesi introdotti
- Nessuno. Tutti i `country` e `tag` usati erano già presenti in `newsCountries` / `newsTags`.

### Note tecniche
- `npx tsc --noEmit` → exit 0, nessun errore.
- Nessun `id` esistente modificato; tutti gli id restano univoci (1–12).
- Nessun `seed.ts` lanciato (le news non passano da Supabase).
- Non committato, non pushato.
