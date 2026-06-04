const STYLEX_KEY_PATTERN = /^[A-Za-z_$][\w$]*/;

export function isStylexCreateCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'stylex' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'create'
  );
}

export function getStylexCreateObject(node) {
  if (!isStylexCreateCall(node)) return null;
  const firstArgument = node.arguments[0];
  return firstArgument?.type === 'ObjectExpression' ? firstArgument : null;
}

export function getStylexCreateKeys(objectNode) {
  return objectNode.properties
    .filter((property) => property.type === 'Property')
    .flatMap((property) => {
      if (property.key.type === 'Identifier') return [property.key.name];
      if (property.key.type === 'Literal' && typeof property.key.value === 'string') {
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
  if (between.trim() !== '') return null;

  if (lastComment.type === 'Block') return lastComment;
  if (lastComment.type !== 'Line') return null;

  const lineComments = [];
  for (let index = comments.length - 1; index >= 0; index -= 1) {
    const comment = comments[index];
    if (comment.type !== 'Line') break;

    const previousComment = comments[index - 1];
    if (
      previousComment &&
      previousComment.type === 'Line' &&
      comment.loc.start.line - previousComment.loc.end.line > 1
    ) {
      lineComments.unshift(comment);
      break;
    }

    lineComments.unshift(comment);
  }

  return {
    type: 'LineBlock',
    loc: lineComments[0].loc,
    range: [lineComments[0].range[0], lineComments.at(-1).range[1]],
    value: lineComments.map((comment) => comment.value).join('\n'),
  };
}

export function parseOwnershipComment(comment) {
  if (!comment) {
    return {
      entries: [],
      keys: new Set(),
      errors: [],
    };
  }

  const rawLines = comment.value.replace(/\r\n?/g, '\n').split('\n');
  const lines = stripCommonIndent(trimEmptyEdgeLines(normalizeCommentLines(comment, rawLines)));
  const stack = [];
  const entries = [];
  const keys = new Set();
  const errors = [];
  let previousMeaningfulDepth = null;
  let hasSeparatorSinceMeaningfulLine = false;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    if (rawLine.trim() === '') {
      if (previousMeaningfulDepth !== null) {
        hasSeparatorSinceMeaningfulLine = true;
      }
      continue;
    }

    const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
    const depth = Math.floor(indent / 2);
    const content = rawLine.trim();

    if (indent % 2 !== 0) {
      errors.push({ content, messageId: 'oddIndent' });
    }

    const parent = stack.slice(0, depth).at(-1) ?? null;
    const tokens = splitTopLevel(content, ',');
    const tokenEntries = tokens.flatMap((token) =>
      parseOwnershipToken(token.trim(), parent, lineIndex),
    );

    if (tokenEntries.length === 0) continue;

    if (
      previousMeaningfulDepth !== null &&
      previousMeaningfulDepth > depth &&
      depth <= 1 &&
      !hasSeparatorSinceMeaningfulLine
    ) {
      errors.push({ content, messageId: 'missingRootSeparator' });
    }

    while (stack.length > depth) stack.pop();

    for (const entry of tokenEntries) {
      entries.push(entry);
      keys.add(entry.key);
    }

    const ownerEntry = tokenEntries.find((entry) => !entry.isOptional) ?? tokenEntries[0];
    stack[depth] = ownerEntry;
    stack.length = depth + 1;
    previousMeaningfulDepth = depth;
    hasSeparatorSinceMeaningfulLine = false;
  }

  return { entries, keys, errors };
}

export function splitTopLevel(text, separator) {
  const parts = [];
  let current = '';
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let angleDepth = 0;

  for (const character of text) {
    if (character === '(') parenDepth += 1;
    if (character === ')') parenDepth -= 1;
    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth -= 1;
    if (character === '[') bracketDepth += 1;
    if (character === ']') bracketDepth -= 1;
    if (character === '<') angleDepth += 1;
    if (character === '>') angleDepth -= 1;

    if (
      character === separator &&
      parenDepth === 0 &&
      braceDepth === 0 &&
      bracketDepth === 0 &&
      angleDepth === 0
    ) {
      parts.push(current);
      current = '';
      continue;
    }

    current += character;
  }

  if (current.trim() !== '') parts.push(current);
  return parts;
}

function parseOwnershipToken(token, parent, groupId) {
  if (token === '' || token.startsWith('::')) return [];

  const isOptional = token.startsWith('?');
  const normalizedToken = isOptional ? token.slice(1) : token;
  const head = normalizedToken.match(STYLEX_KEY_PATTERN)?.[0];
  if (!head) return [];

  const suffix = normalizedToken.slice(head.length);
  if (suffix !== '' && !/^[({@]/.test(suffix)) return [];

  const variantMatch = suffix.match(/^\{([^}]+)\}/);
  const values = variantMatch
    ? splitTopLevel(variantMatch[1], ',').map((value) => value.trim()).filter(Boolean)
    : null;

  if (values) {
    return values.map((value) => ({
      key: `${head}${value}`,
      baseKey: head,
      groupId,
      parent,
      token,
      isOptional,
      isExpansion: true,
    }));
  }

  return [
    {
      key: head,
      baseKey: head,
      groupId,
      parent,
      token,
      isOptional,
      isExpansion: false,
    },
  ];
}

function trimEmptyEdgeLines(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === '') start += 1;
  while (end > start && lines[end - 1].trim() === '') end -= 1;

  return lines.slice(start, end);
}

function normalizeCommentLines(comment, lines) {
  if (comment.type !== 'LineBlock') return lines;
  return lines.map((line) => (line.startsWith(' ') ? line.slice(1) : line));
}

function stripCommonIndent(lines) {
  const indents = lines
    .filter((line) => line.trim() !== '')
    .map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const commonIndent = indents.length > 0 ? Math.min(...indents) : 0;
  if (commonIndent === 0) return lines;
  return lines.map((line) => line.slice(commonIndent));
}
