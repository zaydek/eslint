import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { mapRecordNamesRule } from './map-record-names.mjs';

const ruleTester = createRuleTester();

ruleTester.run('map-record-names', mapRecordNamesRule, {
  valid: [
    'const MapActionToHandler: Record<EditorActionKind, Handler> = {};',
    'const MapModalTypeToComponent: Record<Exclude<ModalKind, ModalKind.None>, React.FC> = {};',
    "const MapDirectionAndStepToNumber: Record<`${Direction}__${Step}`, number> = {};",
    "const MapStatusToLabel: Record<'idle' | 'busy', string> = {};",
    // Named mapped types declare their key set elsewhere; this is the form
    // handler-map-alignment steers toward.
    'const MapActionKindToHandler: BoardActionHandlerMap = {};',
    // Open key sets carry no map contract.
    'const cache: Record<string, number> = {};',
    'const lookup: Record<PropertyKey, number> = {};',
    'const count = 1;',
  ],
  invalid: [
    {
      code: 'const handlers: Record<ItemKind, () => void> = {};',
      errors: [{ messageId: 'recordNeedsMapName' }],
    },
    {
      code: 'const MapActionHandlers: Record<EditorActionKind, Handler> = {};',
      errors: [{ messageId: 'recordNeedsMapName' }],
    },
    {
      code: 'const MapActionToHandler = {};',
      errors: [{ messageId: 'mapNeedsRecord' }],
    },
    {
      code: 'const MapNameToValue: Record<string, number> = {};',
      errors: [{ messageId: 'mapNeedsClosedKey' }],
    },
  ],
});
