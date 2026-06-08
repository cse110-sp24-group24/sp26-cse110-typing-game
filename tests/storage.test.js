/**
 * tests/storage.test.js — Jest tests for Sprint 3 storage preferences.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  getPreferences,
  markTutorialSeen,
  resetToDefaults,
  saveAudioSettings,
  saveLanguage,
} from '../src/utils/storage.js';

const storagePrototype = Object.getPrototypeOf(window.localStorage);

beforeEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
  resetToDefaults();
  window.localStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
  resetToDefaults();
});

describe('storage preferences', () => {
  it('returns safe defaults when values are missing', () => {
    expect(getPreferences()).toEqual({
      language: 'javascript',
      musicVolume: 0.575,
      sfxVolume: 0.7,
      muted: false,
      tutorialSeen: false,
    });
  });

  it('saves valid Sprint 3 preferences under phantomtype.v1 keys', () => {
    saveLanguage('html');
    saveAudioSettings({ musicVolume: 0.25, sfxVolume: 0.8, muted: true });
    markTutorialSeen();

    expect(window.localStorage.getItem('phantomtype.v1.language')).toBe('html');
    expect(window.localStorage.getItem('phantomtype.v1.musicVolume')).toBe('0.25');
    expect(window.localStorage.getItem('phantomtype.v1.sfxVolume')).toBe('0.8');
    expect(window.localStorage.getItem('phantomtype.v1.muted')).toBe('true');
    expect(window.localStorage.getItem('phantomtype.v1.tutorialSeen')).toBe('true');
    expect(getPreferences()).toEqual({
      language: 'html',
      musicVolume: 0.25,
      sfxVolume: 0.8,
      muted: true,
      tutorialSeen: true,
    });
  });

  it('saves css as a valid language preference', () => {
    saveLanguage('css');

    expect(window.localStorage.getItem('phantomtype.v1.language')).toBe('css');
    expect(getPreferences().language).toBe('css');
  });

  it('ignores unsupported languages and invalid stored values', () => {
    saveLanguage('python');
    window.localStorage.setItem('phantomtype.v1.musicVolume', 'loud');
    window.localStorage.setItem('phantomtype.v1.sfxVolume', '3');
    window.localStorage.setItem('phantomtype.v1.muted', 'sometimes');
    window.localStorage.setItem('phantomtype.v1.tutorialSeen', 'eventually');

    expect(window.localStorage.getItem('phantomtype.v1.language')).toBeNull();
    expect(getPreferences()).toEqual({
      language: 'javascript',
      musicVolume: 0.575,
      sfxVolume: 0.7,
      muted: false,
      tutorialSeen: false,
    });
  });

  it('normalizes invalid stored language values to the default language', () => {
    window.localStorage.setItem('phantomtype.v1.language', 'python');

    expect(getPreferences().language).toBe('javascript');
  });

  it('normalizes invalid stored audio and tutorial values to defaults', () => {
    window.localStorage.setItem('phantomtype.v1.musicVolume', 'loud');
    window.localStorage.setItem('phantomtype.v1.sfxVolume', '3');
    window.localStorage.setItem('phantomtype.v1.muted', 'sometimes');
    window.localStorage.setItem('phantomtype.v1.tutorialSeen', 'eventually');

    expect(getPreferences()).toEqual({
      language: 'javascript',
      musicVolume: 0.575,
      sfxVolume: 0.7,
      muted: false,
      tutorialSeen: false,
    });
  });

  it('removes all phantomtype.v1 keys when resetting to defaults', () => {
    window.localStorage.setItem('phantomtype.v1.language', 'html');
    window.localStorage.setItem('phantomtype.v1.extra', 'legacy');
    window.localStorage.setItem('other.key', 'kept');

    resetToDefaults();

    expect(window.localStorage.getItem('phantomtype.v1.language')).toBeNull();
    expect(window.localStorage.getItem('phantomtype.v1.extra')).toBeNull();
    expect(window.localStorage.getItem('other.key')).toBe('kept');
    expect(getPreferences().language).toBe('javascript');
  });

  it('falls back to in-memory preferences when localStorage throws', () => {
    jest.spyOn(storagePrototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    jest.spyOn(storagePrototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    saveLanguage('html');
    saveAudioSettings({ musicVolume: 0.5, sfxVolume: 0.25, muted: true });
    markTutorialSeen();

    expect(getPreferences()).toEqual({
      language: 'html',
      musicVolume: 0.5,
      sfxVolume: 0.25,
      muted: true,
      tutorialSeen: true,
    });
  });

  it('ignores unsupported languages when localStorage throws', () => {
    jest.spyOn(storagePrototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    jest.spyOn(storagePrototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });

    saveLanguage('python');

    expect(getPreferences().language).toBe('javascript');
  });
});
