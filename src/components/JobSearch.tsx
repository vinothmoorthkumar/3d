import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import filters from '../data/un-filters.json';
import { jobDetailUrl, officialSearchUrl, type Content } from '../data/content';
import { useLang } from '../i18n';
import { formatDate, searchJobs, type Job, type JobFilters } from '../lib/unApi';
import { searchSampleJobs } from '../data/sampleJobs';
import { SEARCH_EVENT } from './Hero';
import { External } from './ui';

const PER_PAGE = 6;

/** Demo mode lists sample jobs instead of live openings. Set VITE_JOBS_MODE=live for real data. */
const DEMO_MODE = (import.meta.env.VITE_JOBS_MODE ?? 'demo') === 'demo';

type Form = { keyword: string; location: string; network: string; category: string };
const empty: Form = { keyword: '', location: '', network: '', category: '' };

const toFilters = (f: Form): JobFilters => ({
  keyword: f.keyword,
  ds: f.location ? [f.location] : [],
  jn: f.network ? [f.network] : [],
  jc: f.category ? [f.category] : [],
});

type Status = 'idle' | 'loading' | 'ready' | 'error';

// Field labels follow the official Job Openings page in each language.
function JobCard({ job, c }: { job: Job; c: Content }) {
  const f = c.jobs.fields;
  const rows: [string, string][] = [
    [f.id, String(job.jobId)],
    [f.network, job.network],
    [f.family, job.family],
    [f.categoryAndLevel, job.categoryAndLevel],
    [f.recruitmentType, job.recruitmentType],
    [f.dutyStation, job.dutyStations.join(', ')],
    [f.department, job.department],
    [f.posted, formatDate(job.startDate)],
    [f.deadline, formatDate(job.endDate)],
  ];
  return (
    <li className={`job-card ${job.sample ? 'job-card--sample' : ''}`}>
      {job.sample && <span className="sample-badge">{c.jobs.sampleBadge}</span>}
      <h4 className="job-card__title">{job.title}</h4>
      <dl className="job-card__fields">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      {/* Sample jobs have no real job description to link to. */}
      {!job.sample && (
        <External className="link-arrow job-card__link" href={jobDetailUrl(job.jobId, c.lang)}>
          {c.jobs.viewDescription}
        </External>
      )}
    </li>
  );
}

