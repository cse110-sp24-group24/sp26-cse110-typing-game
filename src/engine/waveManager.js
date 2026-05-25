/**
 * engine/waveManager.js — Wave lifecycle management.
 *
 * Owns: snippet selection (no repeats per run), one-at-a-time enemy spawning,
 * wave-clear detection, and transitioning to the boss sequence via callback.
 *
 * Flow per wave:
 *   prepareWave() → pick snippet (main shows wave intro with snippet data)
 *   startWave() → onWaveStart(snippet) → spawnCurrentLine()
 *   player types line → typingEngine fires onDefeated → main calls onEnemyDefeated()
 *   onEnemyDefeated() → defeatEnemy → next line OR onWaveClear(snippet)
 *
 * Implemented by Issue #7.
 */

import * as enemySystem from './enemySystem.js';
import { setTarget } from './typingEngine.js';
import { getRandomSnippet } from '../snippets/index.js';

// ── Module-level state (reset on each init) ────────────────────────────────

let stateRef = null;
let onWaveClearRef = null;
let onWaveStartRef = null;

let currentSnippet = null;
let lineIndex = 0;
let currentEnemyEl = null;

// Tracks snippet IDs used this run so getRandomSnippet can exclude them.
const usedSnippetIds = [];

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Stores run-level references and callbacks. Must be called once per run,
 * before the first prepareWave() / startWave().
 * @param {object} state - Shared RunState for this run.
 * @param {Function} onWaveClear - Called with (snippet) when all lines are defeated.
 * @param {Function} onWaveStart - Called with (snippet) when a new wave begins.
 * @returns {void}
 */
export function init(state, onWaveClear, onWaveStart) {
  stateRef = state;
  onWaveClearRef = onWaveClear;
  onWaveStartRef = onWaveStart;

  // Reset wave state so a new run always starts clean.
  currentSnippet = null;
  lineIndex = 0;
  currentEnemyEl = null;
  usedSnippetIds.length = 0;
}

/**
 * Picks the next snippet and updates wave state without spawning enemies.
 * Call before the wave intro card so main.js can pass snippet data to the UI.
 * @returns {void}
 */
export function prepareWave() {
  // state.wave starts at 1 from createRunState — only increment on subsequent waves.
  if (currentSnippet !== null) {
    stateRef.wave += 1;
  }

  currentSnippet = getRandomSnippet(stateRef.language, usedSnippetIds);
  usedSnippetIds.push(currentSnippet.id);
  stateRef.currentSnippetId = currentSnippet.id;
  lineIndex = 0;
}

/**
 * Starts combat for the current wave: fires onWaveStart and spawns the first enemy.
 * Requires prepareWave() to have been called first.
 * @returns {void}
 */
export function startWave() {
  onWaveStartRef(currentSnippet);
  spawnCurrentLine();
}

/**
 * Called by main.js when typingEngine fires its onDefeated callback.
 * Defeats the current enemy element, then either spawns the next line
 * or fires onWaveClear if all lines have been typed.
 * @returns {void}
 */
export function onEnemyDefeated() {
  if (currentEnemyEl) {
    enemySystem.defeatEnemy(currentEnemyEl);
    currentEnemyEl = null;
  }

  lineIndex += 1;

  if (lineIndex >= currentSnippet.lines.length) {
    onWaveClearRef(currentSnippet);
    return;
  }

  spawnCurrentLine();
}

/**
 * Returns the snippet currently active in this wave.
 * Returns null before the first prepareWave() call.
 * @returns {object | null} The current snippet object.
 */
export function getCurrentSnippet() {
  return currentSnippet;
}

/**
 * Returns the zero-based index of the line currently being fought.
 * main.js reads this before onEnemyDefeated() to reveal the correct code-panel line.
 * @returns {number}
 */
export function getCurrentLineIndex() {
  return lineIndex;
}

// ── Private helpers ─────────────────────────────────────────────────────────

/**
 * Spawns the enemy for the current line index and sets it as the typing target.
 * Only one enemy is on screen at a time (single-enemy MVP model).
 * @returns {void}
 */
function spawnCurrentLine() {
  const line = currentSnippet.lines[lineIndex];
  currentEnemyEl = enemySystem.spawnEnemy(line, lineIndex);
  setTarget(line);
}
