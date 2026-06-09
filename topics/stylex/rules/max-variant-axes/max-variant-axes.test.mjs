import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { maxVariantAxesRule } from './max-variant-axes.mjs';

const ruleTester = createRuleTester();

ruleTester.run('max-variant-axes', maxVariantAxesRule, {
  valid: [
    `
      // root(:hover), rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}
      //   title
      //
      const styles = stylex.create({
        root: {},
        rootColorPink: {},
        rootColorBlue: {},
        rootDensityCompact: {},
        rootDensityComfortable: {},
        title: {},
      });
    `,
    // No ownership comment: stylex-ownership-comment owns that failure.
    'const styles = stylex.create({ root: {} });',
    {
      code: `
        // root, rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}, rootState{Idle,Busy}
        //
        const styles = stylex.create({
          root: {},
          rootColorPink: {},
          rootColorBlue: {},
          rootDensityCompact: {},
          rootDensityComfortable: {},
          rootStateIdle: {},
          rootStateBusy: {},
        });
      `,
      options: [{ maxAxes: 3 }],
    },
  ],
  invalid: [
    {
      code: `
        // root, rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}, rootState{Idle,Busy}
        //
        const styles = stylex.create({
          root: {},
          rootColorPink: {},
          rootColorBlue: {},
          rootDensityCompact: {},
          rootDensityComfortable: {},
          rootStateIdle: {},
          rootStateBusy: {},
        });
      `,
      errors: [{ messageId: 'tooManyAxes' }],
    },
  ],
});
