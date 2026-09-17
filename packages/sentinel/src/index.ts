import type { ESLint, Linter } from 'eslint';
import { preferStateOverComputedStyle } from './rules/prefer-state-over-computed-style.js';
import { noImperativeDomState } from './rules/no-imperative-dom-state.js';

const plugin = {
  meta: { name: '@kingsguard/eslint-plugin-sentinel', version: '0.1.0' },
  // typescript-eslint uses a narrower TS AST context than ESLint's generic
  // plugin API. Keep that type boundary here; integration tests exercise it.
  rules: {
    'react-prefer-state-over-computed-style':
      preferStateOverComputedStyle as unknown as NonNullable<
        ESLint.Plugin['rules']
      >[string],
    'react-no-imperative-dom-state':
      noImperativeDomState as unknown as NonNullable<
        ESLint.Plugin['rules']
      >[string],
  },
  configs: {} as { react: Linter.Config },
};

plugin.configs.react = {
  name: '@kingsguard/sentinel/react',
  files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { '@kingsguard/sentinel': plugin },
  rules: {
    '@kingsguard/sentinel/react-no-imperative-dom-state': 'warn',
    '@kingsguard/sentinel/react-prefer-state-over-computed-style': 'warn',
  },
};

export default plugin;
