# Function Declarations

Topic: TypeScript
Rule: `agentic/function-declarations`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/function-declarations`

Requires non-trivial named functions to use `function` declarations. One-line
arrow expressions remain acceptable.

## Rule Shape

- Matches `const lowerCamelName = (...) => { ... }` variable declarators.
- Reports only block-bodied arrow functions.
- Allows expression-bodied arrows such as `const getLabel = (): string => 'x'`.
- Allows PascalCase bindings because component naming is handled separately.
- Does not inspect anonymous callback arguments.

Valid:

```ts
function getThing(): string {
  return 'x';
}

const getLabel = (): string => 'x';
```

Invalid:

```ts
const getThing = (): string => {
  return 'x';
};
```
