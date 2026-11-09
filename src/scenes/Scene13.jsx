import { useMemo } from 'react';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { WarpTunnel } from './shared/effects';
import { Human, Robo } from './shared/characters';
import { bigTitleTexture } from '../utils/textures';

export default function Scene13() {
  const title = useMemo(() => bigTitleTexture('TRỞ VỀ 2026', 'HÀNH TRÌNH KHÉP LẠI', '#ffe0b0'), []);
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
    shake: 0.04,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Trở về...', ambience: 'return' },
      { t: 5, caption: 'Nhưng tương lai vẫn ở trong tim mỗi người', ambience: 'return' },
    ],
    30,
    { delay: 0.4 }
  );
  return (
    <group>
      <WarpTunnel position={[0, 2, 30]} rotation={[0, Math.PI, 0]} color="#ffcf8a" accent="#b18cff" radius={9} length={90} speed={0.85} />
      <FloatingHuman preset="minh" position={[2.8, 3.2, 8]} phase={0.3} />
      <FloatingHuman preset="lan" position={[-2.6, 3.4, 5]} phase={1.4} />
      <FloatingHuman preset="alex" position={[2.4, 2.4, 2]} phase={2.5} />
      <Robo position={[-3.0, 1.8, -1]} rotation={[0, 0, -0.2]} scale={0.75} />
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
