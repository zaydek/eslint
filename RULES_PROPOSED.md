# ESLint Rules — Proposed

Seventeen proposed rules pending Operator review. All are implemented on this
branch with fixtures, exported from the public `rules` map, and documented
here. On approval, fold these sections into `RULES.md` and delete this file.

Validation: the full fixture suite passes (`npm test`), and a smoke run of only
these rules against `aug-1-make-it-count/frontend/react-router/app/idea/v2`
produced 36 warnings with zero crashes and no observed false positives —
including both historical `TOOD` typos, three misaligned handler names in
`MapActionToHandler`, and the `HTML5Hacks` namespace.

---

## Table Of Contents

- [TypeScript](#typescript)
  - [Enum Kind Suffix](#enum-kind-suffix)
  - [Enum Member Values](#enum-member-values)
  - [Enum Value Casing](#enum-value-casing)
  - [Error Message Context](#error-message-context)
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

Invalid:

```ts
enum ModalKind {
  ChatSidebar = 'ChatSidebar',
}
```

### Error Message Context

Rule: `agentic/error-message-context`

Requires thrown error messages to interpolate structured context. Static prose
like `An unexpected error occurred` carries no information; the payload is the
message.

Valid:

```ts
throw new Error(`error=${JSON.stringify(result.error)}`);
```

Invalid:

```ts
throw new Error('An unexpected error occurred');
```

### Exhaustive Switch

Rule: `agentic/exhaustive-switch`

Requires switches whose cases test enum members to close with a `default` that
calls `exhaustive()`, so adding a variant fails loudly instead of falling
through silently.

Valid:

```ts
switch (result.kind) {
  case MoveResultKind.Success:
    return result.id;
  default:
    exhaustive(result);
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
mapped form.

Valid:

```ts
const MapActionKindToHandler: BoardActionHandlerMap = {
  [BoardActionKind.StickyCreate]: handleStickyCreate,
};
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
const MapModalKindToComponent: Record<Exclude<ModalKind, ModalKind.None>, React.FC> = {};

const MapActionKindToHandler: BoardActionHandlerMap = {};

const cache: Record<string, number> = {};
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

Valid:

```ts
export const BoardContext = newGenericContext<BoardContextValue>('BoardContext');
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

Invalid:

```ts
const [isOpen, setOpen] = React.useState(false);
```

### Use New Naming

Rule: `agentic/use-new-naming`

Requires hooks that construct fresh state with `useState`/`useReducer` and
return those bindings to use the `useNew` prefix, marking them as constructor
hooks rather than selectors.

Valid:

```ts
function useNewBoard(initialBoard: Board): BoardContextValue {
  const [state, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { state, dispatchBoard };
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
`{ maxAxes }`. This is the lint encoding of "refuse the new axis until it is
proven."

Valid:

```ts
// root(:hover), rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}
//   title
//
const styles = stylex.create({ /* … */ });
```

Invalid:

```ts
// root, rootColor{Pink,Blue}, rootDensity{Compact,Comfortable}, rootState{Idle,Busy}
//
const styles = stylex.create({ /* … */ });
```

### StyleX Tokens Only

Rule: `agentic/stylex-tokens-only`

Disallows raw color literals (hex and color-function syntax) inside component
`stylex.create` calls; colors come from tokens. Files matching `.stylex.` own
the raw values and are exempt.

Valid:

```ts
const styles = stylex.create({
  root: { backgroundColor: tokens.colorLavender },
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

Requires TODO comments to use `TODO:` or `TODO(scope):`. Flags lowercase and
mixed-case markers, colonless TODOs, and common misspellings such as `TOOD`.
Prose that merely contains the word (for example "todos") is out of scope.

Valid:

```ts
// TODO: Disable tabbing while the modal is open
// TODO(modal): Disable tabbing while the modal is open
```

Invalid:

```ts
// TOOD: This seems overcomplicated
// todo: lowercase marker
const min = 8; // TODO
```
