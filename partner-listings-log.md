# Partner listings data log

## 2026-08-10 15:35 — SEED (source: demo)

Run: `npx tsx seed-listings.ts` → **housing_listings**. 8 nuovi, 0 aggiornati, 8 totali nel file sorgente.

### Aggiunti
- **demo-001** — Estudio Malasaña — bright top floor (Madrid) · €980/mo · 32 m² · source: demo
- **demo-002** — Room in shared flat — Chamberí (Madrid) · €650/mo · 16 m² · source: demo
- **demo-003** — Petit studio in Le Marais (Paris) · €1250/mo · 24 m² · source: demo
- **demo-004** — Studio near the Latin Quarter (Paris) · €1100/mo · 21 m² · source: demo
- **demo-005** — Altbau room in Kreuzberg WG (Berlin) · €620/mo · 19 m² · source: demo
- **demo-006** — Sunny loft — Prenzlauer Berg (Berlin) · €890/mo · 44 m² · source: demo
- **demo-007** — Camden Lock studio (London) · €1450/mo · 26 m² · source: demo
- **demo-008** — Room in Shoreditch warehouse conversion (London) · €1150/mo · 20 m² · source: demo

Traccia ogni run del pipeline annunci partner (`seed-listings.ts` → tabella
`housing_listings`). Stile mutuato da `university-data-log.md`. Le voci più
recenti stanno in alto; lo script di seed antepone automaticamente una sezione
datata a ogni esecuzione.

## 2026-08-10 — SETUP (infrastruttura, dati DEMO, nessun seed ancora)

Costruita l'infrastruttura per gli annunci partner su 4UNI, popolata con dati
**completamente fittizi** in attesa dell'autorizzazione scritta e del feed
ufficiale di ClubHouse. **Nessuna richiesta effettuata verso clubhouse-student.eu
o il loro Supabase; nessun dato reale (testi/foto/prezzi/indirizzi) importato.**

### Creato
- **supabase/housing_partner_listings.sql** — migration `ALTER TABLE housing_listings`:
  aggiunge `source, source_url, source_id, image (text[]), address, bathrooms,
  size_sqm, available_to` + indice unico `(source, source_id)` per upsert
  idempotenti. **Non ancora applicata** (DB in produzione — in attesa di conferma).
- **app/data/clubhouse-listings.ts** — fonte di verità TS (tipo `PartnerListing`)
  con **8 annunci demo** inventati: Madrid ×2, Paris ×2, Berlin ×2, London ×2.
  Prezzi/m²/stanze/bagni realistici, descrizioni originali, foto Unsplash
  royalty-free. `source: "demo"`, `sourceUrl: null`, `sourceId: "demo-00x"`.
- **seed-listings.ts** — script service-role (upsert, `created_by = null`),
  identico per demo e feed reale; logga qui ogni run.

### Modificato
- **app/data/housing-cities.ts** — aggiunte coordinate di **London**; esteso
  `ApartmentPin` con `image/address/bathrooms/sizeSqm`.
- **utils/housing.ts** — `fetchApartmentPins`/`listingToPin` mappano le nuove
  colonne (così il feed reale, quando arriverà, comparirà completo).
- **app/components/PinDetailPanel.tsx** — foto hero + indirizzo + badge bagni/m².
- **app/housing/page.tsx** — London nella lista città; demo partner pin
  agganciati alla mappa (via `partnerListingsToPins()`), **da rimuovere quando
  il feed reale sarà seedato**.

### Da fare (in attesa di conferma / feed)
- Applicare la migration nel SQL Editor di Supabase.
- Lanciare `npx tsx seed-listings.ts` per popolare `housing_listings` con i demo.
- Alla firma dell'accordo: sostituire i demo con i dati reali del feed
  (`source: "clubhouse-student"`) e rimuovere l'aggancio demo dalla pagina.
