-- Run this once in the Supabase SQL Editor, before running seed.ts.
-- Idempotent: safe to re-run.
--
-- Course names are stored exactly as the university writes them, in the
-- original language (e.g. "Grundlagen der Volkswirtschaftslehre"). When that
-- name is not in English, `name_en` holds a short English translation that the
-- programme page shows underneath. It stays null for English-taught courses.

alter table courses add column if not exists name_en text;
