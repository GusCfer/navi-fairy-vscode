(function () {
  const vscode = acquireVsCodeApi();
  const { BODY, UPPER, LOWER, ZZZ, PALETTES, BODY_SIZE } = window.FAIRY;

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const bubble = document.getElementById('bubble');

  const FRASES = [
    'Ei! Olha aqui! ✨',
    'Bora codar!',
    'Já fez commit hoje?',
    'Beba água! 💧',
    'Esse código tá ficando lindo ✨',
    'Hmm... e os testes? 🤔',
    'Descansa os olhos um pouquinho 👀',
    'Respira fundo. Você consegue!',
    'Lembrou de dar git pull?',
    'console.log não é debugger, hein 😅',
    'Que tal uma pausa pro café? ☕',
    'Nomes de variável bons salvam vidas!',
  ];

  let scale = 3;
  let W = 0, H = 0; // resolução lógica (em "pixels" de pixel art)
  let paletteName = 'azul';
  let diagAlert = false; // arquivo aberto com erros
  let errorUntil = 0;    // vermelha até esse instante
  let shakeUntil = 0;    // balançando até esse instante
  let baseColor = 'azul';
  let dicas = true;

  const fairy = {
    x: 40, y: 30, vx: 0, vy: 0,
    tx: 40, ty: 30,
    nextTarget: 0,
    mode: 'wander', // wander | follow | spin | sleep
    spinT: 0, spinCx: 0, spinCy: 0,
  };
  const mouse = { x: 0, y: 0, inside: false, lastMove: 0 };
  let particles = [];
  let tick = 0;
  let lastActivity = performance.now();
  let bubbleTimer = 0;
  let nextTip = performance.now() + rand(20000, 45000);
  let frase = 'Ei! Escuta aqui!';

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---------- tamanho ----------
  function resize() {
    const r = document.body.getBoundingClientRect();
    W = Math.max(20, Math.floor(r.width / scale));
    H = Math.max(20, Math.floor(r.height / scale));
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;
    fairy.x = Math.min(Math.max(fairy.x, 10), W - 10);
    fairy.y = Math.min(Math.max(fairy.y, 10), H - 10);
    newTarget();
  }
  new ResizeObserver(resize).observe(document.body);

  function newTarget() {
    const m = 12;
    fairy.tx = rand(m, Math.max(m + 1, W - m));
    fairy.ty = rand(m, Math.max(m + 1, H - m));
    fairy.nextTarget = performance.now() + rand(2500, 6000);
  }

  // ---------- balão de fala ----------
  function say(text, ms = 3500) {
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
    placeBubble();
  }
  function placeBubble() {
    if (!bubble.classList.contains('show')) return;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    const vw = document.body.clientWidth, vh = document.body.clientHeight;
    let left = fairy.x * scale + 18;
    let top = fairy.y * scale - bh - 14;
    if (left + bw > vw - 4) left = fairy.x * scale - bw - 18;
    if (left < 4) left = 4;
    if (top < 4) top = fairy.y * scale + 18;
    if (top + bh > vh - 4) top = vh - bh - 4;
    bubble.style.left = left + 'px';
    bubble.style.top = top + 'px';
  }

  // ---------- ações ----------
  function wake() {
    lastActivity = performance.now();
    if (fairy.mode === 'sleep') {
      fairy.mode = 'wander';
      fairy.vy = -1.5;
      say('Hã?! Tô acordada! 😳', 2000);
      newTarget();
    }
  }
  function spin(ms = 1200) {
    fairy.mode = 'spin';
    fairy.spinT = performance.now() + ms;
    fairy.spinCx = fairy.x;
    fairy.spinCy = fairy.y;
    for (let i = 0; i < 14; i++) burst(fairy.x, fairy.y);
  }
  function setPalette(name) {
    paletteName = name;
    const c = PALETTES[name].glow;
    document.body.style.setProperty('--fada-cor', `rgb(${c[0]},${c[1]},${c[2]})`);
  }

  // ---------- partículas ----------
  function trail() {
    particles.push({
      x: fairy.x + rand(-2, 2), y: fairy.y + rand(-2, 2),
      vx: rand(-0.15, 0.15) - fairy.vx * 0.15, vy: rand(-0.05, 0.25),
      life: rand(25, 50), max: 50, big: Math.random() < 0.12,
    });
  }
  function burst(x, y) {
    const a = rand(0, Math.PI * 2), s = rand(0.4, 1.4);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(25, 45), max: 45, big: Math.random() < 0.4 });
  }

  // ---------- eventos do mouse ----------
  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  }
  canvas.addEventListener('mousemove', (e) => {
    const p = toLogical(e);
    mouse.x = p.x; mouse.y = p.y; mouse.inside = true; mouse.lastMove = performance.now();
  });
  canvas.addEventListener('mouseleave', () => { mouse.inside = false; });
  canvas.addEventListener('click', (e) => {
    const p = toLogical(e);
    if (fairy.mode === 'sleep') { wake(); return; }
    lastActivity = performance.now();
    if (Math.hypot(p.x - fairy.x, p.y - fairy.y) < 8) {
      spin();
      say(frase);
    } else {
      fairy.mode = 'wander';
      fairy.tx = p.x; fairy.ty = p.y;
      fairy.nextTarget = performance.now() + 4000;
      for (let i = 0; i < 6; i++) burst(p.x, p.y);
    }
  });

  // ---------- mensagens da extensão ----------
  window.addEventListener('message', (ev) => {
    const m = ev.data;
    switch (m.type) {
      case 'config':
        baseColor = m.cor in PALETTES ? m.cor : 'azul';
        dicas = m.dicas;
        if (m.frase && m.frase.trim()) frase = m.frase.trim();
        if (m.tamanho !== scale) { scale = m.tamanho; resize(); }
        break;
      case 'hello':
        wake(); spin(); say('Oi! Tô aqui! ✨');
        break;
      case 'save':
        wake(); spin(800); say(pick(['Salvo! ✨', 'Arquivo salvo! 💾', 'Prontinho, salvo!']), 2000);
        break;
      case 'runError': {
        wake();
        const now = performance.now();
        errorUntil = now + 6000;
        shakeUntil = now + 1600;
        fairy.vx = 0; fairy.vy = 0;
        setPalette('erro');
        for (let i = 0; i < 18; i++) burst(fairy.x, fairy.y);
        say(m.text || 'Deu erro! 😱', 4500);
        break;
      }
      case 'activity':
        wake();
        break;
      case 'diagnostics':
        if (m.errors > 0) {
          diagAlert = true;
          if (!m.silent) {
            wake();
            say(`Cuidado! ${m.errors} erro${m.errors > 1 ? 's' : ''} em ${m.file} ⚠️`, 4000);
          }
        } else {
          diagAlert = false;
          if (m.fixed) { wake(); spin(); say('Erros resolvidos! 🎉'); }
        }
        break;
    }
  });

  // ---------- desenho ----------
  function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }
  function drawRows(rows, ox, oy, colors, mirror) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        const col = colors[ch];
        if (!col) continue;
        const x = mirror ? ox + (BODY_SIZE - 1) - c : ox + c;
        px(x, oy + r, col);
      }
    }
  }
  function drawWing(frame, bx, by, colors) {
    // esquerda
    drawRows(frame.rows, bx + frame.dx, by + frame.dy, colors, false);
    // direita espelhada: coluna c -> BODY_SIZE-1-(dx+c)
    drawRows(frame.rows, bx - frame.dx, by + frame.dy, colors, true);
  }

  function drawGlow(cx, cy, radius, strength, rgb) {
    const R = Math.ceil(radius);
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const d = Math.hypot(dx, dy);
        if (d > radius) continue;
        let a = strength * Math.pow(1 - d / radius, 1.6);
        a = Math.round(a / 0.07) * 0.07; // degraus, estilo pixel art
        if (a <= 0) continue;
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    const wanted = now < errorUntil ? 'erro' : diagAlert ? 'alerta' : baseColor;
    if (wanted !== paletteName) setPalette(wanted);
    const pal = PALETTES[paletteName];
    const rgb = pal.glow;
    const sleeping = fairy.mode === 'sleep';

    // partículas
    for (const p of particles) {
      const a = Math.max(0, p.life / p.max);
      const flicker = (tick + p.x * 7) % 6 < 3 ? 1 : 0.6;
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * flicker})`;
      const x = Math.round(p.x), y = Math.round(p.y);
      ctx.fillRect(x, y, 1, 1);
      if (p.big && a > 0.4) {
        ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
        ctx.fillRect(x, y, 1, 1);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a * 0.7})`;
        ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1);
      }
    }

    const bob = sleeping ? Math.sin(now / 900) * 0.6 : Math.sin(now / 260) * 1.6;
    let shake = 0;
    if (now < shakeUntil) {
      const k = (shakeUntil - now) / 1600; // diminui com o tempo
      shake = (tick % 4 < 2 ? -1 : 1) * Math.ceil(3 * k);
    }
    const cx = Math.round(fairy.x) + shake;
    const cy = Math.round(fairy.y + bob);
    const half = (BODY_SIZE - 1) / 2;
    const bx = cx - half, by = cy - half;

    // brilho pulsante
    const pulse = sleeping ? 0.5 : 1 + Math.sin(now / 180) * 0.12;
    drawGlow(cx, cy, 11 * pulse, sleeping ? 0.25 : 0.42, rgb);

    // asas
    const wingColors = {
      L: `rgba(220,245,255,${sleeping ? 0.4 : 0.85})`,
      l: `rgba(${Math.min(255, rgb[0] + 120)},${Math.min(255, rgb[1] + 60)},255,${sleeping ? 0.25 : 0.6})`,
    };
    const flapSpeed = sleeping ? 14 : 3;
    const seq = [0, 1, 2, 1];
    const f = seq[Math.floor(tick / flapSpeed) % seq.length];
    drawWing(LOWER[f === 2 ? 0 : 1], bx, by, wingColors);
    drawWing(UPPER[f], bx, by, wingColors);

    // corpo
    const bodyColors = sleeping ? { W: '#dfe7ee', C: pal.C, B: pal.B } : { W: pal.W, C: pal.C, B: pal.B };
    drawRows(BODY, bx, by, bodyColors, false);

    // brilho cintilante no núcleo
    if (!sleeping && tick % 40 < 4) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(cx, cy - 5, 1, 1);
      ctx.fillRect(cx, cy + 5, 1, 1);
      ctx.fillRect(cx - 5, cy, 1, 1);
      ctx.fillRect(cx + 5, cy, 1, 1);
    }

    // zzz
    if (sleeping) {
      const t = (now / 1800) % 1;
      const zx = cx + 6 + Math.round(t * 4);
      const zy = cy - 8 - Math.round(t * 8);
      drawRows(ZZZ, zx, zy, { Z: `rgba(220,235,255,${1 - t})` }, false);
    }
  }

  // ---------- lógica ----------
  function update(now) {
    tick++;

    // dormir depois de 2 minutos sem atividade
    if (fairy.mode !== 'sleep' && fairy.mode !== 'spin' && now - lastActivity > 120000 && !mouse.inside) {
      fairy.mode = 'sleep';
      bubble.classList.remove('show');
    }

    if (dicas && fairy.mode !== 'sleep' && now > nextTip) {
      say(frase);
      nextTip = now + rand(45000, 120000);
    }

    let tx = fairy.tx, ty = fairy.ty;
    let accel = 0.004, maxSpeed = 1.1, damping = 0.94;

    if (fairy.mode === 'spin') {
      const left = fairy.spinT - now;
      if (left <= 0) {
        fairy.mode = 'wander';
      } else {
        const a = now / 90;
        tx = fairy.spinCx + Math.cos(a) * 9;
        ty = fairy.spinCy + Math.sin(a) * 6;
        accel = 0.08; maxSpeed = 3; damping = 0.8;
      }
    } else if (fairy.mode === 'sleep') {
      tx = Math.min(Math.max(fairy.x, 12), W - 12);
      ty = H - 9;
      accel = 0.002; maxSpeed = 0.3;
    } else if (mouse.inside && now - mouse.lastMove < 2000) {
      // orbita o cursor
      const a = now / 600;
      tx = mouse.x + Math.cos(a) * 12;
      ty = mouse.y + Math.sin(a) * 7;
      accel = 0.01; maxSpeed = 1.8;
      lastActivity = now;
    } else {
      if (now > fairy.nextTarget || Math.hypot(fairy.tx - fairy.x, fairy.ty - fairy.y) < 3) newTarget();
      // pequenas voltinhas aleatórias
      tx += Math.sin(now / 700) * 4;
      ty += Math.cos(now / 900) * 3;
    }

    fairy.vx = (fairy.vx + (tx - fairy.x) * accel) * damping;
    fairy.vy = (fairy.vy + (ty - fairy.y) * accel) * damping;
    const sp = Math.hypot(fairy.vx, fairy.vy);
    if (sp > maxSpeed) { fairy.vx *= maxSpeed / sp; fairy.vy *= maxSpeed / sp; }
    fairy.x += fairy.vx;
    fairy.y += fairy.vy;
    fairy.x = Math.min(Math.max(fairy.x, 8), W - 8);
    fairy.y = Math.min(Math.max(fairy.y, 8), H - 6);

    // rastro
    if (fairy.mode !== 'sleep' && (tick % 3 === 0 || sp > 1)) trail();
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.life--;
    }
    particles = particles.filter((p) => p.life > 0);
  }

  let last = 0;
  function loop(now) {
    // ~60fps fixo para animação consistente
    if (now - last >= 16) {
      last = now;
      update(now);
      draw(now);
      placeBubble();
    }
    requestAnimationFrame(loop);
  }

  setPalette('azul');
  resize();
  requestAnimationFrame(loop);
  vscode.postMessage({ type: 'ready' });
})();
