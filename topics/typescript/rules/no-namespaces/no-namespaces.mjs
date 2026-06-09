import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
export const noNamespacesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow TypeScript namespaces; modules are the container.',
    },
    messages: {
      noNamespace: createRuleMessage(
        'Namespace `{{name}}` is a TypeScript namespace declaration.',
        'Use an ES module file and export its members directly.',
        'no-namespaces',
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      TSModuleDeclaration(node) {
        if (node.declare === true) return;
        if (node.global === true || node.kind === 'global') return;
        if (node.id.type !== 'Identifier') return;
        context.report({
          node: node.id,
          messageId: 'noNamespace',
          data: { name: node.id.name },
        });
      },
    };
  },
};
