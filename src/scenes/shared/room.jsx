import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GradientSky, Stars, SunSprite, Haze, LightShafts, Motes, FakeShadow, CloudLayer, GroundMist, BirdFlock } from './atmosphere';
import { Ocean } from './water';
import { IslandCluster } from './nature';
import {
  glowTexture,
  mapTexture,
  themeTexture,
  screenTexture,
  woodTexture,
  plasterTexture,
  fabricTexture,
  rugTexture,
  brushedMetalTexture,
} from '../../utils/textures';

const VARIANTS = {
  day: {
    top: '#4d9fd6',
    bottom: '#cdeeff',
    horizon: '#fff2d2',
    sun: '#ffe7b3',
    sunPos: [12, 16, -30],
    ambient: '#cfe8ff',
    ambientIntensity: 0.75,
    sunLight: '#fff0d0',
    sunIntensity: 2.6,
    lamp: 2,
    oceanDeep: '#0a4a63',
    oceanShallow: '#2fa3b8',
    fog: '#bcdced',
    dust: '#ffe9bd',
    dustOpacity: 0.4,
  },
  dusk: {
    top: '#1a2b52',
    bottom: '#e88c63',
    horizon: '#ffce96',
    sun: '#ffbe7d',
    sunPos: [-16, 9, -34],
    ambient: '#8fb0cf',
    ambientIntensity: 0.5,
    sunLight: '#ffab6b',
    sunIntensity: 2.1,
    lamp: 3.2,
    oceanDeep: '#082a3d',
    oceanShallow: '#1f7d92',
    fog: '#d29a7b',
    dust: '#ffca8c',
    dustOpacity: 0.55,
  },
  night: {
    top: '#040d1c',
    bottom: '#122c44',
    horizon: '#2a4a68',
    sun: '#9fc4ff',
    sunPos: [20, 22, -30],
    ambient: '#5b7ea8',
    ambientIntensity: 0.32,
    sunLight: '#9dbbff',
    sunIntensity: 0.9,
    lamp: 6,
    oceanDeep: '#031620',
    oceanShallow: '#0a4356',
    fog: '#122a3a',
    dust: '#9fc6ff',
    dustOpacity: 0.25,
  },
};

export function Room({ variant = 'dusk', outside = true, showSky = true, children }) {
  const p = VARIANTS[variant] || VARIANTS.dusk;
  return (
    <group>
      {showSky && (
        <>
          <GradientSky top={p.top} bottom={p.bottom} horizon={p.horizon} sunColor={p.sun} sunDir={[p.sunPos[0], p.sunPos[1], p.sunPos[2]]} radius={420} />
          <SunSprite position={p.sunPos} scale={26} color={p.sun} opacity={variant === 'night' ? 0.45 : 0.95} />
          {variant === 'night' && <Stars count={900} radius={300} size={1.4} opacity={0.9} />}
          {outside && (
            <group>
              <Ocean size={420} segments={64} amp={0.34} y={-1.6} deep={p.oceanDeep} shallow={p.oceanShallow} horizon={p.horizon} sun={p.sun} sunDir={[p.sunPos[0], p.sunPos[1], -40]} opacity={1} />
              <IslandCluster center={[0, -1.5, -48]} count={8} spread={28} seed={9} scale={0.8} />
              <Haze position={[0, 6, -60]} scale={[220, 50, 1]} color={p.fog} opacity={variant === 'night' ? 0.08 : 0.22} />
              <CloudLayer count={10} height={34} radius={180} color={variant === 'night' ? '#5d7896' : '#fff0dc'} opacity={variant === 'night' ? 0.24 : 0.34} speed={0.25} />
              <GroundMist position={[0, 0.5, -46]} scale={[150, 16]} color={p.fog} opacity={variant === 'night' ? 0.1 : 0.18} speed={0.25} count={4} />
              <BirdFlock count={variant === 'night' ? 0 : 6} center={[-8, 18, -46]} radius={12} color={variant === 'night' ? '#1a2630' : '#39424a'} scale={0.8} />
            </group>
          )}
        </>
      )}
      <ambientLight color={p.ambient} intensity={p.ambientIntensity * 0.72} />
      <hemisphereLight args={[p.ambient, variant === 'night' ? '#121a20' : '#6d5540', p.ambientIntensity * 0.45]} />
      <directionalLight
        position={p.sunPos}
        color={p.sunLight}
        intensity={p.sunIntensity}
        castShadow
        shadow-mapSize={[1536, 1536]}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={11}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-6, 3.2, 4]} color={variant === 'night' ? '#5d7fae' : '#ffd9b0'} intensity={variant === 'night' ? 0.5 : 0.65} />
      <pointLight position={[0, 3.9, 0.4]} color="#ffd9a3" intensity={p.lamp} distance={14} decay={2} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.001} />
      <pointLight position={[3.4, 2.2, -5.3]} color={p.sun} intensity={variant === 'night' ? 1.2 : 0.45} distance={7} decay={2} />
      <RoomShell variant={variant} />
      <Desk variant={variant} />
      <Chair position={[-0.78, 0, -1.82]} rotation={[0, Math.PI, 0]} color="#3e5568" />
      <Chair position={[0.82, 0, -1.82]} rotation={[0, Math.PI, 0]} color="#405a70" />
      <MapWall position={[4.55, 2.3, -5.86]} />
      <PosterScreen position={[-4.5, 2.35, -5.87]} variant={variant} />
      <Bookshelf position={[-6.35, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} />
      <WallShelf position={[4.55, 3.55, -5.9]} variant={variant} />
      <RoomPlant position={[5.9, 0, -4.7]} />
      <RoomPlant position={[-5.6, 0, 1.0]} scale={0.75} />
      <CeilingLamp position={[0, 4.55, 0]} variant={variant} />
      <FX variant={variant} />
      {children}
    </group>
  );
}

