const RULE_DOCS_ROOT = "~/GitHub/zaydek/eslint/RULES";

const MapRuleNameToDocSlug = {
  "comment-capitalization": "comments_comment-capitalization",
  "todo-format": "comments_todo-format",
  "component-body-layout": "react_component-body-layout",
  "component-props": "react_component-props",
  "context-via-factory": "react_context-via-factory",
  "exported-component-props": "react_exported-component-props",
  "namespace-imports": "react_namespace-imports",
  "no-manual-memoization": "react_no-manual-memoization",
  "reducer-dispatch-names": "react_reducer-dispatch-names",
  "ref-names": "react_ref-names",
  "state-setter-pairs": "react_state-setter-pairs",
  "use-new-naming": "react_use-new-naming",
  "enum-style-variants": "stylex_enum-style-variants",
  "max-variant-axes": "stylex_max-variant-axes",
  "no-sx-prop": "stylex_no-sx-prop",
  "stylex-key-names": "stylex_stylex-key-names",
  "stylex-object-spacing": "stylex_stylex-object-spacing",
  "stylex-ownership-comment": "stylex_stylex-ownership-comment",
  "stylex-placement": "stylex_stylex-placement",
  "stylex-props-first": "stylex_stylex-props-first",
  "stylex-tokens-only": "stylex_stylex-tokens-only",
  "articulated-object-contracts": "typescript_articulated-object-contracts",
  "associated-exports": "typescript_associated-exports",
  "boolean-names": "typescript_boolean-names",
  "discriminant-kind": "typescript_discriminant-kind",
  "enum-kind-suffix": "typescript_enum-kind-suffix",
  "enum-member-values": "typescript_enum-member-values",
  "enum-value-casing": "typescript_enum-value-casing",
  "error-message-context": "typescript_error-message-context",
  "exhaustive-switch": "typescript_exhaustive-switch",
  "function-declarations": "typescript_function-declarations",
  "handler-map-alignment": "typescript_handler-map-alignment",
  "kebab-case-source-filenames": "typescript_kebab-case-source-filenames",
  "map-record-names": "typescript_map-record-names",
  "named-complex-return-types": "typescript_named-complex-return-types",
  "named-nested-types": "typescript_named-nested-types",
  "no-concision-names": "typescript_no-concision-names",
  "no-namespaces": "typescript_no-namespaces",
  "prefer-type-aliases": "typescript_prefer-type-aliases",
  "result-shape": "typescript_result-shape",
};

export function getRuleDocPath(ruleName) {
  const docSlug = MapRuleNameToDocSlug[ruleName] ?? ruleName;
  return `${RULE_DOCS_ROOT}/${docSlug}.md`;
}

export function createRuleMessage(problem, fix, ruleName) {
  return `${problem}\nFix: ${fix}\nSee: ${getRuleDocPath(ruleName)}`;
}
