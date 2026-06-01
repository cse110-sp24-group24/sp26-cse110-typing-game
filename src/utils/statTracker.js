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

/** @param {object} newState - RunState */
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
  if (!state) return;

  resetWaveBaseline(Date.now());
}

/**
 * @param {number} now
 * @returns {void}
 */
function resetWaveBaseline(now) {
  waveStartTime = now;
  waveStartKeystrokes = state.stats.totalKeystrokes;
  waveStartErrors = state.stats.totalErrors;
}

/**
 * @param {boolean} isCorrect
 */
export function recordKeystroke(isCorrect) {
  if (!state) return;

  state.stats.totalKeystrokes += 1;
  if (!isCorrect) {
    state.stats.totalErrors += 1;
  }
}

/**
 * Records typing stats for the completed wave.
 * @param {string} snippetId
 */
export function endWave(snippetId) {
  if (!state) return;

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
 * @returns {number}
 */
export function getWpm() {
  // Use activeStartTime, activeKeystrokes, activeErrors, and activeNow.
  void activeStartTime;
  void activeKeystrokes;
  void activeErrors;
  void activeNow;

  // Issue #17
  return 0;
}

/**
 * @returns {number}
 */
export function getAccuracy() {
  // Use activeKeystrokes and activeErrors.
  void activeKeystrokes;
  void activeErrors;

  // Issue #17
  return 0;
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
    waveData: stats.waveData ?? [],
  };
}

/**
 * @param {number} startTime
 * @param {number} keystrokes
 * @param {number} errors
 * @param {number} now
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
 * Saves current wave stats into state.stats.waveData and resets counters.
 * @param _state
 * @param _mistakes
 */
export function commitWave(_state, _mistakes) {
  // Issue #17
}
