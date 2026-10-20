import { useLang } from '../i18n';
import { External } from './ui';

/** The home page's "Search by Location" and "Search by Expertise" panels, told over the globe. */
export default function MissionStory({ chapter }: { chapter: number }) {
  const { c } = useLang();
  const searchBy = c.searchBy;
  return (
    <section className="story" id="story">
      <nav className="story__rail" aria-label={searchBy[0].label}>
        <ol>
          {searchBy.map((c, i) => (
            <li key={c.id}>
              <a href={`#chapter-${c.id}`} aria-current={chapter === i ? 'step' : undefined}>
                <span className="story__rail-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="story__rail-label">{c.emphasis}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {searchBy.map((c) => {
        const content = (
          <>
            <span className="chapter__label">
              {c.label} <strong>{c.emphasis}</strong>
            </span>
            <span className="chapter__question">{c.question}</span>
          </>
        );
        return (
          <article className="chapter" id={`chapter-${c.id}`} key={c.id} data-chapter aria-labelledby={`chapter-${c.id}-title`}>
            <div className="chapter__card" data-reveal>
              <figure className="chapter__media">
                <img src={c.image} alt={c.alt} loading="lazy" decoding="async" />
                <figcaption>
                  {c.caption.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </figcaption>
              </figure>
              <h3 id={`chapter-${c.id}-title`} className="chapter__body">
                {c.href.startsWith('#') ? (
                  <a className="chapter__link" href={c.href}>
                    {content}
                  </a>
                ) : (
                  <External className="chapter__link" href={c.href}>
                    {content}
                  </External>
                )}
              </h3>
            </div>
          </article>
        );
      })}
    </section>
  );
}