function RoomShell({ variant }) {
  const night = variant === 'night';
  const floorMap = useMemo(() => woodTexture(night ? 'dark' : 'oak', [3.6, 2.8]), [night]);
  const wallMap = useMemo(() => plasterTexture(night ? '#22323f' : '#cbb89c', [1.6, 1.1]), [night]);
  const sideMap = useMemo(() => plasterTexture(night ? '#1b2a36' : '#c2ad90', [2.4, 1.1]), [night]);
  const rugMap = useMemo(() => rugTexture(night ? '#30506a' : '#9d3b3a', night ? '#16232c' : '#2c3d49'), [night]);
  const wall = night ? '#1b2a38' : '#cbb89c';
  const wallDark = night ? '#15222e' : '#b6a184';
  const trim = night ? '#2c3c46' : '#e5d3b7';
  const woodTrim = night ? '#33271e' : '#6b4f35';

  return (
    <group>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[14, 0.12, 12]} />
        <meshStandardMaterial map={floorMap} color={night ? '#b9a89a' : '#ffffff'} roughness={0.72} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.012, 1.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.8, 3.5]} />
        <meshStandardMaterial map={rugMap} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.022, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.9, 3.6]} />
        <meshBasicMaterial color={night ? '#4a6a7e' : '#d7b28a'} transparent opacity={0.08} />
      </mesh>

      <mesh position={[-4.8, 2.5, -6.04]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 5, 0.18]} />
        <meshStandardMaterial map={wallMap} color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[4.8, 2.5, -6.04]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 5, 0.18]} />
        <meshStandardMaterial map={wallMap} color={wall} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.62, -6.04]} receiveShadow>
        <boxGeometry args={[5.2, 1.24, 0.18]} />
        <meshStandardMaterial map={wallMap} color={wallDark} roughness={0.92} />
      </mesh>
      <mesh position={[0, 4.32, -6.04]} receiveShadow>
        <boxGeometry args={[5.2, 1.36, 0.18]} />
        <meshStandardMaterial map={wallMap} color={wallDark} roughness={0.92} />
      </mesh>
      <mesh position={[-7.04, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.18, 5, 12]} />
        <meshStandardMaterial map={sideMap} color={wallDark} roughness={0.92} />
      </mesh>
      <mesh position={[7.04, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.18, 5, 12]} />
        <meshStandardMaterial map={sideMap} color={wallDark} roughness={0.92} />
      </mesh>
      <mesh position={[0, 5.02, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={night ? '#101c26' : '#d8c6ac'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.12, -5.94]} receiveShadow>
        <boxGeometry args={[14, 0.22, 0.1]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.12, 5.94]} receiveShadow>
        <boxGeometry args={[14, 0.22, 0.1]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[-6.94, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.22, 12]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[6.94, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.1, 0.22, 12]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>

      <mesh position={[0, 4.86, -5.94]}>
        <boxGeometry args={[14, 0.16, 0.12]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[-6.94, 4.86, 0]}>
        <boxGeometry args={[0.12, 0.16, 12]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[6.94, 4.86, 0]}>
        <boxGeometry args={[0.12, 0.16, 12]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>

      <mesh position={[0, 4.9, -5.82]}>
        <boxGeometry args={[11.6, 0.025, 0.025]} />
        <meshBasicMaterial color={night ? '#8fc6df' : '#ffe9c4'} toneMapped={false} />
      </mesh>
      <mesh position={[-6.82, 4.9, 0.6]}>
        <boxGeometry args={[0.025, 0.025, 9]} />
        <meshBasicMaterial color={night ? '#8fc6df' : '#ffe9c4'} toneMapped={false} />
      </mesh>
      <mesh position={[6.82, 4.9, 0.6]}>
        <boxGeometry args={[0.025, 0.025, 9]} />
        <meshBasicMaterial color={night ? '#8fc6df' : '#ffe9c4'} toneMapped={false} />
      </mesh>

      <mesh position={[0, 0.4, -5.5]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 0.5, 0.62]} />
        <meshStandardMaterial color={woodTrim} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.69, -5.5]} castShadow>
        <boxGeometry args={[5.5, 0.16, 0.58]} />
        <meshStandardMaterial color={night ? '#38506a' : '#d9c4a2'} roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.4, -5.92]}>
        <planeGeometry args={[5.2, 2.4]} />
        <meshPhysicalMaterial
          color="#c8efff"
          transparent
          opacity={0.16}
          roughness={0.04}
          metalness={0}
          transmission={0.55}
          thickness={0.08}
          ior={1.4}
          envMapIntensity={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <WindowFrame variant={variant} />
    </group>
  );
}

