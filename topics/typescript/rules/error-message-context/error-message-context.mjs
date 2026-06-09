import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
export const errorMessageContextRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require thrown error messages to interpolate structured context, not static prose.',
    },
    messages: {
      needsContext: createRuleMessage(
        'Thrown error message does not include structured runtime context.',
        'Interpolate useful context, for example `` `key=${JSON.stringify(value)}` ``.',
        'error-message-context',
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      ThrowStatement(node) {
        const argument = node.argument;
        if (
          argument?.type !== 'NewExpression' ||
          argument.callee.type !== 'Identifier' ||
          !/Error$/.test(argument.callee.name)
        ) {
          return;
        }

        const message = argument.arguments[0];
        if (!message || isStaticString(message)) {
          context.report({ node: argument, messageId: 'needsContext' });
        }
      },
    };
  },
};

function isStaticString(node) {
  if (node.type === 'Literal') return typeof node.value === 'string';
  if (node.type === 'TemplateLiteral') return node.expressions.length === 0;
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return isStaticString(node.left) && isStaticString(node.right);
  }
  return false;
}
