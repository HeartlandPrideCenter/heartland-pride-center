const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const givebutterUrl = 'https://givebutter.com/building-heartland-pride-center-aavkix';
const analyticsId = 'G-4XMZECLXQC';

// Google Analytics 4
if (analyticsId && !document.querySelector(`script[src*="${analyticsId}"]`)) {
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', analyticsId);
}

if (window.location.pathname.includes('privacy')) {
  document.body.classList.add('privacy-page');
}

if (navLinks) {
  const navItems = [
    ['index.html', 'Home'],
    ['about.html', 'About'],
    ['programs.html', 'Programs'],
    ['resources.html', 'Resources'],
    ['crisis.html', 'Crisis'],
    ['partners.html', 'Partners'],
    ['volunteer.html', 'Get Involved'],
    ['contact.html', 'Contact'],
    ['support.html', 'Donate']
  ];

  navLinks.innerHTML = '';
  navItems.forEach(([href, label]) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    navLinks.appendChild(link);
  });
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', isOpen);
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

const footer = document.querySelector('footer');
if (footer) {
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="footer-rainbow" aria-hidden="true"></div><div class="footer-grid"><div class="footer-brand"><h2>Heartland Pride Center</h2><p class="footer-tagline">Real people helping real people.</p><p>Building an affirming LGBTQ+ community resource hub for Polk County and Florida's Heartland.</p></div><div><h3>Explore</h3><a href="index.html">Home</a><a href="about.html">About</a><a href="programs.html">Programs & Services</a><a href="resources.html">Resource Directory</a><a href="crisis.html">Crisis & Immediate Support</a><a href="support.html">Donate</a></div><div><h3>Get Involved</h3><a href="volunteer.html">Volunteer</a><a href="partners.html">Partner With Us</a><a href="resources.html">Join the Resource Network</a><a href="contact.html">Contact HPC</a><a href="${givebutterUrl}" target="_blank" rel="noopener">Givebutter</a></div><div><h3>Connect</h3><a href="mailto:info@heartlandpridecenter.org">info@heartlandpridecenter.org</a><a href="https://www.facebook.com/people/Heartland-Pride-Center/61577565114125/" target="_blank" rel="noopener">Facebook</a><a href="https://www.instagram.com/heartlandpridecenter/" target="_blank" rel="noopener">Instagram</a><a href="crisis.html">Need immediate support?</a><a href="privacy.html">Privacy</a></div></div><div class="footer-bottom"><p>© 2026 Heartland Pride Center, Inc. A Florida nonprofit organization.</p><p>Serving Polk County and the Central Florida Heartland.</p></div>`;
}

const givebutterButtons = document.querySelectorAll('a[href="#givebutter-link-needed"]');
givebutterButtons.forEach((button) => {
  button.href = givebutterUrl;
  button.target = '_blank';
  button.rel = 'noopener';
  button.textContent = 'Support Through Givebutter';
  const note = button.closest('.form-actions')?.querySelector('.privacy-line');
  if (note) note.textContent = 'Your support helps expand outreach, strengthen community partnerships, improve access to affirming resources, and build a more connected Heartland.';
});

