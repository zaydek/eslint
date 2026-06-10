# Enum Member Values

Topic: TypeScript
Rule: `agentic/enum-member-values`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/enum-member-values`

Requires every enum member to carry an explicit string initializer.
Auto-numbered members break serialization and silently change meaning when
reordered.

## Rule Shape

- Matches TypeScript enum declarations.
- Every member initializer must be a string literal.
- Bare members and explicit numeric initializers such as `= 0` are invalid.
- String value casing is handled separately by `agentic/enum-value-casing`.

Valid:

```ts
enum StickyColor {
  Lavender = "LAVENDER",
}
```

Valid, in practice:

```ts
// Values are wire-stable: persisted boards survive member reordering.
export enum StickyPriority {
  P0 = "P0",
  P1 = "P1",
  P2 = "P2",
  P3 = "P3",
}
```

Invalid:

```ts
enum StickyColor {
  Lavender,
}
```
