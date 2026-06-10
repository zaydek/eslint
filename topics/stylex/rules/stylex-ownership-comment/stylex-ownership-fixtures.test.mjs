import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { stylexOwnershipCommentRule } from "./stylex-ownership-comment.mjs";

const require = createRequire(import.meta.url);
const { Linter } = require("eslint");
const tseslint = require("typescript-eslint");

const ruleRoot = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(ruleRoot, "fixtures");
const fixtureFiles = readdirSync(fixtureRoot)
  .filter((fileName) => fileName.endsWith(".tsx"))
  .map((fileName) => `fixtures/${fileName}`)
  .sort();

for (const fixtureFile of fixtureFiles) {
  const linter = new Linter({ configType: "flat" });
  const code = readFileSync(resolve(ruleRoot, fixtureFile), "utf8");
  const messages = linter.verify(
    code,
    [
      {
        files: ["**/*.tsx"],
        languageOptions: {
          ecmaVersion: 2022,
          parser: tseslint.parser,
          parserOptions: { ecmaFeatures: { jsx: true } },
          sourceType: "module",
        },
        plugins: { agentic: { rules: { "stylex-ownership-comment": stylexOwnershipCommentRule } } },
        rules: { "agentic/stylex-ownership-comment": "error" },
      },
    ],
    { filename: fixtureFile },
  );

  assert.deepEqual(
    messages.map((message) => ({
      messageId: message.messageId,
      line: message.line,
      message: message.message,
    })),
    [],
    fixtureFile,
  );
}

console.log("stylex ownership fixture tests ok");
