/**
 * DeckStage Auto-Scaling Engine
 * Scales authored 1920x1080 stage to fit any viewport dynamically with transform matrix.
 */

class DeckStageManager {
  constructor(stageSelector = '.deck-stage', viewportSelector = '.deck-viewport') {
    this.stage = document.querySelector(stageSelector);
    this.viewport = document.querySelector(viewportSelector);
    this.designWidth = 1920;
    this.designHeight = 1080;
    this.scale = 1;

    this.init();
  }

  init() {
    if (!this.stage || !this.viewport) return;

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);

    // Initial scale calculation
    this.handleResize();
  }

  handleResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate scaling factor preserving 16:9 aspect ratio
    const scaleX = windowWidth / this.designWidth;
    const scaleY = windowHeight / this.designHeight;
    this.scale = Math.min(scaleX, scaleY);

    // Calculate centering offset
    const offsetX = (windowWidth - this.designWidth * this.scale) / 2;
    const offsetY = (windowHeight - this.designHeight * this.scale) / 2;

    // Apply transform matrix
    this.stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${this.scale})`;
  }
}

// Export as global or module
window.DeckStageManager = DeckStageManager;
