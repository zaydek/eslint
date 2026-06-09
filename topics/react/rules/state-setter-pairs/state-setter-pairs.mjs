export const stateSetterPairsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require `useState` destructuring to use exact `[thing, setThing]` pairs.',
    },
    messages: {
      setterName: '`useState` setter for `{{name}}` should be named `{{expected}}`, not `{{actual}}`.',
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'ArrayPattern' || !isUseStateCall(node.init)) return;

        const [stateElement, setterElement] = node.id.elements;
        if (stateElement?.type !== 'Identifier' || setterElement?.type !== 'Identifier') return;

        const name = stateElement.name;
        const expected = `set${name[0].toUpperCase()}${name.slice(1)}`;
        if (setterElement.name === expected) return;

        context.report({
          node: setterElement,
          messageId: 'setterName',
          data: { name, expected, actual: setterElement.name },
        });
      },
    };
  },
};

function isUseStateCall(node) {
  if (node?.type !== 'CallExpression') return false;
  const callee = node.callee;
  if (callee.type === 'Identifier') return callee.name === 'useState';
  return (
    callee.type === 'MemberExpression' &&
    !callee.computed &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'React' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'useState'
  );
}
