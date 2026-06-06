/**
 * main.js — Entry point and module wiring.
 *
 * This file is the only place that imports from multiple layers and
 * wires them together. It owns screen transitions and top-level
 * event listeners (play button, language buttons, Escape key).
 *
 * Implemented across Issues #4, #7, #8, #11, #13, #19, #20, #21.
 */

import { createRunState } from './state.js';
import {
  init as initAudio,
  pause as pauseAudio,
  playAmbient,
  playMenuMusic,
  stopMenuMusic,
  playSFX as playSfx,
  resume as resumeAudio,
  setMusicVolume,
  setSFXVolume,
  mute,
  unmute,
} from './audio/audioManager.js';
import * as bossSystem from './engine/bossSystem.js';
import * as enemySystem from './engine/enemySystem.js';
import {
  activate as activateTyping,
  clearTarget as clearTypingTarget,
  deactivate as deactivateTyping,
  init as initTyping,
  isActive as isTypingActive,
} from './engine/typingEngine.js';
import * as waveManager from './engine/waveManager.js';
import * as bossView from './ui/bossView.js';
import {
  init as initCodePanel,
  reset as resetCodePanel,
  revealLineAt,
  showFull,
} from './ui/codePanel.js';
import * as statTracker from './utils/statTracker.js';
import { getCurrentScreen, showScreen } from './ui/screenManager.js';
import { show as showStats } from './ui/statsScreen.js';
import { show as showWaveIntro } from './ui/waveIntroCard.js';
import { getPreferences, saveLanguage } from './utils/storage.js';
import { show as showUpgradeScreen } from './ui/upgradeScreen.js';

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
playMenuMusic();

// ── Lives System (Issue #12) ───────────────────────────────────
// One RunState per run; created when the player picks a language.
// The enemy system fires onDeadlineBreach when a ghost crosses the
// deadline; main.js owns the life-deduction + run-end logic so the
// engine never has to import UI modules (see ADR-003).

/** @type {ReturnType<typeof createRunState> | null} */
let runState = null;

/**
 * True when Foresight already pre-revealed the line the player is
 * currently typing. Prevents a double-reveal when onDefeated fires.
 * Reset at the start of every wave so it never leaks across waves.
 * @type {boolean}
 */
let nextLinePreRevealed = false;

const livesDisplayEl = document.getElementById('lives-display');
const playAreaEl = document.getElementById('play-area');
const deadlineEl = document.getElementById('deadline-line');
const typingInputEl = document.getElementById('typing-input');
const targetLineDisplayEl = document.getElementById('target-line-display');

// ── Per-wave mistake tracking (Issue #19) ──────────────────────
// The stat tracker only counts errors, so we capture character-level
// mistakes here for the wave-stats screen. Keyed by "<expected>\u0000<typed>"
// (a null char separator that can't collide with real code characters).
const waveMistakes = new Map();
// True while the typed prefix is currently wrong. Prevents counting the
// same mistake repeatedly as the player keeps typing without fixing it.
let typingHadError = false;

const MAX_MISTAKES_SHOWN = 5;
const WAVE_STATS_AUTO_ADVANCE_MS = 4000; // auto-advance to upgrades
const WAVE_STATS_KEY_ARM_MS = 400; // delay before a keypress can dismiss
const VIBE_VANISH_BUFFER_PADDING = 12;

// Issue #50 pause-menu: Overlay controls and pause state live in main.js.
const pauseOverlayEl = document.getElementById('pause-overlay');
const resumeBtnEl = document.getElementById('resume-btn');
const quitBtnEl = document.getElementById('quit-btn');
const pauseSettingsBtnEl = document.getElementById('pause-settings-btn');

let isPaused = false;
let typingWasActiveBeforePause = false;
let typingWasDisabledBeforePause = false;

// ── Boss System (Issue #26) ───────────────────────────────────
// main.js wires boss engine callbacks to UI and audio modules so
// bossSystem can stay ADR-003 compliant and avoid importing across layers.
bossSystem.init({
  onIntroStart: (snippet) => {
    showFull(snippet.lines, snippet.language ?? runState?.language);
  },
  onEntranceStart: () => {
    bossView.showBoss();
    bossView.playEntrance();
    playSfx('boss-sting');
  },
  onProgressUpdate: (progress) => {
    bossView.updateProgress(progress);
  },
  onBossCleanup: () => {
    bossView.playDefeat();
  },
});

/**
 * Begins a new run: creates the shared RunState, wires the enemy system,
 * typing engine, and wave manager to our callbacks, and paints the initial HUD.
 * Called from the language-select button after the scare transition.
 * @param {string} language - 'javascript' | 'html' | 'css'.
 * @returns {void}
 */
