import { afterAll, describe, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import { noImperativeDomState } from '../src/rules/no-imperative-dom-state.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({
  languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});
const example = (
  write: string,
  imports = "import { useRef } from 'react';",
  factory = 'useRef(null)',
  tag = 'button',
) => `${imports}
function Example() {
  const ref = ${factory};
  const update = () => { ${write} };
  return <${tag} ref={ref} onClick={update} />;
}`;
tester.run('react-no-imperative-dom-state', noImperativeDomState, {
  valid: [
    example('ref.current.focus();'),
    example('const index = ref.current.tabIndex; void index;'),
    example('ref.current = null;'),
    example('ref.current.scrollTop = 0;'),
    example('[ref.current.scrollTop] = values;'),
    example('({ [ref.current.value]: value } = data);'),
    example('[value = ref.current.value] = data;'),
    example('function update(ref) { [ref.current.value] = data; }'),
    example('[ref.current.value] = data;', '', '({ current: {} })'),
    `import { useRef } from 'react'; function Example() {
      const callback = Object.assign(node => {}, { current: { value: 0 } });
      const { current: banana } = useRef(callback);
      banana.current.value = 1;
      [banana.current.value] = data;
      return <input ref={banana}/>;
    }`,
    example('ref.current.tabIndex = -1;', '', '({ current: {} })'),
    example('ref.current.tabIndex = -1;', "import { useRef } from 'other';"),
    example(
      'ref.current.tabIndex = -1;',
      "import { useRef } from 'react';",
      'useRef(null)',
      'Widget',
    ),
    "import { useRef } from 'react'; const ref = useRef({tabIndex: 0}); ref.current.tabIndex = -1;",
    example('function update(ref) { ref.current.tabIndex = -1; }'),
    "import { useRef } from 'react'; function Example(useRef) { const ref = useRef(null); ref.current.tabIndex = -1; return <button ref={ref}/>; }",
    "import React from 'react'; function Example(React) { const ref = React.useRef(null); ref.current.tabIndex = -1; return <button ref={ref}/>; }",
    "import { useRef } from 'react'; let ref = useRef(null); ref = other; ref.current.tabIndex = -1; const element = <button ref={ref}/>;",
    "import { useRef } from 'react'; function Example() { const ref = useRef(null); return <button ref={ref} tabIndex={-1}/>; }",
  ],
  invalid: [
    {
      code: example('[ref.current.value, ref.current.checked] = values;'),
      errors: [
        { messageId: 'preferDeclarative', data: { property: 'value' } },
        { messageId: 'preferDeclarative', data: { property: 'checked' } },
      ],
      output: null,
    },
    ...[
      'tabIndex',
      'className',
      'hidden',
      'disabled',
      'checked',
      'value',
      'textContent',
      'innerHTML',
    ].map((property) => ({
      code: example(`ref.current.${property} = value;`),
      errors: [{ messageId: 'preferDeclarative' as const, data: { property } }],
      output: null,
    })),
    ...[
      example('ref.current.tabIndex = -1;'),
      example("ref['current']['tabIndex'] = -1;"),
      example('ref.current.tabIndex += 1;'),
      example('ref.current.tabIndex++;'),
      example('[ref.current.tabIndex] = values;'),
      example('({ value: ref.current.tabIndex } = data);'),
      example('({ nested: [, { value: ref.current.tabIndex = 0 }] } = data);'),
      example('[...ref.current.tabIndex] = values;'),
      example('({ ...ref.current.tabIndex } = data);'),
      example('[ref.current!.tabIndex] = values;'),
      example('ref.current!.tabIndex = -1;'),
      example('(ref.current as HTMLButtonElement).tabIndex = -1;'),
      example(
        'ref.current.tabIndex = -1;',
        "import { useRef as makeRef } from 'react';",
        'makeRef(null)',
      ),
      example(
        'ref.current.tabIndex = -1;',
        "import * as React from 'react';",
        'React.useRef(null)',
      ),
      example(
        'ref.current.tabIndex = -1;',
        "import React from 'react';",
        'React.createRef()',
      ),
      example(
        'ref.current.tabIndex = -1;',
        "import { createRef } from 'react';",
        'createRef()',
      ),
      "import { useRef } from 'react'; function Example() { const ref = useRef(null); const view = <button ref={ref}/>; ref.current.tabIndex = -1; return view; }",
    ].map((code) => ({
      code,
      filename: 'example.tsx',
      errors: [
        {
          messageId: 'preferDeclarative' as const,
          data: { property: 'tabIndex' },
        },
      ],
      output: null,
    })),
  ],
});
