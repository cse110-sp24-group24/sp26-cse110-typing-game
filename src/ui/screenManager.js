/**
 * ui/screenManager.js — Screen visibility management.
 *
 * Owns: adding/removing .active on .screen divs. The single
 * function showScreen() is the only way screens change.
 *
 * Implemented by Issue #3.
 */

const SCREENS = [
  'menu-screen',
  'language-screen',
  'wave-intro-screen',
  'game-screen',
  'wave-stats-screen',
  'upgrade-screen',
  'stats-screen',
];

/** Hides all screens and activates the one matching screenId. */
export function showScreen(screenId) {
  SCREENS.forEach(id => {
    document.getElementById(id)?.classList.toggle('active', id === screenId);
  });
}
