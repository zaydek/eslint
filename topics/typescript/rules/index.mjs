import { associatedExportsRule } from './associated-exports/associated-exports.mjs';
import { articulatedObjectContractsRule } from './articulated-object-contracts/articulated-object-contracts.mjs';
import { booleanNamesRule } from './boolean-names/boolean-names.mjs';
import { discriminantKindRule } from './discriminant-kind/discriminant-kind.mjs';
import { functionDeclarationsRule } from './function-declarations/function-declarations.mjs';
import { functionNamesRule } from './function-names/function-names.mjs';
import { namedComplexReturnTypesRule } from './named-complex-return-types/named-complex-return-types.mjs';
import { namedNestedTypesRule } from './named-nested-types/named-nested-types.mjs';
import { noConcisionNamesRule } from './no-concision-names/no-concision-names.mjs';

export const typescriptRules = {
  'associated-exports': associatedExportsRule,
  'articulated-object-contracts': articulatedObjectContractsRule,
  'boolean-names': booleanNamesRule,
  'discriminant-kind': discriminantKindRule,
  'function-declarations': functionDeclarationsRule,
  'function-names': functionNamesRule,
  'named-complex-return-types': namedComplexReturnTypesRule,
  'named-nested-types': namedNestedTypesRule,
  'no-concision-names': noConcisionNamesRule,
};
