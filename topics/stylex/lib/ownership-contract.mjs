const KEY_PATTERN = /^[A-Z][A-Za-z0-9]*/;
const PASCAL_IDENT_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const LOWER_IDENT_PATTERN = /^[a-z][A-Za-z0-9]*$/;
const MARKER_PATTERN = /^(Is|Has|With)/;

export const OWNERSHIP_CONTRACT_MESSAGE_IDS = new Set([
  'bareOptionalElement',
  'inlineProse',
  'invalidAxis',
  'invalidAxisValue',
  'invalidDynamicArgs',
  'invalidKey',
  'invalidLine',
  'invalidModifierBlock',
  'markerOptional',
  'missingOptionalSeparator',
  'missingRootSeparator',
  'oddIndent',
  'optionalFirstOrder',
  'requiredBoolean',
  'singleValueUnion',
  'trailingOptional',
]);

export function parseOwnershipContract(textOrLines) {
  const lines = Array.isArray(textOrLines)
    ? textOrLines
    : String(textOrLines).replace(/\r\n?/g, '\n').split('\n');
  const contractLines = stripContractIndent(trimEmptyEdgeLines(lines));
  const stack = [];
  const entries = [];
  const nodes = [];
  const keys = new Set();
  const errors = [];
  let previousMeaningfulDepth = null;
  let hasSeparatorSinceMeaningfulLine = false;
  let hasStartedContract = false;

  for (let lineIndex = 0; lineIndex < contractLines.length; lineIndex += 1) {
    const rawLine = contractLines[lineIndex];
    if (rawLine.trim() === '') {
      if (previousMeaningfulDepth !== null) {
        hasSeparatorSinceMeaningfulLine = true;
      }
      continue;
    }

    const content = rawLine.trim();
    const looksLikeEntry = isEntryCandidate(content);
    if (!looksLikeEntry && !hasStartedContract) continue;

    const leading = rawLine.match(/^[ \t]*/)?.[0] ?? '';
    const indent = [...leading].filter((character) => character === ' ').length;
    const depth = Math.floor(indent / 2);
    const parent = stack.slice(0, depth).at(-1) ?? null;

    hasStartedContract = true;

    if (leading.includes('\t') || indent % 2 !== 0) {
      errors.push(createError('oddIndent', lineIndex, content));
    }

    if (!looksLikeEntry) {
      errors.push(createError('invalidLine', lineIndex, content));
      continue;
    }

    const parsed = parseNode(content, lineIndex);
    errors.push(...parsed.errors);
    if (!parsed.node) continue;

    if (
      previousMeaningfulDepth !== null &&
      previousMeaningfulDepth > depth &&
      depth <= 1 &&
      !hasSeparatorSinceMeaningfulLine
    ) {
      errors.push(createError('missingRootSeparator', lineIndex, content));
    }

    while (stack.length > depth) stack.pop();

    const groupId = lineIndex;
    const baseEntry = {
      key: parsed.node.key,
      baseKey: parsed.node.key,
      groupId,
      depth,
      parent,
      token: content,
      isOptional: false,
      isExpansion: false,
      isDynamic: parsed.node.kind === 'dynamic',
      dynamicArgs: parsed.node.dynamicArgs,
      requiredAxes: parsed.node.requiredAxes,
      optionalAxes: parsed.node.optionalAxes,
    };

    entries.push(baseEntry);
    keys.add(baseEntry.key);

    for (const axis of [...parsed.node.requiredAxes, ...parsed.node.optionalAxes]) {
      for (const value of axis.values) {
        const key = `${parsed.node.key}${axis.marker}${value}`;
        entries.push({
          key,
          baseKey: axis.kind === 'boolean' ? key : `${parsed.node.key}${axis.marker}`,
          groupId,
          depth,
          parent,
          token: content,
          isOptional: axis.blockKind === 'optional',
          isExpansion: true,
          isDynamic: false,
          axis,
        });
        keys.add(key);
      }
    }

    nodes.push({ ...parsed.node, depth, parent, groupId, token: content });
    stack[depth] = baseEntry;
    stack.length = depth + 1;
    previousMeaningfulDepth = depth;
    hasSeparatorSinceMeaningfulLine = false;
  }

  return { entries, nodes, keys, errors };
}

