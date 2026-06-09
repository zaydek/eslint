import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { handlerMapAlignmentRule } from './handler-map-alignment.mjs';

const ruleTester = createRuleTester();

ruleTester.run('handler-map-alignment', handlerMapAlignmentRule, {
  valid: [
    `
      const MapActionKindToHandler: BoardActionHandlerMap = {
        [BoardActionKind.StickyCreate]: handleStickyCreate,
        [BoardActionKind.StickyRename]: handleStickyRename,
      };
    `,
    // Non-handler maps are out of scope.
    `
      const MapModalKindToComponent = {
        [ModalKind.ChatSidebar]: ModalChatSidebar,
      };
    `,
  ],
  invalid: [
    {
      code: `
        const MapActionKindToHandler = {
          [BoardActionKind.StickyCreate]: handleCreateSticky,
        };
      `,
      errors: [{ messageId: 'aligned' }],
    },
    {
      code: `
        const MapActionKindToHandler = {
          [BoardActionKind.StickyCreate]: (state, action) => state,
        };
      `,
      errors: [{ messageId: 'aligned' }],
    },
    {
      code: `
        const MapActionKindToHandler: Record<BoardActionKind, (state: Board, action: any) => Board> = {
          [BoardActionKind.StickyCreate]: handleStickyCreate,
        };
      `,
      errors: [{ messageId: 'noAny' }],
    },
  ],
});
