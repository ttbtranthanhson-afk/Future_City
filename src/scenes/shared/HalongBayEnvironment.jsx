import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mulberry32, range } from '../../utils/random';
import { Ocean } from './water';
import { Bubbles, FishSchool, Jellyfish, Kelp, Pagoda, Reef, TourBoat, Tree } from './nature';
import { Motes } from './atmosphere';
import { HalongKarstIsland } from './karst';

const ISLANDS = [
  { p: [-154, 0, -26], h: 66, w: 32, s: 101, f: 'wall', c: true },
  { p: [-104, 0, -42], h: 48, w: 25, s: 103, f: 'saddle' },
  { p: [-74, 0, -89], h: 56, w: 29, s: 107, f: 'crown' },
  { p: [-32, 0, -56], h: 30, w: 22, s: 109, f: 'wall', temple: true },
  { p: [24, 0, -36], h: 52, w: 27, s: 113, f: 'tower', c: true },
  { p: [83, 0, -24], h: 64, w: 34, s: 127, f: 'crown' },
  { p: [126, 0, -64], h: 49, w: 25, s: 131, f: 'needle', c: true },
  { p: [-177, 0, -104], h: 59, w: 31, s: 137, f: 'saddle' },
  { p: [-128, 0, -122], h: 38, w: 22, s: 139, f: 'needle' },
  { p: [-89, 0, -151], h: 70, w: 36, s: 149, f: 'wall', c: true },
  { p: [-40, 0, -122], h: 48, w: 26, s: 151, f: 'crown' },
  { p: [12, 0, -104], h: 40, w: 23, s: 157, f: 'saddle' },
  { p: [62, 0, -139], h: 61, w: 31, s: 163, f: 'wall' },
  { p: [112, 0, -116], h: 46, w: 25, s: 167, f: 'tower', c: true },
  { p: [164, 0, -137], h: 69, w: 36, s: 173, f: 'crown' },
  { p: [-185, 0, -206], h: 66, w: 37, s: 179, f: 'wall' },
  { p: [-132, 0, -224], h: 52, w: 31, s: 181, f: 'saddle' },
  { p: [-78, 0, -198], h: 76, w: 39, s: 191, f: 'crown' },
  { p: [-22, 0, -224], h: 58, w: 32, s: 193, f: 'tower' },
  { p: [38, 0, -199], h: 72, w: 38, s: 197, f: 'wall' },
  { p: [97, 0, -228], h: 54, w: 31, s: 199, f: 'needle' },
  { p: [151, 0, -196], h: 68, w: 36, s: 211, f: 'saddle' },
];

const BOATS = [
  { p: [-48, 0.35, 14], r: 0.45, s: 1.4, phase: 0.2 },
  { p: [-28, 0.3, 4], r: -0.7, s: 1.05, phase: 1.4 },
  { p: [-6, 0.3, -8], r: 1.05, s: 0.82, phase: 2.6, fishing: true },
  { p: [20, 0.3, 8], r: -0.3, s: 1.0, phase: 3.4 },
  { p: [42, 0.3, -22], r: -1.0, s: 0.72, phase: 0.8 },
  { p: [-58, 0.3, -34], r: 0.8, s: 0.68, phase: 2.0 },
  { p: [4, 0.3, -44], r: 0.2, s: 0.6, phase: 3.1, fishing: true },
  { p: [62, 0.3, 10], r: -0.55, s: 0.64, phase: 4.2 },
];

function seabedHeight(x, z) {
  const basin = 2.1 * Math.sin(x * 0.031 + z * 0.019) + 1.35 * Math.cos(z * 0.043 - x * 0.014);
  const ridgeA = 4.2 * Math.exp(-(((x + 54) / 42) ** 2 + ((z + 80) / 31) ** 2));
  const ridgeB = 3.2 * Math.exp(-(((x - 46) / 52) ** 2 + ((z + 120) / 28) ** 2));
  return -33 + basin + ridgeA + ridgeB;
}

