window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

if (window.location.pathname.includes('business-network')) {
  const cardsScript = document.createElement('script');
  cardsScript.src = 'land-of-hearts-cards-view.js?v=show-stage-20260707';
  cardsScript.defer = true;
  document.head.appendChild(cardsScript);
}

// Staff portal now runs its Business Network Manager directly from staff.html.
// Legacy Backstage experiment scripts are intentionally not loaded here so the
// completed Business Network workflow stays clean and predictable.
