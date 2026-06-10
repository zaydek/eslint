import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { commentCapitalizationRule } from "./comment-capitalization.mjs";

const ruleTester = createRuleTester();

ruleTester.run("comment-capitalization", commentCapitalizationRule, {
  valid: [
    "// Good comment\nconst value = 1;",
    "// Good first line\n// continued lower-case line\nconst value = 1;",
    '/// <reference types="vite/client" />\nconst value = 1;',
    '// <reference types="vite/client" />\nconst value = 1;',
    "/*\n\n# Heading\n\nScope: code/\n\n*/\nconst value = 1;",
    'import * as stylex from "@stylexjs/stylex";\n// Root\n//   RootChild\n//\nconst styles = stylex.create({ Root: {}, RootChild: {} });',
  ],
  invalid: [
    { code: "// bad comment\nconst value = 1;", errors: [{ messageId: "uppercase" }] },
    { code: "/* bad block */\nconst value = 1;", errors: [{ messageId: "uppercase" }] },
  ],
});
