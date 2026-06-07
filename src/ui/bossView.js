/**
 * ui/bossView.js — Boss sprite, progress bar, and countdown timer rendering.
 *
 * Owns the boss DOM element, entrance animation, defeat cleanup,
 * boss progress display, and the boss fight countdown timer.
 *
 * Implemented by Issue #26. Timer UI added by Issue #68.
 */

let bossElement = null;
let progressLabelElement = null;
let progressBarElement = null;
let timerValueElement = null;

const SCREEN_SHAKE_DURATION_MS = 450;
const BOSS_DEFEAT_DURATION_MS = 500;

// Seconds at or below which the timer value pulses red.
const URGENT_THRESHOLD_SECONDS = 10;

/**
 * Creates the boss sprite, progress UI, and countdown timer inside the play area.
 *
 * @returns {void}
 */
export function showBoss() {
  const playAreaElement = document.querySelector('#play-area');

  if (!playAreaElement) {
    return;
  }

  clearBoss();

  bossElement = document.createElement('div');
  bossElement.id = 'boss-container';
  bossElement.className = 'boss-container boss-container-entering';

  const spriteElement = document.createElement('img');
  spriteElement.className = 'boss-sprite';
  spriteElement.src =
    'media/visuals/SpookyGhosts/ghostly-figure-shrouded-in-mist-on-a-transparent-background-evokes-a-sense-of-mystery-paranormal-ghost-background-free-png.webp';
  spriteElement.alt = 'Boss enemy';

  const progressElement = document.createElement('div');
  progressElement.className = 'boss-progress';
  progressElement.setAttribute('aria-live', 'polite');

  progressLabelElement = document.createElement('div');
  progressLabelElement.className = 'boss-progress-label';
  progressLabelElement.textContent = 'Line 1 of 1';

  const progressTrackElement = document.createElement('div');
  progressTrackElement.className = 'boss-progress-track';

  progressBarElement = document.createElement('div');
  progressBarElement.className = 'boss-progress-bar';

  // Countdown timer display
  const timerElement = document.createElement('div');
  timerElement.className = 'boss-timer';
  timerElement.setAttribute('aria-live', 'polite');
  timerElement.setAttribute('aria-label', 'Boss timer');

  const timerLabelElement = document.createElement('span');
  timerLabelElement.textContent = '⏱';

  timerValueElement = document.createElement('span');
  timerValueElement.className = 'boss-timer-value';
  timerValueElement.textContent = '--';

  timerElement.append(timerLabelElement, timerValueElement);

  progressTrackElement.append(progressBarElement);
  progressElement.append(progressLabelElement, progressTrackElement);
  bossElement.append(spriteElement, progressElement, timerElement);
  playAreaElement.append(bossElement);
}

/**
 * Plays the boss entrance animation.
 *
 * @returns {void}
 */
export function playEntrance() {
  const playAreaElement = document.querySelector('#play-area');

  if (playAreaElement) {
    playAreaElement.classList.add('boss-screen-shake');

    window.setTimeout(() => {
      playAreaElement.classList.remove('boss-screen-shake');
    }, SCREEN_SHAKE_DURATION_MS);
  }

  if (bossElement) {
    bossElement.classList.add('boss-container-active');
  }
}

/**
 * Plays the boss defeat animation, then removes the boss UI.
 *
 * @returns {void}
 */
export function playDefeat() {
  if (!bossElement) {
    clearBoss();
    return;
  }

  bossElement.classList.add('boss-container-defeated');

  window.setTimeout(() => {
    clearBoss();
  }, BOSS_DEFEAT_DURATION_MS);
}

/**
 * Updates the boss progress label and progress bar.
 *
 * @param {object} progress - Boss progress details.
 * @param {number} progress.currentLine - Current visible line number.
 * @param {number} progress.completedLines - Number of completed lines.
 * @param {number} progress.totalLines - Total number of boss lines.
 * @returns {void}
 */
export function updateProgress(progress) {
  if (!progressLabelElement || !progressBarElement) {
    return;
  }

  // Character-level progress (boss full-function mode).
  if (progress.totalChars !== undefined) {
    const { typedChars, totalChars } = progress;
    const pct = totalChars > 0 ? Math.round((typedChars / totalChars) * 100) : 0;
    progressLabelElement.textContent = `${typedChars} / ${totalChars} chars`;
    progressBarElement.style.width = `${pct}%`;
    return;
  }

  // Line-level progress (legacy / victory snapshot).
  const { currentLine, completedLines, totalLines } = progress;

  if (totalLines === 0) {
    progressLabelElement.textContent = 'Line 0 of 0';
    progressBarElement.style.width = '0%';
    return;
  }

  const safeCompletedLines = Math.min(completedLines, totalLines);
  const safeCurrentLine = Math.min(currentLine, totalLines);
  const progressPercent = Math.round((safeCompletedLines / totalLines) * 100);

  progressLabelElement.textContent = `Line ${safeCurrentLine} of ${totalLines}`;
  progressBarElement.style.width = `${progressPercent}%`;
}

/**
 * Updates the countdown timer display.
 * Applies the urgent pulse style when seconds reach the threshold.
 *
 * @param {number} seconds - Remaining seconds to display.
 * @returns {void}
 */
export function updateTimer(seconds) {
  if (!timerValueElement) {
    return;
  }

  timerValueElement.textContent = String(seconds);
  timerValueElement.classList.toggle('boss-timer-urgent', seconds <= URGENT_THRESHOLD_SECONDS);
}

/**
 * Removes the boss sprite, progress UI, and timer from the play area.
 *
 * @returns {void}
 */
export function clearBoss() {
  const existingBossElement = document.querySelector('#boss-container');

  if (existingBossElement) {
    existingBossElement.remove();
  }

  bossElement = null;
  progressLabelElement = null;
  progressBarElement = null;
  timerValueElement = null;
}
