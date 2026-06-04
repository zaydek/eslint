import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { associatedExportsRule } from './associated-exports.mjs';

const ruleTester = createRuleTester();

ruleTester.run('associated-exports', associatedExportsRule, {
  valid: [
    `
export type FooArgs = { id: string };
export type FooReturn = { id: string };
export function getFoo(args: FooArgs): FooReturn {
  return args;
}
`,
    `
type LocalArgs = { id: string };
function getFoo(args: LocalArgs): LocalArgs {
  return args;
}
`,
    `
export type FooInner = { id: string };
export type FooReturn = { foo: FooInner };
export const getFoo = (): FooReturn => ({ foo: { id: 'x' } });
`,
  ],
  invalid: [
    {
      code: `
type FooArgs = { id: string };
export function getFoo(args: FooArgs): FooArgs {
  return args;
}
`,
      errors: [{ messageId: 'exportAssociated' }],
    },
    {
      code: `
type FooReturn = { id: string };
export const getFoo = (): FooReturn => ({ id: 'x' });
`,
      errors: [{ messageId: 'exportAssociated' }],
    },
    {
      code: `
type FooInner = { id: string };
export type FooReturn = { foo: FooInner };
`,
      errors: [{ messageId: 'exportAssociated' }],
    },
  ],
});
