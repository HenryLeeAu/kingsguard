# no-computed-style

Use React state and props as the source of UI state. Reading the browser's
computed styles reverses that relationship. This rule reports browser
`getComputedStyle` reads, including calls, captured method references, and direct
static destructuring. Replacing the element with a ref does not address the
computed-style dependency.

```tsx
// Reported, even without React imports or JSX:
const visible = getComputedStyle(element).display !== 'none';
const readStyle = window.getComputedStyle;
const { getComputedStyle: read } = globalThis;

// Prefer deriving the rendered style from state/props:
function Panel({ visible }) {
  return <section style={{ display: visible ? 'block' : 'none' }} />;
}
```

## Coverage

The rule recognizes the unshadowed global `getComputedStyle`,
`window.getComputedStyle`, and `globalThis.getComputedStyle`. Unresolved names and
configured ESLint globals both qualify. Locally declared functions, variables,
parameters, and imports shadow these globals and are not reported. Definitions,
non-reference property names, and TypeScript type positions are not runtime reads.

Static string brackets, optional chains, and TypeScript expression wrappers are
supported. Direct object patterns in declarations and assignments report once per
`getComputedStyle` property, including renamed bindings and defaults. A reference
and its call produce one diagnostic; distinct references each produce their own.

All file scopes qualify. Helpers, effects, SDK calls, selectors, and arguments do
not create exemptions. Geometry operations such as `getBoundingClientRect()` are
outside this rule. React-ref property access is handled by
`no-dom-state`.

## Limits

Receiver aliases, dynamic method names, rest extraction, nested receiver patterns,
loop binding patterns, other global paths (such as `self`), reflection, and
cross-file data flow are outside this bounded analysis. For example,
`const browser = window; browser.getComputedStyle(node)` is not detected. These
are detection gaps, not recommended escape hatches.

Pure assignments to the global method, deletion, and assignment targets in
patterns or loops do not retrieve computed styles and are outside this rule.
Compound assignments and updates read their target and are reported. Bare
`window` and `globalThis` objects are not prohibited.

## Configuration and exceptions

The React flat preset enables this rule at error severity. For gradual adoption,
add a later config entry to downgrade it to `warn`, or use `off` to disable it:

```js
{
  rules: {
    '@kingsguard/sentinel/no-computed-style': 'warn',
  },
}
```

Use a standard ESLint suppression with an explanation for an intentional exception:

```js
// eslint-disable-next-line @kingsguard/sentinel/no-computed-style -- Legacy SDK requires this browser callback.
sdk.configure(getComputedStyle);
```

The rule has no options, automatic fixes, or suggested replacements. A safe
migration requires understanding which state or props should drive the UI.
