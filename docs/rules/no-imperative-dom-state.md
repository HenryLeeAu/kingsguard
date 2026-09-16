# react-no-imperative-dom-state

Prefer React props and state over direct changes to DOM state managed by React.
This is a declarative UI rule, not a complete accessibility audit.

## Reported

```tsx
import { useRef } from 'react';

function Button() {
  const ref = useRef<HTMLButtonElement>(null);
  function deactivate() {
    if (ref.current) ref.current.tabIndex = -1;
  }
  return (
    <button ref={ref} onClick={deactivate}>
      Deactivate
    </button>
  );
}
```

## Preferred

```tsx
import { useState } from 'react';

function Button() {
  const [active, setActive] = useState(true);
  return (
    <button tabIndex={active ? 0 : -1} onClick={() => setActive(false)}>
      Deactivate
    </button>
  );
}
```

## Detection

The rule requires a variable initialized directly with an imported React `useRef`
or `createRef`, attached with `ref={variable}` to a native JSX element in the same
file. Named import aliases and default/namespace React imports are recognized.
Lexical scope resolution distinguishes shadowed variables and imports. Reassigned
ref variables are skipped.

The declaration must bind the ref object directly, such as
`const banana = useRef(null)`. A destructured value such as
`const { current: banana } = useRef(callback)` is not recognized as a ref object:
here `banana` is the stored callback, and its own properties are not DOM evidence.

It reports assignments (including compound assignments) and increments/decrements
to `ref.current` properties: `tabIndex`, `className`, `hidden`, `disabled`, `checked`,
`value`, `textContent`, and `innerHTML`. String-literal bracket access and TypeScript
assertions/non-null expressions are supported.

Assignment targets inside array and object destructuring are also checked,
including nested patterns, defaults, and rest targets:

```js
[ref.current.value] = values;
({ checked: ref.current.checked = false } = data);
```

Reads in computed keys or default values are not mutations. For example,
`[value = ref.current.value] = values` is allowed.

Use JSX props for attributes, children for text, and controlled state where
appropriate. Imperative focus (`ref.current.focus()`), scrolling, measurements,
reads, ref initialization, and ordinary data refs are allowed.

## Limits and exceptions

- No cross-file tracking, ref aliases, callback refs, forwarded refs, or custom
  hooks. Refs attached only to custom components do not establish DOM ownership.
- No detection of `setAttribute`, `classList`, nested `style` mutations,
  `Object.assign`, `delete`, destructured DOM aliases, or dynamic property keys.
- Assignment targets in `for...in` and `for...of` loop headers are not checked.
- A ref with no matching JSX binding is skipped, even with a DOM type annotation.
- The same binding attached to a native element supplies evidence, not a proof
  about its runtime value. Third-party widgets and deliberately uncontrolled
  inputs may need a targeted ESLint suppression with an explanatory comment.
- No automatic fix: moving imperative code into JSX/state can change behavior
  and requires an intentional component change.

There are no options. The React preset enables this rule as a warning; projects
can raise its severity to `error` in their flat config.
