/**
 * main.js — Entry point and module wiring.
 *
 * This file is the only place that imports from multiple layers and
 * wires them together. It owns screen transitions and top-level
 * event listeners (play button, language buttons, Escape key).
 *
 * Implemented across Issues #4, #7, #8, #11, #13, #19, #20, #21.
 */

import { getPreferences, savePreferences } from './utils/storage.js';
import { init as initAudio, playAmbient } from './audio/audioManager.js';
import { showScreen } from './ui/screenManager.js';

// Imports are added as each Issue is completed. Example structure:
//
// import { createRunState }   from './state.js';
// import { showScreen }       from './ui/screenManager.js';
// import { init as initTyping }  from './engine/typingEngine.js';
// import { init as initEnemy }   from './engine/enemySystem.js';
// import { init as initWave }    from './engine/waveManager.js';
// import { init as initBoss }    from './engine/bossSystem.js';
// import { init as initUpgrade } from './engine/upgradeSystem.js';
// import { init as initHud }     from './ui/hudManager.js';
// import { init as initCode }    from './ui/codePanel.js';
// import { show as showIntro }   from './ui/waveIntroCard.js';
// import { show as showStats }   from './ui/statsScreen.js';
// import { init as initTracker } from './utils/statTracker.js';

// ── Audio ──────────────────────────────────────────────────────
const prefs = getPreferences();
initAudio(prefs);
playAmbient();

// ── Ghost canvas — chroma-key compositing ──────────────────────

/**
 * Loads the ghost animation video, removes the green screen in real-time
 * via per-pixel chroma key on a canvas, and crops the bottom 20% to hide
 * the watermark.
 */
function initGhostCanvas() {
  const canvas = document.getElementById('ghost-canvas');
  if (!canvas) {
    return;
  }

  // Main canvas renders at full screen — no getImageData calls here so no cap needed.
  const ctx = canvas.getContext('2d');

  // Small offscreen canvas used only for chroma key pixel processing.
  // Keeping it small makes getImageData fast; the result is drawn scaled-up to main canvas.
  const CHROMA_W = 480;
  const chromaCanvas = document.createElement('canvas');
  const chromaCtx = chromaCanvas.getContext('2d', { willReadFrequently: true });

  const video = document.createElement('video');
  silenceDecorativeVideo(video);
  video.src = 'media/Images%3AVideos/MainMenuGhostAni.mp4';
  video.loop = true;
  video.playsInline = true;
  video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(video);

  // Ghost occupies 85% of the screen and is centred.
  const GHOST_SCALE = 0.96;

  /**
   * Matches the main canvas pixel dimensions to the current screen size.
   */
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);

  video.addEventListener('loadedmetadata', () => {
    // Set chroma canvas height to preserve the video's aspect ratio at CHROMA_W.
    const srcAspect = video.videoWidth / (video.videoHeight * 0.8);
    chromaCanvas.width = CHROMA_W;
    chromaCanvas.height = Math.ceil(CHROMA_W / srcAspect);

    resizeCanvas();
    video.play().catch(() => {});
    requestAnimationFrame(drawFrame);
  });

  video.addEventListener('error', () => {
    canvas.style.display = 'none';
  });

  /**
   * Each frame: chroma-key the video on the small offscreen canvas, then draw
   * the result scaled-up and centred at 85% of screen size on the main canvas.
   * Bottom 20% of the source is cropped to remove the watermark.
   */
  function drawFrame() {
    if (video.readyState >= 2 && !video.paused && !video.ended) {
      const srcW = video.videoWidth;
      const srcH = video.videoHeight * 0.8; // crop watermark

      // ── Step 1: draw video into small chroma canvas and key out green ──
      chromaCtx.clearRect(0, 0, chromaCanvas.width, chromaCanvas.height);
      chromaCtx.drawImage(video, 0, 0, srcW, srcH, 0, 0, chromaCanvas.width, chromaCanvas.height);

      const frame = chromaCtx.getImageData(0, 0, chromaCanvas.width, chromaCanvas.height);
      const px = frame.data;

      for (let i = 0; i < px.length; i += 4) {
        const r = px[i];
        const g = px[i + 1];
        const b = px[i + 2];

        if (g > 100 && g - r > 35 && g - b > 35) {
          px[i + 3] = 0;
          continue;
        }

        // Soft edge for a smoother outline.
        const dominance = Math.min(g - r, g - b);
        if (g > 80 && dominance > 15) {
          px[i + 3] = Math.floor(px[i + 3] * (1 - (dominance - 15) / 25));
        }
      }

      chromaCtx.putImageData(frame, 0, 0);

      // ── Step 2: scale-up keyed result to 85% of screen, centred ──────
      const cw = canvas.width;
      const ch = canvas.height;
      const ghostAspect = chromaCanvas.width / chromaCanvas.height;
      const maxW = cw * GHOST_SCALE;
      const maxH = ch * GHOST_SCALE;

      let dw, dh;
      if (ghostAspect > maxW / maxH) {
        dw = maxW;
        dh = dw / ghostAspect;
      } else {
        dh = maxH;
        dw = dh * ghostAspect;
      }

      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(chromaCanvas, dx, dy, dw, dh);
    }

    requestAnimationFrame(drawFrame);
  }
}

