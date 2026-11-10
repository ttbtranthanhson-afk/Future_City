import { useMemo } from 'react';
import * as THREE from 'three';
import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { SceneFog } from './shared/effects';
import { Human } from './shared/characters';
import { ClassroomDesk, HologramSolarSystem, HoloPagoda, DataWall, HoloPanel } from './shared/tech';
import { themeTexture, woodTexture, plasterTexture } from '../utils/textures';

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
    loop: 38,
    fov: 54,
    shake: 0.006,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'The school of 2076', ambience: 'school' },
      { t: 8, caption: 'Knowledge comes alive all around us', ambience: 'school' },
    ],
    24,
    { delay: 0.4 }
  );
  return (
    <group>
      <SceneFog color="#e8e4d6" near={12} far={58} />
      <ambientLight color="#fff2da" intensity={0.58} />
      <hemisphereLight args={['#fff6e4', '#b9a684', 0.5]} />
      <directionalLight
        position={[8, 9, 6]}
        color="#ffe8c8"
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={34}
        shadow-bias={-0.0004}
      />
      <ClassroomShell windows={windows} />
      {STUDENTS.map((s, i) => (
        <group key={i}>
          <ClassroomDesk position={[s.x, 0, s.z]} rotation={[0, Math.PI, 0]} accent="#86b8ff" />
          <Human preset={s.preset} pose="sit" position={[s.x, 0, s.z + 0.85]} rotation={[0, Math.PI, 0]} vrHeadset phase={i * 0.9} shadow={false} />
        </group>
      ))}
      <Human preset="teacher" position={[0, 0, -7.6]} rotation={[0, 0, 0]} talking phase={0.6} />
      <Human preset="student" position={[3.8, 0, -6.2]} rotation={[0, 0.7, 0]} phase={1.9} />
      <HologramSolarSystem position={[0, 4.3, -7.4]} scale={0.72} color="#ffd77a" accent="#6ff0ff" />
      <HoloPagoda position={[-4.4, 1.1, -7.4]} scale={0.5} accent="#8ff6ff" />
      <DataWall position={[4.4, 2.6, -9.7]} rotation={[0, -0.2, 0]} width={4.4} height={2.4} title="CLASSROOM 2076" subtitle="PERSONALIZED LEARNING" rows={['Math · Physics · History', 'Interactive holograms', 'AI learning companion', 'Limitless creativity']} accent="#86b8ff" theme="tech" />
      <HoloPanel position={[-4.6, 2.4, -9.4]} rotation={[0, 0.25, 0]} width={3.2} height={2.2} texture={windows[2]} color="#ffd86e" opacity={0.55} />
      <pointLight position={[0, 4.2, -5]} color="#d8e9ff" intensity={26} distance={22} decay={2} />
      <pointLight position={[0, 1.4, 3]} color="#ffe2b0" intensity={18} distance={18} decay={2} />
    </group>
  );
}

function ClassroomShell({ windows }) {
  const floorMap = useMemo(() => woodTexture('oak', [5, 9]), []);
  const wallMap = useMemo(() => plasterTexture('#e9ddc6', [3, 5]), []);
  const ceilMap = useMemo(() => plasterTexture('#f2e9d8', [4, 6]), []);
  return (
    <group>
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[13, 22]} />
        <meshStandardMaterial map={floorMap} color="#d8c09a" roughness={0.66} metalness={0.04} />
      </mesh>
      <mesh position={[0, 4.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 22]} />
        <meshStandardMaterial map={ceilMap} color="#fff6e6" roughness={0.86} />
      </mesh>
      <mesh position={[-6.55, 2.3, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.6, 22]} />
        <meshStandardMaterial map={wallMap} color="#f2e7d2" roughness={0.8} />
      </mesh>
      <mesh position={[6.55, 2.3, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.6, 22]} />
        <meshStandardMaterial map={wallMap} color="#f2e7d2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, -10.6]} receiveShadow>
        <boxGeometry args={[13, 4.6, 0.2]} />
        <meshStandardMaterial map={wallMap} color="#ece0c9" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.3, 11.1]} receiveShadow>
        <boxGeometry args={[13, 4.6, 0.2]} />
        <meshStandardMaterial map={wallMap} color="#ece0c9" roughness={0.8} />
      </mesh>
      {[-1, 1].map((sx) => (
        <mesh key={`base${sx}`} position={[sx * 6.42, 0.09, 0]}>
          <boxGeometry args={[0.06, 0.18, 22]} />
          <meshStandardMaterial color="#8a6a44" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.09, -10.48]}>
        <boxGeometry args={[12.9, 0.18, 0.06]} />
        <meshStandardMaterial color="#8a6a44" roughness={0.7} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`beam${i}`} position={[0, 4.42, 9 - i * 3.6]}>
          <boxGeometry args={[13, 0.2, 0.24]} />
          <meshStandardMaterial color="#c9a97c" roughness={0.72} />
        </mesh>
      ))}
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
          {[-1.78, 1.78].map((z) => (
            <mesh key={`v${z}`} position={[-0.12, 0, z]}>
              <boxGeometry args={[0.12, 2.66, 0.1]} />
              <meshStandardMaterial color="#7c6a4f" roughness={0.7} />
            </mesh>
          ))}
          {[1.28, -1.28].map((y) => (
            <mesh key={`h${y}`} position={[-0.12, y, 0]}>
              <boxGeometry args={[0.12, 0.1, 3.6]} />
              <meshStandardMaterial color="#7c6a4f" roughness={0.7} />
            </mesh>
          ))}
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.08, 0.08, 3.4]} />
            <meshStandardMaterial color="#7c6a4f" roughness={0.7} />
          </mesh>
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.08, 2.4, 0.08]} />
            <meshStandardMaterial color="#7c6a4f" roughness={0.7} />
          </mesh>
        </group>
      ))}
      <group position={[-6.3, 0, 1.5]}>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.36, 2.8, 4.8]} />
          <meshStandardMaterial color="#7c6446" roughness={0.72} />
        </mesh>
        {[0.5, 1.25, 2.0, 2.75].map((y) => (
          <mesh key={`sh${y}`} position={[0.18, y, 0]}>
            <boxGeometry args={[0.34, 0.06, 4.5]} />
            <meshStandardMaterial color="#a8865c" roughness={0.7} />
          </mesh>
        ))}
        {[0.5, 1.25, 2.0, 2.75].flatMap((y) =>
          Array.from({ length: 9 }, (_, i) => (
            <mesh key={`b${y}${i}`} position={[0.2, y + 0.16, -2 + i * 0.5]} rotation={[0, 0, i % 3 === 0 ? 0.06 : 0]}>
              <boxGeometry args={[0.26, 0.3, 0.22]} />
              <meshStandardMaterial color={['#b5573f', '#3f6e8a', '#7a8c4a', '#c99a4e', '#5a4f7a'][(i + Math.round(y * 10)) % 5]} roughness={0.8} />
            </mesh>
          ))
        )}
      </group>
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
      {[5, -1, -7].map((z, i) => (
        <group key={`pend${i}`} position={[0, 0, z]}>
          <mesh position={[0, 4.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.9, 5]} />
            <meshStandardMaterial color="#6b604e" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.62, 0]}>
            <cylinderGeometry args={[0.08, 0.34, 0.24, 12, 1, true]} />
            <meshStandardMaterial color="#f0e6d2" emissive="#ffe6bd" emissiveIntensity={0.6} side={THREE.DoubleSide} roughness={0.6} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <sphereGeometry args={[0.12, 10, 8]} />
            <meshStandardMaterial color="#fff4d6" emissive="#ffe6bd" emissiveIntensity={2.6} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
