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
            <h1>Unable to start the experience</h1>
            <p>{this.state.message}</p>
            <p className="fatal__hint">Try the latest version of Chrome or Edge, enable hardware acceleration, and reload the page.</p>
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
              RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
