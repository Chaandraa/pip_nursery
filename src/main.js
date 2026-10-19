/**
 * PIP'S MIDNIGHT NURSERY — SCROLL-DRIVEN INTERACTIVE ENGINE
 * Track 1: Pip the Skull Baby
 * Architectural inspiration: Léo Parpeix (Full-screen chapters, staged reveals, HUD)
 *                           Mild Sugar Design (Integrated character, tactile warmth)
 */

// --- 1. SINGLE SOURCE OF TRUTH: SHARED STATE MODEL ---
const appState = {
  theme: localStorage.getItem('pip-nursery-theme') || 'day',
  activeChapter: 'chapter-hero',
  prototypes: {
    lullaby: {
      tuneIndex: 0,
      isPlaying: false,
      isMuted: true,
    },
    nightlight: {
      preset: 'gold', // 'gold' | 'moonmilk' | 'lavender' | 'plum'
    },
    delivery: {
      payload: 'sweet',
      isDelivering: false,
      statusMsg: 'Courier ready at Nursery Base',
    }
  },
  easterEgg: {
    clicks: 0,
    unlocked: false,
  }
};

// Tunes Configuration
const LULLABY_TUNES = [
  {
    name: "Pip's Starlit Slumber Box",
    moodClass: "tune-mood-starlit",
    tempoMs: 440,
    bpm: "68 BPM",
    notes: [659.25, 739.99, 830.61, 987.77, 1108.73, 987.77, 830.61, 659.25, 739.99, 830.61, 1108.73, 1318.51, 1108.73, 987.77, 830.61, 659.25]
  },
  {
    name: "Cradle of the Little Skulls",
    moodClass: "tune-mood-cradle",
    tempoMs: 500,
    bpm: "58 BPM",
    notes: [523.25, 523.25, 659.25, 523.25, 659.25, 783.99, 659.25, 523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25, 523.25]
  },
  {
    name: "Constellation Waltz",
    moodClass: "tune-mood-constellation",
    tempoMs: 380,
    bpm: "72 BPM",
    notes: [880.00, 1108.73, 1318.51, 1661.22, 1318.51, 1108.73, 880.00, 739.99, 880.00, 1108.73, 1479.98, 1318.51, 1108.73, 880.00, 739.99, 659.25]
  }
];

// Nightlight Presets
const NIGHTLIGHT_PRESETS = {
  gold: {
    className: 'nightlight-preset-gold',
    label: 'Golden Dream Radiance (100% Cozy Amber)',
    glowStyle: 'glow-gold'
  },
  moonmilk: {
    className: 'nightlight-preset-moonmilk',
    label: 'Moonmilk Cream (Soft Ivory Moonlight)',
    glowStyle: 'glow-moonmilk'
  },
  lavender: {
    className: 'nightlight-preset-lavender',
    label: 'Rosy Lavender (Calms Restless Thoughts)',
    glowStyle: 'glow-lavender'
  },
  plum: {
    className: 'nightlight-preset-plum',
    label: 'Midnight Plum (Deep Celestial Slumber)',
    glowStyle: 'glow-plum'
  }
};

// Sleepy Pip Bedtime Thoughts
const PIP_SLEEPY_THOUGHTS = [
  "“Yawwn... is that you? I was just tuning my music box.” 💤",
  "“Stardust tickles my skull, but my starry nightcap keeps it cozy!” 🎀",
  "“Silence feels too big for small ears. That’s why I engineer lullabies.” ♫",
  "“I just mixed a dream of floating safely on marshmallow clouds.” ☁️",
  "“Careful with that stardust canister—clumsy fingers at work!” ✨",
  "“Every sweet dream begins with a slow, heavy blink.” 🌙",
  "“You are safe in the midnight nursery tonight. Sweet dreams!” 💛"
];

// --- 2. AMBIENT STARFIELD GENERATION ---
function initStarfield() {
  const starContainer = document.getElementById('starField');
  if (!starContainer) return;

  const starCount = window.innerWidth < 768 ? 30 : 65;
  starContainer.innerHTML = '';

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('span');
    star.className = 'star-dot';
    const size = Math.random() * 3 + 1.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDelay = `${(Math.random() * 4).toFixed(1)}s`;
    star.style.animationDuration = `${(Math.random() * 3 + 2.5).toFixed(1)}s`;
    starContainer.appendChild(star);
  }
}

