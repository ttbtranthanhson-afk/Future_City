import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, range } from '../../utils/random';
import { glowTexture } from '../../utils/textures';

export function SceneFog({ color = '#0a2436', near = 12, far = 160 }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const previous = scene.fog;
    scene.fog = new THREE.Fog(color, near, far);
    return () => {
      scene.fog = previous;
    };
  }, [scene, color, near, far]);
  return null;
}

export function DepthFog({ surface = '#bcdced', deep = '#0a3a4c', nearAbove = 24, farAbove = 320, nearBelow = 4, farBelow = 58 }) {
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.Fog(surface, nearAbove, farAbove), []);
  const colors = useMemo(() => ({ surface: new THREE.Color(surface), deep: new THREE.Color(deep) }), [surface, deep]);
  useEffect(() => {
    const previous = scene.fog;
    scene.fog = fog;
    return () => {
      scene.fog = previous;
    };
  }, [scene, fog]);
  useFrame(({ camera }) => {
    const depth = Math.min(1, Math.max(0, -camera.position.y / 5));
    fog.color.copy(colors.surface).lerp(colors.deep, depth);
    fog.near = nearAbove + (nearBelow - nearAbove) * depth;
    fog.far = farAbove + (farBelow - farAbove) * depth;
  });
  return null;
}