function Seabed() {
  const geometry = useMemo(() => {
    const columns = 72;
    const rows = 62;
    const width = 460;
    const depth = 400;
    const positions = new Float32Array((columns + 1) * (rows + 1) * 3);
    const colors = new Float32Array((columns + 1) * (rows + 1) * 3);
    const indices = [];
    const sand = new THREE.Color('#5a635c');
    const silt = new THREE.Color('#293d3d');
    let k = 0;
    for (let zIndex = 0; zIndex <= rows; zIndex += 1) {
      const z = -280 + (zIndex / rows) * depth;
      for (let xIndex = 0; xIndex <= columns; xIndex += 1) {
        const x = -width / 2 + (xIndex / columns) * width;
        const y = seabedHeight(x, z) + 0.42 * Math.sin(x * 0.12) * Math.sin(z * 0.1);
        positions[k * 3] = x;
        positions[k * 3 + 1] = y;
        positions[k * 3 + 2] = z;
        const mottling = 0.06 * Math.sin(x * 0.19 + z * 0.12) + 0.04 * Math.cos(z * 0.27 - x * 0.1);
        const color = sand.clone().lerp(silt, THREE.MathUtils.clamp(0.34 + mottling + (y + 33) * 0.025, 0.12, 0.76));
        colors.set([color.r, color.g, color.b], k * 3);
        k += 1;
      }
    }
    for (let z = 0; z < rows; z += 1) {
      for (let x = 0; x < columns; x += 1) {
        const a = z * (columns + 1) + x;
        const b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return geometrySet(positions, colors, indices);
    function geometrySet(p, c, ix) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(p, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(c, 3));
      geometry.setIndex(ix);
      geometry.computeVertexNormals();
      return geometry;
    }
  }, []);
  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
      <SeabedRocks />
    </group>
  );
}

