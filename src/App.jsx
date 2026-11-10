import { Suspense, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { useExperience } from './store/useExperience';
import { SCENES, INTRO_TRANSITION } from './data/sceneConfig';
import { audioManager } from './managers/AudioManager';
import { dialogueManager } from './managers/DialogueManager';
import { SCENE_COMPONENTS } from './scenes';
import Effects from './components/Effects';
import LoadingScreen from './components/LoadingScreen';
import IntroScreen from './components/IntroScreen';
import EndScreen from './components/EndScreen';
import CaptionBar from './components/CaptionBar';
import TransitionVeil from './components/TransitionVeil';
import ErrorBoundary from './components/ErrorBoundary';

const SCENE_COUNT = 15;

function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

export default function App() {
  const phase = useExperience((s) => s.phase);
  const current = useExperience((s) => s.current);
  const sceneKey = useExperience((s) => s.sceneKey);
  const webglError = useExperience((s) => s.webglError);
  const started = useRef(false);

  const setPhase = useExperience((s) => s.setPhase);
  const setCurrent = useExperience((s) => s.setCurrent);
  const setTransitioning = useExperience((s) => s.setTransitioning);
  const setBootProgress = useExperience((s) => s.setBootProgress);
  const setWebglError = useExperience((s) => s.setWebglError);

  useEffect(() => {
    if (!detectWebGL()) {
      setWebglError(true);
      setBootProgress(100);
      return undefined;
    }
    let progress = 0;
    let finishTimer = null;
    const id = window.setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 10 + 4);
      setBootProgress(progress);
      if (progress >= 100) {
        window.clearInterval(id);
        finishTimer = window.setTimeout(() => {
          if (useExperience.getState().phase === 'boot') useExperience.getState().setPhase('intro');
        }, 500);
      }
    }, 90);
    return () => {
      window.clearInterval(id);
      if (finishTimer) window.clearTimeout(finishTimer);
    };
  }, [setBootProgress, setWebglError]);

  const goTo = useCallback(
    (next) => {
      const s = useExperience.getState();
      if (s.phase === 'boot' || s.phase === 'end' || s.transitioning) return;
      if (next > SCENE_COUNT) {
        dialogueManager.cancel();
        s.setPhase('end');
        return;
      }
      if (next < 1) return;
      const transition = s.current === 0 ? INTRO_TRANSITION : SCENES[s.current - 1].out;
      const direction = next > s.current ? 1 : -1;
      s.setTransitioning(true, transition, direction);
      dialogueManager.cancel();
      audioManager.transition(next, transition);

      window.setTimeout(() => {
        const state = useExperience.getState();
        if (!state.transitioning) return;
        state.setCurrent(next);
        state.setPhase('experience');
        audioManager.startScene(next);
      }, 520);

      window.setTimeout(() => {
        useExperience.getState().setTransitioning(false);
      }, 1550);

      window.setTimeout(() => {
        const state = useExperience.getState();
        if (state.current === next && state.phase === 'experience') {
          dialogueManager.play(SCENES[next - 1].dialogue, 900);
        }
      }, 2150);
    },
    []
  );

  const handleStart = useCallback(() => {
    if (useExperience.getState().phase !== 'intro') return;
    if (!started.current) {
      started.current = true;
      audioManager.init();
      audioManager.applySettings();
    }
    useExperience.getState().setPhase('experience');
    goTo(1);
  }, [goTo]);

  const handleNext = useCallback(() => {
    const s = useExperience.getState();
    if (s.current >= SCENE_COUNT) {
      dialogueManager.cancel();
      s.setPhase('end');
      s.setTransitioning(false);
      return;
    }
    goTo(s.current + 1);
  }, [goTo]);

  const handlePrev = useCallback(() => {
    const s = useExperience.getState();
    if (s.current <= 1) return;
    goTo(s.current - 1);
  }, [goTo]);

  const handleReplay = useCallback(() => {
    dialogueManager.cancel();
    audioManager.stopAll();
    started.current = false;
    const s = useExperience.getState();
    s.setTransitioning(false);
    s.setCaption(null);
    s.setCurrent(0);
    s.setPhase('intro');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const s = useExperience.getState();
      if (e.key === 'Enter' && s.phase === 'intro') {
        e.preventDefault();
        handleStart();
        return;
      }
      if (e.key === 'ArrowRight') {
        if (s.phase === 'intro') handleStart();
        else if (s.phase === 'experience') handleNext();
      }
      if (e.key === 'ArrowLeft' && s.phase === 'experience') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleStart, handleNext, handlePrev]);

  const SceneComponent = SCENE_COMPONENTS[Math.max(0, Math.min(SCENE_COUNT, current))];

  return (
    <div className="app">
      <ErrorBoundary>
        {!webglError && (
          <Canvas
            shadows="soft"
            dpr={[1, 1.75]}
            camera={{ position: [0, 2, 8], fov: 50, near: 0.1, far: 1600 }}
            performance={{ min: 0.55 }}
            gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' }}
            onCreated={({ gl, scene }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.02;
              gl.outputColorSpace = THREE.SRGBColorSpace;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              gl.shadowMap.enabled = true;
              scene.environmentIntensity = 0.65;
            }}
          >
            <color attach="background" args={['#02070d']} />
            <Environment resolution={64} frames={1}>
              <Lightformer intensity={1.15} position={[0, 6, -9]} scale={[14, 10, 1]} color="#cfe9ff" />
              <Lightformer intensity={0.85} position={[-7, 2, -1]} scale={[10, 4, 1]} color="#ffd9a0" />
              <Lightformer intensity={0.7} position={[7, 2, 0]} scale={[10, 4, 1]} color="#7fe6ff" />
              <Lightformer form="ring" intensity={2.4} position={[0, 8, 3]} scale={5} color="#ffffff" />
              <Lightformer intensity={0.35} position={[0, -4, 1]} scale={[12, 6, 1]} color="#1a5f78" />
            </Environment>
            <Suspense fallback={null}>
              <group key={sceneKey}>{SceneComponent ? <SceneComponent /> : null}</group>
            </Suspense>
            <Effects />
          </Canvas>
        )}

        {phase === 'boot' && <LoadingScreen />}
        {phase === 'intro' && <IntroScreen onStart={handleStart} />}
        {phase === 'experience' && <CaptionBar />}
        {phase === 'end' && <EndScreen onReplay={handleReplay} />}
        <TransitionVeil />
        <div className="vignette" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
      </ErrorBoundary>
    </div>
  );
}
