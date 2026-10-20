import { useId, useState, type FormEvent } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useLang } from '../i18n';
import { External } from './ui';

/** Hands a keyword to the job search section (see JobSearch.tsx). */
export const SEARCH_EVENT = 'un-careers:search';

export default function Hero() {
  const { c, lang } = useLang();
  const id = useId();
  const [keyword, setKeyword] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: keyword }));
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hero" id="hero">
      <div className="hero__content container">
        {/* The home page uses the SDG colour wheel as the "O" (WORK / TRAVAILLEZ POUR). */}
        <h1 className={`hero__title hero__title--${lang}`} aria-label={c.hero.label} key={lang}>
          <span className="hero__line hero__line--0" aria-hidden="true">
            <span className="word">
              <span data-hero-word>{c.hero.before}</span>
            </span>
            <span className="word">
              <img data-hero-word className="hero__o" src="/home/hero-o.webp" alt="" width={400} height={400} />
            </span>
            <span className="word">
              <span data-hero-word>{c.hero.after}</span>
            </span>
          </span>
          <span className="hero__line hero__line--1" aria-hidden="true">
            {c.hero.line2.split(' ').map((w, i) => (
              <span key={i}>
                <span className="word">
                  <span data-hero-word>{w}</span>
                </span>{' '}
              </span>
            ))}
          </span>
        </h1>

        <form className="hero__search" role="search" onSubmit={onSubmit} data-hero-fade>
          <label className="sr-only" htmlFor={id}>
            {c.ui.searchByKeyword}
          </label>
          <Search aria-hidden="true" size={20} />
          <input
            id={id}
            type="search"
            placeholder={c.ui.placeholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            autoComplete="off"
          />
          <button className="btn btn--primary" type="submit">
            {c.ui.searchJobs}
          </button>
        </form>

        <div className="hero__actions" data-hero-fade>
          <External className="btn btn--ghost btn--lg" href={c.links.jobs}>
            {c.ui.applyNow}
          </External>
        </div>
      </div>
      <a className="scroll-cue" href="#story" data-hero-fade>
        <ChevronDown aria-hidden="true" size={28} />
        <span className="sr-only">{c.ui.scrollToMain}</span>
      </a>
    </div>
  );
}
