import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
const DEFAULT_MARKERS = ['TODO', 'BUG', 'FIXME', 'IMPROVEMENT', 'OPTIMIZATION'];

// Permissive by default: `@zaydek` and `@claude-code/opus-4.8/xhigh` both
// pass. Tighten via the attributionPattern option when the harness/model/
// effort grammar stabilizes.
const DEFAULT_ATTRIBUTION_PATTERN = '^@[\\w.-]+(?:/[\\w.-]+)*$';

const MARKER_PATTERN = /^(\s*)([A-Za-z]+)(?:\(([^)]*)\))?(:)?/;
const MISSPELLING_PATTERN = /\b(TOOD|TDOO|TODOO|OTOD)\b/gi;

export const todoFormatRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require canonical uppercase comment markers and well-formed `(@attribution)` scopes.',
    },
    messages: {
      misspelled: createRuleMessage(
        '`{{token}}` looks like a misspelled TODO marker.',
        'Write `TODO` or one of the configured uppercase markers.',
        'todo-format',
      ),
      casing: createRuleMessage(
        'Marker `{{token}}` is not the canonical uppercase marker `{{expected}}`.',
        'Rename the marker to `{{expected}}` so marker scans stay greppable.',
        'todo-format',
      ),
      scopeMustAttribute: createRuleMessage(
        'Marker scope for `{{token}}` is not an attribution.',
        'Write `{{token}}(@who)` or remove the scope.',
        'todo-format',
      ),
      attribution: createRuleMessage(
        'Attribution `{{scope}}` does not match `{{pattern}}`.',
        'Use an agent/human attribution such as `@claude-code/opus-4.8/xhigh`.',
        'todo-format',
      ),
    },
    schema: [
      {
        type: 'object',
        properties: {
          markers: { type: 'array', items: { type: 'string' }, minItems: 1 },
          attributionPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const markers = new Set(context.options[0]?.markers ?? DEFAULT_MARKERS);
    const attributionPattern =
      context.options[0]?.attributionPattern ?? DEFAULT_ATTRIBUTION_PATTERN;
    const attributionRegExp = new RegExp(attributionPattern);
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          checkComment(context, sourceCode, comment, markers, attributionRegExp, attributionPattern);
        }
      },
    };
  },
};

function checkComment(context, sourceCode, comment, markers, attributionRegExp, attributionPattern) {
  const textOffset = comment.range[0] + 2;

  for (const match of comment.value.matchAll(MISSPELLING_PATTERN)) {
    report(context, sourceCode, textOffset + match.index, match[0].length, 'misspelled', {
      token: match[0],
    });
  }

  // A marker is declared by a `(scope)` or a trailing colon at the start of
  // the comment; bare mentions and prose stay out of scope.
  const firstLine = comment.value.split('\n').find((line) => line.trim() !== '') ?? '';
  const markerMatch = firstLine.match(MARKER_PATTERN);
  if (!markerMatch) return;

  const [, leadingWhitespace, token, scope, colon] = markerMatch;
  if (scope === undefined && colon === undefined) return;

  const lineOffset = comment.value.indexOf(firstLine);
  const tokenIndex = textOffset + lineOffset + leadingWhitespace.length;

  const expected = token.toUpperCase();
  if (!markers.has(expected)) return;
  if (token !== expected) {
    report(context, sourceCode, tokenIndex, token.length, 'casing', { token, expected });
  }

  if (scope === undefined) return;
  if (!scope.startsWith('@')) {
    report(context, sourceCode, tokenIndex + token.length + 1, Math.max(scope.length, 1), 'scopeMustAttribute', {
      token: expected,
    });
    return;
  }
  if (!attributionRegExp.test(scope)) {
    report(context, sourceCode, tokenIndex + token.length + 1, scope.length, 'attribution', {
      scope,
      pattern: attributionPattern,
    });
  }
}

function report(context, sourceCode, index, length, messageId, data) {
  const start = sourceCode.getLocFromIndex(index);
  const end = sourceCode.getLocFromIndex(index + length);
  context.report({ loc: { start, end }, messageId, data });
}
