export const enumMemberValuesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require every enum member to carry an explicit string initializer.',
    },
    messages: {
      stringValue:
        'Enum member `{{name}}` needs an explicit string initializer; auto-numbered members break serialization and reordering.',
    },
    schema: [],
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const members = node.body?.members ?? node.members ?? [];
        for (const member of members) {
          if (
            member.initializer?.type === 'Literal' &&
            typeof member.initializer.value === 'string'
          ) {
            continue;
          }
          context.report({
            node: member,
            messageId: 'stringValue',
            data: { name: getMemberName(member) },
          });
        }
      },
    };
  },
};

function getMemberName(member) {
  if (member.id.type === 'Identifier') return member.id.name;
  if (member.id.type === 'Literal') return String(member.id.value);
  return '<unknown>';
}
