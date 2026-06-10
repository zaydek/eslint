You are auditing recent work in two local repos:

- ESLint package: `/Users/zaydek/GitHub/zaydek/eslint`
- Consumer app: `/Users/zaydek/GitHub/zaydek/prototypes`

Recent relevant commits:

- eslint: `511089d Run Prettier through shared ESLint config`
- eslint previous: `49cd7c1 Harden shared eslint conventions`
- prototypes: `f9f9fa5 Surface shared ESLint warnings in app`
- prototypes previous: `4b8c3a7 Use shared eslint config`

Your job is to perform a skeptical quality audit, not to praise the work.

Audit goals:

1. Verify the ESLint package architecture makes sense.
   - Shared config export: `@zaydek/eslint/config`
   - Rule exports in `topics/index.mjs`
   - Topic rule maps under `topics/{topic}/rules/index.mjs`
   - Rule docs under `RULES/{topic}_{rule}.md`
   - Compact index in `RULES.md`
   - Rule doc message paths via `topics/lib/rule-doc-message.mjs`

2. Audit every newly added or materially changed rule for correctness, false positives, false negatives, and maintainability.
   Focus especially on:
   - `agentic/component-body-layout`
   - `agentic/ref-names`
   - `agentic/kebab-case-source-filenames`
   - `agentic/prefer-type-aliases`
   - `agentic/stylex-props-first`
   - `agentic/no-manual-memoization`
   - changed `agentic/boolean-names`
   - changed `agentic/articulated-object-contracts`

3. Audit the Prettier integration story.
   Expected behavior:
   - A downstream repo using `@zaydek/eslint/config` should see `prettier/prettier` diagnostics through ESLint.
   - No special copy-pasted config should be needed beyond importing the shared config.
   - Warnings should not be hidden by `eslint --quiet`.
   - Peer/dev dependencies should make sense.

4. Audit the prototypes integration.
   - `/Users/zaydek/GitHub/zaydek/prototypes/app/eslint.config.js`
   - `/Users/zaydek/GitHub/zaydek/prototypes/eslint.config.js`
   - `app/package.json`
   - `app/package-lock.json`
   - whether ESLint behaves the same from the app root and repo root
   - whether Cursor/VS Code would plausibly discover the right config

5. Audit documentation quality for agents.
   - Are `AGENTS.md`, `RULES.md`, and `RULES/*.md` clear enough for a fresh agent?
   - Are examples internally consistent with the full public rule set?
   - Are any docs stale, contradictory, misleading, or too dense?
   - Do diagnostics point to useful docs?

6. Audit implementation quality.
   - Prefer AST correctness over string heuristics.
   - Identify rules that are too brittle, too broad, too narrow, or semantically impossible.
   - Identify any rule that should be disabled, archived, renamed, or split.
   - Identify unsafe autofix absence/presence.
   - Identify any dependencies that should be peer deps vs dev deps.
   - Identify whether `eslint-config-prettier` placement in flat config is correct.

7. Audit current verification.
   Run these commands and report exact outcomes:

   In `/Users/zaydek/GitHub/zaydek/eslint`:

   ```sh
   npm test
   npm run format:check
   git status --short
   ```

   In `/Users/zaydek/GitHub/zaydek/prototypes/app`:

   ```sh
   npm run lint
   npm run typecheck
   npx eslint src/components/dashboard.tsx -f stylish
   printf "const value={foo:'bar'}\n" | npx eslint --stdin --stdin-filename src/prettier-bad.ts -f stylish
   printf 'import { useCallback, useState } from "react";\nfunction Example() {\n  const [dragging, setDragging] = useState(false);\n  const notify = useCallback(() => {}, []);\n  return dragging;\n}\n' | npx eslint --stdin --stdin-filename src/rule-proof.tsx -f stylish
   ```

   In `/Users/zaydek/GitHub/zaydek/prototypes`:

   ```sh
   npx eslint app/src/components/dashboard.tsx -f stylish
   git status --short
   ```

Important constraints:

- Do not assume prior agent work is correct.
- Do not modify code unless explicitly asked after the audit.
- If you find a problem, include exact file/line references and explain the failure mode.
- Distinguish “bug”, “design risk”, “documentation ambiguity”, “integration issue”, and “taste/opinion”.
- Treat green tests as evidence only after explaining what they actually cover.
- Be especially skeptical about rules that attempt semantic naming or React behavior.

Desired output:

1. Executive summary:
   - Is the integration broadly sound?
   - Is it safe to continue building on this?
   - What are the top 3 risks?

2. Findings, ordered by severity:
   - Severity: Critical / High / Medium / Low
   - File and line
   - What is wrong
   - Why it matters
   - Suggested fix

3. Rule-by-rule audit table:
   - Rule ID
   - Status: solid / acceptable / risky / broken
   - Main concern
   - Missing fixtures

4. Integration audit:
   - ESLint package
   - Prettier-through-ESLint
   - prototypes app config
   - root config discovery story

5. Documentation audit:
   - What is clear
   - What is stale/confusing
   - What a fresh agent would misunderstand

6. Verification transcript summary:
   - Commands run
   - Pass/fail
   - Important output

7. Recommended next actions:
   - Must fix before more rollout
   - Should fix soon
   - Optional cleanup
