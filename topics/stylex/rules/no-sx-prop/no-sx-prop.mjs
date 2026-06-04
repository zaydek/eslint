export const noSxPropRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow sx props; use stylex.props explicitly.',
    },
    messages: {
      noSx: 'Use stylex.props instead of the sx prop.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.type === 'JSXIdentifier' && node.name.name === 'sx') {
          context.report({ node, messageId: 'noSx' });
        }
      },
    };
  },
};
