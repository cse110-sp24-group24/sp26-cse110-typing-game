/**
 * tests/waveManager.test.js — Jest tests for waveManager.js (Issue #7).
 *
 * enemySystem and typingEngine are mocked so tests run without a real DOM.
 * Uses jest.unstable_mockModule (the correct ESM API) followed by dynamic
 * imports so waveManager picks up the mocked versions of its dependencies.
 *
 * Covers wave behavior:
 *   1. Wave loads snippet and spawns first enemy immediately
 *   2. Lines spawn through a shuffled source-index order
 *   3. After the last enemy is defeated, onWaveClear fires with the snippet
 *   4. state.wave increments at the start of each new wave, except the first
 *   5. The same snippet is never used twice in the same run
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Set up mocks BEFORE any dynamic imports of modules that depend on them.
// jest.unstable_mockModule is the correct ESM API — jest.mock() hoisting
// does not work reliably with --experimental-vm-modules.
jest.unstable_mockModule('../src/engine/enemySystem.js', () => ({
  spawnEnemy: jest.fn(() => document.createElement('div')),
  defeatEnemy: jest.fn(),
  // waveManager passes this ghost code element to setTarget so typing
  // feedback mirrors onto the falling enemy; the value is opaque here.
  getEnemyCodeEl: jest.fn(() => document.createElement('div')),
}));

jest.unstable_mockModule('../src/engine/typingEngine.js', () => ({
  setTarget: jest.fn(),
}));

// Dynamic imports after mock setup so waveManager loads the mocked modules.
const { init, prepareWave, startWave, onEnemyDefeated, getCurrentSnippet, getCurrentLineIndex } =
  await import('../src/engine/waveManager.js');
const enemySystem = await import('../src/engine/enemySystem.js');
const typingEngine = await import('../src/engine/typingEngine.js');

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Creates a minimal RunState for testing.
 * @returns {object} A minimal state object.
 */
function makeState() {
  return { language: 'javascript', wave: 1, currentSnippetId: null };
}

/**
 * Picks a snippet then starts combat (matches main.js flow after wave intro).
 * @returns {void}
 */
function beginWave() {
  prepareWave();
  startWave();
}

/**
 * Returns the most recent call made to a Jest mock function.
 * @param {Function} mockFn - Jest mock function to inspect.
 * @returns {Array} The most recent call arguments.
 */
function getLastMockCall(mockFn) {
  return mockFn.mock.calls[mockFn.mock.calls.length - 1];
}

/**
 * Returns the trimmed source line for the current enemy.
 * @returns {string} Current enemy line text.
 */
function getCurrentTrimmedLine() {
  const snippet = getCurrentSnippet();
  const currentIndex = getCurrentLineIndex();
  return snippet.lines[currentIndex].trimStart();
}

// ── init ──────────────────────────────────────────────────────────────────

describe('waveManager — init', () => {
  it('getCurrentSnippet returns null before prepareWave is called', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    expect(getCurrentSnippet()).toBeNull();
  });

  it('resets snippet state when called a second time', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();
    expect(getCurrentSnippet()).not.toBeNull();

    // Re-init must reset snippet back to null.
    init(makeState(), jest.fn(), jest.fn());
    expect(getCurrentSnippet()).toBeNull();
  });
});

// ── startWave ─────────────────────────────────────────────────────────────

