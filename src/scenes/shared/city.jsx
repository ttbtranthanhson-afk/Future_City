import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, range } from '../../utils/random';
import { windowTexture, holoTexture, glowTexture } from '../../utils/textures';
import { Tree } from './nature';

export function InstancedCity({
  count = 64,
  area = [180, 180],
  exclude = 24,
  minHeight = 22,
  maxHeight = 95,
  seed = 1,
  windowVariant = 0,
}) {
  const body = useRef();
  const bands = useRef();
  const beacons = useRef();
  const roofs = useRef();
  const antennas = useRef();
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const out = [];
    let guard = 0;
    while (out.length < count && guard < count * 12) {
      guard += 1;
      const x = range(rng, -area[0] / 2, area[0] / 2);
      const z = range(rng, -area[1] / 2, area[1] / 2);
      if (Math.abs(x) < exclude && Math.abs(z) < exclude) continue;
      const w = range(rng, 5, 13);
      const d = range(rng, 5, 13);
      const h = range(rng, minHeight, maxHeight) * (Math.abs(x) < 60 ? 1 : 0.7);
      out.push({
        x,
        z,
        w,
        d,
        h,
        rot: range(rng, -0.2, 0.2),
        tint: 0.6 + rng() * 0.45,
        bands: Math.floor(range(rng, 1, 4)),
        beacon: rng() > 0.45,
        garden: rng() > 0.55,
        antenna: rng() > 0.62,
        antennaH: range(rng, 2.5, 8),
        roofH: range(rng, 0.5, 1.6),
        roofInset: range(rng, 0.72, 0.92),
      });
    }
    return out;
  }, [count, area, exclude, minHeight, maxHeight, seed]);

  const bandData = useMemo(
    () =>
      data.flatMap((b) =>
        Array.from({ length: b.bands }, (_, i) => ({
          x: b.x,
          z: b.z,
          w: b.w + 0.35,
          d: b.d + 0.35,
          y: (b.h * (i + 1)) / (b.bands + 1),
          tint: i,
          rot: b.rot,
        }))
      ),
    [data]
  );

  useLayoutEffect(() => {
    if (!body.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    data.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.rotation.set(0, b.rot, 0);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      body.current.setMatrixAt(i, dummy.matrix);
      color.setRGB(0.7 * b.tint, 0.9 * b.tint, 1.1 * b.tint);
      body.current.setColorAt(i, color);
    });
    body.current.instanceMatrix.needsUpdate = true;
    if (body.current.instanceColor) body.current.instanceColor.needsUpdate = true;

    if (bands.current) {
      bandData.forEach((b, i) => {
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(b.w, 0.16, b.d);
        dummy.updateMatrix();
        bands.current.setMatrixAt(i, dummy.matrix);
      });
      bands.current.instanceMatrix.needsUpdate = true;
    }

    if (beacons.current) {
      const beaconData = data.filter((b) => b.beacon);
      beaconData.forEach((b, i) => {
        dummy.position.set(b.x, b.h + b.roofH + 0.8, b.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.9);
        dummy.updateMatrix();
        beacons.current.setMatrixAt(i, dummy.matrix);
      });
      beacons.current.instanceMatrix.needsUpdate = true;
    }

    if (roofs.current) {
      data.forEach((b, i) => {
        dummy.position.set(b.x, b.h + b.roofH / 2, b.z);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(b.w * b.roofInset, b.roofH, b.d * b.roofInset);
        dummy.updateMatrix();
        roofs.current.setMatrixAt(i, dummy.matrix);
      });
      roofs.current.instanceMatrix.needsUpdate = true;
    }

    if (antennas.current) {
      const list = data.filter((b) => b.antenna);
      list.forEach((b, i) => {
        dummy.position.set(b.x, b.h + b.roofH + b.antennaH / 2, b.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, b.antennaH, 1);
        dummy.updateMatrix();
        antennas.current.setMatrixAt(i, dummy.matrix);
      });
      antennas.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, bandData]);

  const beaconCount = useMemo(() => data.filter((b) => b.beacon).length, [data]);
  const antennaCount = useMemo(() => data.filter((b) => b.antenna).length, [data]);

  return (
    <group>
      <instancedMesh ref={body} args={[null, null, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={windowTexture(windowVariant)}
          emissiveMap={windowTexture(windowVariant)}
          color="#0a1a28"
          emissive="#53c8f0"
          emissiveIntensity={0.8}
          metalness={0.74}
          roughness={0.34}
          envMapIntensity={1.25}
        />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[null, null, data.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#10222e" metalness={0.7} roughness={0.42} emissive="#1d5a70" emissiveIntensity={0.24} />
      </instancedMesh>
      <instancedMesh ref={antennas} args={[null, null, Math.max(1, antennaCount)]} frustumCulled={false}>
        <cylinderGeometry args={[0.12, 0.2, 1, 5]} />
        <meshStandardMaterial color="#2a4652" metalness={0.8} roughness={0.35} emissive="#6ff0ff" emissiveIntensity={0.3} />
      </instancedMesh>
      <instancedMesh ref={bands} args={[null, null, bandData.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0d2634" emissive="#6ff0ff" emissiveIntensity={1.8} metalness={0.65} roughness={0.26} />
      </instancedMesh>
      <instancedMesh ref={beacons} args={[null, null, Math.max(1, beaconCount)]} frustumCulled={false}>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color="#ff7a6a" emissive="#ff6a55" emissiveIntensity={3.4} />
      </instancedMesh>
      {data
        .filter((b) => b.garden)
        .map((b, i) => (
          <group key={i} position={[b.x, b.h + 0.5, b.z]}>
            <mesh>
              <boxGeometry args={[b.w * 0.72, 0.5, b.d * 0.72]} />
              <meshStandardMaterial color="#2f5b3a" roughness={0.9} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * b.w * 0.25, 0.75, 0]} scale={0.6}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={s > 0 ? '#4a7d45' : '#3c6a3e'} flatShading roughness={0.9} />
              </mesh>
            ))}
          </group>
        ))}
    </group>
  );
}

