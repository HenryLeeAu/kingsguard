import {
  AST_NODE_TYPES as T,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { propertyName, resolve, unwrap } from '../adapters/react.js';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/HenryLeeAu/kingsguard/blob/main/docs/rules/${name}.md`,
);

/** Assignment targets do not retrieve the method; compound updates do. */
function isRead(node: TSESTree.Node): boolean {
  let target = node;
  while (target.parent) {
    const parent = target.parent;
    if (unwrap(parent) === unwrap(target)) {
      target = parent;
      continue;
    }
    if (parent.type === T.AssignmentExpression && parent.left === target)
      return parent.operator !== '=';
    if (
      ((parent.type === T.ForOfStatement || parent.type === T.ForInStatement) &&
        parent.left === target) ||
      (parent.type === T.UnaryExpression && parent.operator === 'delete')
    )
      return false;
    if (
      (parent.type === T.AssignmentPattern && parent.left === target) ||
      parent.type === T.RestElement ||
      parent.type === T.ArrayPattern ||
      parent.type === T.ObjectPattern ||
      (parent.type === T.Property &&
        parent.value === target &&
        parent.parent.type === T.ObjectPattern)
    ) {
      target = parent;
      continue;
    }
    break;
  }
  return true;
}

export const preferStateOverComputedStyle = createRule({
  name: 'prefer-state-over-computed-style',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer React state and props over browser computed-style reads.',
    },
    schema: [],
    messages: {
      preferState:
        'Avoid browser getComputedStyle access. Derive UI state from React state and props instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    const source = context.sourceCode;
    function isBrowserObject(expression: TSESTree.Node): boolean {
      const node = unwrap(expression);
      return (
        node.type === T.Identifier &&
        (node.name === 'window' || node.name === 'globalThis') &&
        !resolve(source, node)?.defs.length
      );
    }
    function checkPattern(
      pattern: TSESTree.Node,
      receiver: TSESTree.Node,
    ): void {
      if (pattern.type !== T.ObjectPattern || !isBrowserObject(receiver))
        return;
      for (const property of pattern.properties) {
        if (property.type !== T.Property) continue;
        const name =
          !property.computed && property.key.type === T.Identifier
            ? property.key.name
            : property.key.type === T.Literal
              ? property.key.value
              : undefined;
        if (name === 'getComputedStyle')
          context.report({ node: property, messageId: 'preferState' });
      }
    }
    return {
      MemberExpression(node) {
        if (
          propertyName(node) === 'getComputedStyle' &&
          isBrowserObject(node.object) &&
          isRead(node)
        )
          context.report({ node, messageId: 'preferState' });
      },
      VariableDeclarator(node) {
        if (node.init) checkPattern(node.id, node.init);
      },
      AssignmentExpression(node) {
        checkPattern(node.left, node.right);
      },
      'Program:exit'() {
        // Scope references omit definitions, member keys, labels, and other
        // identifier-shaped syntax. Both configured and unresolved globals qualify.
        for (const scope of source.scopeManager?.scopes ?? []) {
          for (const reference of scope.references) {
            if (
              reference.identifier.name === 'getComputedStyle' &&
              reference.isRead() &&
              reference.isValueReference !== false &&
              reference.identifier.parent.type !== T.TSTypeQuery &&
              reference.identifier.parent.type !== T.TSQualifiedName &&
              !reference.resolved?.defs.length
            )
              context.report({
                node: reference.identifier,
                messageId: 'preferState',
              });
          }
        }
      },
    };
  },
});
