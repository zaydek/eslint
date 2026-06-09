import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { errorMessageContextRule } from './error-message-context.mjs';

const ruleTester = createRuleTester();

ruleTester.run('error-message-context', errorMessageContextRule, {
  valid: [
    'throw new Error(`error=${JSON.stringify(result.error)}`);',
    'throw new Error(`${debugIdentifier}: Context is null`);',
    'throw new Error("kind=" + JSON.stringify(action.kind));',
    // Non-literal messages carry their own context.
    'throw new Error(message);',
    'throw error;',
  ],
  invalid: [
    {
      code: 'throw new Error("An unexpected error occurred");',
      errors: [{ messageId: 'needsContext' }],
    },
    {
      code: 'throw new Error(`An unexpected error occurred`);',
      errors: [{ messageId: 'needsContext' }],
    },
    {
      code: 'throw new Error("An unexpected " + "error occurred");',
      errors: [{ messageId: 'needsContext' }],
    },
    {
      code: 'throw new TypeError("bad input");',
      errors: [{ messageId: 'needsContext' }],
    },
    {
      code: 'throw new Error();',
      errors: [{ messageId: 'needsContext' }],
    },
  ],
});
