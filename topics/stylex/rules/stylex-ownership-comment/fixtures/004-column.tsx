import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root?{IsCollapsed}
//     Head
//       HeadDot
//       HeadTitle?{IsCollapsed}
//       HeadCount
//
//     Body?{IsCollapsed}
//       BodyCard
//
const styles = stylex.create({
  Root: {
    width: 270,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 13,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  RootIsCollapsed: {
    width: 56,
  },
  Head: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    paddingTop: 4,
    paddingRight: 6,
    paddingBottom: 10,
    paddingLeft: 6,
  },
  HeadDot: {
    width: 10,
    height: 10,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    borderRadius: 999,
    background: tokens.accent,
  },
  HeadTitle: {
    fontWeight: 600,
    fontSize: 13.5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  HeadTitleIsCollapsed: {
    display: 'none',
  },
  HeadCount: {
    fontFamily: tokens.monospaceFont,
    fontSize: 11,
    color: tokens.textFaint,
  },
  Body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  BodyIsCollapsed: {
    display: 'none',
  },
  BodyCard: {
    width: '100%',
  },
});

// `collapsed` is local state, so it threads as a boolean and the child variants
// (title / body) spread conditionally — no marker / when.ancestor required.
export function Column({ collapsed }) {
  return (
    <div {...stylex.props(styles.Root, collapsed && styles.RootIsCollapsed)}>
      <div {...stylex.props(styles.Head)}>
        <span {...stylex.props(styles.HeadDot)} />
        <div {...stylex.props(styles.HeadTitle, collapsed && styles.HeadTitleIsCollapsed)}>
          In progress
        </div>
        <span {...stylex.props(styles.HeadCount)}>4</span>
      </div>
      <div {...stylex.props(styles.Body, collapsed && styles.BodyIsCollapsed)}>
        {/* BodyCard is passed down so the child Card merges it last. */}
        <Card style={styles.BodyCard} />
        <Card style={styles.BodyCard} />
      </div>
    </div>
  );
}
