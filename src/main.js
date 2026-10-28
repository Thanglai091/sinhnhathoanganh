(function () {
      const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);
      (function tryLoadLocalPhoto() {
        const heroImg = document.getElementById('previewImg0');
        if (!heroImg) return;
        const probe = new Image();
        const fileName = ['hoang', 'anh', '.jpg'].join('');
        probe.onload = function () {
          heroImg.src = fileName;
        };
        probe.src = fileName;
      })();
      let isPageVisible = true;

      document.addEventListener('visibilitychange', function () {
        isPageVisible = !document.hidden;
      });

      // =========================================================
      // 1. AUDIO ENGINE (MP3 Background Music + Wish Voice + Sound FX)
      // =========================================================
      const baseUrl = import.meta.env.BASE_URL || './';
      const bgmSrc = baseUrl + 'nastelbom-happy-birthday-471481.mp3';
      const wishSrc = baseUrl + 'chuc_em_sinh_nhat_vui_ve_ad4fba7b-5c9e-44b1-9f21-8cb4a86481b1.mp3';

      const bgMusic = new Audio(bgmSrc);
      bgMusic.loop = true;
      bgMusic.volume = 0.55;
      bgMusic.preload = 'auto';

      const wishAudio = new Audio(wishSrc);
      wishAudio.volume = 1.0;
      wishAudio.preload = 'auto';

      let audioCtx = null;
      let isPlayingMusic = false;

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

      function startMusic() {
        ensureAudio();
        isPlayingMusic = true;
        const soundLabel = document.getElementById('soundLabel');
        if (soundLabel) soundLabel.textContent = 'ON';
        bgMusic.play().catch(function (err) {
          console.log('Audio autoplay prevented:', err);
        });
      }

      function stopMusic() {
        isPlayingMusic = false;
        const soundLabel = document.getElementById('soundLabel');
        if (soundLabel) soundLabel.textContent = 'MUTED';
        bgMusic.pause();
      }

      document.getElementById('soundToggleBtn').addEventListener('click', function () {
        if (isPlayingMusic) {
          stopMusic();
        } else {
          startMusic();
        }
      });

      // =========================================================
      // 2. SHIMMERING VECTOR PARTICLE & STARDUST ENGINE
      //    (Optimized with pre-computed unit star vertices & particle cap)
      // =========================================================
      const canvas = document.getElementById('sparkleCanvas');
      const ctx = canvas.getContext('2d', { alpha: true });
      let particles = [];
      let ambientStars = [];
      let canvasWidth = window.innerWidth;
      let canvasHeight = window.innerHeight;

      const palette = ['#ff2a85', '#ffd166', '#00f5d4', '#c77dff', '#ffffff'];
      const MAX_PARTICLES = isMobile ? 55 : 110;

      // Pre-computed unit 4-point star polygon vertices (Zero Math.cos/sin inside render loop!)
      const STAR_VERTS = [
        [2.4, 0],
        [0.3535, 0.3535],
        [0, 2.4],
        [-0.3535, 0.3535],
        [-2.4, 0],
        [-0.3535, -0.3535],
        [0, -2.4],
        [0.3535, -0.3535]
      ];

      function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        initAmbientStars();
      }

      let resizeTimer = null;
      window.addEventListener('resize', function () {
        // Ignore minor mobile URL bar height jitter to prevent clearing stars while scrolling
        if (Math.abs(window.innerWidth - canvasWidth) < 10 && Math.abs(window.innerHeight - canvasHeight) < 120) {
          return;
        }
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 150);
      }, { passive: true });

      function initAmbientStars() {
        ambientStars = [];
        const maxAmbient = isMobile ? 18 : 34;
        const count = Math.min(maxAmbient, Math.floor((canvasWidth * canvasHeight) / 22000));
        for (let i = 0; i < count; i++) {
          ambientStars.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            r: Math.random() * 1.6 + 0.7,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005,
            vy: -(Math.random() * 0.18 + 0.05),
            color: palette[Math.floor(Math.random() * palette.length)]
          });
        }
      }

      function spawnBurst(x, y, count = 18) {
        const actualCount = isMobile ? Math.min(count, 16) : count;
        if (particles.length + actualCount > MAX_PARTICLES) {
          particles.splice(0, (particles.length + actualCount) - MAX_PARTICLES);
        }
        for (let i = 0; i < actualCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3.8 + 1.0;
          particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.0,
            size: Math.random() * 5.0 + 3.2,
            color: palette[Math.floor(Math.random() * palette.length)],
            alpha: 1,
            decay: Math.random() * 0.022 + 0.015,
            isHeart: Math.random() > 0.45
          });
        }
      }

      function drawVectorHeart(c, x, y, size, color, alpha) {
        c.globalAlpha = alpha > 0 ? alpha : 0;
        c.fillStyle = color;
        const s = size * 0.58;
        c.beginPath();
        c.moveTo(x, y + s * 0.4);
        c.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.4);
        c.bezierCurveTo(x - s, y + s * 0.9, x, y + s * 1.2, x, y + s * 1.6);
        c.bezierCurveTo(x, y + s * 1.2, x + s, y + s * 0.9, x + s, y + s * 0.4);
        c.bezierCurveTo(x + s, y, x, y, x, y + s * 0.4);
        c.fill();
      }

      function drawFourPointStar(c, x, y, r, color, alpha) {
        c.globalAlpha = alpha > 0 ? alpha : 0;
        c.fillStyle = color;
        c.beginPath();
        c.moveTo(x + STAR_VERTS[0][0] * r, y + STAR_VERTS[0][1] * r);
        for (let i = 1; i < 8; i++) {
          c.lineTo(x + STAR_VERTS[i][0] * r, y + STAR_VERTS[i][1] * r);
        }
        c.closePath();
        c.fill();
      }

      window.addEventListener('pointerdown', function (e) {
        spawnBurst(e.clientX, e.clientY, isMobile ? 7 : 10);
      }, { passive: true });

      document.getElementById('sparkleBurstBtn').addEventListener('click', function () {
        playPopSound(880);
        spawnBurst(canvasWidth * 0.5, canvasHeight * 0.35, isMobile ? 20 : 30);
      });

      // =========================================================
      // 3. INTRO OVERLAY PORTAL TRANSITION
      // =========================================================
      const introOverlay = document.getElementById('introOverlay');
      document.getElementById('openGiftBtn').addEventListener('click', function () {
        startMusic();
        spawnBurst(canvasWidth / 2, canvasHeight / 2, isMobile ? 22 : 36);
        introOverlay.style.opacity = '0';
        introOverlay.style.transform = 'scale(1.04)';
        introOverlay.style.pointerEvents = 'none';
        setTimeout(function () {
          introOverlay.style.display = 'none';
        }, 520);
      });

      // =========================================================
      // 4. VIEWPORT-AWARE UNIFIED ANIMATION ENGINE
      //    (Only animates SVG cards that are currently in viewport!)
      // =========================================================
      const cardVisible = { card1: false, card2: false, card3: false };

      let orbitFast = false;
      let orbitPhase = 0;
      const vectorCard1 = document.getElementById('vectorCard1');
      const card1Badge = document.getElementById('card1Badge');
      const planetAnh = document.getElementById('planetAnh');
      const planetAnhCore = document.getElementById('planetAnhCore');
      const planetAnhHalo = document.getElementById('planetAnhHalo');
      const planetEm = document.getElementById('planetEm');
      const planetEmCore = document.getElementById('planetEmCore');
      const planetEmHalo = document.getElementById('planetEmHalo');
      const cometTailAnh = document.getElementById('cometTailAnh');
      const cometTailEm = document.getElementById('cometTailEm');
      const orbitTelemetry = document.getElementById('orbitTelemetry');
      const gravRipple1 = document.getElementById('gravRipple1');
      const gravRipple2 = document.getElementById('gravRipple2');
      const sunCoreGlow = document.getElementById('sunCoreGlow');
      const astroGridCircle = document.getElementById('astroGridCircle');

      // Precompute tilt trig constants
      const COS_N16 = Math.cos((-16 * Math.PI) / 180);
      const SIN_N16 = Math.sin((-16 * Math.PI) / 180);
      const COS_P20 = Math.cos((20 * Math.PI) / 180);
      const SIN_P20 = Math.sin((20 * Math.PI) / 180);

      function getOrbit1Point(angleRad) {
        const ex = 122 * Math.cos(angleRad);
        const ey = 44 * Math.sin(angleRad);
        return {
          x: 160 + ex * COS_N16 - ey * SIN_N16,
          y: 88 + ex * SIN_N16 + ey * COS_N16,
          depth: Math.sin(angleRad)
        };
      }

      function getOrbit2Point(angleRad) {
        const ex = 94 * Math.cos(angleRad);
        const ey = 34 * Math.sin(angleRad);
        return {
          x: 160 + ex * COS_P20 - ey * SIN_P20,
          y: 88 + ex * SIN_P20 + ey * COS_P20,
          depth: Math.sin(angleRad)
        };
      }

      vectorCard1.addEventListener('click', function (e) {
        orbitFast = !orbitFast;
        card1Badge.textContent = orbitFast ? 'SIÊU QUỸ ĐẠO • WARP 100%' : 'CHẠM TĂNG TỐC QUỸ ĐẠO';
        playPopSound(orbitFast ? 783.99 : 587.33);
        spawnBurst(e.clientX || canvasWidth / 2, e.clientY || canvasHeight / 2, 18);
      });

      // --- ARTWORK II: OSCILLOSCOPE, SPECTRUM & LIVE ECG SCANNER ---
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
        const barCount = isMobile ? 18 : 24;
        const stepX = 296 / barCount;
        for (let i = 0; i < barCount; i++) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', (12 + i * stepX).toFixed(1));
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
        const d1 = (normX - 0.22) / 0.045;
        const d2 = (normX - 0.36) / 0.018;
        const d3 = (normX - 0.42) / 0.022;
        const d4 = (normX - 0.48) / 0.022;
        const d5 = (normX - 0.70) / 0.065;
        const p = Math.exp(-(d1 * d1)) * -10;
        const q = Math.exp(-(d2 * d2)) * 14;
        const r = Math.exp(-(d3 * d3)) * -54 * ampScale;
        const s = Math.exp(-(d4 * d4)) * 34 * ampScale;
        const t = Math.exp(-(d5 * d5)) * -14;
        return p + q + r + s + t;
      }

      vectorCard2.addEventListener('click', function (e) {
        currentBpm = currentBpm >= 184 ? 128 : currentBpm + 14;
        bpmCounter.textContent = currentBpm + ' BPM • TIM ĐẬP VÌ EM';
        playPopSound(659.25 + (currentBpm - 128) * 4);
        spawnBurst(e.clientX || canvasWidth / 2, e.clientY || canvasHeight / 2, 18);
      });

      // --- ARTWORK III: SACRED GEOMETRY BREATHING & INFINITY PHOTONS ---
      let soulFused = false;
      let infPhase = 0;
      const vectorCard3 = document.getElementById('vectorCard3');
      const ringAnh = document.getElementById('ringAnh');
      const ringEm = document.getElementById('ringEm');
      const ringAnhOuter = document.getElementById('ringAnhOuter');
      const ringEmOuter = document.getElementById('ringEmOuter');
      const photonAnh = document.getElementById('photonAnh');
      const photonEm = document.getElementById('photonEm');
      const photonTrail1 = document.getElementById('photonTrail1');
      const photonTrail2 = document.getElementById('photonTrail2');
      const promiseBadge = document.getElementById('promiseBadge');
      const vesicaRing1 = document.getElementById('vesicaRing1');
      const vesicaRing2 = document.getElementById('vesicaRing2');
      const vesicaCoreHalo = document.getElementById('vesicaCoreHalo');

      function getInfinityPoint(t) {
        return {
          x: 160 + 74 * Math.cos(t),
          y: 85 + 30 * Math.sin(2 * t)
        };
      }

      (function initInfinityTrackGeometry() {
        const trackEl = document.getElementById('infinityTrack');
        const streamEl = document.getElementById('infinityStreamPath');
        if (!trackEl || !streamEl) return;
        let pathStr = '';
        const steps = 72;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2;
          const pt = getInfinityPoint(t);
          pathStr += (i === 0 ? 'M ' : ' L ') + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1);
        }
        pathStr += ' Z';
        trackEl.setAttribute('d', pathStr);
        streamEl.setAttribute('d', pathStr);
      })();

      vectorCard3.addEventListener('click', function (e) {
        soulFused = !soulFused;
        if (promiseBadge) {
          promiseBadge.textContent = soulFused ? 'GIAO THOA VĨNH CỬU • ∞' : 'ANH & EM • ∞ VÔ CỰC';
        }
        playPopSound(soulFused ? 987.77 : 880);
        spawnBurst(e.clientX || canvasWidth / 2, e.clientY || canvasHeight / 2, 20);
      });

      function updateArtwork1() {
        const speed1 = orbitFast ? 0.055 : 0.022;
        orbitPhase += speed1;

        const p1 = getOrbit1Point(orbitPhase);
        const p2 = getOrbit2Point(-orbitPhase * 1.25 + 1.2);

        const scale1 = 1 + p1.depth * 0.32;
        const scale2 = 1 + p2.depth * 0.28;

        const p1x = p1.x.toFixed(1);
        const p1y = p1.y.toFixed(1);
        const p2x = p2.x.toFixed(1);
        const p2y = p2.y.toFixed(1);

        planetAnh.setAttribute('cx', p1x);
        planetAnh.setAttribute('cy', p1y);
        planetAnh.setAttribute('r', (5.8 * scale1).toFixed(1));
        planetAnhCore.setAttribute('cx', p1x);
        planetAnhCore.setAttribute('cy', p1y);
        planetAnhHalo.setAttribute('cx', p1x);
        planetAnhHalo.setAttribute('cy', p1y);
        planetAnhHalo.setAttribute('r', (12.5 * scale1).toFixed(1));

        planetEm.setAttribute('cx', p2x);
        planetEm.setAttribute('cy', p2y);
        planetEm.setAttribute('r', (5.0 * scale2).toFixed(1));
        if (planetEmCore) {
          planetEmCore.setAttribute('cx', p2x);
          planetEmCore.setAttribute('cy', p2y);
        }
        planetEmHalo.setAttribute('cx', p2x);
        planetEmHalo.setAttribute('cy', p2y);
        planetEmHalo.setAttribute('r', (10 * scale2).toFixed(1));

        if (gravRipple1 && gravRipple2 && sunCoreGlow) {
          const rProg1 = (orbitPhase * 0.45) % 1;
          const rProg2 = ((orbitPhase * 0.45) + 0.5) % 1;
          gravRipple1.setAttribute('r', (16 + rProg1 * 48).toFixed(1));
          gravRipple1.setAttribute('opacity', ((1 - rProg1) * 0.65).toFixed(2));
          gravRipple2.setAttribute('r', (16 + rProg2 * 48).toFixed(1));
          gravRipple2.setAttribute('opacity', ((1 - rProg2) * 0.55).toFixed(2));
          sunCoreGlow.setAttribute('r', (30 + Math.sin(orbitPhase * 2) * 4).toFixed(1));
        }

        let d1 = 'M ' + p1x + ' ' + p1y;
        let d2 = 'M ' + p2x + ' ' + p2y;
        const tailSteps = isMobile ? 6 : 9;
        for (let k = 1; k <= tailSteps; k++) {
          const tp1 = getOrbit1Point(orbitPhase - k * 0.09);
          const tp2 = getOrbit2Point(-orbitPhase * 1.25 + 1.2 + k * 0.1);
          d1 += ' L ' + tp1.x.toFixed(1) + ' ' + tp1.y.toFixed(1);
          d2 += ' L ' + tp2.x.toFixed(1) + ' ' + tp2.y.toFixed(1);
        }
        cometTailAnh.setAttribute('d', d1);
        cometTailEm.setAttribute('d', d2);

        if (orbitTelemetry) {
          const deg = Math.floor(((orbitPhase * 180) / Math.PI) % 360);
          orbitTelemetry.textContent = 'LOCK: H.ANH • ' + String(deg).padStart(3, '0') + '°';
        }
      }

      function updateArtwork2() {
        const bpmFactor = currentBpm / 128;
        wavePhase += 0.045 * bpmFactor;

        let hw1 = 'M 0 85';
        let hw2 = 'M 0 85';
        let hw3 = 'M 0 85';
        let ecgD = '';

        const laserX = ((wavePhase * 42) % 300) + 10;
        let laserY = 85;
        const stepX = isMobile ? 6 : 4;

        for (let x = 6; x <= 314; x += stepX) {
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

          if (Math.abs(x - laserX) <= stepX) {
            laserY = ey;
          }
        }

        harmWave1.setAttribute('d', hw1);
        harmWave2.setAttribute('d', hw2);
        harmWave3.setAttribute('d', hw3);
        ecgPath.setAttribute('d', ecgD);
        ecgGlowPath.setAttribute('d', ecgD);

        const lx = laserX.toFixed(1);
        const ly = laserY.toFixed(1);
        ecgLaserHead.setAttribute('cx', lx);
        ecgLaserHead.setAttribute('cy', ly);
        ecgPulseRing.setAttribute('cx', lx);
        ecgPulseRing.setAttribute('cy', ly);
        ecgPulseRing.setAttribute('r', (6 + Math.abs(Math.sin(wavePhase * 3)) * 10).toFixed(1));

        const sVal = Math.max(0, Math.sin(wavePhase * 3.2));
        const heartBeatScale = 1 + (sVal * sVal * sVal * sVal) * 0.28;
        heartPulseBadge.setAttribute('transform', 'translate(282, 26) scale(' + heartBeatScale.toFixed(2) + ')');

        for (let i = 0; i < spectrumBars.length; i++) {
          const bh = 8 + Math.abs(Math.sin(wavePhase * 2.4 + i * 0.45)) * 36 * bpmFactor;
          spectrumBars[i].setAttribute('y', (164 - bh).toFixed(1));
          spectrumBars[i].setAttribute('height', bh.toFixed(1));
        }
      }

      function updateArtwork3() {
        const infSpeed = soulFused ? 0.065 : 0.032;
        infPhase += infSpeed;

        const spread = soulFused ? 16 + Math.sin(infPhase * 1.5) * 6 : 28 + Math.sin(infPhase) * 7;
        const cxAnh = (160 - spread).toFixed(1);
        const cxEm = (160 + spread).toFixed(1);
        ringAnh.setAttribute('cx', cxAnh);
        ringEm.setAttribute('cx', cxEm);

        if (ringAnhOuter && ringEmOuter) {
          ringAnhOuter.setAttribute('cx', cxAnh);
          ringEmOuter.setAttribute('cx', cxEm);
        }

        const pt1 = getInfinityPoint(infPhase);
        const pt2 = getInfinityPoint(infPhase + Math.PI);

        photonAnh.setAttribute('cx', pt1.x.toFixed(1));
        photonAnh.setAttribute('cy', pt1.y.toFixed(1));
        photonEm.setAttribute('cx', pt2.x.toFixed(1));
        photonEm.setAttribute('cy', pt2.y.toFixed(1));

        let tr1 = 'M ' + pt1.x.toFixed(1) + ' ' + pt1.y.toFixed(1);
        let tr2 = 'M ' + pt2.x.toFixed(1) + ' ' + pt2.y.toFixed(1);
        const trailLen = isMobile ? 10 : 14;
        for (let j = 1; j <= trailLen; j++) {
          const prev1 = getInfinityPoint(infPhase - j * 0.05);
          const prev2 = getInfinityPoint(infPhase + Math.PI - j * 0.05);
          tr1 += ' L ' + prev1.x.toFixed(1) + ' ' + prev1.y.toFixed(1);
          tr2 += ' L ' + prev2.x.toFixed(1) + ' ' + prev2.y.toFixed(1);
        }
        photonTrail1.setAttribute('d', tr1);
        photonTrail2.setAttribute('d', tr2);

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

      // Render 1 initial frame of each SVG artwork so it looks complete immediately
      updateArtwork1();
      updateArtwork2();
      updateArtwork3();

      // Single unified requestAnimationFrame loop (eliminates dual-loop frame contention on mobile)
      function masterAnimationLoop() {
        if (isPageVisible) {
          // 1. Draw canvas particles & ambient stars
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);

          for (let i = 0; i < ambientStars.length; i++) {
            const s = ambientStars[i];
            s.alpha += s.speed;
            if (s.alpha > 1 || s.alpha < 0.15) s.speed = -s.speed;
            s.y += s.vy;
            if (s.y < -10) s.y = canvasHeight + 10;
            drawFourPointStar(ctx, s.x, s.y, s.r, s.color, s.alpha < 0 ? -s.alpha : s.alpha);
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

          // 2. Only update SVG DOM attributes for artworks currently visible in viewport
          if (cardVisible.card1) updateArtwork1();
          if (cardVisible.card2) updateArtwork2();
          if (cardVisible.card3) updateArtwork3();
        }

        requestAnimationFrame(masterAnimationLoop);
      }

      resizeCanvas();
      requestAnimationFrame(masterAnimationLoop);

      // =========================================================
      // 6. INTERACTIVE BIRTHDAY CANDLE
      // =========================================================
      let candleLit = true;
      const blowCandleBtn = document.getElementById('blowCandleBtn');
      const candleFlame = document.getElementById('candleFlame');
      const candleAura = document.getElementById('candleAura');
      const candleStatusText = document.getElementById('candleStatusText');

      blowCandleBtn.addEventListener('click', function () {
        const rect = blowCandleBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + 35;

        if (candleLit) {
          candleLit = false;
          candleFlame.style.opacity = '0';
          candleAura.style.opacity = '0';
          candleStatusText.innerHTML = '<span class="text-amber-200 font-medium">Điều ước tuổi mới của Hoàng Anh đã bay vào ngân hà!</span> (Chạm lại nếu muốn thắp sáng nến)';
          
          // Phát âm thanh chúc mừng sinh nhật khi THỔI TẮT NẾN
          try {
            wishAudio.currentTime = 0;
            if (isPlayingMusic) {
              bgMusic.volume = 0.2; // Giảm nhẹ nhạc nền để nghe rõ lời chúc
              wishAudio.onended = function () {
                if (isPlayingMusic) bgMusic.volume = 0.55;
              };
            }
            wishAudio.play().catch(function (err) {
              console.log('Wish audio error:', err);
            });
          } catch (e) {
            console.log(e);
          }

          playPopSound(987.77);
          spawnBurst(cx, cy, isMobile ? 26 : 42);
        } else {
          candleLit = true;
          candleFlame.style.opacity = '1';
          candleAura.style.opacity = '1';
          candleStatusText.textContent = 'Ngọn lửa ánh sáng đã bừng lên cho Hoàng Anh rồi.';
          
          // KHI THẮP LẠI NẾN: KHÔNG phát mp3 này (chỉ khi thổi tắt mới có)
          try {
            wishAudio.pause();
            wishAudio.currentTime = 0;
            if (isPlayingMusic) {
              bgMusic.volume = 0.55;
            }
          } catch (e) {}

          playPopSound(659.25);
          spawnBurst(cx, cy, 16);
        }
      });

      // =========================================================
      // 7. AWWWARDS SMOOTH SCROLL REVEAL & VIEWPORT CULLING ENGINE
      // =========================================================
      const revealItems = document.querySelectorAll('.reveal-item');
      const scrollProgressBar = document.getElementById('scrollProgressBar');

      if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('active');
              } else if (entry.boundingClientRect.top > 0) {
                entry.target.classList.remove('active');
              }
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
        );
        revealItems.forEach(function (el) {
          revealObserver.observe(el);
        });

        // Dedicated observer to pause/resume heavy SVG DOM animations when scrolled off-screen
        const cardObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.target.id === 'vectorCard1') cardVisible.card1 = entry.isIntersecting;
              if (entry.target.id === 'vectorCard2') cardVisible.card2 = entry.isIntersecting;
              if (entry.target.id === 'vectorCard3') cardVisible.card3 = entry.isIntersecting;
            });
          },
          { threshold: 0.02, rootMargin: '60px 0px 60px 0px' }
        );
        if (vectorCard1) cardObserver.observe(vectorCard1);
        if (vectorCard2) cardObserver.observe(vectorCard2);
        if (vectorCard3) cardObserver.observe(vectorCard3);
      } else {
        revealItems.forEach(function (el) {
          el.classList.add('active');
        });
        cardVisible.card1 = true;
        cardVisible.card2 = true;
        cardVisible.card3 = true;
      }

      let scrollTicking = false;
      window.addEventListener('scroll', function () {
        if (!scrollTicking) {
          scrollTicking = true;
          requestAnimationFrame(function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            const ratio = Math.min(1, Math.max(0, scrollTop / docHeight));
            if (scrollProgressBar) {
              scrollProgressBar.style.transform = 'scaleX(' + ratio.toFixed(3) + ')';
            }
            scrollTicking = false;
          });
        }
      }, { passive: true });

      // =========================================================
      // 8. RUNAWAY "TỪ CHỐI" & GROWING "EM ĐỒNG Ý" BUTTONS
      // =========================================================
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

        const msgIdx = Math.min(dodgeCount - 1, cutePrompts.length - 1);
        teaseMessage.textContent = cutePrompts[msgIdx];
        teaseMessage.classList.add('text-amber-200', 'font-medium');

        const yesScale = 1 + dodgeCount * 0.16;
        yesBtn.style.transform = 'scale(' + yesScale.toFixed(2) + ')';

        if (dodgeCount >= maxDodges) {
          noBtn.style.transform = 'scale(0) rotate(180deg)';
          noBtn.style.opacity = '0';
          noBtn.style.pointerEvents = 'none';
          setTimeout(function () {
            noBtn.style.display = 'none';
          }, 250);
          spawnBurst(canvasWidth / 2, canvasHeight * 0.7, isMobile ? 22 : 34);
          return;
        }

        const arenaRect = buttonArena.getBoundingClientRect();
        const btnWidth = noBtn.offsetWidth || 100;
        const btnHeight = noBtn.offsetHeight || 36;

        const maxX = Math.max(20, arenaRect.width - btnWidth - 16);
        const maxY = Math.max(20, arenaRect.height - btnHeight - 16);

        const randX = Math.floor(Math.random() * maxX) - arenaRect.width / 2 + btnWidth / 2;
        const randY = Math.floor(Math.random() * maxY) - arenaRect.height / 2 + btnHeight / 2;
        const shrink = Math.max(0.65, 1 - dodgeCount * 0.06);

        noBtn.style.position = 'absolute';
        noBtn.style.transform = 'translate3d(' + randX + 'px, ' + randY + 'px, 0) scale(' + shrink + ')';
      }

      noBtn.addEventListener('click', dodgeNoButton);
      noBtn.addEventListener('touchstart', dodgeNoButton, { passive: false });
      noBtn.addEventListener('mouseenter', dodgeNoButton);

      function triggerCelebration() {
        startMusic();
        playPopSound(1046.5);
        celebrationModal.classList.remove('hidden');
        celebrationModal.classList.add('flex');

        for (let i = 0; i < 4; i++) {
          setTimeout(function () {
            const rx = Math.random() * (canvasWidth * 0.7) + canvasWidth * 0.15;
            const ry = Math.random() * (canvasHeight * 0.5) + canvasHeight * 0.15;
            spawnBurst(rx, ry, isMobile ? 20 : 32);
          }, i * 260);
        }
      }

      yesBtn.addEventListener('click', triggerCelebration);

      document.getElementById('moreFireworksBtn').addEventListener('click', function () {
        playPopSound(1174.66);
        for (let i = 0; i < 4; i++) {
          setTimeout(function () {
            spawnBurst(
              Math.random() * canvasWidth * 0.8 + canvasWidth * 0.1,
              Math.random() * canvasHeight * 0.6 + canvasHeight * 0.1,
              isMobile ? 18 : 28
            );
          }, i * 200);
        }
      });

      document.getElementById('closeModalBtn').addEventListener('click', function () {
        celebrationModal.classList.add('hidden');
        celebrationModal.classList.remove('flex');
      });
    })();