function WindowFrame({ variant }) {
  const night = variant === 'night';
  const frameMap = useMemo(() => woodTexture(night ? 'dark' : 'warm', [1.2, 1.2]), [night]);
  const curtainMap = useMemo(() => fabricTexture(night ? '#3b2a2a' : '#7a5543', [1.5, 2.4]), [night]);
  return (
    <group position={[0, 2.4, -5.83]}>
      <mesh position={[0, -1.26, 0]} castShadow>
        <boxGeometry args={[5.5, 0.14, 0.24]} />
        <meshStandardMaterial map={frameMap} color={night ? '#8a7560' : '#ffffff'} roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.26, 0]} castShadow>
        <boxGeometry args={[5.5, 0.14, 0.24]} />
        <meshStandardMaterial map={frameMap} color={night ? '#8a7560' : '#ffffff'} roughness={0.65} />
      </mesh>
      <mesh position={[-2.66, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 2.54, 0.24]} />
        <meshStandardMaterial map={frameMap} color={night ? '#8a7560' : '#ffffff'} roughness={0.65} />
      </mesh>
      <mesh position={[2.66, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 2.54, 0.24]} />
        <meshStandardMaterial map={frameMap} color={night ? '#8a7560' : '#ffffff'} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 2.54, 0.18]} />
        <meshStandardMaterial map={frameMap} color={night ? '#8a7560' : '#ffffff'} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.62, 0]} castShadow>
        <boxGeometry args={[5.1, 0.09, 0.18]} />
        <meshStandardMaterial map={frameMap} color={night ? '#8a7560' : '#ffffff'} roughness={0.65} />
      </mesh>
      <mesh position={[0, -1.36, 0.2]} castShadow>
        <boxGeometry args={[5.8, 0.16, 0.54]} />
        <meshStandardMaterial map={frameMap} color={night ? '#7a6652' : '#f0e2cc'} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.5, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 6.3, 12]} />
        <meshStandardMaterial map={brushedMetalTexture('#6d6156', [1, 1])} metalness={0.7} roughness={0.35} />
      </mesh>
      {[-3.16, 3.16].map((x) => (
        <mesh key={x} position={[x, 1.5, 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial map={brushedMetalTexture('#6d6156', [1, 1])} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <Curtain position={[-2.36, 0, 0.34]} map={curtainMap} side={1} />
      <Curtain position={[2.36, 0, 0.34]} map={curtainMap} side={-1} />
    </group>
  );
}

function Curtain({ position, map, side }) {
  return (
    <group position={position}>
      {Array.from({ length: 9 }, (_, i) => {
        const x = side * (i * 0.075 - 0.05);
        const fold = Math.sin(i * 1.4) * 0.035;
        return (
          <mesh key={i} position={[x, 0.02, fold]} castShadow>
            <cylinderGeometry args={[0.045, 0.075, 2.32, 8]} />
            <meshStandardMaterial map={map} color="#ffe6d2" roughness={0.96} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Desk({ variant = 'dusk' }) {
  const night = variant === 'night';
  const wood = useMemo(() => woodTexture(night ? 'dark' : 'oak', [1.1, 0.55]), [night]);
  const woodSide = useMemo(() => woodTexture(night ? 'dark' : 'oak', [0.5, 0.5]), [night]);
  const metal = useMemo(() => brushedMetalTexture('#8d8579', [1, 1]), []);
  return (
    <group position={[0, 0, -2.9]}>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 0.13, 1.55]} />
        <meshStandardMaterial map={wood} color={night ? '#b7a08a' : '#ffffff'} roughness={0.48} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.715, 0]} castShadow>
        <boxGeometry args={[3.3, 0.02, 1.4]} />
        <meshStandardMaterial color={night ? '#241a13' : '#6c5138'} roughness={0.85} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x * 1.58, 0.36, z * 0.64]} castShadow>
            <boxGeometry args={[0.11, 0.76, 0.11]} />
            <meshStandardMaterial map={woodSide} color={night ? '#9c8574' : '#ffffff'} roughness={0.7} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[3.16, 0.07, 0.07]} />
        <meshStandardMaterial map={woodSide} color={night ? '#8f7a68' : '#ffffff'} roughness={0.7} />
      </mesh>
      <mesh position={[0.72, 0.42, -0.42]} castShadow>
        <boxGeometry args={[1.7, 0.62, 0.64]} />
        <meshStandardMaterial map={woodSide} color={night ? '#8f7a68' : '#ffffff'} roughness={0.62} />
      </mesh>
      {[0.25, 0.47, 0.69].map((y, i) => (
        <group key={y} position={[0.72, y, -0.06]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[1.58, 0.19, 0.05]} />
            <meshStandardMaterial map={wood} color={night ? '#a08a76' : '#f6ecdd'} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0, 0.035]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.24, 8]} />
            <meshStandardMaterial map={metal} metalness={0.8} roughness={0.28} />
          </mesh>
          {i === 2 && (
            <mesh position={[0, -0.085, 0.04]}>
              <boxGeometry args={[0.18, 0.025, 0.01]} />
              <meshStandardMaterial color="#c9a55c" metalness={0.7} roughness={0.3} />
            </mesh>
          )}
        </group>
      ))}
      <FakeShadow position={[0, -0.66, 0]} scale={4.7} opacity={0.42} />
      <mesh position={[0.25, 0.85, 0.05]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.1, 1.2]} />
        <meshStandardMaterial map={mapTexture()} roughness={0.8} />
      </mesh>
      <Laptop position={[-0.75, 0.85, -0.3]} rotation={[0, 0.5, 0]} night={night} />
      <mesh position={[0.75, 0.85, 0.42]} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.04, 20]} />
        <meshStandardMaterial color="#e2dbcd" roughness={0.42} />
      </mesh>
      <mesh position={[0.75, 0.9, 0.42]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.06, 20, 1, true]} />
        <meshStandardMaterial color="#b14032" roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.75, 0.925, 0.42]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 20]} />
        <meshStandardMaterial color="#3a1712" roughness={0.4} />
      </mesh>
      <mesh position={[0.94, 0.93, 0.42]} rotation={[0, 0, -0.3]}>
        <torusGeometry args={[0.055, 0.018, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#e2dbcd" roughness={0.42} />
      </mesh>
      <DeskLamp position={[1.35, 0.85, -0.4]} night={night} />
      <mesh position={[-1.3, 0.87, 0.35]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.32, 0.08, 0.24]} />
        <meshStandardMaterial color="#2f4763" roughness={0.7} />
      </mesh>
      <mesh position={[-1.3, 0.93, 0.35]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.22]} />
        <meshStandardMaterial color="#e7ddc9" roughness={0.8} />
      </mesh>
      <Notebook position={[-1.05, 0.86, -0.28]} rotation={[0, -0.25, 0]} />
      <PenCup position={[0.25, 0.86, -0.55]} />
      <PhotoFrame position={[-1.45, 0.86, -0.55]} rotation={[0, 0.55, 0]} />
      <Globe position={[1.48, 0.86, 0.32]} night={night} />
      <Headphones position={[0.18, 0.86, 0.52]} />
    </group>
  );
}

