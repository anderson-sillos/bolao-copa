const eslint = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/next-env.d.ts',
      '**/*.tsbuildinfo',
      'openspec/**',
      '.codex/**',
      '.gemini/**',
      '.agents/**',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs['flat/recommended'][2].rules,
    },
  },
  {
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  prettierRecommended,
];
