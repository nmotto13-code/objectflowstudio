// Flat ESLint config covering the whole monorepo. Each package's `lint` script
// runs `eslint src` from its own cwd; ESLint walks up to find this config.
// Web layers on the Next.js + React plugin overrides for app/ files.
//
// Style: keep this lightweight on purpose. The point of lint in CI is to catch
// obvious mistakes (unused vars, broken hooks rules, blatant React anti-patterns)
// — NOT to dictate stylistic taste, which Prettier already covers.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.config.{js,mjs,cjs,ts}',
      '**/drizzle/**', // generated migrations
    ],
  },

  // Base recommended rules — apply to every file.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Project-wide tweaks.
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.es2024 },
    },
    rules: {
      // Convention: prefix intentionally-unused identifiers with `_`.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // `any` shows up legitimately in places (e.g. webpack config callbacks,
      // third-party type gaps). Don't block CI on it; revisit per-file.
      '@typescript-eslint/no-explicit-any': 'off',
      // Empty catch blocks with a comment are fine.
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },

  // Web app — Next.js + React rules layered on top.
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // Next's app router doesn't need explicit React imports.
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off', // we use TS for that
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
