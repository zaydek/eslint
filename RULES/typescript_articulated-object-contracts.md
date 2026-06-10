# Articulated Object Contracts

Topic: TypeScript
Rule: `agentic/articulated-object-contracts`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/articulated-object-contracts`

Requires members of named object types to carry leading JSDoc comments. The goal
is to keep dense type surfaces legible without requiring comments on runtime
object literals.

## Rule Shape

- Matches every named `type` alias whose annotation contains a type literal,
  including object members inside intersections and unions.
- Also understands legacy `interface` declarations so existing code still gets
  member-comment diagnostics, but `agentic/prefer-type-aliases` owns converting
  ordinary interfaces to type aliases.
- Checks `TSPropertySignature` and `TSMethodSignature` members.
- A member passes when its nearest leading comment is a JSDoc block
  (`/** ... */`). A blank line between the JSDoc and the member is allowed; an
  intervening `//` line comment still breaks the association because it becomes
  the nearest comment.
- Only descends into type literals, unions, and intersections. Inline nested
  object types (`Array<{ ... }>`, `Record<string, { ... }>`, tuples) are not
  reached here on purpose — `agentic/named-nested-types` forbids inline nested
  object types outright, so they must be extracted into their own named contract
  first, where this rule then checks them.
- Runtime object literals and non-contract type names are out of scope.

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
