/**
 * engine/enemySystem.js — Enemy spawning, movement, and deadline detection.
 *
 * Owns: DOM enemy elements, CSS fall animation timing, deadline
 * breach detection via requestAnimationFrame, life deduction signal.
 *
 * Implemented by Issue #6.
 */

let playAreaElRef = null;
let deadlineElRef = null;
let stateRef = null;
let onDeadlineBreachRef = null;
let deadlineY = Infinity;

const BASE_FALL_DURATION_SECONDS = 8;
const DISSOLVE_DURATION_MS = 500;

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
  if (!deadlineElRef) {
    deadlineY = Infinity;
    return;
  }

  const deadlineRect = deadlineElRef.getBoundingClientRect();
  deadlineY = deadlineRect.top;
}

/**
 * Creates and spawns a falling enemy element for a code line.
 * @param {string} line - The code text displayed on the enemy.
 * @param {number} lineIndex - The wave line index used for horizontal positioning.
 * @returns {HTMLElement | null} The spawned enemy element, or null if the system is not initialized.
 */
export function spawnEnemy(line, lineIndex) {
  if (!playAreaElRef) {
    return null;
  }

  const enemyEl = document.createElement('div');
  enemyEl.className = 'enemy';
  enemyEl.style.left = `${10 + (lineIndex % 5) * 17}%`;
  const speedMultiplier = stateRef?.fallSpeedMultiplier ?? 1;
  enemyEl.style.animationDuration = `${BASE_FALL_DURATION_SECONDS * speedMultiplier}s`;

  enemyEl.innerHTML = ENEMY_MARKUP;
  const codeEl = enemyEl.querySelector('.enemy-code');
  if (codeEl) {
    codeEl.textContent = line;
  }

  playAreaElRef.appendChild(enemyEl);

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
  enemyEl.classList.add('dissolving');
  window.setTimeout(() => {
    enemyEl.remove();
  }, DISSOLVE_DURATION_MS);
}

/**
 * Pauses all active enemy fall animations.
 * @returns {void}
 */
export function pauseAll() {
  if (!playAreaElRef) {
    return;
  }

  const enemies = playAreaElRef.querySelectorAll('.enemy:not(.dissolving)');
  for (const enemyEl of enemies) {
    enemyEl.style.animationPlayState = 'paused';
  }
}

/**
 * Resumes all active enemy fall animations.
 * @returns {void}
 */
export function resumeAll() {
  if (!playAreaElRef) {
    return;
  }

  const enemies = playAreaElRef.querySelectorAll('.enemy:not(.dissolving)');
  for (const enemyEl of enemies) {
    enemyEl.style.animationPlayState = 'running';
  }
}

/**
 * Removes all enemies from the play area instantly.
 * @returns {void}
 */
export function clearAll() {
  if (!playAreaElRef) {
    return;
  }

  playAreaElRef.querySelectorAll('.enemy').forEach((enemyEl) => enemyEl.remove());
}
