import { commentsRules } from './comments/rules/index.mjs';
import { reactRules } from './react/rules/index.mjs';
import { stylexRules } from './stylex/rules/index.mjs';
import { errorMessageContextRule } from './typescript/rules/error-message-context/error-message-context.mjs';
import { typescriptRules } from './typescript/rules/index.mjs';

export const topicRules = {
  comments: commentsRules,
  react: reactRules,
  stylex: stylexRules,
  typescript: typescriptRules,
};

export const dormantRules = {
  'error-message-context': errorMessageContextRule,
};

// Implemented and tested, but excluded from the flat public map. Downstream
// configs enable every key in `rules`, so exclusion here is the off switch.
const DISABLED_RULE_KEYS = new Set([
  // Operator is undecided on the message shape; see RULES/error-message-context.md.
  'error-message-context',
  // Semantic function naming needs a dictionary/model to prove correctly; see RULES/function-names.md.
  'function-names',
]);

export const rules = Object.fromEntries(
  Object.values(topicRules)
    .flatMap((topicRulesMap) => Object.entries(topicRulesMap))
    .filter(([ruleName]) => !DISABLED_RULE_KEYS.has(ruleName)),
);
