/**
 * ui/upgradeScreen.js — Upgrade Selection screen rendering and pick flow.
 *
 * Owns: building the 3 upgrade cards inside #upgrade-cards, running the
 * pick animation when the player clicks one, showing the ACTIVATED bolt
 * overlay with the upgrade name, and resolving once the animation finishes
 * so main.js can route to the next wave.
 *
 * This module follows ADR-003: ui/ may import from engine/, but engine/
 * never imports ui/. main.js is the only thing that calls show().
 *
 * Implemented by Issue #13 / #27.
 */

import { showScreen } from './screenManager.js';
import { drawUpgrades as getUpgradeChoices, applyUpgrade } from '../engine/upgradeSystem.js';
import { UPGRADES } from '../data/upgrades.js';

// How long the picked card glows before the ACTIVATED overlay appears.
const PICK_CONFIRM_MS = 400;

// How long the mystery-box spin plays before revealing the chosen upgrade.
const MYSTERY_SPIN_MS = 1200;

// How long the ACTIVATED bolt overlay is visible before fading out.
const ACTIVATED_VISIBLE_MS = 1000;

// Total overlay duration including the fade-out (defined in CSS).
const ACTIVATED_TOTAL_MS = 1600;

/**
 * Shows the upgrade selection screen and resolves once the player has
 * picked an upgrade and the ACTIVATED animation has finished.
 *
 * Typical flow inside main.js:
 *   showUpgradeScreen(runState).then(() => goToNextWave());
 *
 * @param {object} state - The shared RunState.
 * @returns {Promise<object>} Resolves with the chosen upgrade definition.
 */
export function show(state) {
  showScreen('upgrade-screen');

  const choices = getUpgradeChoices(state);
  const cardsContainer = document.getElementById('upgrade-cards');
  cardsContainer.innerHTML = '';

  return new Promise((resolve) => {
    let picked = false;

    choices.forEach((upgrade, index) => {
      const { card, iconEl, nameEl, descEl } = buildCard(upgrade, index);

      card.addEventListener('click', () => {
        if (picked) {
          return;
        }
        picked = true;

        // Fade out unchosen cards.
        cardsContainer.querySelectorAll('.upgrade-card').forEach((other) => {
          if (other !== card) {
            other.classList.add('upgrade-card--unpicked');
          }
        });

        if (upgrade.id === 'mystery-box') {
          // ── Mystery Box flow ─────────────────────────────────────
          // Apply first so state.mysteryBoxReveal is populated.
          applyUpgrade(upgrade.id, state);
          card.classList.add('upgrade-card--mystery-spinning');

          // Cycle through upgrade icons rapidly to build suspense.
          const spinIcons = UPGRADES.filter((u) => u.id !== 'mystery-box').map((u) => u.icon);
          let spinFrame = 0;
          const spinInterval = window.setInterval(() => {
            iconEl.textContent = spinIcons[spinFrame % spinIcons.length];
            spinFrame += 1;
          }, 100);

          window.setTimeout(() => {
            window.clearInterval(spinInterval);

            // Update the card to show what was actually granted.
            const revealed = UPGRADES.find((u) => u.id === state.mysteryBoxReveal);
            if (revealed) {
              iconEl.textContent = revealed.icon;
              nameEl.textContent = revealed.name;
              descEl.textContent = revealed.description;
            }

            card.classList.remove('upgrade-card--mystery-spinning');
            card.classList.add('upgrade-card--picked');

            // Show ACTIVATED overlay using the revealed upgrade's details.
            const activatedName = revealed ? revealed.name : 'Mystery Power';
            const activatedIcon = revealed ? revealed.icon : '📦';
            window.setTimeout(() => {
              showActivatedOverlay(activatedIcon, activatedName).then(() => resolve(upgrade));
            }, PICK_CONFIRM_MS);
          }, MYSTERY_SPIN_MS);
        } else {
          // ── Standard pick flow ────────────────────────────────────
          applyUpgrade(upgrade.id, state);
          card.classList.add('upgrade-card--picked');

          window.setTimeout(() => {
            showActivatedOverlay(upgrade.icon, upgrade.name).then(() => resolve(upgrade));
          }, PICK_CONFIRM_MS);
        }
      });

      cardsContainer.appendChild(card);
    });
  });
}

/**
 * Shows a full-screen bolt overlay: "⚡ [icon] [NAME] ACTIVATED!"
 * Returns a Promise that resolves after the overlay has faded out.
 *
 * @param {string} icon - Upgrade emoji icon.
 * @param {string} name - Upgrade display name.
 * @returns {Promise<void>}
 */
function showActivatedOverlay(icon, name) {
  const overlay = document.createElement('div');
  overlay.className = 'upgrade-activated-overlay';
  overlay.setAttribute('aria-live', 'assertive');

  const boltTop = document.createElement('div');
  boltTop.className = 'upgrade-activated__bolt';
  boltTop.textContent = '⚡';

  const iconEl = document.createElement('div');
  iconEl.className = 'upgrade-activated__icon';
  iconEl.textContent = icon;

  const nameEl = document.createElement('div');
  nameEl.className = 'upgrade-activated__name';
  nameEl.textContent = name;

  const labelEl = document.createElement('div');
  labelEl.className = 'upgrade-activated__label';
  labelEl.textContent = 'ACTIVATED!';

  const boltBottom = document.createElement('div');
  boltBottom.className = 'upgrade-activated__bolt';
  boltBottom.textContent = '⚡';

  overlay.appendChild(boltTop);
  overlay.appendChild(iconEl);
  overlay.appendChild(nameEl);
  overlay.appendChild(labelEl);
  overlay.appendChild(boltBottom);
  document.body.appendChild(overlay);

  return new Promise((resolve) => {
    // After the visible window, trigger the fade-out class then resolve.
    window.setTimeout(() => {
      overlay.classList.add('upgrade-activated-overlay--fading');
      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, ACTIVATED_TOTAL_MS - ACTIVATED_VISIBLE_MS);
    }, ACTIVATED_VISIBLE_MS);
  });
}

/**
 * Builds one upgrade card `<button>` element.
 * Returns the card and its inner content elements so mystery-box can
 * mutate them mid-animation during the spin reveal.
 *
 * @param {object} upgrade - { id, name, icon, description }
 * @param {number} index   - 0..2, used to stagger the entrance animation.
 * @returns {{ card: HTMLButtonElement, iconEl: HTMLElement, nameEl: HTMLElement, descEl: HTMLElement }}
 */
function buildCard(upgrade, index) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'upgrade-card';
  card.dataset.upgradeId = upgrade.id;
  card.style.animationDelay = `${index * 80}ms`;
  card.setAttribute('aria-label', `${upgrade.name}. ${upgrade.description}`);

  const iconEl = document.createElement('div');
  iconEl.className = 'upgrade-card__icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.textContent = upgrade.icon;

  const nameEl = document.createElement('div');
  nameEl.className = 'upgrade-card__name';
  nameEl.textContent = upgrade.name;

  const descEl = document.createElement('div');
  descEl.className = 'upgrade-card__desc';
  descEl.textContent = upgrade.description;

  const cueEl = document.createElement('div');
  cueEl.className = 'upgrade-card__cue';
  cueEl.textContent = upgrade.id === 'mystery-box' ? 'Spin' : 'Choose';

  card.appendChild(iconEl);
  card.appendChild(nameEl);
  card.appendChild(descEl);
  card.appendChild(cueEl);

  return { card, iconEl, nameEl, descEl };
}
