# Prompt per Claude Code — Unimate v2 (Feature-Complete)

> Copia tutto ciò che segue (dalla riga `--- START PROMPT ---` alla fine) e incollalo nella tua sessione di Claude Code aperta nella root del progetto Unimate.

---

--- START PROMPT ---

Sei un senior full-stack engineer assegnato a un upgrade strategico del progetto **Unimate** (Next.js, TypeScript, Tailwind v4, dark/minimal). Il tuo obiettivo è portare il sito da MVP a prodotto competitivo con i top player del settore (Bachelorsportal, Niche, Study.eu, Universita.it). Devi implementare **tutte e 10** le feature elencate sotto, mantenendo intatti l'identità visiva e i pattern esistenti.

## 0 · Prima di scrivere una singola riga di codice

1. **Leggi `AGENTS.md`** nella root: il progetto usa una versione di Next.js con breaking changes rispetto al tuo training. Per ogni API che usi (routing, server actions, fetch, image, font, ecc.) consulta `node_modules/next/dist/docs/` e segui le deprecation notice.
2. Leggi questi file per capire il sistema di design e i pattern in uso:
   - `app/layout.tsx`, `app/globals.css` (design tokens: `--bg #0a0a0a`, `--accent #a78bfa`, `--text-1 #ededed`, `--surface #111`, radius, animazioni `reveal`, `wordIn`, classi `card`, `pill`, `btn-primary`, `btn-ghost`, `label`).
   - `app/page.tsx` (hero slideshow, `Counter`, `AnimatedHeadline`, news grid).
   - `app/universities/page.tsx`, `app/universities/[id]/page.tsx`, `app/universities/[id]/[bachelor]/page.tsx`.
   - `app/compare/page.tsx`.
   - `app/chat/page.tsx`, `app/api/chat/route.ts`.
   - `app/components/Navbar.tsx`.
   - `app/data/universities.ts`, `app/data/news.ts` (modelli `University`, `Bachelor`, `Course`).
3. Stila un piano scritto (`PLAN.md` nella root) con: ordine di implementazione, file toccati, schema dei dati nuovi, rischi. Non procedere finché il piano non copre tutte le 10 feature.

## 1 · Vincoli non negoziabili

- **Design system**: usa i token CSS già definiti (`--bg`, `--surface`, `--accent`, `--border`, `--text-1/2/3`, `--radius-*`). Non introdurre nuovi colori se non come accenti rari (verde `--green`, rosso/giallo per stati). Non cambiare lo sfondo nero né l'accent viola.
- **Tipografia**: rimani su `Inter` (body) + monospaziato per le `label`. Niente Comic Sans, niente serif decorativi.
- **Componenti riusabili**: ogni nuova feature deve riusare `card`, `pill`, `btn-primary`, `btn-ghost`, `.label`. Se devi creare un nuovo primitive (es. `Modal`, `BottomSheet`, `Stat`, `Rating`), mettilo in `app/components/` e usa gli stessi token.
- **Mobile-first**: ogni pagina deve funzionare bene a 375px. I filtri lunghi diventano `BottomSheet` su mobile, le CTA importanti diventano sticky.
- **Accessibilità**: `aria-label` su tutti i bottoni icon-only, contrasto AA, focus ring viola, navigazione da tastiera, `prefers-reduced-motion`.
- **TypeScript strict**: niente `any`. Estendi i tipi in `app/data/universities.ts` per i nuovi campi.
- **Server vs client**: usa Server Components di default; aggiungi `"use client"` solo dove serve interattività. Le pagine di dettaglio devono restare statiche/streaming dove possibile.
- **Niente librerie pesanti**: per UI usa quello che c'è; se ti serve un componente extra preferisci uno headless (es. `@radix-ui/react-dialog` per Modal/Sheet) e motiva la scelta nel piano.
- **Niente regressioni**: dopo ogni feature esegui `npm run build` e `npm run lint`; entrambi devono passare puliti.

