import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperience } from '../store/useExperience';
import { audioManager } from '../managers/AudioManager';

export function useSceneSegments(segments, loop = 0, { delay = 0, onSegment } = {}) {
  const start = useRef(null);
  const last = useRef(-2);
  const started = useRef(false);

  useFrame(() => {
    if (!segments || !segments.length) return;
    const now = performance.now() / 1000;
    if (start.current === null) start.current = now + delay;
    let t = now - start.current;
    if (t < 0) return;
    if (loop > 0) t %= loop;

    let idx = 0;
    for (let i = 0; i < segments.length; i += 1) {
      if (t >= segments[i].t) idx = i;
      else break;
    }
    if (idx === last.current && started.current) return;
    last.current = idx;
    started.current = true;
    const seg = segments[idx];
    const store = useExperience.getState();
    if (seg.caption) store.setCaption(seg.caption, seg.sub || '');
    if (seg.ambience) audioManager.switchAmbience(seg.ambience);
    if (seg.sfx) {
      const list = Array.isArray(seg.sfx) ? seg.sfx : [seg.sfx];
      list.forEach((name, i) => setTimeout(() => audioManager.sfx(name), i * 180));
    }
    if (onSegment) onSegment(seg, idx);
  });
}
