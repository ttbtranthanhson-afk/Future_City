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
uniform float uNight;
varying vec3 vWorldPosition;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uBottom, uTop, pow(h, 0.92));
  float horizonBand = exp(-pow((dir.y - 0.015) * 7.5, 2.0));
  col = mix(col, uHorizon, horizonBand * 0.72);
  col = mix(col, uHorizon * 1.08, smoothstep(0.44, 0.62, h) * 0.16);

  float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
  float disc = smoothstep(0.99935, 0.99978, sunDot);
  float glow = pow(sunDot, 240.0) * 1.5 + pow(sunDot, 22.0) * 0.36 + pow(sunDot, 5.0) * 0.1;
  float scatter = pow(max(0.0, 1.0 - abs(dir.y - uSunDir.y) * 4.0), 4.0) * pow(sunDot, 3.0);
  col += uSunColor * (disc * 2.4 + glow + scatter * 0.22);

  if (uNight > 0.01) {
    vec3 sd = dir * 190.0;
    vec2 cell = floor(sd.xz + sd.y * 0.63);
    float n = hash21(cell);
    float star = smoothstep(0.9955, 1.0, n) * smoothstep(0.0, 0.12, dir.y);
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.7 + n * 48.0);
    col += vec3(0.78, 0.88, 1.0) * star * twinkle * uNight * 1.35;
    float hazeBand = pow(1.0 - abs(dir.y), 5.0) * 0.035;
    col += vec3(0.12, 0.2, 0.32) * hazeBand;
  }

  col += vec3(0.008, 0.012, 0.02) * sin(dir.y * 9.0 + uTime * 0.02);
  col += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
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
  night,
}) {
  const sunKey = sunDir.join(',');
  const nightAmount = useMemo(() => {
    if (typeof night === 'number') return night;
    const c = new THREE.Color(top);
    const lum = c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722;
    return THREE.MathUtils.clamp((0.18 - lum) / 0.16, 0, 1);
  }, [top, night]);
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(top) },
      uBottom: { value: new THREE.Color(bottom) },
      uHorizon: { value: new THREE.Color(horizon) },
      uSunColor: { value: new THREE.Color(sunColor) },
      uSunDir: { value: new THREE.Vector3(...sunKey.split(',').map(Number)) },
      uTime: { value: 0 },
      uNight: { value: nightAmount },
    }),
    [top, bottom, horizon, sunColor, sunKey, nightAmount]
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

export function CloudLayer({ count = 16, height = 70, radius = 260, color = '#e9f7ff', opacity = 0.55, speed = 0.6 }) {
  const sprites = useMemo(() => {
    const rng = mulberry32(4421);
    const base = new THREE.Color(color);
    return Array.from({ length: count }, (_, i) => {
      const tint = base.clone().lerp(new THREE.Color('#8ea6bb'), rng() * 0.35);
      tint.offsetHSL(0, -0.04, range(rng, -0.06, 0.04));
      return {
        pos: [range(rng, -radius, radius), height + range(rng, -20, 35), range(rng, -radius, radius)],
        scale: range(rng, 80, 190),
        speed: speed * range(rng, 0.5, 1.5) * (rng() > 0.5 ? 1 : -1),
        tex: cloudTexture(i % 6),
        opacity: opacity * range(rng, 0.55, 1),
        tint,
      };
    });
  }, [count, height, radius, speed, opacity, color]);
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
        <sprite key={i} position={s.pos} scale={[s.scale, s.scale * 0.46, 1]}>
          <spriteMaterial
            map={s.tex}
            color={s.tint}
            transparent
            opacity={s.opacity}
            depthWrite={false}
            blending={THREE.NormalBlending}
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
    <group position={position}>
      <sprite scale={[scale * 1.8, scale * 1.8, 1]}>
        <spriteMaterial
          map={glowTexture('#ffffff', 'rgba(255,255,255,0)')}
          color={color}
          transparent
          opacity={opacity * 0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite scale={[scale * 0.55, scale * 0.55, 1]}>
        <spriteMaterial
          map={glowTexture('#ffffff', 'rgba(255,255,255,0)')}
          color="#fffaf0"
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite scale={[scale * 2.6, scale * 0.12, 1]} rotation={0.32}>
        <spriteMaterial
          map={glowTexture('#ffffff', 'rgba(255,255,255,0)')}
          color={color}
          transparent
          opacity={opacity * 0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite scale={[scale * 2.2, scale * 0.1, 1]} rotation={-0.9}>
        <spriteMaterial
          map={glowTexture('#ffffff', 'rgba(255,255,255,0)')}
          color={color}
          transparent
          opacity={opacity * 0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
}

export function GroundMist({ position = [0, 1.4, 0], scale = [180, 18], color = '#d5ecf7', opacity = 0.16, speed = 0.8, count = 5 }) {
  const ref = useRef();
  const wisps = useMemo(() => {
    const rng = mulberry32(6161);
    return Array.from({ length: count }, (_, i) => ({
      x: range(rng, -scale[0] * 0.45, scale[0] * 0.45),
      y: range(rng, -scale[1] * 0.25, scale[1] * 0.25),
      s: range(rng, 0.55, 1.1),
      speed: speed * range(rng, 0.4, 1) * (rng() > 0.5 ? 1 : -1),
      op: opacity * range(rng, 0.5, 1),
      tex: cloudTexture(i % 6),
    }));
  }, [count, opacity, speed, scale]);
  const halfW = scale[0] * 0.55;
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      child.position.x += wisps[i].speed * delta * 6;
      if (child.position.x > halfW) child.position.x = -halfW;
      if (child.position.x < -halfW) child.position.x = halfW;
    });
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.12) * 0.6;
  });
  return (
    <group ref={ref} position={position}>
      {wisps.map((w, i) => (
        <sprite key={i} position={[w.x, w.y, 0]} scale={[scale[0] * w.s, scale[1] * w.s, 1]}>
          <spriteMaterial
            map={w.tex}
            color={color}
            transparent
            opacity={w.op}
            depthWrite={false}
            blending={THREE.NormalBlending}
            fog={false}
          />
        </sprite>
      ))}
    </group>
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
