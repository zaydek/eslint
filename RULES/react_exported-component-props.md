# Exported Component Props

Topic: React
Rule: `agentic/exported-component-props`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/exported-component-props`

Warns when an exported PascalCase function component with parameters does not
have an exported same-file `{ComponentName}Props` type alias. This is stricter
than only checking an existing unexported props type: missing props aliases,
interfaces, and differently named props types are also reported.

## Rule Shape

- Matches exported PascalCase function declarations.
- If the component has at least one parameter, the same-file
  `{ComponentName}Props` type alias must be exported.
- Interfaces named `{ComponentName}Props` do not currently satisfy this rule.
- If no same-name props type exists, the component still reports; use
  `agentic/component-props` to separately avoid inline parameter object types.
- Components without parameters are ignored.
- This rule does not validate the parameter annotation itself; associated public
  type visibility is also covered by `agentic/associated-exports`.

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
