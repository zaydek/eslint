# Named Nested Types

Topic: TypeScript
Rule: `agentic/named-nested-types`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/named-nested-types`

Disallows inline nested object member types. Compose named types with stable
suffixes such as `Props`, `PropsItem`, `Return`, and `ReturnFoo`.

## Rule Shape

- Matches TypeScript property signatures.
- Reports when the property type itself is an inline object type literal.
- Reports when the property type is `Array<{ ... }>` or `{ ... }[]`.
- Does not currently unwrap records, unions, intersections, function parameter
  types, method return types, or deeper nested object literals beyond those
  direct property shapes.

Valid:

```ts
export type FooReturnItem = {
  /** Stable external identifier for the item. */
  id: string;
};

export type FooReturn = {
  /** Item returned by the loader. */
  item: FooReturnItem;
};
```

Invalid:

```ts
export type FooReturn = {
  /** Item returned by the loader. */
  item: {
    id: string;
  };
};
```
