/**
 * tests/snippets-test-css-html.js - Custom tests for CSS and HTML snippet libraries.
 *
 * No test framework required. Run with:
 *   node tests/snippets-test-css-html.js
 */

import { snippets as htmlSnippets } from '../src/snippets/html.js';
import { snippets as cssSnippets } from '../src/snippets/css.js';

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`PASS: ${description}`);
    passed++;
  } else {
    console.error(`FAIL: ${description}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${title}`);
}

function validateSnippetPool(snippets, language, expectedIds) {
  section(`${language} - library shape`);

  assert(Array.isArray(snippets), `${language} snippets export is an array`);
  assert(snippets.length >= expectedIds.length, `${language} has at least ${expectedIds.length} entries`);

  const ids = new Set();
  const names = new Set();
  const tags = new Set();
  const prefix = `${language}-`;

  section(`${language} - every entry has required fields`);

  snippets.forEach((snippet, index) => {
    const label = snippet.id ?? `index ${index}`;

    assert(typeof snippet.id === 'string', `[${label}] id is a string`);
    assert(snippet.id.startsWith(prefix), `[${label}] id starts with ${prefix}`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(snippet.id), `[${label}] id is kebab-case`);
    assert(!ids.has(snippet.id), `[${label}] id is unique`);
    ids.add(snippet.id);

    assert(typeof snippet.name === 'string' && snippet.name.length > 0, `[${label}] name exists`);
    assert(!names.has(snippet.name), `[${label}] name is unique`);
    names.add(snippet.name);

    assert(snippet.language === language, `[${label}] language is ${language}`);
    assert(
      typeof snippet.description === 'string' && snippet.description.length > 0,
      `[${label}] description exists`
    );
    assert(Array.isArray(snippet.conceptTags), `[${label}] conceptTags is an array`);
    assert(snippet.conceptTags.length > 0, `[${label}] has at least one concept tag`);
    snippet.conceptTags.forEach((tag) => {
      assert(typeof tag === 'string' && tag.length > 0, `[${label}] concept tag is non-empty`);
      tags.add(tag);
    });

    assert(Number.isInteger(snippet.complexity), `[${label}] complexity is an integer`);
    assert(snippet.complexity >= 1 && snippet.complexity <= 3, `[${label}] complexity is 1-3`);

    assert(Array.isArray(snippet.lines), `[${label}] lines is an array`);
    assert(snippet.lines.length > 0, `[${label}] has at least one line`);
    snippet.lines.forEach((line, lineIndex) => {
      assert(typeof line === 'string', `[${label}] line ${lineIndex + 1} is a string`);
      assert(line.trim().length > 0, `[${label}] line ${lineIndex + 1} is not empty`);
    });
  });

  section(`${language} - expected entries present`);

  expectedIds.forEach((id) => {
    assert(ids.has(id), `[${id}] expected snippet exists`);
  });

  section(`${language} - variety`);

  assert(tags.size >= 3, `${language} covers at least 3 concept tags`);
}

validateSnippetPool(htmlSnippets, 'html', [
  'html-article-header',
  'html-nav-links',
  'html-unordered-list',
  'html-figure-image',
  'html-contact-form',
  'html-checkbox-label',
  'html-select-dropdown',
  'html-page-layout',
  'html-card-component',
  'html-data-table',
]);

validateSnippetPool(cssSnippets, 'css', [
  'css-flexbox-row',
  'css-grid-three-col',
  'css-box-model-card',
  'css-dark-theme-bg',
  'css-typography-heading',
  'css-fade-transition',
  'css-absolute-centre',
  'css-card-shadow',
  'css-responsive-stack',
  'css-custom-properties',
  'css-sticky-navbar',
  'css-hover-scale',
]);

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed > 0) {
  process.exitCode = 1;
}
