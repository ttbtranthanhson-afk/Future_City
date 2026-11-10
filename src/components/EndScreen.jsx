export default function EndScreen({ onReplay }) {
  return (
    <div className="ending">
      <div className="ending__scrim" aria-hidden="true" />
      <div className="ending__content">
        <span className="eyebrow eyebrow--gold">QUANG NINH 2076</span>
        <h1 className="ending__title">
          OUR FUTURE
          <br />
          <span>OUR RESPONSIBILITY</span>
        </h1>
        <p className="ending__vi">One city, one dream, one bright future.</p>
        <div className="ending__rule" />
        <p className="ending__desc">
          Journey complete — but the future truly begins when each of us acts, starting today.
        </p>
        <div className="ending__actions">
          <button type="button" className="btn btn--primary btn--large" onClick={onReplay}>
            <span>REWATCH JOURNEY</span>
            <span className="btn__arrow">↺</span>
          </button>
        </div>
        <span className="ending__credit">LEARN · CREATE · PROTECT</span>
      </div>
    </div>
  );
}
