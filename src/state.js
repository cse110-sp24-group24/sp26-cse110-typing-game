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
 * @returns {object} A newly initialized RunState object
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
    hasShield: false, // true when an active shield is ready to absorb one hit this wave
    vibeVanishActive: false, // Vibe Vanish — true once the upgrade is owned
    vibeVanishChant: null, // The exact phrase the player must type to trigger it
    twoGhostsOneStone: false, // Two Ghosts One Stone — defeating an enemy also kills the next
    backFromTheDead: false, // Back from the Dead — life loss destroys the killer + next 2 enemies
    mysteryBoxReveal: null, // Mystery Box — id of the upgrade the box randomly granted

    stats: {
      // Typing and run statistics
      totalKeystrokes: 0,
      totalErrors: 0,
      startTime: null, // Timestamp for when the run starts
      waveData: [], // Stores per-wave statistics such as WPM and accuracy
    },
  };
}
