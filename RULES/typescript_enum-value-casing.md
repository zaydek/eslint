# Enum Value Casing

Topic: TypeScript
Rule: `agentic/enum-value-casing`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/enum-value-casing`

Requires enum string values to use SCREAMING_SNAKE_CASE. These values leak
into logs and wire formats, so they follow machine casing, not member casing.

## Rule Shape

- Matches string-valued TypeScript enum members.
- The accepted pattern is `^[A-Z0-9]+(?:_[A-Z0-9]+)*$`.
- Digits are allowed, including values such as `P0`.
- All-digit values also match the pattern, though enum values should still be
  chosen for domain clarity.
- Lowercase letters, hyphens, spaces, empty segments, leading underscores, and
  trailing underscores are invalid.

Valid:

```ts
enum ModalKind {
  ChatSidebar = "CHAT_SIDEBAR",
}
```

Valid, in practice:

```ts
// A log line reads `action.kind=STICKY_CREATE` — unambiguous machine casing.
export enum BoardActionKind {
  StickyCreate = "STICKY_CREATE",
  StickyRename = "STICKY_RENAME",
}

export enum StickyPriority {
  P0 = "P0",
  P1 = "P1",
}
```

Invalid:

```ts
enum ModalKind {
  ChatSidebar = "ChatSidebar",
}
```
