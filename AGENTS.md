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
├── config.mjs                             # Shared ESLint v9 flat config for downstream repos
├── prettier.config.mjs                    # Shared package formatting config
├── README.md -> RULES.md                  # Human-doc shortcut for editors and conventional entrypoints
├── RULES.md                               # Compact rule TOC with concise valid/invalid examples
├── RULES/
│   └── {:topic}_{:rule}.md                # Detailed agent-facing rule docs
├── eslint.layout                          # Checkable shape for this repo
├── test.mjs                               # Rule fixture runner
├── tools/
│   └── {:tool}.mjs                        # Repo-local verification/maintenance tools
└── topics/
    ├── index.mjs                          # Topic-grouped and flat public rule export map
    ├── lib/
    │   └── {:helper}.mjs                  # Cross-topic shared helpers
    └── {:topic}/                          # Topic grouping: comments / react / stylex / typescript
        ├── ?OWNERSHIP.md                  # Topic-owned formal spec, used by StyleX ownership
        ├── ?lib/
        │   ├── {:helper}.mjs              # Topic-local shared/domain helpers
        │   └── {:helper}.test.mjs         # Topic-local helper/parser conformance tests
        └── rules/
            ├── index.mjs                  # Topic rule export map
            └── {:rule}/
                ├── {:rule}.mjs            # Deterministic convention rule
                ├── {:rule}.test.mjs       # Rule-local executable examples
                └── ?fixtures/             # Rule-local fixture corpora
                    └── {:slug}.{:ext}     # Rule fixture source file
