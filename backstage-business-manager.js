(() => {
  let managerReady = false;

  function esc(value) {
    return String(value || '').replace(/[&<>\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function ensureManager() {
    if (managerReady) return;
    const panel = document.querySelector('#businesses .stage-panel');
    const records = document.getElementById('businessRecords');
    if (!panel || !records) return;

    const manager = document.createElement('div');
    manager.id = 'businessDirectoryManager';
    manager.className = 'business-manager';
    manager.innerHTML = `
      <div class="manager-stats" id="businessManagerStats"></div>
      <div class="manager-tools">
        <label>Search<input id="businessManagerSearch" placeholder="Search name, category, city, status..."></label>
        <label>Category<select id="businessManagerCategory"><option value="all">All categories</option></select></label>
        <label>Status<select id="businessManagerStatus"><option value="all">All statuses</option></select></label>
      </div>
    `;
    records.before(manager);

    const style = document.createElement('style');
    style.textContent = `
      .business-manager{margin:22px 0;display:grid;gap:14px}.manager-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.manager-stat{border:1px solid rgba(245,241,232,.12);border-radius:18px;background:rgba(255,255,255,.045);padding:14px}.manager-stat strong{display:block;color:rgba(245,241,232,.65);font-size:.75rem;text-transform:uppercase;letter-spacing:.09em}.manager-stat b{display:block;color:#fff;font-size:1.7rem;margin-top:5px}.manager-tools{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px}.manager-tools label{display:grid;gap:7px;color:#efcd72;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;font-weight:900}.manager-tools input,.manager-tools select{width:100%;border:1px solid rgba(245,241,232,.16);border-radius:16px;background:rgba(255,255,255,.07);color:#fff;padding:12px}.manager-empty{border:1px solid rgba(245,241,232,.12);border-radius:18px;background:rgba(255,255,255,.04);padding:18px;color:rgba(245,241,232,.75)}@media(max-width:800px){.manager-stats,.manager-tools{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    ['businessManagerSearch','businessManagerCategory','businessManagerStatus'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', renderBusinessManager);
      document.getElementById(id)?.addEventListener('change', renderBusinessManager);
    });
    managerReady = true;
  }

  function statsHtml() {
    const total = businesses.length;
    const published = businesses.filter(b => b.status === 'published').length;
    const hidden = businesses.filter(b => b.status === 'hidden').length;
    const suspended = businesses.filter(b => b.status === 'suspended').length;
    return [
      ['Total Listings', total],
      ['Published', published],
      ['Hidden', hidden],
      ['Suspended', suspended]
    ].map(([label, value]) => `<div class="manager-stat"><strong>${label}</strong><b>${value}</b></div>`).join('');
  }

  function fillFilters() {
    const categorySelect = document.getElementById('businessManagerCategory');
    const statusSelect = document.getElementById('businessManagerStatus');
    if (!categorySelect || !statusSelect) return;
    const currentCategory = categorySelect.value || 'all';
    const currentStatus = statusSelect.value || 'all';
    const categories = unique(businesses.map(b => b.category));
    const statuses = unique(businesses.map(b => b.status || 'draft'));
    categorySelect.innerHTML = '<option value="all">All categories</option>' + categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    statusSelect.innerHTML = '<option value="all">All statuses</option>' + statuses.map(s => `<option value="${esc(s)}">${esc(statusLabel(s))}</option>`).join('');
    categorySelect.value = categories.includes(currentCategory) ? currentCategory : 'all';
    statusSelect.value = statuses.includes(currentStatus) ? currentStatus : 'all';
  }

  function filteredBusinesses() {
    const q = String(document.getElementById('businessManagerSearch')?.value || '').toLowerCase();
    const category = document.getElementById('businessManagerCategory')?.value || 'all';
    const status = document.getElementById('businessManagerStatus')?.value || 'all';
    return businesses.filter(b => {
      const haystack = [b.name, b.category, b.city, b.status, b.heart_rating, b.address, b.email, b.phone, b.website, b.public_description, b.description].join(' ').toLowerCase();
      return (!q || haystack.includes(q)) && (category === 'all' || b.category === category) && (status === 'all' || (b.status || 'draft') === status);
    });
  }

  window.renderBusinessManager = () => {
    ensureManager();
    const records = document.getElementById('businessRecords');
    const stats = document.getElementById('businessManagerStats');
    if (!records || !stats) return;
    stats.innerHTML = statsHtml();
    fillFilters();
    const list = filteredBusinesses();
    records.innerHTML = list.length ? list.map(businessCard).join('') : '<div class="manager-empty"><strong>No matching businesses.</strong><p>Try changing the search or filters.</p></div>';
  };

  const originalRenderAll = window.renderAll;
  window.renderAll = function patchedRenderAll() {
    if (typeof originalRenderAll === 'function') originalRenderAll();
    renderBusinessManager();
  };

  setTimeout(renderBusinessManager, 400);
})();