function Notebook({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.42, 0.035, 0.3]} />
        <meshStandardMaterial color="#2f4763" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.021, 0]}>
        <boxGeometry args={[0.38, 0.006, 0.26]} />
        <meshStandardMaterial color="#f4efdf" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.027, 0.02]}>
        <boxGeometry args={[0.24, 0.002, 0.004]} />
        <meshStandardMaterial color="#9aa8b4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.032, 0.02]}>
        <boxGeometry args={[0.2, 0.002, 0.004]} />
        <meshStandardMaterial color="#9aa8b4" roughness={0.9} />
      </mesh>
    </group>
  );
}

function PenCup({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.075, 0.16, 12, 1, true]} />
        <meshStandardMaterial color="#46545f" metalness={0.6} roughness={0.32} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.075, 12]} />
        <meshStandardMaterial color="#2b343c" metalness={0.6} roughness={0.4} />
      </mesh>
      {[
        [0.02, 0.5, 0.02, '#d8a13d'],
        [-0.03, 0.75, -0.01, '#3f6d8a'],
        [0.035, 0.3, -0.025, '#8a3f3a'],
      ].map(([x, tilt, z, color], i) => (
        <mesh key={i} position={[x, 0.13, z]} rotation={[0, 0, tilt]}>
          <cylinderGeometry args={[0.008, 0.008, 0.26, 6]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function PhotoFrame({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.26, 0.22, 0.02]} />
        <meshStandardMaterial color="#3c2b20" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.1, 0.013]}>
        <planeGeometry args={[0.22, 0.18]} />
        <meshStandardMaterial map={themeTexture('bay')} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.01, 0.05]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.05, 0.03, 0.14]} />
        <meshStandardMaterial color="#2a1f18" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Globe({ position, night }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.03, 16]} />
        <meshStandardMaterial color="#3a2a1e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow>
        <sphereGeometry args={[0.11, 20, 16]} />
        <meshStandardMaterial color={night ? '#2b5a70' : '#3f7f96'} roughness={0.65} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[0.125, 0.008, 6, 24]} />
        <meshStandardMaterial color="#c9a55c" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[1.2, 0, -0.4]}>
        <torusGeometry args={[0.128, 0.006, 6, 24]} />
        <meshStandardMaterial color="#c9a55c" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Headphones({ position }) {
  return (
    <group position={position} rotation={[0, -0.3, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <torusGeometry args={[0.15, 0.022, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#262d34" roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.15, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.055, 0.06, 0.045, 14]} />
          <meshStandardMaterial color="#333c44" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Laptop({ position, rotation, night }) {
  const tex = useMemo(() => screenTexture({ title: 'QUANG NINH 2076', subtitle: 'A future project', rows: ['Green energy', 'Smart transport', 'Heritage preservation'], accent: '#6ff0ff', theme: 'tech' }), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.01, 0]} castShadow>
        <boxGeometry args={[0.82, 0.028, 0.56]} />
        <meshStandardMaterial color="#2b333d" metalness={0.7} roughness={0.32} />
      </mesh>
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => (
          <mesh key={`${row}-${col}`} position={[-0.3 + col * 0.055, 0.026, -0.14 + row * 0.045]}>
            <boxGeometry args={[0.044, 0.004, 0.034]} />
            <meshStandardMaterial color={night ? '#54606b' : '#3b4650'} roughness={0.6} emissive={night ? '#0d2230' : '#000000'} emissiveIntensity={0.4} />
          </mesh>
        ))
      )}
      <mesh position={[0, 0.028, 0.12]}>
        <boxGeometry args={[0.32, 0.004, 0.16]} />
        <meshStandardMaterial color="#333d47" roughness={0.45} />
      </mesh>
      <group position={[0, 0.02, -0.275]} rotation={[-1.85, 0, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.82, 0.52, 0.022]} />
          <meshStandardMaterial color="#222a33" metalness={0.6} roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.26, 0.013]}>
          <planeGeometry args={[0.76, 0.47]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.26, 0.02]}>
          <planeGeometry args={[0.76, 0.47]} />
          <meshBasicMaterial color="#7fe6ff" transparent opacity={0.08} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 0.26, 0.1]} color="#7fdcff" intensity={night ? 1.1 : 0.55} distance={1.8} decay={2} />
      </group>
      <mesh position={[0, 0.03, -0.27]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.72, 8]} />
        <meshStandardMaterial color="#4a5560" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function DeskLamp({ position, night }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 12]} />
        <meshStandardMaterial color="#454f57" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.02, 0.02, 0.52, 6]} />
        <meshStandardMaterial color="#5a666f" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.52, 0]} rotation={[0, 0, -0.7]}>
        <coneGeometry args={[0.16, 0.2, 12, 1, true]} />
        <meshStandardMaterial color="#c9b48c" metalness={0.3} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0.26, 0.44, 0]} color="#ffd9a0" intensity={night ? 3.2 : 1.4} distance={4} decay={2} />
      <sprite position={[0.26, 0.44, 0]} scale={[0.8, 0.8, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color="#ffd9a0" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function Chair({ position, rotation, color = '#3e5568' }) {
  const cushion = useMemo(() => fabricTexture(color, [1.6, 1.6]), [color]);
  const metal = useMemo(() => brushedMetalTexture('#6a717a', [1, 1]), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[0.64, 0.11, 0.62]} />
        <meshStandardMaterial map={cushion} color={color} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.53, 0.02]}>
        <boxGeometry args={[0.58, 0.06, 0.54]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.79, -0.27]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.62, 0.64, 0.1]} />
        <meshStandardMaterial map={cushion} color={color} roughness={0.92} />
      </mesh>
      {[0.62, 0.76, 0.9].map((y) => (
        <mesh key={y} position={[0, y, -0.215]}>
          <sphereGeometry args={[0.016, 8, 6]} />
          <meshStandardMaterial color="#1f2a33" roughness={0.6} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.33, 0.66, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.028, 0.028, 0.34, 8]} />
            <meshStandardMaterial map={metal} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[s * 0.33, 0.74, -0.02]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.05, 0.05, 10]} />
            <meshStandardMaterial color="#2a323a" roughness={0.7} />
          </mesh>
          <mesh position={[s * 0.33, 0.58, -0.02]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 10]} />
            <meshStandardMaterial map={metal} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.32, 12]} />
        <meshStandardMaterial map={metal} metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0, 0.14, 0.18]} rotation={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.045, 0.36]} />
              <meshStandardMaterial map={metal} metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.06, 0.34]} castShadow>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshStandardMaterial color="#23282e" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      <FakeShadow position={[0, 0.006, 0]} scale={1.7} opacity={0.4} />
    </group>
  );
}

