# ESLint Rules

`RULES.md` is the compact index. Detailed agent-facing rule docs live in `RULES/{topic}_{rule}.md`.

The `agentic/` prefix comes from the consumer plugin name; this package exports flat rule keys.

## Quick Setup

Add the private package and peer dependencies from a downstream Zaydek repo:

```json
{
  "devDependencies": {
    "@zaydek/eslint": "file:../../eslint",
    "@stylexjs/eslint-plugin": "^0.18.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^10.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "eslint-plugin-react-hooks": "^7.0.0",
    "globals": "^17.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

Use the shared ESLint v9 flat config in `eslint.config.js`:

```js
export { default } from "@zaydek/eslint/config";
```

Then run `npm install` and `npm run lint` in the downstream repo.

Diagnostics are written for agents:

```text
<Problem>
Fix: <required action>
See: ~/GitHub/zaydek/eslint/RULES/{topic}_{rule}.md
```

Follow the `See:` path first. Do not enable `dormantRules` downstream; those
exist only so draft/disabled rules can remain documented and testable here.

## Table Of Contents

- [TypeScript](#typescript)
  - [Articulated Object Contracts](#articulated-object-contracts)
  - [Associated Exports](#associated-exports)
  - [Boolean Names](#boolean-names)
  - [Discriminant Kind](#discriminant-kind)
  - [Enum Kind Suffix](#enum-kind-suffix)
  - [Enum Member Values](#enum-member-values)
  - [Enum Value Casing](#enum-value-casing)
  - [Error Message Context](#error-message-context) — disabled
  - [Exhaustive Switch](#exhaustive-switch)
  - [Function Declarations](#function-declarations)
  - [Handler Map Alignment](#handler-map-alignment)
  - [Kebab-Case Source Filenames](#kebab-case-source-filenames)
  - [Map Record Names](#map-record-names)
  - [Named Complex Return Types](#named-complex-return-types)
  - [Named Nested Types](#named-nested-types)
  - [No Concision Names](#no-concision-names)
  - [No Namespaces](#no-namespaces)
  - [Prefer Type Aliases](#prefer-type-aliases)
  - [Result Shape](#result-shape)
- [React](#react)
  - [Component Body Layout](#component-body-layout)
  - [Component Props](#component-props)
  - [Context Via Factory](#context-via-factory)
  - [Exported Component Props](#exported-component-props)
  - [Namespace Imports](#namespace-imports)
  - [No Manual Memoization](#no-manual-memoization)
  - [Reducer Dispatch Names](#reducer-dispatch-names)
  - [Ref Names](#ref-names)
  - [State Setter Pairs](#state-setter-pairs)
  - [Use New Naming](#use-new-naming)
- [StyleX](#stylex)
  - [Enum Style Variants](#enum-style-variants)
  - [Max Variant Axes](#max-variant-axes)
  - [No SX Prop](#no-sx-prop)
  - [StyleX Key Names](#stylex-key-names)
  - [StyleX Object Spacing](#stylex-object-spacing)
  - [StyleX Ownership Comment](#stylex-ownership-comment)
  - [StyleX Placement](#stylex-placement)
  - [StyleX Props First](#stylex-props-first)
  - [StyleX Tokens Only](#stylex-tokens-only)
- [Comments](#comments)
  - [Comment Capitalization](#comment-capitalization)
  - [TODO Format](#todo-format)

## TypeScript

### Articulated Object Contracts

Rule: `agentic/articulated-object-contracts`. Details: [RULES/typescript_articulated-object-contracts.md](RULES/typescript_articulated-object-contracts.md).

Valid:

```ts
export type EditableTitleProps = {
  /** Current committed title text shown when the control is not editing. */
  value: string;
  /** Called when the component requests entering or leaving edit mode. */
  onEditingChange: (isEditing: boolean) => void;
};

export type AxisTreeNode = TreeNodeBase & {
  /** Tree node category. */
  nodeKind: "axis";
  /** Manifest node kind represented by this axis. */
  kind: "version";
  /** Direct version count. */
  count: number;
  /** Idea nodes grouped under this axis. */
  nodes: IdeaNode[];
};
```

Invalid:

```ts
export type EditableTitleProps = { value: string; onEditingChange: (isEditing: boolean) => void };

export type AxisTreeNode = TreeNodeBase & {
  nodeKind: "axis";
  kind: "version";
  count: number;
  nodes: IdeaNode[];
};
```

### Associated Exports

Rule: `agentic/associated-exports`. Details: [RULES/typescript_associated-exports.md](RULES/typescript_associated-exports.md).

Valid:

```ts
export type FooArgs = {
  /** Stable external identifier used to load the foo record. */
  id: string;
};

