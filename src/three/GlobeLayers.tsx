// Surface overlays that live inside <Earth>: duty-station dots, hub markers, arcs, stars.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { arcCurve, latLngToVec3, locationByCode, locations, type Location } from '../lib/geo';

const dotVertex = /* glsl */ `
  attribute float aSize;
  attribute float aActive;
  uniform float uPixelRatio;
  uniform float uScale;
  varying float vActive;
  varying float vFacing;
  void main() {
    vActive = aActive;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 n = normalize(mat3(modelMatrix) * normalize(position));
    vFacing = dot(n, normalize(cameraPosition - world.xyz));
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * uScale / -mv.z;
  }
`;

const dotFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uActiveColor;
  uniform float uOpacity;
  varying float vActive;
  varying float vFacing;
  void main() {
    if (vFacing < 0.05) discard;
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = smoothstep(0.5, 0.18, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    vec3 col = mix(uColor, uActiveColor, vActive);
    float alpha = (core + halo * vActive) * uOpacity * smoothstep(0.05, 0.3, vFacing);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

type DotsProps = {
  /** Codes drawn larger and brighter. */
  active?: string[];
  opacity?: number;
  size?: number;
};

/** Every duty station from the official location filter, as small dots on the surface. */
export function DutyStationDots({ active = [], opacity = 0.75, size = 9 }: DotsProps) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(locations.length * 3);
    const v = new THREE.Vector3();
    locations.forEach((l, i) => latLngToVec3(l.lat, l.lng, 1.004, v).toArray(pos, i * 3));
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(locations.length).fill(size), 1));
    g.setAttribute('aActive', new THREE.BufferAttribute(new Float32Array(locations.length), 1));
    return g;
  }, [size]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dotVertex,
        fragmentShader: dotFragment,
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uScale: { value: 1 },
          uColor: { value: new THREE.Color('#7fceec') },
          uActiveColor: { value: new THREE.Color('#ffffff') },
          uOpacity: { value: opacity },
        },
        transparent: true,
        depthWrite: false,
      }),
    [opacity],
  );

  useEffect(() => {
    const set = new Set(active);
    const sizes = geometry.getAttribute('aSize') as THREE.BufferAttribute;
    const act = geometry.getAttribute('aActive') as THREE.BufferAttribute;
    locations.forEach((l, i) => {
      const on = set.has(l.code);
      act.setX(i, on ? 1 : 0);
      sizes.setX(i, on ? size * 2.6 : size);
    });
    sizes.needsUpdate = true;
    act.needsUpdate = true;
  }, [active, geometry, size]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return <points geometry={geometry} material={material} raycast={() => null} />;
}

/** Pulsing ring on the surface at a location. */
export function PulseRing({ location, color = '#40b6e4', size = 0.028, visible = 1 }: { location: Location; color?: string; size?: number; visible?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const { position, quaternion } = useMemo(() => {
    const p = latLngToVec3(location.lat, location.lng, 1.006);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
    return { position: p, quaternion: q };
  }, [location]);
  const offset = useMemo(() => Math.random() * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime + offset) % 2) / 2;
    ref.current.scale.setScalar(size * (0.6 + t * 1.6));
    (ref.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.9 * visible;
  });

  return (
    <mesh ref={ref} position={position} quaternion={quaternion} raycast={() => null}>
      <ringGeometry args={[0.8, 1, 48]} />
      <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Arcs from the first hub to each other hub, drawn progressively by `progress` (0..1). */
export function HubArcs({ codes, progress }: { codes: string[]; progress: { current: number } }) {
  const lines = useMemo(() => {
    const hubs = codes.map((c) => locationByCode.get(c)).filter(Boolean) as Location[];
    const [origin, ...rest] = hubs;
    if (!origin) return [];
    return rest.map((dest) => {
      const pts = arcCurve(origin, dest, 1.004).getPoints(80);
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const colors = new Float32Array(pts.length * 3);
      const a = new THREE.Color('#40b6e4');
      const b = new THREE.Color('#ffffff');
      pts.forEach((_, i) => a.clone().lerp(b, i / pts.length).toArray(colors, i * 3));
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const m = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
      const line = new THREE.Line(g, m);
      line.raycast = () => null;
      return { line, count: pts.length };
    });
  }, [codes]);

  useEffect(
    () => () =>
      lines.forEach(({ line }) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }),
    [lines],
  );

  useFrame(() => {
    const p = THREE.MathUtils.clamp(progress.current, 0, 1);
    lines.forEach(({ line, count }, i) => {
      // Stagger the arcs slightly so they draw one after another.
      const local = THREE.MathUtils.clamp(p * 1.4 - i * 0.08, 0, 1);
      line.geometry.setDrawRange(0, Math.floor(count * local));
      (line.material as THREE.LineBasicMaterial).opacity = 0.85 * Math.min(1, p * 2);
    });
  });

  return (
    <group>
      {lines.map(({ line }, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

/** A restrained star field on a distant shell. */
export function Stars({ count = 1200, radius = 40 }: { count?: number; radius?: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.randomDirection().multiplyScalar(radius * (0.8 + Math.random() * 0.4));
      v.toArray(pos, i * 3);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <points geometry={geometry} raycast={() => null}>
      <pointsMaterial color="#bfe6f6" size={0.08} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}
