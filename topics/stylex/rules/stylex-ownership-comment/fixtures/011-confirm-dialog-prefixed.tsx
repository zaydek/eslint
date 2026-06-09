import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';
import { surfaces, shadows } from './011-confirm-dialog-prefixed.constants.stylex';

// ── StyleX ownership contract ───────────────────────────────────────
// Indent = nesting. Key{Is{A|B}} = required axis; Key?{Is{A|B}} = optional axis.
// Dynamic entries use typed args. Pseudo-states live in the
// style objects, not here.
//
//   Dot
//   DotColor(color<string>)
//
//   Menu
//     MenuItem?{IsDanger}
//     MenuSep
//
//   Backdrop
//
//   Confirm
//     ConfirmTitle
//     ConfirmText
//     ConfirmActions
//       ConfirmActionsBtn{Is{Secondary|Danger}}
//
const styles = stylex.create({
  Dot: {
    width: 11,
    height: 11,
    borderWidth: 0,
    padding: 0,
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: {
      default: '0 0 0 3px transparent',
      ':hover': '0 0 0 3px rgba(255, 255, 255, 0.08)',
    },
    transitionProperty: 'box-shadow',
    transitionDuration: '0.12s',
  },
  DotColor: (color: string) => ({ backgroundColor: color }),
  Menu: {
    minWidth: 184,
    padding: 6,
    borderRadius: 10,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: surfaces.lineStrong,
    boxShadow: shadows.menu,
    color: tokens.text,
    transformOrigin: 'var(--transform-origin)',
  },
  MenuItem: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 30,
    paddingBlock: 6,
    paddingInline: 9,
    borderRadius: 7,
    fontSize: 13,
    color: {
      default: tokens.textDim,
      ':is([data-highlighted])': tokens.text,
    },
    backgroundColor: {
      default: 'transparent',
      ':is([data-highlighted])': surfaces.panelRaised,
    },
    cursor: 'default',
    userSelect: 'none',
    outline: 'none',
  },
  MenuItemIsDanger: {
    color: tokens.danger,
  },
  MenuSep: {
    height: 1,
    marginBlock: 5,
    marginInline: 6,
    backgroundColor: tokens.line,
  },
  Backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 80,
    backgroundColor: 'rgba(5, 5, 10, 0.62)',
    WebkitBackdropFilter: 'blur(5px)',
    backdropFilter: 'blur(5px)',
  },
  Confirm: {
    position: 'fixed',
    zIndex: 81,
    left: '50%',
    top: '50%',
    width: 'min(420px, calc(100vw - 32px))',
    paddingBlock: 26,
    paddingInline: 28,
    borderRadius: 14,
    background: tokens.panelSecondary,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: surfaces.lineStrong,
    boxShadow: shadows.dialog,
    color: tokens.text,
    willChange: 'transform, opacity',
    transform: {
      default: 'translate(-50%, calc(-50% + 64px))',
      ':is([data-phase="live"])': 'translate(-50%, -50%)',
      ':is([data-phase="exit"])': 'translate(-50%, calc(-50% + 64px))',
    },
    opacity: {
      default: 0,
      ':is([data-phase="live"])': 1,
      ':is([data-phase="exit"])': 0,
    },
    filter: {
      default: 'saturate(0.94)',
      ':is([data-phase="live"])': 'saturate(1)',
    },
    transitionProperty: 'transform, opacity, filter',
    transitionDuration: {
      default: '0.46s, 0.32s, 0.32s',
      ':is([data-phase="exit"])': '0.24s, 0.18s, 0.18s',
    },
    transitionTimingFunction: {
      default: 'cubic-bezier(0.32, 0.72, 0, 1), ease, ease',
      ':is([data-phase="exit"])': 'cubic-bezier(1, 0, 0.68, 0.28), ease, ease',
    },
    transitionDelay: {
      default: '0s, 0s, 0s',
      ':is([data-phase="exit"])': '0s, 0.06s, 0.06s',
    },
  },
  ConfirmTitle: {
    marginTop: 0,
    marginRight: 0,
    marginBottom: 12,
    marginLeft: 0,
    fontFamily: tokens.displayFont,
    fontSize: 24,
    fontWeight: 600,
  },
  ConfirmText: {
    margin: 0,
    color: tokens.textDim,
    fontSize: 15,
    lineHeight: 1.45,
  },
  ConfirmActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  ConfirmActionsBtn: {
    minHeight: 32,
    paddingInline: 14,
    borderWidth: 0,
    borderRadius: 8,
    font: 'inherit',
    cursor: { default: 'pointer', ':disabled': 'not-allowed' },
    opacity: { default: 1, ':disabled': 0.5 },
    outlineWidth: { default: 0, ':focus-visible': 2 },
    outlineStyle: 'solid',
    outlineColor: { default: 'transparent', ':focus-visible': tokens.accent },
    outlineOffset: 2,
  },
  ConfirmActionsBtnIsSecondary: {
    color: tokens.textDim,
    backgroundColor: { default: surfaces.panelRaised, ':hover': tokens.line },
    transform: { default: 'none', ':active': 'translateY(1px)' },
  },
  ConfirmActionsBtnIsDanger: {
    color: '#14111f',
    fontWeight: 700,
    backgroundColor: tokens.danger,
    filter: { default: 'none', ':hover': 'brightness(1.05)' },
    transform: { default: 'none', ':active': 'translateY(1px)' },
  },
});

type Phase = 'enter' | 'live' | 'exit';

type ColumnActionsProps = {
  dotColor: string;
  phase: Phase;
  deleting: boolean;
};

export function ColumnActions(props: ColumnActionsProps): JSX.Element {
  return (
    <>
      <button {...stylex.props(styles.Dot, styles.DotColor(props.dotColor))} />

      <div {...stylex.props(styles.Menu)}>
        <div {...stylex.props(styles.MenuItem)} data-highlighted>
          Rename
        </div>
        <div {...stylex.props(styles.MenuItem)}>Duplicate</div>
        <div {...stylex.props(styles.MenuSep)} />
        <div
          {...stylex.props(styles.MenuItem, styles.MenuItemIsDanger)}
          data-danger
        >
          Delete
        </div>
      </div>

      <div {...stylex.props(styles.Backdrop)} />
      <div {...stylex.props(styles.Confirm)} data-phase={props.phase}>
        <h3 {...stylex.props(styles.ConfirmTitle)}>Delete column?</h3>
        <p {...stylex.props(styles.ConfirmText)}>
          This removes the column and its stickies.
        </p>
        <div {...stylex.props(styles.ConfirmActions)}>
          <button
            {...stylex.props(styles.ConfirmActionsBtn, styles.ConfirmActionsBtnIsSecondary)}
          >
            Cancel
          </button>
          <button
            {...stylex.props(styles.ConfirmActionsBtn, styles.ConfirmActionsBtnIsDanger)}
            disabled={props.deleting}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