// --- 3. DAY / NIGHT GLOBAL ATMOSPHERE TOGGLE ---
function applyTheme(newTheme) {
  appState.theme = newTheme;
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('pip-nursery-theme', newTheme);

  const themeLabel = document.getElementById('themeBtnLabel');
  if (themeLabel) {
    themeLabel.textContent = newTheme === 'day' ? 'Night Mode' : 'Day Mode';
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', newTheme === 'day' ? '#FFF8F1' : '#211D32');
  }
}

function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  applyTheme(appState.theme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const targetTheme = appState.theme === 'day' ? 'night' : 'day';
      applyTheme(targetTheme);
    });
  }
}

// --- 4. SCROLL-DRIVEN CHAPTER SYSTEM (LÉO PARPEIX ARCHITECTURE) ---
function initScrollChapters() {
  const chapters = document.querySelectorAll('.scroll-chapter');
  const hudDots = document.querySelectorAll('.hud-dot');
  const hudLabel = document.getElementById('hudChapterLabel');
  const navLinks = document.querySelectorAll('.nav-link[data-nav-target]');

  if (!chapters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const chapterId = entry.target.id;
        const chapterNum = entry.target.getAttribute('data-chapter');
        appState.activeChapter = chapterId;

        // Activate word reveals and scene animation
        entry.target.classList.add('chapter-active');

        // Update side HUD indicator
        hudDots.forEach(dot => {
          const isTarget = dot.getAttribute('data-target') === chapterId;
          dot.classList.toggle('active', isTarget);
        });

        if (hudLabel && chapterNum) {
          hudLabel.textContent = `CH ${chapterNum} / 06`;
        }

        // Update top nav links
        navLinks.forEach(link => {
          const isTarget = link.getAttribute('data-nav-target') === chapterId;
          link.classList.toggle('active', isTarget);
        });

        // Update floating guide companion
        updateScrollGuideForChapter(chapterId);
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '-5% 0px -25% 0px'
  });

  chapters.forEach(ch => observer.observe(ch));

  // HUD click handlers for smooth chapter navigation
  hudDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// --- 5. WEB AUDIO API SYNTHESIZER & PROTOTYPE 01: LULLABY LAB ---
let audioCtx = null;
let lullabyTimer = null;
let currentNoteIndex = 0;
let lullabyNoteInterval = null;

function initAudioContext() {
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

function playChimeNote(freq) {
  if (!audioCtx || appState.prototypes.lullaby.isMuted) return;

  const now = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2.002, now);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.06, now + 0.35);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 1.25);
  osc2.stop(now + 1.25);

  spawnFloatingNote();
}

function spawnFloatingNote() {
  const container = document.getElementById('floatingNotes');
  if (!container) return;

  const notes = ['♩', '♪', '♫', '♬', '✦', '✨'];
  const noteEl = document.createElement('span');
  noteEl.className = 'music-note-float';
  noteEl.textContent = notes[Math.floor(Math.random() * notes.length)];
  noteEl.style.left = `${Math.random() * 60 + 20}%`;
  noteEl.style.bottom = '20%';

  container.appendChild(noteEl);
  setTimeout(() => noteEl.remove(), 2200);
}

function spawnPipReactionNote() {
  const container = document.getElementById('pipReactionNotes');
  if (!container) return;

  const notes = ['♪', '♫', '♬', '✨'];
  const noteEl = document.createElement('span');
  noteEl.className = 'pip-sway-note';
  noteEl.textContent = notes[Math.floor(Math.random() * notes.length)];
  noteEl.style.left = `${Math.random() * 50 + 25}%`;
  noteEl.style.top = `${Math.random() * 30 + 35}%`;

  container.appendChild(noteEl);
  setTimeout(() => noteEl.remove(), 2000);
}

