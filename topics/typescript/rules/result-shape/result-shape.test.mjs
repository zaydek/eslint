import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { resultShapeRule } from "./result-shape.mjs";

const ruleTester = createRuleTester();

ruleTester.run("result-shape", resultShapeRule, {
  valid: [
    `
      export type MoveResult =
        | { kind: MoveResultKind.Success; id: string }
        | { kind: MoveResultKind.Error; error: MoveErrorKind };
    `,
    // Reference members resolve elsewhere; out of scope without type info.
    "export type MoveResult = MoveResultSuccess | MoveResultError;",
    // Non-exported and non-Result types are out of scope.
    "type moveResult = { id: string };",
    "export type MoveArgs = { id: string };",
  ],
  invalid: [
    {
      code: `
        export type MoveResult =
          | { kind: MoveResultKind.Success; id: string }
          | { error: string };
      `,
      errors: [{ messageId: "memberNeedsKind" }, { messageId: "errorKindName" }],
    },
    {
      code: `
        export type MoveResult =
          | { kind: MoveResultKind.Success; id: string }
          | { kind: MoveResultKind.Error; error: MoveError };
      `,
      errors: [{ messageId: "errorKindName" }],
    },
    {
      code: `
        export type MoveResult =
          | { kind: MoveResultKind.Success; id: string }
          | { kind: MoveResultKind.Error; error: string };
      `,
      errors: [{ messageId: "errorKindName" }],
    },
    {
      code: "export type MoveResult = { id: string };",
      errors: [{ messageId: "memberNeedsKind" }],
    },
  ],
});
