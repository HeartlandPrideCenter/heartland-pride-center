(() => {
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once:true }) : fn();
  ready(() => {
    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
    const token = () => sessionStorage.getItem('hpcAtlasAccessToken') || window.HPC_DATA_PUBLIC_TOKEN;
    const headers = (prefer='return=representation') => ({apikey:window.HPC_DATA_PUBLIC_TOKEN,Authorization:`Bearer ${token()}`,'Content-Type':'application/json',Prefer:prefer});
    const types = ['All Record Types','Organization','Person','Partner','Event','Resource','Other'];

    const parseType = row => {
      const explicit = String(row.record_type || row.type || '').trim();
      if (explicit) return explicit.replace(/\b\w/g,c=>c.toUpperCase());
      const match = String(row.notes || '').match(/Master Record Type:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Organization';
    };
    const rows = () => typeof window.businessRecords === 'function' ? window.businessRecords().filter(r => String(r.source || '').startsWith('businesses')) : [];

    async function write(method,id,payload){
      const url=`${window.HPC_DATA_URL}/rest/v1/businesses${id==null?'':`?id=eq.${encodeURIComponent(id)}`}`;
      const res=await fetch(url,{method,headers:headers(method==='PATCH'?'return=minimal':'return=representation'),body:JSON.stringify(payload)});
      if(!res.ok)throw new Error((await res.text())||`Save failed (${res.status})`);
      return method==='PATCH'?null:(await res.json());
    }

    function field(id,label,value='',type='text'){
      return `<div class="work-field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`;
    }

    function showMasterChrome(){
      $('manualTop')?.style.setProperty('display','none','important');
      $('searchPanel')?.style.setProperty('display','none','important');
    }
    function restoreChrome(){
      if($('manualTop')) $('manualTop').style.removeProperty('display');
      if($('searchPanel')) $('searchPanel').style.removeProperty('display');
    }

    function openMasterRecord(row=null,selectedType='Organization'){
      const type=row?parseType(row):selectedType;
      $('modalEyebrow').textContent='Master Record';
      $('modalTitle').textContent=row?(row.name||'Master Record'):'New Master Record';
      $('modalSub').textContent=row?`${type} · Master ID ${row.id}`:`Create a shared ${type.toLowerCase()} identity`;
      $('modalBody').innerHTML=`
        <div class="workspace-tabs"><button class="btn active" data-tab="identity">Identity</button><button class="btn" data-tab="contact">Contact</button><button class="btn" data-tab="address">Address</button></div>
        <section class="workspace-pane active" data-pane="identity"><div class="work-card"><span class="eyebrow">Shared Identity</span><h3>${esc(type)} Master Record</h3><div class="work-field"><label>Record Type</label><select id="mrType">${types.slice(1).map(t=>`<option ${t===type?'selected':''}>${t}</option>`).join('')}</select></div>${field('mrName',type==='Person'?'Full Name':'Name',row?.name||'')}${field('mrWebsite','Website',row?.website||'')}</div></section>
        <section class="workspace-pane" data-pane="contact"><div class="work-grid"><div class="work-card">${field('mrContact','Primary Contact',row?.contact||row?.contact_name||'')}${field('mrEmail','Primary Email',row?.email||'','email')}${field('mrPhone','Primary Phone',row?.phone||'')}</div><div class="work-card"><div class="notice">This information is shared by every department that pulls this master file. Department workflow, notes, documents, and statuses do not belong here.</div></div></div></section>
        <section class="workspace-pane" data-pane="address"><div class="work-grid"><div class="work-card">${field('mrAddress','Physical Address',row?.address||'')}${field('mrCity','City',row?.city||'')}${field('mrState','State',row?.state||'FL')}${field('mrZip','ZIP Code',row?.zip||row?.postal_code||'')}</div><div class="work-card">${field('mrMailing','Mailing Address',row?.mailing_address||row?.address||'')}</div></div></section>
        <div class="ops-actions" style="margin-top:14px"><button class="btn primary" id="saveUniversalMaster">${row?'Save Master Record':'Create Master Record'}</button></div>`;
      $('modalBackdrop').classList.add('open');
      document.querySelectorAll('.workspace-tabs [data-tab]').forEach(b=>b.onclick=()=>{
        document.querySelectorAll('.workspace-tabs [data-tab]').forEach(x=>x.classList.toggle('active',x===b));
        document.querySelectorAll('.workspace-pane').forEach(p=>p.classList.toggle('active',p.dataset.pane===b.dataset.tab));
      });
      $('saveUniversalMaster').onclick=async()=>{
        const recordType=$('mrType').value;
        const existingNotes=String(row?.notes||'').replace(/Master Record Type:\s*[^\n]+\n?/i,'').trim();
        const payload={name:$('mrName').value.trim(),website:$('mrWebsite').value.trim(),contact_name:$('mrContact').value.trim(),email:$('mrEmail').value.trim(),phone:$('mrPhone').value.trim(),address:$('mrAddress').value.trim(),city:$('mrCity').value.trim(),status:row?.status||'active',notes:`Master Record Type: ${recordType}${existingNotes?`\n${existingNotes}`:''}`};
        if(!payload.name)return alert('A name is required.');
        try{await write(row?'PATCH':'POST',row?.id,payload);window.showToast?.('Master record saved.');$('modalBackdrop').classList.remove('open');$('reloadBtn')?.click();setTimeout(renderSurface,700);}catch(e){alert(`Could not save master record: ${e.message}`);}
      };
    }

    function chooseType(){
      $('modalEyebrow').textContent='New Master Record';
      $('modalTitle').textContent='Choose Record Type';
      $('modalSub').textContent='Create one shared file that every department can use.';
      $('modalBody').innerHTML=`<div class="work-card"><span class="eyebrow">Master Filing Cabinet</span><h3>What kind of master record are you creating?</h3><div class="type-picker" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:14px">${types.slice(1).map(t=>`<button class="btn" data-create-type="${t}" style="min-height:54px">${t}</button>`).join('')}</div></div>`;
      $('modalBackdrop').classList.add('open');
      $('modalBody').querySelectorAll('[data-create-type]').forEach(b=>b.onclick=()=>openMasterRecord(null,b.dataset.createType));
    }

    function renderSurface(){
      const section=$('masters');if(!section)return;
      const all=rows();
      section.innerHTML=`<div class="registry-main"><div class="registry-tools"><div><span class="eyebrow">Master Records Registry</span><h2 style="margin:.25rem 0">Master Records</h2><p style="color:var(--muted);margin:0">The shared filing cabinet used by every department.</p></div><button class="btn primary" id="newUniversalMaster">New Master Record</button></div><div class="master-search-bar" style="display:grid;grid-template-columns:minmax(260px,1fr) 220px;gap:10px;margin-bottom:14px"><div class="field" style="margin:0"><label>Search</label><input id="universalMasterSearch" placeholder="Name, address, email, phone..."></div><div class="field" style="margin:0"><label>Record Type</label><select id="universalMasterType">${types.map(t=>`<option>${t}</option>`).join('')}</select></div></div><div class="registry-list" id="universalMasterList"></div></div>`;
      const search=$('universalMasterSearch'),type=$('universalMasterType'),list=$('universalMasterList');
      const draw=()=>{const q=search.value.trim().toLowerCase(),chosen=type.value;const filtered=all.filter(r=>(chosen==='All Record Types'||parseType(r)===chosen)&&(!q||[r.name,r.address,r.city,r.email,r.phone,r.website].join(' ').toLowerCase().includes(q)));list.innerHTML=filtered.length?filtered.map(r=>`<button class="registry-row" data-master-open="${esc(r.id)}"><span><strong>${esc(r.name||'Unnamed master record')}</strong><small>${esc(parseType(r))}</small><small>${esc([r.address,r.city,r.email,r.phone].filter(Boolean).join(' · '))}</small></span></button>`).join(''):'<div class="empty">No master records match this search.</div>';list.querySelectorAll('[data-master-open]').forEach(b=>b.onclick=()=>openMasterRecord(all.find(r=>String(r.id)===String(b.dataset.masterOpen)));};
      search.addEventListener('input',draw);type.addEventListener('change',draw);$('newUniversalMaster').onclick=chooseType;draw();
    }

    document.querySelectorAll('.nav [data-view]').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.view==='masters'){showMasterChrome();setTimeout(renderSurface,40);}else restoreChrome();
    }));

    const observer=new MutationObserver(()=>{if($('masters')?.classList.contains('active')){showMasterChrome();if(!$('universalMasterList'))renderSurface();}});
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  });
})();