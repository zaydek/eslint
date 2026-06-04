import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { stylexObjectSpacingRule } from './stylex-object-spacing.mjs';

const ruleTester = createRuleTester();

ruleTester.run('stylex-object-spacing', stylexObjectSpacingRule, {
  valid: [
    `
      // card
      //   cardTitle
      //
      const styles = stylex.create({
        card: {},
        cardTitle: {},
      });
    `,
  ],
  invalid: [
    {
      code: `
        // card
        //   cardTitle
        //
        const styles = stylex.create({
          card: {},

          cardTitle: {},
        });
      `,
      errors: [{ messageId: 'doubleBlank' }],
    },
  ],
});
