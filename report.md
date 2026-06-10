# Skeptical Quality Audit — `@zaydek/eslint` + `prototypes`

Audit date: 2026-06-09
Auditor: Claude (Opus 4.8)
Scope: the `@zaydek/eslint` package and its first consumer `prototypes/app`.

Commits in scope:

- eslint `511089d Run Prettier through shared ESLint config`
- eslint `49cd7c1 Harden shared eslint conventions`
- prototypes `f9f9fa5 Surface shared ESLint warnings in app`
- prototypes `4b8c3a7 Use shared eslint config`

This is a skeptical audit. It assumes nothing about prior work being correct, and
classifies every finding as **bug**, **design risk**, **documentation ambiguity**,
**integration issue**, or **taste/opinion**. Green tests are treated as evidence only
where their actual coverage is stated.

---

## 1. Executive summary

**Is the integration broadly sound?** Yes, mechanically. The package loads, the shared
flat config works, Prettier runs through ESLint as a warning, the dormant rule is
correctly withheld from the public surface, and the prototypes app lints clean and
typechecks. `npm test` is green (184 documented examples verified, plus rule unit tests).
The plumbing is real and works.

**Is it safe to continue building on this?** Yes, with eyes open. Nothing is broken in a
way that blocks the prototypes app today. But several rules are broader, narrower, or more
brittle than their names/docs claim, and the only `error`-level rule has a greedy path
matcher. The risk is not "it will fall over"; the risk is **false positives that train
agents and humans to distrust or silence the linter**, plus **silent false negatives that
make the rules look like they cover more than they do**.

**Top 3 risks**

1. **`component-body-layout` only inspects `FunctionDeclaration` components.** Arrow-function
   components (`const Widget = () => {…}`) — the dominant React idiom — are completely
   invisible to it. The rule advertises "React component bodies" but silently checks a
   minority of them. (Proven: PROBE 1.)
2. **`boolean-names` was materially broadened** in `511089d` by deleting its curated
   `BOOLEANISH_NAMES` allowlist. It now fires on _every_ boolean-literal-initialized
   binding lacking an `is/has/can/should/are` prefix, and the prefix set omits legitimate
   boolean prefixes (`will`, `did`, `was`). This is a large, mostly-undocumented increase in
   false-positive surface. (Proven: PROBE 3, PROBE 4.)
3. **`kebab-case-source-filenames` is the only `error`-level rule and uses a greedy
   `path.includes("/<root>/")` matcher.** In a checkout whose absolute path contains the
   source-root token (e.g. cloned under `~/src/…`), the matcher can treat in-glob files as
   in-root unexpectedly. Because it's the one rule that _fails the build_, a false positive
   here is the most expensive failure mode in the package.

None of these are emergencies. All three are fixable without redesign.

---

## 2. Findings, ordered by severity

> Severity reflects blast radius × likelihood for a real downstream adopter, **not** whether
> a unit test is red. Every "High" below has green tests; the tests simply don't cover the
> failure surface.

### HIGH

#### H1 — `component-body-layout` ignores arrow-function components — **design risk / coverage gap**

- File: `topics/react/rules/component-body-layout/component-body-layout.mjs:76-80`
- The visitor is `FunctionDeclaration` only. Components written as
  `const Widget = () => {…}` / `const Widget: FC = () => {…}` (the prevailing React 19 idiom,
  and the form used across `prototypes/app/src/components/*`) are never checked.
- Proof (PROBE 1): an arrow component with state immediately followed by a derived const and
  a `return`, with zero blank lines, produces **no** `component-body-layout` diagnostic. The
  same body as a `function` declaration produces two `spacing` warnings.
- Why it matters: the rule's `description` says "Require React component bodies to use a
  predictable grouped layout." It silently means "…function-declaration component bodies."
  Agents reading the rule will assume coverage that isn't there, and the layout convention is
  effectively unenforced in the exact codebase shape it targets.
- Suggested fix: also visit `VariableDeclarator` / `ArrowFunctionExpression` /
  `FunctionExpression` whose binding id is PascalCase and whose body is a `BlockStatement`;
  add invalid+valid fixtures for the arrow form.

#### H2 — `boolean-names` allowlist removal widened the rule far past its docs — **design risk**

