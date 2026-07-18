// Available housing cities with coordinates
export const housingCityCoords: Record<string, { lat: number; lng: number; country: string; flag: string }> = {
  "Amsterdam":   { lat: 52.3676, lng:  4.9041, country: "Netherlands", flag: "🇳🇱" },
  "Rotterdam":   { lat: 51.9244, lng:  4.4777, country: "Netherlands", flag: "🇳🇱" },
  "Maastricht":  { lat: 50.8514, lng:  5.6910, country: "Netherlands", flag: "🇳🇱" },
  "Delft":       { lat: 51.9999, lng:  4.3611, country: "Netherlands", flag: "🇳🇱" },
  "Groningen":   { lat: 53.2194, lng:  6.5665, country: "Netherlands", flag: "🇳🇱" },
  "Munich":      { lat: 48.1351, lng: 11.5820, country: "Germany",     flag: "🇩🇪" },
  "Berlin":      { lat: 52.5200, lng: 13.4050, country: "Germany",     flag: "🇩🇪" },
  "Barcelona":   { lat: 41.3851, lng:  2.1734, country: "Spain",       flag: "🇪🇸" },
  "Madrid":      { lat: 40.4168, lng: -3.7038, country: "Spain",       flag: "🇪🇸" },
  "Paris":       { lat: 48.8566, lng:  2.3522, country: "France",      flag: "🇫🇷" },
  "Lyon":        { lat: 45.7640, lng:  4.8357, country: "France",      flag: "🇫🇷" },
  "Milan":       { lat: 45.4642, lng:  9.1900, country: "Italy",       flag: "🇮🇹" },
  "Bologna":     { lat: 44.4949, lng: 11.3426, country: "Italy",       flag: "🇮🇹" },
  "Lisbon":      { lat: 38.7223, lng: -9.1393, country: "Portugal",    flag: "🇵🇹" },
  "Porto":       { lat: 41.1579, lng: -8.6291, country: "Portugal",    flag: "🇵🇹" },
  "Zurich":      { lat: 47.3769, lng:  8.5417, country: "Switzerland", flag: "🇨🇭" },
  "Vienna":      { lat: 48.2082, lng: 16.3738, country: "Austria",     flag: "🇦🇹" },
  "Copenhagen":  { lat: 55.6761, lng: 12.5683, country: "Denmark",     flag: "🇩🇰" },
  "Stockholm":   { lat: 59.3293, lng: 18.0686, country: "Sweden",      flag: "🇸🇪" },
  "Brussels":    { lat: 50.8503, lng:  4.3517, country: "Belgium",     flag: "🇧🇪" },
  "Leuven":      { lat: 50.8796, lng:  4.7009, country: "Belgium",     flag: "🇧🇪" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type RoommatePin = {
  id: string;
  // Set for real profiles loaded from Supabase; demo pins have no account.
  userId?: string;
  name: string;
  initials: string;
  avatarColor: string;   // RGB string, e.g. "167,139,250"
  city: string;
  lat: number;
  lng: number;
  budgetMin: number;
  budgetMax: number;
  moveIn: string;        // human-readable, e.g. "September 2025"
  university: string;
  flag: string;          // nationality flag emoji
  // Extended profile fields (for detail panel)
  age?: number;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say";
  nationality?: string;
  programme?: string;
  year?: number;
  bio?: string;
  lifestyle?: string[];
  languages?: string[];
  lookingFor?: string;
  verified?: boolean;
};

export type ApartmentPin = {
  id: string;
  title: string;
  city: string;
  lat: number;
  lng: number;
  price: number;         // €/month
  platform: string;      // e.g. "Kamernet", "WG-Gesucht"
  furnished: boolean;
  // Extended listing fields (for detail panel)
  link?: string;         // URL to original listing
  rooms?: number;
  availableFrom?: string;
  description?: string;
};

// ── Demo data (replace with Supabase rows in production) ──────────────────────

export const roommatePins: RoommatePin[] = [
  {
    id: "demo-r1",
    name: "Sofia Martínez",
    initials: "SM",
    avatarColor: "167,139,250",
    city: "Amsterdam",
    lat: 52.370,
    lng: 4.910,
    budgetMin: 700,
    budgetMax: 950,
    moveIn: "September 2025",
    university: "University of Amsterdam",
    flag: "🇪🇸",
    age: 21,
    gender: "Female",
    nationality: "Spanish",
    programme: "Economics & Business",
    year: 2,
    bio: "Hi! I'm a second-year Economics student from Madrid. I'm tidy, quiet after 22:00, and love cooking. Looking for a calm flatmate who respects shared spaces and enjoys occasional dinners together.",
    lifestyle: ["Early bird", "Non-smoker", "Vegetarian", "Gym"],
    languages: ["Spanish", "English", "French"],
    lookingFor: "Looking for a female flatmate, ideally a fellow student, in a 2–3 person flat close to public transport. Budget is flexible for the right place and the right vibe.",
    verified: true,
  },
  {
    id: "demo-r2",
    name: "Luca Bianchi",
    initials: "LB",
    avatarColor: "52,211,153",
    city: "Maastricht",
    lat: 50.848,
    lng: 5.695,
    budgetMin: 500,
    budgetMax: 750,
    moveIn: "August 2025",
    university: "Maastricht University",
    flag: "🇮🇹",
    age: 22,
    gender: "Male",
    nationality: "Italian",
    programme: "International Business",
    year: 1,
    bio: "First-year IB student from Milan. Social but respectful of quiet hours. I love football, cooking pasta, and the occasional house gathering. Looking for a good atmosphere.",
    lifestyle: ["Night owl", "Non-smoker", "Social", "Sports"],
    languages: ["Italian", "English", "Spanish"],
    lookingFor: "Open to sharing with anyone — just looking for a good vibe and no drama. Students preferred but not required.",
    verified: true,
  },
  {
    id: "demo-r3",
    name: "Amara Diallo",
    initials: "AD",
    avatarColor: "251,191,36",
    city: "Berlin",
    lat: 52.516,
    lng: 13.395,
    budgetMin: 600,
    budgetMax: 850,
    moveIn: "October 2025",
    university: "Humboldt University",
    flag: "🇫🇷",
    age: 24,
    gender: "Female",
    nationality: "French",
    programme: "Political Science",
    year: 3,
    bio: "Third-year PoliSci student doing my Erasmus in Berlin. I'm quiet, clean, and spend most of my time at the library or out exploring the city. I'm fully bilingual French/English.",
    lifestyle: ["Early bird", "Non-smoker", "Cat-friendly", "Reading"],
    languages: ["French", "English", "German (basic)"],
    lookingFor: "Looking for a calm, respectful flatmate. Gender-neutral, any nationality welcome. Prefer a quiet building.",
    verified: false,
  },
];

export const apartmentPins: ApartmentPin[] = [
  {
    id: "demo-a1",
    title: "Bright furnished studio — city centre",
    city: "Amsterdam",
    lat: 52.374,
    lng: 4.905,
    price: 1100,
    platform: "Kamernet",
    furnished: true,
    link: "https://kamernet.nl",
    rooms: 1,
    availableFrom: "1 Aug 2025",
    description: "Fully furnished studio on the 3rd floor of a canal-side building, 5 min walk from Rembrandtplein. All utilities included. Natural light, double-glazed windows, separate bathroom. Perfect for a single student or young professional.",
  },
  {
    id: "demo-a2",
    title: "Room in international WG — 3 students",
    city: "Berlin",
    lat: 52.518,
    lng: 13.410,
    price: 680,
    platform: "WG-Gesucht",
    furnished: false,
    link: "https://wg-gesucht.de",
    rooms: 1,
    availableFrom: "15 Sep 2025",
    description: "Private 14 m² room in a friendly 3-person WG in Prenzlauer Berg. Shared kitchen and bathroom. High ceilings, good internet, bike storage. Not furnished — bring your own. Current flatmates are students at HU and FU Berlin.",
  },
  {
    id: "demo-a3",
    title: "Cosy room near Maastricht University",
    city: "Maastricht",
    lat: 50.854,
    lng: 5.698,
    price: 590,
    platform: "HousingAnywhere",
    furnished: true,
    link: "https://housinganywhere.com",
    rooms: 1,
    availableFrom: "1 Sep 2025",
    description: "Furnished room in a student house, 10-minute walk from Maastricht University. Shared kitchen, living room and two bathrooms. Four other international students already in the house. Quiet neighbourhood, great for focusing.",
  },
];
