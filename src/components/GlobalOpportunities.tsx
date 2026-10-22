import { lazy, Suspense, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { featuredHubs, officialSearchUrl } from '../data/content';
import { useLang } from '../i18n';
import { locationByCode, locations } from '../lib/locations';
import { hasWebGL, useIdleReady, useInView, useIsMobile, useReducedMotion } from '../lib/hooks';
import { External, SceneBoundary, StaticEarth } from './ui';

const PresenceScene = lazy(() => import('../three/PresenceScene'));

/** The home page's "Search by Location" entry point, as an explorable globe. */
export default function GlobalOpportunities() {
  const { c, lang } = useLang();
  const ids = useId();
  const ref = useRef<HTMLElement>(null);
  // Set the scene up shortly after page load (or earlier if the visitor gets close), so its setup
  // cost is paid while they are still at the top, not while scrolling past the globe.
  const { seen: near, visible } = useInView(ref, '300px');
  const idle = useIdleReady(1500);
  const seen = near || idle;
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const [selected, setSelected] = useState<string | null>(null);
  const location = selected ? locationByCode.get(selected) : undefined;

  return (
    <section className="presence section section--dark" id="presence" ref={ref} aria-labelledby="presence-title">
      <div className="container presence__grid">
        <div className="presence__globe">
          {webgl && seen ? (
            <SceneBoundary fallback={<StaticEarth />}>
              <Suspense fallback={null}>
                <PresenceScene
                  hubs={featuredHubs}
                  selected={selected}
                  onSelect={setSelected}
                  active={visible}
                  reducedMotion={reducedMotion}
                  mobile={mobile}
                />
              </Suspense>
            </SceneBoundary>
          ) : (
            <StaticEarth />
          )}
        </div>

        <div className="presence__panel">
          <header className="section-heading" data-reveal>
            <p className="eyebrow">
              {c.presence.label} <strong>{c.presence.emphasis}</strong>
            </p>
            <h2 id="presence-title">{c.presence.question}</h2>
          </header>

          <div className="hub-list" role="group" aria-labelledby="presence-title">
            {featuredHubs.map((code) => {
              const l = locationByCode.get(code);
              if (!l) return null;
              return (
                <button
                  key={code}
                  type="button"
                  className="hub-chip"
                  aria-pressed={selected === code}
                  onClick={() => setSelected(code)}
                >
                  {l.name}
                </button>
              );
            })}
          </div>

          <div className="presence__select">
            <label htmlFor={`${ids}-all`}>{c.jobs.dutyStation}</label>
            <select id={`${ids}-all`} value={selected ?? ''} onChange={(e) => setSelected(e.target.value || null)}>
              <option value="" />
              {locations.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                  {l.country && l.country !== l.name ? `, ${l.country}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="location-card" aria-live="polite" hidden={!location}>
            {location && (
              <>
                <p className="location-card__kicker">
                  <MapPin aria-hidden="true" size={15} /> {location.country}
                </p>
                <h3>{location.name}</h3>
                <External className="btn btn--primary btn--sm" href={officialSearchUrl({ ds: [location.code] }, lang)}>
                  {c.ui.searchJobs}
                </External>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