function selectLullabyTune(index) {
  appState.prototypes.lullaby.tuneIndex = index;
  const tune = LULLABY_TUNES[index];
  const chapterScene = document.getElementById('chapter-lullaby');
  const trackName = document.getElementById('trackName');
  const buttons = document.querySelectorAll('.tune-pill-btn');

  // Update whole chapter atmosphere
  if (chapterScene) {
    chapterScene.classList.remove('tune-mood-starlit', 'tune-mood-cradle', 'tune-mood-constellation');
    chapterScene.classList.add(tune.moodClass);
  }

  if (trackName) {
    trackName.textContent = `"${tune.name}"`;
  }

  // Update button active state
  buttons.forEach((btn, idx) => {
    const isTarget = idx === index;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-pressed', isTarget.toString());
  });

  // If currently playing, restart playback with the new tune immediately
  if (appState.prototypes.lullaby.isPlaying) {
    startLullaby();
  }
}

function startLullaby() {
  initAudioContext();
  appState.prototypes.lullaby.isMuted = false;
  appState.prototypes.lullaby.isPlaying = true;

  updateAudioUI();
  triggerCharacterReaction('lullaby');

  const tune = LULLABY_TUNES[appState.prototypes.lullaby.tuneIndex];
  currentNoteIndex = 0;

  clearInterval(lullabyTimer);
  lullabyTimer = setInterval(() => {
    if (!appState.prototypes.lullaby.isPlaying || appState.prototypes.lullaby.isMuted) return;
    const note = tune.notes[currentNoteIndex];
    playChimeNote(note);
    currentNoteIndex = (currentNoteIndex + 1) % tune.notes.length;
  }, tune.tempoMs);

  clearInterval(lullabyNoteInterval);
  lullabyNoteInterval = setInterval(() => {
    if (appState.prototypes.lullaby.isPlaying && !appState.prototypes.lullaby.isMuted) {
      spawnPipReactionNote();
    }
  }, 900);
}

function stopLullaby() {
  appState.prototypes.lullaby.isPlaying = false;
  clearInterval(lullabyTimer);
  clearInterval(lullabyNoteInterval);
  updateAudioUI();
  clearCharacterReaction('lullaby');
}

function toggleGlobalAudio() {
  if (appState.prototypes.lullaby.isPlaying) {
    stopLullaby();
    appState.prototypes.lullaby.isMuted = true;
  } else {
    appState.prototypes.lullaby.isMuted = false;
    startLullaby();
  }
  updateAudioUI();
}

function updateAudioUI() {
  const globalBtn = document.getElementById('globalAudioToggle');
  const globalLabel = document.getElementById('audioBtnLabel');
  const playBtn = document.getElementById('lullabyPlayBtn');
  const stopBtn = document.getElementById('lullabyStopBtn');
  const playText = document.getElementById('playBtnText');
  const playIcon = document.getElementById('playIcon');
  const led = document.getElementById('lullabyLed');
  const stage = document.getElementById('musicBoxStage');

  if (appState.prototypes.lullaby.isPlaying && !appState.prototypes.lullaby.isMuted) {
    if (globalBtn) globalBtn.classList.add('audio-playing');
    if (globalLabel) globalLabel.textContent = 'Playing ♫';
    if (playText) playText.textContent = 'Pause Melody';
    if (playIcon) playIcon.textContent = '❚❚';
    if (stopBtn) stopBtn.disabled = false;
    if (led) led.classList.add('active');
    if (stage) stage.classList.add('playing');
  } else {
    if (globalBtn) globalBtn.classList.remove('audio-playing');
    if (globalLabel) globalLabel.textContent = 'Muted';
    if (playText) playText.textContent = 'Play Lullaby';
    if (playIcon) playIcon.textContent = '▶';
    if (stopBtn) stopBtn.disabled = true;
    if (led) led.classList.remove('active');
    if (stage) stage.classList.remove('playing');
  }
}

