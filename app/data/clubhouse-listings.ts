// ⚠️  PLACEHOLDER / DEMO DATA — NOT REAL LISTINGS  ⚠️
// ---------------------------------------------------------------------------
// Every entry below is 100% FICTITIOUS: invented property names, made-up
// addresses, original descriptions written from scratch, and royalty-free
// stock photos (Unsplash). NONE of this comes from ClubHouse or any other
// external site. It exists only to exercise the partner-listing UI and the
// seed pipeline while we wait for the partner's written authorisation and an
// official data feed.
//
// When the real feed arrives: replace the `clubhouseListings` array with the
// mapped partner data (source: "clubhouse-student", real source_url/source_id,
// real photos we are licensed to use) and delete the demo rows. The type and
// the seed script do NOT change — only the contents of this file do.
//
// This is the single source of truth (TS), exactly like app/data/universities.ts.
// Never write partner listings straight into Supabase by hand: edit this file,
// then run `npx tsx seed-listings.ts` to propagate to the housing_listings table.
// ---------------------------------------------------------------------------

import { housingCityCoords, type ApartmentPin } from "./housing-cities";

// Mirrors the housing_listings columns (see supabase/housing_partner_listings.sql).
// `id` doubles as `source_id`, so re-seeding updates rows in place.
export type PartnerListing = {
  id: string;              // stable id on the source; also used as source_id
  title: string;
  city: string;            // must match a key in housingCityCoords
  address: string | null;
  lat: number;
  lng: number;
  price: number;           // €/month
  rooms: number;
  bathrooms: number;
  sizeSqm: number;         // m²
  furnished: boolean;
  availableFrom: string;   // ISO date, e.g. "2026-09-01"
  availableTo: string | null; // ISO date or null (open-ended)
  description: string;
  images: string[];        // royalty-free photo URLs
  platform: string;        // display label shown in the UI ("Listed on …")
  source: "demo";          // "demo" here; "clubhouse-student" for the real feed
  sourceUrl: string | null;
  furnishedNote?: string;
};

// Generic royalty-free apartment/interior photos (Unsplash license — free to use).
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