function startRun(language) {
  runState = createRunState(language);
  statTracker.init(runState);

  enemySystem.init(playAreaEl, deadlineEl, runState, onDeadlineBreach);

  initTyping(
    typingInputEl,
    targetLineDisplayEl,
    // Route completed lines to the boss system during boss mode.
    // Otherwise, keep the normal wave enemy behavior and apply
    // Two Ghosts One Stone if the player owns it.
    () => {
      if (bossSystem.isActive()) {
        bossSystem.onLineDefeated();
        return;
      }

      const snippet = waveManager.getCurrentSnippet();
      // Read the true source index before onEnemyDefeated() advances the spawn cursor.
      const idx = waveManager.getCurrentLineIndex();

      // Foresight: if this line was already pre-revealed on the previous defeat,
      // skip the reveal call so the code panel index stays in sync.
      if (!nextLinePreRevealed) {
        revealLineAt(idx, snippet.lines[idx], runState.language);
      }
      nextLinePreRevealed = false;

      waveManager.onEnemyDefeated();

      // Two Ghosts One Stone: automatically defeat the next line too.
      if (runState?.twoGhostsOneStone && waveManager.getRemainingLinesCount() > 0) {
        window.setTimeout(() => waveManager.onEnemyDefeated(), 200);
      }

      // Foresight: pre-reveal the next upcoming line in the code panel so
      // the player can see what's coming while they type the current ghost.
      if (runState?.revealNext && waveManager.getRemainingLinesCount() > 0) {
        const nextIdx = waveManager.getCurrentLineIndex();
        revealLineAt(nextIdx, snippet.lines[nextIdx], runState.language);
        nextLinePreRevealed = true;
      }
    },
    onTypingKeystroke
  );

  waveManager.init(runState, onWaveClear, onWaveStart);
  // codePanel builds its own DOM inside #code-panel (see codePanel.js).
  initCodePanel(document.getElementById('code-panel'));

  updateLivesDisplay();
}

/**
 * Called by enemySystem when an enemy crosses the deadline.
 * The enemy element is already removed by the engine, so we only
 * deduct a life, refresh the HUD, play the flash effect, and end
 * the run if lives have hit zero.
 * @param {HTMLElement} _enemyEl - The breached enemy (already cleared by engine).
 * @returns {void}
 */
function onDeadlineBreach(_enemyEl) {
  // Guard against a late breach firing after the run already ended.
  if (!runState || runState.lives <= 0) {
    return;
  }

  // ── Spectral Shield absorption ─────────────────────────────────
  // If the player has an active shield, absorb this hit for free,
  // consume the shield, and bail out before any life is deducted.
  if (runState.hasShield) {
    runState.hasShield = false;
    updateShieldDisplay();
    showShieldAbsorbEffect();
    return;
  }

  runState.lives -= 1;
  updateLivesDisplay();
  playLifeLossEffect();

  if (runState.lives <= 0) {
    endRun('death');
    return;
  }

  // ── Back from the Dead ─────────────────────────────────────────
  // The ghost that breached is already gone. Skip the next 2 lines
  // automatically so the player can still pass if only 3 remain.
  // We also skip the breached line itself (total advance = 3) and
  // flash a "vengeance" message on the play area.
  if (runState.backFromTheDead) {
    showRevengeFlash();
    // skipLines(3) advances past the breached line + 2 more, then
    // spawns the new current line or fires onWaveClear.
    waveManager.skipLines(3);
  }
}

/**
 * Renders the current life count as heart icons in #lives-display.
 * Safe to call before startRun(); falls back to an empty display.
 * @returns {void}
 */
function updateLivesDisplay() {
  if (!livesDisplayEl) {
    return;
  }
  const lives = runState?.lives ?? 0;
  // Rebuild the display each time so it stays in sync with state.
  livesDisplayEl.innerHTML = '';
  for (let i = 0; i < lives; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = '♥';
    livesDisplayEl.appendChild(heart);
  }
  livesDisplayEl.setAttribute('aria-label', `${lives} lives remaining`);
}

/**
 * Triggers the red screen-edge flash defined by `body.life-lost` in
 * styles.css. The class is removed and re-added on the next frame so
 * the CSS animation restarts on every consecutive life loss.
 * Audio is stubbed via audioManager.playSfx (Issue #15 wires the pool).
 * @returns {void}
 */
function playLifeLossEffect() {
  document.body.classList.remove('life-lost');
  // Force reflow so the animation restarts even on back-to-back losses.
  void document.body.offsetWidth;
  document.body.classList.add('life-lost');
  playSfx('life-loss');
}

/**
 * Flashes a "💀 BACK FROM THE DEAD — +2 ELIMINATED" banner over the
 * play area to signal that Back from the Dead just triggered.
 * The element removes itself after the CSS animation completes.
 * @returns {void}
 */
function showRevengeFlash() {
  if (!playAreaEl) {
    return;
  }
  const banner = document.createElement('div');
  banner.className = 'revenge-flash';
  banner.textContent = '💀 BACK FROM THE DEAD — +2 ELIMINATED';
  playAreaEl.appendChild(banner);
  // Remove after the animation finishes (1 s defined in styles.css).
  banner.addEventListener('animationend', () => banner.remove(), { once: true });
}

/**
 * Renders a 🛡 shield icon in the HUD when the player's shield is active,
 * or clears it when the shield has been consumed.
 * @returns {void}
 */
function updateShieldDisplay() {
  const el = document.getElementById('shield-display');
  if (!el) {
    return;
  }
  el.textContent = runState?.hasShield ? '🛡' : '';
  el.setAttribute('aria-label', runState?.hasShield ? 'Shield active' : '');
}

