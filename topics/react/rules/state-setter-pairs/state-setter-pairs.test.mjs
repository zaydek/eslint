import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { stateSetterPairsRule } from './state-setter-pairs.mjs';

const ruleTester = createRuleTester();

ruleTester.run('state-setter-pairs', stateSetterPairsRule, {
  valid: [
    'const [isOpen, setIsOpen] = React.useState(false);',
    'const [modal, setModal] = useState(ModalKind.None);',
    // Setter-only destructuring has no pair to check.
    'const [, setIsOpen] = React.useState(false);',
    // Reducers belong to reducer-dispatch-names.
    'const [board, dispatchBoard] = React.useReducer(reducer, initialBoard);',
  ],
  invalid: [
    {
      code: 'const [isOpen, setOpen] = React.useState(false);',
      errors: [{ messageId: 'setterName' }],
    },
    {
      code: 'const [modal, updateModal] = useState(ModalKind.None);',
      errors: [{ messageId: 'setterName' }],
    },
  ],
});
