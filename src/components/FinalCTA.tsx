import { lazy, Suspense, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useLang } from '../i18n';
import { hasWebGL, useIdleReady, useInView, useIsMobile, useReducedMotion } from '../lib/hooks';
import { External, SceneBoundary, StaticEarth } from './ui';

const HorizonScene = lazy(() => import('../three/HorizonScene'));

/** "Become part of a workforce of the world, for the world." with the home page's video. */
export default function FinalCTA() {
  const { c } = useLang();
  const ref = useRef<HTMLElement>(null);
  // Set up after the presence globe (see GlobalOpportunities) so the two setups never coincide.
  const { seen: near, visible } = useInView(ref, '300px');
  const idle = useIdleReady(3500);
  const seen = near || idle;
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(hasWebGL);
  const [playing, setPlaying] = useState(false);
  const { workforce } = c;

  return (
    <section className="final" ref={ref} aria-labelledby="final-title">
      <div className="final__scene" aria-hidden="true">
        {webgl && seen ? (
          <SceneBoundary fallback={<StaticEarth className="static-earth--horizon" />}>
            <Suspense fallback={null}>
              <HorizonScene active={visible} reducedMotion={reducedMotion} mobile={mobile} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <StaticEarth className="static-earth--horizon" />
        )}
      </div>
      <div className="final__content container">
        <h2 id="final-title" data-reveal>
          {workforce.title}
        </h2>
        <div className="final__video" data-reveal>
          {playing ? (
            // The 47 MB video streams from careers.un.org rather than being bundled.
            <video src={workforce.video} poster={workforce.poster} controls autoPlay playsInline />
          ) : (
            <button type="button" className="final__poster" onClick={() => setPlaying(true)} aria-label={workforce.title}>
              <img src={workforce.poster} alt="" loading="lazy" decoding="async" width={971} height={607} />
              <span className="final__play" aria-hidden="true">
                <Play size={30} fill="currentColor" />
              </span>
            </button>
          )}
        </div>
        <div className="final__actions" data-reveal>
          <External className="btn btn--primary btn--lg" href={c.links.jobs}>
            {c.ui.applyNow}
          </External>
        </div>
      </div>
    </section>
  );
}
