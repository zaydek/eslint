# Named Complex Return Types

Topic: TypeScript
Rule: `agentic/named-complex-return-types`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/named-complex-return-types`

Disallows inline object literal return types. Complex return shapes should be
named so the signature is predictable and reusable.

## Rule Shape

- Matches function declarations, function expressions, and arrow functions with
  explicit return type annotations.
- Reports only when the return type annotation itself is an inline object type
  literal.
- Does not currently unwrap arrays, promises, tuples, unions, intersections, or
  inferred return types.

Valid:

```ts
export type FooReturn = {
  /** Display text returned by the foo loader. */
  foo: string;
};

export function getFoo(): FooReturn {
  return { foo: 'x' };
}
```

Invalid:

```ts
export function getFoo(): { foo: string } {
  return { foo: 'x' };
}
```
