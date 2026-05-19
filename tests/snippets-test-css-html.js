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

import { snippets as htmlSnippets } from '../src/snippets/html.js';
import { snippets as cssSnippets } from '../src/snippets/css.js';

// ─── Tiny test runner ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, description, detail = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ─────────────────────────────────`);
}

// ─── HTML Tests ──────────────────────────────────────────────────────────────

section('html.js — library shape');

assert(Array.isArray(htmlSnippets), 'snippets export is an array');
assert(htmlSnippets.length >= 5, `has at least 5 entries (found ${htmlSnippets.length})`);

section('html.js — every entry has required fields');

htmlSnippets.forEach((s, i) => {
  const id = s.fn ?? `index ${i}`;
  assert(typeof s.line === 'string' && s.line.length > 0, `[${id}] line is a non-empty string`);
  assert(typeof s.fn === 'string' && s.fn.length > 0, `[${id}] fn is a non-empty string`);
  assert(Array.isArray(s.tags), `[${id}] tags is an array`);
  assert(s.tags.length > 0, `[${id}] tags has at least one entry`);
  s.tags.forEach((t) => {
    assert(
      typeof t === 'string' && t.length > 0,
      `[${id}] each tag is a non-empty string (got: ${t})`
    );
  });
});

section('html.js — line content rules');

htmlSnippets.forEach((s) => {
  const id = s.fn;
  // Every HTML line must open with < and contain a closing >
  assert(s.line.startsWith('<'), `[${id}] line starts with <`);
  assert(s.line.includes('>'), `[${id}] line contains >`);
  // No line should be just a bare tag with no content or attributes (too trivial)
  assert(s.line.length > 5, `[${id}] line is more than 5 characters`);
  // No pseudocode — lines must not contain placeholder words in angle brackets
  assert(
    !/<(yourText|content|placeholder)>/i.test(s.line),
    `[${id}] line contains no pseudocode placeholders`
  );
});

section('html.js — no duplicate lines');

const htmlLines = htmlSnippets.map((s) => s.line);
const htmlUnique = new Set(htmlLines);
assert(htmlUnique.size === htmlLines.length, `all ${htmlLines.length} lines are unique`);

section('html.js — tag variety (at least 4 distinct tags used across entries)');

const htmlAllTags = new Set(htmlSnippets.flatMap((s) => s.tags));
assert(
  htmlAllTags.size >= 4,
  `at least 4 distinct tags used (found: ${[...htmlAllTags].join(', ')})`
);

section('html.js — specific expected entries present');

const htmlLineSet = new Set(htmlSnippets.map((s) => s.line));
assert(htmlLineSet.has('<h1 class="title">Hello, World!</h1>'), 'h1 heading entry exists');
assert(htmlLineSet.has('<a href="https://example.com">Click here</a>'), 'anchor entry exists');
assert(
  htmlLineSet.has('<input type="text" placeholder="Enter name...">'),
  'text input entry exists'
);
assert(htmlLineSet.has('<button type="submit">Send Message</button>'), 'button entry exists');
assert(htmlLineSet.has('<img src="photo.jpg" alt="A scenic mountain view">'), 'image entry exists');

// ─── CSS Tests ───────────────────────────────────────────────────────────────

section('css.js — library shape');

assert(Array.isArray(cssSnippets), 'snippets export is an array');
assert(cssSnippets.length >= 5, `has at least 5 entries (found ${cssSnippets.length})`);

section('css.js — every entry has required fields');

cssSnippets.forEach((s, i) => {
  const id = s.fn ?? `index ${i}`;
  assert(typeof s.line === 'string' && s.line.length > 0, `[${id}] line is a non-empty string`);
  assert(typeof s.fn === 'string' && s.fn.length > 0, `[${id}] fn is a non-empty string`);
  assert(Array.isArray(s.tags), `[${id}] tags is an array`);
  assert(s.tags.length > 0, `[${id}] tags has at least one entry`);
  s.tags.forEach((t) => {
    assert(
      typeof t === 'string' && t.length > 0,
      `[${id}] each tag is a non-empty string (got: ${t})`
    );
  });
});

section('css.js — line content rules');

cssSnippets.forEach((s) => {
  const id = s.fn;
  // Every CSS declaration must end with a semicolon
  assert(s.line.endsWith(';'), `[${id}] line ends with semicolon`);
  // Must contain a colon separating property from value
  assert(s.line.includes(':'), `[${id}] line contains colon (property: value)`);
  // Must not be just a colon and semicolon — needs actual content
  assert(s.line.length > 5, `[${id}] line is more than 5 characters`);
  // No pseudocode — values shouldn't be placeholder words like <value> or <color>
  assert(!/<\w+>/.test(s.line), `[${id}] line contains no angle-bracket placeholders`);
});

section('css.js — no duplicate lines');

const cssLines = cssSnippets.map((s) => s.line);
const cssUnique = new Set(cssLines);
assert(cssUnique.size === cssLines.length, `all ${cssLines.length} lines are unique`);

section('css.js — tag variety (at least 4 distinct tags used across entries)');

const cssAllTags = new Set(cssSnippets.flatMap((s) => s.tags));
assert(
  cssAllTags.size >= 4,
  `at least 4 distinct tags used (found: ${[...cssAllTags].join(', ')})`
);

section('css.js — specific expected entries present');

const cssLineSet = new Set(cssSnippets.map((s) => s.line));
assert(cssLineSet.has('display: flex;'), 'display flex entry exists');
assert(cssLineSet.has('background-color: #1a1a2e;'), 'background-color entry exists');
assert(cssLineSet.has('font-size: 1.5rem;'), 'font-size entry exists');
assert(cssLineSet.has('border-radius: 8px;'), 'border-radius entry exists');
assert(cssLineSet.has('transition: opacity 0.3s ease;'), 'transition entry exists');

section('css.js — covers layout, color, typography, and spacing');

const cssFns = new Set(cssSnippets.map((s) => s.fn));
assert(cssFns.has('flexbox'), 'flexbox fn present');
assert(cssFns.has('color'), 'color fn present');
assert(cssFns.has('typography'), 'typography fn present');
assert(cssFns.has('spacing'), 'spacing fn present');

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (failed === 0) {
  console.log('All tests passed ✓');
} else {
  console.error(`${failed} test(s) failed ✗`);
  process.exit(1);
}
