/**
 * tests/enemySystem.test.js — Jest tests for enemySystem.js.
 *
 * Uses JSDOM instead of a custom FakeElement because Jest already provides
 * browser-like DOM nodes. This avoids mixing fake elements with real nodes.
 *
 * Updated by Sprint 4: duration assertions now use the character-length
 * fall-speed formula instead of the old flat BASE_FALL_DURATION_SECONDS = 16.
 * Expected values are derived from:
 *   duration = (BASE + charCount * PER_CHAR) / (clampedMultiplier * waveDifficulty)
 *   BASE = 4, PER_CHAR = 0.18, WAVE_SPEEDUP = 0.07, MIN_MULTIPLIER = 0.1
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import * as EnemySystem from '../src/engine/enemySystem.js';

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Mirrors the fall-duration formula from enemySystem.js so tests stay
 * in sync with the implementation without importing internal constants.
 * Any change to the constants in the module must be reflected here.
 * @param {string} line - The code text the enemy displays.
 * @param {number} wave - Current wave number (1-based).
 * @param {number} speedMultiplier - RunState fallSpeedMultiplier value.
 * @returns {string} The expected animationDuration CSS string, e.g. '6.52s'.
 */
function expectedDuration(line, wave, speedMultiplier) {
  const BASE_FALL_DURATION_SECONDS = 4;
  const PER_CHAR_SECONDS = 0.18;
  const WAVE_SPEEDUP = 0.07;
  const MIN_FALL_SPEED_MULTIPLIER = 0.1;

  const charCount = line.length;
  const lengthBonusSeconds = charCount * PER_CHAR_SECONDS;
  const waveDifficulty = 1 + (wave - 1) * WAVE_SPEEDUP;
  const clampedMultiplier = Math.max(speedMultiplier, MIN_FALL_SPEED_MULTIPLIER);
  const duration =
    (BASE_FALL_DURATION_SECONDS + lengthBonusSeconds) / (clampedMultiplier * waveDifficulty);
  return `${duration}s`;
}

/**
 * Creates a minimal DOM and initializes enemySystem.
 * @returns {object} Test environment references.
 */
function createTestEnvironment() {
  document.body.innerHTML = `
    <div id="play-area"></div>
    <div id="deadline-line"></div>
  `;

  const playAreaEl = document.getElementById('play-area');
  const deadlineEl = document.getElementById('deadline-line');

  Object.defineProperty(deadlineEl, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      top: 500,
      bottom: 503,
      left: 0,
      right: 800,
      width: 800,
      height: 3,
      x: 0,
      y: 500,
      toJSON: () => {},
    }),
  });

  const state = {
    fallSpeedMultiplier: 1,
    wave: 1,
  };

  const breachedEnemies = [];

  EnemySystem.clearAll();
  EnemySystem.init(playAreaEl, deadlineEl, state, (enemyEl) => {
    breachedEnemies.push(enemyEl);
  });

  return {
    breachedEnemies,
    deadlineEl,
    playAreaEl,
    state,
  };
}

/**
 * Stubs an enemy element's bounding rectangle.
 * @param {HTMLElement} enemyEl - Enemy element to update.
 * @param {object} rect - Rectangle values.
 * @returns {void}
 */
function setElementRect(enemyEl, rect) {
  Object.defineProperty(enemyEl, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      x: rect.left,
      y: rect.top,
      toJSON: () => {},
    }),
  });
}

/**
 * Flushes one requestAnimationFrame cycle.
 * @returns {void}
 */
function flushAnimationFrame() {
  jest.advanceTimersByTime(16);
}

// ── enemySystem — spawnEnemy ──────────────────────────────────────────────

