import { createRuleTester } from '../../../lib/rule-tester.mjs';
import { stylexOwnershipCommentRule } from './stylex-ownership-comment.mjs';

const ruleTester = createRuleTester();

ruleTester.run('stylex-ownership-comment', stylexOwnershipCommentRule, {
  valid: [
    `
      // Root{Is{Compact|Comfortable}}, ?{IsSelected}
      //   Header
      //     HeaderTitle
      //
      //   Footer
      //     FooterAvatarStack
      //
      const styles = stylex.create({
        Root: {},
        RootIsCompact: {},
        RootIsComfortable: {},
        RootIsSelected: {},
        Header: {},
        HeaderTitle: {},
        Footer: {},
        FooterAvatarStack: {},
      });
    `,
    `
      /*
      Card
        CardTitle
      */
      const styles = stylex.create({
        Card: {},
        CardTitle: {},
      });
    `,
    `
      // Plain stylex.create stays here in the component file. A sibling \`.stylex.ts\`
      // is only warranted when a component needs its own stylex.defineVars.
      //
      // Card
      //   CardTitle
      //
      const styles = stylex.create({
        Card: {},
        CardTitle: {},
      });
    `,
    `
      // Backdrop
      //
      // Host
      //   Layer
      //   LayerVars(fromTop<number>, z<number>)
      //
      const styles = stylex.create({
        Backdrop: {
          opacity: { default: 1, ':is([data-phase="exit"])': 0 },
        },
        Host: {},
        Layer: {},
        LayerVars: (fromTop, z) => ({ '--from-top': fromTop, zIndex: z }),
      });

      function Demo() {
        return (
          <Dialog.Portal>
            <Dialog.Backdrop {...stylex.props(styles.Backdrop)} />
            <Dialog.Popup {...stylex.props(styles.Host)}>
              <div {...stylex.props([styles.Layer, styles.LayerVars(1, 2)])} />
            </Dialog.Popup>
          </Dialog.Portal>
        );
      }
    `,
    `
      // Root
      //
      const styles = stylex.create({
        Root: {},
      });

      function Demo() {
        const key = 'Root';
        return <div {...stylex.props(styles[key])} />;
      }
    `,
  ],
  invalid: [
    {
      code: `
        const styles = stylex.create({
          Card: {},
        });
      `,
      errors: [{ messageId: 'missingComment' }],
    },
    {
      code: `
        // Card
        //
        const styles = stylex.create({
          Card: {},
          CardTitle: {},
        });
      `,
      errors: [{ messageId: 'missingKey' }],
    },
    {
      code: `
        // Card
        //   CardTitle
        //
        const styles = stylex.create({
          Card: {},
        });
      `,
      errors: [{ messageId: 'unknownKey' }],
    },
    {
      code: `
        // Card
        const styles = stylex.create({
          Card: {},
        });
      `,
      errors: [{ messageId: 'missingSeparator' }],
    },
    {
      code: `
        // Root
        //   Header
        //     HeaderTitle
        //   Footer
        //     FooterTitle
        //
        const styles = stylex.create({
          Root: {},
          Header: {},
          HeaderTitle: {},
          Footer: {},
          FooterTitle: {},
        });
      `,
      errors: [{ messageId: 'missingRootSeparator' }],
    },
    {
      code: `
        // Group
        // Label
        // Input
        //
        const styles = stylex.create({
          Group: {},
          Label: {},
          Input: {},
        });

        function Demo() {
          return (
            <Field.Root {...stylex.props(styles.Group)}>
              <Field.Label {...stylex.props(styles.Label)} />
              <BaseInput {...stylex.props(styles.Input)} />
            </Field.Root>
          );
        }
      `,
      errors: [
        { messageId: 'wrongParent' },
        { messageId: 'wrongParent' },
      ],
    },
    {
      code: `
        // Host
        // Backdrop
        // Layer
        // LayerVars(fromTop<number>, z<number>)
        //
        const styles = stylex.create({
          Host: {},
          Backdrop: {
            opacity: { default: 1, ':is([data-phase="exit"])': 0 },
          },
          Layer: {},
          LayerVars: (fromTop, z) => ({ '--from-top': fromTop, zIndex: z }),
        });

        function Demo() {
          return (
            <Dialog.Portal>
              <Dialog.Backdrop {...stylex.props(styles.Backdrop)} />
              <Dialog.Popup {...stylex.props(styles.Host)}>
                <div {...stylex.props([styles.Layer, styles.LayerVars(1, 2)])} />
              </Dialog.Popup>
            </Dialog.Portal>
          );
        }
      `,
      errors: [
        { messageId: 'wrongParent' },
        { messageId: 'wrongParent' },
      ],
    },
    {
      code: `
        // Root{Is{Selected}?}
        //
        const styles = stylex.create({
          Root: {},
          RootIsSelected: {},
        });
      `,
      errors: [{ messageId: 'trailingOptional' }, { messageId: 'missingKey' }],
    },
    {
      code: `
        // Root
        //   BodyCard          (layout override merged into child <Card>)
        //
        const styles = stylex.create({
          Root: {},
          BodyCard: {},
        });
      `,
      errors: [{ messageId: 'invalidLine' }, { messageId: 'missingKey' }],
    },
  ],
});
