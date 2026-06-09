import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { functionDeclarationsRule } from './function-declarations.mjs';

const ruleTester = createRuleTester();

ruleTester.run('function-declarations', functionDeclarationsRule, {
  valid: [
    'function getThing(): string { return "x"; }',
    'const getThing = (): string => "x";',
  ],
  invalid: [
    {
      code: 'const getThing = (): string => { return "x"; };',
      errors: [{ messageId: 'declaration' }],
    },
  ],
});