describe('enemySystem — spawnEnemy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('returns an enemy element and appends it to the play area', () => {
    const { playAreaEl } = createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('const x = 1;', 0);

    expect(enemyEl).not.toBeNull();
    expect(enemyEl.classList.contains('enemy')).toBe(true);
    expect(playAreaEl.querySelectorAll('.enemy')).toHaveLength(1);
  });

  it('creates sprite and code elements', () => {
    createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('const x = 1;', 0);

    expect(enemyEl.querySelector('.enemy-sprite')).not.toBeNull();
    expect(enemyEl.querySelector('.enemy-code')).not.toBeNull();
    expect(enemyEl.querySelector('.enemy-code').textContent).toBe('const x = 1;');
  });

  it('positions enemies based on line index', () => {
    createTestEnvironment();

    const firstEnemy = EnemySystem.spawnEnemy('line 0;', 0);
    const secondEnemy = EnemySystem.spawnEnemy('line 1;', 1);

    expect(firstEnemy.style.left).toBe('10%');
    expect(secondEnemy.style.left).toBe('27%');
  });

  it('sets fall duration based on character length of the line', () => {
    const { state } = createTestEnvironment();

    const line = 'default speed;';
    const enemyEl = EnemySystem.spawnEnemy(line, 0);

    expect(enemyEl.style.animationDuration).toBe(
      expectedDuration(line, state.wave, state.fallSpeedMultiplier)
    );
  });

  it('longer lines receive a greater fall duration than shorter lines', () => {
    const { state } = createTestEnvironment();

    const shortLine = 'x;';
    const longLine = 'const result = someFunction(argumentOne, argumentTwo);';

    const shortEnemy = EnemySystem.spawnEnemy(shortLine, 0);
    const longEnemy = EnemySystem.spawnEnemy(longLine, 1);

    const shortDuration = parseFloat(shortEnemy.style.animationDuration);
    const longDuration = parseFloat(longEnemy.style.animationDuration);

    expect(longDuration).toBeGreaterThan(shortDuration);
  });

  it('later waves produce shorter fall durations for the same line', () => {
    const { state } = createTestEnvironment();
    const line = 'const x = 1;';

    state.wave = 1;
    const wave1Enemy = EnemySystem.spawnEnemy(line, 0);
    const wave1Duration = parseFloat(wave1Enemy.style.animationDuration);

    state.wave = 5;
    const wave5Enemy = EnemySystem.spawnEnemy(line, 1);
    const wave5Duration = parseFloat(wave5Enemy.style.animationDuration);

    expect(wave5Duration).toBeLessThan(wave1Duration);
  });
});

// ── enemySystem — fall speed multiplier ──────────────────────────────────

describe('enemySystem — fall speed multiplier', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('fallSpeedMultiplier 2 halves animation duration relative to multiplier 1', () => {
    const { state } = createTestEnvironment();
    const line = 'fast enemy;';

    state.fallSpeedMultiplier = 2;
    const fastEnemy = EnemySystem.spawnEnemy(line, 1);

    expect(fastEnemy.style.animationDuration).toBe(expectedDuration(line, state.wave, 2));
  });

  it('fallSpeedMultiplier 0.5 doubles animation duration relative to multiplier 1', () => {
    const { state } = createTestEnvironment();
    const line = 'slow enemy;';

    state.fallSpeedMultiplier = 0.5;
    const slowEnemy = EnemySystem.spawnEnemy(line, 2);

    expect(slowEnemy.style.animationDuration).toBe(expectedDuration(line, state.wave, 0.5));
  });

  it('multiplier 2 produces exactly half the duration of multiplier 1 for the same line', () => {
    const { state } = createTestEnvironment();
    const line = 'const speed = test;';

    state.fallSpeedMultiplier = 1;
    const normalEnemy = EnemySystem.spawnEnemy(line, 0);
    const normalDuration = parseFloat(normalEnemy.style.animationDuration);

    state.fallSpeedMultiplier = 2;
    const fastEnemy = EnemySystem.spawnEnemy(line, 1);
    const fastDuration = parseFloat(fastEnemy.style.animationDuration);

    expect(fastDuration).toBeCloseTo(normalDuration / 2, 10);
  });

  it('clamps very small fallSpeedMultiplier values to MIN_FALL_SPEED_MULTIPLIER', () => {
    const { state } = createTestEnvironment();
    const line = 'clamped enemy;';

    state.fallSpeedMultiplier = 0;
    const clampedEnemy = EnemySystem.spawnEnemy(line, 0);

    // 0 clamps to MIN_FALL_SPEED_MULTIPLIER (0.1), so duration equals formula at 0.1.
    expect(clampedEnemy.style.animationDuration).toBe(expectedDuration(line, state.wave, 0));
  });

  it('clamped multiplier produces the same duration as MIN_FALL_SPEED_MULTIPLIER', () => {
    const { state } = createTestEnvironment();
    const line = 'clamped enemy;';

    state.fallSpeedMultiplier = 0;
    const zeroMultiplierEnemy = EnemySystem.spawnEnemy(line, 0);

    state.fallSpeedMultiplier = 0.1;
    const minMultiplierEnemy = EnemySystem.spawnEnemy(line, 1);

    expect(zeroMultiplierEnemy.style.animationDuration).toBe(
      minMultiplierEnemy.style.animationDuration
    );
  });
});

