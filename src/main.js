// Web Audio Synthesizer (Romantic Music Box + Sound FX)
let audioCtx = null;
let isPlayingMusic = false;
let melodyTimer = null;

const birthdayNotes = [
  { f: 523.25, d: 350 }, { f: 523.25, d: 350 }, { f: 587.33, d: 600 },
  { f: 523.25, d: 600 }, { f: 698.46, d: 600 }, { f: 659.25, d: 1000 },
  { f: 523.25, d: 350 }, { f: 523.25, d: 350 }, { f: 587.33, d: 600 },
  { f: 523.25, d: 600 }, { f: 783.99, d: 600 }, { f: 698.46, d: 1000 },
  { f: 523.25, d: 350 }, { f: 523.25, d: 350 }, { f: 1046.50, d: 600 },
  { f: 880.00, d: 600 }, { f: 698.46, d: 600 }, { f: 659.25, d: 600 },
  { f: 587.33, d: 900 }, { f: 932.33, d: 350 }, { f: 932.33, d: 350 },
  { f: 880.00, d: 600 }, { f: 698.46, d: 600 }, { f: 783.99, d: 600 },
  { f: 698.46, d: 1200 }
];
let noteIndex = 0;

function ensureAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChimeNote(freq, durationMs, vol = 0.075) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(vol, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.05);
}

function playPopSound(pitch = 660) {
  ensureAudio();
  playChimeNote(pitch, 180, 0.09);
}

function scheduleNextMelodyNote() {
  if (!isPlayingMusic) return;
  const item = birthdayNotes[noteIndex];
  playChimeNote(item.f, item.d * 0.95, 0.065);
  noteIndex = (noteIndex + 1) % birthdayNotes.length;
  melodyTimer = setTimeout(scheduleNextMelodyNote, item.d);
}

function startMusic() {
  ensureAudio();
  if (isPlayingMusic) return;
  isPlayingMusic = true;
  const soundLabel = document.getElementById('soundLabel');
  if (soundLabel) soundLabel.textContent = 'ON';
  if (melodyTimer) clearTimeout(melodyTimer);
  scheduleNextMelodyNote();
}

function stopMusic() {
  isPlayingMusic = false;
  if (melodyTimer) clearTimeout(melodyTimer);
  const soundLabel = document.getElementById('soundLabel');
  if (soundLabel) soundLabel.textContent = 'MUTED';
}

// Particle & Stardust Canvas Engine
const canvas = document.getElementById('sparkleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let ambientStars = [];
const palette = ['#ff2a85', '#ffd166', '#00f5d4', '#c77dff', '#ffffff'];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initAmbientStars();
}

function initAmbientStars() {
  if (!canvas) return;
  ambientStars = [];
  const count = Math.min(32, Math.floor((canvas.width * canvas.height) / 18000));
  for (let i = 0; i < count; i++) {
    ambientStars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.6,
      alpha: Math.random(),
      speed: Math.random() * 0.016 + 0.005,
      vy: -(Math.random() * 0.2 + 0.05),
      color: palette[Math.floor(Math.random() * palette.length)]
    });
  }
}

function spawnBurst(x, y, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.2 + 1.1;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.1,
      size: Math.random() * 5.5 + 3.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: 1,
      decay: Math.random() * 0.018 + 0.012,
      isHeart: Math.random() > 0.45
    });
  }
}

function drawVectorHeart(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.beginPath();
  const s = size * 0.58;
  ctx.moveTo(0, s * 0.4);
  ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.4);
  ctx.bezierCurveTo(-s, s * 0.9, 0, s * 1.2, 0, s * 1.6);
  ctx.bezierCurveTo(0, s * 1.2, s, s * 0.9, s, s * 0.4);
  ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.4);
  ctx.fill();
  ctx.restore();
}

