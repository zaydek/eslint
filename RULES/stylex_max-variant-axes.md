# Max Variant Axes

Topic: StyleX
Rule: `agentic/max-variant-axes`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/max-variant-axes`

Limits how many orthogonal variant families (`Root{With{…}}`, `Root{Is{…}}`,
`Root{Has{…}}`) one styled element may accrue, as counted from each axis entry
across the required and optional modifier blocks, not from union values inside
nested braces. Defaults to 2 axes per element; configurable via
`{ maxAxes }`. Optional boolean keys like `Root?{IsCursor}` are singleton axes.
This is the lint encoding of "refuse the new axis until it is proven."

## Rule Shape

- Counts expansion families per ownership entry in the directly preceding
  StyleX ownership comment.
- Required union axes, optional union axes, and optional boolean axes all count.
- The default limit is 2 axes per element.
- Use `{ maxAxes: 3 }` only when a third axis is accepted deliberately.

Valid:

```ts
// Root{With{Pink|Blue}, Is{Compact|Comfortable}}
//   Title
//
const styles = stylex.create({
  Root: {},
  RootWithPink: {},
  RootWithBlue: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  Title: {},
});
```

Valid with `{ maxAxes: 3 }`:

```ts
// Two required families plus a singleton optional state key.
// This requires the rule option `{ maxAxes: 3 }`.
//
// Root{With{Lavender|Sky}, Is{Compact|Comfortable}}, ?{IsCursor}
//   Title
//   Footer
//
const styles = stylex.create({
  Root: {},
  RootWithLavender: {},
  RootWithSky: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  RootIsCursor: {},
  Title: {},
  Footer: {},
});
```

Invalid:

```ts
// Root{With{Pink|Blue}, Is{Compact|Comfortable}, Has{Idle|Busy}}
//
const styles = stylex.create({
  Root: {},
  RootWithPink: {},
  RootWithBlue: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  RootHasIdle: {},
  RootHasBusy: {},
});
```
