import { useMemo } from 'react';
import * as THREE from 'three';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, Stars, CloudLayer, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster } from './shared/nature';
import { InstancedCity, HeroTower, CityGround, LightPillars, WindFarm, PlazaTrees } from './shared/city';
import { Human } from './shared/characters';
import { Portal, HoloPanel } from './shared/tech';
import { Fireworks, Lanterns } from './shared/effects';
import { bigTitleTexture, glowTexture } from '../utils/textures';
import { SLOGANS } from '../data/sceneConfig';

const CAST = [
  { preset: 'mayor', position: [0, 0.62, -2.4], rotation: 0 },
  { preset: 'alex', position: [-4.4, 0.62, -0.6], rotation: 0.38 },
  { preset: 'engineer', position: [4.4, 0.62, -0.6], rotation: -0.38 },
  { preset: 'scientist', position: [-5.6, 0.62, 0.8], rotation: 0.52 },
  { preset: 'doctor', position: [5.6, 0.62, 0.8], rotation: -0.52 },
  { preset: 'tourism', position: [-5.2, 0.62, 2.2], rotation: 0.62 },
  { preset: 'fisherman', position: [5.2, 0.62, 2.2], rotation: -0.62 },
  { preset: 'miner', position: [-3.6, 0.62, 3.6], rotation: 0.42 },
  { preset: 'teacher', position: [3.6, 0.62, 3.6], rotation: -0.42 },
  { preset: 'student', position: [-1.6, 0.62, 4.6], rotation: 0.16 },
];

