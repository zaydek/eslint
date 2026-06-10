import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

function getTypeMemberName(node) {
  if (node.key?.type === "Identifier") return node.key.name;
  if (node.key?.type === "Literal") return String(node.key.value);
  return "member";
}

function isJSDocBlockComment(comment) {
  return comment?.type === "Block" && comment.value.trimStart().startsWith("*");
}

export const articulatedObjectContractsRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require object contract members to carry explanatory comments." },
    messages: {
      missingComment: createRuleMessage(
        "Object contract member `{{name}}` has no leading JSDoc comment.",
        "Add a concise JSDoc comment explaining the member contract.",
        "articulated-object-contracts",
      ),
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function hasLeadingJSDocComment(node) {
      const comments = sourceCode.getCommentsBefore(node);
      const comment = comments.at(-1);
      if (!isJSDocBlockComment(comment)) return false;
      return comment.loc.end.line >= node.loc.start.line - 1;
    }

    function checkMember(node) {
      if (node.type !== "TSPropertySignature" && node.type !== "TSMethodSignature") return;
      if (hasLeadingJSDocComment(node)) return;
      context.report({
        node,
        messageId: "missingComment",
        data: { name: getTypeMemberName(node) },
      });
    }

    function checkMembers(members) {
      for (const member of members) {
        checkMember(member);
        checkTypeNode(member.typeAnnotation?.typeAnnotation);
      }
    }

    function checkTypeNode(node) {
      if (!node) return;

      if (node.type === "TSTypeLiteral") {
        checkMembers(node.members);
        return;
      }

      if (node.type === "TSIntersectionType" || node.type === "TSUnionType") {
        for (const typeNode of node.types) {
          checkTypeNode(typeNode);
        }
      }
    }

    return {
      TSTypeAliasDeclaration(node) {
        checkTypeNode(node.typeAnnotation);
      },

      TSInterfaceDeclaration(node) {
        checkMembers(node.body.body);
      },
    };
  },
};