export function HeroTower({ position = [0, 0, 0], width = 16, depth = 16, height = 76, accent = '#6ff0ff', tint = '#0e2436', label = null }) {
  const ring = useRef();
  const ring2 = useRef();
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.y = clock.elapsedTime * 0.16;
    if (ring2.current) ring2.current.rotation.y = -clock.elapsedTime * 0.22;
  });
  const windowMap = windowTexture(0);
  const glass = useMemo(() => new THREE.Color(accent).lerp(new THREE.Color('#0a1a28'), 0.72), [accent]);
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[width * 2.1, 3.2, depth * 2.1]} />
        <meshStandardMaterial color="#10202b" metalness={0.6} roughness={0.5} emissive={accent} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 3.26, 0]} receiveShadow>
        <boxGeometry args={[width * 1.9, 0.18, depth * 1.9]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} metalness={0.6} roughness={0.3} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * width * 0.95, 1.7, sz * depth * 0.95]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 3.4, 0.3]} />
            <meshStandardMaterial color="#1a3a48" emissive={accent} emissiveIntensity={0.8} metalness={0.7} roughness={0.3} />
          </mesh>
        ))
      )}

      <mesh position={[0, height * 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.35, height * 0.72, depth * 1.35]} />
        <meshStandardMaterial map={windowMap} emissiveMap={windowMap} color={tint} emissive={accent} emissiveIntensity={0.62} metalness={0.76} roughness={0.34} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, height * 0.58, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.82, height * 0.52, depth * 0.82]} />
        <meshStandardMaterial map={windowMap} emissiveMap={windowMap} color={tint} emissive={accent} emissiveIntensity={0.8} metalness={0.76} roughness={0.3} envMapIntensity={1.3} />
      </mesh>

      {[
        [0.2, 1.36, 0.55],
        [0.36, 1.2, 0.7],
        [0.5, 1.05, 0.85],
        [0.64, 0.9, 1],
        [0.78, 0.8, 1.1],
      ].map(([f, w, inten], i) => (
        <group key={f}>
          <mesh position={[0, height * f, 0]} castShadow>
            <boxGeometry args={[width * w, 0.24, depth * w]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={inten} metalness={0.6} roughness={0.28} />
          </mesh>
          <mesh position={[0, height * f + 0.28, 0]}>
            <boxGeometry args={[width * (w + 0.02), 0.06, depth * (w + 0.02)]} />
            <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.55} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * width * 0.7, height * 0.5, 0]} castShadow>
          <boxGeometry args={[0.34, height * 0.86, depth * 1.28]} />
          <meshStandardMaterial color={glass} emissive={accent} emissiveIntensity={0.42} metalness={0.82} roughness={0.22} transparent opacity={0.9} />
        </mesh>
      ))}

      <mesh position={[0, height * 0.92, 0]} castShadow>
        <boxGeometry args={[width * 0.75, 1.2, depth * 0.75]} />
        <meshStandardMaterial color="#153647" emissive={accent} emissiveIntensity={1.6} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, height * 0.985, 0]}>
        <boxGeometry args={[width * 0.6, 0.08, depth * 0.6]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>

      <mesh position={[0, height + 0.35, 0]} castShadow>
        <cylinderGeometry args={[width * 0.07, width * 0.17, 3.6, 10]} />
        <meshStandardMaterial color="#2a4a5a" metalness={0.85} roughness={0.28} />
      </mesh>
      {[0.6, 1.2, 1.8].map((y, i) => (
        <mesh key={i} position={[0, height + y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[width * (0.2 - i * 0.03), 0.035, 6, 20]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[0, height + 2.6, 0]}>
        <sphereGeometry args={[0.42, 10, 8]} />
        <meshStandardMaterial color="#ff8a6a" emissive="#ff6a55" emissiveIntensity={3.4} />
      </mesh>
      <pointLight position={[0, height + 2.6, 0]} color="#ff7a64" intensity={2.4} distance={22} decay={2} />

      <group ref={ring} position={[0, height * 0.82, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[width * 0.78, 0.18, 8, 48]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.9} transparent opacity={0.85} metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.45, 0]}>
          <torusGeometry args={[width * 0.62, 0.05, 6, 40]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} transparent opacity={0.7} />
        </mesh>
      </group>
      <group ref={ring2} position={[0, height * 0.66, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[width * 0.95, 0.05, 6, 40]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} transparent opacity={0.55} />
        </mesh>
      </group>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[width * 0.9, width * 1.35, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {label && (
        <mesh position={[0, height * 0.55, depth * 0.74]}>
          <planeGeometry args={[width * 0.86, width * 0.28]} />
          <meshBasicMaterial map={holoTexture({ title: label, lines: [], accent })} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function Skyway({ points, color = '#6ff0ff', radius = 0.35, supports = true, offsetY = 0 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4), [points]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 96, radius, 8, false), [curve, radius]);
  const railTube = useMemo(() => new THREE.TubeGeometry(curve, 96, radius * 0.22, 5, false), [curve, radius]);
  const supportData = useMemo(() => {
    if (!supports) return [];
    return Array.from({ length: 11 }, (_, i) => {
      const p = curve.getPointAt((i + 1) / 12);
      return p;
    });
  }, [curve, supports]);
  const pulses = useRef();
  const pulseData = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ offset: i / 14, speed: 0.04 + (i % 3) * 0.008 })), []);
  useFrame(({ clock }) => {
    if (!pulses.current) return;
    const t = clock.elapsedTime;
    pulses.current.children.forEach((child, i) => {
      const u = (pulseData[i].offset + t * pulseData[i].speed) % 1;
      const p = curve.getPointAt(u);
      child.position.copy(p);
      child.position.y += radius * 0.9;
    });
  });
  return (
    <group position={[0, offsetY, 0]}>
      <mesh geometry={tube} castShadow>
        <meshStandardMaterial color="#12303f" emissive={color} emissiveIntensity={0.9} metalness={0.72} roughness={0.26} envMapIntensity={1.2} />
      </mesh>
      <mesh geometry={railTube} position={[0, radius * 0.85, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={0.7} metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh geometry={railTube} position={[0, -radius * 0.85, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} transparent opacity={0.55} metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh geometry={tube} position={[0, -0.16, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={0.45} metalness={0.4} roughness={0.2} />
      </mesh>
      <group ref={pulses}>
        {pulseData.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[radius * 0.42, 6, 5]} />
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {supportData.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.y / 2, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.46, Math.max(0.5, p.y), 8]} />
            <meshStandardMaterial color="#173b4a" metalness={0.75} roughness={0.35} emissive={color} emissiveIntensity={0.24} />
          </mesh>
          <mesh position={[0, p.y, 0]}>
            <cylinderGeometry args={[0.5, 0.34, 0.18, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.62, 0.72, 0.5, 10]} />
            <meshStandardMaterial color="#0f222c" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function carGeometry() {
  return null;
}

export function FlyingCar({ curve, speed = 0.035, offset = 0, lane = 0, yOffset = 0, color = '#6ff0ff', bodyColor = '#dfe9ee', scale = 1 }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current || !curve) return;
    const t = (offset + clock.elapsedTime * speed) % 1;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    group.current.position.copy(p).addScaledVector(side, lane).add(new THREE.Vector3(0, yOffset + Math.sin(clock.elapsedTime * 1.3 + offset * 20) * 0.12, 0));
    const look = p.clone().addScaledVector(side, lane).add(tangent);
    look.y += yOffset;
    group.current.lookAt(look);
  });
  return (
    <group ref={group} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 0.72, 1]} castShadow>
        <capsuleGeometry args={[0.29, 1.2, 5, 12]} />
        <meshStandardMaterial color={bodyColor} metalness={0.78} roughness={0.2} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[1.02, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.26, 0.55, 10]} />
        <meshStandardMaterial color={bodyColor} metalness={0.78} roughness={0.2} />
      </mesh>
      <mesh position={[0.18, 0.19, 0]} scale={[0.9, 0.58, 0.74]}>
        <sphereGeometry args={[0.44, 18, 14]} />
        <meshPhysicalMaterial color="#1b3d50" metalness={0.85} roughness={0.08} transparent opacity={0.82} emissive="#2c8fae" emissiveIntensity={0.35} envMapIntensity={1.6} />
      </mesh>
      <mesh position={[0.02, 0.05, 0]} scale={[1.1, 0.4, 0.55]}>
        <sphereGeometry args={[0.5, 14, 10]} />
        <meshStandardMaterial color={bodyColor} metalness={0.8} roughness={0.22} />
      </mesh>
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[1.94, 0.09, 0.7]} />
        <meshStandardMaterial color="#16232c" metalness={0.72} roughness={0.28} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, -0.08, s * 0.34]}>
          <mesh position={[0, 0, s * 0.15]} rotation={[s * 0.28, 0, 0]} castShadow>
            <boxGeometry args={[1.25, 0.05, 0.42]} />
            <meshStandardMaterial color={bodyColor} metalness={0.75} roughness={0.22} />
          </mesh>
          <mesh position={[-0.92, 0, s * 0.2]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.36, 0.28, 0.05]} />
            <meshStandardMaterial color="#253d49" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.62, -0.14, s * 0.4]}>
          <sphereGeometry args={[0.11, 10, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.2} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`lamp${s}`} position={[1.02, 0.02, s * 0.16]}>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshStandardMaterial color="#fff4d2" emissive="#ffe6a8" emissiveIntensity={3.4} />
        </mesh>
      ))}
      <mesh position={[-1.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.045, 8, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <mesh position={[-1.12, 0, 0]}>
        <circleGeometry args={[0.18, 18]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-1.55, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 1.1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.24} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshBasicMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.26} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function SkyTraffic({ points, count = 10, color = '#6ff0ff', speed = 0.03, spread = 22, seed = 3 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), true, 'catmullrom', 0.35), [points]);
  const cars = useMemo(() => {
    const rng = mulberry32(seed);
    const palette = ['#dfe9ee', '#c8d8dd', '#ffd9a0', '#b9e8ff', '#e7e2f0'];
    return Array.from({ length: count }, (_, i) => ({
      offset: i / count + range(rng, -0.02, 0.02),
      lane: range(rng, -spread, spread),
      yOffset: range(rng, -5, 5),
      speed: speed * range(rng, 0.6, 1.4),
      color: rng() > 0.5 ? color : '#ffd27a',
      bodyColor: palette[Math.floor(rng() * palette.length)],
      scale: range(rng, 0.8, 1.35),
    }));
  }, [count, color, speed, spread, seed]);
  return (
    <group>
      {cars.map((c, i) => (
        <FlyingCar key={i} curve={curve} {...c} />
      ))}
    </group>
  );
}

