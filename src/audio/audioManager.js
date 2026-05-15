/**
 * audio/audioManager.js — Audio element pool and playback control.
 *
 * Owns: preloading audio files into an <audio> pool, play/pause,
 * per-channel volume, and mute-all. API shaped for post-MVP Howler.js swap.
 *
 * Implemented by Issue #15.
 */

/** @param {object} prefs - { musicVolume, sfxVolume, muted } */
export function init(prefs) {
  // Issue #15
}

export function playAmbient() {
  // Issue #15
}

export function stopAmbient() {
  // Issue #15
}

/** @param {string} name - 'defeat' | 'error' | 'boss-sting' */
export function playSfx(name) {
  // Issue #15
}

export function setMusicVolume(vol) {
  // Issue #15
}

export function setSfxVolume(vol) {
  // Issue #15
}

export function setMuted(muted) {
  // Issue #15
}
