export const errorMessageContextRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require thrown error messages to interpolate structured context, not static prose.',
    },
    messages: {
      needsContext:
        'Thrown errors should interpolate structured context, e.g. `` `key=${JSON.stringify(value)}` ``.',
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
