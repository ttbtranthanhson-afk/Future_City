import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, range } from '../../utils/random';

function islandGeometry(seed) {
  const rng = mulberry32(seed);
  const geo = new THREE.CylinderGeometry(1, 1.3, 1, 11, 7, false);
  const pos = geo.attributes.position;
  const colors = [];
  const rock = new THREE.Color('#6f7c6d');
  const rockDark = new THREE.Color('#4c584f');
  const green = new THREE.Color('#4e7f4a');
  const green2 = new THREE.Color('#6f9c5a');
  const a = range(rng, 0, 6.28);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const radius = Math.sqrt(x * x + z * z);
    if (radius > 0.01) {
      const n =
        1 +
        0.24 * Math.sin(angle * 3 + a) +
        0.16 * Math.sin(angle * 7 + y * 8 + seed) +
        0.1 * Math.sin(y * 15 + angle * 2);
      const taper = 1 - Math.max(0, y + 0.5) * 0.12;
      pos.setX(i, x * n * 1.05);
      pos.setZ(i, z * n * 1.05);
      pos.setY(i, y + Math.sin(angle * 4 + y * 6) * 0.02 + taper * 0);
    }
    const top = y > 0.28;
    const c = top ? (rng() > 0.5 ? green : green2) : rng() > 0.5 ? rock : rockDark;
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function LimestoneIsland({
  position = [0, 0, 0],
  height = 34,
  width = 18,
  seed = 1,
  rotation = [0, 0, 0],
  trees = true,
}) {
  const geometry = useMemo(() => islandGeometry(seed), [seed]);
  const treeData = useMemo(() => {
    const rng = mulberry32(seed + 99);
    return Array.from({ length: Math.floor(range(rng, 3, 7)) }, () => ({
      x: range(rng, -0.32, 0.32),
      z: range(rng, -0.32, 0.32),
      s: range(rng, 0.06, 0.14),
    }));
  }, [seed]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} scale={[width, height, width * range(mulberry32(seed), 0.7, 1.05)]} castShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} metalness={0.02} />
      </mesh>
      {trees &&
        treeData.map((t, i) => (
          <group key={i} position={[t.x * width, height * 0.52, t.z * width]} scale={[t.s * width, t.s * height, t.s * width]}>
            <mesh position={[0, 0.5, 0]}>
              <coneGeometry args={[0.5, 1.3, 6]} />
              <meshStandardMaterial color={i % 2 ? '#3d6b3c' : '#4b7d45'} roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.08, 0.11, 0.5, 5]} />
              <meshStandardMaterial color="#5a4632" roughness={0.95} />
            </mesh>
          </group>
        ))}
    </group>
  );
}

export function IslandCluster({ center = [0, 0, 0], count = 6, spread = 40, seed = 3, scale = 1 }) {
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      pos: [center[0] + range(rng, -spread, spread), center[1], center[2] + range(rng, -spread, spread)],
      height: range(rng, 18, 55) * scale,
      width: range(rng, 9, 24) * scale,
      seed: seed * 31 + i * 7,
      rot: [0, range(rng, 0, Math.PI * 2), 0],
    }));
  }, [center, count, spread, seed, scale]);
  return (
    <group>
      {data.map((d, i) => (
        <LimestoneIsland key={i} position={d.pos} height={d.height} width={d.width} seed={d.seed} rotation={d.rot} />
      ))}
    </group>
  );
}

function mountainGeometry(seed, steep = 1) {
  const geo = new THREE.ConeGeometry(1, 1, 12, 8, false);
  const pos = geo.attributes.position;
  const colors = [];
  const rock = new THREE.Color('#586352');
  const green = new THREE.Color('#3f6b3f');
  const green2 = new THREE.Color('#557b47');
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const n = 1 + 0.18 * Math.sin(angle * 4 + seed) + 0.1 * Math.sin(y * 9 + seed * 2) + 0.08 * Math.sin(angle * 9);
    pos.setX(i, x * n);
    pos.setZ(i, z * n);
    pos.setY(i, y + Math.sin(angle * 5) * 0.02);
    const high = y < -0.15;
    const c = high ? (Math.sin(angle * 3 + seed) > 0 ? green : green2) : rock;
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.scale(1, steep, 1);
  return geo;
}

