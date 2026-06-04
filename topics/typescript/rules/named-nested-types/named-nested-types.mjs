function getPropertyName(node) {
  if (node.key?.type === 'Identifier') return node.key.name;
  if (node.key?.type === 'Literal') return String(node.key.value);
  return 'property';
}

function getArrayElementType(typeNode) {
  if (typeNode?.type === 'TSArrayType') return typeNode.elementType;
  if (typeNode?.type !== 'TSTypeReference') return null;
  if (typeNode.typeName?.type !== 'Identifier' || typeNode.typeName.name !== 'Array') return null;
  return typeNode.typeArguments?.params?.[0] ?? null;
}

function isInlineObjectType(typeNode) {
  return typeNode?.type === 'TSTypeLiteral';
}

export const namedNestedTypesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require nested object member shapes to use named composed types.',
    },
    messages: {
      namedNested: 'Property `{{name}}` should use a named nested type instead of an inline object type.',
    },
    schema: [],
  },

  create(context) {
    function checkProperty(node) {
      const typeNode = node.typeAnnotation?.typeAnnotation;
      const arrayElementType = getArrayElementType(typeNode);
      if (!isInlineObjectType(typeNode) && !isInlineObjectType(arrayElementType)) return;
      context.report({
        node: typeNode,
        messageId: 'namedNested',
        data: { name: getPropertyName(node) },
      });
    }

    return {
      TSPropertySignature: checkProperty,
    };
  },
};
