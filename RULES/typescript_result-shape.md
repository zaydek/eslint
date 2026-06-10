# Result Shape

Topic: TypeScript
Rule: `agentic/result-shape`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/result-shape`

Requires exported `*Result` type literals and unions of type literals to be
`kind`-discriminated, and requires `error` payloads to reference a closed
`*ErrorKind` enum so failure sets stay closed too.

## Rule Shape

- Matches exported type aliases whose names end with `Result`.
- Checks each type-literal member of the result union.
- Each checked variant must have a `kind` property.
- If a variant has an `error` property, its type must be a named type reference
  ending with `ErrorKind`; primitive payloads such as `error: string` are
  invalid.
- Non-exported result helpers and non-literal union members are out of scope.

Valid:

```ts
export type MoveResult =
  | {
      /** Result variant. */
      kind: MoveResultKind.Success;
      /** Moved element identifier. */
      id: string;
    }
  | {
      /** Result variant. */
      kind: MoveResultKind.Error;
      /** Closed move error reason. */
      error: MoveErrorKind;
    };
```

Valid, in practice:

```ts
export enum MoveResultKind {
  Success = "SUCCESS",
  Error = "ERROR",
}

export enum MoveErrorKind {
  CannotFindElementByID = "CANNOT_FIND_ELEMENT_BY_ID",
  NextIndexIsOutOfBounds = "NEXT_INDEX_IS_OUT_OF_BOUNDS",
}

export type MoveResult =
  | {
      /** Result variant. */
      kind: MoveResultKind.Success;
      /** Moved element identifier. */
      id: string;
    }
  | {
      /** Result variant. */
      kind: MoveResultKind.Error;
      /** Closed move error reason. */
      error: MoveErrorKind;
    };

export function moveElement(elements: EditorElement[], args: MoveArgs): MoveResult {
  // …
}
```

Invalid:

```ts
export type MoveResult =
  | {
      /** Result variant. */
      kind: MoveResultKind.Success;
      /** Moved element identifier. */
      id: string;
    }
  | {
      /** Result variant. */
      kind: MoveResultKind.Error;
      /** Open-ended error message. */
      error: string;
    };
```
