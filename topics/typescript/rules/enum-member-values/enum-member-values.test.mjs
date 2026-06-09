import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { enumMemberValuesRule } from './enum-member-values.mjs';

const ruleTester = createRuleTester();

ruleTester.run('enum-member-values', enumMemberValuesRule, {
  valid: [
    'enum BoardActionKind { StickyCreate = "STICKY_CREATE" }',
    'enum StickyColor { Lavender = "LAVENDER", Sky = "SKY" }',
  ],
  invalid: [
    {
      code: 'enum BoardActionKind { StickyCreate }',
      errors: [{ messageId: 'stringValue' }],
    },
    {
      code: 'enum BoardActionKind { StickyCreate = 0 }',
      errors: [{ messageId: 'stringValue' }],
    },
    {
      code: 'enum BoardActionKind { StickyCreate = "STICKY_CREATE", StickyRename }',
      errors: [{ messageId: 'stringValue' }],
    },
  ],
});
