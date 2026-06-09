const SCREAMING_SNAKE_PATTERN = /^[A-Z0-9]+(?:_[A-Z0-9]+)*$/;

export const enumValueCasingRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require enum string values to use SCREAMING_SNAKE_CASE.',
    },
    messages: {
      casing:
        'Enum value `{{value}}` should be SCREAMING_SNAKE_CASE; these values leak into logs and wire formats.',
    },
    schema: [],
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const members = node.body?.members ?? node.members ?? [];
        for (const member of members) {
          if (
            member.initializer?.type !== 'Literal' ||
            typeof member.initializer.value !== 'string'
          ) {
            continue;
          }
          if (SCREAMING_SNAKE_PATTERN.test(member.initializer.value)) continue;
          context.report({
            node: member.initializer,
            messageId: 'casing',
            data: { value: member.initializer.value },
          });
        }
      },
    };
  },
};
