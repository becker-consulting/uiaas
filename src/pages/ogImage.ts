import { SITE_URL } from '../config';

// The card social platforms (LinkedIn, X, Slack, ...) render when this
// site's link is shared — the whole point of adding it is that this
// project is meant to be shown off (CV, LinkedIn), so what a shared link
// actually looks like matters. 1200x630 is the de facto standard og:image
// size. System sans-serif rather than the site's own Space Grotesk/Inter —
// a social crawler rasterizes this without fetching Google Fonts, so a
// web font here would silently fall back anyway; safer to design for the
// fallback directly than assume it renders how it looks in a browser tab.
//
// Served as SVG (GET /og-image.svg, src/index.tsx), not converted to PNG —
// most current crawlers (LinkedIn, Slack, Discord) render SVG og:image
// fine. X/Twitter's has historically been pickier about non-raster
// preview images; if a Twitter Card ever needs pixel-perfect fidelity,
// rasterizing this (e.g. via resvg-wasm) is the next step, not a rewrite.
const host = new URL(SITE_URL).host;

export const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#7c6cff" stop-opacity="0.4" />
      <stop offset="70%" stop-color="#7c6cff" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#08080c" />
  <rect width="1200" height="630" fill="url(#glow)" />

  <rect x="435" y="150" width="330" height="42" rx="21" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.16)" />
  <circle cx="463" cy="171" r="5" fill="#34d399" />
  <text x="480" y="176" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="2.2" fill="#9d9db0">ALL SYSTEMS OPERATIONAL</text>

  <text x="600" y="356" font-family="Arial, Helvetica, sans-serif" font-size="128" font-weight="800" fill="#f3f3f6" text-anchor="middle"><tspan fill="#a597ff">UI</tspan>aaS</text>

  <text x="600" y="424" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="400" fill="#b9b9c8" text-anchor="middle">Enterprise-grade nonsense, delivered instantly.</text>

  <text x="600" y="486" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" letter-spacing="1" fill="#6c6c80" text-anchor="middle">GET /api/v1/fact &#183; ${host}</text>
</svg>
`;
