import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { namedComplexReturnTypesRule } from './named-complex-return-types.mjs';

const ruleTester = createRuleTester();

ruleTester.run('named-complex-return-types', namedComplexReturnTypesRule, {
  valid: [
    `
type GetThingReturn = { id: string; label: string };
function getThing(): GetThingReturn {
  return { id: 'x', label: 'X' };
}
`,
    'function getCount(): number { return 1; }',
    'const getThing = (): string => "x";',
  ],
  invalid: [
    {
      code: `
function getThing(): { id: string; label: string } {
  return { id: 'x', label: 'X' };
}
`,
      errors: [{ messageId: 'namedReturn' }],
    },
    {
      code: 'const getThing = (): { id: string } => ({ id: "x" });',
      errors: [{ messageId: 'namedReturn' }],
    },
  ],
});