## 2 · Le 10 feature da implementare (tutte obbligatorie)

### F1 · Localizzazione italiana (i18n IT/EN)
- Default: rilevamento `Accept-Language`; fallback EN; selettore in Navbar (chip "IT/EN").
- Estrai tutte le stringhe hard-coded in `app/i18n/it.ts` e `app/i18n/en.ts` (oggetti annidati per pagina).
- Mini hook `useT()` lato client e helper `t(key, locale)` server-side, oppure adotta `next-intl` se compatibile con la versione Next del progetto (verifica nei doc).
- Tutte le pagine attuali (`/`, `/universities`, `/universities/[id]`, `/compare`, `/chat`) devono essere completamente tradotte.
- La chat AI (`/api/chat`) deve ricevere `locale` e rispondere nella lingua scelta; il system prompt deve includere "rispondi in italiano" quando `locale === "it"`.
- SEO: `<html lang>` dinamico, `alternates` nei metadata.

### F2 · Search + filtri avanzati (oggi parziali)
- Estendi `app/universities/page.tsx`:
  - Filtri: paese, città, lingua di insegnamento, durata, ECTS range, fascia tasse (slider), faculty, ranking range, modalità (full-time/part-time), Erasmus partner sì/no.
  - Stato filtri **persistito nell'URL** (`?country=de&lang=en&tuition_max=5000`) — usabile come deep-link condivisibile.
  - Su mobile, filtri in `BottomSheet` apribile con bottone "Filters · N" (mostra il numero attivo).
  - Ricerca full-text su `name + city + strengths + bachelor names` con debounce 200ms.
  - Empty state dedicato con CTA "Apri la chat AI".
- Aggiungi i campi mancanti al modello `University`/`Bachelor` in `app/data/universities.ts`.

### F3 · Test di orientamento (15 domande)
- Nuova route `app/quiz/page.tsx` (client) + `app/quiz/result/[id]/page.tsx`.
- 15 domande a scelta multipla raggruppate in 3 dimensioni: interessi (matematico/umanistico/creativo/sociale), stile-di-studio (PBL vs lecture, individuale vs gruppo), vincoli pratici (budget, lingua, paese desiderato).
- Algoritmo di matching: ogni risposta dà punti a tag (`business`, `engineering`, `humanities`, `medical`, `design`, `social-sciences`) + preferenze (paese, budget). Output: top 5 atenei + top 3 facoltà compatibili, con score 0-100 per ognuno e spiegazione "Perché ti consigliamo …".
- Salva i risultati in `localStorage` (chiave `unimate.profile`) e restituiscili a chat e search per pre-filtrare.
- UI: una domanda per schermata, progress bar viola, transizioni `fadeUp`, swipe su mobile, bottone "Indietro".

### F4 · Recensioni & video-testimonial
- Nuova entità `Review` in `app/data/reviews.ts`:
  ```ts
  type Review = {
    id: string; universityId: string; bachelorId?: string;
    studentName: string; nationality: string; year: number;
    rating: { teaching: 1-5; life: 1-5; cost: 1-5; career: 1-5 };
    quote: string; videoUrl?: string; thumbnailUrl?: string;
    verified: boolean; createdAt: string;
  };
  ```
