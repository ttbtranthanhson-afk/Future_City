import { useExperience } from '../store/useExperience';

const LABELS = {
  portal: 'PORTAL',
  warp: 'WARP',
  light: 'LIGHT',
  fly: 'FLY TO CITY',
  water: 'FALL DOWN HIGHWAY',
  blur: 'PANEL TRANSITION',
  dust: 'DUST',
  rise: 'RISE',
  wide: 'WIDE',
  end: 'END',
};

export default function TransitionVeil() {
  const transitioning = useExperience((s) => s.transitioning);
  const transition = useExperience((s) => s.transition);
  const direction = useExperience((s) => s.direction);
  const type = transition?.type || 'warp';
  const color = transition?.color || '#8ff6ff';

  return (
    <div
      className={`veil veil--${type} ${transitioning ? 'is-active' : ''} ${direction < 0 ? 'is-back' : ''}`}
      style={{ '--veil-color': color }}
      aria-hidden="true"
    >
      <div className="veil__flash" />
      <div className="veil__streaks" />
      <div className="veil__rings">
        <span />
        <span />
        <span />
      </div>
      <div className="veil__label">
        <span className="eyebrow">TRANSITION</span>
        <span>{LABELS[type] || 'TRANSITION'}</span>
      </div>
    </div>
  );
}
