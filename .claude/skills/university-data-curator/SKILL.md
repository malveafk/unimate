---
name: university-data-curator
description: Ricerca, aggiunge e verifica dati su università, bachelor e corsi per il sito Unimate/4UNI, lavorando sul file app/data/universities.ts (fonte di verità, da cui seed.ts popola le tabelle Supabase universities, bachelors e courses). Usa SEMPRE questa skill quando Nicolò chiede di aggiungere nuove università al sito, espandere l'elenco di bachelor o corsi, controllare/aggiornare/verificare i dati già presenti, o fare un giro di ricerca periodico sulle università europee — anche con frasi brevi e informali come "aggiungi e revisiona uni", "aggiungi uni", "revisiona le uni", "aggiorna le università", "trova nuove uni da aggiungere", senza nominare esplicitamente il file o Supabase. Questa è la routine mattutina fissa di Nicolò per il catalogo università di Unimate — quando digita qualcosa di simile a "aggiungi e revisiona uni" intende esattamente il flusso ADD + VERIFY descritto in questa skill, con i default della sezione "Se non ti viene detto altro" se non specifica quantità.
---

# University Data Curator (Unimate/4UNI)

Questa skill automatizza il lavoro più noioso di Unimate: tenere il catalogo di università, bachelor e corsi aggiornato, corretto e in crescita. È pensata per essere invocata sia manualmente ("aggiungi 3 università olandesi") sia in modo ricorrente (es. un job giornaliero che lancia Claude Code con questa skill, senza istruzioni specifiche — in quel caso usa i default della sezione "Se non ti viene detto altro").

## Come funzionano i dati (leggi prima di tutto)

Il sito **non** scrive a mano su Supabase. La fonte di verità è il file TypeScript:

```
app/data/universities.ts
```

Da lì, `seed.ts` legge l'array e lo scrive in Supabase (tabelle `universities`, `bachelors`, `courses`), gestendo da solo le trasformazioni verso il formato DB (id composti, join degli array in stringhe). **Il tuo lavoro è editare `universities.ts` correttamente — non toccare mai Supabase direttamente.** Per lo schema TS completo, le regole di conversione DB↔TS e un esempio di record completo, leggi `references/schema.md` prima di scrivere qualsiasi dato: è facile sbagliare un dettaglio (array vs stringa, id "nudo" vs prefissato) e questo romperebbe il fallback statico o il seed.

## Due modalità

### Modalità ADD — aggiungere nuove università

1. Prima di cercare, apri `app/data/universities.ts` e leggi quali `id` (slug) esistono già, per non creare doppioni.
2. Scegli università coerenti con l'ambito attuale (Europa, focus su programmi in inglese per studenti internazionali — Unimate si rivolge a loro).
3. Per ciascuna università, cerca sul web informazioni dalla fonte più affidabile disponibile, in quest'ordine di preferenza:
   - Sito ufficiale dell'università (pagine "programme"/"study" per bachelor, tuition, lingua d'insegnamento)
   - Ranking riconosciuti (QS, Times Higher Education) per il campo `ranking`
   - Portali ufficiali del paese (es. Studyinholland, DAAD per la Germania) per costi di vita e tasse quando l'ateneo non li specifica
   - Evita aggregatori generici di bassa qualità (forum, siti "top 10 università" senza fonte) — se è l'unica fonte disponibile per un dato, meglio ometterlo che inventarlo
4. Costruisci l'oggetto TS seguendo esattamente lo schema in `references/schema.md`. Alcuni campi meritano attenzione:
   - `id`: slug minuscolo, trattini, univoco (es. `"amsterdam"`, `"vu-amsterdam"` se città già usata da un altro ateneo)
   - `flag`: emoji della bandiera del paese
   - `tuition` / `livingCost`: testo libero ma nel formato già usato (`"€X/anno"`, `"€X–Y/mese"`), converti sempre in EUR se la fonte usa un'altra valuta, indicandolo se è una stima
   - `languages` / `strengths`: array di stringhe (non stringa unita — quella è solo la forma DB)
   - `ranking`: opzionale, ometti se non trovi un dato verificabile invece di stimarlo
   - Per ogni bachelor: `id` "nudo" (senza prefisso università, es. `"international-business"`, non `"amsterdam__international-business"`)
   - Per ogni corso: prova a recuperare almeno i nomi dei corsi del primo anno da una pagina programma ufficiale; `credits` e `year` sono opzionali se non trovati, ma includili quando disponibili
