import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root?{IsCompact}
//     Row
//       RowIco
//       RowText
//         RowTextBold
//         RowTextTo
//         RowTextTime?{IsCompact}
//
const styles = stylex.create({
  Root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: 420,
    maxWidth: '100%',
  },
  RootIsCompact: {
    gap: 9,
  },
  Row: {
    display: 'flex',
    gap: 11,
    alignItems: 'flex-start',
  },
  RowIco: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: 26,
    height: 26,
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
    borderRadius: 999,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
  },
  RowText: {
    fontSize: 13,
    color: tokens.textDim,
  },
  RowTextBold: {
    color: tokens.text,
    fontWeight: 600,
  },
  RowTextTo: {
    color: tokens.accent,
  },
  RowTextTime: {
    display: 'block',
    fontSize: 11,
    color: tokens.textFaint,
    marginTop: 1,
  },
  RowTextTimeIsCompact: {
    marginTop: 0,
  },
});

export function ActivityFeed({ compact }) {
  return (
    <div {...stylex.props(styles.Root, compact && styles.RootIsCompact)}>
      <div {...stylex.props(styles.Row)}>
        <span {...stylex.props(styles.RowIco)} />
        <div {...stylex.props(styles.RowText)}>
          <b {...stylex.props(styles.RowTextBold)}>Ada</b> moved a card to{' '}
          <span {...stylex.props(styles.RowTextTo)}>In review</span>
          <span {...stylex.props(styles.RowTextTime, compact && styles.RowTextTimeIsCompact)}>
            2m ago
          </span>
        </div>
      </div>
      <div {...stylex.props(styles.Row)}>
        <span {...stylex.props(styles.RowIco)} />
        <div {...stylex.props(styles.RowText)}>
          <b {...stylex.props(styles.RowTextBold)}>Grace</b> commented on{' '}
          <span {...stylex.props(styles.RowTextTo)}>Ship the release</span>
          <span {...stylex.props(styles.RowTextTime, compact && styles.RowTextTimeIsCompact)}>
            18m ago
          </span>
        </div>
      </div>
      <div {...stylex.props(styles.Row)}>
        <span {...stylex.props(styles.RowIco)} />
        <div {...stylex.props(styles.RowText)}>
          <b {...stylex.props(styles.RowTextBold)}>Lin</b> archived{' '}
          <span {...stylex.props(styles.RowTextTo)}>Old backlog</span>
          <span {...stylex.props(styles.RowTextTime, compact && styles.RowTextTimeIsCompact)}>
            1h ago
          </span>
        </div>
      </div>
    </div>
  );
}
