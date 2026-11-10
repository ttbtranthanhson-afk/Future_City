import { useMemo } from 'react';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Haze, BirdFlock, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster, TourBoat, Pagoda, Tree } from './shared/nature';
import { Lanterns } from './shared/effects';
import { HoloPanel } from './shared/tech';
import { bigTitleTexture } from '../utils/textures';

const BOATS = [
  { position: [-6, 0.3, 6], rotation: [0, 0.5, 0], scale: 1.15, phase: 0.2, fishing: false },
  { position: [16, 0.3, -14], rotation: [0, -0.9, 0], scale: 1.35, phase: 1.4, fishing: false },
  { position: [-24, 0.3, -20], rotation: [0, 1.2, 0], scale: 1.0, phase: 2.6, fishing: true },
  { position: [34, 0.3, -34], rotation: [0, -0.4, 0], scale: 0.85, phase: 3.4, fishing: false },
];

export default function Scene07() {
  const title = useMemo(() => bigTitleTexture('TOURISM & CULTURE', 'HALONG BAY · FAIRY ISLE · BAI TU LONG', '#ffddb0'), []);
  useCinematicCamera({
    path: [
      [28, 10, 8],
      [10, 13, 20],
      [-14, 15, 16],
      [-34, 12, -2],
      [-22, 11, -18],
      [2, 10, -13],
    ],
    look: [
      [-14, 12, -50],
      [-18, 13, -52],
      [-20, 14, -55],
      [-18, 12, -54],
      [-10, 11, -48],
      [-4, 10, -44],
    ],
    loop: 56,
    fov: 50,
    shake: 0.016,
  });
  return (
    <group>
      <hemisphereLight args={['#ffd9b4', '#2d3a34', 0.55]} />
      <directionalLight position={[-80, 60, 70]} color="#ffd9a8" intensity={1.0} />
      <GradientSky top="#1e4160" bottom="#f0b06d" horizon="#ffe0a8" sunColor="#ffd08a" sunDir={[-0.4, 0.18, -1]} radius={680} />
      <SunSprite position={[-150, 38, -300]} scale={86} color="#ffd695" opacity={0.95} />
      <CloudLayer count={18} height={60} radius={230} color="#ffe3c8" opacity={0.45} speed={0.3} />
      <Ocean size={1000} segments={70} amp={0.5} y={0} deep="#0a3c4e" shallow="#2a91a0" horizon="#ffd8a8" sun="#ffd695" sunDir={[-0.5, 0.4, -0.4]} opacity={1} />
      <IslandCluster center={[-10, 0, -66]} count={8} spread={44} seed={51} scale={0.9} />
      <IslandCluster center={[60, 0, -95]} count={6} spread={34} seed={57} scale={0.7} />
      <IslandCluster center={[-80, 0, -100]} count={5} spread={30} seed={63} scale={0.75} />
      <PagodaIsland />
      {BOATS.map((b, i) => (
        <TourBoat key={i} position={b.position} rotation={b.rotation} scale={b.scale} phase={b.phase} fishing={b.fishing} color="#f3f0e8" accent="#2c7d92" />
      ))}
      <Lanterns count={110} center={[-6, 10, -20]} area={[60, 16, 40]} seed={71} color="#ffca70" />
      <Lanterns count={40} center={[0, 3, 2]} area={[18, 4, 12]} seed={73} color="#ff9d6e" />
      <group position={[-2, 12, -38]}>
        <mesh>
          <planeGeometry args={[17, 5]} />
          <meshBasicMaterial map={title} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <BirdFlock count={10} center={[-10, 26, -40]} radius={22} color="#4a4440" speed={0.18} scale={1.1} />
      <Haze position={[0, 12, -150]} scale={[380, 80, 1]} color="#ffddba" opacity={0.26} />
      <Motes count={140} area={[80, 30, 60]} color="#ffe0ad" size={0.1} speed={0.12} center={[0, 10, -30]} opacity={0.4} />
    </group>
  );
}

function PagodaIsland() {
  return (
    <group position={[-32, 0, -56]}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[17, 22, 8, 11]} />
        <meshStandardMaterial color="#32443c" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 7.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[9.4, 13, 9.4, 9]} />
        <meshStandardMaterial color="#40544a" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 13.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6.8, 8.6, 2.2, 9]} />
        <meshStandardMaterial color="#536356" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 14.24, 0]} receiveShadow>
        <cylinderGeometry args={[6.9, 6.9, 0.18, 9]} />
        <meshStandardMaterial color="#6f7c69" roughness={1} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const r = 17 + (i % 3) * 2.4;
        return (
          <mesh key={`rock${i}`} position={[Math.cos(a) * r, 1.4 + (i % 3) * 1.1, Math.sin(a) * r]} rotation={[i * 0.5, i * 0.9, i * 0.3]} castShadow>
            <dodecahedronGeometry args={[2 + (i % 4) * 0.7, 0]} />
            <meshStandardMaterial color="#33443c" roughness={1} flatShading />
          </mesh>
        );
      })}
      {[
        [-4.6, 13.2, 2.4],
        [4.4, 13.2, 2.8],
        [5.6, 13.2, -1.4],
        [-5.2, 13.2, -2.2],
      ].map((p, i) => (
        <Tree key={`t${i}`} position={p} scale={0.72} phase={i * 1.3} />
      ))}
      <group position={[0, 14.3, 1]} rotation={[0, 0.3, 0]}>
        <Pagoda scale={1.25} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 3.5, 14.3, 3.6]}>
          <mesh>
            <boxGeometry args={[0.16, 1.4, 0.16]} />
            <meshStandardMaterial color="#5b4a33" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[0.24, 0.12, 0.24]} />
            <meshStandardMaterial color="#d9b25c" emissive="#ffcf6e" emissiveIntensity={0.8} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.74, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#ffcf8a" emissive="#ffcf6e" emissiveIntensity={2.2} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`step${i}`} position={[0, 13.35 + i * 0.16, 4.6 + i * 0.28]} receiveShadow>
          <boxGeometry args={[2.8 - i * 0.2, 0.16, 0.34]} />
          <meshStandardMaterial color="#75806f" roughness={0.95} />
        </mesh>
      ))}
      <group position={[0, 5.6, 17]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.6, 0.16, 8]} />
          <meshStandardMaterial color="#6a533c" roughness={0.9} />
        </mesh>
        {[-1.1, 1.1].map((x) =>
          [0, 3, 6].map((z) => (
            <mesh key={`pole${x}${z}`} position={[x, -2.4, z]}>
              <cylinderGeometry args={[0.11, 0.13, 5.2, 6]} />
              <meshStandardMaterial color="#4c3a29" roughness={0.9} />
            </mesh>
          ))
        )}
        {[-1.1, 1.1].map((x) => (
          <mesh key={`rail${x}`} position={[x, 0.62, 3]}>
            <boxGeometry args={[0.08, 0.08, 7.6]} />
            <meshStandardMaterial color="#7d6347" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 6.8]}>
          <boxGeometry args={[2.3, 0.08, 0.08]} />
          <meshStandardMaterial color="#7d6347" roughness={0.85} />
        </mesh>
      </group>
      <mesh position={[0, 18.5, 4.5]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#ffe1a8" emissive="#ffcf6e" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 18.5, 4.5]} color="#ffcf8a" intensity={26} distance={34} decay={2} />
      <pointLight position={[0, 7, 17]} color="#ffbe78" intensity={10} distance={16} decay={2} />
    </group>
  );
}
