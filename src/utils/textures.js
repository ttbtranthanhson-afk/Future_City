import * as THREE from 'three';

const cache = new Map();

function createCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function toTexture(canvas, { repeat = null, srgb = true } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.needsUpdate = true;
  return tex;
}

function cached(key, build) {
  if (!cache.has(key)) cache.set(key, build());
  return cache.get(key);
}

export function windowTexture(variant = 0) {
  return cached(`windows-${variant}`, () => {
    const canvas = createCanvas(256, 512);
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#050b16');
    grad.addColorStop(1, '#0a1626');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);
    const cols = 8;
    const rows = 20;
    const cw = 256 / cols;
    const ch = 512 / rows;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const r = Math.random();
        let color = null;
        if (r > 0.84) color = '#bff8ff';
        else if (r > 0.66) color = '#48d7ff';
        else if (r > 0.5) color = '#ffd9a0';
        else if (r > 0.4) color = '#7cf0d0';
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.35 + Math.random() * 0.65;
        ctx.fillRect(x * cw + cw * 0.2, y * ch + ch * 0.24, cw * 0.6, ch * 0.42);
        ctx.globalAlpha = 1;
      }
    }
    ctx.strokeStyle = 'rgba(74, 188, 235, 0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * cw, 0);
      ctx.lineTo(x * cw, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * ch);
      ctx.lineTo(256, y * ch);
      ctx.stroke();
    }
    return toTexture(canvas, { repeat: [1, 1] });
  });
}

export function glowTexture(inner = '#ffffff', outer = 'rgba(255,255,255,0)') {
  return cached(`glow-${inner}-${outer}`, () => {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, inner);
    g.addColorStop(0.25, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return toTexture(canvas);
  });
}

