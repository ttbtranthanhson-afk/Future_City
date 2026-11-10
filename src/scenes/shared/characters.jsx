import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FakeShadow } from './atmosphere';

const geoCache = new Map();
function geo(key, build) {
  if (!geoCache.has(key)) geoCache.set(key, build());
  return geoCache.get(key);
}
const capsuleGeo = (r, l, cs = 4, rs = 10) => geo(`cap-${r}-${l}-${cs}-${rs}`, () => new THREE.CapsuleGeometry(r, l, cs, rs));
const sphereGeo = (r, w = 16, h = 12, ps = 0, pl = Math.PI * 2, ts = 0, tl = Math.PI) =>
  geo(`sph-${r}-${w}-${h}-${ps}-${pl}-${ts}-${tl}`, () => new THREE.SphereGeometry(r, w, h, ps, pl, ts, tl));
const boxGeo = (w, h, d) => geo(`box-${w}-${h}-${d}`, () => new THREE.BoxGeometry(w, h, d));
const cylGeo = (rt, rb, h, s = 10) => geo(`cyl-${rt}-${rb}-${h}-${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
const coneGeo = (r, h, s = 10) => geo(`cone-${r}-${h}-${s}`, () => new THREE.ConeGeometry(r, h, s));
const torusGeo = (r, t, rs = 8, ts = 24) => geo(`tor-${r}-${t}-${rs}-${ts}`, () => new THREE.TorusGeometry(r, t, rs, ts));

const PRESETS = {
  patient: {
    skin: '#e0b48f',
    hair: '#2a211b',
    shirt: '#dbeef2',
    pants: '#55707a',
    shoes: '#2a2f33',
    height: 0.96,
    hairStyle: 'short',
  },
  alex: {
    skin: '#e0b48f',
    hair: '#cfdbe4',
    shirt: '#1b3d63',
    coat: '#132c49',
    pants: '#1b2a3c',
    shoes: '#0d1620',
    height: 1.06,
    hairStyle: 'short',
    accent: '#6ff0ff',
    future: true,
  },
  mayor: {
    skin: '#d9a97e',
    hair: '#3a2c22',
    shirt: '#f1efe8',
    suit: '#1b2230',
    pants: '#1b2230',
    shoes: '#10141a',
    height: 1.02,
    hairStyle: 'short',
    tie: '#a67c2e',
    accent: '#ffd77a',
  },
  engineer: {
    skin: '#d9a97e',
    hair: '#2a2018',
    shirt: '#2e7fa6',
    pants: '#22303c',
    shoes: '#241f1c',
    height: 1,
    hairStyle: 'short',
    hardhat: '#ffb347',
    accent: '#7cf0d0',
  },
  scientist: {
    skin: '#e6bd98',
    hair: '#6b4c36',
    shirt: '#e9f2f4',
    pants: '#3a4a5a',
    shoes: '#2a2a2a',
    height: 0.98,
    hairStyle: 'bun',
    labcoat: '#f4fbfd',
    glasses: true,
  },
  doctor: {
    skin: '#e3b58b',
    hair: '#2a2a2a',
    shirt: '#eef7f8',
    pants: '#3a4a5a',
    shoes: '#2a2a2a',
    height: 1,
    hairStyle: 'short',
    labcoat: '#f8fcfd',
    coat: true,
    stethoscope: '#4c6670',
    accent: '#9fe8ff',
  },
  tourism: {
    skin: '#e0b184',
    hair: '#3b2a22',
    shirt: '#1f8f8a',
    pants: '#1c3a44',
    shoes: '#22282c',
    height: 0.97,
    hairStyle: 'long',
    sash: '#ffd77a',
    accent: '#ffd77a',
    skirt: '#1c3a44',
  },
  fisherman: {
    skin: '#c98e5f',
    hair: '#2c241e',
    shirt: '#e3a63c',
    raincoat: '#e8a92f',
    pants: '#2d4a56',
    shoes: '#24343a',
    height: 0.95,
    hairStyle: 'short',
    hat: 'conical',
    scarf: '#c84d3a',
  },
  miner: {
    skin: '#d6a377',
    hair: '#282018',
    shirt: '#5b4636',
    vest: '#f08a24',
    pants: '#3a3a3a',
    shoes: '#231f1c',
    height: 1,
    hairStyle: 'short',
    helmet: '#e8c25a',
    lamp: true,
  },
  oldminer: {
    skin: '#c99b72',
    hair: '#cfcfcf',
    shirt: '#6b5a49',
    vest: '#c97a2a',
    pants: '#3a3a3a',
    shoes: '#231f1c',
    height: 0.95,
    hairStyle: 'short',
    helmet: '#d8b45a',
    lamp: true,
    hunch: true,
    beard: '#d7d7d7',
  },
  teacher: {
    skin: '#e6bd98',
    hair: '#4a3328',
    shirt: '#7a6fa8',
    pants: '#2f3542',
    shoes: '#242424',
    height: 0.98,
    hairStyle: 'bun',
    cardigan: '#5c547f',
    glasses: true,
  },
  student: {
    skin: '#eec299',
    hair: '#1d1713',
    shirt: '#5ea8c9',
    pants: '#2b3a4a',
    shoes: '#1d2228',
    height: 0.9,
    hairStyle: 'short',
    backpack: '#d98a4a',
  },
  tourist: {
    skin: '#e9b98f',
    hair: '#4a3328',
    shirt: '#f0d26a',
    pants: '#4a6b7a',
    shoes: '#2f2a26',
    height: 0.97,
    hairStyle: 'short',
    hat: 'sun',
    backpack: '#3f7f9a',
  },
};

function Hand({ color, skin, side = 1 }) {
  return (
    <group position={[0, -0.28, 0]} scale={[1, 1, 0.72]}>
      <mesh geometry={sphereGeo(0.052, 10, 8)} scale={[0.9, 1.15, 0.7]} castShadow>
        <meshStandardMaterial color={skin} roughness={0.78} />
      </mesh>
      {[-0.022, 0, 0.022].map((x, i) => (
        <mesh key={i} geometry={capsuleGeo(0.012, 0.055, 3, 6)} position={[x, -0.055 - (i === 1 ? 0.008 : 0), 0.005]} rotation={[0.15, 0, 0]}>
          <meshStandardMaterial color={skin} roughness={0.8} />
        </mesh>
      ))}
      <mesh geometry={capsuleGeo(0.014, 0.04, 3, 6)} position={[side * 0.045, -0.03, 0.012]} rotation={[0, 0, side * 0.85]}>
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>
      <mesh geometry={cylGeo(0.045, 0.05, 0.04, 8)} position={[0, 0.045, 0]}>
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
    </group>
  );
}

export function Human({
  preset = 'patient',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  pose = 'stand',
  talking = false,
  phase = 0,
  seed = 0,
  shadow = true,
  vrHeadset = false,
  ...rest
}) {
  const cfg = PRESETS[preset] || PRESETS.patient;
  const s = (cfg.height || 1) * scale;
  const body = useRef();
  const chest = useRef();
  const head = useRef();
  const eyes = useRef();
  const jaw = useRef();
  const mouth = useRef();
  const shoulderL = useRef();
  const shoulderR = useRef();
  const elbowL = useRef();
  const elbowR = useRef();
  const baseY = pose === 'sit' ? -0.4 : 0;

  const sleeveColor = cfg.labcoat || cfg.suit || cfg.cardigan || cfg.raincoat || cfg.shirt;
  const pantsColor = cfg.pants || '#334';

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase + seed * 0.7;
    const breathe = Math.sin(t * 1.25) * 0.012;
    if (body.current) {
      body.current.position.y = baseY + Math.sin(t * 1.3) * 0.006;
      body.current.rotation.z = Math.sin(t * 0.55) * 0.008;
      body.current.rotation.y = Math.sin(t * 0.27 + seed) * 0.018;
      if (cfg.hunch) body.current.rotation.x = 0.13;
    }
    if (chest.current) chest.current.scale.set(1, 1 + breathe, 1 + breathe * 0.6);
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.5) * 0.11 + (talking ? Math.sin(t * 1.4) * 0.15 : 0);
      head.current.rotation.x = (talking ? Math.sin(t * 2.2) * 0.05 : Math.sin(t * 0.7) * 0.022) + (cfg.hunch ? 0.12 : 0);
      head.current.rotation.z = Math.sin(t * 0.42) * 0.02;
    }
    if (eyes.current) {
      const bp = (t * 0.42 + seed * 0.37) % 1;
      const blink = bp < 0.05 ? Math.sin((bp / 0.05) * Math.PI) : 0;
      eyes.current.scale.y = 1 - blink * 0.92;
    }
    if (jaw.current) jaw.current.scale.y = talking ? 0.86 + Math.abs(Math.sin(t * 10.5)) * 0.24 : 1;
    if (mouth.current) mouth.current.scale.set(1, talking ? 0.35 + Math.abs(Math.sin(t * 11)) * 1.5 : 1, 1);
    if (shoulderL.current && shoulderR.current) {
      if (pose === 'sit') {
        shoulderL.current.rotation.x = -1.28 + (talking ? Math.sin(t * 1.8) * 0.13 : Math.sin(t * 0.8) * 0.02);
        shoulderR.current.rotation.x = -1.22 + (talking ? Math.sin(t * 2.2 + 1) * 0.19 : Math.sin(t * 0.9 + 1) * 0.02);
        shoulderL.current.rotation.z = 0.08;
        shoulderR.current.rotation.z = -0.08;
        if (elbowL.current) elbowL.current.rotation.x = -0.12;
        if (elbowR.current) elbowR.current.rotation.x = -0.16 + (talking ? Math.sin(t * 2.4) * 0.16 : 0);
      } else {
        shoulderL.current.rotation.x = 0.04 + (talking ? Math.sin(t * 2.0 + 1) * 0.24 : Math.sin(t * 0.8) * 0.035);
        shoulderR.current.rotation.x = -0.02 + (talking ? Math.sin(t * 1.7) * 0.3 : Math.sin(t * 0.9 + 1) * 0.035);
        shoulderL.current.rotation.z = 0.085 + Math.sin(t * 0.6) * 0.01;
        shoulderR.current.rotation.z = -0.085 - Math.sin(t * 0.6 + 1) * 0.01;
        if (elbowL.current) elbowL.current.rotation.x = -0.14 + (talking ? Math.sin(t * 2.3 + 1) * 0.2 : 0);
        if (elbowR.current) elbowR.current.rotation.x = -0.2 + (talking ? Math.sin(t * 2.6) * 0.26 : 0);
      }
    }
  });

  const hipRot = pose === 'sit' ? -Math.PI / 2 : 0;
  const kneeRot = pose === 'sit' ? Math.PI / 2 : 0;
  const legColor = cfg.skirt ? cfg.skin : pantsColor;

  return (
    <group position={position} rotation={rotation} scale={s} {...rest}>
      {shadow && <FakeShadow position={[0, 0.015, 0]} scale={1.6} opacity={0.32} />}
      <group ref={body} position={[0, baseY, 0]}>
        {/* legs */}
        {[-1, 1].map((side, i) => (
          <group key={`leg${i}`} position={[side * 0.105, 0.88, 0]} rotation={[hipRot, 0, side * 0.025]}>
            <mesh geometry={capsuleGeo(0.083, 0.26, 4, 10)} position={[0, -0.2, 0]} castShadow>
              <meshStandardMaterial color={legColor} roughness={0.88} />
            </mesh>
            <mesh geometry={capsuleGeo(0.088, 0.12, 3, 8)} position={[0, -0.33, 0]}>
              <meshStandardMaterial color={legColor} roughness={0.9} />
            </mesh>
            <group position={[0, -0.44, 0]} rotation={[kneeRot, 0, 0]}>
              <mesh geometry={capsuleGeo(0.062, 0.26, 4, 10)} position={[0, -0.17, 0]} castShadow>
                <meshStandardMaterial color={legColor} roughness={0.9} />
              </mesh>
              <mesh geometry={cylGeo(0.064, 0.072, 0.05, 8)} position={[0, -0.3, 0]}>
                <meshStandardMaterial color={cfg.shoes} roughness={0.75} />
              </mesh>
              <mesh geometry={boxGeo(0.13, 0.075, 0.235)} position={[0, -0.405, 0.05]} castShadow>
                <meshStandardMaterial color={cfg.shoes} roughness={0.62} />
              </mesh>
              <mesh geometry={boxGeo(0.14, 0.025, 0.26)} position={[0, -0.44, 0.052]}>
                <meshStandardMaterial color="#14181b" roughness={0.85} />
              </mesh>
              <mesh geometry={sphereGeo(0.062, 10, 8)} position={[0, -0.41, 0.145]} scale={[0.9, 0.55, 1]}>
                <meshStandardMaterial color={cfg.shoes} roughness={0.5} />
              </mesh>
            </group>
          </group>
        ))}

        {/* hips + belt */}
        <mesh geometry={sphereGeo(0.19, 14, 10)} position={[0, 0.9, 0]} scale={[1.06, 0.72, 0.82]} castShadow>
          <meshStandardMaterial color={pantsColor} roughness={0.9} />
        </mesh>
        <mesh geometry={cylGeo(0.185, 0.19, 0.055, 14)} position={[0, 1.01, 0]}>
          <meshStandardMaterial color={cfg.belt || '#2b2520'} roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh geometry={boxGeo(0.055, 0.045, 0.02)} position={[0, 1.01, 0.16]}>
          <meshStandardMaterial color={cfg.accent || '#c9a55c'} metalness={0.7} roughness={0.3} />
        </mesh>

        {cfg.skirt && (
          <mesh geometry={coneGeo(0.3, 0.56, 16)} position={[0, 0.78, 0]} scale={[1, 1, 0.84]} castShadow>
            <meshStandardMaterial color={cfg.skirt} roughness={0.92} />
          </mesh>
        )}

        {/* torso */}
        <group ref={chest} position={[0, 1.12, 0]}>
          <mesh geometry={capsuleGeo(0.168, 0.27, 4, 12)} scale={[1, 1, 0.82]} castShadow>
            <meshStandardMaterial color={cfg.shirt} roughness={0.82} />
          </mesh>
          <mesh geometry={sphereGeo(0.19, 14, 10)} position={[0, 0.08, 0]} scale={[1, 0.9, 0.78]} castShadow>
            <meshStandardMaterial color={cfg.shirt} roughness={0.82} />
          </mesh>
          <mesh geometry={capsuleGeo(0.155, 0.1, 3, 10)} position={[0, 0.31, -0.01]} scale={[1, 1, 0.8]}>
            <meshStandardMaterial color={cfg.shirt} roughness={0.82} />
          </mesh>
          {/* shirt collar */}
          {[-1, 1].map((side) => (
            <mesh key={side} geometry={boxGeo(0.055, 0.13, 0.025)} position={[side * 0.052, 0.225, 0.132]} rotation={[0.12, 0, side * 0.46]}>
              <meshStandardMaterial color={cfg.collar || cfg.shirt} roughness={0.8} />
            </mesh>
          ))}
          <mesh geometry={boxGeo(0.028, 0.28, 0.02)} position={[0, 0.1, 0.158]}>
            <meshStandardMaterial color={cfg.placket || cfg.shirt} roughness={0.75} />
          </mesh>
          {[0.2, 0.1, 0, -0.1].map((y, i) => (
            <mesh key={i} geometry={sphereGeo(0.008, 6, 5)} position={[0, y, 0.17]}>
              <meshStandardMaterial color={cfg.button || '#e9e1cf'} metalness={0.3} roughness={0.4} />
            </mesh>
          ))}
        </group>

        {cfg.labcoat && (
          <>
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={boxGeo(0.12, 0.62, 0.24)} position={[side * 0.145, 1.06, -0.03]} rotation={[0, 0, side * 0.03]} castShadow>
                <meshStandardMaterial color={cfg.labcoat} roughness={0.86} />
              </mesh>
            ))}
            <mesh geometry={boxGeo(0.32, 0.16, 0.24)} position={[0, 1.33, -0.02]}>
              <meshStandardMaterial color={cfg.labcoat} roughness={0.86} />
            </mesh>
            <mesh geometry={boxGeo(0.13, 0.2, 0.01)} position={[0.19, 0.95, 0.13]}>
              <meshStandardMaterial color={cfg.accent || '#8fd7e8'} roughness={0.7} />
            </mesh>
          </>
        )}

        {cfg.coat && (
          <>
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={boxGeo(0.065, 0.62, 0.24)} position={[side * 0.13, 1.0, -0.1]} rotation={[0, 0, side * 0.06]} castShadow>
                <meshStandardMaterial color={cfg.labcoat} roughness={0.85} />
              </mesh>
            ))}
            <mesh geometry={boxGeo(0.28, 0.16, 0.26)} position={[0, 1.3, -0.02]}>
              <meshStandardMaterial color={cfg.labcoat} roughness={0.85} />
            </mesh>
          </>
        )}

        {cfg.suit && (
          <>
            <mesh geometry={boxGeo(0.3, 0.58, 0.36)} position={[0, 1.06, -0.02]} castShadow>
              <meshStandardMaterial color={cfg.suit} roughness={0.78} />
            </mesh>
            <mesh geometry={boxGeo(0.34, 0.3, 0.16)} position={[0, 0.9, -0.1]}>
              <meshStandardMaterial color={cfg.suit} roughness={0.78} />
            </mesh>
            <mesh geometry={boxGeo(0.1, 0.48, 0.02)} position={[0, 1.13, 0.172]}>
              <meshStandardMaterial color={cfg.shirt} roughness={0.8} />
            </mesh>
            <mesh geometry={boxGeo(0.052, 0.33, 0.022)} position={[0, 1.11, 0.184]}>
              <meshStandardMaterial color={cfg.tie || '#333'} roughness={0.68} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={boxGeo(0.095, 0.26, 0.025)} position={[side * 0.09, 1.24, 0.168]} rotation={[0, 0, side * 0.34]}>
                <meshStandardMaterial color={cfg.suit} roughness={0.7} />
              </mesh>
            ))}
            {[1.08, 0.98, 0.88].map((y, i) => (
              <mesh key={i} geometry={sphereGeo(0.009, 6, 5)} position={[0, y, 0.19]}>
                <meshStandardMaterial color="#d8b45c" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
            <mesh geometry={boxGeo(0.2, 0.15, 0.012)} position={[0.18, 1.12, 0.17]}>
              <meshStandardMaterial color={cfg.accent || '#e9ddc0'} roughness={0.6} metalness={0.2} />
            </mesh>
          </>
        )}

        {cfg.cardigan && (
          <>
            <mesh geometry={capsuleGeo(0.186, 0.29, 3, 12)} position={[0, 1.11, -0.008]} scale={[1, 1, 0.88]} castShadow>
              <meshStandardMaterial color={cfg.cardigan} roughness={0.96} />
            </mesh>
            {[1.2, 1.1, 1.0, 0.9].map((y, i) => (
              <mesh key={i} geometry={sphereGeo(0.009, 6, 5)} position={[0, y, 0.162]}>
                <meshStandardMaterial color="#d7cdb8" roughness={0.6} />
              </mesh>
            ))}
          </>
        )}

        {cfg.vest && (
          <>
            <mesh geometry={boxGeo(0.35, 0.44, 0.28)} position={[0, 1.1, 0.015]} castShadow>
              <meshStandardMaterial color={cfg.vest} roughness={0.68} emissive={cfg.vest} emissiveIntensity={0.16} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={boxGeo(0.055, 0.4, 0.285)} position={[side * 0.1, 1.1, 0.02]}>
                <meshStandardMaterial color="#e9eef0" emissive="#bff6ff" emissiveIntensity={0.45} roughness={0.5} />
              </mesh>
            ))}
            <mesh geometry={boxGeo(0.2, 0.05, 0.29)} position={[0, 1.26, 0.02]}>
              <meshStandardMaterial color={cfg.accent || '#ffd77a'} emissive={cfg.accent || '#ffd77a'} emissiveIntensity={1} />
            </mesh>
          </>
        )}

        {cfg.raincoat && (
          <>
            <mesh geometry={capsuleGeo(0.192, 0.33, 3, 12)} position={[0, 1.08, 0]} scale={[1, 1, 0.92]} castShadow>
              <meshStandardMaterial color={cfg.raincoat} roughness={0.52} metalness={0.05} />
            </mesh>
            <mesh geometry={boxGeo(0.34, 0.1, 0.3)} position={[0, 1.33, -0.01]}>
              <meshStandardMaterial color={cfg.raincoat} roughness={0.52} />
            </mesh>
            <mesh geometry={boxGeo(0.02, 0.5, 0.02)} position={[0, 1.08, 0.176]}>
              <meshStandardMaterial color="#8a6a2a" roughness={0.7} />
            </mesh>
          </>
        )}

        {cfg.scarf && (
          <mesh geometry={torusGeo(0.13, 0.038, 8, 20)} position={[0, 1.36, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.1]}>
            <meshStandardMaterial color={cfg.scarf} roughness={0.85} />
          </mesh>
        )}

        {cfg.sash && (
          <>
            <mesh geometry={boxGeo(0.09, 0.66, 0.025)} position={[0.02, 1.1, 0.19]} rotation={[0, 0, 0.6]}>
              <meshStandardMaterial color={cfg.sash} emissive={cfg.sash} emissiveIntensity={0.2} roughness={0.5} />
            </mesh>
            <mesh geometry={sphereGeo(0.05, 8, 6)} position={[-0.17, 0.85, 0.17]}>
              <meshStandardMaterial color={cfg.sash} emissive={cfg.sash} emissiveIntensity={0.35} roughness={0.5} />
            </mesh>
          </>
        )}

        {cfg.future && (
          <>
            <mesh geometry={boxGeo(0.055, 0.028, 0.02)} position={[0.055, 1.26, 0.165]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={2.2} />
            </mesh>
            <mesh geometry={boxGeo(0.03, 0.16, 0.02)} position={[-0.09, 1.08, 0.168]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={1.3} />
            </mesh>
            <mesh geometry={torusGeo(0.11, 0.009, 6, 24)} position={[0, 1.36, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={1.5} />
            </mesh>
            <mesh geometry={boxGeo(0.19, 0.55, 0.04)} position={[0, 0.92, -0.2]} rotation={[0.12, 0, 0]}>
              <meshStandardMaterial color={cfg.coat} roughness={0.6} metalness={0.25} />
            </mesh>
            <mesh geometry={boxGeo(0.06, 0.02, 0.02)} position={[0.07, 1.04, -0.18]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={2} />
            </mesh>
          </>
        )}

        {cfg.stethoscope && (
          <>
            <mesh geometry={torusGeo(0.125, 0.012, 6, 24)} position={[0, 1.32, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={cfg.stethoscope} metalness={0.7} roughness={0.28} />
            </mesh>
            <mesh geometry={capsuleGeo(0.012, 0.24, 3, 6)} position={[0.1, 1.17, 0.14]} rotation={[0, 0, -0.28]}>
              <meshStandardMaterial color={cfg.stethoscope} metalness={0.7} roughness={0.28} />
            </mesh>
            <mesh geometry={cylGeo(0.022, 0.022, 0.05, 8)} position={[0.13, 1.05, 0.15]} rotation={[0, 0, 0.4]}>
              <meshStandardMaterial color="#aebcc2" metalness={0.85} roughness={0.2} />
            </mesh>
          </>
        )}

        {/* shoulders + arms */}
        <group ref={shoulderL} position={[0.225, 1.31, 0]}>
          <mesh geometry={sphereGeo(0.075, 12, 10)} position={[0, 0.015, 0]} scale={[1, 0.9, 0.9]} castShadow>
            <meshStandardMaterial color={sleeveColor} roughness={0.85} />
          </mesh>
          <mesh geometry={capsuleGeo(0.058, 0.22, 4, 10)} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={sleeveColor} roughness={0.85} />
          </mesh>
          <group ref={elbowL} position={[0, -0.3, 0]}>
            <mesh geometry={capsuleGeo(0.05, 0.19, 4, 10)} position={[0, -0.12, 0]} castShadow>
              <meshStandardMaterial color={sleeveColor} roughness={0.85} />
            </mesh>
            <mesh geometry={cylGeo(0.052, 0.055, 0.035, 10)} position={[0, -0.235, 0]}>
              <meshStandardMaterial color={cfg.cuff || cfg.collar || sleeveColor} roughness={0.8} />
            </mesh>
            <Hand color={sleeveColor} skin={cfg.skin} side={1} />
          </group>
        </group>
        <group ref={shoulderR} position={[-0.225, 1.31, 0]}>
          <mesh geometry={sphereGeo(0.075, 12, 10)} position={[0, 0.015, 0]} scale={[1, 0.9, 0.9]} castShadow>
            <meshStandardMaterial color={sleeveColor} roughness={0.85} />
          </mesh>
          <mesh geometry={capsuleGeo(0.058, 0.22, 4, 10)} position={[0, -0.15, 0]} castShadow>
            <meshStandardMaterial color={sleeveColor} roughness={0.85} />
          </mesh>
          <group ref={elbowR} position={[0, -0.3, 0]}>
            <mesh geometry={capsuleGeo(0.05, 0.19, 4, 10)} position={[0, -0.12, 0]} castShadow>
              <meshStandardMaterial color={sleeveColor} roughness={0.85} />
            </mesh>
            <mesh geometry={cylGeo(0.052, 0.055, 0.035, 10)} position={[0, -0.235, 0]}>
              <meshStandardMaterial color={cfg.cuff || cfg.collar || sleeveColor} roughness={0.8} />
            </mesh>
            <Hand color={sleeveColor} skin={cfg.skin} side={-1} />
          </group>
        </group>

        {/* neck + head */}
        <mesh geometry={cylGeo(0.058, 0.064, 0.11, 10)} position={[0, 1.42, 0]} castShadow>
          <meshStandardMaterial color={cfg.skin} roughness={0.86} />
        </mesh>
        <group ref={head} position={[0, 1.56, 0]}>
          <mesh geometry={sphereGeo(0.155, 20, 16)} scale={[0.94, 1.03, 0.97]} castShadow>
            <meshStandardMaterial color={cfg.skin} roughness={0.85} />
          </mesh>
          <group ref={jaw}>
            <mesh geometry={sphereGeo(0.125, 16, 12)} position={[0, -0.06, 0.025]} scale={[0.93, 0.78, 0.92]}>
              <meshStandardMaterial color={cfg.skin} roughness={0.85} />
            </mesh>
            <mesh geometry={sphereGeo(0.034, 10, 8)} position={[0, -0.055, 0.135]} scale={[1, 0.85, 0.7]}>
              <meshStandardMaterial color={cfg.skin} roughness={0.85} />
            </mesh>
          </group>
          <mesh geometry={coneGeo(0.023, 0.055, 8)} position={[0, 0.0, 0.148]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={cfg.skin} roughness={0.82} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} geometry={sphereGeo(0.035, 10, 8)} position={[side * 0.152, -0.005, 0]} scale={[0.42, 1, 0.8]}>
              <meshStandardMaterial color={cfg.skin} roughness={0.85} />
            </mesh>
          ))}
          {/* hair */}
          <mesh geometry={sphereGeo(0.162, 18, 14)} position={[0, 0.038, -0.008]} scale={[1, 0.86, 1.02]}>
            <meshStandardMaterial color={cfg.hair} roughness={0.92} />
          </mesh>
          <mesh geometry={sphereGeo(0.12, 14, 10)} position={[0, 0.13, 0.065]} scale={[1.02, 0.52, 0.72]}>
            <meshStandardMaterial color={cfg.hair} roughness={0.92} />
          </mesh>
          {cfg.hairStyle === 'long' && (
            <>
              <mesh geometry={capsuleGeo(0.08, 0.26, 3, 10)} position={[0, -0.1, -0.1]} scale={[1.25, 1, 0.72]}>
                <meshStandardMaterial color={cfg.hair} roughness={0.92} />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh key={side} geometry={capsuleGeo(0.035, 0.22, 3, 8)} position={[side * 0.135, -0.15, 0.015]} rotation={[0, 0, side * 0.08]}>
                  <meshStandardMaterial color={cfg.hair} roughness={0.92} />
                </mesh>
              ))}
            </>
          )}
          {cfg.hairStyle === 'bun' && (
            <mesh geometry={sphereGeo(0.075, 12, 10)} position={[0, -0.02, -0.145]} scale={[1, 1, 0.9]}>
              <meshStandardMaterial color={cfg.hair} roughness={0.92} />
            </mesh>
          )}
          {/* eyes */}
          <group ref={eyes}>
            {[-1, 1].map((side) => (
              <group key={side} position={[side * 0.056, 0.018, 0.126]}>
                <mesh geometry={sphereGeo(0.029, 12, 10)} scale={[1, 0.9, 0.62]}>
                  <meshStandardMaterial color="#f4ece4" roughness={0.35} />
                </mesh>
                <mesh geometry={sphereGeo(0.016, 10, 8)} position={[0, 0, 0.021]} scale={[1, 1, 0.5]}>
                  <meshStandardMaterial color={cfg.eye || '#3a2a1e'} roughness={0.25} />
                </mesh>
                <mesh geometry={sphereGeo(0.0085, 8, 6)} position={[0, 0, 0.03]}>
                  <meshStandardMaterial color="#0c0a09" roughness={0.2} />
                </mesh>
                <mesh geometry={sphereGeo(0.0035, 6, 5)} position={[0.006, 0.006, 0.035]}>
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.4} />
                </mesh>
              </group>
            ))}
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={boxGeo(0.05, 0.012, 0.014)} position={[side * 0.056, 0.055, 0.14]} rotation={[0, 0, side * -0.09]}>
                <meshStandardMaterial color={cfg.hair} roughness={0.85} />
              </mesh>
            ))}
          </group>
          {/* lips + jaw shadow */}
          <group ref={mouth} position={[0, -0.062, 0.148]}>
            <mesh geometry={boxGeo(0.055, 0.011, 0.012)} position={[0, 0.006, 0]}>
              <meshStandardMaterial color={cfg.lips || '#a55d57'} roughness={0.55} />
            </mesh>
            <mesh geometry={boxGeo(0.047, 0.009, 0.011)} position={[0, -0.008, 0]}>
              <meshStandardMaterial color={cfg.lips || '#8e4d4d'} roughness={0.55} />
            </mesh>
          </group>
          {cfg.beard && (
            <>
              <mesh geometry={sphereGeo(0.115, 14, 10)} position={[0, -0.1, 0.06]} scale={[0.9, 0.72, 0.72]}>
                <meshStandardMaterial color={cfg.beard} roughness={0.95} />
              </mesh>
              <mesh geometry={boxGeo(0.072, 0.016, 0.02)} position={[0, -0.042, 0.152]}>
                <meshStandardMaterial color={cfg.beard} roughness={0.95} />
              </mesh>
            </>
          )}
          {cfg.glasses && (
            <>
              {[-1, 1].map((side) => (
                <group key={side} position={[side * 0.056, 0.018, 0.15]}>
                  <mesh geometry={torusGeo(0.042, 0.006, 6, 18)}>
                    <meshStandardMaterial color="#2a3138" metalness={0.65} roughness={0.28} />
                  </mesh>
                  <mesh geometry={sphereGeo(0.037, 12, 8)} scale={[1, 0.92, 0.18]}>
                    <meshPhysicalMaterial color="#cfefff" transparent opacity={0.22} roughness={0.04} metalness={0.1} transmission={0.55} />
                  </mesh>
                </group>
              ))}
              <mesh geometry={boxGeo(0.035, 0.008, 0.008)} position={[0, 0.02, 0.153]}>
                <meshStandardMaterial color="#2a3138" metalness={0.65} roughness={0.28} />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh key={side} geometry={boxGeo(0.07, 0.006, 0.006)} position={[side * 0.1, 0.024, 0.125]} rotation={[0, side * -0.35, 0]}>
                  <meshStandardMaterial color="#2a3138" metalness={0.65} roughness={0.28} />
                </mesh>
              ))}
            </>
          )}
          {cfg.future && (
            <mesh geometry={boxGeo(0.19, 0.032, 0.02)} position={[0, 0.02, 0.155]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={1.8} transparent opacity={0.62} />
            </mesh>
          )}
          {vrHeadset && (
            <group position={[0, 0.02, 0.07]}>
              <mesh geometry={boxGeo(0.245, 0.095, 0.12)}>
                <meshStandardMaterial color="#182634" metalness={0.55} roughness={0.32} emissive="#6ff0ff" emissiveIntensity={0.45} />
              </mesh>
              <mesh geometry={boxGeo(0.2, 0.062, 0.02)} position={[0, 0, 0.065]}>
                <meshStandardMaterial color="#0b1720" metalness={0.5} roughness={0.2} emissive="#6ff0ff" emissiveIntensity={1.1} />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh key={side} geometry={torusGeo(0.03, 0.006, 5, 16)} position={[side * 0.058, 0, 0.077]}>
                  <meshStandardMaterial color="#9ff7ff" emissive="#9ff7ff" emissiveIntensity={1.6} />
                </mesh>
              ))}
            </group>
          )}
          {cfg.hardhat && (
            <>
              <mesh geometry={sphereGeo(0.172, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2)} position={[0, 0.028, 0]} scale={[1.08, 0.96, 1.08]}>
                <meshStandardMaterial color={cfg.hardhat} roughness={0.48} metalness={0.08} />
              </mesh>
              <mesh geometry={torusGeo(0.17, 0.017, 6, 24)} position={[0, 0.032, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={cfg.hardhat} roughness={0.48} />
              </mesh>
              <mesh geometry={boxGeo(0.16, 0.012, 0.11)} position={[0, 0.11, 0.1]} rotation={[0.18, 0, 0]}>
                <meshStandardMaterial color={cfg.hardhat} roughness={0.48} />
              </mesh>
              {cfg.lamp && (
                <group position={[0, 0.075, 0.17]}>
                  <mesh geometry={cylGeo(0.035, 0.035, 0.06, 10)} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#4a4436" metalness={0.55} roughness={0.38} />
                  </mesh>
                  <mesh geometry={sphereGeo(0.032, 10, 8)} position={[0, 0, 0.038]}>
                    <meshStandardMaterial color="#fff0b0" emissive="#ffdf8a" emissiveIntensity={2.6} />
                  </mesh>
                </group>
              )}
            </>
          )}
          {cfg.helmet && (
            <>
              <mesh geometry={sphereGeo(0.172, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2)} position={[0, 0.028, 0]} scale={[1.08, 0.98, 1.08]}>
                <meshStandardMaterial color={cfg.helmet} roughness={0.42} metalness={0.22} />
              </mesh>
              <mesh geometry={torusGeo(0.17, 0.017, 6, 24)} position={[0, 0.032, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={cfg.helmet} roughness={0.42} metalness={0.22} />
              </mesh>
              <mesh geometry={boxGeo(0.05, 0.06, 0.09)} position={[0, 0.1, 0.12]}>
                <meshStandardMaterial color="#3f4a42" metalness={0.4} roughness={0.5} />
              </mesh>
              {cfg.lamp && (
                <group position={[0, 0.075, 0.175]}>
                  <mesh geometry={cylGeo(0.036, 0.036, 0.065, 10)} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#4a4436" metalness={0.55} roughness={0.38} />
                  </mesh>
                  <mesh geometry={sphereGeo(0.033, 10, 8)} position={[0, 0, 0.04]}>
                    <meshStandardMaterial color="#fff0b0" emissive="#ffdf8a" emissiveIntensity={2.8} />
                  </mesh>
                </group>
              )}
            </>
          )}
          {cfg.hat === 'conical' && (
            <>
              <mesh geometry={coneGeo(0.27, 0.15, 24)} position={[0, 0.17, 0]}>
                <meshStandardMaterial color="#d7b55f" roughness={0.88} side={THREE.DoubleSide} />
              </mesh>
              <mesh geometry={torusGeo(0.21, 0.014, 5, 20)} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#b89a4d" roughness={0.9} />
              </mesh>
            </>
          )}
          {cfg.hat === 'sun' && (
            <>
              <mesh geometry={cylGeo(0.24, 0.24, 0.015, 24)} position={[0, 0.135, 0]}>
                <meshStandardMaterial color="#ead9a6" roughness={0.9} />
              </mesh>
              <mesh geometry={cylGeo(0.1, 0.118, 0.085, 18)} position={[0, 0.175, 0]}>
                <meshStandardMaterial color="#ead9a6" roughness={0.9} />
              </mesh>
              <mesh geometry={torusGeo(0.101, 0.012, 5, 20)} position={[0, 0.138, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#8a7446" roughness={0.85} />
              </mesh>
            </>
          )}
        </group>

        {cfg.backpack && (
          <>
            <mesh geometry={boxGeo(0.26, 0.34, 0.14)} position={[0, 1.1, -0.2]} castShadow>
              <meshStandardMaterial color={cfg.backpack} roughness={0.8} />
            </mesh>
            <mesh geometry={boxGeo(0.18, 0.16, 0.05)} position={[0, 1.04, -0.28]}>
              <meshStandardMaterial color={cfg.backpack} roughness={0.75} />
            </mesh>
            {[-1, 1].map((side) => (
              <mesh key={side} geometry={boxGeo(0.035, 0.4, 0.02)} position={[side * 0.11, 1.14, 0.12]}>
                <meshStandardMaterial color={cfg.backpack} roughness={0.8} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
}

export function CrowdFigure({ position = [0, 0, 0], color = '#3a4a5a', skin = '#c99b72', height = 1.65, phase = 0, rotation = [0, 0, 0], scale = 1 }) {
  const group = useRef();
  const head = useRef();
  const armL = useRef();
  const armR = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.2) * 0.012;
      group.current.rotation.y = rotation[1] + Math.sin(t * 0.4) * 0.07;
    }
    if (head.current) head.current.rotation.y = Math.sin(t * 0.33) * 0.18;
    if (armL.current) armL.current.rotation.x = Math.sin(t * 0.9) * 0.12;
    if (armR.current) armR.current.rotation.x = -Math.sin(t * 0.9 + 1) * 0.12;
  });
  return (
    <group ref={group} position={position} rotation={rotation} scale={(height / 1.65) * scale}>
      <mesh geometry={capsuleGeo(0.17, 0.48, 4, 10)} position={[0, 0.96, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh geometry={sphereGeo(0.185, 12, 10)} position={[0, 0.88, 0]} scale={[1, 0.66, 0.8]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <group ref={head} position={[0, 1.44, 0]}>
        <mesh geometry={sphereGeo(0.15, 14, 12)} castShadow>
          <meshStandardMaterial color={skin} roughness={0.88} />
        </mesh>
        <mesh geometry={sphereGeo(0.156, 12, 10)} position={[0, 0.04, -0.012]} scale={[1, 0.78, 1]}>
          <meshStandardMaterial color="#1d1713" roughness={0.95} />
        </mesh>
        <mesh geometry={coneGeo(0.024, 0.05, 6)} position={[0, 0, 0.138]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={skin} roughness={0.88} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} geometry={sphereGeo(0.012, 6, 5)} position={[side * 0.052, 0.02, 0.13]}>
            <meshStandardMaterial color="#171310" roughness={0.4} />
          </mesh>
        ))}
      </group>
      {[-1, 1].map((side) => (
        <mesh key={`leg${side}`} geometry={capsuleGeo(0.062, 0.4, 3, 8)} position={[side * 0.085, 0.42, 0]}>
          <meshStandardMaterial color="#232a30" roughness={0.9} />
        </mesh>
      ))}
      <group ref={armL} position={[0.21, 1.22, 0]}>
        <mesh geometry={capsuleGeo(0.05, 0.34, 3, 8)} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh geometry={sphereGeo(0.052, 8, 6)} position={[0, -0.37, 0]}>
          <meshStandardMaterial color={skin} roughness={0.88} />
        </mesh>
      </group>
      <group ref={armR} position={[-0.21, 1.22, 0]}>
        <mesh geometry={capsuleGeo(0.05, 0.34, 3, 8)} position={[0, -0.17, 0]}>
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh geometry={sphereGeo(0.052, 8, 6)} position={[0, -0.37, 0]}>
          <meshStandardMaterial color={skin} roughness={0.88} />
        </mesh>
      </group>
      <mesh geometry={cylGeo(0.058, 0.062, 0.09, 8)} position={[0, 1.35, 0]}>
        <meshStandardMaterial color={skin} roughness={0.88} />
      </mesh>
    </group>
  );
}

export { PRESETS as CHARACTER_PRESETS };
