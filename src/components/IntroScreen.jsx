import { SLOGANS } from '../data/sceneConfig';

export default function IntroScreen({ onStart }) {
  return (
    <div className="intro">
      <div className="intro__scrim" aria-hidden="true" />
      <div className="intro__frame" aria-hidden="true">
        <span className="corner corner--tl" />
        <span className="corner corner--tr" />
        <span className="corner corner--bl" />
        <span className="corner corner--br" />
      </div>
      <div className="intro__content">
        <div className="intro__eyebrow">
          <span className="eyebrow eyebrow--gold">FUTURE CITY PROJECT</span>
          <span className="intro__line" />
          <span className="eyebrow">15 CHAPTERS · 2076</span>
        </div>
        <h1 className="intro__title">
          <span className="intro__title-top">QUANG NINH</span>
          <span className="intro__title-year">2076</span>
        </h1>
        <p className="intro__tagline">Our future, our responsibility.</p>
        <p className="intro__desc">
          A journey through space with Minh, Lan, Alex and Robo — from a small room in 2026 to a
          green, smart and livable Quảng Ninh.
        </p>
        <div className="intro__actions">
          <button type="button" className="btn btn--primary btn--large" onClick={onStart} autoFocus>
            <span>START JOURNEY</span>
            <span className="btn__arrow">→</span>
          </button>
          <div className="intro__note">
            <span className="headphone" aria-hidden="true">◖</span>
            <span>Turn on sound for the best experience</span>
          </div>
        </div>
        <div className="intro__slogans">
          {SLOGANS.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
      <div className="intro__footer">
        <span>QUANG NINH 2076</span>
        <span className="intro__footer-mid">A GREEN · SMART · BEAUTIFUL CITY</span>
        <span>PRESS ENTER TO BEGIN</span>
      </div>
    </div>
  );
}