function initLullabyLab() {
  const playBtn = document.getElementById('lullabyPlayBtn');
  const stopBtn = document.getElementById('lullabyStopBtn');
  const nextTuneBtn = document.getElementById('lullabyNextTuneBtn');
  const globalToggle = document.getElementById('globalAudioToggle');
  const tuneButtons = document.querySelectorAll('.tune-pill-btn');

  // Initialize initial atmosphere
  selectLullabyTune(appState.prototypes.lullaby.tuneIndex);

  tuneButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      selectLullabyTune(index);
    });
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (appState.prototypes.lullaby.isPlaying) {
        stopLullaby();
      } else {
        startLullaby();
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', stopLullaby);
  }

  if (globalToggle) {
    globalToggle.addEventListener('click', toggleGlobalAudio);
  }

  if (nextTuneBtn) {
    nextTuneBtn.addEventListener('click', () => {
      const nextIdx = (appState.prototypes.lullaby.tuneIndex + 1) % LULLABY_TUNES.length;
      selectLullabyTune(nextIdx);
    });
  }
}

// --- 6. PROTOTYPE 02: NIGHTLIGHT COLLECTION ---
function selectNightlightPreset(presetKey) {
  if (!NIGHTLIGHT_PRESETS[presetKey]) return;

  appState.prototypes.nightlight.preset = presetKey;
  const config = NIGHTLIGHT_PRESETS[presetKey];
  const chapterScene = document.getElementById('chapter-nightlight');
  const statusVal = document.getElementById('lanternStatusVal');
  const buttons = document.querySelectorAll('.lantern-preset-grid .preset-pill-btn');

  // GENUINELY TRANSFORM THE ENTIRE FULL-SCREEN CHAPTER
  if (chapterScene) {
    chapterScene.classList.remove('nightlight-preset-gold', 'nightlight-preset-moonmilk', 'nightlight-preset-lavender', 'nightlight-preset-plum');
    chapterScene.classList.add(config.className);
  }

  if (statusVal) {
    statusVal.textContent = config.label;
  }

  buttons.forEach(btn => {
    const isTarget = btn.getAttribute('data-glow') === presetKey;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-pressed', isTarget.toString());
  });

  // Contextual character lighting reaction
  triggerCharacterReaction('lantern', presetKey);
}

function initNightlightLab() {
  const lanternImg = document.getElementById('dreamLanternImg');
  const buttons = document.querySelectorAll('.lantern-preset-grid .preset-pill-btn');

  // Set default initial state
  selectNightlightPreset(appState.prototypes.nightlight.preset);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-glow');
      selectNightlightPreset(presetKey);
    });
  });

  // Clicking lantern directly cycles through presets
  if (lanternImg) {
    lanternImg.addEventListener('click', () => {
      const keys = Object.keys(NIGHTLIGHT_PRESETS);
      const currentIndex = keys.indexOf(appState.prototypes.nightlight.preset);
      const nextKey = keys[(currentIndex + 1) % keys.length];
      selectNightlightPreset(nextKey);
    });

    lanternImg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lanternImg.click();
      }
    });
  }
}

// --- 7. PROTOTYPE 03: DREAM DELIVERY ROUTES ---
function initDreamDelivery() {
  const launchBtn = document.getElementById('launchDeliveryBtn');
  const path = document.getElementById('flightPath');
  const courier = document.getElementById('dreamCourier');
  const msg = document.getElementById('deliveryMsg');
  const select = document.getElementById('dreamPayloadSelect');
  const waypoint = document.getElementById('destWaypoint');

  if (!launchBtn || !path || !courier) return;

  const pathLength = path.getTotalLength();

  if (select) {
    select.addEventListener('change', () => {
      appState.prototypes.delivery.payload = select.value;
      const cargoName = select.options[select.selectedIndex].text;
      if (msg) msg.textContent = `Payload configured: ${cargoName}`;
    });
  }

  launchBtn.addEventListener('click', () => {
    if (appState.prototypes.delivery.isDelivering) return;
    appState.prototypes.delivery.isDelivering = true;
    launchBtn.disabled = true;

    const payloadName = select ? select.options[select.selectedIndex].text : 'Starry Dreams';
    if (msg) msg.textContent = `🚀 In flight: Dispatching ${payloadName}...`;

    triggerCharacterReaction('delivery');

    const startTime = performance.now();
    const duration = 3400;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const point = path.getPointAtLength(eased * pathLength);
      courier.setAttribute('transform', `translate(${point.x}, ${point.y})`);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        appState.prototypes.delivery.isDelivering = false;
        launchBtn.disabled = false;
        if (msg) {
          msg.textContent = `✨ Successfully Delivered to Pillow Fort! Sweet dreams! 💤`;
        }
        if (waypoint) {
          waypoint.textContent = 'Pillow Fort (Delivery Confirmed ★)';
        }

        setTimeout(() => {
          if (!appState.prototypes.delivery.isDelivering) {
            courier.setAttribute('transform', 'translate(60, 180)');
          }
        }, 3200);
      }
    }

    requestAnimationFrame(step);
  });
}

