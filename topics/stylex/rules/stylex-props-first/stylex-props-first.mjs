import { createRuleMessage } from "../../../lib/rule-doc-message.mjs";

export const stylexPropsFirstRule = {
  meta: {
    type: "suggestion",
    docs: { description: "Require stylex.props spreads to be the first JSX attribute." },
    messages: {
      propsFirst: createRuleMessage(
        "JSX stylex.props spread must be the first attribute.",
        "Move `{...stylex.props(...)}` before every other JSX attribute on the element.",
        "stylex-props-first",
      ),
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const attributes = node.attributes ?? [];

        for (const [index, attribute] of attributes.entries()) {
          if (!isStylexPropsSpread(attribute)) continue;
          if (index === 0) continue;

          context.report({ node: attribute, messageId: "propsFirst" });
        }
      },
    };
  },
};

function isStylexPropsSpread(attribute) {
  if (attribute.type !== "JSXSpreadAttribute") return false;

  const argument = attribute.argument;
  if (argument?.type !== "CallExpression") return false;

  const callee = argument.callee;
  if (callee?.type !== "MemberExpression") return false;
  if (callee.computed) return false;
  if (callee.object?.type !== "Identifier" || callee.object.name !== "stylex") return false;
  if (callee.property?.type !== "Identifier" || callee.property.name !== "props") return false;

  return true;
}
