import { SCENES } from '../data/sceneConfig';
import { useExperience } from '../store/useExperience';
import SoundPanel from './SoundPanel';

function Arrow({ dir = 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {dir === 'right' ? (
        <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M19 12H6M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function SoundIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      {muted ? (
        <path d="m16 9 5 6m0-6-5 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="m4 20 16-16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function HUD({ onPrev, onNext, onFullscreen }) {
  const current = useExperience((s) => s.current);
  const visible = useExperience((s) => s.hudVisible);
  const soundOpen = useExperience((s) => s.soundOpen);
  const muted = useExperience((s) => s.muted);
  const setSoundOpen = useExperience((s) => s.setSoundOpen);
  const setHudVisible = useExperience((s) => s.setHudVisible);

  const scene = SCENES[Math.max(0, current - 1)];
  const isLast = current >= 15;
  const isFirst = current <= 1;

  return (
    <>
      <header className={`hud-top ${visible ? '' : 'is-hidden'}`}>
        <button type="button" className="brandmark brandmark--button" onClick={() => setHudVisible(false)} aria-label="Ẩn giao diện">
          <span className="brandmark__dot" />
          <span>QN / 2076</span>
        </button>
        <div className="hud-top__chapter">
          <span className="eyebrow">{scene.chapter}</span>
          <span className="hud-top__title">{scene.title}</span>
        </div>
        <div className="hud-top__meta">
          <span className="status-dot" />
          <span>LIVE 3D</span>
          <span className="hud-top__divider" />
          <span>SCENE {String(current).padStart(2, '0')}/15</span>
        </div>
      </header>

      <aside className={`scene-card ${visible ? '' : 'is-hidden'}`}>
        <div className="scene-card__index">
          <span className="scene-card__num">{String(current).padStart(2, '0')}</span>
          <span className="scene-card__total">/ 15</span>
        </div>
        <div className="scene-card__body">
          <span className="eyebrow eyebrow--gold">{scene.chapter}</span>
          <h2>{scene.viTitle}</h2>
          <p>{scene.subtitle}</p>
        </div>
        <div className="scene-card__progress" aria-hidden="true">
          {SCENES.map((s) => (
            <span key={s.id} className={s.id <= current ? 'is-done' : ''} />
          ))}
        </div>
      </aside>

      <div className={`controls ${visible ? '' : 'is-hidden'}`}>
        {soundOpen && <SoundPanel />}
        <div className="controls__row">
          <button type="button" className="ctrl" onClick={onPrev} disabled={isFirst} aria-label="Cảnh trước">
            <Arrow dir="left" />
            <span>TRƯỚC</span>
          </button>
          <button type="button" className="ctrl ctrl--next" onClick={onNext} aria-label={isLast ? 'Kết thúc' : 'Cảnh tiếp theo'}>
            <span>{isLast ? 'KẾT THÚC' : 'TIẾP THEO'}</span>
            <Arrow />
          </button>
          <span className="controls__divider" />
          <button
            type="button"
            className={`icon-btn ${soundOpen ? 'is-active' : ''} ${muted ? 'is-muted' : ''}`}
            onClick={() => setSoundOpen(!soundOpen)}
            aria-label="Cài đặt âm thanh"
          >
            <SoundIcon muted={muted} />
          </button>
          <button type="button" className="icon-btn" onClick={onFullscreen} aria-label="Toàn màn hình">
            <FullscreenIcon />
          </button>
          <button type="button" className="icon-btn" onClick={() => setHudVisible(false)} aria-label="Ẩn giao diện">
            <EyeIcon />
          </button>
        </div>
        <div className="controls__hint">
          <span>←</span>
          <span>→</span>
          <span>để di chuyển</span>
          <span className="controls__key">F</span>
          <span>toàn màn hình</span>
        </div>
      </div>

      {!visible && (
        <button type="button" className="hud-reveal" onClick={() => setHudVisible(true)} aria-label="Hiện giao diện">
          <span className="hud-reveal__dot" />
          HIỆN GIAO DIỆN
        </button>
      )}
    </>
  );
}
