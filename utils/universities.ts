import { supabase } from "./supabase";
import { universities as staticUniversities, type University as StaticUniversity } from "../app/data/universities";

export type Bachelor = {
  id: string;
  university_id: string;
  name: string;
  duration: string;
  language: string;
  description: string;
};

export type University = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  tuition: string;
  livingCost: string;
  teaching: string;
  languages: string[];
  strengths: string[];
  description: string;
  cityVibe: string | null;
  website: string;
  ranking: string | null;
  bachelors: Bachelor[];
};

type UniversityRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  tuition: string;
  living_cost: string;
  teaching: string;
  languages: string | null;
  strengths: string | null;
  description: string;
  city_vibe: string | null;
  website: string;
  ranking: string | null;
};

function mapRow(row: UniversityRow, bachelors: Bachelor[]): University {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    flag: row.flag,
    tuition: row.tuition,
    livingCost: row.living_cost,
    teaching: row.teaching,
    languages: row.languages ? row.languages.split(", ") : [],
    strengths: row.strengths ? row.strengths.split(", ") : [],
    description: row.description,
    cityVibe: row.city_vibe,
    website: row.website,
    ranking: row.ranking,
    bachelors,
  };
}

function mapStaticUniversity(uni: StaticUniversity): University {
  return {
    id: uni.id,
    name: uni.name,
    city: uni.city,
    country: uni.country,
    flag: uni.flag,
    tuition: uni.tuition,
    livingCost: uni.livingCost,
    teaching: uni.teaching,
    languages: uni.languages,
    strengths: uni.strengths,
    description: uni.description,
    cityVibe: uni.cityVibe ?? null,
    website: uni.website,
    ranking: uni.ranking ?? null,
    bachelors: uni.bachelors.map((b) => ({
      id: b.id,
      university_id: uni.id,
      name: b.name,
      duration: b.duration,
      language: b.language,
      description: b.description,
    })),
  };
}

// Prende tutte le università insieme ai bachelor che appartengono a ciascuna.
// Se Supabase non è raggiungibile, ripiega sui dati statici così il sito
// resta utilizzabile invece di mostrare un errore.
export async function getUniversities(): Promise<University[]> {
  try {
    const [{ data: rows, error: uniError }, { data: bachelors, error: bachError }] = await Promise.all([
      supabase.from("universities").select("*"),
      supabase.from("bachelors").select("*"),
    ]);

    if (uniError) throw uniError;
    if (bachError) throw bachError;

    return (rows ?? []).map((row) =>
      mapRow(
        row,
        (bachelors ?? [])
          .filter((b) => b.university_id === row.id)
          // seed.ts stores bachelor ids as "<university_id>__<bachelor_id>" to
          // keep them unique across universities; strip the prefix back off so
          // ids match the bare ones used in the static fallback data.
          .map((b) => ({
            ...b,
            id: b.id.startsWith(`${row.id}__`) ? b.id.slice(row.id.length + 2) : b.id,
          }))
      )
    );
  } catch (error) {
    console.warn(
      "Supabase unavailable, falling back to static data:",
      error instanceof Error ? error.message : error
    );
    return staticUniversities.map(mapStaticUniversity);
  }
}

// Prende una singola università (con i suoi bachelor) dato il suo id.
export async function getUniversity(id: string): Promise<University | null> {
  const all = await getUniversities();
  return all.find((u) => u.id === id) ?? null;
}
