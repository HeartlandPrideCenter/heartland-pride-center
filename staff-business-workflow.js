(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const section = document.getElementById('business');
    const room = section?.querySelector('.business-room');
    const filterPanel = section?.querySelector('.business-filter');
    const existingList = document.getElementById('businessList');
    if (!section || !room || !filterPanel || !existingList) return;

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));

    const workflowStages = [
      { key:'new', label:'New', action:'Review application' },
      { key:'pending review', label:'In Review', action:'Complete review' },
      { key:'pending', label:'Waiting', action:'Follow up for information' },
      { key:'approved', label:'Approved', action:'Prepare public listing' },
      { key:'published', label:'Published', action:'Confirm listing is live' },
      { key:'active', label:'Active', action:'Maintain business record' }
    ];

    const stageAliases = {
      draft:'new',
      'in review':'pending review',
      waiting:'pending',
      hidden:'published',
      suspended:'active',
      archived:'active'
    };

    const normalizeStage = (status) => {
      const value = String(status || 'new').toLowerCase();
      return stageAliases[value] || value;
    };

    const style = document.createElement('style');
    style.textContent = `
      #business .business-room{grid-template-columns:270px minmax(0,1fr);gap:14px;align-items:start}
      #business .business-filter{padding:14px;height:max-content;position:sticky;top:18px;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.055);box-shadow:0 22px 70px rgba(0,0,0,.20)}
      #business .business-filter .field{margin:10px 0}
      #business .business-filter .filter-stack{border-top:1px solid var(--line);padding-top:12px;margin-top:12px;display:grid;gap:4px}
      #business .business-filter .filter-btn{width:100%;justify-content:space-between;text-align:left;border-radius:14px;text-transform:none;letter-spacing:0;font-size:.82rem;font-weight:800;min-height:40px}
      #business .business-filter .filter-btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#061323;border:0}
      #business .business-search-actions{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:end}
      #business .business-search-actions .field{margin:0}
      #business .business-search-actions .btn{border-radius:14px;min-width:72px}
      #business .business-main{border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.055);box-shadow:0 22px 70px rgba(0,0,0,.20);padding:18px}
      #business .business-main>.notice{display:none}
      #business .queue-header{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
      #business .queue-header h2{margin:.3rem 0 .4rem}
      #business .queue-header p{margin:0;color:var(--muted)}
      #business .business-row{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.04);padding:14px;display:grid;grid-template-columns:1fr auto;gap:12px;cursor:pointer}
      #business .business-row:hover{background:rgba(255,255,255,.06);border-color:rgba(240,206,115,.45)}
      #business .business-row strong{display:block;font-size:1rem}
      #business .business-row small{display:block;color:var(--muted);margin-top:3px}
      #business .business-row .next-step{display:block;margin-top:8px;color:var(--gold2);font-size:.72rem;font-weight:800}
      .modal{width:min(1180px,98vw)}
      .modal .tabs{position:sticky;top:0;z-index:4;padding:8px 0 12px;background:#071827;border-bottom:1px solid rgba(245,241,232,.08)}
      .modal .tabs .btn{border-radius:12px;text-transform:none;letter-spacing:0;font-size:.76rem}
      .workflow-command{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;padding:20px;border:1px solid rgba(240,206,115,.28);border-radius:22px;background:linear-gradient(135deg,rgba(212,175,55,.13),rgba(255,255,255,.035));margin-bottom:14px}
      .workflow-command h2{margin:.35rem 0 .5rem;font-size:1.8rem}
      .workflow-command p{margin:0;color:var(--muted)}
      .workflow-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
      .workflow-primary{min-width:170px}
      .workflow-pipeline{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:14px}
      .workflow-stage{position:relative;padding:12px 10px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.035);color:var(--muted);font-size:.7rem;font-weight:850;text-align:center}
      .workflow-stage.done{border-color:rgba(59,217,139,.28);color:#c8ffdf;background:rgba(59,217,139,.08)}
      .workflow-stage.current{border-color:rgba(240,206,115,.6);color:#061323;background:linear-gradient(135deg,var(--gold),var(--gold2))}
      .workflow-stage span{display:block;font-size:.62rem;opacity:.78;margin-top:4px}
      .workflow-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:14px}
      .workflow-card{border:1px solid var(--line);border-radius:20px;padding:16px;background:rgba(255,255,255,.035)}
      .workflow-card h3{margin:.35rem 0 .8rem}
      .workflow-facts{display:grid;grid-template-columns:1fr 1fr;gap:9px}
      .workflow-fact{padding:11px;border:1px solid rgba(245,241,232,.1);border-radius:14px;background:rgba(6,19,35,.38)}
      .workflow-fact small{display:block;color:var(--gold2);font-size:.62rem;font-weight:850;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
      .workflow-checklist{display:grid;gap:8px}
      .workflow-check{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.025)}
      .workflow-check.ok b{color:#c8ffdf}.workflow-check.missing b{color:#ffe7a6}
      .application-readonly{border:1px solid var(--line);border-radius:18px;padding:16px;background:rgba(255,255,255,.035)}
      .application-readonly pre{margin:10px 0 0;white-space:pre-wrap;color:var(--muted);font-size:.8rem;max-height:52vh;overflow:auto}
      @media(max-width:980px){#business .business-room,.workflow-grid{grid-template-columns:1fr}#business .business-filter{position:static}.workflow-pipeline{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:620px){#business .business-search-actions,.workflow-command,.workflow-facts{grid-template-columns:1fr}.workflow-actions{justify-content:flex-start}.workflow-pipeline{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(style);

    const main = room.children[1];
    main.className = 'business-main';
    main.innerHTML = `
      <div class="queue-header">
        <div><span class="eyebrow">Business Application Workflow</span><h2>Business Network</h2><p>Open an application, complete the current step, and move it forward.</p></div>
        <button class="btn primary" type="button" id="addBusinessRecord">Add Business</button>
      </div>
      <div class="business-list" id="businessList"></div>`;

    filterPanel.innerHTML = `
      <span class="eyebrow">Business Views</span>
      <div class="business-search-actions">
        <div class="field"><label>Search Business</label><input id="businessSearch" placeholder="Name, city, category..."></div>
        <button class="btn primary" id="businessSearchButton" type="button">Search</button>
      </div>
      <div class="filter-stack" id="businessStatusFilters"></div>
      <div class="filter-stack">
        <div class="field"><label>Category</label><select id="businessCategory"><option value="all">All Categories</option></select></div>
        <div class="field"><label>Sort</label><select id="businessSortSelect"><option value="workflow">Workflow Priority</option><option value="updated">Recently Updated</option><option value="name">Alphabetical</option><option value="newest">Newest</option></select></div>
      </div>`;

    window.businessSearch = document.getElementById('businessSearch');
    window.businessStatusFilters = document.getElementById('businessStatusFilters');
    window.businessList = document.getElementById('businessList');
    const categorySelect = document.getElementById('businessCategory');
    const sortSelect = document.getElementById('businessSortSelect');
    let categoryView = 'all';

    const getBusinesses = () => typeof window.businessRecords === 'function' ? window.businessRecords() : [];
    const stageIndex = (status) => Math.max(0, workflowStages.findIndex(stage => stage.key === normalizeStage(status)));
    const stageInfo = (status) => workflowStages[stageIndex(status)] || workflowStages[0];

    window.renderBusiness = function renderWorkflowQueue(){
      const all = getBusinesses();
      const views = [
        {key:'all',label:'All Businesses'},
        {key:'new',label:'New'},
        {key:'pending review',label:'In Review'},
        {key:'pending',label:'Waiting'},
        {key:'approved',label:'Approved'},
        {key:'published',label:'Published'},
        {key:'active',label:'Active'},
        {key:'archived',label:'Archived'}
      ];

      businessStatusFilters.innerHTML = views.map(view => {
        const count = all.filter(record => view.key === 'all' || normalizeStage(record.status) === view.key || record.status === view.key).length;
        return `<button class="btn filter-btn ${window.businessView===view.key?'primary':''}" data-status="${escapeHtml(view.key)}"><span>${view.label}</span><span>${count}</span></button>`;
      }).join('');

      businessStatusFilters.querySelectorAll('[data-status]').forEach(button => button.onclick = () => {
        window.businessView = button.dataset.status;
        window.renderBusiness();
      });

      const categories = ['all', ...new Set(all.map(record => record.category).filter(Boolean).sort((a,b)=>a.localeCompare(b)))];
      categorySelect.innerHTML = categories.map(category => `<option value="${escapeHtml(category)}" ${category===categoryView?'selected':''}>${category==='all'?'All Categories':escapeHtml(category)}</option>`).join('');

      const query = businessSearch.value.toLowerCase().trim();
      let filtered = all.filter(record => {
        const recordStage = normalizeStage(record.status);
        const matchesView = window.businessView === 'all' || recordStage === window.businessView || record.status === window.businessView;
        const matchesCategory = categoryView === 'all' || record.category === categoryView;
        const matchesSearch = !query || [record.name,record.category,record.city,record.email,record.phone,record.status,record.description].join(' ').toLowerCase().includes(query);
        return matchesView && matchesCategory && matchesSearch;
      });

      filtered.sort((a,b) => {
        if(sortSelect.value === 'name') return String(a.name).localeCompare(String(b.name));
        if(sortSelect.value === 'newest') return String(b.created_at||'').localeCompare(String(a.created_at||''));
        if(sortSelect.value === 'updated') return String(b.raw?.updated_at||b.created_at||'').localeCompare(String(a.raw?.updated_at||a.created_at||''));
        return stageIndex(a.status)-stageIndex(b.status) || String(b.created_at||'').localeCompare(String(a.created_at||''));
      });

      businessList.innerHTML = filtered.length ? filtered.map(record => {
        const stage = stageInfo(record.status);
        return `<button class="business-row" onclick="openBusiness('${escapeHtml(record.source)}','${escapeHtml(record.id)}')"><span><strong>${escapeHtml(record.name)}</strong><small>${escapeHtml([record.category,record.city,record.email||record.phone].filter(Boolean).join(' · '))}</small><span class="next-step">Next: ${escapeHtml(stage.action)}</span></span><span class="status ${escapeHtml(record.status.replace(/\s+/g,'-'))}">${escapeHtml(stage.label)}</span></button>`;
      }).join('') : '<div class="empty">No business applications match this view.</div>';
    };

    document.getElementById('businessSearchButton').onclick = window.renderBusiness;
    document.getElementById('addBusinessRecord').onclick = () => document.getElementById('manualBtn')?.click();
    businessSearch.addEventListener('keydown', event => { if(event.key === 'Enter') window.renderBusiness(); });
    categorySelect.onchange = () => { categoryView = categorySelect.value; window.renderBusiness(); };
    sortSelect.onchange = window.renderBusiness;
    window.renderBusiness();

    const originalOpenBusiness = window.openBusiness;
    if (typeof originalOpenBusiness !== 'function') return;

    window.openBusiness = function openWorkflowWorkspace(source,id){
      originalOpenBusiness(source,id);
      const record = getBusinesses().find(item => item.source === source && item.id === id);
      const modalBody = document.getElementById('modalBody');
      const tabs = [...modalBody.querySelectorAll('.tabs [data-tab]')];
      const panels = [...modalBody.querySelectorAll(':scope > section.tab')];
      if(!record || tabs.length !== 6 || panels.length !== 6) return;

      const statusSelect = document.getElementById('f_status');
      ['approved','active'].forEach(value => {
        if(statusSelect && ![...statusSelect.options].some(option => option.value === value)) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          statusSelect.appendChild(option);
        }
      });

      const rawApplication = panels[5].querySelector('pre')?.textContent || 'Original submission details are unavailable.';
      panels[4].innerHTML = `<div class="application-readonly"><span class="eyebrow">Original Application</span><h3>Submitted information</h3><p style="color:var(--muted)">This is the original intake record and remains read-only.</p><pre></pre></div>`;
      panels[4].querySelector('pre').textContent = rawApplication;

      const order = [0,4,1,2,3,5];
      const labels = ['Workflow','Application','Public Listing','Internal','Documents','History'];
      const tabBar = modalBody.querySelector('.tabs');
      order.forEach((oldIndex,newIndex) => {
        const tab = tabs[oldIndex];
        const panel = panels[oldIndex];
        tab.textContent = labels[newIndex];
        tab.dataset.tab = String(newIndex);
        tabBar.appendChild(tab);
        modalBody.appendChild(panel);
      });

      const reordered = [...modalBody.querySelectorAll(':scope > section.tab')];
      [...tabBar.querySelectorAll('[data-tab]')].forEach((button,index) => {
        button.classList.toggle('primary',index===0);
        button.onclick = () => {
          [...tabBar.querySelectorAll('[data-tab]')].forEach(item => item.classList.toggle('primary',item===button));
          reordered.forEach((panel,panelIndex) => panel.classList.toggle('active',panelIndex===index));
        };
      });
      reordered.forEach((panel,index) => panel.classList.toggle('active',index===0));

      const currentIndex = stageIndex(record.status);
      const currentStage = workflowStages[currentIndex];
      const nextStage = workflowStages[Math.min(currentIndex + 1, workflowStages.length - 1)];
      const missing = [
        ['Business description',Boolean(record.description)],
        ['Contact method',Boolean(record.email || record.phone)],
        ['Address',Boolean(record.address)],
        ['Website',Boolean(record.website)],
        ['Logo or photo',Boolean(record.photos)]
      ];

      const originalOverview = reordered[0];
      originalOverview.innerHTML = `
        <div class="workflow-command">
          <div><span class="eyebrow">Current Workflow Stage</span><h2>${escapeHtml(currentStage.label)}</h2><p>${escapeHtml(currentStage.action)}</p></div>
          <div class="workflow-actions">
            ${currentStage.key==='new'?'<button class="btn primary workflow-primary" data-move="pending review">Start Review</button>':''}
            ${currentStage.key==='pending review'?'<button class="btn primary workflow-primary" data-move="approved">Approve Application</button><button class="btn" data-move="pending">Request Information</button>':''}
            ${currentStage.key==='pending'?'<button class="btn primary workflow-primary" data-move="pending review">Resume Review</button>':''}
            ${currentStage.key==='approved'?'<button class="btn primary workflow-primary" data-open-tab="2">Prepare Public Listing</button>':''}
            ${currentStage.key==='published'?'<button class="btn primary workflow-primary" data-move="active">Mark Active</button>':''}
            ${currentStage.key==='active'?'<button class="btn primary workflow-primary" data-open-tab="2">Maintain Listing</button>':''}
            <button class="btn" data-open-tab="1">View Application</button>
          </div>
        </div>
        <div class="workflow-pipeline">${workflowStages.map((stage,index)=>`<div class="workflow-stage ${index<currentIndex?'done':''} ${index===currentIndex?'current':''}">${escapeHtml(stage.label)}<span>${index<currentIndex?'Complete':index===currentIndex?'Current':'Upcoming'}</span></div>`).join('')}</div>
        <div class="workflow-grid">
          <div class="workflow-card"><span class="eyebrow">Business Summary</span><h3>${escapeHtml(record.name)}</h3><div class="workflow-facts"><div class="workflow-fact"><small>Category</small>${escapeHtml(record.category||'Not provided')}</div><div class="workflow-fact"><small>Location</small>${escapeHtml([record.address,record.city].filter(Boolean).join(', ')||'Not provided')}</div><div class="workflow-fact"><small>Contact</small>${escapeHtml(record.contact||'Not provided')}</div><div class="workflow-fact"><small>Email / Phone</small>${escapeHtml(record.email||record.phone||'Not provided')}</div></div></div>
          <div class="workflow-card"><span class="eyebrow">Ready for Next Step?</span><h3>Application checklist</h3><div class="workflow-checklist">${missing.map(([label,ok])=>`<div class="workflow-check ${ok?'ok':'missing'}"><span>${escapeHtml(label)}</span><b>${ok?'Complete':'Missing'}</b></div>`).join('')}</div></div>
        </div>`;

      const activateTab = (index) => tabBar.querySelector(`[data-tab="${index}"]`)?.click();
      originalOverview.querySelectorAll('[data-open-tab]').forEach(button => button.onclick = () => activateTab(button.dataset.openTab));
      originalOverview.querySelectorAll('[data-move]').forEach(button => button.onclick = () => {
        if(!statusSelect || !window.businessForm) return;
        statusSelect.value = button.dataset.move;
        window.businessForm.requestSubmit();
      });

      const publicListingForm = document.getElementById('businessForm');
      if(publicListingForm) {
        const originalSubmit = publicListingForm.onsubmit;
        publicListingForm.onsubmit = (event) => {
          if(statusSelect && normalizeStage(record.status) === 'approved' && statusSelect.value === record.status) statusSelect.value = 'published';
          originalSubmit?.call(publicListingForm,event);
        };
      }
    };
  });
})();
