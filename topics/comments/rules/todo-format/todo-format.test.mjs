import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { todoFormatRule } from './todo-format.mjs';

const ruleTester = createRuleTester();

ruleTester.run('todo-format', todoFormatRule, {
  valid: [
    '// TODO: Disable tabbing while the modal is open\nconst value = 1;',
    '// TODO(modal): Disable tabbing while the modal is open\nconst value = 1;',
    '// BUG: Cursor jumps a row when the lane is empty\nconst value = 1;',
    '/* FIXME: Extract this into its own component */\nconst value = 1;',
    // Bare markers are fine; only the colon form is held to canonical casing.
    'const min = 8; // TODO\nconst value = 1;',
    // Prose that merely starts with or contains a marker word is out of scope.
    '// Bug fix for the modal layering issue\nconst value = 1;',
    '// Clearing the remaining todos happens in the activity feed\nconst value = 1;',
    // Markers outside the canonical set are untouched.
    '// NOTE: Out-of-set markers are not enforced\nconst value = 1;',
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
      code: '// Fixme: mixed-case marker\nconst value = 1;',
      errors: [{ messageId: 'casing' }],
    },
    {
      code: '// bug(modal): lowercase scoped marker\nconst value = 1;',
      errors: [{ messageId: 'casing' }],
    },
  ],
});
