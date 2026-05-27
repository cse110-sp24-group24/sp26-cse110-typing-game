/**
 * tests/bossView.test.js — Jest tests for bossView.js (Issue #26).
 *
 * Uses JSDOM to verify boss sprite rendering, entrance classes,
 * progress updates, defeat animation cleanup, and clear behavior.
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const bossView = await import('../src/ui/bossView.js');

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Sets up the minimal DOM required by bossView.
 * @returns {void}
 */
function setupDom() {
  document.body.innerHTML = '<div id="play-area"></div>';
}

// ── bossView ──────────────────────────────────────────────────────────────

describe('bossView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupDom();
    bossView.clearBoss();
  });

  afterEach(() => {
    bossView.clearBoss();
    jest.useRealTimers();
  });

  it('creates the boss container inside the play area', () => {
    bossView.showBoss();

    const playAreaElement = document.querySelector('#play-area');
    const bossElement = document.querySelector('#boss-container');

    expect(bossElement).not.toBeNull();
    expect(playAreaElement.contains(bossElement)).toBe(true);
  });

  it('creates the boss sprite parts', () => {
    bossView.showBoss();

    expect(document.querySelector('.boss-sprite')).not.toBeNull();
    expect(document.querySelector('.boss-sprite-face')).not.toBeNull();
    expect(document.querySelectorAll('.boss-sprite-eye')).toHaveLength(2);
    expect(document.querySelector('.boss-sprite-horn-left')).not.toBeNull();
    expect(document.querySelector('.boss-sprite-horn-right')).not.toBeNull();
  });

  it('creates the progress label and progress bar', () => {
    bossView.showBoss();

    expect(document.querySelector('.boss-progress')).not.toBeNull();
    expect(document.querySelector('.boss-progress-label')?.textContent).toBe('Line 1 of 1');
    expect(document.querySelector('.boss-progress-track')).not.toBeNull();
    expect(document.querySelector('.boss-progress-bar')).not.toBeNull();
  });

  it('adds entrance and screen shake classes when entrance plays', () => {
    bossView.showBoss();
    bossView.playEntrance();

    expect(document.querySelector('#boss-container')?.classList).toContain('boss-container-active');
    expect(document.querySelector('#play-area')?.classList).toContain('boss-screen-shake');

    jest.advanceTimersByTime(450);

    expect(document.querySelector('#play-area')?.classList).not.toContain('boss-screen-shake');
  });

  it('updates progress label and bar width', () => {
    bossView.showBoss();

    bossView.updateProgress({
      currentLine: 2,
      completedLines: 1,
      totalLines: 4,
    });

    expect(document.querySelector('.boss-progress-label')?.textContent).toBe('Line 2 of 4');
    expect(document.querySelector('.boss-progress-bar')?.style.width).toBe('25%');
  });

  it('clamps progress values to the total line count', () => {
    bossView.showBoss();

    bossView.updateProgress({
      currentLine: 99,
      completedLines: 99,
      totalLines: 4,
    });

    expect(document.querySelector('.boss-progress-label')?.textContent).toBe('Line 4 of 4');
    expect(document.querySelector('.boss-progress-bar')?.style.width).toBe('100%');
  });

  it('shows zero progress when total line count is zero', () => {
    bossView.showBoss();

    bossView.updateProgress({
      currentLine: 0,
      completedLines: 0,
      totalLines: 0,
    });

    expect(document.querySelector('.boss-progress-label')?.textContent).toBe('Line 0 of 0');
    expect(document.querySelector('.boss-progress-bar')?.style.width).toBe('0%');
  });

  it('removes the boss UI when cleared', () => {
    bossView.showBoss();
    bossView.clearBoss();

    expect(document.querySelector('#boss-container')).toBeNull();
  });

  it('does not crash when clearBoss is called before showBoss', () => {
    expect(() => {
      bossView.clearBoss();
    }).not.toThrow();
  });

  it('adds defeat class and removes boss after defeat duration', () => {
    bossView.showBoss();

    bossView.playDefeat();

    expect(document.querySelector('#boss-container')?.classList).toContain(
      'boss-container-defeated'
    );

    jest.advanceTimersByTime(500);

    expect(document.querySelector('#boss-container')).toBeNull();
  });

  it('does not crash when showBoss is called without a play area', () => {
    document.body.innerHTML = '';

    expect(() => {
      bossView.showBoss();
    }).not.toThrow();
  });
});
