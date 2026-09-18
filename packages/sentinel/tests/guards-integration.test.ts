import { expect, it } from 'vitest';
import { ESLint } from 'eslint';
import * as parser from '@typescript-eslint/parser';
import plugin from '../src/index.js';

const dom = '@kingsguard/react/no-dom-state';
const query = '@kingsguard/react/no-dom-query';
const style = '@kingsguard/react/no-computed-style';
const cases = [
  { filePath: 'combined.jsx', languageOptions: {} },
  { filePath: 'combined.tsx', languageOptions: { parser } },
];
const mixed = `import { useRef } from 'react';
function Example() {
  const ref = useRef(null);
  ref.current.hidden;
  ref.current.classList.add('active');
  ref.current.style.color;
  ref.current.dataset.mode = 'active';
  ref.current.setAttribute('aria-expanded', 'true');
  ref.current.value = 'next';
  ref.current.futureOperation();
  document.querySelector('#example');
  getComputedStyle(ref.current).color;
  ref.current.focus();
  const width = ref.current.getBoundingClientRect().width;
  const height = ref.current.clientHeight;
  ref.current.scrollTop += 1;
  return <input ref={ref} data-width={width} data-height={height} />;
}`;

it.each(cases)(
  'combines all guards without duplicate reports in $filePath',
  async ({ filePath, languageOptions }) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [plugin.configs.react, { languageOptions }],
    });
    const [result] = await eslint.lintText(mixed, { filePath });
    expect(result?.errorCount).toBe(9);
    expect(result?.warningCount).toBe(0);
    expect(
      result?.messages.map(({ ruleId, line, severity }) => ({
        ruleId,
        line,
        severity,
      })),
    ).toEqual([
      ...[4, 5, 6, 7, 8, 9, 10].map((line) => ({
        ruleId: dom,
        line,
        severity: 2,
      })),
      { ruleId: query, line: 11, severity: 2 },
      { ruleId: style, line: 12, severity: 2 },
    ]);
  },
);

it.each(cases)(
  'downgrades all preset errors to warnings in $filePath',
  async ({ filePath, languageOptions }) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        plugin.configs.react,
        {
          languageOptions,
          rules: { [dom]: 'warn', [query]: 'warn', [style]: 'warn' },
        },
      ],
    });
    const [result] = await eslint.lintText(mixed, { filePath });
    expect(result?.errorCount).toBe(0);
    expect(result?.warningCount).toBe(9);
    expect(result?.messages.map(({ ruleId }) => ruleId)).toEqual([
      ...Array<string>(7).fill(dom),
      query,
      style,
    ]);
  },
);

it.each(cases)(
  'suppresses only the explained operation in $filePath',
  async ({ filePath, languageOptions }) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [plugin.configs.react, { languageOptions }],
    });
    const [result] = await eslint.lintText(
      `import {useRef} from 'react';
function Example() {
  const ref = useRef(null);
  // eslint-disable-next-line ${dom} -- legacy widget boundary
  ref.current.hidden = true;
  ref.current.hidden;
  // eslint-disable-next-line ${query} -- legacy widget boundary
  document.querySelector('#legacy');
  document.querySelector('#other');
  // eslint-disable-next-line ${style} -- legacy widget boundary
  getComputedStyle(ref.current);
  getComputedStyle(ref.current);
  return <div ref={ref}/>;
}`,
      { filePath },
    );
    expect(
      result?.messages.map(({ ruleId, line }) => ({ ruleId, line })),
    ).toEqual([
      { ruleId: dom, line: 6 },
      { ruleId: query, line: 9 },
      { ruleId: style, line: 12 },
    ]);
    expect(
      result?.suppressedMessages.map(({ ruleId, suppressions }) => ({
        ruleId,
        suppressions,
      })),
    ).toEqual(
      [dom, query, style].map((ruleId) => ({
        ruleId,
        suppressions: [
          { kind: 'directive', justification: 'legacy widget boundary' },
        ],
      })),
    );
  },
);

it.each(cases)(
  'disables all guards with off in $filePath',
  async ({ filePath, languageOptions }) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        plugin.configs.react,
        {
          languageOptions,
          rules: { [dom]: 'off', [query]: 'off', [style]: 'off' },
        },
      ],
    });
    const [result] = await eslint.lintText(mixed, { filePath });
    expect(result?.messages).toEqual([]);
    expect(result?.errorCount).toBe(0);
    expect(result?.warningCount).toBe(0);
  },
);
