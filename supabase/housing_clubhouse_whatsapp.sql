-- Migration: WhatsApp contact on partner listings
-- ---------------------------------------------------------------------------
-- Club House listings are handled by a city-specific WhatsApp number (Madrid,
-- Paris, Berlin). The number travels with the row so the UI can open
-- wa.me/<number> without hard-coding a city -> number table in the frontend.
--
-- This is the ONLY schema change needed by scripts/clubhouse/import.ts on top
-- of supabase/housing_partner_listings.sql (source, source_url, source_id,
-- image, address, bathrooms, size_sqm, available_to), which must already be
-- applied. The display label ("via Club House") is derived from the existing
-- `platform` column, so no source_label column is added.
--
-- Nullable: user-posted rows and partners without a number keep it null.
-- Format: E.164 (+ and 8-15 digits), e.g. +34654870491.
-- Idempotent: safe to re-run. Does NOT touch data.
-- Run once in the Supabase SQL Editor.

alter table housing_listings
  add column if not exists contact_whatsapp text
  check (contact_whatsapp is null or contact_whatsapp ~ '^\+[1-9][0-9]{7,14}$');