- File: `topics/typescript/rules/boolean-names/boolean-names.mjs:20-23` (current);
  removed lines visible in `git show 511089d -- …/boolean-names.mjs`.
- Before `511089d`, `reportName` early-returned unless the name matched
  `BOOLEANISH_NAMES = /^(open|editing|hovered|selected|checked|closing|active|disabled|visible|mounted)$/`.
  That guard was deleted. The rule now flags **any** boolean-literal-initialized binding (and
  `useState(<boolean literal>)` first element) whose name fails `^(is|has|can|should|are)[A-Z]`.
- Proof: PROBE 3 (`const loading = true` → flagged), PROBE 4 (`const didMount = true` and
  `const willClose = false` → both flagged).
- Two distinct problems:
  - **Breadth**: this is now a blanket rule. Idioms like `loading`, `ready`, `done`, `found`,
    `success` are all flagged. As `warn` it's tolerable, but the change is large and is not
    called out as a behavior change anywhere a downstream reader would see.
  - **Incomplete prefix set**: `will`, `did`, `was` are legitimate boolean prefixes and are
    rejected; `are` (plural) is allowed but `was`/`will`/`did` are not — an inconsistent set.
- Why it matters: false positives on common, correct names are how a `warn`-level rule gets
  globally ignored. The rule also still only inspects _literal_ initializers (see L3), so it
  is simultaneously too broad (every literal) and too narrow (misses every comparison-derived
  boolean) — a confusing contract.
- Suggested fix: decide the intended contract explicitly. Either (a) restore a curated
  allowlist of name-shapes to flag, or (b) keep the blanket form but broaden the accepted
  prefix set (`will|did|was|should|is|has|can|are`) and document the breadth change in
  `RULES/typescript_boolean-names.md` and the downstream `CONVENTIONS.md`.

#### H3 — `kebab-case-source-filenames` is `error`-level with a greedy path matcher — **design risk / latent bug**

- Files: `config.mjs:55` (forced to `["error", …]`),
  `topics/typescript/rules/kebab-case-source-filenames/kebab-case-source-filenames.mjs:78-87`.
- It is the **only** agentic rule promoted to `error`; every other rule is `warn`. So it is
  the only rule that can fail CI / `eslint .`.
- `isInSourceRoot` matches when the (absolute) filename `=== root`, `startsWith(root + "/")`,
  **or** `includes("/" + root + "/")`. The third clause is greedy: with the shipped default
  `sourceRoots: ["src"]` (config.mjs:27), any absolute path containing a `/src/` segment
  anywhere — including an ancestor directory the developer didn't intend as a source root —
  satisfies it.
- Why it matters: today the prototypes checkout path doesn't collide, and the `files` glob and
  `sourceRoots` happen to align, so the over-broad clause is masked. But the combination
  "error-level + greedy substring match on an absolute path the package doesn't control" is a
  latent hard-failure waiting for a checkout under `~/src/…` or a repo whose `files` glob and
  `sourceRoots` diverge.
- Suggested fix: drop the `includes("/<root>/")` clause and match the source root against the
  path **relative to `cwd`** (anchor at the project root), not the absolute path. Keep no
  autofix (correct — renames are unsafe). Consider whether `error` is the right level for a
  filename-convention rule during rollout, or whether `warn` is safer until adopters migrate.

#### H4 — `articulated-object-contracts` mandates a JSDoc comment on every member of every type/interface — **design risk / taste**

- File: `topics/typescript/rules/articulated-object-contracts/articulated-object-contracts.mjs:37-77`.
- It reports any `TSPropertySignature` / `TSMethodSignature` in a `type` alias or `interface`
  (recursing through nested type literals, unions, intersections) that lacks an immediately
  preceding `/** … */` block. Enabled at `warn` for **all** contracts, exported or not.
- Evidence of cost: `prototypes/app/src/model/types.ts` carries a hand-written JSDoc on
  _every one_ of its ~100 members purely to satisfy this rule (PROBE confirmed the rule fires:
  an injected `type Bad = { foo: string }` is flagged). The team is already paying a real tax.
