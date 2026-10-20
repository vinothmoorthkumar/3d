import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n';
import { fetchAnnouncements, fetchLatestNews, type Announcement, type NewsItem } from '../lib/unApi';
import { useInView } from '../lib/hooks';
import { DEMO_MODE } from '../lib/demo';
import { sampleAnnouncements, sampleNews } from '../data/sampleUpdates';
import { External } from './ui';

type Feed<T> = { status: 'loading' | 'ready' | 'error'; items: T[] };

function AnnouncementView({ a, badge }: { a: Announcement; badge: string }) {
  return (
    <article className={`announcement ${a.sample ? 'announcement--sample' : ''}`}>
      {a.sample && <span className="sample-badge">{badge}</span>}
      {a.blocks.map((b, i) => {
        if (b.type === 'heading') return <h3 key={i}>{b.text}</h3>;
        if (b.type === 'image') {
          const img = <img src={b.src} alt={b.alt} loading="lazy" decoding="async" />;
          return (
            <div className="announcement__image" key={i}>
              {b.href ? (
                <External href={b.href} icon={false}>
                  {img}
                </External>
              ) : (
                img
              )}
            </div>
          );
        }
        // Paragraphs made only of links ("Apply | Learn more") render as buttons.
        const linksOnly = b.parts.every((p) => 'href' in p || p.text === '|');
        return (
          <p key={i} className={linksOnly ? 'announcement__actions' : undefined}>
            {b.parts.map((p, j) =>
              'href' in p ? (
                <External key={j} href={p.href} className={linksOnly ? 'btn btn--primary btn--sm' : undefined}>
                  {p.text}
                </External>
              ) : linksOnly ? null : (
                <span key={j}>{p.text} </span>
              ),
            )}
          </p>
        );
      })}
    </article>
  );
}

/** Announcements and Latest News, loaded live from the same feeds the home page uses (or samples in demo mode). */
export default function Updates() {
  const { c, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { seen } = useInView(ref, '400px');
  const [announcements, setAnnouncements] = useState<Feed<Announcement>>({ status: 'loading', items: [] });
  const [news, setNews] = useState<Feed<NewsItem>>({ status: 'loading', items: [] });

  useEffect(() => {
    if (!seen) return;
    if (DEMO_MODE) {
      setAnnouncements({ status: 'ready', items: sampleAnnouncements(lang) });
      setNews({ status: 'ready', items: sampleNews(lang) });
      return;
    }
    const ctrl = new AbortController();
    setAnnouncements({ status: 'loading', items: [] });
    setNews({ status: 'loading', items: [] });
    fetchAnnouncements(lang, ctrl.signal)
      .then((items) => setAnnouncements({ status: 'ready', items }))
      .catch(() => !ctrl.signal.aborted && setAnnouncements({ status: 'error', items: [] }));
    fetchLatestNews(lang, ctrl.signal)
      .then((items) => setNews({ status: 'ready', items: items.slice(0, 3) }))
      .catch(() => !ctrl.signal.aborted && setNews({ status: 'error', items: [] }));
    return () => ctrl.abort();
  }, [seen, lang]);

  const hasAnnouncements = announcements.status === 'ready' && announcements.items.length > 0;
  const showAnnouncements = hasAnnouncements || (announcements.status === 'ready' && c.updates.announcementsEmpty);

  return (
    <section className="updates section section--light" id="updates" ref={ref}>
      {DEMO_MODE && (
        <div className="container">
          <p className="sample-note">{c.updates.sampleData}</p>
        </div>
      )}
      <div className={`container updates__grid ${showAnnouncements ? '' : 'updates__grid--single'}`}>
        {showAnnouncements && (
          <div className="feed feed--announcements" data-reveal>
            <h2>{c.updates.announcements}</h2>
            {hasAnnouncements ? (
              announcements.items.map((a) => <AnnouncementView a={a} badge={c.jobs.sampleBadge} key={a.id} />)
            ) : (
              <p className="feed__state">{c.updates.announcementsEmpty}</p>
            )}
          </div>
        )}

        {news.status !== 'error' && (
          <div className="feed feed--news" data-reveal>
            <h2>{c.updates.news}</h2>
            <ul>
              {news.items.map((n) => (
                <li key={n.id} className={n.sample ? 'feed__item--sample' : undefined}>
                  {n.image && <img src={n.image} alt="" width={60} height={60} />}
                  {n.link ? <External href={n.link}>{n.title}</External> : <span className="feed__title">{n.title}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
