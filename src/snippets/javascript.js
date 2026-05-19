/**
 * snippets/javascript.js — JavaScript code snippet library.
 *
 * At least 5 distinct JS functions covered. Each snippet is one
 * line of real, meaningful JS a beginner CS student would encounter.
 *
 * Implemented by Issue #1.
 */

export const snippets = [
  // Purpose: beginner string loop practice with real JS syntax for typing waves.
  // User story: Nishant US-10 (real code snippets).
  {
    id: 'js-reverse-string',
    name: 'reverseString',
    language: 'javascript',
    description:
      'Takes a string and returns it with its characters in reverse order (US-10 real code snippets).',
    conceptTags: ['loops', 'strings'],
    complexity: 1,
    lines: [
      'function reverseString(str) {',
      "  let reversed = '';",
      '  for (let i = str.length - 1; i >= 0; i--) reversed += str[i];',
      '  return reversed;',
      '}',
    ],
  },
  // Purpose: reinforces JavaScript-only string/conditional syntax for language-specific runs.
  // User story: Nishant US-05 (language selection).
  {
    id: 'js-count-vowels',
    name: 'countVowels',
    language: 'javascript',
    description:
      'Counts the number of vowels in a string (US-05 language selection for JavaScript runs).',
    conceptTags: ['strings', 'conditionals'],
    complexity: 2,
    lines: [
      'function countVowels(text) {',
      "  const vowels = 'aeiou';",
      '  let count = 0;',
      '  for (const ch of text.toLowerCase()) if (vowels.includes(ch)) count++;',
      '  return count;',
      '}',
    ],
  },
  // Purpose: provides clear array comparison logic to support readable wave intro explanations.
  // User story: Sam US-04 (wave intro card description field).
  {
    id: 'js-find-maximum',
    name: 'findMaximum',
    language: 'javascript',
    description:
      'Returns the largest number in an array (Sam US-04 wave intro description content).',
    conceptTags: ['arrays', 'math'],
    complexity: 1,
    lines: [
      'function findMaximum(nums) {',
      '  let max = nums[0];',
      '  for (let i = 1; i < nums.length; i++) if (nums[i] > max) max = nums[i];',
      '  return max;',
      '}',
    ],
  },
  // Purpose: includes tagged string/two-pointer logic to diversify concept-focused waves.
  // User story: Ryan US-04 (concept tags on waves).
  {
    id: 'js-is-palindrome',
    name: 'isPalindrome',
    language: 'javascript',
    description:
      'Checks whether a word reads the same forward and backward (Ryan US-04 concept tag coverage).',
    conceptTags: ['strings', 'two-pointers'],
    complexity: 2,
    lines: [
      'function isPalindrome(word) {',
      '  const normalized = word.toLowerCase();',
      '  for (let i = 0; i < normalized.length / 2; i++) if (normalized[i] !== normalized[normalized.length - 1 - i]) return false;',
      '  return true;',
      '}',
    ],
  },
  // Purpose: practices array accumulation in JS to support language-driven snippet pools.
  // User story: Soohwan US-01 (language selection).
  {
    id: 'js-sum-array',
    name: 'sumArray',
    language: 'javascript',
    description:
      'Adds all numbers in an array and returns the total (Soohwan US-01 language-driven wave selection).',
    conceptTags: ['arrays', 'accumulation'],
    complexity: 1,
    lines: [
      'function sumArray(values) {',
      '  let total = 0;',
      '  for (const value of values) total += value;',
      '  return total;',
      '}',
    ],
  },
];
