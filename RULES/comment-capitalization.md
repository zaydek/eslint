# Comment Capitalization

Topic: Comments
Rule: `agentic/comment-capitalization`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/comment-capitalization`

Checks the first meaningful line of each comment block. Continued physical
lines in the same comment block may read naturally. Tooling directives and
TypeScript triple-slash reference comments are skipped.

## Rule Shape

- For contiguous line comments, checks only the first comment in the block.
- For block comments, trims leading `*` characters before finding the first
  alphabetic character.
- If the checked comment has no alphabetic character, it is skipped; the rule
  does not advance to later physical lines in the same line-comment block.
- Skips ESLint, TypeScript, Prettier, Biome, and Stylelint directives.
- Skips TypeScript triple-slash reference comments.
- Skips StyleX ownership comments; those are validated by
  `agentic/stylex-ownership-comment`.

Valid:

```ts
// Good first line
// continued lower-case line
const value = 1;

/// <reference types="vite/client" />
```

Invalid:

```ts
// bad first line
const value = 1;
```
