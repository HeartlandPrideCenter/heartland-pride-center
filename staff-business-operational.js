(() => {
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();
  ready(() => {
    if (!window.HPC_DATA_URL || !window.HPC_DATA_PUBLIC_TOKEN || typeof window.businessRecords !== 'function') return;

    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[<>"'&]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    const token = () => sessionStorage.getItem('hpcAtlasAccessToken') || window.HPC_DATA_PUBLIC_TOKEN;
    const headers = (prefer = 'return=representation') => ({ apikey: window.HPC_DATA_PUBLIC_TOKEN, Authorization: `Bearer ${token()}`, 'Content-Type':'application/json', Prefer: prefer });
    const tableFor = source => source === 'applications' ? 'applications' : source === 'business_listings' ? 'business_listings' : String(source).startsWith('businesses') ? 'businesses' : '';
    const statusOf = value => { const s = String(value || 'active').toLowerCase(); return ['archived','inactive'].includes(s) ? s : 'active'; };
    const allRows = () => window.businessRecords();
    const masterRows = () => allRows().filter(r => tableFor(r.source) === 'businesses');
    const departmentRows = () => allRows().filter(r => tableFor(r.source) !== 'businesses');
    const masterType = row => {
      const direct = String(row.record_type || row.type || '').trim();
      if (direct) return direct.replace(/\b\w/g, c => c.toUpperCase());
      const match = String(row.notes || '').match(/Master Record Type:\s*([^\n]+)/i);
      return match ? match[1].trim() : 'Organization';
    };
    const matchMaster = row => masterRows().find(m => row.master_id && String(m.id) === String(row.master_id)) || masterRows().find(m => row.email && m.email && row.email.toLowerCase() === m.email.toLowerCase()) || masterRows().find(m => row.name && m.name && row.name.trim().toLowerCase() === m.name.trim().toLowerCase()) || null;

    const parseContacts = row => {
      const match = String(row?.notes || '').match(/Master Contacts JSON:\s*([^\n]+)/i);
      if (match) {
        try { return JSON.parse(decodeURIComponent(match[1])); } catch (_) {}
      }
      const initial = [];
      if (row?.contact || row?.contact_name || row?.email || row?.phone) initial.push({ id: crypto.randomUUID(), name: row.contact || row.contact_name || '', title: '', department: '', email: row.email || '', phone: row.phone || '', preferred: 'Email', active: true, primary: true });
      return initial;
    };
    const notesWithMetadata = (row, type, contacts) => {
      let notes = String(row?.notes || '').replace(/Master Record Type:\s*[^\n]+\n?/ig,'').replace(/Master Contacts JSON:\s*[^\n]+\n?/ig,'').trim();
      return `Master Record Type: ${type}\nMaster Contacts JSON: ${encodeURIComponent(JSON.stringify(contacts))}${notes ? `\n${notes}` : ''}`;
    };

    async function request(table, method, id, payload) {
      const response = await fetch(`${window.HPC_DATA_URL}/rest/v1/${table}${id == null ? '' : `?id=eq.${encodeURIComponent(id)}`}`, {
        method,
        headers: headers(method === 'PATCH' ? 'return=minimal' : 'return=representation'),
        body: payload ? JSON.stringify(payload) : undefined
      });
      if (!response.ok) throw new Error((await response.text()) || `${method} failed (${response.status})`);
      if (method === 'PATCH' || response.status === 204) return null;
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    }

    const style = document.createElement('style');
    style.textContent = `
      .registry-shell{display:grid;grid-template-columns:260px 1fr;gap:14px}.registry-filter,.registry-main{border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.05);padding:20px}.registry-filter{position:sticky;top:16px;align-self:start}.registry-list{display:grid;gap:8px}.registry-row{width:100%;text-align:left;border:1px solid var(--line);border-radius:16px;padding:16px 18px;background:rgba(255,255,255,.035);color:var(--cream);display:grid;grid-template-columns:1fr auto;gap:14px;cursor:pointer}.registry-row:hover{border-color:rgba(240,206,115,.55)}.registry-row small{display:block;color:var(--muted);margin-top:5px}.registry-tools{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:18px}.workspace-tabs{position:sticky;top:0;z-index:8;display:flex;gap:8px;flex-wrap:wrap;margin:-16px -16px 18px;padding:16px 20px;background:#071827;border-bottom:1px solid var(--line)}.workspace-tabs .btn.active{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#061323;border:0}.workspace-pane{display:none}.workspace-pane.active{display:block}.work-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.work-card{border:1px solid var(--line);border-radius:18px;padding:22px;background:rgba(255,255,255,.035)}.work-field{display:grid;gap:7px;margin:11px 0}.work-field input,.work-field textarea,.work-field select{width:100%;border:1px solid var(--line);border-radius:12px;background:rgba(6,19,35,.72);color:var(--cream);padding:12px}.work-field input[readonly],.work-field textarea[readonly]{opacity:.82;cursor:default}.record-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.record-meta div{border:1px solid var(--line);border-radius:14px;padding:15px;background:rgba(255,255,255,.03)}.record-meta small{display:block;color:var(--muted);margin-bottom:6px}.contact-card{border:1px solid var(--line);border-radius:16px;padding:18px;margin:10px 0;background:rgba(255,255,255,.03)}.contact-card.primary{border-color:rgba(240,206,115,.55)}.contact-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.contact-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.modal-head{padding:22px 24px!important}.modal-head .btn{margin:2px 4px 0 0}.modal-body{padding:16px 24px 26px!important}.ops-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.danger{border-color:rgba(255,122,130,.45)!important;color:#ffd1d4!important}@media(max-width:900px){.registry-shell,.work-grid,.record-meta{grid-template-columns:1fr}.registry-filter{position:static}.work-card{padding:18px}.modal-head{padding:20px!important}.modal-body{padding:14px 18px 24px!important}}
    `;
    document.head.appendChild(style);

    const nav = document.querySelector('.nav');
    const businessButton = nav?.querySelector('[data-view="business"]');
    let masterButton = nav?.querySelector('[data-view="masters"]');
    if (nav && businessButton && !masterButton) {
      masterButton = document.createElement('button');
      masterButton.className = 'btn';
      masterButton.dataset.view = 'masters';
      masterButton.textContent = 'Master Records';
      nav.insertBefore(masterButton, businessButton);
    }
    const businessSection = $('business');
    if (!businessSection) return;
    let masterSection = $('masters');
    if (!masterSection) {
      masterSection = document.createElement('section');
      masterSection.className = 'section';
      masterSection.id = 'masters';
      businessSection.parentNode.insertBefore(masterSection, businessSection);
    }

    const searchBox = $('searchBox');
    const statusFilter = $('statusFilter');
    const sourceFilter = $('sourceFilter');
    const searchPanel = $('searchPanel');
    const manualTop = $('manualTop');
    const statusLabel = statusFilter?.closest('.field')?.querySelector('label');
    const originalStatusHTML = statusFilter?.innerHTML || '';
    const originalStatusLabel = statusLabel?.textContent || 'Status';
    const originalSearchPlaceholder = searchBox?.placeholder || '';
    let masterMode = false;
    let businessFilter = 'all';

    function enterMasterMode() {
      masterMode = true;
      if (manualTop) manualTop.style.display = 'none';
      if (searchPanel) searchPanel.style.display = 'block';
      if (searchBox) searchBox.placeholder = 'Name, address, email, phone...';
      if (statusLabel) statusLabel.textContent = 'Record Type';
      if (statusFilter) {
        statusFilter.innerHTML = '<option value="all">All Record Types</option><option value="organization">Organization</option><option value="person">Person</option><option value="partner">Partner</option><option value="event">Event</option><option value="resource">Resource</option><option value="other">Other</option>';
        statusFilter.value = 'all';
      }
      const eyebrow = searchPanel?.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = 'Search Master Records';
    }
    function leaveMasterMode() {
      if (!masterMode) return;
      masterMode = false;
      if (manualTop) manualTop.style.removeProperty('display');
      if (searchBox) searchBox.placeholder = originalSearchPlaceholder;
      if (statusLabel) statusLabel.textContent = originalStatusLabel;
      if (statusFilter) { statusFilter.innerHTML = originalStatusHTML; statusFilter.value = 'all'; }
      const eyebrow = searchPanel?.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = 'Search & Sort';
    }
    function showSection(id,title,intro) {
      document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
      document.querySelectorAll('.nav [data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === id));
      if ($('pageTitle')) $('pageTitle').textContent = title;
      if ($('pageIntro')) $('pageIntro').textContent = intro;
    }
    function field(id,label,value='',type='text',readonly=false) {
      const ro = readonly ? ' readonly' : '';
      return `<div class="work-field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${esc(value)}"${ro}></div>`;
    }

    function renderMasterRegistry() {
      const rows = masterRows();
      masterSection.innerHTML = `<div class="registry-shell"><aside class="registry-filter"><span class="eyebrow">Shared Filing Cabinet</span><p style="color:var(--muted);line-height:1.55">Master records are created and maintained here, then used by every department that opens its own department file.</p></aside><div class="registry-main"><div class="registry-tools"><div><span class="eyebrow">Master Records Registry</span><h2 style="margin:.25rem 0">Master Records</h2><p style="color:var(--muted);margin:0">Shared identity records available to all departments.</p></div><button class="btn primary" id="addMasterRecord">Add Master Record</button></div><div class="registry-list" id="masterRegistryList"></div></div></div>`;
      const list = $('masterRegistryList');
      const draw = () => {
        const q = String(searchBox?.value || '').trim().toLowerCase();
        const type = String(statusFilter?.value || 'all').toLowerCase();
        const source = String(sourceFilter?.value || 'all');
        const filtered = rows.filter(r => (type === 'all' || masterType(r).toLowerCase() === type) && (source === 'all' || String(r.source) === source) && (!q || [r.name,r.email,r.phone,r.address,r.city,r.website].join(' ').toLowerCase().includes(q)));
        list.innerHTML = filtered.length ? filtered.map(r => `<button class="registry-row" data-master-id="${esc(r.id)}"><span><strong>${esc(r.name || 'Unnamed master record')}</strong><small>${esc(masterType(r))}</small><small>${esc([r.address,r.city,r.email,r.phone].filter(Boolean).join(' · '))}</small></span><span class="chip">${esc(masterType(r))}</span></button>`).join('') : '<div class="empty">No master records match this search.</div>';
        list.querySelectorAll('[data-master-id]').forEach(b => b.onclick = () => openMasterWorkspace(b.dataset.masterId));
      };
      searchBox?.addEventListener('input',draw);
      statusFilter?.addEventListener('change',draw);
      sourceFilter?.addEventListener('change',draw);
      $('clearFilters')?.addEventListener('click',() => setTimeout(draw,0));
      $('addMasterRecord').onclick = () => openMasterWorkspace(null);
      draw();
    }

    function renderBusinessRegistry() {
      const rows = departmentRows();
      businessSection.innerHTML = `<div class="registry-shell"><aside class="registry-filter"><span class="eyebrow">Business Network</span><div class="field"><label>Search</label><input id="bnSearch" placeholder="Business name, category, city..."></div><div class="filter-stack" id="bnFilters"></div></aside><div class="registry-main"><div class="registry-tools"><div><span class="eyebrow">Department Registry</span><h2 style="margin:.25rem 0">Business Network Records</h2><p style="color:var(--muted);margin:0">Business Network owns these records and its public production.</p></div><button class="btn primary" id="addBusinessRecord">Add Business Record</button></div><div class="registry-list" id="bnList"></div></div></div>`;
      const statuses = ['all','new','in review','waiting','approved','published','active','declined','archived'];
      $('bnFilters').innerHTML = statuses.map(s => `<button class="btn filter-btn ${businessFilter===s?'primary':''}" data-bn-filter="${s}"><span>${s==='all'?'All Records':s.replace(/\b\w/g,c=>c.toUpperCase())}</span><span>${rows.filter(r=>s==='all'||String(r.status||'new').toLowerCase()===s).length}</span></button>`).join('');
      $('bnFilters').querySelectorAll('[data-bn-filter]').forEach(b => b.onclick = () => { businessFilter = b.dataset.bnFilter; renderBusinessRegistry(); });
      const search = $('bnSearch'), list = $('bnList');
      const draw = () => {
        const q = search.value.trim().toLowerCase();
        const filtered = rows.filter(r => (businessFilter === 'all' || String(r.status || 'new').toLowerCase() === businessFilter) && (!q || [r.name,r.category,r.city,r.email,r.phone].join(' ').toLowerCase().includes(q)));
        list.innerHTML = filtered.length ? filtered.map(r => { const master = matchMaster(r); return `<button class="registry-row" data-source="${esc(r.source)}" data-id="${esc(r.id)}"><span><strong>${esc(r.name || 'Unnamed business')}</strong><small>${esc([r.category,r.city,r.email||r.phone].filter(Boolean).join(' · '))}</small><small>Master: ${esc(master ? master.name : 'Not linked')}</small></span><span class="status">${esc(String(r.status||'new'))}</span></button>`; }).join('') : '<div class="empty">No department records match this view.</div>';
        list.querySelectorAll('[data-source]').forEach(b => b.onclick = () => openBusinessWorkspace(b.dataset.source,b.dataset.id));
      };
      search.addEventListener('input',draw);
      $('addBusinessRecord').onclick = () => $('manualBtn')?.click();
      draw();
    }

    function activateTab(name) {
      document.querySelectorAll('.workspace-tabs [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
      document.querySelectorAll('.workspace-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === name));
    }

    function openMasterWorkspace(id) {
      const row = id == null ? null : masterRows().find(r => String(r.id) === String(id));
      let contacts = parseContacts(row);
      let editingMain = !row;
      let dirty = false;
      const recordType = masterType(row || {});
      const usedBy = departmentRows().filter(r => matchMaster(r)?.id && String(matchMaster(r).id) === String(row?.id));

      $('modalEyebrow').textContent = 'Master Record';
      $('modalTitle').textContent = row ? row.name : 'New Master Record';
      $('modalSub').textContent = row ? `${recordType} · Master Record ${row.id}` : 'Create shared identity record';
      $('modalBody').innerHTML = `
        <div class="workspace-tabs"><button class="btn active" data-tab="main">Main</button><button class="btn" data-tab="contacts">Contacts</button><button class="btn" data-tab="administration">Administration</button></div>
        <section class="workspace-pane active" data-pane="main"><div class="work-grid"><div class="work-card"><span class="eyebrow">Main Information</span><h3>${esc(recordType)} Record</h3>${field('mName','Name',row?.name,'text',!!row)}${field('mWebsite','Website',row?.website,'text',!!row)}${field('mAddress','Physical Address',row?.address,'text',!!row)}${field('mCity','City',row?.city,'text',!!row)}</div><div class="work-card"><span class="eyebrow">Mailing Information</span><h3>Shared Address</h3>${field('mMailing','Mailing Address',row?.mailing_address || row?.address,'text',!!row)}${field('mState','State',row?.state || 'FL','text',!!row)}${field('mZip','ZIP Code',row?.zip || row?.postal_code,'text',!!row)}</div></div><div class="ops-actions"><button class="btn primary" id="editMain">${row?'Edit Information':'Create Master Record'}</button><button class="btn" id="cancelMain" style="display:none">Cancel</button></div></section>
        <section class="workspace-pane" data-pane="contacts"><div class="work-card"><div class="contact-head"><div><span class="eyebrow">Shared Contacts</span><h3 style="margin:.35rem 0">Points of Contact</h3></div><button class="btn primary" id="addContact">Add Contact</button></div><div id="contactList"></div></div></section>
        <section class="workspace-pane" data-pane="administration"><div class="work-card"><span class="eyebrow">Administrative Control</span><h3>Record Administration</h3><div class="record-meta"><div><small>Master Record ID</small><strong>${esc(row?.id || 'Assigned when created')}</strong></div><div><small>Record Type</small><strong>${esc(recordType)}</strong></div><div><small>Created</small><strong>${esc(row?.created_at ? new Date(row.created_at).toLocaleString() : 'Not available')}</strong></div><div><small>Last Modified</small><strong>${esc(row?.updated_at ? new Date(row.updated_at).toLocaleString() : 'Not available')}</strong></div><div><small>Created By</small><strong>${esc(row?.created_by || 'Not available')}</strong></div><div><small>Last Modified By</small><strong>${esc(row?.updated_by || 'Not available')}</strong></div></div><div class="work-field"><label>Record State</label><select id="adminState"><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option></select></div><div class="work-card" style="margin-top:14px"><span class="eyebrow">Department Files</span><h3>Where this master record is used</h3>${usedBy.length ? usedBy.map(r => `<div class="contact-card"><strong>${esc(r.source || 'Department File')}</strong><small style="display:block;color:var(--muted);margin-top:5px">Record ${esc(r.id)} · ${esc(r.status || 'active')}</small></div>`).join('') : '<div class="empty">No department files are currently linked to this master record.</div>'}</div><div class="ops-actions"><button class="btn primary" id="saveAdmin">Save Administrative Changes</button>${row?'<button class="btn danger" id="archiveRecord">Archive Record</button>':''}</div></div></section>`;
      $('modalBackdrop').classList.add('open');
      $('adminState').value = statusOf(row?.status);
      document.querySelectorAll('.workspace-tabs [data-tab]').forEach(b => b.onclick = () => activateTab(b.dataset.tab));

      const original = row ? { name:row.name||'', website:row.website||'', address:row.address||'', city:row.city||'', mailing:row.mailing_address||row.address||'', state:row.state||'FL', zip:row.zip||row.postal_code||'' } : null;
      const setMainReadonly = readonly => ['mName','mWebsite','mAddress','mCity','mMailing','mState','mZip'].forEach(id => { if ($(id)) $(id).readOnly = readonly; });
      const mainPayload = () => ({ name:$('mName').value.trim(), website:$('mWebsite').value.trim(), address:$('mAddress').value.trim(), city:$('mCity').value.trim(), contact_name:contacts.find(c=>c.primary)?.name || contacts[0]?.name || '', email:contacts.find(c=>c.primary)?.email || contacts[0]?.email || '', phone:contacts.find(c=>c.primary)?.phone || contacts[0]?.phone || '', status:statusOf(row?.status), notes:notesWithMetadata(row,recordType,contacts) });

      $('editMain').onclick = async () => {
        if (!row) {
          if (!$('mName').value.trim()) return alert('Name is required.');
          try { await request('businesses','POST',null,mainPayload()); window.showToast?.('Master record created.'); $('modalBackdrop').classList.remove('open'); $('reloadBtn')?.click(); setTimeout(renderMasterRegistry,650); } catch(e) { alert(`Could not create master record: ${e.message}`); }
          return;
        }
        if (!editingMain) {
          editingMain = true; dirty = false; setMainReadonly(false); $('editMain').textContent = 'Save Changes'; $('cancelMain').style.display = 'inline-flex'; return;
        }
        if (!$('mName').value.trim()) return alert('Name is required.');
        try { await request('businesses','PATCH',row.id,mainPayload()); window.showToast?.('Main information saved.'); editingMain = false; dirty = false; setMainReadonly(true); $('editMain').textContent = 'Edit Information'; $('cancelMain').style.display = 'none'; $('modalTitle').textContent = $('mName').value.trim(); } catch(e) { alert(`Could not save changes: ${e.message}`); }
      };
      $('cancelMain').onclick = () => {
        Object.entries(original).forEach(([key,value]) => { const map={name:'mName',website:'mWebsite',address:'mAddress',city:'mCity',mailing:'mMailing',state:'mState',zip:'mZip'}; if ($(map[key])) $(map[key]).value=value; });
        editingMain=false; dirty=false; setMainReadonly(true); $('editMain').textContent='Edit Information'; $('cancelMain').style.display='none';
      };
      ['mName','mWebsite','mAddress','mCity','mMailing','mState','mZip'].forEach(id => $(id)?.addEventListener('input',()=>{ if(editingMain) dirty=true; }));

      function renderContacts() {
        const list = $('contactList');
        const sorted = [...contacts].sort((a,b) => Number(b.primary)-Number(a.primary));
        list.innerHTML = sorted.length ? sorted.map(c => `<div class="contact-card ${c.primary?'primary':''}" data-contact-id="${esc(c.id)}"><div class="contact-head"><div><strong>${c.primary?'★ ':''}${esc(c.name || 'Unnamed Contact')}</strong><small style="display:block;color:var(--muted);margin-top:5px">${esc([c.title,c.department].filter(Boolean).join(' · '))}</small></div><span class="chip">${c.active===false?'Inactive':c.primary?'Primary':'Active'}</span></div><p style="margin:.8rem 0 0">${esc([c.email,c.phone,c.preferred?`Prefers ${c.preferred}`:''].filter(Boolean).join(' · '))}</p><div class="contact-actions"><button class="btn small" data-edit-contact="${esc(c.id)}">Edit</button>${!c.primary?`<button class="btn small" data-primary-contact="${esc(c.id)}">Set Primary</button>`:''}<button class="btn small" data-toggle-contact="${esc(c.id)}">${c.active===false?'Mark Active':'Mark Inactive'}</button></div></div>`).join('') : '<div class="empty">No contacts have been added.</div>';
        list.querySelectorAll('[data-edit-contact]').forEach(b => b.onclick = () => editContact(b.dataset.editContact));
        list.querySelectorAll('[data-primary-contact]').forEach(b => b.onclick = async () => { contacts = contacts.map(c => ({...c,primary:c.id===b.dataset.primaryContact})); await saveContacts(); });
        list.querySelectorAll('[data-toggle-contact]').forEach(b => b.onclick = async () => { contacts = contacts.map(c => c.id===b.dataset.toggleContact?{...c,active:c.active===false}:c); await saveContacts(); });
      }
      async function saveContacts() {
        if (!row) { renderContacts(); return; }
        const primary = contacts.find(c=>c.primary) || contacts[0] || {};
        try { await request('businesses','PATCH',row.id,{contact_name:primary.name||'',email:primary.email||'',phone:primary.phone||'',notes:notesWithMetadata(row,recordType,contacts)}); window.showToast?.('Contacts saved.'); renderContacts(); } catch(e) { alert(`Could not save contacts: ${e.message}`); }
      }
      function editContact(contactId=null) {
        const contact = contacts.find(c=>c.id===contactId) || {id:crypto.randomUUID(),name:'',title:'',department:'',email:'',phone:'',preferred:'Email',active:true,primary:contacts.length===0};
        $('modalBody').insertAdjacentHTML('beforeend',`<div class="modal-backdrop open" id="contactEditor" style="position:fixed;z-index:900"><div class="modal" style="width:min(620px,94vw)"><header class="modal-head"><div><span class="eyebrow">Contact</span><h2>${contactId?'Edit Contact':'Add Contact'}</h2></div><button class="btn" id="closeContactEditor">Close</button></header><div class="modal-body"><div class="work-card">${field('cName','Name',contact.name)}${field('cTitle','Job Title',contact.title)}${field('cDepartment','Department / Division',contact.department)}${field('cEmail','Email',contact.email,'email')}${field('cPhone','Phone',contact.phone)}<div class="work-field"><label>Preferred Contact Method</label><select id="cPreferred"><option>Email</option><option>Phone</option><option>Text</option></select></div><div class="ops-actions"><button class="btn primary" id="saveContact">Save Contact</button><button class="btn" id="cancelContact">Cancel</button></div></div></div></div></div>`);
        $('cPreferred').value=contact.preferred||'Email';
        const close=()=>$('contactEditor')?.remove(); $('closeContactEditor').onclick=close; $('cancelContact').onclick=close;
        $('saveContact').onclick=async()=>{const updated={...contact,name:$('cName').value.trim(),title:$('cTitle').value.trim(),department:$('cDepartment').value.trim(),email:$('cEmail').value.trim(),phone:$('cPhone').value.trim(),preferred:$('cPreferred').value};if(!updated.name)return alert('Contact name is required.');contacts=contactId?contacts.map(c=>c.id===contactId?updated:c):[...contacts,updated];close();await saveContacts();};
      }
      $('addContact').onclick = () => editContact();
      renderContacts();

      $('saveAdmin').onclick = async () => { if(!row)return alert('Create the master record first.'); try { await request('businesses','PATCH',row.id,{status:$('adminState').value}); window.showToast?.('Administrative changes saved.'); } catch(e) { alert(`Could not save administration: ${e.message}`); } };
      $('archiveRecord')?.addEventListener('click',async()=>{if(!confirm('Archive this master record?'))return;try{await request('businesses','PATCH',row.id,{status:'archived'});window.showToast?.('Master record archived.');$('modalBackdrop').classList.remove('open');$('reloadBtn')?.click();setTimeout(renderMasterRegistry,650);}catch(e){alert(`Could not archive record: ${e.message}`);}});

      const closeButton = $('closeModal');
      closeButton.onclick = () => { if(dirty && !confirm('Discard unsaved changes?')) return; $('modalBackdrop').classList.remove('open'); };
    }

    function openBusinessWorkspace(source,id) {
      const row = departmentRows().find(r => r.source===source && String(r.id)===String(id));
      if (!row) return;
      const master=matchMaster(row),status=String(row.status||'new').toLowerCase();
      $('modalEyebrow').textContent='Business Network Record'; $('modalTitle').textContent=row.name; $('modalSub').textContent=`${status} · ${source}`;
      $('modalBody').innerHTML=`<div class="workspace-tabs"><button class="btn active" data-tab="overview">Overview</button><button class="btn" data-tab="application">Application</button><button class="btn" data-tab="internal">Internal</button><button class="btn" data-tab="public">Public Listing</button><button class="btn" data-tab="notes">Notes</button></div><section class="workspace-pane active" data-pane="overview"><div class="record-meta"><div><small>Department Record</small><strong>${esc(row.id)}</strong></div><div><small>Status</small><strong>${esc(status)}</strong></div><div><small>Master Identity</small><strong>${esc(master?.name||'Not linked')}</strong></div></div></section><section class="workspace-pane" data-pane="application"><div class="work-grid"><div class="work-card">${field('bName','Business Name',row.name)}${field('bContact','Contact Person',row.contact)}${field('bEmail','Email',row.email,'email')}${field('bPhone','Phone',row.phone)}${field('bWebsite','Website',row.website)}</div><div class="work-card">${field('bAddress','Address',row.address)}${field('bCity','City',row.city)}${field('bCategory','Category',row.category)}</div></div></section><section class="workspace-pane" data-pane="internal"><div class="work-card">${field('bBadges','Badges',row.badges)}${field('bAssigned','Assigned Staff',row.assigned_to)}</div></section><section class="workspace-pane" data-pane="public"><div class="work-card">${field('bDescription','Public Description',row.description)}<div class="ops-actions"><button class="btn primary" id="publishBusiness">Save & Publish</button><button class="btn" id="hideBusiness">Hide Listing</button></div></div></section><section class="workspace-pane" data-pane="notes"><div class="work-card">${field('bNotes','Notes',row.notes)}<button class="btn primary" id="saveBusiness">Save Record</button></div></section>`;
      $('modalBackdrop').classList.add('open'); document.querySelectorAll('.workspace-tabs [data-tab]').forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));
      const payload=()=>({name:$('bName').value.trim(),contact_name:$('bContact').value.trim(),email:$('bEmail').value.trim(),phone:$('bPhone').value.trim(),website:$('bWebsite').value.trim(),address:$('bAddress').value.trim(),city:$('bCity').value.trim(),category:$('bCategory').value.trim(),description:$('bDescription').value.trim(),notes:$('bNotes').value.trim()});
      const save=async extra=>{try{await request(tableFor(row.source),'PATCH',row.id,{...payload(),...extra});window.showToast?.('Business record saved.');$('modalBackdrop').classList.remove('open');$('reloadBtn')?.click();setTimeout(renderBusinessRegistry,650);}catch(e){alert(`Could not save business record: ${e.message}`);}};
      $('saveBusiness').onclick=()=>save({}); $('publishBusiness').onclick=()=>save({status:'published'}); $('hideBusiness').onclick=()=>save({status:'hidden'});
    }

    masterButton?.addEventListener('click',()=>{enterMasterMode();showSection('masters','Master Records','Shared identity records only. Department work remains in department-owned registries.');renderMasterRegistry();});
    document.querySelectorAll('.nav [data-view]:not([data-view="masters"])').forEach(button=>button.addEventListener('click',leaveMasterMode));
    businessButton?.addEventListener('click',()=>setTimeout(renderBusinessRegistry,0));
    renderMasterRegistry(); renderBusinessRegistry();
  });
})();