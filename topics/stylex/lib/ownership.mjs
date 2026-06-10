import { parseOwnershipContract, splitTopLevel } from "./ownership-contract.mjs";

export function isStylexCreateCall(node) {
  return (
    node?.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier" &&
    node.callee.object.name === "stylex" &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "create"
  );
}

export function getStylexCreateObject(node) {
  if (!isStylexCreateCall(node)) return null;
  const firstArgument = node.arguments[0];
  return firstArgument?.type === "ObjectExpression" ? firstArgument : null;
}

export function getStylexCreateKeys(objectNode) {
  return objectNode.properties
    .filter((property) => property.type === "Property")
    .flatMap((property) => {
      if (property.key.type === "Identifier") return [property.key.name];
      if (property.key.type === "Literal" && typeof property.key.value === "string") {
        return [property.key.value];
      }
      return [];
    });
}

export function getOwnershipComment(sourceCode, statementNode) {
  const comments = sourceCode.getCommentsBefore(statementNode);
  const lastComment = comments.at(-1);
  if (!lastComment) return null;

  const between = sourceCode.text.slice(lastComment.range[1], statementNode.range[0]);
  if (between.trim() !== "") return null;

  if (lastComment.type === "Block") return lastComment;
  if (lastComment.type !== "Line") return null;

  const lineComments = [];
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    const comment = comments[index];
    if (comment.type !== "Line") break;

    const previousComment = comments[index - 1];
    if (
      previousComment &&
      previousComment.type === "Line" &&
      comment.loc.start.line - previousComment.loc.end.line > 1
    ) {
      lineComments.unshift(comment);
      break;
    }

    lineComments.unshift(comment);
  }

  return {
    type: "LineBlock",
    loc: lineComments[0].loc,
    range: [lineComments[0].range[0], lineComments.at(-1).range[1]],
    value: lineComments.map((comment) => comment.value).join("\n"),
  };
}

export function parseOwnershipComment(comment) {
  if (!comment) {
    return { entries: [], nodes: [], keys: new Set(), errors: [] };
  }

  const rawLines = comment.value.replace(/\r\n?/g, "\n").split("\n");
  return parseOwnershipContract(normalizeCommentLines(comment, rawLines));
}

export { parseOwnershipContract, splitTopLevel };

function normalizeCommentLines(comment, lines) {
  if (comment.type !== "LineBlock") return lines;
  return lines.map((line) => (line.startsWith(" ") ? line.slice(1) : line));
}
