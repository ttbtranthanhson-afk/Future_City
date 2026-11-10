import { useExperience } from '../store/useExperience';

const STEPS = [
  { at: 0, label: 'Initializing Quang Ninh terrain...' },
  { at: 32, label: 'Building city 2076...' },
  { at: 62, label: 'Connecting audio system...' },
  { at: 86, label: 'Preparing journey...' },
];

export default function LoadingScreen() {
  const progress = useExperience((s) => s.bootProgress);
  const webglError = useExperience((s) => s.webglError);
  const step = [...STEPS].reverse().find((s) => progress >= s.at) || STEPS[0];

  return (
    <div className="boot">
      <div className="boot__grid" aria-hidden="true" />
      <div className="boot__top">
        <span className="brandmark">
          <span className="brandmark__dot" />
          QN / 2076
        </span>
        <span className="eyebrow">INTERACTIVE CINEMATIC EXPERIENCE</span>
      </div>
      <div className="boot__center">
        <span className="eyebrow eyebrow--gold">QUANG NINH</span>
        <h1 className="boot__title">
          OUR FUTURE,
          <br />
          <span>OUR RESPONSIBILITY</span>
        </h1>
        {webglError ? (
          <div className="boot__error">
            <p>This browser does not support WebGL 2.0.</p>
            <p>Enable hardware acceleration or use the latest version of Chrome or Edge.</p>
          </div>
        ) : (
          <>
            <div className="boot__bar">
              <span style={{ width: `${Math.max(3, progress)}%` }} />
            </div>
            <div className="boot__meta">
              <span>{step.label}</span>
              <span>{Math.round(progress).toString().padStart(3, '0')}%</span>
            </div>
          </>
        )}
      </div>
      <div className="boot__bottom">
        <span>15 SCENES</span>
        <span>3D REAL-TIME</span>
        <span>PROCEDURAL AUDIO</span>
      </div>
    </div>
  );
}