/**
 * Flashes a blue "SHIELD ABSORBED!" banner over the play area.
 * @returns {void}
 */
function showShieldAbsorbEffect() {
  document.body.classList.remove('shield-absorbed');
  void document.body.offsetWidth; // force reflow to restart animation
  document.body.classList.add('shield-absorbed');

  if (!playAreaEl) {
    return;
  }
  const banner = document.createElement('div');
  banner.className = 'shield-absorb-flash';
  banner.textContent = '🛡 SHIELD ABSORBED THE HIT!';
  playAreaEl.appendChild(banner);
  banner.addEventListener('animationend', () => banner.remove(), { once: true });
}

// ── Vibe Vanish angel ──────────────────────────────────────────────

/** Reference to the active angel element (null when no angel is on screen). */
let vibeVanishAngelEl = null;

/**
 * Callback set by spawnVibeVanishAngel() so the keydown chant detector can
 * trigger activation without needing a direct reference to the Promise resolve.
 * Cleared to null once the angel phase settles (either path).
 * @type {Function|null}
 */
let _vibeVanishActivate = null;

/**
 * Rolling buffer of recent keystrokes used to detect the Vibe Vanish chant.
 * Tracked via keydown (not input.value) so it is never wiped by setTarget()
 * clearing the typing input between ghost spawns.
 * @type {string}
 */
let _chantBuffer = '';

/**
 * Normalizes the Vibe Vanish chant so harmless differences like spaces,
 * punctuation, or casing do not prevent the upgrade from activating.
 * @param {string} value - Raw chant text.
 * @returns {string} Uppercase alphanumeric chant text.
 */
