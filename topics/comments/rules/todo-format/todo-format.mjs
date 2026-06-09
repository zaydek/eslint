const TODO_TOKEN_PATTERN = /\b([Tt][Oo][Dd][Oo])\b(\([^)]*\))?(:)?/g;
const MISSPELLING_PATTERN = /\b(TOOD|TDOO|TODOO|OTOD)\b/gi;

export const todoFormatRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require TODO comments to use the `TODO:` or `TODO(scope):` format.',
    },
    messages: {
      misspelled: '`{{token}}` looks like a misspelled TODO; write `TODO:`.',
      casing: 'Write `{{token}}` as `TODO` so todo scans stay greppable.',
      needsColon: 'TODO comments should use `TODO:` or `TODO(scope):` so the note has a body.',
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
    report(context, sourceCode, textOffset, match.index, match[0], 'misspelled');
  }

  for (const match of comment.value.matchAll(TODO_TOKEN_PATTERN)) {
    const [, token, , colon] = match;
    if (token !== 'TODO') {
      report(context, sourceCode, textOffset, match.index, token, 'casing');
      continue;
    }
    if (colon !== ':') {
      report(context, sourceCode, textOffset, match.index, token, 'needsColon');
    }
  }
}

function report(context, sourceCode, textOffset, matchIndex, token, messageId) {
  const start = sourceCode.getLocFromIndex(textOffset + matchIndex);
  const end = sourceCode.getLocFromIndex(textOffset + matchIndex + token.length);
  context.report({ loc: { start, end }, messageId, data: { token } });
}