export function MapWall({ position = [4.55, 2.3, -5.86], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[2.9, 1.55, 0.08]} />
        <meshStandardMaterial color="#2e241c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[2.7, 1.35]} />
        <meshStandardMaterial map={mapTexture()} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.75, 0.08]}>
        <boxGeometry args={[2.9, 0.06, 0.1]} />
        <meshStandardMaterial color="#d9b26b" emissive="#d9b26b" emissiveIntensity={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.42, 0, 0.08]}>
          <boxGeometry args={[0.06, 1.55, 0.1]} />
          <meshStandardMaterial color="#d9b26b" emissive="#d9b26b" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function PosterScreen({ position, variant }) {
  const tex = useMemo(() => themeTexture(variant === 'night' ? 'city' : 'bay'), [variant]);
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.1, 1.5, 0.06]} />
        <meshStandardMaterial color="#231c16" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.95, 1.35]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Bookshelf({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const wood = useMemo(() => woodTexture('dark', [0.5, 0.8]), []);
  const books = useMemo(() => {
    const colors = ['#8a4a3a', '#3f5d68', '#a3813f', '#4f5d43', '#6d4a6c', '#8a6b45', '#5c3f33', '#455a70'];
    return Array.from({ length: 34 }, (_, i) => {
      const row = Math.floor(i / 7);
      return {
        x: (i % 7) * 0.17 - 0.51,
        y: 0.42 + row * 0.59,
        z: 0.02,
        h: 0.28 + ((i * 7) % 4) * 0.045,
        w: 0.11 + (i % 3) * 0.018,
        lean: i === 5 || i === 19 ? 0.22 : 0,
        color: colors[i % colors.length],
      };
    });
  }, []);
  const stacks = [
    { x: 0.4, y: 0.62, z: 0.12 },
    { x: -0.36, y: 1.8, z: 0.1 },
    { x: 0.42, y: 2.42, z: 0.1 },
  ];
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.2, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.44, 2.42, 0.46]} />
        <meshStandardMaterial map={wood} color="#8a705a" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.2, -0.29]}>
        <boxGeometry args={[1.36, 2.34, 0.02]} />
        <meshStandardMaterial color="#2f241b" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.68, 1.24, 0]} castShadow>
          <boxGeometry args={[0.08, 2.48, 0.5]} />
          <meshStandardMaterial map={wood} color="#7c6551" roughness={0.8} />
        </mesh>
      ))}
      {[0.1, 0.53, 0.96, 1.39, 1.82, 2.25, 2.46].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[1.42, 0.055, 0.48]} />
          <meshStandardMaterial map={wood} color="#a08669" roughness={0.78} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[0, 0, b.lean]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.22]} />
          <meshStandardMaterial color={b.color} roughness={0.88} />
        </mesh>
      ))}
      {stacks.map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]}>
          {[0, 1, 2].map((j) => (
            <mesh key={j} position={[0, j * 0.045, 0]} rotation={[0, j * 0.08, 0]}>
              <boxGeometry args={[0.26 - j * 0.015, 0.04, 0.2]} />
              <meshStandardMaterial color={['#7a4f3c', '#d8c9ad', '#4b6678'][j]} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[-0.42, 2.32, 0.08]}>
        <cylinderGeometry args={[0.09, 0.11, 0.17, 12]} />
        <meshStandardMaterial color="#8c6b4f" roughness={0.8} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-0.42 + Math.cos(i) * 0.04, 2.46 + (i % 3) * 0.025, 0.08 + Math.sin(i) * 0.04]} rotation={[0.5, i, 0]}>
          <sphereGeometry args={[0.055, 6, 5]} />
          <meshStandardMaterial color={i % 2 ? '#3f6b45' : '#547f50'} roughness={0.9} flatShading />
        </mesh>
      ))}
      <mesh position={[0.36, 1.48, 0.06]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.03]} />
        <meshStandardMaterial color="#3c2b20" roughness={0.6} />
      </mesh>
      <mesh position={[0.36, 1.48, 0.078]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[0.18, 0.26]} />
        <meshStandardMaterial map={themeTexture('bay')} roughness={0.8} />
      </mesh>
      <FakeShadow position={[0, 0.02, 0]} scale={1.5} opacity={0.4} />
    </group>
  );
}