export function HoloBillboard({ position = [0, 20, 0], rotation = [0, 0, 0], width = 16, height = 8, title = '', lines = [], accent = '#6ff0ff', icon = 'tech', bob = true }) {
  const group = useRef();
  const mat = useRef();
  const scan = useRef();
  const scanMat = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mat.current) mat.current.opacity = 0.74 + Math.sin(t * 3.4) * 0.06 + Math.sin(t * 17) * 0.02;
    if (bob && group.current) group.current.position.y = position[1] + Math.sin(t * 0.7) * 0.25;
    if (scan.current) {
      scan.current.position.y = ((t * 0.55) % 1.6 - 0.8) * height;
      if (scanMat.current) scanMat.current.opacity = 0.16 + Math.sin(t * 6) * 0.05;
    }
  });
  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.14]}>
        <planeGeometry args={[width * 1.08, height * 1.08]} />
        <meshBasicMaterial map={glowTexture('#ffffff')} color={accent} transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={mat}
          map={holoTexture({ title, lines, accent, icon })}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={scan} position={[0, 0, 0.03]}>
        <planeGeometry args={[width, 0.07]} />
        <meshBasicMaterial ref={scanMat} color={accent} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * width * 0.52, 0, -0.06]}>
          <mesh>
            <boxGeometry args={[0.1, height * 1.04, 0.14]} />
            <meshStandardMaterial color="#162d3a" emissive={accent} emissiveIntensity={1.4} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -height * 0.52, 0.08]}>
            <boxGeometry args={[0.26, 0.05, 0.24]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} />
          </mesh>
          <mesh position={[0, height * 0.52, 0.08]}>
            <boxGeometry args={[0.26, 0.05, 0.24]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -height * 0.55, 0]}>
        <boxGeometry args={[width * 1.02, 0.05, 0.24]} />
        <meshStandardMaterial color="#162d3a" emissive={accent} emissiveIntensity={0.9} metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function WindTurbine({ position = [0, 0, 0], height = 30, scale = 1, color = '#e8f0f2', accent = '#6ff0ff', phase = 0 }) {
  const blades = useRef();
  useFrame(({ clock }) => {
    if (blades.current) blades.current.rotation.z = clock.elapsedTime * 1.3 + phase;
  });
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.35, 0.7, 18]} />
        <meshStandardMaterial color="#8a9498" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.54, height, 12]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.3} envMapIntensity={1.1} />
      </mesh>
      {[0.3, 0.55, 0.8].map((f, i) => (
        <mesh key={i} position={[0, height * f, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5 - f * 0.38, 0.025, 6, 14]} />
          <meshStandardMaterial color="#aab6b8" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.2, 0]} castShadow>
        <boxGeometry args={[1.6, 0.58, 0.58]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh position={[0, height + 0.2, 0.1]} castShadow>
        <boxGeometry args={[0.9, 0.68, 0.44]} />
        <meshStandardMaterial color="#c6d4d6" roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, height + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.5, 12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} metalness={0.4} roughness={0.3} />
      </mesh>
      <group ref={blades} position={[0, height + 0.2, 0.3]}>
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]}>
            <mesh position={[0, height * 0.27, 0]} castShadow>
              <boxGeometry args={[0.24, height * 0.56, 0.075]} />
              <meshStandardMaterial color={color} roughness={0.44} metalness={0.24} />
            </mesh>
            <mesh position={[0, height * 0.62, 0]} castShadow>
              <boxGeometry args={[0.15, height * 0.26, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.44} metalness={0.24} />
            </mesh>
          </group>
        ))}
        <mesh>
          <sphereGeometry args={[0.32, 12, 10]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.3} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.03, 6, 20]} />
          <meshStandardMaterial color="#e6f6f8" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>
      <mesh position={[0, height + 0.5, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color="#ff7a6a" emissive="#ff6a55" emissiveIntensity={2.8} />
      </mesh>
      <pointLight position={[0, height + 0.5, 0]} color="#ff6a55" intensity={1.2} distance={16} decay={2} />
    </group>
  );
}

