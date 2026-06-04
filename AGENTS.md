# Agents

Repo-level boot doctrine for the private **eslint** package. `CLAUDE.md` is a
symlink to this file so Claude Code, Codex, and future harnesses share one
source of truth.

## What this repo is

`~/GitHub/zaydek/eslint` is the private shared ESLint convention package for
Zaydek repos. It translates deterministic Operator conventions into AST-aware
rules and exposes them as `@zaydek/eslint`.

The source repo is private on GitHub. Downstream repos may consume it through a
local file dependency during active development, for example
`"@zaydek/eslint": "file:../../eslint"`.

The current public rule IDs are flat, such as `agentic/boolean-names`, because
existing consumers are wired that way. Internally, rules are grouped by topic so
the package can later evolve toward names like `agentic/typescript/boolean-names`
without making every implementation folder a flat pile.

## Repo map

Grammar: `{:name}` is a typed placeholder, `?literal/` is optional, `#` starts
an inline policy comment.

```text
{repo-root}/
├── AGENTS.md                              # This file
├── CLAUDE.md -> AGENTS.md                 # Symlink so Claude Code reads this on first load
├── package.json                           # Private package manifest for @zaydek/eslint
├── package-lock.json                      # Locked local test dependencies
├── README.md -> RULES.md                  # Human-doc shortcut for editors and conventional entrypoints
├── RULES.md                               # Single rule reference with TOC and examples
├── eslint.layout                          # Checkable shape for this repo
├── test.mjs                               # Rule fixture runner
├── lib/
│   └── {:helper}.mjs                      # Shared test helpers and exported domain helpers
└── topics/
    ├── index.mjs                          # Topic-grouped and flat public rule export map
    └── {:topic}/                          # Topic grouping: comments / react / stylex / typescript
        └── rules/
            ├── index.mjs                  # Topic rule export map
            └── {:rule}/
                ├── {:rule}.mjs            # Deterministic convention rule
                └── {:rule}.test.mjs       # Rule-local executable examples
```

## Layers

- `topics/{topic}/rules/{rule}/{rule}.mjs` owns one rule implementation.
- `topics/{topic}/rules/{rule}/{rule}.test.mjs` owns executable examples for
  that rule. Every bug fix should add a fixture that would have failed before.
- `topics/{topic}/rules/index.mjs` exports the topic-local rule map.
- `topics/index.mjs` exports both the topic-grouped map and the flat public rule
  map consumed by downstream `eslint.config.js` files.
- `lib/rule-tester.mjs` owns shared RuleTester setup for fixtures.
- `lib/stylex-ownership.mjs` and `lib/stylex-ownership-infer.mjs` own the
  StyleX ownership domain helpers exported for downstream tools.
- `package.json` owns package exports and declares `eslint` /
  `typescript-eslint` as peer dependencies.
- `RULES.md` is the human-readable rule contract. Keep it in sync with every rule.

Do not scatter rule documentation into per-rule Markdown files. This subtree
uses one `RULES.md` so the Operator can scan one TOC and compare rules quickly.
`README.md` is a symlink to `RULES.md` for human-level documentation shortcuts.

## Consuming the package

Downstream repos wire this package through their own flat ESLint config. The
`agentic/` prefix below comes from the consumer's `plugins` key; this package
exports flat rule keys such as `boolean-names`.

```js
import { rules as agenticRules } from '@zaydek/eslint';

const agenticPlugin = { rules: agenticRules };
const agenticRuleConfig = Object.fromEntries(
  Object.keys(agenticRules).map((ruleName) => [`agentic/${ruleName}`, 'warn']),
);

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { agentic: agenticPlugin },
    rules: { ...agenticRuleConfig },
  },
];
```

Tooling that needs the StyleX ownership inference engine should import the
public helper exports instead of deep relative paths:

```js
import { inferStylexOwnership } from '@zaydek/eslint/lib/stylex-ownership-infer';
```

## Rule doctrine

Good local rules are deterministic and narrow:

- Prefer AST structure over source-string heuristics.
- Prefer warning-level rollout until the repo has been migrated.
- Encode real false positives as valid fixtures.
- Keep messages direct and actionable.
- Do not enforce taste that cannot be stated as a stable syntax contract.
- Do not add autofix unless the transform is obviously safe.

Rule names should describe the convention in plain language. Keep the folder,
file, and public rule key aligned:

```text
topics/typescript/rules/boolean-names/
├── boolean-names.mjs
└── boolean-names.test.mjs
```

```js
export const typescriptRules = {
  'boolean-names': booleanNamesRule,
};
```

## Adding or changing a rule

1. Put the rule under the right topic.
2. Add `{rule}.test.mjs` with valid and invalid examples.
3. Export it from `topics/{topic}/rules/index.mjs`.
4. If it is a new public rule, downstream `eslint.config.js` files can enable it
   from the package export map.
5. Update `RULES.md` with the TOC entry, purpose, and compact examples.
6. Update downstream `CONVENTIONS.md` only when the broader doctrine changed.
7. Run `npm test`.
8. In downstream consumers, run that repo's lint command after updating the
   dependency.

## Current topics

- `comments/` — comment-block capitalization and source-comment conventions.
- `react/` — component props, exported props, reducer dispatch naming.
- `stylex/` — StyleX-only prop usage and style placement.
- `typescript/` — naming, exported type surfaces, return type shape, discriminants.

Add a new topic only when the rule family would become awkward inside an
existing topic.

## Relationship to CONVENTIONS.md

Downstream `CONVENTIONS.md` files own doctrine. `RULES.md` is the enforceable
subset. When a convention stabilizes and can be expressed with AST tests, add or
extend a rule here. When a rule exists, make sure downstream convention text
points readers to this package for mechanical details.

## Verification

Run fixture tests from this repo root:

```sh
npm test
```

Run a downstream app lint surface after dependency updates:

```sh
cd ~/GitHub/zaydek/agentic-kanban/code
npm run lint
```

For warning breakdowns, use the local `eslint:check` skill/tool:

```sh
node ~/GitHub/zaydek/skills/skills/eslint-check/scripts/eslint-check.mjs code
```

## What Not To Do

- Do not create per-rule Markdown docs; maintain `RULES.md`.
- Do not move rules out of their topic folders to make imports shorter.
- Do not silently narrow a rule after a false positive; add a valid fixture and
  document the exception.
- Do not make layout changes here without updating `eslint.layout`.
- Do not treat downstream `CONVENTIONS.md` files as obsolete; they still own
  non-mechanical taste and rationale.
