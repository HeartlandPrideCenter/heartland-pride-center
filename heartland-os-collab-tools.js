(() => {
  const meta = window.HEARTLAND_OS_VERSION || {
    name: 'Heartland OS', version: '0.0.0', build: 'unknown', environment: 'Production', commit: 'unknown', notes: []
  };

  function esc(value) {
    return String(value || '').replace(/[&<>\"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  }

  function ensureStyle() {
    if (document.getElementById('heartlandCollabStyle')) return;
    const style = document.createElement('style');
    style.id = 'heartlandCollabStyle';
    style.textContent = `
      .heartland-build-badge{margin:18px 0 0;padding:14px;border:1px solid rgba(245,241,232,.14);border-radius:18px;background:rgba(255,255,255,.045);color:#f5f1e8;font-size:.85rem;line-height:1.55}.heartland-build-badge strong{display:block;color:#efcd72}.heartland-build-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.heartland-build-actions button{border:1px solid rgba(239,205,114,.24);border-radius:999px;background:rgba(212,175,55,.08);color:#f5f1e8;padding:8px 11px;font-weight:900}.heartland-collab-shell{position:fixed;inset:0;z-index:11000;display:none;align-items:center;justify-content:center;background:rgba(3,10,19,.72);backdrop-filter:blur(8px);padding:22px}.heartland-collab-shell.open{display:flex}.heartland-collab-panel{position:relative;width:min(620px,95vw);max-height:86vh;overflow:auto;border:1px solid rgba(239,205,114,.28);border-radius:28px;background:#081523;color:#f5f1e8;box-shadow:0 30px 100px rgba(0,0,0,.52);padding:28px}.heartland-collab-close{position:absolute;right:16px;top:14px;width:38px;height:38px;border-radius:999px;border:1px solid rgba(245,241,232,.16);background:rgba(255,255,255,.07);color:#fff;font-size:24px}.heartland-status-grid{display:grid;gap:10px;margin-top:12px}.heartland-status-row{display:flex;justify-content:space-between;gap:12px;border:1px solid rgba(245,241,232,.12);border-radius:16px;background:rgba(255,255,255,.04);padding:12px}.heartland-status-row b{color:#efcd72}.heartland-notes{margin:12px 0 0;padding-left:20px;line-height:1.7}
    `;
    document.head.appendChild(style);
  }

  function panel(title, body) {
    ensureStyle();
    let shell = document.getElementById('heartlandCollabShell');
    if (!shell) {
      shell = document.createElement('div');
      shell.id = 'heartlandCollabShell';
      shell.className = 'heartland-collab-shell';
      shell.innerHTML = '<div class="heartland-collab-panel"><button class="heartland-collab-close" type="button">×</button><div id="heartlandCollabContent"></div></div>';
      document.body.appendChild(shell);
      shell.querySelector('.heartland-collab-close').onclick = () => shell.classList.remove('open');
      shell.addEventListener('click', e => { if (e.target === shell) shell.classList.remove('open'); });
    }
    document.getElementById('heartlandCollabContent').innerHTML = '<span class="eyeline">' + esc(meta.name) + '</span><h1>' + esc(title) + '</h1>' + body;
    shell.classList.add('open');
  }

  function showReleaseNotes() {
    const notes = (meta.notes || []).map(note => '<li>' + esc(note) + '</li>').join('');
    panel('What\'s New', '<p><strong>Version ' + esc(meta.version) + '</strong><br>Build ' + esc(meta.build) + '</p><ul class="heartland-notes">' + notes + '</ul>');
  }

  function showStatus() {
    const rows = [
      ['Environment', meta.environment], ['Version', meta.version], ['Build', meta.build], ['Commit', meta.commit], ['Database', window.HPC_DATA_URL ? 'Configured' : 'Missing'], ['Page', window.location.pathname]
    ].map(([label, value]) => '<div class="heartland-status-row"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>').join('');
    panel('Developer Status', '<div class="heartland-status-grid">' + rows + '</div>');
  }

  function addBadge() {
    ensureStyle();
    const target = document.querySelector('.utility') || document.querySelector('.side-stage') || document.body;
    if (document.getElementById('heartlandBuildBadge')) return;
    const badge = document.createElement('div');
    badge.id = 'heartlandBuildBadge';
    badge.className = 'heartland-build-badge';
    badge.innerHTML = '<strong>❤️ ' + esc(meta.name) + '</strong><span>' + esc(meta.environment) + ' · v' + esc(meta.version) + ' · Build ' + esc(meta.build) + '</span><div class="heartland-build-actions"><button type="button" id="heartlandWhatsNew">What\'s New</button><button type="button" id="heartlandStatus">Status</button></div>';
    target.appendChild(badge);
    document.getElementById('heartlandWhatsNew').onclick = showReleaseNotes;
    document.getElementById('heartlandStatus').onclick = showStatus;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addBadge);
  else addBadge();
})();
