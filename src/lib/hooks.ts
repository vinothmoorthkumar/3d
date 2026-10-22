import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

function subscribeQuery(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', cb);
    return () => mql.removeEventListener('change', cb);
  };
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeQuery(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMediaQuery('(max-width: 760px)');

/** True once the element has come within `margin` of the viewport (sticky), plus live visibility. */
export function useInView(ref: RefObject<Element | null>, margin = '200px') {
  const [state, setState] = useState({ seen: false, visible: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setState((s) => ({ seen: s.seen || entry.isIntersecting, visible: entry.isIntersecting })),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return state;
}

/**
 * Becomes true once the browser is idle, `delay` ms after mount. Used to set up heavy WebGL scenes
 * (texture upload, shader compile) early, so that cost never lands while the visitor is scrolling.
 */
export function useIdleReady(delay: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idle: number | undefined;
    const timer = window.setTimeout(() => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      else setReady(true);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
    };
  }, [delay]);
  return ready;
}

let webglSupport: boolean | undefined;
export function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
