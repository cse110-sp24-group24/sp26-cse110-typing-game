/**
 * Creates and returns a fresh RunState object for a new game run.
 *
 * This state object is shared across game systems and stores
 * all mutable run-specific data such as score, lives, wave info,
 * upgrades, modifiers, and typing statistics.
 *
 * @param {string} language - Selected language for the run
 * ('javascript', 'html', or 'css')
 *
 * @returns {Object} A newly initialized RunState object
 */
export function createRunState(language) {
  return {
    language, // Selected programming language for this run
    wave: 1, // Current wave number
    currentSnippetId: null, // ID of the currently active code snippet
    lives: 3, // Player state
    score: 0,
    scoreMultiplier: 1.0, // Score modifiers
    bossScoreMultiplier: 1.0,
    speedBonusActive: false, // Gameplay modifiers and upgrades
    upgrades: [],
    fallSpeedMultiplier: 1.0,
    waveFreezeMs: 0,
    shieldPerWave: false,
    lifePerWave: false,
    revealNext: false,

    stats: { // Typing and run statistics
      totalKeystrokes: 0,
      totalErrors: 0,
      startTime: null, // Timestamp for when the run starts
      waveData: [], // Stores per-wave statistics such as WPM and accuracy
    },
  };
}