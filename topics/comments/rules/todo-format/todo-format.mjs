const CANONICAL_MARKERS = new Set(['TODO', 'BUG', 'FIXME', 'IMPROVEMENT', 'OPTIMIZATION']);
const MARKER_PATTERN = /^(\s*)([A-Za-z]+)(\([^)]*\))?:/;
const MISSPELLING_PATTERN = /\b(TOOD|TDOO|TODOO|OTOD)\b/gi;

export const todoFormatRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require canonical uppercase comment markers such as `TODO:`, `BUG:`, and `FIXME:`.',
    },
    messages: {
      misspelled: '`{{token}}` looks like a misspelled TODO; write `TODO`.',
      casing: 'Marker `{{token}}:` should be uppercase `{{expected}}:` so marker scans stay greppable.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          checkComment(context, sourceCode, comment);
        }
      },
    };
  },
};

function checkComment(context, sourceCode, comment) {
  const textOffset = comment.range[0] + 2;

  for (const match of comment.value.matchAll(MISSPELLING_PATTERN)) {
    report(context, sourceCode, textOffset + match.index, match[0], 'misspelled', {
      token: match[0],
    });
  }

  // Only the colon form at the start of the comment declares a marker; bare
  // mentions and prose stay out of scope.
  const firstLine = comment.value.split('\n').find((line) => line.trim() !== '') ?? '';
  const markerMatch = firstLine.match(MARKER_PATTERN);
  if (!markerMatch) return;

  const [, leadingWhitespace, token] = markerMatch;
  const expected = token.toUpperCase();
  if (!CANONICAL_MARKERS.has(expected) || token === expected) return;

  const lineOffset = comment.value.indexOf(firstLine);
  report(
    context,
    sourceCode,
    textOffset + lineOffset + leadingWhitespace.length,
    token,
    'casing',
    { token, expected },
  );
}

function report(context, sourceCode, index, token, messageId, data) {
  const start = sourceCode.getLocFromIndex(index);
  const end = sourceCode.getLocFromIndex(index + token.length);
  context.report({ loc: { start, end }, messageId, data });
}
