import { useExperience } from '../store/useExperience';
import { audioManager } from '../managers/AudioManager';

const CHANNELS = [
  { key: 'master', label: 'Master', sub: 'Master' },
  { key: 'music', label: 'Music', sub: 'Music' },
  { key: 'ambience', label: 'Ambience', sub: 'Ambience' },
  { key: 'sfx', label: 'SFX', sub: 'SFX' },
  { key: 'voice', label: 'Voice', sub: 'Voice' },
];

export default function SoundPanel() {
  const volumes = useExperience((s) => s.volumes);
  const muted = useExperience((s) => s.muted);
  const setVolume = useExperience((s) => s.setVolume);
  const setMuted = useExperience((s) => s.setMuted);
  const setSoundOpen = useExperience((s) => s.setSoundOpen);

  const change = (key, value) => {
    setVolume(key, value);
    audioManager.ensure();
    audioManager.applySettings();
  };

  const toggleMute = () => {
    setMuted(!muted);
    audioManager.ensure();
    audioManager.applySettings();
  };

  return (
    <div className="sound" role="dialog" aria-label="Sound Settings">
      <div className="sound__head">
        <div>
          <span className="eyebrow eyebrow--gold">SOUND</span>
          <h3>Sound design</h3>
        </div>
        <button type="button" className="icon-btn" aria-label="Đóng cài đặt âm thanh" onClick={() => setSoundOpen(false)}>
          ✕
        </button>
      </div>
      <button type="button" className={`mute ${muted ? 'is-muted' : ''}`} onClick={toggleMute}>
        <span className="mute__icon" aria-hidden="true">
          {muted ? '◌' : '◉'}
        </span>
        <span>{muted ? 'Đang tắt tiếng' : 'Đang bật tiếng'}</span>
        <span className="mute__toggle" aria-hidden="true">
          <span />
        </span>
      </button>
      <div className="sound__channels">
        {CHANNELS.map((c) => (
          <label key={c.key} className="slider">
            <span className="slider__label">
              <span>{c.label}</span>
              <span className="slider__sub">{c.sub}</span>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volumes[c.key] ?? 0}
              onChange={(e) => change(c.key, Number(e.target.value))}
              style={{ '--val': `${Math.round((muted ? 0 : volumes[c.key] ?? 0) * 100)}%` }}
            />
            <span className="slider__value">{Math.round((muted ? 0 : volumes[c.key] ?? 0) * 100)}</span>
          </label>
        ))}
      </div>
      <p className="sound__hint">Sound and effects are synthesized directly in the browser.</p>
    </div>
  );
}
