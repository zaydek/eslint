import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root
//     Head
//       HeadChip
//         HeadChipBar
//
//     Cols
//       ColsColumn
//
const styles = stylex.create({
  Root: {
    width: '100%',
  },
  Head: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  Cols: {
    display: 'flex',
    gap: 14,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  ColsColumn: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  HeadChip: {
    display: 'inline-flex',
    gap: 4,
  },
  HeadChipBar: {
    width: 22,
    height: 48,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 5,
  },
});

export function Board(props) {
  return (
    <div {...stylex.props(styles.Root)}>
      <div {...stylex.props(styles.Head)}>
        <span {...stylex.props(styles.HeadChip)}>
          <span {...stylex.props(styles.HeadChipBar)} />
          <span {...stylex.props(styles.HeadChipBar)} />
          <span {...stylex.props(styles.HeadChipBar)} />
        </span>
      </div>
      <div {...stylex.props(styles.Cols)}>
        {/* ColsColumn merges last so the board's flex override wins. */}
        <Column style={styles.ColsColumn} />
        <Column style={styles.ColsColumn} />
      </div>
    </div>
  );
}
