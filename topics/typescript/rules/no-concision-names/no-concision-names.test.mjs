import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { noConcisionNamesRule } from "./no-concision-names.mjs";

const ruleTester = createRuleTester();

ruleTester.run("no-concision-names", noConcisionNamesRule, {
  valid: [
    "const configurationPath = getConfigurationPath();",
    "const documentBody = getDocumentBody(markdown);",
    "items.map((x) => x.id);",
  ],
  invalid: [
    {
      code: "const configPath = getConfigPath();",
      errors: [{ messageId: "noConcision" }, { messageId: "noConcision" }],
    },
    {
      code: "const doc = getDoc(markdown);",
      errors: [{ messageId: "noConcision" }, { messageId: "noConcision" }],
    },
  ],
});
