/**
 * Interactive Particle Canvas System
 * Renders ambient micro-stars and dynamic sci-fi warp vortex.
 */

class ParticleSystem {
  constructor(canvasId = 'stageParticles') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 120;
    this.isWarpMode = false;
    this.mouse = { x: 960, y: 540 };

    this.init();
  }

  init() {
    this.canvas.width = 1920;
    this.canvas.height = 1080;

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }

    window.addEventListener('mousemove', (e) => {
      // Map to 1920x1080 stage coordinates
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = 1920 / rect.width;
      const scaleY = 1080 / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createParticle() {
    const colors = ['#22d3ee', '#10b981', '#8b5cf6', '#3b82f6', '#ffffff'];
    return {
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      radius: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.2,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      originX: 960,
      originY: 540,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 3 + 1
    };
  }

  setWarpMode(active) {
    this.isWarpMode = active;
  }

  animate() {
    this.ctx.clearRect(0, 0, 1920, 1080);

    if (this.isWarpMode) {
      // Draw Hyperspace / Warp Tunnel
      const centerX = 960;
      const centerY = 540;

      for (let p of this.particles) {
        p.speed += 0.2;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        // Draw light streak
        this.ctx.beginPath();
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = p.radius;
        this.ctx.globalAlpha = Math.min(1, p.speed / 10);
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - Math.cos(p.angle) * p.speed * 3, p.y - Math.sin(p.angle) * p.speed * 3);
        this.ctx.stroke();

        // Respawn if out of bounds
        if (p.x < 0 || p.x > 1920 || p.y < 0 || p.y > 1080) {
          p.x = centerX + (Math.random() - 0.5) * 50;
          p.y = centerY + (Math.random() - 0.5) * 50;
          p.angle = Math.random() * Math.PI * 2;
          p.speed = Math.random() * 2 + 1;
        }
      }
    } else {
      // Ambient floating particles
      for (let p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = 1920;
        if (p.x > 1920) p.x = 0;
        if (p.y < 0) p.y = 1080;
        if (p.y > 1080) p.y = 0;

        // Subtle repulsion from mouse
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.x += (dx / dist) * 2;
          p.y += (dy / dist) * 2;
        }

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.fill();
      }
    }

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;

    requestAnimationFrame(this.animate);
  }
}

window.ParticleSystem = ParticleSystem;