function WallShelf({ position, variant }) {
  const night = variant === 'night';
  const wood = useMemo(() => woodTexture(night ? 'dark' : 'oak', [0.8, 0.2]), [night]);
  const rows = [0, 0.62, 1.24];
  return (
    <group position={position}>
      {rows.map((y, i) => (
        <group key={y}>
          <mesh position={[0, y, 0]} castShadow>
            <boxGeometry args={[1.9, 0.07, 0.3]} />
            <meshStandardMaterial map={wood} color={night ? '#9a8572' : '#ffffff'} roughness={0.7} />
          </mesh>
          {[-0.86, 0.86].map((s) => (
            <mesh key={s} position={[s, y - 0.12, 0]}>
              <boxGeometry args={[0.05, 0.18, 0.26]} />
              <meshStandardMaterial color={night ? '#2a211a' : '#5e4430'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.7 + i * 0.09, 0.24, 0.02]} castShadow>
          <boxGeometry args={[0.07, 0.32 + (i % 3) * 0.04, 0.2]} />
          <meshStandardMaterial color={['#7a4f3c', '#405a68', '#a3813f', '#4f5d43', '#6d4a6c'][i]} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0.42, 0.73, 0.02]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.18, 12]} />
        <meshStandardMaterial color="#a5765a" roughness={0.85} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0.42 + Math.cos(i * 1.9) * 0.07, 0.88 + (i % 3) * 0.04, Math.sin(i * 1.9) * 0.07]} rotation={[0.6, i, 0]}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <meshStandardMaterial color={i % 2 ? '#4f7d4e' : '#3f6b45'} roughness={0.9} flatShading />
        </mesh>
      ))}
      <mesh position={[-0.45, 1.34, 0.02]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.22, 0.3, 0.03]} />
        <meshStandardMaterial color="#3c2b20" roughness={0.6} />
      </mesh>
      <mesh position={[-0.45, 1.34, 0.04]} rotation={[0, 0.4, 0]}>
        <planeGeometry args={[0.18, 0.26]} />
        <meshStandardMaterial map={themeTexture('city')} roughness={0.8} />
      </mesh>
      <mesh position={[0.55, 1.28, 0.02]} castShadow>
        <cylinderGeometry args={[0.075, 0.09, 0.04, 14]} />
        <meshStandardMaterial color="#3a2a1e" roughness={0.6} />
      </mesh>
      <mesh position={[0.55, 1.35, 0.02]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={night ? '#2d4a5e' : '#3f7f96'} roughness={0.55} metalness={0.15} />
      </mesh>
    </group>
  );
}

