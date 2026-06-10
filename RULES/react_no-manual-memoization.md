# No Manual Memoization

Topic: React
Rule: `agentic/no-manual-memoization`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/no-manual-memoization`

Disallows manual React memoization APIs in React Compiler code. The compiler is
responsible for stable identity and memoization, so components should stay direct
unless a future documented exception is proven necessary.

## Rule Shape

- Reports calls to `useCallback(...)` and `React.useCallback(...)`.
- Reports calls to `useMemo(...)` and `React.useMemo(...)`.
- Reports calls to `memo(...)` and `React.memo(...)`.
- Does not inspect imports or dependency arrays.
- Does not report ordinary functions, local state, or non-React APIs.

Valid:

```tsx
function Button(): JSX.Element {
  return <button />;
}

function notify(message: string): void {
  console.log(message);
}
```

Invalid:

```tsx
const notify = useCallback(() => {}, []);
export default React.memo(Button);
```
