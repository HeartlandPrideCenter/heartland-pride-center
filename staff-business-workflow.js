(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const section = document.getElementById('business');
    const room = section?.querySelector('.business-room');
    const oldFilter = section?.querySelector('.business-filter');
    const list = document.getElementById('businessList');
    if (!section || !room || !oldFilter || !list) return;

    const style = document.createElement('style');
    style.textContent = `
      #business .business-room{grid-template-columns:270px minmax(0,1fr);gap:14px;align-items:start}
      #business .business-filter{padding:14px;height:max-content;position:sticky;top:18px;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.055);box-shadow:0 22px 70px rgba(0,0,0,.20)}
      #business .business-filter .field{margin:10px 0}
      #business .business-filter .filter-stack{border-top:1px solid var(--line);padding-top:12px;margin-top:12px;display:grid;gap:4px}
      #business .business-filter .filter-btn{width:100%;justify-content:space-between;text-align:left;margin:0;border-radius:14px;text-transform:none;letter-spacing:0;font-size:.82rem;font-weight:800;min-height:40px}
      #business .business-filter .filter-btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#061323;border:0}
      #business .business-search-actions{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:end}
      #business .business-search-actions .field{margin:0}
      #business .business-search-actions .btn{border-radius:14px;min-width:72px}
      #business .business-main{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.055);box-shadow:0 22px 70px rgba(0,0,0,.20);padding:18px}
      #business .business-main>h2{margin:.35rem 0 .6rem}
      #business .business-main>.notice{display:none}
      #business .business-row{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.04);padding:14px;display:grid;grid-template-columns:1fr auto;gap:12px;cursor:pointer}
      #business .business-row:hover{background:rgba(255,255,255,.055);border-color:rgba(240,206,115,.42)}
      #business .business-row strong{display:block;font-size:1rem}
      #business .business-row small{display:block;color:var(--muted);margin-top:3px}
      .modal .tabs{position:sticky;top:0;z-index:4;padding:8px 0 12px;background:#071827}
      .modal .tabs .btn{border-radius:12px;text-transform:none;letter-spacing:0;font-size:.76rem}
      .workflow-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}
      .workflow-stat{border:1px solid var(--line);border-radius:16px;padding:13px;background:rgba(255,255,255,.04)}
      .workflow-stat small{display:block;color:var(--muted);margin-top:5px}
      .application-readonly{border:1px solid var(--line);border-radius:18px;padding:16px;background:rgba(255,255,255,.035)}
      .application-readonly pre{margin:10px 0 0;white-space:pre-wrap;color:var(--muted);font-size:.8rem;max-height:52vh;overflow:auto}
      @media(max-width:980px){#business .business-room{grid-template-columns:1fr}#business .business-filter{position:static}}
      @media(max-width:620px){#business .business-search-actions,.workflow-overview{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const main = room.children[1];
    main.className = 'business-main';
    main.querySelector('h2').textContent = 'Business Network';
    const notice = main.querySelector('.notice');
    if (notice) notice.insertAdjacentHTML('afterend','<p style="color:var(--muted);margin-top:0">Click any business to open the Business Workspace. One record. Public controls live inside the record.</p>');

    oldFilter.innerHTML = `
      <span class="eyebrow">Business Views</span>
      <div class="business-search-actions">
        <div class="field"><label>Search Business</label><input id="businessSearch" placeholder="Name, city, category, badge..."></div>
        <button class="btn primary" id="businessSearchButton" type="button">Search</button>
      </div>
      <div class="filter-stack" id="businessStatusFilters"></div>
      <div class="filter-stack">
        <div class="field"><label>Category</label><select id="businessCategory"><option value="all">All Categories</option></select></div>
        <div class="field"><label>Sort</label><select id="businessSortSelect"><option value="updated">Recently Updated</option><option value="name">Alphabetical</option><option value="newest">Newest</option><option value="status">Status</option></select></div>
      </div>`;

    window.businessSearch = document.getElementById('businessSearch');
    window.businessStatusFilters = document.getElementById('businessStatusFilters');
    window.businessList = document.getElementById('businessList');
    const categorySelect = document.getElementById('businessCategory');
    const sortSelect = document.getElementById('businessSortSelect');
    let categoryView = 'all';

    function getBusinesses(){
      return typeof window.businessRecords === 'function'
        ? window.businessRecords()
        : (window.records || []).filter(r => r.department === 'business');
    }

    window.renderBusiness = function restoredRenderBusiness(){
      const all = getBusinesses();
      const fixedStatuses = ['all','new','pending','draft','published','hidden','suspended','archived'];
      businessStatusFilters.innerHTML = fixedStatuses.map(status => {
        const count = all.filter(r => status === 'all' || r.status === status).length;
        const label = status === 'all' ? 'All Businesses' : status.replace(/\b\w/g,c=>c.toUpperCase());
        return `<button class="btn filter-btn ${window.businessView===status?'primary':''}" data-status="${status}"><span>${label}</span><span>${count}</span></button>`;
      }).join('');
      businessStatusFilters.querySelectorAll('[data-status]').forEach(button => button.onclick = () => {
        window.businessView = button.dataset.status;
        window.renderBusiness();
      });

      const currentCategory = categoryView;
      const categories = ['all', ...new Set(all.map(r => r.category).filter(Boolean).sort((a,b)=>a.localeCompare(b)))];
      categorySelect.innerHTML = categories.map(category => `<option value="${window.esc ? window.esc(category) : category}" ${category===currentCategory?'selected':''}>${category==='all'?'All Categories':category}</option>`).join('');

      const q = businessSearch.value.toLowerCase().trim();
      let filtered = all.filter(r =>
        (window.businessView === 'all' || r.status === window.businessView) &&
        (categoryView === 'all' || r.category === categoryView) &&
        (!q || [r.name,r.category,r.city,r.email,r.phone,r.status,r.badges,r.notes,r.description].join(' ').toLowerCase().includes(q))
      );

      const sort = sortSelect.value;
      filtered.sort((a,b) => {
        if(sort === 'name') return String(a.name).localeCompare(String(b.name));
        if(sort === 'status') return String(a.status).localeCompare(String(b.status));
        if(sort === 'newest') return String(b.created_at||'').localeCompare(String(a.created_at||''));
        return String(b.raw?.updated_at||b.created_at||'').localeCompare(String(a.raw?.updated_at||a.created_at||''));
      });

      const escape = window.esc || (value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
      businessList.innerHTML = filtered.length ? filtered.map(r => `
        <button class="business-row" onclick="openBusiness('${escape(r.source)}','${escape(r.id)}')">
          <span><strong>${escape(r.name)}</strong><small>${escape([r.category,r.city,r.email||r.phone].filter(Boolean).join(' · '))}</small><span class="row-tags">${r.featured==='on'?'<span class="chip">Featured</span>':''}${r.map==='hidden'?'<span class="chip">Map Hidden</span>':''}</span></span>
          <span class="status ${escape(r.status.replace(/\s+/g,'-'))}">${escape(r.status)}</span>
        </button>`).join('') : '<div class="empty">No business records match this view.</div>';
    };

    document.getElementById('businessSearchButton').onclick = window.renderBusiness;
    businessSearch.addEventListener('keydown', event => { if(event.key === 'Enter') window.renderBusiness(); });
    categorySelect.onchange = () => { categoryView = categorySelect.value; window.renderBusiness(); };
    sortSelect.onchange = window.renderBusiness;
    window.renderBusiness();

    const originalOpenBusiness = window.openBusiness;
    if (typeof originalOpenBusiness !== 'function') return;
    window.openBusiness = function enhancedOpenBusiness(source,id){
      originalOpenBusiness(source,id);
      const modalBody=document.getElementById('modalBody');
      const tabs=[...modalBody.querySelectorAll('.tabs [data-tab]')];
      const panels=[...modalBody.querySelectorAll(':scope > section.tab')];
      if(tabs.length!==6||panels.length!==6)return;
      const raw=panels[5].querySelector('pre')?.textContent||'Original submission details are unavailable.';
      panels[4].innerHTML='<div class="application-readonly"><span class="eyebrow">Original Application</span><h3>Submitted record</h3><p style="color:var(--muted)">Read-only source information. Public edits are made under Public Listing.</p><pre></pre></div>';
      panels[4].querySelector('pre').textContent=raw;
      const order=[0,4,1,2,3,5];
      const labels=['Overview','Application','Public Listing','Internal','Documents','History'];
      const tabBar=modalBody.querySelector('.tabs');
      order.forEach((oldIndex,newIndex)=>{const tab=tabs[oldIndex];const panel=panels[oldIndex];tab.textContent=labels[newIndex];tab.dataset.tab=String(newIndex);tabBar.appendChild(tab);modalBody.appendChild(panel)});
      const reordered=[...modalBody.querySelectorAll(':scope > section.tab')];
      [...tabBar.querySelectorAll('[data-tab]')].forEach((button,index)=>{button.classList.toggle('primary',index===0);button.onclick=()=>{[...tabBar.querySelectorAll('[data-tab]')].forEach(b=>b.classList.toggle('primary',b===button));reordered.forEach((panel,panelIndex)=>panel.classList.toggle('active',panelIndex===index))}});
      reordered.forEach((panel,index)=>panel.classList.toggle('active',index===0));
      const overview=reordered[0];
      if(!overview.querySelector('.workflow-overview')){
        const summary=document.createElement('div');
        summary.className='workflow-overview';
        summary.innerHTML=`<div class="workflow-stat"><span class="eyebrow">Status</span><small>${document.getElementById('modalSub')?.textContent||'Business record'}</small></div><div class="workflow-stat"><span class="eyebrow">Public Listing</span><small>Preview and listing controls are ready.</small></div><div class="workflow-stat"><span class="eyebrow">Next Action</span><small>Review missing listing-health items.</small></div>`;
        overview.insertBefore(summary,overview.firstChild);
      }
    };
  });
})();
