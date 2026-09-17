# Sentinel

Framework-aware ESLint rules for declarative UIs, part of Kingsguard.

## Local setup

This package is an unpublished scaffold. From the repository root:

```sh
pnpm install
pnpm build
pnpm --filter @kingsguard/eslint-plugin-sentinel pack
```

Install the generated tarball into a consuming project with ESLint 10 and a
compatible TypeScript version (currently `>=4.8.4 <6.1.0`). The package is ESM-only
and requires Node.js 22.12+.

```js
// eslint.config.js (ES module)
import sentinel from '@kingsguard/eslint-plugin-sentinel';

export default [sentinel.configs.react];
```

For TypeScript/TSX, install `typescript-eslint` in the consuming project and use
its parser through the recommended configuration:

```js
import tseslint from 'typescript-eslint';
import sentinel from '@kingsguard/eslint-plugin-sentinel';

export default [...tseslint.configs.recommended, sentinel.configs.react];
```

The flat React preset enables `@kingsguard/sentinel/react-no-imperative-dom-state`
at warning severity. No type-aware linting or React runtime dependency is required.
Legacy `.eslintrc` configuration is not supported.

## Initial rule

For a React ref attached to a native JSX element, Sentinel reports selected state
assignments such as `ref.current.tabIndex = -1`. Prefer `tabIndex={-1}` or a JSX
prop derived from React state. Focus, measurements, scrolling, and ordinary data
refs remain allowed.

See the [full rule documentation](https://github.com/HenryLeeAu/kingsguard/blob/main/docs/rules/no-imperative-dom-state.md)
for exact coverage, exceptions, and limitations. No automatic fix is offered.

## Computed-style guard

The React preset also enables
`@kingsguard/sentinel/react-prefer-state-over-computed-style` at warning severity.
It reports browser `getComputedStyle` reads, captured references, and direct static
extraction in every file scope, including files without React imports or JSX.
Prefer React state and props as the source of UI state. Local functions and objects
that shadow browser globals are exempt. See the
[computed-style rule documentation](../../docs/rules/prefer-state-over-computed-style.md)
for detection boundaries, configuration, and explained ESLint suppression.
