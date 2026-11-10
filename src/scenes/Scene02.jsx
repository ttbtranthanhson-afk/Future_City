import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { Room } from './shared/room';
import { Human } from './shared/characters';
import { Portal } from './shared/tech';
import { Motes } from './shared/atmosphere';

export default function Scene02() {
  useCinematicCamera({
    path: [
      [3.2, 1.86, 3.4],
      [2.2, 1.78, 2.6],
      [0.6, 1.72, 1.9],
      [-0.7, 1.8, 1.4],
      [-1.4, 1.95, 2.0],
    ],
    look: [
      [0.4, 1.7, -2.8],
      [0.2, 1.8, -3.2],
      [0.1, 2.0, -3.9],
      [0.2, 2.1, -4.2],
      [0.4, 2.0, -3.8],
    ],
    loop: 32,
    fov: 48,
    shake: 0.006,
  });
  return (
    <group>
      <Room variant="night">
        <Portal position={[0.1, 2.35, -4.5]} scale={1.15} color="#7ae7ff" accent="#b18cff" speed={1.1} intensity={1.15} />
        <Human preset="alex" position={[1.45, 0, -2.1]} rotation={[0, -0.35, 0]} talking phase={1.1} />
        <Motes count={110} area={[7, 3.4, 5]} color="#b7f6ff" size={0.05} speed={0.2} center={[0, 2, -2.4]} opacity={0.5} />
      </Room>
    </group>
  );
}