function normalizeVibeVanishChant(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Spawns the Vibe Vanish angel on the play area as a pre-wave phase.
 * The angel falls alone — no ghosts spawn until the Promise settles.
 *
 * Resolves with `true`  — player typed the chant in time; wave is skipped.
 * Resolves with `false` — angel reached the deadline; wave starts normally
 *                         (no life is deducted — the angel is never tracked
 *                          by enemySystem).
 *
 * @returns {Promise<boolean>}
 */
function spawnVibeVanishAngel() {
  return new Promise((resolve) => {
    if (!playAreaEl || !runState?.vibeVanishChant) {
      resolve(false);
      return;
    }

    if (vibeVanishAngelEl) {
      vibeVanishAngelEl.remove();
      vibeVanishAngelEl = null;
    }

    const angel = document.createElement('div');
    angel.className = 'vibe-vanish-angel';
    angel.style.left = '50%';
    angel.style.transform = 'translateX(-50%)';

    const spriteEl = document.createElement('div');
    spriteEl.className = 'vibe-vanish-angel__sprite';
    spriteEl.textContent = '👼';

    const chantEl = document.createElement('div');
    chantEl.className = 'vibe-vanish-angel__chant';
    chantEl.textContent = runState.vibeVanishChant;

    angel.appendChild(spriteEl);
    angel.appendChild(chantEl);
    playAreaEl.appendChild(angel);
    vibeVanishAngelEl = angel;

    let settled = false;

    function finish(activated) {
      if (settled) {
        return;
      }
      settled = true;
      _vibeVanishActivate = null;
      vibeVanishAngelEl = null;
      angel.remove();
      resolve(activated);
    }

    // Angel reached the deadline without activation — wave proceeds normally.
    // Filter to angelFall so the child's angelFloat (infinite) never triggers this.
    angel.addEventListener('animationend', (e) => {
      if (e.animationName === 'angelFall') {
        finish(false);
      }
    });

    // Called by the keydown chant detector when the full chant is typed.
    // Plays the burst animation, then resolves true.
    _vibeVanishActivate = () => {
      angel.classList.add('vibe-vanish-angel--activated');
      window.setTimeout(() => finish(true), 600); // matches angelActivate duration
    };
  });
}

/**
 * Ends the current run: clears any remaining enemies and routes the
 * player to the end-of-run Stats screen. statsScreen.show() (Issue #20)
 * will populate the screen from runState when it lands.
 * @param {'death' | 'completed' | 'quit'} reason - Why the run ended.
 * @returns {void}
 */
function endRun(reason = 'death') {
  // Issue #50 pause-menu: Quit Run can be clicked while the game is paused.
  if (isPaused) {
    isPaused = false;
    pauseOverlayEl?.classList.add('hidden');
    document.body.classList.remove('game-paused');
  }

  enemySystem.clearAll();
  // Issue #50 pause-menu: Clear boss state when quitting mid-fight.
  bossSystem.clearAll?.();
  bossView.clearBoss();
  pauseAudio();
  playMenuMusic();
  deactivateTyping();
  if (typingInputEl) {
    typingInputEl.disabled = true;
  }
  if (runState) {
    runState.runEndReason = reason;
  }
  showStats(statTracker.getSummary(runState));
  showScreen('stats-screen');
}

/**
 * Issue #50 pause-menu: Escape only works on the active game screen.
 *
 * Returns true only while the active screen is the wave/boss gameplay screen.
 * Escape should not affect menus, intros, upgrade choices, or stats.
 * @returns {boolean}
 */
function isGameActive() {
  return Boolean(runState) && getCurrentScreen() === 'game-screen';
}

/**
 * Issue #50 pause-menu: Central pause entry point.
 *
 * Pauses movement, time-based enemy/boss checks, ambient audio, and typing.
 * @returns {void}
 */
function pauseRun() {
  if (isPaused || !isGameActive()) {
    return;
  }

  isPaused = true;
  // Issue #50 pause-menu: Resume should restore the prior typing mode exactly.
  typingWasActiveBeforePause = isTypingActive();
  typingWasDisabledBeforePause = typingInputEl?.disabled ?? false;
  document.body.classList.add('game-paused');
  enemySystem.pauseAll();
  bossSystem.pauseAll?.();
  pauseAudio();
  deactivateTyping();

  if (typingInputEl) {
    typingInputEl.disabled = true;
    typingInputEl.blur();
  }

  pauseOverlayEl?.classList.remove('hidden');
  resumeBtnEl?.focus();
}

/**
 * Issue #50 pause-menu: Central resume path without rebuilding run state.
 *
 * Resumes from pause without rebuilding any game state.
 * @param {object} [options] - Resume behavior options.
 * @param {boolean} [options.restoreInput=true] - Whether to re-enable and focus typing.
 * @returns {void}
 */
function resumeRun({ restoreInput = true } = {}) {
  if (!isPaused) {
    return;
  }

  pauseOverlayEl?.classList.add('hidden');
  document.body.classList.remove('game-paused');
  enemySystem.resumeAll();
  bossSystem.resumeAll?.();
  resumeAudio();

  // Issue #50 pause-menu: Preserve disabled input if pause happened in a transition.
  if (restoreInput && typingInputEl && isGameActive()) {
    typingInputEl.disabled = typingWasDisabledBeforePause;
    if (typingWasActiveBeforePause) {
      activateTyping();
    }
    typingInputEl.focus();
  }

  typingWasActiveBeforePause = false;
  typingWasDisabledBeforePause = false;
  isPaused = false;
}

/**
 * Issue #50 pause-menu: Shared toggle for Escape and overlay buttons.
 *
 * Toggles pause from keyboard or overlay controls.
 * @returns {void}
 */
function togglePause() {
  if (isPaused) {
    resumeRun();
  } else {
    pauseRun();
  }
}

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
  video.src = 'media/visuals/MainMenuGhostAni.mp4';
  video.loop = true;
  video.playsInline = true;
  video.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
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

// ── Arched title ───────────────────────────────────────────────

/**
 * Bends the "PHANTOM TYPE" title into an upward arch by wrapping
 * each character in a <span> and applying a per-character rotation
 * and vertical lift based on a parabolic curve.
 */
function archifyTitle() {
  const el = document.querySelector('#menu-screen .game-title');
  if (!el) {
    return;
  }

  const text = el.textContent.trim();
  const chars = [...text];
  const n = chars.length;

  // Clear existing content and data-text (glitch pseudo-elements won't
  // work on child spans, so we disable them by removing the attribute).
  el.innerHTML = '';
  el.removeAttribute('data-text');

  const TOTAL_ARC_DEG = 32; // full spread of rotation across all chars
  const MAX_LIFT_PX = 22; // how many px the centre chars lift above the edges

  chars.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'arch-char';
    span.textContent = char === ' ' ? ' ' : char;

    // t goes from -1 (left edge) to +1 (right edge)
    const t = n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
    const angle = t * (TOTAL_ARC_DEG / 2); // rotate outward
    const liftPx = (1 - t * t) * MAX_LIFT_PX; // highest at centre

    span.style.transform = `rotate(${angle}deg) translateY(${-liftPx}px)`;
    el.appendChild(span);
  });
}

archifyTitle();

// ── Navigation ─────────────────────────────────────────────────

document.getElementById('play-btn').addEventListener('click', () => {
  playMenuMusic();
  showScreen('language-screen');
  preselectSavedLanguage();
});

/**
 * Highlights the saved language choice for assistive tech and moves focus to
 * it when that language is available on the current selection screen.
 * @returns {void}
 */
function preselectSavedLanguage() {
  const savedLanguage = getPreferences().language;

  document.querySelectorAll('.btn-language').forEach((btn) => {
    const isSavedLanguage = btn.dataset.language === savedLanguage;
    btn.setAttribute('aria-pressed', String(isSavedLanguage));

    if (isSavedLanguage) {
      btn.focus();
    }
  });
}

