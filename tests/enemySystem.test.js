/**
 * tests/enemySystem.test.js — Custom tests for enemySystem.js.
 *
 * No test framework required. Run with:
 *   node --experimental-vm-modules tests/enemySystem.test.js
 *
 * A passing test prints:  PASS: <description>
 * A failing test prints:  FAIL: <description> — <reason>
 * Summary is printed at the end.
 */

import * as EnemySystem from '../src/engine/enemySystem.js';

// ─── Tiny test runner ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, description, detail = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ─────────────────────────────────`);
}

// ─── Minimal fake DOM ────────────────────────────────────────────────────────

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.classes = new Set();
  }

  add(className) {
    this.classes.add(className);
    this.element.className = [...this.classes].join(' ');
  }

  remove(className) {
    this.classes.delete(className);
    this.element.className = [...this.classes].join(' ');
  }

  contains(className) {
    return this.classes.has(className);
  }

  setFromString(classNameString) {
    this.classes = new Set(classNameString.split(/\s+/).filter(Boolean));
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.dataset = {};
    this.textContent = '';
    this.isConnected = false;
    this.rect = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };

    this.classList = new FakeClassList(this);
    this.classNameValue = '';
  }

  get className() {
    return this.classNameValue;
  }

  set className(value) {
    this.classNameValue = value;
    this.classList.setFromString(value);
  }

  set innerHTML(_markup) {
    this.children = [];

    const spriteEl = new FakeElement('svg');
    spriteEl.className = 'enemy-sprite';

    const codeEl = new FakeElement('div');
    codeEl.className = 'enemy-code';

    this.appendChild(spriteEl);
    this.appendChild(codeEl);
  }

  appendChild(child) {
    child.parentNode = this;
    child.isConnected = this.isConnected;
    this.children.push(child);
    child.markConnected(this.isConnected);
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    }

    this.parentNode = null;
    this.markConnected(false);
  }

  markConnected(isConnected) {
    this.isConnected = isConnected;

    for (const child of this.children) {
      child.markConnected(isConnected);
    }
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector) {
    const matches = [];

    function visit(element) {
      if (matchesSelector(element, selector)) {
        matches.push(element);
      }

      for (const child of element.children) {
        visit(child);
      }
    }

    for (const child of this.children) {
      visit(child);
    }

    return matches;
  }

  getBoundingClientRect() {
    return this.rect;
  }
}

function matchesSelector(element, selector) {
  if (selector === '.enemy') {
    return element.classList.contains('enemy');
  }

  if (selector === '.enemy-code') {
    return element.classList.contains('enemy-code');
  }

  if (selector === '.enemy-sprite') {
    return element.classList.contains('enemy-sprite');
  }

  return false;
}

const pendingAnimationFrames = new Map();
const pendingTimeouts = [];
let nextAnimationFrameId = 1;

globalThis.document = {
  createElement(tagName) {
    return new FakeElement(tagName);
  },
};

globalThis.window = {
  requestAnimationFrame(callback) {
    const frameId = nextAnimationFrameId;
    nextAnimationFrameId++;
    pendingAnimationFrames.set(frameId, callback);
    return frameId;
  },

  cancelAnimationFrame(frameId) {
    pendingAnimationFrames.delete(frameId);
  },

  setTimeout(callback, _delay) {
    pendingTimeouts.push(callback);
    return pendingTimeouts.length;
  },
};

function flushAnimationFrame() {
  const frameEntries = [...pendingAnimationFrames.entries()];
  pendingAnimationFrames.clear();

  for (const [_frameId, callback] of frameEntries) {
    callback();
  }
}

function flushTimeouts() {
  while (pendingTimeouts.length > 0) {
    const callback = pendingTimeouts.shift();
    callback();
  }
}

