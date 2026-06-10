# Ref Names

Topic: React
Rule: `agentic/ref-names`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/ref-names`

Requires variables initialized by `useRef` to end with `Ref`. Ref objects are
mutable containers, not the contained value, so the binding name should make that
clear at the use site.

## Rule Shape

- Matches simple variable declarators initialized by `React.useRef(...)` or
  `useRef(...)`.
- Reports the variable identifier when it does not end with `Ref`.
- Accepts the exact name `ref` for a component's single ref; the suffix rule
  exists to disambiguate multiple refs, and `refRef` would be nonsense.
- Does not inspect state variables, parameters, object properties, or values that
  are passed around after initialization.
- Does not validate whether the `Ref` suffix is semantically ideal beyond the
  syntactic suffix.

Valid:

```ts
const doneRef = React.useRef(false);
```

Valid, imported hook:

```ts
const inputRef = useRef<HTMLInputElement | null>(null);
```

Valid, single bare ref:

```ts
const ref = React.useRef<HTMLDivElement | null>(null);
```

Invalid:

```ts
const done = React.useRef(false);
```
