export const resultShapeRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require exported `*Result` types to be `kind`-discriminated unions with closed error sets.',
    },
    messages: {
      memberNeedsKind:
        'Each variant of `{{name}}` should carry a `kind` discriminant so callers can switch exhaustively.',
      errorKindName:
        'The `error` payload of `{{name}}` should be a closed `*ErrorKind` enum, not `{{actual}}`.',
    },
    schema: [],
  },

  create(context) {
    return {
      TSTypeAliasDeclaration(node) {
        if (!/Result$/.test(node.id.name)) return;
        if (node.parent?.type !== 'ExportNamedDeclaration') return;

        const annotation = node.typeAnnotation;
        const memberTypes =
          annotation.type === 'TSUnionType'
            ? annotation.types
            : annotation.type === 'TSTypeLiteral'
              ? [annotation]
              : [];

        for (const memberType of memberTypes) {
          if (memberType.type !== 'TSTypeLiteral') continue;
          checkMember(context, node.id.name, memberType);
        }
      },
    };
  },
};

function checkMember(context, name, memberType) {
  const hasKind = memberType.members.some(
    (member) =>
      member.type === 'TSPropertySignature' &&
      member.key.type === 'Identifier' &&
      member.key.name === 'kind',
  );
  if (!hasKind) {
    context.report({ node: memberType, messageId: 'memberNeedsKind', data: { name } });
  }

  for (const member of memberType.members) {
    if (
      member.type !== 'TSPropertySignature' ||
      member.key.type !== 'Identifier' ||
      member.key.name !== 'error'
    ) {
      continue;
    }
    const errorType = member.typeAnnotation?.typeAnnotation;
    if (!errorType) {
      continue;
    }
    if (
      errorType.type === 'TSTypeReference' &&
      errorType.typeName.type === 'Identifier' &&
      /ErrorKind$/.test(errorType.typeName.name)
    ) {
      continue;
    }
    context.report({
      node: errorType,
      messageId: 'errorKindName',
      data: { name, actual: getTypeName(errorType) },
    });
  }
}

function getTypeName(typeNode) {
  if (
    typeNode.type === 'TSTypeReference' &&
    typeNode.typeName.type === 'Identifier'
  ) {
    return typeNode.typeName.name;
  }
  if (typeNode.type === 'TSStringKeyword') return 'string';
  if (typeNode.type === 'TSNumberKeyword') return 'number';
  if (typeNode.type === 'TSBooleanKeyword') return 'boolean';
  return typeNode.type;
}