export type FooReturn = {
  /** Stable external identifier returned for the foo record. */
  id: string;
};

export function getFoo(args: FooArgs): FooReturn {
  return args;
}
```

Invalid:

```ts
type FooArgs = {
  /** Stable external identifier used to load the foo record. */
  id: string;
};

export function getFoo(args: FooArgs): FooArgs {
  return args;
}
```

### Boolean Names

Rule: `agentic/boolean-names`. Details: [RULES/typescript_boolean-names.md](RULES/typescript_boolean-names.md).

Valid:

```ts
const isOpen = true;
const [isMounted, setIsMounted] = useState(false);
const [isDragging, setIsDragging] = useState(false);
```

Invalid:

```ts
const open = true;
const [mounted, setMounted] = useState(false);
const [dragging, setDragging] = useState(false);
```

### Discriminant Kind

Rule: `agentic/discriminant-kind`. Details: [RULES/typescript_discriminant-kind.md](RULES/typescript_discriminant-kind.md).

Valid:

```ts
export type IconAssetSvg = {
  /** Variant discriminator for SVG icon assets. */
  kind: "svg";
  /** URL used to load the SVG asset. */
  url: string;
};
```

Invalid:

```ts
export type IconAssetSvg = {
  /** Variant discriminator for SVG icon assets. */
  type: "svg";
  /** URL used to load the SVG asset. */
  url: string;
};
```

### Enum Kind Suffix

Rule: `agentic/enum-kind-suffix`. Details: [RULES/typescript_enum-kind-suffix.md](RULES/typescript_enum-kind-suffix.md).

Valid:

```ts
enum BoardActionKind {
  StickyCreate = "STICKY_CREATE",
}
```

Invalid:

```ts
enum EditorActionType {
  Reinitialize = "REINITIALIZE",
}
```

### Enum Member Values

Rule: `agentic/enum-member-values`. Details: [RULES/typescript_enum-member-values.md](RULES/typescript_enum-member-values.md).

Valid:

```ts
enum StickyColor {
  Lavender = "LAVENDER",
}
```

Invalid:

```ts
enum StickyColor {
  Lavender,
}
```

### Enum Value Casing

Rule: `agentic/enum-value-casing`. Details: [RULES/typescript_enum-value-casing.md](RULES/typescript_enum-value-casing.md).

Valid:

```ts
enum ModalKind {
  ChatSidebar = "CHAT_SIDEBAR",
}
```

Invalid:

```ts
enum ModalKind {
  ChatSidebar = "ChatSidebar",
}
```

### Error Message Context

Rule: `agentic/error-message-context`. Details: [RULES/typescript_error-message-context.md](RULES/typescript_error-message-context.md). Disabled.

Valid:

```ts
throw new Error(`error=${JSON.stringify(result.error)}`);
```

Invalid:

```ts
throw new Error("An unexpected error occurred");
```

### Exhaustive Switch

Rule: `agentic/exhaustive-switch`. Details: [RULES/typescript_exhaustive-switch.md](RULES/typescript_exhaustive-switch.md).

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

### Function Declarations

Rule: `agentic/function-declarations`. Details: [RULES/typescript_function-declarations.md](RULES/typescript_function-declarations.md).

Valid:

```ts
function getThing(): string {
  return "x";
}

const getLabel = (): string => "x";
```

Invalid:

```ts
const getThing = (): string => {
  return "x";
};
```

### Handler Map Alignment

Rule: `agentic/handler-map-alignment`. Details: [RULES/typescript_handler-map-alignment.md](RULES/typescript_handler-map-alignment.md).

Valid:

```ts
const MapActionKindToHandler: BoardActionHandlerMap = {
  [BoardActionKind.StickyCreate]: handleStickyCreate,
  [BoardActionKind.StickyRename]: handleStickyRename,
};
```

Invalid:

```ts
const MapActionKindToHandler: Record<BoardActionKind, (state: Board, action: any) => Board> = {
  [BoardActionKind.StickyCreate]: handleCreateSticky,
};
```

### Kebab-Case Source Filenames

Rule: `agentic/kebab-case-source-filenames`. Details: [RULES/typescript_kebab-case-source-filenames.md](RULES/typescript_kebab-case-source-filenames.md).

Valid:

```ts
// Filename: src/app-data.ts
export {};
```

Invalid:

```ts
// Filename: src/appData.ts
export {};
```

### Map Record Names

Rule: `agentic/map-record-names`. Details: [RULES/typescript_map-record-names.md](RULES/typescript_map-record-names.md).

Valid:

```ts
const MapStatusToLabel: Record<"idle" | "busy", string> = { idle: "Idle", busy: "Working…" };
```

Invalid:

```ts
const handlers: Record<ItemKind, () => void> = {};
```

### Named Complex Return Types

Rule: `agentic/named-complex-return-types`. Details: [RULES/typescript_named-complex-return-types.md](RULES/typescript_named-complex-return-types.md).

Valid:

```ts
export type FooReturn = {
  /** Display text returned by the foo loader. */
  foo: string;
};

