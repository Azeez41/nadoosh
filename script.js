/* =====================================================================
   GLOBAL STATE
   ===================================================================== */
let soundOn = true;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/* Simple synth "beep" for sound effects — no external audio files needed */
function playBeep(freq = 660, duration = 0.09, type = 'sine', vol = 0.05) {
  if (!soundOn) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* fail silently */ }
}
function playClick() { playBeep(520, 0.08, 'triangle', 0.04); }
function playSuccess() { playBeep(700, 0.12, 'sine', 0.05); setTimeout(() => playBeep(920, 0.15, 'sine', 0.05), 100); }

/* Reusable toast for easter eggs */
function showToast(text, duration = 4000) {
  const toast = document.getElementById('egg-toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

/* =====================================================================
   SECTION 1 — LOADING SCREEN with rotating status steps
   ===================================================================== */
(function initLoadingScreen() {
  const fill = document.getElementById('loading-bar-fill');
  const percentLabel = document.getElementById('loading-percent');
  const stepLabel = document.getElementById('loading-step');
  const verifiedLabel = document.getElementById('loading-verified');
  const screen = document.getElementById('loading-screen');

  const steps = ['Scanning memories...', 'Analyzing happiness...', 'Finding the cutest girlfriend...'];
  let stepIndex = 0;
  stepLabel.textContent = steps[0];
  const stepInterval = setInterval(() => {
    stepIndex = (stepIndex + 1) % steps.length;
    stepLabel.textContent = steps[stepIndex];
  }, 750);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 12 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      clearInterval(stepInterval);
      stepLabel.textContent = 'Complete.';
      verifiedLabel.classList.remove('hidden');
      setTimeout(() => screen.classList.add('fade-out'), 700);
    }
    fill.style.width = progress + '%';
    percentLabel.textContent = Math.floor(progress) + '%';
  }, 230);
})();

/* =====================================================================
   AMBIENT FLOATING HEARTS + LEAVES
   ===================================================================== */
(function initAmbientDecor() {
  const container = document.getElementById('ambient-decor');
  const symbols = ['❤', '🍃', '❤', '✧'];
  const total = window.innerWidth < 600 ? 12 : 20;
  for (let i = 0; i < total; i++) {
    const el = document.createElement('span');
    const isLeaf = Math.random() > 0.55;
    el.className = 'ambient-piece' + (isLeaf ? ' leaf' : '');
    el.textContent = symbols[isLeaf ? 1 : (Math.random() > 0.5 ? 0 : 2)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (0.8 + Math.random() * 1.6) + 'rem';
    el.style.animationDuration = (10 + Math.random() * 14) + 's';
    el.style.animationDelay = (Math.random() * 14) + 's';
    container.appendChild(el);
  }
})();

/* =====================================================================
   CURSOR SPARKLE TRAIL
   ===================================================================== */
(function initCursorTrail() {
  const container = document.getElementById('sparkle-trail-container');
  let lastTime = 0;
  const isTouch = 'ontouchstart' in window;
  function spawnSparkle(x, y) {
    const s = document.createElement('div');
    s.className = 'sparkle-particle';
    s.style.left = (x - 3) + 'px';
    s.style.top = (y - 3) + 'px';
    container.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
  if (!isTouch) {
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastTime < 45) return;
      lastTime = now;
      spawnSparkle(e.clientX, e.clientY);
    });
  } else {
    document.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (!t) return;
      spawnSparkle(t.clientX, t.clientY);
    }, { passive: true });
  }
})();

/* =====================================================================
   TOP NAV: sound toggle, music toggle, logo → Hogwarts easter egg
   ===================================================================== */
const music = document.getElementById('bg-music');
let musicOn = false;

