import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { useNewNamingRule } from './use-new-naming.mjs';

const ruleTester = createRuleTester();

ruleTester.run('use-new-naming', useNewNamingRule, {
  valid: [
    `
      function useNewBoard(initialBoard) {
        const [state, dispatchBoard] = React.useReducer(reducer, initialBoard);
        return { state, dispatchBoard };
      }
    `,
    // Derived-state hooks do not construct; they select.
    `
      function useBoardStickyCount() {
        const board = BoardContext.useContext();
        return board.state.stickies.length;
      }
    `,
    // Returning transformed values is not returning the raw bindings.
    `
      function useBoardSummary() {
        const [state] = React.useReducer(reducer, initialBoard);
        return { count: state.stickies.length };
      }
    `,
  ],
  invalid: [
    {
      code: `
        function useBoard(initialBoard) {
          const [state, dispatchBoard] = React.useReducer(reducer, initialBoard);
          return { state, dispatchBoard };
        }
      `,
      errors: [{ messageId: 'useNewPrefix' }],
    },
    {
      code: `
        const useEditorSettings = () => {
          const [modal, setModal] = useState(ModalKind.None);
          return { modal, setModal };
        };
      `,
      errors: [{ messageId: 'useNewPrefix' }],
    },
  ],
});
