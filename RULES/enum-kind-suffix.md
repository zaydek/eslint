# Enum Kind Suffix

Topic: TypeScript
Rule: `agentic/enum-kind-suffix`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/enum-kind-suffix`

Prefers `Kind`-suffixed enum names over the legacy `Type` suffix so the
discriminant vocabulary stays aligned with `agentic/discriminant-kind`.

## Rule Shape

- Matches TypeScript enum declarations, including `const enum` and ambient enum
  declarations as parsed enum declarations.
- Reports enum names ending in the case-sensitive PascalCase segment `Type`.
  `MimeType` is flagged; lowercase words such as `Prototype` are not.
- Does not require every enum to end in `Kind`; only the legacy `Type` suffix is
  rejected.
- Does not inspect enum-like object literals.

Valid:

```ts
enum BoardActionKind {
  StickyCreate = 'STICKY_CREATE',
}
```

Valid, in practice:

```ts
export enum BoardActionKind {
  StickyCreate = 'STICKY_CREATE',
  StickyMove = 'STICKY_MOVE',
}

export type BoardAction =
  | { kind: BoardActionKind.StickyCreate; title: string }
  | { kind: BoardActionKind.StickyMove; id: string; priority: StickyPriority };
```

Invalid:

```ts
enum EditorActionType {
  Reinitialize = 'REINITIALIZE',
}
```
