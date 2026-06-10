# Prefer Type Aliases

Topic: TypeScript
Rule: `agentic/prefer-type-aliases`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/prefer-type-aliases`

Requires ordinary object contracts to use `type` aliases instead of
`interface` declarations. Type aliases compose better with the rest of this
rule set because props, result shapes, nested contracts, and public export
surfaces are all documented around named type aliases.

## Rule Shape

- Matches `TSInterfaceDeclaration`.
- Reports ordinary local or exported interfaces.
- Allows ambient declaration-merging surfaces inside `declare global` and
  `declare module`.
- Does not autofix because converting inherited or merged interfaces can require
  semantic review.
- Prefer a local disable comment only when declaration merging or external
  augmentation truly requires `interface`.

Valid:

```ts
export type ShortcutsModalProps = {
  /** Called when the modal requests closing. */
  onClose: () => void;
};
```

Valid, ambient declaration merging:

```ts
declare global {
  interface Window {
    /** Local debug flag exposed by development builds. */
    __DEBUG__: boolean;
  }
}
```

Invalid:

```ts
export interface ShortcutsModalProps {
  /** Called when the modal requests closing. */
  onClose: () => void;
}
```
