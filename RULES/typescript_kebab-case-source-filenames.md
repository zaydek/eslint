# Kebab-Case Source Filenames

Topic: TypeScript
Rule: `agentic/kebab-case-source-filenames`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/kebab-case-source-filenames`

Requires source filenames inside configured source roots to use lowercase
kebab-case segments. The rule is path-based: it reads the linted file path from
ESLint, then reports once for the file when its basename is not valid.

## Rule Shape

- Matches the linted file path, not identifiers inside the file.
- Defaults to source roots `src` and `app/src`.
- Accepts rule options in this shape:

```json
{ "sourceRoots": ["src", "app/src"], "extensions": ["js", "jsx", "ts", "tsx"] }
```

- Checks only files whose normalized path is inside one configured source root.
  ESLint passes absolute paths, so a source root is matched as a path segment
  anywhere in the path (`.../<root>/...`), not just as a leading prefix; pair the
  rule with a `files` glob scoped to the same roots so only intended files are in
  range. Only the basename is validated once a file is in range.
- Checks only configured extensions.
- Allows lowercase dotted convention segments such as `.test`, `.stylex`, and
  `.d`.
- Allows names like `app.tsx`, `app-data.ts`, `tree.test.ts`,
  `tokens.stylex.ts`, and `stylex-jsx.d.ts`.
- Rejects PascalCase, camelCase, underscores, spaces, and uppercase dotted
  segments.
- Does not autofix. Rename the file and update imports manually or with a
  migration tool.

Valid:

```ts
// Filename: src/app-data.ts
export {};
```

Valid, dotted convention module:

```ts
// Filename: app/src/tokens.stylex.ts
export {};
```

Invalid:

```ts
// Filename: src/appData.ts
export {};
```

Invalid, uppercase basename:

```ts
// Filename: app/src/App.tsx
export {};
```
