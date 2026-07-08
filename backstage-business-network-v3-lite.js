window.HPC_BUSINESS_NETWORK_V3 = true;

function hpcV3ReadyMessage() {
  console.log('Business Network v3 enhancement layer ready');
}

function hpcV3QaNotice() {
  const notice = document.getElementById('dataNotice');
  if (!notice || window.__hpcV3QaNoticeAdded) return;
  window.__hpcV3QaNoticeAdded = true;
  const box = document.createElement('div');
  box.className = 'notice';
  box.style.marginTop = '10px';
  box.innerHTML = '<strong>AJ QA:</strong> Backstage is now watching for public listings that do not have a full business record. Live listings should always have a managed backstage record.';
  notice.insertAdjacentElement('afterend', box);
}

setTimeout(hpcV3ReadyMessage, 1000);
setInterval(hpcV3QaNotice, 1200);