describe('waveManager — startWave', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Acceptance criterion 1: first enemy spawns immediately
  it('picks a snippet and spawns the first enemy on startWave', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    const snippet = getCurrentSnippet();
    const currentIndex = getCurrentLineIndex();

    expect(snippet).not.toBeNull();
    expect(enemySystem.spawnEnemy).toHaveBeenCalledTimes(1);
    expect(enemySystem.spawnEnemy).toHaveBeenCalledWith(snippet.lines[currentIndex].trimStart(), 0);
  });

  it('sets the typing target to the current shuffled line on startWave', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    const snippet = getCurrentSnippet();
    const currentIndex = getCurrentLineIndex();

    // Second arg is the ghost code element used to mirror typing feedback.
    expect(typingEngine.setTarget).toHaveBeenCalledWith(
      snippet.lines[currentIndex].trimStart(),
      expect.anything()
    );
  });

  it('calls onWaveStart with the chosen snippet', () => {
    const state = makeState();
    const onWaveStart = jest.fn();
    init(state, jest.fn(), onWaveStart);
    beginWave();

    expect(onWaveStart).toHaveBeenCalledTimes(1);
    expect(onWaveStart).toHaveBeenCalledWith(getCurrentSnippet());
  });

  it('sets state.currentSnippetId to the chosen snippet id', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    expect(state.currentSnippetId).toBe(getCurrentSnippet().id);
  });

  // Acceptance criterion 4: wave counter stays at 1 for first wave
  it('does not increment state.wave on the first prepareWave call', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    prepareWave();

    expect(state.wave).toBe(1);
  });

  it('increments state.wave by 1 on each subsequent prepareWave call', () => {
    const state = makeState();
    const onWaveClear = jest.fn();
    init(state, onWaveClear, jest.fn());

    beginWave();
    expect(state.wave).toBe(1);

    // Complete first wave, then start second.
    const firstLen = getCurrentSnippet().lines.length;
    for (let i = 0; i < firstLen; i += 1) {
      onEnemyDefeated();
    }
    prepareWave();
    startWave();
    expect(state.wave).toBe(2);

    // Complete second wave, then start third.
    const secondLen = getCurrentSnippet().lines.length;
    for (let i = 0; i < secondLen; i += 1) {
      onEnemyDefeated();
    }
    prepareWave();
    startWave();
    expect(state.wave).toBe(3);
  });
});

// ── onEnemyDefeated ───────────────────────────────────────────────────────

describe('waveManager — onEnemyDefeated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls defeatEnemy on the element returned by spawnEnemy', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    const spawnedEl = enemySystem.spawnEnemy.mock.results[0].value;
    onEnemyDefeated();

    expect(enemySystem.defeatEnemy).toHaveBeenCalledWith(spawnedEl);
  });

  // Acceptance criterion 2: next enemy follows the shuffled spawn order.
  it('spawns the next shuffled line after a defeat', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    jest.clearAllMocks();

    onEnemyDefeated();
    jest.advanceTimersByTime(300);

    expect(enemySystem.spawnEnemy).toHaveBeenCalledWith(getCurrentTrimmedLine(), 1);
    expect(typingEngine.setTarget).toHaveBeenCalledWith(getCurrentTrimmedLine(), expect.anything());
  });

  it('advances through every line in shuffled order exactly once', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    const snippet = getCurrentSnippet();
    const seenSourceIndexes = [getCurrentLineIndex()];

    jest.clearAllMocks();

    // Defeat all but the last active line, checking each next target.
    for (let i = 1; i < snippet.lines.length; i += 1) {
      onEnemyDefeated();
      jest.advanceTimersByTime(300);

      const currentIndex = getCurrentLineIndex();
      seenSourceIndexes.push(currentIndex);

      expect(typingEngine.setTarget).toHaveBeenLastCalledWith(
        snippet.lines[currentIndex].trimStart(),
        expect.anything()
      );
    }

    expect(seenSourceIndexes).toHaveLength(snippet.lines.length);
    expect(new Set(seenSourceIndexes).size).toBe(snippet.lines.length);
  });

  it('spawns lines in a shuffled order instead of source order', () => {
    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0);

    try {
      const state = makeState();
      init(state, jest.fn(), jest.fn());
      beginWave();

      const snippet = getCurrentSnippet();
      const sourceOrderLines = snippet.lines.map((line) => line.trimStart());
      const spawnedLines = [getLastMockCall(enemySystem.spawnEnemy)[0]];

      for (let i = 1; i < snippet.lines.length; i += 1) {
        onEnemyDefeated();
        jest.advanceTimersByTime(300);
        spawnedLines.push(getLastMockCall(enemySystem.spawnEnemy)[0]);
      }

      expect(spawnedLines).toHaveLength(sourceOrderLines.length);
      expect(new Set(spawnedLines)).toEqual(new Set(sourceOrderLines));

      if (sourceOrderLines.length > 1) {
        expect(spawnedLines).not.toEqual(sourceOrderLines);
      }
    } finally {
      Math.random = originalRandom;
    }
  });

  // Acceptance criterion 3: onWaveClear fires after last enemy
  it('fires onWaveClear with the snippet when the last line is defeated', () => {
    const state = makeState();
    const onWaveClear = jest.fn();
    init(state, onWaveClear, jest.fn());
    beginWave();

    const lineCount = getCurrentSnippet().lines.length;
    for (let i = 0; i < lineCount; i += 1) {
      onEnemyDefeated();
      jest.advanceTimersByTime(300);
    }

    expect(onWaveClear).toHaveBeenCalledTimes(1);
    expect(onWaveClear).toHaveBeenCalledWith(
      expect.objectContaining({ id: getCurrentSnippet().id })
    );
  });

  it('does not spawn another enemy after onWaveClear fires', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    const lineCount = getCurrentSnippet().lines.length;
    jest.clearAllMocks();

    for (let i = 0; i < lineCount; i += 1) {
      onEnemyDefeated();
      jest.advanceTimersByTime(300);
    }

    // The intermediate defeats each spawn the next line (lineCount - 1 total),
    // but the final defeat must NOT spawn a new enemy.
    expect(enemySystem.spawnEnemy).toHaveBeenCalledTimes(lineCount - 1);
  });

  it('getCurrentLineIndex returns the true source index of the current enemy', () => {
    const state = makeState();
    init(state, jest.fn(), jest.fn());
    beginWave();

    let currentIndex = getCurrentLineIndex();
    let lastSpawnCall = getLastMockCall(enemySystem.spawnEnemy);

    expect(lastSpawnCall[0]).toBe(getCurrentSnippet().lines[currentIndex].trimStart());

    onEnemyDefeated();
    jest.advanceTimersByTime(300);

    currentIndex = getCurrentLineIndex();
    lastSpawnCall = getLastMockCall(enemySystem.spawnEnemy);

    expect(lastSpawnCall[0]).toBe(getCurrentSnippet().lines[currentIndex].trimStart());
  });
});

