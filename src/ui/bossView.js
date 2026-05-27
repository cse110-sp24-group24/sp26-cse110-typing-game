/**
 * ui/bossView.js — Boss sprite and progress bar rendering.
 *
 * Owns the boss DOM element, entrance animation, defeat cleanup,
 * and boss progress display.
 *
 * Implemented by Issue #26.
 */

let bossElement = null;
let progressLabelElement = null;
let progressBarElement = null;

const SCREEN_SHAKE_DURATION_MS = 450;
const BOSS_DEFEAT_DURATION_MS = 500;

/**
 * Creates the boss sprite and progress UI inside the play area.
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

  const spriteElement = document.createElement('div');
  spriteElement.className = 'boss-sprite';
  spriteElement.setAttribute('aria-label', 'Boss enemy');
  spriteElement.setAttribute('role', 'img');

  const leftHornElement = document.createElement('div');
  leftHornElement.className = 'boss-sprite-horn boss-sprite-horn-left';

  const rightHornElement = document.createElement('div');
  rightHornElement.className = 'boss-sprite-horn boss-sprite-horn-right';

  const faceElement = document.createElement('div');
  faceElement.className = 'boss-sprite-face';

  const leftEyeElement = document.createElement('div');
  leftEyeElement.className = 'boss-sprite-eye';

  const rightEyeElement = document.createElement('div');
  rightEyeElement.className = 'boss-sprite-eye';

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

  faceElement.append(leftEyeElement, rightEyeElement);
  spriteElement.append(leftHornElement, rightHornElement, faceElement);
  progressTrackElement.append(progressBarElement);
  progressElement.append(progressLabelElement, progressTrackElement);
  bossElement.append(spriteElement, progressElement);
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
  const { currentLine, completedLines, totalLines } = progress;

  if (!progressLabelElement || !progressBarElement) {
    return;
  }

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
 * Removes the boss sprite and progress UI from the play area.
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
}
