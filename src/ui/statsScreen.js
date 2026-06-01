/**
 * ui/statsScreen.js — End-of-run stats screen rendering.
 *
 * Owns: populating #stats-accuracy, #stats-wpm, #stats-waves,
 * #stats-score from the final RunState and wiring #play-again-btn.
 *
 * Implemented by Issue #20.
 */

import { getSummary } from '../utils/statTracker.js';

/** @param {object} state - RunState */
export function show(state) {
  const accuracyEl = document.getElementById('stats-accuracy');
  const wpmEl = document.getElementById('stats-wpm');
  const wavesEl = document.getElementById('stats-waves');
  const scoreEl = document.getElementById('stats-score');
  const playAgainBtn = document.getElementById('play-again-btn');
  const summary = getSummary(state);

  if (accuracyEl) {
    accuracyEl.textContent = `Accuracy: ${summary.totalAccuracy}%`;
  }
  if (wpmEl) {
    wpmEl.textContent = `WPM: ${Math.round(summary.averageWpm)}`;
  }
  if (wavesEl) {
    wavesEl.textContent = `Waves Completed: ${summary.wavesCleared}`;
  }
  if (scoreEl) {
    scoreEl.textContent = `Score: ${summary.finalScore}`;
  }
  if (playAgainBtn) {
    playAgainBtn.onclick = () => window.location.reload();
  }
}
