(() => {
  const HERO_IMAGE = 'data:image/jpeg;base64,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';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function dispatchChange(el) {
    if (!el) return;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function syncOptions(from, to) {
    if (!from || !to) return;
    to.innerHTML = from.innerHTML;
    to.value = from.value || 'all';
  }

  function installSimpleFilters() {
    const search = document.querySelector('.search-strip');
    const category = document.getElementById('categoryFilter');
    if (!search || !category || document.getElementById('unifiedCityFilter')) return;

    const cityWrap = document.createElement('div');
    cityWrap.className = 'form-field unified-city-field';
    cityWrap.innerHTML = '<label for="unifiedCityFilter">City</label><select id="unifiedCityFilter"><option value="all">All cities</option></select>';

    const nearWrap = document.createElement('label');
    nearWrap.className = 'loh-near-me-toggle';
    nearWrap.innerHTML = '<input type="checkbox" id="simpleNearMe"> <span>Near Me</span>';

    const button = document.getElementById('searchButton');
    search.insertBefore(cityWrap, button);
    search.insertBefore(nearWrap, button);

    const unifiedCity = document.getElementById('unifiedCityFilter');
    const cityFilter = document.getElementById('cityFilter');
    const cardCityFilter = document.getElementById('cardCityFilter');

    const syncCities = () => {
      const source = cityFilter?.options?.length > 1 ? cityFilter : cardCityFilter;
      syncOptions(source, unifiedCity);
    };

    syncCities();
    setTimeout(syncCities, 500);
    setTimeout(syncCities, 1200);

    unifiedCity.addEventListener('change', () => {
      if (cityFilter) { cityFilter.value = unifiedCity.value; dispatchChange(cityFilter); }
      if (cardCityFilter) { cardCityFilter.value = unifiedCity.value; dispatchChange(cardCityFilter); }
    });

    document.getElementById('simpleNearMe')?.addEventListener('change', event => {
      if (event.target.checked) document.getElementById('locateMeBtn')?.click();
    });
  }

  function installHeroArtwork() {
    const page = document.querySelector('.business-network-page');
    const hero = document.querySelector('.land-hero');
    if (!page || !hero || document.querySelector('.loh-approved-hero-art')) return;

    document.querySelectorAll('.loh-heart-animation,.loh-static-showpiece').forEach(item => item.remove());

    const art = document.createElement('figure');
    art.className = 'loh-approved-hero-art';
    art.innerHTML = `<img src="${HERO_IMAGE}" alt="Land of Hearts map made from colorful hearts with a center message reading Find your place here.">`;
    hero.appendChild(art);
  }

  function relabelViews() {
    const listButton = document.querySelector('[data-view-btn="list"]');
    const gridButton = document.querySelector('[data-view-btn="grid"]');
    if (listButton) listButton.textContent = '☷ List';
    if (gridButton) gridButton.textContent = '▦ Cards';
  }

  function normalizeJoin() {
    document.querySelectorAll('.loh-application-cta').forEach(item => item.remove());
    const join = document.querySelector('.join-intro');
    const mapPanel = document.querySelector('.map-panel');
    const directoryPanel = document.querySelector('.directory-panel');
    const cardsPanel = document.querySelector('.cards-panel');
    if (join && mapPanel && directoryPanel && cardsPanel) {
      cardsPanel.insertAdjacentElement('afterend', join);
      join.innerHTML = '<p class="eyebrow">Join the Network</p><h2>Want to Make Your Business a Heart in the Land of Hearts?</h2><p>Every business in the Land of Hearts helps create a more welcoming Heartland.</p><p>If your business believes everyone deserves to feel respected, valued, and welcome, we\'d love to learn more about you.</p><p>Every new Heart helps someone discover a place where they can walk through the door with confidence.</p><div class="actions"><a class="btn primary" href="#join-network">❤️ Add Your Heart to the Map</a></div>';
    }
  }

  ready(() => {
    setTimeout(() => {
      const page = document.querySelector('.business-network-page');
      if (!page) return;

      const existingStyle = document.getElementById('business-network-stage-polish-style');
      if (existingStyle) existingStyle.remove();
      const style = document.createElement('style');
      style.id = 'business-network-stage-polish-style';
      style.textContent = `
        .business-network-page{width:min(1180px,92vw)}
        .land-hero{border-bottom:0!important;text-align:center!important;padding:54px 0 28px!important;display:grid!important;place-items:center!important;gap:20px!important}.land-hero .eyebrow,.land-hero h1,.land-hero .intro{margin-left:auto!important;margin-right:auto!important}.land-hero h1{max-width:920px!important}.land-hero .intro{max-width:760px!important}
        .loh-approved-hero-art{width:min(980px,100%);margin:8px auto 0!important;border:1px solid rgba(239,205,114,.24);border-radius:34px;background:rgba(255,255,255,.045);box-shadow:0 28px 90px rgba(0,0,0,.24);overflow:hidden}.loh-approved-hero-art img{display:block;width:100%;height:auto}
        .loh-discovery-panel{border:1px solid rgba(239,205,114,.22);border-radius:30px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.03));box-shadow:0 24px 70px rgba(0,0,0,.18);padding:18px;margin:22px 0 18px}.loh-discovery-panel .search-strip{margin:0 0 12px!important}.loh-discovery-panel .explorer-tabs{margin:0!important;border:0!important;background:transparent!important;padding:0!important}.loh-discovery-panel .explorer-tabs button{flex:1;min-width:150px}
        .search-strip{grid-template-columns:1.35fr .72fr .72fr auto auto!important;gap:10px!important;align-items:end!important}.search-strip input,.search-strip select{min-height:48px}.loh-near-me-toggle{min-height:48px;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(245,241,232,.16);border-radius:16px;background:rgba(6,19,35,.48);color:rgba(245,241,232,.86);font-weight:900;padding:0 14px;white-space:nowrap}.loh-near-me-toggle input{width:auto}.view-tools{display:none!important}
        .map-panel,.directory-panel,.cards-panel{margin-top:12px}.map-shell{border-radius:30px!important}.map-tools{top:14px!important;right:14px!important}.map-list{border-radius:22px!important}
        .business-network-page[data-view="list"] .business-directory{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}.business-network-page[data-view="list"] .loh-row,.business-network-page[data-view="list"] .business-card{min-height:0!important;display:grid!important;grid-template-columns:52px 1fr auto!important;align-items:center!important;gap:16px!important;padding:16px 18px!important;border-radius:18px!important}.business-network-page[data-view="list"] .loh-row:before,.business-network-page[data-view="list"] .business-card:before{content:"♥";display:grid;place-items:center;width:42px;height:42px;border-radius:999px;background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#071827;font-weight:950}.business-network-page[data-view="list"] .loh-row p,.business-network-page[data-view="list"] .business-card p{margin:0!important;line-height:1.35!important}.business-network-page[data-view="list"] .heart-badge{display:none!important}
        .business-network-page[data-view="grid"] #cardDirectory,.business-network-page[data-view="grid"] #businessDirectory{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:16px!important}.business-network-page[data-view="grid"] .loh-row,.business-network-page[data-view="grid"] .business-card{display:block!important;min-height:320px!important;padding:24px!important;border-radius:26px!important;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.035))!important}.business-network-page[data-view="grid"] .loh-row:before,.business-network-page[data-view="grid"] .business-card:before{content:"";display:block;height:110px;border-radius:20px;margin-bottom:18px;background:radial-gradient(circle at 24% 30%,rgba(239,205,114,.38),transparent 36%),linear-gradient(135deg,rgba(239,205,114,.16),rgba(86,164,255,.12),rgba(156,124,255,.12));border:1px solid rgba(245,241,232,.12)}.business-network-page[data-view="grid"] .heart-badge{margin-top:18px!important}
        .join-intro{margin:42px 0 0!important;text-align:center!important;padding:34px clamp(22px,4vw,44px)!important}.join-intro h2{font-family:Inter,sans-serif!important;letter-spacing:-.035em!important}.join-intro p{margin-left:auto!important;margin-right:auto!important}.join-intro .actions{justify-content:center!important}.intake-form.loh-application-in-modal{display:block!important}
        @media(max-width:980px){.search-strip{grid-template-columns:1fr!important}.loh-near-me-toggle{justify-content:flex-start}.business-network-page[data-view="grid"] #cardDirectory,.business-network-page[data-view="grid"] #businessDirectory{grid-template-columns:1fr!important}.business-network-page[data-view="list"] .loh-row,.business-network-page[data-view="list"] .business-card{grid-template-columns:42px 1fr!important}.business-network-page[data-view="list"] .loh-row-actions,.business-network-page[data-view="list"] .business-actions{grid-column:2!important;justify-content:flex-start!important}}
        @media(max-width:640px){.business-network-page{width:min(92vw,1180px)}.land-hero{padding-top:40px!important}.loh-approved-hero-art{border-radius:24px}.loh-discovery-panel{padding:14px;border-radius:24px}.map-shell{height:700px!important}.join-intro{border-radius:24px!important}}
      `;
      document.head.appendChild(style);

      document.querySelectorAll('.loh-heart-animation,.loh-static-showpiece').forEach(item => item.remove());
      installHeroArtwork();

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

      installSimpleFilters();
      relabelViews();
      normalizeJoin();
    }, 140);
  });
})();