function drawFourPointStar(ctx, x, y, r, color, alpha) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.lineTo(Math.cos((i * Math.PI) / 2) * r * 2.4, Math.sin((i * Math.PI) / 2) * r * 2.4);
    ctx.lineTo(
      Math.cos(((i + 0.5) * Math.PI) / 2) * r * 0.5,
      Math.sin(((i + 0.5) * Math.PI) / 2) * r * 0.5
    );
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function animateParticles() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < ambientStars.length; i++) {
    const s = ambientStars[i];
    s.alpha += s.speed;
    if (s.alpha > 1 || s.alpha < 0.15) s.speed = -s.speed;
    s.y += s.vy;
    if (s.y < -10) s.y = canvas.height + 10;
    drawFourPointStar(ctx, s.x, s.y, s.r, s.color, Math.abs(s.alpha));
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.065;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }

    if (p.isHeart) {
      drawVectorHeart(ctx, p.x, p.y, p.size, p.color, p.alpha);
    } else {
      drawFourPointStar(ctx, p.x, p.y, p.size * 0.45, p.color, p.alpha);
    }
  }

  requestAnimationFrame(animateParticles);
}

// Attach Event Listeners when DOM is Ready
window.addEventListener('DOMContentLoaded', () => {
  if (canvas) {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(animateParticles);
  }

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (isPlayingMusic) stopMusic();
      else startMusic();
    });
  }

  window.addEventListener('pointerdown', (e) => {
    spawnBurst(e.clientX, e.clientY, 8);
  });

  const sparkleBurstBtn = document.getElementById('sparkleBurstBtn');
  if (sparkleBurstBtn) {
    sparkleBurstBtn.addEventListener('click', () => {
      playPopSound(880);
      spawnBurst(window.innerWidth * 0.5, window.innerHeight * 0.35, 30);
    });
  }

  // Intro Transition
  const introOverlay = document.getElementById('introOverlay');
  const openGiftBtn = document.getElementById('openGiftBtn');
  if (openGiftBtn && introOverlay) {
    openGiftBtn.addEventListener('click', () => {
      startMusic();
      spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 38);
      introOverlay.style.opacity = '0';
      introOverlay.style.transform = 'scale(1.06)';
      introOverlay.style.pointerEvents = 'none';
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 700);
    });
  }

  // Kinetic Vector Artwork I (Celestial Orbit)
  let orbitFast = false;
  let orbitPhase = 0;
  const vectorCard1 = document.getElementById('vectorCard1');
  const card1Badge = document.getElementById('card1Badge');
  const planetAnh = document.getElementById('planetAnh');
  const planetAnhCore = document.getElementById('planetAnhCore');
  const planetAnhHalo = document.getElementById('planetAnhHalo');
  const planetEm = document.getElementById('planetEm');
  const planetEmHalo = document.getElementById('planetEmHalo');
  const cometTailAnh = document.getElementById('cometTailAnh');
  const cometTailEm = document.getElementById('cometTailEm');
  const orbitTelemetry = document.getElementById('orbitTelemetry');

  function getTiltedEllipsePoint(cx, cy, rx, ry, tiltDeg, angleRad) {
    const rad = (tiltDeg * Math.PI) / 180;
    const cosT = Math.cos(rad);
    const sinT = Math.sin(rad);
    const ex = rx * Math.cos(angleRad);
    const ey = ry * Math.sin(angleRad);
    return {
      x: cx + ex * cosT - ey * sinT,
      y: cy + ex * sinT + ey * cosT,
      depth: Math.sin(angleRad)
    };
  }

  if (vectorCard1 && card1Badge) {
    vectorCard1.addEventListener('click', (e) => {
      orbitFast = !orbitFast;
      card1Badge.textContent = orbitFast ? 'SIÊU QUỸ ĐẠO • WARP 100%' : 'CHẠM TĂNG TỐC QUỸ ĐẠO';
      playPopSound(orbitFast ? 783.99 : 587.33);
      spawnBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 24);
    });
  }

  // Artwork II: ECG & Spectrum Scanner
  let currentBpm = 128;
  let wavePhase = 0;
  const vectorCard2 = document.getElementById('vectorCard2');
  const bpmCounter = document.getElementById('bpmCounter');
  const ecgPath = document.getElementById('ecgPath');
  const ecgGlowPath = document.getElementById('ecgGlowPath');
  const harmWave1 = document.getElementById('harmWave1');
  const harmWave2 = document.getElementById('harmWave2');
  const harmWave3 = document.getElementById('harmWave3');
  const ecgLaserHead = document.getElementById('ecgLaserHead');
  const ecgPulseRing = document.getElementById('ecgPulseRing');
  const heartPulseBadge = document.getElementById('heartPulseBadge');
  const spectrumBarsGroup = document.getElementById('spectrumBarsGroup');

  const spectrumBars = [];
  if (spectrumBarsGroup) {
    const barCount = 28;
    for (let i = 0; i < barCount; i++) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (12 + i * 10.8).toFixed(1));
      rect.setAttribute('y', '130');
      rect.setAttribute('width', '5');
      rect.setAttribute('height', '20');
      rect.setAttribute('rx', '2.5');
      rect.setAttribute('fill', 'url(#barGrad)');
      spectrumBarsGroup.appendChild(rect);
      spectrumBars.push(rect);
    }
  }

  function evalEcgWave(normX, ampScale) {
    const p = Math.exp(-Math.pow((normX - 0.22) / 0.045, 2)) * -10;
    const q = Math.exp(-Math.pow((normX - 0.36) / 0.018, 2)) * 14;
    const r = Math.exp(-Math.pow((normX - 0.42) / 0.022, 2)) * -54 * ampScale;
    const s = Math.exp(-Math.pow((normX - 0.48) / 0.022, 2)) * 34 * ampScale;
    const t = Math.exp(-Math.pow((normX - 0.70) / 0.065, 2)) * -14;
    return p + q + r + s + t;
  }

  if (vectorCard2 && bpmCounter) {
    vectorCard2.addEventListener('click', (e) => {
      currentBpm = currentBpm >= 184 ? 128 : currentBpm + 14;
      bpmCounter.textContent = currentBpm + ' BPM • TIM ĐẬP VÌ EM';
      playPopSound(659.25 + (currentBpm - 128) * 4);
      spawnBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 24);
    });
  }

  // Artwork III: Sacred Geometry & Infinity
  let soulFused = false;
  let infPhase = 0;
  const vectorCard3 = document.getElementById('vectorCard3');
  const ringAnh = document.getElementById('ringAnh');
  const ringEm = document.getElementById('ringEm');
  const photonAnh = document.getElementById('photonAnh');
  const photonEm = document.getElementById('photonEm');
  const photonTrail1 = document.getElementById('photonTrail1');
  const photonTrail2 = document.getElementById('photonTrail2');
  const promiseBadge = document.getElementById('promiseBadge');

  function getInfinityPoint(t) {
    const x = 160 + 74 * Math.cos(t);
    const y = 85 + 30 * Math.sin(2 * t);
    return { x: x, y: y };
  }

  const trackEl = document.getElementById('infinityTrack');
  const streamEl = document.getElementById('infinityStreamPath');
  if (trackEl && streamEl) {
    let pathStr = '';
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const pt = getInfinityPoint(t);
      pathStr += (i === 0 ? 'M ' : ' L ') + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1);
    }
    pathStr += ' Z';
    trackEl.setAttribute('d', pathStr);
    streamEl.setAttribute('d', pathStr);
  }

  if (vectorCard3) {
    vectorCard3.addEventListener('click', (e) => {
      soulFused = !soulFused;
      if (promiseBadge) {
        promiseBadge.textContent = soulFused ? 'GIAO THOA VĨNH CỬU • ∞' : 'ANH & EM • ∞ VÔ CỰC';
      }
      playPopSound(soulFused ? 987.77 : 880);
      spawnBurst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 26);
    });
  }

  // Master 60FPS Kinetic Artwork Engine
  function animateVectorArtworks() {
    const speed1 = orbitFast ? 0.058 : 0.022;
    orbitPhase += speed1;

    const p1 = getTiltedEllipsePoint(160, 88, 122, 44, -16, orbitPhase);
    const p2 = getTiltedEllipsePoint(160, 88, 94, 34, 20, -orbitPhase * 1.25 + 1.2);

    if (planetAnh && planetEm) {
      const scale1 = 1 + p1.depth * 0.32;
      const scale2 = 1 + p2.depth * 0.28;

      planetAnh.setAttribute('cx', p1.x.toFixed(1));
      planetAnh.setAttribute('cy', p1.y.toFixed(1));
      planetAnh.setAttribute('r', (5.8 * scale1).toFixed(1));
      if (planetAnhCore) {
        planetAnhCore.setAttribute('cx', p1.x.toFixed(1));
        planetAnhCore.setAttribute('cy', p1.y.toFixed(1));
      }
      if (planetAnhHalo) {
        planetAnhHalo.setAttribute('cx', p1.x.toFixed(1));
        planetAnhHalo.setAttribute('cy', p1.y.toFixed(1));
        planetAnhHalo.setAttribute('r', (12.5 * scale1).toFixed(1));
      }

      planetEm.setAttribute('cx', p2.x.toFixed(1));
      planetEm.setAttribute('cy', p2.y.toFixed(1));
      planetEm.setAttribute('r', (5.0 * scale2).toFixed(1));
      const planetEmCore = document.getElementById('planetEmCore');
      if (planetEmCore) {
        planetEmCore.setAttribute('cx', p2.x.toFixed(1));
        planetEmCore.setAttribute('cy', p2.y.toFixed(1));
      }
      if (planetEmHalo) {
        planetEmHalo.setAttribute('cx', p2.x.toFixed(1));
        planetEmHalo.setAttribute('cy', p2.y.toFixed(1));
        planetEmHalo.setAttribute('r', (10 * scale2).toFixed(1));
      }

      const gravRipple1 = document.getElementById('gravRipple1');
      const gravRipple2 = document.getElementById('gravRipple2');
      const sunCoreGlow = document.getElementById('sunCoreGlow');
      if (gravRipple1 && gravRipple2 && sunCoreGlow) {
        const rProg1 = (orbitPhase * 0.45) % 1;
        const rProg2 = ((orbitPhase * 0.45) + 0.5) % 1;
        gravRipple1.setAttribute('r', (16 + rProg1 * 48).toFixed(1));
        gravRipple1.setAttribute('opacity', ((1 - rProg1) * 0.65).toFixed(2));
        gravRipple2.setAttribute('r', (16 + rProg2 * 48).toFixed(1));
        gravRipple2.setAttribute('opacity', ((1 - rProg2) * 0.55).toFixed(2));
        sunCoreGlow.setAttribute('r', (30 + Math.sin(orbitPhase * 2) * 4).toFixed(1));
      }

      let d1 = 'M ' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1);
      let d2 = 'M ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
      for (let k = 1; k <= 8; k++) {
        const tp1 = getTiltedEllipsePoint(160, 88, 122, 44, -16, orbitPhase - k * 0.08);
        const tp2 = getTiltedEllipsePoint(160, 88, 94, 34, 20, -orbitPhase * 1.25 + 1.2 + k * 0.09);
        d1 += ' L ' + tp1.x.toFixed(1) + ' ' + tp1.y.toFixed(1);
        d2 += ' L ' + tp2.x.toFixed(1) + ' ' + tp2.y.toFixed(1);
      }
      if (cometTailAnh) cometTailAnh.setAttribute('d', d1);
      if (cometTailEm) cometTailEm.setAttribute('d', d2);

      if (orbitTelemetry) {
        const deg = Math.floor(((orbitPhase * 180) / Math.PI) % 360);
        orbitTelemetry.textContent = 'LOCK: H.ANH • ' + String(deg).padStart(3, '0') + '°';
      }
    }

    // ECG & Spectrum
    const bpmFactor = currentBpm / 128;
    wavePhase += 0.045 * bpmFactor;

    let hw1 = 'M 0 85';
    let hw2 = 'M 0 85';
    let hw3 = 'M 0 85';
    let ecgD = '';

    const laserX = ((wavePhase * 42) % 300) + 10;
    let laserY = 85;

    for (let x = 6; x <= 314; x += 5) {
      const y1 = 85 + Math.sin(x * 0.032 - wavePhase * 1.6) * 28 * Math.sin(wavePhase * 0.5 + x * 0.01);
      const y2 = 85 + Math.cos(x * 0.042 + wavePhase * 1.3) * 22;
      const y3 = 85 + Math.sin(x * 0.055 - wavePhase * 2.2) * 14;
      hw1 += ' L ' + x + ' ' + y1.toFixed(1);
      hw2 += ' L ' + x + ' ' + y2.toFixed(1);
      hw3 += ' L ' + x + ' ' + y3.toFixed(1);

      const cyclePos = ((x / 150) - wavePhase * 0.38) % 1;
      const normCycle = cyclePos < 0 ? cyclePos + 1 : cyclePos;
      const ey = 85 + evalEcgWave(normCycle, 0.88 + (bpmFactor - 1) * 0.35);

      ecgD += (x === 6 ? 'M ' : ' L ') + x + ' ' + ey.toFixed(1);

      if (Math.abs(x - laserX) < 3) {
        laserY = ey;
      }
    }

    if (harmWave1 && ecgPath && ecgLaserHead) {
      harmWave1.setAttribute('d', hw1);
      if (harmWave2) harmWave2.setAttribute('d', hw2);
      if (harmWave3) harmWave3.setAttribute('d', hw3);
      ecgPath.setAttribute('d', ecgD);
      if (ecgGlowPath) ecgGlowPath.setAttribute('d', ecgD);

      ecgLaserHead.setAttribute('cx', laserX.toFixed(1));
      ecgLaserHead.setAttribute('cy', laserY.toFixed(1));
      if (ecgPulseRing) {
        ecgPulseRing.setAttribute('cx', laserX.toFixed(1));
        ecgPulseRing.setAttribute('cy', laserY.toFixed(1));
        ecgPulseRing.setAttribute('r', (6 + Math.abs(Math.sin(wavePhase * 3)) * 10).toFixed(1));
      }

      if (heartPulseBadge) {
        const heartBeatScale = 1 + Math.pow(Math.max(0, Math.sin(wavePhase * 3.2)), 4) * 0.28;
        heartPulseBadge.setAttribute('transform', 'translate(282, 26) scale(' + heartBeatScale.toFixed(2) + ')');
      }
    }

    for (let i = 0; i < spectrumBars.length; i++) {
      const bh = 8 + Math.abs(Math.sin(wavePhase * 2.4 + i * 0.45)) * 36 * bpmFactor;
      spectrumBars[i].setAttribute('y', (164 - bh).toFixed(1));
      spectrumBars[i].setAttribute('height', bh.toFixed(1));
    }

    // Sacred Geometry
    const infSpeed = soulFused ? 0.065 : 0.032;
    infPhase += infSpeed;

    if (ringAnh && ringEm && photonAnh && photonEm) {
      const spread = soulFused ? 16 + Math.sin(infPhase * 1.5) * 6 : 28 + Math.sin(infPhase) * 7;
      const cxAnh = (160 - spread).toFixed(1);
      const cxEm = (160 + spread).toFixed(1);
      ringAnh.setAttribute('cx', cxAnh);
      ringEm.setAttribute('cx', cxEm);

      const ringAnhOuter = document.getElementById('ringAnhOuter');
      const ringEmOuter = document.getElementById('ringEmOuter');
      const astroGridCircle = document.getElementById('astroGridCircle');
      const degNow = ((infPhase * 35) % 360).toFixed(1);
      if (ringAnhOuter && ringEmOuter) {
        ringAnhOuter.setAttribute('cx', cxAnh);
        ringAnhOuter.setAttribute('transform', 'rotate(' + degNow + ' ' + cxAnh + ' 85)');
        ringEmOuter.setAttribute('cx', cxEm);
        ringEmOuter.setAttribute('transform', 'rotate(-' + degNow + ' ' + cxEm + ' 85)');
      }
      if (astroGridCircle) {
        astroGridCircle.setAttribute('transform', 'rotate(-' + degNow + ' 160 88)');
      }

      const pt1 = getInfinityPoint(infPhase);
      const pt2 = getInfinityPoint(infPhase + Math.PI);

      photonAnh.setAttribute('cx', pt1.x.toFixed(1));
      photonAnh.setAttribute('cy', pt1.y.toFixed(1));
      photonEm.setAttribute('cx', pt2.x.toFixed(1));
      photonEm.setAttribute('cy', pt2.y.toFixed(1));

      let tr1 = 'M ' + pt1.x.toFixed(1) + ' ' + pt1.y.toFixed(1);
      let tr2 = 'M ' + pt2.x.toFixed(1) + ' ' + pt2.y.toFixed(1);
      for (let j = 1; j <= 12; j++) {
        const prev1 = getInfinityPoint(infPhase - j * 0.045);
        const prev2 = getInfinityPoint(infPhase + Math.PI - j * 0.045);
        tr1 += ' L ' + prev1.x.toFixed(1) + ' ' + prev1.y.toFixed(1);
        tr2 += ' L ' + prev2.x.toFixed(1) + ' ' + prev2.y.toFixed(1);
      }
      if (photonTrail1) photonTrail1.setAttribute('d', tr1);
      if (photonTrail2) photonTrail2.setAttribute('d', tr2);

      const vesicaRing1 = document.getElementById('vesicaRing1');
      const vesicaRing2 = document.getElementById('vesicaRing2');
      const vesicaCoreHalo = document.getElementById('vesicaCoreHalo');
      if (vesicaRing1 && vesicaRing2 && vesicaCoreHalo) {
        const vp1 = (infPhase * 0.35) % 1;
        const vp2 = ((infPhase * 0.35) + 0.5) % 1;
        vesicaRing1.setAttribute('r', (14 + vp1 * 46).toFixed(1));
        vesicaRing1.setAttribute('opacity', ((1 - vp1) * 0.65).toFixed(2));
        vesicaRing2.setAttribute('r', (14 + vp2 * 46).toFixed(1));
        vesicaRing2.setAttribute('opacity', ((1 - vp2) * 0.55).toFixed(2));
        vesicaCoreHalo.setAttribute('r', (14 + Math.sin(infPhase * 2.2) * 3.5).toFixed(1));
      }
    }

    requestAnimationFrame(animateVectorArtworks);
  }

  requestAnimationFrame(animateVectorArtworks);

  // Birthday Candle
  let candleLit = true;
  const blowCandleBtn = document.getElementById('blowCandleBtn');
  const candleFlame = document.getElementById('candleFlame');
  const candleAura = document.getElementById('candleAura');
  const candleStatusText = document.getElementById('candleStatusText');

  if (blowCandleBtn) {
    blowCandleBtn.addEventListener('click', () => {
      const rect = blowCandleBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + 35;

      if (candleLit) {
        candleLit = false;
        if (candleFlame) candleFlame.style.opacity = '0';
        if (candleAura) candleAura.style.opacity = '0';
        if (candleStatusText) {
          candleStatusText.innerHTML = '<span class="text-amber-200 font-medium">Điều ước tuổi mới của Hoàng Anh đã bay vào ngân hà!</span> (Chạm lại nếu muốn thắp sáng nến)';
        }
        playPopSound(987.77);
        spawnBurst(cx, cy, 40);
      } else {
        candleLit = true;
        if (candleFlame) candleFlame.style.opacity = '1';
        if (candleAura) candleAura.style.opacity = '1';
        if (candleStatusText) {
          candleStatusText.textContent = 'Ngọn lửa ánh sáng đã bừng lên cho Hoàng Anh rồi.';
        }
        playPopSound(659.25);
        spawnBurst(cx, cy, 20);
      }
    });
  }

  // Smooth Scroll Reveal
  const revealItems = document.querySelectorAll('.reveal-item');
  const scrollProgressBar = document.getElementById('scrollProgressBar');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else if (entry.boundingClientRect.top > 0) {
            entry.target.classList.remove('active');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
    );
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('active'));
  }

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    if (scrollProgressBar) {
      scrollProgressBar.style.width = pct + '%';
    }
  }, { passive: true });

  // Confession Buttons
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const teaseMessage = document.getElementById('teaseMessage');
  const buttonArena = document.getElementById('buttonArena');
  const celebrationModal = document.getElementById('celebrationModal');

  let dodgeCount = 0;
  const maxDodges = 6;
  const cutePrompts = [
    'Ủa bấm nhầm hả Hoàng Anh ơi?',
    'Đừng từ chối mà, Thắng thương Hoàng Anh thật lòng đó!',
    'Nút Từ chối chạy trốn rồi, chọn Đồng Ý đi em!',
    'Trốn đâu cho thoát khỏi trái tim của M.Thắng!',
    'Đồng ý làm người yêu Thắng nha Hoàng Anh ơi!',
    'Nút Từ chối biến mất tiêu rồi — chỉ còn đường làm người yêu Thắng thôi!'
  ];

  function dodgeNoButton(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    dodgeCount++;
    playPopSound(520 + dodgeCount * 75);

    if (teaseMessage) {
      const msgIdx = Math.min(dodgeCount - 1, cutePrompts.length - 1);
      teaseMessage.textContent = cutePrompts[msgIdx];
      teaseMessage.classList.add('text-amber-200', 'font-medium');
    }

    if (yesBtn) {
      const yesScale = 1 + dodgeCount * 0.16;
      yesBtn.style.transform = 'scale(' + yesScale.toFixed(2) + ')';
    }

    if (dodgeCount >= maxDodges) {
      if (noBtn) {
        noBtn.style.transform = 'scale(0) rotate(180deg)';
        noBtn.style.opacity = '0';
        noBtn.style.pointerEvents = 'none';
        setTimeout(() => {
          noBtn.style.display = 'none';
        }, 250);
      }
      spawnBurst(window.innerWidth / 2, window.innerHeight * 0.7, 34);
      return;
    }

    if (buttonArena && noBtn) {
      const arenaRect = buttonArena.getBoundingClientRect();
      const btnWidth = noBtn.offsetWidth || 100;
      const btnHeight = noBtn.offsetHeight || 36;
      const maxX = Math.max(20, arenaRect.width - btnWidth - 16);
      const maxY = Math.max(20, arenaRect.height - btnHeight - 16);
      const randX = Math.floor(Math.random() * maxX) - arenaRect.width / 2 + btnWidth / 2;
      const randY = Math.floor(Math.random() * maxY) - arenaRect.height / 2 + btnHeight / 2;
      const shrink = Math.max(0.65, 1 - dodgeCount * 0.06);

      noBtn.style.position = 'absolute';
      noBtn.style.transform = 'translate(' + randX + 'px, ' + randY + 'px) scale(' + shrink + ')';
    }
  }

  if (noBtn) {
    noBtn.addEventListener('click', dodgeNoButton);
    noBtn.addEventListener('touchstart', dodgeNoButton, { passive: false });
    noBtn.addEventListener('mouseenter', dodgeNoButton);
  }

  function triggerCelebration() {
    startMusic();
    playPopSound(1046.5);
    if (celebrationModal) {
      celebrationModal.classList.remove('hidden');
      celebrationModal.classList.add('flex');
    }

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const rx = Math.random() * (window.innerWidth * 0.7) + window.innerWidth * 0.15;
        const ry = Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.15;
        spawnBurst(rx, ry, 36);
      }, i * 250);
    }
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', triggerCelebration);
  }

  const moreFireworksBtn = document.getElementById('moreFireworksBtn');
  if (moreFireworksBtn) {
    moreFireworksBtn.addEventListener('click', () => {
      playPopSound(1174.66);
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          spawnBurst(
            Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
            Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.1,
            32
          );
        }, i * 180);
      }
    });
  }

  const closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn && celebrationModal) {
    closeModalBtn.addEventListener('click', () => {
      celebrationModal.classList.add('hidden');
      celebrationModal.classList.remove('flex');
    });
  }
});
