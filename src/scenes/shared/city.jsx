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
        tint: 0.55 + rng() * 0.6,
        bands: Math.floor(range(rng, 1, 4)),
        beacon: rng() > 0.45,
        garden: rng() > 0.55,
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
        dummy.position.set(b.x, b.h + 1.2, b.z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.9);
        dummy.updateMatrix();
        beacons.current.setMatrixAt(i, dummy.matrix);
      });
      beacons.current.instanceMatrix.needsUpdate = true;
    }
  }, [data, bandData]);

  const beaconCount = useMemo(() => data.filter((b) => b.beacon).length, [data]);

  return (
    <group>
      <instancedMesh ref={body} args={[null, null, count]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={windowTexture(windowVariant)}
          emissiveMap={windowTexture(windowVariant)}
          color="#0a1a28"
          emissive="#53c8f0"
          emissiveIntensity={0.74}
          metalness={0.62}
          roughness={0.42}
        />
      </instancedMesh>
      <instancedMesh ref={bands} args={[null, null, bandData.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0d2634" emissive="#6ff0ff" emissiveIntensity={1.6} metalness={0.6} roughness={0.3} />
      </instancedMesh>
      <instancedMesh ref={beacons} args={[null, null, Math.max(1, beaconCount)]} frustumCulled={false}>
        <sphereGeometry args={[0.55, 8, 6]} />
        <meshStandardMaterial color="#ff7a6a" emissive="#ff6a55" emissiveIntensity={3} />
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
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.y = clock.elapsedTime * 0.16;
  });
  const windowMap = windowTexture(0);
  return (
    <group position={position}>
      <mesh position={[0, height * 0.36, 0]}>
        <boxGeometry args={[width * 1.35, height * 0.72, depth * 1.35]} />
        <meshStandardMaterial map={windowMap} emissiveMap={windowMap} color={tint} emissive={accent} emissiveIntensity={0.55} metalness={0.65} roughness={0.4} />
      </mesh>
      <mesh position={[0, height * 0.58, 0]}>
        <boxGeometry args={[width * 0.82, height * 0.52, depth * 0.82]} />
        <meshStandardMaterial map={windowMap} emissiveMap={windowMap} color={tint} emissive={accent} emissiveIntensity={0.7} metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh position={[0, height * 0.92, 0]}>
        <boxGeometry args={[width * 0.75, 1.0, depth * 0.75]} />
        <meshStandardMaterial color="#153647" emissive={accent} emissiveIntensity={1.4} metalness={0.6} roughness={0.3} />
      </mesh>
      {[0.25, 0.48, 0.72].map((f, i) => (
        <mesh key={i} position={[0, height * f, 0]}>
          <boxGeometry args={[width * (1.42 - i * 0.1), 0.22, depth * (1.42 - i * 0.1)]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={i === 2 ? 2.4 : 1.2} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.2, 0]}>
        <cylinderGeometry args={[width * 0.08, width * 0.16, 3.2, 8]} />
        <meshStandardMaterial color="#2a4a5a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, height + 2.2, 0]}>
        <sphereGeometry args={[0.42, 8, 6]} />
        <meshStandardMaterial color="#ff8a6a" emissive="#ff6a55" emissiveIntensity={3} />
      </mesh>
      <group ref={ring} position={[0, height * 0.82, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[width * 0.75, 0.18, 6, 32]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.7} transparent opacity={0.8} />
        </mesh>
      </group>
      {label && (
        <mesh position={[0, height * 0.55, depth * 0.72]} rotation={[0, 0, 0]}>
          <planeGeometry args={[width * 0.86, width * 0.28]} />
          <meshBasicMaterial map={holoTexture({ title: label, lines: [], accent })} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function Skyway({ points, color = '#6ff0ff', radius = 0.35, supports = true, offsetY = 0 }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4), [points]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 80, radius, 6, false), [curve, radius]);
  const supportData = useMemo(() => {
    if (!supports) return [];
    return Array.from({ length: 9 }, (_, i) => {
      const p = curve.getPointAt((i + 1) / 10);
      return p;
    });
  }, [curve, supports]);
  return (
    <group position={[0, offsetY, 0]}>
      <mesh geometry={tube}>
        <meshStandardMaterial color="#12303f" emissive={color} emissiveIntensity={0.85} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh geometry={tube} scale={[1, 1, 1]} position={[0, -0.16, 0]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} transparent opacity={0.5} metalness={0.4} roughness={0.2} />
      </mesh>
      {supportData.map((p, i) => (
        <mesh key={i} position={[p.x, p.y / 2, p.z]}>
          <cylinderGeometry args={[0.28, 0.42, Math.max(0.5, p.y), 6]} />
          <meshStandardMaterial color="#173b4a" metalness={0.65} roughness={0.4} emissive={color} emissiveIntensity={0.22} />
        </mesh>
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
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 0.75, 1]}>
        <capsuleGeometry args={[0.28, 1.15, 4, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.22} />
      </mesh>
      <mesh position={[0.18, 0.18, 0]} scale={[0.85, 0.55, 0.72]}>
        <sphereGeometry args={[0.44, 14, 10]} />
        <meshStandardMaterial color="#1b3d50" metalness={0.8} roughness={0.12} transparent opacity={0.9} emissive="#2c8fae" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.9, 0.08, 0.62]} />
        <meshStandardMaterial color="#16232c" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.65, -0.12, s * 0.38]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
        </mesh>
      ))}
      <mesh position={[-1.05, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.16, 0.7, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial map={glowTexture('#ffffff')} color={color} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
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
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mat.current) mat.current.opacity = 0.72 + Math.sin(t * 3.4) * 0.07 + Math.sin(t * 17) * 0.025;
    if (bob && group.current) group.current.position.y = position[1] + Math.sin(t * 0.7) * 0.25;
  });
  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.12]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={glowTexture('#ffffff')} color={accent} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={mat}
          map={holoTexture({ title, lines, accent, icon })}
          transparent
          opacity={0.78}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * width * 0.5, 0, 0]}>
          <boxGeometry args={[0.08, height * 1.02, 0.08]} />
          <meshStandardMaterial color="#162d3a" emissive={accent} emissiveIntensity={1.2} />
        </mesh>
      ))}
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
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.16, 0.5, height, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, height + 0.2, 0]}>
        <boxGeometry args={[1.5, 0.55, 0.55]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, height + 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 10]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
      </mesh>
      <group ref={blades} position={[0, height + 0.2, 0.28]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI * 2]} position={[0, 0, 0]}>
            <boxGeometry args={[0.28, height * 1.05, 0.06]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.3, 10, 8]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
        </mesh>
      </group>
      <mesh position={[0, height + 0.5, 0]}>
        <sphereGeometry args={[0.12, 6, 5]} />
        <meshStandardMaterial color="#ff7a6a" emissive="#ff6a55" emissiveIntensity={2.5} />
      </mesh>
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
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[4.6, 1.4, 1.9]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[4.15, 0.65, 1.94]} />
        <meshStandardMaterial color="#153243" metalness={0.6} roughness={0.15} emissive={accent} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[4.7, 0.16, 1.94]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} />
      </mesh>
      {[-1.4, 1.4].flatMap((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} position={[x, 0.23, s * 0.86]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.24, 12]} />
            <meshStandardMaterial color="#1a1f24" roughness={0.8} />
          </mesh>
        ))
      )}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[2.32 * s, 0.75, 0]}>
          <sphereGeometry args={[0.1, 6, 5]} />
          <meshStandardMaterial color="#fff2b0" emissive="#ffe08a" emissiveIntensity={2.4} />
        </mesh>
      ))}
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
      <mesh position={[0, -0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, length * 1.4, 6]} />
        <meshStandardMaterial color="#1b3d4a" metalness={0.6} roughness={0.3} emissive={accent} emissiveIntensity={0.5} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(i - 2.5) * 12, -4, 0]}>
          <boxGeometry args={[0.5, 8, 0.5]} />
          <meshStandardMaterial color="#132d38" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <group ref={train}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 4.6, 0, 0]}>
            <mesh>
              <boxGeometry args={[4.1, 1.6, 1.7]} />
              <meshStandardMaterial color={tint} metalness={0.55} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <boxGeometry args={[3.7, 0.55, 1.74]} />
              <meshStandardMaterial color="#16394a" emissive={accent} emissiveIntensity={0.7} metalness={0.6} roughness={0.15} />
            </mesh>
            <mesh position={[0, -0.62, 0]}>
              <boxGeometry args={[4.15, 0.12, 1.74]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} />
            </mesh>
          </group>
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
      child.material.opacity = pillars[i].op * (0.6 + Math.sin(t * 0.6 + pillars[i].phase) * 0.4);
    });
  });
  return (
    <group ref={group}>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, p.z]}>
          <cylinderGeometry args={[p.w * 0.4, p.w, p.h, 6, 1, true]} />
          <meshBasicMaterial color={color} transparent opacity={p.op} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export function CityGround({ size = 400, color = '#0a141c', grid = true, accent = '#1d6a86' }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.25} />
      </mesh>
      {grid && (
        <gridHelper args={[size, 40, accent, '#123040']} position={[0, 0.02, 0]} />
      )}
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
