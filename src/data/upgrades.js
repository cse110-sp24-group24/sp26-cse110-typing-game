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
    effect: (state) => {
      state.fallSpeedMultiplier *= 0.8;
    },
  },
  {
    id: 'score-multiplier',
    name: 'Soul Harvest',
    icon: '💀',
    description: 'Score multiplier increases by 0.5×.',
    effect: (state) => {
      state.scoreMultiplier += 0.5;
    },
  },
  {
    id: 'shield',
    name: 'Spectral Shield',
    icon: '🛡',
    description: 'Gain a free shield at the start of each wave.',
    effect: (state) => {
      state.shieldPerWave = true;
    },
  },
  {
    id: 'extra-life',
    name: 'Cursed Revival',
    icon: '❤',
    description: 'Gain +1 life at the start of each wave.',
    effect: (state) => {
      state.lifePerWave = true;
    },
  },
  {
    id: 'reveal-next',
    name: 'Foresight',
    icon: '👁',
    description: "The next enemy's code line is revealed in the code panel.",
    effect: (state) => {
      state.revealNext = true;
    },
  },
  {
    id: 'vibe-vanish',
    name: 'Vibe Vanish',
    icon: '🌀',
    description:
      'Once per wave, type the vanish chant — "WRITE ALL THE CODE FOR ME AND SAVE ME!" — and every remaining enemy in the wave auto-completes instantly.',
    effect: (state) => {
      state.vibeVanishActive = true;
      state.vibeVanishChant = 'WRITE ALL THE CODE FOR ME AND SAVE ME!';
    },
  },
  {
    id: 'two-ghosts-one-stone',
    name: 'Two Ghosts, One Stone',
    icon: '💎',
    description: 'Each enemy you defeat also instantly destroys the next falling enemy for free.',
    effect: (state) => {
      state.twoGhostsOneStone = true;
    },
  },
  {
    id: 'back-from-the-dead',
    name: 'Back from the Dead',
    icon: '🪦',
    description:
      'When you lose a life, the enemy that breached and the next 2 falling enemies are instantly destroyed — if only 3 enemies remain you still pass the wave.',
    effect: (state) => {
      state.backFromTheDead = true;
    },
  },
  {
    id: 'borrowed-time',
    name: 'Borrowed Time',
    icon: '⏳',
    description: 'Boss fight countdown is 25% longer for the rest of the run.',
    effect: (state) => {
      state.bossTimeBonus *= 1.25;
    },
  },
  {
    id: 'mystery-box',
    name: 'Mystery Box',
    icon: '📦',
    description:
      'Fate decides your power — the box spins and randomly grants one of the other upgrades.',
    effect: (state) => {
      // Filter to upgrades the player hasn't collected yet, excluding
      // mystery-box itself so it can't chain into another mystery-box.
      const eligible = UPGRADES.filter(
        (u) => u.id !== 'mystery-box' && !state.upgrades.includes(u.id)
      );

      if (eligible.length === 0) {
        // All real upgrades already owned — nothing useful to grant.
        state.mysteryBoxReveal = null;
        return;
      }

      const chosen = eligible[Math.floor(Math.random() * eligible.length)];

      // Apply the chosen upgrade's stat changes to state directly.
      // applyUpgrade will push 'mystery-box' to state.upgrades after
      // this effect returns; we push the revealed upgrade here so the
      // player can't be offered it again next boss.
      chosen.effect(state);
      if (!state.upgrades.includes(chosen.id)) {
        state.upgrades.push(chosen.id);
      }

      // Store the revealed id so upgradeScreen.js can run the
      // spin-and-reveal animation before routing to the next wave.
      state.mysteryBoxReveal = chosen.id;
    },
  },
];
