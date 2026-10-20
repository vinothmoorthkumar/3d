import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './components/Header';
import Cinematic from './components/Cinematic';
import JobSearch from './components/JobSearch';
import GlobalOpportunities from './components/GlobalOpportunities';
import ExploreCards from './components/ExploreCards';
import Spotlight from './components/Spotlight';
import Updates from './components/Updates';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import { useReducedMotion } from './lib/hooks';
import { startReveal } from './lib/reveal';
import { useLang } from './i18n';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const reducedMotion = useReducedMotion();

  const { lang } = useLang();

  // Elements marked data-reveal rise in as they enter the viewport (see lib/reveal.ts).
  useEffect(() => {
    if (reducedMotion) return;
    return startReveal();
  }, [reducedMotion]);

  // Images, fonts and language changes alter section heights; keep scroll triggers in sync.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const id = window.setTimeout(refresh, 300);
    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(id);
    };
  }, [lang]);

  return (
    <>
      <Header />
      <main id="main">
        <Cinematic />
        <JobSearch />
        <GlobalOpportunities />
        <FinalCTA />
        <Updates />
        <Spotlight />
        <ExploreCards />
      </main>
      <Footer />
    </>
  );
}
