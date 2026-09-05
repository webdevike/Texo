import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['src/mantine.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
];
