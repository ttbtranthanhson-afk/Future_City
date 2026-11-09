import { useMemo } from 'react';
import * as THREE from 'three';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Haze, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster } from './shared/nature';
import { InstancedCity, HeroTower, LightPillars, CityGround, SkyTraffic } from './shared/city';
import { Human, Robo, CrowdFigure } from './shared/characters';
import { MayorPodium, HoloPagoda, HoloPanel } from './shared/tech';
import { bigTitleTexture } from '../utils/textures';

const SPEAKERS = [
  { preset: 'engineer', position: [-3.0, 0, -0.4], rotation: [0, 0.1, 0] },
  { preset: 'scientist', position: [3.0, 0, -0.4], rotation: [0, -0.1, 0] },
  { preset: 'doctor', position: [-4.6, 0, -2.0], rotation: [0, 0.25, 0] },
  { preset: 'tourism', position: [4.6, 0, -2.0], rotation: [0, -0.25, 0] },
  { preset: 'fisherman', position: [-5.6, 0, -3.8], rotation: [0, 0.4, 0] },
  { preset: 'miner', position: [5.6, 0, -3.8], rotation: [0, -0.4, 0] },
];

const CROWD = Array.from({ length: 28 }, (_, i) => {
  const row = Math.floor(i / 9);
  const col = i % 9;
  const x = (col - 4) * 1.15 + (row % 2) * 0.5;
  const z = 4.2 + row * 1.5;
  return { x, z, phase: i * 0.7, color: ['#2c3e50', '#3e5568', '#4e3a2e', '#2f4840', '#3a3a4e'][i % 5] };
});

export default function Scene11() {
  const banner = useMemo(() => bigTitleTexture('MỘT THÀNH PHỐ · MỘT GIẤC MƠ', 'QUẢNG NINH 2076', '#ffeba8'), []);
  useCinematicCamera({
    path: [
      [18, 9.5, 19],
      [12.5, 7.4, 15],
      [7, 5.4, 12],
      [2.4, 3.8, 9],
      [-2.2, 3.3, 7.2],
    ],
    look: [
      [0, 2.2, -3],
      [0, 2.1, -3],
      [0, 2.0, -3],
      [0, 1.9, -3],
      [0, 1.9, -3],
    ],
    loop: 46,
    fov: 54,
    shake: 0.014,
  });
  return (
    <group>
      <GradientSky top="#1b3b63" bottom="#e6b077" horizon="#ffe0a8" sunColor="#ffd79a" sunDir={[0.5, 0.2, -1]} radius={700} />
      <SunSprite position={[150, 36, -320]} scale={80} color="#ffd99e" opacity={0.92} />
      <CloudLayer count={16} height={58} radius={240} color="#ffe4cc" opacity={0.4} speed={0.35} />
      <Ocean size={900} segments={60} amp={0.4} y={-0.6} deep="#0a3a4c" shallow="#2a8fa0" horizon="#ffd8a8" sun="#ffd99e" opacity={1} />
      <IslandCluster center={[-120, -0.6, -120]} count={6} spread={40} seed={81} scale={0.8} />
      <group position={[0, 0, -100]}>
        <CityGround size={260} color="#17222a" accent="#2a7a92" />
        <InstancedCity count={80} area={[200, 150]} exclude={24} minHeight={24} maxHeight={100} seed={83} windowVariant={2} />
        <HeroTower position={[0, 0, 0]} width={18} depth={18} height={100} accent="#ffd77a" tint="#182a36" label="2076" />
        <HeroTower position={[-54, 0, 26]} width={12} depth={12} height={66} accent="#6ff0ff" tint="#0d2430" />
        <SkyTraffic points={[[-90, 40, 30], [-20, 52, 10], [60, 44, 20], [20, 58, 45], [-50, 48, 45]]} count={8} color="#ffd27a" speed={0.02} spread={14} seed={13} />
      </group>
      <mesh position={[0, -0.62, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 40]} />
        <meshStandardMaterial color="#5c6f5e" roughness={0.95} />
      </mesh>
      <CityGround size={90} color="#4b5c52" grid={false} />
      <MayorPodium position={[0, 0.02, -2.6]} accent="#ffd77a" />
      <Human preset="mayor" position={[0, 0.02, -3.9]} rotation={[0, 0, 0]} talking phase={0.2} />
      {SPEAKERS.map((s, i) => (
        <Human key={i} preset={s.preset} position={s.position} rotation={s.rotation} phase={i * 1.1} />
      ))}
      <Robo position={[1.9, 0, -5.4]} rotation={[0, -0.2, 0]} scale={0.7} talking phase={2.2} />
      {CROWD.map((c, i) => (
        <CrowdFigure key={i} position={[c.x, 0, c.z]} rotation={[0, Math.PI, 0]} phase={c.phase} color={c.color} height={1.5 + (i % 4) * 0.08} />
      ))}
      <LightPillars count={10} spread={15} height={12} color="#ffd77a" seed={87} />
      <HoloPagoda position={[-7.5, 1.3, -9]} scale={0.42} accent="#8ff6ff" />
      <HoloPanel position={[0, 10, -34]} width={30} height={8} texture={banner} color="#ffd77a" opacity={0.7} />
      <pointLight position={[0, 4, 4]} color="#ffdca8" intensity={50} distance={30} decay={2} />
      <Haze position={[0, 8, -140]} scale={[380, 70, 1]} color="#ffddba" opacity={0.2} />
      <Motes count={130} area={[50, 16, 40]} color="#ffe0ad" size={0.08} speed={0.1} center={[0, 6, 0]} opacity={0.35} />
    </group>
  );
}
