/**
 * ui/statsScreen.js — End-of-run stats screen rendering.
 *
 * Owns: populating end-of-run stats from statTracker.getSummary() output
 * and wiring #play-again-btn to return to language selection.
 *
 * Implemented by Issue #20.
 */

import { showScreen } from './screenManager.js';

const SCORE_FORMULA_CAPTION = 'WPM × accuracy × wave multiplier';

/**
 * Renders the end-of-run stats screen from a statTracker summary object.
 * @param {object} summary - Output of statTracker.getSummary(state).
 * @param {number} summary.totalAccuracy - Run-wide accuracy percentage.
 * @param {number} summary.averageWpm - Average WPM across the run.
 * @param {number} summary.wavesCleared - Number of waves completed.
 * @param {number} summary.finalScore - Final score from RunState.
 * @param {Array<object>} [summary.waveData] - Per-wave { wpm, accuracy, ... } entries.
 * @returns {void}
 */
export function show(summary) {
  const statusEl = document.getElementById('stats-status');
  const accuracyEl = document.getElementById('stats-accuracy');
  const wpmEl = document.getElementById('stats-wpm');
  const wavesEl = document.getElementById('stats-waves');
  const scoreEl = document.getElementById('stats-score');
  const formulaEl = document.getElementById('stats-score-formula');
  const breakdownToggleEl = document.getElementById('stats-breakdown-toggle');
  const breakdownEl = document.getElementById('stats-breakdown');
  const playAgainBtn = document.getElementById('play-again-btn');

  const totalAccuracy = summary?.totalAccuracy ?? 0;
  const averageWpm = summary?.averageWpm ?? 0;
  const wavesCleared = summary?.wavesCleared ?? 0;
  const finalScore = summary?.finalScore ?? 0;
  const waveData = Array.isArray(summary?.waveData) ? summary.waveData : [];

  if (statusEl) {
    statusEl.textContent = 'You Died';
  }
  if (accuracyEl) {
    accuracyEl.innerHTML = `<span class="stats-accuracy-label">Total Accuracy</span><span class="stats-accuracy-value">${totalAccuracy}%</span>`;
    accuracyEl.setAttribute('aria-label', `Total accuracy ${totalAccuracy} percent`);
  }
  if (wpmEl) {
    wpmEl.textContent = `Avg WPM: ${Math.round(averageWpm)}`;
  }
  if (wavesEl) {
    wavesEl.textContent = `Waves Survived: ${wavesCleared}`;
  }
  if (scoreEl) {
    scoreEl.textContent = `Score: ${finalScore.toLocaleString()}`;
  }
  if (formulaEl) {
    formulaEl.textContent = `(${SCORE_FORMULA_CAPTION})`;
  }

  renderWaveBreakdown(breakdownEl, breakdownToggleEl, waveData);

  if (playAgainBtn) {
    playAgainBtn.onclick = () => {
      showScreen('language-screen');
    };
  }
}

/**
 * Builds the per-wave breakdown table and wires the expand/collapse toggle.
 * @param {HTMLElement | null} breakdownEl - Container for breakdown rows.
 * @param {HTMLElement | null} toggleEl - Button that toggles visibility.
 * @param {Array<object>} waveData - Per-wave stats from getSummary().
 * @returns {void}
 */
function renderWaveBreakdown(breakdownEl, toggleEl, waveData) {
  if (!breakdownEl) {
    return;
  }

  breakdownEl.innerHTML = '';
  breakdownEl.classList.add('collapsed');
  breakdownEl.setAttribute('aria-hidden', 'true');

  if (waveData.length === 0) {
    if (toggleEl) {
      toggleEl.classList.add('hidden');
      toggleEl.onclick = null;
    }
    return;
  }

  const header = document.createElement('div');
  header.className = 'stats-breakdown-row stats-breakdown-row--header';
  header.innerHTML = '<span>Wave</span><span>WPM</span><span>Accuracy</span>';
  breakdownEl.appendChild(header);

  waveData.forEach((wave, index) => {
    const row = document.createElement('div');
    row.className = 'stats-breakdown-row';
    const wpm = Math.round(wave.wpm ?? 0);
    const accuracy = wave.accuracy ?? 0;
    row.innerHTML = `<span>Wave ${index + 1}</span><span>${wpm}</span><span>${accuracy}%</span>`;
    breakdownEl.appendChild(row);
  });

  if (!toggleEl) {
    return;
  }

  toggleEl.classList.remove('hidden');
  toggleEl.textContent = 'Show per-wave breakdown';
  toggleEl.setAttribute('aria-expanded', 'false');
  toggleEl.setAttribute('aria-controls', 'stats-breakdown');

  toggleEl.onclick = () => {
    const isCollapsed = breakdownEl.classList.toggle('collapsed');
    breakdownEl.setAttribute('aria-hidden', String(isCollapsed));
    toggleEl.setAttribute('aria-expanded', String(!isCollapsed));
    toggleEl.textContent = isCollapsed ? 'Show per-wave breakdown' : 'Hide per-wave breakdown';
  };
}
