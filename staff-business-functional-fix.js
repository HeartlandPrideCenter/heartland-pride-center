(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn, { once: true })
    : fn();

  ready(() => {
    const previousOpenBusiness = window.openBusiness;
    if (typeof previousOpenBusiness !== 'function') return;

    const showMessage = (message, isError = false) => {
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';
        toast.style.borderColor = isError ? 'rgba(255,122,130,.55)' : 'rgba(59,217,139,.45)';
        clearTimeout(window.__businessToastTimer);
        window.__businessToastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
      } else if (isError) {
        window.alert(message);
      }
    };

    const tableForSource = (source) => {
      if (source === 'applications') return 'applications';
      if (source === 'business_listings') return 'business_listings';
      if (String(source).startsWith('businesses')) return 'businesses';
      return '';
    };

    const updateManualStatus = (id, status) => {
      const records = JSON.parse(localStorage.getItem('hpcManualIntake') || '[]');
      const record = records.find(item => String(item.id) === String(id));
      if (!record) throw new Error('Manual business record was not found.');
      record.status = status;
      record.updated_at = new Date().toISOString();
      localStorage.setItem('hpcManualIntake', JSON.stringify(records));
    };

    const updateDatabaseStatus = async (source, id, status) => {
      const table = tableForSource(source);
      if (!table) throw new Error('This record source cannot be updated.');

      const baseUrl = window.HPC_DATA_URL;
      const publicToken = window.HPC_DATA_PUBLIC_TOKEN || '';
      const accessToken = sessionStorage.getItem('hpcAtlasAccessToken') || publicToken;
      if (!baseUrl || !publicToken) throw new Error('Database connection settings are missing.');

      const response = await fetch(`${baseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          apikey: publicToken,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Status update failed with ${response.status}.`);
      }
    };

    const moveRecord = async (source, id, status, button) => {
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = 'Saving...';
      try {
        if (source === 'manual') updateManualStatus(id, status);
        else await updateDatabaseStatus(source, id, status);

        showMessage(`Business moved to ${status}.`);
        document.getElementById('modalBackdrop')?.classList.remove('open');

        const reloadButton = document.getElementById('reloadBtn');
        if (reloadButton) reloadButton.click();
        else window.location.reload();
      } catch (error) {
        console.error('Business workflow update failed:', error);
        showMessage(`Could not update the business: ${error.message}`, true);
        button.disabled = false;
        button.textContent = originalText;
      }
    };

    window.openBusiness = function functionalBusinessWorkspace(source, id) {
      previousOpenBusiness(source, id);

      requestAnimationFrame(() => {
        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        modalBody.querySelectorAll('[data-move]').forEach(button => {
          const cleanButton = button.cloneNode(true);
          button.replaceWith(cleanButton);
          cleanButton.addEventListener('click', () => moveRecord(source, id, cleanButton.dataset.move, cleanButton));
        });

        const listingForm = document.getElementById('businessForm');
        const statusSelect = document.getElementById('f_status');
        if (listingForm && statusSelect) {
          const publishButton = [...listingForm.querySelectorAll('button')].find(button => button.textContent.trim() === 'Publish');
          if (publishButton) {
            const cleanPublish = publishButton.cloneNode(true);
            publishButton.replaceWith(cleanPublish);
            cleanPublish.addEventListener('click', () => moveRecord(source, id, 'published', cleanPublish));
          }
        }
      });
    };
  });
})();
