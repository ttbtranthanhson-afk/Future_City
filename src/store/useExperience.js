import { create } from 'zustand';
import { DEFAULT_VOLUMES } from '../data/audioConfig';

const STORAGE_KEY = 'qn2076.settings.v1';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { volumes: { ...DEFAULT_VOLUMES }, muted: false };
    const parsed = JSON.parse(raw);
    return {
      volumes: { ...DEFAULT_VOLUMES, ...(parsed.volumes || {}) },
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { volumes: { ...DEFAULT_VOLUMES }, muted: false };
  }
}

function persist(volumes, muted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ volumes, muted }));
  } catch {
    /* storage can be unavailable */
  }
}

const initial = loadSettings();

export const useExperience = create((set, get) => ({
  phase: 'boot',
  current: 0,
  sceneKey: 0,
  transitioning: false,
  direction: 1,
  transition: null,
  muted: initial.muted,
  volumes: initial.volumes,
  caption: null,
  captionId: 0,
  bootProgress: 0,
  webglError: false,

  setPhase: (phase) => set({ phase }),
  setBootProgress: (bootProgress) => set({ bootProgress }),
  setWebglError: (webglError) => set({ webglError }),

  setCurrent: (current) =>
    set((s) => ({
      current,
      sceneKey: s.sceneKey + 1,
      caption: null,
    })),
  setTransitioning: (transitioning, transition = null, direction = 1) =>
    set((s) => ({
      transitioning,
      transition: transition || (transitioning ? s.transition : null),
      direction,
    })),

  setCaption: (text, sub = '') =>
    set((s) => ({ caption: text ? { text, sub, id: s.captionId + 1 } : null, captionId: s.captionId + 1 })),

  setMuted: (muted) => {
    persist(get().volumes, muted);
    set({ muted });
  },
  setVolume: (bus, value) => {
    const volumes = { ...get().volumes, [bus]: value };
    persist(volumes, get().muted);
    set({ volumes });
  },
}));