export function WarpTunnel({ position = [0, 2, -30], rotation = [0, 0, 0], color = '#6ff0ff', accent = '#b18cff', radius = 9, length = 80, speed = 1 }) {
  const rings = useRef();
  const particles = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(color) },
      uColorB: { value: new THREE.Color(accent) },
      uSpeed: { value: speed },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const ringData = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ z: -(i / 16) * length, r: 0.92 + (i % 3) * 0.03 })), [length]);
  const particleGeo = useMemo(() => {
    const rng = mulberry32(707);
    const count = 320;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const a = range(rng, 0, Math.PI * 2);
      const r = range(rng, 1.5, radius * 0.95);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = range(rng, -length, 4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [length, radius]);
  useFrame(({ clock }, delta) => {
    if (uniforms.uTime) uniforms.uTime.value = clock.elapsedTime * speed;
    if (rings.current) {
      rings.current.children.forEach((ring, i) => {
        ring.position.z += delta * 9 * speed;
        if (ring.position.z > 6) ring.position.z -= length;
        ring.rotation.z += delta * 0.15 * (i % 2 ? -1 : 1);
      });
    }
    if (particles.current) {
      const arr = particles.current.geometry.attributes.position.array;
      for (let i = 0; i < arr.length / 3; i += 1) {
        arr[i * 3 + 2] += delta * 16 * speed;
        if (arr[i * 3 + 2] > 6) arr[i * 3 + 2] -= length;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, length, 48, 1, true]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            uniform float uSpeed;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            varying vec2 vUv;
            void main() {
              float around = vUv.x * 6.2831;
              float depth = vUv.y;
              float streak = sin(around * 22.0 + depth * 30.0 - uTime * 5.0 * uSpeed);
              streak = pow(max(streak, 0.0), 8.0);
              float streak2 = sin(around * 11.0 - depth * 20.0 + uTime * 3.0 * uSpeed);
              streak2 = pow(max(streak2, 0.0), 5.0);
              float bands = 0.5 + 0.5 * sin(depth * 60.0 + uTime * 2.0);
              vec3 col = mix(uColorA, uColorB, depth * 0.8 + streak2 * 0.4);
              col *= 0.35 + streak * 3.2 + streak2 * 1.1 + bands * 0.25;
              float fade = smoothstep(0.0, 0.06, depth) * smoothstep(1.0, 0.9, depth);
              gl_FragColor = vec4(col, (0.22 + streak * 0.8) * fade);
            }
          `}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.58, radius * 0.58, length, 32, 1, true]} />
        <meshBasicMaterial color={accent} transparent opacity={0.055} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, length, 8, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={rings}>
        {ringData.map((r, i) => (
          <mesh key={i} position={[0, 0, r.z]} scale={[r.r, r.r, 1]}>
            <torusGeometry args={[radius * 0.92, 0.05, 6, 40]} />
            <meshBasicMaterial color={i % 2 ? accent : color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <points ref={particles} geometry={particleGeo}>
        <pointsMaterial map={glowTexture('#ffffff')} color="#ffffff" size={0.5} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <mesh position={[0, 0, -length * 0.92]}>
        <circleGeometry args={[radius * 0.9, 40]} />
        <meshBasicMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <sprite position={[0, 0, -length * 0.9]} scale={[radius * 3, radius * 3, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <pointLight position={[0, 0, -length * 0.6]} color={color} intensity={40} distance={60} decay={2} />
    </group>
  );
}

export function Fireworks({ position = [0, 16, -20], count = 240, colors = ['#ffd77a', '#6ff0ff', '#ff8fa0'], radius = 9, bursts = 3, speed = 1, size = 0.35 }) {
  const points = useRef();
  const data = useMemo(() => {
    const rng = mulberry32(4242);
    const parts = [];
    const perBurst = Math.floor(count / bursts);
    for (let b = 0; b < bursts; b += 1) {
      const origin = [range(rng, -radius, radius), range(rng, -2, 4), range(rng, -radius * 0.3, radius * 0.3)];
      const color = colors[b % colors.length];
      const offset = rng() * 2.2;
      for (let i = 0; i < perBurst; i += 1) {
        const theta = rng() * Math.PI * 2;
        const phi = Math.acos(range(rng, -1, 1));
        const s = range(rng, 3.5, 8.5);
        parts.push({
          origin,
          offset,
          color,
          vx: Math.sin(phi) * Math.cos(theta) * s,
          vy: Math.cos(phi) * s,
          vz: Math.sin(phi) * Math.sin(theta) * s,
        });
      }
    }
    return parts;
  }, [count, colors, radius, bursts]);
  const elements = useMemo(() => {
    const rng = mulberry32(77);
    const pos = new Float32Array(data.length * 3);
    const col = new Float32Array(data.length * 3);
    const c = new THREE.Color();
    data.forEach((p, i) => {
      c.set(p.color);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      pos[i * 3] = range(rng, -0.5, 0.5);
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = range(rng, -0.5, 0.5);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, [data]);
  const light = useRef();
  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.elapsedTime * speed;
    const pos = points.current.geometry.attributes.position.array;
    data.forEach((p, i) => {
      const local = ((t + p.offset) % 2.2) / 2.2;
      const drag = 1 - Math.pow(local, 1.6);
      pos[i * 3] = p.origin[0] + p.vx * local * 1.3;
      pos[i * 3 + 1] = p.origin[1] + p.vy * local * 1.3 - 9 * local * local;
      pos[i * 3 + 2] = p.origin[2] + p.vz * local * 1.3;
      if (drag < 0.02) pos[i * 3 + 1] = -999;
    });
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.material.opacity = 0.95;
    if (light.current) {
      const burst = Math.pow(0.5 + 0.5 * Math.sin(t * 2.8), 4);
      light.current.intensity = 8 + burst * 34;
    }
  });
  return (
    <group position={position}>
      <points ref={points} geometry={elements}>
        <pointsMaterial map={glowTexture('#ffffff')} size={size * 2.8} vertexColors transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <points geometry={elements}>
        <pointsMaterial map={glowTexture('#ffffff')} size={size} vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <points geometry={elements}>
        <pointsMaterial color="#ffffff" size={size * 0.32} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <pointLight ref={light} color={colors[0]} intensity={14} distance={48} decay={2} />
    </group>
  );
}

export function Lanterns({ count = 80, center = [0, 8, -20], area = [40, 14, 30], seed = 5150, color = '#ffcf6e' }) {
  const group = useRef();
  const bodies = useRef();
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: center[0] + range(rng, -area[0] / 2, area[0] / 2),
      y: center[1] + range(rng, -area[1] / 2, area[1] / 2),
      z: center[2] + range(rng, -area[2] / 2, area[2] / 2),
      s: range(rng, 0.7, 1.35),
      rot: rng() * Math.PI * 2,
      tint: rng() > 0.72 ? '#ff9d5c' : color,
    }));
  }, [count, center, area, seed]);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    data.forEach((d, i) => {
      positions[i * 3] = d.x;
      positions[i * 3 + 1] = d.y;
      positions[i * 3 + 2] = d.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count, data]);
  useLayoutEffect(() => {
    if (!bodies.current) return;
    const dummy = new THREE.Object3D();
    const c = new THREE.Color();
    data.forEach((d, i) => {
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, d.rot, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(i, dummy.matrix);
      c.set(d.tint);
      bodies.current.setColorAt(i, c);
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    if (bodies.current.instanceColor) bodies.current.instanceColor.needsUpdate = true;
  }, [data]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.35) * 0.5;
    group.current.rotation.y = Math.sin(t * 0.05) * 0.1;
    if (bodies.current?.material) bodies.current.material.emissiveIntensity = 1.4 + Math.sin(t * 2.6) * 0.28;
  });
  return (
    <group ref={group}>
      <instancedMesh ref={bodies} args={[null, null, count]}>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 8, 1]} />
        <meshStandardMaterial emissive={color} emissiveIntensity={1.4} roughness={0.55} toneMapped={false} />
      </instancedMesh>
      <points geometry={geometry}>
        <pointsMaterial map={glowTexture('#ffffff')} color={color} size={0.95} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <points geometry={geometry}>
        <pointsMaterial color="#fff4d0" size={0.2} transparent opacity={0.92} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
    </group>
  );
}

export function CameraDrift({ amount = 0.15, speed = 0.3, axis = 'y' }) {
  const { camera } = useThree();
  const start = useRef(null);
  useFrame(({ clock }) => {
    if (!start.current) start.current = camera.position[axis];
    camera.position[axis] = start.current + Math.sin(clock.elapsedTime * speed) * amount;
  });
  return null;
}

export function Fireflies({ count = 80, center = [0, 1.5, 0], area = [12, 3, 12], color = '#b6ff9f', size = 0.09, seed = 61 }) {
  const geo = useMemo(() => {
    const rng = mulberry32(seed);
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = center[0] + range(rng, -area[0] / 2, area[0] / 2);
      pos[i * 3 + 1] = center[1] + range(rng, -area[1] / 2, area[1] / 2);
      pos[i * 3 + 2] = center[2] + range(rng, -area[2] / 2, area[2] / 2);
      phase[i] = rng() * 6.28;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count, center, area, seed]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
    }),
    [color, size]
  );
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aPhase;
          uniform float uTime;
          uniform float uSize;
          varying float vTwinkle;
          void main() {
            vec3 p = position;
            p.x += sin(uTime * 0.5 + aPhase) * 0.38;
            p.y += sin(uTime * 0.7 + aPhase * 1.3) * 0.3;
            p.z += cos(uTime * 0.45 + aPhase * 0.8) * 0.38;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vTwinkle = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 2.0 + aPhase * 3.7), 2.0);
            gl_PointSize = uSize * 340.0 / max(-mv.z, 0.1) * (0.6 + vTwinkle * 0.7);
            gl_Position = projectionMatrix * mv;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vTwinkle;
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            float a = smoothstep(0.5, 0.0, d);
            a *= a;
            gl_FragColor = vec4(uColor * (0.65 + vTwinkle), a * (0.35 + vTwinkle * 0.65));
          }
        `}
      />
    </points>
  );
}
