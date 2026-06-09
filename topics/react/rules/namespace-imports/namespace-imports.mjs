import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
const MapModuleToCanonicalName = {
  react: 'React',
  '@stylexjs/stylex': 'stylex',
};

export const namespaceImportsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `react` and `@stylexjs/stylex` to be imported as canonical namespaces.',
    },
    messages: {
      namespaceOnly: createRuleMessage(
        'Module `{{source}}` is not imported as its canonical namespace.',
        'Use `import * as {{expected}} from "{{source}}"`.',
        'namespace-imports',
      ),
      canonicalName: createRuleMessage(
        'Module `{{source}}` namespace is named `{{actual}}` instead of `{{expected}}`.',
        'Rename the namespace import to `{{expected}}`.',
        'namespace-imports',
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const expected = MapModuleToCanonicalName[node.source.value];
        if (expected === undefined) return;
        if (node.importKind === 'type') return;

        const [specifier] = node.specifiers;
        if (node.specifiers.length !== 1 || specifier.type !== 'ImportNamespaceSpecifier') {
          context.report({
            node,
            messageId: 'namespaceOnly',
            data: { source: node.source.value, expected },
          });
          return;
        }

        if (specifier.local.name !== expected) {
          context.report({
            node: specifier.local,
            messageId: 'canonicalName',
            data: { source: node.source.value, expected, actual: specifier.local.name },
          });
        }
      },
    };
  },
};
