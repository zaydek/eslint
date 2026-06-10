# StyleX Key Names

Topic: StyleX
Rule: `agentic/stylex-key-names`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/stylex-key-names`

Requires nested StyleX ownership keys to inherit the full materialized path of the element
that owns them. The root element is named `Root`; direct children of `Root` may
start bare local regions such as `Header`, `Body`, or `Footer`. Deeper
descendants inherit the full ancestor path. Non-`Root` top-level blocks are
named roots; their direct children must carry that top-level block as a prefix.

In other words: each non-root key below depth 1 must carry its immediate
parent's full key as a prefix.

Valid:

```ts
// Root{With{Pink|Blue|Green}}
//   Title
//
//   Footer
//     FooterAvatarStack
//
const styles = stylex.create({
  Root: {},
  RootWithPink: {},
  RootWithBlue: {},
  RootWithGreen: {},
  Title: {},
  Footer: {},
  FooterAvatarStack: {},
});
```

Invalid:

```ts
// Card
//   CardFooter
//     AvatarStack
//
const styles = stylex.create({ Card: {}, CardFooter: {}, AvatarStack: {} });
```

Valid non-`Root` block:

```ts
// Card
//   CardFooter
//     CardFooterAvatarStack
//
const styles = stylex.create({ Card: {}, CardFooter: {}, CardFooterAvatarStack: {} });
```
