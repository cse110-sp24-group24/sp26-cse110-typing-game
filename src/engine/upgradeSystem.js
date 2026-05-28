/**
 * engine/upgradeSystem.js — Upgrade pool, random selection, effect application.
 *
 * Owns: drawing 3 random upgrades after a boss, applying the chosen
 * upgrade's effect to RunState, and tracking active upgrades.
 *
 * Implemented by Issue #12 / #27.
 */

import { UPGRADES } from '../data/upgrades.js';

/**
 * No-op initialiser — kept for API symmetry with other engine modules.
 * @param {object} _state - RunState
 */
export function init(_state) {}

/**
 * Returns up to 3 randomly chosen upgrade definitions that the player
 * does not already own this run. Never returns duplicates.
 *
 * @param {object} state - RunState; state.upgrades[] holds owned ids.
 * @returns {Array<object>} 0–3 upgrade definition objects.
 */
export function getUpgradeChoices(state) {
  // Filter to upgrades the player hasn't collected yet.
  const available = UPGRADES.filter((u) => !state.upgrades.includes(u.id));

  // Fisher-Yates shuffle so every combination is equally likely.
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  return available.slice(0, 3);
}

// Alias used by upgradeScreen.js until it drops the legacy import name.
export { getUpgradeChoices as drawUpgrades };

/**
 * Finds the upgrade by id, calls its effect function to mutate RunState,
 * and records the id in state.upgrades so it is never offered again.
 *
 * @param {string} upgradeId - The id of the upgrade to apply.
 * @param {object} state     - RunState to mutate.
 * @returns {void}
 */
export function applyUpgrade(upgradeId, state) {
  const upgrade = UPGRADES.find((u) => u.id === upgradeId);
  if (!upgrade) {
    return;
  }

  upgrade.effect(state);

  // Guard against mystery-box internally pushing the revealed id already.
  if (!state.upgrades.includes(upgradeId)) {
    state.upgrades.push(upgradeId);
  }
}