// --- 8. CHARACTER CONTEXTUAL REACTIONS & SPEECH ---
function setPipSpeech(text) {
  const bubble = document.getElementById('pipSpeechBubble');
  if (!bubble) return;
  const bubbleText = bubble.querySelector('.bubble-text');
  if (bubbleText) {
    bubbleText.style.opacity = '0';
    setTimeout(() => {
      bubbleText.textContent = text;
      bubbleText.style.opacity = '1';
    }, 120);
  }
}

function triggerCharacterReaction(type, mode) {
  const monument = document.getElementById('pipStage');
  const guideIcon = document.getElementById('guideReactionIcon');
  const guideCaption = document.getElementById('guideCaption');

  if (type === 'lullaby') {
    if (monument) monument.classList.add('pip-listening-lullaby');
    setPipSpeech("“♫ Mmm, my favorite lullaby... so much better than silence!”");
    if (guideIcon) guideIcon.textContent = '🎶';
    if (guideCaption) guideCaption.textContent = '“Listening to the lullaby chimes ♫”';
  } else if (type === 'lantern') {
    if (monument) {
      monument.classList.add('pip-lantern-warmed');
      setTimeout(() => {
        if (!appState.prototypes.lullaby.isPlaying) {
          monument.classList.remove('pip-lantern-warmed');
        }
      }, 4000);
    }
    setPipSpeech("“Ahh, that warm lantern light chases all bad dreams away! ✨”");
    if (guideIcon) guideIcon.textContent = '🏮';
  } else if (type === 'delivery') {
    if (monument) {
      monument.classList.add('pip-cheering-delivery');
      setTimeout(() => {
        monument.classList.remove('pip-cheering-delivery');
      }, 2400);
    }
    setPipSpeech("“Fly safe, little dream parcel! Pillow Fort is waiting! 🚀📦”");
    if (guideIcon) guideIcon.textContent = '📦';
  }
}

function clearCharacterReaction(type) {
  const monument = document.getElementById('pipStage');
  const guideIcon = document.getElementById('guideReactionIcon');

  if (type === 'lullaby' && monument) {
    monument.classList.remove('pip-listening-lullaby');
    setPipSpeech("“The lullaby ended... who wants another cozy dream?”");
    if (guideIcon) guideIcon.textContent = '✨';
  }
}

// --- 9. PIP POINTER / TILT PHYSICS (DESKTOP LERP) & TOUCH FEEDBACK ---
function initPipPointerMovement() {
  const pipWrap = document.getElementById('pipHeroWrap');
  const heroSection = document.getElementById('chapter-hero');
  if (!pipWrap || !heroSection) return;

  let currentTiltX = 0, currentTiltY = 0, currentShiftX = 0, currentShiftY = 0;
  let targetTiltX = 0, targetTiltY = 0, targetShiftX = 0, targetShiftY = 0;
  let isPointerOver = false;

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isFinePointer && !isReducedMotion) {
    function updatePipTilt() {
      const damp = 0.08;
      if (isPointerOver) {
        currentTiltX += (targetTiltX - currentTiltX) * damp;
        currentTiltY += (targetTiltY - currentTiltY) * damp;
        currentShiftX += (targetShiftX - currentShiftX) * damp;
        currentShiftY += (targetShiftY - currentShiftY) * damp;
      } else {
        currentTiltX += (0 - currentTiltX) * damp;
        currentTiltY += (0 - currentTiltY) * damp;
        currentShiftX += (0 - currentShiftX) * damp;
        currentShiftY += (0 - currentShiftY) * damp;
      }

      pipWrap.style.transform = `perspective(900px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg) translate3d(${currentShiftX.toFixed(1)}px, ${currentShiftY.toFixed(1)}px, 0)`;
      requestAnimationFrame(updatePipTilt);
    }
    requestAnimationFrame(updatePipTilt);

    heroSection.addEventListener('mousemove', (e) => {
      isPointerOver = true;
      const rect = pipWrap.getBoundingClientRect();
      const pipCenterX = rect.left + rect.width / 2;
      const pipCenterY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - pipCenterX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - pipCenterY) / (window.innerHeight / 2);

      targetTiltX = -deltaY * 7;
      targetTiltY = deltaX * 8;
      targetShiftX = deltaX * 6;
      targetShiftY = deltaY * 6;
    });

    heroSection.addEventListener('mouseleave', () => {
      isPointerOver = false;
      targetTiltX = 0;
      targetTiltY = 0;
      targetShiftX = 0;
      targetShiftY = 0;
    });
  }

  pipWrap.addEventListener('touchstart', () => {
    pipWrap.classList.add('pip-clicked');
    setTimeout(() => {
      pipWrap.classList.remove('pip-clicked');
    }, 450);
  }, { passive: true });
}

