# Schema dati Unimate — università, bachelor, corsi

## Fonte di verità: `app/data/universities.ts`

```typescript
type Course = {
  name: string;
  credits?: string;   // es. "6 ECTS"
  year?: 1 | 2 | 3 | 4 | 5;
};

type Bachelor = {
  id: string;          // "nudo", senza prefisso università, es. "international-business"
  name: string;
  duration: string;    // es. "3 years"
  language: string;
  description: string;
  courses: Course[];
};

type University = {
  id: string;           // slug univoco, es. "maastricht"
  name: string;
  city: string;
  country: string;
  flag: string;         // emoji bandiera
  tuition: string;       // testo libero, es. "€2,601/anno"
  livingCost: string;    // es. "€900–€1,100/mese"
  teaching: string;      // stile didattico, es. "Problem-Based Learning (PBL)"
  languages: string[];   // ARRAY nel TS (non stringa)
  strengths: string[];   // ARRAY nel TS (non stringa)
  description: string;
  cityVibe?: string;     // opzionale
  website: string;
  ranking?: string;      // opzionale, es. "Top 250 QS (#239, 2026)"
  bachelors: Bachelor[];
};
```

## Tabelle Supabase equivalenti (popolate automaticamente da `seed.ts`, NON scriverci a mano)

- `universities`: stesse colonne in snake_case (`living_cost`, `city_vibe`, ecc.), `languages`/`strengths` diventano stringhe unite da `", "`
- `bachelors`: `id` diventa `"<university_id>__<bachelor_id>"`, aggiunge `university_id` come FK
- `courses`: `id` diventa `"<bachelor_id>__c<indice>"` (indice progressivo 0,1,2...), `bachelor_id` è la FK verso il bachelor (con prefisso)

## Le due differenze da non sbagliare mai

1. `languages` e `strengths` sono **array** nel file TS, **stringhe unite da virgola** nel DB. Tu lavori sempre e solo sulla forma TS (array) — è `seed.ts` a fare il join.
2. L'`id` dei bachelor è **nudo** nel TS (`"international-business"`) e **prefissato** nel DB (`"maastricht__international-business"`). Tu scrivi sempre la forma nuda.

## Esempio di record completo (forma TS, quella da scrivere)

```typescript
{
  id: "maastricht",
  name: "Maastricht University",
  city: "Maastricht",
  country: "Netherlands",
  flag: "🇳🇱",
  tuition: "€2,601/anno",
  livingCost: "€900–€1,100/mese",
  teaching: "Problem-Based Learning (PBL)",
  languages: ["English", "Dutch"],
  strengths: ["Business & Economics", "Law", "Health Sciences", "Psychology"],
  description: "Known for its PBL system: no lectures, small groups on real-world cases...",
  website: "https://www.maastrichtuniversity.nl",
  ranking: "Top 250 QS (#239, 2026)",
  bachelors: [
    {
      id: "international-business",
      name: "International Business",
      duration: "3 years",
      language: "English",
      description: "One of the most competitive programmes in Europe. PBL method...",
      courses: [
        { name: "Management of Organisations & Marketing", credits: "6 ECTS", year: 1 },
        { name: "Quantitative Methods 1", credits: "6 ECTS", year: 1 },
      ],
    },
  ],
}
```

## Note pratiche per la ricerca

- Le pagine "programme fees" o "tuition fees" ufficiali sono la fonte migliore per `tuition`; se l'ateneo distingue tra fee UE/EEA e non-UE, usa la fee UE/EEA (Unimate si rivolge principalmente a studenti internazionali europei) e nota l'altra cifra nel log se rilevante.
- `livingCost` raramente è pubblicato dall'università stessa: cerca stime da portali ufficiali del paese (Nuffic/Studyinholland per NL, DAAD per DE, ecc.) o dagli uffici housing/international office dell'ateneo.
- Per i corsi, le pagine "curriculum" o "course structure" del primo anno di un bachelor sono generalmente pubbliche e sufficienti — non serve scaricare l'intero piano di studi di tutti gli anni.
