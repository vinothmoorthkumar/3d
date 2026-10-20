// Client for the public UN Careers API (the undocumented endpoints careers.un.org itself uses).
// Every value shown in the UI comes from these responses. Nothing is synthesised.
//
// The filtered job search only accepts JSON POSTs, and the API's CORS preflight omits
// access-control-allow-headers, so browsers cannot call it cross-origin. Requests therefore go
// through a same-origin proxy: /un-api -> https://careers.un.org/api (see vite.config.ts).
// Without a proxy every call fails, and the UI falls back to linking to the official search.
const API = import.meta.env.VITE_UN_API_BASE ?? '/un-api';
const SITE = 'https://careers.un.org';

export type Lang = 'en' | 'fr';

export type JobFilters = { keyword?: string; ds?: string[]; jn?: string[]; jc?: string[] };

export type Job = {
  /** Numeric for real openings; "SAMPLE-0001" style for demo data. */
  jobId: number | string;
  title: string;
  network: string;
  family: string;
  categoryAndLevel: string;
  recruitmentType: string;
  dutyStations: string[];
  department: string;
  startDate: string;
  endDate: string;
  /** True for demo-mode sample jobs (see data/sampleJobs.ts). */
  sample?: boolean;
};

type RawJob = {
  jobId: number;
  postingTitle?: string;
  jobTitle?: string;
  jobLevel?: string;
  jl?: { name?: string };
  jc?: { code?: string; name?: string };
  jn?: { name?: string };
  jf?: { Name?: string };
  recrttype?: { name?: string };
  dept?: { name?: string };
  dutyStation?: { description: string }[];
  startDate: string;
  endDate: string;
};

function cleanFilters(f: JobFilters) {
  const out: Record<string, unknown> = {};
  if (f.keyword?.trim()) out.keyword = f.keyword.trim();
  for (const k of ['ds', 'jn', 'jc'] as const) if (f[k]?.length) out[k] = f[k];
  return out;
}

const toJob = (j: RawJob): Job => ({
  jobId: j.jobId,
  title: j.postingTitle || j.jobTitle || '',
  network: j.jn?.name || '',
  family: j.jf?.Name || '',
  categoryAndLevel: [j.jc?.name, j.jl?.name || j.jobLevel].filter(Boolean).join(' '),
  recruitmentType: j.recrttype?.name || '',
  dutyStations: (j.dutyStation ?? []).map((d) => d.description),
  department: j.dept?.name || '',
  startDate: j.startDate,
  endDate: j.endDate,
});

