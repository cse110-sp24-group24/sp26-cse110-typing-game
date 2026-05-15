/**
 * snippets/javascript.js — JavaScript code snippet library.
 *
 * At least 5 distinct JS functions covered. Each snippet is one
 * line of real, meaningful JS a beginner CS student would encounter.
 *
 * Implemented by Issue #1.
 */

export const snippets = [
  // Placeholder snippets — expand to full library in Issue #1
  { line: 'const greet = (name) => `Hello, ${name}!`;',         fn: 'greet',   tags: ['arrow', 'template-literal'] },
  { line: 'function add(a, b) { return a + b; }',               fn: 'add',     tags: ['function', 'arithmetic'] },
  { line: 'const doubled = nums.map(n => n * 2);',              fn: 'map',     tags: ['array', 'higher-order'] },
  { line: 'const evens = nums.filter(n => n % 2 === 0);',       fn: 'filter',  tags: ['array', 'higher-order'] },
  { line: 'const sum = nums.reduce((acc, n) => acc + n, 0);',   fn: 'reduce',  tags: ['array', 'higher-order'] },
];
