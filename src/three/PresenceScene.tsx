import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { Earth } from './Earth';
import { DutyStationDots, PulseRing, Stars } from './GlobeLayers';
import { latLngToVec3, locationByCode, type Location } from '../lib/geo';

type Props = {
  hubs: string[];
  selected: string | null;
  onSelect: (code: string) => void;
  active: boolean;
  reducedMotion: boolean;
  mobile: boolean;
};

const DISTANCE = 4;

function HubMarker({ location, selected, onSelect }: { location: Location; selected: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => latLngToVec3(location.lat, location.lng, 1.01), [location]);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[selected ? 0.018 : 0.013, 16, 16]} />
        <meshBasicMaterial color={selected || hovered ? '#ffffff' : '#40b6e4'} />
      </mesh>
      {/* Larger invisible target makes small markers easy to hit with a finger. */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

function CameraFocus({ target, reducedMotion }: { target: Location | null; reducedMotion: boolean }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    if (!target) return;
    const ctrl = controls as unknown as OrbitControlsImpl | null;
    const end = latLngToVec3(target.lat, target.lng, DISTANCE);
    // Slerp along the sphere so the camera orbits rather than cutting through the globe.
    const startDir = camera.position.clone().normalize();
    const endDir = end.clone().normalize();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion().setFromUnitVectors(startDir, endDir);
    const q = new THREE.Quaternion();
    const radius = camera.position.length();
    const state = { t: 0 };
    const tween = gsap.to(state, {
      t: 1,
      duration: reducedMotion ? 0 : 1.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        q.slerpQuaternions(q0, q1, state.t);
        const r = THREE.MathUtils.lerp(radius, DISTANCE, state.t);
        camera.position.copy(startDir).applyQuaternion(q).multiplyScalar(r);
        camera.lookAt(0, 0, 0);
        ctrl?.update();
      },
    });
    return () => {
      tween.kill();
    };
  }, [target, camera, controls, reducedMotion]);
  return null;
}

export default function PresenceScene({ hubs, selected, onSelect, active, reducedMotion, mobile }: Props) {
  const controls = useRef<OrbitControlsImpl>(null);
  const hubLocations = useMemo(() => hubs.map((c) => locationByCode.get(c)).filter(Boolean) as Location[], [hubs]);
  const selectedLocation = selected ? locationByCode.get(selected) ?? null : null;
  const start = useMemo(() => latLngToVec3(25, 20, DISTANCE).toArray(), []);

  return (
    <Canvas
      camera={{ fov: 35, position: start, near: 0.1, far: 120 }}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      // 'demand' draws the first frame (texture upload, shader compile) as soon as the scene mounts
      // off-screen, then idles; it animates only while visible.
      frameloop={active ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: true }}
    >
      <Stars count={mobile ? 300 : 700} />
      <Suspense fallback={null}>
        {/* 2K textures: the globe is at most ~600px wide, and a 4K upload stalls the main thread while scrolling. */}
        <Earth hiRes={false} segments={mobile ? 64 : 112} spin={!reducedMotion} atmosphere={0.9} sunFollowsCamera>
          <DutyStationDots active={selected ? [selected] : []} opacity={0.6} size={mobile ? 7 : 8} />
          {hubLocations.map((l) => (
            <HubMarker key={l.code} location={l} selected={l.code === selected} onSelect={() => onSelect(l.code)} />
          ))}
          {selectedLocation && <PulseRing key={selectedLocation.code} location={selectedLocation} size={0.06} color="#ffffff" />}
        </Earth>
      </Suspense>
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        // No wheel zoom: the mouse wheel must always scroll the page, even with the cursor over the globe.
        enableZoom={false}
        minDistance={2.6}
        maxDistance={5}
        rotateSpeed={0.5}
        enableDamping
        autoRotate={!reducedMotion && !selected}
        autoRotateSpeed={0.35}
      />
      <CameraFocus target={selectedLocation} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
