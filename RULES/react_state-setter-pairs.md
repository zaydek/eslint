# State Setter Pairs

Topic: React
Rule: `agentic/state-setter-pairs`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/state-setter-pairs`

Requires `useState` destructuring to use exact `[thing, setThing]` pairs.
Completes the naming trio with `agentic/boolean-names` and
`agentic/reducer-dispatch-names`.

## Rule Shape

- Matches array destructuring initialized by `useState(...)` or
  `React.useState(...)`.
- Checks the first two array elements when both are identifiers.
- The second identifier must be exactly `set` plus the capitalized first
  identifier, for example `isOpen` and `setIsOpen`.
- Non-identifier elements are ignored.

Valid:

```ts
const [isOpen, setIsOpen] = React.useState(false);
```

Valid, in practice:

```ts
const [modal, setModal] = React.useState<ModalKind>(ModalKind.None);
const [isModalExpanded, setIsModalExpanded] = React.useState(false);
const [fontSize, setFontSize] = React.useState(12);
```

Invalid:

```ts
const [isOpen, setOpen] = React.useState(false);
```
