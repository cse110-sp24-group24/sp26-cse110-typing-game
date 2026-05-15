const SNIPPETS = {
  javascript: [
    {
      name: "reverseString",
      description: "Takes a string and returns it with its characters in reverse order.",
      lines: [
        "function reverseString(str) {",
        "  let reversed = '';",
        "  for (let i = str.length - 1; i >= 0; i--) {",
        "    reversed += str[i];",
        "  }",
        "  return reversed;",
        "}"
      ]
    },
    {
      name: "findMax",
      description: "Finds and returns the largest number in an array.",
      lines: [
        "function findMax(arr) {",
        "  let max = arr[0];",
        "  for (let i = 1; i < arr.length; i++) {",
        "    if (arr[i] > max) {",
        "      max = arr[i];",
        "    }",
        "  }",
        "  return max;",
        "}"
      ]
    },
    {
      name: "isPalindrome",
      description: "Checks whether a given string reads the same forwards and backwards.",
      lines: [
        "function isPalindrome(str) {",
        "  let left = 0;",
        "  let right = str.length - 1;",
        "  while (left < right) {",
        "    if (str[left] !== str[right]) {",
        "      return false;",
        "    }",
        "    left++;",
        "    right--;",
        "  }",
        "  return true;",
        "}"
      ]
    },
    {
      name: "countVowels",
      description: "Counts the number of vowels in a given string.",
      lines: [
        "function countVowels(str) {",
        "  const vowels = 'aeiou';",
        "  let count = 0;",
        "  for (const char of str.toLowerCase()) {",
        "    if (vowels.includes(char)) {",
        "      count++;",
        "    }",
        "  }",
        "  return count;",
        "}"
      ]
    },
    {
      name: "factorial",
      description: "Calculates the factorial of a non-negative integer using a loop.",
      lines: [
        "function factorial(n) {",
        "  let result = 1;",
        "  for (let i = 2; i <= n; i++) {",
        "    result *= i;",
        "  }",
        "  return result;",
        "}"
      ]
    },
    {
      name: "removeDuplicates",
      description: "Returns a new array with all duplicate values removed.",
      lines: [
        "function removeDuplicates(arr) {",
        "  const unique = [];",
        "  for (const item of arr) {",
        "    if (!unique.includes(item)) {",
        "      unique.push(item);",
        "    }",
        "  }",
        "  return unique;",
        "}"
      ]
    },
    {
      name: "capitalize",
      description: "Capitalizes the first letter of each word in a string.",
      lines: [
        "function capitalize(str) {",
        "  const words = str.split(' ');",
        "  const result = [];",
        "  for (const word of words) {",
        "    result.push(word[0].toUpperCase() + word.slice(1));",
        "  }",
        "  return result.join(' ');",
        "}"
      ]
    },
    {
      name: "sumArray",
      description: "Adds up all the numbers in an array and returns the total.",
      lines: [
        "function sumArray(arr) {",
        "  let total = 0;",
        "  for (let i = 0; i < arr.length; i++) {",
        "    total += arr[i];",
        "  }",
        "  return total;",
        "}"
      ]
    }
  ],
  python: [
    {
      name: "reverse_string",
      description: "Takes a string and returns it with its characters in reverse order.",
      lines: [
        "def reverse_string(text):",
        "    reversed_str = ''",
        "    for char in text[::-1]:",
        "        reversed_str += char",
        "    return reversed_str"
      ]
    },
    {
      name: "find_max",
      description: "Finds and returns the largest number in a list.",
      lines: [
        "def find_max(numbers):",
        "    max_val = numbers[0]",
        "    for num in numbers[1:]:",
        "        if num > max_val:",
        "            max_val = num",
        "    return max_val"
      ]
    },
    {
      name: "is_palindrome",
      description: "Checks whether a given string reads the same forwards and backwards.",
      lines: [
        "def is_palindrome(text):",
        "    left = 0",
        "    right = len(text) - 1",
        "    while left < right:",
        "        if text[left] != text[right]:",
        "            return False",
        "        left += 1",
        "        right -= 1",
        "    return True"
      ]
    },
    {
      name: "count_vowels",
      description: "Counts the number of vowels in a given string.",
      lines: [
        "def count_vowels(text):",
        "    vowels = 'aeiou'",
        "    count = 0",
        "    for char in text.lower():",
        "        if char in vowels:",
        "            count += 1",
        "    return count"
      ]
    },
    {
      name: "factorial",
      description: "Calculates the factorial of a non-negative integer using a loop.",
      lines: [
        "def factorial(n):",
        "    result = 1",
        "    for i in range(2, n + 1):",
        "        result *= i",
        "    return result"
      ]
    },
    {
      name: "remove_duplicates",
      description: "Returns a new list with all duplicate values removed.",
      lines: [
        "def remove_duplicates(items):",
        "    unique = []",
        "    for item in items:",
        "        if item not in unique:",
        "            unique.append(item)",
        "    return unique"
      ]
    },
    {
      name: "capitalize_words",
      description: "Capitalizes the first letter of each word in a string.",
      lines: [
        "def capitalize_words(text):",
        "    words = text.split(' ')",
        "    result = []",
        "    for word in words:",
        "        result.append(word[0].upper() + word[1:])",
        "    return ' '.join(result)"
      ]
    },
    {
      name: "sum_list",
      description: "Adds up all the numbers in a list and returns the total.",
      lines: [
        "def sum_list(numbers):",
        "    total = 0",
        "    for num in numbers:",
        "        total += num",
        "    return total"
      ]
    }
  ]
};
