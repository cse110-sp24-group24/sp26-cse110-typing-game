/**
 * engine/bossSystem.js — Boss intro sequence and full-function typing loop.
 *
 * Owns boss encounter state, the full-function typing target, the countdown
 * timer, and boss victory/expiry signaling.
 * UI and audio are delegated through callbacks registered by main.js.
 *
 * Implemented by Issue #26. Overhauled by Issue #68.
 */

import { activate, clearTarget, deactivate, setTarget } from './typingEngine.js';

// ── Module-level constants ──────────────────────────────────────────────────

const BOSS_INTRO_DELAY_MS = 1500;
const BOSS_ENTRANCE_DURATION_MS = 800;

// Base fall duration in seconds — mirrors enemySystem's BASE_FALL_DURATION_SECONDS.
// Timer = lines × BASE_FALL_DURATION_SECONDS × TIMER_FALL_RATIO × bossTimeBonus.
const BASE_FALL_DURATION_SECONDS = 16;
const TIMER_FALL_RATIO = 0.8;
const TIMER_FLOOR_SECONDS = 10;

// ── Module-level state ──────────────────────────────────────────────────────

let _lines = [];
let _state = null;
let _onBossDefeated = null;
let _onIntroStart = null;
let _onEntranceStart = null;
let _onFightStart = null;
let _onProgressUpdate = null;
let _onBossCleanup = null;
let _onTimerTick = null;
let _onTimerExpired = null;

// Issue #50 pause-menu: Boss intro/entrance delays must freeze on pause.
let _isPaused = false;
let _timerIdSeq = 0;
const _timers = new Map();

// Total character count of the current full-function target (for char progress).
let _targetLength = 0;

// Countdown state
let _countdownRemainingMs = 0;
let _countdownStartedAt = 0;
let _countdownTickId = null; // managed timeout id for the next 1-second tick
let _countdownExpiryId = null; // managed timeout id for the final expiry

/**
 * Initializes boss system callbacks.
 *
 * @param {object} callbacks - Callback functions registered by main.js.
 * @param {Function} callbacks.onIntroStart - Called when boss intro begins.
 * @param {Function} callbacks.onEntranceStart - Called when boss entrance starts.
 * @param {Function} callbacks.onFightStart - Called when typing begins.
 * @param {Function} callbacks.onProgressUpdate - Called when boss progress changes.
 * @param {Function} callbacks.onBossCleanup - Called when boss fight ends.
 * @param {Function} callbacks.onTimerTick - Called every second with remaining seconds.
 * @param {Function} callbacks.onTimerExpired - Called when the countdown hits zero.
 * @returns {void}
 */
export function init(callbacks = {}) {
  _onIntroStart = callbacks.onIntroStart ?? null;
  _onEntranceStart = callbacks.onEntranceStart ?? null;
  _onFightStart = callbacks.onFightStart ?? null;
  _onProgressUpdate = callbacks.onProgressUpdate ?? null;
  _onBossCleanup = callbacks.onBossCleanup ?? null;
  _onTimerTick = callbacks.onTimerTick ?? null;
  _onTimerExpired = callbacks.onTimerExpired ?? null;
}

/**
 * Runs the full boss sequence.
 *
 * Disables input, starts the intro, waits 1.5 s, starts the boss entrance,
 * then enables typing and presents the entire function as one continuous target.
 * A countdown timer starts when typing begins; expiry triggers onTimerExpired.
 *
 * @param {object} snippet - Snippet object with lines and language.
 * @param {object} state - Current RunState object.
 * @param {Function} onBossDefeated - Called with bonus score when the full function is typed.
 * @returns {void}
 */
export function startBoss(snippet, state, onBossDefeated) {
  // Issue #50 pause-menu: New boss fights start with clean timer state.
  clearManagedTimeouts();
  _isPaused = false;

  const { lines = [] } = snippet ?? {};

  _lines = Array.isArray(lines) ? lines.filter((line) => line.trim() !== '') : [];
  _state = state;
  _onBossDefeated = onBossDefeated;

  deactivate();
  _onIntroStart?.(snippet);

  if (_lines.length === 0) {
    _finishBoss();
    return;
  }

  setManagedTimeout(() => {
    _onEntranceStart?.();

    setManagedTimeout(() => {
      activate();
      _onFightStart?.();
      _updateProgress();
      _setFullFunctionTarget();
      _startCountdown(_calcTimerDurationMs(_lines, state));
    }, BOSS_ENTRANCE_DURATION_MS);
  }, BOSS_INTRO_DELAY_MS);
}

