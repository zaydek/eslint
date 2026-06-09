import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
//
//   Root
//     Avatar
//     Body
//       BodyHead
//         BodyHeadName
//         BodyHeadTime
//       BodyText
//       BodyReacts
//         BodyReactsReact?{IsAdd}
//       BodyReplies
//
const styles = stylex.create({
  Root: {
    display: 'flex',
    gap: 11,
    width: 460,
    maxWidth: '100%',
  },
  Avatar: {
    width: 32,
    height: 32,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    borderRadius: 999,
    background: tokens.panelSecondary,
  },
  Body: {
    flexGrow: 1,
    minWidth: 0,
  },
  BodyHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  BodyHeadName: {
    fontSize: 13.5,
    fontWeight: 600,
  },
  BodyHeadTime: {
    fontSize: 11.5,
    color: tokens.textFaint,
  },
  BodyText: {
    marginTop: 4,
    fontSize: 13.5,
    lineHeight: 1.5,
    color: tokens.textDim,
  },
  BodyReacts: {
    display: 'flex',
    gap: 6,
    marginTop: 8,
  },
  BodyReactsReact: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderRadius: 999,
    paddingTop: 2,
    paddingRight: 8,
    paddingBottom: 2,
    paddingLeft: 8,
    color: tokens.textDim,
    cursor: 'pointer',
  },
  BodyReactsReactIsAdd: {
    color: tokens.textFaint,
  },
  BodyReplies: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
});

// Recursion is plain composition in StyleX — there are no descendant selectors,
// so a parent comment's styles never reach a nested <Comment>. No donut needed.
export function Comment({ comment }) {
  return (
    <div {...stylex.props(styles.Root)}>
      <div {...stylex.props(styles.Avatar)} />
      <div {...stylex.props(styles.Body)}>
        <div {...stylex.props(styles.BodyHead)}>
          <b {...stylex.props(styles.BodyHeadName)}>{comment.author}</b>
          <span {...stylex.props(styles.BodyHeadTime)}>{comment.time}</span>
        </div>
        <p {...stylex.props(styles.BodyText)}>{comment.text}</p>
        <div {...stylex.props(styles.BodyReacts)}>
          {comment.reactions.map((reaction) => (
            <span key={reaction.id} {...stylex.props(styles.BodyReactsReact)}>
              {reaction.emoji} {reaction.count}
            </span>
          ))}
          <span {...stylex.props(styles.BodyReactsReact, styles.BodyReactsReactIsAdd)}>+</span>
        </div>
        {comment.replies?.length > 0 && (
          <div {...stylex.props(styles.BodyReplies)}>
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