export function expandOwnershipContract(textOrLines) {
  return [...parseOwnershipContract(textOrLines).keys];
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

function parseNode(content, lineIndex) {
  const errors = [];
  const key = content.match(KEY_PATTERN)?.[0] ?? null;
  if (!key) {
    return { node: null, errors: [createError('invalidKey', lineIndex, content)] };
  }

  const suffix = content.slice(key.length);
  if (suffix.trim() === '') {
    return {
      node: createNode('element', key, [], [], []),
      errors,
    };
  }

  if (suffix === '?') {
    return {
      node: null,
      errors: [createError('bareOptionalElement', lineIndex, content)],
    };
  }

  if (suffix.startsWith('(')) {
    const dynamicArgs = parseDynamicArgs(suffix, lineIndex, content);
    return {
      node: dynamicArgs.args ? createNode('dynamic', key, [], [], dynamicArgs.args) : null,
      errors: dynamicArgs.errors,
    };
  }

  const modifierBlocks = parseModifierBlocks(suffix, lineIndex, content);
  if (!modifierBlocks.blocks) {
    return { node: null, errors: modifierBlocks.errors };
  }

  const requiredBlock = modifierBlocks.blocks.find((block) => block.blockKind === 'required');
  const optionalBlock = modifierBlocks.blocks.find((block) => block.blockKind === 'optional');

  return {
    node: createNode(
      'element',
      key,
      requiredBlock?.axes ?? [],
      optionalBlock?.axes ?? [],
      [],
    ),
    errors: modifierBlocks.errors,
  };
}

function createNode(kind, key, requiredAxes, optionalAxes, dynamicArgs) {
  return {
    kind,
    key,
    requiredAxes,
    optionalAxes,
    dynamicArgs,
  };
}

function parseDynamicArgs(suffix, lineIndex, content) {
  if (!suffix.endsWith(')')) {
    return {
      args: null,
      errors: [createError('invalidDynamicArgs', lineIndex, content)],
    };
  }

  const inner = suffix.slice(1, -1).trim();
  if (inner === '') {
    return {
      args: null,
      errors: [createError('invalidDynamicArgs', lineIndex, content)],
    };
  }

  const args = [];
  const errors = [];

  for (const rawArg of splitTopLevel(inner, ',')) {
    const arg = rawArg.trim();
    const match = arg.match(/^([a-z][A-Za-z0-9]*)<(.+)>$/);
    if (!match || !LOWER_IDENT_PATTERN.test(match[1]) || match[2].trim() === '') {
      errors.push(createError('invalidDynamicArgs', lineIndex, content));
      continue;
    }
    args.push({ name: match[1], type: match[2].trim() });
  }

  return {
    args: errors.length > 0 ? null : args,
    errors,
  };
}

function parseModifierBlocks(suffix, lineIndex, content) {
  const errors = [];
  let rest = suffix;
  const blocks = [];
  let hasRequiredBlock = false;

  if (rest.startsWith('{')) {
    const block = readBraceBlock(rest);
    if (!block) {
      return { blocks: null, errors: [createError('invalidModifierBlock', lineIndex, content)] };
    }
    blocks.push(parseAxisBlock('required', block.inner, lineIndex, content));
    hasRequiredBlock = true;
    rest = block.rest;
  }

  if (hasRequiredBlock && rest.trimStart().startsWith('?{')) {
    errors.push(createError('missingOptionalSeparator', lineIndex, content));
    rest = rest.trimStart();
  } else if (hasRequiredBlock && rest.trimStart().startsWith(',')) {
    rest = rest.trimStart().slice(1).trimStart();
  }

  if (rest.startsWith('?{')) {
    const block = readBraceBlock(rest.slice(1));
    if (!block) {
      return { blocks: null, errors: [createError('invalidModifierBlock', lineIndex, content)] };
    }
    blocks.push(parseAxisBlock('optional', block.inner, lineIndex, content));
    rest = block.rest;
  } else if (rest.startsWith('?')) {
    errors.push(createError('bareOptionalElement', lineIndex, content));
    rest = rest.slice(1);
  }

  const remaining = rest.trimStart();
  if (remaining.startsWith('{') || remaining.startsWith(',{') || remaining.startsWith(', {')) {
    errors.push(createError('optionalFirstOrder', lineIndex, content));
    const block = readBraceBlock(remaining.startsWith(',') ? remaining.slice(1).trimStart() : remaining);
    if (block) rest = block.rest;
  }

  if (rest.trim() !== '') {
    const messageId = rest.trim().startsWith('(') ? 'inlineProse' : 'invalidModifierBlock';
    errors.push(createError(messageId, lineIndex, content));
  }

  if (blocks.length === 0) {
    return { blocks: null, errors: errors.length > 0 ? errors : [createError('invalidLine', lineIndex, content)] };
  }

  errors.push(...blocks.flatMap((block) => block.errors));
  return {
    blocks: blocks.map(({ blockKind, axes }) => ({ blockKind, axes })),
    errors,
  };
}

function parseAxisBlock(blockKind, inner, lineIndex, content) {
  const axes = [];
  const errors = [];

  for (const rawAxis of splitTopLevel(inner, ',')) {
    const axisText = rawAxis.trim();
    const axis = parseAxis(blockKind, axisText, lineIndex, content);
    errors.push(...axis.errors);
    if (axis.axis) axes.push(axis.axis);
  }

  return { blockKind, axes, errors };
}

function parseAxis(blockKind, axisText, lineIndex, content) {
  const markerMatch = axisText.match(MARKER_PATTERN);
  if (!markerMatch) {
    return {
      axis: null,
      errors: [createError('invalidAxis', lineIndex, content)],
    };
  }

  const marker = markerMatch[1];
  const tail = axisText.slice(marker.length);

  if (tail.startsWith('?{')) {
    return {
      axis: null,
      errors: [createError('markerOptional', lineIndex, content)],
    };
  }

  if (tail.startsWith('{')) {
    if (!tail.endsWith('}')) {
      const messageId = tail.endsWith('}?') ? 'trailingOptional' : 'invalidAxis';
      return { axis: null, errors: [createError(messageId, lineIndex, content)] };
    }

    const inner = tail.slice(1, -1);
    const values = splitTopLevel(inner, '|').map((value) => value.trim()).filter(Boolean);
    if (values.length < 2) {
      return {
        axis: null,
        errors: [createError('singleValueUnion', lineIndex, content)],
      };
    }

    const invalidValue = values.find((value) => !PASCAL_IDENT_PATTERN.test(value));
    if (invalidValue) {
      return {
        axis: null,
        errors: [createError('invalidAxisValue', lineIndex, content)],
      };
    }

    return {
      axis: { marker, values, kind: 'union', blockKind },
      errors: [],
    };
  }

  if (!PASCAL_IDENT_PATTERN.test(tail)) {
    return {
      axis: null,
      errors: [createError('invalidAxisValue', lineIndex, content)],
    };
  }

  if (blockKind === 'required') {
    return {
      axis: null,
      errors: [createError('requiredBoolean', lineIndex, content)],
    };
  }

  return {
    axis: { marker, values: [tail], kind: 'boolean', blockKind },
    errors: [],
  };
}

function readBraceBlock(text) {
  if (!text.startsWith('{')) return null;

  let depth = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth === 0) {
      return {
        inner: text.slice(1, index),
        rest: text.slice(index + 1),
      };
    }
  }

  return null;
}

