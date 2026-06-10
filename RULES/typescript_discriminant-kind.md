# Discriminant Kind

Topic: TypeScript
Rule: `agentic/discriminant-kind`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/discriminant-kind`

Prefers `kind` as the canonical string discriminant key for variant object
types. This keeps data variants visually distinct from React and DOM `type`
props.

## Rule Shape

- Matches TypeScript property signatures named `type`.
- Reports only when the property type is a string literal or a union containing
  at least one string literal type.
- Does not inspect runtime object literals, interfaces without such a property,
  or non-string discriminants.
- DOM/React-mirroring props such as `type: 'button' | 'submit'` are a known
  false-positive surface; use a local disable comment when mirroring that API is
  intentional.

Valid:

```ts
export type IconAssetSvg = {
  /** Variant discriminator for SVG icon assets. */
  kind: "svg";
  /** URL used to load the SVG asset. */
  url: string;
};
```

Invalid:

```ts
export type IconAssetSvg = {
  /** Variant discriminator for SVG icon assets. */
  type: "svg";
  /** URL used to load the SVG asset. */
  url: string;
};
```
