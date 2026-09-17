import { afterAll, describe, expect, it } from 'vitest';
import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import { ESLint } from 'eslint';
import { preferRefOverDomQuery } from '../src/rules/prefer-ref-over-dom-query.js';
import plugin from '../src/index.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const tester = new RuleTester({ languageOptions: { parser } });
const methods = ['getElementById', 'querySelector', 'querySelectorAll'];
const receivers = [
  'document',
  'window.document',
  'globalThis.document',
  "window['document']",
  "globalThis['document']",
];
const error = { messageId: 'preferRef' as const };
tester.run('react-prefer-ref-over-dom-query', preferRefOverDomQuery, {
  valid: [
    'document; window; globalThis; window.document; globalThis.document;',
    'document.createElement("div"); document.addEventListener("click", handler);',
    'element.querySelector(selector); ref.current.querySelector(selector);',
    'const querySelector = fn; const value = {document, querySelector};',
    ...['document', 'window', 'globalThis'].flatMap((name) => {
      const receiver = name === 'document' ? name : `${name}.document`;
      return [
        `function f(${name}) { ${receiver}.querySelector(selector); }`,
        `const ${name} = local; ${receiver}.querySelector(selector);`,
        `import ${name} from 'local'; ${receiver}.querySelector(selector);`,
        `import { custom as ${name} } from 'local'; ${receiver}.querySelector(selector);`,
        `function f(${name}) { const {querySelector} = ${receiver}; }`,
        `{ ${receiver}.querySelector(selector); let ${name}; }`,
      ];
    }),
    // Named limitations: aliases, dynamic keys, other paths and indirect patterns.
    {
      name: 'receiver alias gap',
      code: 'const doc = document; doc.querySelector(selector);',
    },
    {
      name: 'dynamic method gap',
      code: 'document[method](selector); const {[method]: query} = document;',
    },
    { name: 'rest extraction gap', code: 'const {...methods} = document;' },
    {
      name: 'nested receiver pattern gap',
      code: 'const {document: {querySelector}} = window;',
    },
    {
      name: 'other document path gap',
      code: 'self.document.querySelector(selector); window.window.document.querySelector(selector);',
    },
    {
      name: 'loop binding gap',
      code: 'for (const {querySelector} of [document]) {}',
    },
  ],
  invalid: [
    ...receivers.flatMap((receiver) =>
      methods.flatMap((method) =>
        [
          `${receiver}.${method}(selector);`,
          `${receiver}['${method}'](...args);`,
          `const method = ${receiver}.${method};`,
          `${receiver}?.['${method}']?.(selector, ...args);`,
          `(${receiver} as Document)!.${method}();`,
          `(${receiver} satisfies Document).${method}(arbitrary());`,
          `const {${method}: query = fallback} = ${receiver};`,
          `const {['${method}']: query} = ${receiver};`,
          `({'${method}': query} = ${receiver});`,
          `const {${method}: {call}} = ${receiver};`,
        ].map((code) => ({ code, errors: [error], output: null })),
      ),
    ),
    ...[
      '(<Document>document).querySelector(selector);',
      'window?.document?.querySelector?.(selector);',
      'globalThis!.document!.querySelector!(selector);',
      'document.querySelector.call(document, selector);',
      'document.querySelector = replacement;',
      'delete document.querySelector;',
      'function helper() { return sdk.mount(document.getElementById(id)); }',
      'useEffect(() => { document.querySelector(selector); });',
      'function f(document) { document.querySelector(selector); } document.querySelector(selector);',
      'const {querySelector, ...rest} = document;',
    ].map((code) => ({ code, errors: [error], output: null })),
    {
      code: 'const {getElementById, querySelector: one, querySelectorAll: many} = document; document.querySelector(id).focus();',
      errors: [error, error, error, error],
      output: null,
    },
    {
      code: 'document.querySelector(selector); window.document.querySelectorAll(selector); globalThis.document.getElementById(id);',
      languageOptions: {
        globals: {
          document: 'readonly',
          window: 'readonly',
          globalThis: 'readonly',
        },
      },
      errors: [error, error, error],
      output: null,
    },
  ],
});

it.each([1, 2] as const)(
  'supports severity %s and explained ESLint suppression without React',
  async (severity) => {
    const ruleId = '@kingsguard/sentinel/react-prefer-ref-over-dom-query';
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        plugin.configs.react,
        ...(severity === 2 ? [{ rules: { [ruleId]: 'error' as const } }] : []),
      ],
    });
    const [result] = await eslint.lintText(
      `
// eslint-disable-next-line ${ruleId} -- Legacy host integration tracked for ref migration.
document.querySelector(selector);
window.document.getElementById(id);
const {querySelectorAll} = globalThis.document;
`,
      { filePath: 'queries.js' },
    );
    expect(result?.messages).toEqual([
      expect.objectContaining({ ruleId, severity }),
      expect.objectContaining({ ruleId, severity }),
    ]);
    expect(result?.suppressedMessages).toEqual([
      expect.objectContaining({
        ruleId,
        suppressions: [
          {
            kind: 'directive',
            justification: 'Legacy host integration tracked for ref migration.',
          },
        ],
      }),
    ]);
  },
);
