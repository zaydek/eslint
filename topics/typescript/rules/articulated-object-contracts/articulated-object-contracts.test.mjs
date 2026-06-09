import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { articulatedObjectContractsRule } from './articulated-object-contracts.mjs';

const ruleTester = createRuleTester();

ruleTester.run('articulated-object-contracts', articulatedObjectContractsRule, {
  valid: [
    `
type EditableTitleProps = {
  /** Current committed title text shown when the control is not editing. */
  value: string;
  /** Called when the component requests entering or leaving edit mode. */
  onEditingChange: (isEditing: boolean) => void;
};
`,
    `
interface LoadBoardArgs {
  /** Board identifier to load. */
  boardId: string;
  /** Whether archived stickies should be included. */
  shouldIncludeArchived?: boolean;
}
`,
    `
type LoadBoardReturnItem = {
  /** Sticky identifier. */
  id: string;
};
`,
    'type LocalData = { id: string; label: string };',
    'type EmptyProps = {};',
  ],
  invalid: [
    {
      code: `
type EditableTitleProps = {
  value: string;
};
`,
      errors: [{ messageId: 'missingComment' }],
    },
    {
      code: `
interface LoadBoardArgs {
  boardId: string;
  /** Whether archived stickies should be included. */
  shouldIncludeArchived?: boolean;
}
`,
      errors: [{ messageId: 'missingComment' }],
    },
    {
      code: `
/** Props for EditableTitle. */
type EditableTitleProps = {
  value: string;
};
`,
      errors: [{ messageId: 'missingComment' }],
    },
    {
      code: `
type GetBoardReturnItem = {
  /** Sticky identifier. */
  id: string;

  label: string;
};
`,
      errors: [{ messageId: 'missingComment' }],
    },
  ],
});
