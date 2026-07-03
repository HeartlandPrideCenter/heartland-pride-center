(() => {
  const categoryOptions = [
    'Restaurant & Cafe', 'Retail', 'Health Care', 'Mental Health', 'Legal Services', 'Financial Services', 'Real Estate', 'Salon & Spa', 'Fitness', 'Entertainment', 'Arts & Culture', 'Education', 'Nonprofit', 'Faith Community', 'Professional Services', 'Automotive', 'Lodging', 'Other'
  ];
  const heartOptions = ['Community Heart', 'Gold Heart', 'Rainbow Heart'];
  const badgeOptions = [
    ['lgbtq_owned', '🏳️‍🌈 LGBTQ+ Owned & Operated'],
    ['proud_ally', '🤝 Proud Ally'],
    ['accessible', '♿ Accessible']
  ];

  function esc(value) {
    return String(value || '').replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function selectHtml(name, current, options) {
    return '<select name="' + name + '">' + options.map((option) => '<option value="' + esc(option) + '" ' + (option === current ? 'selected' : '') + '>' + esc(option) + '</option>').join('') + '</select>';
  }

  function badgeCheckboxes(current) {
    const selected = Array.isArray(current) ? current : [];
    return badgeOptions.map(([value, label]) => '<label class="editor-check"><input type="checkbox" name="badges" value="' + value + '" ' + (selected.includes(value) ? 'checked' : '') + '> ' + label + '</label>').join('');
  }

  function ensureEditorShell() {
    let shell = document.getElementById('businessEditorShell');
    if (shell) return shell;
    shell = document.createElement('div');
    shell.id = 'businessEditorShell';
    shell.className = 'business-editor-shell';
    shell.innerHTML = '<div class="business-editor-panel"><button class="editor-close" type="button" aria-label="Close editor">×</button><div id="businessEditorContent"></div></div>';
    document.body.appendChild(shell);
    shell.querySelector('.editor-close').addEventListener('click', () => shell.classList.remove('open'));
    shell.addEventListener('click', (event) => { if (event.target === shell) shell.classList.remove('open'); });
    const style = document.createElement('style');
    style.textContent = '.business-editor-shell{position:fixed;inset:0;z-index:9999;background:rgba(3,10,19,.72);backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:24px}.business-editor-shell.open{display:flex}.business-editor-panel{position:relative;width:min(760px,96vw);max-height:88vh;overflow:auto;border:1px solid rgba(239,205,114,.28);border-radius:28px;background:#081523;color:#f5f1e8;box-shadow:0 30px 100px rgba(0,0,0,.45);padding:30px}.editor-close{position:absolute;right:18px;top:14px;border:1px solid rgba(245,241,232,.18);border-radius:999px;background:rgba(255,255,255,.06);color:#fff;width:38px;height:38px;font-size:24px}.business-editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.business-editor-grid label{display:grid;gap:7px;font-weight:800;color:#efcd72;text-transform:uppercase;font-size:.75rem;letter-spacing:.08em}.business-editor-grid input,.business-editor-grid textarea,.business-editor-grid select{width:100%;border:1px solid rgba(245,241,232,.16);border-radius:16px;background:rgba(255,255,255,.06);color:#fff;padding:12px}.business-editor-grid textarea{min-height:120px}.business-editor-grid .span{grid-column:1/-1}.editor-checks{display:grid;gap:8px}.editor-check{display:block;color:#f5f1e8;text-transform:none!important;letter-spacing:0!important;font-size:.95rem!important}.editor-actions{display:flex;gap:12px;justify-content:flex-end;margin-top:18px}@media(max-width:700px){.business-editor-grid{grid-template-columns:1fr}.business-editor-panel{padding:24px 18px}}';
    document.head.appendChild(style);
    return shell;
  }

  window.editBusiness = (id) => {
    const business = businesses.find((item) => item.id === id);
    if (!business) return toast('Business not found');
    const shell = ensureEditorShell();
    const content = document.getElementById('businessEditorContent');
    content.innerHTML = '<span class="eyeline">Edit Business</span><h1 style="margin:8px 0 18px">' + esc(business.name) + '</h1><form id="businessEditorForm" class="business-editor-grid"><label>Name<input name="name" required value="' + esc(business.name) + '"></label><label>Category' + selectHtml('category', business.category || 'Other', categoryOptions) + '</label><label class="span">Public Description<textarea name="description">' + esc(business.public_description || business.description || '') + '</textarea></label><label>Address<input name="address" value="' + esc(business.address) + '"></label><label>City<input name="city" value="' + esc(business.city) + '"></label><label>Website<input name="website" value="' + esc(business.website) + '"></label><label>Phone<input name="phone" value="' + esc(business.phone) + '"></label><label>Email<input name="email" value="' + esc(business.email) + '"></label><label>Heart Rating' + selectHtml('heart_rating', business.heart_rating || 'Community Heart', heartOptions) + '</label><label>Status' + selectHtml('status', business.status || 'draft', ['draft', 'published', 'hidden']) + '</label><div class="span"><label>Badges</label><div class="editor-checks">' + badgeCheckboxes(business.badges) + '</div></div><label>Latitude<input name="latitude" value="' + esc(business.latitude || '') + '"></label><label>Longitude<input name="longitude" value="' + esc(business.longitude || '') + '"></label><div class="span editor-actions"><button class="stage-btn" type="button" id="cancelBusinessEdit">Cancel</button><button class="stage-btn" type="submit">Save Changes</button></div></form>';
    shell.classList.add('open');
    document.getElementById('cancelBusinessEdit').addEventListener('click', () => shell.classList.remove('open'));
    document.getElementById('businessEditorForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.target);
      const badges = Array.from(event.target.querySelectorAll('input[name="badges"]:checked')).map((input) => input.value);
      const lat = parseFloat(form.get('latitude'));
      const lon = parseFloat(form.get('longitude'));
      const payload = {
        name: String(form.get('name') || '').trim(),
        category: String(form.get('category') || '').trim(),
        description: String(form.get('description') || '').trim(),
        public_description: String(form.get('description') || '').trim(),
        address: String(form.get('address') || '').trim(),
        city: String(form.get('city') || '').trim(),
        website: String(form.get('website') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
        email: String(form.get('email') || '').trim(),
        heart_rating: String(form.get('heart_rating') || 'Community Heart'),
        status: String(form.get('status') || 'draft'),
        badges
      };
      if (!Number.isNaN(lat)) payload.latitude = lat;
      if (!Number.isNaN(lon)) payload.longitude = lon;
      const res = await fetch(apiBase + `/businesses?id=eq.${id}`, {
        method: 'PATCH',
        headers: authedHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) return toast('Business edit failed');
      shell.classList.remove('open');
      toast('Business updated');
      await loadBackstage();
    });
  };

  window.businessCard = (b) => {
    const details = `${b.category || 'Business'} · ${b.heart_rating || 'Community Heart'}`;
    const coords = b.latitude && b.longitude ? `Map: ${Number(b.latitude).toFixed(5)}, ${Number(b.longitude).toFixed(5)}` : 'Map: needs coordinates';
    const badges = Array.isArray(b.badges) && b.badges.length ? `Badges: ${b.badges.join(', ')}` : 'Badges: none';
    const body = [b.address, b.city, b.public_description || b.description, badges, coords].filter(Boolean).join(' | ');
    return `<div class="record-card"><div><small>${details}</small><strong>${b.name}</strong><p>${body || 'No description.'}</p><span class="status ${statusClass(b.status)}">${statusLabel(b.status)}</span></div><div class="actions"><button class="stage-btn" onclick="editBusiness('${b.id}')">Edit</button><button class="stage-btn" onclick="updateBusiness('${b.id}','published')">Publish</button><button class="stage-btn" onclick="updateBusiness('${b.id}','hidden')">Hide</button><button class="stage-btn" onclick="deleteBusiness('${b.id}')">Delete</button></div></div>`;
  };

  if (typeof renderAll === 'function') renderAll();
})();
