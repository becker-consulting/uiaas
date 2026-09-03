import { css } from './styles';
import { faviconHref } from './favicon';
import { BUY_ME_A_COFFEE_URL, COMPANY_LOCATION, COMPANY_NAME, COMPANY_URL } from '../config';

// Client-side only: hits the live API and renders the response. Inlined as
// a string (not a separate asset) for the same one-page-site reason as
// styles.ts.
const demoScript = `
  const btn = document.getElementById('try-it-btn');
  const out = document.getElementById('fact-output');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Fetching pointless data…';
    out.hidden = false;
    try {
      const res = await fetch('/api/v1/fact');
      const data = await res.json();
      out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      out.textContent = 'Request failed. Even uselessness has standards.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get another useless fact';
    }
  });
`;

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    badge: null,
    sla: 'No card required.',
    features: ['3 useless facts/day*', 'Community support', 'Standard nonsense'],
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    badge: 'Most Popular',
    sla: 'Billed annually, because we believe in commitment.',
    features: ['Unlimited useless facts', 'Priority nonsense', 'Dedicated Slack channel (ours, not yours)'],
  },
  {
    name: 'Enterprise',
    price: 'Contact sales',
    period: '',
    badge: null,
    sla: '99.99% uptime for information you didn’t need.',
    features: [
      'Everything in Pro',
      'Custom SLA',
      'A named account executive who begs for money too',
      'Higher average Negative Usefulness Index than Free',
    ],
  },
] as const;

// "UIaaS" set in one weight reads as "UlaaS" in both fonts here (a plain
// sans cap I next to lowercase letters collapses into a lowercase l) — a
// lighter version of the nav logo's badge fix for inline body text: color
// and weight break up the run instead of leaning on the glyph shape.
function Brand() {
  return (
    <span>
      <span class="brand-ui">UI</span>aaS
    </span>
  );
}

function Hero() {
  return (
    <header class="hero">
      <span class="status-badge">
        <span class="status-dot" />
        ALL SYSTEMS OPERATIONAL
      </span>
      <h1 class="headline">What don&rsquo;t you need to know today?</h1>
      <p class="sub-hero">Enterprise-grade nonsense, delivered instantly.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#pricing">
          Get Started Free
        </a>
        <a class="btn btn-beg" href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer">
          Sponsor an Endpoint
        </a>
      </div>
    </header>
  );
}

function Mission() {
  return (
    <section class="mission">
      <div class="wrap">
        <p>
          <Brand /> exists to deliver information you did not ask for, will not remember, and cannot act on &mdash;
          reliably, at scale, with an SLA. We take that responsibility exactly as seriously as it deserves.
        </p>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section class="demo">
      <div class="wrap">
        <div class="demo-card">
          <h2>See it in action</h2>
          <p>One click. One fact. One Negative Usefulness Index&trade; score.</p>
          <button id="try-it-btn" class="btn btn-primary" type="button">
            Get a useless fact
          </button>
          <pre id="fact-output" class="fact-output" hidden></pre>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section class="pricing" id="pricing">
      <div class="wrap">
        <h2>Plans for every level of pointlessness.</h2>
        <p>Every tier hits the exact same endpoint. The only thing that scales is the invoice.</p>
        <div class="tiers">
          {PRICING_TIERS.map((tier) => (
            <div class={`tier${tier.badge ? ' featured' : ''}`}>
              {tier.badge && <span class="badge">{tier.badge}</span>}
              <h3>{tier.name}</h3>
              <div class={`price${tier.price.startsWith('$') ? ' price-numeric' : ''}`}>
                {tier.price}
                {tier.period && <span>{tier.period}</span>}
              </div>
              <p class="sla">{tier.sla}</p>
              <ul>
                {tier.features.map((feature) => (
                  <li>{feature}</li>
                ))}
              </ul>
              <a class="btn btn-secondary" href="#pricing">
                {tier.name === 'Enterprise' ? 'Contact sales' : 'Choose plan'}
              </a>
            </div>
          ))}
        </div>
        <p style="margin-top: 32px; font-weight: 600;">
          Every fact ships scored on our proprietary Negative Usefulness Index&trade; &mdash; the only metric in tech
          that goes down when the product improves.
        </p>
        <p style="margin-top: 8px; font-size: 0.8rem; color: var(--text-muted);">
          *Rate limit is advertised, not enforced. We&rsquo;re not going to check.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer class="site">
      <div class="wrap">
        <p class="tagline">Providing useless information since 2026.</p>
        <p>Trusted by absolutely no one.</p>
        <div class="beg-footer">
          <a class="btn btn-beg" href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer">
            Sponsor an Endpoint
          </a>
        </div>
        <p>
          &copy; 2026 <Brand />. All rights reserved (there is nothing worth stealing).
        </p>
        <p class="built-by">
          Built by{' '}
          <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer">
            {COMPANY_NAME}
          </a>{' '}
          ({COMPANY_LOCATION}).
        </p>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>UIaaS — Useless Information as a Service</title>
        <meta
          name="description"
          content="Enterprise-grade nonsense, delivered instantly. UIaaS provides random, entirely useless facts via a versioned API."
        />
        <meta name="theme-color" content="#08080c" />
        <link rel="icon" type="image/svg+xml" href={faviconHref} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <nav class="site">
          <div class="wrap">
            <a class="logo" href="/">
              <Brand />
            </a>
            <div class="nav-links">
              <a href="#pricing">Pricing</a>
              <a href="/docs">API</a>
              <a class="btn btn-beg" href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noopener noreferrer">
                Sponsor an Endpoint
              </a>
            </div>
          </div>
        </nav>
        <Hero />
        <div class="divider" />
        <Mission />
        <div class="divider" />
        <Demo />
        <Pricing />
        <Footer />
        <script dangerouslySetInnerHTML={{ __html: demoScript }} />
      </body>
    </html>
  );
}
