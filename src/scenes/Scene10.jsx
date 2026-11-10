import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { SceneFog } from './shared/effects';
import { Human } from './shared/characters';
import { MineCart, Conveyor, Excavator, DataWall } from './shared/tech';
import { Motes } from './shared/atmosphere';

export default function Scene10() {
  useCinematicCamera({
    path: [
      [1.8, 1.9, 14],
      [1.2, 1.72, 8.5],
      [0.4, 1.6, 2.5],
      [-0.7, 1.54, -1.8],
      [0.9, 1.66, -4.4],
    ],
    look: [
      [0, 1.8, -10],
      [0, 1.7, -9.4],
      [0, 1.55, -8.8],
      [0, 1.45, -8.6],
      [0, 1.6, -9.2],
    ],
    loop: 50,
    fov: 56,
    shake: 0.007,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'The story of coal mining', ambience: 'mining' },
      { t: 8, caption: 'A proud legacy of Quang Ninh', ambience: 'mining' },
    ],
    26,
    { delay: 0.6 }
  );
  return (
    <group>
      <SceneFog color="#18110c" near={4} far={38} />
      <ambientLight color="#4a3d30" intensity={0.55} />
      <MineTunnel />
      {[9, 4.2, -0.8, -5.8, -10.8].map((z, i) => (
        <group key={z} position={[0, 0, z]}>
          {[-4.1, 4.1].map((x) => (
            <mesh key={x} position={[x, 2.1, 0]}>
              <boxGeometry args={[0.34, 4.2, 0.34]} />
              <meshStandardMaterial color="#4d3624" roughness={0.95} />
            </mesh>
          ))}
          <mesh position={[0, 4.15, 0]}>
            <boxGeometry args={[8.9, 0.34, 0.34]} />
            <meshStandardMaterial color="#553b26" roughness={0.95} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <sphereGeometry args={[0.13, 8, 6]} />
            <meshStandardMaterial color="#ffd28a" emissive="#ffbf66" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[0, 3.55, 0]} color="#ffb75e" intensity={i === 2 ? 22 : 14} distance={11} decay={2} />
        </group>
      ))}
      <MineCart position={[0, 0, -6.6]} length={20} speed={0.75} phase={0.8} />
      <mesh position={[0, 0.04, -6.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 22, 4]} />
        <meshStandardMaterial color="#6b675f" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.04, -6.05]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 22, 4]} />
        <meshStandardMaterial color="#6b675f" metalness={0.8} roughness={0.4} />
      </mesh>
      <Excavator position={[-3.4, 0, -14]} rotation={[0, 0.4, 0]} color="#d8a03c" accent="#ffcb6a" />
      <Conveyor position={[3.4, 0, -15.5]} rotation={[0, 0.05, 0]} length={13} color="#3c3a34" accent="#ffb655" />
      <Human preset="oldminer" position={[0, 0, -8.6]} rotation={[0, 0.12, 0]} talking phase={0.3} />
      <Human preset="miner" position={[-2.6, 0, -10.4]} rotation={[0, 0.55, 0]} phase={1.7} />
      <Human preset="miner" position={[2.5, 0, -11.2]} rotation={[0, -0.5, 0]} phase={2.9} />
      <DataWall position={[-6.1, 2.2, -3.4]} rotation={[0, Math.PI / 2, 0]} width={5} height={2.8} title="COAL MINING HISTORY" subtitle="QUANG NINH · A PROUD LEGACY" rows={['1888 · Mining begins', '1955 · Rebuilding', '1990 · Renewal', '2076 · Heritage preserved']} accent="#ffc16a" theme="heritage" />
      <CoalPile position={[-4.8, 0, -1]} scale={1.3} />
      <CoalPile position={[4.6, 0, -9]} scale={1.6} />
      <CoalPile position={[-4.2, 0, -12]} scale={1.9} />
      <mesh position={[0, 5.6, -12]}>
        <boxGeometry args={[6, 0.12, 0.12]} />
        <meshStandardMaterial color="#8a6a3a" emissive="#ffb655" emissiveIntensity={0.6} />
      </mesh>
      <Motes count={170} area={[11, 5, 24]} color="#ffca8a" size={0.05} speed={0.1} center={[0, 2.4, -5]} opacity={0.6} />
      <pointLight position={[0, 4.6, -12]} color="#ffb75e" intensity={24} distance={20} decay={2} />
    </group>
  );
}

