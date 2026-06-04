/**
 * utils/statTracker.js — Per-keystroke and per-wave stat accumulation.
 *
 * Owns: recording every keystroke event, computing rolling WPM and
 * accuracy, and writing a waveData entry into RunState at wave end.
 *
 * Implemented by Issue #17.
 */

let state = null;
let waveStartTime = null;
let waveStartKeystrokes = 0;
let waveStartErrors = 0;
let activeStartTime = null;
let activeKeystrokes = 0;
let activeErrors = 0;
let activeNow = null;

const CHARS_PER_WORD = 5;
const MS_PER_MINUTE = 60000;
const DECIMAL_PLACES = 10;

/**
 * Initializes stat tracking for a new run.
 * @param {object} newState - RunState object for the active run.
 * @returns {void}
 */
export function init(newState) {
  state = newState;
  const now = Date.now();
  state.stats.startTime = now;
  resetWaveBaseline(now);
}

/**
 * Starts a fresh per-wave measurement window.
 * @returns {void}
 */
export function startWave() {
  if (!state) {
    return;
  }

  resetWaveBaseline(Date.now());
}

/**
 * @param {number} now - Current timestamp in milliseconds.
 * @returns {void}
 */
function resetWaveBaseline(now) {
  waveStartTime = now;
  waveStartKeystrokes = state.stats.totalKeystrokes;
  waveStartErrors = state.stats.totalErrors;
}

/**
 * Records whether one typed keystroke was correct.
 * @param {boolean} isCorrect - Whether the typed keystroke matched the expected character.
 * @returns {void}
 */
export function recordKeystroke(isCorrect) {
  if (!state) {
    return;
  }

  state.stats.totalKeystrokes += 1;
  if (!isCorrect) {
    state.stats.totalErrors += 1;
  }
}

/**
 * Records typing stats for the completed wave.
 * @param {string} snippetId - ID of the snippet used in this wave.
 * @returns {void}
 */
export function endWave(snippetId) {
  if (!state) {
    return;
  }

  const now = Date.now();
  const keystrokes = state.stats.totalKeystrokes - waveStartKeystrokes;
  const errorCount = state.stats.totalErrors - waveStartErrors;
  setStatsWindow(waveStartTime, keystrokes, errorCount, now);
  const wpm = getWpm();
  const accuracy = getAccuracy();
  clearStatsWindow();

  state.stats.waveData.push({
    wpm,
    accuracy,
    errorCount,
    snippetId,
    timestamp: now,
  });

  resetWaveBaseline(now);
}

/**
 * Calculates WPM for the active stats window.
 * Uses the standard typing definition of one word as five correct characters.
 * @returns {number} The active window's WPM, rounded to one decimal place.
 */
export function getWpm() {
  if (
    !Number.isFinite(activeStartTime) ||
    !Number.isFinite(activeNow) ||
    activeNow <= activeStartTime ||
    activeKeystrokes <= 0
  ) {
    return 0;
  }

  const elapsedMinutes = (activeNow - activeStartTime) / MS_PER_MINUTE;

  if (elapsedMinutes <= 0) {
    return 0;
  }

  const correctKeystrokes = Math.max(activeKeystrokes - activeErrors, 0);
  const wpm = correctKeystrokes / CHARS_PER_WORD / elapsedMinutes;

  return Math.round(wpm * DECIMAL_PLACES) / DECIMAL_PLACES;
}

/**
 * Calculates accuracy for the active stats window.
 * @returns {number} The active window's accuracy percentage, rounded to one decimal place.
 */
export function getAccuracy() {
  if (activeKeystrokes <= 0) {
    return 0;
  }

  const correctKeystrokes = Math.max(activeKeystrokes - activeErrors, 0);
  const accuracy = (correctKeystrokes / activeKeystrokes) * 100;

  return Math.round(accuracy * DECIMAL_PLACES) / DECIMAL_PLACES;
}

/**
 * Returns final run statistics for summary screens.
 * @param {object} summaryState - RunState
 * @returns {object}
 */
export function getSummary(summaryState = state) {
  const stats = summaryState?.stats ?? {};
  const totalKeystrokes = stats.totalKeystrokes ?? 0;
  const totalErrors = stats.totalErrors ?? 0;
  setStatsWindow(stats.startTime, totalKeystrokes, totalErrors);
  const totalAccuracy = getAccuracy();
  const averageWpm = getWpm();
  clearStatsWindow();

  return {
    totalAccuracy,
    averageWpm,
    wavesCleared: stats.waveData?.length ?? 0,
    finalScore: summaryState?.score ?? 0,
    runEndReason: summaryState?.runEndReason ?? null,
    waveData: stats.waveData ?? [],
  };
}

/**
 * @param {number} startTime - Start timestamp of the measurement window in milliseconds.
 * @param {number} keystrokes - Total keystrokes recorded in the window.
 * @param {number} errors - Total errors recorded in the window.
 * @param {number} now - End timestamp of the measurement window in milliseconds.
 * @returns {void}
 */
function setStatsWindow(startTime, keystrokes, errors, now = Date.now()) {
  activeStartTime = startTime;
  activeKeystrokes = keystrokes;
  activeErrors = errors;
  activeNow = now;
}

/**
 * @returns {void}
 */
function clearStatsWindow() {
  activeStartTime = null;
  activeKeystrokes = 0;
  activeErrors = 0;
  activeNow = null;
}

/**
 * Saves current wave stats into state.stats.waveData and resets the wave baseline.
 * @param {object} waveState - RunState object to commit stats into.
 * @param {object} mistakes - Optional mistake data from the typing engine.
 * @returns {void}
 */
export function commitWave(waveState = state, mistakes = {}) {
  if (!waveState) {
    return;
  }

  state = waveState;
  endWave(mistakes.snippetId ?? 'unknown');
}