const brandPolish = document.createElement('style');
brandPolish.textContent = `
  .site-header{overflow:visible;padding-top:18px;padding-bottom:18px}.site-header::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:4px;background:linear-gradient(90deg,#e63946,#f4a261,#e9c46a,#2ecc71,#3a86ff,#9b5de5);box-shadow:0 0 18px rgba(212,175,55,.18)}.brand{overflow:visible}.brand img{width:74px;height:74px;object-fit:contain;object-position:center;overflow:visible}.nav-links{gap:clamp(12px,1.7vw,24px)}.nav-links a{white-space:nowrap}.nav-links a[href="support.html"]{color:#081523;background:linear-gradient(135deg,var(--gold),var(--gold-light));padding:10px 16px;border-radius:999px;box-shadow:0 12px 38px rgba(212,175,55,.18)}
  .rainbow-signature-strip,.footer-rainbow{position:relative;width:min(1180px,88vw);height:5px;margin:0 auto;border-radius:999px;background:linear-gradient(90deg,#e63946,#f4a261,#e9c46a,#2ecc71,#3a86ff,#9b5de5);box-shadow:0 0 28px rgba(212,175,55,.2)}.rainbow-signature-strip::after,.footer-rainbow::after{content:"♥";position:absolute;left:50%;top:50%;transform:translate(-50%,-48%);display:grid;place-items:center;width:34px;height:34px;border-radius:999px;color:#081523;background:linear-gradient(135deg,var(--gold),var(--gold-light));font-size:18px;font-weight:900;box-shadow:0 0 28px rgba(239,205,114,.35)}
  .heartbeat-hero{grid-template-columns:1.02fr .78fr;align-items:center}.hero-photo-card{margin:0;border:1px solid rgba(245,241,232,.14);border-radius:30px;background:rgba(255,255,255,.055);box-shadow:var(--shadow);overflow:hidden;align-self:stretch;min-height:420px;max-height:540px;display:flex;flex-direction:column}.hero-photo-card img{width:100%;height:100%;min-height:0;flex:1;object-fit:cover;object-position:center}.hero-photo-card figcaption{padding:16px 20px;color:rgba(245,241,232,.78);font-size:.82rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase;background:rgba(6,19,35,.78)}
  .section-heading,.pathways,.belonging-statement{width:min(1180px,88vw);margin:0 auto}.pathways{padding:72px 0 40px}.section-heading{width:100%;max-width:860px;margin:0 0 30px}.section-heading h2,.belonging-statement h2{font-family:"Inter",sans-serif;font-size:clamp(2.2rem,4vw,4.6rem);line-height:1.1;letter-spacing:-.035em;margin-bottom:18px}.section-heading p,.belonging-statement p{color:var(--muted);font-size:1.05rem;line-height:1.8}.pathway-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.pathway-card{min-height:260px;padding:30px;border:1px solid rgba(245,241,232,.14);border-radius:30px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));box-shadow:0 22px 70px rgba(0,0,0,.18);backdrop-filter:blur(18px);display:flex;flex-direction:column;gap:14px;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.pathway-card:hover{transform:translateY(-4px);border-color:rgba(239,205,114,.46)}.pathway-card span{font-size:2rem}.pathway-card h3{font-size:1rem;letter-spacing:.08em;text-transform:uppercase}.pathway-card p{color:rgba(245,241,232,.74);line-height:1.65;font-size:.96rem}.find-here{padding-top:30px}.belonging-statement{margin-top:18px;margin-bottom:24px;padding:54px;border:1px solid rgba(212,175,55,.24);border-radius:34px;background:linear-gradient(145deg,rgba(212,175,55,.10),rgba(255,255,255,.045));box-shadow:var(--shadow)}
  .photo-band,.community-photo-block{width:min(1180px,88vw);margin:24px auto;border:1px solid rgba(245,241,232,.14);border-radius:34px;background:rgba(255,255,255,.055);box-shadow:var(--shadow);overflow:hidden}.photo-band{display:grid;grid-template-columns:.9fr 1.1fr;align-items:center;min-height:230px}.photo-band img{width:100%;height:260px;object-fit:cover}.photo-band div,.community-photo-block div{padding:36px}.photo-band h2,.community-photo-block h2{font-family:"Inter",sans-serif;font-size:clamp(1.8rem,2.8vw,3.2rem);font-weight:760;line-height:1.12;letter-spacing:-.035em}.community-photo-block{display:grid;grid-template-columns:1fr .9fr;align-items:center}.community-photo-block p{color:var(--muted);line-height:1.8;margin-top:18px}.community-photo-block img{width:100%;height:360px;object-fit:cover}.volunteer-visual-hero{display:grid;grid-template-columns:1fr .78fr;gap:34px;align-items:center}.volunteer-visual-hero img{display:block;width:100%;max-height:420px;object-fit:cover;border-radius:30px;border:1px solid rgba(245,241,232,.14);box-shadow:var(--shadow)}
  main{padding-bottom:clamp(58px,7vw,110px)}.site-footer{position:relative;z-index:2;display:block;margin-top:clamp(46px,7vw,96px);padding:0 6vw 34px;border-top:1px solid rgba(245,241,232,.12);background:rgba(6,19,35,.42)}.site-footer .footer-rainbow{width:100%;margin:0 0 34px;border-radius:0 0 999px 999px}.footer-grid{width:min(1180px,88vw);margin:0 auto;display:grid;grid-template-columns:1.35fr .8fr .8fr .9fr;gap:34px}.footer-brand h2{font-family:"Inter",sans-serif;font-weight:760;font-size:clamp(1.6rem,2.4vw,2.8rem);line-height:1.1;margin-bottom:14px}.footer-tagline{color:var(--gold-light)!important;font-weight:850;letter-spacing:.08em;text-transform:uppercase}.site-footer h3{color:var(--gold-light);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px}.site-footer p,.site-footer a{color:rgba(245,241,232,.72);font-size:.96rem;line-height:1.7}.site-footer a{display:block;margin-bottom:10px;transition:color .2s ease;overflow-wrap:anywhere}.site-footer a:hover{color:var(--gold-light)}.footer-bottom{width:min(1180px,88vw);margin:32px auto 0;padding-top:22px;border-top:1px solid rgba(245,241,232,.12);display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}.footer-bottom p{font-size:.84rem;color:rgba(245,241,232,.58)}.contact-box a{max-width:100%;overflow-wrap:anywhere;word-break:break-word;line-height:1.25}
  .privacy-page .page-hero{padding-top:clamp(108px,10vw,156px)!important}.privacy-page .page-hero .eyebrow{margin-bottom:22px!important;display:block!important}
  @media(max-width:980px){.heartbeat-hero,.photo-band,.community-photo-block,.volunteer-visual-hero{grid-template-columns:1fr}.pathway-grid,.footer-grid{grid-template-columns:1fr 1fr}.hero-photo-card{min-height:330px;max-height:none}.photo-band img,.community-photo-block img{height:280px}.nav-links{background:rgba(6,19,35,.985)!important;border-radius:30px!important;padding:28px 32px!important;box-shadow:0 30px 90px rgba(0,0,0,.55)!important;backdrop-filter:blur(24px)}.nav-links a[href="support.html"]{width:max-content}body.menu-open::after{content:"";position:fixed;inset:0;z-index:40;background:rgba(3,10,19,.58);backdrop-filter:blur(2px);pointer-events:none}.site-header{z-index:60}.nav-links.is-open{z-index:70;animation:hpcMenuIn .18s ease-out}@keyframes hpcMenuIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}.menu-toggle.is-open span:nth-child(1){transform:translateY(8px) rotate(45deg)}.menu-toggle.is-open span:nth-child(2){opacity:0}.menu-toggle.is-open span:nth-child(3){transform:translateY(-8px) rotate(-45deg)}}
  @media(max-width:640px){.brand img{width:62px;height:62px}.heartbeat-hero{display:block!important}.hero h1{font-size:clamp(2.2rem,9.2vw,2.75rem)!important;line-height:1.12!important;letter-spacing:-.035em!important;max-width:100%;overflow-wrap:normal}.hero-copy{max-width:100%;min-width:0}.hero{padding-left:28px!important;padding-right:28px!important;overflow:hidden}.heartbeat-hero .actions{position:relative!important;z-index:2;margin:22px 0 24px!important}.heartbeat-hero .btn.secondary{display:none!important}.intro{max-width:100%;overflow-wrap:break-word}.hero-photo-card{width:100%!important;min-height:0!important;height:auto!important;max-height:none!important;margin:0!important;border-radius:24px!important;display:block!important}.hero-photo-card img{display:block;width:100%!important;height:260px!important;object-fit:cover!important;object-position:center 34%!important;flex:none!important}.hero-photo-card figcaption{font-size:.72rem!important;line-height:1.35!important;padding:12px 14px!important}.pathways,.belonging-statement,.photo-band,.community-photo-block{width:min(92vw,1180px)}.pathways{padding-top:54px}.pathway-grid,.footer-grid{grid-template-columns:1fr;width:min(92vw,1180px)}.pathway-card{min-height:auto;padding:26px}.belonging-statement,.photo-band div,.community-photo-block div{padding:30px}.photo-band img,.community-photo-block img{height:230px}.volunteer-visual-hero{display:block!important}.volunteer-visual-hero img{display:block!important;width:100%!important;height:240px!important;max-height:240px!important;object-fit:cover!important;object-position:center!important;margin-top:24px!important}.footer-bottom{width:min(92vw,1180px)}}
`;
document.head.appendChild(brandPolish);

