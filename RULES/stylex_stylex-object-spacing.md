# StyleX Object Spacing

Topic: StyleX
Rule: `agentic/stylex-object-spacing`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/stylex-object-spacing`

Disallows blank-line grouping inside `stylex.create`. The hierarchy belongs in
the ownership comment, and the object remains a compact flat map.

## Rule Shape

- Applies to the full text range of the object expression passed to
  `stylex.create(...)`.
- Reports any blank line inside that object, including blank lines between
  top-level keys and blank lines inside nested selector/value objects.
- Separator comments are allowed only when they do not introduce a blank line.

Valid:

```ts
// Card
//   CardTitle
//
const styles = stylex.create({ Card: {}, CardTitle: {} });
```

Invalid:

```ts
// Card
//   CardTitle
//
const styles = stylex.create({
  Card: {},

  CardTitle: {},
});
```