export function Mountain({ position = [0, 0, 0], height = 50, width = 45, seed = 7, rotation = [0, 0, 0] }) {
  const geo = useMemo(() => mountainGeometry(seed), [seed]);
  const rng = useMemo(() => mulberry32(seed + 5), [seed]);
  const trees = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        a: range(rng, 0, Math.PI * 2),
        r: range(rng, 0.1, 0.75),
        h: range(rng, 0.05, 0.4),
        s: range(rng, 0.6, 1.4),
      })),
    [rng]
  );
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} scale={[width, height, width * 0.8]}>
        <meshStandardMaterial vertexColors flatShading roughness={1} />
      </mesh>
      {trees.map((t, i) => {
        const rr = t.r * width * 0.4;
        return (
          <mesh key={i} position={[Math.cos(t.a) * rr, height * (0.5 - t.h), Math.sin(t.a) * rr * 0.8]} scale={t.s}>
            <coneGeometry args={[1, 3, 6]} />
            <meshStandardMaterial color={i % 2 ? '#2f5a37' : '#3c6a3e'} flatShading roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

export function MountainRange({ center = [0, 0, 0], count = 5, spread = 80, seed = 12, scale = 1 }) {
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      pos: [center[0] + range(rng, -spread, spread), center[1], center[2] + range(rng, -spread * 0.5, spread * 0.5)],
      height: range(rng, 40, 100) * scale,
      width: range(rng, 35, 70) * scale,
      seed: seed + i * 13,
      rot: [0, range(rng, 0, Math.PI * 2), 0],
    }));
  }, [center, count, spread, seed, scale]);
  return (
    <group>
      {data.map((d, i) => (
        <Mountain key={i} position={d.pos} height={d.height} width={d.width} seed={d.seed} rotation={d.rot} />
      ))}
    </group>
  );
}

export function Tree({ position = [0, 0, 0], scale = 1, hue = 0, sway = true, phase = 0 }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current || !sway) return;
    const t = clock.elapsedTime + phase;
    group.current.rotation.z = Math.sin(t * 0.7) * 0.025;
    group.current.rotation.x = Math.cos(t * 0.5) * 0.015;
  });
  const palette = ['#3c6a3e', '#4a7d45', '#548c4d', '#39633d'];
  return (
    <group ref={group} position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.09, 0.16, 1.8, 6]} />
        <meshStandardMaterial color="#5a4632" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={palette[hue % palette.length]} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0.32, 2.65, 0.1]}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={palette[(hue + 1) % palette.length]} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[-0.3, 2.5, -0.12]}>
        <icosahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color={palette[(hue + 2) % palette.length]} flatShading roughness={0.95} />
      </mesh>
    </group>
  );
}

export function TreeField({ count = 70, center = [0, 0, 0], area = [80, 80], seed = 21, scale = 1, exclude = 0 }) {
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    const out = [];
    let guard = 0;
    while (out.length < count && guard < count * 8) {
      guard += 1;
      const x = center[0] + range(rng, -area[0] / 2, area[0] / 2);
      const z = center[2] + range(rng, -area[1] / 2, area[1] / 2);
      if (Math.abs(x) < exclude && Math.abs(z) < exclude) continue;
      out.push({ x, z, s: range(rng, 0.5, 1.3) * scale, hue: Math.floor(rng() * 4) });
    }
    return out;
  }, [count, center, area, seed, scale, exclude]);
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      child.rotation.z = Math.sin(t * 0.55 + i * 0.8) * 0.018;
    });
  });
  return (
    <group ref={group}>
      {data.map((d, i) => (
        <Tree key={i} position={[d.x, 0, d.z]} scale={d.s} hue={d.hue} sway={false} phase={i} />
      ))}
    </group>
  );
}