export default function Scene15() {
  const slogan = useMemo(() => bigTitleTexture(SLOGANS[0], SLOGANS[2], '#fff0c2'), []);
  useCinematicCamera({
    path: [
      [22, 5.6, 5],
      [15, 8.2, 17],
      [-1, 10.5, 22],
      [-18, 8.6, 15],
      [-22, 5.4, -2],
      [-11, 4.2, -13],
      [8, 4.4, -12],
    ],
    look: [
      [0, 3.4, 0],
      [0, 4.2, 0],
      [0, 4.6, 0],
      [0, 4.2, 0],
      [0, 3.4, 0],
      [0, 3.2, 0],
      [0, 3.4, 0],
    ],
    loop: 50,
    fov: 52,
    shake: 0.006,
  });
  return (
    <group>
      <hemisphereLight args={['#5a6f9c', '#2a1c1c', 0.4]} />
      <directionalLight position={[-40, 70, 50]} color="#ffd7a8" intensity={0.6} />
      <GradientSky top="#0a1b36" bottom="#7a4663" horizon="#ffbd7a" sunColor="#ffd69a" sunDir={[-0.3, 0.16, -1]} radius={700} />
      <Stars count={700} radius={340} size={1.4} opacity={0.8} />
      <CloudLayer count={14} height={60} radius={240} color="#ffcfae" opacity={0.3} speed={0.3} />
      <Ocean size={1000} segments={60} amp={0.4} y={-0.8} deep="#071f31" shallow="#1e6f82" horizon="#ffc89a" sun="#ffd69a" opacity={1} />
      <IslandCluster center={[-130, -0.8, -140]} count={6} spread={38} seed={111} scale={0.7} />
      <group position={[0, 0, -115]}>
        <CityGround size={300} color="#111d26" accent="#2a7a92" />
        <InstancedCity count={95} area={[220, 170]} exclude={26} minHeight={24} maxHeight={110} seed={113} windowVariant={3} />
        <HeroTower position={[0, 0, 10]} width={20} depth={20} height={120} accent="#ffd77a" tint="#162430" label="2076" />
        <WindFarm center={[-100, 0, 50]} count={5} spacing={15} height={44} />
      </group>
      <mesh position={[0, -0.78, 70]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial color="#334c44" roughness={0.95} />
      </mesh>
      <group position={[0, 0, 10]}>
        <mesh position={[0, -0.25, 0]} receiveShadow>
          <cylinderGeometry args={[19.5, 20.5, 0.35, 40]} />
          <meshStandardMaterial color="#0f1a22" metalness={0.5} roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <cylinderGeometry args={[17, 18, 0.4, 40]} />
          <meshStandardMaterial color="#152430" metalness={0.45} roughness={0.48} />
        </mesh>
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <cylinderGeometry args={[15, 16, 0.4, 36]} />
          <meshStandardMaterial color="#1a2a34" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.35, 0]} receiveShadow>
          <cylinderGeometry args={[12.5, 13, 0.5, 36]} />
          <meshStandardMaterial color="#22323e" metalness={0.4} roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.48, 0]} receiveShadow>
          <cylinderGeometry args={[10.5, 11, 0.4, 36]} />
          <meshStandardMaterial color="#2a3b46" metalness={0.4} roughness={0.4} />
        </mesh>
        {[13.2, 15.4, 18.2].map((r, i) => (
          <mesh key={`litring${r}`} position={[0, [0.605, 0.305, 0.155][i], 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.12, 64]} />
            <meshBasicMaterial color="#ffd77a" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        ))}
        <mesh position={[0, 0.555, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[10.6, 11.2, 48]} />
          <meshBasicMaterial color="#ffe4a6" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.556, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.55, 48]} />
          <meshBasicMaterial color="#6ff0ff" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r = 16;
          return (
            <group key={`bollard${i}`} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.07, 0.1, 0.9, 6]} />
                <meshStandardMaterial color="#2c3a44" metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh position={[0, 0.94, 0]}>
                <sphereGeometry args={[0.11, 8, 6]} />
                <meshStandardMaterial color="#ffe7b4" emissive="#ffd77a" emissiveIntensity={2.6} toneMapped={false} />
              </mesh>
            </group>
          );
        })}
        {[0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
          return (
            <group key={`torch${i}`} position={[Math.cos(a) * 13.5, 0, Math.sin(a) * 13.5]}>
              <mesh position={[0, 2.4, 0]}>
                <cylinderGeometry args={[0.1, 0.16, 4.8, 6]} />
                <meshStandardMaterial color="#3a2d21" metalness={0.4} roughness={0.7} />
              </mesh>
              <mesh position={[0, 4.9, 0]}>
                <coneGeometry args={[0.34, 0.5, 8]} />
                <meshStandardMaterial color="#ffd77a" emissive="#ffb655" emissiveIntensity={2.4} toneMapped={false} />
              </mesh>
              <sprite position={[0, 5.1, 0]} scale={[1.6, 2.2, 1]}>
                <spriteMaterial map={glowTexture('#ffffff')} color="#ffcf7a" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
              </sprite>
            </group>
          );
        })}
      </group>
      {CAST.map((c, i) => (
        <Human key={i} preset={c.preset} position={c.position} rotation={[0, c.rotation, 0]} phase={i * 0.8} talking={i < 3} />
      ))}
      <Portal position={[0, 14, -20]} scale={3.4} color="#ffd77a" accent="#b18cff" speed={0.6} intensity={1.1} />
      <group position={[0, 12, -13]}>
        <mesh>
          <planeGeometry args={[34, 10]} />
          <meshBasicMaterial map={slogan} transparent opacity={0.96} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <sprite scale={[36, 18, 1]}>
          <spriteMaterial map={glowTexture('#ffffff')} color="#ffd77a" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <HoloPanel position={[0, 6, 16]} rotation={[0, Math.PI, 0]} width={18} height={4} texture={null} color="#6ff0ff" opacity={0.12} />
      <Fireworks position={[0, 22, -16]} count={320} colors={['#ffd77a', '#6ff0ff', '#ff8fa0', '#b6ff9f']} radius={11} bursts={4} speed={0.75} size={0.4} />
      <Fireworks position={[18, 18, -30]} count={140} colors={['#b18cff', '#8ff6ff']} radius={7} bursts={2} speed={0.9} size={0.3} />
      <Fireworks position={[-18, 20, -28]} count={140} colors={['#ffd27a', '#ff9d6e']} radius={7} bursts={2} speed={0.8} size={0.3} />
      <Lanterns count={90} center={[0, 10, -8]} area={[46, 14, 26]} seed={121} color="#ffca70" />
      <LightPillars count={12} spread={20} height={18} color="#ffd77a" seed={123} />
      <PlazaTrees count={12} radius={19} height={0.4} />
      <Motes count={180} area={[46, 22, 40]} color="#ffe0ad" size={0.1} speed={0.1} center={[0, 8, -8]} opacity={0.45} />
      <pointLight position={[0, 5, 10]} color="#ffdca8" intensity={60} distance={40} decay={2} />
    </group>
  );
}
