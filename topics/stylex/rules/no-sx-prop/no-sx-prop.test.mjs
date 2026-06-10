import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { noSxPropRule } from "./no-sx-prop.mjs";

const ruleTester = createRuleTester();

ruleTester.run("no-sx-prop", noSxPropRule, {
  valid: ["const node = <div {...stylex.props(styles.Root)} />;"],
  invalid: [{ code: "const node = <div sx={styles.Root} />;", errors: [{ messageId: "noSx" }] }],
});
