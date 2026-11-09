import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FakeShadow } from './atmosphere';
import { glowTexture } from '../../utils/textures';

const geoCache = new Map();
function geo(key, build) {
  if (!geoCache.has(key)) geoCache.set(key, build());
  return geoCache.get(key);
}
const capsuleGeo = (r, l) => geo(`cap-${r}-${l}`, () => new THREE.CapsuleGeometry(r, l, 4, 8));
const sphereGeo = (r, w = 16, h = 12, ps = 0, pl = Math.PI * 2, ts = 0, tl = Math.PI) =>
  geo(`sph-${r}-${w}-${h}-${ps}-${pl}-${ts}-${tl}`, () => new THREE.SphereGeometry(r, w, h, ps, pl, ts, tl));
const boxGeo = (w, h, d) => geo(`box-${w}-${h}-${d}`, () => new THREE.BoxGeometry(w, h, d));
const cylGeo = (rt, rb, h, s = 10) => geo(`cyl-${rt}-${rb}-${h}-${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
const coneGeo = (r, h, s = 10) => geo(`cone-${r}-${h}-${s}`, () => new THREE.ConeGeometry(r, h, s));
const torusGeo = (r, t, rs = 8, ts = 24) => geo(`tor-${r}-${t}-${rs}-${ts}`, () => new THREE.TorusGeometry(r, t, rs, ts));

const PRESETS = {
  minh: {
    skin: '#e8b98d',
    hair: '#201812',
    shirt: '#3d7ea6',
    pants: '#26384a',
    shoes: '#1a1f26',
    height: 1,
    hairStyle: 'short',
    backpack: '#2e5a6e',
  },
  lan: {
    skin: '#f0c7a0',
    hair: '#241b17',
    shirt: '#e5d6ae',
    skirt: '#a9504a',
    pants: '#7a4a42',
    shoes: '#4a2f2a',
    height: 0.94,
    hairStyle: 'long',
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
    hairStyle: 'short',
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
  },
  teacher: {
    skin: '#e6bd98',
    hair: '#4a3328',
    shirt: '#7a6fa8',
    pants: '#2f3542',
    shoes: '#242424',
    height: 0.98,
    hairStyle: 'long',
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
  },
};

export function Human({
  preset = 'minh',
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
  const cfg = PRESETS[preset] || PRESETS.minh;
  const s = (cfg.height || 1) * scale;
  const body = useRef();
  const head = useRef();
  const shoulderL = useRef();
  const shoulderR = useRef();
  const elbowL = useRef();
  const elbowR = useRef();
  const mouth = useRef();
  const baseY = pose === 'sit' ? -0.4 : 0;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase + seed * 0.7;
    if (body.current) {
      body.current.position.y = baseY + Math.sin(t * 1.3) * 0.006;
      body.current.rotation.z = Math.sin(t * 0.55) * 0.008;
      if (cfg.hunch) body.current.rotation.x = 0.13;
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.5) * 0.09 + (talking ? Math.sin(t * 1.4) * 0.13 : 0);
      head.current.rotation.x = (talking ? Math.sin(t * 2.2) * 0.045 : Math.sin(t * 0.7) * 0.02) + (cfg.hunch ? 0.12 : 0);
    }
    if (shoulderL.current && shoulderR.current) {
      if (pose === 'sit') {
        shoulderL.current.rotation.x = -1.3 + (talking ? Math.sin(t * 1.8) * 0.14 : Math.sin(t * 0.8) * 0.025);
        shoulderR.current.rotation.x = -1.26 + (talking ? Math.sin(t * 2.2 + 1) * 0.22 : Math.sin(t * 0.9 + 1) * 0.025);
        shoulderL.current.rotation.z = 0.06;
        shoulderR.current.rotation.z = -0.06;
        if (elbowL.current) elbowL.current.rotation.x = -0.08;
        if (elbowR.current) elbowR.current.rotation.x = -0.12 + (talking ? Math.sin(t * 2.4) * 0.18 : 0);
      } else {
        shoulderL.current.rotation.x = 0.03 + (talking ? Math.sin(t * 2.0 + 1) * 0.26 : Math.sin(t * 0.8) * 0.035);
        shoulderR.current.rotation.x = -0.02 + (talking ? Math.sin(t * 1.7) * 0.34 : Math.sin(t * 0.9 + 1) * 0.035);
        shoulderL.current.rotation.z = 0.075;
        shoulderR.current.rotation.z = -0.075;
        if (elbowL.current) elbowL.current.rotation.x = -0.14 + (talking ? Math.sin(t * 2.3 + 1) * 0.22 : 0);
        if (elbowR.current) elbowR.current.rotation.x = -0.2 + (talking ? Math.sin(t * 2.6) * 0.3 : 0);
      }
    }
    if (mouth.current) {
      mouth.current.scale.y = talking ? 0.3 + Math.abs(Math.sin(t * 11)) * 1.2 : 1;
    }
  });

  const hipRot = pose === 'sit' ? -Math.PI / 2 : 0;
  const kneeRot = pose === 'sit' ? Math.PI / 2 : 0;
  const pantsColor = cfg.pants || '#334';

  return (
    <group position={position} rotation={rotation} scale={s} {...rest}>
      {shadow && <FakeShadow position={[0, 0.015, 0]} scale={1.55} opacity={0.35} />}
      <group ref={body} position={[0, baseY, 0]}>
        {/* legs */}
        {[-1, 1].map((side, i) => (
          <group key={`leg${i}`} position={[side * 0.11, 0.88, 0]} rotation={[hipRot, 0, side * 0.02]}>
            <mesh geometry={capsuleGeo(0.08, 0.28)} position={[0, -0.2, 0]} castShadow>
              <meshStandardMaterial color={pantsColor} roughness={0.9} />
            </mesh>
            <group ref={i === 0 ? undefined : undefined} position={[0, -0.44, 0]} rotation={[kneeRot, 0, 0]}>
              <mesh geometry={capsuleGeo(0.062, 0.28)} position={[0, -0.18, 0]}>
                <meshStandardMaterial color={pantsColor} roughness={0.9} />
              </mesh>
              <mesh geometry={boxGeo(0.13, 0.08, 0.25)} position={[0, -0.4, 0.045]}>
                <meshStandardMaterial color={cfg.shoes} roughness={0.7} />
              </mesh>
            </group>
          </group>
        ))}

        {/* skirt for Lan / tourism */}
        {cfg.skirt && (
          <mesh geometry={coneGeo(0.3, 0.5, 14)} position={[0, 0.78, 0]}>
            <meshStandardMaterial color={cfg.skirt} roughness={0.9} />
          </mesh>
        )}

        {/* torso */}
        <mesh geometry={capsuleGeo(0.168, 0.28)} position={[0, 1.12, 0]} scale={[1, 1, 0.86]}>
          <meshStandardMaterial color={cfg.shirt} roughness={0.85} />
        </mesh>

        {cfg.labcoat && (
          <mesh geometry={capsuleGeo(0.178, 0.3)} position={[0, 1.12, -0.012]} scale={[1, 1, 0.9]}>
            <meshStandardMaterial color={cfg.labcoat} roughness={0.85} />
          </mesh>
        )}
        {cfg.coat && (
          <mesh geometry={boxGeo(0.06, 0.62, 0.24)} position={[0.13, 0.98, -0.1]} rotation={[0, 0, 0.06]}>
            <meshStandardMaterial color={cfg.labcoat} roughness={0.85} />
          </mesh>
        )}
        {cfg.coat && (
          <mesh geometry={boxGeo(0.06, 0.62, 0.24)} position={[-0.13, 0.98, -0.1]} rotation={[0, 0, -0.06]}>
            <meshStandardMaterial color={cfg.labcoat} roughness={0.85} />
          </mesh>
        )}
        {cfg.suit && (
          <>
            <mesh geometry={boxGeo(0.1, 0.5, 0.02)} position={[0, 1.16, 0.165]}>
              <meshStandardMaterial color={cfg.shirt} roughness={0.8} />
            </mesh>
            <mesh geometry={boxGeo(0.055, 0.34, 0.02)} position={[0, 1.14, 0.18]}>
              <meshStandardMaterial color={cfg.tie || '#333'} roughness={0.7} />
            </mesh>
            <mesh geometry={boxGeo(0.36, 0.56, 0.34)} position={[0, 1.1, -0.02]}>
              <meshStandardMaterial color={cfg.suit} roughness={0.8} />
            </mesh>
            <mesh geometry={boxGeo(0.37, 0.6, 0.15)} position={[0, 0.92, -0.11]}>
              <meshStandardMaterial color={cfg.suit} roughness={0.8} />
            </mesh>
          </>
        )}
        {cfg.cardigan && (
          <mesh geometry={capsuleGeo(0.185, 0.3)} position={[0, 1.11, -0.01]} scale={[1, 1, 0.9]}>
            <meshStandardMaterial color={cfg.cardigan} roughness={0.95} />
          </mesh>
        )}
        {cfg.vest && (
          <mesh geometry={boxGeo(0.37, 0.42, 0.26)} position={[0, 1.12, 0.01]}>
            <meshStandardMaterial color={cfg.vest} roughness={0.7} emissive={cfg.vest} emissiveIntensity={0.08} />
          </mesh>
        )}
        {cfg.raincoat && (
          <mesh geometry={capsuleGeo(0.19, 0.32)} position={[0, 1.1, 0]} scale={[1, 1, 0.92]}>
            <meshStandardMaterial color={cfg.raincoat} roughness={0.55} />
          </mesh>
        )}
        {cfg.sash && (
          <mesh geometry={boxGeo(0.08, 0.6, 0.02)} position={[0.02, 1.1, 0.19]} rotation={[0, 0, 0.55]}>
            <meshStandardMaterial color={cfg.sash} emissive={cfg.sash} emissiveIntensity={0.15} roughness={0.5} />
          </mesh>
        )}
        {cfg.future && (
          <>
            <mesh geometry={boxGeo(0.05, 0.03, 0.02)} position={[0.05, 1.28, 0.155]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={2} />
            </mesh>
            <mesh geometry={torusGeo(0.09, 0.008)} position={[0, 1.35, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={1.4} />
            </mesh>
            <mesh geometry={boxGeo(0.18, 0.55, 0.03)} position={[0, 0.9, -0.19]} rotation={[0.12, 0, 0]}>
              <meshStandardMaterial color={cfg.coat} roughness={0.7} metalness={0.2} />
            </mesh>
          </>
        )}
        {cfg.stethoscope && (
          <>
            <mesh geometry={torusGeo(0.12, 0.012)} position={[0, 1.33, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={cfg.stethoscope} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh geometry={capsuleGeo(0.012, 0.22)} position={[0.1, 1.18, 0.14]} rotation={[0, 0, -0.25]}>
              <meshStandardMaterial color={cfg.stethoscope} metalness={0.7} roughness={0.3} />
            </mesh>
          </>
        )}

        {/* shoulders + arms */}
        <group ref={shoulderL} position={[0.225, 1.31, 0]}>
          <mesh geometry={capsuleGeo(0.052, 0.23)} position={[0, -0.15, 0]}>
            <meshStandardMaterial color={cfg.labcoat || cfg.suit || cfg.cardigan || cfg.raincoat || cfg.shirt} roughness={0.85} />
          </mesh>
          <group ref={elbowL} position={[0, -0.3, 0]}>
            <mesh geometry={capsuleGeo(0.046, 0.2)} position={[0, -0.13, 0]}>
              <meshStandardMaterial color={cfg.labcoat || cfg.suit || cfg.cardigan || cfg.raincoat || cfg.shirt} roughness={0.85} />
            </mesh>
            <mesh geometry={sphereGeo(0.06, 10, 8)} position={[0, -0.27, 0]}>
              <meshStandardMaterial color={cfg.skin} roughness={0.9} />
            </mesh>
          </group>
        </group>
        <group ref={shoulderR} position={[-0.225, 1.31, 0]}>
          <mesh geometry={capsuleGeo(0.052, 0.23)} position={[0, -0.15, 0]}>
            <meshStandardMaterial color={cfg.labcoat || cfg.suit || cfg.cardigan || cfg.raincoat || cfg.shirt} roughness={0.85} />
          </mesh>
          <group ref={elbowR} position={[0, -0.3, 0]}>
            <mesh geometry={capsuleGeo(0.046, 0.2)} position={[0, -0.13, 0]}>
              <meshStandardMaterial color={cfg.labcoat || cfg.suit || cfg.cardigan || cfg.raincoat || cfg.shirt} roughness={0.85} />
            </mesh>
            <mesh geometry={sphereGeo(0.06, 10, 8)} position={[0, -0.27, 0]}>
              <meshStandardMaterial color={cfg.skin} roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* neck + head */}
        <mesh geometry={cylGeo(0.055, 0.06, 0.1, 8)} position={[0, 1.42, 0]}>
          <meshStandardMaterial color={cfg.skin} roughness={0.9} />
        </mesh>
        <group ref={head} position={[0, 1.56, 0]}>
          <mesh geometry={sphereGeo(0.155, 18, 14)} scale={[0.95, 1.02, 0.98]}>
            <meshStandardMaterial color={cfg.skin} roughness={0.88} />
          </mesh>
          <mesh geometry={sphereGeo(0.162, 16, 12)} position={[0, 0.035, -0.005]} scale={[1, 0.86, 1.02]}>
            <meshStandardMaterial color={cfg.hair} roughness={0.95} />
          </mesh>
          {cfg.hairStyle === 'long' && (
            <>
              <mesh geometry={capsuleGeo(0.075, 0.24)} position={[0, -0.09, -0.1]} scale={[1.2, 1, 0.7]}>
                <meshStandardMaterial color={cfg.hair} roughness={0.95} />
              </mesh>
              <mesh geometry={capsuleGeo(0.035, 0.2)} position={[-0.13, -0.14, 0.02]} rotation={[0, 0, 0.08]}>
                <meshStandardMaterial color={cfg.hair} roughness={0.95} />
              </mesh>
              <mesh geometry={capsuleGeo(0.035, 0.2)} position={[0.13, -0.14, 0.02]} rotation={[0, 0, -0.08]}>
                <meshStandardMaterial color={cfg.hair} roughness={0.95} />
              </mesh>
            </>
          )}
          {/* eyes */}
          {[-1, 1].map((side, i) => (
            <mesh key={`eye${i}`} geometry={sphereGeo(0.019, 8, 8)} position={[side * 0.055, 0.015, 0.135]}>
              <meshStandardMaterial color="#1a1512" roughness={0.4} />
            </mesh>
          ))}
          {[-1, 1].map((side, i) => (
            <mesh key={`brow${i}`} geometry={boxGeo(0.045, 0.009, 0.012)} position={[side * 0.055, 0.065, 0.142]} rotation={[0, 0, side * -0.08]}>
              <meshStandardMaterial color={cfg.hair} />
            </mesh>
          ))}
          <mesh ref={mouth} geometry={boxGeo(0.055, 0.012, 0.012)} position={[0, -0.06, 0.15]}>
            <meshStandardMaterial color="#8e4d4d" roughness={0.6} />
          </mesh>
          {cfg.glasses && (
            <>
              {[-1, 1].map((side, i) => (
                <mesh key={`gl${i}`} geometry={torusGeo(0.042, 0.006, 6, 16)} position={[side * 0.055, 0.02, 0.148]}>
                  <meshStandardMaterial color="#2a3138" metalness={0.6} roughness={0.3} />
                </mesh>
              ))}
              <mesh geometry={boxGeo(0.03, 0.008, 0.008)} position={[0, 0.02, 0.15]}>
                <meshStandardMaterial color="#2a3138" metalness={0.6} roughness={0.3} />
              </mesh>
            </>
          )}
          {cfg.future && (
            <mesh geometry={boxGeo(0.2, 0.035, 0.02)} position={[0, 0.02, 0.152]}>
              <meshStandardMaterial color={cfg.accent} emissive={cfg.accent} emissiveIntensity={1.6} transparent opacity={0.55} />
            </mesh>
          )}
          {vrHeadset && (
            <mesh geometry={boxGeo(0.24, 0.09, 0.11)} position={[0, 0.02, 0.08]}>
              <meshStandardMaterial color="#1a2a38" metalness={0.5} roughness={0.35} emissive="#6ff0ff" emissiveIntensity={0.5} />
            </mesh>
          )}
          {cfg.hardhat && (
            <>
              <mesh geometry={sphereGeo(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)} position={[0, 0.03, 0]} scale={[1.08, 0.9, 1.08]}>
                <meshStandardMaterial color={cfg.hardhat} roughness={0.55} />
              </mesh>
              <mesh geometry={torusGeo(0.17, 0.015, 6, 20)} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={cfg.hardhat} roughness={0.55} />
              </mesh>
            </>
          )}
          {cfg.helmet && (
            <>
              <mesh geometry={sphereGeo(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)} position={[0, 0.03, 0]} scale={[1.08, 0.95, 1.08]}>
                <meshStandardMaterial color={cfg.helmet} roughness={0.45} metalness={0.2} />
              </mesh>
              <mesh geometry={torusGeo(0.17, 0.015, 6, 20)} position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={cfg.helmet} roughness={0.45} metalness={0.2} />
              </mesh>
              {cfg.lamp && (
                <>
                  <mesh geometry={cylGeo(0.035, 0.035, 0.06, 10)} position={[0, 0.065, 0.165]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#4a4436" metalness={0.5} roughness={0.4} />
                  </mesh>
                  <mesh geometry={sphereGeo(0.032, 10, 8)} position={[0, 0.065, 0.2]}>
                    <meshStandardMaterial color="#fff0b0" emissive="#ffdf8a" emissiveIntensity={2.4} />
                  </mesh>
                </>
              )}
            </>
          )}
          {cfg.hat === 'conical' && (
            <mesh geometry={coneGeo(0.26, 0.13, 20)} position={[0, 0.16, 0]}>
              <meshStandardMaterial color="#d7b55f" roughness={0.9} />
            </mesh>
          )}
          {cfg.hat === 'sun' && (
            <>
              <mesh geometry={cylGeo(0.23, 0.23, 0.015, 20)} position={[0, 0.13, 0]}>
                <meshStandardMaterial color="#ead9a6" roughness={0.9} />
              </mesh>
              <mesh geometry={cylGeo(0.1, 0.115, 0.08, 16)} position={[0, 0.17, 0]}>
                <meshStandardMaterial color="#ead9a6" roughness={0.9} />
              </mesh>
            </>
          )}
        </group>

        {cfg.backpack && (
          <mesh geometry={boxGeo(0.24, 0.32, 0.12)} position={[0, 1.12, -0.18]}>
            <meshStandardMaterial color={cfg.backpack} roughness={0.8} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function Robo({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  phase = 0,
  talking = false,
  color = '#dce9ec',
  accent = '#6ff0ff',
  shadow = true,
  ...rest
}) {
  const group = useRef();
  const armL = useRef();
  const armR = useRef();
  const ring = useRef();
  const eyeGlow = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (group.current) {
      group.current.position.y = 0.5 + Math.sin(t * 1.5) * 0.06;
      group.current.rotation.z = Math.sin(t * 0.8) * 0.02;
    }
    if (armL.current && armR.current) {
      armL.current.rotation.z = 0.25 + Math.sin(t * (talking ? 3 : 1.2)) * (talking ? 0.35 : 0.06);
      armR.current.rotation.z = -0.25 - Math.sin(t * (talking ? 2.6 : 1)) * (talking ? 0.4 : 0.06);
      armL.current.rotation.x = Math.sin(t * 1.4) * 0.08;
      armR.current.rotation.x = Math.cos(t * 1.2) * 0.08;
    }
    if (ring.current) ring.current.rotation.z = t * 0.9;
    if (eyeGlow.current) eyeGlow.current.material.emissiveIntensity = 2 + Math.sin(t * 6) * (talking ? 1.4 : 0.4);
  });
  return (
    <group position={position} rotation={rotation} scale={scale} {...rest}>
      {shadow && <FakeShadow position={[0, 0.02, 0]} scale={1.2} opacity={0.3} />}
      <group ref={group}>
        <mesh geometry={capsuleGeo(0.2, 0.18)} scale={[1, 1, 0.8]}>
          <meshStandardMaterial color={color} metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh geometry={sphereGeo(0.22, 18, 14)} position={[0, 0.28, 0]} scale={[1, 0.9, 0.85]}>
          <meshStandardMaterial color={color} metalness={0.55} roughness={0.28} />
        </mesh>
        <mesh geometry={boxGeo(0.28, 0.11, 0.08)} position={[0, 0.29, 0.16]}>
          <meshStandardMaterial color="#0a1620" metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh ref={eyeGlow} geometry={boxGeo(0.21, 0.035, 0.02)} position={[0, 0.3, 0.215]}>
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.4} />
        </mesh>
        <mesh geometry={torusGeo(0.15, 0.018, 8, 24)} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} />
        </mesh>
        <mesh geometry={sphereGeo(0.045, 10, 8)} position={[0, 0.5, 0]}>
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.6} />
        </mesh>
        <mesh geometry={cylGeo(0.006, 0.006, 0.14, 6)} position={[0, 0.44, 0]}>
          <meshStandardMaterial color="#8aa0aa" metalness={0.8} roughness={0.2} />
        </mesh>
        <group ref={armL} position={[0.25, 0.1, 0]}>
          <mesh geometry={capsuleGeo(0.035, 0.18)} position={[0, -0.11, 0]}>
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh geometry={sphereGeo(0.055, 10, 8)} position={[0, -0.24, 0]}>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
          </mesh>
        </group>
        <group ref={armR} position={[-0.25, 0.1, 0]}>
          <mesh geometry={capsuleGeo(0.035, 0.18)} position={[0, -0.11, 0]}>
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh geometry={sphereGeo(0.055, 10, 8)} position={[0, -0.24, 0]}>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
          </mesh>
        </group>
        <group ref={ring} position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={torusGeo(0.22, 0.02, 6, 28)}>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} transparent opacity={0.8} />
          </mesh>
        </group>
        <sprite position={[0, -0.36, 0]} scale={[0.5, 0.5, 1]}>
          <spriteMaterial map={glowTexture('#ffffff')} color={accent} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>
    </group>
  );
}

export function CrowdFigure({ position = [0, 0, 0], color = '#3a4a5a', skin = '#c99b72', height = 1.65, phase = 0, rotation = [0, 0, 0], scale = 1 }) {
  const group = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.2) * 0.01;
      group.current.rotation.y = rotation[1] + Math.sin(t * 0.4) * 0.06;
    }
  });
  return (
    <group ref={group} position={position} rotation={rotation} scale={(height / 1.65) * scale}>
      <mesh geometry={capsuleGeo(0.17, 0.5)} position={[0, 0.95, 0]}>
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh geometry={sphereGeo(0.14, 12, 10)} position={[0, 1.42, 0]}>
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      <mesh geometry={sphereGeo(0.145, 12, 10)} position={[0, 1.46, -0.01]} scale={[1, 0.7, 1]}>
        <meshStandardMaterial color="#1d1713" roughness={0.95} />
      </mesh>
    </group>
  );
}

export { PRESETS as CHARACTER_PRESETS };
