import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { exhaustiveSwitchRule } from './exhaustive-switch.mjs';

const ruleTester = createRuleTester();

ruleTester.run('exhaustive-switch', exhaustiveSwitchRule, {
  valid: [
    `
      switch (result.kind) {
        case MoveResultKind.Success:
          return result.id;
        case MoveResultKind.Error:
          throw new Error(\`error=\${JSON.stringify(result.error)}\`);
        default:
          exhaustive(result);
      }
    `,
    `
      switch (result.kind) {
        case MoveResultKind.Success:
          return result.id;
        default: {
          return exhaustive(result);
        }
      }
    `,
    // Non-enum switches are out of scope.
    `
      switch (value) {
        case 1:
          return 'one';
        case 2:
          return 'two';
      }
    `,
  ],
  invalid: [
    {
      code: `
        switch (result.kind) {
          case MoveResultKind.Success:
            return result.id;
          case MoveResultKind.Error:
            return null;
        }
      `,
      errors: [{ messageId: 'missingDefault' }],
    },
    {
      code: `
        switch (result.kind) {
          case MoveResultKind.Success:
            return result.id;
          default:
            return null;
        }
      `,
      errors: [{ messageId: 'defaultMustExhaust' }],
    },
  ],
});
