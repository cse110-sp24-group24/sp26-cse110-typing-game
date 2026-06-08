/**
 * tests/bossSystem.test.js — Jest tests for bossSystem.js (Issue #26).
 *
 * typingEngine is mocked so tests run without real input elements.
 * Uses jest.unstable_mockModule followed by dynamic imports so bossSystem
 * picks up the mocked typingEngine dependency.
 *
 * Covers boss engine behavior:
 *   1. startBoss disables typing and fires intro callback
 *   2. entrance callback fires after the 1.5s intro delay
 *   3. typing activates and full-function target is set after entrance delay
 *   4. onLineDefeated finishes the full-function boss encounter
 *   5. countdown callbacks tick and expire correctly
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Set up mocks BEFORE dynamic import of bossSystem.
jest.unstable_mockModule('../src/engine/typingEngine.js', () => ({
  activate: jest.fn(),
  clearTarget: jest.fn(),
  deactivate: jest.fn(),
  setTarget: jest.fn(),
}));

const bossSystem = await import('../src/engine/bossSystem.js');
const typingEngine = await import('../src/engine/typingEngine.js');

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Creates the expected full-function boss target.
 * @param {string[]} lines - Raw snippet lines.
 * @returns {string} Full boss typing target.
 */
function makeFullTarget(lines) {
  return lines
    .filter((line) => line.trim() !== '')
    .map((line) => line.replace(/^( {2})+/, (match) => '\t'.repeat(match.length / 2)))
    .join('\n');
}

/**
 * Creates a minimal RunState for testing.
 * @returns {object} A minimal state object.
 */
function makeState() {
  return { lives: 3, language: 'javascript', wave: 1 };
}

/**
 * Creates a test boss snippet.
 * @returns {object} A snippet object.
 */
function makeSnippet() {
  return {
    name: 'Console Test Boss',
    language: 'javascript',
    lines: ['function add(a, b) {', '  return a + b;', '}'],
  };
}

/**
 * Creates a boss snippet with a visual blank spacer between CSS blocks.
 * @returns {object} A snippet object.
 */
function makeSnippetWithBlankLine() {
  return {
    name: 'CSS Block Boss',
    language: 'css',
    lines: [
      '.parent {',
      '  position: relative;',
      '}',
      '',
      '.child {',
      '  position: absolute;',
      '}',
    ],
  };
}

/**
 * Registers fresh boss callbacks for a test.
 * @returns {object} Callback spies.
 */
function initBossCallbacks() {
  const callbacks = {
    onIntroStart: jest.fn(),
    onEntranceStart: jest.fn(),
    onFightStart: jest.fn(),
    onProgressUpdate: jest.fn(),
    onBossCleanup: jest.fn(),
    onTimerTick: jest.fn(),
    onTimerExpired: jest.fn(),
  };

  bossSystem.init(callbacks);
  return callbacks;
}

/**
 * Advances through both boss intro timers.
 * @returns {void}
 */
function finishBossIntroTimers() {
  jest.advanceTimersByTime(1500);
  jest.advanceTimersByTime(800);
}

/**
 * Calculates the initial displayed boss timer seconds for the default test state.
 * Mirrors bossSystem's timer formula.
 * @param {number} lineCount - Number of nonblank boss lines.
 * @returns {number} Initial timer tick seconds.
 */
function expectedInitialTimerSeconds(lineCount) {
  const BASE_FALL_DURATION_SECONDS = 16;
  const TIMER_FALL_RATIO = 0.8;
  const TIMER_FLOOR_SECONDS = 10;
  const bossTimeBonus = 1;
  const wave = 1;

  const baseSeconds = lineCount * BASE_FALL_DURATION_SECONDS * TIMER_FALL_RATIO * bossTimeBonus;
  const rawSeconds = baseSeconds - (wave - 1) * 5;

  return Math.ceil(Math.max(rawSeconds, TIMER_FLOOR_SECONDS));
}

// ── bossSystem ────────────────────────────────────────────────────────────

