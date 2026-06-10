import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { stylexPropsFirstRule } from "./stylex-props-first.mjs";

const ruleTester = createRuleTester();

ruleTester.run("stylex-props-first", stylexPropsFirstRule, {
  valid: [
    'const node = <div {...stylex.props(styles.Root)} id="root" />;',
    "const node = <Button {...stylex.props(styles.Root, props.style)} disabled={isDisabled} />;",
    'const node = <div id="root" />;',
    "const node = <div {...props} {...stylex.propsAlias(styles.Root)} />;",
    'const node = <div {...sx.props(styles.Root)} id="root" />;',
  ],
  invalid: [
    {
      code: 'const node = <div id="root" {...stylex.props(styles.Root)} />;',
      errors: [{ messageId: "propsFirst" }],
    },
    {
      code: "const node = <Button disabled={isDisabled} {...stylex.props(styles.Root)} />;",
      errors: [{ messageId: "propsFirst" }],
    },
    {
      code: "const node = <div {...props} {...stylex.props(styles.Root)} />;",
      errors: [{ messageId: "propsFirst" }],
    },
  ],
});
