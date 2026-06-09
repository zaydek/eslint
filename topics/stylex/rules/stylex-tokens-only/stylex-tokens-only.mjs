import { getStylexCreateObject } from '../../../../lib/stylex-ownership.mjs';

const COLOR_PATTERN =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|hwb|color-mix|light-dark)\(/;

export const stylexTokensOnlyRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow raw color literals inside component `stylex.create`; colors come from tokens.',
    },
    messages: {
      rawColor: 'Raw color `{{value}}` belongs in a `.stylex.` tokens file, not a component.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename();
    if (/\.stylex\./.test(filename)) return {};

    return {
      CallExpression(node) {
        const objectNode = getStylexCreateObject(node);
        if (!objectNode) return;
        checkValue(context, objectNode);
      },
    };
  },
};

function checkValue(context, node) {
  if (!node) return;

  switch (node.type) {
    case 'Literal':
      if (typeof node.value === 'string' && COLOR_PATTERN.test(node.value)) {
        context.report({ node, messageId: 'rawColor', data: { value: node.value } });
      }
      return;
    case 'TemplateLiteral':
      for (const quasi of node.quasis) {
        if (COLOR_PATTERN.test(quasi.value.raw)) {
          context.report({ node: quasi, messageId: 'rawColor', data: { value: quasi.value.raw.trim() } });
        }
      }
      for (const expression of node.expressions) checkValue(context, expression);
      return;
    case 'ObjectExpression':
      for (const property of node.properties) {
        if (property.type === 'Property') checkValue(context, property.value);
      }
      return;
    case 'ArrayExpression':
      for (const element of node.elements) checkValue(context, element);
      return;
    case 'ConditionalExpression':
      checkValue(context, node.consequent);
      checkValue(context, node.alternate);
      return;
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      checkFunctionBody(context, node.body);
      return;
    default:
      return;
  }
}

function checkFunctionBody(context, body) {
  if (body.type !== 'BlockStatement') {
    checkValue(context, body);
    return;
  }
  for (const statement of body.body) {
    if (statement.type === 'ReturnStatement') checkValue(context, statement.argument);
  }
}
