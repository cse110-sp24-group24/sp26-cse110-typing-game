/**
 * ui/hudManager.js — HUD rendering.
 *
 * Owns: #score-display (animated counter), #lives-display,
 * #wave-display, #lang-badge, #upgrades-panel.
 *
 * Implemented by Issue #18.
 */

const LANG_LABELS = { javascript: 'JS', html: 'HTML', css: 'CSS' };

let scoreEl = null;
let livesEl = null;
let waveEl = null;
let langEl = null;
let upgradesEl = null;

let _displayedScore = 0;
let _targetScore = 0;
let _rafId = null;
const SCORE_ANIM_MS = 300;

/**
 * Attach to the HUD DOM element and render initial state.
 * Uses hudEl as the query root so the module never assumes a global
 * document layout — consistent with ADR-003.
 *
 * @param {object}      state  - RunState for the new run.
 * @param {HTMLElement} hudEl  - The #game-hud root element.
 * @returns {void}
 */
export function init(state, hudEl) {
  const root = hudEl ?? document;

  scoreEl = root.querySelector('#score-display');
  livesEl = root.querySelector('#lives-display');
  waveEl = root.querySelector('#wave-display');
  langEl = root.querySelector('#lang-badge');
  upgradesEl = root.querySelector('#upgrades-panel');

  _displayedScore = 0;
  _targetScore = 0;

  if (state) {
    updateScore(state.score ?? 0);
    updateLives(state.lives ?? 3);
    updateWave(state.wave ?? 1);
    if (langEl) langEl.textContent = LANG_LABELS[state.language] ?? state.language ?? '';
    updateUpgrades(state.upgrades ?? []);
  }
}

/**
 * Re-render all HUD values from RunState.
 * @param {object} state - RunState
 */
export function update(state) {
  if (!state) return;
  updateScore(state.score ?? 0);
  updateLives(state.lives ?? 0);
  updateWave(state.wave ?? 1);
  if (langEl) langEl.textContent = LANG_LABELS[state.language] ?? state.language ?? '';
  updateUpgrades(state.upgrades ?? []);
}

/** @param {number} score */
export function updateScore(_score) {
  // Issue #18
  if (_rafId !== null) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }

  const start = _displayedScore;
  const end = Math.round(_score);
  _targetScore = end;
  const t0 = performance.now();

  function tick(now) {
    const p = Math.min((now - t0) / SCORE_ANIM_MS, 1);
    _displayedScore = Math.round(start + (end - start) * (1 - (1 - p) * (1 - p)));
    if (scoreEl) scoreEl.textContent = String(_displayedScore);
    if (p < 1) {
      _rafId = requestAnimationFrame(tick);
    } else {
      _rafId = null;
    }
  }

  _rafId = requestAnimationFrame(tick);
}

/**
 * Tick score up by points from its current target.
 * @param {number} points
 */
export function animateScoreGain(points) {
  updateScore(_targetScore + points);
}

/** @param {number} lives */
export function updateLives(_lives) {
  // Issue #18
  if (!livesEl) return;
  livesEl.innerHTML = '';
  for (let i = 0; i < _lives; i++) {
    const h = document.createElement('span');
    h.className = 'heart';
    h.setAttribute('aria-hidden', 'true');
    h.textContent = '♥';
    livesEl.appendChild(h);
  }
  livesEl.setAttribute('aria-label', `${_lives} lives remaining`);
}

/** @param {number} wave */
export function updateWave(_wave) {
  // Issue #18
  if (waveEl) waveEl.textContent = `Wave ${_wave}`;
}

/**
 * @param {string[] | Array<{id: string, icon?: string, name?: string}>} upgradeIds
 */
export function updateUpgrades(_upgradeIds) {
  // Issue #18
  if (!upgradesEl) return;
  upgradesEl.innerHTML = '';
  for (const u of _upgradeIds) {
    addUpgrade(typeof u === 'string' ? { id: u } : u);
  }
}

/**
 * Append one upgrade chip to the panel.
 * @param {{ id: string, icon?: string, name?: string }} upgrade
 */
export function addUpgrade(upgrade) {
  if (!upgradesEl) return;
  const chip = document.createElement('span');
  chip.className = 'upgrade-chip';
  chip.title = upgrade.name ?? upgrade.id ?? '';
  chip.textContent = (upgrade.icon ?? '⚡') + ' ' + (upgrade.name ?? upgrade.id ?? '').slice(0, 6);
  upgradesEl.appendChild(chip);
}
