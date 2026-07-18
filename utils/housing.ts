// Data layer for the real housing feature (tables created by supabase/housing.sql).
// Maps DB rows to the RoommatePin/ApartmentPin shapes the map and panels
// already consume, so real and demo pins render identically.

import { createClient } from "@/utils/supabase/client";
import {
  housingCityCoords,
  type RoommatePin,
  type ApartmentPin,
} from "@/app/data/housing-cities";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Spread pins from the same city apart a little (~±500m) so they don't stack
// on the exact same spot. Deterministic per id, so pins don't jump on reload.
function jitter(id: string, axis: 0 | 1): number {
  let h = axis === 0 ? 7 : 13;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 1000) / 1000 - 0.5) * 0.012;
}

type ProfileRow = {
  id: string;
  user_id: string;
  first_name: string;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  flag: string | null;
  avatar_color: string | null;
  university: string | null;
  programme: string | null;
  study_year: number | null;
  city: string;
  lat: number | null;
  lng: number | null;
  budget_min: number | null;
  budget_max: number | null;
  move_in_month: number | null;
  move_in_year: number | null;
  bio: string | null;
  lifestyle: string[];
  languages: string[];
  looking_for: string | null;
  verified: boolean;
};

function profileToPin(row: ProfileRow): RoommatePin {
  const cityCoords = housingCityCoords[row.city];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.first_name,
    initials: (row.first_name[0] ?? "?").toUpperCase(),
    avatarColor: row.avatar_color ?? "167,139,250",
    city: row.city,
    lat: row.lat ?? (cityCoords ? cityCoords.lat + jitter(row.id, 0) : 0),
    lng: row.lng ?? (cityCoords ? cityCoords.lng + jitter(row.id, 1) : 0),
    budgetMin: row.budget_min ?? 0,
    budgetMax: row.budget_max ?? 0,
    moveIn: row.move_in_month && row.move_in_year
      ? `${MONTHS[row.move_in_month - 1]} ${row.move_in_year}`
      : "Flexible",
    university: row.university ?? "",
    flag: row.flag ?? "🌍",
    age: row.age ?? undefined,
    gender: (row.gender as RoommatePin["gender"]) ?? undefined,
    nationality: row.nationality ?? undefined,
    programme: row.programme ?? undefined,
    year: row.study_year ?? undefined,
    bio: row.bio ?? undefined,
    lifestyle: row.lifestyle ?? [],
    languages: row.languages ?? [],
    lookingFor: row.looking_for ?? undefined,
    verified: row.verified,
  };
}

type ListingRow = {
  id: string;
  title: string;
  city: string;
  lat: number | null;
  lng: number | null;
  price: number;
  rooms: number | null;
  furnished: boolean;
  available_from: string | null;
  description: string | null;
  platform: string | null;
  link: string | null;
};

function listingToPin(row: ListingRow): ApartmentPin {
  const cityCoords = housingCityCoords[row.city];
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    lat: row.lat ?? (cityCoords ? cityCoords.lat + jitter(row.id, 0) : 0),
    lng: row.lng ?? (cityCoords ? cityCoords.lng + jitter(row.id, 1) : 0),
    price: row.price,
    platform: row.platform ?? "Unimate",
    furnished: row.furnished,
    link: row.link ?? undefined,
    rooms: row.rooms ?? undefined,
    availableFrom: row.available_from
      ? new Date(row.available_from).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : undefined,
    description: row.description ?? undefined,
  };
}

// ── Reads (public — RLS shows only active rows) ──────────────────────────────

export async function fetchRoommatePins(): Promise<RoommatePin[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("housing_profiles")
    .select("id, user_id, first_name, age, gender, nationality, flag, avatar_color, university, programme, study_year, city, lat, lng, budget_min, budget_max, move_in_month, move_in_year, bio, lifestyle, languages, looking_for, verified")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProfileRow[]).map(profileToPin);
}

export async function fetchApartmentPins(): Promise<ApartmentPin[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("housing_listings")
    .select("id, title, city, lat, lng, price, rooms, furnished, available_from, description, platform, link")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ListingRow[]).map(listingToPin);
}

// Profiles of specific users (e.g. the people you're chatting with).
export async function fetchRoommatePinsByUserIds(userIds: string[]): Promise<RoommatePin[]> {
  if (userIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("housing_profiles")
    .select("id, user_id, first_name, age, gender, nationality, flag, avatar_color, university, programme, study_year, city, lat, lng, budget_min, budget_max, move_in_month, move_in_year, bio, lifestyle, languages, looking_for, verified")
    .in("user_id", userIds);
  if (error) throw error;
  return (data as ProfileRow[]).map(profileToPin);
}

// ── Profile save (Create profile form) ───────────────────────────────────────

export type ProfileFormInput = {
  firstName: string;
  age: string;
  gender: string;
  nationality: string;
  flag: string;
  avatarColor: string;
  university: string;
  programme: string;
  studyYear: string;
  city: string;
  budgetMin: string;
  budgetMax: string;
  moveInMonth: string;
  moveInYear: string;
  bio: string;
  lifestyle: string[];
  languages: string[];
  lookingFor: string;
  genderPreference: string;
  smokingOk: boolean;
  petsOk: boolean;
};

// Uploads the ID document (if provided) and upserts the caller's profile.
// Throws on failure; returns nothing the UI needs beyond success.
export async function saveRoommateProfile(form: ProfileFormInput, idFile: File | null): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not-signed-in");

  let idFilePath: string | undefined;
  if (idFile) {
    // One folder per user (enforced by the bucket's RLS policies).
    idFilePath = `${user.id}/${Date.now()}-${idFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("housing-ids")
      .upload(idFilePath, idFile, { upsert: true });
    if (uploadError) throw uploadError;
  }

  const monthIndex = MONTHS.indexOf(form.moveInMonth);
  const { error } = await supabase.from("housing_profiles").upsert(
    {
      user_id: user.id,
      first_name: form.firstName.trim(),
      age: form.age ? Number(form.age) : null,
      gender: form.gender || null,
      nationality: form.nationality || null,
      flag: form.flag || null,
      avatar_color: form.avatarColor || null,
      university: form.university || null,
      programme: form.programme || null,
      study_year: form.studyYear ? Number(form.studyYear) : null,
      city: form.city,
      budget_min: form.budgetMin ? Number(form.budgetMin) : null,
      budget_max: form.budgetMax ? Number(form.budgetMax) : null,
      move_in_month: monthIndex >= 0 ? monthIndex + 1 : null,
      move_in_year: form.moveInYear ? Number(form.moveInYear) : null,
      bio: form.bio || null,
      lifestyle: form.lifestyle,
      languages: form.languages,
      looking_for: form.lookingFor || null,
      gender_preference: form.genderPreference || null,
      smoking_ok: form.smokingOk,
      pets_ok: form.petsOk,
      ...(idFilePath ? { id_file_path: idFilePath } : {}),
      is_active: true,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}
