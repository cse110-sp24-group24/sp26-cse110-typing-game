import * as audioManager from '../audio/audioManager.js';

/**
 * engine/enemySystem.js — Enemy spawning, movement, and deadline detection.
 *
 * Owns DOM enemy elements, CSS fall animation timing, deadline breach detection
 * via requestAnimationFrame, and the life deduction signal.
 *
 * Implemented by Issue #6.
 */

let playAreaElRef = null;
let deadlineElRef = null;
let stateRef = null;
let onDeadlineBreachRef = null;
let requestAnimationFrameId = null;
let isPaused = false;

const activeEnemies = new Set();

const BASE_FALL_DURATION_SECONDS = 8;
const DISSOLVE_DURATION_MS = 500;
const BREACH_REMOVE_DELAY_MS = 350;
const MIN_FALL_SPEED_MULTIPLIER = 0.1;

/** Four ghost SVG variants — one design per wave (cycles every 4 waves). */
const ENEMY_MARKUPS = [
  // Sprite 0 — pale blue classic wisp
  `<svg class="enemy-sprite enemy-sprite--0" data-sprite-id="0" viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M12 56V26C12 14 21 6 32 6s20 8 20 20v30l-6-5-6 5-6-5-6 5-6-5-6 5Z"
      fill="rgba(200, 235, 255, 0.88)"
      stroke="rgba(130, 200, 255, 0.85)"
      stroke-width="2.5"
    />
    <circle cx="25" cy="28" r="4" fill="#080810" />
    <circle cx="39" cy="28" r="4" fill="#080810" />
    <path d="M26 40c4 3 8 3 12 0" stroke="#080810" stroke-width="2.5" fill="none" stroke-linecap="round" />
  </svg>
  <div class="enemy-code"></div>`,
  // Sprite 1 — purple/lavender, wider tail
  `<svg class="enemy-sprite enemy-sprite--1" data-sprite-id="1" viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M10 56V24C10 12 20 4 32 4s22 8 22 22v30l-5-4-5 4-5-4-5 4-5-4-5 4-5-4-5 4Z"
      fill="rgba(210, 180, 255, 0.85)"
      stroke="rgba(168, 85, 247, 0.8)"
      stroke-width="2.5"
    />
    <ellipse cx="24" cy="27" rx="4.5" ry="5" fill="#0a0814" />
    <ellipse cx="40" cy="27" rx="4.5" ry="5" fill="#0a0814" />
    <circle cx="25" cy="26" r="1.2" fill="rgba(255,255,255,0.5)" />
    <circle cx="41" cy="26" r="1.2" fill="rgba(255,255,255,0.5)" />
    <path d="M27 41c3 2 7 2 10 0" stroke="#0a0814" stroke-width="2" fill="none" stroke-linecap="round" />
  </svg>
  <div class="enemy-code"></div>`,
  // Sprite 2 — sickly green, tall narrow
  `<svg class="enemy-sprite enemy-sprite--2" data-sprite-id="2" viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M22 56V22C22 10 27 5 32 5s10 5 10 17v34l-4-6-4 4-4-6-4 4-4-6-4 4Z"
      fill="rgba(160, 255, 190, 0.82)"
      stroke="rgba(80, 220, 120, 0.75)"
      stroke-width="2.5"
    />
    <circle cx="28" cy="26" r="3.5" fill="#061008" />
    <circle cx="36" cy="26" r="3.5" fill="#061008" />
    <path d="M29 38h6" stroke="#061008" stroke-width="2.5" stroke-linecap="round" />
  </svg>
  <div class="enemy-code"></div>`,
  // Sprite 3 — teal, round head + zigzag wisp
  `<svg class="enemy-sprite enemy-sprite--3" data-sprite-id="3" viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M14 56V28C14 16 22 8 32 8c8 0 14 5 16 14v34l-5-4-4 6-5-4-4 6-5-4-4 6-5-4Z"
      fill="rgba(150, 230, 220, 0.86)"
      stroke="rgba(60, 200, 190, 0.8)"
      stroke-width="2.5"
    />
    <circle cx="26" cy="24" r="5" fill="#080810" />
    <circle cx="38" cy="26" r="4" fill="#080810" />
    <circle cx="27" cy="23" r="1.5" fill="rgba(200,255,240,0.6)" />
    <path d="M24 42l4-3 4 3 4-4" stroke="#080810" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  <div class="enemy-code"></div>`,
];

/**
 * Initializes the enemy system with DOM references and runtime dependencies.
 * @param {HTMLElement} playAreaEl - The play area container where enemies are spawned.
 * @param {HTMLElement} deadlineEl - The DOM element representing the deadline line.
 * @param {object} state - The shared RunState object for the current run.
 * @param {(enemyEl: HTMLElement) => void} onDeadlineBreach - Callback fired when an enemy crosses the deadline.
 * @returns {void}
 */
export function init(playAreaEl, deadlineEl, state, onDeadlineBreach) {
  playAreaElRef = playAreaEl;
  deadlineElRef = deadlineEl;
  stateRef = state;
  onDeadlineBreachRef = onDeadlineBreach;
  isPaused = false;
}

/**
 * Creates and spawns a falling enemy element for a code line.
 * @param {string} line - The code text displayed on the enemy.
 * @param {number} lineIndex - The wave line index used for horizontal positioning.
 * @returns {HTMLElement | null} The spawned enemy element, or null if the system is not initialized.
 */
