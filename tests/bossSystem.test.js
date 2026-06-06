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
 *   3. typing activates and first line is targeted after entrance delay
 *   4. onLineDefeated advances through lines in order
 *   5. final line clears target, cleans up boss UI, and fires onBossDefeated
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
 * Creates a minimal RunState for testing.
 * @returns {object} A minimal state object.
 */
function makeState() {
  return { lives: 3, language: 'javascript' };
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

// ── bossSystem ────────────────────────────────────────────────────────────

describe('bossSystem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    bossSystem.init({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('disables typing and fires intro callback when boss starts', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();
    const state = makeState();

    bossSystem.startBoss(snippet, state, jest.fn(), jest.fn());

    expect(typingEngine.deactivate).toHaveBeenCalledTimes(1);
    expect(callbacks.onIntroStart).toHaveBeenCalledTimes(1);
    expect(callbacks.onIntroStart).toHaveBeenCalledWith(snippet);
    expect(bossSystem.isActive()).toBe(true);
  });

  it('fires entrance callback after the 1.5 second intro delay', () => {
    const callbacks = initBossCallbacks();

    bossSystem.startBoss(makeSnippet(), makeState(), jest.fn(), jest.fn());

    jest.advanceTimersByTime(1499);
    expect(callbacks.onEntranceStart).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callbacks.onEntranceStart).toHaveBeenCalledTimes(1);
  });

  it('activates typing and targets the first line after entrance delay', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();

    bossSystem.startBoss(snippet, makeState(), jest.fn(), jest.fn());
    finishBossIntroTimers();

    expect(typingEngine.activate).toHaveBeenCalledTimes(1);
    expect(callbacks.onFightStart).toHaveBeenCalledTimes(1);
    expect(typingEngine.setTarget).toHaveBeenCalledWith(snippet.lines[0]);
    expect(callbacks.onProgressUpdate).toHaveBeenLastCalledWith({
      currentLine: 1,
      completedLines: 0,
      totalLines: 3,
    });
  });

  it('advances to the next boss line when a line is defeated', () => {
    const callbacks = initBossCallbacks();
    const snippet = makeSnippet();

    bossSystem.startBoss(snippet, makeState(), jest.fn(), jest.fn());
    finishBossIntroTimers();

    jest.clearAllMocks();

    bossSystem.onLineDefeated();

    expect(typingEngine.setTarget).toHaveBeenCalledTimes(1);
    expect(typingEngine.setTarget).toHaveBeenCalledWith(snippet.lines[1].trimStart());
    expect(callbacks.onProgressUpdate).toHaveBeenCalledWith({
      currentLine: 2,
      completedLines: 1,
      totalLines: 3,
    });
  });

  it('advances through all boss lines in order', () => {
    const snippet = makeSnippet();

    initBossCallbacks();
    bossSystem.startBoss(snippet, makeState(), jest.fn(), jest.fn());
    finishBossIntroTimers();

    jest.clearAllMocks();

    bossSystem.onLineDefeated();
    expect(typingEngine.setTarget).toHaveBeenLastCalledWith(snippet.lines[1].trimStart());

    bossSystem.onLineDefeated();
    expect(typingEngine.setTarget).toHaveBeenLastCalledWith(snippet.lines[2].trimStart());
  });

  it('skips blank boss lines instead of setting an empty typing target', () => {
    const snippet = makeSnippetWithBlankLine();

    initBossCallbacks();
    bossSystem.startBoss(snippet, makeState(), jest.fn(), jest.fn());
    finishBossIntroTimers();

    jest.clearAllMocks();

    bossSystem.onLineDefeated();
    expect(typingEngine.setTarget).toHaveBeenLastCalledWith('position: relative;');

    bossSystem.onLineDefeated();
    expect(typingEngine.setTarget).toHaveBeenLastCalledWith('}');

    bossSystem.onLineDefeated();
    expect(typingEngine.setTarget).toHaveBeenLastCalledWith('.child {');
    expect(typingEngine.setTarget).not.toHaveBeenCalledWith('');
  });

  it('clears target, cleans up, and fires onBossDefeated after final line', () => {
    const callbacks = initBossCallbacks();
    const onBossDefeated = jest.fn();

    bossSystem.startBoss(makeSnippet(), makeState(), onBossDefeated, jest.fn());
    finishBossIntroTimers();

    bossSystem.onLineDefeated();
    bossSystem.onLineDefeated();
    bossSystem.onLineDefeated();

    expect(typingEngine.deactivate).toHaveBeenCalled();
    expect(typingEngine.clearTarget).toHaveBeenCalledTimes(1);
    expect(callbacks.onBossCleanup).toHaveBeenCalledTimes(1);
    expect(onBossDefeated).toHaveBeenCalledTimes(1);
    expect(onBossDefeated).toHaveBeenCalledWith(450);
    expect(bossSystem.isActive()).toBe(false);
  });

  it('reports complete progress before boss cleanup', () => {
    const callbacks = initBossCallbacks();

    bossSystem.startBoss(makeSnippet(), makeState(), jest.fn(), jest.fn());
    finishBossIntroTimers();

    bossSystem.onLineDefeated();
    bossSystem.onLineDefeated();
    bossSystem.onLineDefeated();

    expect(callbacks.onProgressUpdate).toHaveBeenLastCalledWith({
      currentLine: 3,
      completedLines: 3,
      totalLines: 3,
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

    bossSystem.startBoss(emptySnippet, makeState(), onBossDefeated, jest.fn());

    expect(typingEngine.deactivate).toHaveBeenCalled();
    expect(typingEngine.clearTarget).toHaveBeenCalledTimes(1);
    expect(callbacks.onBossCleanup).toHaveBeenCalledTimes(1);
    expect(onBossDefeated).toHaveBeenCalledWith(150);
    expect(bossSystem.isActive()).toBe(false);
  });
});
