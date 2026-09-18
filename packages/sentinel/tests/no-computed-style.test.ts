import { afterAll, describe, expect, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import { noComputedStyle } from '../src/rules/no-computed-style.js';
import plugin from '../src/index.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
const tester = new RuleTester({ languageOptions: { parser } });
const invalid = (code: string, count = 1) => ({
  code,
  errors: Array.from({ length: count }, () => ({
    messageId: 'preferState' as const,
  })),
  output: null,
});

tester.run('no-computed-style', noComputedStyle, {
  valid: [
    'function getComputedStyle(x) { return x; } getComputedStyle(element);',
    'function f(getComputedStyle) { getComputedStyle(element); }',
    'const getComputedStyle = fn; getComputedStyle(element);',
    "import { custom as getComputedStyle } from 'sdk'; getComputedStyle(element);",
    "import window from 'sdk'; window.getComputedStyle(element);",
    "import * as globalThis from 'sdk'; globalThis.getComputedStyle(element);",
    'function f(window, globalThis) { window.getComputedStyle(x); const {getComputedStyle: get} = globalThis; }',
    'const window = sdk; const {getComputedStyle} = window; getComputedStyle(x);',
    'const {getComputedStyle} = sdk; getComputedStyle(x);',
    'const object = {getComputedStyle: fn}; object.getComputedStyle(x);',
    'const object = {getComputedStyle() { return 1; }};',
    'getComputedStyle: while (ready) { break getComputedStyle; }',
    'interface WindowLike { getComputedStyle(): string; }',
    'type ComputedStyle = typeof getComputedStyle;',
    'const {getComputedStyle: value} = ordinaryObject;',
    'void window; void globalThis; node.getBoundingClientRect(); node.focus();',
    // Pure writes do not retrieve the browser method.
    'getComputedStyle = replacement; window.getComputedStyle = replacement;',
    '[window.getComputedStyle] = values; ({x: globalThis.getComputedStyle} = value);',
    'for (window.getComputedStyle of values) {} delete window.getComputedStyle;',
    // Named analysis limitations, not recommended usage or policy exceptions.
    {
      name: 'limitation: receiver aliases',
      code: 'const browser = window; browser.getComputedStyle(x);',
    },
    {
      name: 'limitation: dynamic names',
      code: 'window[method](x); const {[method]: get} = window;',
    },
    {
      name: 'limitation: rest extraction',
      code: 'const {...browser} = window; browser.getComputedStyle(x);',
    },
    {
      name: 'limitation: nested receiver patterns',
      code: 'const {window: {getComputedStyle}} = globalThis;',
    },
    {
      name: 'limitation: loop patterns',
      code: 'for (const {getComputedStyle} of values) {}',
    },
    {
      name: 'limitation: other browser paths',
      code: 'self.getComputedStyle(x); window.window.getComputedStyle(x);',
    },
  ],
  invalid: [
    ...[
      'getComputedStyle',
      'window.getComputedStyle',
      "window['getComputedStyle']",
      'globalThis.getComputedStyle',
      'globalThis["getComputedStyle"]',
    ].flatMap((method) => [
      invalid(`${method}(element);`),
      invalid(`const read = ${method};`),
      invalid(`sdk.configure(${method});`),
      invalid(`${method}?.(arbitrary, pseudo);`),
      invalid(`(${method} as Function)(element);`),
      invalid(`useEffect(() => { ${method}(element); });`),
    ]),
    invalid('const object = {getComputedStyle};'),
    invalid('typeof getComputedStyle;'),
    invalid('(getComputedStyle! satisfies Function)(element);'),
    invalid('(<Function>getComputedStyle)(element);'),
    invalid('((window as Window)!).getComputedStyle(element);'),
    invalid("globalThis?.['getComputedStyle']?.(element);"),
    invalid('window.getComputedStyle.call(window, element);'),
    invalid('getComputedStyle += replacement; window.getComputedStyle++;', 2),
    ...['window', 'globalThis', '(window as Window)!'].flatMap((receiver) => [
      invalid(`const {getComputedStyle} = ${receiver}; getComputedStyle(x);`),
      invalid(`const {getComputedStyle: read = fallback} = ${receiver};`),
      invalid(`const {'getComputedStyle': read, ...rest} = ${receiver};`),
      invalid(`const {['getComputedStyle']: read} = ${receiver};`),
      invalid(`let read; ({getComputedStyle: read} = ${receiver});`),
      invalid(`const {getComputedStyle: {name}} = ${receiver};`),
    ]),
    invalid(
      'const {getComputedStyle: first, getComputedStyle: second} = window;',
      2,
    ),
    invalid('const {getComputedStyle: read = getComputedStyle} = window;', 2),
    invalid(
      'function local(getComputedStyle) { getComputedStyle(x); } getComputedStyle(x);',
    ),
    invalid(
      'function local(window) { window.getComputedStyle(x); } window.getComputedStyle(x);',
    ),
    invalid(
      'const local = {getComputedStyle}; window.getComputedStyle(x); globalThis.getComputedStyle(x);',
      3,
    ),
    {
      ...invalid(
        'getComputedStyle(element); window.getComputedStyle(element); globalThis.getComputedStyle(element);',
        3,
      ),
      languageOptions: {
        globals: {
          getComputedStyle: 'readonly',
          window: 'readonly',
          globalThis: 'readonly',
        },
      },
    },
    invalid('const {[getComputedStyle(element)]: value} = object;'),
  ],
});

const ruleId = '@kingsguard/react/no-computed-style';
it.each([1, 2] as const)(
  'integrates without React using severity %i and the JavaScript parser',
  async (severity) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        plugin.configs.react,
        ...(severity === 1 ? [{ rules: { [ruleId]: 'warn' as const } }] : []),
      ],
    });
    const [result] = await eslint.lintText(
      'getComputedStyle(node); const {getComputedStyle: read} = window; globalThis.getComputedStyle(node);',
      { filePath: 'example.js' },
    );
    expect(result?.messages).toEqual(
      Array.from({ length: 3 }, () =>
        expect.objectContaining({ ruleId, severity }),
      ),
    );
  },
);
it('honors standard explained ESLint suppression', async () => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [plugin.configs.react],
  });
  const [result] = await eslint.lintText(
    `// eslint-disable-next-line ${ruleId} -- Legacy SDK requires a computed-style callback.\nsdk.configure(getComputedStyle);\nwindow.getComputedStyle(node);`,
    { filePath: 'example.js' },
  );
  expect(result?.messages).toEqual([
    expect.objectContaining({ ruleId, severity: 2 }),
  ]);
  expect(result?.suppressedMessages).toEqual([
    expect.objectContaining({
      ruleId,
      suppressions: [
        {
          kind: 'directive',
          justification: 'Legacy SDK requires a computed-style callback.',
        },
      ],
    }),
  ]);
});

it.each(['JavaScript', 'TypeScript'] as const)(
  'excludes bare and parenthesized deletion while preserving script reads with %s parser',
  async (parserName) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        plugin.configs.react,
        {
          languageOptions: {
            sourceType: 'script',
            ...(parserName === 'TypeScript' ? { parser } : {}),
          },
        },
      ],
    });
    const [result] = await eslint.lintText(
      [
        'delete getComputedStyle;',
        'delete (getComputedStyle);',
        'delete window.getComputedStyle;',
        'delete (globalThis.getComputedStyle);',
        'getComputedStyle(node);',
        'const read = getComputedStyle;',
        'typeof getComputedStyle;',
        'window.getComputedStyle(node);',
      ].join('\n'),
      { filePath: 'example.js' },
    );
    expect(result?.messages).toEqual(
      [5, 6, 7, 8].map((line) =>
        expect.objectContaining({ ruleId, severity: 2, line }),
      ),
    );
  },
);
