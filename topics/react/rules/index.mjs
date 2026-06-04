import { componentPropsRule } from './component-props/component-props.mjs';
import { exportedComponentPropsRule } from './exported-component-props/exported-component-props.mjs';
import { reducerDispatchNamesRule } from './reducer-dispatch-names/reducer-dispatch-names.mjs';

export const reactRules = {
  'component-props': componentPropsRule,
  'exported-component-props': exportedComponentPropsRule,
  'reducer-dispatch-names': reducerDispatchNamesRule,
};
