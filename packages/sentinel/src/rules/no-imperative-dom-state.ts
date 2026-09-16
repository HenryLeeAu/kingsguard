import {
  AST_NODE_TYPES as T,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  isReactRef,
  propertyName,
  resolve,
  unwrap,
} from '../adapters/react.js';

const properties = new Set([
  'tabIndex',
  'className',
  'hidden',
  'disabled',
  'checked',
  'value',
  'textContent',
  'innerHTML',
]);
const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/HenryLeeAu/kingsguard/blob/main/docs/rules/${name}.md`,
);

export const noImperativeDomState = createRule({
  name: 'no-imperative-dom-state',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer React props and state over direct mutation of DOM state through refs.',
    },
    schema: [],
    messages: {
      preferDeclarative:
        'Avoid mutating "{{property}}" through a React DOM ref. Express this state through JSX props and React state instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const source = context.sourceCode;
    const domRefs = new Set<NonNullable<ReturnType<typeof resolve>>>();
    const writes: TSESTree.MemberExpression[] = [];
    return {
      JSXAttribute(node) {
        if (
          node.name.type !== T.JSXIdentifier ||
          node.name.name !== 'ref' ||
          node.value?.type !== T.JSXExpressionContainer
        )
          return;
        const tag = node.parent.name;
        // Only native JSX elements provide evidence of DOM ownership.
        if (tag.type !== T.JSXIdentifier || !/^[a-z]/.test(tag.name)) return;
        const id = unwrap(node.value.expression);
        if (id.type !== T.Identifier || !isReactRef(source, id)) return;
        const variable = resolve(source, id);
        if (variable) domRefs.add(variable);
      },
      AssignmentExpression(node) {
        const target = unwrap(node.left);
        if (target.type === T.MemberExpression) writes.push(target);
      },
      UpdateExpression(node) {
        const target = unwrap(node.argument);
        if (target.type === T.MemberExpression) writes.push(target);
      },
      'Program:exit'() {
        for (const target of writes) {
          const property = propertyName(target);
          if (!property || !properties.has(property)) continue;
          const current = unwrap(target.object);
          if (
            current.type !== T.MemberExpression ||
            propertyName(current) !== 'current'
          )
            continue;
          const id = unwrap(current.object);
          if (id.type !== T.Identifier) continue;
          const variable = resolve(source, id);
          if (variable && domRefs.has(variable))
            context.report({
              node: target,
              messageId: 'preferDeclarative',
              data: { property },
            });
        }
      },
    };
  },
});
