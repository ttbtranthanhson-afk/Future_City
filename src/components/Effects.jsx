import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export default function Effects() {
  return (
    <EffectComposer multisampling={0} disableNormalPass>
      <Bloom luminanceThreshold={0.62} luminanceSmoothing={0.28} intensity={0.62} mipmapBlur radius={0.7} />
      <Vignette eskil={false} offset={0.14} darkness={0.5} />
    </EffectComposer>
  );
}
