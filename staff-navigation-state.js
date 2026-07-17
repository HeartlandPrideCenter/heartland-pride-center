(() => {
  const STORAGE_KEY = 'hpcAtlasLastDepartment';
  const validViews = new Set(['dashboard','intake','masters','business','volunteers','partners','events','resources','contact','health']);

  function scrollTopNow() {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.scrollTop = 0;
  }

  function activate(view) {
    const button = document.querySelector(`.nav [data-view="${view}"]`);
    if (!button) return false;
    button.click();
    scrollTopNow();
    return true;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.nav [data-view]');
    if (!button) return;
    const view = button.dataset.view;
    if (validViews.has(view)) localStorage.setItem(STORAGE_KEY, view);
    setTimeout(scrollTopNow, 0);
  });

  function restore() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved || saved === 'dashboard') return;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (activate(saved) || attempts >= 40) clearInterval(timer);
    }, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore, { once: true });
  else restore();

  const modal = document.getElementById('modalBackdrop');
  if (modal) {
    new MutationObserver(() => {
      if (modal.classList.contains('open')) {
        const body = document.getElementById('modalBody');
        if (body) body.scrollTop = 0;
      }
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
})();