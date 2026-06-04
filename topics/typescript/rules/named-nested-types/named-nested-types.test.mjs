import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { namedNestedTypesRule } from './named-nested-types.mjs';

const ruleTester = createRuleTester();

ruleTester.run('named-nested-types', namedNestedTypesRule, {
  valid: [
    `
type FooPropsStyle = { color: string };
type FooPropsItem = { id: string };
type FooProps = {
  style: FooPropsStyle;
  items: FooPropsItem[];
};
`,
    'type FooProps = { title: string; count: number };',
  ],
  invalid: [
    {
      code: 'type FooProps = { style: { color: string } };',
      errors: [{ messageId: 'namedNested' }],
    },
    {
      code: 'type FooProps = { items: { id: string }[] };',
      errors: [{ messageId: 'namedNested' }],
    },
  ],
});