/**
 * Issue #50 pause-menu: Stores remaining boss delay time instead of advancing.
 *
 * Pauses boss intro/entrance timers and the countdown.
 * @returns {void}
 */
export function pauseAll() {
  if (_isPaused) {
    return;
  }

  _isPaused = true;
  const now = performance.now();

  for (const timer of _timers.values()) {
    window.clearTimeout(timer.timeoutId);
    timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt));
    timer.timeoutId = null;
  }

  // Freeze the remaining countdown time so it resumes from the right point.
  if (_countdownTickId !== null || _countdownExpiryId !== null) {
    _countdownRemainingMs = Math.max(0, _countdownRemainingMs - (now - _countdownStartedAt));
  }
}

/**
 * Issue #50 pause-menu: Recreates pending boss delays with remaining time.
 *
 * Resumes boss intro/entrance timers and the countdown.
 * @returns {void}
 */
export function resumeAll() {
  if (!_isPaused) {
    return;
  }

  _isPaused = false;

  for (const [id, timer] of _timers.entries()) {
    timer.startedAt = performance.now();
    timer.timeoutId = window.setTimeout(() => {
      _timers.delete(id);
      timer.callback();
    }, timer.remaining);
  }

  // Resume countdown from where it was frozen.
  if (_countdownRemainingMs > 0) {
    _countdownStartedAt = performance.now();
    _scheduleCountdownTick();
    _scheduleCountdownExpiry();
  }
}

/**
 * Issue #50 pause-menu: Quit Run cancels boss state without awarding victory.
 *
 * Cancels the current boss encounter without awarding victory.
 * Used when the player quits the run mid-fight.
 * @returns {void}
 */
export function clearAll() {
  clearManagedTimeouts();
  _clearCountdown();
  _isPaused = false;
  _lines = [];
  _state = null;
  _onBossDefeated = null;
  deactivate();
  clearTarget();
}

/**
 * Called by main.js when the typing engine signals completion.
 * With the full-function target, one completion = the entire boss defeated.
 *
 * @returns {void}
 */
export function onLineDefeated() {
  _finishBoss();
}

/**
 * Returns whether the boss encounter is currently active.
 *
 * @returns {boolean} True when boss lines are loaded and not yet complete.
 */
export function isActive() {
  return _lines.length > 0;
}

// ─── Private helpers ────────────────────────────────────────────────────────

/**
 * Joins all boss lines into one multi-line string and sets it as the typing
 * target. Leading 2-space groups are normalised to tab characters so the
 * player types Tab for each indent level. Enter inserts newlines (handled
 * natively by the boss textarea).
 *
 * @returns {void}
 */
function _setFullFunctionTarget() {
  const normalised = _lines.map((line) =>
    line.replace(/^( {2})+/, (match) => '\t'.repeat(match.length / 2))
  );
  const fullText = normalised.join('\n');
  _targetLength = fullText.length;
  setTarget(fullText);
}

/**
 * Called by main.js on every keystroke during a boss fight to update the
 * character-level progress bar.
 *
 * @param {number} typedLength - Number of characters currently in the input.
 * @returns {void}
 */
export function reportCharProgress(typedLength) {
  if (_targetLength === 0) {
    return;
  }

  _onProgressUpdate?.({
    typedChars: Math.min(typedLength, _targetLength),
    totalChars: _targetLength,
  });
}

/**
 * Sends current progress to registered UI callbacks.
 * Progress shows character completion across the whole function.
 *
 * @returns {void}
 */
function _updateProgress() {
  _onProgressUpdate?.({
    currentLine: 1,
    completedLines: 0,
    totalLines: _lines.length,
  });
}

/**
 * Ends the boss encounter and notifies main.js.
 *
 * @returns {void}
 */
function _finishBoss() {
  clearManagedTimeouts();
  _clearCountdown();

  const bonusScore = _calcBonusScore(_lines, _state);

  deactivate();
  clearTarget();
  _onProgressUpdate?.({
    currentLine: _lines.length,
    completedLines: _lines.length,
    totalLines: _lines.length,
  });

  // Clear _lines before callbacks so isActive() returns false immediately.
  _lines = [];

  _onBossCleanup?.();
  _onBossDefeated?.(bonusScore);
}

/**
 * Computes the countdown duration in milliseconds.
 * Formula: lines × BASE_FALL_DURATION_SECONDS × TIMER_FALL_RATIO × bossTimeBonus,
 * with a floor of TIMER_FLOOR_SECONDS.
 *
 * @param {string[]} lines - Boss snippet lines.
 * @param {object|null} state - Current RunState.
 * @returns {number} Duration in milliseconds.
 */
