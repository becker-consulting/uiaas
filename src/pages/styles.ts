// Inlined into a single <style> tag in Landing.tsx rather than served as a
// static asset — this is a one-page site, and inlining avoids adding a
// Workers Static Assets binding for one file. Revisit if the site grows
// past a single page.
//
// Dark, self-serious enterprise look on purpose (see the "Look and feel"
// note in CLAUDE.md) — this isn't a theme toggle, there's no light variant.
export const css = `
:root {
  --bg: #08080c;
  --bg-subtle: #0c0c12;
  --surface: #101018;
  --surface-hover: #16161f;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  --text: #f3f3f6;
  --text-muted: #9d9db0;
  --text-dim: #6c6c80;
  --brand: #7c6cff;
  --brand-bright: #a597ff;
  --brand-glow: rgba(124, 108, 255, 0.35);
  --accent: #f2c14e;
  --accent-dark: #1a1a2e;
  --success: #34d399;
  --radius: 14px;
  --font-display: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace;
  color-scheme: dark;
}

* { box-sizing: border-box; }

::selection { background: var(--brand-glow); color: #fff; }

:focus-visible { outline: 2px solid var(--brand-bright); outline-offset: 2px; }

body {
  margin: 0;
  background-color: var(--bg);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 48px 48px, 48px 48px;
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.6;
}

a { color: var(--brand-bright); }

.wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

nav.site {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: rgba(8, 8, 12, 0.75);
  border-bottom: 1px solid var(--border);
}

nav.site .wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
}

.logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--text);
}

/* Space Grotesk's cap I has no serif and reads as a lowercase l next to
   lowercase letters (UIaaS -> "UlaaS") — color+weight on "UI" alone breaks
   up the run instead of fighting the glyph shape. Shared by the nav
   wordmark and every inline "UIaaS" mention (the Brand component in
   Landing.tsx) so both read as one consistent treatment rather than two
   different fixes bolted on. */
.brand-ui { color: var(--brand-bright); font-weight: 700; }

.nav-links { display: flex; gap: 28px; align-items: center; }
.nav-links a:not(.btn) {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}
.nav-links a:not(.btn):hover { color: var(--text); }

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.92rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.btn:hover { transform: translateY(-1px); }

.btn-primary {
  background: linear-gradient(135deg, var(--brand-bright), var(--brand));
  color: #fff;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset, 0 8px 24px -8px var(--brand-glow);
}
.btn-primary:hover { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset, 0 12px 32px -8px var(--brand-glow); }

.btn-secondary {
  background: transparent;
  color: var(--text);
  border-color: var(--border-strong);
}
.btn-secondary:hover { border-color: var(--brand); background: rgba(124, 108, 255, 0.08); }

.btn-beg {
  background: linear-gradient(135deg, #ffd873, var(--accent));
  color: var(--accent-dark);
  font-weight: 700;
  box-shadow: 0 8px 24px -8px rgba(242, 193, 78, 0.5);
}
.btn-beg:hover { box-shadow: 0 12px 32px -8px rgba(242, 193, 78, 0.65); }

header.hero {
  position: relative;
  text-align: center;
  padding: 132px 0 56px;
  overflow: hidden;
}

header.hero::before {
  content: '';
  position: absolute;
  top: -260px;
  left: 50%;
  transform: translateX(-50%);
  width: 960px;
  height: 560px;
  background: radial-gradient(ellipse at center, var(--brand-glow), transparent 70%);
  filter: blur(20px);
  pointer-events: none;
}

header.hero > * { position: relative; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: rgba(255, 255, 255, 0.03);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 28px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.18);
}

.tagline {
  color: var(--brand-bright);
  font-family: var(--font-mono);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  margin: 0 0 18px;
}

h1.headline {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.25rem, 5.5vw, 3.75rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin: 0 0 22px;
}

p.sub-hero {
  color: var(--text-muted);
  font-size: 1.2rem;
  max-width: 560px;
  margin: 0 auto 40px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.divider {
  height: 1px;
  width: min(600px, 80%);
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
}

section.mission {
  text-align: center;
  padding: 48px 0;
}

section.mission p {
  max-width: 640px;
  margin: 0 auto;
  color: var(--text-muted);
  font-size: 1.05rem;
}

section.demo { padding: 64px 0; }

.demo-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 36px;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.demo-card h2 {
  font-family: var(--font-display);
  margin-top: 0;
  font-size: 1.4rem;
}

.demo-card > p { color: var(--text-muted); }

pre.fact-output {
  text-align: left;
  background: var(--bg);
  border: 1px solid var(--border);
  color: #c9c9f5;
  border-radius: 10px;
  padding: 18px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  min-height: 3em;
  margin-top: 24px;
}

section.pricing { padding: 64px 0 88px; text-align: center; }

section.pricing h2 { font-family: var(--font-display); font-size: 2.1rem; margin-bottom: 10px; }
section.pricing > .wrap > p { color: var(--text-muted); margin-bottom: 52px; }

.tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  text-align: left;
}

.tier {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s ease;
}
.tier:hover { border-color: var(--border-strong); }

.tier.featured {
  border-color: var(--brand);
  background: linear-gradient(180deg, rgba(124, 108, 255, 0.08), var(--surface) 40%);
  box-shadow: 0 0 0 1px var(--brand-glow), 0 16px 40px -16px var(--brand-glow);
  position: relative;
}

.tier .badge {
  align-self: flex-start;
  background: linear-gradient(135deg, var(--brand-bright), var(--brand));
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 14px;
}

.tier h3 { margin: 0 0 6px; font-size: 1.05rem; font-weight: 600; color: var(--text-muted); }
.tier .price {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  margin: 8px 0 6px;
}
/* Only an actual $-figure gets the tabular/mono treatment — "Contact
   sales" is a phrase, not a number, and looks off set in code font. */
.tier .price.price-numeric { font-family: var(--font-mono); font-size: 2rem; }
.tier .price span { font-size: 0.85rem; font-weight: 500; color: var(--text-dim); }
.tier .sla { color: var(--text-dim); font-size: 0.85rem; margin: 0 0 22px; }

.tier ul { list-style: none; padding: 0; margin: 0 0 26px; flex-grow: 1; }
.tier li { padding: 7px 0; font-size: 0.9rem; color: var(--text-muted); }
.tier li::before { content: '✓ '; color: var(--brand-bright); font-weight: 700; }

footer.site {
  background: var(--bg-subtle);
  border-top: 1px solid var(--border);
  padding: 48px 0;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.9rem;
}

footer.site .beg-footer { margin: 18px 0; }

/* The one real line in the footer — set apart from the in-character
   copyright line above it with its own divider, rather than blending into
   the joke copy's look. */
.built-by {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.82rem;
}
.built-by a {
  color: var(--text-muted);
  font-weight: 600;
  text-decoration: none;
}
.built-by a:hover { color: var(--brand-bright); }

/* Nav has four items (logo, Pricing, API, the CTA button) fighting for one
   row — "Sponsor an Endpoint" is long enough that something has to give
   before the CTA does. Secondary text links go first; the wordmark and the
   CTA are what actually matter at this width. */
@media (max-width: 480px) {
  .nav-links { gap: 12px; }
  .nav-links a:not(.btn) { display: none; }
}
`;
