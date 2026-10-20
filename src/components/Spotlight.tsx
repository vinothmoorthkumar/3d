import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../i18n';

/** "Staff in the Spotlight": the home page's carousel of #WomenInTech graphics. */
export default function Spotlight() {
  const { c } = useLang();
  const spotlight = c.spotlight.items;
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const slide = el.querySelector('li');
    el.scrollBy({ left: dir * (slide?.clientWidth ?? el.clientWidth), behavior: 'smooth' });
  };

  return (
    <section className="spotlight section section--dark" id="spotlight" aria-labelledby="spotlight-title">
      <div className="container">
        <div className="spotlight__head">
          <header className="section-heading" data-reveal>
            <h2 id="spotlight-title">{c.spotlight.heading}</h2>
          </header>
          <div className="spotlight__controls">
            <button type="button" className="round-btn" onClick={() => scroll(-1)} aria-label={c.ui.previousSlide}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="round-btn" onClick={() => scroll(1)} aria-label={c.ui.nextSlide}>
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
        <ul className="spotlight__track" ref={track} aria-roledescription="carousel">
          {spotlight.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                <img src={s.image} alt={s.alt} loading="lazy" decoding="async" width={1280} height={720} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
