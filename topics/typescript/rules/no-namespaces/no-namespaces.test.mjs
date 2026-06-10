import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { noNamespacesRule } from "./no-namespaces.mjs";

const ruleTester = createRuleTester();

ruleTester.run("no-namespaces", noNamespacesRule, {
  valid: [
    "export function copyTextSync(text: string): CopyTextSyncResult { return { kind: ResultKind.Success }; }",
    // Ambient declarations describe external shapes; they are out of scope.
    'declare module "untyped-package" { export function helper(): void; }',
    "declare global { interface Window { __DEBUG__: boolean } }",
  ],
  invalid: [
    {
      code: "namespace HTML5Hacks { export function copyTextSync(): void {} }",
      errors: [{ messageId: "noNamespace" }],
    },
    {
      code: "export namespace Components { export function Checkbox(): null { return null; } }",
      errors: [{ messageId: "noNamespace" }],
    },
  ],
});
