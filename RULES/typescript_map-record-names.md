# Map Record Names

Topic: TypeScript
Rule: `agentic/map-record-names`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/map-record-names`

Requires `Record` constants keyed by a closed set (enum, literal union, or
template literal type) to be named `Map{Key}To{Value}`, and requires anything
named `Map*To*` to carry a type annotation declaring its key set. Named mapped
types such as `BoardActionHandlerMap` pass, so this composes with
`agentic/handler-map-alignment`. Open keys such as `Record<string, …>` carry
no map contract.

## Rule Shape

- Matches variable declarators.
- A `Record<EnumLike, Value>` with a closed key set must be named
  `Map{Key}To{Value}`.
- Closed key sets are enum-like type references other than `PropertyKey`,
  literal unions, and template literal types.
- Utility-wrapped keys such as `Exclude<ModalKind, ModalKind.None>` are not
  currently inspected as closed keys by this rule; use a `Map*To*` name anyway
  when the set is conceptually closed.
- A single string literal key such as `Record<'idle', string>` is not currently
  treated as a closed set by this rule.
- Names beginning with `Map` promise a map and must carry either a `Record`
  annotation or a named mapped type annotation.
- `Record<string, ...>` and other open key sets do not require a map name.
- The rule checks the `Map*To*` shape, not semantic derivation of the `{Value}`
  segment from the `Record` value type. Agents should still choose the clearest
  value noun, such as `Label`, `Component`, or `Handler`.

Valid:

```ts
const MapStatusToLabel: Record<"idle" | "busy", string> = { idle: "Idle", busy: "Working…" };
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