(function initNav() {
  const soundToggle = document.getElementById('sound-toggle');
  const musicToggle = document.getElementById('music-toggle');
  const logoBtn = document.getElementById('logo-btn');
  const hogwartsEgg = document.getElementById('hogwarts-egg');
  let logoClicks = 0;

  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.textContent = soundOn ? '🔊' : '🔇';
    if (soundOn) playClick();
  });

  musicToggle.addEventListener('click', () => {
    musicOn = !musicOn;
    musicToggle.textContent = musicOn ? '🎵' : '🎶';
    if (musicOn) {
      music.volume = 0.4;
      music.play().catch(() => showToast('Add your song file to music/our-song.mp3 to hear it here 🎵'));
    } else {
      music.pause();
    }
  });

  logoBtn.addEventListener('click', () => {
    logoClicks++;
    playClick();
    if (logoClicks === 5) {
      hogwartsEgg.classList.add('show');
      showToast('🏰 A tiny Hogwarts letter arrives for Nadoosh...');
      Confetti.burst(60);
      setTimeout(() => hogwartsEgg.classList.remove('show'), 3500);
      logoClicks = 0;
    }
  });
})();

/* Hidden OHG ice cream easter egg */
document.getElementById('ohg-egg').addEventListener('click', () => {
  playClick();
  showToast('🍦 OHG craving detected. This is scientifically accurate.');
  Confetti.burst(50);
});

/* =====================================================================
   SCROLL-TRIGGERED REVEAL ANIMATIONS
   ===================================================================== */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  revealEls.forEach((el) => observer.observe(el));
})();

/* =====================================================================
   CONFETTI ENGINE (canvas-based, no external libraries)
   ===================================================================== */
const Confetti = (function () {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();
  const colors = ['#4C6B4F', '#8A5A3C', '#C7A257', '#B7C9A8', '#FFFFFF', '#5E3B24'];
  function burst(count = 120) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height * 0.3,
        vx: (Math.random() - 0.5) * 6, vy: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4, color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'circle' : 'rect', life: 0,
      });
    }
    if (!animId) loop();
  }
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rotation += p.rotSpeed; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      else { ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
      ctx.restore();
    });
    particles = particles.filter((p) => p.y < canvas.height + 40 && p.life < 400);
    if (particles.length > 0) animId = requestAnimationFrame(loop);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); animId = null; }
  }
  return { burst };
})();

/* =====================================================================
   SECTION 2 — HERO: smooth scroll to scanner
   ===================================================================== */
document.getElementById('begin-btn').addEventListener('click', () => {
  playClick();
  document.getElementById('scanner').scrollIntoView({ behavior: 'smooth' });
  runScannerSequence();
});

/* =====================================================================
   SECTION 3 — FAKE AI LOVE SCANNER
   ===================================================================== */
let scannerRan = false;
function runScannerSequence() {
  if (scannerRan) return;
  scannerRan = true;

  const seq = [
    { bar: 'bar-beauty', val: 'val-beauty', width: '100%', label: '100%', delay: 300 },
    { bar: 'bar-kindness', val: 'val-kindness', width: '100%', label: '100%', delay: 900 },
  ];
  seq.forEach((s) => {
    setTimeout(() => {
      document.getElementById(s.bar).style.width = s.width;
      document.getElementById(s.val).textContent = s.label;
      playBeep(620, 0.09);
    }, s.delay);
  });

  setTimeout(() => {
    document.getElementById('bar-giggle').style.width = '35%';
    document.getElementById('val-giggle').textContent = '???';
    document.getElementById('giggle-error').classList.remove('hidden');
    playBeep(300, 0.4, 'sawtooth', 0.05);
  }, 1600);

  const seq2 = [
    { bar: 'bar-hp', val: 'val-hp', width: '99%', label: '99%', delay: 2300 },
    { bar: 'bar-lego', val: 'val-lego', width: '100%', label: 'Unlimited', delay: 2900 },
    { bar: 'bar-ohg', val: 'val-ohg', width: '100%', label: 'Critical level', delay: 3500 },
  ];
  seq2.forEach((s) => {
    setTimeout(() => {
      document.getElementById(s.bar).style.width = s.width;
      document.getElementById(s.val).textContent = s.label;
      playBeep(650, 0.09);
    }, s.delay);
  });

  setTimeout(() => {
    document.getElementById('scanner-conclusion').classList.remove('hidden');
    Confetti.burst(50);
    playSuccess();
  }, 4200);
}

/* =====================================================================
   SECTION 5 — SWIMMING SHARKS (aquarium background)
   ===================================================================== */
