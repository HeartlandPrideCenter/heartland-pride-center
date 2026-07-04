window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

if (window.location.pathname.includes('business-network')) {
  const applicationModalScript = document.createElement('script');
  applicationModalScript.src = 'land-of-hearts-application-modal.js?v=v2-20260703';
  document.head.appendChild(applicationModalScript);
}

if (window.location.pathname.includes('staff')) {
  const version = 'v2-20260703-3';
  const scripts = [
    'backstage-business-coordinates.js',
    'backstage-business-network-overrides.js',
    'backstage-business-editor.js',
    'backstage-business-workflow-v2.js',
    'backstage-business-manager.js'
  ];

  function loadBackstageScript(index = 0) {
    if (index >= scripts.length) return;
    const script = document.createElement('script');
    script.src = scripts[index] + '?v=' + version;
    script.onload = () => loadBackstageScript(index + 1);
    script.onerror = () => console.error('Backstage script failed to load:', scripts[index]);
    document.head.appendChild(script);
  }

  loadBackstageScript();
}
