import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { enumKindSuffixRule } from "./enum-kind-suffix.mjs";

const ruleTester = createRuleTester();

ruleTester.run("enum-kind-suffix", enumKindSuffixRule, {
  valid: [
    'enum BoardActionKind { StickyCreate = "STICKY_CREATE" }',
    'enum MoveResultKind { Success = "SUCCESS" }',
    'enum StickyColor { Lavender = "LAVENDER" }',
  ],
  invalid: [
    {
      code: 'enum EditorActionType { Reinitialize = "REINITIALIZE" }',
      errors: [{ messageId: "kindSuffix" }],
    },
    { code: 'enum MoveResultType { Success = "SUCCESS" }', errors: [{ messageId: "kindSuffix" }] },
  ],
});