const launchPolish = document.createElement('style');
launchPolish.textContent = `
  .hero-copy > .eyebrow:first-child{display:none!important}
  h1,.page-hero h1,.hero h1{font-family:"Inter",sans-serif!important;font-weight:760!important;letter-spacing:-.038em!important;line-height:1.12!important;text-transform:none!important}
  .section-heading h2,.belonging-statement h2,.photo-band h2,.community-photo-block h2,.partners h2,.hub h2,.callout h2,.intake-form h2,.footer-brand h2{font-family:"Inter",sans-serif!important;font-weight:750!important;letter-spacing:-.032em!important;line-height:1.14!important;text-transform:none!important}
  .hero h1{max-width:980px}
  .pathway-card,.cards article,.page-card,.hub-list div,.partners,.belonging-statement,.contact-box{position:relative;isolation:isolate;overflow:visible}
  .pathway-card::before,.cards article::before,.page-card::before,.hub-list div::before,.partners::before,.belonging-statement::before{content:"";position:absolute;inset:12px;border-radius:inherit;background:radial-gradient(circle at 50% 110%,rgba(239,205,114,.20),rgba(239,205,114,.08) 34%,transparent 72%);filter:blur(24px);opacity:.42;z-index:-1;pointer-events:none;transition:opacity .2s ease,transform .2s ease}
  .pathway-card:hover::before,.cards article:hover::before,.page-card:hover::before,.hub-list div:hover::before{opacity:.68;transform:translateY(4px)}
  .btn,.pathway-card,.cards article,.page-card,.hub-list div,.contact-box,.photo-band,.community-photo-block,.hero-photo-card,.volunteer-visual-hero img{transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease,opacity .18s ease}
  .btn:hover,.pathway-card:hover,.cards article:hover,.page-card:hover,.hub-list div:hover{transform:translateY(-3px);border-color:rgba(239,205,114,.42)!important;box-shadow:0 24px 76px rgba(0,0,0,.26),0 0 42px rgba(212,175,55,.10)}
  .pathway-card::after{content:"Get started →";margin-top:auto;color:var(--gold-light);font-size:.78rem;font-weight:850;letter-spacing:.1em;text-transform:uppercase}
  a:focus-visible,button:focus-visible{outline:3px solid rgba(239,205,114,.85);outline-offset:4px;border-radius:14px}
  @media(max-width:640px){.hero h1{font-size:clamp(2.15rem,8.8vw,2.65rem)!important;letter-spacing:-.032em!important;line-height:1.12!important}.section-heading h2,.belonging-statement h2,.photo-band h2,.community-photo-block h2{font-size:clamp(1.85rem,7.4vw,2.45rem)!important;letter-spacing:-.028em!important}}
`;
document.head.appendChild(launchPolish);

const hero = document.querySelector('.hero');
if (hero && !document.querySelector('.rainbow-signature-strip')) {
  const strip = document.createElement('div');
  strip.className = 'rainbow-signature-strip';
  strip.setAttribute('aria-hidden', 'true');
  hero.insertAdjacentElement('afterend', strip);
}
