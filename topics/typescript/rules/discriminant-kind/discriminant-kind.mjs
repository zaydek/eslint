import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

function getPropertyName(node) {
  if (node.key?.type === "Identifier") return node.key.name;
  if (node.key?.type === "Literal") return String(node.key.value);
  return null;
}

function isStringLiteralType(typeNode) {
  return typeNode?.type === "TSLiteralType" && typeof typeNode.literal?.value === "string";
}

function isStringLiteralUnion(typeNode) {
  return typeNode?.type === "TSUnionType" && typeNode.types.some(isStringLiteralType);
}

export const discriminantKindRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer kind as the canonical discriminant key for string variant types.",
    },
    messages: {
      useKind: createRuleMessage(
        "String discriminant uses `type` instead of `kind`.",
        "Rename the discriminant property to `kind`.",
        "discriminant-kind",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      TSPropertySignature(node) {
        if (getPropertyName(node) !== "type") return;
        const typeNode = node.typeAnnotation?.typeAnnotation;
        if (!isStringLiteralType(typeNode) && !isStringLiteralUnion(typeNode)) return;
        context.report({ node: node.key, messageId: "useKind" });
      },
    };
  },
};
