/**
 * engine/bossSystem.js — Boss intro sequence and full-function typing loop.
 *
 * Owns boss encounter state, line advancement, and boss victory signaling.
 * UI and audio are delegated through callbacks registered by main.js.
 *
 * Implemented by Issue #26.
 */

import { activate, clearTarget, deactivate, setTarget } from './typingEngine.js';

// ── Module-level constants ──────────────────────────────────────────────────

const BOSS_INTRO_DELAY_MS = 1500;
const BOSS_ENTRANCE_DURATION_MS = 800;

// ── Module-level state ──────────────────────────────────────────────────────

let _lines = [];
let _lineIndex = 0;
let _state = null;
let _onBossDefeated = null;
let _onIntroStart = null;
let _onEntranceStart = null;
let _onFightStart = null;
let _onProgressUpdate = null;
let _onBossCleanup = null;

/**
 * Initializes boss system callbacks.
 *
 * @param {object} callbacks - Callback functions registered by main.js.
 * @param {Function} callbacks.onIntroStart - Called when boss intro begins.
 * @param {Function} callbacks.onEntranceStart - Called when boss entrance starts.
 * @param {Function} callbacks.onFightStart - Called when typing begins.
 * @param {Function} callbacks.onProgressUpdate - Called when boss progress changes.
 * @param {Function} callbacks.onBossCleanup - Called when boss fight ends.
 * @returns {void}
 */
export function init(callbacks = {}) {
  _onIntroStart = callbacks.onIntroStart ?? null;
  _onEntranceStart = callbacks.onEntranceStart ?? null;
  _onFightStart = callbacks.onFightStart ?? null;
  _onProgressUpdate = callbacks.onProgressUpdate ?? null;
  _onBossCleanup = callbacks.onBossCleanup ?? null;
}

/**
 * Runs the full boss sequence.
 *
 * Disables input, starts the intro, waits 1.5 seconds, starts the boss entrance,
 * then enables typing and begins the line-by-line boss challenge.
 *
 * @param {object} snippet - Snippet object with lines and language.
 * @param {object} state - Current RunState object.
 * @param {Function} onBossDefeated - Called with bonus score when all lines are typed.
 * @param {Function} onLifeLost - Reserved for future boss typo/life-loss behavior.
 * @returns {void}
 */
export function startBoss(snippet, state, onBossDefeated, onLifeLost) {
  void onLifeLost;

  const { lines = [] } = snippet ?? {};

  _lines = Array.isArray(lines) ? lines : [];
  _lineIndex = 0;
  _state = state;
  _onBossDefeated = onBossDefeated;

  deactivate();
  _onIntroStart?.(snippet);

  if (_lines.length === 0) {
    _finishBoss();
    return;
  }

  window.setTimeout(() => {
    _onEntranceStart?.();

    window.setTimeout(() => {
      activate();
      _onFightStart?.();
      _updateProgress();
      _setCurrentLine();
    }, BOSS_ENTRANCE_DURATION_MS);
  }, BOSS_INTRO_DELAY_MS);
}

/**
 * Advances the boss typing challenge after the current line is completed.
 *
 * @returns {void}
 */
export function onLineDefeated() {
  _lineIndex += 1;

  if (_lineIndex >= _lines.length) {
    _finishBoss();
    return;
  }

  _updateProgress();
  _setCurrentLine();
}

/**
 * Returns whether the boss encounter is currently active.
 *
 * @returns {boolean} True when boss lines are loaded and not yet complete.
 */
export function isActive() {
  return _lines.length > 0 && _lineIndex < _lines.length;
}

// ─── Private helpers ────────────────────────────────────────────────────────

/**
 * Sets the current boss line as the typing target.
 *
 * @returns {void}
 */
function _setCurrentLine() {
  // Strip leading whitespace for the same reason as waveManager —
  // the player should never have to type invisible indentation.
  setTarget(_lines[_lineIndex].trimStart());
}

/**
 * Sends current progress to registered UI callbacks.
 *
 * @returns {void}
 */
function _updateProgress() {
  _onProgressUpdate?.({
    currentLine: Math.min(_lineIndex + 1, _lines.length),
    completedLines: Math.min(_lineIndex, _lines.length),
    totalLines: _lines.length,
  });
}

/**
 * Ends the boss encounter and notifies main.js.
 *
 * @returns {void}
 */
function _finishBoss() {
  const bonusScore = _calcBonusScore(_lines, _state);

  deactivate();
  clearTarget();
  _onProgressUpdate?.({
    currentLine: _lines.length,
    completedLines: _lines.length,
    totalLines: _lines.length,
  });
  _onBossCleanup?.();
  _onBossDefeated?.(bonusScore);
}

/**
 * Calculates the bonus score for defeating the boss.
 *
 * @param {string[]} lines - Source lines of the snippet.
 * @param {object} state - Current RunState object.
 * @returns {number} The calculated boss bonus score.
 */
function _calcBonusScore(lines, state) {
  return lines.length * 100 + (state?.lives ?? 3) * 50;
}