- Why it matters: presence-only comment rules are low-signal — they can't judge comment
  quality, so they reliably incentivize noise comments (`/** id */ id: string`) written to
  silence the linter, which is what `types.ts` largely contains. This is the classic failure
  mode of "require a doc-comment" lint rules.
- Also a latent false positive: `hasLeadingJSDocComment` (line 34) requires
  `comment.loc.end.line >= node.loc.start.line - 1`, so a JSDoc separated from its member by a
  blank line is treated as missing.
- Suggested fix: at minimum scope it to **exported** contracts (the public surface, where docs
  have value) and document the blank-line adjacency requirement. Consider whether this should
  be `warn` at all, or downgraded to advisory. This is partly taste — but the taste is
  expensive and the rule cannot enforce the thing that actually matters (comment usefulness).

### MEDIUM

#### M1 — `ref-names` flags the idiomatic bare `ref` and suggests `refRef` — **bug (false positive) / missing fixture**

- File: `topics/react/rules/ref-names/ref-names.mjs:22,27`.
- `endsWith("Ref")` is case-sensitive, so `const ref = useRef(null)` fails the check and the
  generated fix is `Rename the binding to \`refRef\``.
- Proof: PROBE 2.
- The test file (`ref-names.test.mjs`) has no fixture for bare `ref`, so the false positive is
  invisible to CI.
- Why it matters: `ref` is the single most common name for one ref in a component; `refRef` is
  nonsense. Agents will either obey (producing `refRef`) or learn to ignore the rule.
- Suggested fix: treat exact-name `ref` as valid; add it as a valid fixture. Optionally accept
  any binding whose name _is_ `ref` or ends in `Ref`.

#### M2 — `component-body-layout`'s `hasSeenCoreGroup` is dead code — **bug (minor)**

- File: `component-body-layout.mjs:43,45,50` compute and thread `hasSeenCoreGroup` into
  `getStatementGroup(statement, { hasSeenCoreGroup })`, but `getStatementGroup` (lines 84-108)
  never reads its `state` argument.