(function initSharks() {
  const aquarium = document.getElementById('aquarium');
  const count = 3;
  for (let i = 0; i < count; i++) {
    const shark = document.createElement('span');
    shark.className = 'shark';
    shark.textContent = '🦈';
    shark.style.top = (15 + Math.random() * 60) + '%';
    shark.style.animationDuration = (10 + Math.random() * 8) + 's';
    shark.style.animationDelay = (-Math.random() * 10) + 's';
    aquarium.appendChild(shark);
  }
})();

/* =====================================================================
   SECTION 6 — EMOTIONAL MEMORY GALLERY
   ===================================================================== */
(function initGallery() {
  // Photo paths are placeholders — drop matching files into /photos to replace them.
  // If a photo file isn't found yet, a soft gradient + emoji shows instead so nothing breaks.
  const emotions = [
    { label: 'Happiness', emoji: '😄', gradient: 'linear-gradient(160deg,#DCE9C8,#8FA97A)', photo: 'photos/happiness.jpg', caption: 'Your HEHEs are my favorite sound.' },
    { label: 'Peace', emoji: '🍃', gradient: 'linear-gradient(160deg,#E7DCC8,#B79A6B)', photo: 'photos/peace.jpg', caption: 'Those quiet moments where being together is enough.' },
    { label: 'Love', emoji: '❤️', gradient: 'linear-gradient(160deg,#E9C8D6,#A9788E)', photo: 'photos/love.jpg', caption: 'Even when things get difficult, we always find our way back.' },
    { label: 'Adventure', emoji: '🦈', gradient: 'linear-gradient(160deg,#C8DDE9,#6B93A9)', photo: 'photos/adventure.jpg', caption: 'Our memories are my favorite places.' },
  ];

  const grid = document.getElementById('emotion-grid');
  emotions.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'emotion-card';
    card.innerHTML = `
      <div class="emotion-card-img" style="background:${m.gradient}">
        <span class="fallback-emoji">${m.emoji}</span>
        <img src="${m.photo}" alt="${m.label}" onerror="this.style.display='none'">
      </div>
      <p class="emotion-card-label">${m.label}</p>
      <p class="emotion-card-caption">${m.caption}</p>
    `;
    card.addEventListener('click', () => openModal(m));
    grid.appendChild(card);
  });

  const modal = document.getElementById('gallery-modal');
  const modalImg = document.getElementById('modal-image');
  const modalCaption = document.getElementById('modal-caption');

  function openModal(m) {
    playClick();
    modalImg.style.background = m.gradient;
    modalImg.innerHTML = `<span class="fallback-emoji">${m.emoji}</span><img src="${m.photo}" alt="${m.label}" onerror="this.style.display='none'">`;
    modalCaption.textContent = m.caption;
    modal.classList.add('active');
  }
  document.getElementById('modal-close').addEventListener('click', () => { modal.classList.remove('active'); playClick(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
})();

/* =====================================================================
   SECTION 8 — THE BUTTON THAT RUNS AWAY
   ===================================================================== */
(function initRunawayButton() {
  const btn = document.getElementById('runaway-btn');
  const rewardText = document.getElementById('runaway-reward');
  let attempts = 0;
  const maxAttempts = 6;

  function moveButton() {
    const margin = 40;
    const maxX = window.innerWidth - btn.offsetWidth - margin;
    const maxY = window.innerHeight - btn.offsetHeight - margin;
    const x = Math.max(margin, Math.random() * maxX);
    const y = Math.max(margin, Math.random() * maxY);
    btn.classList.add('moving');
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
  }

  btn.addEventListener('mouseenter', () => { if (attempts < maxAttempts) moveButton(); });
  btn.addEventListener('click', () => {
    attempts++;
    playBeep(400 + attempts * 30, 0.07, 'square', 0.03);
    if (attempts >= maxAttempts) {
      btn.textContent = 'Okay okay 😂';
      btn.classList.remove('moving');
      btn.style.position = '';
      btn.disabled = true;
      rewardText.classList.remove('hidden');
      Confetti.burst(150);
      playSuccess();
    } else {
      moveButton();
    }
  });
})();

/* =====================================================================
   SECTION 9 — HIDDEN VIDEO (glowing heart easter egg)
   ===================================================================== */
(function initHiddenVideo() {
  const glowHeart = document.getElementById('glow-heart');
  const overlay = document.getElementById('video-reveal-overlay');
  const text = document.getElementById('video-reveal-text');
  const wrap = document.getElementById('video-wrap');
  const closeBtn = document.getElementById('video-close');

  glowHeart.addEventListener('click', () => {
    playClick();
    overlay.classList.add('active');
    text.textContent = 'One more memory...';
    wrap.classList.add('hidden');
    setTimeout(() => wrap.classList.remove('hidden'), 1400);
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    const video = document.getElementById('memory-video');
    video.pause();
  });
})();

/* =====================================================================
   SECTION 10 — FINALE: stars, floating hearts, typewriter reveal
   ===================================================================== */
(function initFinale() {
  const starsContainer = document.getElementById('finale-stars');
  for (let i = 0; i < 70; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDuration = (2 + Math.random() * 3) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    starsContainer.appendChild(star);
  }

  const heartsContainer = document.getElementById('finale-hearts');
  function spawnFinaleHearts() {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const h = document.createElement('span');
        h.className = 'finale-heart';
        h.textContent = '❤';
        h.style.left = Math.random() * 100 + 'vw';
        h.style.fontSize = (0.9 + Math.random() * 1.4) + 'rem';
        h.style.animationDuration = (7 + Math.random() * 8) + 's';
        heartsContainer.appendChild(h);
        setTimeout(() => h.remove(), 16000);
      }, i * 400);
    }
  }

  const fullMessage =
