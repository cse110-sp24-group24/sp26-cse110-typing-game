/**
 * data/upgrades.js — Upgrade definitions.
 *
 * Each upgrade has: id, name, icon, description, and an effect
 * function that mutates RunState when the upgrade is applied.
 *
 * Implemented by Issue #12.
 */

export const UPGRADES = [
  {
    id: 'speed-boost',
    name: 'Phantom Speed',
    icon: '💨',
    description: 'Enemies fall 20% slower for the rest of the run.',
    effect: (state) => { state.fallSpeedMultiplier *= 0.8; },
  },
  {
    id: 'score-multiplier',
    name: 'Soul Harvest',
    icon: '💀',
    description: 'Score multiplier increases by 0.5×.',
    effect: (state) => { state.scoreMultiplier += 0.5; },
  },
  {
    id: 'shield',
    name: 'Spectral Shield',
    icon: '🛡',
    description: 'Gain a free shield at the start of each wave.',
    effect: (state) => { state.shieldPerWave = true; },
  },
  {
    id: 'extra-life',
    name: 'Cursed Revival',
    icon: '❤',
    description: 'Gain +1 life at the start of each wave.',
    effect: (state) => { state.lifePerWave = true; },
  },
  {
    id: 'reveal-next',
    name: 'Foresight',
    icon: '👁',
    description: "The next enemy's code line is revealed in the code panel.",
    effect: (state) => { state.revealNext = true; },
  },
];
