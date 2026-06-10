# TODO Format

Topic: Comments
Rule: `agentic/todo-format`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/todo-format`

Requires canonical uppercase markers, with the allowed marker set carried as data:
`{ markers }` defaults to `TODO`, `BUG`, `FIXME`, `IMPROVEMENT`,
`OPTIMIZATION`. A marker is declared by an attribution group or trailing colon at the
start of a comment, so bare `// TODO` and prose that merely contains a marker
word stay out of scope. The TODO-misspelling scan is intentionally narrow and
case-insensitive: `TOOD`, `TDOO`, `TODOO`, and `OTOD` are flagged anywhere.

Attribution groups identify people or agents only: `TODO(@zaydek)` or
`TODO(@claude-code/opus-4.8/xhigh)`. There is no `TODO(modal)`. Attributions
are validated against `{ attributionPattern }`; the default is permissive
(`^@[\w.-]+(?:/[\w.-]+)*$`) and can be tightened in config when the
`{harness}/{model}-{version}/{effort}` grammar stabilizes, no rule change
needed.

## Rule Shape

- Scans all source comments.
- Flags the complete misspelling set `TOOD`, `TDOO`, `TODOO`, and `OTOD`
  anywhere in the comment, case-insensitively.
- Treats a marker as declared only when the first non-empty comment line starts
  with a configured marker followed by an attribution group or `:`.
- Marker recognition is case-insensitive at that position; recognized markers
  must then be written in their canonical uppercase form.
- Bare `// TODO` is valid and intentionally out of scope.
- Marker scopes are people or agent attributions beginning with `@`; topic
  labels such as `TODO(modal)` are invalid.

Valid:

```ts
// TODO
// TODO(@claude-code/opus-4.8/xhigh): Tighten the axis cap
```

Valid, in practice:

```ts
// TODO: Disable tabbing while the modal is open
// TODO(@zaydek): Ship the modal
const min = 8; // TODO
// Bug fix for the modal layering issue — prose, not a marker.
```

Invalid:

```ts
// TOOD: This seems overcomplicated
// todo: lowercase marker
// Fixme: mixed-case marker
// TODO(modal): Scopes are attributions only
// TODO(@claude code): Spaces break attribution
```