export function getFoo(): FooReturn {
  return { foo: "x" };
}
```

Invalid:

```ts
export function getFoo(): { foo: string } {
  return { foo: "x" };
}
```

### Named Nested Types

Rule: `agentic/named-nested-types`. Details: [RULES/typescript_named-nested-types.md](RULES/typescript_named-nested-types.md).

Valid:

```ts
export type FooReturnItem = {
  /** Stable external identifier for the item. */
  id: string;
};

export type FooReturn = {
  /** Item returned by the loader. */
  item: FooReturnItem;
};
```

Invalid:

```ts
export type FooReturn = {
  /** Item returned by the loader. */
  item: {
    /** Stable external identifier for the item. */
    id: string;
  };
};
```

### No Concision Names

Rule: `agentic/no-concision-names`. Details: [RULES/typescript_no-concision-names.md](RULES/typescript_no-concision-names.md).

Valid:

```ts
const configurationPath = "./settings.json";
const documentBody = "";
```

Invalid:

```ts
const configPath = "./settings.json";
const docBody = "";
```

### No Namespaces

Rule: `agentic/no-namespaces`. Details: [RULES/typescript_no-namespaces.md](RULES/typescript_no-namespaces.md).

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

### Prefer Type Aliases

Rule: `agentic/prefer-type-aliases`. Details: [RULES/typescript_prefer-type-aliases.md](RULES/typescript_prefer-type-aliases.md).

Valid:

```ts
export type ShortcutsModalProps = {
  /** Called when the modal requests closing. */
  onClose: () => void;
};
```

Invalid:

```ts
export interface ShortcutsModalProps {
  /** Called when the modal requests closing. */
  onClose: () => void;
}
```

### Result Shape

Rule: `agentic/result-shape`. Details: [RULES/typescript_result-shape.md](RULES/typescript_result-shape.md).

Valid:

```ts
export type MoveResult =
  | {
      /** Result variant. */
      kind: MoveResultKind.Success;
      /** Moved element identifier. */
      id: string;
    }
  | {
      /** Result variant. */
      kind: MoveResultKind.Error;
      /** Closed move error reason. */
      error: MoveErrorKind;
    };
```

Invalid:

```ts
export type MoveResult =
  | {
      /** Result variant. */
      kind: MoveResultKind.Success;
      /** Moved element identifier. */
      id: string;
    }
  | {
      /** Result variant. */
      kind: MoveResultKind.Error;
      /** Open-ended error message. */
      error: string;
    };
```

## React

### Component Body Layout

Rule: `agentic/component-body-layout`. Details: [RULES/react_component-body-layout.md](RULES/react_component-body-layout.md).

Valid:

```tsx
export type EditModalProps = {
  /** Initial title shown in the text field. */
  initialName: string;
  /** Called when the modal commits the edited title. */
  onSave: (name: string) => void;
};

export function EditModal(props: EditModalProps): JSX.Element {
  const params = useParams();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasMountedRef = useRef(false);

  const [name, setName] = useState(props.initialName);
  const [error, setError] = useState("");

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0;
  const routeId = params.id ?? "";

  useEffect(() => {
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;
    inputRef.current?.focus();
  }, [routeId]);

  function handleSave(): void {
    if (!canSave) {
      setError("Name is required");
      return;
    }

    props.onSave(trimmedName);
  }

  const handlers = { onSave: handleSave };

  return (
    <button disabled={!canSave} onClick={handlers.onSave}>
      {error || "Save"}
    </button>
  );
}
```

Invalid:

```tsx
export type EditModalProps = {
  /** Initial title shown in the text field. */
  initialName: string;
  /** Called when the modal commits the edited title. */
  onSave: (name: string) => void;
};

export function EditModal(props: EditModalProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(props.initialName);

  const trimmedName = name.trim();

  return (
    <button onClick={() => props.onSave(trimmedName)} ref={inputRef}>
      {name}
    </button>
  );
}
```

### Component Props

Rule: `agentic/component-props`. Details: [RULES/react_component-props.md](RULES/react_component-props.md).

Valid:

```tsx
type RenameDialogProps = {
  /** Optional title shown at the top of the dialog. */
  title?: string;
};

