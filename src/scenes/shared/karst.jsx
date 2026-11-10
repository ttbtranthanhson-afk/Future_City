import { useMemo } from 'react';
import * as THREE from 'three';
import { mulberry32, range } from '../../utils/random';
import { Tree } from './nature';

function karstGeometry(seed, form) {
  const rng = mulberry32(seed);
  const geo = new THREE.CylinderGeometry(1, 1, 1, 28, 18, false);
  const position = geo.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const phase = range(rng, 0, Math.PI * 2);
  const cracks = Array.from({ length: 3 }, () => range(rng, 0, Math.PI * 2));
  const shadow = new THREE.Color('#47534f');
  const limestone = new THREE.Color('#81877c');
  const sunlitRock = new THREE.Color('#a09984');
  const strata = new THREE.Color('#6c6557');
  const moss = new THREE.Color('#436a47');
  const green = new THREE.Color('#547d4d');

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const angle = Math.atan2(z, x);
    const t = y + 0.5;
    const broad =
      1 +
      0.13 * Math.sin(angle * 3 + phase) +
      0.075 * Math.sin(angle * 7 - phase * 1.7) +
      0.035 * Math.sin(angle * 13 + seed);
    const profile =
      form === 'needle' ? 1.12 - 0.34 * t :
      form === 'saddle' ? 1.1 - 0.12 * t + 0.08 * Math.cos(angle * 2 + phase) * t * t :
      form === 'wall' ? 1.18 - 0.1 * t + 0.06 * Math.sin(angle * 2 + phase) :
      form === 'crown' ? 1.12 - 0.2 * t + 0.12 * Math.max(0, Math.sin(angle * 3 + phase)) * t :
      1.16 - 0.19 * t + 0.05 * Math.sin(angle * 2 + phase) * t;

    let fissure = 0;
    cracks.forEach((crack, index) => {
      const d = Math.atan2(Math.sin(angle - crack), Math.cos(angle - crack));
      const openAt = index === 0 ? 0.08 : 0.3;
      fissure += Math.exp(-d * d * 95) * THREE.MathUtils.smoothstep(t, openAt, 0.96) * (0.12 + 0.04 * index);
    });
    const waterWear = 0.075 * Math.pow(Math.sin(angle * 3 + phase), 4) * Math.exp(-(((t - 0.48) / 0.09) ** 2));
    const radius = Math.max(0.52, broad * profile - fissure - waterWear);
    const topLift = t > 0.72 ? Math.sin(angle * 3 + phase) * (t - 0.72) * 0.22 : 0;
    const layeredRidge = 0.018 * Math.sin(t * 49 + Math.sin(angle * 2 + phase) * 1.4);
    position.setXYZ(i, x * radius, y + topLift + layeredRidge, z * radius);

    const band = Math.sin(t * 38 + Math.sin(angle * 2 + phase) * 1.8);
    const color = shadow.clone().lerp(limestone, THREE.MathUtils.smoothstep(t, 0.08, 0.65));
    color.lerp(sunlitRock, Math.max(0, band) * 0.14);
    color.lerp(strata, Math.max(0, -band) * 0.18);
    const vegetationPatch = Math.sin(angle * 5 + phase) * Math.sin(t * 24 + seed * 0.3);
    if (t > 0.72 && vegetationPatch > -0.2) color.lerp(vegetationPatch > 0.35 ? green : moss, 0.48);
    if (t < 0.12) color.lerp(shadow, 0.55);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function caveGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(-0.5, -0.08);
  shape.quadraticCurveTo(-0.46, 0.45, 0, 0.5);
  shape.quadraticCurveTo(0.46, 0.45, 0.5, -0.08);
  shape.lineTo(0.5, -0.5);
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 10);
}

export function HalongKarstIsland({
  position = [0, 0, 0],
  height = 48,
  width = 24,
  seed = 1,
  form = 'tower',
  caves = false,
  vegetation = true,
}) {
  const geometry = useMemo(() => karstGeometry(seed, form), [seed, form]);
  const depth = useMemo(() => range(mulberry32(seed + 17), 0.72, 1.08), [seed]);
  const openingGeometry = useMemo(() => (caves ? caveGeometry() : null), [caves]);
  const openings = useMemo(() => {
    const rng = mulberry32(seed + 77);
    return caves ? Array.from({ length: 1 + Math.floor(rng() * 2) }, () => ({ angle: range(rng, 0, Math.PI * 2), size: range(rng, 0.8, 1.25) })) : [];
  }, [caves, seed]);
  const trees = useMemo(() => {
    const rng = mulberry32(seed + 101);
    return vegetation ? Array.from({ length: width > 29 ? 2 : 1 }, () => {
      const angle = range(rng, 0, Math.PI * 2);
      const radius = range(rng, 0.12, 0.42) * width;
      return { position: [Math.cos(angle) * radius, height * 0.43, Math.sin(angle) * radius * depth], scale: range(rng, 0.9, 1.55) };
    }) : [];
  }, [vegetation, seed, width, height, depth]);

  return (
    <group position={position}>
      <mesh geometry={geometry} scale={[width, height, width * depth]} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.96} metalness={0.015} />
      </mesh>
      {openings.map((opening, index) => {
        const x = Math.cos(opening.angle) * width * 0.94;
        const z = Math.sin(opening.angle) * width * depth * 0.94;
        return (
          <mesh
            key={`cave-${index}`}
            geometry={openingGeometry}
            position={[x, -height * 0.12, z]}
            rotation={[0, Math.PI / 2 - opening.angle, 0]}
            scale={[width * 0.2 * opening.size, height * 0.1 * opening.size, 1]}
          >
            <meshStandardMaterial color="#172326" roughness={1} side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
        );
      })}
      {trees.map((tree, index) => (
        <Tree key={`tree-${index}`} position={tree.position} scale={tree.scale} sway={false} phase={index + seed * 0.1} />
      ))}
    </group>
  );
}
