import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { maxVariantAxesRule } from "./max-variant-axes.mjs";

const ruleTester = createRuleTester();

ruleTester.run("max-variant-axes", maxVariantAxesRule, {
  valid: [
    `
      // Root{Is{Compact|Comfortable}, With{Pink|Blue}}
      //   Title
      //
      const styles = stylex.create({
        Root: {},
        RootIsCompact: {},
        RootIsComfortable: {},
        RootWithPink: {},
        RootWithBlue: {},
        Title: {},
      });
    `,
    // No ownership comment: stylex-ownership-comment owns that failure.
    "const styles = stylex.create({ Root: {} });",
    {
      code: `
        // Root{Is{Compact|Comfortable}, With{Pink|Blue}, Has{Icon|Avatar}}
        //
        const styles = stylex.create({
          Root: {},
          RootIsCompact: {},
          RootIsComfortable: {},
          RootWithPink: {},
          RootWithBlue: {},
          RootHasIcon: {},
          RootHasAvatar: {},
        });
      `,
      options: [{ maxAxes: 3 }],
    },
  ],
  invalid: [
    {
      code: `
        // Root{Is{Compact|Comfortable}, With{Pink|Blue}, Has{Icon|Avatar}}
        //
        const styles = stylex.create({
          Root: {},
          RootIsCompact: {},
          RootIsComfortable: {},
          RootWithPink: {},
          RootWithBlue: {},
          RootHasIcon: {},
          RootHasAvatar: {},
        });
      `,
      errors: [{ messageId: "tooManyAxes" }],
    },
  ],
});
