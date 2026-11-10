import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { WarpTunnel } from './shared/effects';
import { Human } from './shared/characters';

export default function Scene03() {
  useCinematicCamera({
    path: [
      [0, 2, 12],
      [0.5, 2.2, 6],
      [-0.6, 2.0, 0],
      [0.4, 2.4, -6],
      [0, 2.1, -11],
    ],
    look: [
      [0, 2, -20],
      [0, 2.1, -26],
      [0, 2.2, -32],
      [0, 2.3, -40],
      [0, 2.2, -50],
    ],
    loop: 30,
    fov: 68,
    shake: 0.026,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'The space portal opens...', ambience: 'warp' },
      { t: 5, caption: 'The year 2076 lies ahead', ambience: 'warp' },
    ],
    30,
    { delay: 0.6 }
  );
  return (
    <group>
      <WarpTunnel position={[0, 2, -34]} color="#6ff0ff" accent="#b18cff" radius={9} length={90} speed={1} />
      <FloatingHuman preset="alex" position={[-2.4, 2.2, -24]} phase={2.4} />
      <pointLight position={[0, 2, 6]} color="#9ff7ff" intensity={8} distance={20} decay={2} />
    </group>
  );
}

function FloatingHuman({ preset, position, phase }) {
  return (
    <Human
      preset={preset}
      position={position}
      rotation={[0.1, 0, Math.sin(phase) * 0.25]}
      phase={phase}
      shadow={false}
    />
  );
}
