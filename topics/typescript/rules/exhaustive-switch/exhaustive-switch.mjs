export const exhaustiveSwitchRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require switches over enum members to close with a `default` that calls `exhaustive()`.',
    },
    messages: {
      missingDefault:
        'Enum switches need a `default` case that calls `exhaustive()` so new variants fail loudly.',
      defaultMustExhaust: 'The `default` case of an enum switch should call `exhaustive()`.',
    },
    schema: [],
  },

  create(context) {
    return {
      SwitchStatement(node) {
        const testedCases = node.cases.filter((switchCase) => switchCase.test !== null);
        if (testedCases.length === 0) return;

        const isEnumSwitch = testedCases.every(
          (switchCase) =>
            switchCase.test.type === 'MemberExpression' &&
            !switchCase.test.computed &&
            switchCase.test.object.type === 'Identifier' &&
            switchCase.test.property.type === 'Identifier',
        );
        if (!isEnumSwitch) return;

        const defaultCase = node.cases.find((switchCase) => switchCase.test === null);
        if (!defaultCase) {
          context.report({ node: node.discriminant, messageId: 'missingDefault' });
          return;
        }

        const callsExhaustive = defaultCase.consequent.some((statement) =>
          containsExhaustiveCall(statement),
        );
        if (!callsExhaustive) {
          context.report({ node: defaultCase, messageId: 'defaultMustExhaust' });
        }
      },
    };
  },
};

function containsExhaustiveCall(node) {
  if (!node || typeof node !== 'object') return false;
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'exhaustive'
  ) {
    return true;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;
    if (Array.isArray(value)) {
      if (value.some((child) => containsExhaustiveCall(child))) return true;
      continue;
    }
    if (containsExhaustiveCall(value)) return true;
  }

  return false;
}
