import { createRuleMessage } from '../../../lib/rule-doc-message.mjs';
export const stylexPlacementRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require stylex.create calls to live after component/helper implementations.',
    },
    messages: {
      placement: createRuleMessage(
        '`const styles = stylex.create(...)` appears before component/helper implementations.',
        'Move the StyleX declaration after the component and helper implementations.',
        'stylex-placement',
      ),
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function isStylexCreateDeclaration(statement) {
      if (statement.type !== 'VariableDeclaration') return false;
      return statement.declarations.some((declaration) => {
        const init = declaration.init;
        return (
          declaration.id.type === 'Identifier' &&
          declaration.id.name === 'styles' &&
          init?.type === 'CallExpression' &&
          init.callee.type === 'MemberExpression' &&
          init.callee.object.type === 'Identifier' &&
          init.callee.object.name === 'stylex' &&
          init.callee.property.type === 'Identifier' &&
          init.callee.property.name === 'create'
        );
      });
    }

    function isImplementationStatement(statement) {
      if (statement.type === 'FunctionDeclaration') return true;
      if (statement.type === 'ExportNamedDeclaration' && statement.declaration?.type === 'FunctionDeclaration') return true;
      if (statement.type === 'ExportDefaultDeclaration' && statement.declaration?.type === 'FunctionDeclaration') return true;
      return false;
    }

    return {
      Program(node) {
        const styleStatementIndex = node.body.findIndex(isStylexCreateDeclaration);
        if (styleStatementIndex < 0) return;

        const laterImplementation = node.body.slice(styleStatementIndex + 1).find(isImplementationStatement);
        if (laterImplementation) {
          const styleStatement = node.body[styleStatementIndex];
          context.report({ node: styleStatement, messageId: 'placement' });
        }
      },
    };
  },
};
