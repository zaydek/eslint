export const noNamespacesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow TypeScript namespaces; modules are the container.',
    },
    messages: {
      noNamespace:
        'Namespace `{{name}}` should be a module; export its members from a dedicated file instead.',
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
