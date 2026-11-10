import { useCinematicCamera } from '../hooks/useCinematicCamera';
import { GradientSky, Stars, Motes } from './shared/atmosphere';
import { SceneFog } from './shared/effects';
import { Human } from './shared/characters';
import {
  CityGround,
  InstancedCity,
  HeroTower,
  SkyTraffic,
  HoloBillboard,
  LightPillars,
  PlazaTrees,
  AutonomousBus,
} from './shared/city';
import { EnergyCore, DataWall, ControlScreen, Drone } from './shared/tech';

const TRAFFIC = [
  [-70, 28, 30],
  [-20, 34, 10],
  [30, 30, -5],
  [70, 36, 20],
  [20, 40, 40],
];

export default function Scene05() {
  useCinematicCamera({
    path: [
      [10, 3.4, 20],
      [7, 3.1, 13],
      [3, 2.9, 6],
      [-3, 2.7, -1],
      [-6.5, 3.0, -6],
    ],
    look: [
      [0, 5, -8],
      [0, 4.4, -8],
      [0, 4.0, -9],
      [1, 4.2, -12],
      [3, 9, -28],
    ],
    loop: 46,
    fov: 52,
    shake: 0.02,
  });
  return (
    <group>
      <SceneFog color="#07141f" near={10} far={135} />
      <hemisphereLight args={['#3d6a96', '#0a1018', 0.42]} />
      <directionalLight position={[-50, 80, 60]} color="#9fc8ff" intensity={0.55} />
      <GradientSky top="#030914" bottom="#0b2230" horizon="#1f5d70" sunColor="#6ff0ff" sunDir={[-0.3, 0.2, -1]} radius={520} />
      <Stars count={600} radius={320} size={1.2} opacity={0.75} />
      <CityGround size={320} color="#0a141c" accent="#1d6a86" />
      <group position={[0, 0, -48]}>
        <InstancedCity count={104} area={[200, 170]} exclude={26} minHeight={26} maxHeight={118} seed={11} windowVariant={1} />
        <HeroTower position={[0, 0, 6]} width={20} depth={20} height={110} accent="#6ff0ff" label="AI" />
        <HeroTower position={[-58, 0, 24]} width={12} depth={12} height={70} accent="#79f2d0" tint="#0a2030" />
        <HeroTower position={[62, 0, 30]} width={13} depth={13} height={80} accent="#b18cff" tint="#171c36" />
        <SkyTraffic points={TRAFFIC} count={12} color="#6ff0ff" speed={0.03} spread={12} seed={9} />
      </group>
      <EnergyCore position={[0, 4.4, -9]} scale={1.7} color="#6ff0ff" accent="#79f2d0" />
      <DataWall position={[0, 5.2, -17]} width={11} height={5} title="AI CENTRAL CONTROL" subtitle="QUẢNG NINH 2076" rows={['Smart Transport', 'Renewable Energy', 'Environment Data', 'Social Security']} accent="#6ff0ff" theme="tech" />
      <ControlScreen position={[-13, 4.5, -10]} rotation={[0, 0.65, 0]} width={6} height={3.2} title="GREEN ENERGY" rows={['Solar 42%', 'Wind 31%', 'Tidal 18%', 'Storage 9%']} accent="#79f2d0" />
      <ControlScreen position={[13, 4.2, -8]} rotation={[0, -0.65, 0]} width={6} height={3.2} title="TRANSPORT" rows={['Air Routes: 24', 'Ferry: 12', 'Autonomous Cars: 86', 'Traffic: 0']} accent="#b18cff" />
      <HoloBillboard position={[-24, 20, -34]} rotation={[0, 0.5, 0]} width={18} height={9} title="GREEN CITY" lines={['100% RENEWABLE ENERGY']} accent="#79f2d0" icon="eco" />
      <HoloBillboard position={[26, 17, -24]} rotation={[0, -0.55, 0]} width={16} height={8} title="AI 2076" lines={['CONNECTED WORLD', 'ALL PEOPLE']} accent="#b18cff" icon="tech" />
      <LightPillars count={14} spread={26} height={20} color="#6ff0ff" seed={6} />
      <PlazaTrees count={12} radius={15} height={0.1} />
      <AutonomousBus from={[-28, 0.1, 9]} to={[28, 0.1, 9]} speed={3} phase={0.2} color="#e9f3f5" accent="#6ff0ff" />
      <AutonomousBus from={[26, 0.1, -2]} to={[-26, 0.1, -2]} speed={2.4} phase={0.6} color="#d5ecec" accent="#79f2d0" />
      <Human preset="alex" position={[4.4, 0, 2.4]} rotation={[0, 0.7, 0]} talking phase={0.4} />
      <Human preset="engineer" position={[6.4, 0, -3.2]} rotation={[0, 0.2, 0]} phase={3.2} />
      <Drone position={[8, 12, -12]} accent="#6ff0ff" radius={9} speed={0.4} phase={0.5} />
      <Drone position={[-10, 15, -18]} accent="#b18cff" radius={7} speed={0.3} phase={2.2} />
      <Motes count={130} area={[44, 20, 44]} color="#9ff7ff" size={0.06} speed={0.12} center={[0, 8, -10]} opacity={0.45} />
      <pointLight position={[0, 6, 2]} color="#8ff6e0" intensity={40} distance={35} decay={2} />
    </group>
  );
}
