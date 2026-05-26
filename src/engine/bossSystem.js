/**
 * engine/bossSystem.js — Boss intro sequence and boss typing loop.
 *
 * Owns: the dramatic intro animation, presenting boss lines one
 * at a time through typingEngine, signaling victory or defeat.
 *
 * Implemented by Issue #11.
 */

import * as codePanel from '../ui/codePanel.js';
import { setTarget, activate, deactivate } from './typingEngine.js';

// ── Module-level state (reset on each startBoss) ───────────────────────────

let _lines = [];
let _lineIndex = 0;
let _state = null;
let _onBossDefeated = null;
let _onLifeLost = null;

/** @param {object} _state - RunState */
export function init(_state) {
  // Issue #11
}

/**
 * Run the full boss sequence.
 *
 * Disables input, shows the full function read-only, waits 1.5 s,
 * plays the entrance animation, then enables input and begins the
 * line-by-line typing loop. Calls onBossDefeated(score) when all
 * lines are typed, or onLifeLost() on each incorrect submission.
 *
 * main.js must re-init typingEngine with onDefeated = bossSystem.onLineDefeated
 * before calling this function so the engine routes completions here.
 *
 * @param {object}   snippet        - Snippet object { name, lines, language }.
 * @param {object}   state          - RunState.
 * @param {Function} onBossDefeated - Called with bonus score when all lines typed.
 * @param {Function} onLifeLost     - Called when the player makes an error.
 * @returns {void}
 */
export function startBoss(snippet, state, onBossDefeated, onLifeLost) {
  const { lines = [], language } = snippet ?? {};

  _lines = lines;
  _lineIndex = 0;
  _state = state;
  _onBossDefeated = onBossDefeated;
  _onLifeLost = onLifeLost;

  // ── Phase 1: Disable input, show full function read-only ──────────────────
  deactivate();
  codePanel.showFull(lines, language);

  // ── 1.5 s pause then entrance animation ───────────────────────────────────
  setTimeout(() => {
    // TODO: trigger boss sprite entrance animation (Person 2)
    // TODO: AudioManager.play('boss-sting') once audio manager is wired up

    // ── Phase 2: Enable input, begin typing loop ───────────────────────────
    activate();
    setTarget(_lines[_lineIndex]);
  }, 1500);
}

/**
 * Called by main.js each time typingEngine fires its onDefeated callback
 * during the boss fight
 *
 * Advances to the next line, or ends the fight if all lines are done.
 *
 * @returns {void}
 */
export function onLineDefeated() {
  _lineIndex += 1;

  if (_lineIndex >= _lines.length) {
    deactivate();
    _onBossDefeated?.(_calcBonusScore(_lines, _state));
    return;
  }

  setTarget(_lines[_lineIndex]);
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Sets the current line as the typing target.
 *
 * @returns {void}
 */
function _setCurrentLine() {
  setTarget(_lines[_lineIndex]);
}

/**
 * Calculate a bonus score for defeating the boss.
 *
 * @param {string[]} lines - Source lines of the snippet (length drives base score).
 * @param {object}   state - RunState (lives remaining used as a multiplier).
 * @returns {number} The calculated bonus score.
 */
function _calcBonusScore(lines, state) {
  return lines.length * 100 + (state?.lives ?? 3) * 50;
}