export function WindFarm({ center = [0, 0, 0], count = 4, spacing = 12, height = 32, rotation = [0, 0, 0] }) {
  return (
    <group position={center} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <WindTurbine key={i} position={[i * spacing - spacing * (count - 1) * 0.5, 0, 0]} height={height} phase={i * 1.7} scale={height / 32} />
      ))}
    </group>
  );
}

export function SolarFarm({ position = [0, 0, 0], rows = 3, cols = 5, gap = 3.2, accent = '#6ff0ff' }) {
  const panels = useMemo(() => {
    const out = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        out.push([(c - (cols - 1) / 2) * gap, 0, (r - (rows - 1) / 2) * gap * 1.4]);
      }
    }
    return out;
  }, [rows, cols, gap]);
  const post = useRef();
  const panel = useRef();
  useLayoutEffect(() => {
    if (!panel.current || !post.current) return;
    const dummy = new THREE.Object3D();
    panels.forEach((p, i) => {
      dummy.position.set(p[0], 1.35, p[2]);
      dummy.rotation.set(-0.45, 0, 0);
      dummy.scale.set(2.2, 0.08, 1.5);
      dummy.updateMatrix();
      panel.current.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p[0], 0.68, p[2]);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      post.current.setMatrixAt(i, dummy.matrix);
    });
    panel.current.instanceMatrix.needsUpdate = true;
    post.current.instanceMatrix.needsUpdate = true;
  }, [panels]);
  return (
    <group position={position}>
      <instancedMesh ref={panel} args={[null, null, panels.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a2439" metalness={0.7} roughness={0.25} emissive="#1e6f8a" emissiveIntensity={0.35} />
      </instancedMesh>
      <instancedMesh ref={post} args={[null, null, panels.length]}>
        <cylinderGeometry args={[0.04, 0.07, 1.35, 6]} />
        <meshStandardMaterial color="#7d8b90" metalness={0.6} roughness={0.4} />
      </instancedMesh>
      {panels.map((p, i) => (
        <mesh key={i} position={[p[0], 1.38, p[2] + 0.73]} rotation={[-0.45, 0, 0]}>
          <planeGeometry args={[2.15, 0.03]} />
          <meshBasicMaterial color={accent} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function AutonomousBus({ from = [-40, 1, 0], to = [40, 1, 0], speed = 2.2, phase = 0, color = '#e9f3f5', accent = '#6ff0ff' }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    const span = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
    const t = ((clock.elapsedTime * speed) / span.length() + phase) % 2;
    const k = t > 1 ? 2 - t : t;
    group.current.position.set(from[0] + span.x * k, from[1], from[2] + span.z * k);
    group.current.rotation.y = t > 1 ? Math.atan2(-span.x, -span.z) : Math.atan2(span.x, span.z);
  });
  return (
    <group ref={group}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[4.7, 1.55, 1.94]} />
        <meshPhysicalMaterial color={color} metalness={0.55} roughness={0.24} clearcoat={1} clearcoatRoughness={0.12} envMapIntensity={1.3} />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <boxGeometry args={[4.22, 0.72, 1.98]} />
        <meshPhysicalMaterial color="#163a4c" metalness={0.7} roughness={0.08} transparent opacity={0.86} emissive={accent} emissiveIntensity={0.4} envMapIntensity={1.5} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[4.3, 0.12, 1.6]} />
        <meshStandardMaterial color="#c8d3d6" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[4.76, 0.16, 1.98]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.4} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[4.6, 0.2, 1.9]} />
        <meshStandardMaterial color="#141b20" roughness={0.7} metalness={0.2} />
      </mesh>
      {[-1.42, 1.42].flatMap((x) =>
        [-1, 1].map((s) => (
          <group key={`${x}${s}`} position={[x, 0.34, s * 0.9]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.26, 18]} />
              <meshStandardMaterial color="#171c20" roughness={0.85} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, s * 0.13]}>
              <cylinderGeometry args={[0.17, 0.17, 0.02, 12]} />
              <meshStandardMaterial color="#9aa6ac" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))
      )}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[2.36 * s, 0.8, 0]}>
          <boxGeometry args={[0.06, 0.16, 1.5]} />
          <meshStandardMaterial color="#fff2b0" emissive="#ffe08a" emissiveIntensity={2.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.18, 12]} />
        <meshStandardMaterial color="#20282e" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 1.67, 0]}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} metalness={0.6} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[2.35, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 0.24]} />
        <meshBasicMaterial map={holoTexture({ title: '2076', lines: [], accent })} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function ElevatedTrain({ position = [0, 8, 0], length = 90, speed = 8, tint = '#dfe9ee', accent = '#6ff0ff' }) {
  const train = useRef();
  useFrame(({ clock }) => {
    if (!train.current) return;
    const span = length;
    const t = ((clock.elapsedTime * speed) % (span * 2)) / span;
    const k = t > 1 ? 2 - t : t;
    train.current.position.x = -span / 2 + span * k;
    train.current.rotation.y = t > 1 ? Math.PI : 0;
  });
  return (
    <group position={position}>
      <mesh position={[0, -0.55, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, length * 1.4, 8]} />
        <meshStandardMaterial color="#1b3d4a" metalness={0.7} roughness={0.28} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
      {[-0.72, 0.72].map((z) => (
        <mesh key={z} position={[0, -0.68, z]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[length * 1.4, 0.08, 0.08]} />
          <meshStandardMaterial color="#9fb2b8" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={`s${i}`} position={[-length * 0.65 + i * (length * 1.3 / 15), -0.72, 0]}>
          <boxGeometry args={[0.35, 0.08, 2.2]} />
          <meshStandardMaterial color="#1c313a" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(i - 2.5) * 12, -4, 0]} castShadow>
          <boxGeometry args={[0.55, 8, 0.55]} />
          <meshStandardMaterial color="#132d38" metalness={0.65} roughness={0.38} />
        </mesh>
      ))}
      <group ref={train}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 4.6, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[4.15, 1.65, 1.74]} />
              <meshPhysicalMaterial color={tint} metalness={0.62} roughness={0.2} clearcoat={0.8} clearcoatRoughness={0.15} envMapIntensity={1.3} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[3.72, 0.55, 1.78]} />
              <meshPhysicalMaterial color="#16394a" emissive={accent} emissiveIntensity={0.75} metalness={0.7} roughness={0.08} transparent opacity={0.88} envMapIntensity={1.4} />
            </mesh>
            <mesh position={[0, -0.62, 0]}>
              <boxGeometry args={[4.2, 0.12, 1.78]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} metalness={0.4} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.2, i === 0 ? -0.88 : 0.88]}>
              <boxGeometry args={[0.85, 1.2, 0.03]} />
              <meshStandardMaterial color="#20343c" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.74, 0]}>
              <boxGeometry args={[3.6, 0.16, 1.4]} />
              <meshStandardMaterial color="#101b20" roughness={0.7} metalness={0.4} />
            </mesh>
            {[-1.4, 1.4].map((x) => (
              <mesh key={x} position={[x, -0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.24, 0.24, 1.5, 10]} />
                <meshStandardMaterial color="#161d21" roughness={0.8} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[-2.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <coneGeometry args={[0.86, 1.2, 8]} />
          <meshStandardMaterial color={tint} metalness={0.6} roughness={0.22} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-2.86, 0.1, s * 0.3]}>
            <sphereGeometry args={[0.09, 8, 6]} />
            <meshStandardMaterial color="#fff2c0" emissive="#ffe6a0" emissiveIntensity={2.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function LightPillars({ count = 18, spread = 90, height = 40, color = '#6ff0ff', seed = 4 }) {
  const pillars = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: range(rng, -spread, spread),
      z: range(rng, -spread, spread),
      h: height * range(rng, 0.5, 1.5),
      w: range(rng, 0.2, 0.8),
      phase: range(rng, 0, 6),
      op: range(rng, 0.15, 0.55),
    }));
  }, [count, spread, height, seed]);
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const outer = child.children[0];
      const inner = child.children[1];
      const pulse = 0.6 + Math.sin(t * 0.6 + pillars[i].phase) * 0.4;
      if (outer?.material) outer.material.opacity = pillars[i].op * pulse;
      if (inner?.material) inner.material.opacity = pillars[i].op * pulse * 1.8;
    });
  });
  return (
    <group ref={group}>
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.h / 2, 0]}>
            <cylinderGeometry args={[p.w * 0.4, p.w, p.h, 8, 1, true]} />
            <meshBasicMaterial color={color} transparent opacity={p.op} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, p.h / 2, 0]}>
            <cylinderGeometry args={[p.w * 0.12, p.w * 0.18, p.h * 0.96, 6, 1, true]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={p.op * 1.8} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.w * 0.9, p.w * 1.5, 18]} />
            <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function CityGround({ size = 400, color = '#0a141c', grid = true, accent = '#1d6a86' }) {
  const avenues = useMemo(() => {
    const out = [];
    for (let i = -2; i <= 2; i += 1) out.push(i);
    return out;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={color} roughness={0.42} metalness={0.4} envMapIntensity={0.7} />
      </mesh>

      {avenues.map((i) => (
        <group key={`x${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005 + i * 0.0004, i * size * 0.17]}>
            <planeGeometry args={[size, size * 0.042]} />
            <meshStandardMaterial color="#0c1820" roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, i * size * 0.17]}>
            <planeGeometry args={[size, 0.35]} />
            <meshBasicMaterial color={accent} transparent opacity={0.36} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, i * size * 0.17 + size * 0.012]}>
            <planeGeometry args={[size, 0.14]} />
            <meshBasicMaterial color="#d7f7ff" transparent opacity={0.24} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, i * size * 0.17 - size * 0.012]}>
            <planeGeometry args={[size, 0.14]} />
            <meshBasicMaterial color="#d7f7ff" transparent opacity={0.24} />
          </mesh>
        </group>
      ))}

      {avenues.map((i) => (
        <group key={`z${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[i * size * 0.17, 0.006 + i * 0.0004, 0]}>
            <planeGeometry args={[size, size * 0.042]} />
            <meshStandardMaterial color="#0c1820" roughness={0.5} metalness={0.35} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[i * size * 0.17, 0.012, 0]}>
            <planeGeometry args={[size, 0.35]} />
            <meshBasicMaterial color={accent} transparent opacity={0.36} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[size * 0.2, size * 0.215, 96]} />
        <meshStandardMaterial color="#0e1d26" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[size * 0.207, size * 0.209, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <ringGeometry args={[size * 0.2, size * 0.2015, 96]} />
        <meshBasicMaterial color="#d7f7ff" transparent opacity={0.3} />
      </mesh>

      {grid && <gridHelper args={[size, 60, accent, '#0f2632']} position={[0, 0.024, 0]} />}
    </group>
  );
}

export function PlazaTrees({ count = 10, radius = 18, height = 0.1 }) {
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return <Tree key={i} position={[Math.cos(a) * radius, height, Math.sin(a) * radius]} scale={0.9 + (i % 3) * 0.13} hue={i} phase={i} />;
      })}
    </group>
  );
}

export { carGeometry };
