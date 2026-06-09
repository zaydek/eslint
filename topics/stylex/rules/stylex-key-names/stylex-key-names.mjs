import {
  getOwnershipComment,
  getStylexCreateObject,
  parseOwnershipComment,
} from '../../lib/ownership.mjs';

export const stylexKeyNamesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require nested StyleX ownership keys to inherit parent prefixes.',
    },
    messages: {
      prefix: '`{{key}}` should inherit the `{{prefix}}` ownership prefix.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function checkStylexCreate(node) {
      const objectNode = getStylexCreateObject(node);
      if (!objectNode) return;

      const statementNode = getOwningStatement(node);
      const comment = getOwnershipComment(sourceCode, statementNode);
      const ownership = parseOwnershipComment(comment);

      for (const entry of ownership.entries) {
        if (shouldRequireParentPrefix(entry) && !entry.key.startsWith(entry.parent.key)) {
          context.report({
            node: objectNode,
            messageId: 'prefix',
            data: { key: entry.key, prefix: entry.parent.key },
          });
        }
      }
    }

    return {
      CallExpression: checkStylexCreate,
    };
  },
};

function shouldRequireParentPrefix(entry) {
  if (!entry.parent) return false;
  if (!entry.parent.parent) return false;
  return true;
}

function getOwningStatement(node) {
  let current = node;
  while (current.parent && current.parent.type !== 'Program') {
    current = current.parent;
  }
  return current;
}
