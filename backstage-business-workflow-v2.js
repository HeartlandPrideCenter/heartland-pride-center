(() => {
  const categories = ['Restaurant & Cafe','Retail','Health Care','Mental Health','Legal Services','Financial Services','Real Estate','Salon & Spa','Fitness','Entertainment','Arts & Culture','Education','Nonprofit','Faith Community','Professional Services','Automotive','Lodging','Other'];
  const hearts = ['Community Heart','Gold Heart','Rainbow Heart'];
  const statuses = ['pending','draft','published','hidden','suspended','denied'];
  const badges = [['lgbtq_owned','🏳️‍🌈 LGBTQ+ Owned & Operated'],['proud_ally','🤝 Proud Ally'],['accessible','♿ Accessible']];

  function esc(v){ return String(v || '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function optionList(current, list){ return list.map(v => `<option value="${esc(v)}" ${v === current ? 'selected' : ''}>${esc(v)}</option>`).join(''); }
  function badgeList(current){ const selected = Array.isArray(current) ? current : []; return badges.map(([v,label]) => `<label class="hpc-check"><input type="checkbox" name="badges" value="${v}" ${selected.includes(v) ? 'checked' : ''}> ${label}</label>`).join(''); }
  function appToListing(app){ return { name: app.organization_name || '', category: app.category || 'Other', public_description: app.description || '', address: app.address || '', city: app.city || '', county: app.county || 'Polk', website: app.website || '', phone: app.phone || '', email: app.email || '', heart_rating: 'Community Heart', status: 'published', badges: [] }; }
  function coordsFor(city){ return window.HPC_BACKSTAGE_COORDINATES ? window.HPC_BACKSTAGE_COORDINATES.cityFallback(city || 'Lake Wales') : { latitude:null, longitude:null }; }

  function shell(){
    let el = document.getElementById('hpcWorkflowShell');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'hpcWorkflowShell';
    el.className = 'hpc-workflow-shell';
    el.innerHTML = '<div class="hpc-workflow-window"><button class="hpc-workflow-close" type="button">×</button><div id="hpcWorkflowContent"></div></div>';
    document.body.appendChild(el);
    el.querySelector('.hpc-workflow-close').addEventListener('click', () => el.classList.remove('open'));
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
    const style = document.createElement('style');
    style.textContent = `.hpc-workflow-shell{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(3,10,19,.72);backdrop-filter:blur(8px);padding:22px}.hpc-workflow-shell.open{display:flex}.hpc-workflow-window{width:min(1100px,97vw);max-height:90vh;overflow:auto;border:1px solid rgba(239,205,114,.28);border-radius:30px;background:#081523;color:#f5f1e8;box-shadow:0 30px 120px rgba(0,0,0,.5);padding:28px;position:relative}.hpc-workflow-close{position:absolute;right:18px;top:14px;width:40px;height:40px;border-radius:999px;border:1px solid rgba(245,241,232,.16);background:rgba(255,255,255,.07);color:#fff;font-size:25px}.workflow-grid{display:grid;grid-template-columns:.88fr 1.12fr;gap:18px;margin-top:18px}.workflow-panel{border:1px solid rgba(245,241,232,.13);border-radius:24px;background:rgba(255,255,255,.045);padding:20px}.workflow-panel h2{margin:0 0 14px}.workflow-original dl{display:grid;gap:10px}.workflow-original dt{color:#efcd72;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;font-weight:900}.workflow-original dd{margin:0;color:rgba(245,241,232,.84);line-height:1.5}.workflow-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.workflow-form label{display:grid;gap:7px;color:#efcd72;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;font-weight:900}.workflow-form input,.workflow-form select,.workflow-form textarea{width:100%;border:1px solid rgba(245,241,232,.16);border-radius:15px;background:rgba(255,255,255,.07);color:#fff;padding:12px}.workflow-form textarea{min-height:110px}.workflow-form .span{grid-column:1/-1}.hpc-check{display:block!important;color:#f5f1e8!important;text-transform:none!important;letter-spacing:0!important;font-size:.94rem!important}.workflow-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:18px}.workflow-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;border:1px solid rgba(245,241,232,.12);border-radius:18px;background:rgba(255,255,255,.04);padding:14px 16px;margin-bottom:10px}.workflow-row strong{display:block}.workflow-row small{color:rgba(245,241,232,.62)}.workflow-row p{margin:4px 0 0;color:rgba(245,241,232,.72)}@media(max-width:820px){.workflow-grid,.workflow-form{grid-template-columns:1fr}.hpc-workflow-window{padding:24px 16px}}`;
    document.head.appendChild(style);
    return el;
  }

  function originalBlock(app){
    const rows = [['Business',app.organization_name],['Contact',app.contact_name],['Email',app.email],['Phone',app.phone],['Category',app.category],['Address',[app.address,app.city].filter(Boolean).join(', ')],['Website',app.website],['Description',app.description],['Private notes',app.notes]];
    return '<dl>' + rows.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v || '—')}</dd>`).join('') + '</dl>';
  }

  function formBlock(listing){
    return `<form id="workflowForm" class="workflow-form"><label>Name<input name="name" required value="${esc(listing.name)}"></label><label>Category<select name="category">${optionList(listing.category || 'Other', categories)}</select></label><label class="span">Public Description<textarea name="public_description">${esc(listing.public_description || listing.description)}</textarea></label><label>Address<input name="address" value="${esc(listing.address)}"></label><label>City<input name="city" value="${esc(listing.city)}"></label><label>Website<input name="website" value="${esc(listing.website)}"></label><label>Phone<input name="phone" value="${esc(listing.phone)}"></label><label>Email<input name="email" value="${esc(listing.email)}"></label><label>Heart Rating<select name="heart_rating">${optionList(listing.heart_rating || 'Community Heart', hearts)}</select></label><label>Status<select name="status">${optionList(listing.status || 'published', statuses)}</select></label><div class="span"><label>Badges</label>${badgeList(listing.badges)}</div></form>`;
  }

  function readForm(){
    const form = document.getElementById('workflowForm');
    const data = new FormData(form);
    return { name:String(data.get('name')||'').trim(), category:String(data.get('category')||'Other'), description:String(data.get('public_description')||'').trim(), public_description:String(data.get('public_description')||'').trim(), address:String(data.get('address')||'').trim(), city:String(data.get('city')||'').trim(), county:'Polk', website:String(data.get('website')||'').trim(), phone:String(data.get('phone')||'').trim(), email:String(data.get('email')||'').trim(), heart_rating:String(data.get('heart_rating')||'Community Heart'), status:String(data.get('status')||'published'), badges:[...form.querySelectorAll('input[name="badges"]:checked')].map(i=>i.value) };
  }

  async function saveApplicationStatus(id,status){
    await fetch(apiBase + `/applications?id=eq.${id}`, { method:'PATCH', headers: authedHeaders({ Prefer:'return=minimal' }), body: JSON.stringify({ status, reviewed_at:new Date().toISOString() }) });
  }

  window.reviewApplication = (id) => {
    const app = applications.find(a => a.id === id); if (!app) return toast('Application not found');
    const listing = appToListing(app);
    const el = shell();
    hpcWorkflowContent.innerHTML = `<span class="eyeline">Business Network</span><h1>❤️ Review Business Application</h1><p>Original submission stays unchanged. Edit the public listing preview before publishing.</p><div class="workflow-grid"><section class="workflow-panel workflow-original"><h2>Original Submission</h2>${originalBlock(app)}</section><section class="workflow-panel"><h2>Public Listing Preview</h2>${formBlock(listing)}</section></div><div class="workflow-actions"><button class="stage-btn" id="wfPending">Keep Pending</button><button class="stage-btn" id="wfHide">Hide</button><button class="stage-btn" id="wfDeny">Deny</button><button class="stage-btn" id="wfPublish">Publish Now</button></div>`;
    el.classList.add('open');
    wfPending.onclick = async () => { await saveApplicationStatus(id,'pending'); el.classList.remove('open'); toast('Kept pending'); await loadBackstage(); };
    wfHide.onclick = async () => { await saveApplicationStatus(id,'hidden'); el.classList.remove('open'); toast('Application hidden'); await loadBackstage(); };
    wfDeny.onclick = async () => { const reason = prompt('Reason for denial?'); if (reason === null) return; await fetch(apiBase + `/applications?id=eq.${id}`, { method:'PATCH', headers: authedHeaders({ Prefer:'return=minimal' }), body: JSON.stringify({ status:'denied', reviewed_at:new Date().toISOString(), notes:(app.notes || '') + '\nDenied reason: ' + reason }) }); el.classList.remove('open'); toast('Application denied'); await loadBackstage(); };
    wfPublish.onclick = async () => { const payload = readForm(); const c = coordsFor(payload.city); payload.application_id = app.id; payload.featured = false; payload.approved_at = new Date().toISOString(); payload.internal_notes = app.notes || ''; payload.latitude = c.latitude; payload.longitude = c.longitude; const res = await fetch(apiBase + '/businesses', { method:'POST', headers: authedHeaders({ Prefer:'return=minimal' }), body: JSON.stringify(payload) }); if (!res.ok) return toast('Publish failed'); await fetch(apiBase + `/applications?id=eq.${id}`, { method:'PATCH', headers: authedHeaders({ Prefer:'return:minimal' }), body: JSON.stringify({ status:'published', reviewed_at:new Date().toISOString(), published_at:new Date().toISOString() }) }); el.classList.remove('open'); toast('❤️ Welcome to the Land of Hearts'); await loadBackstage(); };
  };

  window.editBusinessWorkflow = (id) => {
    const b = businesses.find(x => x.id === id); if (!b) return toast('Business not found');
    const el = shell();
    hpcWorkflowContent.innerHTML = `<span class="eyeline">Land of Hearts</span><h1>❤️ Edit Published Listing</h1><p>Update what appears publicly without leaving Backstage.</p><div class="workflow-grid"><section class="workflow-panel workflow-original"><h2>Listing Snapshot</h2><dl><dt>Current status</dt><dd>${esc(statusLabel(b.status))}</dd><dt>Map</dt><dd>${b.latitude && b.longitude ? esc(Number(b.latitude).toFixed(5)+', '+Number(b.longitude).toFixed(5)) : 'Needs coordinates'}</dd><dt>Application link</dt><dd>${esc(b.application_id || 'Manual record')}</dd></dl></section><section class="workflow-panel"><h2>Public Listing</h2>${formBlock(b)}</section></div><div class="workflow-actions"><button class="stage-btn" id="wfClose">Close</button><button class="stage-btn" id="wfSave">Save Changes</button><button class="stage-btn" id="wfSuspend">Suspend</button><button class="stage-btn" id="wfRemove">Remove</button></div>`;
    el.classList.add('open');
    wfClose.onclick = () => el.classList.remove('open');
    wfSuspend.onclick = async () => { await updateBusiness(id,'suspended'); el.classList.remove('open'); };
    wfRemove.onclick = async () => { if (!confirm('Remove this business record?')) return; await deleteBusiness(id); el.classList.remove('open'); };
    wfSave.onclick = async () => { const payload = readForm(); if (!b.latitude || !b.longitude || payload.city !== b.city) { const c = coordsFor(payload.city); payload.latitude = c.latitude; payload.longitude = c.longitude; } const res = await fetch(apiBase + `/businesses?id=eq.${id}`, { method:'PATCH', headers: authedHeaders({ Prefer:'return=minimal' }), body: JSON.stringify(payload) }); if (!res.ok) return toast('Save failed'); el.classList.remove('open'); toast('Business updated'); await loadBackstage(); };
  };

  window.applicationCard = (app) => {
    const name = app.organization_name || app.contact_name || 'Application';
    const detail = [app.type || 'Application', app.category || 'Uncategorized', app.city || 'No city'].join(' · ');
    const actions = app.status === 'pending' ? `<button class="stage-btn" onclick="reviewApplication('${app.id}')">Review</button>` : `<button class="stage-btn" onclick="reviewApplication('${app.id}')">View</button><button class="stage-btn" onclick="updateApplication('${app.id}','pending')">Reopen</button>`;
    return `<div class="workflow-row"><div><small>${esc(detail)}</small><strong>${esc(name)}</strong><p>${esc(app.email || 'No email')} · ${esc(statusLabel(app.status))}</p></div><div class="actions">${actions}</div></div>`;
  };

  window.businessCard = (b) => {
    const detail = [b.category || 'Business', b.city || 'No city', b.heart_rating || 'Community Heart'].join(' · ');
    const badgeText = Array.isArray(b.badges) && b.badges.length ? b.badges.join(', ') : 'No badges';
    return `<div class="workflow-row"><div><small>${esc(detail)}</small><strong>${esc(b.name)}</strong><p>${esc(badgeText)} · ${esc(statusLabel(b.status))}</p></div><div class="actions"><button class="stage-btn" onclick="editBusinessWorkflow('${b.id}')">Edit</button><button class="stage-btn" onclick="updateBusiness('${b.id}','published')">Publish</button><button class="stage-btn" onclick="updateBusiness('${b.id}','hidden')">Hide</button></div></div>`;
  };

  if (typeof renderAll === 'function') renderAll();
})();