export const clubhouseListings: PartnerListing[] = [
  // ── Madrid ────────────────────────────────────────────────────────────────
  {
    id: "demo-001",
    title: "Estudio Malasaña — bright top floor",
    city: "Madrid",
    address: "Calle Ficticia 12, Malasaña, 28004 Madrid",
    lat: 40.4258,
    lng: -3.7035,
    price: 980,
    rooms: 1,
    bathrooms: 1,
    sizeSqm: 32,
    furnished: true,
    availableFrom: "2026-09-01",
    availableTo: "2027-07-31",
    description:
      "A compact top-floor studio in the middle of Malasaña, a five-minute walk from the metro. Big south-facing window, a proper desk for study sessions, and a small kitchenette with everything a student needs. The whole building is quiet after 10pm, and there's a bakery downstairs that opens at seven.",
    images: [UNSPLASH("1502672260266-1c1ef2d93688")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  {
    id: "demo-002",
    title: "Room in shared flat — Chamberí",
    city: "Madrid",
    address: "Calle Inventada 45, Chamberí, 28010 Madrid",
    lat: 40.4360,
    lng: -3.7018,
    price: 650,
    rooms: 1,
    bathrooms: 1,
    sizeSqm: 16,
    furnished: true,
    availableFrom: "2026-09-15",
    availableTo: null,
    description:
      "Private furnished room in a friendly three-person flat in Chamberí. You'd share the kitchen and a renovated bathroom with two other international students. Good light, fast internet, and a balcony that catches the afternoon sun. Bills are split evenly and come to roughly €40 a month each.",
    images: [UNSPLASH("1522708323590-d24dbb6b0267")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  // ── Paris ─────────────────────────────────────────────────────────────────
  {
    id: "demo-003",
    title: "Petit studio in Le Marais",
    city: "Paris",
    address: "12 Rue Imaginaire, Le Marais, 75004 Paris",
    lat: 48.8590,
    lng: 2.3610,
    price: 1250,
    rooms: 1,
    bathrooms: 1,
    sizeSqm: 24,
    furnished: true,
    availableFrom: "2026-09-01",
    availableTo: "2027-06-30",
    description:
      "A characterful studio on the second floor of a classic Haussmann building in Le Marais. Exposed beams, a mezzanine bed to free up floor space, and a tiny but fully equipped kitchen. Steps from three metro lines and a covered market. Best suited to one tidy student who values location over square metres.",
    images: [UNSPLASH("1493809842364-78817add7ffb")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  {
    id: "demo-004",
    title: "Studio near the Latin Quarter",
    city: "Paris",
    address: "3 Rue Fictive, Quartier Latin, 75005 Paris",
    lat: 48.8490,
    lng: 2.3470,
    price: 1100,
    rooms: 1,
    bathrooms: 1,
    sizeSqm: 21,
    furnished: true,
    availableFrom: "2026-10-01",
    availableTo: null,
    description:
      "Quiet studio tucked into a courtyard just behind the Latin Quarter, so you get the neighbourhood without the street noise. Recently repainted, with a foldaway desk and a proper shower rather than the usual Parisian squeeze. Two universities and a dozen cheap student canteens are within walking distance.",
    images: [UNSPLASH("1484154218962-a197022b5858")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  // ── Berlin ────────────────────────────────────────────────────────────────
  {
    id: "demo-005",
    title: "Altbau room in Kreuzberg WG",
    city: "Berlin",
    address: "Erfundenstraße 7, Kreuzberg, 10997 Berlin",
    lat: 52.4990,
    lng: 13.4030,
    price: 620,
    rooms: 1,
    bathrooms: 1,
    sizeSqm: 19,
    furnished: false,
    availableFrom: "2026-09-01",
    availableTo: null,
    description:
      "Spacious unfurnished room in a high-ceilinged Altbau flat share in Kreuzberg. Two current flatmates study at TU and HU Berlin and keep things relaxed but clean. Wooden floors, a big shared kitchen made for cooking together, and bike storage in the courtyard. Bring your own furniture — IKEA delivers to the door.",
    images: [UNSPLASH("1555636222-cae831e670b3")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  {
    id: "demo-006",
    title: "Sunny loft — Prenzlauer Berg",
    city: "Berlin",
    address: "Musterallee 22, Prenzlauer Berg, 10405 Berlin",
    lat: 52.5410,
    lng: 13.4240,
    price: 890,
    rooms: 2,
    bathrooms: 1,
    sizeSqm: 44,
    furnished: true,
    availableFrom: "2026-11-01",
    availableTo: "2027-08-31",
    description:
      "A bright one-bedroom loft on the top floor with skylights over both rooms. Fully furnished, including a real desk and a sofa that actually fits two people. Prenzlauer Berg means leafy streets, weekend markets, and a tram that gets you across the city in twenty minutes. Utilities and internet are included in the price.",
    images: [UNSPLASH("1598928506311-c55ded91a20c")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  // ── London ────────────────────────────────────────────────────────────────
  {
    id: "demo-007",
    title: "Camden Lock studio",
    city: "London",
    address: "5 Pretend Mews, Camden, NW1 8AF London",
    lat: 51.5390,
    lng: -0.1426,
    price: 1450,
    rooms: 1,
    bathrooms: 1,
    sizeSqm: 26,
    furnished: true,
    availableFrom: "2026-09-01",
    availableTo: "2027-07-31",
    description:
      "Self-contained studio a stone's throw from Camden Lock, with the canal on one side and the Northern line on the other. Furnished throughout, with a compact kitchen and a surprisingly generous wardrobe. The market on your doorstep is chaos on weekends and wonderfully quiet on weekday mornings. Council tax exempt for full-time students.",
    images: [UNSPLASH("1556909114-f6e7ad7d3136")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
  {
    id: "demo-008",
    title: "Room in Shoreditch warehouse conversion",
    city: "London",
    address: "18 Fictional Yard, Shoreditch, E2 7DG London",
    lat: 51.5265,
    lng: -0.0780,
    price: 1150,
    rooms: 1,
    bathrooms: 2,
    sizeSqm: 20,
    furnished: true,
    availableFrom: "2026-10-01",
    availableTo: null,
    description:
      "Double room in a converted warehouse shared by four postgraduates in the heart of Shoreditch. Exposed brick, huge industrial windows, and two bathrooms so there's never a morning queue. The shared living space is big enough to actually host people. Overground and several bus routes are a two-minute walk away.",
    images: [UNSPLASH("1560185007-cde436f6a4d0")],
    platform: "Partner · demo",
    source: "demo",
    sourceUrl: null,
  },
];

// ── UI bridge ────────────────────────────────────────────────────────────────
// Maps the source-of-truth listings to the ApartmentPin shape the housing map
// and detail panel already consume, so the demo rows render WITHOUT writing to
// Supabase. Once the real feed is seeded into housing_listings (and served via
// fetchApartmentPins), stop importing this in app/housing/page.tsx.
export function partnerListingsToPins(): ApartmentPin[] {
  return clubhouseListings.map((l) => {
    const coords = housingCityCoords[l.city];
    return {
      id: l.id,
      title: l.title,
      city: l.city,
      lat: l.lat ?? coords?.lat ?? 0,
      lng: l.lng ?? coords?.lng ?? 0,
      price: l.price,
      platform: l.platform,
      furnished: l.furnished,
      link: l.sourceUrl ?? undefined,
      rooms: l.rooms,
      availableFrom: new Date(l.availableFrom).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      description: l.description,
      image: l.images,
      address: l.address ?? undefined,
      bathrooms: l.bathrooms,
      sizeSqm: l.sizeSqm,
    };
  });
}
