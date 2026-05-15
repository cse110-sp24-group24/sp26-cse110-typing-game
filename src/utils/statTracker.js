/**
 * utils/statTracker.js — Per-keystroke and per-wave stat accumulation.
 *
 * Owns: recording every keystroke event, computing rolling WPM and
 * accuracy, and writing a waveData entry into RunState at wave end.
 *
 * Implemented by Issue #17.
 */

/** @param {object} state - RunState */
export function init(state) {
  // Issue #17
}

export function recordKeystroke(correct) {
  // Issue #17
}

export function getWpm() {
  // Issue #17
  return 0;
}

export function getAccuracy() {
  // Issue #17
  return 0;
}

/** Saves current wave stats into state.stats.waveData and resets counters. */
export function commitWave(state, mistakes) {
  // Issue #17
}
