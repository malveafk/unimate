# Club House: scraper e import

Porta gli annunci di [Club House](https://www.clubhouse-student.eu) nella sezione housing di 4UNI. Lo scraping è autorizzato per iscritto dal fondatore; il loro Airtable non viene mai toccato.

## L'idea in due righe

Sono due passi separati, come un fornitore che manda il listino e un magazzino che lo riconcilia:

1. `scrape.ts` legge il sito e scrive un catalogo normalizzato in `output/listings.json`. Non tocca il database.
2. `import.ts` confronta quel catalogo con la tabella `housing_listings` e applica le differenze: nuovo, cambiato, invariato, scomparso.

Tenerli separati serve a poter guardare il catalogo prima di scriverlo, e a rilanciare l'import senza interrogare di nuovo il sito.

## Come si lancia

Dalla root del progetto, in quest'ordine.

```bash
npx tsx scripts/clubhouse/scrape.ts
```

```bash
npx tsx scripts/clubhouse/import.ts
```

```bash
npx tsx scripts/clubhouse/import.ts --apply
```

- Il primo comando dura circa dieci minuti: una richiesta per città più una per annuncio (514 nell'ultimo giro), a una al secondo.
- Il secondo è una prova a secco: stampa il piano e non scrive nulla. Va letto prima del terzo.
- Il terzo scrive davvero. Serve `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

A fine scrape viene stampato il diff rispetto al giro precedente (nuovi, aggiornati, invariati, scomparsi). A fine import viene aggiunta una riga a `partner-listings-log.md`, con soli conteggi.

### Opzioni dello scraper

| Opzione | Cosa fa |
|---|---|
| `--city=madrid` | Solo quella città. Scrive `*.sample.json` e lascia intatto `listings.json`. |
| `--limit=5` | Solo i primi N per città. Anche questo scrive `*.sample.json`. |
| `--reuse-details` | Salta la richiesta di dettaglio quando i dati di lista di un annuncio sono identici al giro precedente. |
| `--from-raw` | Nessuna richiesta di rete: ricostruisce `listings.json` da `output/raw.json`. Utile dopo una modifica alla normalizzazione. |

### Opzioni dell'import

| Opzione | Cosa fa |
|---|---|
| `--apply` | Scrive nel database. Senza, è sempre una prova a secco. |
| `--force` | Scrive anche se i controlli di sicurezza si lamentano. Da usare solo sapendo perché. |
| `--keep-demo` | Non disattiva le righe dimostrative (`source = demo`). |

## Ogni quanto

Una volta a settimana, e in più prima di ogni comunicazione agli studenti. Nei mesi di punta (da giugno a settembre) due volte a settimana: le disponibilità cambiano in fretta.

L'import rifiuta un catalogo più vecchio di tre giorni: se è passato più tempo, va rifatto prima lo scrape.

## Cosa finisce nel catalogo

- **Filtro**: solo annunci non scaduti (data di fine vuota o da oggi in poi). Londra viene saltata se vuota.
- **Chiave**: l'id Club House. Rilanciare non crea duplicati.
- **WhatsApp**: un numero per città (Madrid, Parigi, Berlino). Una città senza numero viene segnalata e resta senza: nessun numero viene inventato.
- **Foto**: si salvano gli URL, non si scarica nulla.
- **Dati personali**: i titoli originali contengono il nome del proprietario ("Paola's Apartment"), quindi vengono sostituiti da titoli neutri ("3-bedroom apartment in Moncloa, Madrid"). I nomi vengono tolti anche dalle descrizioni, insieme a email e telefoni.
- **Prezzo per stanza**: alcuni appartamenti affittati a stanze mostrano il prezzo della stanza più economica. Lo scraper lo riconosce e l'import lo scrive nel titolo ("· price per room").

Gli annunci scomparsi dal sito non vengono cancellati: l'import li segna come non disponibili (`is_active = false`).

## Limiti noti

- **Arredato**: la fonte non ha il campo. Viene segnato solo quando lo dice la descrizione, quindi molti appartamenti arredati risultano "No".
- **Link originali**: 97 indirizzi di pagina contengono il nome del proprietario, perché è Club House a costruirli così. Stanno solo nel database, non nel repository.
- **Data di disponibilità**: la pagina pubblica non la mostra (c'è solo un selettore di date), quindi non è verificabile a occhio.

## Se qualcosa si rompe

**Lo scraper si ferma senza scrivere.** È voluto: se la lista di una città non si scarica, o se tutte le città tornano vuote mentre prima avevano annunci, non sovrascrive il catalogo buono. Rilanciare più tardi. Una singola pagina di dettaglio che fallisce invece non ferma il giro: l'annuncio resta nel catalogo con i dati della lista, conserva descrizione e foto del giro precedente e viene elencato negli avvisi finali.

**La struttura del sito è cambiata.** Si vede da annunci tutti senza descrizione o senza foto, o dall'errore sul parsing del dettaglio. I punti da ricontrollare in `scrape.ts`:

1. la lista: `GET /api/apartments?city=…`;
2. il dettaglio: la pagina `/apartment/{slug}`, da cui si estraggono i dati incorporati nel codice della pagina;
3. la regola con cui si costruiscono gli URL delle foto.

Per provare una correzione senza pesare sul sito: `--city=madrid --limit=3`, poi `--from-raw`.

**Sessione scaduta.** Non può succedere: lo scraper usa solo pagine pubbliche e non fa login. Le credenziali in `.env.local` non vengono lette.

**Risposte 429 o 5xx.** Lo scraper riprova da solo con attese crescenti. Se continua, fermarsi e riprovare dopo qualche ora, senza alzare il ritmo.

**L'import fallisce a metà.** Rilanciare lo stesso comando: scrive solo ciò che manca. Se il messaggio parla di database irraggiungibile, il progetto Supabase è probabilmente in pausa e va riattivato dalla dashboard.

**L'import vuole spegnere più di metà degli annunci.** Si ferma da solo. Quasi sempre è uno scrape andato male, non una vera sparizione: controllare il catalogo prima di usare `--force`.

## File

| File | Contenuto | In git |
|---|---|---|
| `scrape.ts` | Scraper | Sì |
| `import.ts` | Import | Sì |
| `output/listings.json` | Catalogo normalizzato | No |
| `output/raw.json` | Risposte originali del sito | No |

Gli output restano fuori da git perché contengono dati non ripuliti.