// ── getRandomSnippet — no repeats (acceptance criterion 5) ────────────────

describe('getRandomSnippet — no duplicate snippets in a run', () => {
  it('returns a different snippet when the previous one is in usedIds', async () => {
    const { getRandomSnippet } = await import('../src/snippets/index.js');
    const used = [];

    const first = getRandomSnippet('javascript', used);
    used.push(first.id);
    const second = getRandomSnippet('javascript', used);

    expect(first.id).not.toBe(second.id);
  });

  it('resets pool and still returns a snippet when all have been used', async () => {
    const { getRandomSnippet, getSnippetsForLanguage } = await import('../src/snippets/index.js');
    const allIds = getSnippetsForLanguage('javascript').map((snippet) => snippet.id);

    // All snippets marked used — should still return one (pool resets).
    const result = getRandomSnippet('javascript', allIds);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('id');
  });

  it('returns a different html snippet when the previous one is in usedIds', async () => {
    const { getRandomSnippet } = await import('../src/snippets/index.js');
    const used = [];

    const first = getRandomSnippet('html', used);
    used.push(first.id);
    const second = getRandomSnippet('html', used);

    expect(first.id).not.toBe(second.id);
  });

  it('resets html pool and still returns a snippet when all have been used', async () => {
    const { getRandomSnippet, getSnippetsForLanguage } = await import('../src/snippets/index.js');
    const allIds = getSnippetsForLanguage('html').map((snippet) => snippet.id);

    const result = getRandomSnippet('html', allIds);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('id');
  });

  it('returns a different css snippet when the previous one is in usedIds', async () => {
    const { getRandomSnippet } = await import('../src/snippets/index.js');
    const used = [];

    const first = getRandomSnippet('css', used);
    used.push(first.id);
    const second = getRandomSnippet('css', used);

    expect(first.id).not.toBe(second.id);
  });

  it('resets css pool and still returns a snippet when all have been used', async () => {
    const { getRandomSnippet, getSnippetsForLanguage } = await import('../src/snippets/index.js');
    const allIds = getSnippetsForLanguage('css').map((snippet) => snippet.id);

    const result = getRandomSnippet('css', allIds);

    expect(result).not.toBeNull();
    expect(result).toHaveProperty('id');
  });
});
