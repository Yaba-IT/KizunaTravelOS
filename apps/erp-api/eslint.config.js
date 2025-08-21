const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'dist/**', 
      'node_modules/**', 
      '**/*.test.js', 
      '**/*.spec.js', 
      'coverage/**',
      'src/test-utils/**' // Ignore test utility files
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.jest, // Add Jest globals
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
      }],
      'no-console': 'off', // Allow console in backend API
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];
