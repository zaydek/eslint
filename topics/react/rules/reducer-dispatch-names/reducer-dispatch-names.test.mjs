import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { reducerDispatchNamesRule } from './reducer-dispatch-names.mjs';

const ruleTester = createRuleTester();

ruleTester.run('reducer-dispatch-names', reducerDispatchNamesRule, {
  valid: ['const [board, dispatchBoard] = useReducer(reducer, initialValue);'],
  invalid: [
    {
      code: 'const [board, setBoard] = useReducer(reducer, initialValue);',
      errors: [{ messageId: 'dispatchName' }],
    },
  ],
});
