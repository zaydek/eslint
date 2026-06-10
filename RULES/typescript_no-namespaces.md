# No Namespaces

Topic: TypeScript
Rule: `agentic/no-namespaces`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

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
// HTML5 hacks module: the file is the namespace; callers import what they need.
import { copyTextSync, ResultKind } from "../utils/html5-hacks";

const result = copyTextSync(text);
const isCopied = result.kind === ResultKind.Success;
```

Invalid:

```ts
namespace HTML5Hacks {
  export function copyTextSync(): void {}
}
```
