import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root?{IsSelected}
//     Cover
//     Pad
//       PadTitle
//       PadMeta
//         PadMetaStat
//         PadMetaSpacer
//
const styles = stylex.create({
  Root: {
    width: 280,
    maxWidth: '100%',
    background: tokens.panel,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: tokens.line,
      ':hover': tokens.textFaint,
    },
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    transitionProperty: 'border-color, transform',
    transitionDuration: '0.12s',
  },
  RootIsSelected: {
    borderColor: tokens.accent,
    boxShadow: `0 0 0 1px ${tokens.accent}`,
  },
  Cover: {
    height: 64,
    background: 'linear-gradient(120deg, #a78bfa, #5a7fd6)',
  },
  Pad: {
    paddingTop: 13,
    paddingRight: 14,
    paddingBottom: 13,
    paddingLeft: 14,
  },
  PadTitle: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.35,
  },
  PadMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  PadMetaStat: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: tokens.textFaint,
  },
  PadMetaSpacer: {
    flexGrow: 1,
  },
});

export function Card({ selected }) {
  return (
    <div {...stylex.props(styles.Root, selected && styles.RootIsSelected)}>
      <div {...stylex.props(styles.Cover)} />
      <div {...stylex.props(styles.Pad)}>
        <div {...stylex.props(styles.PadTitle)}>Design review</div>
        <div {...stylex.props(styles.PadMeta)}>
          <span {...stylex.props(styles.PadMetaStat)}>3 comments</span>
          <span {...stylex.props(styles.PadMetaSpacer)} />
        </div>
      </div>
    </div>
  );
}