function MineTunnel() {
  return (
    <group>
      <mesh position={[0, -0.06, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 32]} />
        <meshStandardMaterial color="#2b231b" roughness={1} />
      </mesh>
      <mesh position={[-6.6, 3, -2]}>
        <boxGeometry args={[0.8, 6, 32]} />
        <meshStandardMaterial color="#211a14" roughness={1} />
      </mesh>
      <mesh position={[6.6, 3, -2]}>
        <boxGeometry args={[0.8, 6, 32]} />
        <meshStandardMaterial color="#211a14" roughness={1} />
      </mesh>
      <mesh position={[0, 6.1, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 32]} />
        <meshStandardMaterial color="#191410" roughness={1} />
      </mesh>
      <mesh position={[0, 3, -18]}>
        <boxGeometry args={[14, 6, 0.8]} />
        <meshStandardMaterial color="#17120e" roughness={1} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const z = 10 - i * 1.8;
        return (
          <mesh key={i} position={[side * (5.4 + (i % 3) * 0.5), 0.8 + (i % 4) * 0.9, z]} rotation={[i * 0.4, i * 0.7, i * 0.2]} castShadow>
            <dodecahedronGeometry args={[1.1 + (i % 3) * 0.4, 0]} />
            <meshStandardMaterial color="#2c241c" roughness={1} flatShading />
          </mesh>
        );
      })}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={`sleeper${i}`} position={[0, 0.055, 12 - i * 1.05]} receiveShadow>
          <boxGeometry args={[2.3, 0.12, 0.3]} />
          <meshStandardMaterial color="#3a2c1f" roughness={0.96} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`rail${x}`} position={[x, 0.13, 0.4]}>
          <boxGeometry args={[0.09, 0.09, 26]} />
          <meshStandardMaterial color="#6b675f" metalness={0.78} roughness={0.38} />
        </mesh>
      ))}
      {[-1, 1].map((s) =>
        [8, 2, -4, -10, -16].map((z) => (
          <group key={`support${s}${z}`} position={[s * 4.2, 0, z]}>
            <mesh position={[0, 2.1, 0]}>
              <boxGeometry args={[0.42, 4.2, 0.42]} />
              <meshStandardMaterial color="#3f2b1b" roughness={0.97} />
            </mesh>
            <mesh position={[0, 4.15, 0]} rotation={[0, 0, s * 0.06]}>
              <boxGeometry args={[1.4, 0.34, 0.5]} />
              <meshStandardMaterial color="#4a3320" roughness={0.96} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#ffd28a" emissive="#ffbf66" emissiveIntensity={2.4} toneMapped={false} />
            </mesh>
          </group>
        ))
      )}
      {[-3, 3].map((x) => (
        <mesh key={`cable${x}`} position={[x, 4.9, -3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 28, 4]} />
          <meshStandardMaterial color="#1a1512" roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`f${i}`} position={[(i % 5) * 2.4 - 4.8, 0.12, 12 - i * 2.6]} rotation={[0, i * 0.8, 0]}>
          <dodecahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial color="#141110" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function CoalPile({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (i % 3) * 0.4, 0.22 + (i % 3) * 0.12, Math.sin(a) * (i % 3) * 0.3]} rotation={[i, i * 0.7, 0]}>
            <dodecahedronGeometry args={[0.34, 0]} />
            <meshStandardMaterial color="#131110" roughness={1} flatShading />
          </mesh>
        );
      })}
    </group>
  );
}