// ── enemySystem — defeatEnemy ─────────────────────────────────────────────

describe('enemySystem — defeatEnemy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('adds dissolving class and removes enemy after timeout', () => {
    createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('return ghost;', 0);

    EnemySystem.defeatEnemy(enemyEl);

    expect(enemyEl.classList.contains('dissolving')).toBe(true);
    expect(enemyEl.isConnected).toBe(true);

    jest.advanceTimersByTime(500);

    expect(enemyEl.isConnected).toBe(false);
  });

  it('does nothing for null enemy', () => {
    createTestEnvironment();

    expect(() => {
      EnemySystem.defeatEnemy(null);
    }).not.toThrow();
  });
});

// ── enemySystem — pauseAll and resumeAll ──────────────────────────────────

describe('enemySystem — pauseAll and resumeAll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('pauses and resumes active enemies', () => {
    createTestEnvironment();

    const firstEnemy = EnemySystem.spawnEnemy('let a = 1;', 0);
    const secondEnemy = EnemySystem.spawnEnemy('let b = 2;', 1);

    EnemySystem.pauseAll();

    expect(firstEnemy.style.animationPlayState).toBe('paused');
    expect(secondEnemy.style.animationPlayState).toBe('paused');

    EnemySystem.resumeAll();

    expect(firstEnemy.style.animationPlayState).toBe('running');
    expect(secondEnemy.style.animationPlayState).toBe('running');
  });
});

// ── enemySystem — deadline breach detection ───────────────────────────────

describe('enemySystem — deadline breach detection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('does not trigger breach when enemy is above deadline', () => {
    const { breachedEnemies } = createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('deadline test;', 0);
    setElementRect(enemyEl, {
      top: 100,
      bottom: 200,
      left: 0,
      right: 100,
    });

    flushAnimationFrame();

    expect(breachedEnemies).toHaveLength(0);
  });

  it('triggers breach when enemy crosses deadline', () => {
    const { breachedEnemies } = createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('deadline test;', 0);
    setElementRect(enemyEl, {
      top: 450,
      bottom: 510,
      left: 0,
      right: 100,
    });

    flushAnimationFrame();

    expect(breachedEnemies).toHaveLength(1);
    expect(breachedEnemies[0]).toBe(enemyEl);
    expect(enemyEl.classList.contains('breached')).toBe(true);
  });

  it('does not trigger breach callback twice for same enemy', () => {
    const { breachedEnemies } = createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('deadline test;', 0);
    setElementRect(enemyEl, {
      top: 450,
      bottom: 510,
      left: 0,
      right: 100,
    });

    flushAnimationFrame();
    flushAnimationFrame();

    expect(breachedEnemies).toHaveLength(1);
  });
});

// ── enemySystem — clearAll ────────────────────────────────────────────────

describe('enemySystem — clearAll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('removes all active enemies', () => {
    const { playAreaEl } = createTestEnvironment();

    EnemySystem.spawnEnemy('clear one;', 0);
    EnemySystem.spawnEnemy('clear two;', 1);

    EnemySystem.clearAll();

    expect(playAreaEl.querySelectorAll('.enemy')).toHaveLength(0);
  });

  it('cleared enemies do not trigger breach callbacks', () => {
    const { breachedEnemies } = createTestEnvironment();

    const firstEnemy = EnemySystem.spawnEnemy('clear one;', 0);
    const secondEnemy = EnemySystem.spawnEnemy('clear two;', 1);

    setElementRect(firstEnemy, {
      top: 450,
      bottom: 510,
      left: 0,
      right: 100,
    });
    setElementRect(secondEnemy, {
      top: 450,
      bottom: 510,
      left: 0,
      right: 100,
    });

    EnemySystem.clearAll();
    flushAnimationFrame();

    expect(breachedEnemies).toHaveLength(0);
  });
});
