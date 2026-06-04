/**
 * ui/hudManager.js — HUD rendering module.
 *
 * Phantom Type — haunted roguelite typing game, Sprint 3, Issue #18.
 *
 * Owns: #score-display (animated counter), #lives-display,
 *       #wave-display, #lang-badge, #upgrades-panel.
 *       Also manages #score-gain-flash (add to index.html — see below).
 *
 * Required index.html change — replace the bare #score-display div
 * inside .hud-center with this wrapper:
 *
 *   <div class="hud-score-wrap">
 *     <div id="score-display" class="hud-score">0</div>
 *     <span id="score-gain-flash" class="hud-gain-flash" aria-hidden="true"></span>
 *   </div>
 *
 * Dependency layer: ui/ only. Must NOT be imported by engine/ or audio/.
 *
 * main.js wiring (see inline notes on each export):
 *   import * as hudManager from './ui/hudManager.js';
 */

import { UPGRADES } from '../data/upgrades.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maps RunState language keys to the badge label shown in #lang-badge. */
const LANG_LABELS = {
  javascript: 'JS',
  html: 'HTML',
  css: 'CSS',
  python: 'PY',
};

/** Duration of the score tick-up animation in milliseconds. */
const SCORE_ANIM_MS = 300;

/**
 * Total heart icons always rendered. Hearts above the current live count
 * appear faded so the player sees their max capacity at a glance.
 */
const MAX_LIVES = 5;

// ---------------------------------------------------------------------------
// Module-level DOM references (populated once by init)
// ---------------------------------------------------------------------------

/** @type {HTMLElement|null} */
let scoreEl = null;

/** @type {HTMLElement|null} */
let livesEl = null;

/** @type {HTMLElement|null} */
let waveEl = null;

/** @type {HTMLElement|null} */
let langEl = null;

/** @type {HTMLElement|null} */
let upgradesEl = null;

/** @type {HTMLElement|null} */
let gainFlashEl = null;

// ---------------------------------------------------------------------------
// Score animation state
// ---------------------------------------------------------------------------

/** Score value currently visible on screen. */
let displayedScore = 0;

/**
 * Score the animation is converging toward. May lead displayedScore
 * while a rAF tick loop is running.
 */
let targetScore = 0;

/** requestAnimationFrame handle — null when no animation is running. */
let rafId = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Attach to the HUD DOM element and render the initial run state.
 *
 * Uses hudEl as the query root so the module never touches elements
 * outside the HUD — consistent with ADR-003 (layer isolation).
 *
 * Call once at the top of startRun() in main.js after createRunState():
 *   hudManager.init(runState, document.getElementById('game-hud'));
 *
 * @param {object}      state            RunState for the new run.
 * @param {number}      [state.score]    Starting score (default 0).
 * @param {number}      [state.lives]    Starting lives (default 3).
 * @param {number}      [state.wave]     Starting wave (default 1).
 * @param {string}      [state.language] Language key — 'javascript' | 'html' | 'css'.
 * @param {string[]}    [state.upgrades] Upgrade ids already owned (default []).
 * @param {HTMLElement} hudEl            The #game-hud root element.
 */
export function init(state, hudEl) {
  const root = hudEl ?? document;

  scoreEl = root.querySelector('#score-display');
  livesEl = root.querySelector('#lives-display');
  waveEl = root.querySelector('#wave-display');
  langEl = root.querySelector('#lang-badge');
  upgradesEl = root.querySelector('#upgrades-panel');
  gainFlashEl = root.querySelector('#score-gain-flash');

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  displayedScore = 0;
  targetScore = 0;

  if (!state) {
    return;
  }

  updateScore(state.score ?? 0, false);
  updateLives(state.lives ?? 3);
  updateWave(state.wave ?? 1);

  if (langEl) {
    langEl.textContent = LANG_LABELS[state.language] ?? state.language ?? '';
  }

  // state.upgrades holds id strings (set by upgradeSystem.applyUpgrade).
  // Resolve each to its full UPGRADES definition before building chips.
  updateUpgrades(state.upgrades ?? []);
}

/**
 * Re-render all HUD values from a RunState snapshot.
 * Use after unpausing or restoring from save. During active play,
 * prefer the targeted updaters (animateScoreGain, updateLives, etc.).
 *
 * @param {object} state RunState snapshot.
 */
export function update(state) {
  if (!state) {
    return;
  }

  updateScore(state.score ?? 0);
  updateLives(state.lives ?? 0);
  updateWave(state.wave ?? 1);

  if (langEl) {
    langEl.textContent = LANG_LABELS[state.language] ?? state.language ?? '';
  }

  updateUpgrades(state.upgrades ?? []);
}

/**
 * Tick the score counter up by points over ~300ms.
 *
 * Interruption-safe: rapid successive calls continue from the current
 * displayed value toward the new cumulative target.
 *
 * Wire in main.js:
 *   typingEngine.onScore = (pts) => hudManager.animateScoreGain(pts);
 *
 * @param {number} points Points to add to the current target score.
 */
