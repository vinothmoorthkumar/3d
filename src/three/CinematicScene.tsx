import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Earth } from './Earth';
import { DutyStationDots, HubArcs, PulseRing, Stars } from './GlobeLayers';
import { focus, reveal, sceneState } from '../lib/sceneState';
import { locationByCode, rotationForLng, tiltForLat } from '../lib/geo';
import { getContent } from '../data/content';

// Globe focus points and hubs are the same in every language.
const chapters = getContent('en').searchBy;

const FOV = 32;
const NO_HUBS: string[] = [];
const arcsProgress = {
  get current() {
    return reveal.arcs;
  },
};

function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function GlobeRig({ chapter, reducedMotion, mobile }: { chapter: number; reducedMotion: boolean; mobile: boolean }) {
  const tilt = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const spin = useRef(rotationForLng(focus.lng));
  const { camera, size } = useThree();
  const smoothed = useRef({ x: sceneState.x, y: sceneState.y, d: sceneState.distance, px: 0, py: 0 });

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = smoothed.current;
    const k = 1 - Math.exp(-delta * 4);
    s.x += (sceneState.x - s.x) * k;
    s.y += (sceneState.y - s.y) * k;
    s.d += (sceneState.distance - s.d) * k;
    const pk = 1 - Math.exp(-delta * 2.5);
    s.px += (sceneState.pointerX - s.px) * pk;
    s.py += (sceneState.pointerY - s.py) * pk;

    // Convert the composition offsets (fractions of the half-viewport) into world units.
    const halfH = s.d * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const halfW = halfH * (size.width / size.height);
    camera.position.set(-s.x * halfW + s.px * 0.12, -s.y * halfH + s.py * 0.08, s.d);
    camera.lookAt(-s.x * halfW, -s.y * halfH, 0);

    if (!spinGroup.current || !tilt.current) return;
    if (!reducedMotion) spin.current += delta * 0.045 * (1 - sceneState.lock);
    const target = rotationForLng(focus.lng);
    const diff = wrapAngle(target - spin.current);
    const lockedSpin = spin.current + diff * sceneState.lock;
    spinGroup.current.rotation.y += (lockedSpin - spinGroup.current.rotation.y) * (reducedMotion ? 1 : k * 1.5);
    const targetTilt = THREE.MathUtils.lerp(0.25, tiltForLat(focus.lat) * 0.85, sceneState.lock);
    tilt.current.rotation.x += (targetTilt - tilt.current.rotation.x) * k;
  });

  const active = chapter >= 0 ? chapters[chapter].hubs : NO_HUBS;
  const hubLocations = useMemo(() => active.map((c) => locationByCode.get(c)).filter(Boolean), [active]);

  return (
    <group ref={tilt}>
      <group ref={spinGroup}>
        <Suspense fallback={null}>
          <Earth hiRes={!mobile} segments={mobile ? 64 : 128} spin={!reducedMotion}>
            <DutyStationDots active={active} opacity={0.55 + (chapter >= 0 ? 0.25 : 0)} size={mobile ? 7 : 8} />
            {chapter >= 0 && <HubArcs key={chapter} codes={active} progress={arcsProgress} />}
            {hubLocations.map((l) => (
              <PulseRing key={`${chapter}-${l!.code}`} location={l!} />
            ))}
          </Earth>
        </Suspense>
      </group>
    </group>
  );
}

export default function CinematicScene({
  chapter,
  active,
  reducedMotion,
  mobile,
}: {
  chapter: number;
  active: boolean;
  reducedMotion: boolean;
  mobile: boolean;
}) {
  return (
    <Canvas
      camera={{ fov: FOV, position: [0, 0, 3.4], near: 0.1, far: 120 }}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Stars count={mobile ? 500 : 1100} />
      <GlobeRig chapter={chapter} reducedMotion={reducedMotion} mobile={mobile} />
    </Canvas>
  );
}