`Nadoosh ❤️

From the day I met you, you became someone I never wanted to lose.

Even when we had difficult moments, even when things hurt, we always came back to each other.

Because at the end of the day, you are the person I want to tell everything to.

Thank you for your laughs.
Thank you for your HEHEs.
Thank you for your patience with me (especially when I apologize 100 times 😂).

Thank you for being my Mi Amor.

Happy Birthday Nadoosh ❤️

I love you.`;

  const typedEl = document.getElementById('finale-typed');
  let typed = false;

  function typeMessage() {
    if (typed) return;
    typed = true;
    spawnFinaleHearts();
    if (musicOn === false) {
      // gently offer music at the emotional peak, without forcing autoplay
      music.volume = 0;
    }
    let i = 0;
    const speed = 32;
    function step() {
      if (i < fullMessage.length) {
        typedEl.textContent += fullMessage[i];
        i++;
        if (Math.random() > 0.7) playBeep(500 + Math.random() * 150, 0.02, 'sine', 0.015);
        setTimeout(step, speed);
      } else {
        Confetti.burst(90);
      }
    }
    step();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) typeMessage(); });
  }, { threshold: 0.5 });
  observer.observe(document.getElementById('finale'));
})();

/* =====================================================================
   EASTER EGG: KONAMI CODE → LEGO + Harry Potter themed surprise
   ===================================================================== */
(function initKonamiCode() {
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
  let position = 0;
  document.addEventListener('keydown', (e) => {
    if (e.code === sequence[position]) {
      position++;
      if (position === sequence.length) { position = 0; activateKonami(); }
    } else {
      position = (e.code === sequence[0]) ? 1 : 0;
    }
  });
  function activateKonami() {
    showToast('⚡ You have been sorted into... the House of Nadoosh. 🧱🏰', 4500);
    Confetti.burst(200);
    playSuccess();
    // a little rain of LEGO bricks + HP sparkles across the screen
    const bricks = ['🧱', '⚡', '🪄', '🦉'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const b = document.createElement('span');
        b.textContent = bricks[Math.floor(Math.random() * bricks.length)];
        b.style.cssText = `
          position:fixed; top:-40px; left:${Math.random() * 100}vw; font-size:${1.2 + Math.random()}rem;
          z-index:9999; pointer-events:none; transition: transform 2.5s linear, opacity 2.5s linear;
        `;
        document.body.appendChild(b);
        requestAnimationFrame(() => {
          b.style.transform = `translateY(${window.innerHeight + 60}px) rotate(${Math.random() * 360}deg)`;
          b.style.opacity = '0.15';
        });
        setTimeout(() => b.remove(), 2600);
      }, i * 80);
    }
  }
})();

