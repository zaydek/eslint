import { associatedExportsRule } from './associated-exports/associated-exports.mjs';
import { articulatedObjectContractsRule } from './articulated-object-contracts/articulated-object-contracts.mjs';
import { booleanNamesRule } from './boolean-names/boolean-names.mjs';
import { discriminantKindRule } from './discriminant-kind/discriminant-kind.mjs';
import { enumKindSuffixRule } from './enum-kind-suffix/enum-kind-suffix.mjs';
import { enumMemberValuesRule } from './enum-member-values/enum-member-values.mjs';
import { enumValueCasingRule } from './enum-value-casing/enum-value-casing.mjs';
import { exhaustiveSwitchRule } from './exhaustive-switch/exhaustive-switch.mjs';
import { functionDeclarationsRule } from './function-declarations/function-declarations.mjs';
import { functionNamesRule } from './function-names/function-names.mjs';
import { handlerMapAlignmentRule } from './handler-map-alignment/handler-map-alignment.mjs';
import { mapRecordNamesRule } from './map-record-names/map-record-names.mjs';
import { namedComplexReturnTypesRule } from './named-complex-return-types/named-complex-return-types.mjs';
import { namedNestedTypesRule } from './named-nested-types/named-nested-types.mjs';
import { noConcisionNamesRule } from './no-concision-names/no-concision-names.mjs';
import { noNamespacesRule } from './no-namespaces/no-namespaces.mjs';
import { resultShapeRule } from './result-shape/result-shape.mjs';

export const typescriptRules = {
  'associated-exports': associatedExportsRule,
  'articulated-object-contracts': articulatedObjectContractsRule,
  'boolean-names': booleanNamesRule,
  'discriminant-kind': discriminantKindRule,
  'enum-kind-suffix': enumKindSuffixRule,
  'enum-member-values': enumMemberValuesRule,
  'enum-value-casing': enumValueCasingRule,
  'exhaustive-switch': exhaustiveSwitchRule,
  'function-declarations': functionDeclarationsRule,
  'function-names': functionNamesRule,
  'handler-map-alignment': handlerMapAlignmentRule,
  'map-record-names': mapRecordNamesRule,
  'named-complex-return-types': namedComplexReturnTypesRule,
  'named-nested-types': namedNestedTypesRule,
  'no-concision-names': noConcisionNamesRule,
  'no-namespaces': noNamespacesRule,
  'result-shape': resultShapeRule,
};
