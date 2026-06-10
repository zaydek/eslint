import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const useNewNamingRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require hooks that construct and return fresh state bundles to use the `useNew` prefix.",
    },
    messages: {
      useNewPrefix: createRuleMessage(
        "Hook `{{name}}` constructs and returns fresh state but is not named `{{expected}}`.",
        "Rename the hook to `{{expected}}` to mark it as a constructor hook.",
        "use-new-naming",
      ),
    },
    schema: [],
  },

  create(context) {
    function checkFunction(node, name) {
      if (!/^use[A-Z]/.test(name) || /^useNew[A-Z]/.test(name)) return;
      if (node.body?.type !== "BlockStatement") return;

      const stateBindings = collectStateBindings(node.body);
      if (stateBindings.size === 0) return;

      const returnsBindings = node.body.body.some(
        (statement) =>
          statement.type === "ReturnStatement" &&
          statement.argument?.type === "ObjectExpression" &&
          statement.argument.properties.some(
            (property) =>
              property.type === "Property" &&
              property.value.type === "Identifier" &&
              stateBindings.has(property.value.name),
          ),
      );
      if (!returnsBindings) return;

      context.report({
        node,
        messageId: "useNewPrefix",
        data: { name, expected: `useNew${name.slice(3)}` },
      });
    }

    return {
      FunctionDeclaration(node) {
        if (node.id) checkFunction(node, node.id.name);
      },
      VariableDeclarator(node) {
        if (
          node.id.type === "Identifier" &&
          (node.init?.type === "ArrowFunctionExpression" ||
            node.init?.type === "FunctionExpression")
        ) {
          checkFunction(node.init, node.id.name);
        }
      },
    };
  },
};

function collectStateBindings(blockStatement) {
  const bindings = new Set();

  for (const statement of blockStatement.body) {
    if (statement.type !== "VariableDeclaration") continue;
    for (const declarator of statement.declarations) {
      if (declarator.id.type !== "ArrayPattern" || !isStateHookCall(declarator.init)) continue;
      for (const element of declarator.id.elements) {
        if (element?.type === "Identifier") bindings.add(element.name);
      }
    }
  }

  return bindings;
}

function isStateHookCall(node) {
  if (node?.type !== "CallExpression") return false;
  const callee = node.callee;
  if (callee.type === "Identifier") {
    return callee.name === "useState" || callee.name === "useReducer";
  }
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    (callee.property.name === "useState" || callee.property.name === "useReducer")
  );
}
