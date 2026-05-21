/**
 * snippets/index.js — Public API for the snippet library.
 *
 * Exports getSnippetsForLanguage(), getSnippet(), getRandomSnippet(), and
 * getSnippetById() used by waveManager and bossSystem to pull code lines for enemies.
 *
 * Implemented by Issue #1.
 */

import { snippets as jsSnippets } from './javascript.js';
import { snippets as htmlSnippets } from './html.js';
import { snippets as cssSnippets } from './css.js';

const LIBRARIES = {
  javascript: jsSnippets,
  html: htmlSnippets,
  css: cssSnippets,
};

/**
 * Returns all snippets for a language.
 * @param {string} language - 'javascript' | 'html' | 'css'
 * @returns {object[]} Array of snippet objects for the given language.
 */
export function getSnippetsForLanguage(language) {
  return LIBRARIES[language] ?? [];
}

/**
 * Returns a single random snippet for the given language.
 * Does not track used IDs — use getRandomSnippet() in wave loops.
 * @param {string} language - 'javascript' | 'html' | 'css'
 * @returns {object} A random snippet object.
 */
export function getSnippet(language) {
  const pool = getSnippetsForLanguage(language);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns a random snippet for the language, excluding already-used IDs.
 * If all snippets in the language have been used, the pool resets to prevent
 * a hard lock on long runs.
 * @param {string} language - 'javascript' | 'html' | 'css'
 * @param {string[]} usedIds - Snippet IDs already used in this run.
 * @returns {object} A snippet object not in usedIds (if any remain).
 */
export function getRandomSnippet(language, usedIds = []) {
  const all = getSnippetsForLanguage(language);
  const pool = all.filter((snippet) => !usedIds.includes(snippet.id));
  // Reset to the full pool when all snippets have been used, avoiding a hard lock.
  const available = pool.length > 0 ? pool : all;
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Returns a snippet by its unique ID, or null if not found.
 * Searches across all languages.
 * @param {string} id - The snippet's unique ID.
 * @returns {object | null} The matching snippet, or null.
 */
export function getSnippetById(id) {
  for (const pool of Object.values(LIBRARIES)) {
    const found = pool.find((snippet) => snippet.id === id);
    if (found !== undefined) {
      return found;
    }
  }
  return null;
}
