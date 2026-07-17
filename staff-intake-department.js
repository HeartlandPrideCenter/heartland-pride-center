(() => {
  const whenReady = fn => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  whenReady(() => {
    if (!window.HPC_DATA_URL || !window.HPC_DATA_PUBLIC_TOKEN || typeof window.businessRecords !== 'function') return;

    const $ = id => document.getElementById(id);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const token = () => sessionStorage.getItem('hpcAtlasAccessToken') || window.HPC_DATA_PUBLIC_TOKEN;
    const headers = prefer => ({
      apikey: window.HPC_DATA_PUBLIC_TOKEN,
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {})
    });
    const allRows = () => window.businessRecords();
    const intakeRows = () => allRows().filter(r => r.source === 'applications' && /^(business|volunteer|volunteers|partner|partners|partnership)$/i.test(String(r.type || '')));
    const masters = () => allRows().filter(r => String(r.source || '').startsWith('businesses'));
    const activeState = row => {
      const status = String(row.status || 'new').toLowerCase();
      if (['processed','linked','completed','routed','closed'].includes(status)) return 'processed';
      if (['inactive','rejected','spam','declined'].includes(status)) return 'inactive';
      if (['parked','pending','hold','on hold'].includes(status)) return 'parked';
      return 'new';
    };
    const eligibleRows = () => intakeRows().filter(r => activeState(r) !== 'processed');
    const notesText = row => String(row.notes || '');
    const metaValue = (row, key) => {
      const m = notesText(row).match(new RegExp(`^Intake ${key}:\\s*(.*)$`, 'mi'));
      return m ? decodeURIComponent(m[1]) : '';
    };
    const stripIntakeMeta = text => String(text || '').replace(/^Intake (?:IR Number|Queue State|Reviewer Note|Inactive Reason|Retention Until|History JSON):.*(?:\n|$)/gmi, '').trim();
    const setMeta = (row, changes) => {
      const history = (() => { try { return JSON.parse(metaValue(row, 'History JSON') || '[]'); } catch (_) { return []; } })();
      if (changes.historyEvent) history.push({ at: new Date().toISOString(), event: changes.historyEvent });
      const current = {
        ir: changes.ir ?? metaValue(row, 'IR Number'),
        state: changes.state ?? metaValue(row, 'Queue State'),
        note: changes.note ?? metaValue(row, 'Reviewer Note'),
        reason: changes.reason ?? metaValue(row, 'Inactive Reason'),
        retention: changes.retention ?? metaValue(row, 'Retention Until'),
        history
      };
      return [
        `Intake IR Number: ${encodeURIComponent(current.ir || '')}`,
        `Intake Queue State: ${encodeURIComponent(current.state || '')}`,
        `Intake Reviewer Note: ${encodeURIComponent(current.note || '')}`,
        `Intake Inactive Reason: ${encodeURIComponent(current.reason || '')}`,
        `Intake Retention Until: ${encodeURIComponent(current.retention || '')}`,
        `Intake History JSON: ${encodeURIComponent(JSON.stringify(current.history || []))}`,
        stripIntakeMeta(row.notes)
      ].filter(Boolean).join('\n');
    };
    const irNumber = row => metaValue(row, 'IR Number') || `IR-${String(new Date(row.created_at || Date.now()).getFullYear())}-${String(row.id || '').replace(/\D/g,'').slice(-6).padStart(6,'0')}`;
    const displayName = row => row.organization_name || row.contact_name || row.name || 'Unnamed intake';
    const intakeType = row => {
      const t = String(row.type || '').toLowerCase();
      if (t === 'business') return 'Business Network Application';
      if (/volunteer/.test(t)) return 'Volunteer Application';
      return 'Partnership Application';
    };
    const destinationFor = row => /business/i.test(row.type) ? 'Business Network' : /volunteer/i.test(row.type) ? 'Volunteers' : 'Partnerships';
    const currentUser = () => {
      try {
        const p = JSON.parse(atob(token().split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        return p.user_metadata?.full_name || p.user_metadata?.name || p.email || 'Staff reviewer';
      } catch (_) { return 'Staff reviewer'; }
    };

    async function patchApplication(row, payload) {
      const response = await fetch(`${window.HPC_DATA_URL}/rest/v1/applications?id=eq.${encodeURIComponent(row.id)}`, {
        method: 'PATCH', headers: headers('return=minimal'), body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error((await response.text()) || `Application update failed (${response.status})`);
      Object.assign(row, payload);
    }

    async function createMaster(payload) {
      const response = await fetch(`${window.HPC_DATA_URL}/rest/v1/businesses`, {
        method: 'POST', headers: headers('return=representation'), body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error((await response.text()) || `Master creation failed (${response.status})`);
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    }

    const nav = document.querySelector('.nav');
    const dashboardButton = nav?.querySelector('[data-view="dashboard"]');
    let intakeButton = nav?.querySelector('[data-view="intake"]');
    if (nav && dashboardButton && !intakeButton) {
      intakeButton = document.createElement('button');
      intakeButton.className = 'btn';
      intakeButton.dataset.view = 'intake';
      intakeButton.textContent = 'Intake';
      dashboardButton.insertAdjacentElement('afterend', intakeButton);
    }

    const dashboardSection = $('dashboard');
    let intakeSection = $('intake');
    if (!intakeSection && dashboardSection) {
      intakeSection = document.createElement('section');
      intakeSection.id = 'intake';
      intakeSection.className = 'section';
      dashboardSection.insertAdjacentElement('afterend', intakeSection);
    }

    const style = document.createElement('style');
    style.textContent = `
      .intake-shell{display:grid;gap:12px}.intake-top{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.045);padding:14px}.intake-tabs{display:flex;gap:7px;flex-wrap:wrap}.intake-tab{min-width:110px;justify-content:space-between}.intake-tab span:last-child{border-radius:999px;background:rgba(255,255,255,.09);padding:3px 7px}.intake-actions{display:flex;gap:9px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap}.process-next{min-width:190px}.intake-search-wrap{display:none;margin-top:10px}.intake-search-wrap.open{display:block}.intake-search-wrap input{width:100%;min-height:42px;border:1px solid var(--line);border-radius:11px;background:rgba(6,19,35,.72);color:var(--cream);padding:0 12px}.intake-list{border:1px solid var(--line);border-radius:14px;overflow:hidden}.intake-head,.intake-row{display:grid;grid-template-columns:145px minmax(220px,1.35fr) 180px minmax(160px,1fr) 135px;gap:12px;align-items:center;padding:10px 13px}.intake-head{background:rgba(255,255,255,.07);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:850}.intake-row{width:100%;border:0;border-top:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--cream);text-align:left;cursor:pointer}.intake-row:hover{background:rgba(240,206,115,.08)}.intake-row strong,.intake-row small{display:block}.intake-row small{color:var(--muted);margin-top:3px}.ir-state{display:inline-flex;align-items:center;gap:7px;font-weight:850}.ir-state i{width:9px;height:9px;border-radius:50%;background:#47d786}.ir-state.parked i{background:#e6bd55}.ir-state.inactive i{background:#9aa6b2}.intake-preview{position:fixed;z-index:1500;width:285px;max-width:calc(100vw - 28px);border:1px solid var(--line);border-radius:14px;padding:13px 15px;background:#0a2035;color:var(--cream);box-shadow:0 18px 50px rgba(0,0,0,.42);pointer-events:none}.intake-preview small{display:block;color:var(--muted);margin-top:5px}.intake-banner{border:1px solid rgba(240,206,115,.35);border-radius:13px;background:rgba(212,175,55,.09);padding:12px;margin-bottom:12px}.intake-app-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.intake-app-field{border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025);padding:12px}.intake-app-field.full{grid-column:1/-1}.intake-app-field small{display:block;color:var(--gold2);font-size:.68rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}.intake-bottom-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:15px;padding-top:13px;border-top:1px solid var(--line)}.wizard-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:13px}.wizard-step{border:1px solid var(--line);border-radius:10px;padding:8px;text-align:center;color:var(--muted);font-size:.72rem;font-weight:850}.wizard-step.active{border-color:rgba(240,206,115,.58);color:var(--gold2);background:rgba(212,175,55,.08)}.wizard-pane{display:none}.wizard-pane.active{display:block}.match-list{display:grid;gap:8px;margin-top:10px}.match-card{border:1px solid var(--line);border-radius:12px;padding:12px;background:rgba(255,255,255,.025);display:flex;justify-content:space-between;gap:10px;align-items:center}.wizard-nav{display:flex;justify-content:space-between;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}.queue-empty{text-align:center;padding:44px 18px;color:var(--muted)}
      @media(max-width:850px){.intake-head{display:none}.intake-row{grid-template-columns:1fr auto}.intake-row span:nth-child(3),.intake-row span:nth-child(4){display:none}.intake-app-grid{grid-template-columns:1fr}.intake-app-field.full{grid-column:auto}.wizard-progress{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);

    let queueTab = 'new';
    let processingMode = false;
    let activeIntake = null;

    function selectRows() {
      const q = String($('intakeSearch')?.value || '').trim().toLowerCase();
      return eligibleRows().filter(row => activeState(row) === queueTab && (!q || [displayName(row),row.contact_name,row.email,row.phone,row.city,row.category,intakeType(row),irNumber(row)].join(' ').toLowerCase().includes(q)))
        .sort((a,b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }

    function counts() {
      const rows = eligibleRows();
      return {
        new: rows.filter(r => activeState(r) === 'new').length,
        parked: rows.filter(r => activeState(r) === 'parked').length,
        inactive: rows.filter(r => activeState(r) === 'inactive').length
      };
    }

    function renderIntake() {
      if (!intakeSection) return;
      const c = counts();
      intakeSection.innerHTML = `<div class="intake-shell">
        <div class="intake-top">
          <div class="intake-tabs">
            ${['new','parked','inactive'].map(tab => `<button class="btn intake-tab ${queueTab===tab?'primary':''}" data-intake-tab="${tab}"><span>${tab[0].toUpperCase()+tab.slice(1)}</span><span>${c[tab]}</span></button>`).join('')}
          </div>
          <div class="intake-actions"><div><strong>${c.new} waiting</strong><small style="display:block;color:var(--muted);margin-top:3px">${c.new ? `Oldest received ${new Date(eligibleRows().filter(r=>activeState(r)==='new').sort((a,b)=>new Date(a.created_at)-new Date(b.created_at))[0]?.created_at).toLocaleDateString()}` : 'The New queue is clear.'}</small></div><div style="display:flex;gap:8px"><button class="btn" id="toggleIntakeSearch">⌕ Search</button><button class="btn primary process-next" id="processNext">▶ Process Next</button></div></div>
          <div class="intake-search-wrap" id="intakeSearchWrap"><input id="intakeSearch" placeholder="Search intake records..."></div>
        </div>
        <div class="intake-list"><div class="intake-head"><span>Status / IR #</span><span>Applicant</span><span>Application</span><span>Contact</span><span>Received</span></div><div id="intakeQueueList"></div></div>
      </div>`;
      document.querySelectorAll('[data-intake-tab]').forEach(btn => btn.onclick = () => { queueTab = btn.dataset.intakeTab; renderIntake(); });
      $('toggleIntakeSearch').onclick = () => $('intakeSearchWrap').classList.toggle('open');
      $('processNext').onclick = () => {
        const next = eligibleRows().filter(r => activeState(r) === 'new').sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0))[0];
        if (!next) return showToast?.('The New queue is empty.');
        processingMode = true;
        openIntakeWorkspace(next);
      };
      drawQueue();
      $('intakeSearch')?.addEventListener('input', drawQueue);
    }

    function drawQueue() {
      const list = $('intakeQueueList'); if (!list) return;
      const rows = selectRows();
      list.innerHTML = rows.length ? rows.map(row => `<button class="intake-row" data-intake-id="${esc(row.id)}"><span><span class="ir-state ${activeState(row)}"><i></i>${esc(activeState(row)[0].toUpperCase()+activeState(row).slice(1))}</span><small>${esc(irNumber(row))}</small></span><span><strong>${esc(displayName(row))}</strong><small>${esc(row.city || row.county || '')}</small></span><span>${esc(intakeType(row))}</span><span>${esc(row.email || row.phone || 'Not provided')}</span><span>${esc(new Date(row.created_at || Date.now()).toLocaleDateString())}</span></button>`).join('') : '<div class="queue-empty">No intake records are in this queue.</div>';
      list.querySelectorAll('[data-intake-id]').forEach(btn => {
        const row = eligibleRows().find(r => String(r.id) === String(btn.dataset.intakeId));
        btn.onclick = () => { processingMode = false; openIntakeWorkspace(row); };
        let timer, preview;
        btn.onmouseenter = () => { timer = setTimeout(() => { preview=document.createElement('div');preview.className='intake-preview';preview.innerHTML=`<strong>${esc(intakeType(row))}</strong><small>${esc(irNumber(row))} · ${esc(activeState(row))}</small><small>${esc(displayName(row))}</small><small>${esc(row.email || row.phone || 'No contact')}</small><small>Received ${esc(new Date(row.created_at || Date.now()).toLocaleString())}</small>${metaValue(row,'Reviewer Note')?`<small><b>Note:</b> ${esc(metaValue(row,'Reviewer Note'))}</small>`:''}`;document.body.appendChild(preview);const rect=btn.getBoundingClientRect();preview.style.left=`${Math.min(rect.right+10,innerWidth-300)}px`;preview.style.top=`${Math.min(rect.top,innerHeight-preview.offsetHeight-10)}px`;},350); };
        btn.onmouseleave = () => { clearTimeout(timer); preview?.remove(); };
      });
    }

    function showSection(id,title,intro) {
      document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
      document.querySelectorAll('.nav [data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === id));
      if ($('pageTitle')) $('pageTitle').textContent = title;
      if ($('pageIntro')) $('pageIntro').textContent = intro;
    }
    intakeButton?.addEventListener('click', () => { showSection('intake','Intake','Process new applications, resolve identity, and route verified work to the correct department.'); renderIntake(); });

    function applicationMarkup(row) {
      return `<div class="intake-app-grid">
        <div class="intake-app-field"><small>Application Type</small>${esc(intakeType(row))}</div><div class="intake-app-field"><small>Received</small>${esc(new Date(row.created_at || Date.now()).toLocaleString())}</div>
        <div class="intake-app-field"><small>Name / Organization</small>${esc(displayName(row))}</div><div class="intake-app-field"><small>Contact Person</small>${esc(row.contact_name || '')}</div>
        <div class="intake-app-field"><small>Email</small>${esc(row.email || '')}</div><div class="intake-app-field"><small>Phone</small>${esc(row.phone || '')}</div>
        <div class="intake-app-field"><small>Address</small>${esc(row.address || '')}</div><div class="intake-app-field"><small>City / County</small>${esc([row.city,row.county].filter(Boolean).join(', '))}</div>
        <div class="intake-app-field"><small>Category</small>${esc(row.category || '')}</div><div class="intake-app-field"><small>Website</small>${esc(row.website || '')}</div>
        <div class="intake-app-field full"><small>Description / Message</small>${esc(row.description || '')}</div><div class="intake-app-field full"><small>Original Notes</small><pre style="white-space:pre-wrap;margin:0;font:inherit">${esc(stripIntakeMeta(row.notes))}</pre></div>
      </div>`;
    }

    function openIntakeWorkspace(row) {
      activeIntake = row;
      $('modalEyebrow').textContent = `Intake Record · ${irNumber(row)}`;
      $('modalTitle').textContent = displayName(row);
      $('modalSub').textContent = intakeType(row);
      const state = activeState(row), reviewerNote = metaValue(row,'Reviewer Note'), inactiveReason = metaValue(row,'Inactive Reason');
      $('modalBody').innerHTML = `<div class="workspace-tabs"><button class="btn active" data-ir-tab="application">Application</button><button class="btn" data-ir-tab="notes">Notes</button><button class="btn" data-ir-tab="history">History</button></div>
        <section class="workspace-pane active" data-ir-pane="application">${state==='parked'?`<div class="intake-banner"><strong>This intake is parked.</strong><div>${esc(reviewerNote || 'No reviewer note was recorded.')}</div></div>`:''}${state==='inactive'?`<div class="intake-banner"><strong>This intake is inactive.</strong><div>${esc(inactiveReason || 'No reason was recorded.')}</div></div>`:''}${applicationMarkup(row)}<div class="intake-bottom-actions"><button class="btn" id="parkIntake">Park</button><button class="btn danger" id="inactiveIntake">Move to Inactive</button><button class="btn primary" id="startIntakeWizard">Create / Link Master Record →</button></div></section>
        <section class="workspace-pane" data-ir-pane="notes"><div class="work-card"><span class="eyebrow">Reviewer Notes</span><textarea id="irReviewerNote" style="width:100%;min-height:150px;margin:10px 0;border:1px solid var(--line);border-radius:12px;background:rgba(6,19,35,.72);color:var(--cream);padding:12px">${esc(reviewerNote)}</textarea><button class="btn primary" id="saveIrNote">Save Note</button></div></section>
        <section class="workspace-pane" data-ir-pane="history"><div class="work-card" id="irHistory"></div></section>`;
      document.querySelectorAll('[data-ir-tab]').forEach(btn => btn.onclick = () => { document.querySelectorAll('[data-ir-tab]').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('[data-ir-pane]').forEach(p=>p.classList.toggle('active',p.dataset.irPane===btn.dataset.irTab)); });
      const hist = (()=>{try{return JSON.parse(metaValue(row,'History JSON')||'[]')}catch(_){return[]}})();
      $('irHistory').innerHTML = hist.length ? hist.slice().reverse().map(h=>`<div class="note-card"><strong>${esc(h.event)}</strong><small>${esc(new Date(h.at).toLocaleString())}</small></div>`).join('') : '<div class="empty">No processing history yet.</div>';
      $('saveIrNote').onclick = async () => { const note=$('irReviewerNote').value.trim();await patchApplication(row,{notes:setMeta(row,{note,historyEvent:`Reviewer note updated by ${currentUser()}`})});showToast?.('Note saved.');openIntakeWorkspace(row); };
      $('parkIntake').onclick = () => openParkDialog(row);
      $('inactiveIntake').onclick = () => openInactiveDialog(row);
      $('startIntakeWizard').onclick = () => openWizard(row);
      $('modalBackdrop').classList.add('open');
    }

    function openParkDialog(row) {
      const note = prompt('Why is this intake being parked? A note is required.', metaValue(row,'Reviewer Note') || '');
      if (!note?.trim()) return;
      patchApplication(row,{status:'parked',notes:setMeta(row,{state:'parked',note:note.trim(),historyEvent:`Parked by ${currentUser()}: ${note.trim()}`})}).then(()=>{showToast?.('Intake parked.');afterAction();}).catch(e=>alert(e.message));
    }

    function openInactiveDialog(row) {
      const reasons = {'Spam':2,'Test Submission':30,'Duplicate':30,'Applicant Withdrew':90,'No Response':180,'Not a Good Fit':730,'Organization Closed':730,'Other':365};
      const reason = prompt(`Inactive reason (enter exactly one):\n${Object.keys(reasons).join('\n')}`,'');
      if (!reasons[reason]) return alert('Choose one of the listed reasons.');
      const retention = new Date(Date.now()+reasons[reason]*86400000).toISOString();
      patchApplication(row,{status:'inactive',notes:setMeta(row,{state:'inactive',reason,retention,historyEvent:`Moved to Inactive by ${currentUser()}: ${reason}`})}).then(()=>{showToast?.('Intake moved to Inactive.');afterAction();}).catch(e=>alert(e.message));
    }

    function afterAction() {
      $('modalBackdrop').classList.remove('open'); renderIntake();
      if (processingMode) setTimeout(() => {
        const next=eligibleRows().filter(r=>activeState(r)==='new').sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0))[0];
        if(next) openIntakeWorkspace(next); else { processingMode=false; showToast?.('The New queue is empty.'); }
      },150);
    }

    function openWizard(row) {
      let step=0, selectedMaster=null, createNew=false;
      const possible = masters().filter(m => {
        const norm=v=>String(v||'').trim().toLowerCase();
        return (row.email&&m.email&&norm(row.email)===norm(m.email))||(row.phone&&m.phone&&norm(row.phone)===norm(m.phone))||(displayName(row)&&m.name&&norm(displayName(row))===norm(m.name))||(row.website&&m.website&&norm(row.website)===norm(m.website))||(row.address&&m.address&&norm(row.address)===norm(m.address));
      });
      const render = () => {
        $('modalEyebrow').textContent=`Process Intake · ${irNumber(row)}`;$('modalTitle').textContent=displayName(row);$('modalSub').textContent=processingMode?'Processing Mode':'Guided Intake Wizard';
        $('modalBody').innerHTML=`<div class="wizard-progress">${['Review','Find Identity','Verify & Route','Complete'].map((s,i)=>`<div class="wizard-step ${i===step?'active':''}">${s}</div>`).join('')}</div><div id="wizardBody"></div><div class="wizard-nav"><button class="btn" id="wizardBack" ${step===0?'disabled':''}>Back</button><div style="display:flex;gap:8px"><button class="btn" id="wizardCancel">Cancel</button><button class="btn primary" id="wizardNext">${step===3?'Finish':'Next'}</button></div></div>`;
        const body=$('wizardBody');
        if(step===0) body.innerHTML=`<div class="intake-banner"><strong>Review the source application.</strong><div>Confirm that this submission belongs in Intake and has enough information to resolve identity.</div></div>${applicationMarkup(row)}`;
        if(step===1) body.innerHTML=`<div class="work-card"><span class="eyebrow">Possible Master Record Matches</span><div class="match-list">${possible.length?possible.map(m=>`<label class="match-card"><span><strong>${esc(m.name||'Unnamed master')}</strong><small>${esc([m.email,m.phone,m.city].filter(Boolean).join(' · '))}</small></span><input type="radio" name="masterChoice" value="${esc(m.id)}" ${selectedMaster&&String(selectedMaster.id)===String(m.id)?'checked':''}></label>`).join(''):'<div class="empty">No likely matches were found.</div>'}</div><label class="match-card" style="margin-top:10px"><span><strong>Create a new Master Record</strong><small>Use the application information to create a verified identity.</small></span><input type="radio" name="masterChoice" value="new" ${createNew?'checked':''}></label></div>`;
        if(step===2) body.innerHTML=`<div class="work-grid"><div class="work-card"><span class="eyebrow">Verified Identity</span><div class="work-field"><label>Name</label><input id="wizName" value="${esc(selectedMaster?.name||displayName(row))}"></div><div class="work-field"><label>Email</label><input id="wizEmail" value="${esc(selectedMaster?.email||row.email||'')}"></div><div class="work-field"><label>Phone</label><input id="wizPhone" value="${esc(selectedMaster?.phone||row.phone||'')}"></div><div class="work-field"><label>Website</label><input id="wizWebsite" value="${esc(selectedMaster?.website||row.website||'')}"></div></div><div class="work-card"><span class="eyebrow">Destination</span><div class="work-field"><label>Department</label><select id="wizDestination"><option ${destinationFor(row)==='Business Network'?'selected':''}>Business Network</option><option ${destinationFor(row)==='Volunteers'?'selected':''}>Volunteers</option><option ${destinationFor(row)==='Partnerships'?'selected':''}>Partnerships</option><option>Resources</option><option>Events</option></select></div><p style="color:var(--muted)">The original intake remains the department record and source evidence. No duplicate application is created.</p></div></div>`;
        if(step===3) body.innerHTML=`<div class="intake-banner"><strong>Ready to complete intake.</strong><div>${createNew?'A new Master Record will be created.':`This intake will link to ${esc(selectedMaster?.name||'the selected Master Record')}.`} It will be routed to <b>${esc(window.__intakeDestination||destinationFor(row))}</b> and removed from the active queue.</div></div>`;
        $('wizardBack').onclick=()=>{step--;render()};$('wizardCancel').onclick=()=>openIntakeWorkspace(row);
        $('wizardNext').onclick=async()=>{
          try {
            if(step===1){const choice=document.querySelector('input[name="masterChoice"]:checked')?.value;if(!choice)return alert('Select an existing Master Record or choose Create New.');createNew=choice==='new';selectedMaster=createNew?null:masters().find(m=>String(m.id)===String(choice));}
            if(step===2){window.__intakeVerified={name:$('wizName').value.trim(),email:$('wizEmail').value.trim(),phone:$('wizPhone').value.trim(),website:$('wizWebsite').value.trim()};window.__intakeDestination=$('wizDestination').value;if(!window.__intakeVerified.name)return alert('A verified name is required.');}
            if(step<3){step++;render();return;}
            $('wizardNext').disabled=true;$('wizardNext').textContent='Completing...';
            let master=selectedMaster;
            if(createNew){const v=window.__intakeVerified||{};master=await createMaster({name:v.name,email:v.email,phone:v.phone,website:v.website,address:row.address||'',city:row.city||'',county:row.county||'Polk',category:row.category||destinationFor(row),status:'active',notes:`Created from ${irNumber(row)}\nSource application ID: ${row.id}`});master.source='businesses';allRows().push(master);}
            await patchApplication(row,{master_id:master.id,status:'processed',notes:setMeta(row,{state:'processed',historyEvent:`Processed by ${currentUser()}; linked to Master Record ${master.name}; routed to ${window.__intakeDestination||destinationFor(row)}`})});
            showToast?.('Intake completed.');afterAction();
          } catch(e){console.error(e);alert(`Could not complete intake: ${e.message}`);$('wizardNext').disabled=false;$('wizardNext').textContent='Finish';}
        };
      };
      render();
    }

    const originalNavButtons = [...document.querySelectorAll('.nav [data-view]')];
    originalNavButtons.forEach(btn => {
      if (btn.dataset.view === 'intake') return;
      btn.addEventListener('click', () => { if ($('intake')?.classList.contains('active')) $('intake').classList.remove('active'); });
    });
  });
})();