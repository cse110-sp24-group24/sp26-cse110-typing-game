/**
 * ui/waveIntroCard.js — Wave intro card display and dismiss logic.
 *
 * Owns: populating #wave-intro-number, #wave-intro-function-name,
 * #wave-intro-tags, #wave-intro-desc and listening for any keypress
 * * to dismiss the card.
 */

import { showScreen } from './screenManager.js';

const AUTO_DISMISS_MS = 3000;

/**
 * Shows the wave intro card and resolves when the player dismisses it.
 * *
 * @param {object} _state - RunState (unused; included for stable UI API)
 * @param {object} waveData - { wave, snippet }
 * @returns {Promise<void>}
 */

/**
 *
 * @param _state
 * @param waveData
 */
export function show(_state, waveData) {
  showScreen('wave-intro-screen');

  const numberEl = document.getElementById('wave-intro-number');
  const functionNameEl = document.getElementById('wave-intro-function-name');
  const tagsEl = document.getElementById('wave-intro-tags');
  const descEl = document.getElementById('wave-intro-desc');
  const hintEl = document.querySelector('.wave-intro-hint');

  if (numberEl) {
    numberEl.textContent = `Wave ${waveData?.wave ?? ''}`.trim();
  }
  if (functionNameEl) {
    functionNameEl.textContent = waveData?.snippet?.name ?? '';
  }
  if (descEl) {
    descEl.textContent = waveData?.snippet?.description ?? '';
  }
  if (hintEl) {
    hintEl.textContent = 'Press any key to begin...';
  }

  if (tagsEl) {
    tagsEl.textContent = '';
    const tags = Array.isArray(waveData?.snippet?.conceptTags) ? waveData.snippet.conceptTags : [];

    tags.forEach((tagText) => {
      const pillEl = document.createElement('span');
      pillEl.className = 'wave-intro-tag';
      pillEl.textContent = tagText;
      tagsEl.appendChild(pillEl);
    });
  }

  return new Promise((resolve) => {
    let dismissed = false;

    const keydownHandler = () => {
      dismiss();
    };

    const timeoutId = setTimeout(() => {
      dismiss();
    }, AUTO_DISMISS_MS);

    const dismiss = () => {
      if (dismissed) {
        return;
      }
      dismissed = true;
      window.removeEventListener('keydown', keydownHandler);
      clearTimeout(timeoutId);
      resolve();
    };

    window.addEventListener('keydown', keydownHandler);
  });
}
