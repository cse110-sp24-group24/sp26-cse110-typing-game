/**
 * tests/snippets.test.js — Custom tests for html.js and css.js snippet libraries.
 *
 * No test framework required. Run with:
 *   node --experimental-vm-modules tests/snippets.test.js
 *
 * A passing test prints:  PASS: <description>
 * A failing test prints:  FAIL: <description> — <reason>
 * Summary is printed at the end.
 */

import { snippets } from './src/snippets/javascript.js';

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

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message} failed: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function runTest(id, cases) {
  const snippet = getSnippetById(id);
  const fn = compileSnippet(snippet);

  for (const [index, testCase] of cases.entries()) {
    const { args, expected } = testCase;
    const result = fn(...args);
    assertEquals(result, expected, `${snippet.name} test #${index + 1}`);
  }

  console.log(`✅ ${snippet.name} passed ${cases.length} test(s)`);
}

function runAllTests() {
  console.log('Running JavaScript snippet tests...');

  runTest('js-reverse-string', [
    { args: [['abc']], expected: 'cba' },
    { args: [['Hello']], expected: 'olleH' },
  ]);

  runTest('js-count-vowels', [
    { args: [['JavaScript']], expected: 3 },
    { args: [['rhythm']], expected: 0 },
  ]);

  runTest('js-find-maximum', [
    { args: [[1, 5, 3]], expected: 5 },
    { args: [[-2, -1, -7]], expected: -1 },
  ]);

  runTest('js-is-palindrome', [
    { args: [['Racecar']], expected: true },
    { args: [['hello']], expected: false },
  ]);

  runTest('js-sum-array', [
    { args: [[1, 2, 3, 4]], expected: 10 },
    { args: [[-1, 5, 0]], expected: 4 },
  ]);

  console.log('All JavaScript snippet tests passed!');
}

try {
  runAllTests();
} catch (error) {
  console.error('Test failed:', error.message);
  process.exitCode = 1;
}
