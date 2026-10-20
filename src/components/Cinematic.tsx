import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './Hero';
import MissionStory from './MissionStory';
import { SceneBoundary, StaticEarth } from './ui';
import { getContent } from '../data/content';
import { focus, reveal, sceneState } from '../lib/sceneState';
import { hasWebGL, useInView, useIsMobile, useReducedMotion } from '../lib/hooks';

// Globe focus points and hubs are the same in every language.
const chapters = getContent('en').searchBy;

gsap.registerPlugin(ScrollTrigger);

const CinematicScene = lazy(() => import('../three/CinematicScene'));

// Composition presets: x/y are fractions of the half-viewport, distance is camera distance.
const layouts = {
  desktop: {
    hero: { x: 0.5, y: -0.08, distance: 3.5 },
    story: { x: -0.46, y: 0, distance: 4.3 },
  },
  mobile: {
    hero: { x: 0, y: -0.75, distance: 4.4 },
    story: { x: 0, y: 0.5, distance: 6.2 },
  },
};

export default function Cinematic() {
  const root = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(-1);
  const mobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const { visible } = useInView(root, '0px');
  const [webgl] = useState(hasWebGL);

  useLayoutEffect(() => {
    const layout = mobile ? layouts.mobile : layouts.desktop;
    Object.assign(sceneState, layout.hero, { lock: 0 });
    Object.assign(focus, chapters[0].focus);
    reveal.arcs = 0;

    const ctx = gsap.context(() => {
      // Hero entrance: words rise in, then the supporting copy.
      if (!reducedMotion) {
        gsap.from('[data-hero-word]', { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
        gsap.from('[data-hero-fade]', { opacity: 0, y: 18, duration: 1, ease: 'power2.out', stagger: 0.1, delay: 0.6 });
      }

      // Hero -> story: the globe slides across, recedes and locks onto the first chapter's region.
      gsap.timeline({
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: reducedMotion ? true : 0.8 },
      })
        .to(sceneState, { ...layout.story, ease: 'none' }, 0)
        .to(sceneState, { lock: 1, ease: 'power1.inOut' }, 0)
        .to('.hero__content', { opacity: 0, y: -60, ease: 'none' }, 0)
        .to('.cinematic__shade', { opacity: 0.3, ease: 'none' }, 0);

      const els = gsap.utils.toArray<HTMLElement>('[data-chapter]');
      els.forEach((el, i) => {
        const activate = () => {
          setChapter(i);
          const { lng, lat } = chapters[i].focus;
          gsap.to(focus, { lng, lat, duration: reducedMotion ? 0 : 1.6, ease: 'power2.inOut', overwrite: true });
          gsap.fromTo(reveal, { arcs: 0 }, { arcs: 1, overwrite: true, duration: reducedMotion ? 0 : 2.2, ease: 'power1.out', delay: reducedMotion ? 0 : 0.5 });
        };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onEnter: activate,
          onEnterBack: activate,
          onLeaveBack: i === 0 ? () => setChapter(-1) : undefined,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [mobile, reducedMotion]);

  // Gentle pointer parallax on devices with a fine pointer only.
  useEffect(() => {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reducedMotion]);

  return (
    <section className="cinematic" ref={root} id="top" aria-label="Introduction">
      <div className="cinematic__stage">
        {webgl ? (
          <SceneBoundary fallback={<StaticEarth className="static-earth--hero" />}>
            <Suspense fallback={null}>
              <CinematicScene chapter={chapter} active={visible} reducedMotion={reducedMotion} mobile={mobile} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <StaticEarth className="static-earth--hero" />
        )}
        <div className="cinematic__shade" />
      </div>
      <div className="cinematic__content">
        <Hero />
        <MissionStory chapter={chapter} />
      </div>
    </section>
  );
}
