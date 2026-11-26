---
name: university-data-curator
description: Ricerca, aggiunge e verifica dati su università, bachelor, corsi, tasse e costo della vita per il sito Unimate/4UNI (app/data/universities.ts, da cui seed.ts popola Supabase), con fonte e data visibili per ogni dato (app/data/bachelorSources.ts, app/data/costSources.ts). Usa SEMPRE questa skill quando Nicolò chiede di aggiungere università, controllare/aggiornare/verificare i dati, o quando parte il controllo giornaliero automatico — anche con frasi brevi come "aggiungi e revisiona uni", "revisiona le uni", "aggiorna le università", "controllo giornaliero uni". Senza istruzioni specifiche esegui il "Controllo giornaliero" descritto qui.
---

# University Data Curator (Unimate/4UNI)

Regola numero uno: **la veridicità viene prima di tutto.** Ogni dato del sito deve essere verificabile su una pagina ufficiale, con la data del controllo. Se un dato non è verificabile, si toglie o si scrive che la fonte non è documentata: mai riempire un vuoto con un dato plausibile.

## Dove stanno i dati

| Cosa | File | Arriva al sito |
|---|---|---|
| Università, bachelor, corsi, tasse, costo della vita, descrizioni | `app/data/universities.ts` | tramite il seed su Supabase |
| Fonte + data di ogni piano di studi | `app/data/bachelorSources.ts` | letto direttamente dalla pagina |
| Fonte + data di tasse e costo della vita | `app/data/costSources.ts` | letto direttamente dalla pagina |
| Requisiti di ammissione, scadenze, link | `app/data/universityMeta.ts` | letto direttamente dalla pagina |
| Registro di ogni modifica, con la fonte | `university-data-log.md` | non pubblicato: serve a Nicolò |

Non scrivere mai a mano su Supabase. Dopo aver cambiato `universities.ts` si lancia il seed:
`DOTENV_CONFIG_PATH=.env.local node -r dotenv/config node_modules/.bin/tsx seed.ts`

Schema completo: `references/schema.md`.

## Regole sui dati

- **Nomi dei corsi**: il nome ufficiale, esattamente come lo scrive l'università.
  - Corso che l'università chiama in inglese → nome in inglese, nessuna traduzione.
  - Corso con nome solo nella lingua locale (tedesco, svedese, ...) → resta in quella lingua, con la traduzione inglese in `nameEn` (compare piccola sotto il nome).
  - Non copiare i refusi dell'università (es. "Bilogía"): scrivi il nome corretto e annotalo nel log.
- **Se non trovi il nome ufficiale di un corso, toglilo.** Meglio un piano incompleto che un nome sbagliato.
- **Crediti e anno** solo se scritti sulla fonte; altrimenti si lasciano vuoti.
- **Tasse** in inglese semplice, cifra UE per prima, anno accademico subito dopo (`"€2,771/year, 2027-28"`); regole di formato in `references/schema.md` (le legge `utils/universityCosts.ts`).
- **Costo della vita**: dal budget ufficiale dell'ateneo; se il numero è ricavato (conversione di valuta, settimanale → mensile, totale meno tasse) in `costSources.ts` vanno `figures` (i numeri come li scrive la fonte) e `note` (come è stato ricavato).
- **Descrizioni**: niente superlativi non verificabili ("la più prestigiosa", "una delle migliori"); solo fatti con fonte.
- **Siti con verifiche anti-bot** (Cloudflare, Anubis, CAPTCHA): non aggirarle. Si cerca un altro documento ufficiale o si lascia la voce "da controllare".

## Controllo giornaliero (default senza istruzioni)

Gira ogni mattina sul Mac di Nicolò. Obiettivo: un giro completo di tutti i bachelor circa ogni due settimane, e intanto documentare le fonti mancanti.

1. **Preparazione**: `git pull --ff-only` su `main`. Se ci sono modifiche non committate di altre sessioni nei file dati, fermati e scrivilo nel riepilogo.
2. **Piani di studio**: `python3 scripts/uni-check/check.py curricula --limit 15 --update-dates`
   - `PASS`: tutto coincide, la data è già aggiornata. Niente altro da fare.
   - `NEEDS-BROWSER`: apri le fonti nel browser integrato e confronta (le pagine JavaScript o bloccate da riga di comando). Se coincide, aggiorna a mano `checkedOn` in `bachelorSources.ts`.
   - `MISMATCH`: il piano potrebbe essere cambiato. Cerca la versione dell'anno in corso o del prossimo (regolamento, guida, catalogo ufficiale), confronta voce per voce, poi ricostruisci con `python3 scripts/uni-check/setcourses.py spec.json` e aggiorna fonte e data.
   - `NO-SOURCE`: trova la pagina ufficiale del piano e aggiungila.
3. **Tasse e costo della vita**: `python3 scripts/uni-check/check.py costs --limit 10 --update-dates`, stessa logica: documenta le voci `NO-SOURCE` (pagina tasse ufficiale; per il costo della vita il budget dell'ateneo o, se non esiste, la fonte nazionale con `figures` e `note`) e correggi le cifre cambiate.
4. **Scadenze**: se una scadenza in `universityMeta.ts` è passata o scritta come "Expected" e ora è pubblicata, aggiornala.
5. **Controlli**: `npx tsx check-universities.ts` e `npx tsc --noEmit` (ignora gli errori in `.next/`). Nessuna nuova segnalazione ammessa.
6. **Registro**: aggiungi in cima a `university-data-log.md` una sezione con la data: cosa è stato controllato, cosa è cambiato e perché, con la fonte, cosa resta da fare.
7. **Pubblicazione** (vedi sotto: piccole dirette, grandi in revisione), poi il seed. Il sito resta in pausa su Vercel: **mai riattivarlo**; dopo ogni push controlla che `https://www.4uni.online` risponda 503.
8. **Riepilogo** a Nicolò in italiano, senza emoji, in poche righe: quanti controllati, cosa è cambiato, link alla pull request se c'è, cosa serve da lui.

### Piccole e grandi modifiche (fase di prova, finché Nicolò non dice altrimenti)

- **Piccole → commit diretto su `main`**: solo date di controllo aggiornate, fonti aggiunte a dati che coincidono, nomi corretti nella forma (maiuscole, "&"/"and", punteggiatura), refusi.
- **Grandi → pull request da approvare**: corsi aggiunti o tolti, piano ricostruito, crediti cambiati, tasse o costo della vita cambiati, scadenze spostate, nuove università. Lavora su un branch `uni-check/AAAA-MM-GG`, apri la PR con `gh pr create` e scrivi nella descrizione, per ogni modifica, prima/dopo e la fonte. Nicolò approva facendo Merge; dopo il merge si lancia il seed.
- Nel dubbio una modifica è grande.

## Aggiungere università (solo se richiesto)

Per ogni nuova università: tutti i campi di `universities.ts`, la voce in `universityMeta.ts`, la fonte del piano in `bachelorSources.ts`, le fonti di tasse e costo della vita in `costSources.ts`, la voce nel log. Il catalogo è per studenti internazionali di tutta Europa: requisiti scritti per qualsiasi diploma, con il link alla pagina ufficiale dei requisiti per paese. È sempre una modifica grande.
