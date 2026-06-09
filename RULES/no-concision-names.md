# No Concision Names

Topic: TypeScript
Rule: `agentic/no-concision-names`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/no-concision-names`

Flags terse identifier segments where the full word is clearer. Prefer
`document`, `configuration`, `event`, and `ticket` over `doc`, `cfg`, `config`,
`evt`, and `tkt`.

## Rule Shape

- Scans identifiers.
- Splits identifier names on camelCase boundaries, underscores, and hyphens,
  then compares lower-cased segments.
- The complete banned segment map is `cfg -> configuration`,
  `config -> configuration`, `doc -> document`, `evt -> event`, and
  `tkt -> ticket`.
- Single-character callback parameters on function expressions and arrow
  functions are allowed.

Valid:

```ts
const configurationPath = './settings.json';
const documentBody = '';
```

Invalid:

```ts
const configPath = './settings.json';
const docBody = '';
```
