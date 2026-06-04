# ESLint Rules

Repo-local ESLint rules for deterministic convention checks. `CONVENTIONS.md`
remains the broader human doctrine while this file records the mechanical rule
surface.

Public rule IDs are currently flat, such as `agentic/component-props`, for
`code/eslint.config.js` stability. Implementations are grouped by topic so the
eventual package can move toward names like `agentic/react/*`,
`agentic/typescript/*`, and `agentic/stylex/*`.

---

## Table Of Contents

- [TypeScript](#typescript)
  - [Associated Exports](#associated-exports)
  - [Articulated Object Contracts](#articulated-object-contracts)
  - [Boolean Names](#boolean-names)
  - [Discriminant Kind](#discriminant-kind)
  - [Function Declarations](#function-declarations)
  - [Function Names](#function-names)
  - [Named Complex Return Types](#named-complex-return-types)
  - [Named Nested Types](#named-nested-types)
  - [No Concision Names](#no-concision-names)
- [React](#react)
  - [Component Props](#component-props)
  - [Exported Component Props](#exported-component-props)
  - [Reducer Dispatch Names](#reducer-dispatch-names)
- [StyleX](#stylex)
  - [StyleX Key Names](#stylex-key-names)
  - [StyleX Object Spacing](#stylex-object-spacing)
  - [StyleX Ownership Comment](#stylex-ownership-comment)
  - [No SX Prop](#no-sx-prop)
  - [StyleX Placement](#stylex-placement)
- [Comments](#comments)
  - [Comment Capitalization](#comment-capitalization)

---

## TypeScript

### Associated Exports

Rule: `agentic/associated-exports`

Requires exported members to export associated local types used in their public
surface. If callers can see the member, callers should also be able to import
the named argument and return types it exposes.

Valid:

```ts
export type FooArgs = {
  id: string;
};

export type FooReturn = {
  id: string;
};

export function getFoo(args: FooArgs): FooReturn {
  return args;
}
```

Invalid:

```ts
type FooArgs = {
  id: string;
};

export function getFoo(args: FooArgs): FooArgs {
  return args;
}
```

### Articulated Object Contracts

Rule: `agentic/articulated-object-contracts`

Requires members of named object contracts to carry leading JSDoc comments.
The rule applies to `Props`, `Args`, and `Return` contract families, including
composed types such as `FooArgsBar` and `FooReturnItem`, plus `Options` and
`Configuration` suffixes. The goal is to keep dense object contracts legible
without requiring comments on runtime object literals.

Valid:

```ts
export type EditableTitleProps = {
  /** Current committed title text shown when the control is not editing. */
  value: string;
  /** Called when the component requests entering or leaving edit mode. */
  onEditingChange: (isEditing: boolean) => void;
};
```

Invalid:

```ts
export type EditableTitleProps = {
  value: string;
  onEditingChange: (isEditing: boolean) => void;
};
```

### Boolean Names

Rule: `agentic/boolean-names`

Enforces predicate-style names for boolean-like values.

Valid:

```ts
const isOpen = true;
const [isMounted, setIsMounted] = useState(false);
```

Invalid:

```ts
const open = true;
const [mounted, setMounted] = useState(false);
```

### Discriminant Kind

Rule: `agentic/discriminant-kind`

Prefers `kind` as the canonical string discriminant key for variant object
types. This keeps data variants visually distinct from React and DOM `type`
props.

Valid:

```ts
export type IconAssetSvg = {
  kind: 'svg';
  url: string;
};
```

Invalid:

```ts
export type IconAssetSvg = {
  type: 'svg';
  url: string;
};
```

### Function Declarations

Rule: `agentic/function-declarations`

Requires non-trivial named functions to use `function` declarations. One-line
arrow expressions remain acceptable.

Valid:

```ts
function getThing(): string {
  return 'x';
}

const getThing = (): string => 'x';
```

Invalid:

```ts
const getThing = (): string => {
  return 'x';
};
```

### Function Names

Rule: `agentic/function-names`

Encourages helper functions to use at least a verb-noun name. The verb set is
intentionally broad enough for common helpers like `applyVariant`,
`formatLabel`, and `computeLayout`. Components, hooks, and `recurse` are
allowed exceptions.

Valid:

```ts
function getThing(): string {
  return 'x';
}

function applyVariant(): void {}

function recurse(): void {}
```

Invalid:

```ts
function thing(): string {
  return 'x';
}
```

### Named Complex Return Types

Rule: `agentic/named-complex-return-types`

Disallows inline object literal return types. Complex return shapes should be
named so the signature is predictable and reusable.

Valid:

```ts
export type FooReturn = {
  foo: string;
};

export function getFoo(): FooReturn {
  return { foo: 'x' };
}
```

Invalid:

```ts
export function getFoo(): { foo: string } {
  return { foo: 'x' };
}
```

### Named Nested Types

Rule: `agentic/named-nested-types`

Disallows inline nested object member types. Compose named types with stable
suffixes such as `Props`, `PropsItem`, `Return`, and `ReturnFoo`.

Valid:

```ts
export type FooReturnItem = {
  id: string;
};

export type FooReturn = {
  item: FooReturnItem;
};
```

Invalid:

```ts
export type FooReturn = {
  item: {
    id: string;
  };
};
```

### No Concision Names

Rule: `agentic/no-concision-names`

Flags terse identifier segments where the full word is clearer. Prefer
`document`, `configuration`, `event`, and `ticket` over `doc`, `config`, `evt`,
and `tkt`.

Valid:

```ts
const configurationPath = './settings.json';
const documentBody = '';
```

Invalid:

```ts
const configPath = './settings.json';
const docBody = '';
```

---

## React

### Component Props

Rule: `agentic/component-props`

Requires component props to use a named props type instead of inline object
types. Destructuring is allowed when the parameter is annotated with the named
props type, which supports defaulted parameters.

Valid:

```tsx
type RenameDialogProps = {
  title?: string;
};

function RenameDialog(props: RenameDialogProps): JSX.Element {
  return <div>{props.title}</div>;
}

function RenameDialogWithDefault({
  title = 'Rename',
}: RenameDialogProps): JSX.Element {
  return <div>{title}</div>;
}
```

Invalid:

```tsx
function RenameDialog(props: { title: string }): JSX.Element {
  return <div>{props.title}</div>;
}
```

### Exported Component Props

Rule: `agentic/exported-component-props`

Warns when an exported component has a same-name props type that is not exported.
This is related to `agentic/associated-exports`: exported component APIs should
not expose invisible local props contracts.

Valid:

```tsx
export type ButtonProps = {
  label: string;
};

export function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
```

Invalid:

```tsx
type ButtonProps = {
  label: string;
};

export function Button(props: ButtonProps): JSX.Element {
  return <button>{props.label}</button>;
}
```

### Reducer Dispatch Names

Rule: `agentic/reducer-dispatch-names`

Requires `useReducer` dispatch variables to use `dispatchThing`.

Valid:

```ts
const [board, dispatchBoard] = useReducer(reducer, initialValue);
```

Invalid:

```ts
const [board, setBoard] = useReducer(reducer, initialValue);
```

---

## StyleX

### StyleX Key Names

Rule: `agentic/stylex-key-names`

Requires nested StyleX ownership keys to inherit the prefix of the local element
that owns them. The root element is named `root`, like CSS `:scope`; direct
children of `root` may start local regions such as `toolbar`, `columns`, or
`overlay`. Deeper descendants inherit that local region prefix.

Valid:

```ts
// root(:hover), rootColor{Pink,Blue,Green}
//   title
//   footer
//     footerAvatarStack
//
const styles = stylex.create({
  root: {},
  rootColorPink: {},
  rootColorBlue: {},
  rootColorGreen: {},
  title: {},
  footer: {},
  footerAvatarStack: {},
});
```

Invalid:

```ts
// card
//   cardFooter
//     avatarStack
//
const styles = stylex.create({
  card: {},
  cardFooter: {},
  avatarStack: {},
});
```

### StyleX Object Spacing

Rule: `agentic/stylex-object-spacing`

Disallows blank-line grouping inside `stylex.create`. The hierarchy belongs in
the ownership comment, and the object remains a compact flat map.

Valid:

```ts
// card
//   cardTitle
//
const styles = stylex.create({
  card: {},
  cardTitle: {},
});
```

Invalid:

```ts
// card
//   cardTitle
//
const styles = stylex.create({
  card: {},

  cardTitle: {},
});
```

### StyleX Ownership Comment

Rule: `agentic/stylex-ownership-comment`

Requires each `stylex.create` call to have a directly preceding ownership
comment that accounts for every concrete style key. Prefer contiguous `//`
comments ending with an empty `//` separator line; block comments are accepted
for compatibility. Prose notes may sit above the ownership DSL inside the same
line-comment block when separated by an empty `//` line. Line-style ownership
comments should separate major root-level regions with an empty `//` row.

Valid:

```ts
// root(:focus-within), rootDensity{Compact,Comfortable}
//   toolbar
//     toolbarSearch
//     toolbarFilterButton(:hover,:focus-visible)
//
//   columns
//     columnsColumn
//       columnsColumnHeader
//         columnsColumnHeaderTitle
//         columnsColumnHeaderMenuButton(:hover,:focus-visible)
//       columnsColumnDropZone(:is([data-over]))
//       columnsColumnSticky(:hover)
//         columnsColumnStickyTitle
//         columnsColumnStickyFooter
//           columnsColumnStickyFooterAvatarStack
//           columnsColumnStickyFooterMeta
//
//   overlay(:is([data-open]))
//     overlayPanel
//       overlayPanelTitle
//       overlayPanelActions
//         overlayPanelActionsButton(:focus-visible,:disabled)
//         overlayPanelActionsButtonVariant{Secondary,Danger}
//
const styles = stylex.create({
  root: {},
  rootDensityCompact: {},
  rootDensityComfortable: {},
  toolbar: {},
  toolbarSearch: {},
  toolbarFilterButton: {},
  columns: {},
  columnsColumn: {},
  columnsColumnHeader: {},
  columnsColumnHeaderTitle: {},
  columnsColumnHeaderMenuButton: {},
  columnsColumnDropZone: {},
  columnsColumnSticky: {},
  columnsColumnStickyTitle: {},
  columnsColumnStickyFooter: {},
  columnsColumnStickyFooterAvatarStack: {},
  columnsColumnStickyFooterMeta: {},
  overlay: {},
  overlayPanel: {},
  overlayPanelTitle: {},
  overlayPanelActions: {},
  overlayPanelActionsButton: {},
  overlayPanelActionsButtonVariantSecondary: {},
  overlayPanelActionsButtonVariantDanger: {},
});
```

Valid with a prose note:

```ts
// Plain stylex.create stays here in the component file. A sibling `.stylex.ts`
// is only warranted when a component needs its own stylex.defineVars.
//
// card
//   cardTitle
//
const styles = stylex.create({
  card: {},
  cardTitle: {},
});
```

Invalid:

```ts
// card
//
const styles = stylex.create({
  card: {},
  cardTitle: {},
});
```

Invalid:

```ts
// root
//   toolbar
//     toolbarSearch
//   columns
//
const styles = stylex.create({
  root: {},
  toolbar: {},
  toolbarSearch: {},
  columns: {},
});
```

### No SX Prop

Rule: `agentic/no-sx-prop`

Prevents mixing the old `sx` convenience prop with direct StyleX props.

Valid:

```tsx
const node = <div {...stylex.props(styles.root)} />;
```

Invalid:

```tsx
const node = <div sx={styles.root} />;
```

### StyleX Placement

Rule: `agentic/stylex-placement`

Requires `stylex.create` and colocated style constants to stay at the bottom of
the file after function declarations.

Valid:

```tsx
function Component(): JSX.Element {
  return <div />;
}

const styles = stylex.create({});
```

Invalid:

```tsx
const styles = stylex.create({});

function Component(): JSX.Element {
  return <div />;
}
```

---

## Comments

### Comment Capitalization

Rule: `agentic/comment-capitalization`

Checks the first meaningful line of each comment block. Continued physical
lines in the same comment block may read naturally. Tooling directives and
TypeScript triple-slash reference comments are skipped.

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
