import { useMemo } from 'react';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { WarpTunnel } from './shared/effects';
import { Human } from './shared/characters';
import { bigTitleTexture } from '../utils/textures';

export default function Scene13() {
  const title = useMemo(() => bigTitleTexture('RETURN TO 2026', 'RETURN JOURNEY', '#ffe0b0'), []);
  useCinematicCamera({
    path: [
      [0, 2, -10],
      [0.4, 2.1, -4],
      [-0.5, 2.0, 2],
      [0.4, 2.2, 8],
      [0, 2.1, 12],
    ],
    look: [
      [0, 2.2, 40],
      [0, 2.3, 50],
      [0, 2.4, 60],
      [0, 2.4, 70],
      [0, 2.4, 80],
    ],
    loop: 30,
    fov: 66,
    shake: 0.018,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Return...', ambience: 'return' },
      { t: 5, caption: "But the future is still in everyone's heart", ambience: 'return' },
    ],
    30,
    { delay: 0.4 }
  );
  return (
    <group>
      <WarpTunnel position={[0, 2, 30]} rotation={[0, Math.PI, 0]} color="#ffcf8a" accent="#b18cff" radius={9} length={90} speed={0.85} />
      <FloatingHuman preset="alex" position={[2.4, 2.4, 2]} phase={2.5} />
      <group position={[0, 3.2, 42]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[18, 5]} />
          <meshBasicMaterial map={title} transparent opacity={0.55} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 2.4, 40]} color="#ffe4b0" intensity={50} distance={70} decay={2} />
    </group>
  );
}

function FloatingHuman({ preset, position, phase }) {
  return <Human preset={preset} position={position} rotation={[0.08, 0, Math.sin(phase) * 0.3]} phase={phase} shadow={false} />;
}
