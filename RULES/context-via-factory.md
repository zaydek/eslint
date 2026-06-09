# Context Via Factory

Topic: React
Rule: `agentic/context-via-factory`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/context-via-factory`

Requires contexts to be created through `newGenericContext` (raw
`React.createContext` is allowed only inside the factory module), with the
binding named `{Thing}Context` and a debug identifier that matches it.

## Rule Shape

- Reports `React.createContext(...)` and bare `createContext(...)` outside files
  whose full filename path contains the case-sensitive substring
  `new-generic-context`.
- Checks `const Binding = newGenericContext(...)` calls.
- The binding name must end in `Context`.
- A literal string debug argument must equal the binding name.
- Non-literal debug arguments are not validated.
- Provider and consumer usage are not checked here; this rule only controls
  context creation.

The factory this rule assumes, owned by each downstream repo:

```tsx
// state/new-generic-context.tsx
export function newGenericContext<ContextValue>(
  debugIdentifier: string,
): NewGenericContextReturn<ContextValue> {
  const Context = React.createContext<ContextValue | null>(null);

  function useContext(): ContextValue {
    const context = React.useContext(Context);
    if (context === null) {
      throw new Error(`${debugIdentifier}: Context is null`);
    }
    return context;
  }

  return { Provider: Context.Provider, useContext };
}
```

Valid:

```ts
export const BoardContext = newGenericContext<BoardContextValue>('BoardContext');
```

Valid, in practice:

```tsx
export const BoardContext = newGenericContext<BoardContextValue>('BoardContext');

export function App(): React.ReactNode {
  const board = useNewBoard(EDITOR_INITIAL_STATE);
  return (
    <BoardContext.Provider value={board}>
      <Board />
    </BoardContext.Provider>
  );
}

function Board(): React.ReactNode {
  const board = BoardContext.useContext(); // Throws with `BoardContext:` context.
  return <div>{board.state.stickies.length}</div>;
}
```

Invalid:

```ts
const BoardContext = React.createContext(null);
```

Invalid:

```ts
export const BoardContext = newGenericContext<BoardContextValue>('EditorContext');
```
