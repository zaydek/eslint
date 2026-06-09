import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { contextViaFactoryRule } from './context-via-factory.mjs';

const ruleTester = createRuleTester();

ruleTester.run('context-via-factory', contextViaFactoryRule, {
  valid: [
    'export const BoardContext = newGenericContext<BoardContextValue>("BoardContext");',
    {
      code: 'const Context = React.createContext(null);',
      filename: 'app/state/new-generic-context.tsx',
    },
  ],
  invalid: [
    {
      code: 'const BoardContext = React.createContext(null);',
      errors: [{ messageId: 'useFactory' }],
    },
    {
      code: 'const BoardContext = createContext(null);',
      errors: [{ messageId: 'useFactory' }],
    },
    {
      code: 'export const board = newGenericContext<BoardContextValue>("board");',
      errors: [{ messageId: 'contextSuffix' }],
    },
    {
      code: 'export const BoardContext = newGenericContext<BoardContextValue>("EditorContext");',
      errors: [{ messageId: 'debugName' }],
    },
  ],
});
