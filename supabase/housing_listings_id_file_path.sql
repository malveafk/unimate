-- Riparazione: il blocco finale di supabase/housing.sql ("ID verification for
-- apartment listings") risultava applicato solo a metà sul DB di produzione —
-- `verified` era presente, `id_file_path` no. Senza questa colonna ogni insert
-- da saveApartmentListing() (utils/housing.ts) falliva con 42703, perché il
-- payload nomina sempre id_file_path: il form /housing/post-listing era quindi
-- inutilizzabile per gli utenti reali, mentre il seed partner (service role,
-- payload diverso) continuava a funzionare — ecco perché non era emerso.
--
-- Applicata in produzione il 2026-08-24.
-- Idempotente: safe da rilanciare.

alter table housing_listings add column if not exists id_file_path text;

-- Ri-asserisce anche la colonna gemella dello stesso blocco, per allineare
-- eventuali altri ambienti dove sia mancata l'altra metà.
alter table housing_listings add column if not exists verified boolean not null default false;
