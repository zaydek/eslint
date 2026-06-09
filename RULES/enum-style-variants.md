# Enum Style Variants

Topic: StyleX
Rule: `agentic/enum-style-variants`
Status: public rule.

## Agent Contract

- Treat this page as the detailed intent and examples for the rule.
- Prefer the valid examples when editing code.
- Preserve documented exceptions unless the rule tests are updated with the new behavior.
- When changing the rule, update this page and add or adjust executable fixtures in the matching `.test.mjs` file.

## Details

Rule: `agentic/enum-style-variants`

Requires `Map{Enum}ToStyle` or `Map{Enum}ToStyles` records to reference a single style-key family
`{stem}{EnumMemberName}` whose member-name set matches the enum: every key ends
with its enum member name, every entry shares one stem, a same-file enum must be
fully covered, and when the file contains `stylex.create` every referenced key
must exist in it. An `Exclude<>`
annotation narrows the key set on purpose and skips the completeness check.
The enum, the ownership comment, and `stylex.create` become three spellings of
one closed set.

## What The Rule Reports

- Matches variables named `Map*ToStyle` or `Map*ToStyles` whose initializer is
  an object expression.
- Each computed enum key must map directly to `styles.{StyleKey}`.
- Every style key in the map must share one stem and end with the enum member
  name, for example `RootWithLavender` for `StickyColor.Lavender`.
- When the file has `stylex.create`, every referenced `styles.{Key}` must be one
  of its keys. Maps without an in-file `stylex.create` skip that existence check.
- Same-file enums are checked for total coverage unless any part of the map type
  annotation contains `Exclude<>`. Suffix and style-key existence checks still
  apply to the entries that remain.

## Conventions Not Enforced Here

- The shared stem may be any stable prefix; when this map corresponds to a
  StyleX ownership modifier axis, the stem should normally end in `Is`, `Has`,
  or `With`.
- The StyleX ownership axis for an exhaustive enum style map should be required
  (`Root{With{Lavender|Sky}}`). Use an optional axis only when the component can
  omit that enum style independently of the enum map.

Valid:

```ts
enum StickyColor { Lavender = 'LAVENDER', Sky = 'SKY' }

const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.RootWithLavender,
  [StickyColor.Sky]: styles.RootWithSky,
};
```

Valid, in practice:

```tsx
export enum StickyColor { Lavender = 'LAVENDER', Sky = 'SKY' }

export type StickyProps = {
  /** Color variant applied to the sticky root. */
  color: StickyColor;
  /** Content rendered inside the sticky. */
  children: React.ReactNode;
};

export function Sticky(props: StickyProps): React.ReactNode {
  return (
    <article {...stylex.props(styles.Root, MapStickyColorToStyle[props.color])}>
      {props.children}
    </article>
  );
}

// Root{With{Lavender|Sky}}
//
const styles = stylex.create({
  Root: { borderRadius: tokens.size2 },
  RootWithLavender: { backgroundColor: tokens.colorLavender },
  RootWithSky: { backgroundColor: tokens.colorSky },
});

const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.RootWithLavender,
  [StickyColor.Sky]: styles.RootWithSky,
};
```

Invalid:

```ts
const MapStickyColorToStyle: Record<StickyColor, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.RootWithLavender,
  [StickyColor.Sky]: styles.SurfaceWithSky,
};
```

Valid with an excluded enum member:

```ts
enum StickyColor { None = 'NONE', Lavender = 'LAVENDER', Sky = 'SKY' }

const MapStickyColorToStyle: Record<Exclude<StickyColor, StickyColor.None>, stylex.StyleXStyles> = {
  [StickyColor.Lavender]: styles.RootWithLavender,
  [StickyColor.Sky]: styles.RootWithSky,
};
```
