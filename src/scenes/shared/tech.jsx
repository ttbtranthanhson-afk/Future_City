import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, range } from '../../utils/random';
import { glowTexture, screenTexture, themeTexture, windowTexture } from '../../utils/textures';
import { Pagoda } from './nature';

export function Portal({ position = [0, 1.6, 0], rotation = [0, 0, 0], scale = 1, color = '#6ff0ff', accent = '#b18cff', speed = 1, intensity = 1 }) {
  const rings = useRef();
  const disc = useRef();
  const particles = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(color) },
      uColorB: { value: new THREE.Color(accent) },
      uIntensity: { value: intensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const particleGeo = useMemo(() => {
    const rng = mulberry32(303);
    const count = 160;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const a = range(rng, 0, Math.PI * 2);
      const r = range(rng, 1.4, 5.6);
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * range(rng, 0.7, 1.1);
      pos[i * 3 + 2] = range(rng, -1.2, 1.2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    if (disc.current?.material?.uniforms?.uTime) disc.current.material.uniforms.uTime.value = t * speed;
    if (rings.current) {
      rings.current.children.forEach((ring, i) => {
        ring.rotation.z += delta * (0.18 + i * 0.11) * speed * (i % 2 ? -1 : 1);
        ring.rotation.x = 0.3 + Math.sin(t * 0.4 + i) * 0.16;
      });
    }
    if (particles.current) {
      particles.current.rotation.z = t * 0.5 * speed;
      particles.current.rotation.y = Math.sin(t * 0.2) * 0.4;
    }
  });
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <pointLight color={color} intensity={24 * intensity} distance={22} decay={2} />
      <pointLight position={[0, 0, 2.6]} color={accent} intensity={8 * intensity} distance={10} decay={2} />
      <mesh position={[0, 0, -0.32]} castShadow>
        <torusGeometry args={[3.55, 0.34, 12, 64]} />
        <meshStandardMaterial color="#142b36" metalness={0.82} roughness={0.28} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.22]}>
        <torusGeometry args={[3.22, 0.07, 8, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.6} metalness={0.5} roughness={0.2} />
      </mesh>
      <group ref={rings}>
        {[1, 1.14, 1.28].map((s, i) => (
          <mesh key={i} rotation={[0.3, 0, i * 0.2]}>
            <torusGeometry args={[3 * s, 0.055 + i * 0.02, 8, 64]} />
            <meshStandardMaterial color={i % 2 ? accent : color} emissive={i % 2 ? accent : color} emissiveIntensity={2.4} transparent opacity={0.9} />
          </mesh>
        ))}
      </group>
      <mesh ref={disc} position={[0, 0, -0.05]}>
        <circleGeometry args={[3.06, 64]} />
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
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
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform float uIntensity;
            varying vec2 vUv;
            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            void main() {
              vec2 p = vUv - 0.5;
              float r = length(p) * 2.0;
              float angle = atan(p.y, p.x);
              float swirl = sin(angle * 7.0 + r * 10.0 - uTime * 2.6) * 0.5 + 0.5;
              float swirl2 = sin(angle * 13.0 - r * 16.0 + uTime * 3.8) * 0.5 + 0.5;
              float spiral = sin(angle * 3.0 + r * 18.0 - uTime * 1.7) * 0.5 + 0.5;
              vec3 col = mix(uColorA, uColorB, swirl);
              col += uColorB * swirl2 * 0.5 + vec3(0.55, 0.95, 1.0) * spiral * 0.18;
              float core = smoothstep(1.0, 0.0, r);
              float edge = smoothstep(1.0, 0.82, r) * (1.0 - smoothstep(0.86, 0.98, r));
              float alpha = core * (0.35 + swirl * 0.4) + edge * 0.85;
              col += vec3(1.0) * pow(1.0 - r, 5.0) * 0.9;
              float sparks = step(0.995, hash(floor(p * 34.0 + uTime * 1.4)));
              col += vec3(1.0) * sparks * 0.55 * (1.0 - r);
              gl_FragColor = vec4(col * uIntensity, alpha * 0.94);
            }
          `}
        />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <sphereGeometry args={[0.26, 18, 14]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={5} toneMapped={false} />
      </mesh>
      <points ref={particles} geometry={particleGeo}>
        <pointsMaterial map={glowTexture('#ffffff')} color={color} size={0.15} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <mesh>
        <ringGeometry args={[3.15, 3.6, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.24} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <ringGeometry args={[0.9, 2.5, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function HoloPanel({ position = [0, 2, 0], rotation = [0, 0, 0], width = 4, height = 2.4, texture = null, color = '#6ff0ff', opacity = 0.8, bob = true, doubleSide = true }) {
  const group = useRef();
  const mat = useRef();
  const baseY = position[1];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mat.current) mat.current.opacity = opacity * (0.82 + Math.sin(t * 4.1) * 0.08 + Math.sin(t * 23) * 0.02);
    if (bob && group.current) group.current.position.y = baseY + Math.sin(t * 0.8) * 0.08;
  });
  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={mat} map={texture} color={texture ? '#ffffff' : color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} side={doubleSide ? THREE.DoubleSide : THREE.FrontSide} />
      </mesh>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[width * 1.05, height * 1.08]} />
        <meshBasicMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function DataWall({ position = [0, 2, 0], rotation = [0, 0, 0], width = 5, height = 3, title = 'AI CORE', subtitle = '', rows = [], accent = '#6ff0ff', theme = 'tech' }) {
  const tex = useMemo(() => screenTexture({ title, subtitle, rows, accent, theme }), [title, subtitle, rows, accent, theme]);
  return <HoloPanel position={position} rotation={rotation} width={width} height={height} texture={tex} color={accent} opacity={0.9} />;
}

export function EnergyCore({ position = [0, 2, 0], scale = 1, color = '#6ff0ff', accent = '#79f2d0' }) {
  const group = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const core = useRef();
  const sparks = useRef();
  const sparkData = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        a: Math.random() * Math.PI * 2,
        r: 1.1 + Math.random() * 1.2,
        y: (Math.random() - 0.5) * 1.6,
        s: 0.02 + Math.random() * 0.04,
        sp: 0.3 + Math.random() * 0.8,
      })),
    []
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) group.current.position.y = position[1] + Math.sin(t * 1.2) * 0.12;
    if (ring1.current) ring1.current.rotation.z = t * 0.8;
    if (ring2.current) ring2.current.rotation.x = t * 0.6;
    if (core.current) {
      core.current.rotation.y = t * 0.5;
      core.current.rotation.x = t * 0.3;
    }
    if (sparks.current) {
      sparks.current.children.forEach((s, i) => {
        const d = sparkData[i];
        const a = d.a + t * d.sp;
        s.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 1.3 + i) * 0.18, Math.sin(a) * d.r);
      });
    }
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <pointLight color={color} intensity={16} distance={16} decay={2} />
      <mesh position={[0, -1.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.25, 0.4, 20]} />
        <meshStandardMaterial color="#162a35" metalness={0.75} roughness={0.32} emissive={color} emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0, -1.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.65, 20, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.8} transparent opacity={0.82} roughness={0.16} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.46, 1]} />
        <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={3.2} metalness={0.3} roughness={0.2} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.92, 18, 14]} />
        <meshBasicMaterial color={accent} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.3, 0.045, 8, 48]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.9} metalness={0.4} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 1.3, Math.sin((i / 4) * Math.PI * 2) * 1.3, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3.2} />
          </mesh>
        ))}
      </group>
      <group ref={ring2} rotation={[0.6, 0, 0.4]}>
        <mesh>
          <torusGeometry args={[1.65, 0.03, 8, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={0.8} metalness={0.4} roughness={0.2} />
        </mesh>
      </group>
      <group ref={sparks}>
        {sparkData.map((s, i) => (
          <mesh key={i}>
            <sphereGeometry args={[s.s, 5, 4]} />
            <meshBasicMaterial color={accent} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <sprite scale={[4.4, 4.4, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.24} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

export function MedicalBed({ position = [0, 0, 0], rotation = [0, 0, 0], accent = '#9fe8ff', patient = true }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.24, 0.18, 1.08]} />
        <meshStandardMaterial color="#dfeaee" metalness={0.32} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.68, 0]} receiveShadow>
        <boxGeometry args={[2.04, 0.14, 0.94]} />
        <meshStandardMaterial color="#eef6f8" roughness={0.82} />
      </mesh>
      <mesh position={[-0.72, 0.76, 0]}>
        <boxGeometry args={[0.55, 0.06, 0.9]} />
        <meshStandardMaterial color="#cfe4ea" roughness={0.9} />
      </mesh>
      <mesh position={[0.8, 0.78, 0]} rotation={[0, 0, -0.16]}>
        <boxGeometry args={[0.42, 0.09, 0.72]} />
        <meshStandardMaterial color="#f4f9fa" roughness={0.85} />
      </mesh>
      <mesh position={[0.62, 0.86, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#f7fbfc" roughness={0.95} />
      </mesh>
      {[-0.88, 0.88].map((x) => (
        <mesh key={`hr${x}`} position={[x, 0.9, 0.42]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.8, 6]} />
          <meshStandardMaterial color="#9fb2b8" metalness={0.75} roughness={0.24} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.95, 0.3, sz * 0.42]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.56, 6]} />
            <meshStandardMaterial color="#7f9298" metalness={0.72} roughness={0.28} />
          </mesh>
        ))
      )}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`w${sx}${sz}`} position={[sx * 0.95, 0.04, sz * 0.42]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#2b363b" roughness={0.5} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.73, 0.5]}>
        <boxGeometry args={[2.1, 0.055, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} />
      </mesh>
      {patient && (
        <>
          <mesh position={[0.06, 0.94, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.21, 1.05, 4, 10]} />
            <meshStandardMaterial color="#8fbacb" roughness={0.82} />
          </mesh>
          <mesh position={[0.72, 0.86, 0]}>
            <sphereGeometry args={[0.16, 14, 12]} />
            <meshStandardMaterial color="#e3b58b" roughness={0.9} />
          </mesh>
          <mesh position={[-0.1, 0.83, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.95, 0.05, 0.85]} />
            <meshStandardMaterial color="#bcd8e2" roughness={0.95} />
          </mesh>
        </>
      )}
      <group position={[-0.2, 0, -0.62]}>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 1.9, 6]} />
          <meshStandardMaterial color="#a9bcc2" metalness={0.7} roughness={0.26} />
        </mesh>
        <mesh position={[0, 2.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.5, 6]} />
          <meshStandardMaterial color="#a9bcc2" metalness={0.7} roughness={0.26} />
        </mesh>
        <mesh position={[0.25, 1.92, 0]}>
          <boxGeometry args={[0.36, 0.26, 0.05]} />
          <meshStandardMaterial color="#0d2734" emissive={accent} emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 0.08, 10]} />
          <meshStandardMaterial color="#7f9298" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export function Scanner({ position = [0, 0, 0], rotation = [0, 0, 0], accent = '#9fe8ff', color = '#e8f4f6' }) {
  const inner = useRef();
  const beam = useRef();
  useFrame(({ clock }) => {
    if (inner.current) inner.current.rotation.z = clock.elapsedTime * 0.9;
    if (beam.current) beam.current.material.opacity = 0.12 + Math.sin(clock.elapsedTime * 2) * 0.06;
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[1.5, 0.22, 10, 40]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.35} emissive={accent} emissiveIntensity={0.25} />
      </mesh>
      <group ref={inner}>
        <mesh>
          <torusGeometry args={[1.25, 0.05, 6, 32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.4} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.25, 0.035, 6, 32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} />
        </mesh>
      </group>
      <mesh ref={beam} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <ringGeometry args={[0.2, 1.25, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, -1.15, 0]}>
          <cylinderGeometry args={[0.8, 1.0, 0.2, 16]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function MedTrolley({ position = [0, 0, 0], path = 10, speed = 0.4, phase = 0, accent = '#9fe8ff', color = '#e7f1f3' }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime * speed + phase;
    group.current.position.x = position[0] + Math.sin(t) * path;
    group.current.rotation.y = Math.cos(t) > 0 ? Math.PI / 2 : -Math.PI / 2;
  });
  return (
    <group ref={group} position={position}>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <boxGeometry args={[0.65, 0.08, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-0.25, 0.92, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.18, 8]} />
        <meshStandardMaterial color="#b7cbd2" />
      </mesh>
      <mesh position={[0.2, 0.92, 0.1]}>
        <boxGeometry args={[0.14, 0.16, 0.1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.28, 0.14]}>
        <boxGeometry args={[0.18, 0.05, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.3, 8]} />
        <meshStandardMaterial color="#a8bcc4" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.3, 0.55, 0]}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshStandardMaterial color="#2a3338" roughness={0.6} />
        </mesh>
      ))}
      <sprite position={[0, 0.35, 0]} scale={[1, 1, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color={accent} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

export function HospitalDoor({ position = [0, 1.5, 0], rotation = [0, 0, 0], width = 3, height = 3, accent = '#9fe8ff', open = 0.9 }) {
  const left = useRef();
  const right = useRef();
  useFrame(({ clock }) => {
    const o = open + Math.sin(clock.elapsedTime * 0.7) * 0.08;
    if (left.current) left.current.position.x = -width * 0.25 - o * width * 0.28;
    if (right.current) right.current.position.x = width * 0.25 + o * width * 0.28;
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[width * 1.4, height * 1.2, 0.1]} />
        <meshStandardMaterial color="#dfeef2" metalness={0.3} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s, i) => (
        <mesh key={s} ref={i === 0 ? left : right} position={[s * width * 0.25, 0, 0]}>
          <boxGeometry args={[width * 0.5, height, 0.12]} />
          <meshStandardMaterial color="#e6f4f7" metalness={0.25} roughness={0.35} transparent opacity={0.85} emissive={accent} emissiveIntensity={0.08} />
        </mesh>
      ))}
      <mesh position={[0, height * 0.52, 0]}>
        <boxGeometry args={[width * 1.4, 0.08, 0.14]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`g${s}`} position={[s * width * 0.7, 0, 0]}>
          <boxGeometry args={[0.12, height * 1.05, 0.16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

export function ClassroomDesk({ position = [0, 0, 0], rotation = [0, 0, 0], accent = '#86b8ff' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.08, 0.7]} />
        <meshStandardMaterial color="#d8e4f0" metalness={0.32} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.2, 0.015, 0.6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} transparent opacity={0.3} />
      </mesh>
      <mesh position={[-0.28, 0.77, 0.02]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[0.46, 0.045, 0.32]} />
        <meshStandardMaterial color="#f3f8fb" roughness={0.85} />
      </mesh>
      <mesh position={[-0.28, 0.795, 0.02]} rotation={[0, 0.08, 0]}>
        <boxGeometry args={[0.4, 0.008, 0.27]} />
        <meshStandardMaterial color="#0d2734" emissive={accent} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0.32, 0.78, -0.06]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[0.26, 0.05, 0.34]} />
        <meshStandardMaterial color="#c96f7a" roughness={0.8} />
      </mesh>
      <mesh position={[0.32, 0.81, -0.06]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.3]} />
        <meshStandardMaterial color="#f4f1e6" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.77, 0.16]} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.26, 5]} />
        <meshStandardMaterial color="#3f6e8a" metalness={0.3} roughness={0.5} />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.65, 0.36, sz * 0.26]} castShadow>
            <cylinderGeometry args={[0.025, 0.032, 0.72, 6]} />
            <meshStandardMaterial color="#7f8b9a" metalness={0.62} roughness={0.28} />
          </mesh>
        ))
      )}
      {[-1, 1].map((sx) => (
        <mesh key={`bar${sx}`} position={[sx * 0.65, 0.18, 0]}>
          <boxGeometry args={[0.04, 0.04, 0.5]} />
          <meshStandardMaterial color="#7f8b9a" metalness={0.62} roughness={0.28} />
        </mesh>
      ))}
      <group position={[0, 0, -0.85]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.62, 0.09, 0.56]} />
          <meshStandardMaterial color="#6f829c" roughness={0.66} />
        </mesh>
        <mesh position={[0, 0.74, -0.26]} castShadow>
          <boxGeometry args={[0.62, 0.56, 0.09]} />
          <meshStandardMaterial color="#6f829c" roughness={0.66} />
        </mesh>
        <mesh position={[0, 0.75, -0.2]}>
          <boxGeometry args={[0.46, 0.36, 0.03]} />
          <meshStandardMaterial color="#2a3a4d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.03, 0.042, 0.42, 6]} />
          <meshStandardMaterial color="#7f8b9a" metalness={0.62} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.04, 10]} />
          <meshStandardMaterial color="#5c6b80" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function HologramSolarSystem({ position = [0, 2.4, 0], scale = 1, color = '#ffd77a', accent = '#6ff0ff' }) {
  const group = useRef();
  const planets = useMemo(
    () => [
      { r: 1.2, size: 0.12, speed: 0.8, color: '#ffb36b', tilt: 0.1 },
      { r: 1.8, size: 0.18, speed: 0.55, color: '#79c8ff', tilt: -0.2 },
      { r: 2.5, size: 0.2, speed: 0.4, color: '#ff8fa0', tilt: 0.25 },
      { r: 3.2, size: 0.28, speed: 0.3, color: '#c7a6ff', tilt: -0.12 },
    ],
    []
  );
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.1;
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.55, 20, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.6} />
      </mesh>
      <sprite scale={[3.2, 3.2, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {planets.map((p, i) => (
        <group key={i} rotation={[p.tilt, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[p.r, 0.008, 4, 64]} />
            <meshBasicMaterial color={accent} transparent opacity={0.35} />
          </mesh>
          <PlanetOrbit r={p.r} size={p.size} speed={p.speed} color={p.color} phase={i * 1.7} />
        </group>
      ))}
    </group>
  );
}

function PlanetOrbit({ r, size, speed, color, phase }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const a = clock.elapsedTime * speed + phase;
    if (ref.current) ref.current.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 10]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
    </mesh>
  );
}

export function HoloPagoda({ position = [0, 1.0, 0], scale = 1, accent = '#8ff6ff' }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.12;
      group.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.7) * 0.1;
    }
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <Pagoda holo scale={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[3.5, 4, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.35} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function ControlScreen({ position = [0, 2, 0], rotation = [0, 0, 0], width = 4, height = 2.2, title = 'SYSTEM', rows = [], accent = '#6ff0ff', theme = 'tech' }) {
  return <DataWall position={position} rotation={rotation} width={width} height={height} title={title} rows={rows} accent={accent} theme={theme} />;
}

export function MineCart({ position = [0, 0, 0], length = 16, speed = 1.2, phase = 0, coal = true }) {
  const cart = useRef();
  useFrame(({ clock }) => {
    if (!cart.current) return;
    const t = ((clock.elapsedTime * speed + phase) / length) % 2;
    const k = t > 1 ? 2 - t : t;
    cart.current.position.x = position[0] + k * length - length / 2;
    cart.current.rotation.y = t > 1 ? Math.PI : 0;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, length, 4]} />
        <meshStandardMaterial color="#6b675f" metalness={0.7} roughness={0.4} />
      </mesh>
      <group ref={cart}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.3, 0.6, 0.9]} />
          <meshStandardMaterial color="#4a4236" metalness={0.5} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <boxGeometry args={[1.1, 0.2, 0.7]} />
          <meshStandardMaterial color="#2a2520" roughness={0.95} />
        </mesh>
        {coal &&
          [[-0.3, 0.86, 0.1], [0.2, 0.9, -0.1], [0.35, 0.84, 0.16], [-0.1, 0.82, 0.2]].map((p, i) => (
            <mesh key={i} position={p} scale={0.15 + i * 0.02}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#171717" roughness={0.95} />
            </mesh>
          ))}
        {[-0.4, 0.4].map((x) =>
          [-0.35, 0.35].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.18, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 8]} />
              <meshStandardMaterial color="#1e1c19" roughness={0.6} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}

export function Conveyor({ position = [0, 0, 0], rotation = [0, 0, 0], length = 16, color = '#3c3a34', accent = '#ffb655' }) {
  const lumps = useRef();
  const count = 12;
  useFrame(({ clock }) => {
    if (!lumps.current) return;
    const dummy = new THREE.Object3D();
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const x = ((i / count) * length + t * 1.2) % length - length / 2;
      dummy.position.set(x, 0.95, (i % 3) * 0.09 - 0.09);
      dummy.rotation.set(t * 0.6 + i, t * 0.4 + i, 0);
      dummy.scale.setScalar(0.14 + (i % 4) * 0.03);
      dummy.updateMatrix();
      lumps.current.setMatrixAt(i, dummy.matrix);
    }
    lumps.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[length, 0.18, 0.75]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.95, s * 0.38]}>
          <boxGeometry args={[length, 0.14, 0.08]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(i - 2.5) * (length / 6), 0.3, 0]}>
          <boxGeometry args={[0.16, 0.8, 0.14]} />
          <meshStandardMaterial color="#5a544a" metalness={0.5} roughness={0.7} />
        </mesh>
      ))}
      <instancedMesh ref={lumps} args={[null, null, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#151515" roughness={0.95} />
      </instancedMesh>
    </group>
  );
}

export function Excavator({ position = [0, 0, 0], rotation = [0, 0, 0], color = '#d8a03c', accent = '#ffcb6a' }) {
  const arm = useRef();
  useFrame(({ clock }) => {
    if (arm.current) arm.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.14 - 0.15;
  });
  return (
    <group position={position} rotation={rotation}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.3, s * 0.75]}>
          <boxGeometry args={[2.6, 0.6, 0.5]} />
          <meshStandardMaterial color="#2f2d29" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[2.0, 0.8, 1.7]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.5, 1.6, 0]}>
        <boxGeometry args={[0.9, 1.1, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[-0.5, 1.65, 0.62]}>
        <boxGeometry args={[0.75, 0.65, 0.05]} />
        <meshStandardMaterial color="#1b2a33" emissive={accent} emissiveIntensity={0.3} />
      </mesh>
      <group ref={arm} position={[0.4, 1.35, 0]}>
        <mesh position={[1.3, 0.7, 0]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[2.8, 0.22, 0.28]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[2.5, 0.1, 0]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[1.7, 0.18, 0.24]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[2.95, -0.55, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.9, 0.7, 1.0]} />
          <meshStandardMaterial color="#4a453c" metalness={0.6} roughness={0.5} />
        </mesh>
      </group>
      <mesh position={[0.8, 1.0, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#fff2b0" emissive="#ffe08a" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

export function Drone({ position = [0, 8, 0], color = '#dfe9ee', accent = '#6ff0ff', phase = 0, radius = 5, speed = 0.4 }) {
  const group = useRef();
  const rotors = useRef([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (group.current) {
      group.current.position.set(position[0] + Math.cos(t) * radius, position[1] + Math.sin(t * 1.7) * 0.5, position[2] + Math.sin(t) * radius);
      group.current.rotation.y = -t;
    }
    rotors.current.forEach((rotor, i) => {
      if (rotor) rotor.rotation.y = clock.elapsedTime * 34 + i * 1.3;
    });
  });
  return (
    <group ref={group} position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.56, 0.16, 0.56]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.26} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshStandardMaterial color="#2c3a42" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.08, 12]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.6} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.14, 0.2]} rotation={[0.35, 0, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color="#141c20" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.14, 0.265]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.03, 10]} />
        <meshStandardMaterial color="#6ff0ff" emissive="#6ff0ff" emissiveIntensity={1.2} metalness={0.4} roughness={0.15} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => (
        <group key={i} position={[x * 0.42, 0, z * 0.42]}>
          <mesh position={[x * -0.18, 0, z * -0.18]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.024, 0.38, 6]} />
            <meshStandardMaterial color="#8a959a" metalness={0.65} roughness={0.28} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.026, 0.026, 0.1, 6]} />
            <meshStandardMaterial color="#6b767c" metalness={0.65} roughness={0.26} />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <torusGeometry args={[0.2, 0.012, 5, 18]} />
            <meshStandardMaterial color="#77838a" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh ref={(el) => { rotors.current[i] = el; }} position={[0, 0.08, 0]}>
            <boxGeometry args={[0.42, 0.008, 0.06]} />
            <meshStandardMaterial color="#b6c2c6" roughness={0.35} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.07, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.42, 0.008, 0.06]} />
            <meshStandardMaterial color="#b6c2c6" roughness={0.35} metalness={0.3} />
          </mesh>
        </group>
      ))}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
        <mesh key={`leg${x}${z}`} position={[x * 0.2, -0.14, z * 0.2]} rotation={[z * 0.3, 0, x * 0.3]}>
          <cylinderGeometry args={[0.012, 0.016, 0.16, 5]} />
          <meshStandardMaterial color="#4a555b" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <sprite position={[0, -0.1, 0]} scale={[0.9, 0.9, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color={accent} transparent opacity={0.28} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

export function HospitalWallPanel({ position = [0, 1.8, 0], rotation = [0, 0, 0], title = 'AI DIAGNOSTICS', rows = [], accent = '#9fe8ff' }) {
  const tex = useMemo(() => screenTexture({ title, subtitle: 'SMART HOSPITAL 2076', rows, accent, theme: 'health' }), [title, rows, accent]);
  return <HoloPanel position={position} rotation={rotation} width={3.4} height={1.9} texture={tex} color={accent} opacity={0.85} bob={false} />;
}

export function MayorPodium({ position = [0, 0, 0], rotation = [0, 0, 0], accent = '#ffd77a' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 1.3, 1.2]} />
        <meshStandardMaterial color="#1b2634" metalness={0.46} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.68, 0.615]}>
        <boxGeometry args={[1.9, 0.7, 0.03]} />
        <meshStandardMaterial color="#0e1822" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.72, 0.635]}>
        <torusGeometry args={[0.31, 0.035, 8, 32]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.72, 0.645]}>
        <icosahedronGeometry args={[0.18, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} metalness={0.5} roughness={0.18} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <boxGeometry args={[2.78, 0.1, 1.38]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.85} metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.4, 0.32]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.68, 0.02, 0.42]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0, 1.42, -0.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.82, 0.5, 0.02]} />
        <meshStandardMaterial color="#0b1520" emissive={accent} emissiveIntensity={0.22} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.05, 8]} />
        <meshStandardMaterial color="#0f1a22" metalness={0.55} roughness={0.34} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={`step${i}`} position={[0, -0.1 - i * 0.12, 1.35 + i * 0.32]}>
          <boxGeometry args={[3.4 + i * 0.5, 0.12, 0.42]} />
          <meshStandardMaterial color="#16222e" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}
      {[-1.15, 1.15].map((x) => (
        <mesh key={`strip${x}`} position={[x, 0.7, 0.62]}>
          <boxGeometry args={[0.05, 1.1, 0.03]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} />
        </mesh>
      ))}
      {[-0.28, 0.28].map((x) => (
        <group key={`mic${x}`} position={[x, 1.44, 0.18]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.014, 0.018, 0.36, 5]} />
            <meshStandardMaterial color="#7f8a94" metalness={0.82} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#20262b" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 1.1, 1.2]} color={accent} intensity={4} distance={4} decay={2} />
    </group>
  );
}

export function LabEquipment({ position = [0, 0, 0], rotation = [0, 0, 0], accent = '#9fe8ff' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.9, 1.6, 0.7]} />
        <meshStandardMaterial color="#e8f2f5" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.25, 0.36]}>
        <boxGeometry args={[0.6, 0.4, 0.03]} />
        <meshStandardMaterial color="#0d2734" emissive={accent} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0.36]}>
        <boxGeometry args={[0.6, 0.04, 0.03]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.2, 10]} />
        <meshStandardMaterial color="#b7cbd2" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

export { themeTexture };