function RenameDialog(props: RenameDialogProps): JSX.Element {
  return <div>{props.title}</div>;
}

function RenameDialogWithDefault({ title = "Rename" }: RenameDialogProps): JSX.Element {
  return <div>{title}</div>;
}
```

Invalid:

```tsx
function RenameDialog(props: { title: string }): JSX.Element {
  return <div>{props.title}</div>;
}
```

### Context Via Factory

Rule: `agentic/context-via-factory`. Details: [RULES/react_context-via-factory.md](RULES/react_context-via-factory.md).

Valid:

```ts
export const BoardContext = newGenericContext<BoardContextValue>("BoardContext");
```

Invalid:

```ts
const BoardContext = React.createContext(null);
```

### Exported Component Props

Rule: `agentic/exported-component-props`. Details: [RULES/react_exported-component-props.md](RULES/react_exported-component-props.md).

Valid:

```tsx
export type ButtonProps = {
  /** Text rendered inside the button. */
  label: string;
};

export function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
```

Invalid:

```tsx
type ButtonProps = {
  /** Text rendered inside the button. */
  label: string;
};

export function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
```

### Namespace Imports

Rule: `agentic/namespace-imports`. Details: [RULES/react_namespace-imports.md](RULES/react_namespace-imports.md).

Valid:

```ts
import * as stylex from "@stylexjs/stylex";
```

Invalid:

```ts
import stylex from "@stylexjs/stylex";
```

### No Manual Memoization

Rule: `agentic/no-manual-memoization`. Details: [RULES/react_no-manual-memoization.md](RULES/react_no-manual-memoization.md).

Valid:

```tsx
function Button(): JSX.Element {
  return <button />;
}

