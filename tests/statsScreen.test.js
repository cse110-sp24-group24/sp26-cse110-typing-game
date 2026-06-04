import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const showScreenMock = jest.fn();

jest.unstable_mockModule('../src/ui/screenManager.js', () => ({
  showScreen: showScreenMock,
}));

const { show } = await import('../src/ui/statsScreen.js');

function buildStatsDom() {
  document.body.innerHTML = `
    <div id="stats-screen" class="screen">
      <div class="stats-content">
        <h2 class="stats-title">Run Over</h2>
        <div id="stats-status" class="stats-status"></div>
        <div id="stats-accuracy" class="stat-block stats-accuracy-hero"></div>
        <div id="stats-wpm" class="stat-block"></div>
        <div id="stats-waves" class="stat-block"></div>
        <div id="stats-score" class="stat-block"></div>
        <div id="stats-score-formula" class="stats-formula"></div>
        <button id="stats-breakdown-toggle" type="button" class="btn btn-secondary stats-breakdown-toggle hidden"></button>
        <div id="stats-breakdown" class="stats-breakdown collapsed" aria-hidden="true"></div>
        <button id="play-again-btn" class="btn btn-primary">Play Again</button>
      </div>
    </div>
  `;
}

const sampleSummary = {
  totalAccuracy: 92.5,
  averageWpm: 48.3,
  wavesCleared: 3,
  finalScore: 4250,
  runEndReason: 'death',
  waveData: [
    { wpm: 40, accuracy: 88, errorCount: 2, snippetId: 'a', timestamp: 1 },
    { wpm: 52, accuracy: 95, errorCount: 0, snippetId: 'b', timestamp: 2 },
    { wpm: 53, accuracy: 94.5, errorCount: 1, snippetId: 'c', timestamp: 3 },
  ],
};

describe('ui/statsScreen.show', () => {
  beforeEach(() => {
    showScreenMock.mockClear();
    buildStatsDom();
  });

  it('renders headline stats, formula caption, and death status', () => {
    show(sampleSummary);

    expect(document.getElementById('stats-status').textContent).toBe(
      "You've Been Possessed by Poor Code"
    );
    expect(document.querySelector('.stats-status-danger').textContent).toBe('Possessed');
    const accuracyEl = document.getElementById('stats-accuracy');
    expect(accuracyEl.querySelector('.stats-accuracy-label').textContent).toBe('Total Accuracy');
    expect(accuracyEl.querySelector('.stats-accuracy-value').textContent).toBe('92.5%');
    expect(document.getElementById('stats-wpm').textContent).toBe('Avg WPM: 48');
    expect(document.getElementById('stats-waves').textContent).toBe('Waves Survived: 3');
    expect(document.getElementById('stats-score').textContent).toBe('Score: 4,250');
    expect(document.getElementById('stats-score-formula').textContent).toBe(
      '(WPM × accuracy × wave multiplier)'
    );
  });

  it('renders completion status when the run was completed', () => {
    show({ ...sampleSummary, runEndReason: 'completed' });

    expect(document.getElementById('stats-status').textContent).toBe('Run Complete');
  });

  it('renders quit status when the run was abandoned', () => {
    show({ ...sampleSummary, runEndReason: 'quit' });

    expect(document.getElementById('stats-status').textContent).toBe('Run Abandoned');
  });

  it('builds per-wave breakdown rows and toggles visibility', () => {
    show(sampleSummary);

    const toggle = document.getElementById('stats-breakdown-toggle');
    const breakdown = document.getElementById('stats-breakdown');

    expect(toggle.classList.contains('hidden')).toBe(false);
    expect(breakdown.classList.contains('collapsed')).toBe(true);

    const rows = breakdown.querySelectorAll(
      '.stats-breakdown-row:not(.stats-breakdown-row--header)'
    );
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Wave 1');
    expect(rows[0].textContent).toContain('40');
    expect(rows[0].textContent).toContain('88%');

    toggle.click();
    expect(breakdown.classList.contains('collapsed')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    expect(breakdown.classList.contains('collapsed')).toBe(true);
  });

  it('hides breakdown toggle when waveData is empty', () => {
    show({ ...sampleSummary, waveData: [] });

    expect(document.getElementById('stats-breakdown-toggle').classList.contains('hidden')).toBe(
      true
    );
    expect(document.getElementById('stats-breakdown').children.length).toBe(0);
  });

  it('routes Play Again to language selection screen', () => {
    show(sampleSummary);

    document.getElementById('play-again-btn').click();

    expect(showScreenMock).toHaveBeenCalledTimes(1);
    expect(showScreenMock).toHaveBeenCalledWith('language-screen');
  });
});
