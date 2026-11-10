import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { DepthFog } from './shared/effects';
import { GradientSky, SunSprite, CloudLayer, Haze, UnderwaterGodRays } from './shared/atmosphere';

export default function Scene06() {
  useCinematicCamera({
    path: [
      [-18, 17, 58],
      [-10, 10, 32],
      [-8, 3, 15],
      [-10, -7, 2],
      [-13, -12, -16],
      [-9, -15, -30],
    ],
    look: [
      [-32, 10, -88],
      [-24, 7, -50],
      [-14, -1, -15],
      [-10, -14, -17],
      [-18, -22, -34],
      [-8, -22, -52],
    ],
    pathTimes: [0, 0.15, 0.26, 0.42, 0.63, 1],
    loop: 32,
    closed: false,
    fov: 55,
    shake: 0.006,
  });

  useSceneSegments(
    [
      { t: 0, caption: 'Halong Bay - World Heritage', ambience: 'bay' },
      { t: 6.5, caption: 'Dive into the vast ocean', ambience: 'underwater', sfx: 'splash' },
      { t: 13, caption: 'Marine ecosystem recovered', ambience: 'underwater' },
    ],
    0,
    { delay: 0.5 }
  );

  return (
    <group>
      <DepthFog surface="#b6d9df" deep="#103641" nearAbove={18} farAbove={250} nearBelow={7} farBelow={88} />
      <hemisphereLight args={['#a7d8e7', '#102d35', 0.42]} />
      <directionalLight position={[30, 70, -30]} color="#c5e6e8" intensity={0.58} />
      <GradientSky top="#438bb2" bottom="#c9e4e8" horizon="#f2d7bf" sunColor="#edd9bc" sunDir={[0.4, 0.25, -1]} radius={650} />
      <SunSprite position={[110, 44, -280]} scale={54} color="#eddabc" opacity={0.45} />
      <CloudLayer count={12} height={55} radius={220} color="#ecf0e9" opacity={0.27} speed={0.22} />
      <UnderwaterGodRays count={10} color="#a9e5e8" y={1} spread={46} opacity={0.095} />
      <Haze position={[0, 8, -150]} scale={[320, 70, 1]} color="#cfe5e4" opacity={0.13} />
    </group>
  );
}
