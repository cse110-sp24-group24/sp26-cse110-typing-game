/**
 * state.js — RunState factory.
 *
 * Creates a fresh RunState object at the start of each run.
 * All modules receive a reference to this object; no global variables.
 *
 * Implemented by Issue #2.
 */

export function createRunState(language) {
  return {
    language,               // 'javascript' | 'html' | 'css'
    lives: 3,
    score: 0,
    wave: 1,
    upgrades: [],           // array of upgrade ids collected this run
    fallSpeedMultiplier: 1.0,
    scoreMultiplier: 1.0,
    bossScoreMultiplier: 1.0,
    waveFreezeMs: 0,
    shieldPerWave: false,
    lifePerWave: false,
    revealNext: false,
    speedBonusActive: false,
    stats: {                // populated by statTracker
      totalKeystrokes: 0,
      totalErrors: 0,
      waveData: []          // per-wave { wpm, accuracy, mistakes[] }
    }
  };
}
