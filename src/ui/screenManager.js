const VALID_SCREEN_IDS = new Set([
  'menu-screen',
  'language-screen',
  'wave-intro-screen',
  'game-screen',
  'wave-stats-screen',
  'upgrade-screen',
  'stats-screen',
]);

let currentScreenId =
  document.querySelector('.screen.active')?.id || 'menu-screen';

/**
 * Show one screen and hide every other screen.
 * The CSS transition system handles the visual fade via the .active class.
 */
export function showScreen(screenId) {
  if (!VALID_SCREEN_IDS.has(screenId)) {
    console.error(`Invalid screen id: ${screenId}`);
    return;
  }

  const targetScreen = document.getElementById(screenId);

  if (!targetScreen) {
    console.error(`Screen element not found: ${screenId}`);
    return;
  }

  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  targetScreen.classList.add('active');
  currentScreenId = screenId;
}

/**
 * Return the id of the screen currently marked as active.
 */
export function getCurrentScreen() {
  return currentScreenId;
}
