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

Requires `react` and `@stylexjs/stylex` to be imported as canonical namespaces
(`React`, `stylex`). Type-only imports are out of scope.

## Rule Shape

- Applies only to `react` and `@stylexjs/stylex` import declarations.
- Runtime imports must have exactly one namespace specifier.
- `react` must be imported as `React`.
- `@stylexjs/stylex` must be imported as `stylex`.
- Type-only imports are ignored so declaration-only surfaces can still import
  types directly when needed.

Valid:

```ts
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
```

Valid, in practice:

```tsx
import * as React from 'react';
import * as stylex from '@stylexjs/stylex';

export type StickyProps = {
  /** Content rendered inside the sticky. */
  children: React.ReactNode;
};

export function Sticky(props: StickyProps): React.ReactNode {
  const [isOpen, setIsOpen] = React.useState(false);
  return <article {...stylex.props(styles.Root)}>{props.children}</article>;
}
```

Invalid:

```ts
import { useState } from 'react';
```
