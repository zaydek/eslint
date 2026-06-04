import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { discriminantKindRule } from './discriminant-kind.mjs';

const ruleTester = createRuleTester();

ruleTester.run('discriminant-kind', discriminantKindRule, {
  valid: [
    "type IconAssetSVG = { kind: 'svg'; url: string };",
    'type DomThing = { type: HTMLInputElement; value: string };',
  ],
  invalid: [
    {
      code: "type IconAssetSVG = { type: 'svg'; url: string };",
      errors: [{ messageId: 'useKind' }],
    },
    {
      code: "type Variant = { type: 'a' | 'b'; value: string };",
      errors: [{ messageId: 'useKind' }],
    },
  ],
});
