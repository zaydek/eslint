import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { enumStyleVariantsRule } from './enum-style-variants.mjs';

const ruleTester = createRuleTester();

ruleTester.run('enum-style-variants', enumStyleVariantsRule, {
  valid: [
    `
      enum StickyColor { Lavender = "LAVENDER", Sky = "SKY" }
      const styles = stylex.create({
        root: {},
        rootColorLavender: {},
        rootColorSky: {},
      });
      const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
        [StickyColor.Lavender]: styles.rootColorLavender,
        [StickyColor.Sky]: styles.rootColorSky,
      };
    `,
    // Without a same-file enum or stylex.create, only the family shape is checked.
    `
      const MapStickyColorToStyle = {
        [StickyColor.Lavender]: styles.rootColorLavender,
        [StickyColor.Sky]: styles.rootColorSky,
      };
    `,
    // Exclude<> narrows the key set on purpose; completeness is the type's job.
    `
      enum StickyColor { None = "NONE", Lavender = "LAVENDER", Sky = "SKY" }
      const MapStickyColorToStyle: Record<Exclude<StickyColor, StickyColor.None>, stylex.StyleXStyles> = {
        [StickyColor.Lavender]: styles.rootColorLavender,
        [StickyColor.Sky]: styles.rootColorSky,
      };
    `,
  ],
  invalid: [
    {
      code: `
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.rootLavenderColor,
        };
      `,
      errors: [{ messageId: 'variantSuffix' }],
    },
    {
      code: `
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.rootColorLavender,
          [StickyColor.Sky]: styles.surfaceColorSky,
        };
      `,
      errors: [{ messageId: 'mixedFamily' }],
    },
    {
      code: `
        const styles = stylex.create({
          rootColorLavender: {},
        });
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.rootColorLavender,
          [StickyColor.Sky]: styles.rootColorSky,
        };
      `,
      errors: [{ messageId: 'unknownStyleKey' }],
    },
    {
      code: `
        enum StickyColor { Lavender = "LAVENDER", Sky = "SKY" }
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: styles.rootColorLavender,
        };
      `,
      errors: [{ messageId: 'missingVariant' }],
    },
    {
      code: `
        const MapStickyColorToStyle = {
          [StickyColor.Lavender]: getStyle(),
        };
      `,
      errors: [{ messageId: 'styleValue' }],
    },
  ],
});