- Almeno **30 recensioni seed** distribuite sui top 10 atenei (puoi generarne di realistiche; segna `verified: false` finché non implementiamo l'auth).
- Nella pagina ateneo, sezione "Student voices" con: media voti (4 barre), griglia di card recensione (avatar circolare, paese/anno, 4 rating, quote, eventuale player video 30-60s).
- Filtro per nazionalità e per programma.
- Componente `VideoTestimonialCard` riusabile, con thumbnail + play overlay + player a piena larghezza on click (modale).

### F5 · Video / virtual tour
- Nuovo campo opzionale `university.media: { campusVideoUrl?: string; tour360Url?: string; gallery: string[] }`.
- Nella pagina ateneo, prima del contenuto: **hero media** con priorità `tour360 > campusVideo > gallery > flag`.
- Componente `VirtualTourEmbed` che, se `tour360Url` è presente, renderizza un `<iframe>` (Matterport/Kuula/YouTube 360) sandboxed con `loading="lazy"`.
- Galleria con lightbox accessibile (ESC chiude, tasti freccia navigano).
- Per gli atenei senza tour, link esterno "Tour ufficiale →" verso il sito università.

### F6 · Scholarship matching
- Nuova entità `Scholarship` in `app/data/scholarships.ts`:
  ```ts
  type Scholarship = {
    id: string; name: string; provider: string;
    amount: { type: "fixed" | "tuition" | "monthly"; value: number; currency: string };
    eligibility: { countries: string[]; minGPA?: number; maxIncome?: number;
                   languages?: string[]; faculties?: string[]; level: "bachelor"|"master" };
    deadline: string; url: string; description: string;
  };
  ```
- Almeno **40 borse seed** (DAAD, Erasmus+, Eiffel, Holland Scholarship, regionali italiane, university-funded).
- Nuova route `app/scholarships/page.tsx` con filtri (paese, importo, faculty, deadline) + match engine: prende in input `unimate.profile` (dal quiz) o un mini-form e restituisce score 0-100 per borsa con campi che matchano evidenziati in viola.
- Card scholarship: importo grande in stat-callout, deadline con badge colorato (`< 30gg` rosso, `< 90gg` giallo, altro grigio), bottone "Vai al bando →".
- Aggiungi un widget "Borse compatibili" nelle pagine ateneo (top 3 per quell'università).

### F7 · Cost calculator (true-cost)
- Nuova route `app/cost-calculator/page.tsx` (server component con form client).
- Input: ateneo, programma, paese-origine studente, ISEE/income annuale, alloggio (campus / privato / casa parenti), stile di vita (basic/standard/comfort).
- Output: tabella anno-per-anno con righe `Tasse`, `Affitto`, `Cibo`, `Trasporti`, `Materiale`, `Tempo libero`, `Totale lordo`, `Borse stimate (-)`, `Costo netto`. Grafico a barre con i 3 anni.
- Logica: calcolo deterministico basato sui dati di `university.tuition`, `university.livingCost`, e delle scholarships matchate. Documenta le assunzioni in un riquadro accanto.
- Pulsante "Salva preventivo" → genera URL condivisibile (`?config=...` base64) e bottone "Esporta PDF" (usa `react-pdf` o stampa nativa con `@media print`).

### F8 · Deadline tracker / dashboard studente
- Auth: implementa magic-link via email (Auth.js / NextAuth nuova versione, **verifica nei doc del progetto**) — niente password.
- Tabella `users` (anche solo JSON file `app/data/users.json` se non c'è DB) con `id, email, profile (dal quiz), shortlist: string[], deadlines: Deadline[]`.
- Nuova route `app/dashboard/page.tsx` (protetta) con:
  - **Shortlist**: card degli atenei salvati (cuoricino su `/universities` per aggiungere).
  - **Deadline tracker**: timeline verticale con scadenze (application open, application close, document deadline, decision date) per ogni programma in shortlist; badge "fra X giorni".
  - **Document checklist**: per ogni paese in shortlist, lista documenti necessari (passaporto, transcript, motivation letter, portfolio se design, IELTS/TOEFL, ecc.) con checkbox persistenti.
  - **Profile snapshot**: i risultati del quiz, modificabili.
- Notifiche email a 30/15/7 giorni prima di ogni deadline (cron route `/api/cron/deadlines` con secret in env).

### F9 · Comparatore esteso
- Aggiorna `app/compare/page.tsx`:
  - Da 2 a **fino a 4 atenei** in parallelo (layout responsive: 2x2 su desktop, swipe orizzontale su mobile).
  - Nuove righe di confronto: lingua di insegnamento, ranking subject, scholarship disponibili (count), deadline applicazione, Erasmus partners, % studenti internazionali, employment rate.
  - Bottone **"Esporta PDF"** della comparazione.
  - "Suggerimenti" — sotto la tabella, 3 atenei "simili" basati su faculty + paese + ranking.
  - Stato selezione persistito in URL (`?a=bocconi&b=eth&c=hec&d=insead`).

### F10 · AI advisor potenziato
- Aggiorna `app/api/chat/route.ts`:
  - System prompt include il `profile` dello studente (dal quiz) se presente.
  - Tool/function calling: `searchUniversities`, `getUniversity`, `findScholarships`, `compareUniversities` — l'LLM può chiamarle per dare risposte basate sui dati reali del sito.
  - Risposta in JSON strutturato: `{ text, citations: [{label, href}], suggestedActions: [{label, href}], universityCards: [...] }`.
  - Streaming via Server-Sent Events (verifica API attuale Next nei doc).
- Aggiorna `app/chat/page.tsx`:
  - Rendering delle citations come pill cliccabili che linkano alle pagine `/universities/[id]`.
  - Rendering di `universityCards` come mini-card embed.
  - Memoria: la chat carica `unimate.profile` da localStorage e lo manda al backend.
  - Comando rapido: `⌘K` apre la chat ovunque (`<CommandKShortcut>` componente globale).
  - Esporta conversazione in `.md` (bottone in alto a destra).

## 3 · Ordine di implementazione consigliato

1. **F1 (i18n)** — sblocca tutto il resto in italiano.
2. **F3 (quiz)** — produce il `profile` che servirà a F2/F6/F7/F10.
3. **F2 (filtri avanzati)** — consuma il profile.
4. **F4 (recensioni) + F5 (video tour)** — arricchiscono le pagine ateneo.
5. **F6 (scholarship) + F7 (cost calculator)** — payoff conversione.
6. **F9 (compare esteso)** — incrementale sull'esistente.
7. **F8 (auth + dashboard)** — richiede infra (auth, eventuale DB).
8. **F10 (AI potenziato)** — chiude il cerchio integrando tutto.

Fai un commit Git **per ogni feature**, con messaggio nel formato `feat(F3): orientation quiz with 15 questions and matching engine`.

## 4 · Definition of Done (per ogni feature)

- [ ] `npm run build` e `npm run lint` puliti.
- [ ] Pagina/feature testata a 375px, 768px, 1280px.
- [ ] Nessun nuovo `any`, nessun `// @ts-ignore`.
- [ ] Tutte le stringhe nuove sono in `app/i18n/{it,en}.ts`.
- [ ] Componenti nuovi sono in `app/components/` e tipizzati.
- [ ] Almeno uno screenshot prima/dopo nella PR-description.
- [ ] Aggiornato `README.md` con la nuova feature in 2-3 righe.

## 5 · Cosa NON fare

- Non riscrivere `globals.css` da zero, solo estendi.
- Non cambiare la palette (nero + viola).
- Non aggiungere framework di stato globale (Redux, Zustand) salvo necessità reale documentata.
- Non installare 20 dipendenze: ogni nuova lib va giustificata nel `PLAN.md`.
- Non rompere le route esistenti né cambiarne i path pubblici.
- Non committare segreti, e niente `--no-verify` su Git.

## 6 · Output atteso al termine

- 10 feature live, ciascuna con la propria pagina/sezione e il proprio commit.
- `PLAN.md` aggiornato con stato `[x]` per ogni feature.
- Nessun warning in console, nessun errore di build.
- Una breve **demo guide** in `DEMO.md` con i 10 link da aprire in ordine per vedere ogni feature in azione.

Quando hai finito, scrivi un riepilogo in chat con: feature completate, file aggiunti/modificati, lib installate, eventuali compromessi presi.

--- END PROMPT ---
