/**
 * Buy Me a Coffee handle for the "Beg for money" button — buymeacoffee.com/<handle>.
 *
 * No account exists yet. Once one does, replace this with the real handle;
 * everything that needs to link to it reads from here, so that's the only
 * place that needs to change.
 */
export const BUY_ME_A_COFFEE_HANDLE = 'REPLACE_WITH_HANDLE';

/** True once a real handle has been dropped in above. */
export const BUY_ME_A_COFFEE_CONFIGURED = BUY_ME_A_COFFEE_HANDLE !== 'REPLACE_WITH_HANDLE';

export const BUY_ME_A_COFFEE_URL = BUY_ME_A_COFFEE_CONFIGURED
  ? `https://buymeacoffee.com/${BUY_ME_A_COFFEE_HANDLE}`
  : 'https://buymeacoffee.com/';
