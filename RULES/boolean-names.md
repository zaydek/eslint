# Boolean Names

Topic: TypeScript
Rule: `agentic/boolean-names`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/boolean-names`

Enforces predicate-style names for boolean-like values.

## Rule Shape

- Matches local variables initialized to boolean literals.
- Matches the first element of array destructuring when initialized by
  `useState(true)`, `useState(false)`, `React.useState(true)`, or
  `React.useState(false)`.
- Only reports the complete known boolean-ish bare-name set: `open`, `editing`,
  `hovered`, `selected`, `checked`, `closing`, `active`, `disabled`,
  `visible`, and `mounted`.
- Rename flagged bare names to predicate-prefixed forms, for example `open` to
  `isOpen`, `selected` to `isSelected`, or `checked` to `isChecked`.
- Does not inspect object properties, parameters, enum members, type members, or
  boolean names outside the initializer shapes above.
- Setter alignment is owned by `agentic/state-setter-pairs`.

Valid:

```ts
const isOpen = true;
const [isMounted, setIsMounted] = useState(false);
```

Invalid:

```ts
const open = true;
const [mounted, setMounted] = useState(false);
```
