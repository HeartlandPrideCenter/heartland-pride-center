(() => {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function buildHeartArt() {
    const points = [
      [42,8,18],[48,11,16],[54,16,15],[58,23,14],[55,31,13],[60,39,13],[57,48,12],[62,57,12],[59,66,11],[65,73,10],[73,78,9],[82,78,8],[76,70,8],[69,63,9],[52,59,10],[49,50,11],[50,40,12],[46,31,13],[41,22,13],[36,15,12],[33,24,10],[37,32,10]
    ];
    return points.map(([x, y, s], index) => `<span class="loh-static-heart h${index % 4}" style="left:${x}%;top:${y}%;--s:${s}px"></span>`).join('');
  }

  ready(() => {
    setTimeout(() => {
      const page = document.querySelector('.business-network-page');
      if (!page) return;

      document.querySelectorAll('.loh-heart-animation').forEach(item => item.remove());
      document.querySelectorAll('.loh-application-cta').forEach(item => item.remove());

      const style = document.createElement('style');
      style.id = 'business-network-stage-polish-style';
      style.textContent = `
        .business-network-page{width:min(1180px,92vw)}
        .land-hero{border-bottom:0!important;text-align:center!important;padding:62px 0 30px!important;display:grid!important;place-items:center!important}.land-hero .eyebrow,.land-hero h1,.land-hero .intro{margin-left:auto!important;margin-right:auto!important}.land-hero h1{max-width:900px!important}.land-hero .intro{max-width:740px!important}
        .loh-static-showpiece{width:min(100%,980px);margin:0 auto 22px;border:1px solid rgba(239,205,114,.24);border-radius:34px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.028));box-shadow:0 24px 80px rgba(0,0,0,.20);overflow:hidden;position:relative}.loh-static-inner{display:grid;grid-template-columns:.9fr 1.1fr;gap:24px;align-items:center;padding:28px clamp(22px,4vw,46px)}.loh-static-copy{text-align:left}.loh-static-copy .eyebrow{margin-bottom:10px}.loh-static-copy h2{font-family:Inter,sans-serif;font-size:clamp(1.85rem,3.4vw,3.5rem);line-height:1.05;letter-spacing:-.045em;margin:0 0 12px}.loh-static-copy p{color:rgba(245,241,232,.72);line-height:1.7;max-width:540px}.loh-static-art{position:relative;min-height:330px;border-radius:28px;border:1px solid rgba(245,241,232,.12);background:radial-gradient(circle at 50% 48%,rgba(239,205,114,.11),rgba(255,255,255,.035) 46%,rgba(7,24,39,.42));overflow:hidden}.loh-static-art:before{content:"";position:absolute;left:49%;top:50%;width:54%;height:78%;border:1px solid rgba(239,205,114,.10);border-radius:48% 42% 56% 42%;transform:translate(-50%,-50%) rotate(-8deg)}.loh-static-heart{position:absolute;width:var(--s);height:var(--s);transform:translate(-50%,-50%) rotate(-45deg);border-radius:18% 18% 8% 18%;background:linear-gradient(135deg,#efcd72,#bd8b24);box-shadow:0 8px 20px rgba(0,0,0,.22)}.loh-static-heart:before,.loh-static-heart:after{content:"";position:absolute;width:100%;height:100%;border-radius:999px;background:inherit}.loh-static-heart:before{left:0;top:-50%}.loh-static-heart:after{left:50%;top:0}.loh-static-heart.h1{background:linear-gradient(135deg,#f2647b,#bd2541)}.loh-static-heart.h2{background:linear-gradient(135deg,#56a4ff,#3176c9)}.loh-static-heart.h3{background:linear-gradient(135deg,#9c7cff,#6d46cf)}.loh-static-center{position:absolute;left:50%;top:48%;width:118px;height:118px;transform:translate(-50%,-50%) rotate(-45deg);border-radius:18% 18% 8% 18%;background:linear-gradient(135deg,#ef405c,#ad102c);box-shadow:0 20px 60px rgba(0,0,0,.34),0 0 46px rgba(239,205,114,.22);animation:lohSoftPulse 3.1s ease-in-out infinite}.loh-static-center:before,.loh-static-center:after{content:"";position:absolute;width:100%;height:100%;border-radius:999px;background:inherit}.loh-static-center:before{left:0;top:-50%}.loh-static-center:after{left:50%;top:0}.loh-static-center span{position:absolute;z-index:2;left:50%;top:52%;width:130%;transform:translate(-50%,-50%) rotate(45deg);text-align:center;color:#fff9e8;font-weight:950;line-height:1.05;font-size:.9rem;text-shadow:0 2px 12px rgba(0,0,0,.30)}@keyframes lohSoftPulse{0%,100%{transform:translate(-50%,-50%) rotate(-45deg) scale(1)}50%{transform:translate(-50%,-50%) rotate(-45deg) scale(1.035)}}
        .loh-discovery-panel{border:1px solid rgba(239,205,114,.22);border-radius:30px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.03));box-shadow:0 24px 70px rgba(0,0,0,.18);padding:18px;margin:22px 0 18px}.loh-discovery-panel .search-strip{margin:0 0 12px!important}.loh-discovery-panel .explorer-tabs{margin:0!important;border:0!important;background:transparent!important;padding:0!important}.loh-discovery-panel .explorer-tabs button{flex:1;min-width:160px}.search-strip{grid-template-columns:1fr 220px auto!important}.search-strip input,.search-strip select,.view-tools select{min-height:48px}.view-tools{grid-template-columns:repeat(3,minmax(0,1fr))!important;margin:0 0 14px!important;background:rgba(255,255,255,.035)!important;border-radius:22px!important}.view-tools label{font-size:.68rem!important}.directory-panel .view-tools,.cards-panel .view-tools{align-items:end}.directory-panel .form-field label,.cards-panel .form-field label{white-space:nowrap}.directory-panel label[for="directorySort"]::after,.cards-panel label[for="cardSort"]::after{content:""}.directory-panel label[for="directoryBadge"]::after,.cards-panel label[for="cardFocus"]::after{content:""}
        .map-panel,.directory-panel,.cards-panel{margin-top:12px}.map-shell{border-radius:30px!important}.map-tools{top:14px!important;right:14px!important}.map-list{border-radius:22px!important}.business-network-page[data-view="grid"] #businessDirectory,.business-network-page[data-view="grid"] #cardDirectory{grid-template-columns:repeat(3,minmax(0,1fr))!important}.join-intro{margin:42px 0 0!important;text-align:center!important;padding:34px clamp(22px,4vw,44px)!important}.join-intro h2{font-family:Inter,sans-serif!important;letter-spacing:-.035em!important}.join-intro p{margin-left:auto!important;margin-right:auto!important}.join-intro .actions{justify-content:center!important}.intake-form.loh-application-in-modal{display:block!important}
        @media(max-width:980px){.loh-static-inner{grid-template-columns:1fr}.loh-static-copy{text-align:center}.loh-static-copy p{margin-left:auto;margin-right:auto}.search-strip,.view-tools{grid-template-columns:1fr!important}.business-network-page[data-view="grid"] #businessDirectory,.business-network-page[data-view="grid"] #cardDirectory{grid-template-columns:1fr!important}.loh-discovery-panel .explorer-tabs button{min-width:0}}
        @media(max-width:640px){.business-network-page{width:min(92vw,1180px)}.land-hero{padding-top:42px!important}.loh-static-inner{padding:22px 16px}.loh-static-art{min-height:300px}.loh-static-center{width:104px;height:104px}.loh-static-center span{font-size:.82rem}.loh-discovery-panel{padding:14px;border-radius:24px}.map-shell{height:700px!important}.join-intro{border-radius:24px!important}}
      `;
      document.head.appendChild(style);

      const hero = document.querySelector('.land-hero');
      if (hero && !document.querySelector('.loh-static-showpiece')) {
        const showpiece = document.createElement('section');
        showpiece.className = 'loh-static-showpiece';
        showpiece.setAttribute('aria-label', 'Land of Hearts visual introduction');
        showpiece.innerHTML = `<div class="loh-static-inner"><div class="loh-static-copy"><p class="eyebrow">Land of Hearts</p><h2>Find your place here.</h2><p>A simple, familiar way to discover affirming businesses and welcoming places across Florida's Heartland.</p></div><div class="loh-static-art" aria-hidden="true">${buildHeartArt()}<div class="loh-static-center"><span>Find your<br>place here.</span></div></div></div>`;
        hero.insertAdjacentElement('afterend', showpiece);
      }

      const search = document.querySelector('.search-strip');
      const tabs = document.querySelector('.explorer-tabs');
      if (search && tabs && !document.querySelector('.loh-discovery-panel')) {
        const panel = document.createElement('section');
        panel.className = 'loh-discovery-panel';
        panel.setAttribute('aria-label', 'Find affirming businesses');
        search.parentNode.insertBefore(panel, search);
        panel.appendChild(search);
        panel.appendChild(tabs);
      }

      document.querySelectorAll('.loh-application-cta').forEach(item => item.remove());
      const join = document.querySelector('.join-intro');
      const mapPanel = document.querySelector('.map-panel');
      const directoryPanel = document.querySelector('.directory-panel');
      const cardsPanel = document.querySelector('.cards-panel');
      if (join && mapPanel && directoryPanel && cardsPanel) {
        cardsPanel.insertAdjacentElement('afterend', join);
      }
    }, 120);
  });
})();
