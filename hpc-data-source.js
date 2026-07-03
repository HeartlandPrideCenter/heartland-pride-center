window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

if (window.location.pathname.includes('staff')) {
  window.addEventListener('load', () => {
    const coordinateScript = document.createElement('script');
    coordinateScript.src = 'backstage-business-coordinates.js';
    coordinateScript.onload = () => {
      const overrideScript = document.createElement('script');
      overrideScript.src = 'backstage-business-network-overrides.js';
      document.body.appendChild(overrideScript);
    };
    document.body.appendChild(coordinateScript);
  });
}
