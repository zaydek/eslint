import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
const BAD_SEGMENTS = new Map([
  ['cfg', 'configuration'],
  ['config', 'configuration'],
  ['doc', 'document'],
  ['evt', 'event'],
  ['tkt', 'ticket'],
]);

function getIdentifierSegments(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());
}

function getBadSegment(name) {
  for (const segment of getIdentifierSegments(name)) {
    if (BAD_SEGMENTS.has(segment)) return segment;
  }
  return null;
}

function isAllowedTinyCallbackName(node) {
  if (node.name.length !== 1) return false;
  const parent = node.parent;
  if (parent?.type !== 'ArrowFunctionExpression' && parent?.type !== 'FunctionExpression') return false;
  return parent.params.includes(node);
}

export const noConcisionNamesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer full words over terse abbreviation segments in identifiers.',
    },
    messages: {
      noConcision: createRuleMessage(
        'Identifier `{{name}}` uses terse segment `{{segment}}`.',
        'Replace `{{segment}}` with `{{replacement}}`.',
        'no-concision-names',
      ),
    },
    schema: [],
  },

  create(context) {
    function checkIdentifier(node) {
      if (isAllowedTinyCallbackName(node)) return;
      const segment = getBadSegment(node.name);
      if (!segment) return;
      context.report({
        node,
        messageId: 'noConcision',
        data: {
          name: node.name,
          segment,
          replacement: BAD_SEGMENTS.get(segment),
        },
      });
    }

    return {
      Identifier(node) {
        checkIdentifier(node);
      },
    };
  },
};
