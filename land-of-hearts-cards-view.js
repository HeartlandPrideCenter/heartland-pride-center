(() => {
  if (!location.pathname.includes('business-network')) return;
  const style = document.createElement('style');
  style.textContent = `
    .business-network-page[data-view="cards"] .cards-panel{display:block}
    .business-network-page[data-view="cards"] .map-panel,.business-network-page[data-view="cards"] .directory-panel{display:none}
    .loh-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .loh-card{border:1px solid rgba(245,241,232,.13);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.03));box-shadow:0 20px 52px rgba(0,0,0,.16);overflow:hidden;cursor:pointer;transition:.18s ease}
    .loh-card:hover{transform:translateY(-3px);border-color:rgba(239,205,114,.45)}
    .loh-card-top{min-height:92px;background:radial-gradient(circle at 20% 20%,rgba(239,205,114,.26),transparent 7rem),linear-gradient(135deg,rgba(212,175,55,.12),rgba(255,255,255,.04));display:flex;align-items:flex-end;padding:16px}
    .loh-card-heart{display:grid;place-items:center;width:56px;height:56px;border-radius:20px;background:linear-gradient(135deg,#f7d66b,#d4af37);color:#071827;font-size:1.8rem;box-shadow:0 12px 28px rgba(0,0,0,.22)}
    .loh-card-body{padding:16px}.loh-card-body strong{display:block;color:#fff;font-size:1.05rem}.loh-card-body small{display:block;color:rgba(245,241,232,.66);margin-top:5px}.loh-card-body p{color:rgba(245,241,232,.7);line-height:1.5;font-size:.92rem}.loh-card-badges{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.loh-card-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 9px;border:1px solid rgba(239,205,114,.25);background:rgba(212,175,55,.1);font-size:.8rem;font-weight:900}
    @media(max-width:980px){.loh-card-grid{grid-template-columns:1fr 1fr}}@media(max-width:720px){.loh-card-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  const esc = v => String(v || '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const commitment = b => b.heart_rating || b.commitment_level || 'Community Heart';
  const badgeList = b => {
    const notes = String(b.notes || b.internal_notes || '');
    const out = ['❤️ ' + commitment(b)];
    notes.split('\n').forEach(line => {
      if (/^selected identifiers/i.test(line)) {
        line.replace(/^selected identifiers\s*:\s*/i, '').split(/,|\||;/).forEach(x => { x=x.trim(); if (x && x.toLowerCase() !== 'none') out.push(x); });
      }
    });
    return [...new Set(out)].slice(0,3);
  };
  function ensurePanel(){
    const main = document.querySelector('.business-network-page');
    if (!main) return null;
    let panel = document.querySelector('.cards-panel');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'view-panel cards-panel';
      panel.setAttribute('aria-label','Cards view');
      panel.innerHTML = '<section class="loh-card-grid" id="businessCards"></section>';
      const dir = document.querySelector('.directory-panel');
      main.insertBefore(panel, dir || document.querySelector('.join-intro'));
    }
    let btn = document.querySelector('[data-view-btn="cards"]');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.viewBtn = 'cards';
      btn.textContent = '🪪 Cards';
      const listBtn = document.querySelector('[data-view-btn="list"]');
      (listBtn?.parentNode || document.querySelector('.explorer-tabs'))?.insertBefore(btn, listBtn || null);
    }
    document.querySelectorAll('[data-view-btn]').forEach(b => {
      if (b.dataset.cardBound) return;
      b.dataset.cardBound = '1';
      b.addEventListener('click', () => {
        document.querySelector('.business-network-page').dataset.view = b.dataset.viewBtn;
        document.querySelectorAll('[data-view-btn]').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    return panel.querySelector('#businessCards');
  }
  function renderCards(list){
    const root = ensurePanel();
    if (!root) return;
    root.innerHTML = (list || []).length ? list.map((b,i) => {
      const badges = badgeList(b).map(x => `<span class="loh-card-badge">${esc(x)}</span>`).join('');
      const desc = esc(b.public_description || b.description || '').slice(0,145);
      return `<article class="loh-card" data-card-index="${i}"><div class="loh-card-top"><div class="loh-card-heart">♥</div></div><div class="loh-card-body"><strong>${esc(b.name)}</strong><small>${esc([b.category||'Business',b.city||'Heartland',commitment(b)].join(' · '))}</small>${desc?`<p>${desc}${desc.length>=145?'…':''}</p>`:''}<div class="loh-card-badges">${badges}</div></div></article>`;
    }).join('') : '<div class="directory-note"><strong>No published businesses yet.</strong><p>Approved businesses will appear here after Backstage review.</p></div>';
    root.querySelectorAll('.loh-card').forEach(card => card.addEventListener('click', () => {
      const b = (list || [])[Number(card.dataset.cardIndex)];
      if (b && window.HPC_LAND_OF_HEARTS_DIRECTORY_V2) window.HPC_LAND_OF_HEARTS_DIRECTORY_V2.openProfile(b);
    }));
  }
  const start = () => {
    ensurePanel();
    const original = window.HPC_LAND_OF_HEARTS_DIRECTORY_V2 && window.HPC_LAND_OF_HEARTS_DIRECTORY_V2.render;
    if (!original || original.__cardsWrapped) return;
    window.HPC_LAND_OF_HEARTS_DIRECTORY_V2.render = function(container, list, onSelect){
      original.call(this, container, list, onSelect);
      renderCards(list || []);
    };
    window.HPC_LAND_OF_HEARTS_DIRECTORY_V2.render.__cardsWrapped = true;
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(start, 150));
  setTimeout(start, 800);
})();
