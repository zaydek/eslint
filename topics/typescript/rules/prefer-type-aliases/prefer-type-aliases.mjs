import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const preferTypeAliasesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Prefer type aliases over interface declarations." },
    messages: {
      preferType: createRuleMessage(
        "Interface `{{name}}` should be a type alias.",
        "Use `type {{name}} = { ... }`; keep `interface` only for ambient declaration merging surfaces such as `declare global`.",
        "prefer-type-aliases",
      ),
    },
    schema: [],
  },

  create(context) {
    function isAmbientInterface(node) {
      let current = node.parent;

      while (current) {
        if (
          current.type === "TSModuleDeclaration" &&
          (current.declare || current.global || current.id?.name === "global")
        ) {
          return true;
        }

        if (current.type === "Program") return false;
        current = current.parent;
      }

      return false;
    }

    return {
      TSInterfaceDeclaration(node) {
        if (isAmbientInterface(node)) return;
        context.report({ node: node.id, messageId: "preferType", data: { name: node.id.name } });
      },
    };
  },
};
