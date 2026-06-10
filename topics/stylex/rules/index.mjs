import { enumStyleVariantsRule } from "./enum-style-variants/enum-style-variants.mjs";
import { maxVariantAxesRule } from "./max-variant-axes/max-variant-axes.mjs";
import { noSxPropRule } from "./no-sx-prop/no-sx-prop.mjs";
import { stylexKeyNamesRule } from "./stylex-key-names/stylex-key-names.mjs";
import { stylexObjectSpacingRule } from "./stylex-object-spacing/stylex-object-spacing.mjs";
import { stylexOwnershipCommentRule } from "./stylex-ownership-comment/stylex-ownership-comment.mjs";
import { stylexPlacementRule } from "./stylex-placement/stylex-placement.mjs";
import { stylexPropsFirstRule } from "./stylex-props-first/stylex-props-first.mjs";
import { stylexTokensOnlyRule } from "./stylex-tokens-only/stylex-tokens-only.mjs";

export const stylexRules = {
  "enum-style-variants": enumStyleVariantsRule,
  "max-variant-axes": maxVariantAxesRule,
  "no-sx-prop": noSxPropRule,
  "stylex-key-names": stylexKeyNamesRule,
  "stylex-object-spacing": stylexObjectSpacingRule,
  "stylex-ownership-comment": stylexOwnershipCommentRule,
  "stylex-placement": stylexPlacementRule,
  "stylex-props-first": stylexPropsFirstRule,
  "stylex-tokens-only": stylexTokensOnlyRule,
};
