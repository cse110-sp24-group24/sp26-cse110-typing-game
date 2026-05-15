/**
 * snippets/index.js — Public API for the snippet library.
 *
 * Exports getSnippet() and getSnippetsForLanguage() used by
 * waveManager and bossSystem to pull code lines for enemies.
 *
 * Implemented by Issue #1.
 */

import { snippets as jsSnippets }   from './javascript.js';
import { snippets as htmlSnippets } from './html.js';
import { snippets as cssSnippets }  from './css.js';

const LIBRARIES = {
  javascript: jsSnippets,
  html:       htmlSnippets,
  css:        cssSnippets,
};

/** Returns all snippets for a language. */
export function getSnippetsForLanguage(language) {
  return LIBRARIES[language] ?? [];
}

/** Returns a single random snippet for the given language. */
export function getSnippet(language) {
  const pool = getSnippetsForLanguage(language);
  return pool[Math.floor(Math.random() * pool.length)];
}
