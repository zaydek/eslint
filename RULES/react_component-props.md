# Component Props

Topic: React
Rule: `agentic/component-props`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/component-props`

Requires component props to use a named props type instead of inline object
types. Destructuring is allowed when the parameter is annotated with the named
props type, which supports defaulted parameters.

## Rule Shape

- Matches PascalCase `FunctionDeclaration` components.
- Checks the first parameter only.
- Reports inline object parameter annotations such as `{ title: string }`.
- Reports destructured parameters unless the object pattern has a named type
  annotation.
- Any named type annotation satisfies this rule; exact `{ComponentName}Props`
  naming/export is covered separately by `agentic/exported-component-props`.
- Does not inspect arrow components, `React.FC`, `memo`, `forwardRef`, methods,
  or lowercase functions that return JSX.

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
