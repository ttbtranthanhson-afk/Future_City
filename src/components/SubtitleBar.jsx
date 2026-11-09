import { useExperience } from '../store/useExperience';

export default function SubtitleBar() {
  const subtitle = useExperience((s) => s.subtitle);
  const caption = useExperience((s) => s.caption);
  const transitioning = useExperience((s) => s.transitioning);

  if (transitioning) return null;

  if (subtitle) {
    return (
      <div className="subtitle" key={`${subtitle.index}-${subtitle.speaker}`}>
        <span className="subtitle__speaker">{subtitle.speaker}</span>
        <span className="subtitle__text">{subtitle.text}</span>
      </div>
    );
  }

  if (caption) {
    return (
      <div className="caption" key={caption.id}>
        <span className="caption__dot" />
        <span>{caption.text}</span>
      </div>
    );
  }

  return null;
}
