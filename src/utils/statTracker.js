/**
 * utils/statTracker.js — Per-keystroke and per-wave stat accumulation.
 *
 * Owns: recording every keystroke event, computing rolling WPM and
 * accuracy, and writing a waveData entry into RunState at wave end.
 *
 * Implemented by Issue #17.
 */

/** @param {object} _state - RunState */
export function init(_state) {
  // Issue #17
}

/**
 * @param _correct
 */
export function recordKeystroke(_correct) {
  // Issue #17
}

/**
 * @returns {number}
 */
export function getWpm() {
  // Issue #17
  return 0;
}

/**
 * @returns {number}
 */
export function getAccuracy() {
  // Issue #17
  return 0;
}

/**
 * Saves current wave stats into state.stats.waveData and resets counters.
 * @param _state
 * @param _mistakes
 */
export function commitWave(_state, _mistakes) {
  // Issue #17
}
