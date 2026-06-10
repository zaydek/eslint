# Exhaustive Switch

Topic: TypeScript
Rule: `agentic/exhaustive-switch`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/exhaustive-switch`

Requires switches whose cases test enum members to close with a `default` that
calls `exhaustive()`, so adding a variant fails loudly instead of falling
through silently. For enum-backed discriminated unions, pass the switched-on
value itself: `exhaustive(result)`. Raw string-literal discriminant switches are
out of scope.

## Rule Shape

- Matches `switch` statements whose non-default case tests are all non-computed
  member expressions such as `MoveResultKind.Success`.
- If any non-default case uses a literal or other expression shape, the whole
  switch is out of scope.
- Requires a `default` case.
- The default case may `return exhaustive(value)`, `throw exhaustive(value)`, or
  contain any statement shape with a direct call expression whose callee is the
  identifier `exhaustive`.
- A bare `exhaustive(value);` statement is valid even inside a value-returning
  function because the helper is expected to be `never`-typed.
- Aliased helpers and member calls such as `assert.exhaustive(value)` are out of
  scope.

Valid:

```ts
switch (result.kind) {
  case MoveResultKind.Success:
    return result.id;
  default:
    exhaustive(result);
}
```

Valid, in practice:

```ts
function getMoveOffset(direction: MoveDirectionKind): number {
  switch (direction) {
    case MoveDirectionKind.Up:
      return -1;
    case MoveDirectionKind.Down:
      return 1;
    default:
      exhaustive(direction);
  }
}
```

Invalid:

```ts
switch (result.kind) {
  case MoveResultKind.Success:
    return result.id;
  case MoveResultKind.Error:
    return null;
}
```