describe('bossSystem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    bossSystem.init({});
  });

  afterEach(() => {
    bossSystem.clearAll();
    jest.useRealTimers();
  });

  it('disables typing and fires intro callback when boss starts', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();
    const state = makeState();

    bossSystem.startBoss(snippet, state, jest.fn());

    expect(typingEngine.deactivate).toHaveBeenCalledTimes(1);
    expect(callbacks.onIntroStart).toHaveBeenCalledTimes(1);
    expect(callbacks.onIntroStart).toHaveBeenCalledWith(snippet);
    expect(bossSystem.isActive()).toBe(true);
  });

  it('fires entrance callback after the 1.5 second intro delay', () => {
    const callbacks = initBossCallbacks();

    bossSystem.startBoss(makeSnippet(), makeState(), jest.fn());

    jest.advanceTimersByTime(1499);
    expect(callbacks.onEntranceStart).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callbacks.onEntranceStart).toHaveBeenCalledTimes(1);
  });

  it('activates typing and targets the full function after entrance delay', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();

    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    expect(typingEngine.activate).toHaveBeenCalledTimes(1);
    expect(callbacks.onFightStart).toHaveBeenCalledTimes(1);
    expect(typingEngine.setTarget).toHaveBeenCalledWith(makeFullTarget(snippet.lines));
    expect(callbacks.onProgressUpdate).toHaveBeenCalledWith({
      currentLine: 1,
      completedLines: 0,
      totalLines: 3,
    });
  });

  it('filters blank boss lines out of the full-function target', () => {
    const snippet = makeSnippetWithBlankLine();

    initBossCallbacks();
    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    const target = typingEngine.setTarget.mock.calls[0][0];

    expect(target).toBe(makeFullTarget(snippet.lines));
    expect(target).not.toContain('\n\n');
  });

  it('converts two-space indentation groups to tabs in the full-function target', () => {
    const snippet = makeSnippet();

    initBossCallbacks();
    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    expect(typingEngine.setTarget).toHaveBeenCalledWith('function add(a, b) {\n\treturn a + b;\n}');
  });

  it('fires an initial timer tick when the boss fight starts', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();

    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    expect(callbacks.onTimerTick).toHaveBeenCalledWith(
      expectedInitialTimerSeconds(snippet.lines.length)
    );
  });

  it('expires the boss when the countdown reaches zero', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();

    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    const durationMs = expectedInitialTimerSeconds(snippet.lines.length) * 1000;

    jest.advanceTimersByTime(durationMs);

    expect(callbacks.onTimerExpired).toHaveBeenCalledTimes(1);
    expect(typingEngine.deactivate).toHaveBeenCalled();
    expect(typingEngine.clearTarget).toHaveBeenCalled();
    expect(bossSystem.isActive()).toBe(false);
  });

  it('clears target, cleans up, and fires onBossDefeated when full function is completed', () => {
    const callbacks = initBossCallbacks();
    const onBossDefeated = jest.fn();

    bossSystem.startBoss(makeSnippet(), makeState(), onBossDefeated);
    finishBossIntroTimers();

    jest.clearAllMocks();

    bossSystem.onLineDefeated();

    expect(typingEngine.deactivate).toHaveBeenCalledTimes(1);
    expect(typingEngine.clearTarget).toHaveBeenCalledTimes(1);
    expect(callbacks.onBossCleanup).toHaveBeenCalledTimes(1);
    expect(onBossDefeated).toHaveBeenCalledTimes(1);
    expect(onBossDefeated).toHaveBeenCalledWith(450);
    expect(bossSystem.isActive()).toBe(false);
  });

  it('reports complete progress before boss cleanup', () => {
    const callbacks = initBossCallbacks();

    bossSystem.startBoss(makeSnippet(), makeState(), jest.fn());
    finishBossIntroTimers();

    bossSystem.onLineDefeated();

    expect(callbacks.onProgressUpdate).toHaveBeenLastCalledWith({
      currentLine: 3,
      completedLines: 3,
      totalLines: 3,
    });
  });

  it('updates character progress for the full-function target', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();
    const targetLength = makeFullTarget(snippet.lines).length;

    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    bossSystem.reportCharProgress(5);

    expect(callbacks.onProgressUpdate).toHaveBeenLastCalledWith({
      typedChars: 5,
      totalChars: targetLength,
    });
  });

  it('clamps character progress to the target length', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();
    const targetLength = makeFullTarget(snippet.lines).length;

    bossSystem.startBoss(snippet, makeState(), jest.fn());
    finishBossIntroTimers();

    bossSystem.reportCharProgress(targetLength + 100);

    expect(callbacks.onProgressUpdate).toHaveBeenLastCalledWith({
      typedChars: targetLength,
      totalChars: targetLength,
    });
  });

  it('handles empty boss snippets without crashing', () => {
    const callbacks = initBossCallbacks();
    const onBossDefeated = jest.fn();
    const emptySnippet = {
      name: 'Empty Boss',
      language: 'javascript',
      lines: [],
    };

    bossSystem.startBoss(emptySnippet, makeState(), onBossDefeated);

    expect(typingEngine.deactivate).toHaveBeenCalled();
    expect(typingEngine.clearTarget).toHaveBeenCalledTimes(1);
    expect(callbacks.onBossCleanup).toHaveBeenCalledTimes(1);
    expect(callbacks.onTimerTick).not.toHaveBeenCalled();
    expect(onBossDefeated).toHaveBeenCalledWith(150);
    expect(bossSystem.isActive()).toBe(false);
  });
});