const LAUGH_SRCS = [
  'media/audio/EvilLaughs/EvilLaugh1.mp3',
  'media/audio/EvilLaughs/EvilLaugh2.mp3',
  'media/audio/EvilLaughs/EvilLaugh3.mp3',
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
    if (!running) {
      return;
    }
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
 * Chroma-keys the zombie jumpscare video onto #scare-canvas in real time,
 * removing the green background so the TV static shows through transparently.
 * When the video ends the last frame stays frozen on the canvas until the
 * caller hides the overlay (scream audio controls the navigation timing).
 */
function startZombieChromaKey() {
  const scareOverlay = document.getElementById('scare-overlay');
  const scareCanvas = document.getElementById('scare-canvas');
  const ctx = scareCanvas.getContext('2d');

  const CHROMA_W = 480;
  const chromaCanvas = document.createElement('canvas');
  const chromaCtx = chromaCanvas.getContext('2d', { willReadFrequently: true });

  const zombie = document.createElement('video');
  silenceDecorativeVideo(zombie);
  zombie.src = 'media/visuals/ZombieJumpScare.mp4';
  zombie.playsInline = true;
  zombie.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(zombie);

  scareCanvas.width = window.innerWidth;
  scareCanvas.height = window.innerHeight;
  scareOverlay.classList.remove('hidden');

  let running = true;

  zombie.addEventListener(
    'loadedmetadata',
    () => {
      chromaCanvas.width = CHROMA_W;
      chromaCanvas.height = Math.ceil(CHROMA_W / (zombie.videoWidth / zombie.videoHeight));
      zombie.play().catch(() => {});
      requestAnimationFrame(drawFrame);
    },
    { once: true }
  );

  function drawFrame() {
    if (!running) {
      return;
    }

    if (zombie.readyState >= 2 && !zombie.paused && !zombie.ended) {
      chromaCtx.clearRect(0, 0, chromaCanvas.width, chromaCanvas.height);
      chromaCtx.drawImage(
        zombie,
        0,
        0,
        zombie.videoWidth,
        zombie.videoHeight,
        0,
        0,
        chromaCanvas.width,
        chromaCanvas.height
      );

      const frame = chromaCtx.getImageData(0, 0, chromaCanvas.width, chromaCanvas.height);
      const px = frame.data;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i],
          g = px[i + 1],
          b = px[i + 2];
        if (g > 100 && g - r > 35 && g - b > 35) {
          px[i + 3] = 0;
          continue;
        }
        const dominance = Math.min(g - r, g - b);
        if (g > 80 && dominance > 15) {
          px[i + 3] = Math.floor(px[i + 3] * (1 - (dominance - 15) / 25));
        }
      }
      chromaCtx.putImageData(frame, 0, 0);

      // Cover-fit: fill the full canvas, cropping if needed
      const cw = scareCanvas.width,
        ch = scareCanvas.height;
      const aspect = chromaCanvas.width / chromaCanvas.height;
      let dw, dh;
      if (cw / ch > aspect) {
        dw = cw;
        dh = cw / aspect;
      } else {
        dh = ch;
        dw = ch * aspect;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(chromaCanvas, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    requestAnimationFrame(drawFrame);
  }

  // On video end: stop the render loop (last frame stays frozen on canvas).
  zombie.addEventListener(
    'ended',
    () => {
      running = false;
      document.body.removeChild(zombie);
    },
    { once: true }
  );
}

/**
 * Plays the countdown video full-screen, then simultaneously starts TV static,
 * the chroma-keyed zombie jumpscare video, and the scream SFX.
 * Evil laugh plays immediately on language select.
 * @param {() => void} onComplete - Called once the scare sequence finishes.
 */
function playLanguageTransition(onComplete) {
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownVideo = document.getElementById('countdown-video');
  const scareOverlay = document.getElementById('scare-overlay');

  new Audio(pickRandom(LAUGH_SRCS)).play().catch(() => {});

  // Step 1: fade language screen to black
  countdownVideo.style.opacity = '0';
  countdownOverlay.classList.remove('hidden');
  countdownOverlay.style.opacity = '0';
  countdownOverlay.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      countdownOverlay.style.opacity = '1';
    })
  );

  // Step 2: once fully black, start video and fade it in
  countdownOverlay.addEventListener(
    'transitionend',
    () => {
      countdownVideo.style.transition = 'opacity 0.6s ease';
      countdownVideo.src = 'media/visuals/3secs.mp4';
      countdownVideo.play().catch(() => {});
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          countdownVideo.style.opacity = '1';
        })
      );
    },
    { once: true }
  );

  countdownVideo.addEventListener(
    'ended',
    () => {
      countdownOverlay.classList.add('hidden');

      const stopStatic = showStatic();

      let done = false;
      const proceed = () => {
        if (done) {
          return;
        }
        done = true;
        onComplete();
        setTimeout(() => {
          scareOverlay.classList.add('hidden');
          stopStatic();
        }, 250);
      };

      const scream = new Audio('media/audio/SCREAM.mp3');
      scream.play().catch(() => {});
      scream.addEventListener('ended', proceed, { once: true });
      setTimeout(proceed, 8000);

      startZombieChromaKey();
    },
    { once: true }
  );
}

// ── Wave lifecycle callbacks ────────────────────────────────────

/**
 * Shows the wave intro card with typing disabled until the player dismisses it.
 * Call prepareWave() before this so waveData includes the chosen snippet.
 * @returns {Promise<void>}
 */
