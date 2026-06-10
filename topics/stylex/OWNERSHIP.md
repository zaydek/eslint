# StyleX Ownership Contract — Syntax Spec

A single line-comment block above each `stylex.create` describes the component's
styled structure. The contract is the source; the flat `stylex.create` keys and
the render tree are both mechanically derivable from it.

This document specifies the syntax and semantics used by the StyleX ownership
parser, tests, and ESLint rules.

---

## 1. Model

Three kinds of thing, three notations:

| Thing                                       | Notation                          | Example              |
| ------------------------------------------- | --------------------------------- | -------------------- |
| **Structure** — a styled element            | indentation + PascalCase path key | `FooterAvatarStack`  |
| **Modifier** — a variant axis on an element | brace suffix                      | `Root?{IsSelected}`  |
| **Dynamic style** — a `stylex` function     | typed parens                      | `Dot(color<string>)` |

Keys are **materialized paths**. `Root` is the component scope. Root's direct
structural children take bare region names; every deeper descendant carries its
ancestor path as a prefix. Indentation in the contract is the DOM nesting.

```
Root
  Body              ← direct child of Root: bare
    BodyLabels      ← deeper: inherits the path
      BodyLabelsChip
```

A fragment with no single root (e.g. a portal rendering siblings) uses named
top-level blocks instead of `Root` — `Dot`, `Menu`, `Backdrop`, `Confirm` — each
rooting its own subtree.

---

## 2. Symbols

| Symbol                             | Meaning                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------- |
| 2-space indent                     | one level of element nesting                                            |
| `PascalCase`                       | a structural element (materialized path key)                            |
| `{ … }` (on a key)                 | required modifier axes                                                  |
| `?{ … }` (on a key)                | optional modifier axes                                                  |
| `,`                                | separates sibling axes within `{ … }`                                   |
| `Is` `Has` `With`                  | the modifier-axis lexicon                                               |
| `{ A \| B \| C }` (after a marker) | a union of 2+ values; required inside `{...}`, optional inside `?{...}` |
| `( arg<type>, … )`                 | a dynamic `stylex` function with typed args                             |

---

## 3. Formal Grammar

The grammar describes the ownership DSL after removing the leading `//` comment
prefix and one optional following space from each line. It covers syntax only;
path-prefix checks, key expansion, and JSX/style-object agreement are semantic
rules layered on top. The EBNF is normative documentation; parser, expansion,
fixture, and ESLint rule tests are the executable proof that the implementation
matches it.

Ownership comments may include prose lines above the DSL in the same contiguous
line-comment block. The parser ignores initial non-entry prose until the first
parseable contract entry. A blank `//` row before that first entry is preferred
for readability, but the deterministic boundary is the first parseable entry:
after that point, every non-blank line is parsed as contract syntax.
Because a lone PascalCase word is a valid entry, prose preambles should not use
single-word PascalCase headings such as `Notes` or `Overview` before the DSL.

```ebnf
contract          ::= line*

line              ::= blank_line
                    | entry_line

blank_line        ::= spacing*

entry_line        ::= depth node

depth             ::= INDENT*

node              ::= element_node
                    | dynamic_node

element_node      ::= key modifier_blocks?

dynamic_node      ::= key "(" arg_list ")"

modifier_blocks   ::= required_modifier_block optional_modifier_suffix?
                    | optional_modifier_block

optional_modifier_suffix
                  ::= "," spacing* optional_modifier_block

required_modifier_block
                  ::= "{" required_axis ("," spacing* required_axis)* "}"

optional_modifier_block
                  ::= "?{" optional_axis ("," spacing* optional_axis)* "}"

required_axis     ::= marker union_values

optional_axis     ::= marker boolean_value
                    | marker union_values

marker            ::= "Is" | "Has" | "With"

boolean_value     ::= value

union_values      ::= "{" value "|" value ("|" value)* "}"

arg_list          ::= arg ("," spacing* arg)*

arg               ::= ident "<" type ">"

key               ::= PascalIdent

value             ::= PascalIdent

ident             ::= LowerIdent

type              ::= TypeText

INDENT            ::= "  "
```

