import { useMemo } from 'react';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { GradientSky, SunSprite, CloudLayer, BirdFlock, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster, TreeField, FlowerField } from './shared/nature';
import { Portal } from './shared/tech';
import { Human } from './shared/characters';
import { Fireflies } from './shared/effects';
import { bigTitleTexture, glowTexture } from '../utils/textures';

export default function Scene12() {
  const title = useMemo(() => bigTitleTexture('TƯƠNG LAI BẮT ĐẦU TỪ HÔM NAY', 'HỌC TẬP · SÁNG TẠO · BẢO VỆ QUÊ HƯƠNG', '#ffe6a8'), []);
  useCinematicCamera({
    path: [
      [-1.5, 1.8, 10.5],
      [0.8, 2.2, 7.5],
      [3.4, 3.6, 4.6],
      [5.2, 6.4, 1.6],
      [3.4, 8.4, -1.4],
    ],
    look: [
      [0, 1.4, -8],
      [0, 1.7, -24],
      [0, 2.4, -45],
      [0, 4.4, -70],
      [0, 7, -84],
    ],
    loop: 48,
    fov: 55,
    shake: 0.016,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Mỗi hành động nhỏ hôm nay...', ambience: 'hope' },
      { t: 8, caption: '...tạo nên tương lai tươi sáng ngày mai', ambience: 'hope' },
    ],
    26,
    { delay: 0.4 }
  );
  return (
    <group>
      <GradientSky top="#265a7c" bottom="#ffcf9a" horizon="#fff0c8" sunColor="#ffdfa0" sunDir={[0.3, 0.22, -1]} radius={680} />
      <SunSprite position={[40, 30, -320]} scale={90} color="#ffe4ad" opacity={0.95} />
      <CloudLayer count={14} height={54} radius={220} color="#fff0dc" opacity={0.38} speed={0.3} />
      <Ocean size={900} segments={60} amp={0.35} y={-1.2} deep="#0a4052" shallow="#3095a4" horizon="#ffe2b4" sun="#ffe4ad" opacity={1} />
      <IslandCluster center={[-90, -1, -100]} count={6} spread={34} seed={91} scale={0.75} />
      <mesh position={[0, 0, 12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 70]} />
        <meshStandardMaterial color="#4f7c4b" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.2, 8]} scale={[1.6, 0.006, 1.2]}>
        <sphereGeometry args={[40, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5c8a52" roughness={0.95} />
      </mesh>
      <TreeField count={55} center={[0, 0, 6]} area={[110, 50]} seed={93} scale={1.1} exclude={9} />
      <FlowerField count={120} center={[0, 0, 4]} area={[40, 28]} seed={97} />
      <YoungTree />
      <Human preset="alex" position={[-2.1, 0, -0.4]} rotation={[0, -0.5, 0]} phase={1.2} />
      <Portal position={[0, 16, -78]} scale={2.6} color="#ffe2a8" accent="#8ff6ff" speed={0.5} intensity={0.9} />
      <group position={[0, 19, -66]}>
        <mesh>
          <planeGeometry args={[34, 8]} />
          <meshBasicMaterial map={title} transparent opacity={0.8} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <Fireflies count={70} center={[0, 1.6, 2]} area={[18, 3.2, 14]} color="#ffe9a4" size={0.08} seed={99} />
      <BirdFlock count={9} center={[0, 22, -60]} radius={20} color="#4a4440" speed={0.2} scale={1.1} />
      <Motes count={150} area={[50, 20, 40]} color="#ffe6b8" size={0.09} speed={0.14} center={[0, 6, -5]} opacity={0.45} />
      <pointLight position={[0, 6, 2]} color="#ffe0ad" intensity={30} distance={30} decay={2} />
    </group>
  );
}

function YoungTree() {
  return (
    <group position={[0, 0, -0.4]}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.5, 6]} />
        <meshStandardMaterial color="#5e442e" roughness={0.95} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.22, 1.5 + i * 0.18, Math.sin(i * 2.1) * 0.22]} scale={0.55 - i * 0.08}>
          <sphereGeometry args={[0.9, 7, 6]} />
          <meshStandardMaterial color={i % 2 ? '#3f8a58' : '#4f9d62'} roughness={0.9} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.95, 24]} />
        <meshBasicMaterial color="#b6ff9f" transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 1.4, 0]} color="#b6ff9f" intensity={6} distance={7} decay={2} />
      <sprite position={[0, 1.2, 0]} scale={[3, 3, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color="#b6ff9f" transparent opacity={0.16} depthWrite={false} />
      </sprite>
    </group>
  );
}
