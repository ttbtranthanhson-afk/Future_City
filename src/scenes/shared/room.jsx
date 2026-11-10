import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GradientSky, Stars, SunSprite, Haze, LightShafts, Motes, FakeShadow } from './atmosphere';
import { Ocean } from './water';
import { IslandCluster } from './nature';
import { glowTexture, mapTexture, themeTexture, screenTexture } from '../../utils/textures';

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
              <Ocean size={420} segments={48} amp={0.3} y={-1.6} deep={p.oceanDeep} shallow={p.oceanShallow} horizon={p.horizon} sun={p.sun} sunDir={[p.sunPos[0], p.sunPos[1], -40]} opacity={1} />
              <IslandCluster center={[0, -1.5, -48]} count={7} spread={26} seed={9} scale={0.8} />
              <Haze position={[0, 6, -60]} scale={[220, 50, 1]} color={p.fog} opacity={variant === 'night' ? 0.08 : 0.22} />
            </group>
          )}
        </>
      )}
      <ambientLight color={p.ambient} intensity={p.ambientIntensity} />
      <directionalLight position={p.sunPos} color={p.sunLight} intensity={p.sunIntensity} />
      <pointLight position={[0, 3.9, 0.4]} color="#ffd9a3" intensity={p.lamp} distance={14} decay={2} />
      <RoomShell variant={variant} />
      <Desk variant={variant} />
      <Chair position={[-0.78, 0, -1.82]} rotation={[0, Math.PI, 0]} color="#3e5568" />
      <Chair position={[0.82, 0, -1.82]} rotation={[0, Math.PI, 0]} color="#405a70" />
      <MapWall position={[4.55, 2.3, -5.86]} />
      <PosterScreen position={[-4.5, 2.35, -5.87]} variant={variant} />
      <Bookshelf position={[-6.35, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} />
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
  const wall = night ? '#1b2a38' : '#cbb89c';
  const wallDark = night ? '#15222e' : '#b6a184';
  const floorColor = night ? '#3a2e24' : '#8a6a4a';
  return (
    <group>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[14, 0.12, 12]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} position={[-6.5 + i * 1.3, 0.005, 0]}>
          <boxGeometry args={[0.02, 0.005, 12]} />
          <meshStandardMaterial color={night ? '#241c15' : '#6b5138'} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.012, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 3.2]} />
        <meshStandardMaterial color={night ? '#263b4a' : '#9d3b3a'} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.015, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.25, 4, 1]} />
        <meshBasicMaterial color={night ? '#5d7f93' : '#d7b28a'} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-4.8, 2.5, -6.04]}>
        <boxGeometry args={[4.4, 5, 0.18]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[4.8, 2.5, -6.04]}>
        <boxGeometry args={[4.4, 5, 0.18]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, -6.04]}>
        <boxGeometry args={[5.2, 1.24, 0.18]} />
        <meshStandardMaterial color={wallDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.32, -6.04]}>
        <boxGeometry args={[5.2, 1.36, 0.18]} />
        <meshStandardMaterial color={wallDark} roughness={0.9} />
      </mesh>
      <mesh position={[-7.04, 2.5, 0]}>
        <boxGeometry args={[0.18, 5, 12]} />
        <meshStandardMaterial color={wallDark} roughness={0.9} />
      </mesh>
      <mesh position={[7.04, 2.5, 0]}>
        <boxGeometry args={[0.18, 5, 12]} />
        <meshStandardMaterial color={wallDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 5.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={night ? '#101c26' : '#d8c6ac'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.4, -5.92]}>
        <planeGeometry args={[5.2, 2.4]} />
        <meshPhysicalMaterial color="#afe6ff" transparent opacity={0.08} roughness={0.05} metalness={0} transmission={0.4} side={THREE.DoubleSide} />
      </mesh>
      <WindowFrame />
    </group>
  );
}

function WindowFrame() {
  return (
    <group position={[0, 2.4, -5.83]}>
      <mesh position={[0, -1.26, 0]}>
        <boxGeometry args={[5.4, 0.12, 0.22]} />
        <meshStandardMaterial color="#3d2f24" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <boxGeometry args={[5.4, 0.12, 0.22]} />
        <meshStandardMaterial color="#3d2f24" roughness={0.7} />
      </mesh>
      <mesh position={[-2.64, 0, 0]}>
        <boxGeometry args={[0.14, 2.52, 0.22]} />
        <meshStandardMaterial color="#3d2f24" roughness={0.7} />
      </mesh>
      <mesh position={[2.64, 0, 0]}>
        <boxGeometry args={[0.14, 2.52, 0.22]} />
        <meshStandardMaterial color="#3d2f24" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.09, 2.52, 0.16]} />
        <meshStandardMaterial color="#3d2f24" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <boxGeometry args={[5.0, 0.08, 0.16]} />
        <meshStandardMaterial color="#3d2f24" roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.36, 0.2]}>
        <boxGeometry args={[5.6, 0.14, 0.5]} />
        <meshStandardMaterial color={night6()} roughness={0.6} />
      </mesh>
      {/* curtains */}
      <Curtain position={[-2.4, 0, 0.28]} scale={[1, 1, 1]} />
      <Curtain position={[2.4, 0, 0.28]} scale={[1, 1, 1]} />
    </group>
  );
}

function night6() {
  return '#3a2c22';
}

