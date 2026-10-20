// Mutable state shared between GSAP ScrollTriggers (writers) and the render loop (reader).
// Kept outside React so scrolling never triggers re-renders. Each group is its own tween
// target so the scrubbed hero timeline and the chapter tweens never overwrite each other.

export const sceneState = {
  /** Globe position as a fraction of the half-viewport; x>0 pushes it right. */
  x: 0.5,
  y: 0,
  /** Camera distance from the globe centre. */
  distance: 3.5,
  /** 0 = free slow spin (hero), 1 = locked to `focus`. */
  lock: 0,
  /** Pointer parallax, -1..1. */
  pointerX: 0,
  pointerY: 0,
};

/** Region the globe turns toward when locked. */
export const focus = { lng: 20, lat: 10 };

/** 0..1 draw progress of the active chapter's arcs. */
export const reveal = { arcs: 0 };
