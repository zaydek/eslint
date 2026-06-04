import { createRuleTester } from '../../../../lib/rule-tester.mjs';
import { stylexKeyNamesRule } from './stylex-key-names.mjs';

const ruleTester = createRuleTester();

ruleTester.run('stylex-key-names', stylexKeyNamesRule, {
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
      // card, cardVariantPromoted
      //   cardTitle
      //   cardVariantPromotedRibbon
      //     cardVariantPromotedRibbonIcon
      //
      const styles = stylex.create({
        card: {},
        cardVariantPromoted: {},
        cardTitle: {},
        cardVariantPromotedRibbon: {},
        cardVariantPromotedRibbonIcon: {},
      });
    `,
  ],
  invalid: [
    {
      code: `
        // card
        //   cardFooter
        //     avatarStack
        //
        const styles = stylex.create({
          card: {},
          cardFooter: {},
          avatarStack: {},
        });
      `,
      errors: [{ messageId: 'prefix' }],
    },
  ],
});
