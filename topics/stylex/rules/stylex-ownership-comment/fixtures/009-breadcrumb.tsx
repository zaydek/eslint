import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root
//     Home
//     Item
//       ItemSep
//       ItemLink?{IsCurrent}
//
const styles = stylex.create({
  Root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 13,
  },
  Home: {
    display: 'inline-grid',
    alignItems: 'center',
    justifyItems: 'center',
    color: tokens.textFaint,
  },
  Item: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 13,
  },
  ItemSep: {
    display: 'inline-flex',
    alignItems: 'center',
    color: tokens.textFaint,
  },
  ItemLink: {
    color: tokens.textDim,
    paddingTop: 3,
    paddingRight: 7,
    paddingBottom: 3,
    paddingLeft: 7,
    borderRadius: 6,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    backgroundColor: {
      default: 'transparent',
      ':hover': tokens.panelSecondary,
    },
  },
  ItemLinkIsCurrent: {
    color: tokens.text,
    fontWeight: 600,
    cursor: 'default',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'transparent',
    },
  },
});

export function Breadcrumb({ items }) {
  return (
    <nav {...stylex.props(styles.Root)}>
      <span {...stylex.props(styles.Home)}>⌂</span>
      {items.map(({ label, current }, i) => (
        <span key={i} {...stylex.props(styles.Item)}>
          <span {...stylex.props(styles.ItemSep)}>/</span>
          <span {...stylex.props(styles.ItemLink, current && styles.ItemLinkIsCurrent)}>
            {label}
          </span>
        </span>
      ))}
    </nav>
  );
}