Lexical constraints:

```ebnf
PascalIdent       ::= Upper AlphaNum*
LowerIdent        ::= Lower AlphaNum*
TypeText          ::= NonEmptyTypeText

Upper             ::= "A" | … | "Z"
Lower             ::= "a" | … | "z"
AlphaNum          ::= Upper | Lower | "0" | … | "9"
NonEmptyTypeText  ::= /* any non-empty single-line TypeScript-ish type text
                         balanced by splitTopLevel for comma-separated args */
spacing           ::= " "
```

Semantic constraints:

1. Indentation is exactly two spaces per depth level.
2. A dynamic node cannot carry modifiers.
3. A dynamic node is a concrete `stylex.create` key and participates in the
   exact key-set match.
4. A union must contain at least two values.
5. A single `boolean_value` is only valid inside an optional modifier block.
6. `Root` is the conventional single-root component scope. A fragment with no
   single root uses multiple top-level `key` entries instead.
7. `Root`'s direct structural children may be bare region names. Direct
   children under any non-`Root` top-level block must carry that block as a
   prefix, and every deeper structural descendant must carry its ancestor path
   as a prefix.
8. Expanding the contract must produce exactly the `stylex.create` key set.
9. Modifier markers are recognized only in modifier blocks and in the expanded
   suffixes they generate. Structural names may contain `Is`, `Has`, or `With`
   as ordinary PascalCase text.
10. Contract indentation must match the styled render tree.
11. Pseudo-classes and data selectors are invalid in the contract and remain
    inside the `stylex.create` style objects.

---

## 4. Axis forms

The inner brace `{ … }` is a _union container_ — it only appears when there is a
union to hold. A single value is therefore a plain boolean flag, and it belongs
inside an optional modifier block.

| Form                    | Meaning                          | Expands to keys                     |
| ----------------------- | -------------------------------- | ----------------------------------- |
| `Key?{IsFlag}`          | optional boolean                 | `Key`, `KeyIsFlag`                  |
| `Key{Is{A\|B\|C}}`      | required pick-one                | `Key`, `KeyIsA`, `KeyIsB`, `KeyIsC` |
| `Key?{Is{A\|B\|C}}`     | optional pick-one (zero-or-one)  | same keys, all optional             |
| `Key{Is{B\|C}}, ?{IsA}` | required axis plus optional axis | `Key`, `KeyIsA`, `KeyIsB`, `KeyIsC` |
| `Key(arg<type>)`        | dynamic function                 | `Key`                               |

Use `Is` for state and mode axes, `Has` for presence axes, and `With` for
composition/theme axes such as color. All three markers follow the same syntax.

Dynamic entries are style keys, not automatic DOM children. Indentation records
the JSX parent of the element that receives the dynamic style. When a dynamic
style is an additional style for the same element as a structural key, put the
dynamic key at the same indentation depth immediately after the structural key
and share the structural key as a prefix, for example `Dot` then
`DotColor(color<string>)`. When the dynamic style belongs to a distinct child
element, indent that child under its structural parent, for example
`HeaderPriority` then `HeaderPriorityDot(color<string>)`.

---

## 5. Worked example

