// A rounded-square "UI" monogram in the brand gradient — the boxed-badge
// treatment that used to be the nav logo (see CLAUDE.md "Look and feel" for
// why that got dropped from the nav itself). Makes sense here specifically:
// a favicon is a small standalone icon, not a wordmark sharing a line with
// running text, so the ambiguity a box solves for isn't even in play — this
// isn't the same fix reapplied, just a shape that happens to suit both jobs.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a597ff" />
      <stop offset="1" stop-color="#7c6cff" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)" />
  <text x="32" y="43" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="30" fill="#ffffff" text-anchor="middle">UI</text>
</svg>`;

export const faviconHref = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
