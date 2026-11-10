import { useMemo } from 'react';
import * as THREE from 'three';
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
      <hemisphereLight args={['#ffe9cc', '#3f5c3c', 0.65]} />
      <directionalLight position={[50, 85, 60]} color="#ffe8bc" intensity={1.15} />
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
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.6, 24]} />
        <meshStandardMaterial color="#6b8a4f" roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.15, 1.55, 7]} />
        <meshStandardMaterial color="#5e442e" roughness={0.95} />
      </mesh>
      {[
        [0.3, 1.35, 0.1, 0.5],
        [-0.28, 1.5, -0.12, -0.55],
        [0.1, 1.75, -0.3, 0.35],
      ].map(([x, y, z, rz], i) => (
        <mesh key={`br${i}`} position={[x, y, z]} rotation={[0.2 * (i - 1), 0, rz]} castShadow>
          <cylinderGeometry args={[0.025, 0.05, 0.85, 5]} />
          <meshStandardMaterial color="#5a412c" roughness={0.95} />
        </mesh>
      ))}
      {[
        [0, 2.25, 0, 0.72],
        [0.42, 1.98, 0.18, 0.55],
        [-0.46, 2.04, -0.12, 0.5],
        [0.18, 2.14, -0.46, 0.46],
        [-0.16, 1.86, 0.44, 0.42],
        [0.02, 2.5, 0.06, 0.38],
      ].map(([x, y, z, s], i) => (
        <mesh key={`leaf${i}`} position={[x, y, z]} scale={s} castShadow>
          <icosahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial color={['#3f8a58', '#4f9d62', '#5aab6a', '#468f5d'][i % 4]} roughness={0.88} flatShading />
        </mesh>
      ))}
      {[[-1.1, 0.18, 0.6], [1.15, 0.16, -0.4], [0.5, 0.15, 1.1]].map((p, i) => (
        <mesh key={`rock${i}`} position={p} rotation={[i, i * 0.8, 0]} castShadow>
          <dodecahedronGeometry args={[0.22 + i * 0.05, 0]} />
          <meshStandardMaterial color="#7b8378" roughness={0.96} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.55, 32]} />
        <meshBasicMaterial color="#b6ff9f" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 1.8, 0]} color="#b6ff9f" intensity={8} distance={8} decay={2} />
      <sprite position={[0, 1.7, 0]} scale={[3.4, 3.4, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color="#b6ff9f" transparent opacity={0.16} depthWrite={false} />
      </sprite>
    </group>
  );
}
