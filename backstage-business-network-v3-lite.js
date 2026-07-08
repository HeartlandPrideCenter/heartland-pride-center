window.HPC_BUSINESS_NETWORK_V3 = true;

function hpcV3ReadyMessage() {
  console.log('Business Network v3 enhancement layer ready');
}

function hpcV3QaNotice() {
  const notice = document.getElementById('dataNotice');
  if (!notice) return;
  let box = document.getElementById('ajQaSyncNotice');
  if (!box) {
    box = document.createElement('div');
    box.id = 'ajQaSyncNotice';
    box.className = 'notice';
    box.style.marginTop = '10px';
    notice.insertAdjacentElement('afterend', box);
  }
  box.innerHTML = '<strong>AJ QA:</strong> Checking that every live public listing has a managed backstage business record.';
}

async function hpcV3AuditBusinessSync() {
  const box = document.getElementById('ajQaSyncNotice');
  if (!box || !window.HPC_DATA_URL || !window.HPC_DATA_PUBLIC_TOKEN) return;
  const base = window.HPC_DATA_URL + '/rest/v1';
  const headers = { apikey: window.HPC_DATA_PUBLIC_TOKEN, Authorization: 'Bearer ' + window.HPC_DATA_PUBLIC_TOKEN };
  try {
    const appRes = await fetch(base + '/applications?select=*&type=eq.business&status=eq.published', { headers });
    const bizRes = await fetch(base + '/businesses?select=*', { headers });
    if (!appRes.ok || !bizRes.ok) return;
    const apps = await appRes.json();
    const biz = await bizRes.json();
    const linked = new Set(biz.map(b => String(b.application_id || '')));
    const names = new Set(biz.map(b => String(b.name || '').toLowerCase().trim()));
    const orphanApps = apps.filter(a => !linked.has(String(a.id)) && !names.has(String(a.organization_name || '').toLowerCase().trim()));
    const incomplete = biz.filter(b => String(b.status || '').toLowerCase() === 'published' && (!b.name || !b.category || !b.city || !b.description));
    if (!orphanApps.length && !incomplete.length) {
      box.innerHTML = '<strong>AJ QA:</strong> Business sync looks healthy. Public listings have backstage records and published profiles passed the basic field check.';
      return;
    }
    box.innerHTML = '<strong>AJ QA found sync issues:</strong><br>' +
      (orphanApps.length ? orphanApps.length + ' published application(s) are not linked to full business records.<br>' : '') +
      (incomplete.length ? incomplete.length + ' published business record(s) are missing required public profile fields.' : '');
  } catch (error) {
    console.warn('AJ QA sync audit failed', error);
  }
}

setTimeout(hpcV3ReadyMessage, 1000);
setInterval(hpcV3QaNotice, 1200);
setTimeout(hpcV3AuditBusinessSync, 2500);
setInterval(hpcV3AuditBusinessSync, 30000);
