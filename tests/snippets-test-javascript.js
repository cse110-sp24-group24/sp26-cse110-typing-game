/**
 * tests/snippets-test-javascript.js - Custom tests for the JavaScript snippet library.
 *
 * No test framework required. Run with:
 *   node tests/snippets-test-javascript.js
 */

import { snippets } from '../src/snippets/javascript.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertDeepEquals(actual, expected, message) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${message}: expected ${expectedJson}, got ${actualJson}`);
  }
}

function getSnippetById(id) {
  const snippet = snippets.find((item) => item.id === id);
  if (!snippet) {
    throw new Error(`Snippet not found: ${id}`);
  }
  return snippet;
}

function compileSnippet(snippet) {
  const source = `${snippet.lines.join('\n')}\nreturn ${snippet.name};`;
  return new Function(source)();
}

function runTest(id, cases) {
  const snippet = getSnippetById(id);
  const fn = compileSnippet(snippet);

  for (const [index, testCase] of cases.entries()) {
    const { args, expected } = testCase;
    const result = fn(...args);
    assertDeepEquals(result, expected, `${snippet.name} test #${index + 1}`);
  }

  console.log(`PASS: ${snippet.name} passed ${cases.length} behavior test(s)`);
}

function validateSnippetShape() {
  assert(Array.isArray(snippets), 'snippets export is an array');
  assert(
    snippets.length >= 12,
    `JavaScript pool has at least 12 snippets (found ${snippets.length})`
  );

  const ids = new Set();
  const names = new Set();
  const tags = new Set();
  const complexities = new Set();

  snippets.forEach((snippet, index) => {
    const label = snippet.id ?? `index ${index}`;

    assert(typeof snippet.id === 'string', `[${label}] id is a string`);
    assert(/^js-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(snippet.id), `[${label}] id is kebab-case`);
    assert(!ids.has(snippet.id), `[${label}] id is unique`);
    ids.add(snippet.id);

    assert(typeof snippet.name === 'string' && snippet.name.length > 0, `[${label}] name exists`);
    assert(!names.has(snippet.name), `[${label}] name is unique`);
    names.add(snippet.name);

    assert(snippet.language === 'javascript', `[${label}] language is javascript`);
    assert(
      typeof snippet.description === 'string' && snippet.description.length > 0,
      `[${label}] description exists`
    );
    assert(Array.isArray(snippet.conceptTags), `[${label}] conceptTags is an array`);
    assert(snippet.conceptTags.length > 0, `[${label}] has at least one concept tag`);
    snippet.conceptTags.forEach((tag) => tags.add(tag));

    assert(Number.isInteger(snippet.complexity), `[${label}] complexity is an integer`);
    assert(snippet.complexity >= 1 && snippet.complexity <= 3, `[${label}] complexity is 1-3`);
    complexities.add(snippet.complexity);

    assert(Array.isArray(snippet.lines), `[${label}] lines is an array`);
    assert(snippet.lines.length > 0, `[${label}] has at least one line`);
    assert(snippet.lines.length >= 4, `[${label}] has at least 4 lines`);
    assert(snippet.lines.length <= 9, `[${label}] has no more than 9 lines`);
    snippet.lines.forEach((line, lineIndex) => {
      assert(typeof line === 'string', `[${label}] line ${lineIndex + 1} is a string`);
      assert(line.trim().length > 0, `[${label}] line ${lineIndex + 1} is not empty`);
    });
  });

  assert(tags.size >= 8, `JavaScript snippets cover at least 8 concept tags (found ${tags.size})`);
  assert(complexities.has(1), 'JavaScript snippets include complexity 1');
  assert(complexities.has(2), 'JavaScript snippets include complexity 2');
  assert(complexities.has(3), 'JavaScript snippets include complexity 3');
  console.log('PASS: JavaScript snippet shape and invariants passed');
}

function runAllTests() {
  console.log('Running JavaScript snippet tests...');
  validateSnippetShape();

  runTest('js-reverse-string', [
    { args: ['abc'], expected: 'cba' },
    { args: ['Hello'], expected: 'olleH' },
  ]);

  runTest('js-count-vowels', [
    { args: ['JavaScript'], expected: 3 },
    { args: ['rhythm'], expected: 0 },
  ]);

  runTest('js-find-maximum', [
    { args: [[1, 5, 3]], expected: 5 },
    { args: [[-2, -1, -7]], expected: -1 },
  ]);

  runTest('js-is-palindrome', [
    { args: ['Racecar'], expected: true },
    { args: ['hello'], expected: false },
  ]);

  runTest('js-sum-array', [
    { args: [[1, 2, 3, 4]], expected: 10 },
    { args: [[-1, 5, 0]], expected: 4 },
  ]);

  runTest('js-filter-passing-scores', [
    { args: [[92, 48, 70, 69]], expected: [92, 70] },
    { args: [[55, 60]], expected: [] },
  ]);

  runTest('js-map-user-names', [
    { args: [[{ name: 'Ada' }, { name: 'Grace' }]], expected: ['Ada', 'Grace'] },
    { args: [[]], expected: [] },
  ]);

  runTest('js-remove-duplicates', [
    { args: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] },
    { args: [['cat', 'dog', 'cat']], expected: ['cat', 'dog'] },
  ]);

  runTest('js-factorial-recursive', [
    { args: [1], expected: 1 },
    { args: [5], expected: 120 },
  ]);

  runTest('js-find-first-even', [
    { args: [[3, 7, 8, 10]], expected: 8 },
    { args: [[1, 5, 9]], expected: null },
  ]);

  runTest('js-format-price', [
    { args: [4], expected: '$4.00' },
    { args: [3.5], expected: '$3.50' },
  ]);

  runTest('js-has-discount', [
    { args: [{ name: 'Notebook', discountPercent: 15 }], expected: true },
    { args: [{ name: 'Pencil', discountPercent: 0 }], expected: false },
  ]);

  console.log('All JavaScript snippet tests passed!');
}

try {
  runAllTests();
} catch (error) {
  console.error('Test failed:', error.message);
  process.exitCode = 1;
}
