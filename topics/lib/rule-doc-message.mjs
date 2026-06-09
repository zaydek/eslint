const RULE_DOCS_ROOT = '~/GitHub/zaydek/eslint/RULES';

export function createRuleMessage(problem, fix, ruleName) {
  return `${problem}\nFix: ${fix}\nSee: ${RULE_DOCS_ROOT}/${ruleName}.md`;
}