export function RoomPlant({ position = [0, 0, 0], scale = 1 }) {
  const pot = useMemo(() => plasterTexture('#a56b4b', [1.2, 1.2]), []);
  const leaves = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => {
      const tier = Math.floor(i / 7);
      return {
        a: (i / 22) * Math.PI * 2 + tier * 0.5,
        r: 0.14 + tier * 0.12 + (i % 3) * 0.04,
        y: 0.52 + tier * 0.22 + (i % 4) * 0.055,
        tilt: 0.35 + (i % 4) * 0.24,
        s: 0.6 + (i % 3) * 0.22,
        hue: i % 3,
      };
    });
  }, []);
  const greens = ['#315c3a', '#3f6b45', '#4f7d4e', '#5d8f57'];
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.48, 20]} />
        <meshStandardMaterial map={pot} color="#c98d68" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.47, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.23, 0.025, 8, 24]} />
        <meshStandardMaterial color="#8a5a40" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.215, 20]} />
        <meshStandardMaterial color="#3a2a1c" roughness={1} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.5, 6]} />
        <meshStandardMaterial color="#4a6b3f" roughness={0.9} />
      </mesh>
      {leaves.map((l, i) => (
        <group key={i} position={[Math.cos(l.a) * l.r * 0.55, l.y - 0.05, Math.sin(l.a) * l.r * 0.55]} rotation={[0, -l.a, 0]}>
          <mesh position={[0, 0.08, 0]} rotation={[l.tilt, 0, 0]}>
            <cylinderGeometry args={[0.008, 0.01, 0.22, 5]} />
            <meshStandardMaterial color="#3f5d3a" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.2, 0.05]} rotation={[l.tilt * 0.9, 0, 0]} scale={[0.55, 0.16, 1]}>
            <sphereGeometry args={[0.15 * l.s, 8, 6]} />
            <meshStandardMaterial color={greens[l.hue]} roughness={0.92} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.31, 0.33, 0.03, 20]} />
        <meshStandardMaterial color="#7a4f3a" roughness={0.9} />
      </mesh>
      <FakeShadow position={[0, 0.021, 0]} scale={1.15} opacity={0.4} />
    </group>
  );
}

