import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const enumKindSuffixRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Prefer `Kind`-suffixed enum names over the legacy `Type` suffix." },
    messages: {
      kindSuffix: createRuleMessage(
        "Enum `{{name}}` uses `Type` where discriminant enums must use `Kind`.",
        "Rename the enum to end in `Kind`.",
        "enum-kind-suffix",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const name = node.id.name;
        if (!/Type$/.test(name)) return;
        context.report({ node: node.id, messageId: "kindSuffix", data: { name } });
      },
    };
  },
};