function beginWaveIntro() {
  deactivateTyping();
  clearTypingTarget();
  if (typingInputEl) {
    typingInputEl.disabled = true;
  }

  return showWaveIntro(runState, {
    wave: runState.wave,
    snippet: waveManager.getCurrentSnippet(),
  }).finally(() => {
    if (typingInputEl) {
      typingInputEl.disabled = false;
    }
    activateTyping();
  });
}

/**
 * Called by waveManager at the start of each wave.
 * Updates the HUD wave counter and resets the code panel placeholders.
 * @param {object} snippet - The snippet chosen for this wave.
 * @returns {void}
 */
function onWaveStart(snippet) {
  statTracker.startWave();

  // Issue #19: start each wave's mistake log fresh.
  waveMistakes.clear();
  typingHadError = false;

  // Reset Foresight pre-reveal tracker for the fresh set of placeholders.
  nextLinePreRevealed = false;
  // Reset Vibe Vanish chant buffer so stale keystrokes never carry over.
  _chantBuffer = '';

  const waveDisplayEl = document.getElementById('wave-display');
  if (waveDisplayEl) {
    waveDisplayEl.textContent = `Wave ${runState.wave}`;
  }
  resetCodePanel(snippet.name, snippet.lines);

  // ── Per-wave upgrade effects ───────────────────────────────────
  // Apply once at the top of every wave so bonuses refresh each round.
  if (runState.shieldPerWave) {
    runState.hasShield = true;
    updateShieldDisplay();
  }
  if (runState.lifePerWave) {
    runState.lives += 1;
    updateLivesDisplay();
  }
}

/**
 * Called by waveManager when all enemies in a wave are defeated.
 * Reveals the full snippet, runs the boss fight, and on boss defeat
 * routes through the upgrade screen → next wave intro card.
 * @param {object} snippet - The snippet that was just completed.
 * @returns {void}
 */
function onWaveClear(snippet) {
  statTracker.endWave(snippet.id);
  showFull(snippet.lines, runState.language);

  // Brief pause so the last enemy's dissolve animation can finish
  // before we transition into the boss sequence.
  setTimeout(() => {
    // Boss flow (Issue #26): startBoss(snippet, state, onBossDefeated)
    // runs the intro, entrance, and line-by-line typing loop. It calls
    // our onBossDefeated callback with the bonus score once the player
    // finishes the last boss line; we then award the bonus and hand off
    // to onBossDefeated() which fires the upgrade screen.
    bossSystem.startBoss(snippet, runState, (bonusScore) => {
      // Soul Harvest: scoreMultiplier starts at 1.0 and increases by 0.5
      // each time the upgrade is picked, so bonus points scale up per run.
      runState.score += Math.round(bonusScore * (runState.scoreMultiplier ?? 1));
      onBossDefeated();
    });
  }, 800);
}

/**
 * After Vibe Vanish activates, spawns every ghost in the wave in quick
 * succession and immediately dissolves each one so they visually die on
 * entry. Returns a Promise that resolves once the last dissolve finishes.
 * @returns {Promise<void>}
 */
function playGhostVanishEntry() {
  const snippet = waveManager.getCurrentSnippet();
  if (!snippet?.lines?.length) {
    return Promise.resolve();
  }

  const SPAWN_STAGGER_MS = 180; // delay between each ghost appearing
  const FALL_BEFORE_DISSOLVE_MS = 1000; // lets each ghost fall farther before fading
  const DISSOLVE_MS = 500; // must match enemySystem's DISSOLVE_DURATION_MS

  const promises = snippet.lines.map(
    (line, i) =>
      new Promise((resolve) => {
        window.setTimeout(() => {
          const enemyEl = enemySystem.spawnEnemy(line, i);
          if (!enemyEl) {
            resolve();
            return;
          }
          // Let the ghost drift down briefly, then dissolve in place.
          window.setTimeout(() => {
            enemySystem.defeatEnemy(enemyEl);
            window.setTimeout(resolve, DISSOLVE_MS);
          }, FALL_BEFORE_DISSOLVE_MS);
        }, i * SPAWN_STAGGER_MS);
      })
  );

  return Promise.all(promises).then(() => {});
}

/**
 * Starts combat for the current wave, running the Vibe Vanish angel phase
 * first when the upgrade is active.
 *
 * Vibe Vanish flow:
 *   setupWave() (HUD + code panel) → angel falls alone → player types chant?
 *     yes → ghosts spawn and dissolve on entry → forceWaveClear
 *     no  → ghost spawning begins normally (beginSpawning)
 *
 * Normal flow: waveManager.startWave() (unchanged behaviour).
 * @returns {void}
 */
function launchWave() {
  if (!runState?.vibeVanishActive) {
    waveManager.startWave();
    return;
  }

  // Set up HUD and code panel without spawning any enemy yet.
  waveManager.setupWave();

  // Angel descends before any ghost. Promise resolves once it activates or
  // reaches the deadline.
  spawnVibeVanishAngel().then((activated) => {
    if (activated) {
      // Chant typed in time — play the ghost-entry-dissolve show, then clear.
      playGhostVanishEntry().then(() => {
        waveManager.forceWaveClear();
      });
    } else {
      // Angel reached deadline — normal ghost spawning begins.
      waveManager.beginSpawning();
    }
  });
}

