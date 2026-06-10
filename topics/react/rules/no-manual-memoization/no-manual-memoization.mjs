import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

const BANNED_IDENTIFIERS = new Set(["memo", "useCallback", "useMemo"]);
const BANNED_REACT_MEMBERS = new Set(["memo", "useCallback", "useMemo"]);

export const noManualMemoizationRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow manual React memoization APIs in React Compiler code." },
    messages: {
      manualMemoization: createRuleMessage(
        "Manual React memoization API `{{name}}` is not allowed.",
        "Remove the manual memoization and let React Compiler handle stable identity and memoization.",
        "no-manual-memoization",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        const bannedName = getBannedCallName(node.callee);
        if (!bannedName) return;

        context.report({
          node: node.callee,
          messageId: "manualMemoization",
          data: { name: bannedName },
        });
      },
    };
  },
};

function getBannedCallName(callee) {
  if (callee.type === "Identifier" && BANNED_IDENTIFIERS.has(callee.name)) {
    return callee.name;
  }

  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier" &&
    BANNED_REACT_MEMBERS.has(callee.property.name)
  ) {
    return `React.${callee.property.name}`;
  }

  return null;
}
