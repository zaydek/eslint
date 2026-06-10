import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { stylexPlacementRule } from "./stylex-placement.mjs";

const ruleTester = createRuleTester();

ruleTester.run("stylex-placement", stylexPlacementRule, {
  valid: [
    `
function Component(): JSX.Element {
  return <div />;
}
const styles = stylex.create({});
`,
  ],
  invalid: [
    {
      code: `
const styles = stylex.create({});
function Component(): JSX.Element {
  return <div />;
}
`,
      errors: [{ messageId: "placement" }],
    },
  ],
});
