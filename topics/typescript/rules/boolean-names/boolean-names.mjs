import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

const BOOLEAN_PREFIX = /^(is|has|can|should|are)[A-Z]/;

export const booleanNamesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require predicate-style names for local boolean state and variables." },
    messages: {
      prefix: createRuleMessage(
        "Boolean name `{{name}}` must start with `is`, `has`, `can`, `should`, or `are`.",
        "Rename it to use an allowed boolean prefix or document a valid exception.",
        "boolean-names",
      ),
    },
    schema: [],
  },

  create(context) {
    function reportName(node, name) {
      if (BOOLEAN_PREFIX.test(name)) return;
      context.report({ node, messageId: "prefix", data: { name } });
    }

    function isBooleanInitializer(node) {
      if (!node) return false;
      if (node.type === "Literal" && typeof node.value === "boolean") return true;
      if (
        node.type === "CallExpression" &&
        isUseStateCall(node) &&
        node.arguments[0]?.type === "Literal" &&
        typeof node.arguments[0].value === "boolean"
      ) {
        return true;
      }
      return false;
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier") {
          if (isBooleanInitializer(node.init)) reportName(node.id, node.id.name);
          return;
        }

        if (
          node.id.type === "ArrayPattern" &&
          node.id.elements[0]?.type === "Identifier" &&
          isBooleanInitializer(node.init)
        ) {
          reportName(node.id.elements[0], node.id.elements[0].name);
        }
      },
    };
  },
};

function isUseStateCall(node) {
  const callee = node.callee;
  if (callee.type === "Identifier") return callee.name === "useState";
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "useState"
  );
}
