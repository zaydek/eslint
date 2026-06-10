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
      // `getCommentsBefore` only returns comments between the previous token and
      // this member, so the last one being a JSDoc block means it documents this
      // member -- a blank line between the comment and the member does not change
      // that, and requiring strict line adjacency was a false positive.
      const comments = sourceCode.getCommentsBefore(node);
      const comment = comments.at(-1);
      return isJSDocBlockComment(comment);
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