async function fetchPage(filters: JobFilters, page: number, perPage: number, lang: Lang, signal?: AbortSignal) {
  // Each language has its own listing (the French one returns French field values).
  const res = await fetch(`${API}/public/opening/jo/list/filteredV2/${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filterConfig: cleanFilters(filters),
      pagination: { page, itemPerPage: perPage, sortBy: 'startDate', sortDirection: -1 },
    }),
    signal,
  });
  if (!res.ok) throw new Error(`UN Careers API responded ${res.status}`);
  const json = await res.json();
  if (json.status !== 1) throw new Error(json.message || 'Unexpected API response');
  return { list: (json.data?.list ?? []) as RawJob[], count: Number(json.data?.count ?? 0) };
}

export async function searchJobs(
  filters: JobFilters,
  page = 0,
  perPage = 6,
  signal?: AbortSignal,
  lang: Lang = 'en',
) {
  // The API ignores the keyword whenever a category (jc) is set. In that case fetch the keyword
  // matches without the category and filter by category here, so results honour both.
  if (filters.keyword?.trim() && filters.jc?.length) {
    const { jc, ...rest } = filters;
    const all = await fetchPage(rest, 0, 1000, lang, signal);
    const matches = all.list.filter((j) => jc.includes(j.jc?.code ?? ''));
    return { total: matches.length, jobs: matches.slice(page * perPage, (page + 1) * perPage).map(toJob) };
  }
  const { list, count } = await fetchPage(filters, page, perPage, lang, signal);
  return { total: count, jobs: list.map(toJob) };
}

/** Parsed announcement content. Rendered as React elements, never as raw HTML. */
export type AnnouncementBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; parts: ({ text: string } | { text: string; href: string })[] }
  | { type: 'image'; src: string; alt: string; href?: string };

const safeUrl = (raw: string | null) => {
  if (!raw) return undefined;
  try {
    const url = new URL(raw, SITE);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

function parseAnnouncement(html: string): AnnouncementBlock[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks: AnnouncementBlock[] = [];
  doc.body.querySelectorAll('p').forEach((p) => {
    const img = p.querySelector('img');
    if (img) {
      const src = safeUrl(img.getAttribute('src'));
      const a = img.closest('a');
      if (src) blocks.push({ type: 'image', src, alt: clean(a?.getAttribute('aria-label') || img.alt), href: safeUrl(a?.getAttribute('href') ?? null) });
      return;
    }
    const text = clean(p.textContent);
    if (!text) return;
    // A paragraph that is entirely bold is the announcement's headline.
    if (p.querySelector('b, strong') && clean(p.querySelector('b, strong')!.textContent) === text && !p.querySelector('a')) {
      blocks.push({ type: 'heading', text });
      return;
    }
    const parts: ({ text: string } | { text: string; href: string })[] = [];
    p.childNodes.forEach((node) => {
      const t = clean(node.textContent);
      if (!t) return;
      const href = node instanceof HTMLAnchorElement ? safeUrl(node.getAttribute('href')) : undefined;
      parts.push(href ? { text: t, href } : { text: t });
    });
    blocks.push({ type: 'text', parts });
  });
  return blocks;
}

export type Announcement = { id: string; blocks: AnnouncementBlock[] };

export async function fetchAnnouncements(lang: Lang, signal?: AbortSignal): Promise<Announcement[]> {
  const res = await fetch(`${API}/site/announcement/${lang}`, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const json = await res.json();
  const list: { _id: string; announcement?: string; status?: boolean }[] = json.data?.result ?? [];
  return list
    .filter((a) => a.status !== false && a.announcement)
    .map((a) => ({ id: a._id, blocks: parseAnnouncement(a.announcement!) }))
    .filter((a) => a.blocks.length > 0);
}

export type NewsItem = { title: string; link: string; image?: string };

export async function fetchLatestNews(lang: Lang, signal?: AbortSignal): Promise<NewsItem[]> {
  const res = await fetch(`${API}/site/latestNews?language=${lang}`, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const json = await res.json();
  const list: { title: string; link: string; imagePath?: string }[] = json.data?.result ?? [];
  return list
    .filter((n) => n.title && /^https:\/\/(news\.)?un\.org\//.test(n.link))
    .map((n) => ({
      title: n.title,
      link: n.link,
      // Thumbnails arrive as inline base64 JPEGs; accept nothing else.
      image: n.imagePath?.startsWith('data:image/') ? n.imagePath : undefined,
    }));
}

/** The "Join Us!" dialog content, from the same endpoint careers.un.org uses. */
export async function fetchJoinUs(lang: Lang, signal?: AbortSignal) {
  const res = await fetch(`${API}/admin/join-us/${lang.toUpperCase()}`, { signal });
  if (!res.ok) throw new Error(String(res.status));
  const json = await res.json();
  const html: string | undefined = json.data?.result?.[0]?.template;
  if (!html) throw new Error('No content');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const intro = clean(doc.querySelector('p')?.textContent);
  const countries: string[] = [];
  // Countries are <br>-separated text nodes; commented-out entries are skipped automatically.
  doc.body.querySelectorAll('div').forEach((div) =>
    div.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && clean(n.textContent)) countries.push(clean(n.textContent));
    }),
  );
  if (!intro || countries.length === 0) throw new Error('Unexpected content');
  return { intro, countries };
}

/** Dates as the official site shows them ("Nov 2, 2026"). Deadlines are 23:59:59 New York time. */
export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
}
