export const functionDeclarationsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer function declarations for non-trivial local helpers.',
    },
    messages: {
      declaration: 'Non-trivial helper `{{name}}` should use function declaration style.',
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
