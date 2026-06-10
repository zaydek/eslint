import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";
import {
  getOwnershipComment,
  getStylexCreateKeys,
  getStylexCreateObject,
  parseOwnershipComment,
} from "../../lib/ownership.mjs";
import { inferStylexOwnership } from "../../lib/ownership-infer.mjs";

export const stylexOwnershipCommentRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require StyleX ownership comments to account for every stylex.create key.",
    },
    messages: {
      missingComment: createRuleMessage(
        "`stylex.create` has no directly preceding ownership contract comment.",
        "Add a StyleX ownership comment immediately above `stylex.create`.",
        "stylex-ownership-comment",
      ),
      missingKey: createRuleMessage(
        "StyleX key `{{key}}` exists in `stylex.create` but is missing from the ownership comment.",
        "Add `{{key}}` to the ownership contract or remove the style key.",
        "stylex-ownership-comment",
      ),
      unknownKey: createRuleMessage(
        "Ownership comment declares `{{key}}` but `stylex.create` does not define it.",
        "Add `{{key}}` to `stylex.create` or remove it from the ownership contract.",
        "stylex-ownership-comment",
      ),
      invalidLine: createRuleMessage(
        "Ownership comment contains a line that is not valid ownership syntax.",
        "Rewrite the line using a structural key, a dynamic function key, or a valid modifier block.",
        "stylex-ownership-comment",
      ),
      oddIndent: createRuleMessage(
        "Ownership comment indentation is not a multiple of two spaces.",
        "Use two spaces per ownership depth level.",
        "stylex-ownership-comment",
      ),
      invalidKey: createRuleMessage(
        "Ownership key is not a valid PascalCase StyleX key.",
        "Use a PascalCase structural key or dynamic key.",
        "stylex-ownership-comment",
      ),
      invalidDynamicArgs: createRuleMessage(
        "Ownership dynamic style arguments are not valid typed parameters.",
        "Write dynamic keys as `Key(name<type>)` with comma-separated typed parameters.",
        "stylex-ownership-comment",
      ),
      invalidModifierBlock: createRuleMessage(
        "Ownership modifier block is not valid.",
        "Use `Key{Is{A|B}}`, `Key?{IsSelected}`, or `Key{With{A|B}}, ?{IsSelected}`.",
        "stylex-ownership-comment",
      ),
      missingOptionalSeparator: createRuleMessage(
        "Required and optional ownership modifier blocks are adjacent without the required comma separator.",
        "Write required axes first, then `, ?{...}` for optional axes.",
        "stylex-ownership-comment",
      ),
      bareOptionalElement: createRuleMessage(
        "Ownership key uses `?` without an optional modifier block.",
        "Write `Key?{IsSelected}` or remove the `?`.",
        "stylex-ownership-comment",
      ),
      optionalFirstOrder: createRuleMessage(
        "Ownership modifier blocks put optional modifiers before required modifiers.",
        "Write required modifier blocks first, then optional modifiers as `, ?{...}`.",
        "stylex-ownership-comment",
      ),
      inlineProse: createRuleMessage(
        "Ownership comment line contains inline prose after a key.",
        "Move prose outside the ownership contract or express the line as valid ownership syntax.",
        "stylex-ownership-comment",
      ),
      invalidAxis: createRuleMessage(
        "Ownership modifier axis is not valid.",
        "Write grouped axes as `Is{A|B}`, `Has{A|B}`, or `With{A|B}` with PascalCase values.",
        "stylex-ownership-comment",
      ),
      markerOptional: createRuleMessage(
        "Ownership modifier axis marks the marker itself optional.",
        "Use `Key?{Is{A|B}}` for optional grouped axes; do not write `Is?{A|B}`.",
        "stylex-ownership-comment",
      ),
      singleValueUnion: createRuleMessage(
        "Ownership required modifier axis has only one value.",
        "Use at least two values for a required union axis or model one boolean flag as optional.",
        "stylex-ownership-comment",
      ),
      requiredBoolean: createRuleMessage(
        "Ownership required modifier axis is written as a single boolean flag.",
        "Move boolean flags into an optional block such as `Key?{IsSelected}`.",
        "stylex-ownership-comment",
      ),
      invalidAxisValue: createRuleMessage(
        "Ownership modifier axis contains an invalid value.",
        "Use PascalCase values and separate multiple values with `|`.",
        "stylex-ownership-comment",
      ),
      trailingOptional: createRuleMessage(
        "Ownership optional marker `?` is in the wrong position.",
        "Use `Foo?{IsSelected}` for optional-only or `Foo{With{A|B}}, ?{IsSelected}` after required axes.",
        "stylex-ownership-comment",
      ),
      missingRootSeparator: createRuleMessage(
        "Ownership roots are not separated by a blank `//` line.",
        "Insert a blank ownership comment line between root trees.",
        "stylex-ownership-comment",
      ),
      missingSeparator: createRuleMessage(
        "Line-style StyleX ownership comment does not end with an empty `//` separator line.",
        "Add a blank `//` line immediately before `stylex.create`.",
        "stylex-ownership-comment",
      ),
      wrongParent: createRuleMessage(
        "Rendered StyleX key `{{key}}` appears under `{{actualParent}}` but ownership declares it under `{{commentParent}}`.",
        "Move the rendered element, update the ownership indentation, or split the component at the structural boundary.",
        "stylex-ownership-comment",
      ),
      falseSameElement: createRuleMessage(
        "StyleX keys share one ownership line but JSX applies them to different elements.",
        "Apply child styles to a child element or collapse the key into the owner contract.",
        "stylex-ownership-comment",
      ),
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
        context.report({ node, messageId: "missingComment" });
        return;
      }

      if (comment.type === "LineBlock" && comment.value.split("\n").at(-1).trim() !== "") {
        context.report({ loc: comment.loc, messageId: "missingSeparator" });
      }

      const styleKeys = new Set(getStylexCreateKeys(objectNode));
      const ownership = parseOwnershipComment(comment);

      for (const error of ownership.errors) {
        context.report({
          loc: comment.loc,
          messageId: error.messageId,
          data: { example: "Key?{IsSelected}" },
        });
      }

      for (const key of styleKeys) {
        if (!ownership.keys.has(key)) {
          context.report({ node: objectNode, messageId: "missingKey", data: { key } });
        }
      }

      for (const key of ownership.keys) {
        if (!styleKeys.has(key)) {
          context.report({ loc: comment.loc, messageId: "unknownKey", data: { key } });
        }
      }

      checkOwnershipFidelity(context, sourceCode, node, comment, ownership);
    }

    return { CallExpression: checkStylexCreate };
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
      messageId: "wrongParent",
      data: {
        key,
        commentParent: commentParent ?? "<root>",
        actualParent: actualParent ?? "<root>",
      },
    });
  }

  const commentGroups = getEntriesByGroup(ownership.entries.filter((entry) => !entry.isExpansion));

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
        messageId: "falseSameElement",
        data: { key: firstEntry.commentEntry.key, peer: resolvedEntry.commentEntry.key },
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
  while (current.parent && current.parent.type !== "Program") {
    current = current.parent;
  }
  return current;
}
