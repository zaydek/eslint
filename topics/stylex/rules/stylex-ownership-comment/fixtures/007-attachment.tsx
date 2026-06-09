import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root
//     Thumb?{Is{Pdf|Link}}
//       ThumbImg
//
//     Meta
//       MetaName
//       MetaSize
//
const styles = stylex.create({
  Root: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: 340,
    maxWidth: '100%',
    background: tokens.panel,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 11,
    padding: 12,
  },
  Thumb: {
    width: 44,
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    borderRadius: 9,
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
    background: tokens.panelSecondary,
    color: tokens.textDim,
  },
  ThumbIsPdf: {
    color: tokens.danger,
  },
  ThumbIsLink: {
    color: tokens.accent,
  },
  ThumbImg: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
    background: 'linear-gradient(120deg, #a78bfa, #eb6e98)',
  },
  Meta: {
    flexGrow: 1,
    minWidth: 0,
  },
  MetaName: {
    fontSize: 13.5,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  MetaSize: {
    fontSize: 11.5,
    color: tokens.textFaint,
    marginTop: 1,
  },
});

export function AttachmentTile({ kind }) {
  return (
    <div {...stylex.props(styles.Root)}>
      <div
        {...stylex.props(
          styles.Thumb,
          kind === 'pdf' && styles.ThumbIsPdf,
          kind === 'link' && styles.ThumbIsLink,
        )}
      >
        <div {...stylex.props(styles.ThumbImg)} />
      </div>
      <div {...stylex.props(styles.Meta)}>
        <div {...stylex.props(styles.MetaName)}>Q3 roadmap.pdf</div>
        <div {...stylex.props(styles.MetaSize)}>1.4 MB</div>
      </div>
    </div>
  );
}
