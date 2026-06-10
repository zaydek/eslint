import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const reducerDispatchNamesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require useReducer dispatch variables to be named dispatchThing." },
    messages: {
      dispatchName: createRuleMessage(
        "Reducer dispatch is named `{{actual}}` instead of `{{expected}}`.",
        "Rename the dispatch binding to `{{expected}}`.",
        "reducer-dispatch-names",
      ),
    },
    schema: [],
  },

  create(context) {
    function getExpectedDispatchName(stateName) {
      return `dispatch${stateName[0].toUpperCase()}${stateName.slice(1)}`;
    }

    return {
      VariableDeclarator(node) {
        if (!isUseReducerCall(node.init)) return;
        if (node.id.type !== "ArrayPattern") return;

        const stateNode = node.id.elements[0];
        const dispatchNode = node.id.elements[1];
        if (stateNode?.type !== "Identifier" || dispatchNode?.type !== "Identifier") return;

        const expected = getExpectedDispatchName(stateNode.name);
        if (dispatchNode.name !== expected) {
          context.report({
            node: dispatchNode,
            messageId: "dispatchName",
            data: { actual: dispatchNode.name, expected },
          });
        }
      },
    };
  },
};

function isUseReducerCall(node) {
  if (node?.type !== "CallExpression") return false;
  const callee = node.callee;
  if (callee.type === "Identifier") return callee.name === "useReducer";
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "useReducer"
  );
}
