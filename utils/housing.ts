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
  photo_path: string | null;
  verified?: boolean;
  // Partner-listing columns (may not be migrated yet — see the 42703 fallback).
  image: string[] | null;
  address: string | null;
  bathrooms: number | null;
  size_sqm: number | null;
};

function listingToPin(row: ListingRow): ApartmentPin {
  const cityCoords = housingCityCoords[row.city];
  const supabase = createClient();
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    lat: row.lat ?? (cityCoords ? cityCoords.lat + jitter(row.id, 0) : 0),
    lng: row.lng ?? (cityCoords ? cityCoords.lng + jitter(row.id, 1) : 0),
    price: row.price,
    platform: row.platform ?? "4UNI",
    furnished: row.furnished,
    link: row.link ?? undefined,
    rooms: row.rooms ?? undefined,
    availableFrom: row.available_from
      ? new Date(row.available_from).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : undefined,
    description: row.description ?? undefined,
    photo: row.photo_path
      ? supabase.storage.from("housing-photos").getPublicUrl(row.photo_path).data.publicUrl
      : undefined,
    verified: row.verified ?? false,
    image: row.image ?? undefined,
    address: row.address ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    sizeSqm: row.size_sqm ?? undefined,
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

// Only the core columns are guaranteed on every deployed DB (original
// supabase/housing.sql schema). Two independent later migrations add optionals:
//   - photo_path, verified   → listing ID-verification feature (in housing.sql)
//   - image, address, …      → supabase/housing_partner_listings.sql
// Either may be unapplied on a given DB, so we try progressively narrower column
// sets and stop at the first that isn't an "undefined column" error. This way
// whichever optionals ARE migrated still load, and a deploy and its ALTER TABLEs
// can land in any order without ever breaking the live apartment feed.
const LISTING_CORE_COLS = "id, title, city, lat, lng, price, rooms, furnished, available_from, description, platform, link";
const LISTING_VERIFY_COLS = "photo_path, verified";
const LISTING_PARTNER_COLS = "image, address, bathrooms, size_sqm";

export async function fetchApartmentPins(): Promise<ApartmentPin[]> {
  const supabase = createClient();
  const attempts = [
    `${LISTING_CORE_COLS}, ${LISTING_VERIFY_COLS}, ${LISTING_PARTNER_COLS}`,
    `${LISTING_CORE_COLS}, ${LISTING_PARTNER_COLS}`,
    `${LISTING_CORE_COLS}, ${LISTING_VERIFY_COLS}`,
    LISTING_CORE_COLS,
  ];

  // 42703 = undefined_column: that column set isn't fully migrated → try the
  // next, narrower one. Any other error (or success) ends the loop.
  let result = await supabase.from("housing_listings").select(attempts[0]).order("created_at", { ascending: false });
  for (let i = 1; i < attempts.length && result.error?.code === "42703"; i++) {
    result = await supabase.from("housing_listings").select(attempts[i]).order("created_at", { ascending: false });
  }

  if (result.error) throw result.error;
  return (result.data as unknown as ListingRow[]).map(listingToPin);
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

// ── Listing save (Post an apartment form) ────────────────────────────────────

export type ListingFormInput = {
  title: string;
  city: string;
  price: string;
  rooms: string;
  furnished: boolean;
  availableFrom: string; // yyyy-mm-dd, from an <input type="date">
  description: string;
};

// If the signed-in user already uploaded an ID for their roommate profile,
// we reuse that instead of asking them to verify twice. Returns null if
// there's no signed-in user or they have no ID on file yet.
export async function getExistingIdVerification(): Promise<{ idFilePath: string; verified: boolean } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("housing_profiles")
    .select("id_file_path, verified")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data?.id_file_path) return null;

  return { idFilePath: data.id_file_path, verified: data.verified ?? false };
}

// Uploads the ID document + listing photo (if provided) and inserts the
// caller's listing. If the user already has an ID on file from a roommate
// profile, that's reused instead of requiring a fresh upload.
// Throws on failure; returns nothing the UI needs beyond success.
export async function saveApartmentListing(form: ListingFormInput, idFile: File | null, photoFile: File | null): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not-signed-in");

  let idFilePath: string | undefined;
  let verified = false;
  if (idFile) {
    // One folder per user (enforced by the bucket's RLS policies) — same
    // private bucket used for roommate-profile ID documents.
    idFilePath = `${user.id}/${Date.now()}-${idFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("housing-ids")
      .upload(idFilePath, idFile, { upsert: true });
    if (uploadError) throw uploadError;
  } else {
    const existing = await getExistingIdVerification();
    if (!existing) throw new Error("id-required");
    idFilePath = existing.idFilePath;
    verified = existing.verified;
  }

  let photoPath: string | undefined;
  if (photoFile) {
    // One folder per user (enforced by the bucket's RLS policies).
    photoPath = `${user.id}/${Date.now()}-${photoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("housing-photos")
      .upload(photoPath, photoFile, { upsert: true });
    if (uploadError) throw uploadError;
  }

  const { error } = await supabase.from("housing_listings").insert({
    created_by: user.id,
    title: form.title.trim(),
    city: form.city,
    price: Number(form.price),
    rooms: form.rooms ? Number(form.rooms) : null,
    furnished: form.furnished,
    available_from: form.availableFrom || null,
    description: form.description || null,
    id_file_path: idFilePath,
    verified,
    ...(photoPath ? { photo_path: photoPath } : {}),
    is_active: true,
  });
  if (error) throw error;
}