// --- 10. 5-CLICK PIP EASTER EGG & SECRET DRAWER ---
function initEasterEgg() {
  const pipHeroWrap = document.getElementById('pipHeroWrap');
  const openSecretBtn = document.getElementById('openSecretBtn');
  const secretModal = document.getElementById('secretModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalCloseBtn2 = document.getElementById('modalCloseBtn2');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const heroCounter = document.getElementById('heroTapCounter');
  const drawerCounter = document.getElementById('drawerClicksLeft');
  const bubble = document.getElementById('pipSpeechBubble');
  const sparklesContainer = document.getElementById('pipClickSparkles');

  const secretPhrases = [
    "“Giggle! That tickles!” ✨",
    "“Another tap! You are so close!” 🌟",
    "“Pip's secret drawer is unlocking!” 🗝️",
    "“Almost there! 4 down, 1 to go!” 🎀",
    "“TA-DA! The secret dream drawer is open!” 🎁"
  ];

  function openSecretDrawer() {
    if (!secretModal) return;
    secretModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeSecretDrawer() {
    if (!secretModal) return;
    secretModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  function handlePipClick() {
    appState.easterEgg.clicks = Math.min(appState.easterEgg.clicks + 1, 5);

    if (pipHeroWrap) {
      pipHeroWrap.classList.remove('pip-clicked');
      void pipHeroWrap.offsetWidth;
      pipHeroWrap.classList.add('pip-clicked');
      setTimeout(() => {
        pipHeroWrap.classList.remove('pip-clicked');
      }, 450);
    }

    if (heroCounter) heroCounter.textContent = `${appState.easterEgg.clicks}/5`;
    if (drawerCounter) drawerCounter.textContent = `${appState.easterEgg.clicks} / 5`;

    if (sparklesContainer) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle-trail-dot';
      sparkle.style.left = '50%';
      sparkle.style.top = '50%';
      sparklesContainer.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 600);
    }

    if (appState.easterEgg.clicks <= 5 && secretPhrases[appState.easterEgg.clicks - 1]) {
      setPipSpeech(secretPhrases[appState.easterEgg.clicks - 1]);
    } else {
      const randomThought = PIP_SLEEPY_THOUGHTS[Math.floor(Math.random() * PIP_SLEEPY_THOUGHTS.length)];
      setPipSpeech(randomThought);
    }

    if (appState.easterEgg.clicks >= 5) {
      setTimeout(openSecretDrawer, 350);
    }
  }

  if (pipHeroWrap) {
    pipHeroWrap.addEventListener('click', handlePipClick);
    pipHeroWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handlePipClick();
      }
    });
  }

  if (bubble) {
    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePipClick();
    });
  }

  if (openSecretBtn) openSecretBtn.addEventListener('click', openSecretDrawer);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeSecretDrawer);
  if (modalCloseBtn2) modalCloseBtn2.addEventListener('click', closeSecretDrawer);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeSecretDrawer);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && secretModal && !secretModal.hasAttribute('hidden')) {
      closeSecretDrawer();
    }
  });

  const navSecretLink = document.getElementById('navSecretLink');
  if (navSecretLink) {
    navSecretLink.addEventListener('click', (e) => {
      e.preventDefault();
      openSecretDrawer();
    });
  }
}

