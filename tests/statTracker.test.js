/**
 * tests/statTracker.test.js — Jest tests for statTracker.js.
 *
 * Verifies per-keystroke stat accumulation, per-wave WPM and accuracy,
 * and final run summary values.
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import * as StatTracker from '../src/utils/statTracker.js';

// ── Helpers ───────────────────────────────────────────────────────────────

const ORIGINAL_DATE_NOW = Date.now;

/**
 * Creates a minimal RunState-like object for stat tracker tests.
 * @returns {object} Minimal test state.
 */
function createTestState() {
  return {
    score: 250,
    stats: {
      startTime: null,
      totalKeystrokes: 0,
      totalErrors: 0,
      waveData: [],
    },
  };
}

/**
 * Sets the mocked current time.
 * @param {number} now - Time value returned by Date.now().
 * @returns {void}
 */
function setNow(now) {
  Date.now = jest.fn(() => now);
}

/**
 * Records several keystrokes into the stat tracker.
 * @param {boolean[]} results - Whether each keystroke was correct.
 * @returns {void}
 */
function recordKeystrokes(results) {
  results.forEach((isCorrect) => {
    StatTracker.recordKeystroke(isCorrect);
  });
}

// ── statTracker ───────────────────────────────────────────────────────────

describe('statTracker — init', () => {
  afterEach(() => {
    Date.now = ORIGINAL_DATE_NOW;
  });

  it('sets the run start time', () => {
    const state = createTestState();

    setNow(1000);
    StatTracker.init(state);

    expect(state.stats.startTime).toBe(1000);
  });
});

describe('statTracker — recordKeystroke', () => {
  afterEach(() => {
    Date.now = ORIGINAL_DATE_NOW;
  });

  it('increments total keystrokes for a correct keystroke', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);
    StatTracker.recordKeystroke(true);

    expect(state.stats.totalKeystrokes).toBe(1);
    expect(state.stats.totalErrors).toBe(0);
  });

  it('increments total keystrokes and total errors for an incorrect keystroke', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);
    StatTracker.recordKeystroke(false);

    expect(state.stats.totalKeystrokes).toBe(1);
    expect(state.stats.totalErrors).toBe(1);
  });
});

describe('statTracker — endWave', () => {
  afterEach(() => {
    Date.now = ORIGINAL_DATE_NOW;
  });

  it('stores WPM, accuracy, error count, snippet ID, and timestamp for a completed wave', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);

    recordKeystrokes([true, true, true, true, true]);

    setNow(60000);
    StatTracker.endWave('snippet-1');

    expect(state.stats.waveData).toHaveLength(1);
    expect(state.stats.waveData[0]).toEqual({
      wpm: 1,
      accuracy: 100,
      errorCount: 0,
      snippetId: 'snippet-1',
      timestamp: 60000,
    });
  });

  it('calculates wave WPM using correct keystrokes and five characters per word', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);

    recordKeystrokes([true, true, true, true, true, true, true, true, false, false]);

    setNow(60000);
    StatTracker.endWave('snippet-2');

    expect(state.stats.waveData[0].wpm).toBe(1.6);
    expect(state.stats.waveData[0].accuracy).toBe(80);
    expect(state.stats.waveData[0].errorCount).toBe(2);
  });

  it('accumulates total stats across multiple waves without resetting mid-run', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);

    recordKeystrokes([true, true, true, true, true]);

    setNow(60000);
    StatTracker.endWave('wave-1');

    recordKeystrokes([true, true, false, true, false]);

    setNow(120000);
    StatTracker.endWave('wave-2');

    expect(state.stats.totalKeystrokes).toBe(10);
    expect(state.stats.totalErrors).toBe(2);
    expect(state.stats.waveData).toHaveLength(2);

    expect(state.stats.waveData[0].wpm).toBe(1);
    expect(state.stats.waveData[0].accuracy).toBe(100);

    expect(state.stats.waveData[1].wpm).toBe(0.6);
    expect(state.stats.waveData[1].accuracy).toBe(60);
  });

  it('uses startWave to exclude downtime before the next wave begins', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);

    recordKeystrokes([true, true, true, true, true]);

    setNow(60000);
    StatTracker.endWave('wave-1');

    setNow(90000);
    StatTracker.startWave();

    recordKeystrokes([true, true, true, true, true]);

    setNow(150000);
    StatTracker.endWave('wave-2');

    expect(state.stats.waveData[1].wpm).toBe(1);
    expect(state.stats.waveData[1].accuracy).toBe(100);
  });
});

describe('statTracker — getSummary', () => {
  afterEach(() => {
    Date.now = ORIGINAL_DATE_NOW;
  });

  it('returns total accuracy, average WPM, waves cleared, final score, and wave data', () => {
    const state = createTestState();

    setNow(0);
    StatTracker.init(state);

    recordKeystrokes([true, true, true, true, true, true, true, true, false, false]);

    setNow(60000);
    StatTracker.endWave('snippet-1');

    setNow(60000);
    const summary = StatTracker.getSummary(state);

    expect(summary).toEqual({
      totalAccuracy: 80,
      averageWpm: 1.6,
      wavesCleared: 1,
      finalScore: 250,
      runEndReason: null,
      waveData: state.stats.waveData,
    });
  });

  it('returns safe defaults when summary stats are missing', () => {
    const summary = StatTracker.getSummary({ score: 0 });

    expect(summary).toEqual({
      totalAccuracy: 0,
      averageWpm: 0,
      wavesCleared: 0,
      finalScore: 0,
      runEndReason: null,
      waveData: [],
    });
  });
});