/**
 * Keeps the background animation visual-only so the ambient MP3 is the only
 * menu audio. Some browsers can restore media volume during load/play events,
 * so enforce silence both before and after playback starts.
 * @param {HTMLVideoElement} video - Decorative background animation video.
 */
function silenceDecorativeVideo(video) {
  const enforceSilentVideo = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute('muted', '');
  };

  enforceSilentVideo();
  video.addEventListener('play', enforceSilentVideo);
  video.addEventListener('volumechange', enforceSilentVideo);
}

initGhostCanvas();

// ── Navigation ─────────────────────────────────────────────────

document.getElementById('play-btn').addEventListener('click', () => {
  playAmbient();
  showScreen('language-screen');
});

const LAUGH_SRCS = [
  'media/Music%3ASound%20Effects/EvilLaughs/EvilLaugh1.mp3',
  'media/Music%3ASound%20Effects/EvilLaughs/EvilLaugh2.mp3',
  'media/Music%3ASound%20Effects/EvilLaughs/EvilLaugh3.mp3',
];

const SCARE_SRCS = [
  'media/Images%3AVideos/SpookyGhosts/806f58fc232af3448744d7a9ee9edb60_565ca43ff639fbd79141d944106c5e72.avif',
  'media/Images%3AVideos/SpookyGhosts/b1850465bd6924a070c94ac980cbd240.jpg',
  'media/Images%3AVideos/SpookyGhosts/ghostly-figure-shrouded-in-mist-on-a-transparent-background-evokes-a-sense-of-mystery-paranormal-ghost-background-free-png.webp',
  'media/Images%3AVideos/SpookyGhosts/haunted.webp',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Starts drawing random grayscale noise on the static canvas indefinitely.
 * Returns a stop() function that hides the overlay and halts rendering.
 * Uses a low-res canvas (320×180) scaled up with pixelated rendering for
 * an authentic CRT look without per-frame allocation of a full-res buffer.
 * @returns {() => void} stop - Call to hide the static overlay.
 */
function showStatic() {
  const overlay = document.getElementById('static-overlay');
  const canvas = document.getElementById('static-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 320;
  canvas.height = 180;
  overlay.classList.remove('hidden');

  let running = true;

  function tick() {
    if (!running) return;
    const img = ctx.createImageData(320, 180);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  return () => {
    running = false;
    overlay.classList.add('hidden');
  };
}

/**
 * Plays the countdown video full-screen, then shows TV static for 1 s,
 * then fires the scream and ghost image scare before calling onComplete.
 * Evil laugh plays immediately on language select.
 * @param {() => void} onComplete - Called once the scare sequence finishes.
 */
function playLanguageTransition(onComplete) {
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownVideo = document.getElementById('countdown-video');
  const scareOverlay = document.getElementById('scare-overlay');
  const scareImg = document.getElementById('scare-img');

  new Audio(pickRandom(LAUGH_SRCS)).play().catch(() => {});

  countdownOverlay.classList.remove('hidden');
  countdownVideo.src = 'media/Images%3AVideos/Countdown.mp4';
  countdownVideo.play().catch(() => {});

  countdownVideo.addEventListener(
    'ended',
    () => {
      countdownOverlay.classList.add('hidden');

      const stopStatic = showStatic();

      let done = false;
      const proceed = () => {
        if (done) return;
        done = true;
        stopStatic();
        onComplete();
        setTimeout(() => scareOverlay.classList.add('hidden'), 250);
      };

      setTimeout(() => {
        const scream = new Audio('media/Music%3ASound%20Effects/SCREAM.mp3');
        scream.play().catch(() => {});
        scream.addEventListener('ended', proceed, { once: true });
        setTimeout(proceed, 5000);
      }, 250);

      setTimeout(() => {
        scareImg.src = pickRandom(SCARE_SRCS);
        scareOverlay.classList.remove('hidden');
      }, 750);
    },
    { once: true },
  );
}

document.querySelectorAll('.btn-language').forEach((btn) => {
  btn.addEventListener('click', () => {
    const language = btn.dataset.language;
    savePreferences({ ...prefs, language });
    playLanguageTransition(() => showScreen('wave-intro-screen'));
  });
});

console.log('Phantom Type — main.js loaded');
