import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { functionNamesRule } from './function-names.mjs';

const ruleTester = createRuleTester();

ruleTester.run('function-names', functionNamesRule, {
  valid: [
    'function getThing(): string { return "x"; }',
    'function setTitleEditing(): void {}',
    'function applyVariant(): void {}',
    'function formatLabel(): string { return "x"; }',
    'function mapOption(): string { return "x"; }',
    'function findRoute(): string { return "x"; }',
    'function filterEntries(): string[] { return []; }',
    'function computeLayout(): void {}',
    'function preview(): void {}',
    'function StickyCard(): JSX.Element { return <div />; }',
    'function recurse(): void {}',
  ],
  invalid: [
    {
      code: 'function thing(): string { return "x"; }',
      errors: [{ messageId: 'verbNoun' }],
    },
  ],
});
