import assert from "node:assert/strict";

import { getRuleDocPath } from "./topics/lib/rule-doc-message.mjs";
import { dormantRules, topicRules } from "./topics/index.mjs";

import "./topics/typescript/rules/associated-exports/associated-exports.test.mjs";
import "./topics/typescript/rules/articulated-object-contracts/articulated-object-contracts.test.mjs";
import "./topics/comments/rules/comment-capitalization/comment-capitalization.test.mjs";
import "./topics/react/rules/component-props/component-props.test.mjs";
import "./topics/react/rules/exported-component-props/exported-component-props.test.mjs";
import "./topics/react/rules/reducer-dispatch-names/reducer-dispatch-names.test.mjs";
import "./topics/stylex/rules/no-sx-prop/no-sx-prop.test.mjs";
import "./topics/stylex/rules/stylex-key-names/stylex-key-names.test.mjs";
import "./topics/stylex/rules/stylex-object-spacing/stylex-object-spacing.test.mjs";
import "./topics/stylex/rules/stylex-ownership-comment/stylex-ownership-comment.test.mjs";
import "./topics/stylex/rules/stylex-ownership-comment/stylex-ownership-fixtures.test.mjs";
import "./topics/stylex/rules/stylex-placement/stylex-placement.test.mjs";
import "./topics/typescript/rules/boolean-names/boolean-names.test.mjs";
import "./topics/typescript/rules/discriminant-kind/discriminant-kind.test.mjs";
import "./topics/typescript/rules/function-declarations/function-declarations.test.mjs";
import "./topics/typescript/rules/named-complex-return-types/named-complex-return-types.test.mjs";
import "./topics/typescript/rules/named-nested-types/named-nested-types.test.mjs";
import "./topics/typescript/rules/no-concision-names/no-concision-names.test.mjs";
import "./topics/stylex/lib/ownership-contract.test.mjs";

// Additional implemented rules documented under RULES/.
import "./topics/comments/rules/todo-format/todo-format.test.mjs";
import "./topics/react/rules/component-body-layout/component-body-layout.test.mjs";
import "./topics/react/rules/context-via-factory/context-via-factory.test.mjs";
import "./topics/react/rules/namespace-imports/namespace-imports.test.mjs";
import "./topics/react/rules/no-manual-memoization/no-manual-memoization.test.mjs";
import "./topics/react/rules/ref-names/ref-names.test.mjs";
import "./topics/react/rules/state-setter-pairs/state-setter-pairs.test.mjs";
import "./topics/react/rules/use-new-naming/use-new-naming.test.mjs";
import "./topics/stylex/rules/enum-style-variants/enum-style-variants.test.mjs";
import "./topics/stylex/rules/max-variant-axes/max-variant-axes.test.mjs";
import "./topics/stylex/rules/stylex-tokens-only/stylex-tokens-only.test.mjs";
import "./topics/stylex/rules/stylex-props-first/stylex-props-first.test.mjs";
import "./topics/typescript/rules/enum-kind-suffix/enum-kind-suffix.test.mjs";
import "./topics/typescript/rules/enum-member-values/enum-member-values.test.mjs";
import "./topics/typescript/rules/enum-value-casing/enum-value-casing.test.mjs";
import "./topics/typescript/rules/error-message-context/error-message-context.test.mjs";
import "./topics/typescript/rules/exhaustive-switch/exhaustive-switch.test.mjs";
import "./topics/typescript/rules/handler-map-alignment/handler-map-alignment.test.mjs";
import "./topics/typescript/rules/kebab-case-source-filenames/kebab-case-source-filenames.test.mjs";
import "./topics/typescript/rules/map-record-names/map-record-names.test.mjs";
import "./topics/typescript/rules/no-namespaces/no-namespaces.test.mjs";
import "./topics/typescript/rules/prefer-type-aliases/prefer-type-aliases.test.mjs";
import "./topics/typescript/rules/result-shape/result-shape.test.mjs";

const implementedRuleGroups = { ...topicRules, dormant: dormantRules };

for (const [topicName, topicRuleMap] of Object.entries(implementedRuleGroups)) {
  for (const [ruleName, rule] of Object.entries(topicRuleMap)) {
    for (const [messageId, message] of Object.entries(rule.meta.messages)) {
      assert.equal(
        typeof message,
        "string",
        `${topicName}/${ruleName}/${messageId} message must be a string`,
      );
      assert.ok(
        message.includes("\nFix: "),
        `${topicName}/${ruleName}/${messageId} message must include a Fix line`,
      );
      assert.ok(
        message.includes(`\nSee: ${getRuleDocPath(ruleName)}`),
        `${topicName}/${ruleName}/${messageId} message must link its rule doc`,
      );
    }
  }
}

console.log("eslint rule tests ok");
