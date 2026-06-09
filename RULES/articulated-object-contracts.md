# Articulated Object Contracts

Topic: TypeScript
Rule: `agentic/articulated-object-contracts`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/articulated-object-contracts`

Requires members of named object contracts to carry leading JSDoc comments.
The rule applies to `Props`, `Args`, and `Return` contract families, including
composed types such as `FooArgsBar` and `FooReturnItem`, plus `Options` and
`Configuration` suffixes. The goal is to keep dense object contracts legible
without requiring comments on runtime object literals.

## Rule Shape

- Matches named `type` aliases whose annotation is a type literal.
- Matches named `interface` declarations.
- Applies when the type name contains `Props`, `Args`, or `Return`, or ends in
  `Options` or `Configuration`.
- `Props`, `Args`, and `Return` match as PascalCase segments: the segment must
  be followed by an uppercase letter, digit, or the end of the name. This
  includes `FooArgsBar` and excludes words like `Propshaft` or `Returner`.
- Checks `TSPropertySignature` and `TSMethodSignature` members.
- A member passes when the nearest leading comment is adjacent JSDoc
  (`/** ... */`). Adjacent means the JSDoc ends on the line immediately before
  the member starts; blank lines or intervening `//` comments break the
  association.
- Runtime object literals and non-contract type names are out of scope.

Valid:

```ts
export type EditableTitleProps = {
  /** Current committed title text shown when the control is not editing. */
  value: string;
  /** Called when the component requests entering or leaving edit mode. */
  onEditingChange: (isEditing: boolean) => void;
};
```

Invalid:

```ts
export type EditableTitleProps = {
  value: string;
  onEditingChange: (isEditing: boolean) => void;
};
```
