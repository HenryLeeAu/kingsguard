import { expect, it } from 'vitest';
import { ESLint } from 'eslint';
import * as parser from '@typescript-eslint/parser';
import plugin from '../src/index.js';

it('works with the default JavaScript parser and preserves imperative focus', async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [plugin.configs.react],
  });
  const [result] = await eslint.lintText(
    "import React from 'react'; function Example(){ const ref = React.useRef(null); ref.current.focus(); ref.current.tabIndex = -1; return <button ref={ref}/>; }",
    { filePath: 'example.jsx' },
  );
  expect(result?.messages).toEqual([
    expect.objectContaining({
      ruleId: '@kingsguard/sentinel/react-no-imperative-dom-state',
      severity: 1,
    }),
  ]);
});

it('loads the React flat preset and reports through ESLint', async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [plugin.configs.react, { languageOptions: { parser } }],
  });
  const [result] = await eslint.lintText(
    "import {useRef} from 'react'; function Example(){ const ref = useRef(null); ref.current.tabIndex = -1; return <button ref={ref}/>; }",
    { filePath: 'example.tsx' },
  );
  expect(result?.messages).toEqual([
    expect.objectContaining({
      ruleId: '@kingsguard/sentinel/react-no-imperative-dom-state',
      severity: 1,
    }),
  ]);
});
