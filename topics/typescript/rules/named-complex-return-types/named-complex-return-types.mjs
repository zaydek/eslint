import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

function getReturnTypeNode(node) {
  return node.returnType?.typeAnnotation ?? null;
}

function isInlineObjectReturn(typeNode) {
  return typeNode?.type === "TSTypeLiteral";
}

export const namedComplexReturnTypesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require named return types for functions that return object shapes." },
    messages: {
      namedReturn: createRuleMessage(
        "Function `{{name}}` returns an inline object type.",
        "Create a named return type and use it as the function return annotation.",
        "named-complex-return-types",
      ),
    },
    schema: [],
  },

  create(context) {
    function checkFunction(node, name) {
      const returnTypeNode = getReturnTypeNode(node);
      if (!isInlineObjectReturn(returnTypeNode)) return;
      context.report({ node: returnTypeNode, messageId: "namedReturn", data: { name } });
    }

    return {
      FunctionDeclaration(node) {
        const name = node.id?.name ?? "<anonymous>";
        checkFunction(node, name);
      },

      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        if (
          node.init?.type !== "ArrowFunctionExpression" &&
          node.init?.type !== "FunctionExpression"
        )
          return;
        checkFunction(node.init, node.id.name);
      },
    };
  },
};
