import { createRuleTester } from "../../../lib/rule-tester.mjs";
import { noManualMemoizationRule } from "./no-manual-memoization.mjs";

const ruleTester = createRuleTester();

ruleTester.run("no-manual-memoization", noManualMemoizationRule, {
  valid: [
    "function Button(): JSX.Element { return <button />; }",
    "const value = React.useState(false);",
    "const notify = (message: string): void => { console.log(message); };",
  ],
  invalid: [
    {
      code: "const notify = useCallback(() => {}, []);",
      errors: [{ messageId: "manualMemoization" }],
    },
    {
      code: "const notify = React.useCallback(() => {}, []);",
      errors: [{ messageId: "manualMemoization" }],
    },
    { code: "const value = useMemo(() => 1, []);", errors: [{ messageId: "manualMemoization" }] },
    {
      code: "const value = React.useMemo(() => 1, []);",
      errors: [{ messageId: "manualMemoization" }],
    },
    { code: "export default memo(Button);", errors: [{ messageId: "manualMemoization" }] },
    { code: "export default React.memo(Button);", errors: [{ messageId: "manualMemoization" }] },
  ],
});
