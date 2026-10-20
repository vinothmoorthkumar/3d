// Snapshots the official UN Careers search-filter options into src/data/un-filters.json.
// The full filter payload is ~800 KB per language, so we keep only what the UI needs:
// job networks and job categories (with their official English and French names) and
// duty-station locations (with coordinates).
// Run: npm run data
import { writeFile, mkdir } from 'node:fs/promises';

const SOURCE = 'https://careers.un.org/api/public/opening/jo-filter/list/v2/';

async function load(lang) {
  const res = await fetch(SOURCE + lang, { headers: { 'User-Agent': 'UNCareersConcept/1.0' } });
  if (!res.ok) throw new Error(`Filter request (${lang}) failed: ${res.status}`);
  return (await res.json()).data;
}

const [en, fr] = await Promise.all([load('en'), load('fr')]);
const active = (v) => v.isActive !== false;
const frName = (list, code) => list.find((v) => v.code === code)?.name;

const jobNetworks = en.jn.values
  .filter(active)
  .map((v) => ({ code: v.code, name: { en: v.name, fr: frName(fr.jn.values, v.code) ?? v.name } }));

const categories = en.jc.values
  .filter(active)
  .map((v) => ({ code: v.code, name: { en: v.name, fr: frName(fr.jc.values, v.code) ?? v.name } }));

const locations = en.jl.values
  .filter(active)
  .map((v) => ({
    code: v.code,
    name: v.name.trim(),
    country: (v.countryName || '').trim(),
    lat: Number(v.latitude),
    lng: Number(v.longitude),
  }))
  .filter((v) => Number.isFinite(v.lat) && Number.isFinite(v.lng) && !(v.lat === 0 && v.lng === 0))
  .sort((a, b) => a.name.localeCompare(b.name));

const out = {
  source: SOURCE + '{en,fr}',
  retrieved: new Date().toISOString(),
  note: 'Snapshot of official UN Careers search filters. Locations are duty stations listed in the search filters, not current vacancies.',
  jobNetworks,
  categories,
  locations,
};

await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/un-filters.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(`Saved ${jobNetworks.length} networks, ${categories.length} categories, ${locations.length} locations.`);
