# StyleX Tokens Only

Topic: StyleX
Rule: `agentic/stylex-tokens-only`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/stylex-tokens-only`

Disallows raw color literals — hex values and color-function syntax such as
`rgb(…)` or `oklch(…)` — inside component `stylex.create` calls; colors come
from tokens. Only colors are policed: sizes, radii, durations, and other
literals are untouched. Files matching `.stylex.` own the raw values and are
exempt.

## Rule Shape

- Applies to component files; filenames containing `.stylex.` are exempt.
- Scans values inside `stylex.create(...)`, including nested objects, arrays,
  conditionals, template literals, and function-valued style keys.
- Reports hex-like colors matching `#[0-9a-fA-F]{3,8}\b`. This intentionally
  reports any 3- to 8-digit hex-like string under a style value, including 5-
  and 7-digit strings that are not valid CSS colors.
- Reports color-function syntax containing `rgb(`, `rgba(`, `hsl(`, `hsla(`,
  `oklch(`, `oklab(`, `lch(`, `lab(`, `hwb(`, `color-mix(`, or `light-dark(`.
- Does not currently report named CSS colors such as `'red'`, `'transparent'`,
  or `'currentColor'`, nor CSS variables such as `'var(--color)'`.

Valid:

```ts
// Root
//
const styles = stylex.create({ Root: { backgroundColor: tokens.colorLavender } });
```

Valid, in practice:

```ts
// Non-color literals are fine; only the color values must come from tokens.
//
// Root
//
const styles = stylex.create({
  Root: {
    backgroundColor: tokens.colorLavender,
    borderRadius: "16px",
    padding: "14px 16px",
    transitionDuration: "150ms",
  },
});
```

Invalid:

```ts
// Root
//
const styles = stylex.create({ Root: { backgroundColor: "#c5b4ee" } });
```
