import { createClient } from "@supabase/supabase-js";
import { universities } from "./app/data/universities";
import ws from "ws";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

// Elimina dalla tabella le righe figlie di `parentId` il cui id non è in
// `keepIds`. Legge prima gli id esistenti e cancella solo la differenza, così
// il log dice esattamente cosa è stato tolto.
async function pruneStale(
  table: "courses" | "bachelors",
  parentColumn: "bachelor_id" | "university_id",
  parentId: string,
  keepIds: string[]
) {
  const { data, error } = await supabase.from(table).select("id").eq(parentColumn, parentId);
  if (error) {
    console.error(`  Errore lettura ${table} di ${parentId}:`, error.message);
    return;
  }
  const keep = new Set(keepIds);
  const stale = (data ?? []).map((r) => r.id as string).filter((id) => !keep.has(id));
  if (stale.length === 0) return;

  const { error: deleteError } = await supabase.from(table).delete().in("id", stale);
  if (deleteError) {
    console.error(`  Errore pulizia ${table} di ${parentId}:`, deleteError.message);
    return;
  }
  console.log(`  ✗ ${stale.length} ${table} non più nel file rimossi da ${parentId}`);
}

async function seed() {
  console.log("Inizio importazione...\n");

  for (const uni of universities) {
    // 1. Inserisce l'università
    const { error: uniError } = await supabase.from("universities").upsert({
      id: uni.id,
      name: uni.name,
      city: uni.city,
      country: uni.country,
      flag: uni.flag,
      tuition: uni.tuition,
      living_cost: uni.livingCost,
      teaching: uni.teaching,
      languages: uni.languages.join(", "),
      strengths: uni.strengths.join(", "),
      description: uni.description,
      city_vibe: uni.cityVibe ?? null,
      website: uni.website,
      ranking: uni.ranking ?? null,
    });

    if (uniError) {
      console.error(`Errore università ${uni.name}:`, uniError.message);
      continue;
    }

    console.log(`✓ ${uni.name}`);

    // 2. Inserisce i corsi di laurea collegati
    for (const bachelor of uni.bachelors) {
      const bachelorRowId = `${uni.id}__${bachelor.id}`;
      const { error: bachError } = await supabase.from("bachelors").upsert({
        id: bachelorRowId,
        university_id: uni.id,
        name: bachelor.name,
        duration: bachelor.duration,
        language: bachelor.language,
        description: bachelor.description,
      });

      if (bachError) {
        console.error(`  Errore bachelor ${bachelor.name}:`, bachError.message);
        continue;
      }

      console.log(`  ↳ ${bachelor.name}`);

      // 3. Inserisce il curriculum del corso di laurea
      for (const [i, course] of bachelor.courses.entries()) {
        const { error: courseError } = await supabase.from("courses").upsert({
          id: `${bachelorRowId}__c${i}`,
          bachelor_id: bachelorRowId,
          name: course.name,
          credits: course.credits ?? null,
          year: course.year ?? null,
        });

        if (courseError) {
          console.error(`    Errore corso ${course.name}:`, courseError.message);
        }
      }

      // L'upsert aggiorna e aggiunge, ma non toglie: se un bachelor passa da
      // 25 a 20 corsi, le righe __c20..__c24 resterebbero nel DB e il sito
      // (che legge da Supabase) continuerebbe a mostrarle. Il file è la fonte
      // di verità, quindi qui eliminiamo le righe che non vi compaiono più.
      await pruneStale(
        "courses",
        "bachelor_id",
        bachelorRowId,
        bachelor.courses.map((_, i) => `${bachelorRowId}__c${i}`)
      );
    }

    // Stesso principio per i bachelor rimossi o rinominati: la FK
    // courses.bachelor_id ha "on delete cascade", quindi spariscono anche i
    // loro corsi.
    await pruneStale(
      "bachelors",
      "university_id",
      uni.id,
      uni.bachelors.map((b) => `${uni.id}__${b.id}`)
    );
  }

  console.log("\nImportazione completata!");
}

seed();
