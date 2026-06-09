export const enumKindSuffixRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `Kind`-suffixed enum names over the legacy `Type` suffix.',
    },
    messages: {
      kindSuffix:
        'Enum `{{name}}` should end in `Kind`, not `Type`; `kind` is the canonical discriminant vocabulary.',
    },
    schema: [],
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const name = node.id.name;
        if (!/Type$/.test(name)) return;
        context.report({ node: node.id, messageId: 'kindSuffix', data: { name } });
      },
    };
  },
};
