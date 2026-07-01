import { supabase } from "./supabase";

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

// Prende tutte le università insieme ai bachelor che appartengono a ciascuna.
export async function getUniversities(): Promise<University[]> {
  const [{ data: rows, error: uniError }, { data: bachelors, error: bachError }] = await Promise.all([
    supabase.from("universities").select("*"),
    supabase.from("bachelors").select("*"),
  ]);

  if (uniError) throw uniError;
  if (bachError) throw bachError;

  return (rows ?? []).map((row) =>
    mapRow(
      row,
      (bachelors ?? []).filter((b) => b.university_id === row.id)
    )
  );
}

// Prende una singola università (con i suoi bachelor) dato il suo id.
export async function getUniversity(id: string): Promise<University | null> {
  const all = await getUniversities();
  return all.find((u) => u.id === id) ?? null;
}
