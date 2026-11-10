import { useMemo } from 'react';
import * as THREE from 'three';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Motes, Haze, BirdFlock } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster } from './shared/nature';
import { Portal } from './shared/tech';
import { bigTitleTexture, glowTexture } from '../utils/textures';

export default function IntroScene() {
  const title = useMemo(() => bigTitleTexture('QUANG NINH 2076', 'OUR FUTURE, OUR RESPONSIBILITY', '#8ff6ff'), []);
  useCinematicCamera({
    path: [
      [0, 9, 52],
      [2, 8.4, 44],
      [0, 7.6, 36],
      [-2.5, 7, 30],
      [-1, 6.4, 26],
    ],
    look: [
      [0, 13, -40],
      [0, 14, -48],
      [0, 15, -56],
      [0, 16, -62],
      [0, 16, -66],
    ],
    loop: 38,
    fov: 52,
    shake: 0.01,
  });
  return (
    <group>
      <hemisphereLight args={['#cfe9ff', '#3a4a3a', 0.6]} />
      <directionalLight position={[60, 90, 60]} color="#ffe6c4" intensity={1.05} />
      <GradientSky top="#0b2540" bottom="#67b4cc" horizon="#ffd6a0" sunColor="#ffe0ae" sunDir={[0.3, 0.18, -1]} radius={600} />
      <SunSprite position={[60, 26, -220]} scale={60} color="#ffe3b0" opacity={0.9} />
      <CloudLayer count={18} height={48} radius={190} color="#ffe1c4" opacity={0.5} speed={0.4} />
      <Ocean size={900} segments={60} amp={0.45} y={0} deep="#082f42" shallow="#248ea0" horizon="#ffd6ae" sun="#ffe6b0" opacity={1} />
      <IslandCluster center={[-30, 0, -95]} count={8} spread={45} seed={14} scale={0.9} />
      <IslandCluster center={[80, 0, -150]} count={5} spread={30} seed={22} scale={0.65} />
      <Haze position={[0, 14, -170]} scale={[380, 90, 1]} color="#ffd8bb" opacity={0.28} />
      <BirdFlock count={9} center={[-10, 26, -60]} radius={18} color="#3d4650" speed={0.2} scale={1.1} />
      <Portal position={[0, 17, -58]} scale={2.4} color="#7ae7ff" accent="#b18cff" speed={0.7} intensity={0.9} />
      <group position={[0, 18, -46]}>
        <mesh>
          <planeGeometry args={[34, 13]} />
          <meshBasicMaterial map={title} transparent opacity={0.94} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <sprite scale={[30, 16, 1]}>
          <spriteMaterial map={glowTexture('#ffffff')} color="#6ff0ff" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
      <Motes count={220} area={[90, 30, 70]} color="#ffe3b8" size={0.13} speed={0.2} center={[0, 12, -20]} opacity={0.5} />
    </group>
  );
}