export function Forest({ count = 60, center = [0, 0, 0], area = [100, 100], seed = 31, scale = 1 }) {
  const { trunkGeo, foliageGeo, data } = useMemo(() => {
    const rng = mulberry32(seed);
    return {
      trunkGeo: new THREE.CylinderGeometry(0.1, 0.16, 1.7, 5),
      foliageGeo: new THREE.IcosahedronGeometry(0.9, 0),
      data: Array.from({ length: count }, () => ({
        x: center[0] + range(rng, -area[0] / 2, area[0] / 2),
        z: center[2] + range(rng, -area[1] / 2, area[1] / 2),
        s: range(rng, 0.7, 1.6) * scale,
        rot: range(rng, 0, Math.PI * 2),
        tint: range(rng, 0.7, 1.15),
      })),
    };
  }, [count, center, area, seed, scale]);
  const trunk = useRef();
  const foliage = useRef();
  useLayoutEffect(() => {
    if (!trunk.current || !foliage.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    data.forEach((d, i) => {
      dummy.position.set(d.x, d.s * 0.85, d.z);
      dummy.rotation.set(0, d.rot, 0);
      dummy.scale.set(d.s, d.s, d.s);
      dummy.updateMatrix();
      trunk.current.setMatrixAt(i, dummy.matrix);
      dummy.position.y = d.s * 2.1;
      dummy.scale.set(d.s * 0.9, d.s * 0.85, d.s * 0.9);
      dummy.updateMatrix();
      foliage.current.setMatrixAt(i, dummy.matrix);
      color.set('#4a7d45').multiplyScalar(d.tint);
      foliage.current.setColorAt(i, color);
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    foliage.current.instanceMatrix.needsUpdate = true;
    if (foliage.current.instanceColor) foliage.current.instanceColor.needsUpdate = true;
  }, [data]);
  return (
    <group>
      <instancedMesh ref={trunk} args={[trunkGeo, null, count]}>
        <meshStandardMaterial color="#5a4632" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={foliage} args={[foliageGeo, null, count]}>
        <meshStandardMaterial color="#4a7d45" flatShading roughness={0.95} />
      </instancedMesh>
    </group>
  );
}

export function Coral({ position = [0, 0, 0], scale = 1, color = '#e27a8a', seed = 2 }) {
  const group = useRef();
  const branches = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: 9 }, () => ({
      angle: range(rng, 0, Math.PI * 2),
      tilt: range(rng, 0.25, 0.8),
      len: range(rng, 0.5, 1.4),
      s: range(rng, 0.4, 1),
    }));
  }, [seed]);
  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.5 + seed) * 0.03;
  });
  return (
    <group ref={group} position={position} scale={scale}>
      {branches.map((b, i) => (
        <group key={i} rotation={[0, b.angle, 0]}>
          <mesh position={[0, b.len * 0.5, 0]} rotation={[b.tilt, 0, 0]}>
            <cylinderGeometry args={[0.035 * b.s, 0.075 * b.s, b.len, 5]} />
            <meshStandardMaterial color={color} roughness={0.8} emissive={color} emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[0, b.len * 0.98, 0]} rotation={[b.tilt, 0, 0]}>
            <sphereGeometry args={[0.11 * b.s, 6, 5]} />
            <meshStandardMaterial color={color} roughness={0.7} emissive={color} emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Reef({ position = [0, 0, 0], radius = 10, count = 16, seed = 5 }) {
  const corals = useMemo(() => {
    const rng = mulberry32(seed);
    const cols = ['#e27a8a', '#f0a35e', '#7bd8c8', '#b58bff', '#ffd27a', '#f07a6a'];
    return Array.from({ length: count }, () => {
      const a = range(rng, 0, Math.PI * 2);
      const r = range(rng, 0.2, 1) * radius;
      return {
        pos: [position[0] + Math.cos(a) * r, position[1], position[2] + Math.sin(a) * r],
        s: range(rng, 0.5, 1.5),
        color: cols[Math.floor(rng() * cols.length)],
        seed: Math.floor(rng() * 1000),
      };
    });
  }, [position, radius, count, seed]);
  return (
    <group>
      {corals.map((c, i) => (
        <Coral key={i} position={c.pos} scale={c.s} color={c.color} seed={c.seed} />
      ))}
      <mesh position={[position[0], position[1] + 0.2, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 1.1, 20]} />
        <meshStandardMaterial color="#8a9a7a" roughness={1} />
      </mesh>
    </group>
  );
}

export function Kelp({ position = [0, 0, 0], height = 7, count = 6, seed = 4 }) {
  const group = useRef();
  const strands = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: range(rng, -1.4, 1.4),
      z: range(rng, -1.4, 1.4),
      h: range(rng, 0.55, 1.2) * height,
      phase: range(rng, 0, 6),
      sway: range(rng, 0.5, 1.2),
    }));
  }, [count, height, seed]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      child.rotation.z = Math.sin(t * 0.6 * strands[i].sway + strands[i].phase) * 0.16;
      child.rotation.x = Math.cos(t * 0.5 * strands[i].sway + strands[i].phase) * 0.1;
    });
  });
  return (
    <group ref={group} position={position}>
      {strands.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh position={[0, s.h / 2, 0]}>
            <cylinderGeometry args={[0.025, 0.06, s.h, 5]} />
            <meshStandardMaterial color={i % 2 ? '#2f6b4f' : '#3c7d55'} roughness={0.9} />
          </mesh>
          {[0.3, 0.55, 0.8].map((f, j) => (
            <mesh key={j} position={[Math.sin(f * 5 + i) * 0.1, s.h * f, 0]} rotation={[0, 0, 1.2]}>
              <planeGeometry args={[0.5, 0.08]} />
              <meshStandardMaterial color="#3f8a5d" side={THREE.DoubleSide} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function FishSchool({ center = [0, -4, 0], count = 60, radius = 14, seed = 8, color = '#ffd27a', speed = 0.22, yRange = 3 }) {
  const mesh = useRef();
  const geom = useMemo(() => {
    const g = new THREE.ConeGeometry(0.16, 0.55, 5);
    g.rotateZ(-Math.PI / 2);
    return g;
  }, []);
  const fish = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      a: range(rng, 0, Math.PI * 2),
      r: radius * range(rng, 0.25, 1),
      y: range(rng, -yRange, yRange),
      speed: speed * range(rng, 0.7, 1.5),
      scale: range(rng, 0.7, 1.7),
      wobble: range(rng, 0, 6),
      tilt: range(rng, -0.3, 0.3),
    }));
  }, [count, radius, seed, speed, yRange]);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const c = new THREE.Color();
    fish.forEach((f, i) => {
      c.set(color).offsetHSL(range(mulberry32(seed + i), -0.05, 0.08), 0, range(mulberry32(seed + i + 9), -0.12, 0.1));
      mesh.current.setColorAt(i, c);
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [fish, color, seed]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    fish.forEach((f, i) => {
      const a = t * f.speed + f.a;
      const x = center[0] + Math.cos(a) * f.r;
      const z = center[2] + Math.sin(a) * f.r;
      const y = center[1] + f.y + Math.sin(a * 2 + f.wobble) * 0.6;
      dummy.position.set(x, y, z);
      const tangentX = -Math.sin(a);
      const tangentZ = Math.cos(a);
      dummy.rotation.set(0, Math.atan2(-tangentZ, tangentX), f.tilt + Math.sin(t * 4 + f.wobble) * 0.15);
      dummy.scale.setScalar(f.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[geom, null, count]} frustumCulled={false}>
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.25} emissive={color} emissiveIntensity={0.15} />
    </instancedMesh>
  );
}

export function Bubbles({ center = [0, -8, 0], count = 50, spread = 12, height = 22, size = 0.08, seed = 6, color = '#bff6ff' }) {
  const mesh = useRef();
  const geo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const bubbles = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: range(rng, -spread, spread),
      z: range(rng, -spread, spread),
      y: range(rng, 0, height),
      speed: range(rng, 0.4, 1.4),
      s: range(rng, 0.4, 1.5) * size,
      drift: range(rng, 0, 6),
    }));
  }, [count, spread, height, size, seed]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }, delta) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    bubbles.forEach((b, i) => {
      b.y += delta * b.speed * 1.5;
      if (b.y > height) b.y = 0;
      dummy.position.set(
        center[0] + b.x + Math.sin(t * 0.8 + b.drift) * 0.3,
        center[1] + b.y,
        center[2] + b.z + Math.cos(t * 0.6 + b.drift) * 0.3
      );
      dummy.scale.setScalar(b.s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[geo, null, count]} frustumCulled={false}>
      <meshStandardMaterial color={color} transparent opacity={0.35} roughness={0.1} metalness={0.1} emissive={color} emissiveIntensity={0.3} depthWrite={false} />
    </instancedMesh>
  );
}

