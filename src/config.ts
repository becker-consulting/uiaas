/**
 * Buy Me a Coffee handle for the "Sponsor an Endpoint" button — buymeacoffee.com/<handle>.
 * Everything that needs to link to it reads from here, so that's the only
 * place that needs to change if it's ever renamed.
 */
export const BUY_ME_A_COFFEE_HANDLE = 'handiman';

export const BUY_ME_A_COFFEE_URL = `https://buymeacoffee.com/${BUY_ME_A_COFFEE_HANDLE}`;

/**
 * The one genuinely real thing on this page — a "Built by" credit in the
 * footer, since this project is meant to be shown off (CV, LinkedIn). Not
 * part of the UIaaS parody, so it's deliberately styled distinctly from it
 * in Landing.tsx rather than reusing the joke copyright line's look.
 */
export const COMPANY_NAME = 'Becker Solutions';
export const COMPANY_URL = 'https://www.henrikbecker.net';
// There's at least one other "Becker Solutions" out there (Germany) —
// disambiguated in the footer credit so it's clearly not that one.
export const COMPANY_LOCATION = 'Sweden';

/**
 * The real production origin — single source of truth for every
 * absolute-URL SEO tag (canonical, og:url, og:image, twitter:image) in
 * Landing.tsx. Those need to be absolute (a relative URL doesn't work for
 * a social-preview crawler fetching og:image as its own HTTP request), and
 * this app is reachable at both this custom domain and *.workers.dev — this
 * is the one wrangler.jsonc's routes declares canonical, so it's the one
 * used here too.
 */
export const SITE_URL = 'https://uiaas.becker-consulting.se';
