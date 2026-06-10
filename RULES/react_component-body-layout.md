# Component Body Layout

Topic: React
Rule: `agentic/component-body-layout`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/component-body-layout`

Requires PascalCase function component bodies to use a predictable grouped
layout. The goal is to make component internals scannable: setup hooks first,
then refs, then state, then derived constants, then effects, then handlers/local
functions, then the render return.

## Rule Shape

- Matches PascalCase `FunctionDeclaration` components.
- Ignores lower-case helper functions.
- Recognizes leading setup hooks such as `useNavigate(...)`, `useParams(...)`,
  `Toast.useToastManager(...)`, and repo-local custom hooks before refs/state.
- Plain declarations derived from setup hooks, such as route params or selected
  IDs, belong in derived constants after refs and state.
- Recognizes ref declarations initialized by `useRef(...)` or
  `React.useRef(...)`.
- Recognizes state declarations initialized by `useState(...)`,
  `React.useState(...)`, `useReducer(...)`, or `React.useReducer(...)`.
- Treats other variable declarations as derived constants unless they initialize
  a function value.
- Recognizes effects as expression statements calling `useEffect(...)`,
  `React.useEffect(...)`, `useLayoutEffect(...)`, `React.useLayoutEffect(...)`,
  `useInsertionEffect(...)`, or `React.useInsertionEffect(...)`.
- Recognizes function declarations and function-valued variable declarations as
  handlers/local functions.
- Recognizes variables named `handlers` or ending in `Handlers` as handler maps.
- Requires this order: setup hooks, refs, state, derived constants, effects,
  handlers, return.
- Requires exactly one blank line between different groups.
- Comments between groups count as source lines; put group comments inside the
  following group when exact spacing matters.
- Does not require blank lines between statements in the same group.

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
