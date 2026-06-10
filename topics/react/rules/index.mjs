import { componentBodyLayoutRule } from "./component-body-layout/component-body-layout.mjs";
import { componentPropsRule } from "./component-props/component-props.mjs";
import { contextViaFactoryRule } from "./context-via-factory/context-via-factory.mjs";
import { exportedComponentPropsRule } from "./exported-component-props/exported-component-props.mjs";
import { namespaceImportsRule } from "./namespace-imports/namespace-imports.mjs";
import { refNamesRule } from "./ref-names/ref-names.mjs";
import { reducerDispatchNamesRule } from "./reducer-dispatch-names/reducer-dispatch-names.mjs";
import { stateSetterPairsRule } from "./state-setter-pairs/state-setter-pairs.mjs";
import { useNewNamingRule } from "./use-new-naming/use-new-naming.mjs";

export const reactRules = {
  "component-body-layout": componentBodyLayoutRule,
  "component-props": componentPropsRule,
  "context-via-factory": contextViaFactoryRule,
  "exported-component-props": exportedComponentPropsRule,
  "namespace-imports": namespaceImportsRule,
  "ref-names": refNamesRule,
  "reducer-dispatch-names": reducerDispatchNamesRule,
  "state-setter-pairs": stateSetterPairsRule,
  "use-new-naming": useNewNamingRule,
};
