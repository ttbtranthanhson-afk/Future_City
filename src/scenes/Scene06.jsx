import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { GradientSky, SunSprite, CloudLayer, Haze, UnderwaterGodRays, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster, TourBoat, Reef, Kelp, FishSchool, Bubbles, Jellyfish } from './shared/nature';
import { DepthFog } from './shared/effects';

export default function Scene06() {
  useCinematicCamera({
    path: [
      [-12, 5, 26],
      [-5, 3.2, 18],
      [1, 0.4, 11],
      [3.4, -3.6, 5],
      [4.2, -7.2, -1],
      [2.2, -8.6, -6],
    ],
    look: [
      [-40, 10, -62],
      [-32, 8, -54],
      [-14, 2, -34],
      [4, -3, -14],
      [7, -6.4, -14],
      [0, -5.6, -22],
    ],
    loop: 52,
    fov: 56,
    shake: 0.02,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Halong Bay - World Heritage', ambience: 'bay' },
      { t: 6.5, caption: 'Dive into the vast ocean', ambience: 'underwater', sfx: 'splash' },
      { t: 13, caption: 'Marine ecosystem recovered', ambience: 'underwater' },
    ],
    26,
    { delay: 0.5 }
  );
  return (
    <group>
      <DepthFog surface="#bcdced" deep="#0a3a4c" nearAbove={18} farAbove={280} nearBelow={3} farBelow={54} />
      <GradientSky top="#3f8ab8" bottom="#c9ecf5" horizon="#ffe4b9" sunColor="#ffe8b5" sunDir={[0.4, 0.25, -1]} radius={650} />
      <SunSprite position={[110, 44, -280]} scale={64} color="#ffe6b5" opacity={0.9} />
      <CloudLayer count={14} height={55} radius={220} color="#fff2e4" opacity={0.4} speed={0.3} />
      <Ocean size={900} segments={80} amp={0.5} y={0} deep="#063c52" shallow="#2498ab" horizon="#bfe7f0" sun="#ffe6b0" opacity={0.92} />
      <IslandCluster center={[-45, 0, -70]} count={7} spread={40} seed={31} scale={0.85} />
      <IslandCluster center={[40, 0, -110]} count={5} spread={30} seed={37} scale={0.7} />
      <TourBoat position={[-10, 0.3, -22]} rotation={[0, 0.5, 0]} scale={1.2} color="#f3f0e8" accent="#2c7d92" phase={0.4} />
      <TourBoat position={[24, 0.3, -48]} rotation={[0, -0.8, 0]} scale={0.9} fishing color="#d7dde0" accent="#3f6b78" phase={2.2} />
      <group position={[4, -9.5, -8]}>
        <Reef position={[0, 0, 0]} radius={11} count={20} seed={13} />
        <Kelp position={[-5, 0, 2]} height={8} count={7} seed={17} />
        <Kelp position={[6, 0, -3]} height={6} count={6} seed={19} />
        <CoralPatch />
        <FishSchool center={[0, 3, 0]} count={90} radius={13} seed={23} color="#ffd27a" speed={0.24} yRange={3.5} />
        <FishSchool center={[3, 1, 4]} count={60} radius={9} seed={29} color="#8ff0ff" speed={0.3} yRange={2.5} />
        <Bubbles center={[0, 5, 0]} count={70} spread={14} height={20} size={0.09} seed={31} color="#bff6ff" />
        <Jellyfish position={[-5, 6, -4]} scale={1.1} color="#b58cff" phase={0.3} />
        <Jellyfish position={[6, 8, 2]} scale={0.8} color="#8ff0ff" phase={2.1} />
      </group>
      <UnderwaterGodRays count={8} color="#9ff4ff" y={1} spread={34} opacity={0.13} />
      <Motes count={160} area={[40, 26, 40]} color="#bff6ff" size={0.07} speed={0.15} center={[2, -4, -8]} opacity={0.45} />
      <Haze position={[0, 8, -120]} scale={[320, 70, 1]} color="#cfedf4" opacity={0.18} />
      <pointLight position={[2, -2, 6]} color="#9ff4ff" intensity={24} distance={40} decay={2} />
    </group>
  );
}

function CoralPatch() {
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 6.5, 0.3, Math.sin(a) * 5.2]}>
            <sphereGeometry args={[0.7 + (i % 3) * 0.3, 6, 4]} />
            <meshStandardMaterial color={['#e27a8a', '#ffa06e', '#c7a6ff', '#8ff0d8'][i % 4]} roughness={0.9} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}
