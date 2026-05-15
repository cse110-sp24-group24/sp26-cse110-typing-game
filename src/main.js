/**
 * main.js — Entry point and module wiring.
 *
 * This file is the only place that imports from multiple layers and
 * wires them together. It owns screen transitions and top-level
 * event listeners (play button, language buttons, Escape key).
 *
 * Implemented across Issues #4, #7, #8, #11, #13, #19, #20, #21.
 */

// Imports are added as each Issue is completed. Example structure:
//
// import { createRunState }  from './state.js';
// import { showScreen }      from './ui/screenManager.js';
// import { init as initTyping } from './engine/typingEngine.js';
// import { init as initEnemy }  from './engine/enemySystem.js';
// import { init as initWave }   from './engine/waveManager.js';
// import { init as initBoss }   from './engine/bossSystem.js';
// import { init as initUpgrade } from './engine/upgradeSystem.js';
// import { init as initHud }    from './ui/hudManager.js';
// import { init as initCode }   from './ui/codePanel.js';
// import { show as showIntro }  from './ui/waveIntroCard.js';
// import { show as showStats }  from './ui/statsScreen.js';
// import { init as initAudio }  from './audio/audioManager.js';
// import { getPreferences }     from './utils/storage.js';
// import { init as initTracker } from './utils/statTracker.js';

console.log('Phantom Type — main.js loaded');
