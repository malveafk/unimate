# Place to Stay: scraper e import

Porta gli annunci di [Place to Stay](https://placetostay.pt) nella sezione housing di 4UNI. Il proprietario ha dato l'ok a voce, in videochiamata con Nicolò (novembre 2026).

## L'idea in due righe

Stesso schema di `scripts/clubhouse` e `scripts/helphousing`, in due passi separati:

1. `scrape.ts` legge il sito e scrive un catalogo normalizzato in `output/listings.json`. Non tocca il database.
2. `import.ts` confronta quel catalogo con la tabella `housing_listings` e applica le differenze: nuovo, cambiato, invariato, scomparso.

La particolarità di questa fonte: il sito è un catalogo stampato con sopra un cartellino aggiornato a parte. Le pagine riportano prezzi e date del giorno in cui il sito è stato costruito; i valori veri arrivano da due fonti vive, che lo scraper legge.

## Come si lancia

Dalla root del progetto, in quest'ordine.

```bash
npx tsx scripts/placetostay/scrape.ts
```

```bash
npx tsx scripts/placetostay/import.ts
```

```bash
npx tsx scripts/placetostay/import.ts --apply
```

- Il primo comando fa quattro richieste più una per ogni stanza nuova. Il primissimo giro ne fa circa 240 e dura 16 minuti; i successivi pochi secondi.
- Il secondo è una prova a secco: stampa il piano e non scrive nulla. Controlla anche che ogni riga rispetti i vincoli della tabella.
- Il terzo scrive davvero. Serve `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

A fine import viene aggiunta una riga a `partner-listings-log.md`, con soli conteggi.

### Opzioni dello scraper

| Opzione | Cosa fa |
|---|---|
| `--limit=5` | Solo le prime N stanze. Scrive `*.sample.json` e lascia intatto `listings.json`. |
| `--no-details` | Non legge le pagine delle singole stanze. Usa quelle già ricordate. |
| `--refresh-details` | Rilegge tutte le pagine delle stanze, ignorando la memoria. Circa 16 minuti. |
| `--static-prices` | Non legge il foglio prezzi: usa i prezzi stampati nelle pagine, di solito vecchi. |
| `--from-raw` | Nessuna richiesta di rete: ricostruisce `listings.json` da `output/raw.json`. Utile dopo una modifica alla normalizzazione. |

### Opzioni dell'import

| Opzione | Cosa fa |
|---|---|
| `--apply` | Scrive nel database. Senza, è sempre una prova a secco. |
| `--force` | Scrive anche se i controlli di sicurezza si lamentano. Da usare solo sapendo perché. |

## Ogni quanto

Una volta a settimana, e in più prima di ogni comunicazione agli studenti. Nei mesi di punta (da giugno a settembre) due volte a settimana.

Almeno una volta nei primi giorni di ogni mese: il prezzo pubblicato è quello del mese corrente, quindi al cambio di mese quasi tutti i prezzi cambiano.

L'import rifiuta un catalogo più vecchio di tre giorni: se è passato più tempo, va rifatto prima lo scrape.

## Da dove arrivano i dati

| Fonte | Cosa dà |
|---|---|
| `/properties.html` | Tutte le stanze: titolo, letto, superficie, testo breve, appartamento, via, quartiere |
| `/assets/data/flats.json` | Coordinate di ogni appartamento |
| `/api/availability.php` | Da quando è libera ogni stanza (fonte viva) |
| Foglio prezzi Google, scheda "Monthly" | Prezzo di ogni stanza per ciascun mese dell'anno (fonte viva) |
| `/rooms/<id>/` | Foto e servizi della singola stanza |

## Prezzi

Il sito non ha un prezzo solo per stanza: ne ha dodici, uno per mese, e d'estate quasi tutte costano meno. Le sue schede mostrano il prezzo del **mese corrente**, e noi pubblichiamo lo stesso numero, così chi clicca trova quello che ha visto da noi.

Il minimo e il massimo dell'anno finiscono nella prima riga della descrizione ("Rent changes with the month: from €270 to €395").

I prezzi vivi stanno in un foglio Google che Place to Stay tiene pubblico apposta: è lo stesso file che scarica il browser di ogni visitatore del loro sito. Il foglio ha molte altre colonne (cauzione, calendari, note). Lo scraper tiene solo il codice della stanza e i dodici prezzi; tutto il resto viene scartato prima di scrivere su disco.

Se il foglio non si legge, lo scraper si ferma: pubblicare i prezzi stampati sarebbe sbagliato per nove stanze su dieci. Per andare avanti lo stesso c'è `--static-prices`, ma poi l'import si rifiuta di scrivere senza `--force`.

## Cosa finisce nel catalogo

- **Città**: solo Lisbona.
- **Chiave**: il codice della stanza (per esempio `YlwD0bw8`). Rilanciare non crea duplicati.
- **Tipi**: stanza in appartamento condiviso, monolocale.
- **Stanze escluse**: quelle che la fonte delle disponibilità parcheggia a una data lontanissima (2090 o oltre), cioè non in offerta.
- **Date**: dalla fonte viva. Una stanza senza prenotazioni risulta libera da oggi.
- **Indirizzo**: nome della via e quartiere. Niente numero civico, piano o interno, anche quando il sito li mostra.
- **WhatsApp**: vuoto. Non c'è un numero concordato, e nessun numero viene inventato. Per aggiungerne uno basta compilare `CONTACT_WHATSAPP` in `scrape.ts`.
- **Foto**: si salvano gli URL, non si scarica nulla. Fino a dieci per stanza, solo dal dominio di Place to Stay. L'immagine segnaposto che il sito usa per le stanze senza foto viene scartata.
- **Descrizioni**: il sito pubblica solo l'inizio di ogni testo, con i puntini. Il testo intero non è disponibile.
- **"Disponibile fino"**: sempre vuoto, la fonte non ha una data di fine.

### Come vengono adattati i campi

La tabella è nata per appartamenti interi, Place to Stay affitta stanze. Per non far leggere "7 rooms" accanto al prezzo di una stanza:

- ogni annuncio vale `rooms = 1`;
- il tipo di letto e la grandezza dell'appartamento vanno nella prima riga della descrizione ("Private room with a single bed in a shared flat with 7 rooms.");
- i monolocali che sul sito si chiamano tutti "Studio Bedroom" prendono il nome dell'appartamento ("Studio Bedroom · Ajuda 2");
- quando il sito segnala una finestra interna o assente, la nota va in fondo alla descrizione.

Gli annunci scomparsi dal sito non vengono cancellati: l'import li segna come non disponibili (`is_active = false`).

## Limiti noti

- **Foto**: il sito mostra gallerie più ampie (anche 30 foto), ma le altre stanno sui server di un'altra piattaforma, per la quale non abbiamo un'autorizzazione. Quattro stanze non hanno nessuna foto.
- **Superficie**: manca per circa il 5% degli annunci.
- **Bagni**: il numero non c'è nella fonte. Si sa solo se la stanza ha il bagno privato.
- **Una stanza senza coordinate**: il suo appartamento manca dal file delle coordinate. Compare in lista ma non sulla mappa.
- **Contatore del sito**: la scritta "225 rooms" in cima alla loro pagina è un testo fisso non aggiornato. Le schede reali sono di più.

## Se qualcosa si rompe

**Risposte 429.** Il sito limita le richieste alle pagine delle stanze: a una al secondo ne rifiuta metà. Lo scraper ne fa una ogni quattro secondi e, se viene rifiutato, aspetta 30 secondi prima di riprovare. Qualche rifiuto è normale. Se sono tanti, fermarsi e riprovare dopo qualche ora, senza alzare il ritmo.

**Il giro si interrompe a metà.** Rilanciare lo stesso comando: le pagine già lette sono ricordate in `output/details.json` e non vengono richieste di nuovo.

**Lo scraper si ferma senza scrivere.** È voluto. Succede se la pagina degli annunci torna vuota, se la fonte delle disponibilità è vuota, o se il foglio prezzi non si legge o non riconosce più le stanze. Meglio nessun aggiornamento che un catalogo sbagliato.

**La struttura del sito è cambiata.** Si vede da zero stanze, da tutte le stanze senza foto, o da uno degli errori qui sopra. I punti da ricontrollare in `scrape.ts`:

1. la pagina degli annunci: le sezioni `flat-section` e le schede `article.property`, con i loro attributi `data-…`;
2. la forma di `/api/availability.php` (campo `rooms`, per ogni stanza `available_from`);
3. il foglio prezzi: l'identificativo è scritto nel codice della pagina degli annunci (`SHEET_ID`), la colonna delle stanze si chiama "Room ID", i mesi sono colonne "Jan"…"Dec";
4. il blocco di dati strutturati in cima alla pagina di ogni stanza.

**Sessione scaduta.** Non può succedere: tutto è pubblico e lo scraper non fa login.

**L'import fallisce a metà.** Rilanciare lo stesso comando: scrive solo ciò che manca.

**L'import vuole spegnere più di metà degli annunci.** Si ferma da solo. Quasi sempre è uno scrape andato male: controllare il catalogo prima di usare `--force`.

## File

| File | Contenuto | In git |
|---|---|---|
| `scrape.ts` | Scraper | Sì |
| `import.ts` | Import | Sì |
| `output/listings.json` | Catalogo normalizzato | No |
| `output/raw.json` | Pagina degli annunci, coordinate, disponibilità, prezzi mensili | No |
| `output/details.json` | Memoria delle pagine delle stanze già lette | No |

Gli output restano fuori da git: sono grandi e `raw.json` contiene gli indirizzi completi.
