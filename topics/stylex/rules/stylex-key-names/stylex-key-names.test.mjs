import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { stylexKeyNamesRule } from "./stylex-key-names.mjs";

const ruleTester = createRuleTester();

ruleTester.run("stylex-key-names", stylexKeyNamesRule, {
  valid: [
    `
      // Root{Is{Compact|Comfortable}}, ?{IsSelected}
      //   Header
      //     HeaderTitle
      //
      //   Footer
      //     FooterAvatarStack
      //
      const styles = stylex.create({
        Root: {},
        RootIsCompact: {},
        RootIsComfortable: {},
        RootIsSelected: {},
        Header: {},
        HeaderTitle: {},
        Footer: {},
        FooterAvatarStack: {},
      });
    `,
    `
      // Card?{IsPromoted}
      //   CardTitle
      //   CardPromotedRibbon
      //     CardPromotedRibbonIcon
      //
      const styles = stylex.create({
        Card: {},
        CardIsPromoted: {},
        CardTitle: {},
        CardPromotedRibbon: {},
        CardPromotedRibbonIcon: {},
      });
    `,
  ],
  invalid: [
    {
      code: `
        // Card
        //   CardFooter
        //     AvatarStack
        //
        const styles = stylex.create({
          Card: {},
          CardFooter: {},
          AvatarStack: {},
        });
      `,
      errors: [{ messageId: "prefix" }],
    },
  ],
});
