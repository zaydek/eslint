import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { refNamesRule } from "./ref-names.mjs";

const ruleTester = createRuleTester();

ruleTester.run("ref-names", refNamesRule, {
  valid: [
    "const doneRef = React.useRef(false);",
    "const inputRef = useRef<HTMLInputElement | null>(null);",
    "const done = false;",
    "const [valueRef, setValueRef] = React.useState(null);",
  ],
  invalid: [
    { code: "const done = React.useRef(false);", errors: [{ messageId: "refSuffix" }] },
    {
      code: "const input = useRef<HTMLInputElement | null>(null);",
      errors: [{ messageId: "refSuffix" }],
    },
  ],
});
