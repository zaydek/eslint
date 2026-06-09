import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { todoFormatRule } from './todo-format.mjs';

const ruleTester = createRuleTester();

ruleTester.run('todo-format', todoFormatRule, {
  valid: [
    '// TODO: Disable tabbing while the modal is open\nconst value = 1;',
    '// TODO(modal): Disable tabbing while the modal is open\nconst value = 1;',
    '/* TODO: Extract this into its own component */\nconst value = 1;',
    // Prose that merely contains the word is out of scope.
    '// Clearing the remaining todos happens in the activity feed\nconst value = 1;',
    '// Plain note with no marker\nconst value = 1;',
  ],
  invalid: [
    {
      code: '// TOOD: This seems overcomplicated\nconst value = 1;',
      errors: [{ messageId: 'misspelled' }],
    },
    {
      code: '// todo: lowercase marker\nconst value = 1;',
      errors: [{ messageId: 'casing' }],
    },
    {
      code: '// ToDo: mixed-case marker\nconst value = 1;',
      errors: [{ messageId: 'casing' }],
    },
    {
      code: 'const min = 8; // TODO\nconst value = 1;',
      errors: [{ messageId: 'needsColon' }],
    },
    {
      code: '// TODO(modal) missing the colon\nconst value = 1;',
      errors: [{ messageId: 'needsColon' }],
    },
  ],
});
