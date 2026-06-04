import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { stylexOwnershipCommentRule } from './stylex-ownership-comment.mjs';

const ruleTester = createRuleTester();

ruleTester.run('stylex-ownership-comment', stylexOwnershipCommentRule, {
  valid: [
    `
      // root(:focus-within), rootDensity{Compact,Comfortable}
      //   toolbar
      //     toolbarSearch
      //     toolbarFilterButton(:hover,:focus-visible)
      //
      //   columns
      //     columnsColumn
      //       columnsColumnHeader
      //         columnsColumnHeaderTitle
      //         columnsColumnHeaderMenuButton(:hover,:focus-visible)
      //       columnsColumnDropZone(:is([data-over]))
      //       columnsColumnSticky(:hover)
      //         columnsColumnStickyTitle
      //         columnsColumnStickyFooter
      //           columnsColumnStickyFooterAvatarStack
      //           columnsColumnStickyFooterMeta
      //
      //   overlay(:is([data-open]))
      //     overlayPanel
      //       overlayPanelTitle
      //       overlayPanelActions
      //         overlayPanelActionsButton(:focus-visible,:disabled)
      //         overlayPanelActionsButtonVariant{Secondary,Danger}
      //
      const styles = stylex.create({
        root: {},
        rootDensityCompact: {},
        rootDensityComfortable: {},
        toolbar: {},
        toolbarSearch: {},
        toolbarFilterButton: {},
        columns: {},
        columnsColumn: {},
        columnsColumnHeader: {},
        columnsColumnHeaderTitle: {},
        columnsColumnHeaderMenuButton: {},
        columnsColumnDropZone: {},
        columnsColumnSticky: {},
        columnsColumnStickyTitle: {},
        columnsColumnStickyFooter: {},
        columnsColumnStickyFooterAvatarStack: {},
        columnsColumnStickyFooterMeta: {},
        overlay: {},
        overlayPanel: {},
        overlayPanelTitle: {},
        overlayPanelActions: {},
        overlayPanelActionsButton: {},
        overlayPanelActionsButtonVariantSecondary: {},
        overlayPanelActionsButtonVariantDanger: {},
      });
    `,
    `
      // card(:hover), cardVariant{Pink,Blue}
      //   cardTitle
      //   cardFooter
      //     cardFooterAvatarStack
      //
      const styles = stylex.create({
        card: {},
        cardVariantPink: {},
        cardVariantBlue: {},
        cardTitle: {},
        cardFooter: {},
        cardFooterAvatarStack: {},
      });
    `,
    `
      /*
      card
        cardTitle
      */
      const styles = stylex.create({
        card: {},
        cardTitle: {},
      });
    `,
    `
      // Plain stylex.create stays here in the component file. A sibling \`.stylex.ts\`
      // is only warranted when a component needs its own stylex.defineVars.
      //
      // card
      //   cardTitle
      //
      const styles = stylex.create({
        card: {},
        cardTitle: {},
      });
    `,
    `
      // root
      //   toolbar
      //     toolbarSearch
      //
      //   columns
      //     columnsColumn
      //
      const styles = stylex.create({
        root: {},
        toolbar: {},
        toolbarSearch: {},
        columns: {},
        columnsColumn: {},
      });
    `,
    `
      // group
      //   label
      //   input
      //
      const styles = stylex.create({
        group: {},
        label: {},
        input: {},
      });

      function Demo() {
        return (
          <Field.Root {...stylex.props(styles.group)}>
            <Field.Label {...stylex.props(styles.label)} />
            <BaseInput {...stylex.props(styles.input)} />
          </Field.Root>
        );
      }
    `,
    `
      // backdrop(:is([data-phase="exit"]))
      //
      // host
      //   layer, layerVars(fromTop, z)
      //
      const styles = stylex.create({
        backdrop: {
          opacity: { default: 1, ':is([data-phase="exit"])': 0 },
        },
        host: {},
        layer: {},
        layerVars: (fromTop, z) => ({ '--from-top': fromTop, zIndex: z }),
      });

      function Demo() {
        return (
          <Dialog.Portal>
            <Dialog.Backdrop {...stylex.props(styles.backdrop)} />
            <Dialog.Popup {...stylex.props(styles.host)}>
              <div {...stylex.props([styles.layer, styles.layerVars(1, 2)])} />
            </Dialog.Popup>
          </Dialog.Portal>
        );
      }
    `,
    `
      // root
      //
      const styles = stylex.create({
        root: {},
      });

      function Demo() {
        const key = 'root';
        return <div {...stylex.props(styles[key])} />;
      }
    `,
  ],
  invalid: [
    {
      code: `
        const styles = stylex.create({
          card: {},
        });
      `,
      errors: [{ messageId: 'missingComment' }],
    },
    {
      code: `
        // card
        //
        const styles = stylex.create({
          card: {},
          cardTitle: {},
        });
      `,
      errors: [{ messageId: 'missingKey' }],
    },
    {
      code: `
        // card
        //   cardTitle
        //
        const styles = stylex.create({
          card: {},
        });
      `,
      errors: [{ messageId: 'unknownKey' }],
    },
    {
      code: `
        // card
        const styles = stylex.create({
          card: {},
        });
      `,
      errors: [{ messageId: 'missingSeparator' }],
    },
    {
      code: `
        // root
        //   toolbar
        //     toolbarSearch
        //   columns
        //     columnsColumn
        //
        const styles = stylex.create({
          root: {},
          toolbar: {},
          toolbarSearch: {},
          columns: {},
          columnsColumn: {},
        });
      `,
      errors: [{ messageId: 'missingRootSeparator' }],
    },
    {
      code: `
        // group, label, input
        //
        const styles = stylex.create({
          group: {},
          label: {},
          input: {},
        });

        function Demo() {
          return (
            <Field.Root {...stylex.props(styles.group)}>
              <Field.Label {...stylex.props(styles.label)} />
              <BaseInput {...stylex.props(styles.input)} />
            </Field.Root>
          );
        }
      `,
      errors: [
        { messageId: 'wrongParent' },
        { messageId: 'wrongParent' },
        { messageId: 'falseSameElement' },
      ],
    },
    {
      code: `
        // host, backdrop, layer, layerVars
        //
        const styles = stylex.create({
          host: {},
          backdrop: {
            opacity: { default: 1, ':is([data-phase="exit"])': 0 },
          },
          layer: {},
          layerVars: (fromTop, z) => ({ '--from-top': fromTop, zIndex: z }),
        });

        function Demo() {
          return (
            <Dialog.Portal>
              <Dialog.Backdrop {...stylex.props(styles.backdrop)} />
              <Dialog.Popup {...stylex.props(styles.host)}>
                <div {...stylex.props([styles.layer, styles.layerVars(1, 2)])} />
              </Dialog.Popup>
            </Dialog.Portal>
          );
        }
      `,
      errors: [
        { messageId: 'wrongParent' },
        { messageId: 'wrongParent' },
        { messageId: 'falseSameElement' },
      ],
    },
  ],
});
