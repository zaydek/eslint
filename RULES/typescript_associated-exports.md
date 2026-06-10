# Associated Exports

Topic: TypeScript
Rule: `agentic/associated-exports`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/associated-exports`

Requires exported members to export associated local types used in their public
surface. If callers can see the member, callers should also be able to import
the named argument and return types it exposes.

## Rule Shape

- Collects local type aliases and interfaces.
- Checks exported type aliases, exported interfaces, exported function
  declarations, and exported function-valued variables.
- PascalCase exported function declarations are treated as components and are
  excluded; component props export shape is owned by
  `agentic/exported-component-props`.
- Reports local types referenced from exported parameter, return, member, or
  heritage surfaces when those local types are not exported.
- Traverses exported type annotations, including legacy interface surfaces, but
  does not recursively chase through non-exported type aliases only referenced by an exported
  function.
- The complete ambient ignore list is `JSX`, `React`, `HTMLElement`,
  `HTMLInputElement`, `HTMLTextAreaElement`, and `SVGElement`.
- Exporting a directly referenced type can reveal another warning if that newly
  exported type exposes a different non-exported local type.

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
