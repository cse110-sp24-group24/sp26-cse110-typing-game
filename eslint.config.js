import js     from '@eslint/js';
import jsdoc  from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [
  // Apply recommended JS rules as the base
  js.configs.recommended,

  {
    plugins: { jsdoc },

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,   // window, document, localStorage, etc.
      },
    },

    rules: {
      // ── Naming ──────────────────────────────────────────────────
      'camelcase': ['error', { properties: 'always' }],

      // ── Variables ───────────────────────────────────────────────
      'no-var':        'error',
      'prefer-const':  'error',

      // ── Code quality ────────────────────────────────────────────
      'eqeqeq':            ['error', 'always'],
      'consistent-return': 'error',
      'curly':             ['error', 'all'],
      'no-unused-vars':    ['error', { argsIgnorePattern: '^_' }],
      'no-console':        ['warn', { allow: ['warn', 'error'] }],

      // ── JSDoc ────────────────────────────────────────────────────
      // Require JSDoc on exported functions; warn (not error) so
      // stub files don't block the pipeline during early development.
      'jsdoc/require-jsdoc': ['warn', {
        publicOnly: true,
        require: {
          FunctionDeclaration:    true,
          ArrowFunctionExpression: false,
          MethodDefinition:       false,
        },
      }],
      'jsdoc/require-param':           'warn',
      'jsdoc/require-param-type':      'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns':         'warn',
      'jsdoc/check-param-names':       'error',
      'jsdoc/check-types':             'error',
    },
  },

  // Ignore generated/vendor files
  {
    ignores: ['lib/', 'node_modules/', 'prototypes/'],
  },
];
