import { getStylexCreateObject } from '../../../../lib/stylex-ownership.mjs';

export const stylexObjectSpacingRule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow double blank lines inside stylex.create objects.',
    },
    messages: {
      doubleBlank: '`stylex.create` should not use blank-line grouping inside the object.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function checkStylexCreate(node) {
      const objectNode = getStylexCreateObject(node);
      if (!objectNode) return;

      const text = sourceCode.text.slice(objectNode.range[0], objectNode.range[1]);
      if (/\n\s*\n/.test(text)) {
        context.report({ node: objectNode, messageId: 'doubleBlank' });
      }
    }

    return {
      CallExpression: checkStylexCreate,
    };
  },
};