/* =====================================================================
   EASTER EGG: typing "كازو خالج" anywhere on the page
   ===================================================================== */
(function initSecretPhrase() {
  const target = 'كازو خالج';
  let buffer = '';
  document.addEventListener('keydown', (e) => {
    if (e.key.length === 1) {
      buffer = (buffer + e.key).slice(-target.length);
      if (buffer === target) {
        buffer = '';
        showToast('😂 كازو خالج detected. Achievement unlocked.', 4000);
        Confetti.burst(180);
        playSuccess();
        document.body.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(0deg)' }],
          { duration: 500, iterations: 2 }
        );
      }
    }
  });
})();

/* =====================================================================
   BONUS SECRET SECTION — DORA'S EMERGENCY SPANISH INSPECTION
   Fires once, unexpectedly, when #dora-trigger scrolls into view.
   Freezes the page behind a full-screen overlay until it resolves
   into the finale.
   ===================================================================== */
(function initDoraSequence() {
  const overlay = document.getElementById('dora-overlay');
  const stages = {
    connecting: document.getElementById('dora-stage-connecting'),
    intro: document.getElementById('dora-stage-intro'),
    success: document.getElementById('dora-stage-success'),
    video: document.getElementById('dora-stage-video'),
    grading: document.getElementById('dora-stage-grading'),
    whisper: document.getElementById('dora-stage-whisper'),
  };
  const connectText = document.getElementById('dora-connect-text');
  const speechLines = document.getElementById('dora-speech-lines');
  const doraForm = document.getElementById('dora-form');
  const doraInput = document.getElementById('dora-input');
  const mapAlert = document.getElementById('dora-map-alert');
  const swiper = document.getElementById('dora-swiper');
  const successLines = document.getElementById('dora-success-lines');
  const backpack = document.getElementById('dora-backpack');
  const folder = document.getElementById('dora-folder');
  const video = document.getElementById('dora-video');
  const videoCaption = document.getElementById('dora-video-caption');
  const tacoContainer = document.getElementById('taco-rain-container');
  const whisperLines = document.getElementById('dora-whisper-lines');

  let fired = false;
  let tacoInterval = null;

  function showStage(name) {
    Object.values(stages).forEach((s) => s.classList.add('hidden'));
    stages[name].classList.remove('hidden');
  }

  /* type a sequence of lines into a target element, one at a time */
  function playLines(target, lines, gap, onDone) {
    let i = 0;
    function next() {
      if (i >= lines.length) { if (onDone) onDone(); return; }
      target.style.animation = 'none';
      void target.offsetWidth;
      target.textContent = lines[i];
      target.style.animation = 'fadeInUp 0.5s ease';
      playBeep(560 + i * 20, 0.06, 'sine', 0.03);
      i++;
      setTimeout(next, gap);
    }
    next();
  }

  function startSequence() {
    document.body.style.overflow = 'hidden';
    overlay.classList.add('active');
    requestAnimationFrame(() => overlay.classList.add('show'));
    showStage('connecting');

    const connectSteps = [
      'Connecting to the International Spanish Department...',
      'Loading...',
      'Loading...',
      'Connection established.',
    ];
    let ci = 0;
    const connectInterval = setInterval(() => {
      ci++;
      if (ci < connectSteps.length) {
        connectText.textContent = connectSteps[ci];
      } else {
        clearInterval(connectInterval);
        setTimeout(introStage, 500);
      }
    }, 850);
  }

  function introStage() {
    showStage('intro');
    doraForm.classList.add('hidden');
    doraInput.value = '';
    const introLines = ['¡Hola! Soy Dora!', 'Today we\'re looking for...', 'The birthday girl!', 'Can you help me?'];
    playLines(speechLines, introLines, 1000, () => {
      doraForm.classList.remove('hidden');
      doraInput.focus();
    });
  }

  function handleWrongName() {
    doraForm.classList.add('hidden');
    const disappointedLines = ['Hmmm...', 'I don\'t think that\'s right.', 'Maybe try again!'];
    playLines(speechLines, disappointedLines, 1000, () => {
      mapAlert.classList.remove('hidden');
      playBeep(220, 0.3, 'sawtooth', 0.05);
      setTimeout(() => {
        mapAlert.classList.add('hidden');
        doraForm.classList.add('swiped');
        swiper.classList.remove('hidden');
        setTimeout(() => {
          swiper.classList.add('hidden');
          doraForm.classList.remove('swiped', 'hidden');
          doraInput.value = '';
          speechLines.textContent = 'Try again!';
          doraInput.focus();
        }, 1000);
      }, 1200);
    });
  }

  function handleCorrectName() {
    doraForm.classList.add('hidden');
    Confetti.burst(160);
    playSuccess();
    showStage('success');
    const successMsgs = ['WE DID IT!!', '¡Lo hicimos!'];
    playLines(successLines, successMsgs, 1100, () => {
      backpack.classList.remove('hidden');
      setTimeout(() => {
        folder.classList.remove('hidden');
        setTimeout(() => {
          successLines.textContent = 'Let\'s watch it together!';
          setTimeout(videoStage, 1700);
        }, 1300);
      }, 700);
    });
  }

  doraForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = doraInput.value.trim().toLowerCase();
    playClick();
    if (name === 'nada') handleCorrectName();
    else handleWrongName();
  });

  function spawnTaco() {
    const items = ['🌮', '🌯', '🥑', '🌶️'];
    const el = document.createElement('span');
    el.className = 'taco-emoji';
    el.textContent = items[Math.floor(Math.random() * items.length)];
    const size = 1.4 + Math.random() * 1.4;
    el.style.left = Math.random() * 92 + 'vw';
    el.style.fontSize = size + 'rem';
    el.style.setProperty('--end-x', (Math.random() * 140 - 70) + 'px');
    const dur = 2.2 + Math.random() * 1.6;
    el.style.animationDuration = dur + 's';
    tacoContainer.appendChild(el);
    setTimeout(() => el.remove(), dur * 1000 + 200);
  }

  function videoStage() {
    showStage('video');
    const captions = ['¡Muy bien!', 'Excelente!', 'Chef Nada!!', 'Five Michelin stars!', 'Estoy orgullosa de ti!'];
    let capIndex = 0;
    videoCaption.textContent = captions[0];
    const captionInterval = setInterval(() => {
      capIndex = (capIndex + 1) % captions.length;
      videoCaption.textContent = captions[capIndex];
    }, 2400);

    tacoInterval = setInterval(spawnTaco, 220);

    let ended = false;
    function finishVideo() {
      if (ended) return;
      ended = true;
      clearInterval(tacoInterval);
      clearInterval(captionInterval);
      tacoContainer.innerHTML = '';
      video.pause();
      setTimeout(gradingStage, 400);
    }

    video.addEventListener('ended', finishVideo, { once: true });
    video.play().catch(() => { /* no video file yet — fall back to a timed demo below */ });

    // Fallback so the story keeps moving even before a real video file is added
    setTimeout(finishVideo, 9000);
  }

  function gradingStage() {
    showStage('grading');
    setTimeout(() => {
      document.getElementById('grade-bar-1').style.width = '100%';
      document.getElementById('grade-bar-2').style.width = '100%';
      document.getElementById('grade-bar-4').style.width = '100%';
      playSuccess();
    }, 200);
    setTimeout(whisperStage, 4200);
  }

  function whisperStage() {
    showStage('whisper');
    const lines = ['But wait...', 'I heard Abdulaziz has something to say...'];
    playLines(whisperLines, lines, 1400, () => {
      setTimeout(closeSequence, 1200);
    });
  }

  function closeSequence() {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      // Don't jump anywhere — just hand control back to the page exactly
      // where it was interrupted (right after the dashboard, at the top
      // of the journey section), so scrolling continues normally from there.
    }, 650);
  }

  const trigger = document.getElementById('dora-trigger');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        startSequence();
      }
    });
  }, { threshold: 0.1 });
  observer.observe(trigger);
})();
