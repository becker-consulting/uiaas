// Inlined into a single <style> tag in Layout.tsx rather than served as a
// static asset — this is a one-page site, and inlining avoids adding a
// Workers Static Assets binding for one file. Revisit if the site grows
// past a single page.
export const css = `
:root {
  --bg: #f7f7fb;
  --surface: #ffffff;
  --border: #e3e3ec;
  --text: #1a1a2e;
  --text-muted: #5c5c72;
  --brand: #4f46e5;
  --brand-dark: #4338ca;
  --accent: #f59e0b;
  --radius: 12px;
  color-scheme: light;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
}

a { color: var(--brand); }

.wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

nav.site {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.logo {
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--text);
}

.nav-links { display: flex; gap: 24px; align-items: center; }
.nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.95rem; }
.nav-links a:hover { color: var(--text); }

.btn {
  display: inline-block;
  padding: 12px 22px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary { background: var(--brand); color: #fff; }
.btn-primary:hover { background: var(--brand-dark); }

.btn-secondary { background: var(--surface); color: var(--text); border-color: var(--border); }
.btn-secondary:hover { border-color: var(--brand); }

.btn-beg {
  background: var(--accent);
  color: #1a1a2e;
  font-weight: 700;
}
.btn-beg:hover { filter: brightness(0.95); }

header.hero {
  text-align: center;
  padding: 80px 0 56px;
}

.tagline {
  color: var(--brand);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  margin: 0 0 16px;
}

h1.headline {
  font-size: clamp(2rem, 5vw, 3.25rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
}

p.sub-hero {
  color: var(--text-muted);
  font-size: 1.15rem;
  max-width: 560px;
  margin: 0 auto 36px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

section.mission {
  text-align: center;
  padding: 8px 0 64px;
}

section.mission p {
  max-width: 620px;
  margin: 0 auto;
  color: var(--text-muted);
}

section.demo {
  padding: 40px 0 72px;
}

.demo-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.demo-card h2 { margin-top: 0; }

pre.fact-output {
  text-align: left;
  background: #0f0f1a;
  color: #d4d4f0;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-size: 0.85rem;
  min-height: 3em;
  margin-top: 20px;
}

section.pricing { padding: 40px 0 80px; text-align: center; }

section.pricing h2 { font-size: 2rem; margin-bottom: 8px; }
section.pricing > .wrap > p { color: var(--text-muted); margin-bottom: 48px; }

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
}

.tier.featured {
  border-color: var(--brand);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
  position: relative;
}

.tier .badge {
  align-self: flex-start;
  background: var(--brand);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.tier h3 { margin: 0 0 4px; font-size: 1.1rem; }
.tier .price { font-size: 2rem; font-weight: 800; margin: 8px 0 4px; }
.tier .price span { font-size: 0.9rem; font-weight: 500; color: var(--text-muted); }
.tier .sla { color: var(--text-muted); font-size: 0.85rem; margin: 0 0 20px; }

.tier ul { list-style: none; padding: 0; margin: 0 0 24px; flex-grow: 1; }
.tier li { padding: 6px 0; font-size: 0.9rem; color: var(--text-muted); }
.tier li::before { content: '✓ '; color: var(--brand); font-weight: 700; }

footer.site {
  border-top: 1px solid var(--border);
  padding: 40px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

footer.site .beg-footer { margin: 16px 0; }
`;
