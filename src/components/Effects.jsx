import { useMemo } from 'react';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
  HueSaturation,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export default function Effects() {
  const chroma = useMemo(() => new THREE.Vector2(0.00055, 0.0008), []);
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom luminanceThreshold={0.58} luminanceSmoothing={0.32} intensity={0.85} mipmapBlur radius={0.72} />
      <ChromaticAberration offset={chroma} radialModulation modulationOffset={0.28} />
      <HueSaturation hue={0} saturation={0.08} />
      <BrightnessContrast brightness={0.012} contrast={0.055} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.026} />
      <Vignette eskil={false} offset={0.16} darkness={0.55} />
    </EffectComposer>
  );
}