function SeabedRocks() {
  const rocks = useRef();
  const stones = useRef();
  const data = useMemo(() => {
    const rng = mulberry32(909);
    const patches = [[-15, -26], [28, -51], [-58, -66], [55, -92]];
    return Array.from({ length: 136 }, (_, i) => {
      const patch = patches[i % patches.length];
      const angle = range(rng, 0, Math.PI * 2);
      const radius = range(rng, 2, i % 4 === 0 ? 22 : 14);
      const x = patch[0] + Math.cos(angle) * radius;
      const z = patch[1] + Math.sin(angle) * radius * 0.75;
      const scale = i % 4 === 0 ? range(rng, 1.4, 3.6) : range(rng, 0.35, 1.5);
      return { x, z, scale, sy: scale * range(rng, 0.45, 0.95), turn: range(rng, 0, Math.PI * 2), color: range(rng, 0.68, 1.18) };
    });
  }, []);
  useLayoutEffect(() => {
    if (!rocks.current || !stones.current) return;
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    data.forEach((rock, index) => {
      dummy.position.set(rock.x, seabedHeight(rock.x, rock.z) + rock.sy * 0.72, rock.z);
      dummy.rotation.set(rock.turn * 0.2, rock.turn, rock.turn * 0.4);
      dummy.scale.set(rock.scale, rock.sy, rock.scale * (0.68 + (index % 3) * 0.16));
      dummy.updateMatrix();
      const mesh = index % 4 === 0 ? rocks.current : stones.current;
      const subIndex = index % 4 === 0 ? Math.floor(index / 4) : index - Math.floor(index / 4) - 1;
      mesh.setMatrixAt(subIndex, dummy.matrix);
      tint.set(index % 4 === 0 ? '#667166' : '#485955').multiplyScalar(rock.color);
      mesh.setColorAt(subIndex, tint);
    });
    rocks.current.instanceMatrix.needsUpdate = true;
    stones.current.instanceMatrix.needsUpdate = true;
    if (rocks.current.instanceColor) rocks.current.instanceColor.needsUpdate = true;
    if (stones.current.instanceColor) stones.current.instanceColor.needsUpdate = true;
  }, [data]);
  return (
    <group>
      <instancedMesh ref={rocks} args={[null, null, 34]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={stones} args={[null, null, 102]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
    </group>
  );
}

export default function HalongBayEnvironment() {
  return (
    <group name="Shared Halong Bay Environment">
      <Ocean size={1000} segments={84} amp={0.34} y={0} deep="#063b4d" shallow="#348b97" horizon="#efb9aa" sun="#e6bea5" sunDir={[-0.55, 0.28, -0.6]} opacity={1} />
      {ISLANDS.map((island) => island.temple ? (
        <PagodaIsland key="halong-pagoda-island" />
      ) : (
        <HalongKarstIsland
          key={island.s}
          position={island.p}
          height={island.h}
          width={island.w}
          seed={island.s}
          form={island.f}
          caves={island.c}
          vegetation={island.h > 45}
        />
      ))}
      {BOATS.map((boat, index) => (
        <TourBoat key={`bay-boat-${index}`} position={boat.p} rotation={[0, boat.r, 0]} scale={boat.s} phase={boat.phase} fishing={boat.fishing} color="#f3f0e8" accent="#2c7d92" />
      ))}
      <Seabed />
      <Reef position={[-15, -27, -26]} radius={7.5} count={5} seed={301} />
      <Reef position={[28, -27, -51]} radius={9} count={7} seed={307} />
      <Reef position={[-58, -27, -66]} radius={10} count={6} seed={311} />
      <Kelp position={[-5, -30, -25]} height={7} count={7} seed={313} />
      <Kelp position={[32, -30, -48]} height={8} count={8} seed={317} />
      <Kelp position={[-62, -30, -68]} height={6} count={6} seed={331} />
      <Kelp position={[48, -31, -89]} height={5.5} count={5} seed={337} />
      <CoralPatch position={[-18, -25, -41]} />
      <FishSchool center={[-14, -16, -30]} count={72} radius={22} seed={347} color="#e6c884" speed={0.18} yRange={4.5} />
      <FishSchool center={[34, -18, -58]} count={48} radius={17} seed={349} color="#87d6d2" speed={0.22} yRange={3.5} />
      <FishSchool center={[-58, -19, -83]} count={36} radius={14} seed={353} color="#e6a66f" speed={0.16} yRange={3} />
      <Bubbles center={[-17, -30, -39]} count={100} spread={22} height={18} size={0.07} seed={359} color="#a8dce4" />
      <Jellyfish position={[-8, -16, -31]} scale={0.92} color="#b2cadc" phase={0.3} />
      <Jellyfish position={[24, -13, -61]} scale={0.7} color="#94d2d3" phase={2.1} />
      <Motes count={190} area={[90, 24, 100]} color="#a9d9df" size={0.055} speed={0.12} center={[-12, -14, -38]} opacity={0.23} />
    </group>
  );
}

function PagodaIsland() {
  return (
    <group position={[-32, 0, -56]}>
      <HalongKarstIsland height={30} width={22} seed={711} form="crown" caves />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.3;
        const r = 15 + (i % 3) * 2.4;
        return <Tree key={`pagoda-tree-${i}`} position={[Math.cos(a) * r, 11.8 + (i % 2) * 0.6, Math.sin(a) * r]} scale={0.8} phase={i * 0.7} />;
      })}
      {[
        [-4.6, 13.2, 2.4], [4.4, 13.2, 2.8], [5.6, 13.2, -1.4], [-5.2, 13.2, -2.2],
      ].map((p, i) => (
        <Tree key={`temple-grove-${i}`} position={p} scale={0.72} phase={i * 1.3} />
      ))}
      <group position={[0, 14.3, 1]} rotation={[0, 0.3, 0]}>
        <Pagoda scale={1.25} />
      </group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.5, 14.3, 3.6]}>
          <mesh>
            <boxGeometry args={[0.16, 1.4, 0.16]} />
            <meshStandardMaterial color="#5b4a33" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[0.24, 0.12, 0.24]} />
            <meshStandardMaterial color="#c9aa72" emissive="#d7b878" emissiveIntensity={0.45} metalness={0.35} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.74, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#e7c995" emissive="#d7b878" emissiveIntensity={0.65} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`temple-step-${i}`} position={[0, 13.35 + i * 0.16, 4.6 + i * 0.28]} receiveShadow>
          <boxGeometry args={[2.8 - i * 0.2, 0.16, 0.34]} />
          <meshStandardMaterial color="#75806f" roughness={0.95} />
        </mesh>
      ))}
      <group position={[0, 5.6, 17]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.6, 0.16, 8]} />
          <meshStandardMaterial color="#6a533c" roughness={0.9} />
        </mesh>
        {[-1.1, 1.1].map((x) => [0, 3, 6].map((z) => (
          <mesh key={`bridge-post-${x}-${z}`} position={[x, -2.4, z]}>
            <cylinderGeometry args={[0.11, 0.13, 5.2, 6]} />
            <meshStandardMaterial color="#4c3a29" roughness={0.9} />
          </mesh>
        )))}
        {[-1.1, 1.1].map((x) => (
          <mesh key={`bridge-rail-${x}`} position={[x, 0.62, 3]}>
            <boxGeometry args={[0.08, 0.08, 7.6]} />
            <meshStandardMaterial color="#7d6347" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 6.8]}>
          <boxGeometry args={[2.3, 0.08, 0.08]} />
          <meshStandardMaterial color="#7d6347" roughness={0.85} />
        </mesh>
      </group>
      <mesh position={[0, 21.2, 4.5]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color="#e8c99b" emissive="#caa875" emissiveIntensity={0.7} />
      </mesh>
      <pointLight position={[0, 18.5, 4.5]} color="#e7c99c" intensity={3.5} distance={22} decay={2} />
      <pointLight position={[0, 7, 17]} color="#d7aa79" intensity={2.4} distance={13} decay={2} />
    </group>
  );
}

