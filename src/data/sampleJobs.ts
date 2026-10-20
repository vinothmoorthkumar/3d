// Sample job openings for demo mode (VITE_JOBS_MODE=demo). These are NOT real vacancies:
// every reference starts with "SAMPLE-", cards are labelled as sample data, and none link to an
// application. Duty stations, job networks and categories reuse the official filter values so
// the search filters behave as they do with live data. Dates are relative to today.
import filters from './un-filters.json';
import type { Job, JobFilters, Lang } from '../lib/unApi';

type Text = { en: string; fr: string };

const families: Record<string, Text> = {
  ict: { en: 'Information Systems and Technology', fr: 'Systèmes et technologies de l’information' },
  hr: { en: 'Human Resources', fr: 'Ressources humaines' },
  finance: { en: 'Finance', fr: 'Finances' },
  political: { en: 'Political Affairs', fr: 'Affaires politiques' },
  humanitarian: { en: 'Humanitarian Affairs', fr: 'Affaires humanitaires' },
  programme: { en: 'Programme Management', fr: 'Gestion des programmes' },
  info: { en: 'Public Information', fr: 'Information' },
  legal: { en: 'Legal Affairs', fr: 'Affaires juridiques' },
  logistics: { en: 'Logistics', fr: 'Logistique' },
  security: { en: 'Security', fr: 'Sécurité' },
  environment: { en: 'Environmental Affairs', fr: 'Affaires environnementales' },
  statistics: { en: 'Statistics', fr: 'Statistiques' },
  economic: { en: 'Economic Affairs', fr: 'Affaires économiques' },
  admin: { en: 'Administration', fr: 'Administration' },
  engineering: { en: 'Engineering', fr: 'Génie' },
  rights: { en: 'Human Rights Affairs', fr: 'Droits de l’homme' },
  language: { en: 'Translation and Editing', fr: 'Traduction et révision' },
};

const recruitment: Record<string, Text> = {
  position: { en: 'Position Specific Job Openings', fr: 'Avis de vacance de poste spécifique' },
  temporary: { en: 'Temporary Opportunities', fr: 'Opportunités temporaires' },
  consultant: { en: 'Consultant', fr: 'Consultant' },
  intern: { en: 'Intern', fr: 'Stagiaire' },
};

type Sample = {
  title: string;
  jc: string;
  level: string;
  jn: string;
  family: keyof typeof families;
  recruitment: keyof typeof recruitment;
  ds: string;
  department: string;
  postedDaysAgo: number;
  openDays: number;
};

