# no-dom-query

Prefer React refs to browser document queries for DOM access. The React preset
reports on `getElementById`, `querySelector`, and `querySelectorAll` accesses through
unshadowed `document`, `window.document`, and `globalThis.document`.

```tsx
// Reported, including in files without React imports or JSX:
const element = document.getElementById(id);
const query = window.document.querySelector;
const { querySelectorAll: queryAll } = globalThis.document;

// Prefer an explicit React ref for an imperative action:
function Search() {
  const input = useRef(null);
  return <input ref={input} onClick={() => input.current?.focus()} />;
}
```

This guard applies throughout every enabled file, regardless of selectors,
arguments, JSX IDs, component boundaries, effects, helpers, or SDK usage. There
are no automatic exemptions for those contexts. Member retrieval and calls each
produce one report per guarded member access; using the access as a call does
not produce an additional report. Writes to these method members are also
accesses and are reported.

Static dot and string-literal bracket segments, optional chains, and TypeScript
assertions, non-null assertions, and `satisfies` wrappers are recognized. Direct
object destructuring declarations and assignments report each guarded static
property, including renamed properties and defaults.

## Scope and limitations

Local definitions, parameters, and imports shadow browser globals and are not
reported. Unresolved names and ESLint-configured globals without local
definitions qualify as browser globals. Other document APIs and bare
`document`, `window`, and `globalThis` references are not prohibited by this rule.

Detection does not follow receiver aliases or cross-file data flow. Dynamic
method names, rest extraction, nested receiver patterns such as
`const { document: { querySelector } } = window`, loop bindings, other document
paths (such as `self.document`), and eval/reflection are outside coverage. These
are detection gaps, not approved ways to bypass the guard. This rule is a bounded
global query guard, not an allowlist of global object operations.

## Configuration and exceptions

The rule takes no options and has no automatic fix. Replacing a query safely
requires choosing the appropriate ref and lifecycle in application code. The
React preset reports violations as errors. For gradual adoption, downgrade the
rule to `warn` in a later config entry, or use `off` to disable it:

```js
export default [
  sentinel.configs.react,
  {
    rules: {
      '@kingsguard/react/no-dom-query': 'warn',
    },
  },
];
```

For a deliberate exception, use an ordinary ESLint suppression with an
explanation:

```js
// eslint-disable-next-line @kingsguard/react/no-dom-query -- Legacy host integration tracked for ref migration.
const host = document.getElementById(hostId);
```
