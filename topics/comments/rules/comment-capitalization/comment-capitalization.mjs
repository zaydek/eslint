import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";
import { getOwnershipComment, getStylexCreateObject } from "../../../stylex/lib/ownership.mjs";

const DIRECTIVE_COMMENT = /^(eslint|@ts-|prettier|biome|stylelint)-/;
const TRIPLE_SLASH_DIRECTIVE = /^\//;
const REFERENCE_DIRECTIVE = /^<reference\b/;

export const commentCapitalizationRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require the first word of each comment block to start uppercase." },
    messages: {
      uppercase: createRuleMessage(
        "Comment should start like a sentence, with an uppercase first word.",
        "Capitalize the first meaningful word or use a recognized directive/comment form.",
        "comment-capitalization",
      ),
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const stylexOwnershipCommentRanges = [];

    function isDirectiveComment(comment, text) {
      if (DIRECTIVE_COMMENT.test(text)) return true;
      if (comment.type !== "Line") return false;
      return TRIPLE_SLASH_DIRECTIVE.test(text) || REFERENCE_DIRECTIVE.test(text);
    }

    function getFirstMeaningfulCharacter(comment) {
      const text = comment.value
        .split("\n")
        .map((line) => line.trim().replace(/^\*\s?/, ""))
        .join("\n")
        .trim();

      if (isDirectiveComment(comment, text)) return null;

      const match = text.match(/[A-Za-z]/);
      if (!match) return null;
      return match[0];
    }

    function rememberStylexOwnershipComment(node) {
      const objectNode = getStylexCreateObject(node);
      if (!objectNode) return;

      const statementNode = getOwningStatement(node);
      const comment = getOwnershipComment(sourceCode, statementNode);
      if (!comment) return;

      stylexOwnershipCommentRanges.push(comment.range);
    }

    function isStylexOwnershipComment(comment) {
      return stylexOwnershipCommentRanges.some(
        (range) => comment.range[0] >= range[0] && comment.range[1] <= range[1],
      );
    }

    return {
      CallExpression: rememberStylexOwnershipComment,
      "Program:exit"() {
        const comments = sourceCode.getAllComments();
        let previousLineComment = null;

        for (const comment of comments) {
          const isContinuedLineComment =
            comment.type === "Line" &&
            previousLineComment &&
            previousLineComment.loc.end.line + 1 === comment.loc.start.line;

          if (comment.type !== "Line") previousLineComment = null;
          if (isContinuedLineComment) {
            previousLineComment = comment;
            continue;
          }
          if (isStylexOwnershipComment(comment)) {
            previousLineComment = comment.type === "Line" ? comment : null;
            continue;
          }

          const firstCharacter = getFirstMeaningfulCharacter(comment);
          if (firstCharacter && firstCharacter.toLowerCase() === firstCharacter) {
            context.report({ loc: comment.loc.start, messageId: "uppercase" });
          }

          previousLineComment = comment.type === "Line" ? comment : null;
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