```ts
// ── StyleX ownership contract ───────────────────────────────────────
//
// Root{With{Lavender|Sky|Mint|Rose}, Is{Compact|Comfortable}}, ?{IsSelected, IsDragging}
//   Header
//     HeaderTitle
//       HeaderTitleInput
//     HeaderPriority
//       HeaderPriorityDot(color<string>)
//     HeaderMenu
//       HeaderMenuButton
//       HeaderMenuPopover
//         HeaderMenuPopoverItem{Is{Default|Danger}}
//           HeaderMenuPopoverItemIcon
//           HeaderMenuPopoverItemLabel
//           HeaderMenuPopoverItemShortcut
//
//   Body
//     BodyDescription
//     BodyLabels
//       BodyLabelsChip{With{Gray|Green|Yellow|Red}}
//         BodyLabelsChipDot
//         BodyLabelsChipText
//
//   Footer
//     FooterAvatarStack
//       FooterAvatarStackAvatar
//         FooterAvatarStackAvatarImage
//         FooterAvatarStackAvatarPresence
//       FooterAvatarStackOverflow
//     FooterMeta
//       FooterMetaDueDate{Is{Default|Overdue}}
//         FooterMetaDueDateIcon
//       FooterMetaComments
//         FooterMetaCommentsIcon
//         FooterMetaCommentsCount
//
const styles = stylex.create({
  /* keys below */
});
```

This worked example exercises the full DSL surface; it intentionally exceeds
the default `max-variant-axes` budget. Use `max-variant-axes` for production
axis budgets.

Dynamic entries materialize as function-valued StyleX keys:

```ts
const styles = stylex.create({
  HeaderPriorityDot: (color: string) => ({ backgroundColor: color }),
});
```

---

## 6. Round-trip

The contract is the same data as the `stylex.create` keys, in two shapes.

**Expand** a line: concatenate its path prefix with each axis value.

```
BodyLabelsChip{With{Gray|Green|Yellow|Red}}
  → BodyLabelsChip
    BodyLabelsChipWithGray
    BodyLabelsChipWithGreen
    BodyLabelsChipWithYellow
    BodyLabelsChipWithRed
```

The expanded key set must match the `stylex.create` key set exactly. The
contract is the canonical ordering surface; the style object is validated by key
set, not by property order.

**Split** expanded modifier keys at the modifier suffix generated by the
contract (`Is`/`Has`/`With` plus a PascalCase value) to recover
`path · axis · value`. Do not infer modifiers from arbitrary structural names
that happen to contain those substrings.

Three projections fall out of one contract:

1. the flat `stylex.create` key list (expand);
2. the render tree (the indentation);
3. the variant types (each union is a string enum; a single flag is a boolean).

---

## 7. Multi-root and Dynamic

```
// Dot
// DotColor(color<string>)
//
// Menu
//   MenuItem?{IsDanger}
//   MenuSep
//
// Backdrop
//
// Confirm
//   ConfirmTitle
//   ConfirmText
//   ConfirmActions
//     ConfirmActionsBtn{Is{Secondary|Danger}}
```

Four named blocks, one optional boolean (`MenuItem?{IsDanger}`), one required
pick-one (`ConfirmActionsBtn{Is{Secondary|Danger}}`), one dynamic function
(`DotColor(color<string>)`).

The dynamic function is still a normal `stylex.create` key:

```ts
const styles = stylex.create({
  Dot: {},
  DotColor: (color: string) => ({ backgroundColor: color }),
  Menu: {},
  MenuItem: {},
  MenuItemIsDanger: {},
  MenuSep: {},
  Backdrop: {},
  Confirm: {},
  ConfirmTitle: {},
  ConfirmText: {},
  ConfirmActions: {},
  ConfirmActionsBtn: {},
  ConfirmActionsBtnIsSecondary: {},
  ConfirmActionsBtnIsDanger: {},
});
```

---

## 8. Extraction (the boundary signal)

A long path is not a smell to rename — it is where to componentize. Extracting a
subtree re-roots it: lift `BodyLabels…` into its own component and the keys lose
the `Body` prefix and start at that depth.

```
// extract BodyLabels → Labels.tsx
//   Labels
//     LabelsChip{With{Gray|Green|Yellow|Red}}
//       LabelsChipDot
//       LabelsChipText
```

Depth lives in the component tree, not in key names.

---

## 9. Not in the contract

Pseudo-classes and data-attribute selectors (`:hover`, `:focus-visible`,
`:disabled`, `:is([data-open])`, `[data-phase]`) stay inside the `stylex.create`
style objects. The contract records structure and variant _axes_, not CSS state.
