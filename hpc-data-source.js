window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

// Emergency public-intake catch net. If Supabase rejects a public application,
// preserve the completed payload locally and open a prefilled email so the
// opportunity is not silently lost while the database policy is repaired.
if (!window.location.pathname.includes('staff') && !window.__HPC_INTAKE_FALLBACK_INSTALLED__) {
  window.__HPC_INTAKE_FALLBACK_INSTALLED__ = true;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    try {
      const requestUrl = String(args[0] || '');
      const options = args[1] || {};
      const isApplicationInsert = requestUrl.includes('/rest/v1/applications') && String(options.method || 'GET').toUpperCase() === 'POST';
      if (isApplicationInsert && !response.ok) {
        const payload = JSON.parse(options.body || '{}');
        const backup = {
          captured_at: new Date().toISOString(),
          page: window.location.href,
          response_status: response.status,
          payload
        };
        const saved = JSON.parse(localStorage.getItem('hpcFailedPublicIntakes') || '[]');
        saved.push(backup);
        localStorage.setItem('hpcFailedPublicIntakes', JSON.stringify(saved.slice(-25)));

        const subject = `Website intake backup: ${payload.category || payload.type || 'Public inquiry'}`;
        const body = [
          'A website submission could not reach the HPC database. The completed information is preserved below.',
          '',
          `Page: ${window.location.href}`,
          `Captured: ${backup.captured_at}`,
          `Type: ${payload.type || ''}`,
          `Category: ${payload.category || ''}`,
          `Name / Organization: ${payload.organization_name || payload.contact_name || ''}`,
          `Contact Name: ${payload.contact_name || ''}`,
          `Email: ${payload.email || ''}`,
          `Phone: ${payload.phone || ''}`,
          `Website: ${payload.website || ''}`,
          `Address: ${payload.address || ''}`,
          `City: ${payload.city || ''}`,
          `County: ${payload.county || ''}`,
          '',
          'Message / Description:',
          payload.description || '',
          '',
          'Additional Notes:',
          payload.notes || ''
        ].join('\n');
        window.setTimeout(() => {
          window.location.href = `mailto:info@heartlandpridecenter.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }, 50);
      }
    } catch (fallbackError) {
      console.error('HPC intake fallback error', fallbackError);
    }
    return response;
  };
}

if (window.location.pathname.includes('business-network')) {
  const cardsScript = document.createElement('script');
  cardsScript.src = 'land-of-hearts-cards-view.js?v=show-stage-20260707';
  cardsScript.defer = true;
  document.head.appendChild(cardsScript);
}

if (window.location.pathname.includes('staff')) {
  window.addEventListener('DOMContentLoaded', () => {
    const operationalScript = document.createElement('script');
    operationalScript.src = 'staff-business-operational.js?v=master-workspace-complete-20260710';
    document.body.appendChild(operationalScript);

    const intakeHealthScript = document.createElement('script');
    intakeHealthScript.src = 'staff-intake-health.js?v=daily-sentinel-20260715';
    document.body.appendChild(intakeHealthScript);
  }, { once: true });
}

// Production foundation: shared master identity records plus department-owned work records.
// Master Records workspace is integrated directly into the working program.
