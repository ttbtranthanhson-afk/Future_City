import { useMemo } from 'react';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { SceneFog } from './shared/effects';
import { Human, Robo } from './shared/characters';
import { ClassroomDesk, HologramSolarSystem, HoloPagoda, DataWall, HoloPanel } from './shared/tech';
import { themeTexture } from '../utils/textures';

const STUDENTS = [
  { x: -2.35, z: 2.2, preset: 'student' },
  { x: 2.35, z: 2.2, preset: 'student' },
  { x: -2.35, z: -0.6, preset: 'student' },
  { x: 2.35, z: -0.6, preset: 'student' },
  { x: -2.35, z: -3.4, preset: 'student' },
  { x: 2.35, z: -3.4, preset: 'student' },
];

export default function Scene09() {
  const windows = useMemo(() => [themeTexture('city'), themeTexture('bay'), themeTexture('tech')], []);
  useCinematicCamera({
    path: [
      [2.4, 2.05, 9.2],
      [1.5, 1.95, 5.6],
      [0.5, 1.88, 1.8],
      [-0.6, 1.92, -2.2],
      [-1.6, 2.1, -5.2],
    ],
    look: [
      [0, 2.9, -7.5],
      [0, 2.8, -7.5],
      [0, 2.6, -7.5],
      [-2.4, 2.5, -7.5],
      [0, 2.7, -8],
    ],
    loop: 44,
    fov: 54,
    shake: 0.012,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Ngôi trường của năm 2076', ambience: 'school' },
      { t: 8, caption: 'Kiến thức hiện ra ngay trong không gian', ambience: 'school' },
    ],
    24,
    { delay: 0.4 }
  );
  return (
    <group>
      <SceneFog color="#e8e4d6" near={12} far={58} />
      <ambientLight color="#fff2da" intensity={0.9} />
      <directionalLight position={[8, 9, 6]} color="#ffe8c8" intensity={1.3} />
      <ClassroomShell windows={windows} />
      {STUDENTS.map((s, i) => (
        <group key={i}>
          <ClassroomDesk position={[s.x, 0, s.z]} rotation={[0, Math.PI, 0]} accent="#86b8ff" />
          <Human preset={s.preset} pose="sit" position={[s.x, 0, s.z + 0.85]} rotation={[0, Math.PI, 0]} vrHeadset phase={i * 0.9} shadow={false} />
        </group>
      ))}
      <Human preset="teacher" position={[0, 0, -7.6]} rotation={[0, 0, 0]} talking phase={0.6} />
      <Human preset="student" position={[3.8, 0, -6.2]} rotation={[0, 0.7, 0]} phase={1.9} />
      <Robo position={[-3.6, 0, -6.4]} rotation={[0, -0.5, 0]} scale={0.72} talking phase={2.8} />
      <HologramSolarSystem position={[0, 4.3, -7.4]} scale={0.72} color="#ffd77a" accent="#6ff0ff" />
      <HoloPagoda position={[-4.4, 1.1, -7.4]} scale={0.5} accent="#8ff6ff" />
      <DataWall position={[4.4, 2.6, -9.7]} rotation={[0, -0.2, 0]} width={4.4} height={2.4} title="LỚP HỌC 2076" subtitle="HỌC TẬP CÁ NHÂN HÓA" rows={['Toán · Vật lý · Lịch sử', 'Hologram tương tác', 'Trợ lý AI đồng hành', 'Sáng tạo không giới hạn']} accent="#86b8ff" theme="tech" />
      <HoloPanel position={[-4.6, 2.4, -9.4]} rotation={[0, 0.25, 0]} width={3.2} height={2.2} texture={windows[2]} color="#ffd86e" opacity={0.55} />
      <pointLight position={[0, 4.2, -5]} color="#d8e9ff" intensity={26} distance={22} decay={2} />
      <pointLight position={[0, 1.4, 3]} color="#ffe2b0" intensity={18} distance={18} decay={2} />
    </group>
  );
}

function ClassroomShell({ windows }) {
  return (
    <group>
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 22]} />
        <meshStandardMaterial color="#c9b48c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 4.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 22]} />
        <meshStandardMaterial color="#f2e9d8" roughness={0.8} />
      </mesh>
      <mesh position={[-6.55, 2.3, 0]}>
        <boxGeometry args={[0.2, 4.6, 22]} />
        <meshStandardMaterial color="#e9ddc6" roughness={0.8} />
      </mesh>
      <mesh position={[6.55, 2.3, 0]}>
        <boxGeometry args={[0.2, 4.6, 22]} />
        <meshStandardMaterial color="#e9ddc6" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, -10.6]}>
        <boxGeometry args={[13, 4.6, 0.2]} />
        <meshStandardMaterial color="#e3d6bd" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 11.1]}>
        <boxGeometry args={[13, 4.6, 0.2]} />
        <meshStandardMaterial color="#e3d6bd" roughness={0.8} />
      </mesh>
      {windows.map((tex, i) => (
        <group key={i} position={[6.38, 2.55, 5.6 - i * 5.2]}>
          <mesh rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[3.4, 2.4]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, -0.03]}>
            <planeGeometry args={[3.6, 2.6]} />
            <meshBasicMaterial color="#6ff0ff" transparent opacity={0.12} />
          </mesh>
          <mesh position={[-0.12, 1.28, 0]}>
            <boxGeometry args={[0.12, 0.1, 3.6]} />
            <meshStandardMaterial color="#7c6a4f" roughness={0.7} />
          </mesh>
          <mesh position={[-0.12, -1.28, 0]}>
            <boxGeometry args={[0.12, 0.1, 3.6]} />
            <meshStandardMaterial color="#7c6a4f" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.02, -10.2]}>
        <boxGeometry args={[12, 0.1, 0.4]} />
        <meshStandardMaterial color="#8f7a55" roughness={0.6} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, 4.55, 8 - i * 2.8]}>
          <boxGeometry args={[5.4, 0.05, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffe6bd" emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}
