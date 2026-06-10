import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { stylexObjectSpacingRule } from "./stylex-object-spacing.mjs";

const ruleTester = createRuleTester();

ruleTester.run("stylex-object-spacing", stylexObjectSpacingRule, {
  valid: [
    `
      // Card
      //   CardTitle
      //
      const styles = stylex.create({
        Card: {},
        CardTitle: {},
      });
    `,
  ],
  invalid: [
    {
      code: `
        // Card
        //   CardTitle
        //
        const styles = stylex.create({
          Card: {},

          CardTitle: {},
        });
      `,
      errors: [{ messageId: "doubleBlank" }],
    },
  ],
});
