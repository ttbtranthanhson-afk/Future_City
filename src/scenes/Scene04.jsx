import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, SunSprite, CloudLayer, Haze, BirdFlock, Motes } from './shared/atmosphere';
import { Ocean } from './shared/water';
import { IslandCluster } from './shared/nature';
import {
  CityGround,
  InstancedCity,
  HeroTower,
  SkyTraffic,
  Skyway,
  ElevatedTrain,
  WindFarm,
  SolarFarm,
  HoloBillboard,
  PlazaTrees,
} from './shared/city';

const TRAFFIC = [
  [-95, 46, 35],
  [-50, 58, 5],
  [15, 42, -15],
  [85, 54, 12],
  [45, 62, 45],
  [-25, 52, 55],
];

const SKYWAY = [
  [-100, 30, 40],
  [-40, 42, 20],
  [20, 34, -10],
  [80, 38, 15],
  [40, 46, 45],
];

export default function Scene04() {
  useCinematicCamera({
    path: [
      [42, 84, 178],
      [24, 74, 155],
      [8, 68, 132],
      [-2, 64, 116],
      [0, 62, 108],
    ],
    look: [
      [0, 30, -95],
      [-2, 30, -95],
      [0, 28, -95],
      [0, 27, -92],
      [0, 26, -88],
    ],
    loop: 52,
    fov: 55,
    shake: 0.009,
  });
  return (
    <group>
      <hemisphereLight args={['#d8ecff', '#33513f', 0.65]} />
      <directionalLight position={[70, 95, 70]} color="#ffe9cc" intensity={1.1} />
      <GradientSky top="#14456d" bottom="#a8ddec" horizon="#ffe2b5" sunColor="#ffe6b8" sunDir={[0.35, 0.2, -1]} radius={700} />
      <SunSprite position={[110, 34, -320]} scale={70} color="#ffe7ba" opacity={0.95} />
      <CloudLayer count={20} height={62} radius={240} color="#ffe8d2" opacity={0.45} speed={0.45} />
      <Ocean size={1100} segments={70} amp={0.55} y={-0.45} deep="#073a50" shallow="#2a9fb2" horizon="#cdeef5" sun="#ffe6b0" opacity={1} />
      <group position={[0, -0.2, -95]}>
        <mesh position={[0, -1.4, 0]}>
          <boxGeometry args={[280, 3, 190]} />
          <meshStandardMaterial color="#2f5a48" roughness={0.95} />
        </mesh>
        <CityGround size={250} color="#0d1a22" accent="#1d6a86" />
        <InstancedCity count={92} area={[190, 150]} exclude={22} minHeight={20} maxHeight={92} seed={4} windowVariant={0} />
        <HeroTower position={[0, 0, 12]} width={16} depth={16} height={82} accent="#6ff0ff" label="2076" />
        <HeroTower position={[-48, 0, 24]} width={11} depth={11} height={62} accent="#79f2d0" tint="#0b2230" />
        <HeroTower position={[52, 0, 18]} width={12} depth={12} height={68} accent="#b18cff" tint="#151f35" />
        <SkyTraffic points={TRAFFIC} count={14} color="#6ff0ff" speed={0.028} spread={16} seed={7} />
        <Skyway points={SKYWAY} color="#6ff0ff" radius={0.4} />
        <ElevatedTrain position={[0, 9, 46]} length={150} speed={12} tint="#dfe9ee" accent="#6ff0ff" />
        <WindFarm center={[-82, 2, 66]} count={5} spacing={14} height={40} />
        <SolarFarm position={[74, 0.4, 58]} rows={3} cols={5} gap={3.4} accent="#6ff0ff" />
        <PlazaTrees count={12} radius={26} height={0.4} />
        <HoloBillboard position={[0, 66, 8]} width={30} height={13} title="QUANG NINH 2076" lines={['GREEN · SMART · LIVABLE']} accent="#8ff6e0" icon="tech" />
        <pointLight position={[0, 30, 20]} color="#8ff6e0" intensity={160} distance={120} decay={2} />
      </group>
      <IslandCluster center={[-170, -0.5, -70]} count={5} spread={34} seed={18} scale={0.7} />
      <IslandCluster center={[175, -0.5, -105]} count={6} spread={38} seed={28} scale={0.6} />
      <Haze position={[0, 14, -170]} scale={[420, 90, 1]} color="#d9ecf2" opacity={0.22} />
      <BirdFlock count={12} center={[0, 34, -40]} radius={26} color="#404b52" speed={0.18} scale={1.2} />
      <Motes count={140} area={[120, 40, 80]} color="#ffe6bd" size={0.12} speed={0.15} center={[0, 20, -40]} opacity={0.35} />
    </group>
  );
}