- Why it matters: the obvious intent — letting a `use*` "setup" hook that appears _after_ a
  core group be classified differently (so it doesn't read as out-of-order setup) — is not
  implemented. The dead variable is a maintenance trap: a future editor will assume it does
  something. No current test distinguishes the two behaviors.
- Suggested fix: either implement the intended exception and add a fixture, or delete the
  `state`/`hasSeenCoreGroup` plumbing entirely.

#### M3 — `component-body-layout` blank-line counting is line-arithmetic, not blank-aware — **design risk**

- File: `component-body-layout.mjs:62`:
  `blankLines = entry.statement.loc.start.line - previous.statement.loc.end.line - 1`.
- This counts _any_ lines between two statements as "blank", including comment lines. A
  single-line comment between two groups reads as one blank line (passes); a two-line comment
  reads as two (fails). So inserting a documenting comment between groups can both mask a
  missing blank line and manufacture a spurious one.
- Why it matters: brittle interaction with comments, which agents add frequently. Combined with
  the `comment-capitalization` and `articulated-object-contracts` rules that _encourage_
  comments, this rule's blank-line math will misfire.
- Suggested fix: count actual blank (whitespace-only) physical lines between the two nodes via
  `sourceCode.lines`, ignoring comment lines, or define the contract in terms of "no statement
  may be vertically adjacent across a group boundary" explicitly.

#### M4 — `rule-doc-message.mjs` hardcodes a parallel rule→doc map with no guard — **maintainability / design risk**

- File: `topics/lib/rule-doc-message.mjs:3-44`.
- `MapRuleNameToDocSlug` duplicates the entire rule list by hand. `getRuleDocPath` falls back
  to the bare `ruleName` (line 47) when a rule is missing, which yields `RULES/<rule>.md` — a
  path that does not exist (docs are topic-prefixed `RULES/<topic>_<rule>.md`).
- Current state is **healthy**: I verified all 39 public rules resolve to existing docs (no
  broken `See:` links today). The risk is purely future drift — add a rule, forget the map
  entry, and its diagnostics silently point at a 404 doc, which defeats the entire
  agent-oriented `See:` contract.
- Suggested fix: derive the slug from the topic structure (the rule already lives under
  `topics/<topic>/rules/<rule>/`), or add a test asserting every public rule's `getRuleDocPath`
  resolves to an existing file. (`npm test` does not currently assert this.)

#### M5 — Root vs app config divergence in prototypes — **integration issue**

- Files: `prototypes/eslint.config.js` vs `prototypes/app/eslint.config.js`.
- `app/eslint.config.js` is `export { default } from "@zaydek/eslint/config";` (package
  defaults: `files: ["src/**/*.{ts,tsx}"]`, `filenameSourceRoots: ["src"]`).
- `prototypes/eslint.config.js` imports the package via the deep path
  `./app/node_modules/@zaydek/eslint/config.mjs` (the repo root has no `node_modules`), and
  overrides `files: ["app/src/**/*.{ts,tsx}"]`, `filenameSourceRoots: ["app/src"]`.
- The same files are therefore governed by **two** config files. They produce identical results
  today only because `filenameSourceRoots` was hand-tuned so both yield the same path relative
  to the source root (`src` from the app, `app/src` from the root). Edit one without the other
  and `kebab-case-source-filenames` (the error-level rule) diverges between `cd app && eslint .`
  and root `eslint .`.
- The deep import `./app/node_modules/@zaydek/eslint/config.mjs` is also fragile: it depends on
  the app having installed the file dependency, and bypasses the package `exports` map.
- Why it matters: editor discovery (Cursor/VS Code ESLint) resolves the _nearest_ flat config
  walking up from a file, which is `app/eslint.config.js` for `app/src/**`. CLI from the repo
  root uses the root config. Two sources of truth for one set of files is a divergence waiting
  to happen.
- Suggested fix: pick one. Either give the repo root its own `package.json` + dependency and a
  single config, or drop the root `eslint.config.js` and standardize on running ESLint from
  `app/`. If both must exist, factor the shared options into one module both import.

#### M6 — Naming/predicate rules are import-blind — **design risk (low likelihood)**

- Files: `no-manual-memoization.mjs:36-52`, `boolean-names.mjs:58-69`,
  `component-body-layout.mjs:142-159`.
- These match by identifier name (`useCallback`, `memo`, `useMemo`, `useState`, `use*`)
  regardless of import source. A same-named non-React API (a local `memo()` memoizer, a
  `useState` from another library) is treated as React.
- Why it matters: real but low-probability false positives. Acceptable for a house package
  where the convention is "these names mean React", but it should be a _documented_ assumption,
  not an accident.
- Suggested fix: document the import-blindness in each rule doc. Resolving the binding to a
  `react` import is possible but adds complexity; documenting the assumption is the cheap fix.

### LOW / taste

- **L1 — `component-body-layout` requires exactly one blank line between groups**
  (`component-body-layout.mjs:63`). Strict house style; fine as `warn`, but it fires on tiny
  3-line components too (seen in PROBE 2, where a 3-line `function Foo` got a `refs`→`return`
  spacing warning). Taste.
- **L2 — `stylex-props-first` encodes "spread first" as law**
  (`stylex-props-first.mjs:22-27`). Mechanically correct for what it claims; whether the spread
  belongs first vs last is a StyleX-override opinion. Taste, but a defensible one. Note it only
  matches the literal `stylex.props(...)` (renamed/namespaced imports are missed — minor false
  negative).
- **L3 — `boolean-names` only inspects literal/`useState`-literal initializers**
  (`boolean-names.mjs:25-37`). Most real booleans come from comparisons (`const open = x > 0`)
  and are missed. Combined with H2's breadth, the rule is both too broad (every literal) and
  too narrow (no expressions) — see H2's fix.
- **L4 — The shared config enables all 39 rules at `warn` by default** (`config.mjs:13-15,54`).
  Aggressive for a _fresh_ adopter; prototypes only lints clean because its code was authored to
  comply (e.g. fully-JSDoc'd `types.ts`). A new repo importing the config will see a wall of
  warnings on day one. This is a rollout-ergonomics concern, not a bug. Consider a documented
  "strict vs starter" preset, or staged enablement.
- **L5 — `npm run format:check` currently fails**, but only on the untracked
  `handoffs/claude-audit-eslint-quality.md` (and now `report.md`), not on any package file. The
  `format` glob `**/*.{md,mjs,js,json}` sweeps the whole tree including audit artifacts. Not a
  package defect; noted for transparency. Consider ignoring `handoffs/` and audit artifacts in
  the format glob.

---

## 3. Rule-by-rule audit table

Only rules in the brief's focus set plus those touched by the in-scope commits are rated.
"Status" is about contract clarity + false-positive/negative risk, not test color.

| Rule ID                                          | Status         | Main concern                                                                                      | Missing fixtures                                                          |
| ------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `agentic/component-body-layout`                  | **risky**      | Arrow components unchecked (H1); dead `hasSeenCoreGroup` (M2); comment-blind blank-line math (M3) | arrow-function component (valid+invalid); comment-between-groups          |
| `agentic/ref-names`                              | **risky**      | Bare `ref` → `refRef` false positive (M1)                                                         | `const ref = useRef(null)` as valid                                       |
| `agentic/kebab-case-source-filenames`            | **risky**      | Only `error`-level rule + greedy `/src/` substring match (H3)                                     | absolute path with coincidental `/src/` ancestor; root vs app equivalence |
| `agentic/prefer-type-aliases`                    | **solid**      | Correctly exempts ambient `declare`/`global` merging; no unsafe autofix                           | non-`declare` augmentation case (document intended behavior)              |
| `agentic/stylex-props-first`                     | **acceptable** | Taste rule; literal-`stylex`-only (L2)                                                            | renamed/namespaced stylex import (document as out of scope)               |
| `agentic/no-manual-memoization`                  | **acceptable** | Import-blind (M6); otherwise simple and correct                                                   | local non-React `memo()` (document as intentional)                        |
| `agentic/boolean-names` (changed)                | **risky**      | Allowlist removal widened scope; incomplete prefix set (H2); literal-only (L3)                    | `did*`/`will*`/`was*` decision fixtures; comparison-initialized boolean   |
| `agentic/articulated-object-contracts` (changed) | **risky**      | Mandatory JSDoc on every member; low-signal/noise-inducing; blank-line adjacency (H4)             | JSDoc-with-blank-line-before-member (currently invalid by accident)       |

Rules not individually exercised here (the other ~31) passed `npm test` and were not in the
focus set; they are out of audit scope but share the architecture-level notes (M4, L4).

---

## 4. Integration audit

### ESLint package architecture — **sound**

- `exports` map (`package.json`) cleanly separates `.` (rule map), `./config`, `./topics`, and
  the three `./lib/stylex-*` helper aliases. Downstream uses `@zaydek/eslint/config`. Good.
- `topics/index.mjs` builds the flat public `rules` from the four topic maps and keeps
  `dormantRules` (`error-message-context`) **out** of the public surface — verified
  programmatically (39 public rules; `error-message-context` not among them). Doctrine and code
  agree.
- Topic grouping (`topics/<topic>/rules/<rule>/<rule>.mjs` + `.test.mjs` + `RULES/<topic>_<rule>.md`)
  is consistent across all 39 rules. `function-names` was removed/renamed to `no-concision-names`
  in `49cd7c1`; no dangling references found.
- One architecture smell: the hand-maintained `MapRuleNameToDocSlug` (M4) duplicates the topic
  structure that already exists on disk.

### Prettier-through-ESLint — **works as intended**

- `config.mjs:56` registers `"prettier/prettier": ["warn", { objectWrap: "collapse", printWidth: 100 }]`.
- `eslint-config-prettier` is placed **last** in the flat array (`config.mjs:59`) — correct: it
  disables ESLint's own stylistic rules without touching the `prettier/prettier` plugin rule.
- Proven: the `prettier-bad.ts` stdin probe emits a `prettier/prettier` **warning**, and it is
  visible under plain `eslint .` (only `--quiet` would hide it). No copy-pasted Prettier config
  is needed downstream beyond importing the shared config.
- Peer/dev deps are coherent: `eslint`, `eslint-config-prettier`, `eslint-plugin-prettier`,
  `eslint-plugin-react-hooks`, `@stylexjs/eslint-plugin`, `globals`, `typescript-eslint` are
  peers; dev deps mirror them plus `prettier`. Sensible.

### prototypes app config — **works, with M5 divergence**

- `app/eslint.config.js` re-exports the package default; `app/package.json` wires
  `"@zaydek/eslint": "file:../../eslint"` and the expected peers. `npm run lint` is clean,
  `npm run typecheck` passes.
- The rules genuinely fire (PROBE rule-proof: 4 warnings; PROBE articulated: type member
  flagged), so "clean" means clean, not "silently not linting." Confirmed the `files` glob
  matches `src/**/*.tsx` by observing stdin probes under `src/` produce diagnostics.

### Root config discovery story — **fragile (M5)**

- `prototypes/eslint.config.js` deep-imports `./app/node_modules/@zaydek/eslint/config.mjs` and
  re-specifies `files`/`filenameSourceRoots`. It behaves identically to the app config on
  `dashboard.tsx` today, but only by hand-tuned coincidence. Editors will pick the nearest
  config (`app/`), CLI-from-root picks the root config — two sources of truth. See M5.

---

## 5. Documentation audit

### Clear / good

- `AGENTS.md` is a strong boot doc: repo map, layer ownership, the diagnostic contract
  (`<Problem>` / `Fix:` / `See:`), and the "what not to do" list are concrete and useful for a
  fresh agent. The `dormantRules` doctrine is explained well.
- `RULES.md` is a genuine compact index with a per-rule TOC; the disabled rule is marked
  "— disabled". `npm test` proves the 184 documented examples actually match their rules **and**
  don't contradict the public rule set cross-rule (`verify-docs-rule-all`). That is real,
  unusual rigor.

### Stale / confusing / what a fresh agent would misunderstand

- **D1 (matches H1):** `component-body-layout`'s description and doc imply all React components;
  an agent will not guess that arrow components are exempt. The doc should state the
  `FunctionDeclaration`-only scope (or the rule should be fixed to match the doc).
- **D2 (matches H2):** Nothing in `RULES/typescript_boolean-names.md` or downstream
  `CONVENTIONS.md` flags that `511089d` turned boolean-names from a curated allowlist into a
  blanket rule, nor that `will/did/was` are rejected. An agent told "use boolean prefixes" will
  be surprised by `didMount`/`willClose` failing.
- **D3 (matches H4):** The articulated-object-contracts doc should state that the comment must
  be immediately adjacent (no blank line) and that it applies to non-exported contracts too —
  both are non-obvious and both bite.
- **D4:** The `See:` contract is excellent **as long as** the hand-map (M4) stays in sync; the
  docs present the `See:` path as authoritative, so a drifted map would silently mislead agents
  to a non-existent file. The docs should not over-promise a guarantee the code doesn't enforce.
- **Density:** `AGENTS.md` is long but justified. No action beyond the per-rule doc gaps above.

### Diagnostics → docs

- Diagnostics point to useful, real docs (verified: all 39 resolve). The message format is
  consistently agent-oriented (one problem line, one `Fix:`, one `See:`). This is a genuine
  strength.

---

## 6. Verification transcript summary

All commands were run during the audit; outcomes are exact.

### In `/Users/zaydek/GitHub/zaydek/eslint`

| Command                | Result         | Notes                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`             | **PASS**       | `stylex ownership fixture tests ok`, `stylex ownership contract tests ok`, `eslint rule tests ok`, `rule doc target verification ok (184 examples)`, `rule doc all verification ok (184 examples)`. Covers: documented examples match rules + cross-rule consistency + RuleTester fixtures. Does **not** cover: arrow components, bare `ref`, boolean-names breadth, downstream integration. |
| `npm run format:check` | **FAIL**       | Sole offender: `handoffs/claude-audit-eslint-quality.md` (the brief). No package file is unformatted. See L5.                                                                                                                                                                                                                                                                                |
| `git status --short`   | `?? handoffs/` | Clean working tree apart from the untracked audit folder.                                                                                                                                                                                                                                                                                                                                    |

### In `/Users/zaydek/GitHub/zaydek/prototypes/app`

| Command                                                                         | Result                 | Notes                                                                                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint` (`eslint .`)                                                     | **PASS**, exit 0       | Zero diagnostics. Rules are active (proven below), so this is genuinely clean.                                                                         |
| `npm run typecheck`                                                             | **PASS**               | Regenerates `manifest.ts` then `tsc -b --noEmit` with no errors.                                                                                       |
| `npx eslint src/components/dashboard.tsx -f stylish`                            | clean, exit 0          | File is in-glob and genuinely clean.                                                                                                                   |
| `printf "const value={foo:'bar'}…" \| eslint --stdin …/prettier-bad.ts`         | **1 warning**, exit 0  | `prettier/prettier` — proves Prettier-through-ESLint surfaces under plain lint.                                                                        |
| `printf 'import { useCallback, useState }…' \| eslint --stdin …/rule-proof.tsx` | **4 warnings**, exit 0 | `boolean-names` (`dragging`), `component-body-layout` ×2 (spacing), `no-manual-memoization` (`useCallback`). Proves the agentic rules fire end-to-end. |

### In `/Users/zaydek/GitHub/zaydek/prototypes`

| Command                                                  | Result        | Notes                                                                              |
| -------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------- |
| `npx eslint app/src/components/dashboard.tsx -f stylish` | clean, exit 0 | Root config governs the same file and agrees with the app config — today (see M5). |
| `git status --short`                                     | `?? work/`    | Clean apart from an untracked `work/` folder.                                      |

### Audit-specific probes (not in the brief, run to prove findings)

| Probe                                               | Result                                 | Finding                               |
| --------------------------------------------------- | -------------------------------------- | ------------------------------------- |
| Arrow component, bad layout                         | **no** `component-body-layout` warning | H1                                    |
| `const ref = useRef(null)`                          | `ref-names` warning, fix `refRef`      | M1                                    |
| `const loading = true`                              | `boolean-names` warning                | H2 (breadth)                          |
| `const didMount = true` / `const willClose = false` | both `boolean-names` warnings          | H2 (incomplete prefix set)            |
| `type Bad = { foo: string }` via stdin              | `articulated-object-contracts` warning | H4 (rule active; tax is real)         |
| All 39 public rule `See:` paths resolved on disk    | **all resolve**                        | M4 (no current breakage; future risk) |
| `error-message-context` in public `rules`           | **false**                              | dormant doctrine honored              |

---

## 7. Recommended next actions

### Must fix before more rollout

1. **H1** — Make `component-body-layout` see arrow-function components, or rename/redocument it
   to admit it only covers function declarations. Right now it silently under-covers its target.
2. **H3** — Remove the greedy `/src/` substring match in `kebab-case-source-filenames` (anchor
   on the cwd-relative path), and reconsider `error` vs `warn` for a filename rule during
   rollout. It's the only build-failing rule; it must be false-positive-proof.
3. **H2** — Resolve the `boolean-names` contract: broaden the prefix set (add `will/did/was`)
   and/or restore a curated allowlist, and document the breadth change.

### Should fix soon

4. **M1** — Accept bare `ref` in `ref-names`; add the valid fixture.
5. **M2** — Implement or delete `component-body-layout`'s `hasSeenCoreGroup`.
6. **M4** — Add a test asserting every public rule's `getRuleDocPath` resolves to a real file
   (cheap insurance for the agent `See:` contract).
7. **M5** — Collapse the prototypes root/app config divergence to one source of truth.
8. **H4** — Scope `articulated-object-contracts` to exported contracts and document its
   adjacency requirement; reconsider whether mandatory member docs earn their cost.

### Optional cleanup

9. **M3** — Make blank-line counting comment-aware in `component-body-layout`.
10. **L4** — Offer a "starter" preset (subset at `warn`) so fresh adopters aren't flooded.
11. **L5** — Exclude `handoffs/` and audit artifacts from the `format` globs.
12. **M6 / L1 / L2 / L3** — Document the import-blind and literal-only assumptions in the
    affected rule docs so the contracts are explicit rather than incidental.

---

### Bottom line

The package is real, tested, and works end-to-end; the architecture and the Prettier/dormant-rule
stories are genuinely good. The weak points are concentrated in the **semantic-naming and
React-shape rules** (`component-body-layout`, `boolean-names`, `ref-names`,
`articulated-object-contracts`) and in the **one error-level filename rule** — exactly the
categories the brief flagged as deserving skepticism. Fix H1–H3 before widening adoption; the
rest is steady-state quality work.