export function spawnEnemy(line, lineIndex = 0) {
  if (!playAreaElRef) {
    return null;
  }

  const enemyEl = document.createElement('div');
  enemyEl.className = 'enemy';
  enemyEl.style.left = `${10 + (lineIndex % 5) * 17}%`;

  const speedMultiplier = Math.max(stateRef?.fallSpeedMultiplier ?? 1, MIN_FALL_SPEED_MULTIPLIER);
  enemyEl.style.animationDuration = `${BASE_FALL_DURATION_SECONDS / speedMultiplier}s`;

  const markupIndex = ((stateRef?.wave ?? 1) - 1) % ENEMY_MARKUPS.length;
  enemyEl.dataset.spriteIndex = String(markupIndex);
  enemyEl.innerHTML = ENEMY_MARKUPS[markupIndex];

  const codeEl = enemyEl.querySelector('.enemy-code');
  if (codeEl) {
    codeEl.textContent = line;
  }

  playAreaElRef.appendChild(enemyEl);
  activeEnemies.add(enemyEl);

  startDeadlineLoop();

  return enemyEl;
}

/**
 * Triggers the enemy dissolve animation and removes the enemy after it completes.
 * @param {HTMLElement} enemyEl - The enemy element to remove.
 * @returns {void}
 */
export function defeatEnemy(enemyEl) {
  if (!enemyEl || !enemyEl.isConnected) {
    return;
  }

  activeEnemies.delete(enemyEl);
  // Freeze the enemy at its current screen position so removing the fall
  // animation does not snap it back to `top: -12%` before dissolve starts.
  if (playAreaElRef) {
    const enemyRect = enemyEl.getBoundingClientRect();
    const playAreaRect = playAreaElRef.getBoundingClientRect();

    enemyEl.style.top = `${enemyRect.top - playAreaRect.top}px`;
    enemyEl.style.left = `${enemyRect.left - playAreaRect.left}px`;
    enemyEl.style.width = `${enemyRect.width}px`;
  }

  // Inline fall timing can override class-based dissolve timing, so reset and force dissolve.
  enemyEl.style.animation = 'none';
  if (typeof enemyEl.style.removeProperty === 'function') {
    enemyEl.style.removeProperty('animation-duration');
  } else {
    delete enemyEl.style.animationDuration;
  }
  void enemyEl.offsetWidth;
  enemyEl.classList.add('dissolving');
  enemyEl.style.animation = `dissolve ${DISSOLVE_DURATION_MS}ms ease-out forwards`;
  if (audioManager && typeof audioManager.playSFX === 'function') {
    audioManager.playSFX('defeat');
  }

  window.setTimeout(() => {
    enemyEl.remove();
    stopLoopIfNoActiveEnemies();
  }, DISSOLVE_DURATION_MS);
}

/**
 * Pauses all active enemy fall animations and deadline checks.
 * @returns {void}
 */
export function pauseAll() {
  isPaused = true;

  for (const enemyEl of activeEnemies) {
    enemyEl.style.animationPlayState = 'paused';
  }

  stopDeadlineLoop();
}

/**
 * Resumes all active enemy fall animations and deadline checks.
 * @returns {void}
 */
export function resumeAll() {
  isPaused = false;

  for (const enemyEl of activeEnemies) {
    enemyEl.style.animationPlayState = 'running';
  }

  if (activeEnemies.size > 0) {
    startDeadlineLoop();
  }
}

/**
 * Removes all enemies from the play area instantly.
 * @returns {void}
 */
export function clearAll() {
  for (const enemyEl of activeEnemies) {
    enemyEl.remove();
  }

  activeEnemies.clear();

  if (playAreaElRef) {
    playAreaElRef.querySelectorAll('.enemy').forEach((enemyEl) => {
      enemyEl.remove();
    });
  }

  stopDeadlineLoop();
}

/**
 * Starts the requestAnimationFrame deadline detection loop.
 * @returns {void}
 */
function startDeadlineLoop() {
  if (requestAnimationFrameId !== null || isPaused || activeEnemies.size === 0) {
    return;
  }

  requestAnimationFrameId = window.requestAnimationFrame(checkDeadlineBreaches);
}

/**
 * Stops the requestAnimationFrame deadline detection loop.
 * @returns {void}
 */
function stopDeadlineLoop() {
  if (requestAnimationFrameId === null) {
    return;
  }

  window.cancelAnimationFrame(requestAnimationFrameId);
  requestAnimationFrameId = null;
}

/**
 * Stops the rAF loop when no active enemies remain.
 * @returns {void}
 */
function stopLoopIfNoActiveEnemies() {
  if (activeEnemies.size === 0) {
    stopDeadlineLoop();
  }
}

/**
 * Checks active enemies against the deadline once per animation frame.
 * @returns {void}
 */
function checkDeadlineBreaches() {
  requestAnimationFrameId = null;

  if (isPaused || !deadlineElRef || activeEnemies.size === 0) {
    stopLoopIfNoActiveEnemies();
    return;
  }

  const deadlineRect = deadlineElRef.getBoundingClientRect();
  const deadlineY = deadlineRect.top;

  for (const enemyEl of [...activeEnemies]) {
    if (!enemyEl.isConnected) {
      activeEnemies.delete(enemyEl);
      continue;
    }

    const enemyRect = enemyEl.getBoundingClientRect();

    if (enemyRect.bottom >= deadlineY) {
      activeEnemies.delete(enemyEl);
      enemyEl.classList.add('breached');

      if (typeof onDeadlineBreachRef === 'function') {
        onDeadlineBreachRef(enemyEl);
      }

      window.setTimeout(() => {
        enemyEl.remove();
        stopLoopIfNoActiveEnemies();
      }, BREACH_REMOVE_DELAY_MS);
    }
  }

  if (activeEnemies.size > 0 && !isPaused) {
    startDeadlineLoop();
  }
}
