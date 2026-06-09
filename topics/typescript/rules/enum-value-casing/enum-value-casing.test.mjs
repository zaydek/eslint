import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { enumValueCasingRule } from './enum-value-casing.mjs';

const ruleTester = createRuleTester();

ruleTester.run('enum-value-casing', enumValueCasingRule, {
  valid: [
    'enum BoardActionKind { StickyCreate = "STICKY_CREATE" }',
    'enum MoveResultKind { Success = "SUCCESS", Error = "ERROR" }',
    'enum StickyPriority { P0 = "P0", P1 = "P1" }',
    // Non-string members belong to enum-member-values, not this rule.
    'enum BoardActionKind { StickyCreate }',
  ],
  invalid: [
    {
      code: 'enum ModalKind { ChatSidebar = "ChatSidebar" }',
      errors: [{ messageId: 'casing' }],
    },
    {
      code: 'enum ModalKind { ChatSidebar = "chat-sidebar" }',
      errors: [{ messageId: 'casing' }],
    },
    {
      code: 'enum MoveResultKind { Success = "Success", Error = "ERROR" }',
      errors: [{ messageId: 'casing' }],
    },
  ],
});
