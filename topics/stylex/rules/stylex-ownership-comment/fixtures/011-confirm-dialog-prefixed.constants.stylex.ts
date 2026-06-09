// Static one-off values for the confirm-dialog stress test. These are not
// themed, so defineConsts (inlined at build time) is correct here, not
// defineVars. Only named StyleX exports may live in a .stylex.ts file.
import * as stylex from '@stylexjs/stylex';

export const surfaces = stylex.defineConsts({
  panelRaised: '#232330',
  lineStrong: '#383848',
});

export const shadows = stylex.defineConsts({
  menu: '0 18px 48px rgba(0, 0, 0, 0.55)',
  dialog: '0 18px 48px rgba(0, 0, 0, 0.6)',
});
