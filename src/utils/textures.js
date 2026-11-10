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
    // Stylized wall map based on the supplied reference, not a boundary dataset.
    ctx.fillStyle = '#f5f3eb'; ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#b9ddf3';
    ctx.beginPath(); ctx.moveTo(0, 300); ctx.bezierCurveTo(200, 270, 270, 330, 430, 294);
    ctx.bezierCurveTo(610, 252, 760, 309, 1024, 220); ctx.lineTo(1024, 512); ctx.lineTo(0, 512); ctx.fill();
    ctx.fillStyle = '#e9e6d8'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1024, 0); ctx.lineTo(1024, 154);
    ctx.bezierCurveTo(820, 180, 718, 151, 584, 184); ctx.bezierCurveTo(402, 226, 304, 173, 182, 208);
    ctx.bezierCurveTo(100, 232, 48, 214, 0, 244); ctx.fill();

    const province = new Path2D();
    province.moveTo(94,169); province.lineTo(155,124); province.lineTo(245,137); province.lineTo(292,100);
    province.lineTo(375,115); province.lineTo(435,83); province.lineTo(519,111); province.lineTo(590,91);
    province.lineTo(671,116); province.lineTo(754,100); province.lineTo(836,126); province.lineTo(891,158);
    province.lineTo(866,196); province.lineTo(814,204); province.lineTo(790,240); province.lineTo(741,245);
    province.lineTo(715,276); province.lineTo(672,268); province.lineTo(648,306); province.lineTo(611,295);
    province.lineTo(589,334); province.lineTo(547,322); province.lineTo(516,359); province.lineTo(478,343);
    province.lineTo(450,380); province.lineTo(412,365); province.lineTo(376,390); province.lineTo(335,364);
    province.lineTo(293,377); province.lineTo(258,347); province.lineTo(216,351); province.lineTo(190,320);
    province.lineTo(145,319); province.lineTo(120,285); province.lineTo(84,274); province.lineTo(108,239);
    province.lineTo(78,216); province.closePath();
    ctx.save(); ctx.clip(province); ctx.fillStyle='#d9d9ba'; ctx.fill(province);
    const regions = [
      ['#eabd69',[[55,205],[85,165],[173,144],[217,183],[206,252],[143,278],[75,259]]],
      ['#70c9df',[[174,141],[264,131],[302,180],[285,245],[207,261],[217,183]]],
      ['#43b7d1',[[207,261],[285,245],[326,280],[306,337],[257,346],[215,321],[143,278]]],
      ['#5eae91',[[285,131],[381,110],[414,155],[391,216],[326,230],[302,180]]],
      ['#8fc572',[[285,245],[326,230],[391,216],[414,265],[374,316],[306,337],[326,280]]],
      ['#e79b84',[[381,110],[474,93],[508,146],[480,202],[414,206],[391,156]]],
      ['#f18c78',[[391,216],[414,206],[480,202],[499,258],[458,303],[414,315],[374,316],[414,265]]],
      ['#e7c467',[[474,93],[560,99],[585,147],[547,188],[508,146]]],
      ['#bf9bc7',[[560,99],[650,108],[681,151],[634,193],[585,147]]],
      ['#a59bce',[[650,108],[749,99],[802,129],[786,177],[727,191],[681,151]]],
      ['#8b82c2',[[749,99],[865,132],[911,162],[866,202],[814,204],[786,177],[802,129]]],
      ['#e9ad76',[[480,202],[508,146],[547,188],[585,147],[634,193],[611,236],[566,245],[544,283],[499,258]]],
      ['#71b8cf',[[634,193],[681,151],[727,191],[715,245],[672,268],[611,236]]],
      ['#d0a778',[[727,191],[786,177],[814,204],[790,240],[741,245],[715,276],[672,268],[715,245]]],
    ];
    regions.forEach(([color,points]) => {
      ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
      ctx.fillStyle=color; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=3; ctx.stroke();
    });
    const roads=[[[104,236],[208,225],[313,239],[407,225],[513,228],[616,207],[740,190],[852,164]],[[188,159],[234,226],[274,303],[348,350],[420,340],[496,301],[552,249],[609,188],[665,132]],[[331,121],[364,180],[407,227],[454,282],[485,338]],[[536,112],[552,175],[585,218],[631,266]]];
    roads.forEach((points,i)=>{ctx.beginPath();points.forEach(([x,y],n)=>n?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineCap='round';ctx.strokeStyle='#fff9ed';ctx.lineWidth=i?4:7;ctx.stroke();ctx.strokeStyle='rgba(201,157,103,.55)';ctx.lineWidth=1.2;ctx.stroke();});
    ctx.restore(); ctx.strokeStyle='#80685c'; ctx.lineWidth=5; ctx.stroke(province); ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.lineWidth=1.5; ctx.stroke(province);

    const islands=[[477,391,15,7],[501,407,12,6],[527,393,10,5],[552,418,16,7],[582,399,11,5],[609,424,13,6],[643,402,9,5],[676,421,12,5],[710,394,8,4],[742,414,10,5],[780,383,8,4],[825,357,7,4],[856,330,6,4],[452,414,7,4],[625,447,8,4],[690,452,7,4]];
    islands.forEach(([x,y,rx,ry])=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,-.3,0,Math.PI*2);ctx.fillStyle='#83b8a2';ctx.fill();ctx.strokeStyle='#668b80';ctx.lineWidth=1.4;ctx.stroke();});
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const places=[['ĐÔNG TRIỀU',161,216],['UÔNG BÍ',263,205],['QUẢNG YÊN',249,303],['HẠ LONG',355,278],['CẨM PHẢ',462,240],['VÂN ĐỒN',579,281],['TIÊN YÊN',567,170],['ĐẦM HÀ',658,148],['HẢI HÀ',739,154],['MÓNG CÁI',825,166]];
    places.forEach(([name,x,y],i)=>{ctx.beginPath();ctx.arc(x,y,i===3?6:4,0,Math.PI*2);ctx.fillStyle=i===3?'#c94f45':'#72574b';ctx.fill();ctx.font=`${i===3?'700':'600'} ${i===3?16:13}px "Be Vietnam Pro", sans-serif`;ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.94)';ctx.strokeText(name,x,y-13);ctx.fillStyle='#3f4b4c';ctx.fillText(name,x,y-13);});
    ctx.font='italic 18px "Be Vietnam Pro", sans-serif';ctx.fillStyle='#39789a';ctx.fillText('VỊNH HẠ LONG',482,469);ctx.fillText('VỊNH BÁI TỬ LONG',722,346);
    ctx.textAlign='left';ctx.font='500 14px "Be Vietnam Pro", sans-serif';ctx.fillStyle='#697579';ctx.fillText('HẢI PHÒNG',58,344);ctx.fillText('HẢI DƯƠNG',54,294);ctx.fillText('LẠNG SƠN',862,92);ctx.fillText('TRUNG QUỐC',886,218);
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillRect(18,18,988,56);ctx.fillStyle='#173e52';ctx.font='700 25px "Be Vietnam Pro", sans-serif';ctx.fillText('QUẢNG NINH',36,46);ctx.fillStyle='#52717c';ctx.font='500 14px "Be Vietnam Pro", sans-serif';ctx.fillText('BẢN ĐỒ VỊNH HẠ LONG · 2026',36,65);
    ctx.textAlign='right';ctx.fillStyle='#173e52';ctx.font='700 20px sans-serif';ctx.fillText('N',974,102);ctx.beginPath();ctx.moveTo(974,110);ctx.lineTo(966,132);ctx.lineTo(974,127);ctx.lineTo(982,132);ctx.closePath();ctx.fill();
    ctx.textAlign='left';ctx.fillStyle='#536a70';ctx.font='500 12px "Be Vietnam Pro", sans-serif';ctx.fillText('SƠ ĐỒ MINH HỌA',36,492);ctx.strokeStyle='#465e62';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(891,481);ctx.lineTo(961,481);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(891,475);ctx.lineTo(891,487);ctx.moveTo(961,475);ctx.lineTo(961,487);ctx.stroke();ctx.fillText('0',889,500);ctx.fillText('10 km',951,500);
    ctx.strokeStyle='rgba(65,83,86,.45)';ctx.lineWidth=2;ctx.strokeRect(8,8,1008,496);
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