const samples: Sample[] = [
  { title: 'Information Systems Officer, P3', jc: 'PD', level: 'P-3', jn: 'ITECNET', family: 'ict', recruitment: 'position', ds: 'NEWYORK', department: 'Office of Information and Communications Technology', postedDaysAgo: 0, openDays: 30 },
  { title: 'Programme Management Officer, P4', jc: 'PD', level: 'P-4', jn: 'DEVNET', family: 'programme', recruitment: 'position', ds: 'NAIROBI', department: 'United Nations Environment Programme', postedDaysAgo: 1, openDays: 30 },
  { title: 'Human Resources Assistant, G6', jc: 'GS', level: 'G-6', jn: 'MAGNET', family: 'hr', recruitment: 'position', ds: 'Geneva', department: 'United Nations Office at Geneva', postedDaysAgo: 1, openDays: 21 },
  { title: 'Political Affairs Officer, P3', jc: 'PD', level: 'P-3', jn: 'POLNET', family: 'political', recruitment: 'position', ds: 'JUBA', department: 'United Nations Mission in South Sudan', postedDaysAgo: 2, openDays: 30 },
  { title: 'Humanitarian Affairs Officer, P4', jc: 'PD', level: 'P-4', jn: 'POLNET', family: 'humanitarian', recruitment: 'temporary', ds: 'AMMAN', department: 'Office for the Coordination of Humanitarian Affairs', postedDaysAgo: 2, openDays: 14 },
  { title: 'Finance Assistant, G5', jc: 'GS', level: 'G-5', jn: 'MAGNET', family: 'finance', recruitment: 'position', ds: 'VIENNA', department: 'United Nations Office at Vienna', postedDaysAgo: 3, openDays: 21 },
  { title: 'Public Information Officer, P3', jc: 'PD', level: 'P-3', jn: 'INFONET', family: 'info', recruitment: 'position', ds: 'BANGKOK', department: 'Economic and Social Commission for Asia and the Pacific', postedDaysAgo: 3, openDays: 30 },
  { title: 'Legal Officer, P2', jc: 'PD', level: 'P-2', jn: 'LEGALNET', family: 'legal', recruitment: 'position', ds: 'THEHAGUE', department: 'International Residual Mechanism for Criminal Tribunals', postedDaysAgo: 4, openDays: 30 },
  { title: 'Logistics Officer, FS6', jc: 'FS', level: 'FS-6', jn: 'LOGNET', family: 'logistics', recruitment: 'position', ds: 'ENTEBBE', department: 'Regional Service Centre in Entebbe', postedDaysAgo: 4, openDays: 21 },
  { title: 'Security Officer, FS4', jc: 'FS', level: 'FS-4', jn: 'SAFETYNET', family: 'security', recruitment: 'position', ds: 'BAMAKO', department: 'Department of Safety and Security', postedDaysAgo: 5, openDays: 21 },
  { title: 'Environmental Affairs Officer, P3', jc: 'PD', level: 'P-3', jn: 'SCINET', family: 'environment', recruitment: 'position', ds: 'NAIROBI', department: 'United Nations Environment Programme', postedDaysAgo: 5, openDays: 30 },
  { title: 'Statistician, P4', jc: 'PD', level: 'P-4', jn: 'DEVNET', family: 'statistics', recruitment: 'position', ds: 'SANTIAGO', department: 'Economic Commission for Latin America and the Caribbean', postedDaysAgo: 6, openDays: 30 },
  { title: 'Economic Affairs Officer, P4', jc: 'PD', level: 'P-4', jn: 'DEVNET', family: 'economic', recruitment: 'position', ds: 'ADDISABABA', department: 'Economic Commission for Africa', postedDaysAgo: 6, openDays: 30 },
  { title: 'National Programme Officer, NOB', jc: 'NPO', level: 'NO-B', jn: 'DEVNET', family: 'programme', recruitment: 'position', ds: 'DAKAR', department: 'United Nations Office for West Africa and the Sahel', postedDaysAgo: 7, openDays: 21 },
  { title: 'Administrative Assistant, G5', jc: 'GS', level: 'G-5', jn: 'MAGNET', family: 'admin', recruitment: 'temporary', ds: 'BEIRUT', department: 'Economic and Social Commission for Western Asia', postedDaysAgo: 7, openDays: 14 },
  { title: 'Data Engineer, P3', jc: 'PD', level: 'P-3', jn: 'ITECNET', family: 'ict', recruitment: 'temporary', ds: 'BRINDISI', department: 'United Nations Global Service Centre', postedDaysAgo: 8, openDays: 14 },
  { title: 'Civil Engineer, FS6', jc: 'FS', level: 'FS-6', jn: 'LOGNET', family: 'engineering', recruitment: 'position', ds: 'GOMA', department: 'United Nations Organization Stabilization Mission in the Democratic Republic of the Congo', postedDaysAgo: 8, openDays: 30 },
  { title: 'Human Rights Officer, P3', jc: 'PD', level: 'P-3', jn: 'POLNET', family: 'rights', recruitment: 'position', ds: 'Geneva', department: 'Office of the High Commissioner for Human Rights', postedDaysAgo: 9, openDays: 30 },
  { title: 'Translator (French), P3', jc: 'PD', level: 'P-3', jn: 'INFONET', family: 'language', recruitment: 'position', ds: 'NEWYORK', department: 'Department for General Assembly and Conference Management', postedDaysAgo: 9, openDays: 30 },
  { title: 'Consultant – Climate Data Analysis', jc: 'CON', level: '', jn: 'SCINET', family: 'environment', recruitment: 'consultant', ds: 'BONN', department: 'United Nations Framework Convention on Climate Change', postedDaysAgo: 2, openDays: 10 },
  { title: 'Consultant – Digital Communications', jc: 'CON', level: '', jn: 'INFONET', family: 'info', recruitment: 'consultant', ds: 'NEWYORK', department: 'Department of Global Communications', postedDaysAgo: 4, openDays: 10 },
  { title: 'Intern – Political Affairs', jc: 'INT', level: 'I-1', jn: 'POLNET', family: 'political', recruitment: 'intern', ds: 'NEWYORK', department: 'Department of Political and Peacebuilding Affairs', postedDaysAgo: 1, openDays: 30 },
  { title: 'Intern – Information Technology', jc: 'INT', level: 'I-1', jn: 'ITECNET', family: 'ict', recruitment: 'intern', ds: 'VIENNA', department: 'United Nations Office at Vienna', postedDaysAgo: 3, openDays: 30 },
  { title: 'Intern – Human Rights', jc: 'INT', level: 'I-1', jn: 'POLNET', family: 'rights', recruitment: 'intern', ds: 'Geneva', department: 'Office of the High Commissioner for Human Rights', postedDaysAgo: 5, openDays: 30 },
];

const DAY = 86_400_000;
const locationName = new Map(filters.locations.map((l) => [l.code, l.name.toUpperCase()]));
const categoryName = new Map(filters.categories.map((c) => [c.code, c.name]));
const networkName = new Map(filters.jobNetworks.map((n) => [n.code, n.name]));

function toJob(s: Sample, i: number, lang: Lang, now: number): { job: Job; search: string } {
  const posted = new Date(now - s.postedDaysAgo * DAY);
  const deadline = new Date(posted.getTime() + s.openDays * DAY);
  const network = networkName.get(s.jn)?.[lang] ?? '';
  const station = locationName.get(s.ds) ?? s.ds;
  const job: Job = {
    jobId: `SAMPLE-${String(i + 1).padStart(4, '0')}`,
    title: s.title,
    network,
    family: families[s.family][lang],
    categoryAndLevel: [categoryName.get(s.jc)?.[lang], s.level].filter(Boolean).join(' '),
    recruitmentType: recruitment[s.recruitment][lang],
    dutyStations: [station],
    department: s.department,
    startDate: posted.toISOString(),
    endDate: deadline.toISOString(),
    sample: true,
  };
  const search = [s.title, s.department, station, network, families[s.family].en, families[s.family].fr].join(' ');
  return { job, search: search.toLowerCase() };
}

/** Same contract as the live searchJobs(), filtered and paged locally. */
export async function searchSampleJobs(filters: JobFilters, page = 0, perPage = 6, lang: Lang = 'en') {
  const now = Date.now();
  const keyword = filters.keyword?.trim().toLowerCase() ?? '';
  const matches = samples
    .map((s, i) => ({ s, ...toJob(s, i, lang, now) }))
    .filter(({ search }) => !keyword || keyword.split(/\s+/).every((w) => search.includes(w)))
    .filter(({ s }) => !filters.ds?.length || filters.ds.includes(s.ds))
    .filter(({ s }) => !filters.jn?.length || filters.jn.includes(s.jn))
    .filter(({ s }) => !filters.jc?.length || filters.jc.includes(s.jc))
    .map(({ job }) => job)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return { total: matches.length, jobs: matches.slice(page * perPage, (page + 1) * perPage) };
}