/**
 * Records one keystroke and, on the first frame an error appears, captures
 * the character-level mistake for the wave-stats screen.
 * @param {boolean} isCorrect - Whether the typed prefix matches so far.
 * @returns {void}
 */
function onTypingKeystroke(isCorrect) {
  statTracker.recordKeystroke(isCorrect);

  if (isCorrect) {
    typingHadError = false;
    return;
  }

  // Only record the moment an error first appears, not every keystroke
  // the player makes while the line is still wrong.
  if (!typingHadError) {
    recordTypingMistake();
    typingHadError = true;
  }
}

/**
 * Compares what the player typed against the line they were supposed to
 * type and logs the first character that differs (typed vs. expected).
 * @returns {void}
 */
function recordTypingMistake() {
  const target = targetLineDisplayEl?.textContent ?? '';
  const typed = typingInputEl?.value ?? '';

  // Walk forward to the first character that does not match.
  let i = 0;
  while (i < typed.length && typed[i] === target[i]) {
    i += 1;
  }

  const expected = target[i] ?? '';
  const typedChar = typed[i] ?? '';

  // Ignore typing past the end of the line — there is no expected char.
  if (expected === '' || typedChar === '') {
    return;
  }

  const key = `${expected}\u0000${typedChar}`;
  waveMistakes.set(key, (waveMistakes.get(key) ?? 0) + 1);
}

/**
 * Turns whitespace into a visible symbol so mistakes stay readable.
 * @param {string} ch - A single character.
 * @returns {string} A display-friendly version of the character.
 */
function displayChar(ch) {
  if (ch === ' ') {
    return '␣';
  }
  if (ch === '\t') {
    return '⇥';
  }
  if (ch === '\n') {
    return '⏎';
  }
  return ch;
}

/**
 * Fills #wave-stat-mistakes with up to five of the wave's most common
 * character-level mistakes, showing the wrong and correct character.
 * @returns {void}
 */
function renderWaveMistakes() {
  const container = document.getElementById('wave-stat-mistakes');
  if (!container) {
    return;
  }
  container.innerHTML = '';

  const heading = document.createElement('div');
  heading.className = 'mistakes-heading';
  heading.textContent = 'Common Mistakes';
  container.appendChild(heading);

  // Sort by how often each mistake happened and keep the top few.
  const topMistakes = [...waveMistakes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_MISTAKES_SHOWN);

  if (topMistakes.length === 0) {
    const none = document.createElement('div');
    none.className = 'mistake-row mistake-row--none';
    none.textContent = 'Flawless wave — no mistakes!';
    container.appendChild(none);
    return;
  }

  topMistakes.forEach(([key, count]) => {
    const [expected, typedChar] = key.split('\u0000');

    const typedSpan = document.createElement('span');
    typedSpan.className = 'mistake-typed';
    typedSpan.textContent = displayChar(typedChar);

    const correctSpan = document.createElement('span');
    correctSpan.className = 'mistake-correct';
    correctSpan.textContent = displayChar(expected);

    const countSpan = document.createElement('span');
    countSpan.className = 'mistake-count';
    countSpan.textContent = `×${count}`;

    // Reads as:  Typed "X" instead of "Y"  ×N
    const row = document.createElement('div');
    row.className = 'mistake-row';
    row.append('Typed ', typedSpan, ' instead of ', correctSpan, ' ', countSpan);
    container.appendChild(row);
  });
}

/**
 * Shows the per-wave stats screen (Issue #19) after a boss is defeated and
 * before the upgrade screen. Displays the just-completed wave's WPM and
 * accuracy plus its most common mistakes. Resolves — handing off to the
 * upgrade screen — after a short delay or as soon as the player presses a key.
 * @returns {Promise<void>}
 */
function showLatestWaveStats() {
  const waveData = runState?.stats?.waveData ?? [];
  const latest = waveData[waveData.length - 1];

  // No recorded wave (shouldn't happen) — skip straight to upgrades.
  if (!latest) {
    return Promise.resolve();
  }

  showScreen('wave-stats-screen');

  const wpmEl = document.getElementById('wave-stat-wpm');
  const accuracyEl = document.getElementById('wave-stat-accuracy');
  if (wpmEl) {
    wpmEl.textContent = `WPM: ${Math.round(latest.wpm)}`;
  }
  if (accuracyEl) {
    accuracyEl.textContent = `Accuracy: ${latest.accuracy}%`;
  }
  renderWaveMistakes();

  return new Promise((resolve) => {
    let settled = false;

    // Advances to the upgrade screen exactly once and cleans up.
    const advance = () => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(autoTimer);
      window.clearTimeout(armTimer);
      document.removeEventListener('keydown', advance);
      resolve();
    };

    // Auto-advance after the timeout.
    const autoTimer = window.setTimeout(advance, WAVE_STATS_AUTO_ADVANCE_MS);

    // Any key dismisses early, but arm the listener slightly late so the
    // keystroke that finished the boss line doesn't skip the screen instantly.
    const armTimer = window.setTimeout(() => {
      document.addEventListener('keydown', advance);
    }, WAVE_STATS_KEY_ARM_MS);
  });
}

