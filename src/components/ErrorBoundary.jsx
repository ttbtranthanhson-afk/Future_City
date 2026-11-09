import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('Experience error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fatal">
          <div className="fatal__panel">
            <span className="eyebrow">WEBGL / RUNTIME ERROR</span>
            <h1>Không thể khởi động trải nghiệm</h1>
            <p>{this.state.message}</p>
            <p className="fatal__hint">Hãy thử trình duyệt Chrome hoặc Edge mới nhất, bật tăng tốc phần cứng và tải lại trang.</p>
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              TẢI LẠI
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
