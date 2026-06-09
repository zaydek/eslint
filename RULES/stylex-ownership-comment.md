# StyleX Ownership Comment

Topic: StyleX
Rule: `agentic/stylex-ownership-comment`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/stylex-ownership-comment`

Requires each `stylex.create` call to have a directly preceding ownership
comment that accounts for every concrete style key using the
`topics/stylex/OWNERSHIP.md`
contract. Prefer contiguous `//` comments ending with an empty `//` separator
line; plain block comments are accepted for compatibility. Prose notes may sit
above the ownership DSL inside the same line-comment block. The parser ignores
initial non-entry prose until the first parseable DSL entry; after that, every
non-blank line is contract syntax. A blank `//` row before the first DSL entry
is preferred for readability. Line-style ownership comments must separate major
root-level regions with an empty `//` row.

Required modifier axes use `{...}` and must be pick-one unions. Optional
modifier axes use `?{...}` and may be boolean flags or unions. Pseudo-classes
and data selectors stay in the style objects, not the ownership contract.

## Rule Shape

- A directly preceding ownership comment is the closest comment block before
  the statement containing `stylex.create`, with only whitespace between the
  comment block and that statement.
- Another intervening comment becomes the closest comment block, so directives
  such as `// eslint-disable-next-line` must sit above the ownership block or be
  handled another way.
- Line comments should be contiguous `//` rows and end with an empty `//`
  separator row.
- Every pair of adjacent major root-level regions must be separated by an empty
  `//` row, regardless of whether the prior region had nested children.
- Every concrete `stylex.create` key must be listed or expanded by the contract,
  including function-valued dynamic keys such as `DotColor(color<string>)`, and
  every expanded contract key must exist in `stylex.create`.
- Contract indentation must agree with the JSX element that receives each style
  key.
- Plain block comments are normalized as their raw inner text. They do not strip
  leading JSDoc `*` prefixes, so line-style `//` ownership comments are the
  preferred form.

Valid:

```ts
// Root{Is{Compact|Comfortable}}, ?{IsSelected}
//   Header
//     HeaderTitle
//
//   Footer
//     FooterAvatarStack
//
const styles = stylex.create({
  Root: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  RootIsSelected: {},
  Header: {},
  HeaderTitle: {},
  Footer: {},
  FooterAvatarStack: {},
});
```

Valid with a prose note:

```ts
// Plain stylex.create stays here in the component file. A sibling `.stylex.ts`
// is only warranted when a component needs its own stylex.defineVars.
//
// Card
//   CardTitle
//
const styles = stylex.create({
  Card: {},
  CardTitle: {},
});
```

Invalid:

```ts
// Card
//
const styles = stylex.create({
  Card: {},
  CardTitle: {},
});
```

Invalid:

```ts
// Root
//   Header
//     HeaderTitle
//   Footer
//
const styles = stylex.create({
  Root: {},
  Header: {},
  HeaderTitle: {},
  Footer: {},
});
```
