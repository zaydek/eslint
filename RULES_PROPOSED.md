# ESLint Rules — Proposed

Seventeen proposed rules pending Operator review. All are implemented on this
branch with fixtures, exported from the public `rules` map, and documented
here. On approval, fold these sections into `RULES.md` and delete this file.

Each rule shows two valid examples: a bare shape example, and an in-practice
example showing the convention doing real work.

Validation: the full fixture suite passes (`npm test`), and a smoke run of only
these rules against `aug-1-make-it-count/frontend/react-router/app/idea/v2`
produced 36 warnings with zero crashes and no observed false positives —
including both historical `TOOD` typos, three misaligned handler names in
`MapActionToHandler`, and the `HTML5Hacks` namespace.

Open review notes:

- `error-message-context`: implemented and tested but **disabled** — excluded
  from the public `rules` map and commented out below — while the message
  shape is unresolved. Candidate alternative: human prose plus structured
  payload via the standard `cause` option —
  `new Error('An unexpected error occurred', { cause: result.error })` — with
  the rule requiring static messages to carry a `cause`.
- `use-new-naming`: whether consumers also need a marker (`useGivenBoard`) is
  open; today consumption is already explicit via `BoardContext.useContext()`.
- `max-variant-axes`: the most opinionated rule of the slate; drop it if the
  axis cap feels premature.

---

## Table Of Contents

