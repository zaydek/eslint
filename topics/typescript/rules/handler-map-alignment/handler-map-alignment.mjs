import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
const HANDLER_MAP_NAME_PATTERN = /^Map\w+ToHandler$/;

export const handlerMapAlignmentRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require handler map entries to reference `handle{Variant}` functions with no `any` in the map type.',
    },
    messages: {
      aligned: createRuleMessage(
        'Handler for `{{variant}}` is `{{actual}}` instead of `{{expected}}`.',
        'Rename or replace the handler value with `{{expected}}`.',
        'handler-map-alignment',
      ),
      noAny: createRuleMessage(
        'Handler map type annotation contains `any`.',
        'Use the named action/handler types for the reducer instead of `any`.',
        'handler-map-alignment',
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier' || !HANDLER_MAP_NAME_PATTERN.test(node.id.name)) return;

        if (node.id.typeAnnotation && containsAnyKeyword(node.id.typeAnnotation)) {
          context.report({ node: node.id.typeAnnotation, messageId: 'noAny' });
        }

        if (node.init?.type !== 'ObjectExpression') return;
        for (const property of node.init.properties) {
          if (property.type !== 'Property' || !property.computed) continue;
          if (
            property.key.type !== 'MemberExpression' ||
            property.key.property.type !== 'Identifier'
          ) {
            continue;
          }

          const variant = property.key.property.name;
          const expected = `handle${variant}`;
          const actual =
            property.value.type === 'Identifier' ? property.value.name : '<inline function>';
          if (actual === expected) continue;

          context.report({
            node: property.value,
            messageId: 'aligned',
            data: { variant, expected, actual },
          });
        }
      },
    };
  },
};

function containsAnyKeyword(node) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'TSAnyKeyword') return true;

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;
    if (Array.isArray(value)) {
      if (value.some((child) => containsAnyKeyword(child))) return true;
      continue;
    }
    if (containsAnyKeyword(value)) return true;
  }

  return false;
}
