import {
  getOwnershipComment,
  getStylexCreateKeys,
  getStylexCreateObject,
  parseOwnershipComment,
} from '../../../../lib/stylex-ownership.mjs';
import { inferStylexOwnership } from '../../../../lib/stylex-ownership-infer.mjs';

export const stylexOwnershipCommentRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require StyleX ownership comments to account for every stylex.create key.',
    },
    messages: {
      missingComment: '`stylex.create` needs a directly preceding ownership contract comment.',
      missingKey: '`{{key}}` is missing from the StyleX ownership comment.',
      missingRootSeparator:
        'StyleX ownership comments should separate major root-level regions with an empty `//` row.',
      missingSeparator: 'Line-style StyleX ownership comments should end with an empty `//` separator.',
      unknownKey: '`{{key}}` is listed in the StyleX ownership comment but is not a stylex.create key.',
      oddIndent: 'StyleX ownership comment indentation should use two-space levels.',
      wrongParent:
        '`{{key}}` is nested under `{{commentParent}}` in the comment but under `{{actualParent}}` in JSX.',
      falseSameElement:
        '`{{key}}` is comma-composed with `{{peer}}` in the comment, but JSX applies them to different elements.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function checkStylexCreate(node) {
      const objectNode = getStylexCreateObject(node);
      if (!objectNode) return;

      const statementNode = getOwningStatement(node);
      const comment = getOwnershipComment(sourceCode, statementNode);
      if (!comment) {
        context.report({ node, messageId: 'missingComment' });
        return;
      }

      if (comment.type === 'LineBlock' && comment.value.split('\n').at(-1).trim() !== '') {
        context.report({ loc: comment.loc, messageId: 'missingSeparator' });
      }

      const styleKeys = new Set(getStylexCreateKeys(objectNode));
      const ownership = parseOwnershipComment(comment);

      for (const error of ownership.errors) {
        context.report({ loc: comment.loc, messageId: error.messageId });
      }

      for (const key of styleKeys) {
        if (!ownership.keys.has(key)) {
          context.report({ node: objectNode, messageId: 'missingKey', data: { key } });
        }
      }

      for (const key of ownership.keys) {
        if (!styleKeys.has(key)) {
          context.report({ loc: comment.loc, messageId: 'unknownKey', data: { key } });
        }
      }

      checkOwnershipFidelity(context, sourceCode, node, comment, ownership);
    }

    return {
      CallExpression: checkStylexCreate,
    };
  },
};

function checkOwnershipFidelity(context, sourceCode, createCallNode, comment, ownership) {
  const inferred = inferStylexOwnership(sourceCode, createCallNode);
  const commentEntriesByKey = new Map(ownership.entries.map((entry) => [entry.key, entry]));

  for (const [key, commentEntry] of commentEntriesByKey) {
    const inferredEntry = inferred.entriesByKey.get(key);
    if (!inferredEntry) continue;

    const commentParent = commentEntry.parent?.key ?? null;
    const actualParent = inferredEntry.parentKey ?? null;
    if (commentParent === actualParent) continue;

    context.report({
      loc: comment.loc,
      messageId: 'wrongParent',
      data: {
        key,
        commentParent: commentParent ?? '<root>',
        actualParent: actualParent ?? '<root>',
      },
    });
  }

  const commentGroups = getEntriesByGroup(ownership.entries);

  for (const entries of commentGroups.values()) {
    const resolvedEntries = entries.flatMap((entry) => {
      const inferredEntry = inferred.entriesByKey.get(entry.key);
      return inferredEntry ? [{ commentEntry: entry, inferredEntry }] : [];
    });
    const firstEntry = resolvedEntries[0];
    if (!firstEntry) continue;

    for (const resolvedEntry of resolvedEntries.slice(1)) {
      if (firstEntry.inferredEntry.groupId === resolvedEntry.inferredEntry.groupId) continue;

      context.report({
        loc: comment.loc,
        messageId: 'falseSameElement',
        data: {
          key: firstEntry.commentEntry.key,
          peer: resolvedEntry.commentEntry.key,
        },
      });
      break;
    }
  }
}

function getEntriesByGroup(entries) {
  const groups = new Map();

  for (const entry of entries) {
    if (!groups.has(entry.groupId)) groups.set(entry.groupId, []);
    groups.get(entry.groupId).push(entry);
  }

  return groups;
}

function getOwningStatement(node) {
  let current = node;
  while (current.parent && current.parent.type !== 'Program') {
    current = current.parent;
  }
  return current;
}