function Curtain({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[i * 0.09 - 0.18, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.07, 2.3, 6]} />
          <meshStandardMaterial color={i % 2 ? '#6d4a3a' : '#7a5543'} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export function Desk({ variant = 'dusk' }) {
  const night = variant === 'night';
  return (
    <group position={[0, 0, -2.9]}>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[3.4, 0.12, 1.5]} />
        <meshStandardMaterial color={night ? '#4a3a2c' : '#8a6544'} roughness={0.6} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x * 1.55, 0.38, z * 0.63]}>
            <boxGeometry args={[0.1, 0.76, 0.1]} />
            <meshStandardMaterial color={night ? '#2a211a' : '#5e4430'} roughness={0.8} />
          </mesh>
        ))
      )}
      <FakeShadow position={[0, -0.66, 0]} scale={4.6} opacity={0.4} />
      <mesh position={[0.25, 0.85, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, 1.2]} />
        <meshStandardMaterial map={mapTexture()} roughness={0.8} />
      </mesh>
      <Laptop position={[-0.75, 0.85, -0.3]} rotation={[0, 0.5, 0]} />
      <mesh position={[0.75, 0.85, 0.42]}>
        <cylinderGeometry args={[0.22, 0.25, 0.04, 16]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.5} />
      </mesh>
      <mesh position={[0.75, 0.9, 0.42]}>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#b14032" roughness={0.6} />
      </mesh>
      <mesh position={[0.75, 0.96, 0.42]}>
        <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#ebe4d6" />
      </mesh>
      <DeskLamp position={[1.35, 0.85, -0.4]} night={night} />
      <mesh position={[-1.3, 0.87, 0.35]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.32, 0.08, 0.24]} />
        <meshStandardMaterial color="#2f4763" roughness={0.7} />
      </mesh>
      <mesh position={[-1.3, 0.93, 0.35]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.22]} />
        <meshStandardMaterial color="#e7ddc9" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Laptop({ position, rotation }) {
  const tex = useMemo(() => screenTexture({ title: 'QUẢNG NINH 2076', subtitle: 'Dự án tương lai', rows: ['Năng lượng xanh', 'Giao thông thông minh', 'Bảo tồn di sản'], accent: '#6ff0ff', theme: 'tech' }), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.8, 0.03, 0.55]} />
        <meshStandardMaterial color="#2b333d" metalness={0.6} roughness={0.35} />
      </mesh>
      <group position={[0, 0.02, -0.27]} rotation={[-1.85, 0, 0]}>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.8, 0.52, 0.02]} />
          <meshStandardMaterial color="#222a33" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.26, 0.012]}>
          <planeGeometry args={[0.74, 0.46]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
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
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.47, 0]}>
        <boxGeometry args={[0.62, 0.1, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.78, -0.26]}>
        <boxGeometry args={[0.62, 0.62, 0.09]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x * 0.26, 0.23, z * 0.24]}>
            <cylinderGeometry args={[0.025, 0.03, 0.46, 5]} />
            <meshStandardMaterial color="#454b50" metalness={0.5} roughness={0.4} />
          </mesh>
        ))
      )}
      <FakeShadow position={[0, 0.005, 0]} scale={1.6} opacity={0.35} />
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
  const books = useMemo(() => {
    const colors = ['#8a4a3a', '#3f5d68', '#a3813f', '#4f5d43', '#6d4a6c', '#8a6b45'];
    return Array.from({ length: 22 }, (_, i) => ({
      x: (i % 6) * 0.19 - 0.48,
      y: 0.42 + Math.floor(i / 6) * 0.62,
      z: 0.1,
      h: 0.34 + (i % 3) * 0.05,
      w: 0.13 + (i % 2) * 0.03,
      color: colors[i % colors.length],
    }));
  }, []);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.4, 2.4, 0.4]} />
        <meshStandardMaterial color="#4a3828" roughness={0.85} />
      </mesh>
      {[0.06, 0.5, 0.94, 1.38, 1.82, 2.36].map((y, i) => (
        <mesh key={i} position={[0, y, 0.02]}>
          <boxGeometry args={[1.44, 0.05, 0.46]} />
          <meshStandardMaterial color="#6b5238" roughness={0.8} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <boxGeometry args={[b.w, b.h, 0.24]} />
          <meshStandardMaterial color={b.color} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 2.28, 0.06]}>
        <cylinderGeometry args={[0.12, 0.16, 0.24, 10]} />
        <meshStandardMaterial color="#7b8a6a" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function RoomPlant({ position = [0, 0, 0], scale = 1 }) {
  const leaves = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      a: (i / 10) * Math.PI * 2,
      r: 0.18 + (i % 3) * 0.08,
      y: 0.6 + (i % 4) * 0.16,
      tilt: 0.5 + (i % 3) * 0.2,
      s: 0.7 + (i % 2) * 0.3,
    }));
  }, []);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.5, 12]} />
        <meshStandardMaterial color="#a56b4b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 12]} />
        <meshStandardMaterial color="#4a3324" roughness={0.95} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={[Math.cos(l.a) * l.r, l.y, Math.sin(l.a) * l.r]} rotation={[l.tilt, l.a, 0]} scale={l.s}>
          <sphereGeometry args={[0.16, 6, 5]} />
          <meshStandardMaterial color={i % 2 ? '#3f6b45' : '#4f7d4e'} roughness={0.9} flatShading />
        </mesh>
      ))}
      <FakeShadow position={[0, 0.02, 0]} scale={1.1} opacity={0.35} />
    </group>
  );
}

export function CeilingLamp({ position, variant }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.36, 0.46, 0.18, 16]} />
        <meshStandardMaterial color={variant === 'night' ? '#2a3a46' : '#e6d9bf'} roughness={0.6} emissive="#ffd9a3" emissiveIntensity={variant === 'night' ? 1.8 : 0.6} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color="#fff0cf" emissive="#ffe3ad" emissiveIntensity={2.4} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 5]} />
        <meshStandardMaterial color="#5a5045" />
      </mesh>
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
