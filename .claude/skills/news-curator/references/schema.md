# Schema di `app/data/news.ts`

Documento di riferimento per la skill `news-curator`. Leggilo prima di scrivere o modificare articoli.

## Struttura del file

Il file contiene tre export, in quest'ordine:

1. `type NewsItem` — il tipo di un articolo
2. `const news: NewsItem[]` — l'array degli articoli
3. `const newsTags` e `const newsCountries` — le liste che alimentano i filtri della pagina

Tutti e tre vanno tenuti coerenti tra loro.

## Il tipo

```ts
export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  country: string;
  flag: string;
  tag: string;
  university?: string;
  link?: string;
  image: string;
};
```

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

### `country` (obbligatorio)
Nome del paese in inglese, es. `"Netherlands"`. Deve corrispondere **esattamente** a un `code` presente in `newsCountries`, perché il filtro confronta `n.country === selectedCountry`.

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

Preferisci sempre riusare un tag esistente. Introducine uno nuovo solo se nessuno dei sette descrive la notizia, e in quel caso aggiungilo anche a `newsTags`.

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

In fondo al file:

```ts
export const newsTags = ["All", "Admissions", "Grants", "Housing", "Scholarships", "Updates", "Trends", "Tuition"];

export const newsCountries = [
  { code: "all", name: "All", flag: "🌍" },
  { code: "Netherlands", name: "Netherlands", flag: "🇳🇱" },
  // ...
];
```

Paesi già presenti: Netherlands, Germany, France, Spain, Portugal, Italy, Denmark, Sweden.

Per un paese nuovo, aggiungi una riga a `newsCountries` con `code` e `name` uguali al `country` dell'articolo, e la stessa emoji usata nel campo `flag`. Le voci `"all"` e `"All"` restano sempre in testa alle rispettive liste.

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
- [ ] `date` nel formato `D Month YYYY`
- [ ] `image` è un URL Unsplash esistente, con i parametri query standard
- [ ] `summary` in inglese, 40-70 parole, con numeri e scadenze
- [ ] `link` compilato
- [ ] File sintatticamente valido (virgole, apici, oggetti chiusi)
- [ ] Voce aggiunta a `news-log.md`
- [ ] **Nessun seed lanciato** — le news non passano da Supabase
