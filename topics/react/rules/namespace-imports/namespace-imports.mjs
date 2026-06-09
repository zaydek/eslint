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
      namespaceOnly:
        'Import `{{source}}` as a namespace: `import * as {{expected}} from "{{source}}"`.',
      canonicalName: 'The `{{source}}` namespace should be named `{{expected}}`, not `{{actual}}`.',
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
