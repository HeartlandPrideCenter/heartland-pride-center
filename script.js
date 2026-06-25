const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

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

  .rainbow-signature-strip {
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

  @media (max-width: 640px) {
    .brand img {
      width: 62px;
      height: 62px;
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
