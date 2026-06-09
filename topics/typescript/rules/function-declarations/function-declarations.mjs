import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
export const functionDeclarationsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer function declarations for non-trivial local helpers.',
    },
    messages: {
      declaration: createRuleMessage(
        'Non-trivial helper `{{name}}` uses arrow/function-expression style.',
        'Rewrite it as a function declaration.',
        'function-declarations',
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return;
        if (!/^[a-z]/.test(node.id.name)) return;
        if (node.init?.type !== 'ArrowFunctionExpression') return;
        if (node.init.body.type !== 'BlockStatement') return;

        context.report({ node, messageId: 'declaration', data: { name: node.id.name } });
      },
    };
  },
};