/**
 * Called once the boss for the current wave is defeated.
 * Shows the Upgrade Selection screen (Issue #13). When the player
 * picks an upgrade, that promise resolves and we route to the next
 * wave's intro card.
 * @returns {void}
 */
function onBossDefeated() {
  showLatestWaveStats()
    .then(() => {
      // showUpgradeScreen handles its own screen transition, renders the
      // 3 cards, applies the chosen upgrade to runState, and resolves
      // after the 400ms pick-confirmation animation finishes.
      return showUpgradeScreen(runState);
    })
    .then(() => {
      // prepareWave picks the snippet for the upcoming wave before the
      // intro card needs waveData.snippet (same pattern used elsewhere
      // in this file).
      waveManager.prepareWave();
      beginWaveIntro().then(() => {
        showScreen('game-screen');
        launchWave();
      });
    });
}

document.querySelectorAll('.btn-language').forEach((btn) => {
  btn.addEventListener('click', () => {
    const language = btn.dataset.language;
    // Blur immediately so keyboard focus doesn't re-fire this handler
    // when the player presses any key during or after the scare transition.
    btn.blur();
    saveLanguage(language);
    stopMenuMusic();
    startRun(language);
    // After the scare: prepare snippet, show wave intro, then start combat.
    playLanguageTransition(() => {
      playAmbient();
      waveManager.prepareWave();
      beginWaveIntro().then(() => {
        showScreen('game-screen');
        launchWave();
      });
    });
  });
});

// ── Audio settings panel (Issue #23) ───────────────────────────

const settingsBtnEl = document.getElementById('settings-btn');
const settingsPanelEl = document.getElementById('settings-panel');
const settingsCloseEl = document.getElementById('settings-close');
const musicVolumeEl = document.getElementById('music-volume');
const sfxVolumeEl = document.getElementById('sfx-volume');
const muteToggleEl = document.getElementById('mute-toggle');

function syncAudioSettingsUI() {
  const prefs = getPreferences();

  if (musicVolumeEl) {
    musicVolumeEl.value = String(prefs.musicVolume);
  }

  if (sfxVolumeEl) {
    sfxVolumeEl.value = String(prefs.sfxVolume);
  }

  if (muteToggleEl) {
    muteToggleEl.checked = prefs.muted;
  }
}

function openSettingsPanel() {
  syncAudioSettingsUI();
  settingsPanelEl?.classList.remove('hidden');
}

function closeSettingsPanel() {
  settingsPanelEl?.classList.add('hidden');
}

settingsBtnEl?.addEventListener('click', openSettingsPanel);
settingsCloseEl?.addEventListener('click', closeSettingsPanel);
pauseSettingsBtnEl?.addEventListener('click', openSettingsPanel);

musicVolumeEl?.addEventListener('input', () => {
  setMusicVolume(Number(musicVolumeEl.value));
});

sfxVolumeEl?.addEventListener('input', () => {
  setSFXVolume(Number(sfxVolumeEl.value));
});

muteToggleEl?.addEventListener('change', () => {
  if (muteToggleEl.checked) {
    mute();
  } else {
    unmute();
  }
});

syncAudioSettingsUI();
// ── Pause menu (Issue #50) ─────────────────────────────────────
// Escape toggles pause only during active wave or boss gameplay.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isGameActive()) {
    e.preventDefault();
    togglePause();
  }
});

resumeBtnEl?.addEventListener('click', () => {
  resumeRun();
});

quitBtnEl?.addEventListener('click', () => {
  endRun('quit');
});

// ── Vibe Vanish chant detector ─────────────────────────────────
// Uses keydown (not input.value) so the chant buffer is never wiped
// when setTarget() clears the typing input between ghost spawns.
// The buffer keeps only the last N characters (chant length) so partial
// matches from earlier keystrokes don't prevent future activation.
document.addEventListener('keydown', (e) => {
  // Issue #50 pause-menu: Pause blocks hidden gameplay key handlers too.
  if (isPaused) {
    return;
  }

  if (!runState?.vibeVanishActive || !vibeVanishAngelEl) {
    return;
  }
  if (e.key === 'Backspace') {
    _chantBuffer = _chantBuffer.slice(0, -1);
    return;
  }
  // Ignore modifier-only presses, Enter, Tab, etc.
  if (e.key.length !== 1) {
    return;
  }
  const chant = runState.vibeVanishChant;
  _chantBuffer += e.key;
  // Trim to a sliding window so old keystrokes don't block future matches.
  if (_chantBuffer.length > chant.length + VIBE_VANISH_BUFFER_PADDING) {
    _chantBuffer = _chantBuffer.slice(-(chant.length + VIBE_VANISH_BUFFER_PADDING));
  }
  if (
    normalizeVibeVanishChant(_chantBuffer).endsWith(normalizeVibeVanishChant(chant)) &&
    _vibeVanishActivate
  ) {
    _chantBuffer = '';
    _vibeVanishActivate();
    _vibeVanishActivate = null;
  }
});

console.warn('Phantom Type — main.js loaded');