function notify(message: string): void {
  console.log(message);
}
```

Invalid:

```tsx
const notify = useCallback(() => {}, []);
export default React.memo(Button);
```

### Reducer Dispatch Names

Rule: `agentic/reducer-dispatch-names`. Details: [RULES/react_reducer-dispatch-names.md](RULES/react_reducer-dispatch-names.md).

Valid:

```ts
const [board, dispatchBoard] = useReducer(reducer, initialValue);
```

Invalid:

```ts
const [board, setBoard] = useReducer(reducer, initialValue);
```

### Ref Names

Rule: `agentic/ref-names`. Details: [RULES/react_ref-names.md](RULES/react_ref-names.md).

Valid:

```ts
const doneRef = React.useRef(false);
```

Invalid:

```ts
const done = React.useRef(false);
```

### State Setter Pairs

Rule: `agentic/state-setter-pairs`. Details: [RULES/react_state-setter-pairs.md](RULES/react_state-setter-pairs.md).

Valid:

```ts
const [isOpen, setIsOpen] = React.useState(false);
```

Invalid:

```ts
const [isOpen, setOpen] = React.useState(false);
```

### Use New Naming

Rule: `agentic/use-new-naming`. Details: [RULES/react_use-new-naming.md](RULES/react_use-new-naming.md).

Valid:

```ts
function useNewBoard(initialBoard: Board): BoardContextValue {
  const [board, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { board, dispatchBoard };
}
```

Invalid:

```ts
function useBoard(initialBoard: Board): BoardContextValue {
  const [board, dispatchBoard] = React.useReducer(reducer, initialBoard);
  return { board, dispatchBoard };
}
```

## StyleX

### Enum Style Variants

Rule: `agentic/enum-style-variants`. Details: [RULES/stylex_enum-style-variants.md](RULES/stylex_enum-style-variants.md).

Valid:

```ts
enum StickyColor {
  Lavender = "LAVENDER",
  Sky = "SKY",
}

const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.RootWithLavender,
  [StickyColor.Sky]: styles.RootWithSky,
};
```

Invalid:

```ts
const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.RootWithLavender,
  [StickyColor.Sky]: styles.SurfaceWithSky,
};
```

### Max Variant Axes

Rule: `agentic/max-variant-axes`. Details: [RULES/stylex_max-variant-axes.md](RULES/stylex_max-variant-axes.md).

Valid:

```ts
// Root{With{Pink|Blue}, Is{Compact|Comfortable}}
//   Title
//
const styles = stylex.create({
  Root: {},
  RootWithPink: {},
  RootWithBlue: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  Title: {},
});
```

Invalid:

```ts
// Root{With{Pink|Blue}, Is{Compact|Comfortable}, Has{Idle|Busy}}
//
const styles = stylex.create({
  Root: {},
  RootWithPink: {},
  RootWithBlue: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  RootHasIdle: {},
  RootHasBusy: {},
});
```

### No SX Prop

Rule: `agentic/no-sx-prop`. Details: [RULES/stylex_no-sx-prop.md](RULES/stylex_no-sx-prop.md).

Valid:

```tsx
const node = <div {...stylex.props(styles.Root)} />;
```

Invalid:

```tsx
const node = <div sx={styles.Root} />;
```

### StyleX Key Names

Rule: `agentic/stylex-key-names`. Details: [RULES/stylex_stylex-key-names.md](RULES/stylex_stylex-key-names.md).

Valid:

```ts
// Root{With{Pink|Blue|Green}}
//   Title
//
//   Footer
//     FooterAvatarStack
//
const styles = stylex.create({
  Root: {},
  RootWithPink: {},
  RootWithBlue: {},
  RootWithGreen: {},
  Title: {},
  Footer: {},
  FooterAvatarStack: {},
});
```

Invalid:

```ts
// Card
//   CardFooter
//     AvatarStack
//
const styles = stylex.create({ Card: {}, CardFooter: {}, AvatarStack: {} });
```

### StyleX Object Spacing

Rule: `agentic/stylex-object-spacing`. Details: [RULES/stylex_stylex-object-spacing.md](RULES/stylex_stylex-object-spacing.md).

Valid:

```ts
// Card
//   CardTitle
//
const styles = stylex.create({ Card: {}, CardTitle: {} });
```

Invalid:

```ts
// Card
//   CardTitle
//
const styles = stylex.create({
  Card: {},

  CardTitle: {},
});
```

### StyleX Ownership Comment

Rule: `agentic/stylex-ownership-comment`. Details: [RULES/stylex_stylex-ownership-comment.md](RULES/stylex_stylex-ownership-comment.md).

Valid:

```ts
// Root{Is{Compact|Comfortable}}, ?{IsSelected}
//   Header
//     HeaderTitle
//
//   Footer
//     FooterAvatarStack
//
const styles = stylex.create({
  Root: {},
  RootIsCompact: {},
  RootIsComfortable: {},
  RootIsSelected: {},
  Header: {},
  HeaderTitle: {},
  Footer: {},
  FooterAvatarStack: {},
});
```

Invalid:

```ts
// Card
//
const styles = stylex.create({ Card: {}, CardTitle: {} });
```

### StyleX Placement

Rule: `agentic/stylex-placement`. Details: [RULES/stylex_stylex-placement.md](RULES/stylex_stylex-placement.md).

Valid:

```tsx
function Component(): JSX.Element {
  return <div {...stylex.props(styles.Root)} />;
}

// Root
//
const styles = stylex.create({ Root: {} });
```

Invalid:

```tsx
// Root
//
const styles = stylex.create({ Root: {} });

function Component(): JSX.Element {
  return <div {...stylex.props(styles.Root)} />;
}
```

### StyleX Props First

Rule: `agentic/stylex-props-first`. Details: [RULES/stylex_stylex-props-first.md](RULES/stylex_stylex-props-first.md).

Valid:

```tsx
const node = <div {...stylex.props(styles.Root)} id="root" />;
```

Invalid:

```tsx
const node = <div id="root" {...stylex.props(styles.Root)} />;
```

### StyleX Tokens Only

Rule: `agentic/stylex-tokens-only`. Details: [RULES/stylex_stylex-tokens-only.md](RULES/stylex_stylex-tokens-only.md).

Valid:

```ts
// Root
//
const styles = stylex.create({ Root: { backgroundColor: tokens.colorLavender } });
```

Invalid:

```ts
// Root
//
const styles = stylex.create({ Root: { backgroundColor: "#c5b4ee" } });
```

## Comments

### Comment Capitalization

Rule: `agentic/comment-capitalization`. Details: [RULES/comments_comment-capitalization.md](RULES/comments_comment-capitalization.md).

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

### TODO Format

Rule: `agentic/todo-format`. Details: [RULES/comments_todo-format.md](RULES/comments_todo-format.md).

Valid:

```ts
// TODO
// TODO(@claude-code/opus-4.8/xhigh): Tighten the axis cap
```

Invalid:

```ts
// TOOD: This seems overcomplicated
// todo: lowercase marker
// Fixme: mixed-case marker
// TODO(modal): Scopes are attributions only
// TODO(@claude code): Spaces break attribution
```
