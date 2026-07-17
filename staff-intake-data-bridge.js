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
    const relationshipTerms = /volunteer|partner|partnership|sponsor|collaborat|business|land[ _-]?of[ _-]?hearts|directory|affirming/;

    if (/contact(?: us)?|general inquiry|resource request|support request|help request|crisis/.test(haystack) &&
        !relationshipTerms.test(haystack)) return '';

    if (/volunteer|volunteering|get involved|skills offered|availability/.test(haystack)) return 'volunteer';
    if (/partner|partnership|sponsor|collaborat|referral partner|community partner|health partner/.test(haystack)) return 'partner';
    if (/business|land[ _-]?of[ _-]?hearts|directory|affirming(?: business)? network|business network|business application/.test(haystack)) return 'business';

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

  function installAuthoritativeFeed(rows) {
    window.hpcIntakeApplications = rows;

    if (!window.__hpcOriginalBusinessRecords && typeof window.businessRecords === 'function') {
      window.__hpcOriginalBusinessRecords = window.businessRecords;
    }

    const baseProvider = window.__hpcOriginalBusinessRecords;
    if (typeof baseProvider === 'function') {
      window.businessRecords = () => {
        const base = Array.isArray(baseProvider()) ? baseProvider() : [];
        const nonIntake = base.filter(row => row.source !== 'applications');
        return [...nonIntake, ...window.hpcIntakeApplications];
      };
    }
  }

  function refreshIntakeWhenReady() {
    const attempts = [0, 150, 400, 900, 1600];
    attempts.forEach(delay => setTimeout(() => {
      const button = document.querySelector('.nav [data-view="intake"]');
      const remembered = localStorage.getItem('hpcAtlasLastDepartment') || sessionStorage.getItem('hpcAtlasLastDepartment') || '';
      const intakeVisible = button?.classList.contains('active') || document.getElementById('intake')?.classList.contains('active') || remembered === 'intake';
      if (intakeVisible && button) button.click();
    }, delay));
  }

  async function loadApplications() {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const accessToken = sessionStorage.getItem('hpcAtlasAccessToken');
      if (accessToken && window.HPC_DATA_URL && window.HPC_DATA_PUBLIC_TOKEN && typeof window.businessRecords === 'function') {
        const response = await fetch(`${window.HPC_DATA_URL}/rest/v1/applications?select=*&order=created_at.asc`, {
          headers: {
            apikey: window.HPC_DATA_PUBLIC_TOKEN,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          },
          cache: 'no-store'
        });
        if (!response.ok) throw new Error((await response.text()) || `Intake feed failed (${response.status})`);

        const allApplications = await response.json();
        const rows = allApplications.map(normalizeApplication).filter(row => row.type);
        installAuthoritativeFeed(rows);

        window.dispatchEvent(new CustomEvent('hpc:intake-data-ready', {
          detail: { count: rows.length, totalApplications: allApplications.length }
        }));
        refreshIntakeWhenReady();
        return;
      }
      await sleep(250);
    }
    throw new Error('Atlas login data was not ready for Intake.');
  }

  window.addEventListener('hpc:navigation-restored', refreshIntakeWhenReady);

  loadApplications().catch(error => {
    console.error('HPC Intake data bridge:', error);
    window.dispatchEvent(new CustomEvent('hpc:intake-data-error', { detail: { message: error.message } }));
  });
})();