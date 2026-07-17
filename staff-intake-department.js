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
    const notify = message => window.showToast?.(message);
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
      const match = notesText(row).match(new RegExp(`^Intake ${key}:\\s*(.*)$`, 'mi'));
      return match ? decodeURIComponent(match[1]) : '';
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
      const type = String(row.type || '').toLowerCase();
      if (type === 'business') return 'Business Network Application';
      if (/volunteer/.test(type)) return 'Volunteer Application';
      return 'Partnership Application';
    };
    const destinationFor = row => /business/i.test(row.type) ? 'Business Network' : /volunteer/i.test(row.type) ? 'Volunteers' : 'Partnerships';
    const currentUser = () => {
      try {
        const payload = JSON.parse(atob(token().split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
        return payload.user_metadata?.full_name || payload.user_metadata?.name || payload.email || 'Staff reviewer';
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
      .intake-shell{display:grid;gap:12px}.intake-top{border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.045);padding:14px}.intake-tabs{display:flex;gap:7px;flex-wrap:wrap}.intake-tab{min-width:110px;justify-content:space-between}.intake-tab span:last-child{border-radius:999px;background:rgba(255,255,255,.09);padding:3px 7px}.intake-actions{display:flex;gap:9px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap}.process-next{min-width:190px}.intake-search-wrap{display:none;margin-top:10px}.intake-search-wrap.open{display:block}.intake-search-wrap input{width:100%;min-height:42px;border:1px solid var(--line);border-radius:11px;background:rgba(6,19,35,.72);color:var(--cream);padding:0 12px}.intake-list{border:1px solid var(--line);border-radius:14px;overflow:hidden}.intake-head,.intake-row{display:grid;grid-template-columns:145px minmax(190px,1.2fr) 180px minmax(0,1fr) 118px;gap:14px;align-items:center;padding:10px 16px}.intake-head{background:rgba(255,255,255,.07);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:850}.intake-head span:last-child,.intake-row>span:last-child{text-align:right;padding-right:5px;white-space:nowrap}.intake-row{width:100%;border:0;border-top:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--cream);text-align:left;cursor:pointer}.intake-row:hover{background:rgba(240,206,115,.08)}.intake-row strong,.intake-row small{display:block}.intake-row small{color:var(--muted);margin-top:3px}.intake-contact{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ir-state{display:inline-flex;align-items:center;gap:7px;font-weight:850}.ir-state i{width:9px;height:9px;border-radius:50%;background:#47d786}.ir-state.parked i{background:#e6bd55}.ir-state.inactive i{background:#9aa6b2}.intake-preview{position:fixed;z-index:1500;width:285px;max-width:calc(100vw - 28px);border:1px solid var(--line);border-radius:14px;padding:13px 15px;background:#0a2035;color:var(--cream);box-shadow:0 18px 50px rgba(0,0,0,.42);pointer-events:none}.intake-preview small{display:block;color:var(--muted);margin-top:5px}.intake-banner{border:1px solid rgba(240,206,115,.35);border-radius:13px;background:rgba(212,175,55,.09);padding:12px;margin-bottom:12px}.intake-app-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.intake-app-field{border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.025);padding:12px}.intake-app-field.full{grid-column:1/-1}.intake-app-field small{display:block;color:var(--gold2);font-size:.68rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}.queue-empty{text-align:center;padding:44px 18px;color:var(--muted)}
      #modalBackdrop.atlas-workspace-open{padding:18px!important;align-items:center!important}#modalBackdrop.atlas-workspace-open>*{width:min(1180px,96vw)!important;height:min(860px,94vh)!important;max-width:none!important;max-height:94vh!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}#modalBackdrop.atlas-workspace-open #modalBody{flex:1!important;min-height:0!important;overflow:hidden!important;padding:0!important}.atlas-workspace-shell{height:100%;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto}.atlas-workspace-tabs,.wizard-progress{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:7px;padding:8px 14px;border-bottom:1px solid var(--line);background:rgba(4,17,29,.5)}.atlas-workspace-tabs .btn,.wizard-step{min-height:34px!important;padding:6px 10px!important;border:1px solid var(--line);border-radius:10px;text-align:center;font-size:.72rem;font-weight:850;color:var(--muted);background:rgba(255,255,255,.025)}.atlas-workspace-tabs .btn.active,.wizard-step.active{border-color:rgba(240,206,115,.62);color:var(--gold2);background:rgba(212,175,55,.1)}.atlas-workspace-content{min-height:0;overflow:auto;padding:14px}.atlas-workspace-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 14px;border-top:1px solid var(--line);background:rgba(4,17,29,.78)}.atlas-footer-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.workspace-pane{display:none}.workspace-pane.active{display:block}.match-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(260px,.75fr);gap:14px}.match-list{display:grid;gap:10px}.match-card{position:relative;display:block;border:1px solid var(--line);border-radius:14px;padding:15px 46px 15px 16px;background:rgba(255,255,255,.025);cursor:pointer}.match-card:hover{border-color:rgba(240,206,115,.5);background:rgba(212,175,55,.07)}.match-card.selected{border-color:var(--gold2);box-shadow:0 0 0 1px rgba(240,206,115,.24) inset}.match-card input{position:absolute;right:16px;top:18px;width:18px;height:18px}.match-card strong{display:block;font-size:1rem;margin-bottom:8px}.match-meta{display:grid;gap:5px;color:var(--muted);font-size:.88rem}.match-reasons{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.match-reason{border-radius:999px;padding:4px 8px;background:rgba(71,215,134,.11);color:#8ce8b3;font-size:.72rem;font-weight:800}.source-summary{border:1px solid var(--line);border-radius:14px;padding:15px;background:rgba(255,255,255,.025);height:max-content}.source-summary h3{margin:0 0 10px}.source-summary dl{display:grid;gap:9px;margin:0}.source-summary dt{font-size:.67rem;text-transform:uppercase;letter-spacing:.08em;color:var(--gold2);font-weight:900}.source-summary dd{margin:2px 0 0;color:var(--cream);overflow-wrap:anywhere}.inline-error{display:none;margin-top:10px;border:1px solid rgba(255,119,119,.45);border-radius:11px;background:rgba(180,40,40,.12);color:#ffb0b0;padding:10px 12px;font-weight:800}.inline-error.show{display:block}.atlas-dialog-layer{position:fixed;inset:0;z-index:5000;display:grid;place-items:center;padding:20px;background:rgba(1,9,18,.72);backdrop-filter:blur(5px)}.atlas-dialog{width:min(560px,94vw);max-height:86vh;overflow:auto;border:1px solid rgba(240,206,115,.42);border-radius:20px;background:#0a2035;color:var(--cream);box-shadow:0 28px 80px rgba(0,0,0,.55)}.atlas-dialog-head{padding:18px 20px;border-bottom:1px solid var(--line)}.atlas-dialog-head h2{margin:0 0 5px}.atlas-dialog-body{padding:18px 20px}.atlas-dialog-foot{display:flex;justify-content:flex-end;gap:9px;padding:13px 20px;border-top:1px solid var(--line)}.atlas-dialog textarea{width:100%;min-height:120px;border:1px solid var(--line);border-radius:12px;background:rgba(6,19,35,.72);color:var(--cream);padding:12px;resize:vertical}.reason-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.reason-option{display:flex;gap:9px;align-items:center;border:1px solid var(--line);border-radius:11px;padding:10px 12px;cursor:pointer;background:rgba(255,255,255,.025)}.reason-option:has(input:checked){border-color:var(--gold2);background:rgba(212,175,55,.09)}
      @media(max-width:850px){.intake-head{display:none}.intake-row{grid-template-columns:1fr auto}.intake-row>span:nth-child(3),.intake-row>span:nth-child(4){display:none}.intake-app-grid,.match-layout{grid-template-columns:1fr}.intake-app-field.full{grid-column:auto}.atlas-workspace-tabs,.wizard-progress{grid-auto-flow:row;grid-template-columns:1fr 1fr}.reason-grid{grid-template-columns:1fr}#modalBackdrop.atlas-workspace-open{padding:8px!important}#modalBackdrop.atlas-workspace-open>*{width:98vw!important;height:96vh!important;max-height:96vh!important}}
    `;
    document.head.appendChild(style);

    let queueTab = 'new';
    let processingMode = false;
    let activeIntake = null;

    function applyWorkspaceFrame() {
      $('modalBackdrop')?.classList.add('atlas-workspace-open');
    }
    function closeWorkspaceFrame() {
      $('modalBackdrop')?.classList.remove('open');
      $('modalBackdrop')?.classList.remove('atlas-workspace-open');
    }

    function selectRows() {
      const query = String($('intakeSearch')?.value || '').trim().toLowerCase();
      return eligibleRows().filter(row => activeState(row) === queueTab && (!query || [displayName(row),row.contact_name,row.email,row.phone,row.city,row.category,intakeType(row),irNumber(row)].join(' ').toLowerCase().includes(query)))
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
      const count = counts();
      const oldest = eligibleRows().filter(r => activeState(r) === 'new').sort((a,b) => new Date(a.created_at)-new Date(b.created_at))[0];
      intakeSection.innerHTML = `<div class="intake-shell">
        <div class="intake-top">
          <div class="intake-tabs">${['new','parked','inactive'].map(tab => `<button class="btn intake-tab ${queueTab===tab?'primary':''}" data-intake-tab="${tab}"><span>${tab[0].toUpperCase()+tab.slice(1)}</span><span>${count[tab]}</span></button>`).join('')}</div>
          <div class="intake-actions"><div><strong>${count.new} waiting</strong><small style="display:block;color:var(--muted);margin-top:3px">${oldest ? `Oldest received ${new Date(oldest.created_at).toLocaleDateString()}` : 'The New queue is clear.'}</small></div><div style="display:flex;gap:8px"><button class="btn" id="toggleIntakeSearch">⌕ Search</button><button class="btn primary process-next" id="processNext">▶ Process Next</button></div></div>
          <div class="intake-search-wrap" id="intakeSearchWrap"><input id="intakeSearch" placeholder="Search intake records..."></div>
        </div>
        <div class="intake-list"><div class="intake-head"><span>Status / IR #</span><span>Applicant</span><span>Application</span><span>Contact</span><span>Received</span></div><div id="intakeQueueList"></div></div>
      </div>`;
      document.querySelectorAll('[data-intake-tab]').forEach(button => button.onclick = () => { queueTab = button.dataset.intakeTab; renderIntake(); });
      $('toggleIntakeSearch').onclick = () => {
        const wrap = $('intakeSearchWrap');
        wrap.classList.toggle('open');
        if (wrap.classList.contains('open')) setTimeout(() => $('intakeSearch')?.focus(), 0);
      };
      $('processNext').onclick = () => {
        const next = eligibleRows().filter(r => activeState(r) === 'new').sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0))[0];
        if (!next) return notify('The New queue is empty.');
        processingMode = true;
        openIntakeWorkspace(next);
      };
      drawQueue();
      $('intakeSearch')?.addEventListener('input', drawQueue);
      $('intakeSearch')?.addEventListener('keydown', event => { if (event.key === 'Escape') $('intakeSearchWrap')?.classList.remove('open'); });
    }

    function drawQueue() {
      const list = $('intakeQueueList');
      if (!list) return;
      const rows = selectRows();
      list.innerHTML = rows.length ? rows.map(row => {
        const contact = row.email || row.phone || 'Not provided';
        return `<button class="intake-row" data-intake-id="${esc(row.id)}"><span><span class="ir-state ${activeState(row)}"><i></i>${esc(activeState(row)[0].toUpperCase()+activeState(row).slice(1))}</span><small>${esc(irNumber(row))}</small></span><span><strong>${esc(displayName(row))}</strong><small>${esc(row.city || row.county || '')}</small></span><span>${esc(intakeType(row))}</span><span class="intake-contact" title="${esc(contact)}">${esc(contact)}</span><span>${esc(new Date(row.created_at || Date.now()).toLocaleDateString())}</span></button>`;
      }).join('') : '<div class="queue-empty">No intake records are in this queue.</div>';
      list.querySelectorAll('[data-intake-id]').forEach(button => {
        const row = eligibleRows().find(r => String(r.id) === String(button.dataset.intakeId));
        button.onclick = () => { processingMode = false; openIntakeWorkspace(row); };
      });
    }

    function showSection(id,title,intro) {
      document.querySelectorAll('.section').forEach(section => section.classList.toggle('active', section.id === id));
      document.querySelectorAll('.nav [data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === id));
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

    function workspaceShell(navigation, content, footer) {
      return `<div class="atlas-workspace-shell"><div class="atlas-workspace-tabs">${navigation}</div><div class="atlas-workspace-content">${content}</div><div class="atlas-workspace-footer">${footer}</div></div>`;
    }

    function openIntakeWorkspace(row) {
      activeIntake = row;
      $('modalEyebrow').textContent = `Intake Record · ${irNumber(row)}`;
      $('modalTitle').textContent = displayName(row);
      $('modalSub').textContent = processingMode ? `Queue Processing · ${intakeType(row)}` : `Manual Review · ${intakeType(row)}`;
      const state = activeState(row);
      const reviewerNote = metaValue(row,'Reviewer Note');
      const inactiveReason = metaValue(row,'Inactive Reason');
      const tabs = ['application','notes','history'].map(tab => `<button class="btn ${tab==='application'?'active':''}" data-ir-tab="${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('');
      const content = `<section class="workspace-pane active" data-ir-pane="application">${state==='parked'?`<div class="intake-banner"><strong>This intake is parked.</strong><div>${esc(reviewerNote || 'No reviewer note was recorded.')}</div></div>`:''}${state==='inactive'?`<div class="intake-banner"><strong>This intake is inactive.</strong><div>${esc(inactiveReason || 'No reason was recorded.')}</div></div>`:''}${applicationMarkup(row)}</section>
        <section class="workspace-pane" data-ir-pane="notes"><div class="work-card"><span class="eyebrow">Reviewer Notes</span><textarea id="irReviewerNote" style="width:100%;min-height:180px;margin:10px 0;border:1px solid var(--line);border-radius:12px;background:rgba(6,19,35,.72);color:var(--cream);padding:12px">${esc(reviewerNote)}</textarea><button class="btn primary" id="saveIrNote">Save Note</button></div></section>
        <section class="workspace-pane" data-ir-pane="history"><div class="work-card" id="irHistory"></div></section>`;
      const footer = `<div><small style="color:var(--muted)">${processingMode?'Queue Processing':'Manual Review'}</small></div><div class="atlas-footer-actions"><button class="btn" id="parkIntake">Park</button><button class="btn danger" id="inactiveIntake">Move to Inactive</button><button class="btn primary" id="startIntakeWizard">Create / Link Master Record →</button></div>`;
      $('modalBody').innerHTML = workspaceShell(tabs, content, footer);
      document.querySelectorAll('[data-ir-tab]').forEach(button => button.onclick = () => {
        document.querySelectorAll('[data-ir-tab]').forEach(item => item.classList.toggle('active', item === button));
        document.querySelectorAll('[data-ir-pane]').forEach(pane => pane.classList.toggle('active', pane.dataset.irPane === button.dataset.irTab));
      });
      const history = (() => { try { return JSON.parse(metaValue(row,'History JSON') || '[]'); } catch (_) { return []; } })();
      $('irHistory').innerHTML = history.length ? history.slice().reverse().map(item => `<div class="note-card"><strong>${esc(item.event)}</strong><small>${esc(new Date(item.at).toLocaleString())}</small></div>`).join('') : '<div class="empty">No processing history yet.</div>';
      $('saveIrNote').onclick = async () => {
        const note = $('irReviewerNote').value.trim();
        try { await patchApplication(row,{notes:setMeta(row,{note,historyEvent:`Reviewer note updated by ${currentUser()}`})}); notify('Note saved.'); openIntakeWorkspace(row); }
        catch (error) { showInlineMessage(error.message); }
      };
      $('parkIntake').onclick = () => openParkDialog(row);
      $('inactiveIntake').onclick = () => openInactiveDialog(row);
      $('startIntakeWizard').onclick = () => openWizard(row);
      applyWorkspaceFrame();
      $('modalBackdrop').classList.add('open');
    }

    function showInlineMessage(message) {
      let box = document.querySelector('.atlas-workspace-content .inline-error');
      if (!box) {
        box = document.createElement('div');
        box.className = 'inline-error';
        document.querySelector('.atlas-workspace-content')?.prepend(box);
      }
      box.textContent = message;
      box.classList.add('show');
      box.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }

    function openAtlasDialog({title, description, body, confirmLabel, confirmClass = 'primary', onConfirm}) {
      document.querySelector('.atlas-dialog-layer')?.remove();
      const layer = document.createElement('div');
      layer.className = 'atlas-dialog-layer';
      layer.innerHTML = `<div class="atlas-dialog" role="dialog" aria-modal="true"><div class="atlas-dialog-head"><h2>${esc(title)}</h2><div style="color:var(--muted)">${esc(description || '')}</div></div><div class="atlas-dialog-body">${body}<div class="inline-error" id="atlasDialogError"></div></div><div class="atlas-dialog-foot"><button class="btn" data-dialog-cancel>Cancel</button><button class="btn ${confirmClass}" data-dialog-confirm>${esc(confirmLabel)}</button></div></div>`;
      document.body.appendChild(layer);
      layer.querySelector('[data-dialog-cancel]').onclick = () => layer.remove();
      layer.querySelector('[data-dialog-confirm]').onclick = async () => {
        const button = layer.querySelector('[data-dialog-confirm]');
        const error = layer.querySelector('#atlasDialogError');
        error.classList.remove('show');
        try {
          button.disabled = true;
          await onConfirm(layer, error);
        } catch (problem) {
          error.textContent = problem.message || String(problem);
          error.classList.add('show');
          button.disabled = false;
        }
      };
      layer.querySelector('textarea,input,select')?.focus();
    }

    function openParkDialog(row) {
      openAtlasDialog({
        title:'Park Intake Record',
        description:'Keep this record available in the Parked queue until staff resumes it.',
        body:`<label style="display:block;font-weight:850;margin-bottom:7px">Reason for parking *</label><textarea id="parkReason" placeholder="Explain what is needed before processing can continue.">${esc(metaValue(row,'Reviewer Note') || '')}</textarea>`,
        confirmLabel:'Park Record',
        onConfirm: async (layer, errorBox) => {
          const note = layer.querySelector('#parkReason').value.trim();
          if (!note) { errorBox.textContent='A parking reason is required.'; errorBox.classList.add('show'); throw new Error('A parking reason is required.'); }
          await patchApplication(row,{status:'parked',notes:setMeta(row,{state:'parked',note,historyEvent:`Parked by ${currentUser()}: ${note}`})});
          layer.remove(); notify('Intake parked.'); afterAction();
        }
      });
    }

    function openInactiveDialog(row) {
      const reasons = {'Spam':2,'Test Submission':30,'Duplicate':30,'Applicant Withdrew':90,'No Response':180,'Not a Good Fit':730,'Organization Closed':730,'Other':365};
      openAtlasDialog({
        title:'Move Intake to Inactive',
        description:'Choose the reason. Atlas will apply the appropriate retention period.',
        body:`<div class="reason-grid">${Object.keys(reasons).map(reason => `<label class="reason-option"><input type="radio" name="inactiveReason" value="${esc(reason)}"><span>${esc(reason)}</span></label>`).join('')}</div><div id="otherReasonWrap" style="display:none;margin-top:12px"><label style="display:block;font-weight:850;margin-bottom:7px">Other reason *</label><textarea id="otherReason"></textarea></div>`,
        confirmLabel:'Move to Inactive',
        confirmClass:'danger',
        onConfirm: async (layer, errorBox) => {
          const chosen = layer.querySelector('input[name="inactiveReason"]:checked')?.value;
          if (!chosen) { errorBox.textContent='Select an inactive reason.'; errorBox.classList.add('show'); throw new Error('Select an inactive reason.'); }
          const custom = layer.querySelector('#otherReason')?.value.trim();
          if (chosen === 'Other' && !custom) { errorBox.textContent='Explain the other reason.'; errorBox.classList.add('show'); throw new Error('Explain the other reason.'); }
          const reason = chosen === 'Other' ? `Other: ${custom}` : chosen;
          const retention = new Date(Date.now() + reasons[chosen] * 86400000).toISOString();
          await patchApplication(row,{status:'inactive',notes:setMeta(row,{state:'inactive',reason,retention,historyEvent:`Moved to Inactive by ${currentUser()}: ${reason}`})});
          layer.remove(); notify('Intake moved to Inactive.'); afterAction();
        }
      });
      document.querySelectorAll('input[name="inactiveReason"]').forEach(input => input.onchange = () => {
        const wrap = $('otherReasonWrap');
        wrap.style.display = input.checked && input.value === 'Other' ? 'block' : 'none';
        if (wrap.style.display === 'block') $('otherReason')?.focus();
      });
    }

    function afterAction() {
      closeWorkspaceFrame();
      renderIntake();
      if (processingMode) setTimeout(() => {
        const next = eligibleRows().filter(r => activeState(r) === 'new').sort((a,b)=>new Date(a.created_at||0)-new Date(b.created_at||0))[0];
        if (next) openIntakeWorkspace(next);
        else { processingMode = false; notify('No more New intake records.'); }
      },150);
    }

    function matchReasons(row, master) {
      const norm = value => String(value || '').trim().toLowerCase();
      const reasons = [];
      if (displayName(row) && master.name && norm(displayName(row)) === norm(master.name)) reasons.push('Name matches');
      if (row.email && master.email && norm(row.email) === norm(master.email)) reasons.push('Email matches');
      if (row.phone && master.phone && norm(row.phone) === norm(master.phone)) reasons.push('Phone matches');
      if (row.website && master.website && norm(row.website) === norm(master.website)) reasons.push('Website matches');
      if (row.address && master.address && norm(row.address) === norm(master.address)) reasons.push('Address matches');
      return reasons;
    }

    function openWizard(row) {
      let step = 0;
      let selectedMaster = null;
      let createNew = false;
      let verified = null;
      let destination = destinationFor(row);
      const possible = masters().map(master => ({ master, reasons: matchReasons(row, master) })).filter(item => item.reasons.length);

      const render = () => {
        $('modalEyebrow').textContent = `Process Intake · ${irNumber(row)}`;
        $('modalTitle').textContent = displayName(row);
        $('modalSub').textContent = processingMode ? 'Queue Processing' : 'Manual Review';
        const steps = ['Review','Find Identity','Verify & Route','Complete'];
        const navigation = steps.map((label,index) => `<div class="wizard-step ${index===step?'active':''}">${index+1}. ${label}</div>`).join('');
        let body = '';
        if (step === 0) body = `<div class="intake-banner"><strong>Review the source application.</strong><div>Confirm that this submission belongs in Intake and contains enough information to resolve identity.</div></div>${applicationMarkup(row)}`;
        if (step === 1) {
          const matchCards = possible.length ? possible.map(({master,reasons}) => `<label class="match-card ${selectedMaster&&String(selectedMaster.id)===String(master.id)?'selected':''}"><input type="radio" name="masterChoice" value="${esc(master.id)}" ${selectedMaster&&String(selectedMaster.id)===String(master.id)?'checked':''}><strong>${esc(master.name || 'Unnamed Master Record')}</strong><div class="match-meta">${master.city?`<span>📍 ${esc(master.city)}</span>`:''}${master.email?`<span>✉ ${esc(master.email)}</span>`:''}${master.phone?`<span>☎ ${esc(master.phone)}</span>`:''}${master.website?`<span>⌁ ${esc(master.website)}</span>`:''}</div><div class="match-reasons">${reasons.map(reason => `<span class="match-reason">✓ ${esc(reason)}</span>`).join('')}</div></label>`).join('') : '<div class="empty">No likely Master Record matches were found.</div>';
          body = `<div class="match-layout"><div><span class="eyebrow">Possible Matches</span><div class="match-list" style="margin-top:10px">${matchCards}<label class="match-card ${createNew?'selected':''}"><input type="radio" name="masterChoice" value="new" ${createNew?'checked':''}><strong>＋ Create a New Master Record</strong><div class="match-meta"><span>No suitable existing identity matches this application.</span><span>Use the verified application information to create one.</span></div></label></div><div class="inline-error" id="wizardError"></div></div><aside class="source-summary"><h3>Application Being Matched</h3><dl><div><dt>Name</dt><dd>${esc(displayName(row))}</dd></div><div><dt>Application</dt><dd>${esc(intakeType(row))}</dd></div><div><dt>Email</dt><dd>${esc(row.email || 'Not provided')}</dd></div><div><dt>Phone</dt><dd>${esc(row.phone || 'Not provided')}</dd></div><div><dt>Location</dt><dd>${esc([row.city,row.county].filter(Boolean).join(', ') || 'Not provided')}</dd></div></dl></aside></div>`;
        }
        if (step === 2) body = `<div class="work-grid"><div class="work-card"><span class="eyebrow">Verified Identity</span><div class="work-field"><label>Name</label><input id="wizName" value="${esc(verified?.name || selectedMaster?.name || displayName(row))}"></div><div class="work-field"><label>Email</label><input id="wizEmail" value="${esc(verified?.email || selectedMaster?.email || row.email || '')}"></div><div class="work-field"><label>Phone</label><input id="wizPhone" value="${esc(verified?.phone || selectedMaster?.phone || row.phone || '')}"></div><div class="work-field"><label>Website</label><input id="wizWebsite" value="${esc(verified?.website || selectedMaster?.website || row.website || '')}"></div><div class="inline-error" id="wizardError"></div></div><div class="work-card"><span class="eyebrow">Route To</span><div class="work-field"><label>Department</label><select id="wizDestination"><option ${destination==='Business Network'?'selected':''}>Business Network</option><option ${destination==='Volunteers'?'selected':''}>Volunteers</option><option ${destination==='Partnerships'?'selected':''}>Partnerships</option><option ${destination==='Resources'?'selected':''}>Resources</option><option ${destination==='Events'?'selected':''}>Events</option></select></div><p style="color:var(--muted)">The original intake remains the department record and source evidence. No duplicate application is created.</p></div></div>`;
        if (step === 3) body = `<div class="intake-banner"><strong>Ready to complete intake.</strong><div style="margin-top:8px">${createNew?'✓ A new Master Record will be created.':`✓ This intake will link to <b>${esc(selectedMaster?.name || 'the selected Master Record')}</b>.`}<br>✓ Routed to <b>${esc(destination)}</b>.<br>✓ Original application retained as source evidence.<br>✓ Removed from the active Intake queue after completion.</div></div>`;
        const footer = `<button class="btn" id="wizardBack" ${step===0?'disabled':''}>Back</button><div class="atlas-footer-actions"><button class="btn" id="wizardCancel">Cancel</button><button class="btn primary" id="wizardNext">${step===3?'Finish':'Next'}</button></div>`;
        $('modalBody').innerHTML = workspaceShell(navigation, body, footer);
        applyWorkspaceFrame();
        document.querySelectorAll('input[name="masterChoice"]').forEach(input => input.onchange = () => {
          createNew = input.value === 'new';
          selectedMaster = createNew ? null : masters().find(master => String(master.id) === String(input.value));
          render();
        });
        $('wizardBack').onclick = () => { step--; render(); };
        $('wizardCancel').onclick = () => openIntakeWorkspace(row);
        $('wizardNext').onclick = async () => {
          const error = $('wizardError');
          error?.classList.remove('show');
          try {
            if (step === 1 && !createNew && !selectedMaster) {
              error.textContent = 'Select an existing Master Record or choose Create New.';
              error.classList.add('show');
              return;
            }
            if (step === 2) {
              verified = { name:$('wizName').value.trim(), email:$('wizEmail').value.trim(), phone:$('wizPhone').value.trim(), website:$('wizWebsite').value.trim() };
              destination = $('wizDestination').value;
              if (!verified.name) { error.textContent='A verified name is required.'; error.classList.add('show'); return; }
            }
            if (step < 3) { step++; render(); return; }
            const button = $('wizardNext');
            button.disabled = true;
            button.textContent = 'Completing...';
            let master = selectedMaster;
            if (createNew) {
              master = await createMaster({name:verified.name,email:verified.email,phone:verified.phone,website:verified.website,address:row.address||'',city:row.city||'',county:row.county||'Polk',category:row.category||destinationFor(row),status:'active',notes:`Created from ${irNumber(row)}\nSource application ID: ${row.id}`});
              master.source = 'businesses';
              allRows().push(master);
            }
            await patchApplication(row,{master_id:master.id,status:'processed',notes:setMeta(row,{state:'processed',historyEvent:`Processed by ${currentUser()}; linked to Master Record ${master.name}; routed to ${destination}`})});
            notify('Intake completed.');
            afterAction();
          } catch (problem) {
            console.error(problem);
            showInlineMessage(`Could not complete intake: ${problem.message}`);
            const button = $('wizardNext');
            if (button) { button.disabled = false; button.textContent = 'Finish'; }
          }
        };
      };
      render();
    }

    const originalNavButtons = [...document.querySelectorAll('.nav [data-view]')];
    originalNavButtons.forEach(button => {
      if (button.dataset.view === 'intake') return;
      button.addEventListener('click', () => { if ($('intake')?.classList.contains('active')) $('intake').classList.remove('active'); });
    });
  });
})();