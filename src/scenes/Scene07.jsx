import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Haze, BirdFlock, Motes } from './shared/atmosphere';
import { Lanterns } from './shared/effects';

export default function Scene07() {
  useCinematicCamera({
    path: [
      [42, 34, 66],
      [24, 29, 39],
      [-4, 23, 22],
      [-42, 21, 29],
      [-20, 27, 62],
    ],
    look: [
      [-12, 11, -62],
      [-25, 12, -59],
      [-32, 13, -56],
      [-24, 11, -64],
      [-12, 10, -73],
    ],
    loop: 48,
    fov: 51,
    shake: 0.006,
  });

  return (
    <group>
      <hemisphereLight args={['#f3d8ca', '#253b43', 0.4]} />
      <directionalLight position={[-80, 60, 70]} color="#ffd0ad" intensity={0.66} />
      <GradientSky top="#347ab1" bottom="#e89c94" horizon="#ffd0b1" sunColor="#ffd2a2" sunDir={[-0.42, 0.2, -1]} radius={680} />
      <SunSprite position={[-150, 38, -300]} scale={58} color="#ffd3a2" opacity={0.38} />
      <CloudLayer count={16} height={60} radius={230} color="#ffe4d8" opacity={0.27} speed={0.2} />
      <Lanterns count={18} center={[-10, 15, -34]} area={[68, 4, 30]} seed={71} color="#d9b878" />
      <Lanterns count={9} center={[-32, 17, -56]} area={[8, 2, 8]} seed={73} color="#cfad7b" />
      <BirdFlock count={8} center={[-10, 27, -40]} radius={22} color="#424a4c" speed={0.14} scale={1.0} />
      <Haze position={[0, 10, -150]} scale={[380, 80, 1]} color="#f2c5ba" opacity={0.15} />
      <Motes count={32} area={[80, 18, 60]} color="#eed7c5" size={0.055} speed={0.07} center={[0, 9, -30]} opacity={0.16} />
    </group>
  );
}
