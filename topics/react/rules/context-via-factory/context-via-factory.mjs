export const contextViaFactoryRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require contexts to be created through `newGenericContext` with an aligned debug name.',
    },
    messages: {
      useFactory:
        'Create contexts with `newGenericContext` so consumers get a throwing `useContext` for free.',
      contextSuffix: 'Context binding `{{name}}` should be named `{Thing}Context`.',
      debugName:
        'The `newGenericContext` debug identifier should match the binding: expected `{{expected}}`, got `{{actual}}`.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename();
    const isFactoryModule = /new-generic-context/.test(filename);

    return {
      CallExpression(node) {
        if (isCreateContextCall(node) && !isFactoryModule) {
          context.report({ node, messageId: 'useFactory' });
          return;
        }

        if (node.callee.type !== 'Identifier' || node.callee.name !== 'newGenericContext') return;
        if (node.parent?.type !== 'VariableDeclarator' || node.parent.id.type !== 'Identifier') {
          return;
        }

        const bindingName = node.parent.id.name;
        if (!/Context$/.test(bindingName)) {
          context.report({
            node: node.parent.id,
            messageId: 'contextSuffix',
            data: { name: bindingName },
          });
        }

        const debugArgument = node.arguments[0];
        if (
          debugArgument?.type === 'Literal' &&
          typeof debugArgument.value === 'string' &&
          debugArgument.value !== bindingName
        ) {
          context.report({
            node: debugArgument,
            messageId: 'debugName',
            data: { expected: bindingName, actual: debugArgument.value },
          });
        }
      },
    };
  },
};

function isCreateContextCall(node) {
  if (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'React' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'createContext'
  ) {
    return true;
  }
  return node.callee.type === 'Identifier' && node.callee.name === 'createContext';
}
