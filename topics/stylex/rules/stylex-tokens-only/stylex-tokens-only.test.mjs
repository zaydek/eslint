import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { stylexTokensOnlyRule } from './stylex-tokens-only.mjs';

const ruleTester = createRuleTester();

ruleTester.run('stylex-tokens-only', stylexTokensOnlyRule, {
  valid: [
    `
      const styles = stylex.create({
        root: { backgroundColor: tokens.colorLavender, padding: "16px" },
      });
    `,
    `
      const styles = stylex.create({
        root: { backgroundColor: { default: tokens.colorGray, ":hover": tokens.colorTeal } },
      });
    `,
    // Tokens files own the raw values.
    {
      code: 'export const tokens = stylex.defineConsts({ colorTeal: "hsl(200 100% 50%)" });',
      filename: 'app/stylex/tokens.stylex.ts',
    },
    {
      code: 'const styles = stylex.create({ root: { backgroundColor: "#fff" } });',
      filename: 'app/stylex/sticky.stylex.tsx',
    },
  ],
  invalid: [
    {
      code: 'const styles = stylex.create({ root: { backgroundColor: "#c5b4ee" } });',
      filename: 'app/components/sticky.tsx',
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: `
        const styles = stylex.create({
          root: { backgroundColor: { default: "rgba(0, 0, 0, 0.08)", ":hover": tokens.colorTeal } },
        });
      `,
      filename: 'app/components/sticky.tsx',
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: 'const styles = stylex.create({ root: { boxShadow: `0 0 0 1px ${depth} hsl(0 0% 0%)` } });',
      filename: 'app/components/sticky.tsx',
      errors: [{ messageId: 'rawColor' }],
    },
    {
      code: 'const styles = stylex.create({ root: (isOn) => ({ color: isOn ? "#000" : tokens.colorGray }) });',
      filename: 'app/components/sticky.tsx',
      errors: [{ messageId: 'rawColor' }],
    },
  ],
});
