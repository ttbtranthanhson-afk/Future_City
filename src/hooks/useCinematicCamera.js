import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function isNested(arr) {
  return Array.isArray(arr) && Array.isArray(arr[0]);
}

export function useCinematicCamera({
  path,
  look,
  loop = 42,
  closed = true,
  fov = 50,
  shake = 0.018,
  tension = 0.35,
  startAt = 0,
  lookAhead = false,
}) {
  const { camera } = useThree();
  const startRef = useRef(null);
  const lookTarget = useRef(new THREE.Vector3());
  const initialized = useRef(false);
  const pathKey = useMemo(() => JSON.stringify(path), [path]);
  const lookKey = useMemo(() => JSON.stringify(look), [look]);

  const posCurve = useMemo(() => {
    const pts = path.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', tension);
  }, [pathKey, closed, tension]);

  const lookCurve = useMemo(() => {
    if (lookAhead || !look) return null;
    if (isNested(look)) {
      const pts = look.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      return new THREE.CatmullRomCurve3(pts, closed, 'catmullrom', tension);
    }
    return new THREE.Vector3(look[0], look[1], look[2]);
  }, [lookKey, closed, tension, lookAhead]);

  useFrame((state, delta) => {
    if (!posCurve) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startRef.current;
    const t = (((elapsed / loop) + startAt) % 1 + 1) % 1;
    const pos = posCurve.getPointAt(t);
    let target;
    if (lookCurve instanceof THREE.Vector3) {
      target = lookCurve;
    } else if (lookCurve) {
      target = lookCurve.getPointAt(t);
    } else {
      const tangent = posCurve.getTangentAt(t);
      target = pos.clone().add(tangent.multiplyScalar(12));
    }

    const shakeAmt = shake;
    const sx = Math.sin(elapsed * 1.31) * shakeAmt + Math.sin(elapsed * 2.77) * shakeAmt * 0.35;
    const sy = Math.cos(elapsed * 1.07) * shakeAmt * 0.8 + Math.sin(elapsed * 3.1) * shakeAmt * 0.25;

    if (!initialized.current) {
      lookTarget.current.copy(target);
      initialized.current = true;
    } else {
      lookTarget.current.lerp(target, Math.min(1, delta * 9));
    }
    camera.position.copy(pos);
    camera.position.x += sx;
    camera.position.y += sy;
    camera.lookAt(lookTarget.current);
    if (Math.abs(camera.fov - fov) > 0.02) {
      camera.fov += (fov - camera.fov) * Math.min(1, delta * 3.2);
      camera.updateProjectionMatrix();
    }
  });
}

export function StaticCamera({ position = [0, 1.6, 8], look = [0, 1.2, 0], fov = 50 }) {
  const { camera } = useThree();
  const ref = useRef(false);
  useFrame(() => {
    if (ref.current) return;
    ref.current = true;
    camera.position.set(...position);
    camera.lookAt(new THREE.Vector3(...look));
    camera.fov = fov;
    camera.updateProjectionMatrix();
  });
  return null;
}
