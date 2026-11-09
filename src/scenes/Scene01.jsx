import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { Room } from './shared/room';
import { Human } from './shared/characters';

export default function Scene01() {
  useCinematicCamera({
    path: [
      [3.0, 2.0, 3.6],
      [2.1, 1.88, 3.0],
      [0.7, 1.8, 2.3],
      [-0.6, 1.76, 1.6],
      [-1.8, 1.78, 0.9],
    ],
    look: [
      [0.4, 1.5, -1.6],
      [0.1, 1.42, -1.7],
      [-0.3, 1.35, -2.0],
      [-1.4, 1.3, -4.4],
      [-3.4, 1.45, -5.6],
    ],
    loop: 44,
    fov: 46,
    shake: 0.014,
  });
  return (
    <group>
      <Room variant="dusk">
        <Human preset="minh" pose="sit" position={[-0.78, 0, -1.82]} rotation={[0, Math.PI, 0]} talking phase={0.4} shadow={false} />
        <Human preset="lan" pose="sit" position={[0.82, 0, -1.82]} rotation={[0, Math.PI, 0]} talking phase={2.1} shadow={false} />
      </Room>
    </group>
  );
}
