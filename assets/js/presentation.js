/**
 * Presentation Controller - Master Orchestrator
 * Connects DeckStage, SoundEffects, and ParticleSystem with keyboard navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Subsystems
  const stageManager = new DeckStageManager();
  const sfx = new SoundEffects();
  const particles = new ParticleSystem('stageParticles');

  const slides = document.querySelectorAll('.slide');
  const counterEl = document.getElementById('slideCounter');
  const muteBtn = document.getElementById('btnMute');
  const fullscreenBtn = document.getElementById('btnFullscreen');
  const prevBtn = document.getElementById('btnPrev');
  const nextBtn = document.getElementById('btnNext');

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateSlide(newIndex, reason = 'nav') {
    if (newIndex < 0 || newIndex >= totalSlides) return;

    // Remove active from previous
    slides[currentIndex].classList.remove('active');

    currentIndex = newIndex;
    slides[currentIndex].classList.add('active');

    // Update HUD Counter
    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }

    // Trigger Slide-specific behaviors & Sound cues
    handleSlideTriggers(currentIndex);
  }

  function handleSlideTriggers(index) {
    sfx.playClick();

    if (index === 0) {
      // Hero opening
      particles.setWarpMode(false);
      sfx.playChime();
    } else if (index === 1) {
      // Cast list
      particles.setWarpMode(false);
    } else if (index === 2) {
      // Scene 1: 2026 discussion
      particles.setWarpMode(false);
    } else if (index === 3) {
      // Time Travel Portal: Activate Warp Mode & SFX
      particles.setWarpMode(true);
      sfx.playWarp();
      setTimeout(() => {
        sfx.playRobotBeep();
      }, 1400);

      // Trigger countdown visual animation
      runCountdown();
    }
  }

  function runCountdown() {
    const countdownEl = document.getElementById('countdownDisplay');
    if (!countdownEl) return;

    const sequence = ['3', '2', '1', '2076!'];
    let step = 0;

    countdownEl.textContent = sequence[0];
    const timer = setInterval(() => {
      step++;
      if (step < sequence.length) {
        countdownEl.textContent = sequence[step];
        sfx.playRobotBeep();
      } else {
        clearInterval(timer);
      }
    }, 700);
  }

  // Navigation handlers
  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      updateSlide(currentIndex + 1);
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      updateSlide(currentIndex - 1);
    }
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
        toggleMute();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        const target = parseInt(e.key, 10) - 1;
        if (target < totalSlides) updateSlide(target);
        break;
    }
  });

  // HUD Button Click Events
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  if (muteBtn) {
    muteBtn.addEventListener('click', toggleMute);
  }

  function toggleMute() {
    const isMuted = sfx.toggleMute();
    if (muteBtn) {
      muteBtn.innerHTML = isMuted
        ? '<span class="icon">🔇</span> <span>Muted</span>'
        : '<span class="icon">🔊</span> <span>Sound</span>';
      muteBtn.style.opacity = isMuted ? '0.6' : '1';
    }
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Global Start Button on Hero Slide
  const startBtn = document.getElementById('btnStartPresentation');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      sfx.ensureContext();
      nextSlide();
    });
  }

  // Initialize first slide
  updateSlide(0, 'init');
});
