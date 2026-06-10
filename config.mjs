import stylexPlugin from "@stylexjs/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import { rules as agenticRules } from "./topics/index.mjs";

export const agenticPlugin = { rules: agenticRules };

export const agenticRuleConfig = Object.fromEntries(
  Object.keys(agenticRules).map((ruleName) => [`agentic/${ruleName}`, "warn"]),
);

export const prettierRuleOptions = { objectWrap: "collapse", printWidth: 100 };

export function createZaydekEslintConfig(options = {}) {
  const files = options.files ?? ["src/**/*.{ts,tsx}"];
  const ignores = options.ignores ?? [
    "dist/**",
    "node_modules/**",
    "*.tsbuildinfo",
    "src/generated/**",
  ];
  const filenameSourceRoots = options.filenameSourceRoots ?? ["src"];
  const prettierOptions = options.prettierOptions ?? prettierRuleOptions;

  return defineConfig([
    globalIgnores(ignores),
    {
      files,
      languageOptions: {
        ecmaVersion: 2022,
        parser: tseslint.parser,
        parserOptions: { ecmaFeatures: { jsx: true } },
        globals: { ...globals.browser, ...globals.es2022 },
        sourceType: "module",
      },
      plugins: {
        "@stylexjs": stylexPlugin,
        agentic: agenticPlugin,
        prettier: prettierPlugin,
        "react-hooks": reactHooksPlugin,
      },
      rules: {
        "@stylexjs/valid-styles": "error",
        "@stylexjs/no-unused": "error",
        "@stylexjs/valid-shorthands": "warn",
        "@stylexjs/sort-keys": "warn",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        ...agenticRuleConfig,
        "agentic/kebab-case-source-filenames": ["error", { sourceRoots: filenameSourceRoots }],
        "prettier/prettier": ["warn", prettierOptions],
      },
    },
    eslintConfigPrettier,
  ]);
}

export const zaydekEslintConfig = createZaydekEslintConfig();

export default zaydekEslintConfig;
