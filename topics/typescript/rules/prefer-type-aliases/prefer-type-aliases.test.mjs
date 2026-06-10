import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { preferTypeAliasesRule } from "./prefer-type-aliases.mjs";

const ruleTester = createRuleTester();

ruleTester.run("prefer-type-aliases", preferTypeAliasesRule, {
  valid: [
    `
type ShortcutsModalProps = {
  onClose: () => void;
};
`,
    `
export type BoardAction = {
  kind: BoardActionKind.Create;
};
`,
    `
declare global {
  interface Window {
    __DEBUG__: boolean;
  }
}
`,
    `
declare module 'external-package' {
  interface PackageOptions {
    isEnabled: boolean;
  }
}
`,
  ],
  invalid: [
    {
      code: `
interface ShortcutsModalProps {
  onClose: () => void;
}
`,
      errors: [{ messageId: "preferType" }],
    },
    {
      code: `
export interface BoardAction {
  kind: BoardActionKind.Create;
}
`,
      errors: [{ messageId: "preferType" }],
    },
  ],
});
