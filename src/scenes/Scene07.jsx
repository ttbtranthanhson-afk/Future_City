import { useMemo } from 'react';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Haze, BirdFlock, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster, TourBoat, Pagoda } from './shared/nature';
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
  const title = useMemo(() => bigTitleTexture('DU LỊCH & VĂN HÓA', 'HẠ LONG · YÊN TỬ · BÁI TỬ LONG', '#ffddb0'), []);
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
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[17, 21, 8, 9]} />
        <meshStandardMaterial color="#3a4a42" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[9, 12, 10, 8]} />
        <meshStandardMaterial color="#47564b" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, 13.2, 0]}>
        <cylinderGeometry args={[6.5, 8, 2, 8]} />
        <meshStandardMaterial color="#566456" roughness={1} flatShading />
      </mesh>
      <group position={[0, 14, 1]} rotation={[0, 0.3, 0]}>
        <Pagoda scale={1.25} />
      </group>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 3.4, 14.8, 3.4]}>
          <boxGeometry args={[0.24, 1.1, 0.24]} />
          <meshStandardMaterial color="#d9b25c" emissive="#ffcf6e" emissiveIntensity={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, 14.4, -2 + i * 0.9]}>
          <boxGeometry args={[0.2, 0.9, 0.3]} />
          <meshStandardMaterial color="#c9a55c" emissive="#ffcf6e" emissiveIntensity={0.55} />
        </mesh>
      ))}
      <pointLight position={[0, 18, 4]} color="#ffcf8a" intensity={20} distance={30} decay={2} />
    </group>
  );
}
