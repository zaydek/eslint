# Namespace Imports

Topic: React
Rule: `agentic/namespace-imports`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/namespace-imports`

Requires `@stylexjs/stylex` to be imported as the canonical `stylex`
namespace. React and other libraries are out of scope.

## Rule Shape

- Applies only to `@stylexjs/stylex` import declarations.
- Runtime imports must have exactly one namespace specifier.
- `@stylexjs/stylex` must be imported as `stylex`.
- Type-only imports are ignored.

Valid:

```ts
import * as stylex from "@stylexjs/stylex";
```

Valid, in practice:

```tsx
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";

export type StickyProps = {
  /** Content rendered inside the sticky. */
  children: React.ReactNode;
};

export function Sticky(props: StickyProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  return <article {...stylex.props(styles.Root)}>{props.children}</article>;
}
```

Invalid:

```ts
import stylex from "@stylexjs/stylex";
```
