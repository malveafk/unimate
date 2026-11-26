// Writes the site's university data, curriculum sources and cost sources to one
// JSON file that the Python checker reads: npx tsx scripts/uni-check/export.mts <out.json>
import { writeFileSync } from "fs";
import { universities } from "../../app/data/universities";
import { bachelorSources } from "../../app/data/bachelorSources";
import { costSources } from "../../app/data/costSources";

writeFileSync(process.argv[2], JSON.stringify({ universities, bachelorSources, costSources }));