```

## Layers

- `topics/{topic}/rules/{rule}/{rule}.mjs` owns one rule implementation.
- `topics/{topic}/rules/{rule}/{rule}.test.mjs` owns executable examples for
  that rule. Every bug fix should add a fixture that would have failed before.
- `RULES.md` is the compact human/agent index. It links every rule and shows a
  concise valid/invalid use case.
- `RULES/{topic}_{rule}.md` owns detailed rule intent, examples, exceptions, and
  agent-facing guidance. Keep these files in sync with rule tests.
- `topics/{topic}/rules/index.mjs` exports the topic-local rule map.
- `topics/index.mjs` exports the topic-grouped map, the flat public rule map
  consumed by downstream `eslint.config.js` files, and `dormantRules` for
  implemented draft rules whose docs/examples remain testable while the rules
  stay off for consumers.
- `config.mjs` owns the default ESLint v9 flat config layers for local Zaydek
  TypeScript/React/StyleX apps. Prefer importing this config downstream instead
  of copying plugin setup.
- `topics/lib/rule-tester.mjs` owns shared RuleTester setup for fixtures.
- `tools/verify-rule-docs.mjs` extracts `RULES.md` and `RULES/{topic}_{rule}.md` code
  blocks. `npm run verify-docs-rule` proves each example against its target
  rule; `npm run verify-docs-rule-all` also checks cross-rule consistency
  against the public rule set.
- `tools/update-rules-index.mjs` regenerates compact `RULES.md` examples from
  the first valid/invalid examples in `RULES/{topic}_{rule}.md`.
- `topics/stylex/OWNERSHIP.md` is the formal StyleX ownership contract spec.
- `topics/stylex/lib/ownership-contract.mjs` owns the pure StyleX ownership
  parser/expander described by `topics/stylex/OWNERSHIP.md`.
- `topics/stylex/lib/ownership.mjs` and `topics/stylex/lib/ownership-infer.mjs`
  own StyleX ownership AST/comment and JSX inference helpers. They are exported
  for downstream tools through the package `./lib/stylex-*` export aliases.
- `package.json` owns package exports and declares `eslint` /
  `typescript-eslint` as peer dependencies.
- `RULES.md` and `RULES/{topic}_{rule}.md` are the human-readable rule contract. Keep
  them in sync with every rule.

`README.md` is a symlink to `RULES.md` for human-level documentation shortcuts.

## Consuming the package

Downstream repos wire this package through their own flat ESLint config. The
`agentic/` prefix below comes from the consumer's `plugins` key; this package
exports flat rule keys such as `boolean-names`.

Fast path for a local Zaydek repo:

1. Add the private package as a local dependency from the downstream repo:

```json
{
  "devDependencies": {
    "@zaydek/eslint": "file:../../eslint",
    "@stylexjs/eslint-plugin": "^0.18.0",
    "eslint": "^9.0.0",
    "eslint-plugin-react-hooks": "^7.0.0",
    "globals": "^17.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

2. Install from the downstream repo so the file dependency and peer
   dependencies resolve:

```sh
npm install
```

3. Add or update `eslint.config.js`:

```js
export { default } from "@zaydek/eslint/config";
```

Use `createZaydekEslintConfig` only when a project needs different file globs,
ignores, or filename source roots:

```js
import { createZaydekEslintConfig } from "@zaydek/eslint/config";

export default createZaydekEslintConfig({
  files: ["app/src/**/*.{ts,tsx}"],
  filenameSourceRoots: ["app/src"],
});
```

4. Add a lint script if the downstream repo does not already have one:

```json
{ "scripts": { "lint": "eslint ." } }
```

5. Verify from the downstream repo:

```sh
npm run lint
```

Every diagnostic emitted by this package is intentionally agent-oriented:

```text
<Problem>
Fix: <required action>
See: ~/GitHub/zaydek/eslint/RULES/{topic}_{rule}.md
```

Agents should follow the `See:` path first. The linked rule doc is the contract;
the implementation and tests are secondary debugging surfaces.

Do not enable `dormantRules` in downstream repos. `dormantRules` exists so this
repo can keep draft rule docs and examples testable without exposing undecided
rules through the public flat `rules` map.

Tooling that needs the StyleX ownership inference engine should import the
public helper exports instead of deep relative paths:

```js
import { inferStylexOwnership } from "@zaydek/eslint/lib/stylex-ownership-infer";
```

## Rule doctrine

Good local rules are deterministic and narrow:

- Prefer AST structure over source-string heuristics.
- Prefer warning-level rollout until the repo has been migrated.
- Encode real false positives as valid fixtures.
- Keep messages agent-oriented: one problem line, one `Fix:` line, and one
  `See: ~/GitHub/zaydek/eslint/RULES/{topic}_{rule}.md` line.
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
export const typescriptRules = { "boolean-names": booleanNamesRule };
```

## Adding or changing a rule

1. Put the rule under the right topic.
2. Add `{rule}.test.mjs` with valid and invalid examples.
3. Export it from `topics/{topic}/rules/index.mjs`.
4. If it is a new public rule, export it through the topic map so downstream
   `eslint.config.js` files can enable it from the package export map. If it is
   a dormant draft rule, keep it out of the topic map and expose it through
   `dormantRules` instead.
5. Update `RULES/{topic}_{rule}.md` with intent, boundaries, and examples.
6. Run `npm run update-rules-index` to regenerate compact `RULES.md`.
7. Update downstream `CONVENTIONS.md` only when the broader doctrine changed.
8. Run `npm test`.
9. In downstream consumers, run that repo's lint command after updating the
   dependency.

## Current topics

- `comments/` — comment-block capitalization and source-comment conventions.
- `react/` — component props, exported props, context, imports, hooks, and
  reducer/state naming.
- `stylex/` — StyleX ownership, key naming, prop usage, placement, tokens, and
  enum/axis variant limits.
- `typescript/` — naming, exported type surfaces, return/result shape,
  discriminants, enums, maps, namespaces, and switches.

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

`npm test` also runs `npm run verify-docs-rule` and
`npm run verify-docs-rule-all`, so documented valid/invalid examples must match
their rule and avoid accidental contradictions with other public rules.

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

- Do not leave rule behavior undocumented; maintain both the compact `RULES.md`
  index and the detailed `RULES/{topic}_{rule}.md` page.
- Do not move rules out of their topic folders to make imports shorter.
- Do not silently narrow a rule after a false positive; add a valid fixture and
  document the exception.
- Do not make layout changes here without updating `eslint.layout`.
- Do not treat downstream `CONVENTIONS.md` files as obsolete; they still own
  non-mechanical taste and rationale.
