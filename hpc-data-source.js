window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

if (window.location.pathname.includes('business-network')) {
  const cardsScript = document.createElement('script');
  cardsScript.src = 'land-of-hearts-cards-view.js?v=show-stage-20260707';
  cardsScript.defer = true;
  document.head.appendChild(cardsScript);
}

if (window.location.pathname.includes('staff')) {
  window.addEventListener('DOMContentLoaded', () => {
    const operationalScript = document.createElement('script');
    operationalScript.src = 'staff-business-operational.js?v=master-registry-production-20260710';
    operationalScript.onload = () => {
      const masterSurfaceScript = document.createElement('script');
      masterSurfaceScript.src = 'staff-master-surface.js?v=master-surface-refinement-20260710';
      document.body.appendChild(masterSurfaceScript);
    };
    document.body.appendChild(operationalScript);
  }, { once: true });
}

// Production foundation: shared master identity records plus department-owned work records.
// Active refinement: universal master filing cabinet and Business Network department.