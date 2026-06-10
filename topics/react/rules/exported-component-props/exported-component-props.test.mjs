import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { exportedComponentPropsRule } from "./exported-component-props.mjs";

const ruleTester = createRuleTester();

ruleTester.run("exported-component-props", exportedComponentPropsRule, {
  valid: [
    `
export type ButtonProps = { label: string };
export function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
`,
    `
type ButtonProps = { label: string };
export default function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
`,
  ],
  invalid: [
    {
      code: `
type ButtonProps = { label: string };
export function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
`,
      errors: [{ messageId: "exportedProps" }],
    },
  ],
});
