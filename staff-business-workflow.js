(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const style = document.createElement('style');
    style.textContent = `
      #business .business-filter{padding:18px;border-radius:20px;background:rgba(13,34,56,.94)}
      #business .business-filter .field{margin:12px 0 8px}
      #business .business-search-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}
      #business .business-search-row .field{margin:0}
      #business .business-search-action{min-width:76px;border-radius:14px}
      #business .filter-stack{gap:8px}
      #business .filter-btn{min-height:42px;padding:0 12px}
      #business .business-row{transition:border-color .16s ease,background .16s ease,transform .16s ease}
      #business .business-row:hover{transform:translateY(-1px)}
      .modal .tabs{position:sticky;top:0;z-index:4;padding:8px 0 12px;background:#071827}
      .modal .tabs .btn{border-radius:12px;text-transform:none;letter-spacing:0;font-size:.76rem}
      .workflow-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}
      .workflow-stat{border:1px solid var(--line);border-radius:16px;padding:13px;background:rgba(255,255,255,.04)}
      .workflow-stat small{display:block;color:var(--muted);margin-top:5px}
      .application-readonly{border:1px solid var(--line);border-radius:18px;padding:16px;background:rgba(255,255,255,.035)}
      .application-readonly pre{margin:10px 0 0;white-space:pre-wrap;color:var(--muted);font-size:.8rem;max-height:52vh;overflow:auto}
      @media(max-width:760px){#business .business-search-row,.workflow-overview{grid-template-columns:1fr}.business-search-action{width:100%}}
    `;
    document.head.appendChild(style);

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

    const originalOpenBusiness = window.openBusiness;
    if (typeof originalOpenBusiness !== 'function') return;

    window.openBusiness = function enhancedOpenBusiness(source, id) {
      originalOpenBusiness(source, id);

      const modalBody = document.getElementById('modalBody');
      const tabs = [...modalBody.querySelectorAll('.tabs [data-tab]')];
      const sections = [...modalBody.querySelectorAll(':scope > section.tab')];
      if (tabs.length !== 6 || sections.length !== 6) return;

      const originalHistory = sections[5].querySelector('pre')?.textContent || 'Original submission details are unavailable.';
      sections[4].innerHTML = `
        <div class="application-readonly">
          <span class="eyebrow">Original Application</span>
          <h3>Submitted record</h3>
          <p style="color:var(--muted)">Read-only source information. Public edits are made under Public Listing.</p>
          <pre></pre>
        </div>`;
      sections[4].querySelector('pre').textContent = originalHistory;

      const order = [0, 4, 1, 2, 3, 5];
      const labels = ['Overview', 'Application', 'Public Listing', 'Internal', 'Documents', 'History'];
      const tabBar = modalBody.querySelector('.tabs');

      order.forEach((oldIndex, newIndex) => {
        const tab = tabs[oldIndex];
        const section = sections[oldIndex];
        tab.textContent = labels[newIndex];
        tab.dataset.tab = String(newIndex);
        tabBar.appendChild(tab);
        modalBody.appendChild(section);
      });

      const reorderedSections = [...modalBody.querySelectorAll(':scope > section.tab')];
      [...tabBar.querySelectorAll('[data-tab]')].forEach((button, index) => {
        button.classList.toggle('primary', index === 0);
        button.onclick = () => {
          [...tabBar.querySelectorAll('[data-tab]')].forEach(b => b.classList.toggle('primary', b === button));
          reorderedSections.forEach((section, sectionIndex) => section.classList.toggle('active', sectionIndex === index));
        };
      });
      reorderedSections.forEach((section, index) => section.classList.toggle('active', index === 0));

      const overview = reorderedSections[0];
      const preview = overview.querySelector('.preview');
      const health = overview.querySelector('.card');
      if (preview && health && !overview.querySelector('.workflow-overview')) {
        const summary = document.createElement('div');
        summary.className = 'workflow-overview span';
        summary.innerHTML = `
          <div class="workflow-stat"><span class="eyebrow">Status</span><small>${document.getElementById('modalSub')?.textContent || 'Business record'}</small></div>
          <div class="workflow-stat"><span class="eyebrow">Public Listing</span><small>Preview and listing controls are ready.</small></div>
          <div class="workflow-stat"><span class="eyebrow">Next Action</span><small>Review missing listing-health items.</small></div>`;
        overview.insertBefore(summary, overview.firstChild);
      }
    };
  });
})();
