import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),
  {
    rules: {
      // Keep basic JS hygiene strict
      'prefer-const': 'error',
      'no-var': 'error',

      // Relax TS strictness for faster iteration and to allow commits
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Project-specific relaxations
      '@next/next/no-html-link-for-pages': 'off', // We use app/ router and/or custom structure
      'react/no-unescaped-entities': 'off', // Allow raw quotes in static content pages
    },
  },
]; 
