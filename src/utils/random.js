export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const range = (rng, min, max) => min + rng() * (max - min);

export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];

export const rand = (min, max) => min + Math.random() * (max - min);

export const randomPan = () => Math.random() * 1.8 - 0.9;