function CoralPatch({ position }) {
  const colors = ['#c47d85', '#d6a16d', '#72b9ad', '#9e8db9', '#c5ae72', '#a86662'];
  return (
    <group position={position}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3.6 + (i % 3) * 0.8;
        const height = 0.9 + (i % 3) * 0.32;
        const color = colors[i % colors.length];
        return (
          <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} rotation={[0, angle, 0]}>
            <mesh position={[0, height * 0.38, 0]}>
              <cylinderGeometry args={[0.12, 0.22, height * 0.76, 6]} />
              <meshStandardMaterial color="#6f8176" roughness={0.95} />
            </mesh>
            <mesh position={[0.1, height * 0.86, 0]}>
              <icosahedronGeometry args={[0.46 + (i % 2) * 0.12, 1]} />
              <meshStandardMaterial color={color} roughness={0.82} />
            </mesh>
            {[0, 1, 2].map((branch) => (
              <mesh key={branch} position={[(branch - 1) * 0.14, height * 0.92, 0.12]} rotation={[0, 0, (branch - 1) * 0.36]}>
                <cylinderGeometry args={[0.035, 0.075, 0.56, 5]} />
                <meshStandardMaterial color={color} roughness={0.86} />
              </mesh>
            ))}
          </group>
        );
      })}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={`grass-${i}`} position={[Math.cos(i * 0.9) * (6 + (i % 3)), 0.45, Math.sin(i * 0.9) * (6 + (i % 3))]} rotation={[0.2, i * 0.9, (i % 2 ? -1 : 1) * 0.3]}>
          <coneGeometry args={[0.22, 1.25 + (i % 3) * 0.3, 5]} />
          <meshStandardMaterial color={i % 2 ? '#547d60' : '#668b6b'} roughness={0.92} />
        </mesh>
      ))}
    </group>
  );
}