function createTestEnvironment() {
  pendingAnimationFrames.clear();
  pendingTimeouts.length = 0;

  const playAreaEl = new FakeElement('div');
  playAreaEl.className = 'play-area';
  playAreaEl.markConnected(true);

  const deadlineEl = new FakeElement('div');
  deadlineEl.id = 'deadline-line';
  deadlineEl.className = 'deadline-line';
  deadlineEl.rect = {
    top: 500,
    bottom: 503,
    left: 0,
    right: 800,
  };
  deadlineEl.markConnected(true);

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

// ─── Tests ───────────────────────────────────────────────────────────────────

section('enemySystem.js — spawnEnemy');

{
  const { playAreaEl } = createTestEnvironment();

  const enemyEl = EnemySystem.spawnEnemy('const x = 1;', 0);

  assert(enemyEl !== null, 'spawnEnemy returns an enemy element');
  assert(enemyEl.classList.contains('enemy'), 'spawned element has .enemy class');
  assert(playAreaEl.querySelectorAll('.enemy').length === 1, 'enemy is appended to play area');
  assert(enemyEl.querySelector('.enemy-sprite') !== null, 'enemy contains .enemy-sprite');
  assert(enemyEl.querySelector('.enemy-code') !== null, 'enemy contains .enemy-code');
  assert(
    enemyEl.querySelector('.enemy-code').textContent === 'const x = 1;',
    'enemy code text is set'
  );
  assert(enemyEl.style.left === '10%', 'lineIndex 0 sets expected horizontal position');
  assert(enemyEl.style.animationDuration === '8s', 'default fall duration is 8s');
}

section('enemySystem.js — fall speed multiplier');

{
  const { state } = createTestEnvironment();

  state.fallSpeedMultiplier = 2;
  const fastEnemy = EnemySystem.spawnEnemy('fast enemy;', 1);

  assert(
    fastEnemy.style.animationDuration === '4s',
    'fallSpeedMultiplier 2 halves animation duration'
  );

  state.fallSpeedMultiplier = 0.5;
  const slowEnemy = EnemySystem.spawnEnemy('slow enemy;', 2);

  assert(
    slowEnemy.style.animationDuration === '16s',
    'fallSpeedMultiplier 0.5 doubles animation duration'
  );
}

section('enemySystem.js — defeatEnemy');

{
  createTestEnvironment();

  const enemyEl = EnemySystem.spawnEnemy('return ghost;', 0);

  EnemySystem.defeatEnemy(enemyEl);

  assert(enemyEl.classList.contains('dissolving'), 'defeatEnemy adds .dissolving class');
  assert(enemyEl.isConnected, 'defeated enemy remains connected before timeout finishes');

  flushTimeouts();

  assert(!enemyEl.isConnected, 'defeated enemy is removed after dissolve timeout');
}

section('enemySystem.js — pauseAll and resumeAll');

{
  createTestEnvironment();

  const firstEnemy = EnemySystem.spawnEnemy('let a = 1;', 0);
  const secondEnemy = EnemySystem.spawnEnemy('let b = 2;', 1);

  EnemySystem.pauseAll();

  assert(firstEnemy.style.animationPlayState === 'paused', 'pauseAll pauses first enemy');
  assert(secondEnemy.style.animationPlayState === 'paused', 'pauseAll pauses second enemy');

  EnemySystem.resumeAll();

  assert(firstEnemy.style.animationPlayState === 'running', 'resumeAll resumes first enemy');
  assert(secondEnemy.style.animationPlayState === 'running', 'resumeAll resumes second enemy');
}

section('enemySystem.js — rAF deadline breach detection');

{
  const { breachedEnemies } = createTestEnvironment();

  const enemyEl = EnemySystem.spawnEnemy('deadline test;', 0);

  enemyEl.rect = {
    top: 100,
    bottom: 200,
    left: 0,
    right: 100,
  };

  flushAnimationFrame();

  assert(breachedEnemies.length === 0, 'enemy above deadline does not trigger breach');

  enemyEl.rect = {
    top: 450,
    bottom: 510,
    left: 0,
    right: 100,
  };

  flushAnimationFrame();

  assert(breachedEnemies.length === 1, 'enemy crossing deadline triggers breach once');
  assert(breachedEnemies[0] === enemyEl, 'breach callback receives crossed enemy element');
  assert(enemyEl.classList.contains('breached'), 'crossed enemy gets .breached class');

  flushAnimationFrame();

  assert(breachedEnemies.length === 1, 'breached enemy does not trigger callback twice');
}

section('enemySystem.js — clearAll');

{
  const { playAreaEl, breachedEnemies } = createTestEnvironment();

  const firstEnemy = EnemySystem.spawnEnemy('clear one;', 0);
  const secondEnemy = EnemySystem.spawnEnemy('clear two;', 1);

  firstEnemy.rect = {
    top: 450,
    bottom: 510,
    left: 0,
    right: 100,
  };
  secondEnemy.rect = {
    top: 450,
    bottom: 510,
    left: 0,
    right: 100,
  };

  EnemySystem.clearAll();
  flushAnimationFrame();

  assert(playAreaEl.querySelectorAll('.enemy').length === 0, 'clearAll removes all enemies');
  assert(breachedEnemies.length === 0, 'cleared enemies do not trigger breach callbacks');
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

if (failed === 0) {
  console.log('All tests passed ✓');
} else {
  console.error(`${failed} test(s) failed ✗`);
  process.exit(1);
}
