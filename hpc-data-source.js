window.HPC_DATA_URL = 'https://xrunawtqotumbsztboxo.supabase.co';
window.HPC_DATA_PUBLIC_TOKEN = 'sb_publishable_UyoqGKapp6Da2CNE4qqlZA_BodqSra8';

if (window.location.pathname.includes('business-network')) {
  const cardsScript = document.createElement('script');
  cardsScript.src = 'land-of-hearts-cards-view.js?v=show-stage-20260707';
  cardsScript.defer = true;
  document.head.appendChild(cardsScript);
}

if (window.location.pathname.includes('staff')) {
  const version = 'v3-20260708-1';
  const v3Styles = document.createElement('link');
  v3Styles.rel = 'stylesheet';
  v3Styles.href = 'backstage-business-network-v3.css?v=' + version;
  document.head.appendChild(v3Styles);

  const scripts = [
    'heartland-os-version.js',
    'heartland-os-collab-tools.js',
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