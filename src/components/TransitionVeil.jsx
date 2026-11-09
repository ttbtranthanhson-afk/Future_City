import { useExperience } from '../store/useExperience';

const LABELS = {
  portal: 'CỔNG KHÔNG GIAN',
  warp: 'XUYÊN KHÔNG GIAN',
  light: 'ÁNH SÁNG',
  fly: 'BAY QUA THÀNH PHỐ',
  water: 'LẶN XUỐNG ĐẠI DƯƠNG',
  blur: 'CHUYỂN CẢNH',
  dust: 'BỤI THAN',
  rise: 'VƯƠN LÊN',
  wide: 'MỞ RỘNG',
  end: 'KẾT THÚC',
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
        <span>{LABELS[type] || 'CHUYỂN CẢNH'}</span>
      </div>
    </div>
  );
}
