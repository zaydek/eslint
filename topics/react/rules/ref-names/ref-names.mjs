import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const refNamesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require useRef bindings to end with Ref." },
    messages: {
      refSuffix: createRuleMessage(
        "`useRef` binding `{{name}}` must end with `Ref`.",
        "Rename the binding to `{{expected}}`.",
        "ref-names",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        if (!isUseRefCall(node.init)) return;
        if (node.id.name.endsWith("Ref")) return;

        context.report({
          node: node.id,
          messageId: "refSuffix",
          data: { name: node.id.name, expected: `${node.id.name}Ref` },
        });
      },
    };
  },
};

function isUseRefCall(node) {
  if (node?.type !== "CallExpression") return false;
  const callee = node.callee;
  if (callee.type === "Identifier") return callee.name === "useRef";
  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "useRef"
  );
}
