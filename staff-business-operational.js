(() => {
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once:true }) : fn();
  ready(() => {
    const section = document.getElementById('business');
    const room = section?.querySelector('.business-room');
    const filter = section?.querySelector('.business-filter');
    if (!section || !room || !filter || typeof window.businessRecords !== 'function') return;

    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const token = () => sessionStorage.getItem('hpcAtlasAccessToken') || window.HPC_DATA_PUBLIC_TOKEN || '';
    const headers = (prefer='return=representation') => ({apikey:window.HPC_DATA_PUBLIC_TOKEN,Authorization:`Bearer ${token()}`,'Content-Type':'application/json',Prefer:prefer});
    const sourceTable = (source) => source === 'applications' ? 'applications' : source === 'business_listings' ? 'business_listings' : String(source).startsWith('businesses') ? 'businesses' : '';
    const canonical = (r) => `${sourceTable(r.source)||r.source}:${r.id}`;
    const dedupe = (rows) => { const map=new Map(); rows.forEach(r=>{ const key=canonical(r); if(!map.has(key) || r.source==='businesses') map.set(key,r); }); return [...map.values()]; };
    const statuses = ['new','in review','waiting','approved','published','active','declined','archived'];
    let currentView='all', currentRecord=null;

    const style=document.createElement('style');
    style.textContent=`
      #business .business-room{grid-template-columns:260px 1fr;gap:14px}#business .business-filter{padding:14px;border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.05)}
      #business .ops-main{border:1px solid var(--line);border-radius:22px;padding:18px;background:rgba(255,255,255,.05)}#business .ops-list{display:grid;gap:8px}
      #business .ops-row{width:100%;text-align:left;border:1px solid var(--line);border-radius:16px;padding:14px;background:rgba(255,255,255,.035);color:var(--cream);display:grid;grid-template-columns:1fr auto;gap:12px;cursor:pointer}
      #business .ops-row:hover{border-color:rgba(240,206,115,.5)}#business .ops-row small{display:block;color:var(--muted);margin-top:4px}.ops-next{display:block;color:var(--gold2);font-size:.72rem;margin-top:7px;font-weight:800}
      .ops-workspace{display:grid;gap:14px}.ops-stage{border:1px solid rgba(240,206,115,.35);border-radius:20px;padding:18px;background:rgba(212,175,55,.09)}.ops-stage h2{margin:.25rem 0 .4rem}.ops-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .ops-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ops-card{border:1px solid var(--line);border-radius:18px;padding:15px;background:rgba(255,255,255,.035)}.ops-card h3{margin:.25rem 0 .8rem}.ops-field{display:grid;gap:6px;margin:9px 0}.ops-field input,.ops-field textarea,.ops-field select{width:100%;border:1px solid var(--line);border-radius:12px;background:rgba(6,19,35,.72);color:var(--cream);padding:11px}.ops-field textarea{min-height:95px}.ops-status-line{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid rgba(245,241,232,.08)}.ops-status-line:last-child{border-bottom:0}
      @media(max-width:900px){#business .business-room,.ops-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const main=room.children[1]; main.className='ops-main';
    filter.innerHTML=`<span class="eyebrow">Business Workflow</span><div class="field"><label>Search</label><input id="opsSearch" placeholder="Business name, city, category..."></div><div class="filter-stack" id="opsFilters"></div>`;
    main.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div><span class="eyebrow">Operational Queue</span><h2 style="margin:.25rem 0">Business Network</h2><p style="color:var(--muted);margin:0 0 14px">Every item here must be actionable.</p></div><button class="btn primary" id="opsAdd">Add Business</button></div><div class="ops-list" id="opsList"></div>`;

    const allRecords=()=>dedupe(window.businessRecords());
    const nextAction=(s)=>({new:'Review application','in review':'Approve, request information, or decline',waiting:'Follow up and resume review',approved:'Prepare and publish listing',published:'Confirm and activate listing',active:'Maintain listing',declined:'No further action',archived:'No further action'}[String(s||'new').toLowerCase()]||'Review record');
    const normalizeStatus=(s)=>{s=String(s||'new').toLowerCase(); if(s==='pending review')return'in review'; if(s==='pending')return'waiting'; if(s==='draft')return'new'; return s;};

    function render(){
      const rows=allRecords();
      const views=['all','new','in review','waiting','approved','published','active','declined','archived'];
      opsFilters.innerHTML=views.map(v=>`<button class="btn filter-btn ${currentView===v?'primary':''}" data-v="${v}"><span>${v==='all'?'All Businesses':v.replace(/\b\w/g,c=>c.toUpperCase())}</span><span>${rows.filter(r=>v==='all'||normalizeStatus(r.status)===v).length}</span></button>`).join('');
      opsFilters.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{currentView=b.dataset.v;render();});
      const q=opsSearch.value.toLowerCase();
      const filtered=rows.filter(r=>(currentView==='all'||normalizeStatus(r.status)===currentView)&&(!q||[r.name,r.city,r.category,r.email,r.phone].join(' ').toLowerCase().includes(q)));
      opsList.innerHTML=filtered.length?filtered.map(r=>`<button class="ops-row" data-source="${esc(r.source)}" data-id="${esc(r.id)}"><span><strong>${esc(r.name)}</strong><small>${esc([r.category,r.city,r.email||r.phone].filter(Boolean).join(' · '))}</small><span class="ops-next">Next: ${esc(nextAction(normalizeStatus(r.status)))}</span></span><span class="status ${esc(normalizeStatus(r.status).replace(/\s+/g,'-'))}">${esc(normalizeStatus(r.status))}</span></button>`).join(''):'<div class="empty">No records in this workflow stage.</div>';
      opsList.querySelectorAll('.ops-row').forEach(b=>b.onclick=()=>openWorkspace(b.dataset.source,b.dataset.id));
    }

    async function patchRecord(record,payload){
      if(record.source==='manual'){
        const manual=JSON.parse(localStorage.getItem('hpcManualIntake')||'[]'); const item=manual.find(x=>String(x.id)===String(record.id)); if(!item)throw new Error('Manual record not found'); Object.assign(item,payload,{updated_at:new Date().toISOString()}); localStorage.setItem('hpcManualIntake',JSON.stringify(manual)); return;
      }
      const table=sourceTable(record.source); if(!table)throw new Error('Unsupported record source');
      const res=await fetch(`${window.HPC_DATA_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(record.id)}`,{method:'PATCH',headers:headers('return=minimal'),body:JSON.stringify(payload)});
      if(!res.ok)throw new Error((await res.text())||`Update failed (${res.status})`);
    }

    async function saveAndReload(record,payload,message){
      try{await patchRecord(record,payload); if(window.showToast)window.showToast(message); document.getElementById('modalBackdrop').classList.remove('open'); document.getElementById('reloadBtn')?.click();}
      catch(e){console.error(e); alert(`Could not complete action: ${e.message}`);}
    }

    function field(id,label,value,type='text'){return `<div class="ops-field"><label>${label}</label>${type==='textarea'?`<textarea id="${id}">${esc(value)}</textarea>`:`<input id="${id}" type="${type}" value="${esc(value)}">`}</div>`;}

    function openWorkspace(source,id){
      currentRecord=allRecords().find(r=>r.source===source&&String(r.id)===String(id)); if(!currentRecord)return;
      const r=currentRecord, s=normalizeStatus(r.status); modalEyebrow.textContent='Business Network Workflow'; modalTitle.textContent=r.name; modalSub.textContent=`${s} · ${r.source}`;
      modalBody.innerHTML=`<div class="ops-workspace"><div class="ops-stage"><span class="eyebrow">Current Step</span><h2>${esc(nextAction(s))}</h2><p style="color:var(--muted)">Complete the action below. The same record moves forward.</p><div class="ops-actions">
        ${s==='new'?'<button class="btn primary" data-status="in review">Start Review</button>':''}
        ${s==='in review'?'<button class="btn primary" data-status="approved">Approve</button><button class="btn" id="requestInfo">Request Information</button><button class="btn" data-status="declined">Decline</button>':''}
        ${s==='waiting'?'<button class="btn primary" data-status="in review">Resume Review</button>':''}
        ${s==='approved'?'<button class="btn primary" id="publishListing">Save & Publish Listing</button>':''}
        ${s==='published'?'<button class="btn primary" data-status="active">Mark Active</button>':''}
        ${s==='active'?'<button class="btn primary" id="saveListing">Save Listing Changes</button><button class="btn" data-status="archived">Archive</button>':''}
      </div></div><div class="ops-grid"><div class="ops-card"><span class="eyebrow">Application / Master Record</span><h3>Business information</h3>${field('opName','Business Name',r.name)}${field('opContact','Contact Person',r.contact)}${field('opEmail','Email',r.email,'email')}${field('opPhone','Phone',r.phone)}${field('opWebsite','Website',r.website)}${field('opAddress','Address',r.address)}${field('opCity','City',r.city)}${field('opCategory','Category',r.category)}</div><div class="ops-card"><span class="eyebrow">Public Listing</span><h3>Land of Hearts listing</h3>${field('opDescription','Public Description',r.description,'textarea')}${field('opPhotos','Logo / Photo URLs',r.photos,'textarea')}${field('opBadges','Badges',r.badges,'textarea')}<div class="ops-status-line"><span>Current status</span><strong>${esc(s)}</strong></div><div class="ops-status-line"><span>Application source</span><strong>${esc(r.source)}</strong></div></div></div></div>`;
      modalBackdrop.classList.add('open');
      modalBody.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>saveAndReload(r,{status:b.dataset.status},`Business moved to ${b.dataset.status}.`));
      const payload=()=>({name:opName.value,contact_name:opContact.value,email:opEmail.value,phone:opPhone.value,website:opWebsite.value,address:opAddress.value,city:opCity.value,category:opCategory.value,description:opDescription.value,status:s,notes:r.notes});
      document.getElementById('requestInfo')?.addEventListener('click',()=>{ const subject=encodeURIComponent(`Information needed for your Heartland Pride Center business application`); const body=encodeURIComponent(`Hello ${r.contact||''},\n\nWe are reviewing your business application and need additional information before we can continue.\n\nThank you,\nHeartland Pride Center`); window.location.href=`mailto:${encodeURIComponent(r.email||'')}?subject=${subject}&body=${body}`; saveAndReload(r,{status:'waiting'},'Business moved to waiting for information.'); });
      document.getElementById('publishListing')?.addEventListener('click',()=>saveAndReload(r,{...payload(),status:'published'},'Business listing published.'));
      document.getElementById('saveListing')?.addEventListener('click',()=>saveAndReload(r,{...payload(),status:'active'},'Business listing updated.'));
    }

    opsSearch.addEventListener('input',render); document.getElementById('opsAdd').onclick=()=>document.getElementById('manualBtn')?.click(); render();
  });
})();
