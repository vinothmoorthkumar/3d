import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Earth } from './Earth';
import { Stars } from './GlobeLayers';
import { rotationForLng } from '../lib/geo';

/** Close-up of Earth's limb for the closing call to action. */
function Horizon({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.y += Math.min(delta, 0.05) * 0.02;
  });
  return (
    <group position={[0, -1.3, 0]} rotation={[0.55, 0, 0.18]}>
      <group ref={ref} rotation={[0, rotationForLng(15), 0]}>
        <Suspense fallback={null}>
          <Earth hiRes segments={128} spin={!reducedMotion} atmosphere={1.4} />
        </Suspense>
      </group>
    </group>
  );
}

export default function HorizonScene({ active, reducedMotion, mobile }: { active: boolean; reducedMotion: boolean; mobile: boolean }) {
  return (
    <Canvas
      camera={{ fov: mobile ? 50 : 34, position: [0, 0, 1.75], near: 0.05, far: 120 }}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      // 'demand' draws the first frame (texture upload, shader compile) as soon as the scene mounts
      // off-screen, then idles; it animates only while visible.
      frameloop={active ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <Stars count={mobile ? 300 : 800} />
      <Horizon reducedMotion={reducedMotion} />
    </Canvas>
  );
}
