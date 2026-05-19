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
    language, // 'javascript' | 'html' | 'css'
    lives: 3,
    score: 0,
    wave: 1,
    upgrades: [], // array of upgrade ids collected this run
    fallSpeedMultiplier: 1.0,
    scoreMultiplier: 1.0,
    bossScoreMultiplier: 1.0,
    waveFreezeMs: 0,
    shieldPerWave: false,
    lifePerWave: false,
    revealNext: false,
    speedBonusActive: false,
    stats: {
      // populated by statTracker
      totalKeystrokes: 0,
      totalErrors: 0,
      waveData: [], // per-wave { wpm, accuracy, mistakes[] }
    },
  };
}
