import {
  AST_NODE_TYPES as T,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { propertyName, resolve, unwrap } from '../adapters/react.js';

const queryMethods = new Set([
  'getElementById',
  'querySelector',
  'querySelectorAll',
]);
const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/HenryLeeAu/kingsguard/blob/main/docs/rules/${name}.md`,
);

export const preferRefOverDomQuery = createRule({
  name: 'prefer-ref-over-dom-query',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer React refs over browser document queries.',
    },
    schema: [],
    messages: {
      preferRef:
        'Avoid browser document.{{method}} access. Use React refs to access DOM elements instead.',
    },
  },
  defaultOptions: [],
  create(context) {
    function isGlobal(node: TSESTree.Node, names: string[]): boolean {
      const id = unwrap(node);
      return (
        id.type === T.Identifier &&
        names.includes(id.name) &&
        !resolve(context.sourceCode, id)?.defs.length
      );
    }
    function isDocument(node: TSESTree.Node): boolean {
      const receiver = unwrap(node);
      return (
        isGlobal(receiver, ['document']) ||
        (receiver.type === T.MemberExpression &&
          propertyName(receiver) === 'document' &&
          isGlobal(receiver.object, ['window', 'globalThis']))
      );
    }
    function report(node: TSESTree.Node, method: string | undefined): void {
      if (method && queryMethods.has(method))
        context.report({ node, messageId: 'preferRef', data: { method } });
    }
    function checkPattern(left: TSESTree.Node, right: TSESTree.Node): void {
      const pattern = unwrap(left);
      if (pattern.type !== T.ObjectPattern || !isDocument(right)) return;
      for (const property of pattern.properties) {
        if (property.type === T.RestElement) continue;
        const key = property.key;
        const name =
          !property.computed && key.type === T.Identifier
            ? key.name
            : key.type === T.Literal && typeof key.value === 'string'
              ? key.value
              : undefined;
        report(property, name);
      }
    }
    return {
      MemberExpression(node) {
        if (isDocument(node.object)) report(node, propertyName(node));
      },
      VariableDeclarator(node) {
        if (node.init) checkPattern(node.id, node.init);
      },
      AssignmentExpression(node) {
        checkPattern(node.left, node.right);
      },
    };
  },
});
