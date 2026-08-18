# Schema di `app/data/news.ts`

Documento di riferimento per la skill `news-curator`. Leggilo prima di scrivere o modificare articoli.

## Struttura del file

Il file contiene tre export, in quest'ordine:

1. `type NewsItem` — il tipo di un articolo
2. `const news: NewsItem[]` — l'array degli articoli
3. `const newsTags` e `const newsCountries` — le liste che alimentano i filtri della pagina

Tutti e tre vanno tenuti coerenti tra loro.

## Il tipo

`tag` e `country` sono **union types** derivati dagli array dei filtri `newsTags` / `newsCountries` (marcati `as const` in cima al file), non più semplici `string`:

```ts
export type NewsTag = Exclude<(typeof newsTags)[number], "All">;
export type NewsCountry = Exclude<(typeof newsCountries)[number]["code"], "all">;

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  date: string;         // data di pubblicazione originale
  updated?: string;     // data dell'ultima revisione (REFRESH), stesso formato di date
  country: NewsCountry; // un code di newsCountries diverso da "all"
  flag: string;
  tag: NewsTag;         // un valore di newsTags diverso da "All"
  university?: string;
  link?: string;
  image: string;
};
```

Conseguenza pratica: usare un `tag`/`country` non dichiarato negli array è un **errore di compilazione** (`npx tsc --noEmit` fallisce), non più una sparizione silenziosa dai filtri a runtime.

## Campo per campo

### `id` (obbligatorio)
Stringa contenente un numero intero, es. `"14"`. **Non** uno slug.

- È l'URL dell'articolo: `/news/14`. La pagina fa `news.find(n => n.id === id)`.
- Un articolo nuovo prende il massimo degli id esistenti + 1.
- **Non riassegnare mai gli id degli articoli esistenti**, nemmeno riordinando l'array. Gli id non devono seguire l'ordine dell'array.
- Non riusare l'id di un articolo rimosso.

### `title` (obbligatorio)
Inglese. Soggetto in testa (università o paese), poi il fatto. Senza punto finale.

Buoni esempi presenti nel file:
- `"Germany: BAföG now accessible to EU students from day one"`
- `"University of Amsterdam: housing crisis — 8-month waiting list"`

### `summary` (obbligatorio)
Inglese, 2-4 frasi, circa 40-70 parole. È l'intero corpo dell'articolo — la pagina `/news/[id]` non ha altro testo. Deve contenere i dati operativi: importi, scadenze, requisiti, a chi si applica. Scritto con parole tue, mai copiato dalla fonte.

### `date` (obbligatorio)
Stringa in formato inglese `D Month YYYY`, senza zero iniziale e senza virgole:

```
"2 May 2025"    ✅
"28 April 2025" ✅
"02/05/2025"    ❌
"May 2, 2025"   ❌
```

È solo visualizzata, non parsata: nessun codice la converte in `Date`. Quindi **non determina l'ordine** — vedi sotto.

### `updated` (opzionale)
Data dell'**ultima revisione** dell'articolo, stesso formato di `date` (`D Month YYYY`). Separa la data di pubblicazione (`date`, che in revisione non cambia più) da quella dell'ultima modifica. **In modalità REFRESH aggiorni `updated`, mai `date`.** Un articolo appena creato in ADD non ha `updated` (nasce con la sola `date`). Le pagine `/news` e `/news/[id]` mostrano "Updated on X" sotto la data quando il campo è presente.

### `country` (obbligatorio)
Nome del paese in inglese, es. `"Netherlands"`. Deve corrispondere **esattamente** a un `code` presente in `newsCountries` (il filtro confronta `n.country === selectedCountry`). È un **union type** (`NewsCountry`): un valore non tra i `code` di `newsCountries` è un errore di compilazione, non passa più inosservato.

### `flag` (obbligatorio)
Emoji della bandiera del paese, coerente con `country` e con quella usata in `newsCountries`.

### `tag` (obbligatorio)
Una stringa scelta tra quelle in `newsTags`. Valori attualmente in uso:

| Tag | Quando usarlo |
|---|---|
| `Admissions` | Scadenze, requisiti, processi di ammissione |
| `Tuition` | Tasse universitarie e loro variazioni |
| `Scholarships` | Borse di studio erogate da università o enti |
| `Grants` | Sussidi statali e aiuti pubblici (BAföG, CAF, studiefinanciering) |
| `Housing` | Alloggi studenteschi, affitti, liste d'attesa |
| `Updates` | Nuovi programmi, cambi di lingua o offerta formativa |
| `Trends` | Dati e tendenze sulla mobilità studentesca |

`"All"` è presente in `newsTags` solo come opzione del filtro: **non usarlo mai come `tag` di un articolo.**

