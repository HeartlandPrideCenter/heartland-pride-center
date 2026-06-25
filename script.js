const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const givebutterUrl = 'https://givebutter.com/building-heartland-pride-center-aavkix';

if (navLinks) {
  const navItems = [
    ['about.html', 'About'],
    ['programs.html', 'Programs'],
    ['resources.html', 'Resources'],
    ['crisis.html', 'Crisis'],
    ['partners.html', 'Partners'],
    ['volunteer.html', 'Get Involved'],
    ['support.html', 'Support HPC'],
    ['contact.html', 'Contact']
  ];

  navItems.forEach(([href, label]) => {
    const exists = Array.from(navLinks.querySelectorAll('a')).some((link) => link.getAttribute('href') === href);
    if (!exists) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;

      const contactLink = navLinks.querySelector('a[href="contact.html"]');
      if (href === 'support.html' && contactLink) {
        navLinks.insertBefore(link, contactLink);
      } else {
        navLinks.appendChild(link);
      }
    }
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const footer = document.querySelector('footer');
if (footer) {
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-rainbow" aria-hidden="true"></div>
    <div class="footer-grid">
      <div class="footer-brand">
        <h2>Heartland Pride Center</h2>
        <p class="footer-tagline">Real people helping real people.</p>
        <p>Building an affirming LGBTQ+ community resource hub for Polk County and Florida's Heartland.</p>
      </div>
      <div>
        <h3>Explore</h3>
        <a href="about.html">About</a>
        <a href="programs.html">Programs & Services</a>
        <a href="resources.html">Resource Directory</a>
        <a href="crisis.html">Crisis & Immediate Support</a>
        <a href="support.html">Support HPC</a>
      </div>
      <div>
        <h3>Get Involved</h3>
        <a href="volunteer.html">Volunteer</a>
        <a href="partners.html">Partner With Us</a>
        <a href="resources.html">Join the Resource Network</a>
        <a href="contact.html">Contact HPC</a>
        <a href="${givebutterUrl}" target="_blank" rel="noopener">Givebutter</a>
      </div>
      <div>
        <h3>Connect</h3>
        <a href="mailto:info@heartlandpridecenter.org">info@heartlandpridecenter.org</a>
        <a href="https://www.facebook.com/people/Heartland-Pride-Center/61577565114125/" target="_blank" rel="noopener">Facebook</a>
        <a href="https://www.instagram.com/heartlandpridecenter/" target="_blank" rel="noopener">Instagram</a>
        <a href="crisis.html">Need immediate support?</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Heartland Pride Center, Inc. A Florida nonprofit organization.</p>
      <p>Serving Polk County and the Central Florida Heartland.</p>
    </div>
  `;
}

const givebutterButtons = document.querySelectorAll('a[href="#givebutter-link-needed"]');
givebutterButtons.forEach((button) => {
  button.href = givebutterUrl;
  button.target = '_blank';
  button.rel = 'noopener';
  button.textContent = 'Support Through Givebutter';
});

const brandPolish = document.createElement('style');
brandPolish.textContent = `
  .site-header {
    overflow: visible;
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .site-header::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 4px;
    background: linear-gradient(90deg,#e63946,#f4a261,#e9c46a,#2ecc71,#3a86ff,#9b5de5);
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.18);
  }

  .brand {
    overflow: visible;
  }

  .brand img {
    width: 74px;
    height: 74px;
    object-fit: contain;
    object-position: center;
    overflow: visible;
  }

  .nav-links {
    gap: clamp(12px, 1.7vw, 24px);
  }

  .nav-links a {
    white-space: nowrap;
  }

  .rainbow-signature-strip,
  .footer-rainbow {
    width: min(1180px, 88vw);
    height: 5px;
    margin: 0 auto;
    border-radius: 999px;
    background: linear-gradient(90deg,#e63946,#f4a261,#e9c46a,#2ecc71,#3a86ff,#9b5de5);
    box-shadow: 0 0 28px rgba(212, 175, 55, 0.2);
  }

  .subtle-link {
    display: inline-block;
    margin-top: 10px;
    color: var(--gold-light);
    font-weight: 950;
    font-size: 0.82rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .section-heading,
  .pathways,
  .belonging-statement {
    width: min(1180px, 88vw);
    margin: 0 auto;
  }

  .pathways {
    padding: 72px 0 40px;
  }

  .section-heading {
    width: 100%;
    max-width: 860px;
    margin: 0 0 30px;
  }

  .section-heading h2,
  .belonging-statement h2 {
    font-family: "Cinzel", serif;
    font-size: clamp(2.3rem, 4.4vw, 5rem);
    line-height: 1.02;
    letter-spacing: -0.04em;
    margin-bottom: 18px;
  }

  .section-heading p,
  .belonging-statement p {
    color: var(--muted);
    font-size: 1.05rem;
    line-height: 1.8;
  }

  .pathway-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .pathway-card {
    min-height: 260px;
    padding: 30px;
    border: 1px solid rgba(245, 241, 232, 0.14);
    border-radius: 30px;
    background: linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035));
    box-shadow: 0 22px 70px rgba(0,0,0,0.18);
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .pathway-card:hover {
    transform: translateY(-4px);
    border-color: rgba(239, 205, 114, 0.46);
  }

  .pathway-card span {
    font-size: 2rem;
  }

  .pathway-card h3 {
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .pathway-card p {
    color: rgba(245, 241, 232, 0.74);
    line-height: 1.65;
    font-size: 0.96rem;
  }

  .find-here {
    padding-top: 30px;
  }

  .belonging-statement {
    margin-top: 18px;
    margin-bottom: 24px;
    padding: 54px;
    border: 1px solid rgba(212, 175, 55, 0.24);
    border-radius: 34px;
    background: linear-gradient(145deg, rgba(212, 175, 55, 0.10), rgba(255,255,255,0.045));
    box-shadow: var(--shadow);
  }

  .site-footer {
    position: relative;
    z-index: 2;
    display: block;
    padding: 0 6vw 34px;
    border-top: 1px solid rgba(245, 241, 232, 0.12);
    background: rgba(6, 19, 35, 0.42);
  }

  .site-footer .footer-rainbow {
    width: 100%;
    margin: 0 0 34px;
    border-radius: 0 0 999px 999px;
  }

  .footer-grid {
    width: min(1180px, 88vw);
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.35fr 0.8fr 0.8fr 0.9fr;
    gap: 34px;
  }

  .footer-brand h2 {
    font-family: "Cinzel", serif;
    font-size: clamp(1.6rem, 2.4vw, 2.8rem);
    line-height: 1.04;
    margin-bottom: 14px;
  }

  .footer-tagline {
    color: var(--gold-light) !important;
    font-weight: 950;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .site-footer h3 {
    color: var(--gold-light);
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .site-footer p,
  .site-footer a {
    color: rgba(245, 241, 232, 0.72);
    font-size: 0.96rem;
    line-height: 1.7;
  }

  .site-footer a {
    display: block;
    margin-bottom: 10px;
    transition: color 0.2s ease;
  }

  .site-footer a:hover {
    color: var(--gold-light);
  }

  .footer-bottom {
    width: min(1180px, 88vw);
    margin: 32px auto 0;
    padding-top: 22px;
    border-top: 1px solid rgba(245, 241, 232, 0.12);
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .footer-bottom p {
    font-size: 0.84rem;
    color: rgba(245, 241, 232, 0.58);
  }

  @media (max-width: 980px) {
    .pathway-grid,
    .footer-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .brand img {
      width: 62px;
      height: 62px;
    }

    .pathways,
    .belonging-statement {
      width: min(92vw, 1180px);
    }

    .pathways {
      padding-top: 54px;
    }

    .pathway-grid,
    .footer-grid {
      grid-template-columns: 1fr;
      width: min(92vw, 1180px);
    }

    .pathway-card {
      min-height: auto;
      padding: 26px;
    }

    .belonging-statement {
      padding: 30px;
    }

    .footer-bottom {
      width: min(92vw, 1180px);
    }
  }
`;
document.head.appendChild(brandPolish);

const hero = document.querySelector('.hero');
if (hero && !document.querySelector('.rainbow-signature-strip')) {
  const strip = document.createElement('div');
  strip.className = 'rainbow-signature-strip';
  strip.setAttribute('aria-hidden', 'true');
  hero.insertAdjacentElement('afterend', strip);
}