5. Aggiungi il nuovo oggetto in fondo all'array (o raggruppato per paese se noti che il file è già organizzato così — controlla prima di decidere).
6. Registra l'aggiunta nel log (vedi sotto).

### Modalità VERIFY — ricontrollare dati esistenti

1. Scegli un sottoinsieme di università già presenti nel file (vedi default sotto per quante).
2. Per ciascuna, ricerca sul sito ufficiale per confermare che tuition, lingua, bachelor offerti e corsi siano ancora accurati (le università cambiano tasse e programmi ogni anno accademico).
3. Applica un criterio di cautela: aggiorna un campo solo se hai trovato una fonte che lo contraddice chiaramente. Non riscrivere campi solo per riformularli — il lavoro utile è correggere errori o dati obsoleti, non "levigare" testo già corretto.
4. Se un campo non è più verificabile (es. pagina rimossa) lascialo invariato ma segnalalo nel log per revisione umana, invece di cancellarlo o indovinare.
5. Registra ogni modifica nel log, incluso cosa è cambiato e la fonte.

## Se non ti viene detto altro (default per esecuzioni automatiche/periodiche)

Quando la skill viene invocata senza istruzioni specifiche (es. da un trigger giornaliero), esegui in un solo passaggio:
- **ADD**: 3 nuove università europee non ancora presenti
- **VERIFY**: 5 università scelte a rotazione tra quelle presenti nel file (privilegia quelle verificate da più tempo, se il log lo permette di dedurre)

Questo tiene il carico di lavoro gestibile e revisionabile in un colpo d'occhio da Nicolò, invece di riscrivere tutto il file ogni volta.

## Log delle modifiche

Ad ogni esecuzione, aggiungi (non sovrascrivere) una sezione a `university-data-log.md` nella root del progetto (crealo se non esiste), con questo formato:

```markdown
## 2026-07-19

### Aggiunte
- **vu-amsterdam** (Vrije Universiteit Amsterdam) — bachelor: International Business Administration. Fonte: vu.nl/en/education/bachelor/...

### Verifiche
- **maastricht**: tuition confermata (€2,601/anno, invariata). Fonte: maastrichtuniversity.nl/...
- **groningen**: ranking aggiornato da "Top 300 QS" a "Top 250 QS (#233, 2026)". Fonte: topuniversities.com/...

### Da controllare a mano
- **utrecht**: pagina "programme fees" non raggiungibile, tuition non riverificata questo giro.
```

Questo log è il modo in cui Nicolò controlla il lavoro fatto senza dover guardare il diff di `universities.ts` riga per riga — è importante non saltarlo.

## Dopo aver editato il file

1. Controlla che il file sia sintatticamente valido (nessuna virgola mancante, oggetti ben chiusi) — se hai un modo per compilare/lintare il progetto, usalo.
2. Cerca in `package.json` lo script di seed (probabilmente qualcosa come `"seed": "tsx scripts/seed.ts"` o simile) ed eseguilo per popolare Supabase dal file aggiornato, invece di scrivere su Supabase a mano.
3. Se non hai accesso a un terminale in questa sessione (es. sei in una chat Claude.ai senza il repo aperto), consegna comunque il blocco di codice TS pronto da incollare, e ricorda a Nicolò di lanciare lo script di seed dopo aver incollato le modifiche.

## Riferimenti

- `references/schema.md` — schema TS completo, differenze DB↔TS, esempio di record completo. Leggilo sempre prima di generare o modificare dati.
