import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const showScreenMock = jest.fn();

jest.unstable_mockModule('../src/ui/screenManager.js', () => ({
  showScreen: showScreenMock,
}));

const { show } = await import('../src/ui/waveIntroCard.js');

function buildWaveIntroDom() {
  document.body.innerHTML = `
    <div id="wave-intro-screen" class="screen">
      <div id="wave-intro-number"></div>
      <code id="wave-intro-function-name"></code>
      <div id="wave-intro-tags"></div>
      <p id="wave-intro-desc"></p>
      <div class="wave-intro-hint"></div>
    </div>
  `;
}

describe('ui/waveIntroCard.show', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    showScreenMock.mockClear();
    buildWaveIntroDom();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows wave intro screen and populates all content from waveData', () => {
    show({}, {
      wave: 3,
      snippet: {
        name: 'renderHeader',
        description: 'Render the app header.',
        conceptTags: ['DOM', 'Functions', 'Template literals'],
      },
    });

    expect(showScreenMock).toHaveBeenCalledWith('wave-intro-screen');
    expect(document.getElementById('wave-intro-number').textContent).toBe('Wave 3');
    expect(document.getElementById('wave-intro-function-name').textContent).toBe('renderHeader');
    expect(document.getElementById('wave-intro-desc').textContent).toBe('Render the app header.');
    expect(document.querySelector('.wave-intro-hint').textContent).toBe('Press any key to begin...');

    const tags = [...document.querySelectorAll('#wave-intro-tags .wave-intro-tag')].map(
      (el) => el.textContent
    );
    expect(tags).toEqual(['DOM', 'Functions', 'Template literals']);
  });

  it('dismisses immediately on keydown and resolves only once', async () => {
    const promise = show({}, { wave: 1, snippet: { name: 'x', description: 'y', conceptTags: [] } });
    const thenSpy = jest.fn();
    promise.then(thenSpy);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    await promise;
    expect(thenSpy).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(3000);
    expect(thenSpy).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after 3 seconds when no key is pressed', async () => {
    const promise = show({}, { wave: 2, snippet: { name: 'y', description: 'z', conceptTags: [] } });
    const thenSpy = jest.fn();
    promise.then(thenSpy);

    jest.advanceTimersByTime(2999);
    await Promise.resolve();
    expect(thenSpy).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1);
    await promise;
    expect(thenSpy).toHaveBeenCalledTimes(1);
  });

  it('does not throw when optional DOM elements are missing', async () => {
    document.body.innerHTML = '<div id="wave-intro-screen" class="screen"></div>';

    const promise = show({}, { wave: 1, snippet: { name: 'n', description: 'd', conceptTags: ['Tag'] } });
    jest.advanceTimersByTime(3000);
    await expect(promise).resolves.toBeUndefined();
  });
});