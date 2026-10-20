import * as THREE from 'three';
import type { Location } from './locations';

export { locations, locationByCode, type Location } from './locations';

/**
 * Lat/lng to a point on a sphere, matching three.js SphereGeometry UV mapping
 * (an equirectangular texture puts lng 0 at +X and lng 90°E at -Z).
 */
export function latLngToVec3(lat: number, lng: number, radius = 1, target = new THREE.Vector3()) {
  const polar = THREE.MathUtils.degToRad(90 - lat);
  const azimuth = THREE.MathUtils.degToRad(lng);
  return target.set(
    radius * Math.sin(polar) * Math.cos(azimuth),
    radius * Math.cos(polar),
    -radius * Math.sin(polar) * Math.sin(azimuth),
  );
}

/** Spin (Y rotation) that brings a longitude to face the camera on +Z. */
export const rotationForLng = (lng: number) => -THREE.MathUtils.degToRad(lng + 90);
/** Tilt (X rotation, applied outside the spin) that brings a latitude to face the camera. */
export const tiltForLat = (lat: number) => THREE.MathUtils.degToRad(lat);

/** Great-circle arc lifted off the surface, returned as a smooth curve. */
export function arcCurve(a: Location, b: Location, radius = 1) {
  const start = latLngToVec3(a.lat, a.lng, radius);
  const end = latLngToVec3(b.lat, b.lng, radius);
  const dist = start.distanceTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius + dist * 0.2);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}
