import { useEffect, useState } from 'react';
import { jobDetailUrl, type Content, type ExploreCard } from '../data/content';
import { useLang } from '../i18n';
import { fetchJoinUs, formatDate, searchJobs, type Job } from '../lib/unApi';
import { Dialog, External } from './ui';

type DialogKey = NonNullable<ExploreCard['dialog']>;
type RichLine = Content['roster']['why'][number];

function Card({ card, onOpen }: { card: ExploreCard; onOpen: (d: DialogKey) => void }) {
  const inner = (
    <>
      <span className="explore-card__icon">
        <img src={card.icon} alt={card.iconAlt} loading="lazy" decoding="async" />
      </span>
      <span className="explore-card__title">{card.title}</span>
      <span className="explore-card__body">{card.body}</span>
    </>
  );
  return (
    <li data-reveal>
      {card.href ? (
        <External className="explore-card" href={card.href}>
          {inner}
        </External>
      ) : (
        <button className="explore-card" type="button" aria-haspopup="dialog" onClick={() => onOpen(card.dialog!)}>
          {inner}
        </button>
      )}
    </li>
  );
}

function Rich({ line }: { line: RichLine }) {
  if (typeof line === 'string') return <>{line}</>;
  return (
    <>
      {line.before}
      <External href={line.href}>{line.link}</External>
      {line.after}
    </>
  );
}

/**
 * Latest openings for a category, as in the home page's Consultancies/Internships dialogs.
 * Those dialogs use the English listing and English labels in both languages; so does this.
 */
function LatestList({ jc, seeMore, c }: { jc: string; seeMore: string; c: Content }) {
  const [state, setState] = useState<{ jobs: Job[]; failed: boolean } | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    searchJobs({ jc: [jc] }, 0, 10, ctrl.signal, 'en')
      .then((r) => setState({ jobs: r.jobs, failed: false }))
      .catch((e) => e.name !== 'AbortError' && setState({ jobs: [], failed: true }));
    return () => ctrl.abort();
  }, [jc]);

  const more = (
    <p className="dialog__more">
      <External className="btn btn--primary" href={seeMore}>
        {c.ui.seeMore}
      </External>
    </p>
  );
  if (!state || state.failed) return more;
  return (
    <>
      <ul className="latest-list">
        {state.jobs.map((j) => (
          <li key={j.jobId}>
            <h3>
              {j.title} <span className="latest-list__id">Job ID: {j.jobId}</span>
            </h3>
            <dl>
              {(
                [
                  ['Job Family', j.family],
                  ['Duty Station', j.dutyStations.join(', ')],
                  ['Department/Office', j.department],
                  ['Date Posted', formatDate(j.startDate)],
                  ['End Date', formatDate(j.endDate)],
                ] as const
              )
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            <External className="link-arrow" href={jobDetailUrl(j.jobId, 'en')}>
              See job description
            </External>
          </li>
        ))}
      </ul>
      {more}
    </>
  );
}

/** "Join Us!" list, loaded live; the verbatim copy in content.ts is the fallback. */
function JoinUs({ c }: { c: Content }) {
  const [live, setLive] = useState<{ lang: string; intro: string; countries: string[] } | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetchJoinUs(c.lang, ctrl.signal)
      .then((r) => setLive({ lang: c.lang, ...r }))
      .catch(() => {
        /* keep the fallback */
      });
    return () => ctrl.abort();
  }, [c.lang]);
  const data = live && live.lang === c.lang ? live : c.joinUs;
  return (
    <>
      <p>{data.intro}</p>
      <ul className="country-list">
        {data.countries.map((country) => (
          <li key={country}>{country}</li>
        ))}
      </ul>
    </>
  );
}

export default function ExploreCards() {
  const { c } = useLang();
  const [open, setOpen] = useState<DialogKey | null>(null);
  const close = () => setOpen(null);
  const { roster } = c;

  return (
    <>
      <section className="explore section section--light" id="explore" aria-labelledby="explore-title">
        <div className="container">
          <header className="section-heading" data-reveal>
            <h2 id="explore-title">{c.explore.keepExploring}</h2>
          </header>
          <ul className="explore-grid">
            {c.explore.keepCards.map((card) => (
              <Card card={card} onOpen={setOpen} key={card.title} />
            ))}
          </ul>
        </div>
      </section>

      <section className="explore section section--paper" id="opportunities" aria-labelledby="opportunities-title">
        <div className="container">
          <header className="section-heading" data-reveal>
            <h2 id="opportunities-title">{c.explore.latest}</h2>
          </header>
          <ul className="explore-grid">
            {c.explore.latestCards.map((card) => (
              <Card card={card} onOpen={setOpen} key={card.title} />
            ))}
          </ul>
        </div>
      </section>

      <Dialog open={open === 'roster'} onClose={close} title={roster.title}>
        {roster.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <h3>{roster.whyTitle}</h3>
        <ul className="dialog__list">
          {roster.why.map((line, i) => (
            <li key={i}>
              <Rich line={line} />
            </li>
          ))}
        </ul>
        <h3>{roster.howTitle}</h3>
        <ul className="dialog__list">
          {roster.how.map((line, i) => (
            <li key={i}>
              <Rich line={line} />
            </li>
          ))}
        </ul>
        <p>
          <Rich line={roster.tip} />
        </p>
      </Dialog>

      <Dialog open={open === 'joinUs'} onClose={close} title={c.joinUs.title}>
        {open === 'joinUs' && <JoinUs c={c} />}
      </Dialog>

      <Dialog open={open === 'consultancies'} onClose={close} title={c.explore.dialogTitles.consultancies}>
        {open === 'consultancies' && <LatestList jc="CON" seeMore={c.links.consultancies} c={c} />}
      </Dialog>

      <Dialog open={open === 'internships'} onClose={close} title={c.explore.dialogTitles.internships}>
        {open === 'internships' && <LatestList jc="INT" seeMore={c.links.internships} c={c} />}
      </Dialog>
    </>
  );
}
