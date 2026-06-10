# TODO

## Kebab-Case Source Filenames

Implemented as `agentic/kebab-case-source-filenames`.

Follow-up if this expands beyond app source files:

- Consider a dedicated `files` topic if filename/path rules grow.
- Keep source scope in rule options rather than hard-coding downstream repo
  paths.
- Do not add autofix unless rename/import handling is proven safe across
  case-only renames and cross-platform filesystems.

## Topic-Prefixed Public Rule Keys

Rule docs now use topic-prefixed filenames such as
`RULES/react_ref-names.md`. Consider separately migrating public flat rule keys
to predictable topic-prefixed keys,
for example `react_ref-names`, `typescript_prefer-type-aliases`,
`stylex_key-names`, and `comments_todo-format`.

Do this as a dedicated package-wide migration, not opportunistically while
adding one rule, because it affects:

- `topics/index.mjs` public exports.
- Rule IDs and diagnostic `See:` links.
- Documentation verification.
- Downstream warning history and any repo-local suppressions.

Avoid `/` inside exported rule keys unless ESLint consumer behavior is verified,
because consumers already add the plugin prefix, producing IDs such as
`agentic/{rule}`.