- [TypeScript](#typescript)
  - [Enum Kind Suffix](#enum-kind-suffix)
  - [Enum Member Values](#enum-member-values)
  - [Enum Value Casing](#enum-value-casing)
  <!-- - [Error Message Context](#error-message-context) — disabled, see open review notes -->
  - [Exhaustive Switch](#exhaustive-switch)
  - [Handler Map Alignment](#handler-map-alignment)
  - [Map Record Names](#map-record-names)
  - [No Namespaces](#no-namespaces)
  - [Result Shape](#result-shape)
- [React](#react)
  - [Context Via Factory](#context-via-factory)
  - [Namespace Imports](#namespace-imports)
  - [State Setter Pairs](#state-setter-pairs)
  - [Use New Naming](#use-new-naming)
- [StyleX](#stylex)
  - [Enum Style Variants](#enum-style-variants)
  - [Max Variant Axes](#max-variant-axes)
  - [StyleX Tokens Only](#stylex-tokens-only)
- [Comments](#comments)
  - [TODO Format](#todo-format)

---

## TypeScript

### Enum Kind Suffix

Rule: `agentic/enum-kind-suffix`

Prefers `Kind`-suffixed enum names over the legacy `Type` suffix so the
discriminant vocabulary stays aligned with `agentic/discriminant-kind`.

Valid:

```ts
enum BoardActionKind {
  StickyCreate = 'STICKY_CREATE',
}
```

Valid, in practice:

```ts
export enum BoardActionKind {
  StickyCreate = 'STICKY_CREATE',
  StickyMove = 'STICKY_MOVE',
}

export type BoardAction =
  | { kind: BoardActionKind.StickyCreate; title: string }
  | { kind: BoardActionKind.StickyMove; id: string; priority: StickyPriority };
```

Invalid:

```ts
enum EditorActionType {
  Reinitialize = 'REINITIALIZE',
}
```

### Enum Member Values

Rule: `agentic/enum-member-values`

Requires every enum member to carry an explicit string initializer.
Auto-numbered members break serialization and silently change meaning when
reordered.

Valid:

```ts
enum StickyColor {
  Lavender = 'LAVENDER',
}
```

Valid, in practice:

```ts
// Values are wire-stable: persisted boards survive member reordering.
export enum StickyPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}
```

Invalid:

```ts
enum StickyColor {
  Lavender,
}
```

### Enum Value Casing

Rule: `agentic/enum-value-casing`

Requires enum string values to use SCREAMING_SNAKE_CASE. These values leak
into logs and wire formats, so they follow machine casing, not member casing.

Valid:

```ts
enum ModalKind {
  ChatSidebar = 'CHAT_SIDEBAR',
}
```

Valid, in practice:

```ts
// A log line reads `action.kind=STICKY_CREATE` — unambiguous machine casing.
export enum BoardActionKind {
  StickyCreate = 'STICKY_CREATE',
  StickyRename = 'STICKY_RENAME',
}
```

Invalid:

```ts
enum ModalKind {
  ChatSidebar = 'ChatSidebar',
}
```

<!--
### Error Message Context — DISABLED

Rule: `agentic/error-message-context` (implemented, excluded from the public
`rules` map; see the open review notes)

Requires thrown error messages to interpolate structured context. Static prose
like `An unexpected error occurred` carries no information; the payload is the
message. This rule may move to requiring a `cause` argument alongside a
human-readable message instead.

Valid:

throw new Error(`error=${JSON.stringify(result.error)}`);

Invalid:

throw new Error('An unexpected error occurred');
-->


### Exhaustive Switch

Rule: `agentic/exhaustive-switch`

Requires switches whose cases test enum members to close with a `default` that
calls `exhaustive()`, so adding a variant fails loudly instead of falling
through silently. Pass the switched-on value itself: `exhaustive(direction)`
for an enum switch, `exhaustive(result)` for a discriminated-union switch —
TypeScript narrows either to `never`.

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

### Handler Map Alignment

Rule: `agentic/handler-map-alignment`

Requires `Map*ToHandler` entries to reference functions named
`handle{Variant}`, and bans `any` anywhere in the map's type annotation in
favor of the `{ [K in Kind]: (state, Extract<Action, { kind: K }>) => State }`
mapped form. The mapped form is verified to compile under `--strict`: every
entry's action parameter narrows, and missing or extra entries are compile
errors.

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

### Map Record Names

Rule: `agentic/map-record-names`

Requires `Record` constants keyed by a closed set (enum, literal union, or
template literal type) to be named `Map{Key}To{Value}`, and requires anything
named `Map*To*` to carry a type annotation declaring its key set. Named mapped
types such as `BoardActionHandlerMap` pass, so this composes with
`agentic/handler-map-alignment`. Open keys such as `Record<string, …>` carry
no map contract.

Valid:

```ts
const MapStatusToLabel: Record<'idle' | 'busy', string> = {
  idle: 'Idle',
  busy: 'Working…',
};
```

Valid, in practice:

```ts
const MapModalKindToComponent: Record<Exclude<ModalKind, ModalKind.None>, React.FC> = {
  [ModalKind.ChatSidebar]: ModalChatSidebar,
  [ModalKind.SettingsSidebar]: ModalSettings,
};

export function EditorModals(): React.ReactNode {
  const editorSettings = EditorSettingsContext.useContext();
  if (editorSettings.modal === ModalKind.None) {
    return null;
  }
  return React.createElement(MapModalKindToComponent[editorSettings.modal]);
}
```

Invalid:

```ts
const handlers: Record<ItemKind, () => void> = {};
```

### No Namespaces

Rule: `agentic/no-namespaces`

Disallows TypeScript namespaces; modules are the container. Ambient
declarations (`declare module`, `declare global`) remain out of scope.

Valid:

```ts
export function copyTextSync(text: string): CopyTextSyncResult {
  return { kind: ResultKind.Success };
}
```

Valid, in practice:

```ts
// html5-hacks.ts — the file is the namespace; callers import what they need.
import { copyTextSync, ResultKind } from '../utils/html5-hacks';

const result = copyTextSync(text);
const isCopied = result.kind === ResultKind.Success;
```

Invalid:

```ts
namespace HTML5Hacks {
  export function copyTextSync(): void {}
}
```

### Result Shape

Rule: `agentic/result-shape`

Requires exported `*Result` types to be `kind`-discriminated unions, and
requires `error` payloads to reference a closed `*ErrorKind` enum so failure
sets stay closed too.

Valid:

```ts
export type MoveResult =
  | { kind: MoveResultKind.Success; id: string }
  | { kind: MoveResultKind.Error; error: MoveErrorKind };
```

Valid, in practice:

```ts
export enum MoveResultKind {
  Success = 'SUCCESS',
  Error = 'ERROR',
}

export enum MoveErrorKind {
  CannotFindElementByID = 'CANNOT_FIND_ELEMENT_BY_ID',
  NextIndexIsOutOfBounds = 'NEXT_INDEX_IS_OUT_OF_BOUNDS',
}

export type MoveResult =
  | { kind: MoveResultKind.Success; id: string }
  | { kind: MoveResultKind.Error; error: MoveErrorKind };

export function move(elements: EditorElement[], args: MoveArgs): MoveResult {
  // …
}
```

Invalid:

```ts
export type MoveResult =
  | { kind: MoveResultKind.Success; id: string }
  | { error: string };
```

---

## React

### Context Via Factory

Rule: `agentic/context-via-factory`

Requires contexts to be created through `newGenericContext` (raw
`React.createContext` is allowed only inside the factory module), with the
binding named `{Thing}Context` and a debug identifier that matches it.

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

export const BoardContext = newGenericContext<BoardContextValue>('EditorContext');
```

### Namespace Imports

Rule: `agentic/namespace-imports`

Requires `react` and `@stylexjs/stylex` to be imported as canonical namespaces
(`React`, `stylex`). Type-only imports are out of scope.

Valid:

```ts
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
```

Valid, in practice:

```tsx
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

export function Sticky(props: StickyProps): React.ReactNode {
  const [isOpen, setIsOpen] = React.useState(false);
  return <article {...stylex.props(styles.root)}>{props.children}</article>;
}
```

Invalid:

```ts
import { useState } from 'react';
```

### State Setter Pairs

Rule: `agentic/state-setter-pairs`

Requires `useState` destructuring to use exact `[thing, setThing]` pairs.
Completes the naming trio with `agentic/boolean-names` and
`agentic/reducer-dispatch-names`.

Valid:

```ts
const [isOpen, setIsOpen] = React.useState(false);
```

Valid, in practice:

```ts
const [modal, setModal] = React.useState<ModalKind>(ModalKind.None);
const [isModalExpanded, setIsModalExpanded] = React.useState(false);
const [fontSize, setFontSize] = React.useState(12);
```

Invalid:

```ts
const [isOpen, setOpen] = React.useState(false);
```

### Use New Naming

Rule: `agentic/use-new-naming`

Requires hooks that construct fresh state with `useState`/`useReducer` and
return those bindings to use the `useNew` prefix, marking them as constructor
hooks. Consumers stay explicit through `{Thing}Context.useContext()`, and
derived hooks keep plain `use` names.

Valid:

```ts
function useNewBoard(initialBoard: Board): BoardContextValue {
  const [state, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { state, dispatchBoard };
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
  const [state, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { state, dispatchBoard };
}
```

---

## StyleX

### Enum Style Variants

Rule: `agentic/enum-style-variants`

Requires `Map{Enum}ToStyle` records to reference a single style-key family
`{stem}{Variant}` whose variant set matches the enum: every key ends with its
enum variant, every entry shares one stem, referenced keys exist in the file's
`stylex.create`, and a same-file enum must be fully covered. An `Exclude<>`
annotation narrows the key set on purpose and skips the completeness check.
The enum, the ownership comment, and `stylex.create` become three spellings of
one closed set.

Valid:

```ts
enum StickyColor { Lavender = 'LAVENDER', Sky = 'SKY' }

const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.rootColorLavender,
  [StickyColor.Sky]: styles.rootColorSky,
};
```

Valid, in practice:

```tsx
export enum StickyColor { Lavender = 'LAVENDER', Sky = 'SKY' }

export function Sticky(props: StickyProps): React.ReactNode {
  return (
    <article {...stylex.props(styles.root, MapStickyColorToStyle[props.color])}>
      {props.children}
    </article>
  );
}

// root, rootColor{Lavender,Sky}
//
const styles = stylex.create({
  root: { borderRadius: tokens.size2 },
  rootColorLavender: { backgroundColor: tokens.colorLavender },
  rootColorSky: { backgroundColor: tokens.colorSky },
});

const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.rootColorLavender,
  [StickyColor.Sky]: styles.rootColorSky,
};
```

Invalid:

```ts
const MapStickyColorToStyle = {
  [StickyColor.Lavender]: styles.rootColorLavender,
  [StickyColor.Sky]: styles.surfaceColorSky,
};
```

### Max Variant Axes

Rule: `agentic/max-variant-axes`

Limits how many orthogonal variant families (`rootColor{…}`, `rootDensity{…}`,
`rootState{…}`) one styled element may accrue, as counted from the ownership
comment's brace groups. Defaults to 2 axes per element; configurable via
`{ maxAxes }`. Singleton keys like `rootIsCursor` are not families and never
count. This is the lint encoding of "refuse the new axis until it is proven."

Valid:

```ts
// root(:hover), rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}
//   title
//
const styles = stylex.create({ /* … */ });
```

Valid, in practice:

```ts
// Two families plus a singleton state key: still two axes.
//
// root(:hover), rootColor{Lavender,Sky}, rootDensity{Compact,Comfortable}, rootIsCursor
//   title
//   footer
//
const styles = stylex.create({
  root: {},
  rootColorLavender: {},
  rootColorSky: {},
  rootDensityCompact: {},
  rootDensityComfortable: {},
  rootIsCursor: {},
  title: {},
  footer: {},
});
```

Invalid:

```ts
// root, rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}, rootState{Idle,Busy}
//
const styles = stylex.create({ /* … */ });
```

### StyleX Tokens Only

Rule: `agentic/stylex-tokens-only`

Disallows raw color literals — hex values and color-function syntax such as
`rgb(…)` or `oklch(…)` — inside component `stylex.create` calls; colors come
from tokens. Only colors are policed: sizes, radii, durations, and other
literals are untouched. Files matching `.stylex.` own the raw values and are
exempt.

Valid:

```ts
const styles = stylex.create({
  root: { backgroundColor: tokens.colorLavender },
});
```

Valid, in practice:

```ts
// Non-color literals are fine; only the color values must come from tokens.
const styles = stylex.create({
  root: {
    backgroundColor: tokens.colorLavender,
    borderRadius: '16px',
    padding: '14px 16px',
    transitionDuration: '150ms',
  },
});
```

Invalid:

```ts
const styles = stylex.create({
  root: { backgroundColor: '#c5b4ee' },
});
```

---

## Comments

### TODO Format

Rule: `agentic/todo-format`

Requires canonical uppercase markers, with the allowed set carried as data:
`{ markers }` defaults to `TODO`, `BUG`, `FIXME`, `IMPROVEMENT`,
`OPTIMIZATION`. A marker is declared by a `(scope)` or trailing colon at the
start of a comment, so bare `// TODO` and prose that merely contains a marker
word stay out of scope. Misspellings such as `TOOD` are flagged anywhere.

Scopes are attributions, only: `TODO(@zaydek)` or
`TODO(@claude-code/opus-4.8/xhigh)`. There is no `TODO(modal)`. Attributions
are validated against `{ attributionPattern }`; the default is permissive
(`^@[\w.-]+(?:/[\w.-]+)*$`) and can be tightened in config when the
`{harness}/{model}-{version}/{effort}` grammar stabilizes, no rule change
needed.

Valid:

```ts
// TODO
// TODO(@claude-code/opus-4.8/xhigh): Tighten the axis cap
```

Valid, in practice:

```ts
// TODO: Disable tabbing while the modal is open
// TODO(@zaydek): Ship the modal
const min = 8; // TODO
// Bug fix for the modal layering issue — prose, not a marker.
```

Invalid:

```ts
// TOOD: This seems overcomplicated
// todo: lowercase marker
// Fixme: mixed-case marker
// TODO(modal): Scopes are attributions only
// TODO(@claude code): Spaces break attribution
```
