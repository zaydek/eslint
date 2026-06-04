import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { booleanNamesRule } from './boolean-names.mjs';

const ruleTester = createRuleTester();

ruleTester.run('boolean-names', booleanNamesRule, {
  valid: [
    'const isOpen = true;',
    'const [isMounted, setIsMounted] = useState(false);',
    'const count = 1;',
  ],
  invalid: [
    {
      code: 'const open = true;',
      errors: [{ messageId: 'prefix' }],
    },
    {
      code: 'const [mounted, setMounted] = useState(false);',
      errors: [{ messageId: 'prefix' }],
    },
  ],
});
