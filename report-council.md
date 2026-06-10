# Council Double-Check of `report.md`

Date: 2026-06-09
Council: `council-claude-code` preset `3x:opus-4.8:xhigh` (3 members + chairman, all
`claude-opus-4-8` at `--effort xhigh`, each with `Read/Grep/Glob` to verify against source).
Persisted deliberation: `~/.council/2026-06-10Z/you-are-an-adversarial-reviewer/deliberation.md`.

This file is the council's answer **plus my independent re-verification of every council
claim**. The user asked me to "consider both documents" — so I did not take the council at
face value any more than it took `report.md` at face value. Each council point below is
tagged **CONFIRMED** (I reproduced it), **REFINED** (true but the council missed a
mitigating fact), or **REFUTED** (the council itself is wrong/overstated).

---

## Council verdict (verbatim summary)

> Trust the audit's individual code-level catches — git history, dead code, and the
> `ref`/`boolean`/`articulated` false positives all reproduce. **Distrust its severities and
> its top-3.** It ranked a non-issue (H1) #1 on a fabricated consumer claim, repeated a false
> "only build-failing rule" premise, rated taste as High (H4) and a `warn` as a rollout
> blocker (H2), recommended a "fix" that would break the kebab rule, and — most importantly —
> called the one genuinely broken thing (the `~/…` doc path) a strength, while never opening
> the package's two riskiest surfaces (the StyleX parser and the recursion gap in a rule it
> rated High).

The council is **right about the calibration and right about the misses**. It is **partly
wrong about how broken the doc-path is** (see C1). My reconciliation is at the bottom.

---

## Part A — Council's "WRONG / OVERSTATED" claims, re-verified

### A1 — H1 (`component-body-layout` arrow components) is a non-issue for prototypes — **CONFIRMED**

The council grepped the consumer: **0 arrow-function components, 31 function-declaration
components**. I reproduced this exactly (`grep -E '^(export )?const [A-Z]…=>' src` → 0;
`function [A-Z]` → 31). The house style uses function declarations, the detailed rule doc
_already_ scopes itself to `FunctionDeclaration` (`RULES/react_component-body-layout.md:25`),
and the app lints clean _because_ its components comply. My report's load-bearing phrase
"the form used across `prototypes/app/src/components/*`" was **false**. H1 → **Low**; the only
honest action is to tighten the rule's `meta.description` (which still says the generic "React
component bodies"), not to add arrow support. Adding arrow support would be speculative infra
for a shape the first customer does not ship.

### A2 — H3 kebab fix would BREAK the rule; "only error rule" is wrong — **CONFIRMED (important)**

Two sub-claims, both verified:

- **"Only error-level rule" is false.** `config.mjs:48-52` sets `@stylexjs/valid-styles`,
  `@stylexjs/no-unused`, and `react-hooks/rules-of-hooks` to `error`. Kebab is the only
  _agentic_ error rule, not the only build-failing one. My executive summary dropped the
  "agentic" qualifier and overstated it.
- **My suggested fix was actively harmful.** ESLint passes **absolute** filenames, so in
  `isInSourceRoot` (`kebab-case-source-filenames.mjs:81-86`) the `=== root` and
  `startsWith(root + "/")` clauses can _never_ match (an absolute path starts with `/`).
  `includes("/" + root + "/")` is the **only functioning clause**. My report said "drop the
  `includes` clause" — that would **disable the rule entirely**. I re-verified against the
  rule's own test fixtures (`kebab-case-source-filenames.test.mjs`): every fixture filename is
  absolute (`/repo/app/src/app.tsx`) and matches _only_ via the `includes` clause. The
  council's alternative ("anchor on cwd-relative path") **also breaks** these — the fixtures
  are not under the test's cwd, and real `eslint` runs from a parent dir would re-introduce
  `../` prefixes. **Net: the matcher is not actually broken, and both proposed "fixes" are
  wrong.** H3 → **Low / non-reproducible** (the `files` glob and `sourceRoots` are coextensive
  in the shipped config, and the rule only checks the _basename_ after gating). Decision:
  **leave the matcher; document the path-matching behavior.**

