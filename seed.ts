import { createClient } from "@supabase/supabase-js";
import { universities } from "./app/data/universities";
import ws from "ws";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

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
    }
  }

  console.log("\nImportazione completata!");
}

seed();
