# StyleX Props First

Topic: StyleX
Rule: `agentic/stylex-props-first`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/stylex-props-first`

Requires JSX spreads that call `stylex.props(...)` to appear before all other
attributes on the same JSX opening element. This keeps StyleX composition
visually deterministic and makes later non-style attributes easy to scan.

## Rule Shape

- Matches `JSXOpeningElement` attributes.
- Reports a JSX spread attribute when its expression is exactly a
  `stylex.props(...)` call and the spread is not the first attribute.
- Does not report ordinary spread attributes such as `{...props}`.
- Does not report aliases such as `sx.props(...)`; use the canonical
  `import * as stylex from "@stylexjs/stylex"` namespace.
- Does not inspect the contents or order of arguments passed to
  `stylex.props(...)`.

Valid:

```tsx
const node = <div {...stylex.props(styles.Root)} id="root" />;
```

Invalid:

```tsx
const node = <div id="root" {...stylex.props(styles.Root)} />;
```
