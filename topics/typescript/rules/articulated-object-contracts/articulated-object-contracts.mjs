import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
const CONTRACT_TYPE_NAME = /(?:Props|Args|Return)(?:[A-Z0-9]|$)|(?:Options|Configuration)$/;

function getTypeMemberName(node) {
  if (node.key?.type === 'Identifier') return node.key.name;
  if (node.key?.type === 'Literal') return String(node.key.value);
  return 'member';
}

function isContractTypeName(name) {
  return CONTRACT_TYPE_NAME.test(name);
}

function isJSDocBlockComment(comment) {
  return comment?.type === 'Block' && comment.value.trimStart().startsWith('*');
}

export const articulatedObjectContractsRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require object contract members to carry explanatory comments.',
    },
    messages: {
      missingComment: createRuleMessage(
        'Object contract member `{{name}}` has no leading JSDoc comment.',
        'Add a concise JSDoc comment explaining the member contract.',
        'articulated-object-contracts',
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
      if (node.type !== 'TSPropertySignature' && node.type !== 'TSMethodSignature') return;
      if (hasLeadingJSDocComment(node)) return;
      context.report({
        node,
        messageId: 'missingComment',
        data: { name: getTypeMemberName(node) },
      });
    }

    function checkMembers(name, members) {
      if (!isContractTypeName(name)) return;
      for (const member of members) {
        checkMember(member);
      }
    }

    return {
      TSTypeAliasDeclaration(node) {
        if (node.typeAnnotation?.type !== 'TSTypeLiteral') return;
        checkMembers(node.id.name, node.typeAnnotation.members);
      },

      TSInterfaceDeclaration(node) {
        checkMembers(node.id.name, node.body.body);
      },
    };
  },
};
