(() => {
  function setupApplicationModal() {
    const section = document.getElementById('join-network');
    const form = document.getElementById('landOfHeartsForm');
    if (!section || !form || document.getElementById('lohApplicationShell')) return;

    const shell = document.createElement('div');
    shell.id = 'lohApplicationShell';
    shell.className = 'loh-application-shell';
    shell.innerHTML = '<div class="loh-application-panel"><button class="loh-application-close" type="button" aria-label="Close application">×</button><div id="lohApplicationMount"></div></div>';
    document.body.appendChild(shell);

    const mount = document.getElementById('lohApplicationMount');
    mount.appendChild(section);
    section.classList.add('loh-application-in-modal');

    const openBlock = document.createElement('section');
    openBlock.className = 'loh-application-cta';
    openBlock.innerHTML = '<p class="eyebrow">Join the Network</p><h2>Become part of the Land of Hearts.</h2><p>Ready to add your business to the growing network of affirming places across Florida\'s Heartland?</p><button class="btn primary" type="button" id="openLandApplication">❤️ Become Part of the Land of Hearts</button>';
    document.querySelector('.business-directory')?.after(openBlock);

    function openModal(event) {
      if (event) event.preventDefault();
      shell.classList.add('open');
      document.body.classList.add('modal-open');
      setTimeout(() => document.getElementById('lohBusinessName')?.focus(), 120);
    }

    function closeModal() {
      shell.classList.remove('open');
      document.body.classList.remove('modal-open');
    }

    document.getElementById('openLandApplication')?.addEventListener('click', openModal);
    document.querySelectorAll('a[href="#join-network"]').forEach(link => link.addEventListener('click', openModal));
    shell.querySelector('.loh-application-close').addEventListener('click', closeModal);
    shell.addEventListener('click', event => { if (event.target === shell) closeModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && shell.classList.contains('open')) closeModal(); });
  }

  const style = document.createElement('style');
  style.textContent = `
    body.modal-open{overflow:hidden}
    .loh-application-cta{max-width:1100px;margin:42px auto 0;padding:32px;border:1px solid rgba(239,205,114,.24);border-radius:28px;background:linear-gradient(135deg,rgba(212,175,55,.12),rgba(6,19,35,.72));text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.18)}
    .loh-application-cta h2{margin:8px 0 10px}.loh-application-cta p:not(.eyebrow){max-width:680px;margin:0 auto 18px;color:rgba(245,241,232,.75);line-height:1.65}
    .loh-application-shell{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(3,10,19,.74);backdrop-filter:blur(9px);padding:22px}
    .loh-application-shell.open{display:flex}.loh-application-panel{position:relative;width:min(980px,97vw);max-height:90vh;overflow:auto;border:1px solid rgba(239,205,114,.3);border-radius:32px;background:#081523;color:#f5f1e8;box-shadow:0 30px 120px rgba(0,0,0,.52);padding:24px}.loh-application-close{position:sticky;top:0;float:right;z-index:3;width:42px;height:42px;border-radius:999px;border:1px solid rgba(245,241,232,.16);background:rgba(255,255,255,.08);color:#fff;font-size:26px}.loh-application-in-modal{margin:0!important;padding:8px 4px 4px!important;border:0!important;background:transparent!important;box-shadow:none!important}.loh-application-in-modal .form-note{max-width:760px}.loh-application-in-modal .form-grid{margin-top:18px}@media(max-width:760px){.loh-application-shell{align-items:stretch;padding:0}.loh-application-panel{width:100vw;max-height:100vh;border-radius:0;padding:18px}.loh-application-close{right:0}.loh-application-cta{margin:28px 16px 0;padding:26px 18px}}
    .loh-heart-animation{background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.028))!important;border-color:rgba(239,205,114,.28)!important}.loh-heart-animation::before{background:radial-gradient(circle at 70% 20%,rgba(239,205,114,.12),transparent 34%),radial-gradient(circle at 28% 74%,rgba(86,164,255,.10),transparent 36%)!important;animation:none!important}.loh-heart-animation::after{display:none!important}.loh-florida-stage{background:radial-gradient(circle at 50% 45%,rgba(239,205,114,.09),rgba(255,255,255,.035) 44%,rgba(7,24,39,.42) 100%)!important}.loh-florida-stage .loh-heart{font-size:0!important;width:var(--s)!important;height:var(--s)!important;transform:translate(-50%,-50%) rotate(-45deg) scale(.12)!important;background:linear-gradient(135deg,#efcd72,#c9982f);border-radius:18% 18% 8% 18%;filter:none!important}.loh-florida-stage .loh-heart::before,.loh-florida-stage .loh-heart::after{content:"";position:absolute;width:100%;height:100%;border-radius:999px;background:inherit}.loh-florida-stage .loh-heart::before{left:0;top:-50%}.loh-florida-stage .loh-heart::after{left:50%;top:0}.loh-florida-stage .loh-heart:nth-child(4n+2){background:linear-gradient(135deg,#f2647b,#bd2541)}.loh-florida-stage .loh-heart:nth-child(4n+3){background:linear-gradient(135deg,#56a4ff,#3176c9)}.loh-florida-stage .loh-heart:nth-child(4n+4){background:linear-gradient(135deg,#9c7cff,#6d46cf)}.loh-center-heart{width:min(150px,36vw)!important;height:min(150px,36vw)!important;border-radius:18% 18% 8% 18%!important;background:linear-gradient(135deg,#ef405c,#ad102c)!important;color:#fff9e8!important;transform:translate(-50%,-50%) rotate(-45deg) scale(.2)!important;box-shadow:0 20px 62px rgba(0,0,0,.34),0 0 54px rgba(239,205,114,.22)!important}.loh-center-heart::before,.loh-center-heart::after{content:""!important;position:absolute!important;width:100%!important;height:100%!important;border-radius:999px!important;background:inherit!important;inset:auto!important}.loh-center-heart::before{left:0!important;top:-50%!important}.loh-center-heart::after{left:50%!important;top:0!important}.loh-center-heart span{position:absolute!important;left:50%!important;top:52%!important;width:126%!important;transform:translate(-50%,-50%) rotate(45deg)!important;color:#fff9e8!important;font-size:clamp(.88rem,2.6vw,1.18rem)!important;text-shadow:0 2px 12px rgba(0,0,0,.28)}@media(max-width:620px){.loh-center-heart{width:124px!important;height:124px!important}.loh-center-heart span{font-size:.9rem!important}}
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupApplicationModal);
  else setupApplicationModal();
})();
