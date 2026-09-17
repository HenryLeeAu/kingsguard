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

The flat React preset enables all three rules at error severity:

- `@kingsguard/sentinel/no-dom-state`
- `@kingsguard/sentinel/no-dom-query`
- `@kingsguard/sentinel/no-computed-style`

No type-aware linting or React runtime dependency is required.
Legacy `.eslintrc` configuration is not supported. Use
`sentinel.configs.react`, not `extends: ['plugin:@kingsguard/sentinel/react']`.
The React preset belongs to this plugin; it does not require separate
`@kingsguard/core` or `@kingsguard/axe` packages.

Run `pnpm exec eslint .` to check your project. Violations fail lint and CI by
default. For gradual adoption, override selected rules to `warn` in a later
flat-config entry, or use `off` to disable a rule:

```js
import sentinel from '@kingsguard/eslint-plugin-sentinel';

export default [
  sentinel.configs.react,
  {
    rules: {
      '@kingsguard/sentinel/no-dom-state': 'warn',
      '@kingsguard/sentinel/no-dom-query': 'warn',
      '@kingsguard/sentinel/no-computed-style': 'warn',
    },
  },
];
```

## DOM-ref operation guard

For a React ref attached to a native JSX element, Sentinel allows only its
built-in operations: direct focus, scrolling, selection, measurement and playback
calls; scalar geometry/scroll reads; and scroll-position writes. Other direct
member reads, calls, and writes report. Prefer JSX props derived from React
state. Ordinary data refs remain outside this DOM-ref rule.

See the [full rule documentation](https://github.com/kingsguard-dev/kingsguard/blob/main/docs/rules/no-dom-state.md)
for exact coverage, exceptions, and limitations. No automatic fix is offered.

## Browser document queries

`no-dom-query` reports browser document `getElementById`,
`querySelector`, and `querySelectorAll` accesses, including method retrieval and
direct static destructuring. It applies throughout enabled files, including files
without React imports or JSX. Local bindings shadowing browser globals remain
allowed. Prefer React refs for element access; effects and SDK calls are not
automatic exemptions.

See [query rule coverage and limitations](https://github.com/kingsguard-dev/kingsguard/blob/main/docs/rules/no-dom-query.md)
for supported receivers, detection gaps, severity configuration, and explained
ESLint suppressions. No autofix or custom rule options are provided.

## Computed-style guard

The React preset also enables
`@kingsguard/sentinel/no-computed-style` at error severity.
It reports browser `getComputedStyle` reads, captured references, and direct static
extraction in every file scope, including files without React imports or JSX.
Prefer React state and props as the source of UI state. Local functions and objects
that shadow browser globals are exempt. See the
[computed-style rule documentation](https://github.com/kingsguard-dev/kingsguard/blob/main/docs/rules/no-computed-style.md)
for detection boundaries, configuration, and explained ESLint suppression.

## Updating rule names

If you used an earlier unpublished build, update rule overrides and ESLint
suppression comments using this mapping. Keep the `@kingsguard/sentinel/` prefix.
The old rule names are no longer registered.

| Previous name                            | New name            |
| ---------------------------------------- | ------------------- |
| `react-no-imperative-dom-state`          | `no-dom-state`      |
| `react-prefer-ref-over-dom-query`        | `no-dom-query`      |
| `react-prefer-state-over-computed-style` | `no-computed-style` |

`sentinel.configs.react` enables the new names automatically. All three rules
remain errors by default.
