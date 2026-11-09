import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cloudTexture, glowTexture } from '../../utils/textures';
import { mulberry32, range } from '../../utils/random';

const skyVert = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const skyFrag = `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uTime;
varying vec3 vWorldPosition;
void main() {
  vec3 dir = normalize(vWorldPosition);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, pow(h, 0.85));
  col = mix(uHorizon, col, smoothstep(0.34, 0.72, h));
  float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
  float sun = pow(sunDot, 350.0) * 2.2 + pow(sunDot, 18.0) * 0.28 + pow(sunDot, 4.0) * 0.08;
  col += uSunColor * sun;
  float band = sin(dir.y * 40.0 + uTime * 0.02) * 0.002;
  col += band;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export function GradientSky({
  top = '#0b2a4a',
  bottom = '#6fb6d8',
  horizon = '#ffd6a0',
  sunColor = '#ffd9a8',
  sunDir = [0.4, 0.35, -0.8],
  radius = 900,
}) {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uBottom: { value: new THREE.Color(bottom) },
      uHorizon: { value: new THREE.Color(horizon) },
      uSunColor: { value: new THREE.Color(sunColor) },
      uSunDir: { value: new THREE.Vector3(...sunDir) },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const matRef = useRef();
  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <mesh scale={[1, 1, 1]} renderOrder={-10}>
      <sphereGeometry args={[radius, 32, 20]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={skyVert}
        fragmentShader={skyFrag}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

export function Stars({ count = 900, radius = 500, color = '#cfe9ff', size = 1.3, opacity = 0.8 }) {
  const geo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const rng = mulberry32(991);
    for (let i = 0; i < count; i += 1) {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(range(rng, 0.03, 1));
      const r = radius * range(rng, 0.75, 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 60;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, radius]);
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.004;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation={false}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}

export function CloudLayer({ count = 14, height = 70, radius = 260, color = '#e9f7ff', opacity = 0.55, speed = 0.6 }) {
  const sprites = useMemo(() => {
    const rng = mulberry32(4421);
    return Array.from({ length: count }, (_, i) => ({
      pos: [range(rng, -radius, radius), height + range(rng, -20, 35), range(rng, -radius, radius)],
      scale: range(rng, 70, 170),
      speed: speed * range(rng, 0.5, 1.5) * (rng() > 0.5 ? 1 : -1),
      tex: cloudTexture(i % 6),
      opacity: opacity * range(rng, 0.5, 1),
    }));
  }, [count, height, radius, speed, opacity]);
  const group = useRef();
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.position.x += sprites[i].speed * delta * 2;
      if (child.position.x > radius) child.position.x = -radius;
      if (child.position.x < -radius) child.position.x = radius;
    });
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.02) * 2;
  });
  return (
    <group ref={group}>
      {sprites.map((s, i) => (
        <sprite key={i} position={s.pos} scale={[s.scale, s.scale * 0.42, 1]}>
          <spriteMaterial
            map={s.tex}
            color={color}
            transparent
            opacity={s.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  );
}

export function Motes({ count = 260, area = [40, 20, 40], color = '#ffe2a8', size = 0.12, speed = 0.25, center = [0, 6, 0], opacity = 0.55 }) {
  const geo = useMemo(() => {
    const rng = mulberry32(777);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = center[0] + range(rng, -area[0] / 2, area[0] / 2);
      positions[i * 3 + 1] = center[1] + range(rng, -area[1] / 2, area[1] / 2);
      positions[i * 3 + 2] = center[2] + range(rng, -area[2] / 2, area[2] / 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, area, center]);
  const ref = useRef();
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: glowTexture('#ffffff'),
        color,
        size,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [color, size, opacity]
  );
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed * 0.1;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += delta * 0.12;
      if (arr[i] > center[1] + area[1] / 2) arr[i] = center[1] - area[1] / 2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

export function SunSprite({ position = [120, 60, -300], scale = 80, color = '#ffe6b0', opacity = 0.9 }) {
  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={glowTexture('#ffffff', 'rgba(255,255,255,0)')}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </sprite>
  );
}

export function Haze({ position = [0, 10, -120], scale = [300, 80, 1], color = '#bfe9ff', opacity = 0.2 }) {
  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
    </mesh>
  );
}

export function FakeShadow({ position = [0, 0.02, 0], scale = 1.6, opacity = 0.55 }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[scale, scale, 1]} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={glowTexture('rgba(0,0,0,0.75)', 'rgba(0,0,0,0)')} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

export function LightShafts({ color = '#ffe6bc', opacity = 0.12, count = 4, position = [0, 0, 0] }) {
  const group = useRef();
  const shafts = useMemo(() => {
    const rng = mulberry32(119);
    return Array.from({ length: count }, (_, i) => ({
      x: range(rng, -2.6, 2.6),
      z: range(rng, -3, 1),
      w: range(rng, 0.3, 0.9),
      rot: range(rng, -0.4, 0.4),
      speed: range(rng, 0.1, 0.3),
      op: opacity * range(rng, 0.5, 1.1),
    }));
  }, [count, opacity]);
  useFrame((state) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      c.material.opacity = shafts[i].op * (0.7 + Math.sin(state.clock.elapsedTime * shafts[i].speed + i) * 0.3);
    });
  });
  return (
    <group ref={group} position={position}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, 1.5, s.z]} rotation={[0.3, s.rot, s.rot * 0.4]} renderOrder={3}>
          <planeGeometry args={[s.w, 4.4]} />
          <meshBasicMaterial
            map={glowTexture('#ffffff', 'rgba(255,255,255,0)')}
            color={color}
            transparent
            opacity={s.op}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function UnderwaterGodRays({ count = 7, color = '#9ff4ff', y = 14, spread = 26, opacity = 0.12 }) {
  const shafts = useMemo(() => {
    const rng = mulberry32(2024);
    return Array.from({ length: count }, () => ({
      x: range(rng, -spread, spread),
      z: range(rng, -spread, spread),
      w: range(rng, 2, 7),
      rot: range(rng, 0, Math.PI),
      op: opacity * range(rng, 0.4, 1),
      speed: range(rng, 0.15, 0.4),
    }));
  }, [count, spread, opacity]);
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      child.material.opacity = shafts[i].op * (0.65 + Math.sin(state.clock.elapsedTime * shafts[i].speed + i * 2) * 0.35);
    });
  });
  return (
    <group ref={ref}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, y, s.z]} rotation={[0, s.rot, 0]} renderOrder={1}>
          <coneGeometry args={[s.w, y * 2.2, 10, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={s.op} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

export function BirdFlock({ count = 8, center = [0, 30, -40], radius = 20, color = '#39424a', speed = 0.25, scale = 1 }) {
  const group = useRef();
  const birds = useMemo(() => {
    const rng = mulberry32(515);
    return Array.from({ length: count }, (_, i) => ({
      offset: range(rng, 0, Math.PI * 2),
      r: range(rng, radius * 0.6, radius),
      y: range(rng, -6, 8),
      speed: speed * range(rng, 0.7, 1.3),
      flap: range(rng, 4, 7),
      s: range(rng, 0.7, 1.3) * scale,
      i,
    }));
  }, [count, radius, speed, scale]);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((bird, idx) => {
      const b = birds[idx];
      const a = t * b.speed + b.offset;
      bird.position.set(center[0] + Math.cos(a) * b.r, center[1] + b.y + Math.sin(a * 2) * 1.5, center[2] + Math.sin(a) * b.r);
      bird.rotation.y = -a + Math.PI / 2;
      bird.children[1].rotation.z = Math.sin(t * b.flap + idx) * 0.7;
      bird.children[2].rotation.z = -Math.sin(t * b.flap + idx) * 0.7;
    });
  });
  return (
    <group ref={group}>
      {birds.map((b) => (
        <group key={b.i} scale={b.s}>
          <mesh>
            <sphereGeometry args={[0.1, 5, 4]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[-0.22, 0, 0]}>
            <planeGeometry args={[0.5, 0.12]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.22, 0, 0]}>
            <planeGeometry args={[0.5, 0.12]} />
            <meshBasicMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
