import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root?{IsDone}
//     Bar
//     Media
//     Pad
//       PadTop
//         PadTopFlag?{Is{High|Low}}
//         PadTopTitle?{IsDone}
//       PadBody
//       PadFoot
//         PadFootNest
//
const styles = stylex.create({
  Root: {
    position: 'relative',
    width: 260,
    maxWidth: '100%',
    background: tokens.panel,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 13,
    overflow: 'hidden',
  },
  RootIsDone: {
    opacity: 0.55,
  },
  Bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: tokens.stickyAccent,
  },
  Media: {
    height: 78,
    background: stylex.firstThatWorks(
      'color-mix(in srgb, var(--sticky) 60%, #000)',
      '#16161e',
    ),
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  Pad: {
    paddingTop: 13,
    paddingRight: 15,
    paddingBottom: 13,
    paddingLeft: 15,
  },
  PadTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  PadTopFlag: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    marginTop: 1,
    color: tokens.warning,
  },
  PadTopFlagIsHigh: {
    color: tokens.danger,
  },
  PadTopFlagIsLow: {
    color: tokens.textFaint,
  },
  PadTopTitle: {
    fontFamily: tokens.displayFont,
    fontSize: 19,
    lineHeight: 1.1,
  },
  PadTopTitleIsDone: {
    textDecoration: 'line-through',
    color: tokens.textDim,
  },
  PadBody: {
    marginTop: 8,
    fontSize: 13.5,
    lineHeight: 1.5,
    color: tokens.textDim,
  },
  PadFoot: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  PadFootNest: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11.5,
    fontWeight: 600,
    color: tokens.textDim,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 7,
    paddingTop: 3,
    paddingRight: 8,
    paddingBottom: 3,
    paddingLeft: 8,
  },
});

// `done` and `priority` are local state, so they thread as booleans and the
// child variants spread conditionally — no marker / when.ancestor required.
export function Sticky({ done, priority }) {
  return (
    <div {...stylex.props(styles.Root, done && styles.RootIsDone)}>
      <span {...stylex.props(styles.Bar)} />
      <div {...stylex.props(styles.Media)} />
      <div {...stylex.props(styles.Pad)}>
        <div {...stylex.props(styles.PadTop)}>
          <span
            {...stylex.props(
              styles.PadTopFlag,
              priority === 'high' && styles.PadTopFlagIsHigh,
              priority === 'low' && styles.PadTopFlagIsLow,
            )}
          />
          <h3 {...stylex.props(styles.PadTopTitle, done && styles.PadTopTitleIsDone)}>
            Ship the release
          </h3>
        </div>
        <p {...stylex.props(styles.PadBody)}>Notes about the task.</p>
        <div {...stylex.props(styles.PadFoot)}>
          <span {...stylex.props(styles.PadFootNest)}>3 subtasks</span>
        </div>
      </div>
    </div>
  );
}
