/**
 * snippets/javascript.js — JavaScript code snippet library.
 *
 * 12 distinct JS functions covered. Each snippet contains
 * real, meaningful JS a beginner CS student would encounter.
 *
 * Implemented by Issue #1.
 */

export const snippets = [
  // Purpose: beginner string loop practice with real JS syntax for typing waves.
  {
    id: 'js-reverse-string',
    name: 'reverseString',
    language: 'javascript',
    description: 'Takes a string and returns it with its characters in reverse order.',
    conceptTags: ['loops', 'strings'],
    complexity: 1,
    lines: [
      'function reverseString(str) {',
      "  let reversed = '';",
      '  for (let i = str.length - 1; i >= 0; i--) {',
      '    reversed += str[i];',
      '  }',
      '  return reversed;',
      '}',
    ],
  },
  // Purpose: reinforces JavaScript-only string/conditional syntax for language-specific runs.
  {
    id: 'js-count-vowels',
    name: 'countVowels',
    language: 'javascript',
    description: 'Counts the number of vowels in a string.',
    conceptTags: ['strings', 'conditionals'],
    complexity: 2,
    lines: [
      'function countVowels(text) {',
      "  const vowels = 'aeiou';",
      '  let count = 0;',
      '  for (const ch of text.toLowerCase()) {',
      '    if (vowels.includes(ch)) count++;',
      '  }',
      '  return count;',
      '}',
    ],
  },
  // Purpose: provides clear array comparison logic to support readable wave intro explanations.
  {
    id: 'js-find-maximum',
    name: 'findMaximum',
    language: 'javascript',
    description: 'Returns the largest number in an array.',
    conceptTags: ['arrays', 'math'],
    complexity: 1,
    lines: [
      'function findMaximum(nums) {',
      '  let max = nums[0];',
      '  for (let i = 1; i < nums.length; i++) {',
      '    if (nums[i] > max) max = nums[i];',
      '  }',
      '  return max;',
      '}',
    ],
  },
  // Purpose: includes tagged string/two-pointer logic to diversify concept-focused waves.
  {
    id: 'js-is-palindrome',
    name: 'isPalindrome',
    language: 'javascript',
    description: 'Checks whether a word reads the same forward and backward.',
    conceptTags: ['strings', 'two-pointers'],
    complexity: 2,
    lines: [
      'function isPalindrome(word) {',
      '  const normalized = word.toLowerCase();',
      '  for (let i = 0; i < normalized.length / 2; i++) {',
      '    if (normalized[i] !== normalized[normalized.length - 1 - i]) {',
      '      return false;',
      '    }',
      '  }',
      '  return true;',
      '}',
    ],
  },
  // Purpose: practices array accumulation in JS to support language-driven snippet pools.
  {
    id: 'js-sum-array',
    name: 'sumArray',
    language: 'javascript',
    description: 'Adds all numbers in an array and returns the total.',
    conceptTags: ['arrays', 'accumulation'],
    complexity: 1,
    lines: [
      'function sumArray(values) {',
      '  let total = 0;',
      '  for (const value of values) {',
      '    total += value;',
      '  }',
      '  return total;',
      '}',
    ],
  },
  // Purpose: introduces filter() with a practical threshold check.
  {
    id: 'js-filter-passing-scores',
    name: 'filterPassingScores',
    language: 'javascript',
    description: 'Returns only the quiz scores that are passing grades.',
    conceptTags: ['arrays', 'conditionals'],
    complexity: 2,
    lines: [
      'function filterPassingScores(scores) {',
      '  const passing = scores.filter((score) => {',
      '    return score >= 70;',
      '  });',
      '  return passing;',
      '}',
    ],
  },
  // Purpose: practices map() with arrays of simple objects.
  {
    id: 'js-map-user-names',
    name: 'mapUserNames',
    language: 'javascript',
    description: 'Builds an array of user names from an array of user objects.',
    conceptTags: ['arrays', 'objects'],
    complexity: 2,
    lines: [
      'function mapUserNames(users) {',
      '  const names = users.map((user) => {',
      '    return user.name;',
      '  });',
      '  return names;',
      '}',
    ],
  },
  // Purpose: demonstrates a classic array loop for removing repeated values.
  {
    id: 'js-remove-duplicates',
    name: 'removeDuplicates',
    language: 'javascript',
    description: 'Returns a new array with duplicate values removed.',
    conceptTags: ['arrays', 'conditionals'],
    complexity: 2,
    lines: [
      'function removeDuplicates(values) {',
      '  const unique = [];',
      '  for (const value of values) {',
      '    if (!unique.includes(value)) {',
      '      unique.push(value);',
      '    }',
      '  }',
      '  return unique;',
      '}',
    ],
  },
  // Purpose: adds a compact recursive example with a clear base case.
  {
    id: 'js-factorial-recursive',
    name: 'factorialRecursive',
    language: 'javascript',
    description: 'Uses recursion to calculate the factorial of a number.',
    conceptTags: ['recursion', 'math'],
    complexity: 3,
    lines: [
      'function factorialRecursive(n) {',
      '  if (n <= 1) {',
      '    return 1;',
      '  }',
      '  return n * factorialRecursive(n - 1);',
      '}',
    ],
  },
  // Purpose: practices early returns while searching an array.
  {
    id: 'js-find-first-even',
    name: 'findFirstEven',
    language: 'javascript',
    description: 'Finds the first even number in an array, or returns null if none exists.',
    conceptTags: ['arrays', 'conditionals'],
    complexity: 2,
    lines: [
      'function findFirstEven(numbers) {',
      '  for (const number of numbers) {',
      '    if (number % 2 === 0) {',
      '      return number;',
      '    }',
      '  }',
      '  return null;',
      '}',
    ],
  },
  // Purpose: includes number formatting and template literals for real UI text.
  {
    id: 'js-format-price',
    name: 'formatPrice',
    language: 'javascript',
    description: 'Formats a number as a simple dollar price string.',
    conceptTags: ['strings', 'math'],
    complexity: 1,
    lines: [
      'function formatPrice(amount) {',
      '  const rounded = amount.toFixed(2);',
      '  return `$${rounded}`;',
      '}',
    ],
  },
  // Purpose: practices reading object properties and returning a simple boolean.
  {
    id: 'js-has-discount',
    name: 'hasDiscount',
    language: 'javascript',
    description: 'Checks whether a product object has a discount available.',
    conceptTags: ['objects', 'conditionals'],
    complexity: 2,
    lines: [
      'function hasDiscount(product) {',
      '  if (product.discountPercent > 0) {',
      '    return true;',
      '  }',
      '  return false;',
      '}',
    ],
  },
];
