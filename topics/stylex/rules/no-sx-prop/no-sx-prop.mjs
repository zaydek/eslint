import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
export const noSxPropRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow sx props; use stylex.props explicitly.',
    },
    messages: {
      noSx: createRuleMessage(
        'JSX uses the `sx` prop instead of StyleX props.',
        'Replace `sx={...}` with `stylex.props(...)` spread props.',
        'no-sx-prop',
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name?.type === 'JSXIdentifier' && node.name.name === 'sx') {
          context.report({ node, messageId: 'noSx' });
        }
      },
    };
  },
};