export default function JobSearch() {
  const { c, lang } = useLang();
  const ids = useId();
  const [form, setForm] = useState<Form>(empty);
  const [applied, setApplied] = useState<Form>(empty);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [loadingMore, setLoadingMore] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  // Each language has its own listing; switching starts a fresh search.
  const langRef = useRef(lang);
  langRef.current = lang;

  const run = useCallback(async (f: Form, nextPage: number) => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    if (nextPage === 0) setStatus('loading');
    else setLoadingMore(true);
    try {
      const res = DEMO_MODE
        ? await searchSampleJobs(toFilters(f), nextPage, PER_PAGE, langRef.current)
        : await searchJobs(toFilters(f), nextPage, PER_PAGE, ctrl.signal, langRef.current);
      setJobs((prev) => (nextPage === 0 ? res.jobs : [...prev, ...res.jobs]));
      setTotal(res.total);
      setPage(nextPage);
      setStatus('ready');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setStatus('error');
    } finally {
      if (!ctrl.signal.aborted) setLoadingMore(false);
    }
  }, []);

  const apply = useCallback(
    (f: Form) => {
      setForm(f);
      setApplied(f);
      return run(f, 0);
    },
    [run],
  );

  // Show the latest openings once, when the section first approaches the viewport.
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          // Skip if a hero search already started one.
          if (abort.current === null) run(empty, 0);
          io.disconnect();
        }
      },
      { rootMargin: '600px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      abort.current?.abort();
    };
  }, [run]);

  // Keyword searches started from the hero search box.
  useEffect(() => {
    const onSearch = (e: Event) => apply({ ...empty, keyword: (e as CustomEvent<string>).detail ?? '' });
    window.addEventListener(SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(SEARCH_EVENT, onSearch);
  }, [apply]);

  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current === lang) return;
    prevLang.current = lang;
    // Refresh results only if a search has already been shown.
    if (abort.current) run(applied, 0);
    // Re-run only when the language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    apply(form).then(() => resultsHeading.current?.focus());
  };

  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const officialUrl = officialSearchUrl(toFilters(applied), lang);

  return (
    <section className="jobs section section--light" id="jobs" ref={section} aria-labelledby="jobs-title">
      <div className="container">
        <header className="section-heading" data-reveal>
          <h2 id="jobs-title">{c.jobs.heading}</h2>
        </header>

        <form className="search" role="search" aria-labelledby="jobs-title" onSubmit={onSubmit} data-reveal>
          <div className="search__field search__field--keyword">
            <label htmlFor={`${ids}-kw`}>{c.ui.searchByKeyword}</label>
            <div className="input-icon">
              <Search aria-hidden="true" size={18} />
              <input
                id={`${ids}-kw`}
                type="search"
                placeholder={c.ui.placeholder}
                value={form.keyword}
                onChange={set('keyword')}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="search__field">
            <label htmlFor={`${ids}-loc`}>{c.jobs.dutyStation}</label>
            <select id={`${ids}-loc`} value={form.location} onChange={set('location')}>
              <option value="" />
              {filters.locations.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                  {l.country && l.country !== l.name ? `, ${l.country}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="search__field">
            <label htmlFor={`${ids}-jn`}>{c.jobs.jobNetwork}</label>
            <select id={`${ids}-jn`} value={form.network} onChange={set('network')}>
              <option value="" />
              {filters.jobNetworks.map((n) => (
                <option key={n.code} value={n.code}>
                  {n.name[lang]}
                </option>
              ))}
            </select>
          </div>
          <div className="search__field">
            <label htmlFor={`${ids}-jc`}>{c.jobs.category}</label>
            <select id={`${ids}-jc`} value={form.category} onChange={set('category')}>
              <option value="" />
              {filters.categories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.name[lang]}
                </option>
              ))}
            </select>
          </div>
          <div className="search__actions">
            <button className="btn btn--primary" type="submit">
              {c.ui.searchJobs}
            </button>
            <button className="btn btn--outline" type="button" onClick={() => apply(empty)}>
              {c.jobs.clearFilters}
            </button>
          </div>
        </form>

        <div className="results" aria-busy={status === 'loading'}>
          <div className="results__bar">
            <h3 className="results__title" tabIndex={-1} ref={resultsHeading} aria-live="polite">
              {c.jobs.results}{' '}
              {status === 'ready' && total !== null && (
                <span className="results__count">{c.jobs.found(total.toLocaleString(lang))}</span>
              )}
            </h3>
            {DEMO_MODE && <p className="sample-note">{c.jobs.sampleData}</p>}
            <External className="link-arrow" href={officialUrl}>
              {c.ui.seeMore}
            </External>
          </div>

          {status === 'loading' && (
            <ul className="job-list" aria-hidden="true">
              {Array.from({ length: PER_PAGE }, (_, i) => (
                <li className="job-card job-card--skeleton" key={i}>
                  <span />
                  <span />
                  <span />
                </li>
              ))}
            </ul>
          )}

          {status === 'error' && (
            <div className="results__message">
              <External className="btn btn--primary" href={officialUrl}>
                {c.ui.seeMore}
              </External>
            </div>
          )}

          {status === 'ready' && jobs.length > 0 && (
            <>
              <ul className="job-list">
                {jobs.map((j) => (
                  <JobCard job={j} c={c} key={j.jobId} />
                ))}
              </ul>
              {total !== null && jobs.length < total && (
                <div className="results__more">
                  <button className="btn btn--outline" type="button" disabled={loadingMore} onClick={() => run(applied, page + 1)}>
                    {c.ui.seeMore}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
