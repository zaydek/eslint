# StyleX Placement

Topic: StyleX
Rule: `agentic/stylex-placement`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/stylex-placement`

Requires the `const styles = stylex.create(...)` declaration to stay at the
bottom of the file after function declarations.

## Rule Shape

- Matches a top-level variable declaration containing `styles = stylex.create(...)`.
- The binding name must be exactly `styles`; other `stylex.create` bindings are
  out of scope for this placement rule.
- Reports when a function declaration, named exported function declaration, or
  default exported function declaration appears later in the same program.
- Does not currently report arrow-function components declared after `styles`.
- Does not currently enforce placement for variant maps, token aliases,
  `stylex.defineVars`, arrays, or other colocated style constants.

Valid:

```tsx
function Component(): JSX.Element {
  return <div {...stylex.props(styles.Root)} />;
}

// Root
//
const styles = stylex.create({
  Root: {},
});
```

Invalid:

```tsx
// Root
//
const styles = stylex.create({
  Root: {},
});

function Component(): JSX.Element {
  return <div {...stylex.props(styles.Root)} />;
}
```
