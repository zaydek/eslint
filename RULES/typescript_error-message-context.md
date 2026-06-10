# Error Message Context

Topic: TypeScript
Rule: `agentic/error-message-context`
Status: dormant; excluded from public and topic rule maps.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/error-message-context` (implemented and tested as dormant draft
material, but excluded from public and topic rule maps; see the open review
notes)

Requires thrown error messages to interpolate structured context. Static prose
like `An unexpected error occurred` carries no information; the payload is the
message. This rule may move to requiring a `cause` argument alongside a
human-readable message instead.

Valid:

```ts
throw new Error(`error=${JSON.stringify(result.error)}`);
```

Invalid:

```ts
throw new Error("An unexpected error occurred");
```