// --- 11. CHARACTER-LED SCROLL COMPANION ---
let scrollGuideTarget = 'chapter-lullaby';

function updateScrollGuideForChapter(chapterId) {
  const guideCaption = document.getElementById('guideCaption');
  const guideArrow = document.getElementById('guideArrow');
  const guideEl = document.getElementById('pipScrollGuide');

  const guideMap = {
    'chapter-hero': { caption: '“Wander into the Lullaby Lab ↓”', target: 'chapter-lullaby', arrow: '↓' },
    'chapter-lullaby': { caption: '“Explore the Nightlight Collection ↓”', target: 'chapter-nightlight', arrow: '↓' },
    'chapter-nightlight': { caption: '“Chart the Dream Delivery Routes ↓”', target: 'chapter-delivery', arrow: '↓' },
    'chapter-delivery': { caption: '“Hear Pip’s Origin Tale ↓”', target: 'chapter-origin', arrow: '↓' },
    'chapter-origin': { caption: '“Inspect Pip’s Official Dossier ↓”', target: 'chapter-engineer', arrow: '↓' },
    'chapter-engineer': { caption: '“Back to the top of the nursery ↑”', target: 'chapter-hero', arrow: '↑' }
  };

  if (guideMap[chapterId]) {
    if (guideCaption && !appState.prototypes.lullaby.isPlaying) {
      guideCaption.textContent = guideMap[chapterId].caption;
    }
    if (guideArrow) {
      guideArrow.textContent = guideMap[chapterId].arrow;
    }
    scrollGuideTarget = guideMap[chapterId].target;
  }

  // Show guide after scrolling 200px
  if (window.scrollY > 200 && guideEl) {
    guideEl.classList.add('guide-visible');
  } else if (guideEl) {
    guideEl.classList.remove('guide-visible');
  }
}

function initCharacterScrollGuide() {
  const guideBtn = document.getElementById('pipGuideBtn');
  const guideEl = document.getElementById('pipScrollGuide');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 200 && guideEl) {
      guideEl.classList.add('guide-visible');
    } else if (guideEl) {
      guideEl.classList.remove('guide-visible');
    }
  }, { passive: true });

  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      const targetEl = document.getElementById(scrollGuideTarget);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// --- 12. PIP RANDOM DIALOGUE GENERATOR (DOSSIER) ---
function initPipDialogue() {
  const btn = document.getElementById('pipRandomQuoteBtn');
  const output = document.getElementById('dialogueOutput');
  if (!btn || !output) return;

  btn.addEventListener('click', () => {
    output.style.opacity = '0';
    setTimeout(() => {
      const nextQuote = PIP_SLEEPY_THOUGHTS[Math.floor(Math.random() * PIP_SLEEPY_THOUGHTS.length)];
      output.textContent = nextQuote;
      output.style.opacity = '1';
    }, 160);
  });
}

// --- 13. CURSOR SPARKLE TRAIL (FINE POINTERS) ---
function initCursorSparkleTrail() {
  if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let lastX = 0;
  let lastY = 0;
  let throttle = false;

  window.addEventListener('mousemove', (e) => {
    if (throttle) return;
    throttle = true;
    setTimeout(() => { throttle = false; }, 45);

    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (dist > 20) {
      lastX = e.clientX;
      lastY = e.clientY;

      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle-trail-dot';
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      document.body.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 600);
    }
  });
}

// --- 14. MOBILE MENU TOGGLE ---
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', (!isExpanded).toString());
    navMenu.classList.toggle('nav-open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('nav-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- 15. INITIALIZE ON DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initThemeToggle();
  initScrollChapters();
  initLullabyLab();
  initNightlightLab();
  initDreamDelivery();
  initPipPointerMovement();
  initEasterEgg();
  initCharacterScrollGuide();
  initPipDialogue();
  initCursorSparkleTrail();
  initMobileMenu();

  window.addEventListener('resize', () => {
    initStarfield();
  });
});