function isEntryCandidate(content) {
  const key = content.match(KEY_PATTERN)?.[0] ?? null;
  if (!key) return false;
  const suffix = content.slice(key.length);
  if (suffix === '') return true;
  if (suffix.startsWith('{') || suffix.startsWith('?') || suffix.startsWith('(')) return true;
  return false;
}

function stripContractIndent(lines) {
  const trimmed = trimEmptyEdgeLines(lines);
  const entryIndents = trimmed
    .filter((line) => isEntryCandidate(line.trim()))
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  if (entryIndents.length === 0) return trimmed;

  const commonIndent = Math.min(...entryIndents);
  if (commonIndent === 0) return trimmed;

  return trimmed.map((line) => {
    if (line.trim() === '') return line;
    return line.startsWith(' '.repeat(commonIndent)) ? line.slice(commonIndent) : line;
  });
}

function trimEmptyEdgeLines(lines) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start].trim() === '') start += 1;
  while (end > start && lines[end - 1].trim() === '') end -= 1;

  return lines.slice(start, end);
}

function createError(messageId, lineIndex, content) {
  if (!OWNERSHIP_CONTRACT_MESSAGE_IDS.has(messageId)) {
    throw new Error(`Unknown StyleX ownership parser messageId: ${messageId}`);
  }
  return { messageId, lineIndex, content };
}