### A3 — H4 is taste + one real sub-bug, mis-rated High — **CONFIRMED**

I labeled it "design risk / taste" then rated it High — internally inconsistent, as the
council notes. `types.ts` being fully JSDoc'd is the rule **working as designed**, not a
defect. The one objective bug is the **adjacency false positive**
(`articulated-object-contracts.mjs:34`): a JSDoc separated from its member by a blank line is
treated as missing. **I reproduced it**: `/** documented id */` + blank line + `id: string`
→ `articulated-object-contracts` fires on `id`. H4 → **taste (keep the mandate) + one Low/Med
bug to fix**.

### A4 — H2 severity inflated; "restore allowlist" is the wrong reflex — **CONFIRMED + REFINED**

`git show 511089d` confirms the `BOOLEANISH_NAMES` allowlist + its guard were deleted. But:
it's `warn`; the missing `will/did/was` prefixes are a **contract choice, not a defect**
(`boolean-names.mjs:3` deliberately enumerates five prefixes); and — the part my report
missed — **pre-`511089d` the rule only flagged 10 hardcoded names while its message advertised
the general `is/has/can/should/are` contract.** So `511089d` _aligned behavior to the stated
contract_ rather than regressing it. A naive "restore the allowlist" would re-introduce a
message↔behavior mismatch. H2 → **Medium, docs-only** (document the breadth; do not revert,
do not expand the prefix set).

### A5 — Two calibration inversions — **CONFIRMED**

- **M1 (`ref-names` bare `ref` → `refRef`)** is a _more certain_ false positive than anything
  in H1/H3/H4 (I reproduced the literal `Rename the binding to refRef` suggestion), yet I
  ranked it below a non-issue. It should be near the top of the fix list.
- **L3 ("`boolean-names` too narrow") is not a defect.** Narrowing to literal initializers is
  the _safe_ design; "fixing" it to flag comparison-derived booleans (`const open = x > 0`)
  would explode false positives. My "too broad and too narrow" framing was wrong; the
  narrowness is a feature. Leave it.

---

## Part B — Council's "MISSED" items, re-verified

### B1 — Doc-path `~/…` literal — **REFINED (council overstated "broken")**

