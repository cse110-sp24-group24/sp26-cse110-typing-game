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

const ENEMY_MARKUP = `
  <svg class="enemy-sprite" viewBox="0 0 64 64" aria-hidden="true">
    <path
      d="M12 56V26C12 14 21 6 32 6s20 8 20 20v30l-6-5-6 5-6-5-6 5-6-5-6 5Z"
      fill="rgba(220, 245, 255, 0.95)"
      stroke="rgba(130, 200, 255, 0.9)"
      stroke-width="3"
    />
    <circle cx="25" cy="28" r="4" fill="#080810" />
    <circle cx="39" cy="28" r="4" fill="#080810" />
    <path
      d="M26 40c4 3 8 3 12 0"
      stroke="#080810"
      stroke-width="3"
      fill="none"
      stroke-linecap="round"
    />
  </svg>
  <div class="enemy-code"></div>
`;

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

  enemyEl.innerHTML = ENEMY_MARKUP;

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
