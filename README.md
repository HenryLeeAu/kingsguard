# Kingsguard

Framework-aware tooling for safer and more declarative UIs.

Kingsguard is the ecosystem; **Sentinel** is its first product: an ESLint plugin
that helps keep UI state declarative, starting with React.

## Development

Requires Node.js 22.12+ and pnpm 10.12.1 (see `packageManager`).

```sh
pnpm install
pnpm check
pnpm test:watch
```

`check` runs formatting, lint, type checking, tests, and package builds. CI runs
the same checks on Node 22 and 24. TypeScript stays on 5.9 while the
typescript-eslint dependency supports TypeScript versions below 6.1.

## Workspace

```text
packages/
  sentinel/
    src/
      adapters/react.ts       React binding and ref recognition
      rules/                  ESLint diagnostics
      index.ts                Plugin and React flat preset
    tests/                    RuleTester and ESLint integration tests
docs/
  rules/                      Rule behavior and migration examples
  architecture.md             Boundaries and future extensions
```

The workspace starts with one real package, `@kingsguard/eslint-plugin-sentinel`.
See its [setup instructions](packages/sentinel/README.md) and the first rule,
[react-no-imperative-dom-state](docs/rules/no-imperative-dom-state.md).

Angular, Vue, and axe-core are future work, not implemented integrations.
See the [architecture notes](docs/architecture.md) before extending the project.

## Contributing

Add a rule with valid and invalid cases, document its limits, and run `pnpm check`.
Prefer evidence of framework ownership over broad API blacklists. Keep framework
recognition in adapters and avoid introducing shared packages until there are
multiple consumers. This initial scaffold has no publishing automation.

## License

MIT — see [LICENSE](LICENSE).