export function cloudTexture(seed = 0) {
  return cached(`cloud-${seed}`, () => {
    const canvas = createCanvas(512, 256);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);
    let state = seed * 9301 + 49297;
    const rnd = () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
    for (let i = 0; i < 26; i += 1) {
      const x = 60 + rnd() * 392;
      const y = 90 + rnd() * 100;
      const r = 25 + rnd() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const a = 0.055 + rnd() * 0.12;
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.55, `rgba(220,245,255,${a * 0.7})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    return toTexture(canvas);
  });
}

export function mapTexture() {
  return cached('map', () => {
    const canvas = createCanvas(1024, 512);
    const ctx = canvas.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0, '#f0e2c4');
    bg.addColorStop(1, '#d8c39c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = '#a9d3d0';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = 'rgba(120,150,150,0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y < 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#d8d3a8';
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(150, 40);
    ctx.lineTo(330, 95);
    ctx.lineTo(500, 60);
    ctx.lineTo(640, 120);
    ctx.lineTo(700, 210);
    ctx.lineTo(620, 300);
    ctx.lineTo(540, 360);
    ctx.lineTo(420, 330);
    ctx.lineTo(330, 390);
    ctx.lineTo(200, 360);
    ctx.lineTo(120, 280);
    ctx.lineTo(0, 250);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9fa68b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#d8d3a8';
    ctx.beginPath();
    ctx.moveTo(720, 150);
    ctx.lineTo(900, 120);
    ctx.lineTo(1024, 200);
    ctx.lineTo(1024, 430);
    ctx.lineTo(880, 420);
    ctx.lineTo(780, 340);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const islands = [
      [470, 250, 26],
      [512, 285, 18],
      [545, 255, 22],
      [585, 300, 14],
      [610, 265, 16],
      [430, 300, 12],
      [640, 320, 10],
      [505, 330, 9],
    ];
    islands.forEach(([x, y, r]) => {
      ctx.fillStyle = '#7f9f86';
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.4, r, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(50,80,60,0.5)';
      ctx.stroke();
    });

    ctx.strokeStyle = '#e04848';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 9]);
    ctx.beginPath();
    ctx.moveTo(250, 160);
    ctx.bezierCurveTo(380, 210, 460, 210, 520, 265);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(180, 40, 40, 0.9)';
    ctx.beginPath();
    ctx.arc(520, 265, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f3b4a';
    ctx.font = '700 46px "Be Vietnam Pro", sans-serif';
    ctx.fillText('QUẢNG NINH', 70, 460);
    ctx.font = '500 22px "Be Vietnam Pro", sans-serif';
    ctx.fillStyle = '#2c5a66';
    ctx.fillText('VỊNH HẠ LONG · 2026', 72, 492);

    ctx.fillStyle = 'rgba(45, 40, 30, 0.7)';
    ctx.font = '600 18px "Be Vietnam Pro", sans-serif';
    ctx.fillText('HÒN GAI', 405, 215);
    ctx.fillText('CẨM PHẢ', 760, 250);
    ctx.fillText('MÓNG CÁI', 300, 120);
    return toTexture(canvas);
  });
}

export function holoTexture({ title = '', lines = [], accent = '#6ff0ff', icon = null, footer = '' } = {}) {
  const key = `holo-${title}-${accent}-${lines.join('|')}-${icon}-${footer}`;
  return cached(key, () => {
    const canvas = createCanvas(1024, 512);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, 'rgba(4, 24, 36, 0.72)');
    grad.addColorStop(1, 'rgba(4, 14, 26, 0.38)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.75;
    ctx.lineWidth = 3;
    ctx.strokeRect(22, 22, 980, 468);
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 5;
    const c = 56;
    const corners = [
      [22, 22, 1, 1],
      [1002, 22, -1, 1],
      [22, 490, 1, -1],
      [1002, 490, -1, -1],
    ];
    corners.forEach(([x, y, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(x + sx * c, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + sy * c);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    if (icon) drawIcon(ctx, icon, 70, 150, 220, accent);

    ctx.fillStyle = accent;
    ctx.font = '800 54px "Be Vietnam Pro", sans-serif';
    ctx.fillText(title, icon ? 320 : 70, 120);
    ctx.fillStyle = 'rgba(220, 250, 255, 0.86)';
    ctx.font = '400 28px "Be Vietnam Pro", sans-serif';
    lines.forEach((line, i) => {
      ctx.fillText(line, icon ? 320 : 70, 190 + i * 44);
    });
    if (footer) {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.7;
      ctx.font = '600 22px "Orbitron", sans-serif';
      ctx.fillText(footer, icon ? 320 : 70, 452);
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.1 + Math.random() * 0.25;
      ctx.fillRect(800 + i * 20, 430 - Math.random() * 120, 8, 10 + Math.random() * 80);
      ctx.globalAlpha = 1;
    }
    return toTexture(canvas);
  });
}

export function screenTexture({ title = '', subtitle = '', rows = [], accent = '#6ff0ff', theme = null } = {}) {
  const key = `screen-${title}-${accent}-${theme}-${rows.length}-${rows[0] || ''}`;
  return cached(key, () => {
    const canvas = createCanvas(1024, 512);
    const ctx = canvas.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, 1024, 512);
    bg.addColorStop(0, 'rgba(3, 16, 28, 0.92)');
    bg.addColorStop(1, 'rgba(5, 30, 44, 0.78)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1024, 512);

    if (theme) drawIcon(ctx, theme, 40, 130, 300, accent, 0.24);

    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 80 + i * 70);
      ctx.lineTo(1024, 80 + i * 70);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = accent;
    ctx.font = '800 64px "Be Vietnam Pro", sans-serif';
    ctx.fillText(title, 54, 118);
    ctx.fillStyle = 'rgba(230, 252, 255, 0.85)';
    ctx.font = '400 30px "Be Vietnam Pro", sans-serif';
    ctx.fillText(subtitle, 56, 172);
    ctx.font = '500 24px "Be Vietnam Pro", sans-serif';
    rows.forEach((row, i) => {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(220, 250, 255, 0.9)' : 'rgba(150, 230, 255, 0.8)';
      ctx.fillText(row, 56, 250 + i * 46);
    });
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(54, 456, 220 + Math.random() * 200, 5);
    ctx.globalAlpha = 0.35;
    ctx.fillRect(54, 476, 300, 3);
    ctx.globalAlpha = 1;
    return toTexture(canvas);
  });
}

function drawIcon(ctx, icon, x, y, size, accent, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 8;
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size / 100;
  ctx.scale(s, s);
  switch (icon) {
    case 'city':
      ctx.strokeRect(6, 40, 22, 52);
      ctx.strokeRect(34, 20, 26, 72);
      ctx.strokeRect(66, 34, 28, 58);
      ctx.beginPath();
      ctx.moveTo(0, 92);
      ctx.lineTo(100, 92);
      ctx.stroke();
      [-4, 10, 32, 46, 58].forEach(() => {});
      ctx.fillRect(12, 48, 6, 6);
      ctx.fillRect(42, 30, 6, 6);
      ctx.fillRect(56, 48, 6, 6);
      ctx.fillRect(76, 44, 6, 6);
      break;
    case 'tech':
      ctx.beginPath();
      ctx.arc(50, 50, 26, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(50 + Math.cos(a) * 26, 50 + Math.sin(a) * 26);
        ctx.lineTo(50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(50, 50, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'nature':
      ctx.beginPath();
      ctx.moveTo(8, 66);
      ctx.bezierCurveTo(28, 38, 44, 80, 62, 56);
      ctx.bezierCurveTo(78, 36, 88, 58, 96, 48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, 82);
      ctx.bezierCurveTo(30, 62, 52, 94, 78, 72);
      ctx.bezierCurveTo(88, 64, 94, 72, 98, 68);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(56, 42);
      ctx.bezierCurveTo(36, 20, 60, 6, 74, 16);
      ctx.bezierCurveTo(88, 27, 76, 44, 56, 42);
      ctx.stroke();
      break;
    case 'health':
      ctx.fillRect(38, 18, 24, 64);
      ctx.fillRect(18, 38, 64, 24);
      break;
    case 'tourism':
      ctx.beginPath();
      ctx.moveTo(10, 64);
      ctx.lineTo(90, 64);
      ctx.lineTo(68, 84);
      ctx.lineTo(32, 84);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(38, 64);
      ctx.lineTo(44, 26);
      ctx.lineTo(58, 26);
      ctx.lineTo(64, 64);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, 90);
      ctx.lineTo(92, 90);
      ctx.stroke();
      break;
    case 'fishing':
      ctx.beginPath();
      ctx.ellipse(46, 52, 30, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(76, 52);
      ctx.lineTo(94, 38);
      ctx.lineTo(94, 66);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(34, 48, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'mining':
      ctx.beginPath();
      ctx.moveTo(16, 84);
      ctx.lineTo(50, 22);
      ctx.lineTo(84, 84);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(30, 84);
      ctx.lineTo(70, 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(50, 22);
      ctx.lineTo(34, 8);
      ctx.moveTo(50, 22);
      ctx.lineTo(66, 8);
      ctx.stroke();
      break;
    case 'education':
      ctx.beginPath();
      ctx.moveTo(10, 30);
      ctx.lineTo(50, 14);
      ctx.lineTo(90, 30);
      ctx.lineTo(50, 46);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(24, 38);
      ctx.lineTo(24, 66);
      ctx.quadraticCurveTo(50, 84, 76, 66);
      ctx.lineTo(76, 38);
      ctx.stroke();
      break;
    case 'people':
      ctx.beginPath();
      ctx.arc(34, 30, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(68, 36, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, 88);
      ctx.quadraticCurveTo(34, 52, 54, 88);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(54, 88);
      ctx.quadraticCurveTo(68, 62, 84, 88);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(50, 50, 32, 0, Math.PI * 2);
      ctx.stroke();
  }
  ctx.restore();
}

export function themeTexture(theme) {
  const themes = {
    technology: { title: 'TECHNOLOGY', lines: ['AI City Management', 'Autonomous Transport', '100% Clean Energy'], icon: 'tech', accent: '#6ff0ff' },
    environment: { title: 'ENVIRONMENT', lines: ['Protected Oceans & Forests', 'Clean Water via Technology', 'Biodiversity Restored'], icon: 'nature', accent: '#79f2d0' },
    health: { title: 'HEALTH', lines: ['AI Diagnosis', 'Smart Medical Robot', 'Public Care for All'], icon: 'health', accent: '#9fe8ff' },
    tourism: { title: 'TOURISM', lines: ['World Heritage Sites', 'Sustainable Tourism', 'Distinctive Culture'], icon: 'tourism', accent: '#ffd77a' },
    fishing: { title: 'FISHING', lines: ['Peaceful Ocean', 'Modern Fishing Boats', 'Content Fishermen'], icon: 'fishing', accent: '#5ed9c7' },
    mining: { title: 'HISTORY', lines: ['Mining Industry Pride', 'Generations of Workers', 'Never Forgotten'], icon: 'mining', accent: '#d9a45b' },
    city: { title: 'QUẢNG NINH 2076', lines: ['Green · Smart · Beautiful', 'A Livable City', 'The Future Starts Today'], icon: 'city', accent: '#6ff0ff' },
    education: { title: 'EDUCATION', lines: ['Hologram Learning', 'Personal AI Assistant', 'Unlimited Creativity'], icon: 'education', accent: '#86b8ff' },
    people: { title: 'PEOPLE', lines: ['Human at Center', 'Opportunities for All', 'Unity and Harmony'], icon: 'people', accent: '#ffd77a' },
  };
  const t = themes[theme] || themes.city;
  return screenTexture({ title: t.title, subtitle: 'QUẢNG NINH 2076', rows: t.lines, accent: t.accent, theme: t.icon });
}

export function bigTitleTexture(text, sub = '', accent = '#8ff6ff') {
  const key = `bigtitle-${text}-${sub}-${accent}`;
  return cached(key, () => {
    const canvas = createCanvas(1024, 256);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 256);
    ctx.textAlign = 'center';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 74px "Be Vietnam Pro", sans-serif';
    ctx.fillText(text, 512, 116);
    ctx.shadowBlur = 8;
    ctx.fillStyle = accent;
    ctx.font = '500 27px "Be Vietnam Pro", sans-serif';
    if (sub) ctx.fillText(sub, 512, 172);
    ctx.fillStyle = accent;
    ctx.fillRect(312, 200, 400, 3);
    return toTexture(canvas);
  });
}

export function fakeShadowTexture() {
  return cached('fake-shadow', () => {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.28)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return toTexture(canvas);
  });
}
