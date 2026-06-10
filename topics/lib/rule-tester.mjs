import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { RuleTester } = require("eslint");
const tseslint = require("typescript-eslint");

export function createRuleTester() {
  return new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      sourceType: "module",
    },
  });
}
