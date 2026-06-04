export const reducerDispatchNamesRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require useReducer dispatch variables to be named dispatchThing.',
    },
    messages: {
      dispatchName: 'Reducer dispatch `{{actual}}` should be named `{{expected}}`.',
    },
    schema: [],
  },

  create(context) {
    function getExpectedDispatchName(stateName) {
      return `dispatch${stateName[0].toUpperCase()}${stateName.slice(1)}`;
    }

    return {
      VariableDeclarator(node) {
        if (node.init?.type !== 'CallExpression') return;
        if (node.init.callee.type !== 'Identifier' || node.init.callee.name !== 'useReducer') return;
        if (node.id.type !== 'ArrayPattern') return;

        const stateNode = node.id.elements[0];
        const dispatchNode = node.id.elements[1];
        if (stateNode?.type !== 'Identifier' || dispatchNode?.type !== 'Identifier') return;

        const expected = getExpectedDispatchName(stateNode.name);
        if (dispatchNode.name !== expected) {
          context.report({
            node: dispatchNode,
            messageId: 'dispatchName',
            data: { actual: dispatchNode.name, expected },
          });
        }
      },
    };
  },
};
