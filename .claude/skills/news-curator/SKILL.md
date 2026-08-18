---
name: news-curator
description: Ricerca, scrive e revisiona le notizie della sezione News del sito Unimate/4UNI, lavorando sul file app/data/news.ts (letto direttamente dalle pagine /news, /news/[id] e /hub, senza passare da Supabase). Copre notizie su università europee e politiche educative UE rilevanti per studenti italiani ed europei — ammissioni, scadenze, tasse, borse di studio, alloggi, nuovi programmi in inglese, cambi di regolamento. Usa SEMPRE questa skill quando Nicolò chiede di aggiungere notizie al sito, aggiornare la sezione news, controllare se le news presenti sono ancora attuali, o fare un giro periodico di ricerca — anche con frasi brevi e informali come "aggiungi news", "fai le news", "aggiorna le news", "revisiona le news", "giro news", "news uni", senza nominare esplicitamente il file. Quando Nicolò digita qualcosa di simile intende esattamente il flusso ADD + REFRESH descritto in questa skill, con i default della sezione "Se non ti viene detto altro" se non specifica quantità.
---

# News Curator (Unimate/4UNI)

Questa skill è la gemella di `university-data-curator`, ma per la sezione News. Serve a tenere `/news` viva e attuale invece di lasciarla invecchiare, il che è il modo più veloce per far sembrare morto un sito.

È pensata per essere invocata sia manualmente ("aggiungi 3 news sulle borse in Germania") sia come routine ricorrente senza istruzioni specifiche — in quel caso usa i default della sezione "Se non ti viene detto altro".

## Come funzionano i dati (leggi prima di tutto)

**Differenza critica rispetto a `university-data-curator`: le news NON passano da Supabase.** Non c'è nessun seed. Il file TypeScript è direttamente ciò che il sito mostra:

```
app/data/news.ts
```

È letto da tre punti:
- `app/news/page.tsx` — la lista con i filtri paese/tag
- `app/news/[id]/page.tsx` — la pagina del singolo articolo, che cerca l'articolo con `news.find(n => n.id === id)`
- `app/hub/page.tsx` — il tab "Latest news"

Quindi **non lanciare nessuno script di seed dopo aver modificato questo file.** Modifichi il file, il sito cambia.

