import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
import { getStylexCreateObject } from '../../lib/ownership.mjs';

export const stylexObjectSpacingRule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Disallow double blank lines inside stylex.create objects.',
    },
    messages: {
      doubleBlank: createRuleMessage(
        '`stylex.create` contains blank-line grouping inside the style object.',
        'Remove blank lines inside the object; express ownership grouping in the ownership comment.',
        'stylex-object-spacing',
      ),
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
