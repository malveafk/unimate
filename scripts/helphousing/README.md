# helpHousing: scraper e import

Porta gli annunci di [helpHousing](https://www.helphousing.com) nella sezione housing di 4UNI. Lo scraping è autorizzato dal proprietario del sito.

## L'idea in due righe

Stesso schema di `scripts/clubhouse`, in due passi separati:

1. `scrape.ts` legge il sito e scrive un catalogo normalizzato in `output/listings.json`. Non tocca il database.
2. `import.ts` confronta quel catalogo con la tabella `housing_listings` e applica le differenze: nuovo, cambiato, invariato, scomparso.

La differenza con Club House è nella forma della fonte: qui una sola richiesta per città restituisce già tutto (descrizioni, foto, coordinate). Poche richieste, ma pesanti.

## Come si lancia

Dalla root del progetto, in quest'ordine.

```bash
npx tsx scripts/helphousing/scrape.ts
```

```bash
npx tsx scripts/helphousing/import.ts
```

```bash
npx tsx scripts/helphousing/import.ts --apply
```

- Il primo comando fa cinque richieste (una per città) e scarica circa 32 MB. Dura meno di un minuto.
- Il secondo è una prova a secco: stampa il piano e non scrive nulla. Controlla anche che ogni riga rispetti i vincoli della tabella.
- Il terzo scrive davvero. Serve `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

A fine import viene aggiunta una riga a `partner-listings-log.md`, con soli conteggi.

### Opzioni dello scraper

| Opzione | Cosa fa |
|---|---|
| `--city=milan` | Solo quella città. Scrive `*.sample.json` e lascia intatto `listings.json`. |
| `--limit=5` | Solo i primi N per città. Anche questo scrive `*.sample.json`. |
| `--from-raw` | Nessuna richiesta di rete: ricostruisce `listings.json` da `output/raw.json`. Utile dopo una modifica alla normalizzazione. |

### Opzioni dell'import

| Opzione | Cosa fa |
|---|---|
| `--apply` | Scrive nel database. Senza, è sempre una prova a secco. |
| `--force` | Scrive anche se i controlli di sicurezza si lamentano. Da usare solo sapendo perché. |

## Ogni quanto

Una volta a settimana, e in più prima di ogni comunicazione agli studenti. Nei mesi di punta (da giugno a settembre) due volte a settimana.

Non più spesso: ogni giro costa 32 MB al loro server. Per provare una modifica al codice usare `--from-raw`, che non fa richieste.

L'import rifiuta un catalogo più vecchio di tre giorni: se è passato più tempo, va rifatto prima lo scrape.

## Cosa finisce nel catalogo

- **Città**: Madrid, Barcellona, Valencia, Milano, Firenze.
- **Filtro**: solo annunci con disponibilità da oggi in poi. Un annuncio senza prezzo viene scartato e segnalato.
- **Chiave**: il codice dell'annuncio (per esempio `F39_1A_9`). Rilanciare non crea duplicati.
- **Tipi**: stanza, posto letto in stanza condivisa, appartamento intero.
- **WhatsApp**: vuoto. Non c'è un numero concordato, e nessun numero viene inventato. Per aggiungerne uno basta compilare `whatsapp` nella lista `CITIES` di `scrape.ts`.
- **Foto**: si salvano gli URL, non si scarica nulla.
- **"Disponibile fino"**: sempre vuoto. L'unica data candidata nella fonte è la fine del contratto tra helpHousing e il proprietario, non una scadenza per l'inquilino.

### Dati personali

- **Contatti del personale**: il blocco con nome, email, telefono e WhatsApp del gestore viene scartato prima di scrivere qualsiasi file, compreso `raw.json`.
- **Firme degli ex inquilini**: nelle testimonianze in fondo alle descrizioni il nome viene sostituito con "A former tenant".
- **Indirizzo**: solo via e numero. La fonte arriva fino a piano e interno, ma la pagina pubblica non li mostra, quindi non li pubblichiamo nemmeno noi. L'indirizzo completo resta solo in `raw.json`.
- **Email e telefoni** nelle descrizioni vengono rimossi.

### Come vengono adattati i campi

La tabella è nata per appartamenti interi, helpHousing affitta soprattutto stanze. Per non far leggere "6 rooms" accanto al prezzo di una stanza:

- una stanza o un posto letto vale `rooms = 1`;
- la dimensione dell'appartamento va nella prima riga della descrizione ("Private room in a shared flat with 6 rooms.");
- un posto letto viene segnalato nel titolo ("· bed in shared room"), se il titolo non lo dice già;
- le descrizioni oltre i 2.000 caratteri vengono troncate.

Gli annunci scomparsi dal sito non vengono cancellati: l'import li segna come non disponibili (`is_active = false`).

## Limiti noti

- **Pin sovrapposti**: quasi tutte le stanze condividono le coordinate con le altre dello stesso stabile. La pagina le disegna a ventaglio, a pochi metri dal punto vero; le coordinate salvate restano quelle originali.
- **Superficie**: manca per circa un terzo degli annunci, perché manca nella fonte.
- **Titoli**: alcuni sono in spagnolo o in italiano, come sul sito.

## Se qualcosa si rompe

**Lo scraper si ferma senza scrivere.** È voluto: se una città torna vuota mentre prima aveva annunci, non sovrascrive il catalogo buono. Rilanciare più tardi.

**La struttura del sito è cambiata.** Si vede da una città a zero annunci, o da molti annunci scartati per "codice, tipo, prezzo o data mancanti". I punti da ricontrollare in `scrape.ts`:

1. l'indirizzo della ricerca: `POST /api/search`;
2. il corpo della richiesta, in particolare il codice della città (`hm-madrid`, `hb-barcelona`, `hv-valencia`, `hl-milan`, `hf-fir`);
3. i nomi dei campi letti nella funzione `normalise`.

Per vedere la richiesta che fa oggi il sito: aprire una pagina di ricerca nel browser, pannello Rete, filtrare per `search`.

**Sessione scaduta.** Non può succedere: la ricerca è pubblica e lo scraper non fa login.

**Risposte 429 o 5xx, o timeout.** Lo scraper riprova da solo con attese crescenti. La risposta di Madrid pesa circa 19 MB, quindi su una rete lenta può scadere: riprovare, senza alzare il ritmo.

**L'import fallisce a metà.** Rilanciare lo stesso comando: scrive solo ciò che manca. È già successo al primo import, per un errore di rete su un blocco di 100 righe.

**L'import vuole spegnere più di metà degli annunci.** Si ferma da solo. Quasi sempre è uno scrape andato male: controllare il catalogo prima di usare `--force`.

## File

| File | Contenuto | In git |
|---|---|---|
| `scrape.ts` | Scraper | Sì |
| `import.ts` | Import | Sì |
| `output/listings.json` | Catalogo normalizzato | No |
| `output/raw.json` | Risposte originali del sito, senza i contatti del personale | No |

Gli output restano fuori da git: sono grandi e `raw.json` contiene gli indirizzi completi.
