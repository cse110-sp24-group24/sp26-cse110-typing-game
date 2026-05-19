/**
 * audio/audioManager.js — Audio element pool and playback control.
 *
 * Owns: preloading audio files into an <audio> pool, play/pause,
 * per-channel volume, and mute-all. API shaped for post-MVP Howler.js swap.
 *
 * Implemented by Issue #15.
 */

/** @param {object} _prefs - { musicVolume, sfxVolume, muted } */
export function init(_prefs) {
  // Issue #15
}

/**
 *
 */
export function playAmbient() {
  // Issue #15
}

/**
 *
 */
export function stopAmbient() {
  // Issue #15
}

/** @param {string} _name - 'defeat' | 'error' | 'boss-sting' */
export function playSfx(_name) {
  // Issue #15
}

/**
 * @param _vol
 */
export function setMusicVolume(_vol) {
  // Issue #15
}

/**
 * @param _vol
 */
export function setSfxVolume(_vol) {
  // Issue #15
}

/**
 * @param _muted
 */
export function setMuted(_muted) {
  // Issue #15
}
