(() => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const normalizeText = value => String(value || '').trim().toLowerCase();

  function searchableRow(row) {
    return Object.entries(row || {})
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
      .map(([key, value]) => `${normalizeText(key)} ${normalizeText(value)}`)
      .join(' ');
  }

  function canonicalType(row) {
    const haystack = searchableRow(row);

    // Conversations and one-time help requests belong in email/service workflows,
    // not in the relationship-intake queue.
    if (/contact(?: us)?|general inquiry|resource request|support request|help request|crisis/.test(haystack) &&
        !/volunteer|partner|partnership|sponsor|collaborat|business|land[ _-]?of[ _-]?hearts|directory|affirming/.test(haystack)) {
      return '';
    }

    if (/volunteer|volunteering|get involved|skills offered|availability/.test(haystack)) return 'volunteer';
    if (/partner|partnership|sponsor|collaborat|referral partner|community partner|health partner/.test(haystack)) return 'partner';
    if (/business|land[ _-]?of[ _-]?hearts|directory|affirming(?: business)? network|business network|business application/.test(haystack)) return 'business';

    // Legacy Business Network rows sometimes lack a form label but contain the
    // characteristic organization/listing fields used by that application.
    if ((row.organization_name || row.business_name || row.website) &&
        (row.category || row.address || row.public_description || row.description)) return 'business';

    return '';
  }

  function normalizeApplication(row) {
    const type = canonicalType(row);
    return {
      ...row,
      source: 'applications',
      type,
      name: row.name || row.organization_name || row.business_name || row.contact_name || 'Unnamed intake',
      organization_name: row.organization_name || row.business_name || row.name || '',
      contact_name: row.contact_name || row.primary_contact || row.name || '',
      status: row.status || 'new'
    };
  }

  async function loadApplications() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const accessToken = sessionStorage.getItem('hpcAtlasAccessToken');
      if (accessToken && window.HPC_DATA_URL && window.HPC_DATA_PUBLIC_TOKEN && typeof window.businessRecords === 'function') {
        const response = await fetch(`${window.HPC_DATA_URL}/rest/v1/applications?select=*&order=created_at.asc`, {
          headers: {
            apikey: window.HPC_DATA_PUBLIC_TOKEN,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          }
        });
        if (!response.ok) throw new Error((await response.text()) || `Intake feed failed (${response.status})`);
        const allApplications = await response.json();
        const rows = allApplications.map(normalizeApplication).filter(row => row.type);

        const original = window.businessRecords;
        window.businessRecords = () => {
          const base = Array.isArray(original()) ? original() : [];
          const merged = [...base];
          const keys = new Set(base.map(row => `${row.source || ''}:${row.id}`));
          rows.forEach(row => {
            const key = `applications:${row.id}`;
            if (!keys.has(key)) {
              merged.push(row);
              keys.add(key);
            }
          });
          return merged;
        };

        window.dispatchEvent(new CustomEvent('hpc:intake-data-ready', {
          detail: { count: rows.length, totalApplications: allApplications.length }
        }));
        const intakeButton = document.querySelector('.nav [data-view="intake"]');
        if (intakeButton?.classList.contains('active')) intakeButton.click();
        return;
      }
      await sleep(250);
    }
    throw new Error('Atlas login data was not ready for Intake.');
  }

  loadApplications().catch(error => {
    console.error('HPC Intake data bridge:', error);
    window.dispatchEvent(new CustomEvent('hpc:intake-data-error', { detail: { message: error.message } }));
  });
})();