Preferisci sempre riusare un tag esistente. Introducine uno nuovo solo se nessuno dei sette descrive la notizia, e in quel caso aggiungilo **prima** a `newsTags`: essendo `tag` un union type (`NewsTag`), usarne uno non ancora nell'array è un errore di compilazione.

### `university` (opzionale)
Solo se la notizia riguarda un ateneo specifico. Usa il nome per esteso, e se l'ateneo è già presente in `app/data/universities.ts` **usa esattamente la stessa stringa del campo `name`** di quel record, così i due dataset restano allineati per usi futuri. Ometti il campo per notizie di respiro nazionale o europeo.

### `link` (opzionale, ma da compilare sempre)
URL della fonte primaria. Attualmente non renderizzato da nessuna pagina, ma va inserito comunque per tracciabilità.

### `image` (obbligatorio)
URL Unsplash nel formato già usato in tutto il file:

```
https://images.unsplash.com/photo-<ID>?w=900&auto=format&fit=crop&q=80
```

I parametri query vanno lasciati identici. **Non inventare un `photo-<ID>`**: se non hai verificato che quell'ID esista, un'immagine rotta è peggio di una generica. La soluzione sicura è riusare l'URL già presente in un articolo dello stesso paese o dello stesso tema.

## Ordine dell'array (la regola più importante)

Nessun file del progetto ordina questo array. `app/news/page.tsx` fa:

```ts
const filtered = news.filter(...);
const lead = filtered[0];              // notizia in evidenza, grande
const secondary = filtered.slice(1, 4); // le tre sotto
```

Quindi:
- **La posizione 0 dell'array è la notizia in evidenza del sito.**
- Un articolo nuovo va inserito **in cima**, non in fondo.
- Un articolo aggiornato in modalità REFRESH va **spostato in cima** insieme alla sua `date` aggiornata.
- `date` è puramente decorativa: se metti un articolo nuovo in fondo, resta in fondo anche con la data di oggi.

## Le liste dei filtri

In **cima** al file, marcati `as const` (è ciò che permette di derivare gli union types `NewsTag` / `NewsCountry`):

```ts
export const newsTags = ["All", "Admissions", "Grants", "Housing", "Scholarships", "Updates", "Trends", "Tuition"] as const;

export const newsCountries = [
  { code: "all", name: "All", flag: "🌍" },
  { code: "Netherlands", name: "Netherlands", flag: "🇳🇱" },
  // ...
] as const;
```

Paesi già presenti: Netherlands, Germany, France, Spain, Portugal, Italy, Denmark, Sweden.

Per un paese nuovo, aggiungi **prima** una riga a `newsCountries` con `code` e `name` uguali al `country` dell'articolo, e la stessa emoji usata nel campo `flag`; solo dopo potrai usare quel `country` in un articolo (altrimenti `tsc` fallisce). Le voci `"all"` e `"All"` restano sempre in testa alle rispettive liste. **Non rimuovere `as const`**: senza, gli union types tornano a essere `string` e sparisce il controllo a compile-time.

## Esempio di record completo

```ts
{
  id: "14",
  title: "Netherlands: statutory tuition fee rises to €2,730 for 2026-2027",
  summary: "The Dutch government has set the statutory tuition fee at €2,730 per year for 2026-2027, up from €2,694. The rate applies to EU/EEA students enrolling in a first bachelor's degree who do not already hold an equivalent Dutch qualification. First-year students still pay half the amount under the halvering collegegeld scheme.",
  date: "12 August 2026",
  country: "Netherlands",
  flag: "🇳🇱",
  tag: "Tuition",
  link: "https://www.duo.nl/particulier/collegegeld/",
  image: "https://images.unsplash.com/photo-1562774053-701939374585?w=900&auto=format&fit=crop&q=80",
},
```

(`university` omesso perché la notizia è nazionale.)

## Checklist prima di chiudere

- [ ] Il nuovo articolo è in cima all'array
- [ ] `id` = max esistente + 1, e nessun id preesistente è cambiato
- [ ] `tag` compare in `newsTags` e non è `"All"`
- [ ] `country` compare come `code` in `newsCountries`, e `flag` coincide
- [ ] `date` nel formato `D Month YYYY` (in ADD = oggi; in REFRESH la `date` **non cambia**)
- [ ] Se è un REFRESH: `updated` impostato (stesso formato di `date`), `date` lasciata invariata
- [ ] `image` è un URL Unsplash esistente, con i parametri query standard
- [ ] `summary` in inglese, 40-70 parole, con numeri e scadenze
- [ ] `link` compilato
- [ ] File sintatticamente valido e `npx tsc --noEmit` passa (gli union types bloccano `tag`/`country` non validi)
- [ ] Voce aggiunta a `news-log.md`
- [ ] **Nessun seed lanciato** — le news non passano da Supabase
