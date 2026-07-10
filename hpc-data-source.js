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
    const workflowScript = document.createElement('script');
    workflowScript.src = 'staff-business-workflow.js?v=business-workflow-rebuild-20260709';
    workflowScript.onload = () => {
      const functionalScript = document.createElement('script');
      functionalScript.src = 'staff-business-functional-fix.js?v=functional-20260709';
      document.body.appendChild(functionalScript);
    };
    document.body.appendChild(workflowScript);
  }, { once: true });
}

// Staff portal foundation is locked.
// Active build target: Business Department management workspace.
