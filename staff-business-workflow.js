(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const style = document.createElement('style');
    style.textContent = `
      #business{padding-top:4px}
      #business .business-room{grid-template-columns:280px minmax(0,1fr);gap:22px;align-items:start}
      #business .business-filter{padding:20px;border-radius:22px;background:linear-gradient(180deg,rgba(17,42,68,.98),rgba(8,27,45,.98));border:1px solid rgba(240,206,115,.22);box-shadow:0 18px 42px rgba(0,0,0,.22)}
      #business .business-filter .eyebrow{display:block;margin-bottom:12px}
      #business .business-search-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}
      #business .business-search-row .field{margin:0}
      #business .business-search-action{min-width:82px;border-radius:14px}
      #business .filter-stack{gap:8px;margin-top:16px;padding-top:16px}
      #business .filter-btn{min-height:44px;padding:0 13px;background:rgba(255,255,255,.045);border-radius:14px}
      #business .filter-btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#061323}
      #business .business-main{display:grid;gap:14px}
      #business .business-command{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;padding:20px;border-radius:22px;background:linear-gradient(135deg,rgba(212,175,55,.14),rgba(255,255,255,.05));border:1px solid rgba(240,206,115,.28)}
      #business .business-command h2{margin:4px 0 6px;font-size:1.7rem}
      #business .business-command p{margin:0;color:var(--muted)}
      #business .business-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      #business .business-stat{padding:15px;border-radius:17px;border:1px solid var(--line);background:rgba(255,255,255,.04)}
      #business .business-stat strong{display:block;font-size:1.5rem;margin-top:4px}
      #business .business-list-shell{border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.03);overflow:hidden}
      #business .business-list-head{display:grid;grid-template-columns:1.6fr .9fr .7fr .5fr;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);color:var(--gold2);font-size:.66rem;font-weight:900;letter-spacing:.11em;text-transform:uppercase}
      #business .business-list{gap:0}
      #business .business-row{border:0;border-bottom:1px solid rgba(245,241,232,.08);border-radius:0;background:transparent;padding:15px 16px;grid-template-columns:1.6fr .9fr .7fr .5fr;align-items:center;transition:background .16s ease}
      #business .business-row:last-child{border-bottom:0}
      #business .business-row:hover{background:rgba(255,255,255,.055)}
      #business .business-row small{margin-top:3px}
      #business .row-tags{margin-top:6px}
      .modal{width:min(1180px,98vw)}
      .modal .tabs{position:sticky;top:0;z-index:4;padding:9px 0 13px;background:#071827;border-bottom:1px solid rgba(245,241,232,.08)}
      .modal .tabs .btn{border-radius:12px;text-transform:none;letter-spacing:0;font-size:.76rem}
      .workflow-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}
      .workflow-stat{border:1px solid var(--line);border-radius:16px;padding:14px;background:rgba(255,255,255,.04)}
      .workflow-stat small{display:block;color:var(--muted);margin-top:5px}
      .application-readonly{border:1px solid var(--line);border-radius:18px;padding:16px;background:rgba(255,255,255,.035)}
      .application-readonly pre{margin:10px 0 0;white-space:pre-wrap;color:var(--muted);font-size:.8rem;max-height:52vh;overflow:auto}
      @media(max-width:980px){#business .business-room{grid-template-columns:1fr}#business .business-stats{grid-template-columns:repeat(2,1fr)}#business .business-list-head{display:none}#business .business-row{grid-template-columns:1fr auto}}
      @media(max-width:620px){#business .business-command,#business .business-search-row,#business .business-stats,.workflow-overview{grid-template-columns:1fr}.business-search-action{width:100%}}
    `;
    document.head.appendChild(style);

    const section = document.getElementById('business');
    const room = section?.querySelector('.business-room');
    const filter = section?.querySelector('.business-filter');
    const list = document.getElementById('businessList');
    if (!section || !room || !filter || !list) return;

    const oldMain = room.children[1];
    oldMain.className = 'business-main';
    oldMain.innerHTML = `
      <div class="business-command">
        <div>
          <span class="eyebrow">Business Network Control Center</span>
          <h2>Business Master Records</h2>
          <p>Review, manage, and publish every business from one workspace.</p>
        </div>
        <button class="btn primary" type="button" id="businessAddButton">Add Business</button>
      </div>
      <div class="business-stats" id="businessStats"></div>
      <div class="business-list-shell">
        <div class="business-list-head"><span>Business</span><span>Category / City</span><span>Status</span><span>Open</span></div>
        <div class="business-list" id="businessList"></div>
      </div>`;

    const newList = document.getElementById('businessList');
    window.businessList = newList;
    document.getElementById('businessAddButton')?.addEventListener('click', () => document.getElementById('manualBtn')?.click());

    const search = document.getElementById('businessSearch');
    if (search && !document.getElementById('businessSearchButton')) {
      const field = search.closest('.field');
      const row = document.createElement('div');
      row.className = 'business-search-row';
      field.parentNode.insertBefore(row, field);
      row.appendChild(field);
      const button = document.createElement('button');
      button.id = 'businessSearchButton';
      button.type = 'button';
      button.className = 'btn primary business-search-action';
      button.textContent = 'Search';
      button.addEventListener('click', () => {
        if (typeof window.renderBusiness === 'function') window.renderBusiness();
        search.focus();
      });
      row.appendChild(button);
      search.placeholder = 'Search businesses...';
    }

    const originalRenderBusiness = window.renderBusiness;
    if (typeof originalRenderBusiness === 'function') {
      window.renderBusiness = function enhancedRenderBusiness() {
        originalRenderBusiness();
        const rows = [...document.querySelectorAll('#businessList .business-row')];
        rows.forEach((row) => {
          const left = row.children[0];
          const status = row.children[1];
          const detail = left?.querySelector('small')?.textContent || '';
          const parts = detail.split(' · ');
          const middle = document.createElement('span');
          middle.innerHTML = `<strong style="font-size:.82rem">${parts[0] || 'Business'}</strong><small>${parts[1] || ''}</small>`;
          const open = document.createElement('span');
          open.innerHTML = '<span class="btn small">Open</span>';
          if (left) left.querySelector('small')?.remove();
          row.insertBefore(middle, status);
          row.appendChild(open);
        });
        const all = typeof window.businessRecords === 'function' ? window.businessRecords() : [];
        const stats = document.getElementById('businessStats');
        if (stats) {
          const count = (name) => all.filter(r => r.status === name).length;
          stats.innerHTML = `
            <div class="business-stat"><span class="eyebrow">All Businesses</span><strong>${all.length}</strong></div>
            <div class="business-stat"><span class="eyebrow">Pending</span><strong>${count('pending') + count('pending review') + count('new')}</strong></div>
            <div class="business-stat"><span class="eyebrow">Published</span><strong>${count('published')}</strong></div>
            <div class="business-stat"><span class="eyebrow">Hidden / Archived</span><strong>${count('hidden') + count('archived')}</strong></div>`;
        }
      };
      window.renderBusiness();
    }

    const originalOpenBusiness = window.openBusiness;
    if (typeof originalOpenBusiness !== 'function') return;
    window.openBusiness = function enhancedOpenBusiness(source, id) {
      originalOpenBusiness(source, id);
      const modalBody = document.getElementById('modalBody');
      const tabs = [...modalBody.querySelectorAll('.tabs [data-tab]')];
      const sections = [...modalBody.querySelectorAll(':scope > section.tab')];
      if (tabs.length !== 6 || sections.length !== 6) return;
      const originalHistory = sections[5].querySelector('pre')?.textContent || 'Original submission details are unavailable.';
      sections[4].innerHTML = `<div class="application-readonly"><span class="eyebrow">Original Application</span><h3>Submitted record</h3><p style="color:var(--muted)">Read-only source information. Public edits are made under Public Listing.</p><pre></pre></div>`;
      sections[4].querySelector('pre').textContent = originalHistory;
      const order = [0,4,1,2,3,5];
      const labels = ['Overview','Application','Public Listing','Internal','Documents','History'];
      const tabBar = modalBody.querySelector('.tabs');
      order.forEach((oldIndex,newIndex)=>{const tab=tabs[oldIndex];const panel=sections[oldIndex];tab.textContent=labels[newIndex];tab.dataset.tab=String(newIndex);tabBar.appendChild(tab);modalBody.appendChild(panel)});
      const reordered = [...modalBody.querySelectorAll(':scope > section.tab')];
      [...tabBar.querySelectorAll('[data-tab]')].forEach((button,index)=>{button.classList.toggle('primary',index===0);button.onclick=()=>{[...tabBar.querySelectorAll('[data-tab]')].forEach(b=>b.classList.toggle('primary',b===button));reordered.forEach((panel,panelIndex)=>panel.classList.toggle('active',panelIndex===index))}});
      reordered.forEach((panel,index)=>panel.classList.toggle('active',index===0));
      const overview = reordered[0];
      if (!overview.querySelector('.workflow-overview')) {
        const summary = document.createElement('div');
        summary.className = 'workflow-overview';
        summary.innerHTML = `<div class="workflow-stat"><span class="eyebrow">Status</span><small>${document.getElementById('modalSub')?.textContent || 'Business record'}</small></div><div class="workflow-stat"><span class="eyebrow">Public Listing</span><small>Preview and listing controls are ready.</small></div><div class="workflow-stat"><span class="eyebrow">Next Action</span><small>Review missing listing-health items.</small></div>`;
        overview.insertBefore(summary, overview.firstChild);
      }
    };
  });
})();