function _calcTimerDurationMs(lines, state) {
  const bonus = state?.bossTimeBonus ?? 1;
  const wave = state?.wave ?? 1;
  const baseSeconds = lines.length * BASE_FALL_DURATION_SECONDS * TIMER_FALL_RATIO * bonus;
  // Each successive boss wave is 5 seconds stricter (wave 1 = no reduction).
  const rawSeconds = baseSeconds - (wave - 1) * 5;
  return Math.max(rawSeconds, TIMER_FLOOR_SECONDS) * 1000;
}

/**
 * Starts the boss countdown with the given duration.
 *
 * @param {number} durationMs - Total countdown duration in milliseconds.
 * @returns {void}
 */
function _startCountdown(durationMs) {
  _clearCountdown();
  _countdownRemainingMs = durationMs;
  _countdownStartedAt = performance.now();

  _fireTimerTick();
  _scheduleCountdownTick();
  _scheduleCountdownExpiry();
}

/**
 * Schedules the next 1-second tick to update the displayed countdown.
 *
 * @returns {void}
 */
function _scheduleCountdownTick() {
  if (_isPaused) {
    return;
  }

  // Fire on the next whole-second boundary of the remaining time.
  const msUntilNextTick = _countdownRemainingMs % 1000 || 1000;

  _countdownTickId = setManagedTimeout(() => {
    _countdownTickId = null;
    const elapsed = performance.now() - _countdownStartedAt;
    _countdownRemainingMs = Math.max(0, _countdownRemainingMs - elapsed);
    _countdownStartedAt = performance.now();
    _fireTimerTick();

    if (_countdownRemainingMs > 0) {
      _scheduleCountdownTick();
    }
  }, msUntilNextTick);
}

/**
 * Schedules the single timeout that fires when the countdown hits zero.
 *
 * @returns {void}
 */
function _scheduleCountdownExpiry() {
  if (_isPaused) {
    return;
  }

  _countdownExpiryId = setManagedTimeout(() => {
    _countdownExpiryId = null;
    _countdownRemainingMs = 0;
    _fireTimerTick();
    _clearCountdown();
    _lines = [];
    deactivate();
    clearTarget();
    _onTimerExpired?.();
  }, _countdownRemainingMs);
}

/**
 * Calls the onTimerTick callback with the current remaining whole seconds.
 *
 * @returns {void}
 */
function _fireTimerTick() {
  _onTimerTick?.(Math.ceil(_countdownRemainingMs / 1000));
}

/**
 * Cancels all pending countdown timeouts and resets countdown state.
 *
 * @returns {void}
 */
function _clearCountdown() {
  if (_countdownTickId !== null) {
    const timer = _timers.get(_countdownTickId);
    if (timer?.timeoutId !== null && timer?.timeoutId !== undefined) {
      window.clearTimeout(timer.timeoutId);
    }
    _timers.delete(_countdownTickId);
    _countdownTickId = null;
  }

  if (_countdownExpiryId !== null) {
    const timer = _timers.get(_countdownExpiryId);
    if (timer?.timeoutId !== null && timer?.timeoutId !== undefined) {
      window.clearTimeout(timer.timeoutId);
    }
    _timers.delete(_countdownExpiryId);
    _countdownExpiryId = null;
  }

  _countdownRemainingMs = 0;
}

/**
 * Issue #50 pause-menu: Pause-aware replacement for plain setTimeout.
 *
 * Creates a timeout that can be paused and resumed by this module.
 * @param {Function} callback - Callback to run after the delay.
 * @param {number} delayMs - Delay in milliseconds.
 * @returns {number} Managed timeout id.
 */
function setManagedTimeout(callback, delayMs) {
  const id = _timerIdSeq;
  _timerIdSeq += 1;

  const timer = {
    callback,
    remaining: delayMs,
    startedAt: performance.now(),
    timeoutId: null,
  };

  timer.timeoutId = window.setTimeout(() => {
    _timers.delete(id);
    callback();
  }, delayMs);

  _timers.set(id, timer);
  return id;
}

/**
 * Issue #50 pause-menu: Removes all pending boss delay callbacks.
 *
 * @returns {void}
 */
function clearManagedTimeouts() {
  for (const timer of _timers.values()) {
    if (timer.timeoutId !== null) {
      window.clearTimeout(timer.timeoutId);
    }
  }

  _timers.clear();
  _countdownTickId = null;
  _countdownExpiryId = null;
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
