import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { useSceneSegments } from '../hooks/useSceneSegments';
import { SceneFog } from './shared/effects';
import { Human, Robo } from './shared/characters';
import { MedicalBed, Scanner, MedTrolley, HospitalDoor, HospitalWallPanel, LabEquipment } from './shared/tech';
import { RoomPlant } from './shared/room';

export default function Scene08() {
  useCinematicCamera({
    path: [
      [0.2, 1.75, 13],
      [0.5, 1.72, 7],
      [-0.5, 1.68, 1],
      [0.6, 1.7, -4],
      [-0.4, 1.76, -9],
      [0.8, 1.9, -12],
    ],
    look: [
      [0, 1.6, 0],
      [1.4, 1.55, -3],
      [0, 1.45, -8],
      [1.9, 1.45, -8],
      [-1.4, 1.6, -11],
      [0, 1.5, -16],
    ],
    loop: 48,
    fov: 55,
    shake: 0.012,
  });
  useSceneSegments(
    [
      { t: 0, caption: 'Bệnh viện thông minh · Quảng Ninh 2076', ambience: 'hospital' },
      { t: 7, caption: 'AI chẩn đoán sớm, robot hỗ trợ chăm sóc', ambience: 'hospital' },
    ],
    24,
    { delay: 0.4 }
  );
  return (
    <group>
      <SceneFog color="#dceef2" near={9} far={52} />
      <ambientLight color="#e8f6ff" intensity={1.05} />
      <directionalLight position={[6, 12, 6]} color="#ffffff" intensity={1.2} />
      <HospitalHall />
      <MedicalBed position={[0, 0, -7.8]} patient accent="#9fe8ff" />
      <Scanner position={[0, 1.7, -7.8]} accent="#7fffd4" />
      <MedicalBed position={[3.3, 0, -2]} rotation={[0, -Math.PI / 2, 0]} patient={false} accent="#9fe8ff" />
      <HospitalDoor position={[4.92, 1.55, -2]} rotation={[0, -Math.PI / 2, 0]} width={2.6} height={3.1} accent="#9fe8ff" open={0.75} />
      <HospitalDoor position={[-4.92, 1.55, -10.5]} rotation={[0, Math.PI / 2, 0]} width={2.6} height={3.1} accent="#7fffd4" open={0.9} />
      <HospitalWallPanel position={[-4.86, 2.1, -5]} rotation={[0, Math.PI / 2, 0]} title="AI CHẨN ĐOÁN" rows={['Nhịp tim: 72 bpm', 'Nhiệt độ: 36.6°C', 'Xét nghiệm: hoàn tất', 'Kết quả: bình thường']} accent="#9fe8ff" />
      <HospitalWallPanel position={[4.86, 2.1, -11]} rotation={[0, -Math.PI / 2, 0]} title="ROBOT Y TẾ" rows={['Ca trực: 24/7', 'Thuốc: 12/12', 'Hỗ trợ mổ: 3', 'Kết nối AI: ổn định']} accent="#7fffd4" />
      <MedTrolley position={[-2.4, 0, -3.5]} path={1.6} speed={0.35} phase={0.4} accent="#9fe8ff" />
      <MedTrolley position={[2.6, 0, -10.8]} path={1.4} speed={0.28} phase={2.2} accent="#7fffd4" />
      <Human preset="doctor" position={[1.6, 0, -4.8]} rotation={[0, -0.4, 0]} talking phase={0.2} />
      <Robo position={[-1.7, 0, -5.8]} rotation={[0, 0.35, 0]} scale={0.72} talking phase={1.7} />
      <Human preset="patient" position={[1.9, 0, -0.6]} rotation={[0, Math.PI * 0.9, 0]} phase={2.6} />
      <LabEquipment position={[-4.1, 0, -1]} rotation={[0, Math.PI / 2, 0]} accent="#9fe8ff" />
      <LabEquipment position={[4.2, 0, -13.5]} rotation={[0, -Math.PI / 2, 0]} accent="#7fffd4" />
      <RoomPlant position={[-3.9, 0, 0.4]} scale={0.8} />
      <RoomPlant position={[3.9, 0, -15.2]} scale={0.75} />
      <pointLight position={[0, 4.3, -3]} color="#c8f6ff" intensity={28} distance={26} decay={2} />
      <pointLight position={[0, 4.3, -11]} color="#bfffe8" intensity={22} distance={22} decay={2} />
    </group>
  );
}

function HospitalHall() {
  return (
    <group>
      <mesh position={[0, -0.06, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 32]} />
        <meshStandardMaterial color="#e6f2f5" roughness={0.3} metalness={0.15} />
      </mesh>
      <mesh position={[0, 5.02, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 32]} />
        <meshStandardMaterial color="#f2fafc" roughness={0.6} />
      </mesh>
      <mesh position={[-5.45, 2.5, -2]}>
        <boxGeometry args={[0.2, 5, 32]} />
        <meshStandardMaterial color="#dfeef2" roughness={0.5} />
      </mesh>
      <mesh position={[5.45, 2.5, -2]}>
        <boxGeometry args={[0.2, 5, 32]} />
        <meshStandardMaterial color="#dfeef2" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.5, -18.1]}>
        <boxGeometry args={[11, 5, 0.2]} />
        <meshStandardMaterial color="#e2f0f4" roughness={0.55} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[0, 4.94, 13 - i * 2.9]}>
          <boxGeometry args={[1.0, 0.06, 1.6]} />
          <meshStandardMaterial color="#ffffff" emissive="#d8f6ff" emissiveIntensity={2.2} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.7, 0.012, -2]}>
          <boxGeometry args={[0.1, 0.02, 30]} />
          <meshStandardMaterial color="#7fffd4" emissive="#7fffd4" emissiveIntensity={1.4} transparent opacity={0.8} />
        </mesh>
      ))}
      {[-1, 1].flatMap((s) =>
        [2, -2, -6, -10, -14].map((z) => (
          <group key={`${s}${z}`} position={[s * 5.28, 1.9, z]}>
            <mesh>
              <boxGeometry args={[0.04, 2.9, 2.2]} />
              <meshPhysicalMaterial color="#c8f2ff" transparent opacity={0.16} roughness={0.1} metalness={0.1} transmission={0.5} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.08, 0.08, 2.3]} />
              <meshStandardMaterial color="#9fe8ff" emissive="#9fe8ff" emissiveIntensity={1.1} />
            </mesh>
          </group>
        ))
      )}
      <mesh position={[0, 3.4, -17.9]}>
        <boxGeometry args={[4.2, 0.1, 0.06]} />
        <meshStandardMaterial color="#9fe8ff" emissive="#9fe8ff" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 1.9, -17.88]}>
        <boxGeometry args={[0.06, 2.8, 0.06]} />
        <meshStandardMaterial color="#e8f8ff" />
      </mesh>
    </group>
  );
}
