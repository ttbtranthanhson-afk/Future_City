import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { Room } from './shared/room';
import { Motes } from './shared/atmosphere';

export default function Scene14() {
  useCinematicCamera({
    path: [
      [2.4, 1.85, 5.2],
      [1.8, 1.8, 3.6],
      [0.8, 1.76, 2.2],
      [-0.3, 1.74, 0.8],
      [-1.2, 1.78, -0.2],
    ],
    look: [
      [0, 1.65, -4.5],
      [0, 1.6, -4.6],
      [-0.2, 1.55, -4.8],
      [-0.6, 1.5, -5.0],
      [-1.0, 1.45, -5.4],
    ],
    loop: 42,
    fov: 46,
    shake: 0.012,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Buổi sáng của một khởi đầu mới', ambience: 'newday' },
      { t: 8, caption: 'Quyết tâm giữ lấy tương lai', ambience: 'newday' },
    ],
    24,
    { delay: 0.4 }
  );
  return (
    <group>
      <Room variant="day">
        <Motes count={120} area={[7, 2.8, 4]} color="#ffe9bd" size={0.04} speed={0.1} center={[0, 2.2, -3.6]} opacity={0.55} />
      </Room>
    </group>
  );
}