Prima di scrivere qualsiasi articolo, leggi `references/schema.md`: contiene il tipo esatto, i valori ammessi per `tag` e `country`, il formato di `date` e `image`, e le tre regole che se sbagliate rompono il sito in modo silenzioso (ordine dell'array, id, tag fuori lista).

## Le tre regole che rompono il sito in silenzio

Ripetute qui perché sono la causa più probabile di errore, ma i dettagli sono in `references/schema.md`:

1. **L'ordine dell'array è l'ordine di pubblicazione.** Non esiste nessun `.sort()` da nessuna parte. `filtered[0]` diventa la notizia in evidenza, `slice(1,4)` le tre secondarie. Una notizia nuova va messa **in cima all'array**, non in fondo.
2. **Gli `id` sono stringhe numeriche e non si riusano mai.** L'URL di un articolo è `/news/<id>`. Cambiare o riassegnare un id rompe link già condivisi. Un articolo nuovo prende `max(id esistenti) + 1`, indipendentemente da dove finisce nell'array.
3. **`tag` e `country` sono union types derivati dagli array `newsTags` e `newsCountries` (ora in cima al file, marcati `as const`).** I filtri della pagina si costruiscono da quegli array. Usare un `tag`/`country` non presente nell'array è ora un **errore di compilazione** (`tsc --noEmit` fallisce), non più una sparizione silenziosa a runtime: per aggiungerne uno nuovo devi **prima estendere l'array**, e solo dopo puoi usarlo in un articolo.

## Due modalità

### Modalità ADD — trovare e scrivere notizie nuove

1. Apri `app/data/news.ts` e leggi i titoli già presenti, per non ripubblicare la stessa notizia con parole diverse.
2. Cerca notizie **rilevanti per il pubblico di Unimate**: studenti italiani/europei che stanno scegliendo o frequentando un bachelor in Europa. Il criterio di rilevanza è pratico, non giornalistico — la domanda da farsi è "questo cambia una decisione o una scadenza per uno studente?". Esempi di cosa qualifica:
   - Scadenze e finestre di ammissione che si aprono o cambiano
   - Variazioni di tasse universitarie, o nuove fasce/esenzioni
   - Nuove borse di studio, o cambi ai requisiti di quelle esistenti (DSU, DAAD, Beca MEC, studiefinanciering...)
   - Nuovi bachelor in inglese, o corsi che passano/tornano alla lingua locale
   - Politiche nazionali o UE su studenti internazionali (numero chiuso, quote, tasse per non-UE, riconoscimento titoli, Erasmus+)
   - Situazione alloggi in una città universitaria (liste d'attesa, nuove residenze, stretta sugli affitti)
3. Fonti, in ordine di preferenza:
   - Siti ufficiali di università e ministeri dell'istruzione
   - Agenzie e portali nazionali ufficiali (Studyinholland, DAAD, Campus France, DUO, Universities UK)
   - Fonti UE (Commissione Europea, Erasmus+, Eurydice)
   - Testate giornalistiche affidabili del paese, per notizie di politica educativa
   - **Evita** aggregatori di consulenza per studenti e siti "top 10 università" senza fonte primaria. Se una notizia esiste solo lì, non pubblicarla.
4. Verifica che la notizia sia **ancora valida oggi**, non solo che sia stata vera quando è stata pubblicata. Una scadenza già passata non è una notizia, è un errore.
5. Scrivi l'articolo seguendo `references/schema.md`. Sul contenuto:
   - **Tutto in inglese** — il sito è interamente in inglese, non scrivere in italiano.
   - `title`: concreto e specifico, con il soggetto in testa (università o paese). Niente clickbait, niente punto finale.
   - `summary`: 2-4 frasi, ~40-70 parole. Deve contenere i numeri e le date che servono: importi, scadenze, chi ha diritto a cosa. È l'unico corpo dell'articolo che esiste, quindi deve reggere da solo.
   - Non copiare frasi dalla fonte: riscrivi con parole tue.
   - `link`: metti sempre l'URL della fonte primaria. Al momento le pagine non lo mostrano (vedi "Note aperte"), ma serve come tracciabilità.
6. Inserisci il nuovo oggetto **in cima** all'array `news`, con id `max + 1`.
7. Se la notizia riguarda un paese o un tag non ancora presenti negli array `newsTags` / `newsCountries` (in cima al file), **aggiungili prima lì** (vedi `references/schema.md` per il formato): essendo union types, usarne uno non dichiarato è un errore di compilazione.
8. Registra l'aggiunta nel log.

### Modalità REFRESH — revisionare le notizie già pubblicate

Le news invecchiano in un modo che i dati delle università non hanno: una notizia può essere stata scritta correttamente e diventare falsa da sola col passare del tempo.

1. Scorri gli articoli presenti partendo dai più vecchi e valuta ciascuno:
   - **Scaduto**: parla di una scadenza o di un anno accademico ormai passati. Se il fatto si ripete ogni anno (es. finestra di ammissione), **aggiornalo** al ciclo corrente verificando le date nuove sul sito ufficiale, e sposta l'articolo in cima. Se è un evento irripetibile e superato, segnalalo nel log come candidato alla rimozione — **non cancellare articoli di tua iniziativa**, l'id sparirebbe e con esso un URL potenzialmente già condiviso.
   - **Superato dai fatti**: l'importo, il requisito o la regola è cambiato. Correggi `summary` (e `title` se necessario) con il dato nuovo, citando la fonte nel log.
   - **Ancora valido**: non toccarlo. Non riscrivere il testo solo per riformularlo.

   > **In REFRESH aggiorni `updated`, NON `date`.** La `date` è la data di **pubblicazione originale** dell'articolo e non si tocca mai in revisione; imposta invece `updated` alla data in cui fai la modifica (stesso formato di `date`, es. `"18 August 2026"`). Serve a separare "quando è uscita" da "quando l'ho rivista", così la sezione non sembra ripubblicata tutta in un giorno solo. Un articolo creato in ADD nasce con la sola `date`, senza `updated`; la pagina mostra "Updated on X" sotto la data quando `updated` è presente.
2. Se una fonte non è più raggiungibile e non trovi conferma altrove, lascia l'articolo com'è e segnalalo nel log per revisione manuale.
3. Registra ogni modifica nel log con cosa è cambiato e la fonte.

## Se non ti viene detto altro (default per esecuzioni periodiche)

Quando la skill viene invocata senza istruzioni specifiche, esegui in un solo passaggio:

- **ADD**: 4 notizie nuove, distribuite su almeno 2 paesi diversi (evita di riempire la home di sole news olandesi)
- **REFRESH**: i 5 articoli con la `date` più vecchia

Questo tiene il diff piccolo abbastanza da essere revisionato a colpo d'occhio da Nicolò.

## Log delle modifiche

Ad ogni esecuzione, aggiungi (non sovrascrivere) una sezione a `news-log.md` nella root del progetto, creandolo se non esiste. Stesso spirito del `university-data-log.md`:

```markdown
## 2026-08-12

### Aggiunte
- **id 14** — "Netherlands raises statutory tuition fee to €2,730 for 2026-2027" (Netherlands, Tuition). Fonte: duo.nl/particulier/...
- **id 15** — "Spain extends Beca MEC deadline to 15 October" (Spain, Scholarships). Fonte: becaseducacion.gob.es/...

### Aggiornate
- **id 1** (Maastricht admissions): scadenze aggiornate dal ciclo 2025 al 2026-2027, articolo risalito in cima. Fonte: maastrichtuniversity.nl/...
- **id 5** (UvA housing): lista d'attesa DUWO da 8 a 11 mesi. Fonte: duwo.nl/...

### Da controllare a mano
- **id 3** (TU Munich nuovi bachelor): notizia del 2025 ormai storica, valutare se rimuoverla o riscriverla come "programmi disponibili".

### Nuovi tag o paesi introdotti
- Aggiunto country "Belgium" 🇧🇪 a newsCountries
```

Il log è il modo in cui Nicolò controlla il lavoro senza leggere il diff riga per riga. Non saltarlo.

## Dopo aver editato il file

1. Verifica che il file sia sintatticamente valido — virgole, oggetti chiusi, apici. Se puoi lanciare `npx tsc --noEmit` o il lint del progetto, fallo.
2. Controlla che ogni `id` sia ancora univoco e che nessun id preesistente sia cambiato.
3. Controlla che ogni `tag` e ogni `country` usati compaiano in `newsTags` / `newsCountries` — ora è anche garantito da `tsc` (sono union types: se usi un valore non dichiarato, `npx tsc --noEmit` fallisce).
4. **Non lanciare `seed.ts`** — non c'entra nulla con le news, tocca solo università, bachelor e corsi.
5. Mostra a Nicolò il diff di `news.ts` prima di committare, e non pushare automaticamente.

## Note aperte (segnalare, non risolvere da soli)

- Il campo `link` è dichiarato nel tipo `NewsItem` ma **non è renderizzato in nessuna pagina**. Continua a popolarlo, ma se Nicolò chiede perché le fonti non si vedono sul sito, la risposta è che manca il rendering, non il dato.
- Non esiste paginazione su `/news`. Man mano che l'archivio cresce, la pagina si allunga e basta — se il numero di articoli supera ~30, vale la pena segnalarlo.

## Riferimenti

- `references/schema.md` — tipo TS completo, valori ammessi, formati di data e immagine, esempio di record completo, checklist finale. Leggilo sempre prima di scrivere o modificare articoli.
