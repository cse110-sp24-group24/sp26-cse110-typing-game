/**
 * @jest-environment node
 */

/**
 * tests/e2e/gameFlow.e2e.test.js — Browser E2E smoke test for core wave flow.
 *
 * Runs the real app in Chromium, starts a run, types several active targets,
 * and verifies that enemies/code-panel progress without app console errors.
 *
 * Start Live Server before running this test.
 */

import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';

import puppeteer from 'puppeteer';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5501/index.html'; // Change this to your Live Server link
const UI_TIMEOUT_MS = 15000;
const TARGET_TYPING_LIMIT = 8;

jest.setTimeout(90000);

let browser = null;

/**
 * Verifies that the configured app URL is reachable and looks like Phantom Type.
 * @param {import('puppeteer').Browser} activeBrowser - Puppeteer browser.
 * @returns {Promise<void>}
 */
async function verifySiteIsRunning(activeBrowser) {
  const page = await activeBrowser.newPage();

  try {
    const response = await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: UI_TIMEOUT_MS,
    });

    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response?.status() ?? 'unknown'}`);
    }

    const hasPlayButton = await page.$('#play-btn');

    if (!hasPlayButton) {
      throw new Error(
        'The page loaded, but #play-btn was not found. This usually means E2E_BASE_URL is pointing to the wrong Live Server page or folder.'
      );
    }
  } catch (error) {
    throw new Error(
      [
        `Could not start E2E test from BASE_URL: ${BASE_URL}`,
        '',
        'Check that:',
        '- VS Code Live Server is running',
        '- the URL matches the Live Server tab exactly',
        '- the URL points to this project’s index.html, not a parent folder or another project',
        '',
        'Example:',
        'E2E_BASE_URL=http://127.0.0.1:5501/index.html npm run test:e2e',
        '',
        `Original error: ${error.message}`,
      ].join('\n')
    );
  } finally {
    await page.close();
  }
}

/**
 * Skips the media-heavy language transition so the test reaches gameplay quickly.
 * @param {import('puppeteer').Page} page - Puppeteer page.
 * @returns {Promise<void>}
 */
async function skipLanguageTransition(page) {
  await page.evaluate(() => {
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownVideo = document.getElementById('countdown-video');

    countdownOverlay?.dispatchEvent(new Event('transitionend'));
    countdownVideo?.dispatchEvent(new Event('ended'));
  });
}

/**
 * Dismisses the wave intro using common keyboard/button paths.
 * @param {import('puppeteer').Page} page - Puppeteer page.
 * @returns {Promise<void>}
 */
async function dismissWaveIntro(page) {
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');

  await page.evaluate(() => {
    const possibleButtons = [
      '#wave-intro-card button',
      '#wave-intro-screen button',
      '.wave-intro-card button',
      '[data-action="start-wave"]',
      '[data-testid="start-wave"]',
    ];

    for (const selector of possibleButtons) {
      const button = document.querySelector(selector);
      if (button instanceof HTMLButtonElement) {
        button.click();
        return;
      }
    }
  });
}

/**
 * Returns the current target line from the game UI.
 * @param {import('puppeteer').Page} page - Puppeteer page.
 * @returns {Promise<string>} Current target text.
 */
async function getCurrentTarget(page) {
  return page.$eval('#target-line-display', (element) => element.textContent.trim());
}

/**
 * Types the currently displayed target line.
 * @param {import('puppeteer').Page} page - Puppeteer page.
 * @returns {Promise<string>} Typed target.
 */
async function typeCurrentTarget(page) {
  const target = await getCurrentTarget(page);

  if (!target) {
    return '';
  }

  await page.evaluate(() => {
    const input = document.querySelector('#typing-input');

    if (!(input instanceof HTMLInputElement)) {
      throw new Error('#typing-input was not found or is not an input');
    }

    input.disabled = false;
    input.focus();
  });

  await page.keyboard.type(target, { delay: 1 });

  return target;
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  await verifySiteIsRunning(browser);
});

afterAll(async () => {
  if (browser) {
    await browser.close();
  }
});

describe('core gameplay flow', () => {
  it('starts a run, types active targets, and reveals code-panel lines without console errors', async () => {
    const page = await browser.newPage();
    const consoleErrors = [];

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#play-btn', { timeout: UI_TIMEOUT_MS });
    await page.click('#play-btn');

    await page.waitForSelector('.btn-language[data-language="javascript"]', {
      timeout: UI_TIMEOUT_MS,
    });
    await page.click('.btn-language[data-language="javascript"]');

    await skipLanguageTransition(page);
    await dismissWaveIntro(page);

    await page.waitForSelector('#game-screen.active', { timeout: UI_TIMEOUT_MS });
    await page.waitForFunction(
      () => {
        const input = document.querySelector('#typing-input');
        return input instanceof HTMLInputElement && !input.disabled;
      },
      { timeout: UI_TIMEOUT_MS }
    );
    await page.waitForFunction(
      () => document.querySelector('#target-line-display')?.textContent.trim().length > 0,
      { timeout: UI_TIMEOUT_MS }
    );

    const typedTargets = [];

    for (let attempt = 0; attempt < TARGET_TYPING_LIMIT; attempt += 1) {
      const previousTarget = await getCurrentTarget(page);

      if (!previousTarget) {
        break;
      }

      typedTargets.push(await typeCurrentTarget(page));

      await page.waitForFunction(
        (oldTarget) => {
          const targetText = document.querySelector('#target-line-display')?.textContent.trim();
          const waveStatsActive = document.querySelector('#wave-stats-screen.active');
          const upgradeActive = document.querySelector('#upgrade-screen.active');
          const statsActive = document.querySelector('#stats-screen.active');

          return (
            targetText !== oldTarget ||
            Boolean(waveStatsActive) ||
            Boolean(upgradeActive) ||
            Boolean(statsActive)
          );
        },
        { timeout: UI_TIMEOUT_MS },
        previousTarget
      );

      const nonGameScreenActive = await page.evaluate(() =>
        Boolean(
          document.querySelector('#wave-stats-screen.active') ||
          document.querySelector('#upgrade-screen.active') ||
          document.querySelector('#stats-screen.active')
        )
      );

      if (nonGameScreenActive) {
        break;
      }
    }

    const revealedLineCount = await page.$$eval(
      '#code-panel .cp-line--revealed',
      (elements) => elements.length
    );

    expect(typedTargets.filter(Boolean).length).toBeGreaterThan(0);
    expect(revealedLineCount).toBeGreaterThan(0);

    const appErrors = consoleErrors.filter(
      (message) =>
        !message.includes('favicon.ico') &&
        !message.includes('Failed to load resource') &&
        !message.includes('ResizeObserver loop')
    );

    expect(appErrors).toEqual([]);

    await page.close();
  });
});
