import { noSxPropRule } from './no-sx-prop/no-sx-prop.mjs';
import { stylexKeyNamesRule } from './stylex-key-names/stylex-key-names.mjs';
import { stylexObjectSpacingRule } from './stylex-object-spacing/stylex-object-spacing.mjs';
import { stylexOwnershipCommentRule } from './stylex-ownership-comment/stylex-ownership-comment.mjs';
import { stylexPlacementRule } from './stylex-placement/stylex-placement.mjs';

export const stylexRules = {
  'no-sx-prop': noSxPropRule,
  'stylex-key-names': stylexKeyNamesRule,
  'stylex-object-spacing': stylexObjectSpacingRule,
  'stylex-ownership-comment': stylexOwnershipCommentRule,
  'stylex-placement': stylexPlacementRule,
};