export function Jellyfish({ position = [0, -3, 0], scale = 1, color = '#b58cff', phase = 0 }) {
  const group = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.6) * 0.8;
      group.current.scale.setScalar(scale * (1 + Math.sin(t * 1.5) * 0.04));
    }
  });
  return (
    <group ref={group} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.7, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} transparent opacity={0.45} emissive={color} emissiveIntensity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.3, -0.7, Math.sin((i / 5) * Math.PI * 2) * 0.3]} rotation={[Math.sin(i) * 0.1, 0, Math.cos(i) * 0.1]}>
          <cylinderGeometry args={[0.015, 0.005, 1.5, 4]} />
          <meshStandardMaterial color={color} transparent opacity={0.35} emissive={color} emissiveIntensity={0.4} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

export function TourBoat({ position = [0, 0.4, 0], rotation = [0, 0, 0], scale = 1, color = '#f3f0e8', accent = '#2c7d92', phase = 0, fishing = false }) {
  const group = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.8) * 0.12;
      group.current.rotation.z = Math.sin(t * 0.6) * 0.02;
    }
  });
  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.1, 0]} scale={[3.3, 0.55, 1.15]}>
        <sphereGeometry args={[1, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color={fishing ? '#d7dde0' : color} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0]}>
        <boxGeometry args={[2.6, 0.35, 1.5]} />
        <meshStandardMaterial color="#e9e4d8" roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, 1.0, 0]}>
        <boxGeometry args={[1.5, 0.75, 1.3]} />
        <meshStandardMaterial color={fishing ? '#3f6b78' : '#d7e4e8'} roughness={0.5} />
      </mesh>
      <mesh position={[-0.3, 1.05, 0.66]}>
        <boxGeometry args={[1.25, 0.3, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.3, 1.46, 0]}>
        <boxGeometry args={[1.75, 0.12, 1.5]} />
        <meshStandardMaterial color={fishing ? '#9a4b3a' : '#f5f2e9'} roughness={0.7} />
      </mesh>
      <mesh position={[1.1, 0.9, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.4, 6]} />
        <meshStandardMaterial color="#8a8f92" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[1.1, 1.55, 0]}>
        <sphereGeometry args={[0.09, 8, 6]} />
        <meshStandardMaterial color="#fff2b0" emissive="#ffe08a" emissiveIntensity={2} />
      </mesh>
      {fishing && (
        <>
          <mesh position={[-1.2, 1.3, 0]} rotation={[0, 0, 0.9]}>
            <cylinderGeometry args={[0.05, 0.05, 2.2, 6]} />
            <meshStandardMaterial color="#8a5a3a" metalness={0.3} roughness={0.7} />
          </mesh>
          <mesh position={[-2.05, 1.9, 0]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffcf6e" emissiveIntensity={1.6} />
          </mesh>
        </>
      )}
      <mesh position={[3.1, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.5]} />
        <meshBasicMaterial color="#d8f6ff" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Pagoda({ position = [0, 0, 0], scale = 1, rotation = [0, 0, 0], holo = false }) {
  const tiers = [
    { w: 4.2, h: 1.4, roof: 1.2 },
    { w: 3.3, h: 1.1, roof: 1.05 },
    { w: 2.4, h: 0.95, roof: 0.9 },
  ];
  const mat = holo ? (
    <meshBasicMaterial color="#8ff6ff" wireframe transparent opacity={0.7} />
  ) : (
    <meshStandardMaterial color="#7a4a35" roughness={0.9} />
  );
  const roofMat = holo ? (
    <meshBasicMaterial color="#bff8ff" wireframe transparent opacity={0.7} />
  ) : (
    <meshStandardMaterial color="#4b5b54" roughness={0.8} />
  );
  let y = 0.6;
  return (
    <group position={position} scale={scale} rotation={rotation}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[3.2, 3.6, 0.6, 8]} />
        <meshStandardMaterial color="#8d8a7c" roughness={1} />
      </mesh>
      {tiers.map((t, i) => {
        const baseY = y;
        y += t.h + 0.1;
        return (
          <group key={i}>
            <mesh position={[0, baseY + t.h / 2, 0]}>
              <cylinderGeometry args={[t.w / 2.2, t.w / 2, t.h, 8]} />
              {mat}
            </mesh>
            <mesh position={[0, baseY + t.h + 0.1, 0]}>
              <coneGeometry args={[t.w / 1.35, t.roof, 8]} />
              {roofMat}
            </mesh>
            {!holo && (
              <mesh position={[0, baseY + t.h + 0.1, 0]}>
                <torusGeometry args={[t.w / 2.3, 0.04, 5, 16]} />
                <meshStandardMaterial color="#d9b25c" metalness={0.6} roughness={0.4} />
              </mesh>
            )}
            {i === tiers.length - 1 && (
              <mesh position={[0, baseY + t.h + t.roof * 0.8, 0]}>
                <coneGeometry args={[0.18, 0.9, 6]} />
                <meshStandardMaterial color={holo ? '#bff8ff' : '#d9b25c'} emissive={holo ? '#8ff6ff' : '#7a5a22'} emissiveIntensity={holo ? 1.4 : 0.4} metalness={0.5} roughness={0.4} />
              </mesh>
            )}
          </group>
        );
      })}
      {!holo &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * 3.6, 1.2, 1.4]}>
            <boxGeometry args={[0.5, 2.4, 0.5]} />
            <meshStandardMaterial color="#6b6257" roughness={0.9} />
          </mesh>
        ))}
    </group>
  );
}

export function FlowerField({ count = 90, center = [0, 0, 0], area = [20, 20], seed = 41 }) {
  const mesh = useRef();
  const data = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: center[0] + range(rng, -area[0] / 2, area[0] / 2),
      z: center[2] + range(rng, -area[1] / 2, area[1] / 2),
      s: range(rng, 0.5, 1.3),
      c: ['#ffd27a', '#ff8fa0', '#c7a6ff', '#8ff0d8', '#ffffff'][Math.floor(rng() * 5)],
    }));
  }, [count, center, area, seed]);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    data.forEach((d, i) => {
      dummy.position.set(d.x, 0.14 * d.s, d.z);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.set(d.c);
      mesh.current.setColorAt(i, color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [data]);
  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.08, 6, 5]} />
      <meshStandardMaterial roughness={0.7} emissiveIntensity={0.3} />
    </instancedMesh>
  );
}
