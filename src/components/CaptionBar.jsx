import { useExperience } from '../store/useExperience';

export default function CaptionBar() {
  const caption = useExperience((s) => s.caption);
  const transitioning = useExperience((s) => s.transitioning);

  if (transitioning || !caption) return null;

  return (
    <div className="caption" key={caption.id}>
      <span className="caption__dot" />
      <span>{caption.text}</span>
    </div>
  );
}
