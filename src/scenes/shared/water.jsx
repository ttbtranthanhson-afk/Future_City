import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const oceanVert = `
uniform float uTime;
uniform float uAmp;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
float wave(vec2 p) {
  return sin(p.x * 0.075 + uTime * 0.65) * 0.5
    + sin(p.y * 0.105 - uTime * 0.5) * 0.4
    + sin((p.x + p.y) * 0.043 + uTime * 0.32) * 0.75
    + sin((p.x - p.y) * 0.19 - uTime * 1.2) * 0.12;
}
void main() {
  vec3 pos = position;
  float h = wave(pos.xy) * uAmp;
  pos.z += h;
  float e = 0.8;
  float hx = wave(pos.xy + vec2(e, 0.0)) * uAmp - h;
  float hy = wave(pos.xy + vec2(0.0, e)) * uAmp - h;
  vec3 localNormal = normalize(vec3(-hx, -hy, e));
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * localNormal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const oceanFrag = `
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uOpacity;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vec3 normal = normalize(vWorldNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  vec3 col = mix(uDeep, uShallow, clamp(fresnel * 0.9 + 0.18, 0.0, 1.0));
  vec3 sun = normalize(uSunDir);
  float spec = pow(max(dot(reflect(-sun, normal), viewDir), 0.0), 140.0);
  float spec2 = pow(max(dot(reflect(-sun, normal), viewDir), 0.0), 22.0);
  col += uSunColor * (spec * 1.6 + spec2 * 0.18);
  float glint = pow(max(0.0, sin(vWorldPos.x * 0.42 + uTime * 1.1) * sin(vWorldPos.z * 0.51 - uTime * 0.8)), 26.0);
  col += vec3(0.35, 0.75, 0.85) * glint * 0.2;
  float dist = length(cameraPosition.xz - vWorldPos.xz);
  col = mix(col, uHorizon, smoothstep(150.0, 600.0, dist) * 0.75);
  if (!gl_FrontFacing) {
    col = mix(uDeep * 0.4, vec3(0.01, 0.07, 0.1), 0.45);
  }
  gl_FragColor = vec4(col, uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function Ocean({
  size = 1400,
  segments = 90,
  amp = 0.6,
  y = 0,
  deep = '#063044',
  shallow = '#1f8fa3',
  horizon = '#a7dced',
  sun = '#ffe6b0',
  sunDir = [0.4, 0.6, -0.4],
  opacity = 0.97,
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: amp },
      uDeep: { value: new THREE.Color(deep) },
      uShallow: { value: new THREE.Color(shallow) },
      uHorizon: { value: new THREE.Color(horizon) },
      uSunColor: { value: new THREE.Color(sun) },
      uSunDir: { value: new THREE.Vector3(...sunDir).normalize() },
      uOpacity: { value: opacity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const mat = useRef();
  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={0}>
      <planeGeometry args={[size, size, segments, segments]} />
      <shaderMaterial
        ref={mat}
        vertexShader={oceanVert}
        fragmentShader={oceanFrag}
        uniforms={uniforms}
        transparent={opacity < 1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function WaterPool({ position = [0, 0.1, 0], scale = [8, 1, 8], color = '#57c9cf', opacity = 0.8 }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = opacity * (0.85 + Math.sin(state.clock.elapsedTime * 1.4) * 0.1);
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} metalness={0.4} roughness={0.15} />
    </mesh>
  );
}

export function Waterfall({ position = [0, 6, 0], width = 6, height = 12, color = '#bfefff', opacity = 0.5 }) {
  const ref = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    }),
    [color, opacity]
  );
  useFrame((state) => {
    if (ref.current) ref.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width, height, 16, 16]} />
        <shaderMaterial
          ref={ref}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              vec3 p = position;
              p.z += sin(uv.y * 22.0 + uv.x * 8.0) * 0.15;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform vec3 uColor;
            uniform float uOpacity;
            varying vec2 vUv;
            void main() {
              float streak = sin(vUv.x * 90.0 + sin(vUv.y * 14.0 + uTime * 3.0) * 2.0) * 0.5 + 0.5;
              float flow = fract(vUv.y * 3.0 + uTime * 1.6);
              float alpha = uOpacity * (0.25 + streak * 0.6) * smoothstep(0.0, 0.2, vUv.y) * (0.7 + flow * 0.3);
              gl_FragColor = vec4(uColor, alpha);
            }
          `}
        />
      </mesh>
    </group>
  );
}
