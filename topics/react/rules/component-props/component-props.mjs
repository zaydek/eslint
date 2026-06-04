const COMPONENT_NAME = /^[A-Z][A-Za-z0-9]*$/;

export const componentPropsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require component props to use a named ComponentNameProps type.',
    },
    messages: {
      namedType: 'Component `{{name}}` should use a named ComponentNameProps type.',
    },
    schema: [],
  },

  create(context) {
    function getParamTypeNode(param) {
      return param?.typeAnnotation?.typeAnnotation ?? null;
    }

    function isInlineObjectType(typeNode) {
      return typeNode?.type === 'TSTypeLiteral';
    }

    function isNamedPropsType(typeNode) {
      return typeNode?.type === 'TSTypeReference' && typeNode.typeName?.type === 'Identifier';
    }

    return {
      FunctionDeclaration(node) {
        const name = node.id?.name;
        if (!name || !COMPONENT_NAME.test(name)) return;

        const firstParam = node.params[0];
        if (!firstParam) return;

        const typeNode = getParamTypeNode(firstParam);
        if (isInlineObjectType(typeNode)) {
          context.report({ node: firstParam, messageId: 'namedType', data: { name } });
        }

        if (firstParam.type === 'ObjectPattern' && (!typeNode || !isNamedPropsType(typeNode))) {
          context.report({ node: firstParam, messageId: 'namedType', data: { name } });
        }
      },
    };
  },
};
