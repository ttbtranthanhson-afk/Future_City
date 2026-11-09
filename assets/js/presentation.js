/**
 * Presentation Controller - Audience Stage Backdrop Edition
 * Zero visible UI chrome. Seamless keyboard & edge-click navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const stageManager = new DeckStageManager();
  const sfx = new SoundEffects();
  const particles = new ParticleSystem('stageParticles');

  const slides = document.querySelectorAll('.slide');
  const indicatorEl = document.getElementById('slideIndicator');
  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateSlide(newIndex) {
    if (newIndex < 0 || newIndex >= totalSlides) return;

    slides[currentIndex].classList.remove('active');
    currentIndex = newIndex;
    slides[currentIndex].classList.add('active');

    // Update discrete audience indicator
    if (indicatorEl) {
      indicatorEl.textContent = `SCENE 1 // SLIDE 0${currentIndex + 1}`;
    }

    // Trigger scene-specific audio and visual state
    handleSlideCues(currentIndex);
  }

  function handleSlideCues(index) {
    sfx.playClick();

    if (index === 0) {
      // Slide 1: Hero Opening
      particles.setWarpMode(false);
      sfx.playChime();
    } else if (index === 1) {
      // Slide 2: 12-Character Pixel Matrix
      particles.setWarpMode(false);
    } else if (index === 2) {
      // Slide 3: Scene 1 Environmental Backdrop (2026)
      particles.setWarpMode(false);
    } else if (index === 3) {
      // Slide 4: Quantum Portal Warp
      particles.setWarpMode(true);
      sfx.playWarp();
      setTimeout(() => sfx.playRobotBeep(), 1200);

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

  // Navigation commands
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

  // Keyboard navigation (Technician / Presenter hotkeys)
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
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        break;
      case 'm':
      case 'M':
        sfx.toggleMute();
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

  // Edge-click navigation (Click right edge to advance, left to go back)
  window.addEventListener('click', (e) => {
    sfx.ensureContext();
    const width = window.innerWidth;
    if (e.clientX > width * 0.75) {
      nextSlide();
    } else if (e.clientX < width * 0.25) {
      prevSlide();
    }
  });

  // Initialize first slide
  updateSlide(0);
});
