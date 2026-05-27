/**
 * tests/enemySystem.test.js — Jest tests for enemySystem.js.
 *
 * Uses JSDOM instead of a custom FakeElement because Jest already provides
 * browser-like DOM nodes. This avoids mixing fake elements with real nodes.
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import * as EnemySystem from '../src/engine/enemySystem.js';

// ── Helpers ───────────────────────────────────────────────────────────────

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

// ── enemySystem ───────────────────────────────────────────────────────────

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

  it('sets default fall duration to 8 seconds', () => {
    createTestEnvironment();

    const enemyEl = EnemySystem.spawnEnemy('default speed;', 0);

    expect(enemyEl.style.animationDuration).toBe('8s');
  });
});

describe('enemySystem — fall speed multiplier', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    EnemySystem.clearAll();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('fallSpeedMultiplier 2 halves animation duration', () => {
    const { state } = createTestEnvironment();

    state.fallSpeedMultiplier = 2;
    const enemyEl = EnemySystem.spawnEnemy('fast enemy;', 1);

    expect(enemyEl.style.animationDuration).toBe('4s');
  });

  it('fallSpeedMultiplier 0.5 doubles animation duration', () => {
    const { state } = createTestEnvironment();

    state.fallSpeedMultiplier = 0.5;
    const enemyEl = EnemySystem.spawnEnemy('slow enemy;', 2);

    expect(enemyEl.style.animationDuration).toBe('16s');
  });

  it('clamps very small fallSpeedMultiplier values', () => {
    const { state } = createTestEnvironment();

    state.fallSpeedMultiplier = 0;
    const enemyEl = EnemySystem.spawnEnemy('clamped enemy;', 0);

    expect(enemyEl.style.animationDuration).toBe('80s');
  });
});

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
