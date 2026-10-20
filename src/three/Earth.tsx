import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const SUN_DIRECTION = new THREE.Vector3(-1, 0.32, 0.42).normalize();

const textureSet = (hiRes: boolean) => ({
  day: hiRes ? '/textures/earth-day-4k.jpg' : '/textures/earth-day-2k.jpg',
  night: '/textures/earth-night-2k.jpg',
  specular: '/textures/earth-specular-1k.jpg',
  normal: '/textures/earth-normal-2k.jpg',
  clouds: '/textures/earth-clouds-2k.jpg',
});

const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    // Tangent along increasing U (eastward) for a UV sphere.
    vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), normal) + vec3(1e-5, 0.0, 0.0));
    vNormal = normalize(mat3(modelMatrix) * normal);
    vTangent = normalize(mat3(modelMatrix) * t);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const surfaceFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specularMap;
  uniform sampler2D normalMap;
  uniform sampler2D cloudMap;
  uniform vec3 sunDirection;
  uniform float cloudOffset;
  uniform float nightIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vTangent;
  varying vec3 vWorldPos;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 t = normalize(vTangent - n * dot(vTangent, n));
    vec3 b = cross(n, t);
    vec3 mapN = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    mapN.xy *= 0.55;
    vec3 N = normalize(mat3(t, b, n) * mapN);

    vec3 V = normalize(cameraPosition - vWorldPos);
    float sun = dot(N, sunDirection);
    float geoSun = dot(n, sunDirection);
    float dayMix = smoothstep(-0.18, 0.22, geoSun);

    vec3 day = texture2D(dayMap, vUv).rgb;
    day = pow(day, vec3(0.92)) * (0.05 + 1.15 * max(sun, 0.0));

    // Soft cloud shadows on the surface.
    float cloud = texture2D(cloudMap, vUv + vec2(cloudOffset - 0.002, 0.0)).r;
    day *= 1.0 - cloud * 0.35;

    vec3 lights = texture2D(nightMap, vUv).rgb;
    vec3 night = pow(lights, vec3(1.6)) * vec3(1.0, 0.78, 0.5) * nightIntensity;

    vec3 color = mix(night, day, dayMix);

    // Ocean glint.
    float ocean = texture2D(specularMap, vUv).r;
    vec3 H = normalize(sunDirection + V);
    float spec = pow(max(dot(n, H), 0.0), 38.0) * ocean * dayMix;
    color += vec3(0.55, 0.75, 1.0) * spec * 0.55;

    // Atmospheric rim inside the disc.
    float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
    color += vec3(0.30, 0.62, 1.0) * fres * (0.12 + 0.75 * dayMix);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const cloudFragment = /* glsl */ `
  uniform sampler2D cloudMap;
  uniform vec3 sunDirection;
  uniform float opacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    float c = texture2D(cloudMap, vUv).r;
    float light = smoothstep(-0.25, 0.45, dot(normalize(vNormal), sunDirection));
    gl_FragColor = vec4(vec3(0.92 + 0.08 * light) * (0.08 + 0.92 * light), c * opacity * (0.25 + 0.75 * light));
    #include <colorspace_fragment>
  }
`;

const simpleVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 sunDirection;
  uniform float strength;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    // Back faces of the shell: |N.V| is ~0.5 at the planet's limb and 0 at the shell's edge,
    // so the glow hugs the limb and fades outward.
    vec3 V = normalize(cameraPosition - vWorldPos);
    float a = abs(dot(normalize(vNormal), V));
    float glow = pow(clamp(a / 0.52, 0.0, 1.0), 3.0);
    float lit = 0.25 + 0.75 * smoothstep(-0.4, 0.6, dot(normalize(vNormal), sunDirection));
    gl_FragColor = vec4(vec3(0.33, 0.64, 1.0) * glow * lit * strength, glow * lit);
  }
`;

type EarthProps = {
  hiRes?: boolean;
  segments?: number;
  spin?: boolean;
  atmosphere?: number;
  /** Light the globe from just beside the camera, so whatever faces the viewer is in daylight. */
  sunFollowsCamera?: boolean;
  children?: ReactNode;
};

/**
 * Earth at radius 1. Children are placed in the rotating frame, so markers and arcs
 * built with latLngToVec3 stay fixed to the surface.
 */
export function Earth({
  hiRes = true,
  segments = 96,
  spin = false,
  atmosphere = 1,
  sunFollowsCamera = false,
  children,
}: EarthProps) {
  const sun = useMemo(() => SUN_DIRECTION.clone(), []);
  const urls = textureSet(hiRes);
  const tex = useTexture(urls);
  const clouds = useRef<THREE.Mesh>(null);

  useMemo(() => {
    tex.day.colorSpace = THREE.SRGBColorSpace;
    tex.night.colorSpace = THREE.SRGBColorSpace;
    for (const t of Object.values(tex)) {
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
    }
  }, [tex]);

  const surface = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: surfaceVertex,
        fragmentShader: surfaceFragment,
        uniforms: {
          dayMap: { value: tex.day },
          nightMap: { value: tex.night },
          specularMap: { value: tex.specular },
          normalMap: { value: tex.normal },
          cloudMap: { value: tex.clouds },
          sunDirection: { value: sun },
          cloudOffset: { value: 0 },
          nightIntensity: { value: 1.35 },
        },
      }),
    [tex, sun],
  );

  const cloudMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: simpleVertex,
        fragmentShader: cloudFragment,
        uniforms: {
          cloudMap: { value: tex.clouds },
          sunDirection: { value: sun },
          opacity: { value: 0.85 },
        },
        transparent: true,
        depthWrite: false,
      }),
    [tex, sun],
  );

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: simpleVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { sunDirection: { value: sun }, strength: { value: atmosphere } },
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [atmosphere, sun],
  );

  useFrame(({ camera }, delta) => {
    if (sunFollowsCamera) {
      // Offset up and to the left of the view so the terminator stays visible on the right.
      sun.copy(camera.position).normalize().applyAxisAngle(camera.up, -0.75);
      sun.y += 0.35;
      sun.normalize();
    }
    if (!spin || !clouds.current) return;
    // Clouds drift slightly faster than the surface.
    clouds.current.rotation.y += delta * 0.006;
    surface.uniforms.cloudOffset.value = -clouds.current.rotation.y / (Math.PI * 2);
  });

  return (
    <group>
      <mesh material={surface}>
        <sphereGeometry args={[1, segments, segments / 2]} />
      </mesh>
      <mesh ref={clouds} material={cloudMaterial} scale={1.007}>
        <sphereGeometry args={[1, segments, segments / 2]} />
      </mesh>
      <mesh material={atmosphereMaterial} scale={1.16} raycast={() => null}>
        <sphereGeometry args={[1, 64, 32]} />
      </mesh>
      {children}
    </group>
  );
}

useTexture.preload(Object.values(textureSet(false)));
