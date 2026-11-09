export default function EndScreen({ onReplay }) {
  return (
    <div className="ending">
      <div className="ending__scrim" aria-hidden="true" />
      <div className="ending__content">
        <span className="eyebrow eyebrow--gold">QUẢNG NINH · 2076</span>
        <h1 className="ending__title">
          TƯƠNG LAI CỦA CHÚNG TA
          <br />
          <span>TRÁCH NHIỆM CỦA CHÚNG TA</span>
        </h1>
        <p className="ending__vi">Một thành phố, một giấc mơ, một tương lai tươi sáng.</p>
        <div className="ending__rule" />
        <p className="ending__desc">
          Hành trình khép lại — nhưng tương lai chỉ thực sự bắt đầu khi mỗi chúng ta hành động, từ hôm nay.
        </p>
        <div className="ending__actions">
          <button type="button" className="btn btn--primary btn--large" onClick={onReplay}>
            <span>XEM LẠI HÀNH TRÌNH</span>
            <span className="btn__arrow">↺</span>
          </button>
        </div>
        <span className="ending__credit">HỌC TẬP · SÁNG TẠO · BẢO VỆ QUÊ HƯƠNG</span>
      </div>
    </div>
  );
}
