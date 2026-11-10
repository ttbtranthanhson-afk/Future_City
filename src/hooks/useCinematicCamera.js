import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function isNested(arr) {
  return Array.isArray(arr) && Array.isArray(arr[0]);
}

function parameterAtTime(progress, times, pointCount) {
  if (!times || times.length !== pointCount || times[0] !== 0 || times[times.length - 1] !== 1) return progress;
  let index = 0;
  while (index < times.length - 2 && progress > times[index + 1]) index += 1;
  const span = times[index + 1] - times[index];
  const local = span > 0 ? (progress - times[index]) / span : 0;
  return (index + THREE.MathUtils.clamp(local, 0, 1)) / (pointCount - 1);
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
  pathTimes = null,
  targetSmoothing = 9,
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
    const rawProgress = elapsed / loop + startAt;
    const t = closed ? ((rawProgress % 1) + 1) % 1 : THREE.MathUtils.clamp(rawProgress, 0, 1);
    const curveT = !closed && pathTimes ? parameterAtTime(t, pathTimes, path.length) : t;
    const pos = closed ? posCurve.getPointAt(t) : posCurve.getPoint(curveT);
    let target;
    if (lookCurve instanceof THREE.Vector3) {
      target = lookCurve;
    } else if (lookCurve) {
      const lookT = !closed && pathTimes ? parameterAtTime(t, pathTimes, look.length) : t;
      target = closed ? lookCurve.getPointAt(t) : lookCurve.getPoint(lookT);
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
      lookTarget.current.lerp(target, 1 - Math.exp(-targetSmoothing * delta));
    }
    camera.position.copy(pos);
    camera.position.x += sx;
    camera.position.y += sy;
    camera.lookAt(lookTarget.current);
    if (Math.abs(camera.fov - fov) > 0.02) {
      camera.fov += (fov - camera.fov) * (1 - Math.exp(-3.2 * delta));
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
