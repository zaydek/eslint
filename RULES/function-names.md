# Function Names

Topic: TypeScript
Rule: `agentic/function-names`
Status: disabled rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/function-names`

Disabled. The desired convention is semantic helper names that read like clear
actions, but ESLint cannot prove verb/noun quality without a brittle dictionary
or a language model. A fixed prefix list is deterministic, but it is not the same
as proving the name is good, so this rule is not exported in the public rule map.

The implementation remains as a draft fixture surface only. Do not treat it as
an enforced convention until the rule can be stated as a stable syntax contract.

## Rule Shape

- Matches `FunctionDeclaration` names.
- Allows PascalCase components and `useX` hooks.
- Allows the explicit exceptions `recurse`, `reducer`, and `preview`.
- Otherwise expects a lower-case action/predicate prefix followed by an
  uppercase PascalCase boundary.
- The complete accepted prefix set is `add`, `apply`, `are`, `begin`, `blur`,
  `build`, `can`, `cancel`, `check`, `clear`, `close`, `collect`, `commit`,
  `compare`, `compute`, `copy`, `count`, `create`, `delete`, `derive`,
  `dispatch`, `extract`, `filter`, `find`, `focus`, `format`, `get`, `handle`,
  `has`, `is`, `join`, `load`, `map`, `merge`, `mount`, `move`, `normalize`,
  `open`, `parse`, `read`, `remove`, `render`, `reset`, `resolve`, `save`,
  `select`, `send`, `set`, `should`, `sort`, `split`, `start`, `stop`,
  `toggle`, `transform`, `update`, `validate`, and `write`.

Valid:

```ts
function getThing(): string {
  return 'x';
}

function applyVariant(): void {}

function recurse(): void {}
```

Invalid:

```ts
function thing(): string {
  return 'x';
}
```
