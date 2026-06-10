import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const enumMemberValuesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require every enum member to carry an explicit string initializer." },
    messages: {
      stringValue: createRuleMessage(
        "Enum member `{{name}}` has no explicit string initializer.",
        "Add an explicit stable string value so serialization and reordering stay safe.",
        "enum-member-values",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const members = node.body?.members ?? node.members ?? [];
        for (const member of members) {
          if (
            member.initializer?.type === "Literal" &&
            typeof member.initializer.value === "string"
          ) {
            continue;
          }
          context.report({
            node: member,
            messageId: "stringValue",
            data: { name: getMemberName(member) },
          });
        }
      },
    };
  },
};

function getMemberName(member) {
  if (member.id.type === "Identifier") return member.id.name;
  if (member.id.type === "Literal") return String(member.id.value);
  return "<unknown>";
}
