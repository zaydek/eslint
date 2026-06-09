# Handler Map Alignment

Topic: TypeScript
Rule: `agentic/handler-map-alignment`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/handler-map-alignment`

Requires `Map*ToHandler` entries to reference functions named
`handle{Variant}`, and bans `any` anywhere in the map's type annotation in
favor of the `{ [K in Kind]: (state, Extract<Action, { kind: K }>) => State }`
mapped form. This rule bans `any`; the mapped form is the documented target
shape because TypeScript then verifies every entry's action parameter narrows,
and missing or extra entries are compile errors.

## Rule Shape

- Matches variable declarators whose name matches `^Map\w+ToHandler$`.
- `MapActionKindToHandler` is in scope; plural names such as
  `MapActionKindToHandlers` and extended suffixes such as
  `MapActionKindToReducerHandler` are out of scope.
- For each computed enum-member key, derives the expected handler from the enum
  member property name, not the enum string value: `[BoardActionKind.StickyCreate]`
  expects `handleStickyCreate`.
- Non-computed keys and computed keys that are not enum-member expressions are
  ignored for handler-name alignment.
- Reports `any` anywhere inside the map's type annotation.
- An untyped handler map is not reported by this rule, but it will not receive
  the mapped-form narrowing this convention is designed to preserve.

Valid:

```ts
const MapActionKindToHandler: BoardActionHandlerMap = {
  [BoardActionKind.StickyCreate]: handleStickyCreate,
  [BoardActionKind.StickyRename]: handleStickyRename,
};
```

Valid, in practice:

```ts
type BoardActionHandlerMap = {
  [K in BoardActionKind]: (state: Board, action: Extract<BoardAction, { kind: K }>) => Board;
};

const MapActionKindToHandler: BoardActionHandlerMap = {
  [BoardActionKind.StickyCreate]: handleStickyCreate,
  [BoardActionKind.StickyRename]: handleStickyRename,
};

function applyAction<K extends BoardActionKind>(
  state: Board,
  kind: K,
  action: Extract<BoardAction, { kind: K }>,
): Board {
  return MapActionKindToHandler[kind](state, action);
}

function reducer(state: Board, action: BoardAction): Board {
  return applyAction(state, action.kind, action);
}
```

Invalid:

```ts
const MapActionKindToHandler: Record<BoardActionKind, (state: Board, action: any) => Board> = {
  [BoardActionKind.StickyCreate]: handleCreateSticky,
};
```