export function CeilingLamp({ position, variant }) {
  const night = variant === 'night';
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.05, 16]} />
        <meshStandardMaterial color="#3a3833" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.48, 6]} />
        <meshStandardMaterial color="#6b6257" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.04, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.46, 0.2, 24, 1, true]} />
        <meshStandardMaterial
          color={night ? '#2a3a46' : '#e6d9bf'}
          roughness={0.5}
          metalness={0.25}
          emissive="#ffd9a3"
          emissiveIntensity={night ? 0.9 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 24]} />
        <meshStandardMaterial color="#fff0cf" emissive="#ffe3ad" emissiveIntensity={night ? 3.2 : 1.9} transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color="#fff6df" emissive="#ffe3ad" emissiveIntensity={night ? 3.6 : 2.2} />
      </mesh>
      <mesh position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.355, 0.012, 8, 32]} />
        <meshStandardMaterial color="#b9a375" metalness={0.8} roughness={0.25} />
      </mesh>
      <pointLight position={[0, -0.24, 0]} color="#ffe0a8" intensity={night ? 2.4 : 1.1} distance={9} decay={2} />
      <sprite position={[0, -0.12, 0]} scale={[2.6, 2.6, 1]}>
        <spriteMaterial map={glowTexture('#ffffff')} color="#ffd9a0" transparent opacity={night ? 0.16 : 0.08} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

function FX({ variant }) {
  const p = VARIANTS[variant] || VARIANTS.dusk;
  return (
    <group>
      <LightShafts color={p.dust} opacity={variant === 'night' ? 0.06 : 0.13} count={4} position={[0.2, 0.4, -3.2]} />
      <Motes count={90} area={[6, 2.6, 6]} color={p.dust} size={0.035} speed={0.12} center={[1, 2.1, -2.8]} opacity={p.dustOpacity} />
    </group>
  );
}

export { VARIANTS as ROOM_VARIANTS };
