/**
 * ui/upgradeScreen.js — Upgrade Selection screen rendering and pick flow.
 *
 * Owns: building the 3 upgrade cards inside #upgrade-cards, running the
 * pick animation when the player clicks one, and resolving once the
 * upgrade has been applied so main.js can route to the next wave.
 *
 * This module follows ADR-003: ui/ may import from engine/, but engine/
 * never imports ui/. main.js is the only thing that calls show().
 *
 * Implemented by Issue #13.
 */

import { showScreen } from './screenManager.js';
// NOTE on the alias: the issue (#13) specifies the engine API as
// `getUpgradeChoices(state)`, but the current Issue #12 stub still
// exports `drawUpgrades`. We alias here so the file loads cleanly
// today and keeps reading naturally below. Once #12 lands and renames
// `drawUpgrades` → `getUpgradeChoices` in the engine, drop the alias.
import { drawUpgrades as getUpgradeChoices, applyUpgrade } from '../engine/upgradeSystem.js';

// How long the "you picked this one" animation plays before we route
// the player to the next wave. The card scales up and glows for this
// long. 400ms feels weighty without slowing the run down.
const PICK_CONFIRM_MS = 400;

/**
 * Shows the upgrade selection screen and resolves once the player has
 * picked an upgrade and the pick-confirmation animation has finished.
 *
 * Typical flow inside main.js:
 *   showUpgradeScreen(runState).then(() => goToNextWave());
 *
 * @param {object} state - The shared RunState. Passed to upgradeSystem so
 *   it can both pick from upgrades the player doesn't already own AND
 *   mutate the state when applyUpgrade() runs.
 * @returns {Promise<object>} Resolves with the chosen upgrade definition.
 */
export function show(state) {
  // Step 1: make this screen the visible one. screenManager handles
  // hiding the other screens for us.
  showScreen('upgrade-screen');

  // Step 2: ask the engine for exactly 3 random, non-duplicate choices.
  // upgradeSystem owns the "what's already owned" logic so we don't
  // have to filter here — it just hands us a ready-to-render list.
  const choices = getUpgradeChoices(state);

  // Step 3: render those 3 choices as cards inside #upgrade-cards.
  // We rebuild the cards from scratch every time the screen opens so
  // stale listeners from a previous boss can never fire.
  const cardsContainer = document.getElementById('upgrade-cards');
  cardsContainer.innerHTML = '';

  // Wrap the whole thing in a Promise so main.js can `await` the pick.
  return new Promise((resolve) => {
    // Tracks whether someone has already clicked a card. We use this to
    // ignore double-clicks and to ignore clicks on the "losing" cards
    // once a pick is locked in.
    let picked = false;

    choices.forEach((upgrade, index) => {
      const card = buildCard(upgrade, index);

      // Clicking a card is the only way to leave this screen. There is
      // no "skip" button — picking IS the contract.
      card.addEventListener('click', () => {
        if (picked) {
          return; // Already picked — ignore further clicks.
        }
        picked = true;

        // Visually fade out the cards the player didn't choose so the
        // chosen one feels emphasized. Done by toggling a CSS class.
        cardsContainer.querySelectorAll('.upgrade-card').forEach((other) => {
          if (other !== card) {
            other.classList.add('upgrade-card--unpicked');
          }
        });

        // Highlight + scale the chosen card. The CSS animation runs
        // for PICK_CONFIRM_MS — see styles.css `upgradeCardPicked`.
        card.classList.add('upgrade-card--picked');

        // Step 4: apply the upgrade to RunState. After this call the
        // HUD upgrades panel (Issue #18) will see the new entry on
        // its next render. Argument order matches the issue #13 spec
        // — `(upgradeId, state)`. The current Issue #12 stub uses the
        // opposite order, but the stub is a no-op, so this call is
        // harmless until #12 lands and adopts the issue's signature.
        applyUpgrade(upgrade.id, state);

        // Step 5: wait for the confirmation animation to finish, then
        // resolve so main.js can move to the next wave intro card.
        setTimeout(() => resolve(upgrade), PICK_CONFIRM_MS);
      });

      cardsContainer.appendChild(card);
    });
  });
}

/**
 * Builds one upgrade card element.
 *
 * Each card is a <button> so keyboard users get focus + Enter/Space
 * activation for free, and screen readers announce it as clickable.
 *
 * @param {object} upgrade - { id, name, icon, description }
 * @param {number} index - 0..2, used to stagger the entrance animation.
 * @returns {HTMLButtonElement}
 */
function buildCard(upgrade, index) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'upgrade-card';
  card.dataset.upgradeId = upgrade.id;

  // Stagger the entrance: card 0 appears immediately, card 1 ~80ms
  // later, card 2 ~160ms later. Subtle but adds a sense of ceremony.
  card.style.animationDelay = `${index * 80}ms`;

  // Accessible label so screen readers announce the full upgrade
  // ("Phantom Speed. Enemies fall 20% slower for the rest of the run.")
  // instead of just the visible icon emoji.
  card.setAttribute('aria-label', `${upgrade.name}. ${upgrade.description}`);

  // Inner structure. We use textContent (never innerHTML) for the
  // upgrade fields because upgrade definitions live in src/data and
  // are static, but textContent keeps us safe if a future contributor
  // adds a snippet that contains characters HTML would interpret.
  const iconEl = document.createElement('div');
  iconEl.className = 'upgrade-card__icon';
  iconEl.setAttribute('aria-hidden', 'true'); // icon is decorative
  iconEl.textContent = upgrade.icon;

  const nameEl = document.createElement('div');
  nameEl.className = 'upgrade-card__name';
  nameEl.textContent = upgrade.name;

  const descEl = document.createElement('div');
  descEl.className = 'upgrade-card__desc';
  descEl.textContent = upgrade.description;

  // A subtle "Choose" hint at the bottom of every card to make the
  // affordance obvious — three styled boxes don't always read as
  // clickable on first sight.
  const cueEl = document.createElement('div');
  cueEl.className = 'upgrade-card__cue';
  cueEl.textContent = 'Choose';

  card.appendChild(iconEl);
  card.appendChild(nameEl);
  card.appendChild(descEl);
  card.appendChild(cueEl);

  return card;
}
