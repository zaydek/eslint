import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root?{IsActive}
//     Ico?{IsActive}
//     Label
//     Hint
//
const styles = stylex.create({
  Root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    width: 360,
    maxWidth: '100%',
    padding: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: tokens.line,
    borderRadius: 12,
    textAlign: 'center',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
  },
  RootIsActive: {
    borderColor: tokens.accent,
    background: 'rgba(167, 139, 250, 0.07)',
  },
  Ico: {
    color: tokens.textFaint,
  },
  IcoIsActive: {
    color: tokens.accent,
  },
  Label: {
    fontSize: 14,
    fontWeight: 500,
  },
  Hint: {
    fontSize: 12.5,
    color: tokens.textFaint,
  },
});

export function DropZone({ active }) {
  return (
    <div {...stylex.props(styles.Root, active && styles.RootIsActive)}>
      <span {...stylex.props(styles.Ico, active && styles.IcoIsActive)} />
      <div {...stylex.props(styles.Label)}>Drop files here</div>
      <div {...stylex.props(styles.Hint)}>or click to browse</div>
    </div>
  );
}
