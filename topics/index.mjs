import { commentsRules } from "./comments/rules/index.mjs";
import { reactRules } from "./react/rules/index.mjs";
import { stylexRules } from "./stylex/rules/index.mjs";
import { errorMessageContextRule } from "./typescript/rules/error-message-context/error-message-context.mjs";
import { typescriptRules } from "./typescript/rules/index.mjs";

export const topicRules = {
  comments: commentsRules,
  react: reactRules,
  stylex: stylexRules,
  typescript: typescriptRules,
};

export const dormantRules = { "error-message-context": errorMessageContextRule };

export const rules = Object.fromEntries(
  Object.values(topicRules).flatMap((topicRulesMap) => Object.entries(topicRulesMap)),
);
