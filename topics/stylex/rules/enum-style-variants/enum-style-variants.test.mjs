import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { enumStyleVariantsRule } from "./enum-style-variants.mjs";

const ruleTester = createRuleTester();

ruleTester.run("enum-style-variants", enumStyleVariantsRule, {
  valid: [
    `
      enum StickyColor { Lavender = "LAVENDER", Sky = "SKY" }
      const styles = stylex.create({
        Root: {},
        RootWithLavender: {},
        RootWithSky: {},
      });
      const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
        [StickyColor.Lavender]: styles.RootWithLavender,
        [StickyColor.Sky]: styles.RootWithSky,
      };
    `,
    // Without a same-file enum or stylex.create, only the family shape is checked.
    `
      const MapStickyColorToStyle = {
        [StickyColor.Lavender]: styles.RootWithLavender,
        [StickyColor.Sky]: styles.RootWithSky,
      };
    `,
    // Exclude<> narrows the key set on purpose; completeness is the type's job.
    `
      enum StickyColor { None = "NONE", Lavender = "LAVENDER", Sky = "SKY" }
      const MapStickyColorToStyle: Record<Exclude<StickyColor, StickyColor.None>, stylex.StyleXStyles> = {
        [StickyColor.Lavender]: styles.RootWithLavender,
        [StickyColor.Sky]: styles.RootWithSky,
      };
    `,
  ],
  invalid: [
    {
      code: `
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.RootLavenderWith,
        };
      `,
      errors: [{ messageId: "variantSuffix" }],
    },
    {
      code: `
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.RootWithLavender,
          [StickyColor.Sky]: styles.SurfaceWithSky,
        };
      `,
      errors: [{ messageId: "mixedFamily" }],
    },
    {
      code: `
        const styles = stylex.create({
          RootWithLavender: {},
        });
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.RootWithLavender,
          [StickyColor.Sky]: styles.RootWithSky,
        };
      `,
      errors: [{ messageId: "unknownStyleKey" }],
    },
    {
      code: `
        enum StickyColor { Lavender = "LAVENDER", Sky = "SKY" }
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.RootWithLavender,
        };
      `,
      errors: [{ messageId: "missingVariant" }],
    },
    {
      code: `
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: getStyle(),
        };
      `,
      errors: [{ messageId: "styleValue" }],
    },
  ],
});