export function animateScoreGain(points) {
  if (gainFlashEl) {
    gainFlashEl.textContent = '+' + points.toLocaleString();
    gainFlashEl.classList.remove('hud-gain-show');
    // Force reflow so the CSS animation restarts on rapid successive calls.
    void gainFlashEl.offsetWidth;
    gainFlashEl.classList.add('hud-gain-show');
  }

  updateScore(targetScore + points, true);
}

/**
 * Append one upgrade chip to the upgrades panel.
 *
 * upgradeScreen.show() resolves with the full upgrade object — pass
 * that directly. Accepts an id string as a fallback for init/rebuild.
 *
 * Wire in main.js inside the showUpgradeScreen().then() callback:
 *   showUpgradeScreen(runState).then((upgrade) => {
 *     hudManager.addUpgrade(upgrade);
 *     ...
 *   });
 *
 * @param {string | { id: string, icon: string, name: string }} upgrade
 *   Full upgrade object (preferred) or an id string.
 */
export function addUpgrade(upgrade) {
  if (!upgradesEl) {
    return;
  }

  // Resolve string ids — used during init() rebuilds only.
  const descriptor =
    typeof upgrade === 'string'
      ? (UPGRADES.find((u) => u.id === upgrade) ?? { id: upgrade, icon: '?', name: upgrade })
      : upgrade;

  const chip = document.createElement('span');
  chip.className = 'hud-upgrade-chip';
  chip.title = descriptor.name ?? descriptor.id ?? '';
  chip.dataset.id = descriptor.id ?? '';

  // Icons in UPGRADES are emoji strings — render them directly.
  chip.innerHTML =
    `<span class="hud-upgrade-chip__icon" aria-hidden="true">${descriptor.icon ?? '?'}</span>` +
    `<span class="hud-upgrade-chip__name">${(descriptor.name ?? descriptor.id ?? '').slice(0, 8)}</span>`;

  upgradesEl.appendChild(chip);
}

// ---------------------------------------------------------------------------
// Named updaters — exported for direct use in main.js callback wiring
// ---------------------------------------------------------------------------

/**
 * Animate the score display to a new absolute value.
 * Cubic ease-out: fast start, smooth deceleration into the final value.
 *
 * @param {number}  score          Target score value.
 * @param {boolean} [animate=true] Pass false to set instantly (used by init).
 */
export function updateScore(score, animate = true) {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  const start = displayedScore;
  const end = Math.round(score);
  targetScore = end;

  if (!animate || start === end) {
    displayedScore = end;
    if (scoreEl) {
      scoreEl.textContent = end.toLocaleString();
    }
    return;
  }

  const t0 = performance.now();
  if (scoreEl) {
    scoreEl.classList.add('hud-score-animating');
  }

  function tick(now) {
    const p = Math.min((now - t0) / SCORE_ANIM_MS, 1);
    const ease = 1 - Math.pow(1 - p, 3);

    displayedScore = Math.round(start + (end - start) * ease);
    if (scoreEl) {
      scoreEl.textContent = displayedScore.toLocaleString();
    }

    if (p < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      if (scoreEl) {
        scoreEl.classList.remove('hud-score-animating');
      }
    }
  }

  rafId = requestAnimationFrame(tick);
}

/**
 * Rebuild the lives display immediately.
 * Renders MAX_LIVES hearts; hearts above `lives` appear faded so the
 * player always sees their maximum capacity.
 *
 * Replaces the inline updateLivesDisplay() in main.js. Call from
 * onDeadlineBreach() and anywhere else that mutates runState.lives.
 *
 * @param {number} lives Current lives remaining.
 */
export function updateLives(lives) {
  if (!livesEl) {
    return;
  }

  livesEl.innerHTML = '';

  for (let i = 0; i < MAX_LIVES; i++) {
    const heart = document.createElement('span');
    heart.className = i < lives ? 'heart heart--active' : 'heart heart--lost';
    heart.textContent = '\u2665'; // ♥
    heart.setAttribute('aria-hidden', 'true');
    livesEl.appendChild(heart);
  }

  livesEl.setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'} remaining`);
}

/**
 * Update the wave indicator at the start of each new wave.
 *
 * Replaces the direct DOM write in main.js onWaveStart():
 *   waveDisplayEl.textContent = `Wave ${runState.wave}`;
 *
 * @param {number} wave Current wave number.
 */
export function updateWave(wave) {
  if (!waveEl) {
    return;
  }
  waveEl.textContent = `Wave ${wave}`;
}

/**
 * Rebuild the entire upgrades panel from the id string array in RunState.
 * Use only during init or state reconstruction — during active play,
 * call addUpgrade() once per newly acquired upgrade.
 *
 * @param {string[]} upgradeIds Array of owned upgrade id strings from RunState.
 */
export function updateUpgrades(upgradeIds) {
  if (!upgradesEl) {
    return;
  }

  upgradesEl.innerHTML = '';

  for (const id of upgradeIds) {
    addUpgrade(id);
  }
}
