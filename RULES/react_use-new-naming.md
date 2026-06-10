# Use New Naming

Topic: React
Rule: `agentic/use-new-naming`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/use-new-naming`

Requires hooks that construct fresh state with `useState`/`useReducer` and
return those bindings to use the `useNew` prefix, marking them as constructor
hooks. Consumers stay explicit through `{Thing}Context.useContext()`, and
derived hooks keep plain `use` names.

## Rule Shape

- Matches hook-like function declarations and function-valued variables whose
  names start with `use` followed by an uppercase letter.
- Ignores names already starting with `useNew`.
- Collects top-level array destructuring bindings initialized by `useState`,
  `useReducer`, `React.useState`, or `React.useReducer`.
- Reports when the function returns an object literal containing one of those
  state, setter, or dispatch bindings directly.
- Does not follow aliases, nested return objects, helper calls, or bindings
  passed through another function.

Valid:

```ts
function useNewBoard(initialBoard: Board): BoardContextValue {
  const [board, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { board, dispatchBoard };
}
```

Valid, in practice:

```ts
// Constructor hook: creates the state, called once at the provider.
export function useNewEditorSettings(): EditorSettingsContextValue {
  const [modal, setModal] = React.useState<ModalKind>(ModalKind.None);
  const [fontSize, setFontSize] = React.useState(12);
  return { modal, setModal, fontSize, setFontSize };
}

// Derived hook: selects from existing state, plain `use` name.
function useStickyCount(): number {
  const board = BoardContext.useContext();
  return board.state.stickies.length;
}
```

Invalid:

```ts
function useBoard(initialBoard: Board): BoardContextValue {
  const [board, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { board, dispatchBoard };
}
```
