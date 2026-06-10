import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { componentPropsRule } from "./component-props.mjs";

const ruleTester = createRuleTester();

ruleTester.run("component-props", componentPropsRule, {
  valid: [
    `
type RenameDialogProps = { title?: string };
function RenameDialog({ title = 'Rename board' }: RenameDialogProps): JSX.Element {
  return <div>{title}</div>;
}
`,
    `
type InlineCrumbProps = { label: string };
function InlineCrumb(props: InlineCrumbProps): JSX.Element {
  return <button>{props.label}</button>;
}
`,
  ],
  invalid: [
    {
      code: `
function InlineCrumb(props: { label: string }): JSX.Element {
  return <button>{props.label}</button>;
}
`,
      errors: [{ messageId: "namedType" }],
    },
    {
      code: `
function InlineCrumb({ label }): JSX.Element {
  return <button>{label}</button>;
}
`,
      errors: [{ messageId: "namedType" }],
    },
  ],
});
