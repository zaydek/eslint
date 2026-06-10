import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { kebabCaseSourceFilenamesRule } from "./kebab-case-source-filenames.mjs";

const ruleTester = createRuleTester();

ruleTester.run("kebab-case-source-filenames", kebabCaseSourceFilenamesRule, {
  valid: [
    { code: "export {};", filename: "/repo/app/src/app.tsx" },
    { code: "export {};", filename: "/repo/app/src/app-data.ts" },
    { code: "export {};", filename: "/repo/app/src/tree.test.ts" },
    { code: "export {};", filename: "/repo/app/src/tokens.stylex.ts" },
    { code: "export {};", filename: "/repo/app/src/stylex-jsx.d.ts" },
    { code: "export {};", filename: "/repo/scripts/App.ts" },
    {
      code: "export {};",
      filename: "/repo/packages/ui/source-root/Card.tsx",
      options: [{ sourceRoots: ["packages/ui/src"] }],
    },
    {
      code: "export {};",
      filename: "/repo/packages/ui/source-root/card.tsx",
      options: [{ sourceRoots: ["packages/ui/source-root"] }],
    },
  ],
  invalid: [
    { code: "export {};", filename: "/repo/app/src/App.tsx", errors: [{ messageId: "filename" }] },
    {
      code: "export {};",
      filename: "/repo/app/src/appData.ts",
      errors: [{ messageId: "filename" }],
    },
    {
      code: "export {};",
      filename: "/repo/app/src/Tree.test.ts",
      errors: [{ messageId: "filename" }],
    },
    {
      code: "export {};",
      filename: "/repo/app/src/board_state.ts",
      errors: [{ messageId: "filename" }],
    },
    {
      code: "export {};",
      filename: "/repo/packages/ui/source-root/Card.tsx",
      options: [{ sourceRoots: ["packages/ui/source-root"] }],
      errors: [{ messageId: "filename" }],
    },
  ],
});
