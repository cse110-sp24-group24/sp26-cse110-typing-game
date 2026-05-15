/**
 * ui/waveIntroCard.js — Wave intro card display and dismiss logic.
 *
 * Owns: populating #wave-intro-number, #wave-intro-function-name,
 * #wave-intro-tags, #wave-intro-desc and listening for any keypress
 * to dismiss the card and start the wave.
 *
 * Implemented by Issue #10.
 */

/**
 * Shows the wave intro card and resolves when the player dismisses it.
 * @param {object} state - RunState
 * @param {object} waveData - { wave, snippet }
 * @returns {Promise<void>}
 */
export function show(state, waveData) {
  // Issue #10
  return Promise.resolve();
}
