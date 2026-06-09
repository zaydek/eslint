# No SX Prop

Topic: StyleX
Rule: `agentic/no-sx-prop`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/no-sx-prop`

Prevents the old `sx` convenience prop from appearing in JSX. Components should
use `stylex.props(...)` directly.

## Rule Shape

- Reports every JSX attribute whose name is exactly `sx`.
- Does not inspect the attribute value.
- Does not require the same element to also use `{...stylex.props(...)}`.

Valid:

```tsx
const node = <div {...stylex.props(styles.Root)} />;
```

Invalid:

```tsx
const node = <div sx={styles.Root} />;
```