`rule-doc-message.mjs:1` is `const RULE_DOCS_ROOT = "~/GitHub/zaydek/eslint/RULES"` — a
literal, never-expanded `~`. The council calls this "the one genuinely broken thing … a dead
link for 100% of off-machine diagnostics," and faults my report for calling the `See:`
contract a strength and "verifying" all 39 resolve (tautologically, on the author's machine).

**My re-verification adds two facts the council didn't weigh:**

1. `app/node_modules/@zaydek/eslint` is a **symlink** → `../../../../eslint` (the source repo),
   and the symlinked copy carries `RULES/`. So for the **first customer on this machine**, the
   `See:` paths **do resolve** — I confirmed `~/GitHub/zaydek/eslint/RULES/react_ref-names.md`
   exists and is the real source doc.
2. The `~/GitHub/zaydek/eslint/RULES/{topic}_{rule}.md` form is the **documented contract** in
   `AGENTS.md` (the diagnostic-format spec) — it is deliberate, not an accident, and it points
   agents at the _canonical source_, not a stale `node_modules` copy.

So this is **not "broken for prototypes."** It is a deliberate design choice for a private,
single-author, local-file-dependency ecosystem, with a **genuine portability limit** for CI /
other machines / other developers / a future npm publish. The council's _underlying_ point
still lands: my report wrongly presented "all 39 resolve" as proof of a portable contract when
it only proves on-machine resolution, and the **rule→doc verification is tautological** (see
B2). **Decision: keep the documented `~` contract (don't churn 184 doc examples + AGENTS.md),
but replace the tautological test with a real one that expands `~` and asserts each doc file
exists.** That captures all the value (drift protection) without breaking the contract.

### B2 — The rule→doc test is tautological — **CONFIRMED (sharper than my M4)**

`test.mjs:65-68` asserts each message _contains_ `getRuleDocPath(ruleName)` — but the message
was _built_ from `getRuleDocPath` via `createRuleMessage`, so the assertion **can never fail**.
And nothing asserts `(public rules) ⊆ (docs on disk)`: `verify-rule-docs.mjs` iterates
docs-on-disk and extracted examples, never closing over the public rule set. My M4 noticed the
missing existence check but missed that the _existing_ check is circular. **This is the
highest-ROI fix and I will do it.**

### B3 — `articulated-object-contracts` recursion gap — **REFINED (council missed a cross-rule mitigation)**

`checkTypeNode` (`:54-67`) only recurses into `TSTypeLiteral`/`TSUnionType`/
`TSIntersectionType`, so inline object types inside `Array<{…}>`, `Record<string,{…}>`,
`{…}[]`, or tuples escape the member-comment check. **True in isolation.** But I probed it in
the _full_ rule set: `items: Array<{ id: string }>` is rejected first by a **different rule**,
`agentic/named-nested-types` ("Property `items` uses an inline nested object type"). The house
conventions **forbid inline nested object types outright**, so the construct that would expose
articulated's recursion gap is unreachable in compliant code. The council reviewed the rule in
isolation and missed this. **Decision: document the boundary (inline nested objects are owned
by `named-nested-types`) rather than expand articulated's recursion** — expanding it would be
dead surface for code that can't exist.

### B4 — StyleX ownership engine never audited — **CONFIRMED (miss) / REFUTED (severity)**

I dismissed ~416 lines of hand-rolled contract parser with "stylex ownership fixture tests
ok." Fair hit — I should have opened it. I did now. The council's concrete smell:
`splitTopLevel` (`ownership-contract.mjs:135-158`) tracks `angleDepth` by counting raw `<`/`>`
(`:150-151`), so a `=>` (whose `>` is counted) or an unbalanced `>` corrupts the split.
**Verified the mechanism is real** — but the grammar `splitTopLevel` parses is PascalCase
identifiers joined by `,`/`|` (values are checked against `PASCAL_IDENT_PATTERN`, `:341`),
which **never contains `=>` or stray `>`.** The council explicitly hedged ("not claiming a
proven crash"). **Decision: do not surgically edit a working, tested 416-line parser for an
input its grammar cannot produce.** Recommend adversarial fixtures only if the contract grammar
ever admits function/generic types. Documented as a known boundary, not fixed.

### B5 — `no-manual-memoization` is _correct_ here, not a false-positive risk — **CONFIRMED**

`vite.config.ts:64` wires `babel-plugin-react-compiler` (`target: "19"`), so React Compiler is
**active** in prototypes. Banning manual `useCallback`/`useMemo`/`memo` is therefore exactly
right for this consumer — the whole justification for the rule. My M6 framed it as an
"import-blind, low-likelihood false positive"; for this customer it is a **feature**. Decision:
keep the rule; document that React Compiler is its premise and detection is name-based by
design.

### B6 — M5 mechanism wrong; real fragility is the deep import — **CONFIRMED**

I claimed the two prototypes configs agree "only because `filenameSourceRoots` was hand-tuned
to yield the same path relative to the source root." **Wrong** — the kebab rule never computes
a source-root-relative path; it gates in/out then checks the **basename only**
(`kebab-case-source-filenames.mjs:47`). The configs agree for _any_ `sourceRoots` that gate-in
the same files. The genuine fragility is the **deep import** in `prototypes/eslint.config.js`
(`./app/node_modules/@zaydek/eslint/config.mjs`), which reaches _through_ the consumer's
`node_modules` from the parent dir and bypasses the package `exports` map, plus the
hand-mirrored `ignores` arrays. Decision: address the deep import in the consumer (lower
priority, separate repo, verify lint stays clean).

---

## Part C — Final reconciled & considered plan

Ordering reflects the council's corrected priorities, my re-verification, and "prototypes as
first customer." Each item says **DO** or **DECLINE** with reasoning.

### Package — DO (real bugs / high-ROI, low risk)

1. **Real rule→doc verification test** (B1/B2/M4). Replace the tautological `test.mjs` assertion
   with one that expands `~` in `getRuleDocPath` and asserts every public rule's doc file
   exists on disk. Highest ROI; protects the package's headline feature; zero rule-behavior
   change.
2. **`ref-names`: accept bare `ref`** (M1/A5). One guard + a valid fixture + a doc line. The
   `refRef` suggestion is indisputably wrong and it's the most certain FP found.
3. **`articulated-object-contracts`: fix the adjacency FP** (A3/H4 sub-bug). A JSDoc that is the
   last comment before a member counts even across a blank line. Add the blank-line valid
   fixture. (Keep the mandate; it's taste the house has chosen.)
4. **`component-body-layout`: delete the dead `hasSeenCoreGroup` plumbing** (M2). Pure dead-code
   removal, no behavior change.
5. **Documentation truth-ups** (D1/D2/D3/B3/B5): tighten `component-body-layout`'s
   `meta.description` to its real `FunctionDeclaration` scope; document `boolean-names`' breadth
   - the deliberate five-prefix set; document `articulated`'s adjacency tolerance + the
     `named-nested-types` recursion boundary; document `no-manual-memoization`'s React-Compiler
     premise + name-based detection; document `kebab`'s path-matching behavior; document
     `ref-names` accepting `ref`.

### Package — DECLINE (with reasons)

- **Kebab matcher surgery** (H3): both the report's and the council's fixes break the rule;
  the risk is non-reproducible under the shipped glob. Document, don't edit.
- **Restore/expand `boolean-names`** (H2/A4): a revert re-introduces a message↔behavior
  mismatch; expanding the prefix set is taste. Docs only.
- **Expand `articulated` recursion** (B3): `named-nested-types` already forbids the exposing
  construct. Document the boundary instead.
- **Edit the StyleX parser** (B4): theoretical smell, unreachable grammar, working tested code.
  Note the boundary; don't risk a regression.
- **Arrow-component support / "starter" preset** (H1/L4): speculative infra; the first customer
  uses 0 arrow components, and repo doctrine says don't productize ahead of a second adopter.
- **`stylex-props-first`, one-blank-line, the `articulated` mandate, `boolean-names`
  literal-only scope** (L1/L2/L3): taste the house has chosen. Leave.

### Consumer (prototypes) — DO, carefully (B6/M5)

- Replace the deep `./app/node_modules/@zaydek/eslint/config.mjs` import in
  `prototypes/eslint.config.js` with a robust source (import the sibling source package
  directly), or collapse to a single config run from `app/`. Lower priority, separate repo —
  apply only with `npm run lint` re-verified clean afterward.

### Verification gates

After each change: `npm test` in the package (must stay green, incl. the 184 doc examples and
the new doc-existence test) and `npm run lint` + `npm run typecheck` in `prototypes/app` (must
stay clean). The app complies today only because it was hand-authored to, so any rule-behavior
change must be proven not to introduce new diagnostics in the first customer.

---

### Bottom line

The council did its job: it caught that `report.md` inflated severities, fabricated H1's
consumer justification, proposed a kebab "fix" that would disable the rule, and praised the
doc-path while missing that its verification is circular. On re-checking the council itself, I
**refined** two of its strongest points — the doc-path is non-portable but _not_ broken for the
first customer (symlinked source + documented `~` contract), and the articulated recursion gap
is real but unreachable behind `named-nested-types` — and **refuted** the urgency of the
StyleX-parser and kebab edits. The net actionable set is **small, surgical, and low-risk**:
one genuine test-coverage fix, three small rule-bug fixes, and a documentation truth-up, with a
careful consumer-config cleanup. That is what I will implement.

---

## Implementation Log (applied)

Branch: `06-09-2026/proposed-rules`. Package suite green (`npm test` → 185 examples);
package files Prettier-clean; first customer (`prototypes/app`) still lints clean + typechecks;
no rule-behavior regression (the rule-proof stdin still emits its 4 intended warnings).

### Done — package (10 files, +74/-12)

1. **Real rule→doc verification test** — `test.mjs`. Added an assertion that every public +
   dormant rule's `getRuleDocPath` slug resolves to an existing `RULES/{slug}.md` file
   (repo-relative, checkout-independent). Replaces the previously **tautological** check
   (which compared the message against the path it was built from). Verified non-vacuous: an
   unmapped rule resolves to a missing file and fails the suite. Closes M4 + council B2.
2. **`ref-names` accepts bare `ref`** — `ref-names.mjs` (`if (node.id.name === "ref") return;`)
   - two valid fixtures + doc note. Kills the `refRef` false positive (M1). A mistyped name
     like `done = useRef(...)` is still flagged.
3. **`articulated-object-contracts` adjacency fix** — `articulated-object-contracts.mjs`.
   `hasLeadingJSDocComment` no longer requires strict line adjacency; a JSDoc that is the last
   comment before a member now counts across a blank line. Added a valid fixture; updated the
   doc (removed the stale "blank lines break the association" line) and documented the
   `named-nested-types` recursion boundary (council B3). Fixes the H4 sub-bug.
4. **`component-body-layout` dead-code removal** — deleted the unused `hasSeenCoreGroup`
   plumbing (computed, threaded, never read) and tightened `meta.description` to its real
   PascalCase-`FunctionDeclaration` scope. No behavior change (M2 + D1).
5. **Doc truth-ups** — `boolean-names` (breadth is a blanket check; the five-prefix set is
   closed by design, `will/did/was` intentionally excluded); `kebab-case-source-filenames`
   (absolute-path segment matching + basename-only check, so maintainers don't "drop the
   `includes` clause" and disable the rule); `ref-names` and `articulated` as above.

### Declined — with reasons (the "considered" half of the mandate)

- **kebab matcher surgery (H3):** ESLint passes absolute paths, so `includes("/<root>/")` is
  the _only_ functioning clause; both the report's and the council's "anchor cwd-relative"
  fixes break the rule and its absolute-path fixtures. Risk is non-reproducible under the
  shipped glob. Documented instead.
- **`boolean-names` revert/expand (H2):** a naive allowlist revert re-introduces a
  message↔behavior mismatch; expanding the prefix set is taste. Docs only.
- **`articulated` recursion expansion (B3):** `named-nested-types` already forbids the inline
  nested-object construct that would expose the gap. Documented the boundary; no dead surface.
- **StyleX `splitTopLevel` (B4):** real `>`/`=>` counting fragility, but unreachable by the
  PascalCase/`|`-union grammar it parses. Left the working 416-line parser untouched.
- **Arrow-component support / "starter" preset (H1/L4):** speculative infra; prototypes ships
  0 arrow components and repo doctrine says don't productize ahead of a second adopter.

### Surfaced — not changed (your call)

- **prototypes consumer config (M5/B6):** `prototypes/eslint.config.js` deep-imports
  `./app/node_modules/@zaydek/eslint/config.mjs`. It works (the path is a symlink to the source
  repo) and the **documented** lint workflow is `npm --prefix app run lint` (uses the app
  config), so the root config is effectively vestigial. Every "fix" (sibling import / delete /
  root package.json) has tradeoffs, and the `file:../../eslint` dep already hardcodes the
  sibling layout. Left as-is in a repo I did not author; recommend you decide: delete the
  vestigial root config, or give the root its own `package.json` + dependency.
