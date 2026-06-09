# Reducer Dispatch Names

Topic: React
Rule: `agentic/reducer-dispatch-names`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/reducer-dispatch-names`

Requires `useReducer` dispatch variables to use exact `[thing, dispatchThing]`
pairs.

## Rule Shape

- Matches array destructuring initialized by `useReducer(...)` or
  `React.useReducer(...)`.
- Checks the first two array elements when both are identifiers.
- The second identifier must be exactly `dispatch` plus the capitalized first
  identifier, for example `board` and `dispatchBoard`.

Valid:

```ts
const [board, dispatchBoard] = useReducer(reducer, initialValue);
```

Invalid:

```ts
const [board, setBoard] = useReducer(reducer, initialValue);
```
