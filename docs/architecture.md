# Architecture

Sentinel currently has one runtime package and no bundler, task orchestrator, or
shared core package. pnpm manages workspaces; TypeScript emits ESM and declarations;
ESLint, Vitest, and Prettier provide linting, tests, and formatting.

The React adapter resolves lexical bindings for imports, ref factories, and JSX
refs. Rules decide which recognized operations merit a diagnostic. The plugin
entry point owns rule registration and framework presets.

This follows the [typescript-eslint custom-rule API](https://typescript-eslint.io/developers/custom-rules/)
and [ESLint flat plugin configuration](https://eslint.org/docs/latest/extend/plugins).

## Extension points

- Add React rules alongside the existing rule and reuse adapter recognition.
- Add Angular or Vue adapters only when their parser and template ownership
  semantics are understood. Give each framework its own preset and tests; React
  JSX recognition must not become a universal ownership assumption.
- Extract `@kingsguard/core` when multiple products actually need shared concepts.
  Avoid forcing unrelated framework ASTs into an interface prematurely.
- Add `@kingsguard/axe` as a separate runtime accessibility integration when
  needed. axe-core requires rendered DOM and belongs outside static ESLint rules.
  Keep its browser/runtime dependencies out of Sentinel.

## Intentional limits

The first rule is syntax- and scope-aware, not type- or data-flow-aware. It requires
a direct React ref factory and an intrinsic JSX ref binding in the same file.
It does not prove every runtime value is a DOM element. Conservative coverage and
explicit documentation are preferable to claiming universal DOM mutation detection.

Release automation, dual CommonJS output, a CLI, and placeholder framework packages
are deliberately deferred until there is a concrete consumer.

The computed-style guard is a separate global-browser rule: it resolves lexical
bindings for browser APIs without requiring React ref or JSX ownership. Its
read/reference diagnostics live in the rule; it shares the existing static member
and expression-wrapper helpers. It does not infer intent from effects or SDK calls.
