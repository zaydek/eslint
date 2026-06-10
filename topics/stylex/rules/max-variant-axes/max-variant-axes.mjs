import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";
import {
  getOwnershipComment,
  getStylexCreateObject,
  parseOwnershipComment,
} from "../../lib/ownership.mjs";

const DEFAULT_MAX_AXES = 2;

export const maxVariantAxesRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Limit how many orthogonal variant families one styled element may accrue.",
    },
    messages: {
      tooManyAxes: createRuleMessage(
        "`{{owner}}` carries {{count}} variant families, which exceeds the configured max of {{max}}.",
        "Collapse an axis, split the element, or raise the rule option only when the larger matrix is intentional.",
        "max-variant-axes",
      ),
    },
    schema: [
      {
        type: "object",
        properties: { maxAxes: { type: "integer", minimum: 1 } },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const maxAxes = context.options[0]?.maxAxes ?? DEFAULT_MAX_AXES;
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      CallExpression(node) {
        if (!getStylexCreateObject(node)) return;

        const comment = getOwnershipComment(sourceCode, getOwningStatement(node));
        if (!comment) return;

        const ownership = parseOwnershipComment(comment);
        const familiesByLine = new Map();
        const ownersByLine = new Map();

        for (const entry of ownership.entries) {
          if (!ownersByLine.has(entry.groupId) && !entry.isExpansion) {
            ownersByLine.set(entry.groupId, entry.key);
          }
          if (!entry.isExpansion) continue;
          if (!familiesByLine.has(entry.groupId)) familiesByLine.set(entry.groupId, new Set());
          familiesByLine.get(entry.groupId).add(entry.baseKey);
        }

        for (const [line, families] of familiesByLine) {
          if (families.size <= maxAxes) continue;
          context.report({
            loc: comment.loc,
            messageId: "tooManyAxes",
            data: {
              owner: ownersByLine.get(line) ?? [...families][0],
              count: String(families.size),
              max: String(maxAxes),
            },
          });
        }
      },
    };
  },
};

function getOwningStatement(node) {
  let current = node;
  while (current.parent && current.parent.type !== "Program") {
    current = current.parent;
  }
  return current;
}
