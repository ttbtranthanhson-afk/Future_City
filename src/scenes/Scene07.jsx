import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Haze, BirdFlock, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster, LimestoneIsland, TourBoat, Pagoda, Tree } from './shared/nature';
import { Lanterns } from './shared/effects';

const BOATS = [
  { position: [-48, 0.35, 14], rotation: [0, 0.45, 0], scale: 1.4, phase: 0.2, fishing: false },
  { position: [-28, 0.3, 4], rotation: [0, -0.7, 0], scale: 1.05, phase: 1.4, fishing: false },
  { position: [-6, 0.3, -8], rotation: [0, 1.05, 0], scale: 0.82, phase: 2.6, fishing: true },
  { position: [20, 0.3, 8], rotation: [0, -0.3, 0], scale: 1.0, phase: 3.4, fishing: false },
  { position: [42, 0.3, -22], rotation: [0, -1.0, 0], scale: 0.72, phase: 0.8, fishing: false },
  { position: [-58, 0.3, -34], rotation: [0, 0.8, 0], scale: 0.68, phase: 2.0, fishing: false },
  { position: [4, 0.3, -44], rotation: [0, 0.2, 0], scale: 0.6, phase: 3.1, fishing: true },
  { position: [62, 0.3, 10], rotation: [0, -0.55, 0], scale: 0.64, phase: 4.2, fishing: false },
];

export default function Scene07() {
  useCinematicCamera({
    path: [
      [78, 40, 116],
      [35, 31, 74],
      [-28, 25, 42],
      [-74, 20, 24],
      [-47, 25, 86],
    ],
    look: [
      [-8, 11, -68],
      [-18, 10, -63],
      [-29, 12, -55],
      [-16, 11, -65],
      [-5, 10, -72],
    ],
    loop: 64,
    fov: 53,
    shake: 0.008,
  });
  return (
    <group>
      <hemisphereLight args={['#ffdccc', '#253b43', 0.42]} />
      <directionalLight position={[-80, 60, 70]} color="#ffd0ad" intensity={0.72} />
      <GradientSky top="#347ab1" bottom="#e89c94" horizon="#ffd0b1" sunColor="#ffd2a2" sunDir={[-0.42, 0.2, -1]} radius={680} />
      <SunSprite position={[-150, 38, -300]} scale={62} color="#ffd3a2" opacity={0.48} />
      <CloudLayer count={16} height={60} radius={230} color="#ffe4d8" opacity={0.3} speed={0.22} />
      <Ocean size={1000} segments={80} amp={0.36} y={0} deep="#063b4d" shallow="#348b97" horizon="#efb9aa" sun="#e6bea5" sunDir={[-0.55, 0.28, -0.6]} opacity={1} />
      <IslandCluster center={[-10, 0, -66]} count={9} spread={42} seed={51} scale={0.9} />
      <IslandCluster center={[60, 0, -95]} count={7} spread={34} seed={57} scale={0.7} />
      <IslandCluster center={[-80, 0, -100]} count={6} spread={30} seed={63} scale={0.75} />
      <PagodaIsland />
      {BOATS.map((b, i) => (
        <TourBoat key={i} position={b.position} rotation={b.rotation} scale={b.scale} phase={b.phase} fishing={b.fishing} color="#f3f0e8" accent="#2c7d92" />
      ))}
      <Lanterns count={26} center={[-10, 15, -34]} area={[68, 4, 30]} seed={71} color="#e7b878" />
      <Lanterns count={12} center={[-32, 17, -56]} area={[8, 2, 8]} seed={73} color="#d9ad74" />
      <BirdFlock count={8} center={[-10, 27, -40]} radius={22} color="#424a4c" speed={0.14} scale={1.0} />
      <Haze position={[0, 10, -150]} scale={[380, 80, 1]} color="#f2c5ba" opacity={0.17} />
      <Motes count={48} area={[80, 20, 60]} color="#f0d5bf" size={0.065} speed={0.08} center={[0, 9, -30]} opacity={0.2} />
    </group>
  );
}

function PagodaIsland() {
  return (
    <group position={[-32, 0, -56]}>
      <LimestoneIsland height={30} width={22} seed={711} trees={false} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.3;
        const r = 15 + (i % 3) * 2.4;
        return <Tree key={`tree${i}`} position={[Math.cos(a) * r, 11.8 + (i % 2) * 0.6, Math.sin(a) * r]} scale={0.8} phase={i * 0.7} />;
      })}
      {[
        [-4.6, 13.2, 2.4],
        [4.4, 13.2, 2.8],
        [5.6, 13.2, -1.4],
        [-5.2, 13.2, -2.2],
      ].map((p, i) => (
        <Tree key={`t${i}`} position={p} scale={0.72} phase={i * 1.3} />
      ))}
      <group position={[0, 14.3, 1]} rotation={[0, 0.3, 0]}>
        <Pagoda scale={1.25} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 3.5, 14.3, 3.6]}>
          <mesh>
            <boxGeometry args={[0.16, 1.4, 0.16]} />
            <meshStandardMaterial color="#5b4a33" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[0.24, 0.12, 0.24]} />
            <meshStandardMaterial color="#c9aa72" emissive="#d7b878" emissiveIntensity={0.45} metalness={0.35} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.74, 0]}>
            <sphereGeometry args={[0.2, 10, 8]} />
            <meshStandardMaterial color="#e7c995" emissive="#d7b878" emissiveIntensity={0.65} />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`step${i}`} position={[0, 13.35 + i * 0.16, 4.6 + i * 0.28]} receiveShadow>
          <boxGeometry args={[2.8 - i * 0.2, 0.16, 0.34]} />
          <meshStandardMaterial color="#75806f" roughness={0.95} />
        </mesh>
      ))}
      <group position={[0, 5.6, 17]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.6, 0.16, 8]} />
          <meshStandardMaterial color="#6a533c" roughness={0.9} />
        </mesh>
        {[-1.1, 1.1].map((x) =>
          [0, 3, 6].map((z) => (
            <mesh key={`pole${x}${z}`} position={[x, -2.4, z]}>
              <cylinderGeometry args={[0.11, 0.13, 5.2, 6]} />
              <meshStandardMaterial color="#4c3a29" roughness={0.9} />
            </mesh>
          ))
        )}
        {[-1.1, 1.1].map((x) => (
          <mesh key={`rail${x}`} position={[x, 0.62, 3]}>
            <boxGeometry args={[0.08, 0.08, 7.6]} />
            <meshStandardMaterial color="#7d6347" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 6.8]}>
          <boxGeometry args={[2.3, 0.08, 0.08]} />
          <meshStandardMaterial color="#7d6347" roughness={0.85} />
        </mesh>
      </group>
      <mesh position={[0, 18.5, 4.5]}>
        <sphereGeometry args={[0.18, 10, 8]} />
        <meshStandardMaterial color="#e8c99b" emissive="#caa875" emissiveIntensity={0.7} />
      </mesh>
      <pointLight position={[0, 18.5, 4.5]} color="#e7c99c" intensity={3.5} distance={22} decay={2} />
      <pointLight position={[0, 7, 17]} color="#d7aa79" intensity={2.4} distance={13} decay={2} />
    </group>
  );
}
